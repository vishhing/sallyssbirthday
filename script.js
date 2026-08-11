(() => {
  const C = window.SITE_CONFIG || {};
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const name = C.friendName || "Her";
  const your = C.yourName || "Your Name";
  const yearsRaw = C.years != null ? Number(C.years) : null;
  const years = Number.isFinite(yearsRaw) ? yearsRaw : null;

  $("#gate-house").textContent = C.house || "House Stormheart";
  $("#hero-name").textContent = name;
  $("#hero-words").textContent = C.words || "Fierce. Loyal. Unbowed.";
  $("#hero-sub").textContent = years
    ? `${years} ${years === 1 ? "year" : "years"} bound by fire and loyalty, truer than any oath sworn before a heart tree.`
    : C.heroSub || "Years bound by fire and loyalty, truer than any oath sworn before a heart tree.";
  $("#footer-sign").textContent = `by ${your}, ever loyal`;
  document.title = `A Song of ${name}`;
  const canvas = $("#embers"),
    ctx = canvas.getContext("2d");
  let embers = [];
  function resize() {
    const d = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * d;
    canvas.height = innerHeight * d;
    ctx.setTransform(d, 0, 0, d, 0, 0);
    embers = Array.from({ length: innerWidth < 600 ? 28 : 55 }, () =>
      ember(true),
    );
  }
  function ember(init) {
    return {
      x: Math.random() * innerWidth,
      y: init ? Math.random() * innerHeight : innerHeight + 10,
      size: Math.random() * 1.7 + 0.4,
      speed: Math.random() * 0.65 + 0.2,
      drift: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.45 + 0.12,
      p: Math.random() * 6.28,
    };
  }
  function draw(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    embers.forEach((e, i) => {
      e.y -= e.speed;
      e.x += e.drift + Math.sin(t * 0.001 + e.p) * 0.12;
      if (e.y < -10 || e.x < -20 || e.x > innerWidth + 20)
        embers[i] = ember(false);
      ctx.beginPath();
      ctx.fillStyle = `rgba(214,174,87,${e.a})`;
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  resize();
  addEventListener("resize", resize);
  requestAnimationFrame(draw);
  const audio = $("#audio-player"),
    mini = $("#mini-player"),
    miniToggle = $("#mini-toggle"),
    miniIcon = $("#mini-icon");
  let current = 0;
  function show() {
    mini.classList.add("visible");
  }
  function ui() {
    const t = (C.tracks || [])[current];
    if (t) {
      $("#mini-title").textContent = t.title || "Untitled";
      $("#mini-artist").textContent = t.artist || "Unknown artist";
    }
    $$(".track-item").forEach((x, i) => {
      $(".track-play", x).textContent =
        i === current && !audio.paused ? "❚❚" : "▶";
      x.classList.toggle("active", i === current);
    });
  }
  function load(i, play = false) {
    const ts = C.tracks || [];
    if (!ts.length) {
      show();
      return;
    }
    current = (i + ts.length) % ts.length;
    audio.src = ts[current].src;
    audio.load();
    show();
    ui();
    if (play) audio.play().catch(() => {});
  }
  $("#gate-btn").addEventListener("click", () => {
    document.body.classList.add("entered");
    if ((C.tracks || []).length) load(0, true);
    else show();
  });
  miniToggle.addEventListener("click", () => {
    if (!audio.src) {
      load(0, true);
      return;
    }
    audio.paused ? audio.play().catch(() => {}) : audio.pause();
  });
  audio.addEventListener("play", () => {
    miniIcon.textContent = "❚❚";
    ui();
  });
  audio.addEventListener("pause", () => {
    miniIcon.textContent = "▶";
    ui();
  });
  audio.addEventListener("ended", () => {
    if ((C.tracks || []).length > 1) load(current + 1, true);
  });
  const grid = $("#council-grid"),
    photos = C.photos || [];
  if (!photos.length)
    grid.innerHTML =
      '<div class="empty-state">Add photos to SITE_CONFIG.photos to populate the royal archives.</div>';
  else
    photos.forEach((p, i) => {
      const card = document.createElement("article");
      card.className = "memory-card reveal";
      card.innerHTML = `<div class="memory-card-inner"><div class="memory-front"><img src="${esc(p.src)}" alt="${esc(p.caption || name)}" loading="lazy"><div class="flip-hint">↻</div><div class="memory-caption">${esc(p.caption || "A memory worth keeping")}</div></div><div class="memory-back"><span class="back-number">CHRONICLE ${roman(i + 1)}</span><h3>${esc(name)}</h3><p>${esc(p.caption || "A memory worth keeping.")}</p></div></div>`;
      card.onclick = () => card.classList.toggle("is-flipped");
      grid.appendChild(card);
    });
  const letter = $("#letter-body"),
    sign = $("#letter-sign"),
    seal = $("#seal"),
    scroll = $("#scroll");
  letter.textContent = C.letter || "";
  sign.textContent = your;
  seal.onclick = () => {
    scroll.classList.add("open");
    setTimeout(
      () => scroll.scrollIntoView({ behavior: "smooth", block: "center" }),
      650,
    );
  };
  const list = $("#track-list"),
    tracks = C.tracks || [];
  if (!tracks.length)
    list.innerHTML =
      '<li class="track-item"><div class="track-number">—</div><div class="track-info"><strong>The bard is waiting.</strong><span>Add tracks in config.js</span></div><div class="track-play">♪</div></li>';
  else
    tracks.forEach((t, i) => {
      const li = document.createElement("li");
      li.className = "track-item reveal";
      li.innerHTML = `<div class="track-number">${String(i + 1).padStart(2, "0")}</div><div class="track-info"><strong>${esc(t.title || "Untitled")}</strong><span>${esc(t.artist || "Unknown artist")}</span></div><div class="track-play">▶</div>`;
      li.onclick = () =>
        current === i && !audio.paused ? audio.pause() : load(i, true);
      list.appendChild(li);
    });
  const obs = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  $$(".reveal").forEach((e, i) => {
    e.style.transitionDelay = Math.min(i * 70, 420) + "ms";
    obs.observe(e);
  });
  $(".hero-scroll-cue").onclick = () =>
    $("#council")?.scrollIntoView({ behavior: "smooth" });
  function roman(n) {
    const v = [
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let r = "";
    v.forEach(([a, b]) => {
      while (n >= a) {
        r += b;
        n -= a;
      }
    });
    return r;
  }
  function esc(v) {
    return String(v)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
