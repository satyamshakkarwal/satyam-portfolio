/* satyam.creates v2: lamp theme switch, doors, rooms, rewind timeline.
   Smoothness rules: one rAF-gated scroll handler, positions measured once
   (load/resize), scroll only toggles classes or writes one transform. */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const wide = () => innerWidth > 900;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  /* ---------- theme (lamp cord) ---------- */
  function setTheme(t) {
    root.dataset.theme = t;
    try { localStorage.setItem("satyam-theme", t); } catch (e) {}
    const m = $('meta[name="theme-color"]'); if (m) m.content = t === "dark" ? "#15120F" : "#F6F0E6";
  }
  function toggleTheme(x, y) {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    if (document.startViewTransition && !reduce) {
      root.style.setProperty("--tx", Math.round(x) + "px"); root.style.setProperty("--ty", Math.round(y) + "px");
      document.startViewTransition(() => setTheme(next));
    } else setTheme(next);
  }
  const cord = $("#cord");
  if (cord) {
    const str = $(".string", cord), knob = $(".knob", cord);
    let y0 = null, dy = 0, moved = false;
    const reset = () => { cord.classList.remove("pulling"); str.style.transform = ""; knob.style.transform = ""; y0 = null; };
    const fire = () => { const r = knob.getBoundingClientRect(); toggleTheme(r.left + r.width / 2, r.top + r.height / 2); cord.classList.add("used"); };
    cord.addEventListener("pointerdown", (e) => { y0 = e.clientY; dy = 0; moved = false; try { cord.setPointerCapture(e.pointerId); } catch (x) {} cord.classList.add("pulling"); });
    cord.addEventListener("pointermove", (e) => {
      if (y0 === null) return;
      dy = clamp(e.clientY - y0, 0, 64); if (dy > 4) moved = true;
      str.style.transform = `scaleY(${1 + dy / 46})`; knob.style.transform = `translateY(${dy}px)`;
    });
    cord.addEventListener("pointerup", () => { if (y0 === null) return; const pull = !moved || dy > 14; reset(); if (pull) fire(); });
    cord.addEventListener("pointercancel", reset);
    cord.addEventListener("click", (e) => { if (e.detail === 0) fire(); });   // keyboard Enter / Space
  }

  /* ---------- smooth scroll (laptops only; phones keep native scroll) ---------- */
  let lenis = null;
  if (fine && !reduce && typeof window.Lenis === "function") {
    try { lenis = new window.Lenis({ lerp: 0.085, smoothWheel: true, autoRaf: true }); } catch (e) { lenis = null; }
  }
  const scrollToEl = (el) => { if (!el) return; if (lenis) lenis.scrollTo(el, { duration: 1.3 }); else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); };
  $$("[data-go]").forEach((a) => a.addEventListener("click", (e) => { const t = $(a.getAttribute("href")); if (t) { e.preventDefault(); scrollToEl(t); } }));

  /* ---------- Delhi clock ---------- */
  const clock = $("#clock b");
  if (clock) {
    const f = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "numeric", minute: "2-digit", hour12: true });
    const tick = () => { clock.textContent = f.format(new Date()).toUpperCase(); };
    tick(); setInterval(tick, 20000);
  }

  /* ---------- label-maker tape ---------- */
  const tapeBox = $(".tape"), tapes = $$(".tape span");
  if (tapeBox && tapes.length) {
    const fit = () => { tapeBox.style.width = Math.max(...tapes.map((t) => t.offsetWidth)) + "px"; };
    fit(); addEventListener("resize", fit); if (document.fonts) document.fonts.ready.then(fit);
    let ti = 0;
    if (!reduce && tapes.length > 1) setInterval(() => {
      if (document.hidden) return;
      const a = tapes[ti]; ti = (ti + 1) % tapes.length; const b = tapes[ti];
      a.classList.remove("on"); a.classList.add("off"); b.classList.add("on");
      setTimeout(() => { a.style.transition = "none"; a.classList.remove("off"); void a.offsetWidth; a.style.transition = ""; }, 700);
    }, 2600);
  }

  /* ---------- run idle animations only while on screen ---------- */
  const watch = (el, cls, on) => { if (!el || !("IntersectionObserver" in window)) return; new IntersectionObserver((es) => el.classList.toggle(cls, on ? es[0].isIntersecting : !es[0].isIntersecting), { rootMargin: "60px" }).observe(el); };
  watch($(".snaps"), "live", true);
  watch($(".brands"), "paused", false);
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.15 });
    $$(".rise").forEach((el) => io.observe(el));
  } else $$(".rise").forEach((el) => el.classList.add("in"));

  /* ---------- pinned scenes: doors spotlight + rewind timeline ---------- */
  const doors = $("#doors"), spotDoors = $$(".spot-door"), spotInfo = $$(".spot-info"), dprog = $$(".doors-prog i");
  const story = $("#story"), steps = $$(".step"), list = $(".steps"), cols = $$(".year .col"), yrLabel = $(".yr-label"), yprog = $$(".yr-prog i");
  let geo = { dT: 0, dH: 1, sT: 0, sH: 1, mids: [] };
  const top = (el) => el.getBoundingClientRect().top + scrollY;
  function measure() {
    if (doors) { geo.dT = top(doors); geo.dH = Math.max(1, doors.offsetHeight - innerHeight); }
    if (story) { geo.sT = top(story); geo.sH = Math.max(1, story.offsetHeight - innerHeight); }
    if (list) geo.mids = steps.map((s) => s.offsetTop + s.offsetHeight / 2);
    last.door = last.step = -1; frame();
  }
  const last = { door: -1, all: null, step: -1 };
  function setYear(y) { String(y).split("").forEach((d, i) => { if (cols[i]) cols[i].style.transform = `translateY(${-Number(d)}em)`; }); }
  function frame() {
    ticking = false;
    if (!wide()) return;
    const y = scrollY;
    if (doors) {
      const p = clamp((y - geo.dT) / geo.dH), all = p > 0.8, i = Math.min(3, Math.floor(p / 0.2));
      if (all !== last.all) { doors.classList.toggle("all", all); last.all = all; }
      if (i !== last.door) {
        spotDoors.forEach((d, k) => { d.classList.toggle("cur", k === i); d.classList.toggle("past", k < i); });
        spotInfo.forEach((d, k) => d.classList.toggle("cur", k === i));
        dprog.forEach((d, k) => d.classList.toggle("on", k <= i));
        last.door = i;
      }
    }
    if (story && steps.length) {
      const n = steps.length, p = clamp((y - geo.sT) / geo.sH), i = Math.min(n - 1, Math.floor(p * n * 0.999));
      if (i !== last.step) {
        steps.forEach((s, k) => s.classList.toggle("on", k === i));
        if (list && geo.mids[i] != null) list.style.transform = `translateY(${-geo.mids[i]}px)`;
        setYear(steps[i].dataset.year); if (yrLabel) yrLabel.textContent = steps[i].dataset.label;
        yprog.forEach((d, k) => d.classList.toggle("on", k <= i));
        last.step = i;
      }
    }
  }
  let ticking = false;
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", onScroll, { passive: true });
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(measure, 120); });
  addEventListener("load", measure);
  if (document.fonts) document.fonts.ready.then(measure);
  measure();

  /* ---------- rooms ---------- */
  const KEYS = $$(".room").map((r) => r.dataset.key);
  let openRoom = null, pushed = false, lastFocus = null, busy = false;
  function loadImgs(room) { $$("img[data-src]", room).forEach((i) => { i.src = i.dataset.src; i.removeAttribute("data-src"); }); }
  function showSlide(room, slug) {
    const track = $(".slides", room), s = slug && $(`.slide[data-slug="${slug}"]`, room);
    if (track && s) track.scrollLeft = s.offsetLeft - track.firstElementChild.offsetLeft;
  }
  function reveal(room, slug) {
    room.classList.add("open"); room.scrollTop = 0; showSlide(room, slug);
    document.body.style.overflow = "hidden"; if (lenis) lenis.stop();
    openRoom = room; room.focus({ preventScroll: true });
  }
  function portal(door, room, done) {
    const inside = $(".inside", door) || door, r = inside.getBoundingClientRect();
    const p = document.createElement("div"); p.className = "portal";
    p.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background:${getComputedStyle(room).backgroundColor}`;
    document.body.appendChild(p);
    const s = Math.max(innerWidth / r.width, innerHeight / r.height) * 2.4;
    const dx = innerWidth / 2 - (r.left + r.width / 2), dy = innerHeight / 2 - (r.top + r.height * 0.55);
    p.animate([{ transform: "none" }, { transform: `translate(${dx}px,${dy}px) scale(${s})`, borderRadius: "0" }], { duration: 520, easing: "cubic-bezier(.7,0,.25,1)", fill: "forwards" })
      .finished.then(() => { done(); p.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, fill: "forwards" }).finished.then(() => p.remove()); });
  }
  function enter(key, door, slug, push = true) {
    const room = $("#room-" + key); if (!room || busy) return;
    loadImgs(room); lastFocus = document.activeElement;
    if (push) { history.pushState({ room: key }, "", "#" + key); pushed = true; }
    if (!door || reduce) { reveal(room, slug); return; }
    busy = true;
    door.classList.add("knock");
    setTimeout(() => { door.classList.remove("knock"); door.classList.add("open"); }, 300);
    setTimeout(() => portal(door, room, () => { reveal(room, slug); busy = false; }), 640);
  }
  function leave() {
    if (!openRoom) return;
    openRoom.classList.remove("open"); openRoom = null;
    document.body.style.overflow = ""; if (lenis) lenis.start();
    setTimeout(() => $$(".door.open").forEach((d) => d.classList.remove("open")), 200);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-room]");
    if (t) {
      e.preventDefault();
      const holder = t.closest("[data-door]"), door = holder ? $(".door", holder) : null;
      enter(t.dataset.room, door && door.offsetParent ? door : null);
      return;
    }
    if (e.target.closest(".room .back, [data-close]")) { e.preventDefault(); if (pushed) history.back(); else { history.replaceState(null, "", location.pathname); leave(); } }
  });
  addEventListener("popstate", () => {
    const k = location.hash.slice(1);
    if (KEYS.includes(k)) { if (!openRoom) enter(k, null, null, false); } else leave();
    pushed = false;
  });
  addEventListener("keydown", (e) => {
    if (!openRoom) return;
    if (e.key === "Escape") { if (pushed) history.back(); else { history.replaceState(null, "", location.pathname); leave(); } }
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { const b = $(e.key === "ArrowRight" ? ".next" : ".prev", openRoom); if (b) b.click(); }
  });
  // slide controls inside each room (native horizontal scroll = smooth on every phone)
  $$(".room").forEach((room) => {
    const track = $(".slides", room), slides = $$(".slide", room), dots = $$(".dots button", room), count = $(".count", room);
    if (!track || !slides.length) return;
    let cur = 0, tk = false;
    const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth);
    const mark = (i) => { dots.forEach((d, k) => d.classList.toggle("on", k === i)); if (count) count.textContent = String(i + 1).padStart(2, "0") + " / " + String(slides.length).padStart(2, "0"); cur = i; };
    const go = (i) => track.scrollTo({ left: clamp(i, 0, slides.length - 1) * step(), behavior: reduce ? "auto" : "smooth" });
    track.addEventListener("scroll", () => { if (tk) return; tk = true; requestAnimationFrame(() => { tk = false; const i = Math.round(track.scrollLeft / step()); if (i !== cur) mark(i); }); }, { passive: true });
    dots.forEach((d, i) => d.addEventListener("click", () => go(i)));
    const pv = $(".prev", room), nx = $(".next", room);
    if (pv) pv.addEventListener("click", () => go(cur - 1));
    if (nx) nx.addEventListener("click", () => go(cur + 1));
    mark(0);
  });
  // deep links: /#shopify opens a room, /?p=slug (old project links) opens the right room on that project
  const qs = new URLSearchParams(location.search).get("p");
  const startKey = location.hash.slice(1);
  if (qs) {
    const s = $(`.slide[data-slug="${CSS.escape(qs)}"]`);
    if (s) { const room = s.closest(".room"); history.replaceState(null, "", location.pathname + "#" + room.dataset.key); loadImgs(room); requestAnimationFrame(() => reveal(room, qs)); }
  } else if (KEYS.includes(startKey)) { const room = $("#room-" + startKey); loadImgs(room); requestAnimationFrame(() => reveal(room)); }

  /* ---------- doorbell ---------- */
  const bell = $(".bell");
  if (bell) bell.addEventListener("pointerdown", () => { bell.classList.add("ding"); setTimeout(() => bell.classList.remove("ding"), 220); });
})();
