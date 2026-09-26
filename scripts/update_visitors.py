#!/usr/bin/env python3
"""Refresh assets/site/visitors.json from Google Analytics 4 (city-level aggregates only).

Environment
  GA4_PROPERTY_ID  numeric GA4 property id (Admin → Property details)
  GA4_SA_KEY       service-account key JSON; the account needs Viewer access on the property
  START_DATE       first day to include (default 2026-09-19, when GA4 was added to the site)
  OUT_FILE         output path (default assets/site/visitors.json)

Cities are geocoded offline with GeoNames cities5000 (CC-BY 4.0); a city GA cannot resolve
("(not set)") is placed at the country's capital. No IPs or per-visit records are written.
"""
import csv, io, json, os, sys, zipfile, datetime as dt, urllib.request
from collections import defaultdict

from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

PROP = os.environ["GA4_PROPERTY_ID"].strip()
START = os.environ.get("START_DATE", "2026-09-19")
OUT = os.environ.get("OUT_FILE", "assets/site/visitors.json")
GEONAMES = "https://download.geonames.org/export/dump/cities5000.zip"

client = BetaAnalyticsDataClient.from_service_account_info(json.loads(os.environ["GA4_SA_KEY"]))


def report(dims):
    req = RunReportRequest(
        property=f"properties/{PROP}",
        dimensions=[Dimension(name=d) for d in dims],
        metrics=[Metric(name="totalUsers"), Metric(name="screenPageViews")],
        date_ranges=[DateRange(start_date=START, end_date="today")],
        limit=10000,
    )
    out = []
    for r in client.run_report(req).rows:
        out.append(([d.value for d in r.dimension_values], int(r.metric_values[0].value or 0), int(r.metric_values[1].value or 0)))
    return out


city_rows = report(["city", "countryId", "country"])
country_rows = report(["countryId", "country"])
total_rows = report([])
tot_users, tot_views = (total_rows[0][1], total_rows[0][2]) if total_rows else (0, 0)

# ---- offline gazetteer --------------------------------------------------------------
raw = urllib.request.urlopen(GEONAMES, timeout=120).read()
names, alts, capital, biggest = {}, {}, {}, {}
with zipfile.ZipFile(io.BytesIO(raw)) as z:
    with z.open(z.namelist()[0]) as fh:
        for row in csv.reader(io.TextIOWrapper(fh, encoding="utf-8"), delimiter="\t", quoting=csv.QUOTE_NONE):
            try:
                lat, lon, cc, fcode, pop = float(row[4]), float(row[5]), row[8], row[7], int(row[14] or 0)
            except (ValueError, IndexError):
                continue
            rec = (pop, round(lat, 3), round(lon, 3))
            for key in {row[1].lower(), row[2].lower()}:
                if rec > names.get((cc, key), (-1,)):
                    names[(cc, key)] = rec
            for a in row[3].split(","):
                a = a.strip().lower()
                if a and rec > alts.get((cc, a), (-1,)):
                    alts[(cc, a)] = rec
            if fcode == "PPLC":
                capital[cc] = rec
            if rec > biggest.get(cc, (-1,)):
                biggest[cc] = rec


def locate(city, cc):
    key = (cc, city.strip().lower())
    hit = names.get(key) or alts.get(key)
    if hit:
        return hit[1], hit[2], True
    fb = capital.get(cc) or biggest.get(cc)
    return (fb[1], fb[2], False) if fb else (None, None, False)


# ---- aggregate ------------------------------------------------------------------------
agg = defaultdict(lambda: {"users": 0, "views": 0})
unresolved = []
for (city, cc, country), users, views in city_rows:
    if not cc or cc == "(not set)":
        continue
    known = city and city != "(not set)"
    lat, lon, exact = locate(city if known else "", cc)
    if lat is None:
        unresolved.append((city, cc))
        continue
    label = city if (known and exact) else ""
    k = (label, cc, lat, lon)
    agg[k]["users"] += users
    agg[k]["views"] += views
    agg[k]["country"] = country

points = sorted(
    ({"city": k[0], "country": v["country"], "cc": k[1], "lat": k[2], "lon": k[3], "users": v["users"], "views": v["views"]} for k, v in agg.items()),
    key=lambda p: (-p["users"], -p["views"], p["city"]),
)
countries = sorted(
    ({"cc": cc, "country": name, "users": u, "views": pv} for (cc, name), u, pv in country_rows if cc and cc != "(not set)"),
    key=lambda c: (-c["users"], c["cc"]),
)
data = {
    "source": "Google Analytics 4 (city-level aggregates)",
    "since": START,
    "updated": dt.datetime.utcnow().strftime("%Y-%m-%d"),
    "home": {"city": "London", "country": "United Kingdom", "lat": 51.5074, "lon": -0.1278},
    "totals": {"users": tot_users, "views": tot_views, "cities": sum(1 for p in points if p["city"]), "countries": len(countries)},
    "points": points,
    "countries": countries,
}
os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
print(f"{len(points)} points, {len(countries)} countries, users={tot_users}, views={tot_views}, unresolved={unresolved[:10]}")
