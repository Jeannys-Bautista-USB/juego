/* ============================================================
   Iterando por mi vida — interacciones de la página
   ============================================================ */
(() => {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n, d = 3) => {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) >= 1e5) return n.toExponential(2);
    return Number(n.toFixed(d)).toString();
  };

  /* ---------------------------------------------------------
     1. Cielo de estrellas
     --------------------------------------------------------- */
  (function estrellas() {
    const canvas = $("#estrellas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    let lista = [];

    const crear = () => {
      lista = [];
      const cantidad = Math.round(clamp((w * h) / 14000, 60, 180));
      for (let i = 0; i < cantidad; i++) {
        lista.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.4 + 0.3,
          fase: Math.random() * Math.PI * 2,
          vel: 0.4 + Math.random() * 1.6,
          deriva: (Math.random() - 0.5) * 0.05,
        });
      }
    };

    const medir = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      crear();
    };

    let t = 0;
    const dibujar = () => {
      ctx.clearRect(0, 0, w, h);
      t += 0.016;
      for (const s of lista) {
        const a = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(t * s.vel + s.fase));
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = s.r > 1.1 ? "#dcd0ff" : "#b7a9ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        s.x += s.deriva;
        if (s.x < -2) s.x = w + 2;
        if (s.x > w + 2) s.x = -2;
      }
      ctx.globalAlpha = 1;
      if (!reduceMotion) requestAnimationFrame(dibujar);
    };

    medir();
    window.addEventListener("resize", medir, { passive: true });
    dibujar();
  })();

  /* ---------------------------------------------------------
     2. Navegación, scroll y aparición
     --------------------------------------------------------- */
  (function navegacion() {
    const nav = $("#nav");
    const arriba = $("#btnArriba");
    const enlaces = $$(".nav-links a[href^='#']");
    const secciones = enlaces
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter(Boolean);

    const alScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle("compacta", y > 40);
      arriba.classList.toggle("visible", y > 700);

      let actual = null;
      for (const sec of secciones) {
        if (sec.getBoundingClientRect().top <= 140) actual = sec.id;
      }
      enlaces.forEach((a) =>
        a.classList.toggle("activo", a.getAttribute("href") === "#" + actual)
      );
    };

    window.addEventListener("scroll", alScroll, { passive: true });
    alScroll();

    arriba.addEventListener("click", () =>
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })
    );

    // Aparición suave de los bloques
    const bloques = $$(".seccion .contenedor > *, .hero-contenido > *");
    bloques.forEach((b) => b.classList.add("revelar"));
    if ("IntersectionObserver" in window) {
      const obs = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              obs.unobserve(e.target);
            }
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );
      bloques.forEach((b) => obs.observe(b));
    } else {
      bloques.forEach((b) => b.classList.add("visible"));
    }

    // Parallax suave de la portada
    const fondo = $(".hero-fondo");
    if (fondo && !reduceMotion) {
      window.addEventListener(
        "pointermove",
        (e) => {
          if (window.scrollY > window.innerHeight) return;
          const dx = (e.clientX / window.innerWidth - 0.5) * 14;
          const dy = (e.clientY / window.innerHeight - 0.5) * 10;
          fondo.style.transform = `scale(1.06) translate(${dx}px, ${dy}px)`;
        },
        { passive: true }
      );
    }
  })();

  /* ---------------------------------------------------------
     3. Música
     --------------------------------------------------------- */
  (function musica() {
    const boton = $("#btnMusica");
    const audio = $("#audioMusica");
    if (!boton || !audio) return;
    audio.volume = 0.35;

    const pintar = () => {
      const activa = !audio.paused;
      boton.setAttribute("aria-pressed", String(activa));
      $(".texto-musica", boton).textContent = activa ? "Sonando" : "Música";
    };

    boton.addEventListener("click", async () => {
      if (audio.paused) {
        try {
          await audio.play();
        } catch (e) {
          /* el navegador puede bloquearlo; no pasa nada */
        }
      } else {
        audio.pause();
      }
      pintar();
    });

    audio.addEventListener("play", pintar);
    audio.addEventListener("pause", pintar);
    pintar();
  })();

  /* ---------------------------------------------------------
     4. Pestañas de controles
     --------------------------------------------------------- */
  $$(".pestana").forEach((tab) => {
    tab.addEventListener("click", () => {
      const cual = tab.dataset.tab;
      $$(".pestana").forEach((t) => {
        const activa = t === tab;
        t.classList.toggle("activa", activa);
        t.setAttribute("aria-selected", String(activa));
      });
      $$(".tab-panel").forEach((p) =>
        p.classList.toggle("oculto", p.dataset.panel !== cual)
      );
    });
  });

  /* ---------------------------------------------------------
     5. Recorrido por las puertas
     --------------------------------------------------------- */
  (function recorrido() {
    const bruja = $("#fichaBruja");
    const parca = $("#fichaParca");
    const boton = $("#btnPuerta");
    const reiniciar = $("#btnReiniciarRecorrido");
    const texto = $("#recorridoTexto");
    const salas = $$(".sala");

    const centros = [10, 30, 50, 70, 90];
    let paso = 0;

    const textos = [
      "Estás en el <strong>Mundo 1</strong>. La Parca todavía no te ve.",
      "Cruzaste la <strong>primera puerta</strong>. La Parca aparece detrás tuyo, a unos 80 px.",
      "Segunda puerta. Cambiaste de mundo y ella volvió a aparecer a tu espalda.",
      "Tercera puerta. La ventaja es corta: si caminás, te alcanza.",
      "¡Llegaste a la <strong>salida</strong>! Ganaste… por ahora.",
    ];

    const pintar = () => {
      bruja.style.left = centros[paso] + "%";
      parca.style.left = centros[Math.max(0, paso - 1)] + "%";
      parca.classList.toggle("visible", paso > 0);
      texto.innerHTML = textos[paso];
      salas.forEach((s, i) => {
        s.classList.toggle("activa", i === paso);
        s.classList.toggle("final", i === salas.length - 1);
      });
      boton.textContent = paso >= 4 ? "Volver a empezar" : "Cruzar la puerta →";
    };

    const avanzar = () => {
      if (paso >= 4) {
        paso = 0;
      } else {
        paso++;
        parca.classList.remove("asustando");
        void parca.offsetWidth;
        parca.classList.add("asustando");
      }
      pintar();
    };

    boton.addEventListener("click", avanzar);
    reiniciar.addEventListener("click", () => {
      paso = 0;
      pintar();
    });

    // Al tocar una sala, saltar hasta ella
    salas.forEach((s, i) => {
      s.addEventListener("click", () => {
        paso = i;
        pintar();
      });
      s.style.cursor = "pointer";
      s.setAttribute("role", "button");
      s.setAttribute("tabindex", "0");
      s.setAttribute("aria-label", "Ir al " + s.textContent.trim());
      s.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          paso = i;
          pintar();
        }
      });
    });

    pintar();
  })();

  /* ---------------------------------------------------------
     6. Gráfico de Newton-Raphson
     --------------------------------------------------------- */
  const FUNCIONES = {
    cuadratica: {
      nombre: "x² − 4",
      f: (x) => x * x - 4,
      df: (x) => 2 * x,
      xmin: -3.4,
      xmax: 4.2,
      x0: 3,
      raiz: 2,
      nota: "La raíz es x = 2, porque 2² − 4 = 0.",
    },
    cubica: {
      nombre: "x³ − 2x − 5",
      f: (x) => x * x * x - 2 * x - 5,
      df: (x) => 3 * x * x - 2,
      xmin: -0.4,
      xmax: 3.2,
      x0: 2.9,
      raiz: 2.0945514815,
      nota: "La raíz es x ≈ 2,0946, un número que no tiene forma linda.",
    },
    coseno: {
      nombre: "cos(x) − x",
      f: (x) => Math.cos(x) - x,
      df: (x) => -Math.sin(x) - 1,
      xmin: -1.2,
      xmax: 3.1,
      x0: 2.7,
      raiz: 0.7390851332,
      nota: "La raíz es x ≈ 0,7391, el punto donde cos(x) = x.",
    },
  };

  class NewtonPlot {
    constructor(canvas, opciones) {
      this.canvas = canvas;
      this.ctx = canvas.getContext("2d");
      this.op = opciones;
      this.margen = { l: 52, r: 20, t: 22, b: 38 };
      this.xn = opciones.x0;
      this.historial = [];
      this.iter = 0;
      this.anim = null;
      this.auto = null;
      this.estado = "listo";
      this.w = 0;
      this.h = 0;
      this.dpr = 1;
      this.ultimo = null;
      this._raf = null;

      this.medir();
      if ("ResizeObserver" in window) {
        new ResizeObserver(() => this.medir()).observe(canvas.parentElement);
      } else {
        window.addEventListener("resize", () => this.medir());
      }

      this.reiniciar(opciones.x0);

      canvas.addEventListener("pointerdown", (e) => this._puntero(e));
      canvas.addEventListener("pointermove", (e) => {
        if (e.buttons > 0) this._puntero(e);
      });
    }

    medir() {
      const rect = this.canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.w = rect.width;
      this.h = rect.height;
      this.canvas.width = Math.round(this.w * this.dpr);
      this.canvas.height = Math.round(this.h * this.dpr);
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.dibujar();
    }

    _area() {
      return {
        x: this.margen.l,
        y: this.margen.t,
        w: Math.max(10, this.w - this.margen.l - this.margen.r),
        h: Math.max(10, this.h - this.margen.t - this.margen.b),
      };
    }

    _rangoY() {
      const { xmin, xmax } = this.op;
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i <= 80; i++) {
        const x = xmin + ((xmax - xmin) * i) / 80;
        const y = this.op.f(x);
        if (isFinite(y)) {
          min = Math.min(min, y);
          max = Math.max(max, y);
        }
      }
      if (!isFinite(min) || !isFinite(max)) return [-1, 1];
      const pad = (max - min) * 0.18 + 0.001;
      return [min - pad, max + pad];
    }

    _mapa() {
      const a = this._area();
      const [ymin, ymax] = this._rangoY();
      const { xmin, xmax } = this.op;
      return {
        ...a,
        xmin,
        xmax,
        ymin,
        ymax,
        px: (x) => a.x + ((x - xmin) / (xmax - xmin)) * a.w,
        py: (y) => a.y + a.h - ((y - ymin) / (ymax - ymin)) * a.h,
        mx: (px) => xmin + ((px - a.x) / a.w) * (xmax - xmin),
      };
    }

    reiniciar(x0) {
      this.xn = x0;
      this.historial = [];
      this.iter = 0;
      this.anim = null;
      this.estado = "listo";
      this.ultimo = null;
      this._filaPintada = 0;
      this.detenerAuto();
      this.dibujar();
      this._avisar();
    }

    _pasoPaso() {
      const f = this.op.f(this.xn);
      const df = this.op.df(this.xn);
      if (!isFinite(f) || !isFinite(df)) return { ok: false, motivo: "fuera" };
      if (Math.abs(df) < 1e-9) return { ok: false, motivo: "derivada" };
      const siguiente = this.xn - f / df;
      if (!isFinite(siguiente) || Math.abs(siguiente) > 1e6)
        return { ok: false, motivo: "escapo" };
      return { ok: true, f, df, siguiente };
    }

    paso() {
      if (this.anim) return false;
      const r = this._pasoPaso();
      if (!r.ok) {
        this.estado = r.motivo;
        this._avisar();
        this.dibujar();
        this.detenerAuto();
        return false;
      }

      const desde = { x: this.xn, y: r.f };
      const hasta = { x: r.siguiente, y: 0 };
      const duracion = reduceMotion ? 0 : 460;

      const terminar = () => {
        this.xn = r.siguiente;
        this.iter += 1;
        this.historial.push({ x: desde.x, y: desde.y, n: this.iter });
        if (this.historial.length > 40) this.historial.shift();
        this.ultimo = { ...r, desde, hasta, n: this.iter };
        this.estado = Math.abs(r.f) < 1e-7 ? "listo" : "paso";
        this.anim = null;
        this.dibujar();
        this._avisar();
      };

      if (!duracion) {
        terminar();
        return true;
      }

      this.anim = { desde, hasta, t: 0, duracion, terminar };
      const inicio = performance.now();
      const animar = (ahora) => {
        if (!this.anim) return;
        const t = clamp((ahora - inicio) / duracion, 0, 1);
        this.anim.t = t;
        this.dibujar();
        if (t < 1) {
          this._raf = requestAnimationFrame(animar);
        } else {
          const fin = this.anim;
          this.anim = null;
          fin.terminar();
        }
      };
      this._raf = requestAnimationFrame(animar);
      return true;
    }

    autoOn() {
      if (this.auto) return;
      this.auto = setInterval(() => {
        const r = this._pasoPaso();
        if (!r.ok || Math.abs(r.f) < 1e-7 || this.iter > 30) {
          this.detenerAuto();
          return;
        }
        this.paso();
      }, reduceMotion ? 120 : 820);
      this._avisar();
    }

    detenerAuto() {
      if (this.auto) {
        clearInterval(this.auto);
        this.auto = null;
        this._avisar();
      }
    }

    alternarAuto() {
      if (this.auto) this.detenerAuto();
      else this.autoOn();
    }

    _puntero(e) {
      if (this.anim) return;
      const rect = this.canvas.getBoundingClientRect();
      const m = this._mapa();
      const x = m.mx(clamp(e.clientX - rect.left, m.x, m.x + m.w));
      this.reiniciar(Number(x.toFixed(4)));
      const pista = $("#pistaCanvas");
      if (pista) pista.classList.add("oculta");
    }

    _avisar() {
      if (typeof this.op.onChange === "function") {
        this.op.onChange(this);
      }
    }

    estadoTexto() {
      const f = this.op.f(this.xn);
      const df = this.op.df(this.xn);
      const error = Math.abs(f);
      if (this.estado === "derivada")
        return { clase: "alerta", texto: "La tangente quedó horizontal (f′(x) = 0). Desde acá el método no sabe para dónde ir: probá otro punto de partida." };
      if (this.estado === "escapo")
        return { clase: "alerta", texto: "El método se fue demasiado lejos. Probá arrancar más cerca de la raíz." };
      if (error < 1e-7)
        return { clase: "ok", texto: `¡Llegó! f(x) ≈ 0, así que la raíz está en x = ${fmt(this.xn, 6)}.` };
      if (this.iter === 0)
        return { clase: "", texto: "Elegí un punto y dale un paso. Mirá cómo la tangente corta el eje." };
      return { clase: "", texto: `Vas por el paso ${this.iter}. El error es ${fmt(error, 4)}; cuanto más chico, más cerca de la raíz.` };
    }

    dibujar() {
      const ctx = this.ctx;
      if (!this.w || !this.h) return;
      const m = this._mapa();
      const { f, df } = this.op;

      ctx.clearRect(0, 0, this.w, this.h);

      // fondo
      const grad = ctx.createLinearGradient(0, 0, 0, this.h);
      grad.addColorStop(0, "rgba(139,92,246,0.10)");
      grad.addColorStop(1, "rgba(4,2,10,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, this.w, this.h);

      // grilla
      const pasoX = this._pasoBonito((m.xmax - m.xmin) / 6);
      const pasoY = this._pasoBonito((m.ymax - m.ymin) / 5);
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(180,150,255,0.10)";
      ctx.font = "11px ui-monospace, Consolas, monospace";
      ctx.fillStyle = "rgba(183,169,214,0.75)";

      for (let x = Math.ceil(m.xmin / pasoX) * pasoX; x <= m.xmax; x += pasoX) {
        const px = m.px(x);
        ctx.beginPath();
        ctx.moveTo(px, m.y);
        ctx.lineTo(px, m.y + m.h);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillText(fmt(x, 1), px, m.y + m.h + 16);
      }
      for (let y = Math.ceil(m.ymin / pasoY) * pasoY; y <= m.ymax; y += pasoY) {
        const py = m.py(y);
        ctx.beginPath();
        ctx.moveTo(m.x, py);
        ctx.lineTo(m.x + m.w, py);
        ctx.stroke();
        ctx.textAlign = "right";
        ctx.fillText(fmt(y, 1), m.x - 8, py + 4);
      }

      // ejes
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 1.4;
      if (m.ymin < 0 && m.ymax > 0) {
        const y0 = m.py(0);
        ctx.beginPath();
        ctx.moveTo(m.x, y0);
        ctx.lineTo(m.x + m.w, y0);
        ctx.stroke();
      }
      if (m.xmin < 0 && m.xmax > 0) {
        const x0 = m.px(0);
        ctx.beginPath();
        ctx.moveTo(x0, m.y);
        ctx.lineTo(x0, m.y + m.h);
        ctx.stroke();
      }

      // etiquetas de ejes
      ctx.fillStyle = "rgba(183,169,214,0.9)";
      ctx.textAlign = "left";
      ctx.font = "12px ui-monospace, Consolas, monospace";
      ctx.fillText("x", m.x + m.w - 12, m.py(0) - 8);
      ctx.fillText("f(x)", m.px(0) + 8, m.y + 12);

      // curva
      ctx.beginPath();
      ctx.strokeStyle = "#38e8ff";
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "rgba(56,232,255,0.55)";
      ctx.shadowBlur = 12;
      let primero = true;
      for (let i = 0; i <= 400; i++) {
        const x = m.xmin + ((m.xmax - m.xmin) * i) / 400;
        const y = f(x);
        if (!isFinite(y)) continue;
        const px = m.px(x);
        const py = m.py(clamp(y, m.ymin - 10, m.ymax + 10));
        if (primero) {
          ctx.moveTo(px, py);
          primero = false;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // raíz
      if (m.xmin <= this.op.raiz && this.op.raiz <= m.xmax) {
        const rx = m.px(this.op.raiz);
        const ry = m.py(0);
        ctx.strokeStyle = "rgba(134,239,172,0.8)";
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx, m.y + m.h);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#86efac";
        ctx.beginPath();
        ctx.arc(rx, ry, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = "11px ui-monospace, Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText("raíz", rx, m.y + m.h - 6);
      }

      // historial
      for (let i = 0; i < this.historial.length; i++) {
        const h = this.historial[i];
        const px = m.px(h.x);
        const py = m.py(clamp(h.y, m.ymin, m.ymax));
        const a = 0.25 + 0.6 * (i / Math.max(1, this.historial.length));
        ctx.fillStyle = `rgba(252,211,77,${a})`;
        ctx.beginPath();
        ctx.arc(px, py, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // punto actual y tangente
      const fx = f(this.xn);
      const dfx = df(this.xn);
      const px = m.px(this.xn);
      const py = m.py(clamp(fx, m.ymin - 10, m.ymax + 10));

      // vertical punteada (el error)
      ctx.strokeStyle = "rgba(232,121,249,0.5)";
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px, m.py(0));
      ctx.stroke();
      ctx.setLineDash([]);

      if (isFinite(dfx) && Math.abs(dfx) > 1e-9) {
        const siguiente = this.xn - fx / dfx;
        const tx = m.px(siguiente);
        const ty = m.py(0);
        // tangente extendida
        const dx = (siguiente - this.xn) * 1.35;
        const x1 = this.xn - dx;
        const x2 = this.xn + dx;
        ctx.strokeStyle = "rgba(251,113,133,0.85)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(m.px(x1), m.py(clamp(fx + dfx * (x1 - this.xn), m.ymin - 50, m.ymax + 50)));
        ctx.lineTo(m.px(x2), m.py(clamp(fx + dfx * (x2 - this.xn), m.ymin - 50, m.ymax + 50)));
        ctx.stroke();

        // caída al eje
        ctx.fillStyle = "#fb7185";
        ctx.beginPath();
        ctx.arc(tx, ty, 4, 0, Math.PI * 2);
        ctx.fill();

        // flecha de la caída
        ctx.strokeStyle = "rgba(251,113,133,0.6)";
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = "11px ui-monospace, Consolas, monospace";
        ctx.fillStyle = "rgba(251,113,133,0.95)";
        ctx.textAlign = "left";
        ctx.fillText("x n+1", tx + 6, ty - 8);
      }

      // punto actual
      ctx.shadowColor = "rgba(252,211,77,0.9)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#fcd34d";
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#1a0f2e";
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 12px ui-monospace, Consolas, monospace";
      ctx.fillStyle = "#fcd34d";
      ctx.textAlign = "left";
      ctx.fillText("x n", px + 9, py - 9);

      // animación del paso
      if (this.anim) {
        const t = this.anim.t;
        const ax = this.anim.desde.x + (this.anim.hasta.x - this.anim.desde.x) * t;
        const ay = this.anim.desde.y + (this.anim.hasta.y - this.anim.desde.y) * t;
        ctx.fillStyle = "rgba(255,255,255,0.95)";
        ctx.shadowColor = "rgba(255,255,255,0.9)";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(m.px(ax), m.py(clamp(ay, m.ymin, m.ymax)), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    _pasoBonito(bruto) {
      const exp = Math.floor(Math.log10(Math.max(bruto, 1e-9)));
      const base = bruto / Math.pow(10, exp);
      let n = 1;
      if (base > 5) n = 10;
      else if (base > 2) n = 5;
      else if (base > 1) n = 2;
      return n * Math.pow(10, exp);
    }
  }

  (function laboratorio() {
    const canvas = $("#graficoNewton");
    if (!canvas) return;

    const datos = {
      xn: $("#datoXn"),
      f: $("#datoF"),
      df: $("#datoDf"),
      error: $("#datoError"),
      iter: $("#datoIter"),
      estado: $("#datoEstado"),
      tabla: $("#cuerpoTabla"),
      btnAuto: $("#btnAuto"),
      btnPaso: $("#btnPaso"),
      btnReiniciar: $("#btnReiniciarLab"),
    };

    const grimorio = {
      strip: $("#grimorioStrip"),
      narracion: $("#grimorioNarracion"),
      pasos: $$("#grimorioPasos li"),
      btn: $("#btnGrimorio"),
    };

    let clave = "cuadratica";
    let secuencia = 0;

    const detenerSecuencia = () => {
      secuencia += 1;
      if (grimorio.strip) grimorio.strip.classList.remove("calculando");
    };

    const marcarPasos = (hechos) => {
      grimorio.pasos.forEach((li) => li.classList.toggle("hecho", hechos));
    };

    const narrar = (plot) => {
      if (!grimorio.narracion) return;
      const f = plot.op.f(plot.xn);
      const df = plot.op.df(plot.xn);
      const error = Math.abs(f);

      if (plot.iter === 0 && !plot.ultimo) {
        grimorio.narracion.innerHTML =
          "El grimorio leyó <span class=\"mat\">x₀ = " + fmt(plot.xn, 5) + "</span>. " +
          "En la curva, <span class=\"mat\">f(x₀) = " + fmt(f, 5) + "</span>. " +
          "Todavía no trazó la tangente: dale <strong>Un paso</strong> o usá " +
          "<strong>Recorrer las iteraciones</strong>.";
        marcarPasos(false);
      } else if (plot.ultimo && plot.ultimo.n === plot.iter) {
        const u = plot.ultimo;
        const nuevoError = Math.abs(plot.op.f(u.hasta.x));
        grimorio.narracion.innerHTML =
          "Paso <strong>" + u.n + "</strong>: el grimorio leyó " +
          "<span class=\"mat\">x<sub>n</sub> = " + fmt(u.desde.x, 5) + "</span>, calculó " +
          "<span class=\"mat\">f = " + fmt(u.f, 5) + "</span> y " +
          "<span class=\"mat\">f′ = " + fmt(u.df, 5) + "</span>. La tangente cortó el eje en " +
          "<span class=\"mat\">x<sub>n+1</sub> = " + fmt(u.hasta.x, 5) + "</span>. " +
          "El error bajó a <strong>" + fmt(nuevoError, 5) + "</strong>.";
        marcarPasos(true);
      } else if (error < 1e-7) {
        grimorio.narracion.innerHTML =
          "El grimorio llegó: <span class=\"mat\">f(x) ≈ 0</span>, así que la raíz está en " +
          "<span class=\"mat\">x = " + fmt(plot.xn, 6) + "</span>.";
        marcarPasos(true);
      } else {
        grimorio.narracion.innerHTML =
          "El grimorio leyó <span class=\"mat\">x<sub>n</sub> = " + fmt(plot.xn, 5) +
          "</span>. Con <span class=\"mat\">f = " + fmt(f, 5) + "</span> y " +
          "<span class=\"mat\">f′ = " + fmt(df, 5) + "</span>, ya puede trazar la tangente. " +
          "Dale <strong>Un paso</strong> o usá <strong>Recorrer las iteraciones</strong>.";
        marcarPasos(false);
      }
    };

    const actualizar = (plot) => {
      const f = plot.op.f(plot.xn);
      const df = plot.op.df(plot.xn);
      datos.xn.textContent = fmt(plot.xn, 5);
      datos.f.textContent = fmt(f, 5);
      datos.df.textContent = fmt(df, 5);
      datos.error.textContent = fmt(Math.abs(f), 5);
      datos.iter.textContent = String(plot.iter);

      const est = plot.estadoTexto();
      datos.estado.textContent = est.texto;
      datos.estado.className = "estado" + (est.clase ? " " + est.clase : "");

      if (plot.ultimo && plot.ultimo.n !== plot._filaPintada) {
        const u = plot.ultimo;
        plot._filaPintada = u.n;
        const fila = document.createElement("tr");
        fila.innerHTML = `<td>${u.n}</td><td>${fmt(u.desde.x, 5)}</td><td>${fmt(u.f, 5)}</td><td>${fmt(u.df, 5)}</td><td>${fmt(u.hasta.x, 5)}</td>`;
        const vacio = datos.tabla.querySelector(".vacio");
        if (vacio) vacio.parentElement.remove();
        datos.tabla.appendChild(fila);
        while (datos.tabla.children.length > 14) datos.tabla.removeChild(datos.tabla.firstChild);
        datos.tabla.parentElement.parentElement.scrollTop =
          datos.tabla.parentElement.parentElement.scrollHeight;
      }

      datos.btnAuto.textContent = plot.auto ? "Pausar" : "Que corra solo";
      narrar(plot);
    };

    const crear = (nuevaClave) => {
      clave = nuevaClave;
      const def = FUNCIONES[clave];
      const plot = new NewtonPlot(canvas, {
        f: def.f,
        df: def.df,
        xmin: def.xmin,
        xmax: def.xmax,
        x0: def.x0,
        raiz: def.raiz,
        onChange: actualizar,
      });
      datos.tabla.innerHTML = `<tr><td colspan="5" class="vacio">Todavía no hay pasos.</td></tr>`;
      window.__plot = plot;
      actualizar(plot);
      return plot;
    };

    let plot = crear("cuadratica");

    $$(".chip[data-func]").forEach((chip) => {
      chip.addEventListener("click", () => {
        detenerSecuencia();
        $$(".chip[data-func]").forEach((c) => c.classList.toggle("activo", c === chip));
        plot = crear(chip.dataset.func);
        $("#pistaCanvas").classList.remove("oculta");
      });
    });

    datos.btnPaso.addEventListener("click", () => {
      detenerSecuencia();
      plot.detenerAuto();
      plot.paso();
    });

    datos.btnAuto.addEventListener("click", () => {
      detenerSecuencia();
      plot.alternarAuto();
    });

    datos.btnReiniciar.addEventListener("click", () => {
      detenerSecuencia();
      plot.reiniciar(FUNCIONES[clave].x0);
      datos.tabla.innerHTML = `<tr><td colspan="5" class="vacio">Todavía no hay pasos.</td></tr>`;
      marcarPasos(false);
    });

    if (grimorio.btn) {
      grimorio.btn.addEventListener("click", async () => {
        const token = ++secuencia;
        plot.detenerAuto();
        plot.reiniciar(FUNCIONES[clave].x0);
        datos.tabla.innerHTML = `<tr><td colspan="5" class="vacio">Todavía no hay pasos.</td></tr>`;
        marcarPasos(false);

        const esperar = (ms) => new Promise((listo) => setTimeout(listo, ms));

        for (let i = 0; i < 8; i++) {
          if (token !== secuencia) return;
          if (Math.abs(plot.op.f(plot.xn)) < 1e-7) break;
          if (grimorio.strip) grimorio.strip.classList.add("calculando");
          await esperar(90);
          if (token !== secuencia) return;
          plot.paso();
          await esperar(reduceMotion ? 80 : 760);
          if (grimorio.strip) grimorio.strip.classList.remove("calculando");
        }
      });
    }
  })();

  /* ---------------------------------------------------------
     7. La fórmula aplicada a la velocidad de la Parca
     --------------------------------------------------------- */
  (function demoNewtonJuego() {
    const slider = $("#sliderV");
    const salidaV = $("#valorV");
    const calculo = $("#calculoNR");
    const barraBruja = $("#barraBruja");
    const barraParca = $("#barraParca");
    const txtBruja = $("#txtBruja");
    const txtParca = $("#txtParca");
    const nota = $("#notaClamp");
    const canvas = $("#graficoJuego");
    if (!slider || !canvas) return;

    const MIN = 70;
    const MAX = 400;
    const FACTOR = 0.97;
    const ctx = canvas.getContext("2d");
    let v = Number(slider.value);
    let mostrado = FACTOR * v;
    let objetivo = mostrado;
    let raf = null;

    const limites = () => {
      const x = FACTOR * v;
      return { calculada: x, final: clamp(x, MIN, MAX) };
    };

    const redibujar = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = rect.width;
      const h = rect.height;
      const m = { l: 44, r: 16, t: 16, b: 30 };
      const xmin = 0;
      const xmax = 460;
      const f = (x) => x - FACTOR * v;
      const ymin = Math.min(f(0), f(xmax)) - 30;
      const ymax = Math.max(f(0), f(xmax)) + 30;
      const px = (x) => m.l + ((x - xmin) / (xmax - xmin)) * (w - m.l - m.r);
      const py = (y) => m.t + (h - m.t - m.b) * (1 - (y - ymin) / (ymax - ymin));

      ctx.clearRect(0, 0, w, h);

      // banda de límites
      ctx.fillStyle = "rgba(183,169,214,0.07)";
      ctx.fillRect(px(MIN), m.t, px(MAX) - px(MIN), h - m.t - m.b);
      ctx.strokeStyle = "rgba(183,169,214,0.35)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      [MIN, MAX].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(px(x), m.t);
        ctx.lineTo(px(x), h - m.b);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // grilla y ejes
      ctx.strokeStyle = "rgba(180,150,255,0.12)";
      ctx.font = "10px ui-monospace, Consolas, monospace";
      ctx.fillStyle = "rgba(183,169,214,0.7)";
      ctx.textAlign = "center";
      for (let x = 0; x <= xmax; x += 100) {
        ctx.beginPath();
        ctx.moveTo(px(x), m.t);
        ctx.lineTo(px(x), h - m.b);
        ctx.stroke();
        ctx.fillText(String(x), px(x), h - 10);
      }
      const y0 = py(0);
      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.moveTo(m.l, y0);
      ctx.lineTo(w - m.r, y0);
      ctx.stroke();

      // recta
      ctx.strokeStyle = "#38e8ff";
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "rgba(56,232,255,0.5)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(px(xmin), py(f(xmin)));
      ctx.lineTo(px(xmax), py(f(xmax)));
      ctx.stroke();
      ctx.shadowBlur = 0;

      const lim = limites();

      // raíz
      if (lim.calculada >= xmin && lim.calculada <= xmax) {
        ctx.strokeStyle = "rgba(134,239,172,0.7)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px(lim.calculada), py(0));
        ctx.lineTo(px(lim.calculada), m.t);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#86efac";
        ctx.beginPath();
        ctx.arc(px(lim.calculada), py(0), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(134,239,172,0.95)";
        ctx.textAlign = "center";
        ctx.fillText("raíz " + fmt(lim.calculada, 1), px(lim.calculada), m.t + 12);
      }

      // velocidad final (con límites)
      ctx.fillStyle = "#fcd34d";
      ctx.shadowColor = "rgba(252,211,77,0.9)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(px(mostrado), py(mostrado - FACTOR * v), 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(252,211,77,0.95)";
      ctx.textAlign = "center";
      ctx.fillText("x n = " + fmt(mostrado, 1), px(mostrado), py(mostrado - FACTOR * v) - 12);
    };

    const animarHasta = (destino) => {
      if (reduceMotion) {
        mostrado = destino;
        redibujar();
        return;
      }
      if (raf) cancelAnimationFrame(raf);
      const desde = mostrado;
      const t0 = performance.now();
      const dur = 380;
      const paso = (t) => {
        const k = clamp((t - t0) / dur, 0, 1);
        const e = 1 - Math.pow(1 - k, 3);
        mostrado = desde + (destino - desde) * e;
        redibujar();
        if (k < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    };

    const actualizar = () => {
      v = Number(slider.value);
      salidaV.textContent = String(v);
      const lim = limites();

      calculo.innerHTML = `
        <div><span class="oper">f(x) = x − 0,97 · ${v}</span></div>
        <div><span class="oper">f′(x) =</span> <span class="num">1</span></div>
        <div><span class="oper">x₁ = x₀ − f(x₀)/f′(x₀) =</span> <span class="res">${fmt(lim.calculada, 2)}</span></div>
        <div><span class="oper">con límites (70–400) →</span> <span class="res">${fmt(lim.final, 1)} px/s</span></div>`;

      const pctBruja = clamp((v / 450) * 100, 0, 100);
      const pctParca = clamp((lim.final / 450) * 100, 0, 100);
      barraBruja.style.width = pctBruja + "%";
      barraParca.style.width = pctParca + "%";
      txtBruja.textContent = String(v);
      txtParca.textContent = fmt(lim.final, 1);

      if (lim.calculada < MIN) {
        nota.innerHTML = `La cuenta da <strong>${fmt(lim.calculada, 1)}</strong>, pero el juego la sube al mínimo de <strong>70</strong>: si no, la Parca quedaría congelada.`;
      } else if (lim.calculada > MAX) {
        nota.innerHTML = `La cuenta da <strong>${fmt(lim.calculada, 1)}</strong>, pero el juego la baja al máximo de <strong>400</strong>: así la Parca no se vuelve imparable.`;
      } else {
        nota.innerHTML = `La cuenta da <strong>${fmt(lim.calculada, 1)}</strong> y queda dentro de los límites (70–400), así que ese es el valor final.`;
      }

      objetivo = lim.final;
      animarHasta(objetivo);
    };

    slider.addEventListener("input", actualizar);
    window.addEventListener("resize", redibujar, { passive: true });
    actualizar();
  })();

  /* ---------------------------------------------------------
     7b. Réplica interactiva del panel de la gráfica del juego
     --------------------------------------------------------- */
  (function graficaJuego() {
    const canvas = $("#graficoPanel");
    if (!canvas) return;

    const slider = $("#gSliderV");
    const salidaV = $("#gValorV");
    const datoX = $("#gDatoX");
    const datoV = $("#gDatoV");
    const datoF = $("#gDatoF");
    const datoD = $("#gDatoD");
    const datoRaiz = $("#gDatoRaiz");
    const estado = $("#gEstado");
    const btnPaso = $("#gPaso");
    const btnAuto = $("#gAuto");
    const btnReset = $("#gReset");
    const pista = $("#gPista");

    const ctx = canvas.getContext("2d");
    const MIN = 70;
    const MAX = 400;
    const FACTOR = 0.97;
    const XMAX = 480;
    const M = { l: 54, r: 22, t: 42, b: 48 };

    const st = {
      v: Number(slider.value),
      x: 180,
      hist: [180],
      auto: false,
      raf: null,
      ultimoT: 0,
      ultimoPunto: 0,
    };

    const f = (x) => x - FACTOR * st.v;
    const raiz = () => FACTOR * st.v;
    const objetivo = () => clamp(raiz(), MIN, MAX);

    const setEstado = (html, tipo = "") => {
      estado.innerHTML = html;
      estado.classList.toggle("ok", tipo === "ok");
      estado.classList.toggle("alerta", tipo === "alerta");
    };

    const empujar = () => {
      st.hist.push(st.x);
      if (st.hist.length > 150) st.hist.shift();
    };

    const mensajeRaiz = () => {
      const r = raiz();
      if (r < MIN) {
        setEstado(`La raíz da <strong>${fmt(r, 1)}</strong>, debajo del mínimo 70.
          El juego usa <strong>70</strong>: la Parca no puede quedarse quieta.`, "alerta");
      } else if (r > MAX) {
        setEstado(`La raíz da <strong>${fmt(r, 1)}</strong>, arriba del máximo 400.
          El juego usa <strong>400</strong>: la Parca no puede volar.`, "alerta");
      } else {
        setEstado(`La raíz da <strong>${fmt(r, 1)}</strong> y cae dentro de la zona válida (70–400).`, "ok");
      }
    };

    const dibujar = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 80) return;

      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const bw = Math.round(rect.width * dpr);
      const bh = Math.round(rect.height * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = rect.width;
      const h = rect.height;
      const x0 = M.l;
      const x1 = w - M.r;
      const y0 = M.t;
      const y1 = h - M.b;

      const px = (x) => x0 + (clamp(x, 0, XMAX) / XMAX) * (x1 - x0);
      const valoresY = [f(0), f(XMAX), 0];
      const ymin = Math.min(...valoresY) - 38;
      const ymax = Math.max(...valoresY) + 38;
      const py = (y) => y0 + (y1 - y0) * (1 - (y - ymin) / (ymax - ymin));

      ctx.clearRect(0, 0, w, h);

      // Cabecera del panel, como la del juego.
      ctx.fillStyle = "rgba(8, 9, 16, .6)";
      ctx.fillRect(0, 0, w, M.t - 8);
      ctx.strokeStyle = "rgba(90, 160, 255, .28)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

      ctx.font = "600 11px ui-monospace, Consolas, monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = "#dbeafe";
      ctx.fillText("Newton-Raphson", 12, 22);
      ctx.textAlign = "right";
      ctx.fillStyle = "#4de6ff";
      ctx.fillText("f(x) = x − 0,97·v", w - 12, 22);

      // Franja de velocidades válidas.
      const bx1 = px(MIN);
      const bx2 = px(MAX);
      ctx.fillStyle = "rgba(139, 92, 246, .11)";
      ctx.fillRect(bx1, y0, bx2 - bx1, y1 - y0);
      ctx.strokeStyle = "rgba(183, 169, 214, .38)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      [MIN, MAX].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(px(x), y0);
        ctx.lineTo(px(x), y1);
        ctx.stroke();
      });
      ctx.setLineDash([]);
      ctx.fillStyle = "rgba(183, 169, 214, .9)";
      ctx.font = "10px ui-monospace, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText("zona válida 70–400", (bx1 + bx2) / 2, y0 + 14);

      // Grilla.
      ctx.strokeStyle = "rgba(180, 150, 255, .11)";
      for (let x = 0; x <= XMAX; x += 50) {
        ctx.beginPath();
        ctx.moveTo(px(x), y0);
        ctx.lineTo(px(x), y1);
        ctx.stroke();
      }
      for (let y = Math.ceil(ymin / 100) * 100; y <= ymax; y += 100) {
        if (y === 0) continue;
        ctx.beginPath();
        ctx.moveTo(x0, py(y));
        ctx.lineTo(x1, py(y));
        ctx.stroke();
      }

      // Ejes.
      ctx.strokeStyle = "rgba(255, 255, 255, .55)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x0, py(0));
      ctx.lineTo(x1, py(0));
      ctx.moveTo(x0, y0);
      ctx.lineTo(x0, y1);
      ctx.stroke();

      ctx.fillStyle = "rgba(183, 169, 214, .75)";
      ctx.font = "10px ui-monospace, Consolas, monospace";
      ctx.textAlign = "center";
      for (let x = 0; x <= XMAX; x += 100) {
        ctx.fillText(String(x), px(x), y1 + 16);
      }
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(255, 255, 255, .75)";
      ctx.fillText("f(x)", x0 + 6, y0 + 14);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(183, 169, 214, .75)";
      ctx.fillText("velocidad →", x1, y0 + 14);

      // Recta f(x).
      ctx.strokeStyle = "#38e8ff";
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "rgba(56, 232, 255, .55)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(px(0), py(f(0)));
      ctx.lineTo(px(XMAX), py(f(XMAX)));
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Historial.
      if (st.hist.length > 1) {
        ctx.beginPath();
        st.hist.forEach((hx, i) => {
          const hpx = px(hx);
          const hpy = py(f(hx));
          if (i === 0) ctx.moveTo(hpx, hpy);
          else ctx.lineTo(hpx, hpy);
        });
        ctx.strokeStyle = "rgba(134, 239, 172, .4)";
        ctx.lineWidth = 1.4;
        ctx.stroke();
      }
      st.hist.forEach((hx, i) => {
        const a = 0.15 + 0.55 * (i / Math.max(1, st.hist.length));
        ctx.fillStyle = `rgba(134, 239, 172, ${a})`;
        ctx.beginPath();
        ctx.arc(px(hx), py(f(hx)), 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      const r = raiz();
      const obj = objetivo();
      const rx = px(r);
      const ry = py(0);

      // Raíz matemática.
      ctx.strokeStyle = "rgba(134, 239, 172, .55)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(rx, y0);
      ctx.lineTo(rx, y1);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#86efac";
      ctx.shadowColor = "rgba(134, 239, 172, .8)";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(rx, ry, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = "rgba(134, 239, 172, .95)";
      ctx.font = "10px ui-monospace, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        `raíz ${fmt(r, 1)}`,
        clamp(rx, x0 + 34, x1 - 34),
        Math.min(y1 - 4, ry + 16)
      );

      // Objetivo real cuando la raíz queda fuera de la franja.
      if (Math.abs(obj - r) > 0.6) {
        const ox = px(obj);
        ctx.strokeStyle = "rgba(255, 255, 255, .85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox, y0);
        ctx.lineTo(ox, y0 + 20);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 255, 255, .9)";
        ctx.font = "10px ui-monospace, Consolas, monospace";
        ctx.textAlign = "center";
        ctx.fillText("objetivo real", ox, y0 + 32);
      }

      // Punto actual y su error.
      const fx = f(st.x);
      const xp = px(st.x);
      const yp = py(fx);
      ctx.strokeStyle = "rgba(232, 121, 249, .5)";
      ctx.setLineDash([3, 4]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(xp, yp);
      ctx.lineTo(xp, py(0));
      ctx.stroke();
      ctx.setLineDash([]);

      // Tangente: como f es una recta, cae justo en la raíz.
      ctx.strokeStyle = "rgba(255, 107, 26, .92)";
      ctx.lineWidth = 3;
      ctx.setLineDash([7, 5]);
      ctx.beginPath();
      ctx.moveTo(xp, yp);
      ctx.lineTo(rx, ry);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "#ff6b1a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(rx, ry, 7, 0, Math.PI * 2);
      ctx.stroke();

      if (Math.abs(st.x - r) > 0.6) {
        ctx.fillStyle = "#ff6b1a";
        ctx.font = "10px ui-monospace, Consolas, monospace";
        const aDerecha = rx < x1 - 46;
        ctx.textAlign = aDerecha ? "left" : "right";
        ctx.fillText("x n+1", aDerecha ? rx + 9 : rx - 9, clamp(ry - 8, y0 + 12, y1 - 6));
      }

      // Punto amarillo x_n.
      ctx.fillStyle = "#fcd34d";
      ctx.shadowColor = "rgba(252, 211, 77, .95)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(xp, yp, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#1a0f2e";
      ctx.beginPath();
      ctx.arc(xp, yp, 2.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fcd34d";
      ctx.font = "bold 11px ui-monospace, Consolas, monospace";
      const xDerecha = xp < x1 - 34;
      ctx.textAlign = xDerecha ? "left" : "right";
      ctx.fillText("x n", xDerecha ? xp + 9 : xp - 9, clamp(yp - 9, y0 + 12, y1 - 6));

      // Aviso cuando la raíz queda fuera.
      if (r < MIN || r > MAX) {
        ctx.fillStyle = "rgba(252, 211, 77, .95)";
        ctx.font = "10px ui-monospace, Consolas, monospace";
        ctx.textAlign = "left";
        ctx.fillText(`raíz fuera de la franja: ${fmt(r, 0)}`, x0 + 4, y1 - 24);
        ctx.fillText(`el juego usa ${fmt(obj, 0)}`, x0 + 4, y1 - 10);
      }
    };

    const actualizarDatos = () => {
      const fx = f(st.x);
      const r = raiz();
      const obj = objetivo();
      datoX.textContent = fmt(st.x, 1);
      datoV.textContent = fmt(st.v, 0);
      datoF.textContent = fmt(fx, 1);
      datoD.textContent = fmt(obj, 1);
      datoRaiz.textContent = fmt(r, 1);
    };

    const detenerAuto = (mensaje) => {
      if (st.raf) cancelAnimationFrame(st.raf);
      st.raf = null;
      st.auto = false;
      btnAuto.textContent = "Que corra solo";
      if (mensaje) setEstado(mensaje, "ok");
    };

    const paso = () => {
      detenerAuto();
      const r = raiz();
      const obj = objetivo();
      st.x = obj;
      empujar();
      actualizarDatos();
      dibujar();
      if (Math.abs(obj - r) > 0.6) {
        setEstado(`La tangente cae en <strong>${fmt(r, 1)}</strong>, pero el juego recorta
          la velocidad a <strong>${fmt(obj, 1)}</strong> para no salirse de 70–400.`, "alerta");
      } else {
        setEstado(`Un paso y listo: la Parca queda justo en la raíz,
          <strong>${fmt(obj, 1)} px/s</strong>.`, "ok");
      }
    };

    const bucle = (t) => {
      if (!st.auto) return;
      const dt = Math.min(0.05, (t - st.ultimoT) / 1000 || 0.016);
      st.ultimoT = t;
      const obj = objetivo();
      st.x += (obj - st.x) * Math.min(1, dt * 3.4);
      if (t - st.ultimoPunto > 90) {
        empujar();
        st.ultimoPunto = t;
      }
      if (Math.abs(obj - st.x) < 0.4) {
        st.x = obj;
        empujar();
        actualizarDatos();
        dibujar();
        detenerAuto(`La Parca se acomodó en <strong>${fmt(obj, 1)} px/s</strong>.`);
        return;
      }
      actualizarDatos();
      dibujar();
      st.raf = requestAnimationFrame(bucle);
    };

    btnPaso.addEventListener("click", paso);

    btnAuto.addEventListener("click", () => {
      if (st.auto) {
        detenerAuto(`Frenado en <strong>${fmt(st.x, 1)} px/s</strong>.`);
        return;
      }
      const obj = objetivo();
      if (reduceMotion) {
        st.x = obj;
        empujar();
        actualizarDatos();
        dibujar();
        setEstado(`La Parca se acomodó en <strong>${fmt(obj, 1)} px/s</strong>.`, "ok");
        return;
      }
      st.auto = true;
      st.ultimoT = performance.now();
      st.ultimoPunto = 0;
      btnAuto.textContent = "Parar";
      setEstado("Persiguiendo la raíz…");
      st.raf = requestAnimationFrame(bucle);
    });

    btnReset.addEventListener("click", () => {
      detenerAuto();
      st.x = 180;
      st.hist = [180];
      pista.classList.remove("oculta");
      actualizarDatos();
      dibujar();
      setEstado("Reiniciado: <span class=\"mat\">x<sub>n</sub></span> vuelve a 180 px/s.", "ok");
    });

    slider.addEventListener("input", () => {
      st.v = Number(slider.value);
      salidaV.textContent = String(st.v);
      actualizarDatos();
      dibujar();
      mensajeRaiz();
    });

    canvas.addEventListener("click", (ev) => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      const x = ((ev.clientX - rect.left - M.l) / (rect.width - M.l - M.r)) * XMAX;
      st.x = clamp(x, MIN, MAX);
      detenerAuto();
      empujar();
      pista.classList.add("oculta");
      actualizarDatos();
      dibujar();
      setEstado(`Elegiste <span class="mat">x<sub>n</sub> = ${fmt(st.x, 1)}</span> px/s.`, "ok");
    });

    window.addEventListener("resize", dibujar, { passive: true });
    if (window.ResizeObserver && canvas.parentElement) {
      new ResizeObserver(() => dibujar()).observe(canvas.parentElement);
    }

    salidaV.textContent = String(st.v);
    actualizarDatos();
    dibujar();
    mensajeRaiz();
  })();

  /* ---------------------------------------------------------
     8. Demo jugable
     --------------------------------------------------------- */
  (function demoJuego() {
    const canvas = $("#lienzoJuego");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const overlay = $("#juegoOverlay");
    const overlayTitulo = $("#overlayTitulo");
    const overlayTexto = $("#overlayTexto");
    const overlayArte = $("#overlayArte");
    const btnJugar = $("#btnJugar");
    const btnReiniciar = $("#btnReiniciarJuego");
    const hud = {
      v: $("#hudV"),
      x: $("#hudX"),
      f: $("#hudF"),
      d: $("#hudD"),
      estado: $("#hudEstado"),
    };

    const W = 960;
    const H = 540;
    const FACTOR = 0.97;
    const VEL_MIN = 70;
    const VEL_MAX = 400;
    const VEL_CAMINAR = 250;
    const VEL_CORRER = 450;

    const paredes = [
      { x: 0, y: 0, w: W, h: 22 },
      { x: 0, y: H - 22, w: W, h: 22 },
      { x: 0, y: 0, w: 22, h: H },
      { x: W - 22, y: 0, w: 22, h: H },
      { x: 330, y: 22, w: 24, h: 268 },
      { x: 640, y: 250, w: 24, h: 268 },
      { x: 120, y: 92, w: 130, h: 22 },
      { x: 120, y: 426, w: 130, h: 22 },
      { x: 470, y: 92, w: 130, h: 22 },
      { x: 470, y: 426, w: 130, h: 22 },
    ];

    const puerta = { x: 862, y: 96, w: 74, h: 132 };

    const bruja = { x: 90, y: 270, r: 15, vx: 0, vy: 0, vel: 0, mirando: 1 };
    const parca = { x: 70, y: 470, r: 21, vel: 0, quieta: 0 };

    let rastro = [];
    let ultimoRastro = null;
    let corriendo = false;
    let terminado = false;
    let capturado = false;
    let gano = false;
    let tiempo = 0;
    let visible = false;
    let ultimoFrame = 0;
    let raf = null;
    let dpr = 1;

    const teclas = new Set();
    const joystick = { activo: false, id: null, ox: 0, oy: 0, x: 0, y: 0, dx: 0, dy: 0, fuerza: 0 };

    const reiniciar = () => {
      bruja.x = 90;
      bruja.y = 270;
      bruja.vx = 0;
      bruja.vy = 0;
      bruja.vel = 0;
      parca.x = 70;
      parca.y = 470;
      parca.vel = 0;
      parca.quieta = 0;
      rastro = [];
      ultimoRastro = null;
      terminado = false;
      capturado = false;
      gano = false;
      tiempo = 0;
      corriendo = true;
      overlay.classList.add("oculto");
      overlayArte.hidden = true;
      overlayArte.removeAttribute("src");
      actualizarHud();
      if (!raf) bucle(performance.now());
    };

    const terminar = (tipo) => {
      terminado = true;
      corriendo = false;
      if (tipo === "capturado") {
        capturado = true;
        overlayTitulo.textContent = "Te atrapó la Parca";
        overlayTexto.innerHTML =
          "Ajustaba su velocidad al 97% de la tuya, pero siguió tu rastro sin dudar. " +
          "Probá correr con <kbd>Shift</kbd> y usar las paredes para cortarle el camino.";
        overlayArte.src = "assets/perdio.jpg";
        overlayArte.alt = "La Parca atrapó a la bruja";
        overlayArte.hidden = false;
        btnJugar.textContent = "Reintentar";
      } else {
        gano = true;
        overlayTitulo.textContent = "¡Escapaste!";
        overlayTexto.innerHTML =
          `Llegaste a la salida en ${tiempo.toFixed(1)} segundos. ` +
          "Ahora probá quedarte quieta un segundo y mirá cómo se acerca…";
        overlayArte.src = "assets/gano.jpg";
        overlayArte.alt = "La bruja escapó y llegó a la salida";
        overlayArte.hidden = false;
        btnJugar.textContent = "Jugar otra vez";
      }
      overlay.classList.remove("oculto");
      actualizarHud();
    };

    const colisiona = (x, y, r) => {
      for (const p of paredes) {
        const cx = clamp(x, p.x, p.x + p.w);
        const cy = clamp(y, p.y, p.y + p.h);
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy < r * r) return true;
      }
      return false;
    };

    const moverEntidad = (e, dx, dy) => {
      if (dx) {
        const nx = e.x + dx;
        if (!colisiona(nx, e.y, e.r)) e.x = nx;
      }
      if (dy) {
        const ny = e.y + dy;
        if (!colisiona(e.x, ny, e.r)) e.y = ny;
      }
    };

    const actualizarHud = () => {
      const x = clamp(FACTOR * bruja.vel, VEL_MIN, VEL_MAX);
      hud.v.textContent = fmt(bruja.vel, 0);
      hud.x.textContent = fmt(x, 0);
      hud.f.textContent = fmt(x - FACTOR * Math.max(bruja.vel, 5), 1);
      const d = Math.hypot(bruja.x - parca.x, bruja.y - parca.y);
      hud.d.textContent = fmt(d, 0) + " px";
      hud.estado.textContent = capturado
        ? "Te atrapó"
        : gano
        ? "¡Escapaste!"
        : corriendo
        ? "Persiguiendo"
        : "Listo";
      hud.estado.style.color = capturado ? "#fb7185" : gano ? "#fcd34d" : "#86efac";
    };

    const dibujar = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = Math.min(rect.width / W, rect.height / H);
      const ox = (rect.width - W * s) / 2;
      const oy = (rect.height - H * s) / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.save();
      ctx.translate(ox, oy);
      ctx.scale(s, s);

      // piso
      const grad = ctx.createRadialGradient(W * 0.5, H * 0.45, 80, W * 0.5, H * 0.5, W * 0.75);
      grad.addColorStop(0, "#160c2b");
      grad.addColorStop(1, "#07030f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      ctx.strokeStyle = "rgba(139,92,246,0.10)";
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 48) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // puerta
      const pulso = 0.55 + 0.45 * Math.sin(tiempo * 2.6);
      ctx.save();
      ctx.shadowColor = `rgba(252,211,77,${0.55 + 0.3 * pulso})`;
      ctx.shadowBlur = 26;
      ctx.fillStyle = `rgba(252,211,77,${0.16 + 0.1 * pulso})`;
      ctx.strokeStyle = `rgba(252,211,77,${0.7 + 0.3 * pulso})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(puerta.x, puerta.y, puerta.w, puerta.h, 10);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = "rgba(252,211,77,0.95)";
      ctx.font = "bold 15px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("SALIDA", puerta.x + puerta.w / 2, puerta.y + puerta.h + 24);

      // paredes
      for (const p of paredes) {
        ctx.fillStyle = "#1b1033";
        ctx.strokeStyle = "rgba(180,150,255,0.35)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, p.w, p.h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "rgba(232,121,249,0.18)";
        ctx.beginPath();
        ctx.roundRect(p.x + 3, p.y + 3, p.w - 6, p.h - 6, 4);
        ctx.stroke();
      }

      // rastro
      for (let i = 0; i < rastro.length; i++) {
        const a = 0.06 + 0.28 * (i / Math.max(1, rastro.length));
        ctx.fillStyle = `rgba(232,121,249,${a})`;
        ctx.beginPath();
        ctx.arc(rastro[i].x, rastro[i].y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // parca
      ctx.save();
      ctx.shadowColor = "rgba(56,232,255,0.85)";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "rgba(8,10,20,0.95)";
      ctx.beginPath();
      ctx.arc(parca.x, parca.y, parca.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(56,232,255,0.75)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      ctx.font = "30px system-ui, 'Segoe UI Emoji', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("💀", parca.x, parca.y + 1);

      // bruja
      ctx.save();
      ctx.shadowColor = "rgba(232,121,249,0.9)";
      ctx.shadowBlur = 22;
      ctx.fillStyle = "rgba(46,16,70,0.95)";
      ctx.beginPath();
      ctx.arc(bruja.x, bruja.y, bruja.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(232,121,249,0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      ctx.font = "26px system-ui, 'Segoe UI Emoji', sans-serif";
      ctx.fillText("🧙", bruja.x, bruja.y + 1);
      ctx.textBaseline = "alphabetic";

      // joystick
      if (joystick.activo) {
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(joystick.ox, joystick.oy, 52, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(232,121,249,0.55)";
        ctx.beginPath();
        ctx.arc(joystick.ox + joystick.dx, joystick.oy + joystick.dy, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    };

    const paso = (dt) => {
      if (!corriendo) return;
      tiempo += dt;

      // dirección
      let dx = 0;
      let dy = 0;
      if (teclas.has("ArrowLeft") || teclas.has("a") || teclas.has("A")) dx -= 1;
      if (teclas.has("ArrowRight") || teclas.has("d") || teclas.has("D")) dx += 1;
      if (teclas.has("ArrowUp") || teclas.has("w") || teclas.has("W")) dy -= 1;
      if (teclas.has("ArrowDown") || teclas.has("s") || teclas.has("S")) dy += 1;

      let fuerzaJoystick = 0;
      if (joystick.activo) {
        dx += joystick.dx / 52;
        dy += joystick.dy / 52;
        fuerzaJoystick = joystick.fuerza;
      }

      const largo = Math.hypot(dx, dy);
      if (largo > 1) {
        dx /= largo;
        dy /= largo;
      }

      const correr =
        teclas.has("Shift") || teclas.has("shift") || fuerzaJoystick > 0.92;
      const velocidad =
        correr && largo > 0.1 ? VEL_CORRER : VEL_CAMINAR;

      bruja.vx = dx * velocidad;
      bruja.vy = dy * velocidad;
      bruja.vel = Math.hypot(bruja.vx, bruja.vy);
      if (dx < -0.1) bruja.mirando = -1;
      else if (dx > 0.1) bruja.mirando = 1;

      moverEntidad(bruja, bruja.vx * dt, bruja.vy * dt);

      // rastro
      if (!ultimoRastro || Math.hypot(bruja.x - ultimoRastro.x, bruja.y - ultimoRastro.y) >= 12) {
        rastro.push({ x: bruja.x, y: bruja.y });
        ultimoRastro = { x: bruja.x, y: bruja.y };
        if (rastro.length > 900) rastro.shift();
      }

      // la Parca: velocidad por Newton-Raphson
      const xN = clamp(FACTOR * Math.max(bruja.vel, 5), VEL_MIN, VEL_MAX);
      parca.vel = xN;

      // objetivo: el rastro
      while (rastro.length && Math.hypot(parca.x - rastro[0].x, parca.y - rastro[0].y) <= 22) {
        rastro.shift();
      }
      let objetivo = rastro.length ? rastro[0] : { x: bruja.x, y: bruja.y };
      let ddx = objetivo.x - parca.x;
      let ddy = objetivo.y - parca.y;
      const dist = Math.hypot(ddx, ddy);
      if (dist < 1) {
        ddx = bruja.x - parca.x;
        ddy = bruja.y - parca.y;
      }
      const dl = Math.hypot(ddx, ddy) || 1;
      const ax = (ddx / dl) * parca.vel * dt;
      const ay = (ddy / dl) * parca.vel * dt;

      const antes = { x: parca.x, y: parca.y };
      moverEntidad(parca, ax, ay);
      const movido = Math.hypot(parca.x - antes.x, parca.y - antes.y);

      // anti-atasco: si se traba, salta puntos del rastro
      if (movido < 0.35 && parca.vel > 30) {
        parca.quieta += dt;
        if (parca.quieta > 0.55 && rastro.length > 3) {
          rastro.splice(0, Math.min(4, rastro.length - 1));
          parca.quieta = 0;
        }
      } else {
        parca.quieta = 0;
      }

      // captura y victoria
      const dReal = Math.hypot(bruja.x - parca.x, bruja.y - parca.y);
      if (dReal < bruja.r + parca.r - 2) {
        terminar("capturado");
      } else if (
        bruja.x > puerta.x &&
        bruja.x < puerta.x + puerta.w &&
        bruja.y > puerta.y &&
        bruja.y < puerta.y + puerta.h
      ) {
        terminar("ganado");
      }

      actualizarHud();
    };

    const bucle = (t) => {
      const dt = Math.min(0.033, (t - (ultimoFrame || t)) / 1000);
      ultimoFrame = t;
      if (visible) {
        paso(dt);
        dibujar();
      }
      raf = requestAnimationFrame(bucle);
    };

    // Teclado
    window.addEventListener("keydown", (e) => {
      const k = e.key;
      const esControl = [
        "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " ", "Shift",
      ].includes(k) || ["a", "d", "w", "s", "A", "D", "W", "S"].includes(k);
      if (!esControl) return;
      if (!visible || !corriendo) return;
      teclas.add(k);
      if (k.startsWith("Arrow") || k === " ") e.preventDefault();
    });

    window.addEventListener("keyup", (e) => {
      teclas.delete(e.key);
    });

    window.addEventListener("blur", () => teclas.clear());

    // Joystick táctil / puntero
    const coords = (e) => {
      const rect = canvas.getBoundingClientRect();
      const s = Math.min(rect.width / W, rect.height / H);
      const ox = (rect.width - W * s) / 2;
      const oy = (rect.height - H * s) / 2;
      return {
        x: (e.clientX - rect.left - ox) / s,
        y: (e.clientY - rect.top - oy) / s,
      };
    };

    canvas.addEventListener("pointerdown", (e) => {
      if (!corriendo) return;
      canvas.setPointerCapture(e.pointerId);
      const p = coords(e);
      joystick.activo = true;
      joystick.id = e.pointerId;
      joystick.ox = p.x;
      joystick.oy = p.y;
      joystick.dx = 0;
      joystick.dy = 0;
      joystick.fuerza = 0;
      e.preventDefault();
    });

    canvas.addEventListener("pointermove", (e) => {
      if (!joystick.activo || e.pointerId !== joystick.id) return;
      const p = coords(e);
      let dx = p.x - joystick.ox;
      let dy = p.y - joystick.oy;
      const d = Math.hypot(dx, dy);
      const max = 52;
      if (d > max) {
        dx = (dx / d) * max;
        dy = (dy / d) * max;
      }
      joystick.dx = dx;
      joystick.dy = dy;
      joystick.fuerza = clamp(Math.hypot(dx, dy) / max, 0, 1);
      e.preventDefault();
    });

    const soltar = (e) => {
      if (e.pointerId !== joystick.id) return;
      joystick.activo = false;
      joystick.id = null;
      joystick.dx = 0;
      joystick.dy = 0;
      joystick.fuerza = 0;
    };

    canvas.addEventListener("pointerup", soltar);
    canvas.addEventListener("pointercancel", soltar);
    canvas.addEventListener("pointerleave", (e) => {
      if (joystick.activo && e.pointerId === joystick.id && e.pointerType === "mouse") soltar(e);
    });

    btnJugar.addEventListener("click", reiniciar);
    btnReiniciar.addEventListener("click", reiniciar);

    // Solo corre cuando la demo está a la vista
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        (entradas) => {
          visible = entradas[0].isIntersecting;
          if (visible && !raf) bucle(performance.now());
        },
        { threshold: 0.12 }
      ).observe(canvas);
    } else {
      visible = true;
    }

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        teclas.clear();
        joystick.activo = false;
        joystick.id = null;
        joystick.dx = 0;
        joystick.dy = 0;
        joystick.fuerza = 0;
      }
    });

    window.addEventListener("resize", () => dibujar(), { passive: true });

    // Estado inicial
    overlayTitulo.textContent = "¿Te animás?";
    overlayTexto.innerHTML =
      "Llegá a la <strong>puerta dorada</strong> sin que la Parca te toque. " +
      "Flechas o WASD para moverte, <kbd>Shift</kbd> para correr.";
    btnJugar.textContent = "Empezar";
    dibujar();
  })();

  /* ---------------------------------------------------------
     15. Galería: filtros y visor ampliado
     --------------------------------------------------------- */
  (function galeria() {
    const contenedor = $("#galeriaOficial");
    const lightbox = $("#lightbox");
    if (!contenedor || !lightbox) return;

    const items = $$(".galeria-item", contenedor);
    const filtros = $$(".filtro");
    const img = $("#lightboxImg");
    const placeholder = $("#lightboxPlaceholder");
    const titulo = $("#lightboxTitulo");
    const desc = $("#lightboxDesc");
    const btnCerrar = $("#lightboxCerrar");
    const btnPrev = $("#lightboxPrev");
    const btnNext = $("#lightboxNext");
    const fondo = $(".lightbox-fondo", lightbox);

    let visibles = items.slice();
    let indice = 0;
    let ultimoFoco = null;

    const aplicarFiltro = (cual) => {
      filtros.forEach((f) => {
        const activo = f.dataset.filtro === cual;
        f.classList.toggle("activo", activo);
        f.setAttribute("aria-pressed", String(activo));
      });
      items.forEach((item) => {
        const mostrar = cual === "todo" || item.dataset.cat === cual;
        item.hidden = !mostrar;
      });
      visibles = items.filter((i) => !i.hidden);
    };

    filtros.forEach((f) => {
      f.addEventListener("click", () => aplicarFiltro(f.dataset.filtro));
    });

    const pintar = () => {
      const item = visibles[indice];
      if (!item) return;
      const src = item.dataset.src;
      titulo.textContent = item.dataset.titulo || "";
      desc.textContent = item.dataset.desc || "";
      if (src) {
        img.src = src;
        img.alt = item.dataset.titulo ? "Vista ampliada: " + item.dataset.titulo : "";
        img.hidden = false;
        placeholder.hidden = true;
      } else {
        img.removeAttribute("src");
        img.hidden = true;
        placeholder.hidden = false;
      }
      const varios = visibles.length > 1;
      btnPrev.hidden = !varios;
      btnNext.hidden = !varios;
    };

    const abrir = (item) => {
      visibles = items.filter((i) => !i.hidden);
      indice = Math.max(0, visibles.indexOf(item));
      ultimoFoco = document.activeElement;
      pintar();
      lightbox.hidden = false;
      document.body.classList.add("sin-scroll");
      btnCerrar.focus();
    };

    const cerrar = () => {
      lightbox.hidden = true;
      document.body.classList.remove("sin-scroll");
      if (ultimoFoco && typeof ultimoFoco.focus === "function") ultimoFoco.focus();
    };

    const mover = (delta) => {
      if (visibles.length < 2) return;
      indice = (indice + delta + visibles.length) % visibles.length;
      pintar();
    };

    items.forEach((item) => {
      item.addEventListener("click", () => abrir(item));
    });

    btnCerrar.addEventListener("click", cerrar);
    fondo.addEventListener("click", cerrar);
    btnPrev.addEventListener("click", () => mover(-1));
    btnNext.addEventListener("click", () => mover(1));

    document.addEventListener("keydown", (e) => {
      if (lightbox.hidden) return;
      if (e.key === "Escape") {
        e.preventDefault();
        cerrar();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        mover(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        mover(1);
      } else if (e.key === "Tab") {
        const focos = $$("button", lightbox).filter((b) => !b.hidden);
        if (!focos.length) return;
        const primero = focos[0];
        const ultimo = focos[focos.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    });

    aplicarFiltro("todo");
  })();

  /* ---------------------------------------------------------
     11. Anatomía interactiva de la gráfica educativa
     --------------------------------------------------------- */
  (function anatomiaNewton() {
    const svg = $("#svgAnatomia");
    const titulo = $("#anatomiaTitulo");
    const texto = $("#anatomiaTexto");
    const eyebrow = $("#anatomiaEyebrow");
    const datoLabel = $("#anatomiaDatoLabel");
    const dato = $("#anatomiaDato");
    if (!svg || !titulo || !texto) return;

    const DATOS = {
      "eje-x": {
        eyebrow: "Eje horizontal",
        titulo: "Eje X: los valores de x",
        html:
          "Es la recta horizontal. Cada punto de izquierda a derecha representa un valor de " +
          "<span class=\"mat\">x</span>. En el ejemplo educativo, x es un número que probamos. " +
          "En el juego, x es la velocidad de la Parca.",
        label: "En este ejemplo",
        valor: "x va de 0 a 3,6",
      },
      "eje-y": {
        eyebrow: "Eje vertical",
        titulo: "Eje Y: la altura de la función",
        html:
          "Es la recta vertical. Mide <span class=\"mat\">f(x)</span>: la altura de la curva. " +
          "Si un punto está sobre el eje X, su altura es cero, y ahí está la raíz.",
        label: "En este ejemplo",
        valor: "f(3) = 5",
      },
      funcion: {
        eyebrow: "La curva",
        titulo: "La función f(x)",
        html:
          "Es la curva <span class=\"mat\">f(x) = x² − 4</span>. Buscamos el valor de " +
          "<span class=\"mat\">x</span> que la hace valer cero, o sea, el punto donde la curva " +
          "toca el eje X.",
        label: "En este ejemplo",
        valor: "f(x) = x² − 4",
      },
      x0: {
        eyebrow: "Primera apuesta",
        titulo: "El punto inicial x₀",
        html:
          "Es la primera apuesta: <span class=\"mat\">x₀ = 3</span>. Está sobre la curva, a la " +
          "altura <span class=\"mat\">f(3) = 5</span>. El método arranca desde acá, aunque todavía " +
          "esté lejos de la raíz.",
        label: "En este ejemplo",
        valor: "x₀ = 3 · f(3) = 5",
      },
      derivada: {
        eyebrow: "La inclinación",
        titulo: "La derivada f′(x)",
        html:
          "Es la pendiente de la curva en <span class=\"mat\">x₀</span>: " +
          "<span class=\"mat\">f′(3) = 6</span>. El triangulito lo muestra: si avanzo 0,5 en x, " +
          "subo 3 en y. <span class=\"mat\">3 ÷ 0,5 = 6</span>.",
        label: "En este ejemplo",
        valor: "f′(3) = 6",
      },
      tangente: {
        eyebrow: "La recta que reemplaza a la curva",
        titulo: "La recta tangente",
        html:
          "Es la recta que toca la curva en <span class=\"mat\">x₀</span> y sigue su inclinación. " +
          "Reemplaza a la curva cerca del punto y es fácil ver dónde corta el eje.",
        label: "En este ejemplo",
        valor: "toca en x₀ = 3",
      },
      raiz: {
        eyebrow: "La respuesta",
        titulo: "La raíz",
        html:
          "Es el valor de <span class=\"mat\">x</span> que hace <span class=\"mat\">f(x) = 0</span>. " +
          "Acá es <span class=\"mat\">x = 2</span>, porque <span class=\"mat\">2² − 4 = 0</span>. " +
          "Es la respuesta que el método quiere encontrar.",
        label: "En este ejemplo",
        valor: "x = 2",
      },
      x1: {
        eyebrow: "Una apuesta mejor",
        titulo: "La siguiente aproximación x₁",
        html:
          "Es donde la tangente corta el eje X: <span class=\"mat\">x₁ = 2,1667</span>. " +
          "Es una apuesta mejor que <span class=\"mat\">x₀</span> porque está más cerca de la raíz.",
        label: "En este ejemplo",
        valor: "x₁ = 2,1667",
      },
      iteraciones: {
        eyebrow: "Repetir el procedimiento",
        titulo: "Las iteraciones",
        html:
          "Es repetir el mismo procedimiento con la nueva aproximación. Acá hacen falta 4 pasos: " +
          "<span class=\"mat\">3 → 2,1667 → 2,0064 → 2,00001 → 2</span>. En el juego, como " +
          "<span class=\"mat\">f</span> es una recta, un paso alcanza la raíz, pero el cálculo se " +
          "repite cada frame porque <span class=\"mat\">v</span> cambia.",
        label: "En este ejemplo",
        valor: "4 pasos hasta x = 2",
      },
    };

    const chips = $$(".anat-chip");
    const grupos = $$(".anat", svg);

    const seleccionar = (clave) => {
      const d = DATOS[clave];
      if (!d) return;
      svg.classList.add("tiene-activo");
      grupos.forEach((g) => {
        const activo = g.dataset.el === clave;
        g.classList.toggle("activo", activo);
        g.setAttribute("aria-pressed", String(activo));
      });
      chips.forEach((c) => {
        const activo = c.dataset.el === clave;
        c.classList.toggle("activo", activo);
        c.setAttribute("aria-pressed", String(activo));
      });
      if (eyebrow) eyebrow.textContent = d.eyebrow;
      titulo.textContent = d.titulo;
      texto.innerHTML = d.html;
      if (datoLabel) datoLabel.textContent = d.label;
      if (dato) dato.textContent = d.valor;
    };

    chips.forEach((chip) => {
      chip.addEventListener("click", () => seleccionar(chip.dataset.el));
    });

    grupos.forEach((g) => {
      g.addEventListener("click", () => seleccionar(g.dataset.el));
      g.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          seleccionar(g.dataset.el);
        }
      });
    });

    seleccionar("funcion");
  })();

  /* ---------------------------------------------------------
     12. Comparación lado a lado: matemática y persecución
     --------------------------------------------------------- */
  (function comparacionNewton() {
    const canvas = $("#lienzoComparacion");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const slider = $("#cSliderV");
    const salidaV = $("#cValorV");
    const btnPaso = $("#cPaso");
    const btnAvanzar = $("#cAvanzar");
    const btnReset = $("#cReset");
    const narracion = $("#comparacionNarracion");
    const pista = $("#pistaComparacion");
    const pistaDistancia = $("#pistaDistancia");
    const datoV = $("#cDatoV");
    const datoX = $("#cDatoX");
    const datoCierre = $("#cDatoCierre");
    const datoDist = $("#cDatoDist");
    if (!slider || !btnPaso || !btnAvanzar || !btnReset) return;

    const MIN = 70;
    const MAX = 400;
    const FACTOR = 0.97;
    const GAP_MAX = 400;
    const GAP_INICIAL = 320;

    let v = Number(slider.value);
    let xN = 290;
    let gap = GAP_INICIAL;
    let ultimoPaso = null;

    const vEf = () => Math.max(v, 5);
    const raiz = () => FACTOR * vEf();
    const final = () => clamp(raiz(), MIN, MAX);

    const medirPista = () => {
      if (!pista) return;
      const ancho = pista.clientWidth || 320;
      const disponible = Math.max(40, ancho - 76 - 64 - 12);
      const visual = (clamp(gap, 0, GAP_MAX) / GAP_MAX) * disponible;
      pista.style.setProperty("--gap-visual", visual.toFixed(1) + "px");
      pista.classList.toggle("capturada", gap <= 0);
      if (pistaDistancia) pistaDistancia.textContent = Math.round(gap) + " px";
    };

    const redibujar = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const w = rect.width;
      const h = rect.height;
      const m = { l: 48, r: 20, t: 24, b: 34 };
      const xmin = 0;
      const xmax = 460;
      const r = raiz();
      const f = (x) => x - r;
      const ymin = Math.min(f(xmin), f(xmax)) - 28;
      const ymax = Math.max(f(xmin), f(xmax)) + 28;
      const px = (x) => m.l + ((x - xmin) / (xmax - xmin)) * (w - m.l - m.r);
      const py = (y) => m.t + (h - m.t - m.b) * (1 - (y - ymin) / (ymax - ymin));

      ctx.clearRect(0, 0, w, h);

      // franja válida 70–400
      ctx.fillStyle = "rgba(139,92,246,.08)";
      ctx.fillRect(px(MIN), m.t, px(MAX) - px(MIN), h - m.t - m.b);
      ctx.strokeStyle = "rgba(183,169,214,.3)";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      [MIN, MAX].forEach((x) => {
        ctx.beginPath();
        ctx.moveTo(px(x), m.t);
        ctx.lineTo(px(x), h - m.b);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // grilla y ejes
      ctx.strokeStyle = "rgba(180,150,255,.12)";
      ctx.lineWidth = 1;
      ctx.font = (w < 320 ? 9 : 10) + "px ui-monospace, Consolas, monospace";
      ctx.fillStyle = "rgba(183,169,214,.72)";
      ctx.textAlign = "center";
      // En lienzos angostos se rotula cada 200 px/s para que no se pisen.
      const pasoX = w < 320 ? 200 : 100;
      for (let x = 0; x <= xmax; x += pasoX) {
        ctx.beginPath();
        ctx.moveTo(px(x), m.t);
        ctx.lineTo(px(x), h - m.b);
        ctx.stroke();
        ctx.fillText(String(x), px(x), h - 10);
      }
      const y0 = py(0);
      ctx.strokeStyle = "rgba(255,255,255,.45)";
      ctx.beginPath();
      ctx.moveTo(m.l, y0);
      ctx.lineTo(w - m.r, y0);
      ctx.stroke();

      // recta f(x)
      ctx.strokeStyle = "#38e8ff";
      ctx.lineWidth = 2.4;
      ctx.shadowColor = "rgba(56,232,255,.5)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(px(xmin), py(f(xmin)));
      ctx.lineTo(px(xmax), py(f(xmax)));
      ctx.stroke();
      ctx.shadowBlur = 0;

      // raíz matemática
      if (r >= xmin && r <= xmax) {
        ctx.strokeStyle = "rgba(134,239,172,.7)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px(r), py(0));
        ctx.lineTo(px(r), m.t);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "#86efac";
        ctx.beginPath();
        ctx.arc(px(r), py(0), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(134,239,172,.95)";
        ctx.textAlign = "center";
        ctx.fillText("raíz " + fmt(r, 1), px(r), m.t + 12);
      }

      // paso de Newton: segmento de x_n a x_{n+1}
      if (ultimoPaso) {
        const ax = px(ultimoPaso.antes);
        const ay = py(ultimoPaso.f);
        const bx = px(ultimoPaso.despues);
        const by = py(0);
        ctx.strokeStyle = "rgba(251,113,133,.9)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = "rgba(251,113,133,.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax, by);
        ctx.stroke();
      }

      // x_n actual
      const xn = clamp(xN, xmin, xmax);
      const yxn = f(xn);
      ctx.fillStyle = "#fcd34d";
      ctx.shadowColor = "rgba(252,211,77,.9)";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(px(xn), py(yxn), 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(252,211,77,.98)";
      ctx.textAlign = "center";
      ctx.fillText("x n = " + fmt(xN, 1), px(xn), py(yxn) - 12);

      // x_{n+1} (raíz con límites)
      const next = final();
      if (next >= xmin && next <= xmax) {
        ctx.fillStyle = "#e879f9";
        ctx.shadowColor = "rgba(232,121,249,.9)";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px(next), py(0), 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(232,121,249,.98)";
        ctx.fillText("x n+1 = " + fmt(next, 1), px(next), py(0) + 20);
      }

      ctx.fillStyle = "rgba(56,232,255,.9)";
      ctx.textAlign = "left";
      ctx.fillText("f(x) = x − 0,97 · v", m.l + 6, m.t + 12);
    };

    const actualizar = (mensaje) => {
      if (salidaV) salidaV.textContent = String(v);
      if (datoV) datoV.textContent = fmt(v, 0) + " px/s";
      if (datoX) datoX.textContent = fmt(xN, 1) + " px/s";
      const cambio = vEf() - xN;
      if (datoCierre) datoCierre.textContent = (cambio >= 0 ? "+" : "") + fmt(cambio, 1) + " px";
      if (datoDist) datoDist.textContent = Math.round(gap) + " px";
      if (mensaje && narracion) narracion.innerHTML = mensaje;
      medirPista();
      redibujar();
    };

    const mensajeInicial = () => {
      const notaPiso = v < 5 ? " (el código usa un mínimo de 5 px/s para la bruja)" : "";
      return (
        "La Parca arranca en <span class=\"mat\">x_n = 290</span> px/s. La bruja va a " +
        "<span class=\"mat\">" + v + " px/s</span>" + notaPiso + ". La raíz es " +
        "<span class=\"mat\">0,97 · " + fmt(vEf(), 1) + " = " + fmt(raiz(), 2) + "</span>. " +
        "Dale <strong>Un paso de Newton</strong> para que la Parca la busque."
      );
    };

    slider.addEventListener("input", () => {
      v = Number(slider.value);
      ultimoPaso = null;
      actualizar(
        "La bruja va a <span class=\"mat\">" + v + " px/s</span>" +
        (v < 5 ? " (mínimo 5 px/s en el código)" : "") +
        ". La raíz se movió a <span class=\"mat\">0,97 · " + fmt(vEf(), 1) + " = " +
        fmt(raiz(), 2) + "</span>. La Parca todavía está en <span class=\"mat\">x_n = " +
        fmt(xN, 1) + "</span>: dale un paso para que la persiga."
      );
    });

    btnPaso.addEventListener("click", () => {
      const antes = xN;
      const fAntes = antes - FACTOR * vEf();
      const calculada = raiz();
      xN = final();
      ultimoPaso = { antes, f: fAntes, despues: xN };
      const recorte = Math.abs(calculada - xN) > 0.0001
        ? " El resultado matemático era <span class=\"mat\">" + fmt(calculada, 2) +
          "</span>, pero el límite 70–400 lo dejó en <strong>" + fmt(xN, 1) + " px/s</strong>."
        : "";
      actualizar(
        "Paso de Newton: <span class=\"mat\">f(" + fmt(antes, 1) + ") = " + fmt(antes, 1) +
        " − 0,97 · " + fmt(vEf(), 1) + " = " + fmt(fAntes, 2) + "</span> y " +
        "<span class=\"mat\">f′ = 1</span>. Entonces <span class=\"mat\">x<sub>n+1</sub> = " +
        fmt(antes, 1) + " − " + fmt(fAntes, 2) + " = " + fmt(calculada, 2) + "</span>." +
        recorte + " La Parca queda en <strong>" + fmt(xN, 1) + " px/s</strong>."
      );
    });

    btnAvanzar.addEventListener("click", () => {
      const cambio = vEf() - xN;
      const antes = gap;
      gap = clamp(gap + cambio, 0, GAP_MAX);
      let mensaje =
        "Durante 1 s, la brecha cambia en <span class=\"mat\">v − x_n = " +
        fmt(vEf(), 1) + " − " + fmt(xN, 1) + " = " + fmt(cambio, 1) + "</span> px. " +
        "Pasó de <strong>" + Math.round(antes) + " px</strong> a <strong>" +
        Math.round(gap) + " px</strong>.";
      if (gap <= 0) {
        mensaje += " La Parca te alcanzó: en este modelo recto, la distancia llegó a cero.";
      } else if (cambio < 0) {
        mensaje += " La brecha se cierra: la Parca es más rápida que la bruja en este instante.";
      } else if (cambio > 0) {
        mensaje += " La brecha se agranda: la bruja es más rápida que la Parca.";
      } else {
        mensaje += " La brecha no cambia: van a la misma velocidad.";
      }
      actualizar(mensaje);
    });

    btnReset.addEventListener("click", () => {
      xN = 290;
      gap = GAP_INICIAL;
      ultimoPaso = null;
      actualizar(mensajeInicial());
    });

    if ("ResizeObserver" in window) {
      new ResizeObserver(() => {
        medirPista();
        redibujar();
      }).observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", () => {
        medirPista();
        redibujar();
      });
    }

    actualizar(mensajeInicial());
  })();
})();
