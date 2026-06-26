/* =====================================================================
   SATYAM SHAKKARWAL — Portfolio interactions
   ===================================================================== */
(function () {
  "use strict";
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------  THEME (persist across pages)  ---------- */
  const THEME_KEY = "satyam-theme";
  const root = document.documentElement;
  function setTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    $$("[data-theme-toggle]").forEach((el) => { const tip = t === "dark" ? "Light mode" : "Dark mode"; el.setAttribute("title", "Switch to " + tip.toLowerCase()); el.setAttribute("data-tip", tip); });
  }
  (function initTheme() {
    let saved;
    try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
    if (!saved) saved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(saved);
  })();
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-theme-toggle]");
    if (!t) return;
    setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ----------  PRELOADER  ---------- */
  const SHOPIFY_LOGO = '<svg viewBox="0 0 110 125" aria-hidden="true"><path fill="#95BF47" d="M95.9 23.9c-.1-.6-.6-1-1-1-.4 0-8.3-.6-8.3-.6s-5.5-5.5-6.1-6.1c-.6-.6-1.8-.4-2.2-.3-.1 0-1.2.4-3 1-1.8-5.2-5-10-10.6-10h-.5C62.5.3 60.5 0 58.8 0 45.1 0 38.6 17.1 36.5 25.8c-5.3 1.6-9.1 2.8-9.6 3-3 .9-3.1 1-3.5 3.8-.3 2.1-8 61.7-8 61.7l59.9 11.2 32.4-7S96 24.5 95.9 23.9zM72.4 18.1l-4.8 1.5v-1.1c0-3.3-.5-6-1.2-8.1 3 .4 5 3.8 6 7.7zM62.9 11c.8 2.1 1.4 5 1.4 9v.6c-3.1 1-6.5 2-9.9 3.1 1.9-7.4 5.5-11 8.5-12.7zM59.1 7.4c.5 0 1.1.2 1.6.5-4 1.9-8.2 6.6-10 16l-7.9 2.4C45.1 18.4 50.6 7.4 59.1 7.4z"/><path fill="#5E8E3E" d="M94.9 22.9c-.4 0-8.3-.6-8.3-.6s-5.5-5.5-6.1-6.1c-.2-.2-.5-.3-.8-.4l-4.5 92.3 32.4-7S96 24.5 95.9 23.9c-.1-.6-.6-1-1-1z"/><path fill="#fff" d="M66.5 39.6l-4 11.9s-3.5-1.9-7.8-1.9c-6.3 0-6.6 4-6.6 5 0 5.4 14.2 7.5 14.2 20.3 0 10.1-6.4 16.6-15 16.6-10.3 0-15.6-6.4-15.6-6.4l2.8-9.1s5.4 4.7 10 4.7c3 0 4.2-2.4 4.2-4.1 0-7.1-11.6-7.4-11.6-19.1 0-9.9 7.1-19.5 21.4-19.5 5.5 0 8.2 1.6 8.2 1.6z"/></svg>';
  const FRAMER_LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0099FF" d="M5 3h14v6h-7z"/><path fill="#0099FF" d="M5 9h7l7 6H5z"/><path fill="#0099FF" d="M5 15h7v6z"/></svg>';
  const PRE_VERBS = ["Designing", "Developing", "Optimizing", "Shipping"];

  function preloader() {
    const pre = $(".preloader");
    if (!pre) { document.body.classList.add("loaded"); document.dispatchEvent(new Event("app:loaded")); return; }
    // reduced-motion users skip straight to the content
    if (reduce) {
      document.body.classList.remove("no-scroll");
      document.body.classList.add("loaded");
      document.dispatchEvent(new Event("app:loaded"));
      pre.remove();
      return;
    }
    const word = (pre.dataset.word || "WELCOME").toUpperCase();
    const chars = word.split("").map((c) => `<span>${c}</span>`).join("");
    const verbs = PRE_VERBS.map((v) => `<span>${v}</span>`).join("");
    pre.innerHTML = `
      <span class="pre-liq l1"></span><span class="pre-liq l2"></span><span class="pre-liq l3"></span>
      <div class="pre-spark"><i></i><i></i><i></i><i></i><i></i><i></i></div>
      <div class="pre-inner">
        <div class="pre-stage">
          <span class="pre-orbit"></span><span class="pre-orbit o2"></span>
          <div class="pre-logos">
            <span class="pre-logo shopify">${SHOPIFY_LOGO}</span>
            <span class="pre-plus">×</span>
            <span class="pre-logo framer">${FRAMER_LOGO}</span>
          </div>
        </div>
        <div class="pre-word">${chars}</div>
        <div class="pre-rotate">${verbs}</div>
        <div class="pre-bar"><i></i></div>
        <div class="pre-count">000</div>
      </div>`;
    const bar = $(".pre-bar i", pre);
    const count = $(".pre-count", pre);
    if (reduce) { finish(); return; }
    // time-based fill (start .18s + fill 1.9s + .3s hold ~= 2.4s on screen) then a .8s fly-off exit
    const t0 = performance.now(), DUR = 2000;
    const tick = () => {
      const raw = Math.min(1, (performance.now() - t0) / DUR);
      const e = 1 - Math.pow(1 - raw, 2);
      const p = Math.round(e * 100);
      // bar fills via a CSS (compositor) animation so it stays smooth even while the main thread
      // is busy rendering the page; JS only updates the small count + triggers the finish.
      if (count) count.textContent = String(p).padStart(3, "0");
      if (raw < 1) requestAnimationFrame(tick);
      else setTimeout(finish, 420);
    };
    setTimeout(() => requestAnimationFrame(tick), 180);
    function finish() {
      // pick a random fly-off direction each load (up / down / left / right / two diagonals)
      const DIRS = [["0%", "-100%"], ["0%", "100%"], ["-100%", "0%"], ["100%", "0%"], ["-100%", "-100%"], ["100%", "-100%"]];
      const d = DIRS[Math.floor(Math.random() * DIRS.length)];
      pre.style.setProperty("--ex", d[0]); pre.style.setProperty("--ey", d[1]);
      pre.classList.add("done");
      document.body.classList.remove("no-scroll");
      // fire the hero entrance once the loader has flown clear, so it's always seen (direction-agnostic)
      setTimeout(() => {
        document.body.classList.add("loaded");
        document.dispatchEvent(new Event("app:loaded"));
      }, 640);
      setTimeout(() => pre.remove(), 880);
    }
  }

  /* ----------  CUSTOM CURSOR  ---------- */
  function cursor() {
    if (window.matchMedia("(hover: none)").matches || window.innerWidth < 820) return;
    const dot = $(".cursor-dot"), ring = $(".cursor-ring");
    if (!dot || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const label = document.createElement("span");
    label.className = "cur-label"; ring.appendChild(label);
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest("a, button, .proj-card, [data-magnetic]")) ring.classList.add("hover");
      const card = e.target.closest(".proj-card, [data-cursor]");
      if (card) { ring.classList.add("view"); label.textContent = card.getAttribute("data-cursor") || "View"; }
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest("a, button, .proj-card, [data-magnetic]")) ring.classList.remove("hover");
      if (e.target.closest(".proj-card, [data-cursor]")) { ring.classList.remove("view"); label.textContent = ""; }
    });
  }

  /* ----------  SCROLL REVEAL  ---------- */
  function reveal() {
    const els = $$("[data-animate], .reveal-words");
    if (reduce) { els.forEach((el) => el.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    els.forEach((el) => {
      // hero content (incl. the masked h1 lines that IO can't see) reveals AFTER the
      // preloader leaves, so the entrance is actually visible — not hidden behind it.
      if (el.closest(".hero")) {
        const go = () => requestAnimationFrame(() => el.classList.add("in"));
        if (document.body.classList.contains("loaded")) go();
        else document.addEventListener("app:loaded", go, { once: true });
      } else io.observe(el);
    });
  }

  /* ----------  WORD-SPLIT HEADINGS  ---------- */
  function splitWords() {
    $$(".reveal-words").forEach((el) => {
      if (el.dataset.split) return;
      el.dataset.split = "1";
      const html = el.innerHTML;
      // preserve inner markup tokens that use <br> by splitting on spaces only
      const words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words
        .map((w) => `<span class="word"><span>${w}</span></span>`)
        .join(" ");
    });
  }

  /* ----------  MARQUEE (duplicate for seamless loop)  ---------- */
  function marquee() {
    $$(".ticker-track, .dm-row").forEach((tr) => {
      if (tr.dataset.dup) return;
      tr.dataset.dup = "1";
      tr.innerHTML += tr.innerHTML;
    });
  }

  /* ----------  CURVED 3D LOGO CONVEYOR (cylinder bend)  ---------- */
  function curvedLogos() {
    const marq = $(".logos-marquee");
    const section = $(".logos");
    if (!marq || !section) return;
    if (reduce || window.innerWidth < 760) return;
    section.classList.add("is-3d");
    const tracks = $$(".logos-track", marq);
    if (!tracks.length) return;
    let hovered = null;
    // cache each cell's center offset RELATIVE to its track (constant as the track translates),
    // so per frame we only read 1 rect per track (2 total) instead of one per tile (~28) — much cheaper.
    const groups = tracks.map((tr) => {
      const trLeft = tr.getBoundingClientRect().left;
      const cells = $$(".logo-cell", tr).map((el) => {
        const r = el.getBoundingClientRect();
        el.addEventListener("mouseenter", () => { hovered = el; });
        el.addEventListener("mouseleave", () => { if (hovered === el) hovered = null; });
        return { el, rel: (r.left + r.width / 2) - trLeft };
      });
      return { tr, cells };
    });
    const MAXA = 44, DEPTH = 165, POP = 80;
    let running = false, raf = null, tickSkip = false;
    function frame() {
      // update tile curve every other frame (~30fps) — halves the per-frame cost, imperceptible on a slow marquee
      tickSkip = !tickSkip;
      if (tickSkip) { raf = requestAnimationFrame(frame); return; }
      const mr = marq.getBoundingClientRect();
      const cx = mr.left + mr.width / 2;
      const half = (mr.width / 2) || 1;
      for (const g of groups) {
        const trLeft = g.tr.getBoundingClientRect().left;
        for (const c of g.cells) {
          let n = (trLeft + c.rel - cx) / half;
          if (n < -1.25) n = -1.25; else if (n > 1.25) n = 1.25;
          const ry = -n * MAXA;
          const tz = -Math.abs(n) * DEPTH + (c.el === hovered ? POP : 0);
          c.el.style.transform = "translateZ(" + tz.toFixed(1) + "px) rotateY(" + ry.toFixed(1) + "deg)";
        }
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running) { running = true; frame(); } }
    function stop() { if (running) { running = false; cancelAnimationFrame(raf); } }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { es[0].isIntersecting ? start() : stop(); }, { rootMargin: "120px" }).observe(section);
    } else { start(); }
  }

  /* ----------  MAGNETIC BUTTONS  ---------- */
  function magnetic() {
    if (window.innerWidth < 820) return;
    $$("[data-magnetic]").forEach((el) => {
      const strength = parseFloat(el.dataset.magnetic) || 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * strength;
        const y = (e.clientY - r.top - r.height / 2) * strength;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }

  /* ----------  3D TILT + CURSOR SHEEN  ---------- */
  function tilt3d() {
    if (reduce || window.innerWidth < 900) return;
    $$(".proj-card, .serv-card, .flow-card, .testi, .statx-card, .cap-card").forEach((c) => {
      let raf = null;
      const locked = () => c.classList.contains("card3d") && !c.classList.contains("is-set");
      c.addEventListener("mousemove", (e) => {
        if (locked()) return;
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        c.style.setProperty("--mx", (px * 100) + "%");
        c.style.setProperty("--my", (py * 100) + "%");
        const rx = (0.5 - py) * 9;
        const ry = (px - 0.5) * 11;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          c.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        });
      });
      c.addEventListener("mouseleave", () => { if (!locked()) c.style.transform = ""; });
    });
  }

  /* ----------  3D SCROLL-REVEAL CARDS (home featured)  ---------- */
  function cards3d() {
    const cards = $$(".proj-card.card3d");
    if (!cards.length) return;
    if (reduce) { cards.forEach((c) => { c.style.opacity = "1"; c.style.transform = ""; c.classList.add("is-set"); }); return; }
    const small = window.innerWidth < 760;
    const active = new Set();
    cards.forEach((c, i) => { c._col = (i % 2 === 0) ? -1 : 1; c._i = i; c.style.opacity = "0"; });
    // cache each card's document-Y (offsetTop chain ignores our own transform) so the scroll
    // handler never reads getBoundingClientRect per card = no layout thrash
    const pageY = (el) => { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; };
    let tops = cards.map(pageY);
    const measure = () => { tops = cards.map(pageY); };
    const io = new IntersectionObserver((ens) => {
      ens.forEach((en) => { if (en.isIntersecting) active.add(en.target); else active.delete(en.target); });
      schedule();
    }, { rootMargin: "12% 0px 14% 0px" });
    cards.forEach((c) => io.observe(c));
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    let ticking = false;
    function update() {
      ticking = false;
      const vh = window.innerHeight, start = vh * 0.94, end = vh * 0.42, sy = window.scrollY;
      active.forEach((c) => {
        const top = tops[c._i] - sy;                    // viewport-top without a per-card reflow
        let p = (start - top) / (start - end);
        p = p < 0 ? 0 : p > 1 ? 1 : p;
        if (p >= 1) {
          if (!c._set) { c._set = true; c.classList.add("is-set"); c.style.transform = ""; c.style.opacity = ""; }
          return;
        }
        c._set = false; c.classList.remove("is-set");
        const e = ease(p);
        const ty = (1 - e) * (small ? 34 : 70);
        const sc = 0.9 + e * 0.1;
        c.style.opacity = (0.1 + e * 0.9).toFixed(3);
        if (small) {
          // phones: a clean 2D rise (no 3D depth/rotation = far cheaper to composite, no jank)
          c.style.transform = `translate3d(0, ${ty.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
        } else {
          const tz = (1 - e) * -260, rx = (1 - e) * 22, ry = c._col * (1 - e) * 12;
          c.style.transform = `translate3d(0, ${ty.toFixed(1)}px, ${tz.toFixed(0)}px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
        }
      });
    }
    function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", () => { measure(); schedule(); }, { passive: true });
    window.addEventListener("load", () => { measure(); schedule(); });
    schedule();
  }

  /* ----------  FEATURED 3D COVERFLOW  ---------- */
  function coverflow() {
    const stage = document.getElementById("cf-stage");
    if (!stage) return;
    const section = document.querySelector(".showcase");
    const nameEl = document.getElementById("cf-name");
    const platEl = document.getElementById("cf-plat");
    const linkEl = document.getElementById("cf-link");
    const dotsEl = document.getElementById("cf-dots");
    const ORDER = ["taneja-cloth-house", "fragfreak", "perfy-you", "creative-inktales", "helping-life-foundation", "poweroxx", "the-funky-fitz", "trydent"];
    const items = ORDER.map((s) => ({ slug: s, p: PROJECTS[s] })).filter((x) => x.p);
    if (!items.length) return;

    stage.innerHTML = items.map(({ slug, p }) => {
      let host = ""; try { host = p.live ? new URL(p.live).host.replace(/^www\./, "") : ""; } catch (e) {}
      const media = (p.shots && p.shots[0])
        ? `<img src="assets/img/projects/${slug}-cf.jpg" alt="${p.name} website" decoding="async">`
        : `<div class="mesh ${p.mesh}"></div>`;
      return `<a class="cf-card" href="project.html?p=${slug}">
        <div class="cf-frame"><div class="cf-bar"><i></i><i></i><i></i><b>${host}</b></div>${media}</div>
        <div class="cf-cap"><b>${p.name}</b><span>${p.platform}</span></div>
      </a>`;
    }).join("");

    const cards = Array.prototype.slice.call(stage.querySelectorAll(".cf-card"));
    const N = cards.length;
    if (dotsEl) dotsEl.innerHTML = items.map((_, i) => `<button class="cf-dot" data-i="${i}" aria-label="Project ${i + 1}"></button>`).join("");
    const dots = dotsEl ? Array.prototype.slice.call(dotsEl.querySelectorAll(".cf-dot")) : [];
    let cardW = cards[0].offsetWidth || 360;
    let lastInfo = -1;

    function setInfo(idx) {
      idx = Math.max(0, Math.min(N - 1, idx));
      if (idx === lastInfo) return;
      lastInfo = idx;
      const it = items[idx];
      if (nameEl) {
        if (reduce) {
          nameEl.textContent = it.p.name;
        } else {
          nameEl.innerHTML = it.p.name.split("").map((ch, i) =>
            `<span style="animation-delay:${(i * 0.022).toFixed(3)}s">${ch === " " ? "&nbsp;" : ch}</span>`).join("");
        }
      }
      if (platEl) platEl.textContent = it.p.platform;
      if (linkEl) linkEl.setAttribute("href", "project.html?p=" + it.slug);
      dots.forEach((d, i) => d.classList.toggle("on", i === idx));
      const info = nameEl ? nameEl.closest(".cf-info") : null;
      if (info && !reduce) { info.classList.remove("swap"); void info.offsetWidth; info.classList.add("swap"); }
    }
    function layout(p) {
      const active = p * (N - 1);
      const spacing = cardW * 0.66;
      cards.forEach((c, i) => {
        const off = i - active, ax = Math.abs(off);
        const ty = Math.min(ax * ax * 5, 72);
        c.style.transform = "translate(-50%,-50%) translate3d(" + (off * spacing) + "px," + ty + "px," + (-ax * 135) + "px) rotateY(" + Math.max(-52, Math.min(52, -off * 22)) + "deg) scale(" + Math.max(0.66, 1 - ax * 0.13) + ")";
        c.style.opacity = String(Math.max(0.15, 1 - ax * 0.28));
        const z = 200 - Math.round(ax * 10);
        if (c._z !== z) { c.style.zIndex = String(z); c._z = z; }
        const vis = ax > 3.2 ? "hidden" : "visible";
        if (c._vis !== vis) { c.style.visibility = vis; c._vis = vis; }
        const act = ax < 0.55;
        if (c._act !== act) { c.classList.toggle("active", act); c._act = act; }
      });
      setInfo(Math.round(active));
    }
    const flat = () => reduce;
    let mode = null, targetP = 0, curP = 0, running = false;
    function computeTarget() {
      const r = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      return scrollable > 0 ? Math.max(0, Math.min(1, -r.top / scrollable)) : 0;
    }
    function render() {
      targetP = computeTarget();                 // read scroll geometry inside the frame (not per scroll event)
      curP += (targetP - curP) * 0.085;
      if (Math.abs(targetP - curP) < 0.0004) { curP = targetP; layout(curP); running = false; return; }
      layout(curP);
      requestAnimationFrame(render);
    }
    function update(immediate) {
      if (flat()) {
        if (mode !== "flat") { mode = "flat"; section.classList.add("cf-flat"); cards.forEach((c) => { c.style.transform = ""; c.style.opacity = ""; c.style.zIndex = ""; }); }
        return;
      }
      if (mode !== "3d") { mode = "3d"; section.classList.remove("cf-flat"); cardW = cards[0].offsetWidth || 360; }
      targetP = computeTarget();
      if (immediate) { curP = targetP; layout(curP); return; }
      if (!running) { running = true; requestAnimationFrame(render); }
    }
    // scroll just keeps the render loop alive; the geometry read lives in render() = no per-event reflow
    function kick() {
      if (flat()) { update(false); return; }
      if (mode !== "3d") { mode = "3d"; section.classList.remove("cf-flat"); cardW = cards[0].offsetWidth || 360; }
      if (!running) { running = true; requestAnimationFrame(render); }
    }
    let inView = true;
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { inView = es[0].isIntersecting; if (inView) kick(); }, { rootMargin: "300px 0px" }).observe(section);
    }
    window.addEventListener("scroll", () => { if (inView) kick(); }, { passive: true });
    window.addEventListener("resize", () => { cardW = cards[0].offsetWidth || cardW; update(true); });
    dots.forEach((d) => d.addEventListener("click", () => {
      if (flat()) return;
      const i = parseInt(d.dataset.i, 10);
      const scrollable = section.offsetHeight - window.innerHeight;
      window.scrollTo({ top: section.offsetTop + (i / (N - 1)) * scrollable, behavior: reduce ? "auto" : "smooth" });
    }));
    setInfo(0);
    update(true);
  }

  /* ----------  COUNT-UP STATS  ---------- */
  function counters() {
    const els = $$("[data-count]");
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const dec = (el.dataset.count.indexOf(".") > -1) ? 1 : 0;
        if (reduce) { el.textContent = target.toFixed(dec) + suffix; io.unobserve(el); return; }
        let cur = 0; const steps = 60; const inc = target / steps; let i = 0;
        const run = () => {
          i++; cur = Math.min(target, cur + inc);
          el.textContent = cur.toFixed(dec) + suffix;
          if (i < steps) requestAnimationFrame(run);
          else el.textContent = target.toFixed(dec) + suffix;
        };
        run(); io.unobserve(el);
      });
    }, { threshold: 0.5 });
    els.forEach((el) => io.observe(el));
  }

  /* ----------  CURVY PAGE SPINE (scroll-drawn thread weaving between sections)  ---------- */
  function spine() {
    const wrap = $(".page-spine");
    if (!wrap || reduce || window.innerWidth < 900) return;
    let fill = null, glow = null, len = 0, lastH = 0;
    let samples = [], curOff = 0, targetOff = 0, animRaf = null, isOn = false;
    const SN = 220;
    const yMid = (el) => { if (!el) return 0; const r = el.getBoundingClientRect(); return r.top + scrollY + r.height / 2; };
    const yTop = (el) => { if (!el) return 0; return el.getBoundingClientRect().top + scrollY; };

    function waypoints(W) {
      if ($(".about-bgword")) {
        // about: handcrafted route through the section gaps
        const head = $(".page-head"), tick = $(".ticker"), story = $$("section.section")[0];
        const stats = $(".about-stats"), caps = $(".cap-grid"), j = $(".journey"), cta = $(".cta-band"), foot = $("footer.footer");
        return [
          [W * 0.50, 95], [W * 0.525, yMid(head) * 0.9], [W * 0.30, yMid(tick)],
          [W * 0.515, yMid(story)], [W * 0.50, yMid(stats)], [W * 0.66, yMid(caps)],
          [W * 0.13, yTop(j) - 60], [W * 0.065, yMid(j)], [W * 0.09, yTop(cta) - 50], [W * 0.05, yMid(cta)],
          [W * 0.42, yTop(foot) + 60], [W * 0.50, yMid(foot)]
        ].filter((p) => p[1] > 0);
      }
      // generic: weave through every big top-level block, S-curving along the margins of tall (pinned) sections
      const blocks = Array.from(document.body.children).filter((el) =>
        /^(SECTION|HEADER|FOOTER)$/.test(el.tagName) && el.offsetHeight > 200);
      const pts = [[W * 0.5, 95]];
      const amps = [0.17, 0.42, 0.27];
      let dir = 1, ai = 0;
      blocks.forEach((el) => {
        const h = el.offsetHeight, t = yTop(el);
        if (el.tagName === "FOOTER") { pts.push([W * 0.42, t + 60], [W * 0.5, t + h * 0.45]); return; }
        if (h > window.innerHeight * 1.4) {
          // tall scroll-pinned section: ride a visible margin through it (not the extreme edge)
          pts.push([W * (dir > 0 ? 0.84 : 0.16), t + h * 0.22]);
          pts.push([W * (dir > 0 ? 0.79 : 0.21), t + h * 0.74]);
        } else {
          pts.push([W * (0.5 + dir * amps[ai % 3]), t + h * 0.55]);
          ai++;
        }
        dir = -dir;
      });
      return pts.filter((p) => p[1] > 0);
    }

    function build() {
      const W = document.documentElement.clientWidth;
      const H = document.body.scrollHeight;
      lastH = H;                                  // cache height so frame() never reads layout
      const pts = waypoints(W);
      if (pts.length < 3) return;
      let d = "M" + pts[0][0].toFixed(1) + "," + pts[0][1].toFixed(1);
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
        d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + "," + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) +
             " " + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + "," + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) +
             " " + p2[0].toFixed(1) + "," + p2[1].toFixed(1);
      }
      wrap.innerHTML =
        '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H + '" preserveAspectRatio="none">' +
        '<defs><linearGradient id="spineg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="' + H + '">' +
        '<stop offset="0" style="stop-color:var(--accent-2)"/><stop offset=".5" style="stop-color:var(--accent)"/><stop offset="1" style="stop-color:var(--accent-3)"/>' +
        "</linearGradient></defs>" +
        '<path class="sp-glow" d="' + d + '" stroke="url(#spineg)"/>' +
        '<path class="sp-fill" d="' + d + '" stroke="url(#spineg)"/></svg>';
      fill = $(".sp-fill", wrap); glow = $(".sp-glow", wrap);
      len = fill.getTotalLength();
      fill.style.strokeDasharray = len;
      glow.style.strokeDasharray = len;
      // sample the path once so scrolling never calls path geometry
      samples = [];
      for (let i = 0; i <= SN; i++) samples.push(fill.getPointAtLength((len * i) / SN));
      // snap the drawn length to the current scroll position (rebuild should not re-animate the draw)
      computeTarget(); curOff = targetOff; apply();
    }

    function computeTarget() {
      isOn = scrollY > 30;
      // anchor the tip to what the viewer is looking at (so it never drifts away on long sections):
      // binary-search the path samples by page-Y for the point at ~70% of the viewport
      const anchor = Math.max(samples[0].y, Math.min(samples[SN].y, scrollY + window.innerHeight * 0.7));
      let lo = 0, hi = SN;
      while (lo < hi) { const mid = (lo + hi) >> 1; if (samples[mid].y < anchor) lo = mid + 1; else hi = mid; }
      const i0 = Math.max(0, lo - 1);
      const a = samples[i0], b = samples[Math.min(SN, i0 + 1)];
      const fr = (b.y > a.y) ? Math.min(1, Math.max(0, (anchor - a.y) / (b.y - a.y))) : 0;
      const f = (i0 + fr) / SN;
      targetOff = len * (1 - f);
    }
    function apply() {
      const v = curOff.toFixed(1);
      fill.style.strokeDashoffset = v; glow.style.strokeDashoffset = v;
      wrap.classList.toggle("is-on", isOn);
    }
    // butter-smooth: glide the drawn length toward the scroll target every frame (continuous, no coarse stepping)
    function render() {
      animRaf = null;
      if (!fill || !samples.length) return;
      computeTarget();
      const d = targetOff - curOff;
      if (Math.abs(d) < 0.5) { curOff = targetOff; apply(); return; }  // settled
      curOff += d * 0.2;                                               // ease toward target
      apply();
      animRaf = requestAnimationFrame(render);
    }
    function kick() { if (animRaf == null) animRaf = requestAnimationFrame(render); }
    addEventListener("scroll", kick, { passive: true });
    let rsz = null;
    addEventListener("resize", () => { clearTimeout(rsz); rsz = setTimeout(build, 220); }, { passive: true });
    // sections settle after fonts/images load; rebuild once everything is final
    addEventListener("load", build);
    // rebuild only when the page height truly changes — and only AFTER load, so the page settling
    // during initial load doesn't trigger repeated expensive rebuilds (that was stuttering the loader)
    if ("ResizeObserver" in window) {
      let rb = null, ready = false;
      addEventListener("load", () => { setTimeout(() => { ready = true; }, 400); });
      new ResizeObserver(() => {
        if (!ready || Math.abs(document.body.scrollHeight - lastH) < 40) return;
        clearTimeout(rb); rb = setTimeout(build, 280);
      }).observe(document.body);
    }
    build();
  }

  /* ----------  ABOUT PAGE FX (parallax word, ignite text, journey draw, portrait tilt)  ---------- */
  function aboutFX() {
    const head = $(".page-head");
    const bgw = $(".about-bgword");
    const lead = $(".scroll-fill");
    const journey = $(".journey");
    if (!bgw && !lead && !journey) return;
    const desk = window.innerWidth >= 900;

    // split the lead into word spans, keeping inner <span class="hl"> / <b> intact
    let words = [];
    if (lead) {
      (function split(node) {
        Array.from(node.childNodes).forEach((ch) => {
          if (ch.nodeType === 3) {
            const frag = document.createDocumentFragment();
            ch.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
              else { const s = document.createElement("span"); s.className = "sf-w"; s.textContent = part; frag.appendChild(s); }
            });
            node.replaceChild(frag, ch);
          } else if (ch.nodeType === 1) split(ch);
        });
      })(lead);
      words = $$(".sf-w", lead);
      if (reduce) { words.forEach((w) => w.classList.add("lit")); words = []; }
    }

    const rows = journey ? $$(".jrow", journey) : [];
    let rowTops = [], litWords = -1, litRows = -1, ticking = false;
    const measureRows = () => { rowTops = rows.map((r) => r.offsetTop); };  // cache (constant) so frame() never reads offsetTop after a style write
    function frame() {
      ticking = false;
      const vh = window.innerHeight;
      if (bgw && desk && !reduce && head) {
        const ht = head.getBoundingClientRect().top;
        bgw.style.transform = "translate3d(" + (ht * 0.6) + "px, " + (ht * -0.12) + "px, 0)";
      }
      if (words.length) {
        const r = lead.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.88 - r.top) / (r.height + vh * 0.36)));
        const n = Math.round(p * words.length);
        if (n !== litWords) { for (let i = 0; i < words.length; i++) words[i].classList.toggle("lit", i < n); litWords = n; }
      }
      if (journey && !reduce) {
        const r = journey.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh * 0.64 - r.top) / r.height));
        journey.style.setProperty("--jprog", p.toFixed(4));
        const fillY = p * r.height;
        let n = 0;
        for (let i = 0; i < rows.length; i++) { if (rowTops[i] + 10 <= fillY) n = i + 1; }
        if (n !== litRows) { rows.forEach((row, i) => row.classList.toggle("lit", i < n)); litRows = n; }
      }
    }
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
    let arz = null;
    addEventListener("resize", () => { clearTimeout(arz); arz = setTimeout(() => { measureRows(); frame(); }, 200); }, { passive: true });
    addEventListener("load", () => { measureRows(); frame(); });
    measureRows(); frame();

    // cursor 3D tilt on the orbit portrait
    const portrait = $(".about-portrait");
    const orbit = $(".orbit-scene");
    if (portrait && orbit && desk && !reduce) {
      let prf = null;
      portrait.addEventListener("mousemove", (e) => {
        const r = portrait.getBoundingClientRect();
        const rx = (0.5 - (e.clientY - r.top) / r.height) * 13;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 15;
        if (prf) cancelAnimationFrame(prf);
        prf = requestAnimationFrame(() => { orbit.style.transform = "perspective(800px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)"; });
      });
      portrait.addEventListener("mouseleave", () => { orbit.style.transform = ""; });
    }
  }

  /* ----------  SKILL BARS  ---------- */
  function skillBars() {
    const els = $$(".skill .bar i");
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.style.width = en.target.dataset.val + "%"; io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  /* ----------  NAV: scroll state + active link  ---------- */
  function nav() {
    const burger = $(".burger"), menu = $(".mobile-menu");
    if (burger && menu) {
      burger.addEventListener("click", () => {
        const open = burger.classList.toggle("open");
        menu.classList.toggle("open", open);
        document.body.classList.toggle("no-scroll", open);
      });
      $$("a", menu).forEach((a) => a.addEventListener("click", () => {
        burger.classList.remove("open"); menu.classList.remove("open");
        document.body.classList.remove("no-scroll");
      }));
    }
    // active link by filename
    const page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$(".nav-links a, .mobile-menu a").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === page || (page === "" && href === "index.html") ||
          (page === "index.html" && href === "index.html")) a.classList.add("active");
    });
  }

  /* ----------  SCROLL PROGRESS + TO-TOP  ---------- */
  function scrollFx() {
    const prog = $(".scroll-prog"), top = $(".to-top");
    // cache the scrollable height so the scroll handler never reads layout
    // (reading scrollHeight per scroll event forces a sync reflow = jank)
    let maxScroll = 1, ticking = false;
    const measure = () => { const h = document.documentElement; maxScroll = (h.scrollHeight - h.clientHeight) || 1; };
    const frame = () => {
      ticking = false;
      const y = window.scrollY || window.pageYOffset || 0;
      if (prog) prog.style.width = ((y / maxScroll) * 100) + "%";
      if (top) top.classList.toggle("show", y > 600);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => { measure(); onScroll(); }, { passive: true });
    window.addEventListener("load", measure);
    frame();
    if (top) top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
  }

  /* ----------  PARALLAX BLOBS  ---------- */
  function parallax() {
    if (reduce || window.innerWidth < 900) return;
    const blobs = $$(".bg-field .blob");
    const h1 = $(".hero h1");
    const heroScene = $(".hero-scene");
    const heroFloats = $(".hero-floats");
    if (!blobs.length && !h1 && !heroScene) return;
    let tmx = 0, tmy = 0, raf = null, heroVisible = true;
    // only run hero/h1 transforms while the hero is on screen
    const hero = $(".hero");
    if (hero && "IntersectionObserver" in window) {
      new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }, { rootMargin: "100px" }).observe(hero);
    }
    function apply() {
      raf = null;
      for (let i = 0; i < blobs.length; i++) { const k = (i + 1) * 11; blobs[i].style.transform = `translate3d(${tmx * k}px, ${tmy * k}px, 0)`; }
      if (heroVisible) {
        if (heroScene) heroScene.style.transform = `translate3d(${tmx * 42}px, ${tmy * 42}px, 0)`;
      }
    }
    // mousemove only (rAF-gated) -> scrolling does NO parallax work = buttery scroll
    window.addEventListener("mousemove", (e) => {
      tmx = e.clientX / window.innerWidth - 0.5;
      tmy = e.clientY / window.innerHeight - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  }

  /* ----------  WILD SCROLL: velocity skew/stretch + heading parallax  ---------- */
  function scrollWild() {
    if (reduce || window.innerWidth < 820) return;
    // skew only SAFE sections (never the scroll-pinned ones: craft .cv-sec, dial .dial-sec, deliver, #work cards3d)
    const skewEls = $$("section.section:not(#work)").filter((s) => !s.querySelector(".dial-sec, .cv-sec"));
    const logos = $(".logos"); if (logos) skewEls.push(logos);
    skewEls.forEach((el) => { el.style.willChange = "transform"; });
    const paraEls = $$(".sec-head, .logos-head"); // heading blocks drift for depth (compose with child reveals)
    const heroEl = $(".hero"), heroShow = $(".hero-show"), heroCopy = $(".hero-copy");
    let lastY = window.scrollY, vel = 0, raf = null, idle = 0, reset = false;
    function loop() {
      const y = window.scrollY;
      if (reset) { lastY = y; reset = false; }   // avoid a velocity spike when the loop restarts
      const dv = y - lastY; lastY = y;
      vel += (dv - vel) * 0.2;
      const v = Math.max(-58, Math.min(58, vel));
      const skewDeg = (v / 58) * 5.2;                 // lean (skewY only — scaleY removed, it forced full-section re-raster = jank)
      const sk = "skewY(" + skewDeg.toFixed(2) + "deg)";
      for (let i = 0; i < skewEls.length; i++) skewEls[i].style.transform = sk;
      const vh = window.innerHeight;
      for (let i = 0; i < paraEls.length; i++) {
        const el = paraEls[i], r = el.getBoundingClientRect();
        if (r.bottom > -80 && r.top < vh + 80) {
          const off = ((r.top + r.height / 2) - vh / 2) / vh;
          el.style.transform = "translateY(" + (off * -56).toFixed(1) + "px)";
        }
      }
      // cinematic hero scroll-exit: cards zoom/fade away + copy lifts as you leave the hero
      if (heroEl && y < heroEl.offsetHeight) {
        const hp = Math.max(0, Math.min(1, y / (heroEl.offsetHeight * 0.82)));
        if (heroShow) { heroShow.style.transform = "translateY(" + (hp * -64).toFixed(1) + "px) scale(" + (1 - hp * 0.18).toFixed(3) + ")"; heroShow.style.opacity = (1 - hp * 0.95).toFixed(2); }
        if (heroCopy) { heroCopy.style.transform = "translateY(" + (hp * 46).toFixed(1) + "px)"; heroCopy.style.opacity = (1 - hp * 0.75).toFixed(2); }
      }
      if (Math.abs(dv) < 0.15 && Math.abs(vel) < 0.15) idle++; else idle = 0;
      if (idle > 26) { raf = null; return; }
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("scroll", () => { if (!raf) { reset = true; raf = requestAnimationFrame(loop); } }, { passive: true });
    loop();
  }

  /* ----------  HORIZONTAL SCROLL-SCRUB ("What I deliver")  ---------- */
  function deliverScroll() {
    if (reduce || window.innerWidth < 900) return;
    const sec = $(".deliver-sec"), pin = $(".deliver-pin");
    if (!sec || !pin) return;
    const rows = $$(".dm-row", sec);
    if (!rows.length) return;
    sec.classList.add("is-scrub");
    const progBar = $(".dm-progress i", sec);
    let raf = null, data = [], spotTick = false;
    // cache each card's centre offset relative to its row (no per-frame layout reads = stays smooth)
    const measure = () => {
      data = rows.map((row) => {
        const rl = row.getBoundingClientRect().left;
        const cells = $$(".dm-card", row).map((el) => {
          const cr = el.getBoundingClientRect();
          return { el, off: (cr.left + cr.width / 2) - rl, f: false };
        });
        return { row, shift: Math.max(0, row.scrollWidth / 2), baseLeft: rl, cells };
      });
    };
    function loop() {
      raf = null;
      const r = sec.getBoundingClientRect();
      const total = sec.offsetHeight - window.innerHeight || 1;
      let p = (-r.top) / total; p = p < 0 ? 0 : p > 1 ? 1 : p;
      if (progBar) progBar.style.transform = "scaleX(" + p.toFixed(3) + ")";
      const cx = window.innerWidth / 2, reach = window.innerWidth * 0.55;
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        const x = (i % 2 === 0) ? -p * d.shift : -(1 - p) * d.shift;
        d.row.style.transform = "translate3d(" + x.toFixed(1) + "px,0,0)";
        // pop ONLY the card closest to centre (1 write/row) — the dm-tilt edge-mask dims the rest for free
        let best = null, bestDist = 1e9;
        for (let j = 0; j < d.cells.length; j++) {
          const ad = Math.abs(d.baseLeft + x + d.cells[j].off - cx);
          if (ad < bestDist) { bestDist = ad; best = d.cells[j]; }
        }
        if (d.focus !== best) {
          if (d.focus) { d.focus.el.style.transform = ""; d.focus.el.classList.remove("is-focus"); }
          d.focus = best;
          if (best) { best.el.style.transform = "scale(1.08)"; best.el.classList.add("is-focus"); }
        }
      }
    }
    let active = false;
    requestAnimationFrame(() => { measure(); loop(); });
    // only run the spotlight work while the section is on/near screen (not on every scroll of the whole page)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((es) => { active = es[0].isIntersecting; if (active && !raf) raf = requestAnimationFrame(loop); }, { rootMargin: "300px 0px" }).observe(sec);
    } else active = true;
    window.addEventListener("scroll", () => { if (active && !raf) raf = requestAnimationFrame(loop); }, { passive: true });
    window.addEventListener("resize", () => { measure(); if (active && !raf) raf = requestAnimationFrame(loop); }, { passive: true });
  }

  /* ----------  PROJECT FILTERS  ---------- */
  function filters() {
    const btns = $$(".filter-btn");
    const cards = $$("[data-cat]");
    if (!btns.length) return;
    // counts on the Featured / All pills
    const total = cards.length;
    const feat = cards.filter((c) => c.dataset.cat.split(" ").includes("featured")).length;
    btns.forEach((b) => {
      const fc = $(".fcount", b);
      if (!fc) return;
      if (b.dataset.filter === "featured") fc.textContent = "(" + feat + ")";
      else if (b.dataset.filter === "all") fc.textContent = "(" + total + ")";
    });
    const apply = (f, animate) => {
      cards.forEach((c) => {
        const show = f === "all" || c.dataset.cat.split(" ").includes(f);
        c.style.display = show ? "" : "none";
        if (show && animate && !reduce) { c.classList.remove("in"); requestAnimationFrame(() => c.classList.add("in")); }
      });
    };
    btns.forEach((b) => b.addEventListener("click", () => {
      btns.forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      apply(b.dataset.filter, true);
    }));
    const active = $(".filter-btn.active");
    if (active) apply(active.dataset.filter, false);
  }

  /* ----------  CONTACT FORM (mailto compose)  ---------- */
  function contactForm() {
    const form = $("#contact-form");
    if (!form) return;
    const note = $("#form-note");
    const btn = $("button[type=submit]", form);
    const MAIL = "sam.createsssss@gmail.com";
    function show(text, ok) {
      if (!note) return;
      note.textContent = text;
      note.style.display = "block";
      note.style.color = ok ? "var(--accent)" : "var(--text-2)";
      note.style.fontWeight = ok ? "600" : "400";
    }
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").trim();
      const email = (data.get("email") || "").trim();
      if (!name || !email) { show("Please add your name and email so I can reply.", false); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { show("That email looks off, mind double-checking it?", false); return; }
      const key = data.get("access_key") || "";
      // fallback to email if the Web3Forms key hasn't been set yet
      if (!key || /REPLACE_WITH/i.test(key)) {
        const sub = encodeURIComponent(`New project enquiry — ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nService: ${data.get("service") || ""}\nBudget: ${data.get("budget") || ""}\n\n${(data.get("message") || "").trim()}`);
        window.location.href = `mailto:${MAIL}?subject=${sub}&body=${body}`;
        show(`Opening your email app… if nothing happens, write to ${MAIL}.`, false);
        return;
      }
      const orig = btn ? btn.innerHTML : "";
      if (btn) { btn.disabled = true; btn.style.opacity = ".7"; btn.innerHTML = "Sending…"; }
      try {
        const res = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { Accept: "application/json" }, body: data });
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.success) { form.reset(); show("Thanks — your message is on its way. I'll get back to you within a day. ✦", true); }
        else { show(`Hmm, that didn't go through. Please email me directly at ${MAIL}.`, false); }
      } catch (err) {
        show(`Network hiccup — please email me at ${MAIL} and I'll jump on it.`, false);
      } finally {
        if (btn) { btn.disabled = false; btn.style.opacity = ""; btn.innerHTML = orig; }
      }
    });
  }

  /* ----------  PROJECT DATA  ---------- */
  const PROJECTS = {
    "fragfreak": { name: "FragFreak", year: "2026", platform: "Shopify", mesh: "mesh-a",
      tagline: "A bold fragrance store built for fast browsing and scent-led shopping.",
      industry: "Fragrance / eCommerce",
      overview: ["FragFreak needed a store that felt as premium as the scents it sells. I designed and built a fast Shopify storefront with rich product pages, clear collections, and a checkout tuned to keep buyers moving.",
        "Speed and a clean structure were baked in from day one, so the store doesn't just look good, it sells."],
      challenge: ["The biggest challenge was making a fragrance store feel as premium online as the scents feel in person, without slowing the site down. Perfume sells on emotion and detail, so the product pages needed rich imagery and clear scent-led storytelling while staying fast and easy to browse across a growing catalog.",
        "On top of that, the storefront had to stay clean and simple to manage so the brand could keep adding new fragrances and collections over time."],
      approach: ["I built a custom Shopify storefront with a strong visual hierarchy, scent-led collection pages, and clean product pages that put each fragrance front and centre. Speed and a solid structure were baked in from the first section, so the store loads quickly and stays easy to expand.",
        "The checkout flow was tightened to keep buyers moving from browse to purchase with as little friction as possible, and the whole build was kept consistent and lightweight.",
        "The result is a premium, fast fragrance store that looks the part and is built to convert and scale."],
      services: ["Shopify", "eCommerce", "Design", "CRO"],
      results: [{n:"100%",l:"Clean build"},{n:"<2s",l:"Load target"}], live: null, shots: null, next: "perfy-you" },

    "perfy-you": { name: "Perfy You", year: "2026", platform: "Shopify", mesh: "mesh-b",
      tagline: "A modern jewellery and accessories store built on Shopify for a large, premium catalog.",
      industry: "Jewellery & Accessories / eCommerce",
      overview: ["Perfy You is a jewellery and accessories brand on Shopify. The goal was a clean, premium store that stays easy to shop even with a very large catalog."],
      challenge: ["The hardest part was organizing more than 300 products without the store feeling cluttered. The client was also unsure about the design direction, colour palette, and visual consistency early on, and the filtering, sorting, and product discovery all needed work so people could actually find what they wanted."],
      approach: ["I built a structured, minimal Shopify store with cleaner navigation and much better product discovery. The filtering and sorting were reworked so browsing stays quick across big collections, and bundle-style recommendations and related products were added on the product pages to lift average order value, all without losing the premium look.",
        "The store now carries a large catalog without feeling heavy, with easier navigation, better discovery, and a stronger premium feel."],
      services: ["Shopify", "eCommerce", "Filtering & UX", "CRO"],
      results: [{n:"300+",l:"Products"},{n:"Premium",l:"Catalog UX"}], live: null, shots: null, next: "creative-inktales" },

    "creative-inktales": { name: "Creative Inktales", year: "2025", platform: "Shopify", mesh: "mesh-c",
      tagline: "A luxury calligraphy and custom gifting store with deep personalization.",
      industry: "Calligraphy / Personalized Gifting",
      overview: ["Creative Inktales is a luxury calligraphy and custom gifting brand on Shopify. It sells personalized products, handcrafted pieces, workshop bookings, and digital downloads, so the store had to feel artistic and elegant while staying easy to use."],
      challenge: ["The tricky part was keeping a premium feel while handling heavily personalized products. Most orders needed names, messages, images, or engraving details, which made the product flow far more complex than a normal store.",
        "The client also wanted to sell digital products next to physical ones, plus a workshop booking system where people pick a date, choose a time, and pay through Razorpay. Holding a clean, consistent look across all of that was the main focus."],
      approach: ["I designed a refined Shopify store that matched the brand's artistic, luxury feel, and built custom personalization forms in Liquid so people could add engraving text, images, and other details on the product page itself.",
        "Physical and digital products got their own clean flows, and I added a workshop booking system with slot selection, date handling, and Razorpay payments. Typography, structure, and visual hierarchy were kept minimal and premium throughout.",
        "The store now handles personalization, workshop bookings, and digital products together, all inside one clean, premium experience."],
      services: ["Shopify", "Custom Liquid", "Razorpay", "Workshops"],
      results: [{n:"Custom",l:"Personalization"},{n:"Razorpay",l:"Bookings"}], live: null, shots: null, next: "helping-life-foundation" },

    "helping-life-foundation": { name: "Helping Life Foundation", year: "2026", platform: "Framer", mesh: "mesh-d",
      tagline: "An emotional, trustworthy NGO website built on Framer.",
      industry: "Non-profit / NGO",
      overview: ["Helping Life Foundation is an NGO website built on Framer, designed to create an emotional, trustworthy, and impactful digital presence while showcasing the foundation's mission, initiatives, and community work through a modern and engaging experience."],
      challenge: ["One of the main challenges was creating a website that genuinely reflected the emotional and humanitarian feel of an NGO while still maintaining a clean and modern visual experience. The client wanted the website to effectively showcase their initiatives, campaigns, and social impact using multiple image sections, galleries, and interactive carousels without making the website feel overwhelming.",
        "Another major challenge was integrating a smooth donation system through Razorpay while keeping the experience simple and trustworthy for users. The client also wanted a dedicated 'Become a Volunteer' section with a form where people could easily connect and participate in the foundation's activities."],
      approach: ["I designed and built the site on Framer with a warm, clean layout and a clear story, so visitors feel the human side of the foundation. Image sections, galleries, and smooth carousels were used to show the NGO's work and community efforts without overwhelming the page.",
        "I added a Razorpay donation flow that keeps giving simple and secure, plus a dedicated 'Become a Volunteer' page with an easy form so people can sign up and get involved.",
        "The site now tells the foundation's story, takes donations, and signs up volunteers, all in a layout that feels warm and trustworthy."],
      services: ["Framer", "Razorpay", "Donations", "Volunteer flow"],
      results: [{n:"Razorpay",l:"Donations"},{n:"Volunteer",l:"Sign-up"}], live: null, shots: null, next: "poweroxx" },

    "poweroxx": { name: "PoweRoxx", year: "2024", platform: "Shopify", mesh: "mesh-e",
      tagline: "A bold, minimal streetwear store on Shopify for a Gen Z audience.",
      industry: "Streetwear / Fashion",
      overview: ["PoweRoxx is a modern Shopify streetwear brand built for a Gen Z audience. The goal was a bold, minimal, premium store that looks sharp and runs smoothly on every device."],
      challenge: ["One of the biggest challenges was creating a luxury and minimal website experience that still felt bold and visually appealing for a Gen Z audience. The client wanted the website to look modern, classy, and fashion-focused while maintaining a smooth and highly responsive shopping experience.",
        "Another major requirement was implementing a custom product personalization flow where customers could upload their own designs similar to a print-on-demand experience. The client also wanted payment restrictions for selected products, where certain t-shirts would not be eligible for Cash on Delivery. Along with these custom functionalities, maintaining a strong UI/UX experience and mobile responsiveness across the entire website was a key priority."],
      approach: ["I built a clean, premium Shopify store with a minimal, fashion-led look that fit the brand. A custom upload system lets customers add their own designs to products, similar to print-on-demand.",
        "I also added custom payment logic to switch off Cash on Delivery for certain products, and kept checkout quick. Mobile layout, navigation, and product presentation all got extra attention so the whole store feels polished.",
        "The store pairs a clean, premium look with a custom upload flow and smart checkout rules, and it runs smoothly on every device."],
      services: ["Shopify", "Personalization", "Custom checkout", "UI / UX"],
      results: [{n:"Custom",l:"Upload flow"},{n:"COD",l:"Rules"}], live: null, shots: null, next: "the-funky-fitz" },

    "the-funky-fitz": { name: "The Funky Fitz", year: "2024", platform: "Shopify", mesh: "mesh-f",
      tagline: "A bold, colourful streetwear store on Shopify, plus apparel design and ads.",
      industry: "Streetwear / Fashion",
      overview: ["The Funky Fitz is a modern streetwear and fashion eCommerce brand built on Shopify, designed with a bold, colorful, and energetic aesthetic that reflects the brand's youthful and creative identity. The website was created to deliver a smooth and visually engaging shopping experience while maintaining strong brand consistency."],
      challenge: ["One of the main challenges was creating a website that matched the client's vision of a cool, funky, and visually vibrant brand while still maintaining a clean and smooth shopping experience. The client wanted the website aesthetics, layouts, and color palette to feel energetic and unique without compromising usability or performance.",
        "Another major part of the project involved continuously creating t-shirt, hoodie, and apparel designs based on the client's changing requirements and fashion direction. Along with website management, handling the overall process from design execution to ads and sales-focused campaigns was also an important responsibility throughout the project."],
      approach: ["I built a bold, colourful Shopify store with streetwear-inspired layouts that matched the brand. Navigation, responsive design, and browsing were kept smooth so the site stays lively but still easy to use.",
        "Alongside building and maintaining the store, I kept designing t-shirt, hoodie, and apparel graphics as the client's direction changed, and ran the ad creatives and sales campaigns too.",
        "The store keeps its high-energy look while staying easy to shop, and it gave The Funky Fitz a consistent brand to grow with."],
      services: ["Shopify", "Apparel design", "Ads", "eCommerce"],
      results: [{n:"Design",l:"+ Ads"},{n:"Bold",l:"Brand"}], live: null, shots: null, next: "kurta-pyjama-ca" },

    "taneja-cloth-house": { name: "Taneja Cloth House", year: "2026", platform: "Shopify", mesh: "mesh-a",
      tagline: "A women's ethnic wear store migrated from ShopDeck to Shopify and redesigned in days.",
      industry: "Women's Ethnic Wear / Fashion",
      overview: ["Taneja Cloth House is a women's ethnic wear brand on Shopify, with suits, unstitched fabrics, and traditional collections. The project was a full migration and redesign from ShopDeck to Shopify, keeping the brand's identity and customer familiarity intact."],
      challenge: ["The main challenge was organizing a large catalog while keeping the store easy to shop on both desktop and mobile. Because the brand was moving from ShopDeck to Shopify, the existing identity, customer familiarity, and colour palette had to stay while the experience got more modern and refined.",
        "The client wanted a premium, easy-to-navigate, fully mobile-responsive site, and the whole migration, redesign, product setup, and customization had to be done in just 3 to 4 days."],
      approach: ["I redesigned the store mobile-first, with modern aesthetics and better product discovery. Custom Liquid sections and widgets made the homepage more interactive and conversion-focused while holding the brand's existing look.",
        "I also created custom homepage banners, featured-collection visuals, and hero images made for the brand. Every section was tuned for a cleaner browse while keeping the site fast, responsive, and easy to manage.",
        "The store kept its legacy but came out faster, better looking, and smoother to shop on every device."],
      services: ["Shopify", "ShopDeck Migration", "Custom Liquid", "Mobile-first"],
      results: [{n:"3-4d",l:"Full migration"},{n:"Mobile",l:"First"}], live: null, shots: null, next: "fragfreak" },

    "kurta-pyjama-ca": { name: "Kurta Pyjama CA", year: "2023", platform: "Shopify", mesh: "mesh-a",
      tagline: "Ethnic-wear store ranked #1 on Google in Canada for 'kurta pyjama'.",
      industry: "Ethnic Wear / Fashion / eCommerce",
      overview: ["Kurta Pyjama CA is a leading ethnic wear store serving customers across Canada, with a wide collection of kurta pyjamas, sherwanis, Indo-western outfits, and traditional menswear. I built the store and kept optimizing it so the shopping experience stays smooth while supporting the brand's long-term growth."],
      challenge: ["One of the biggest challenges was managing a large, constantly growing catalog while making sure customers could easily browse, filter, and find the right products. Since the store serves customers across Canada, clear product presentation, sizing information, and well-organized collections were essential to a smooth shopping experience.",
        "Another major focus was improving the store's organic visibility in a highly competitive market. The brand needed continuous improvements, content optimization, SEO, and conversion-focused changes to support long-term growth and lift online sales."],
      approach: ["I optimized the Shopify store with a strong focus on user experience, product organization, collection structure, and conversion-focused design. Product pages, collection pages, navigation, and the overall customer journey were refined continuously to improve usability and the shopping experience.",
        "Alongside building and managing the website, I ran on-page, technical, and content SEO to improve search visibility. Ongoing optimization, performance work, and marketing-focused improvements strengthened the brand's online presence and supported steady growth.",
        "Today the store performs well, ranks strongly in search across Canada, and has a structure that keeps scaling with the brand."],
      services: ["Shopify", "#1 Ranked", "SEO", "eCommerce"],
      results: [{n:"#1",l:"Google Canada"},{n:"↑",l:"Organic traffic"}], live: null, shots: null, next: "sundar-prem" },

    "owners-pride-healthcare": { name: "Owners Pride Healthcare", year: "2023", platform: "Shopify", mesh: "mesh-c",
      tagline: "A healthcare brand site built to feel trustworthy and clear.",
      industry: "Healthcare / eCommerce",
      overview: ["Healthcare buyers need to trust what they're reading. I built Owners Pride Healthcare on Shopify with clear product information, a credible design, and easy ways to enquire.",
        "Trust-first, with a clean path to contact and purchase."],
      did: ["Shopify store build", "Trust-led design", "Clear product information", "Enquiry flows"],
      services: ["Shopify", "Healthcare", "Trust"],
      results: [{n:"Trust",l:"First"},{n:"100%",l:"Clean build"}], live: null, shots: null, next: "blackout-lifting-club" },

    "blackout-lifting-club": { name: "Blackout Lifting Club", year: "2023", platform: "Shopify", mesh: "mesh-d",
      tagline: "A high-energy supplements and fitness store with a conversion-first product page.",
      industry: "Supplements / Fitness",
      overview: ["Blackout Lifting Club is a supplements and fitness brand with attitude. I built a bold Shopify store with high-energy visuals and a product page designed to convert cold traffic from ads.",
        "Built to look loud and sell hard."],
      did: ["Shopify design and build", "Conversion-first product page", "Ads-ready setup", "Speed optimization"],
      services: ["Shopify", "Fitness", "Ads", "CRO"],
      results: [{n:"Ads",l:"Optimized"},{n:"100%",l:"Clean build"}], live: null, shots: null, next: "trydent" },


    "trydent": { name: "Trydent", year: "2022", platform: "Shopify", mesh: "mesh-f",
      tagline: "A modern D2C store with a clean storefront ready to scale.",
      industry: "Streetwear / Fashion",
      overview: ["Trydent is a modern D2C brand that needed a store built to grow. I set it up on Shopify with a clean storefront, solid product pages, and the tracking in place to scale with paid ads.",
        "A tidy foundation that's easy to expand."],
      challenge: ["Trydent was an early-stage D2C brand, so it needed more than a good-looking store, it needed a foundation it could scale on. The challenge was setting up a clean, conversion-ready storefront with proper product pages and the tracking and structure in place so paid ads could be switched on confidently later.",
        "Everything also had to stay simple to manage so the brand could keep adding products without the site getting messy."],
      approach: ["I built Trydent on Shopify with a minimal, modern storefront, solid product pages, and a clear path to checkout. Conversion and pixel tracking were set up correctly from the start, so every ad click and sale could be measured.",
        "The store structure was kept clean and easy to manage, so the brand could keep growing the catalog without the site falling apart, and mobile was treated as the priority since most of the traffic would come from ads on phones.",
        "The result is a tidy, scalable D2C store that's ready to grow with paid traffic."],
      services: ["Shopify", "D2C", "Ads"],
      results: [{n:"Scale",l:"Ready"},{n:"100%",l:"Clean build"}], live: null, shots: null, next: "fragfreak" }
  };

  /* ---- additional projects ---- */
  PROJECTS["sundar-prem"] = { name: "Sundar Prem", year: "2023", platform: "Shopify", mesh: "mesh-f",
    tagline: "A clean Shopify store built to look good and sell.",
    industry: "Ethnic Fashion / Sarees",
    overview: ["Sundar Prem wanted a simple, trustworthy online store. I built it on Shopify with a tidy storefront and clean, fast product pages from launch.",
      "Easy to manage and ready to grow."],
    did: ["Shopify store build", "Product page design", "Clean structure", "Clean, fast build"],
    services: ["Shopify", "eCommerce", "Design"],
    results: [{n:"Clean",l:"Storefront"},{n:"Fast",l:"Page loads"}], live: null, shots: null, next: "owners-pride-healthcare" };

  /* ---- live URLs, screenshots, and next-chain ---- */
  const LIVE = {
    "fragfreak": "https://fragfreak.in/", "perfy-you": "https://perfyou.in/",
    "creative-inktales": "https://www.creativeinktales.com", "helping-life-foundation": "https://helpinglifefoundation.org",
    "poweroxx": "https://www.poweroxx.com",
    "the-funky-fitz": "https://www.thefunkyfitz.com",
    "kurta-pyjama-ca": "https://www.kurtapyjama.ca",
    "sundar-prem": "https://www.sundarprem.com", "owners-pride-healthcare": "https://www.ownerspridehealthcare.com",
    "blackout-lifting-club": "https://www.blackoutliftingclub.com",
    "trydent": "https://www.trydent.in",
    "taneja-cloth-house": "https://tanejaclothhouse.com/"
  };
  const ORDER = ["taneja-cloth-house","fragfreak","perfy-you","creative-inktales","helping-life-foundation","poweroxx","the-funky-fitz","kurta-pyjama-ca","sundar-prem","owners-pride-healthcare","blackout-lifting-club","trydent"];
  const NO_PM = new Set(["helping-life-foundation", "kurta-pyjama-ca", "sundar-prem"]);
  ORDER.forEach((slug, i) => {
    const p = PROJECTS[slug];
    if (!p) return;
    if (LIVE[slug]) p.live = LIVE[slug];
    const base = "assets/img/projects/" + slug;
    p.shots = [base + "-1.png", base + "-2.png", base + "-3.png", base + "-m.png", base + "-pm.png"];
    // these 4 have no product-mobile shot (no-shop / blank inner pages) — use home-mobile so the phone frame doesn't 404
    if (NO_PM.has(slug)) p.shots[4] = base + "-m.png";
    p.next = ORDER[(i + 1) % ORDER.length];
  });
  // Taneja shots were captured as optimized .jpg (photo-heavy store) instead of .png
  if (PROJECTS["taneja-cloth-house"]) {
    const tb = "assets/img/projects/taneja-cloth-house";
    PROJECTS["taneja-cloth-house"].shots = [tb + "-1.jpg", tb + "-2.jpg", tb + "-3.jpg", tb + "-m.jpg", tb + "-pm.jpg"];
  }
  if (PROJECTS["helping-life-foundation"]) {  // re-captured hero + mobile as optimized .jpg
    const hb = "assets/img/projects/helping-life-foundation";
    PROJECTS["helping-life-foundation"].shots = [hb + "-1.jpg", hb + "-2.png", hb + "-3.png", hb + "-m.jpg", hb + "-m.jpg"];
  }
  // re-captured clean detail screenshots (homepage + real collection + product + mobile) as optimized .jpg
  const JPG_SHOTS = ["fragfreak", "perfy-you", "creative-inktales", "poweroxx", "the-funky-fitz", "trydent", "owners-pride-healthcare", "blackout-lifting-club", "sundar-prem"];
  JPG_SHOTS.forEach((slug) => {
    if (!PROJECTS[slug]) return;
    const b = "assets/img/projects/" + slug;
    PROJECTS[slug].shots = [b + "-1.jpg", b + "-2.jpg", b + "-3.jpg", b + "-m.jpg", b + "-pm.jpg"];
  });
  if (PROJECTS["kurta-pyjama-ca"]) {  // product template renders blank headless; show collection + home-mobile only
    const kb = "assets/img/projects/kurta-pyjama-ca";
    PROJECTS["kurta-pyjama-ca"].shots = [kb + "-1.jpg", kb + "-2.jpg", "", kb + "-m.jpg", kb + "-m.jpg"];
  }

  /* ---- per-card bento meta (industry + size), projects grid only ---- */
  const PMETA = {
    "fragfreak": { ind: "beauty ecommerce", size: "feat" },
    "perfy-you": { ind: "fashion ecommerce" },
    "creative-inktales": { ind: "ecommerce" },
    "helping-life-foundation": { ind: "nonprofit", size: "wide" },
    "poweroxx": { ind: "fashion ecommerce" },
    "the-funky-fitz": { ind: "fashion ecommerce" },
    "trydent": { ind: "ecommerce" },
    "kurta-pyjama-ca": { ind: "fashion ecommerce", size: "wide" },
    "owners-pride-healthcare": { ind: "healthcare" },
    "blackout-lifting-club": { ind: "fashion ecommerce" },
    "sundar-prem": { ind: "ecommerce" },
    "taneja-cloth-house": { ind: "fashion ecommerce", size: "feat" }
  };

  /* ---- inject live screenshots + frame + view-cta into project cards ---- */
  function hydrateCards() {
    $$("a.proj-card").forEach((card) => {
      const href = card.getAttribute("href") || "";
      if (href.indexOf("p=") < 0) return;
      const slug = href.split("p=")[1].toLowerCase();
      const p = PROJECTS[slug];
      if (!p) return;
      const vis = $(".proj-visual", card);
      if (!vis) return;
      // bento meta only inside the projects bento grid
      const grid = card.closest(".proj-grid");
      if (grid && grid.classList.contains("bento") && PMETA[slug]) {
        const meta = PMETA[slug];
        if (meta.ind) card.dataset.cat = (card.dataset.cat + " " + meta.ind).trim();
        if (meta.size) card.classList.add(meta.size);
      }
      if (!p.shots || !p.shots[0]) return;
      vis.classList.add("loading");
      const img = document.createElement("img");
      img.className = "shot"; img.alt = p.name + " website preview"; img.loading = "lazy"; img.decoding = "async";
      img.onload = () => { vis.classList.remove("loading"); const lg = $(".logo", vis); if (lg) lg.style.display = "none"; };
      img.onerror = () => { if (!img.dataset.fb) { img.dataset.fb = "1"; img.src = "assets/img/projects/" + slug + "-cf.jpg"; } else if (img.dataset.fb === "1") { img.dataset.fb = "2"; img.src = p.shots[0]; } else { vis.classList.remove("loading"); img.remove(); } };
      img.src = "assets/img/projects/" + slug + "-card.jpg";
      vis.appendChild(img);
      const bar = document.createElement("div");
      bar.className = "shot-bar";
      let host = "";
      try { host = p.live ? new URL(p.live).host.replace(/^www\./, "") : ""; } catch (e) {}
      bar.innerHTML = "<i></i><i></i><i></i>" + (host ? `<b>${host}</b>` : "");
      vis.appendChild(bar);
      // headline result chip (projects bento only) — appears on hover
      if (grid && grid.classList.contains("bento") && p.results && p.results[0]) {
        const stat = document.createElement("span");
        stat.className = "proj-stat";
        stat.innerHTML = `<b>${p.results[0].n}</b> ${p.results[0].l}`;
        vis.appendChild(stat);
      }
      if (p.live) {
        const cta = document.createElement("button");
        cta.type = "button"; cta.className = "shot-cta";
        cta.innerHTML = 'Visit live site <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M7 17L17 7M9 7h8v8"/></svg>';
        cta.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); window.open(p.live, "_blank", "noopener"); });
        vis.appendChild(cta);
      }
    });
  }

  function pdHero() {
    const hero = $(".pd-hero"); if (!hero) return;
    const card = $(".pd-herocard", hero);
    if (!card || reduce || window.innerWidth < 900) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    function loop() {
      raf = null;
      cx += (tx - cx) * 0.1; cy += (ty - cy) * 0.1;
      card.style.transform = `rotateY(${(cx * 7).toFixed(2)}deg) rotateX(${(-cy * 5).toFixed(2)}deg)`;
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(loop);
    }
  }

  function projectDetail() {
    const root = $("#pd");
    if (!root) return;
    const slug = (new URLSearchParams(location.search).get("p") || "").toLowerCase();
    const p = PROJECTS[slug];
    if (!p) {
      root.innerHTML = `<div class="wrap" style="padding:6rem 0;text-align:center">
        <h1 style="font-size:2.4rem">Project not found</h1>
        <p style="color:var(--text-2);margin:1rem 0 2rem">That project doesn't exist yet.</p>
        <a class="btn btn-primary" href="projects.html">See all projects</a></div>`;
      return;
    }
    document.title = `${p.name} · ${p.platform} project by Satyam Shakkarwal`;
    // SEO: dynamic meta description + CreativeWork/BreadcrumbList schema for this case study
    (function () {
      const o = (location.origin && location.origin !== "null") ? location.origin : "";
      const ov = typeof p.overview === "string" ? p.overview : (Array.isArray(p.overview) ? p.overview.join(" ") : "");
      const desc = (ov ? ov.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 155)
        : `${p.name}, a ${p.platform} ${p.industry || "web"} project designed and built by Satyam Shakkarwal.`);
      const md = document.querySelector('meta[name="description"]'); if (md) md.setAttribute("content", desc);
      // per-project social tags so sharing a case study shows the right title / image
      const setM = (sel, val) => { const m = document.querySelector(sel); if (m) m.setAttribute("content", val); };
      const shareImg = o ? o + "/assets/img/projects/" + slug + "-cf.jpg" : "assets/img/projects/" + slug + "-cf.jpg";
      setM('meta[property="og:title"]', p.name + " · " + p.platform + " project by Satyam Shakkarwal");
      setM('meta[property="og:description"]', desc);
      setM('meta[property="og:url"]', o + "/project.html?p=" + slug);
      setM('meta[property="og:image"]', shareImg);
      setM('meta[name="twitter:image"]', shareImg);
      ldInject("ld-project", { "@context": "https://schema.org", "@graph": [
        { "@type": "CreativeWork", "@id": o + "/project.html?p=" + slug + "#work",
          "name": p.name + " · " + p.platform + " website", "headline": p.name,
          "creator": { "@id": o + "/#satyam" }, "author": { "@id": o + "/#satyam" },
          "about": p.industry || "Web design", "datePublished": p.year ? String(p.year) : undefined,
          "url": p.live || (o + "/project.html?p=" + slug),
          "image": o + "/assets/img/projects/" + slug + "-cf.jpg",
          "keywords": [p.platform, p.industry, "web development", "Satyam Shakkarwal"].filter(Boolean).join(", ") },
        { "@type": "BreadcrumbList", "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": o + "/" },
          { "@type": "ListItem", "position": 2, "name": "Projects", "item": o + "/projects.html" },
          { "@type": "ListItem", "position": 3, "name": p.name, "item": o + "/project.html?p=" + slug } ] }
      ] });
    })();
    const nx = PROJECTS[p.next];
    let prevSlug = null; for (const k in PROJECTS) { if (PROJECTS[k].next === slug) { prevSlug = k; break; } }
    const pv = prevSlug ? PROJECTS[prevSlug] : null;
    const GLOW = { "fragfreak": "rgba(64,104,170,.4)", "perfy-you": "rgba(150,92,196,.4)", "creative-inktales": "rgba(198,84,62,.42)", "helping-life-foundation": "rgba(74,166,108,.4)", "poweroxx": "rgba(96,88,206,.4)", "the-funky-fitz": "rgba(214,128,52,.42)", "trydent": "rgba(150,132,84,.44)", "kurta-pyjama-ca": "rgba(150,110,80,.42)", "sundar-prem": "rgba(190,100,132,.4)", "owners-pride-healthcare": "rgba(80,162,150,.4)", "blackout-lifting-club": "rgba(126,116,128,.42)" };
    const glow = GLOW[slug] || "var(--glow)";
    const platTag = p.platform === "Shopify" ? "shopify" : "framer";
    const tags = p.services.map((s) => {
      const cls = s === "Shopify" ? "tag shopify" : (s === "Framer" ? "tag framer" : "tag");
      return `<span class="${cls}">${s}</span>`;
    }).join("");
    let host = ""; try { host = p.live ? new URL(p.live).host.replace(/^www\./, "") : ""; } catch (e) {}
    const FULL = { "fragfreak": "fragfreak-full.jpg", "perfy-you": "perfy-you-full.jpg", "trydent": "trydent-full.jpg" };
    const isLive = !!FULL[slug];
    const heroInner = isLive
      ? `<img class="pd-live" src="assets/img/projects/${FULL[slug]}" alt="${p.name} website" loading="eager" decoding="async">`
      : ((p.shots && p.shots[0]) ? `<img class="shot" src="${p.shots[0]}" alt="${p.name} website" onerror="this.remove()">` : `<div class="mesh ${p.mesh}"></div><span class="logo">${p.name}</span>`);
    const bFrame = (src, label) => `<div class="pd-browser"><div class="shot-bar"><i></i><i></i><i></i>${host ? `<b>${host}</b>` : ""}</div><img src="${src}" alt="${p.name} ${label}" loading="lazy" decoding="async" onerror="this.closest('.pd-browser').remove()"></div>`;
    const pFrame = (src, fb) => `<div class="pd-phone"><span class="notch"></span><img src="${src}" data-fb="${fb || ""}" alt="${p.name} mobile view" loading="lazy" decoding="async" onerror="if(this.dataset.fb){this.src=this.dataset.fb;this.dataset.fb='';}else{this.closest('.pd-phone').remove();}"></div>`;
    const hasGallery = p.shots && (p.shots[1] || p.shots[2] || p.shots[4] || p.shots[3]);
    const statNum = (n) => { const m = String(n).match(/^(\d+\.?\d*)(.*)$/); return m ? `<span data-count="${m[1]}" data-suffix="${m[2]}">0</span>` : n; };

    root.innerHTML = `
      <div class="wrap">
        <div class="crumb" data-animate="fade-up"><a href="index.html">Home</a> <span>/</span> <a href="projects.html">Projects</a> <span>/</span> <span>${p.name}</span></div>
        <header class="pd-head">
          <span class="eyebrow" data-animate="fade-up">Built on ${p.platform}</span>
          <h1 data-animate="fade-up" data-delay="1">${p.name}</h1>
          <p class="pd-tagline" data-animate="fade-up" data-delay="2">${p.tagline}</p>
        </header>
        <div class="pd-hero ${isLive ? "is-live" : ""}" data-animate="zoom">
          <span class="pd-heroglow" aria-hidden="true" style="background: radial-gradient(55% 60% at 50% 42%, ${glow}, transparent 70%)"></span>
          <div class="pd-herocard">
            <div class="shot-bar"><i></i><i></i><i></i>${host ? `<b>${host}</b>` : ""}</div>
            <div class="pd-herowin">${heroInner}</div>
          </div>
        </div>
        <div class="pd-main">
          <div class="pd-content">
            ${p.overview ? `<section class="pd-sec" data-animate="fade-up"><h2>Overview</h2>${p.overview.map((t) => `<p>${t}</p>`).join("")}</section>` : ""}
            ${p.challenge ? `<section class="pd-sec" data-animate="fade-up"><h2>The challenge</h2>${p.challenge.map((t) => `<p>${t}</p>`).join("")}</section>` : ""}
            ${p.approach ? `<section class="pd-sec" data-animate="fade-up"><h2>My approach</h2>${p.approach.map((t) => `<p>${t}</p>`).join("")}</section>`
              : (p.did ? `<section class="pd-sec" data-animate="fade-up"><h2>What I did</h2><ul class="pd-do">${p.did.map((d) => `<li>${d}</li>`).join("")}</ul></section>` : "")}
            ${p.results && p.results.length ? `<div class="pd-results" data-animate="fade-up">${p.results.map((r) => `<div class="pd-stat"><div class="n">${statNum(r.n)}</div><div class="l">${r.l}</div></div>`).join("")}</div>` : ""}
          </div>
          <aside class="pd-meta">
            <div class="pd-meta-card" data-animate="fade-up" data-delay="1">
              <div class="pd-meta-row"><small>Platform</small><b>${p.platform}</b></div>
              ${p.industry ? `<div class="pd-meta-row"><small>Industry</small><b>${p.industry}</b></div>` : ""}
              <div class="pd-meta-row col"><small>Services</small><div class="pd-meta-tags">${tags}</div></div>
              ${p.year ? `<div class="pd-meta-row"><small>Year</small><b>${p.year}</b></div>` : ""}
              ${p.live ? `<a class="btn btn-primary pd-meta-cta" href="${p.live}" target="_blank" rel="noopener" data-magnetic="0.2">Visit live site <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" style="width:16px;height:16px"><path d="M7 17L17 7M9 7h8v8"/></svg></a>` : `<a class="btn btn-ghost pd-meta-cta" href="projects.html" data-magnetic="0.2">All projects</a>`}
            </div>
          </aside>
        </div>
        ${hasGallery ? `<div class="pd-gallery">
          <span class="eyebrow pd-gallery-eye" data-animate="fade-up">A closer look</span>
          <div class="pd-gallery-stage" data-animate="fade-up">
            ${p.shots[1] ? bFrame(p.shots[1], "collection page") : ""}
            <div class="pd-duo">
              ${p.shots[2] ? bFrame(p.shots[2], "product page") : ""}
              ${(p.shots[4] || p.shots[3]) ? pFrame(p.shots[4], p.shots[3]) : ""}
            </div>
          </div>
        </div>` : ""}
        <a class="pd-next-big" href="project.html?p=${p.next}" data-animate="fade-up" data-magnetic="0.08">
          <div class="pd-next-info"><small>Next project</small><h3>${nx.name} <span class="arr">→</span></h3><p>${nx.tagline}</p></div>
          <div class="pd-next-prev">${(nx.shots && nx.shots[0]) ? `<img src="${nx.shots[0]}" alt="${nx.name}" loading="lazy" decoding="async" onerror="this.remove()">` : `<span class="mesh ${nx.mesh}"></span>`}</div>
        </a>
        <div class="pd-pager" data-animate="fade-up">
          ${pv ? `<a class="pd-pager-link prev" href="project.html?p=${prevSlug}"><span class="pg-arr">←</span><span class="pg-txt"><small>Previous</small><b>${pv.name}</b></span></a>` : `<span></span>`}
          <a class="pd-pager-all" href="projects.html">All projects</a>
          <a class="pd-pager-link next" href="project.html?p=${p.next}"><span class="pg-txt"><small>Next</small><b>${nx.name}</b></span><span class="pg-arr">→</span></a>
        </div>
      </div>`;
    // re-run interactions on injected content
    splitWords(); reveal(); magnetic(); counters(); pdHero();
  }

  /* ----------  YEAR  ---------- */
  function year() { $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear())); }

  /* ----------  HERO: cursor spotlight + rotating word  ---------- */
  function heroSpot() {
    const hero = $(".hero"), spot = $(".hero-spot");
    if (!hero || !spot || reduce || window.innerWidth < 900) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left; ty = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    function loop() {
      raf = null;
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      spot.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`;
      if (Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5) raf = requestAnimationFrame(loop);
    }
  }
  function heroShow() {
    const hero = $(".hero"), stage = $(".hs-stage"), copy = $(".hero-copy");
    if (!hero || reduce || window.innerWidth < 980) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    hero.addEventListener("mousemove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(loop); });
    function loop() {
      raf = null;
      cx += (tx - cx) * 0.09; cy += (ty - cy) * 0.09;
      // whole-scene parallax: cards tilt strongest, copy drifts opposite, bg (liquid/spot) handled elsewhere
      if (stage) stage.style.transform = `rotateY(${(cx * 19).toFixed(2)}deg) rotateX(${(-cy * 14).toFixed(2)}deg)`;
      if (copy) copy.style.transform = `translate3d(${(cx * -26).toFixed(1)}px, ${(cy * -18).toFixed(1)}px, 0)`;
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(loop);
    }
  }
  function rotateWord() {
    const rot = $(".rot"); if (!rot) return;
    const bs = $$("b", rot); if (bs.length < 2 || reduce) return;
    let i = 0;
    setInterval(() => {
      i = (i + 1) % bs.length;
      bs.forEach((b) => (b.style.transform = `translateY(-${i * 100}%)`));
    }, 2300);
  }

  /* ----------  COLLAGE PARALLAX  ---------- */
  function collage() {
    const sec = $(".collage-sec");
    if (!sec) return;
    const cgs = $$(".cg", sec);
    if (reduce || !cgs.length) return;
    let raf = null, vis = false;
    function frame() {
      raf = null;
      const r = sec.getBoundingClientRect(), vh = window.innerHeight;
      const prog = ((vh / 2) - (r.top + r.height / 2)) / (vh / 2 + r.height / 2);
      const enter = 1 - Math.min(1, Math.abs(prog));          // 0 at edges -> 1 when centered
      const sc = (0.7 + 0.42 * enter).toFixed(3);             // cards clearly grow as you scroll to them
      cgs.forEach((cg) => {
        const sp = parseFloat(cg.dataset.sp) || 0;
        cg.style.setProperty("--py", (prog * sp * 240).toFixed(1) + "px");
        cg.style.setProperty("--sc", sc);
      });
    }
    function kick() { if (vis && !raf) raf = requestAnimationFrame(frame); }
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting; kick(); }, { rootMargin: "120px" });
    io.observe(sec);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
    frame();
  }

  /* ----------  CONVERGE CRAFT MOMENT  ---------- */
  function converge() {
    const sec = $(".cv-sec");
    if (!sec) return;
    const L = $(".cv-l", sec), R = $(".cv-r", sec), mid = $(".cv-mid", sec);
    if (reduce) { if (mid) { mid.style.transform = "none"; mid.style.opacity = "1"; } return; }
    let raf = null, vis = false;
    const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    function frame() {
      raf = null;
      const total = sec.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / total)) : 0;
      const e = ease(p), vw = window.innerWidth;
      if (L && R && vw > 760) {
        const W = L.offsetWidth || 320;
        const endOff = vw / 2 - W / 2 - 18;     // flush near edges (no overlap with text)
        const startOff = vw / 2 + W + 60;       // start off-screen
        const off = startOff + (endOff - startOff) * e;
        const rot = 6 * (1 - e);
        const sc = (0.88 + 0.12 * e).toFixed(3);
        L.style.transform = `translate(-50%,-50%) translateX(${(-off).toFixed(1)}px) rotate(${(-rot).toFixed(2)}deg) scale(${sc})`;
        R.style.transform = `translate(-50%,-50%) translateX(${off.toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${sc})`;
      }
      if (mid) { mid.style.transform = `translate(-50%,-50%) scale(${(0.82 + 0.2 * e).toFixed(3)})`; mid.style.opacity = (0.4 + 0.6 * e).toFixed(3); }
    }
    function kick() { if (vis && !raf) raf = requestAnimationFrame(frame); }
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting; kick(); }, { rootMargin: "100px" });
    io.observe(sec);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick, { passive: true });
    frame();
  }

  /* ----------  ROTATING DIAL PROCESS  ---------- */
  function processDial() {
    const sec = $(".dial-sec");
    if (!sec) return;
    const dial = $(".dial", sec);
    const ring = $(".dial-ring", sec);
    const nodes = $$(".dial-node", sec);
    const items = $$(".dial-item", sec);
    const dots = $$(".dial-dots i", sec);
    const dnum = $(".dnum", sec);
    const countB = $(".dial-count b", sec);
    const N = nodes.length;
    if (!N) return;
    const STEP = 40, mid = (N - 1) / 2;
    nodes.forEach((n, i) => n.style.setProperty("--a", ((i - mid) * STEP) + "deg"));
    function setR() {
      const w = dial.clientWidth, h = dial.clientHeight;
      dial.style.setProperty("--r", Math.min(h * 0.92, w * 0.46) + "px");
    }
    setR();
    if (reduce) { items.forEach((it) => it.classList.add("is-on")); return; }
    let target = 0, cur = 0, raf = null, vis = false, active = -1;
    function compute() {
      const total = sec.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -sec.getBoundingClientRect().top / total)) : 0;
      target = p * (N - 1);
    }
    function loop() {
      raf = null;
      compute();                              // read scroll geometry inside the frame (no per-event reflow)
      cur += (target - cur) * 0.12;
      if (Math.abs(target - cur) < 0.0008) cur = target;
      ring.style.transform = `rotate(${-(cur - mid) * STEP}deg)`;
      for (let i = 0; i < N; i++) {
        const ad = Math.abs((i - cur) * STEP);
        nodes[i].style.opacity = (ad < 7 ? 0 : Math.max(0, 1 - ad / 115)).toFixed(3);
      }
      const idx = Math.round(cur);
      if (idx !== active) {
        active = idx;
        items.forEach((it, i) => it.classList.toggle("is-on", i === idx));
        dots.forEach((d, i) => d.classList.toggle("on", i === idx));
        const lbl = String(idx + 1).padStart(2, "0");
        if (dnum) dnum.textContent = lbl;
        if (countB) countB.textContent = lbl;
      }
      if (vis && Math.abs(target - cur) > 0.0005) raf = requestAnimationFrame(loop);
    }
    function kick() { if (vis && !raf) raf = requestAnimationFrame(loop); }
    const io = new IntersectionObserver((es) => { vis = es[0].isIntersecting; kick(); }, {});
    io.observe(sec);
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", () => { setR(); kick(); }, { passive: true });
    compute(); cur = target; loop();
  }

  /* ----------  INIT  ---------- */
  /* ----------  SEO: canonical + JSON-LD (domain-agnostic via origin)  ---------- */
  function ldInject(id, obj) {
    let sc = document.getElementById(id);
    if (!sc) { sc = document.createElement("script"); sc.type = "application/ld+json"; sc.id = id; document.head.appendChild(sc); }
    sc.textContent = JSON.stringify(obj);
  }
  function seo() {
    const origin = (location.origin && location.origin !== "null") ? location.origin : "";
    const file = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    const page = file.indexOf(".html") < 0 ? "index.html" : file;
    // canonical (strip index.html; keep ?p= on project pages so each case study is its own URL)
    let canon = origin + location.pathname.replace(/index\.html$/, "");
    if (page === "project.html" && location.search) canon += location.search;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
    link.setAttribute("href", canon || location.href.split("?")[0]);

    const PERSON = {
      "@type": "Person", "@id": origin + "/#satyam", "name": "Satyam Shakkarwal",
      "url": origin + "/", "jobTitle": "Shopify & Framer Web Developer",
      "email": "sam.createsssss@gmail.com",
      "image": origin + "/og-image.jpg",
      "sameAs": ["https://www.instagram.com/satyam.createss/"],
      "knowsAbout": ["Shopify", "Framer", "Web Design", "Conversion Rate Optimization", "eCommerce", "UI/UX Design", "SEO"],
      "address": { "@type": "PostalAddress", "addressLocality": "Dwarka", "addressRegion": "Delhi", "addressCountry": "IN" }
    };
    const WEBSITE = {
      "@type": "WebSite", "@id": origin + "/#website", "url": origin + "/",
      "name": "Satyam Shakkarwal — Shopify & Framer Developer",
      "publisher": { "@id": origin + "/#satyam" }
    };
    const SERVICE = {
      "@type": "ProfessionalService", "@id": origin + "/#service",
      "name": "Satyam Shakkarwal — Shopify & Framer Development", "url": origin + "/",
      "image": origin + "/og-image.jpg",
      "description": "Premium Shopify stores and Framer websites focused on clean design, performance, and conversion.",
      "provider": { "@id": origin + "/#satyam" }, "areaServed": "Worldwide", "priceRange": "$$",
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "3", "bestRating": "5" }
    };
    const CRUMBS = {
      "projects.html": ["Projects", "projects.html"], "about.html": ["About", "about.html"],
      "contact.html": ["Contact", "contact.html"], "project.html": ["Projects", "projects.html"]
    };
    const items = [{ "@type": "ListItem", "position": 1, "name": "Home", "item": origin + "/" }];
    if (CRUMBS[page]) items.push({ "@type": "ListItem", "position": 2, "name": CRUMBS[page][0], "item": origin + "/" + CRUMBS[page][1] });
    const breadcrumb = { "@type": "BreadcrumbList", "@id": origin + location.pathname + "#breadcrumb", "itemListElement": items };
    const graph = [PERSON, WEBSITE, SERVICE];
    if (page !== "project.html") graph.push(breadcrumb); // project.html breadcrumb is added by projectDetail()
    ldInject("ld-base", { "@context": "https://schema.org", "@graph": graph });
  }

  /* ----------  SECTION-LEVEL LAZY MEDIA  ----------
     Marquee images (brand wall + "what I deliver") can't use loading="lazy":
     their off-screen row positions never intersect the viewport so they stay blank.
     Instead they ship as data-src (invisible to the preload scanner = fast first paint)
     and we swap in the real src when the section nears the viewport. */
  function lazyMedia() {
    const load = (root) => $$("img[data-src]", root).forEach((im) => { im.src = im.dataset.src; im.removeAttribute("data-src"); });
    const groups = $$(".deliver-sec, .logos");
    if (!groups.length) return;
    if (!("IntersectionObserver" in window)) { groups.forEach(load); return; }
    const io = new IntersectionObserver((ens) => {
      ens.forEach((en) => { if (en.isIntersecting) { load(en.target); io.unobserve(en.target); } });
    }, { rootMargin: "600px 0px" });
    groups.forEach((g) => io.observe(g));
  }

  /* ----------  FASTER NAVIGATION: warm the next page on intent  ---------- */
  function prefetchNav() {
    const seen = new Set();
    const internal = (h) => h && !/^(https?:|mailto:|tel:|#|javascript:)/i.test(h) && /(\.html|\?p=)/.test(h);
    const warm = (h) => {
      if (!internal(h) || seen.has(h)) return; seen.add(h);
      const l = document.createElement("link"); l.rel = "prefetch"; l.as = "document"; l.href = h; document.head.appendChild(l);
      try { fetch(h, { credentials: "same-origin", priority: "low" }).catch(() => {}); } catch (e) {}
    };
    $$("a[href]").forEach((a) => {
      const h = a.getAttribute("href");
      if (!internal(h)) return;
      const go = () => warm(h);
      a.addEventListener("pointerenter", go, { passive: true });
      a.addEventListener("touchstart", go, { passive: true });
    });
    // Chromium: prerender the main pages on hover/press intent -> navigation is instant
    try {
      if (HTMLScriptElement.supports && HTMLScriptElement.supports("speculationrules")) {
        const sr = document.createElement("script");
        sr.type = "speculationrules";
        sr.textContent = JSON.stringify({ prerender: [{ urls: ["index.html", "projects.html", "about.html", "contact.html"], eagerness: "moderate" }] });
        document.body.appendChild(sr);
      }
    } catch (e) {}
  }

  function init() {
    preloader();   // start the loader first so it can animate on a clear main thread
    splitWords();  // light, and reveal() depends on it
    const pauseOffscreen = function () {
      if (!("IntersectionObserver" in window)) return;
      [[$(".hero"), $(".hero")], [$(".cta-band"), $(".cta-band")]].forEach(([watch, target]) => {
        if (!watch || !target) return;
        new IntersectionObserver((es) => { target.classList.toggle("is-paused", !es[0].isIntersecting); }, { rootMargin: "80px" }).observe(watch);
      });
    };
    // Time-slice the heavy setup across frames. Previously every function ran synchronously and
    // froze the main thread for ~600ms+, which made the PRELOADER stutter. Now we run a few ms of
    // work per frame and yield, so the loader (and everything else) stays smooth.
    const tasks = [
      reveal, nav, year, contactForm, seo, projectDetail, cursor, magnetic,
      marquee, lazyMedia, prefetchNav, curvedLogos, counters, skillBars,
      scrollFx, parallax, heroSpot, rotateWord, heroShow, hydrateCards, filters,
      tilt3d, collage, aboutFX, cards3d, converge, processDial, deliverScroll,
      scrollWild, pauseOffscreen, coverflow, spine,
    ];
    let i = 0;
    (function run() {
      const t0 = performance.now();
      do { try { if (tasks[i]) tasks[i](); } catch (e) {} i++; } while (i < tasks.length && performance.now() - t0 < 6);
      if (i < tasks.length) requestAnimationFrame(run);
    })();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
