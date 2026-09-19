(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- year ---------- */
  $("#year").textContent = new Date().getFullYear();

  /* ---------- nav ---------- */
  const nav = $("#nav"), links = $("#navLinks"), toggle = $("#navToggle"), progress = $("#progress"), totop = $("#totop");
  toggle.addEventListener("click", () => links.classList.toggle("open"));
  $$("a", links).forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
  const sections = $$("main section[id]");
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 20);
    totop.classList.toggle("show", y > 600);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
    let cur = null;
    for (const s of sections) if (s.getBoundingClientRect().top <= 120) cur = s.id;
    $$("a[href^='#']", links).forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12 });
  $$(".reveal").forEach(el => io.observe(el));

  /* ---------- counters ---------- */
  const pc = $("#pubCount"); if (pc && window.PUBS) pc.dataset.count = window.PUBS.length;
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1200;
    (function step(t) { const p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = v; if (p < 1) requestAnimationFrame(step); })(t0);
  }), { threshold: 0.5 });
  $$("[data-count]").forEach(el => cio.observe(el));

  /* ---------- typed line ---------- */
  const typed = $("#typed"), lines = window.TYPED_LINES || [];
  if (lines.length && !reduced) {
    let li = 0, ci = 0, del = false;
    (function tick() {
      const line = lines[li];
      typed.textContent = line.slice(0, ci);
      let wait = del ? 28 : 55;
      if (!del && ci === line.length) { wait = 1800; del = true; }
      else if (del && ci === 0) { del = false; li = (li + 1) % lines.length; wait = 350; }
      else ci += del ? -1 : 1;
      setTimeout(tick, wait);
    })();
  } else if (lines.length) typed.textContent = lines[0];

  /* ---------- publications ---------- */
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const meRe = /Yang Liu(\*?†?|†?\*?)/g;
  const pubsEl = $("#pubs");
  (window.PUBS || []).forEach(p => {
    const el = document.createElement("article");
    el.className = "pub reveal"; el.dataset.tags = p.tags.join(" ");
    const primary = p.links.arXiv || p.links.paper || null;
    const thumb = p.img ? `<img src="${p.img}" alt="" loading="lazy">` : `<span class="ph">${esc(p.ph || p.venue)}</span>`;
    const linkHtml = Object.entries(p.links).map(([k, v]) => `<a href="${v}" target="_blank" rel="noopener">${k} ↗</a>`).join("");
    const authors = esc(p.authors).replace(meRe, (m) => `<span class="me">${m}</span>`);
    el.innerHTML = `
      <div class="pub-thumb">${thumb}</div>
      <div>
        <div class="pub-meta"><span class="venue ${p.cls}">${esc(p.venue)}</span><span class="pub-year">${p.year}</span>${p.hl ? `<span class="hl">★ ${esc(p.hl)}</span>` : ""}</div>
        <h3>${primary ? `<a href="${primary}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title)}</h3>
        <p class="pub-authors">${authors}</p>
        ${linkHtml ? `<div class="pub-links">${linkHtml}</div>` : ""}
      </div>`;
    pubsEl.appendChild(el); io.observe(el);
  });
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest(".filter"); if (!b) return;
    $$(".filter").forEach(x => x.classList.toggle("active", x === b));
    const f = b.dataset.f;
    $$(".pub").forEach(p => { const show = f === "all" || p.dataset.tags.split(" ").includes(f); p.classList.toggle("hide", !show); if (show) p.classList.add("in"); });
  });

  /* ---------- news ---------- */
  const newsEl = $("#newsList"), SHOW = 8;
  (window.NEWS || []).forEach((n, i) => {
    const li = document.createElement("li"); if (i >= SHOW) li.className = "extra";
    const body = n.link ? `<a href="${n.link}" target="_blank" rel="noopener">${n.text}</a>` : n.text;
    li.innerHTML = `<div class="tl-date">${n.date}</div><div class="tl-text">${body}</div>`;
    newsEl.appendChild(li);
  });
  if ((window.NEWS || []).length > SHOW) {
    const btn = document.createElement("button"); btn.className = "tl-more"; btn.textContent = `show all ${window.NEWS.length} items ↓`;
    btn.addEventListener("click", () => { newsEl.classList.toggle("open"); btn.textContent = newsEl.classList.contains("open") ? "show less ↑" : `show all ${window.NEWS.length} items ↓`; });
    newsEl.parentNode.appendChild(btn);
  }

  /* ---------- visitor widgets: hide whatever failed to load ---------- */
  setTimeout(() => {
    const pv = $("#busuanzi_value_site_pv"), stats = $("#visitorsStats"), badge = $("#visitorsBadge"), map = $("#visitorsMap");
    if (pv && !/^\d/.test(pv.textContent.trim())) { if (stats) stats.hidden = true; if (badge) badge.hidden = false; }
    if (map && !map.querySelector("img,canvas,a,iframe,div")) map.classList.add("dead");
  }, 6000);

  /* ---------- hero canvas: neural particles ---------- */
  const net = $("#net"), ecg = $("#ecg");
  if (!reduced && net && ecg) {
    const nctx = net.getContext("2d"), ectx = ecg.getContext("2d");
    let W, H, pts = [], mouse = { x: -1e4, y: -1e4 }, dpr = Math.min(2, window.devicePixelRatio || 1);
    function resize() {
      const r = net.parentNode.getBoundingClientRect(); W = r.width; H = r.height;
      [net, ecg].forEach(c => { c.width = W * dpr; c.height = H * dpr; c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0); });
      const n = Math.min(110, Math.floor(W * H / 14000));
      pts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: 1 + Math.random() * 1.8, h: Math.random() }));
    }
    resize(); window.addEventListener("resize", resize);
    net.parentNode.addEventListener("mousemove", e => { const r = net.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    net.parentNode.addEventListener("mouseleave", () => { mouse.x = mouse.y = -1e4; });
    const col = h => h < .33 ? "56,189,248" : h < .66 ? "129,140,248" : "244,114,182";
    // ECG waveform: one beat spans 190px, baseline near hero bottom
    function beat(x0, b) { return [[x0, b], [x0 + 20, b], [x0 + 32, b - 8], [x0 + 44, b], [x0 + 58, b], [x0 + 66, b + 12], [x0 + 76, b - 70], [x0 + 86, b + 26], [x0 + 94, b], [x0 + 120, b], [x0 + 136, b - 18], [x0 + 152, b], [x0 + 190, b]]; }
    let t0 = performance.now();
    function frame(t) {
      // particles
      nctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 22500) { const d = Math.sqrt(d2) || 1; p.x += dx / d * .6; p.y += dy / d * .6; }
      }
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
        if (d < 16900) { nctx.strokeStyle = `rgba(${col(a.h)},${(1 - d / 16900) * .35})`; nctx.lineWidth = 1; nctx.beginPath(); nctx.moveTo(a.x, a.y); nctx.lineTo(b.x, b.y); nctx.stroke(); }
      }
      for (const p of pts) { nctx.fillStyle = `rgba(${col(p.h)},.9)`; nctx.beginPath(); nctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); nctx.fill(); }
      // ecg
      ectx.clearRect(0, 0, W, H);
      const base = H - 70, speed = 260, off = ((t - t0) / 1000 * speed) % 190;
      const path = []; for (let x = -190 - off; x < W + 190; x += 190) path.push(...beat(x, base));
      ectx.lineJoin = "round"; ectx.lineCap = "round";
      ectx.strokeStyle = "rgba(14,116,144,.35)"; ectx.lineWidth = 1.5; ectx.beginPath(); path.forEach((p, i) => i ? ectx.lineTo(p[0], p[1]) : ectx.moveTo(p[0], p[1])); ectx.stroke();
      // glowing head segment
      const headX = ((t - t0) / 1000 * speed * 1.6) % (W + 400) - 200;
      const g = ectx.createLinearGradient(headX - 260, 0, headX, 0); g.addColorStop(0, "rgba(34,211,238,0)"); g.addColorStop(.7, "rgba(34,211,238,.9)"); g.addColorStop(1, "rgba(34,211,238,0)");
      ectx.save(); ectx.beginPath(); ectx.rect(headX - 260, 0, 260, H); ectx.clip();
      ectx.shadowColor = "rgba(34,211,238,.9)"; ectx.shadowBlur = 12; ectx.strokeStyle = g; ectx.lineWidth = 2.4;
      ectx.beginPath(); path.forEach((p, i) => i ? ectx.lineTo(p[0], p[1]) : ectx.moveTo(p[0], p[1])); ectx.stroke(); ectx.restore();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
