/* Visitor globe for mruil.github.io (no third-party widget).
 * land     : assets/site/globe-land.json  — 1.5° dot lattice from Natural Earth 1:50m land (generated offline)
 * visitors : assets/site/visitors.json    — city-level aggregates from Google Analytics 4,
 *            refreshed by .github/workflows/visitors.yml (scripts/update_visitors.py)
 */
(function () {
  "use strict";
  const canvas = document.getElementById("globe");
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");
  const wrap = canvas.parentElement;
  const tip = document.getElementById("globeTip");
  const legend = document.getElementById("globeLegend");
  const reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const D2R = Math.PI / 180, TAU = Math.PI * 2;
  const HOME = { city: "London", country: "United Kingdom", lat: 51.5074, lon: -0.1278 };
  const COL = { land: "56,189,248", visit: "52,211,153", top: "110,231,183", home: "251,191,36" };
  const MAX_ARCS = 20, ARC_SAMPLES = 40, NB = 6;

  let W = 0, R = 0, cx = 0, cy = 0, dpr = 1, glow = null, body = null;
  let N = 0, sLat = null, cLat = null, sLon = null, cLon = null;
  let V = [], ARCS = [];
  let lon0 = 55 * D2R, lat0 = 24 * D2R;
  const SPIN = -0.07;                      // rad/s; negative = surface moves west→east
  let dragging = false, px = 0, py = 0, vx = 0, vy = 0, lastMove = 0;
  let inView = true, hoverIdx = -1, needsDraw = true;
  const t0 = performance.now(); let last = t0;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const trig = (latDeg, lonDeg) => {
    const la = latDeg * D2R, lo = lonDeg * D2R;
    return { sl: Math.sin(la), cl: Math.cos(la), slo: Math.sin(lo), clo: Math.cos(lo) };
  };
  const H = trig(HOME.lat, HOME.lon);

  /* ---------- layout ---------- */
  function resize() {
    const w = wrap.clientWidth || 360;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = w; R = w * 0.41; cx = w / 2; cy = w / 2;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    glow = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.24);
    glow.addColorStop(0, "rgba(56,189,248,0.22)"); glow.addColorStop(1, "rgba(56,189,248,0)");
    body = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.42, R * 0.08, cx, cy, R * 1.04);
    body.addColorStop(0, "#14295a"); body.addColorStop(0.55, "#0b1633"); body.addColorStop(1, "#050914");
    needsDraw = true;
  }

  /* ---------- drawing ---------- */
  function drawSphere() {
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(cx, cy, R * 1.24, 0, TAU); ctx.fill();
    ctx.fillStyle = body; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.fill();
    ctx.strokeStyle = "rgba(56,189,248,0.38)"; ctx.lineWidth = 1; ctx.stroke();
  }

  function drawLand(sa, ca, so, co) {
    const paths = []; for (let b = 0; b < NB; b++) paths.push(new Path2D());
    const rDot = Math.max(0.85, W / 430);
    for (let i = 0; i < N; i++) {
      const cd = cLon[i] * co + sLon[i] * so;
      const z = sa * sLat[i] + ca * cLat[i] * cd;
      if (z <= 0.02) continue;
      const sd = sLon[i] * co - cLon[i] * so;
      const X = cx + R * cLat[i] * sd, Y = cy - R * (ca * sLat[i] - sa * cLat[i] * cd);
      const r = rDot * (0.55 + 0.45 * z);
      const p = paths[Math.min(NB - 1, (z * NB) | 0)];
      p.moveTo(X + r, Y); p.arc(X, Y, r, 0, TAU);
    }
    for (let b = 0; b < NB; b++) {
      ctx.fillStyle = "rgba(" + COL.land + "," + (0.14 + 0.8 * (b + 0.5) / NB).toFixed(3) + ")";
      ctx.fill(paths[b]);
    }
  }

  function drawArcs(sa, ca, so, co, t) {
    ctx.lineWidth = 1.2; ctx.lineCap = "round";
    for (let k = 0; k < ARCS.length; k++) {
      const a = ARCS[k]; let started = false;
      ctx.beginPath();
      for (let j = 0; j < a.n; j++) {
        const cd = a.clo[j] * co + a.slo[j] * so, sd = a.slo[j] * co - a.clo[j] * so;
        const x = a.cl[j] * sd, y = ca * a.sl[j] - sa * a.cl[j] * cd, z = sa * a.sl[j] + ca * a.cl[j] * cd;
        const r = a.r[j];
        if (z > 0 || r * r * (x * x + y * y) > 1) {        // front hemisphere, or lifted beyond the limb
          const X = cx + R * r * x, Y = cy - R * r * y;
          if (started) ctx.lineTo(X, Y); else { ctx.moveTo(X, Y); started = true; }
        } else started = false;
      }
      ctx.setLineDash([]); ctx.strokeStyle = "rgba(129,140,248,0.30)"; ctx.stroke();
      if (!reduced) {
        ctx.setLineDash([6, 16]); ctx.lineDashOffset = -((t * 26 + k * 7) % 22);
        ctx.strokeStyle = "rgba(52,211,153,0.85)"; ctx.stroke();
      }
    }
    ctx.setLineDash([]);
  }

  function project(p, sa, ca, so, co) {
    const cd = p.clo * co + p.slo * so;
    const z = sa * p.sl + ca * p.cl * cd;
    const sd = p.slo * co - p.clo * so;
    return [cx + R * p.cl * sd, cy - R * (ca * p.sl - sa * p.cl * cd), z];
  }

  function drawVisitors(sa, ca, so, co, t) {
    for (let i = 0; i < V.length; i++) {
      const v = V[i], q = project(v, sa, ca, so, co);
      v._vis = q[2] > 0.04; if (!v._vis) continue;
      const X = q[0], Y = q[1]; v._x = X; v._y = Y;
      const a = 0.4 + 0.6 * q[2], rr = v.rr, col = v.hot ? COL.top : COL.visit;
      const g = ctx.createRadialGradient(X, Y, 0, X, Y, rr * 3.4);
      g.addColorStop(0, "rgba(" + col + "," + (0.6 * a).toFixed(3) + ")"); g.addColorStop(1, "rgba(" + col + ",0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(X, Y, rr * 3.4, 0, TAU); ctx.fill();
      ctx.fillStyle = "rgba(" + col + "," + a.toFixed(3) + ")"; ctx.beginPath(); ctx.arc(X, Y, rr, 0, TAU); ctx.fill();
      if (!reduced) {
        const ph = (t * 0.55 + i * 0.137) % 1;
        ctx.strokeStyle = "rgba(" + col + "," + ((1 - ph) * 0.7 * a).toFixed(3) + ")"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(X, Y, rr + ph * (10 + rr * 2), 0, TAU); ctx.stroke();
      }
      if (i === hoverIdx) { ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(X, Y, rr + 3.5, 0, TAU); ctx.stroke(); }
    }
  }

  function drawHome(sa, ca, so, co, t) {
    const q = project(H, sa, ca, so, co); if (q[2] <= 0.05) return;
    const a = 0.4 + 0.6 * q[2], X = q[0], Y = q[1];
    ctx.strokeStyle = "rgba(" + COL.home + "," + a.toFixed(3) + ")"; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(X, Y, 6.5, 0, TAU); ctx.stroke();
    if (!reduced) {
      const ph = (t * 0.4) % 1;
      ctx.strokeStyle = "rgba(" + COL.home + "," + ((1 - ph) * 0.6 * a).toFixed(3) + ")"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(X, Y, 6.5 + ph * 16, 0, TAU); ctx.stroke();
    }
    ctx.font = "600 11px 'JetBrains Mono', Consolas, monospace";
    ctx.fillStyle = "rgba(" + COL.home + "," + a.toFixed(3) + ")";
    ctx.fillText("London", X + 10, Y - 8);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, W);
    const sa = Math.sin(lat0), ca = Math.cos(lat0), so = Math.sin(lon0), co = Math.cos(lon0);
    drawSphere();
    if (N) drawLand(sa, ca, so, co);
    drawArcs(sa, ca, so, co, t);
    drawVisitors(sa, ca, so, co, t);
    drawHome(sa, ca, so, co, t);
  }

  /* ---------- data ---------- */
  function buildArcs() {
    ARCS = [];
    const hv = [H.cl * H.clo, H.cl * H.slo, H.sl];
    const top = V.slice().sort((a, b) => b.users - a.users);
    for (const v of top) {
      if (ARCS.length >= MAX_ARCS) break;
      const av = [v.cl * v.clo, v.cl * v.slo, v.sl];
      const dot = clamp(av[0] * hv[0] + av[1] * hv[1] + av[2] * hv[2], -1, 1), om = Math.acos(dot);
      if (om < 0.01) continue;                        // same place as home
      const h = 0.05 + 0.25 * om / Math.PI, so = Math.sin(om);
      const arc = { n: ARC_SAMPLES + 1, sl: [], cl: [], slo: [], clo: [], r: [] };
      for (let j = 0; j <= ARC_SAMPLES; j++) {
        const f = j / ARC_SAMPLES, A = Math.sin((1 - f) * om) / so, B = Math.sin(f * om) / so;
        const x = A * av[0] + B * hv[0], y = A * av[1] + B * hv[1], z = A * av[2] + B * hv[2];
        const la = Math.asin(clamp(z, -1, 1)), lo = Math.atan2(y, x);
        arc.sl.push(Math.sin(la)); arc.cl.push(Math.cos(la)); arc.slo.push(Math.sin(lo)); arc.clo.push(Math.cos(lo));
        arc.r.push(1 + h * Math.sin(Math.PI * f));
      }
      ARCS.push(arc);
    }
  }

  function fmtDate(s) {
    if (!s) return "—";
    const d = new Date(s + (s.length === 10 ? "T00:00:00Z" : ""));
    return isNaN(d) ? esc(s) : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  }

  function renderLegend(d) {
    if (!legend) return;
    const pts = (d && d.points) || [];
    if (!pts.length) {
      legend.innerHTML = '<div class="gl-row"><span><span class="gl-dot home"></span>home · London</span>' +
        '<span class="dim">visitor locations sync from Google Analytics every 6 h</span></div>';
      return;
    }
    const tot = d.totals || {}, cs = (d.countries || []).slice(0, 6);
    legend.innerHTML =
      '<div class="gl-row"><span><span class="gl-dot v"></span><b>' + (tot.cities || pts.length) + '</b> cities</span>' +
      '<span><b>' + (tot.countries || cs.length) + '</b> countries</span>' +
      '<span><span class="gl-dot home"></span>home · London</span>' +
      '<span class="dim">since ' + fmtDate(d.since) + ' · updated ' + fmtDate(d.updated) + '</span></div>' +
      (cs.length ? '<div class="gl-row">' + cs.map(c => '<span class="gl-chip" title="' + esc(c.country) + '">' + esc(c.cc) + ' <b>' + (c.users | 0) + '</b></span>').join("") + '</div>' : "");
  }

  function setVisitors(d) {
    const pts = ((d && d.points) || []).filter(p => isFinite(p.lat) && isFinite(p.lon) && p.users > 0);
    const max = Math.max(1, ...pts.map(p => p.users));
    const ranked = pts.slice().sort((a, b) => b.users - a.users);
    V = pts.map(p => Object.assign(trig(p.lat, p.lon), p, {
      rr: 2.2 + 4.3 * Math.sqrt(p.users / max),
      hot: ranked.indexOf(p) < 3 || p.users >= 0.5 * max,
    })).sort((a, b) => a.users - b.users);          // biggest drawn last (on top)
    buildArcs(); renderLegend(d); needsDraw = true;
  }

  function loadJSON(url, opts) {
    return fetch(url, opts || {}).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); });
  }

  loadJSON("assets/site/globe-land.json").then(d => {
    const p = d.p, s = d.scale || 10; N = p.length / 2;
    sLat = new Float32Array(N); cLat = new Float32Array(N); sLon = new Float32Array(N); cLon = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const la = p[2 * i] / s * D2R, lo = p[2 * i + 1] / s * D2R;
      sLat[i] = Math.sin(la); cLat[i] = Math.cos(la); sLon[i] = Math.sin(lo); cLon[i] = Math.cos(lo);
    }
    needsDraw = true;
  }).catch(() => {});
  loadJSON("assets/site/visitors.json?h=" + Math.floor(Date.now() / 3.6e6), { cache: "no-cache" })
    .then(setVisitors).catch(() => setVisitors(null));

  /* ---------- interaction ---------- */
  function hoverTest(e) {
    const rect = canvas.getBoundingClientRect(), mx = e.clientX - rect.left, my = e.clientY - rect.top;
    let best = -1, bd = Infinity;
    for (let i = 0; i < V.length; i++) {
      const v = V[i]; if (!v._vis) continue;
      const dx = v._x - mx, dy = v._y - my, d = dx * dx + dy * dy, lim = Math.max(10, v.rr + 6);
      if (d < lim * lim && d < bd) { bd = d; best = i; }
    }
    if (best !== hoverIdx) needsDraw = true;
    hoverIdx = best;
    if (!tip) return;
    if (best < 0) { tip.hidden = true; return; }
    const v = V[best], place = v.city ? esc(v.city) + ", " + esc(v.country) : esc(v.country);
    tip.innerHTML = place + " · <b>" + v.users + "</b> visitor" + (v.users === 1 ? "" : "s") + (v.views ? " · " + v.views + " views" : "");
    tip.style.left = v._x + "px"; tip.style.top = v._y + "px"; tip.hidden = false;
  }

  canvas.addEventListener("pointerdown", e => {
    dragging = true; px = e.clientX; py = e.clientY; vx = vy = 0; lastMove = performance.now();
    if (canvas.setPointerCapture) canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("grabbing"); hoverIdx = -1; if (tip) tip.hidden = true;
  });
  canvas.addEventListener("pointermove", e => {
    if (!dragging) { hoverTest(e); return; }
    const now = performance.now(), dx = e.clientX - px, dy = e.clientY - py;
    px = e.clientX; py = e.clientY;
    const dl = -dx / R, dp = dy / R;
    lon0 += dl; lat0 = clamp(lat0 + dp, -1.0, 1.3);
    const dt = Math.max(8, now - lastMove) / 1000; vx = dl / dt; vy = dp / dt; lastMove = now;
    needsDraw = true;
  });
  const endDrag = () => {
    if (!dragging) return;
    dragging = false; canvas.classList.remove("grabbing");
    if (performance.now() - lastMove > 90) vx = vy = 0;
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);
  canvas.addEventListener("pointerleave", () => { if (hoverIdx >= 0) needsDraw = true; hoverIdx = -1; if (tip) tip.hidden = true; });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { inView = es[0].isIntersecting; if (inView) needsDraw = true; }, { rootMargin: "120px" }).observe(canvas);
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(wrap); else window.addEventListener("resize", resize);
  resize();

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!dragging) {
      if (Math.abs(vx) > 1e-3 || Math.abs(vy) > 1e-3) {
        lon0 += vx * dt; lat0 = clamp(lat0 + vy * dt, -1.0, 1.3);
        const k = Math.exp(-2.5 * dt); vx *= k; vy *= k; needsDraw = true;
      }
      if (!reduced && hoverIdx < 0) lon0 += SPIN * dt;
    }
    if (!reduced) needsDraw = true;
    if (needsDraw && inView && !document.hidden) { draw((now - t0) / 1000); needsDraw = false; }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
