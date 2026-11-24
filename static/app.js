(() => {
  "use strict";

  const boot = document.getElementById("bootScreen");
  const terminal = document.getElementById("terminalLines");
  const progress = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const skip = document.getElementById("skipBoot");

  // Строки терминала приходят из Flask (app.py -> BOOT_LINES)
  let lines = [];
  try { lines = JSON.parse(boot.dataset.lines || "[]"); } catch (_) {}
  if (!lines.length) lines = [">>> website.launch()  # SUCCESS"];

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let seen = false;
  try { seen = sessionStorage.getItem("bootSeen") === "1"; } catch (_) {}

  let finished = false;
  let index = 0;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll(".skill-track i").forEach((bar) => {
        bar.style.width = bar.dataset.level + "%";
      });
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  function revealSite() {
    if (finished) return;
    finished = true;
    try { sessionStorage.setItem("bootSeen", "1"); } catch (_) {}
    document.body.classList.remove("booting");
    boot.classList.add("done");
    document.querySelectorAll(".reveal").forEach((el, i) => {
      setTimeout(() => observer.observe(el), Math.min(i * 90, 700));
    });
    setTimeout(() => boot.remove(), 900);
    setTimeout(startHero, 500);
  }

  function addLine() {
    if (finished) return;
    if (index >= lines.length) {
      progress.style.width = "100%";
      progressText.textContent = "100%";
      setTimeout(revealSite, 550);
      return;
    }
    const line = document.createElement("div");
    line.className = "terminal-line";
    line.textContent = lines[index];
    terminal.appendChild(line);
    index += 1;
    const percent = Math.round((index / lines.length) * 100);
    progress.style.width = percent + "%";
    progressText.textContent = percent + "%";
    setTimeout(addLine, 430);
  }

  if (reduceMotion || seen) {
    // Повторным посетителям и при «уменьшении анимации» интро не показываем
    boot.classList.add("done");
    boot.remove();
    finished = true;
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
    setTimeout(startHero, 100);
  } else {
    document.body.classList.add("booting");
    setTimeout(addLine, 350);
    skip.addEventListener("click", revealSite);
    skip.focus({ preventScroll: true });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" || e.key === "Enter") revealSite();
    });
  }

  // Мобильное меню
  const toggle = document.getElementById("menuToggle");
  const links = document.querySelector(".nav-links");
  toggle.addEventListener("click", () => {
    const opened = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(opened));
  });
  links.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));

  // ---------- Hero: печать Python-кода и смена ролей ----------
  const codeEl = document.getElementById("codeBody");
  const roleEl = document.getElementById("roleText");
  let heroStarted = false;

  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function highlight(text) {
    return esc(text).replace(
      /("[^"\n]*"?)|\b(class|def|return)\b|(?<=def\s)(\w+)|\b(print|mission)\b|\b(\d+)\b|\b([A-Z][A-Za-z]+)\b/g,
      (m, str, kw, def, fn, num, cls) =>
        str ? `<span class="tk-str">${m}</span>`
        : kw ? `<span class="tk-kw">${m}</span>`
        : def || fn ? `<span class="tk-fn">${m}</span>`
        : num ? `<span class="tk-num">${m}</span>`
        : cls ? `<span class="tk-cls">${m}</span>` : m
    );
  }

  function startHero() {
    if (heroStarted) return;
    heroStarted = true;

    if (codeEl) {
      let code = [];
      try { code = JSON.parse(codeEl.dataset.code || "[]"); } catch (_) {}
      const full = code.join("\n");
      if (reduceMotion) {
        codeEl.innerHTML = highlight(full);
      } else {
        let n = 0;
        const tick = () => {
          n += 1;
          codeEl.innerHTML = highlight(full.slice(0, n)) + '<span class="role-caret"></span>';
          if (n < full.length) setTimeout(tick, full[n - 1] === "\n" ? 140 : 28);
          else codeEl.innerHTML = highlight(full);
        };
        tick();
      }
    }

    if (roleEl && !reduceMotion) {
      let roles = [];
      try { roles = JSON.parse(roleEl.dataset.roles || "[]"); } catch (_) {}
      if (roles.length > 1) {
        let r = 0, pos = roles[0].length, deleting = true;
        const loop = () => {
          const word = roles[r];
          if (deleting) { pos -= 1; } else { pos += 1; }
          roleEl.textContent = word.slice(0, pos);
          let delay = deleting ? 45 : 85;
          if (!deleting && pos === word.length) { deleting = true; delay = 1800; }
          else if (deleting && pos === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
          setTimeout(loop, delay);
        };
        setTimeout(loop, 1800);
      }
    }
  }

  // ---------- Счётчики в статистике ----------
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count) || 0;
        if (reduceMotion) { el.textContent = target; return; }
        const start = performance.now(), dur = 1100;
        const step = (now) => {
          const t = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll(".stats").forEach((el) => counterObserver.observe(el));

  // ---------- Свечение карточек за курсором ----------
  document.querySelectorAll(".project-card").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  // ---------- Прогресс прокрутки и свечение за курсором ----------
  const bar = document.getElementById("scrollProgress");
  const glow = document.getElementById("cursorGlow");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const h = document.documentElement.scrollHeight - innerHeight;
      if (bar) bar.style.width = (h > 0 ? (scrollY / h) * 100 : 0) + "%";
      document.body.style.setProperty("--dim", Math.min(scrollY / (innerHeight * 0.7), 1).toFixed(3));
      ticking = false;
    });
  }, { passive: true });
  if (glow && !reduceMotion) {
    window.addEventListener("pointermove", (e) => {
      glow.style.transform = `translate3d(${e.clientX}px,${e.clientY}px,0)`;
    }, { passive: true });
  }

  // Видео-фон: не тратим батарею, пока вкладка скрыта
  const video = document.querySelector(".bg-video");
  if (video) {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) video.pause();
      else video.play().catch(() => {});
    });
  }
})();
