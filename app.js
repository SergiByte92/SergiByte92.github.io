(() => {
  const STACK_COLORS = ["#223041", "#334155", "#4d6074", "#66788e", "#8090a2", "#9aa8b7"];

  const FALLBACK_STACK_DATA = {
    profile: "Sergi Garcia",
    scale: { min: 0, max: 10 },
    focus: [
      { label: "Backend (.NET/C#)", value: 32 },
      { label: "Data (PostgreSQL/EF Core)", value: 22 },
      { label: "Sistemas (VirtualBox/Linux/Windows)", value: 14 },
      { label: "Python (scripts/algoritmos)", value: 10 },
      { label: "Frontend basico (HTML/CSS/JS)", value: 8 },
      { label: "DevOps basico (Docker/Git)", value: 14 }
    ],
    metrics: [
      {
        id: "backend_dotnet",
        label: "Backend (.NET/C#)",
        score: 9,
        evidence: ["APIs REST", "DTOs", "Validacion", "Manejo de errores", "Clean Architecture"]
      },
      {
        id: "data_sql",
        label: "Data (PostgreSQL/EF Core)",
        score: 8,
        evidence: ["Modelado relacional", "FKs", "Indices", "Query shaping"]
      },
      {
        id: "systems",
        label: "Sistemas (VirtualBox/Linux/Windows)",
        score: 6,
        evidence: ["VirtualBox", "CLI", "Permisos", "Redes basicas"]
      },
      {
        id: "python",
        label: "Python (scripts/algoritmos)",
        score: 6,
        evidence: ["Automatizacion", "Utilidades", "Algoritmos academicos"]
      },
      {
        id: "frontend_basic",
        label: "Frontend basico (HTML/CSS/JS)",
        score: 5,
        evidence: ["Web estatica", "Interacciones simples"]
      },
      {
        id: "devops_basic",
        label: "DevOps basico (Docker/Git)",
        score: 6,
        evidence: ["Contenedores basicos", "Flujo Git", "Deploy en Vercel"]
      }
    ]
  };

  const yearNode = document.getElementById("year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  loadStackData()
    .then((data) => renderStackSection(data))
    .catch(() => renderStackSection(FALLBACK_STACK_DATA));

  initBackgroundNetwork();

  async function loadStackData() {
    try {
      const response = await fetch("data/stack-metrics.json", { cache: "no-store" });
      if (!response.ok) {
        return FALLBACK_STACK_DATA;
      }

      const data = await response.json();
      if (!data || !Array.isArray(data.metrics) || !Array.isArray(data.focus)) {
        return FALLBACK_STACK_DATA;
      }

      return data;
    } catch {
      return FALLBACK_STACK_DATA;
    }
  }

  function renderStackSection(data) {
    const chartNode = document.getElementById("stack-chart");
    const evidenceNode = document.getElementById("stack-evidence");

    if (!chartNode || !evidenceNode) {
      return;
    }

    chartNode.innerHTML = "";
    evidenceNode.innerHTML = "";

    chartNode.appendChild(createStackVisual(data.focus, data.profile));
    evidenceNode.appendChild(createEvidenceIntro(data.scale));

    for (const metric of data.metrics) {
      evidenceNode.appendChild(createEvidenceCard(metric, data.scale));
    }
  }

  function createStackVisual(focus, profile) {
    const wrapper = document.createElement("div");
    wrapper.className = "stack-visual";

    const total = focus.reduce((sum, item) => sum + Math.max(0, item.value || 0), 0);
    const segments = focus.map((item, index) => ({
      ...item,
      color: STACK_COLORS[index % STACK_COLORS.length],
      share: formatShare(item.value, total),
      ratio: total ? Math.max(0, item.value || 0) / total : 0
    }));
    const defaultIndex = getDominantSegmentIndex(segments);

    const donutWrap = document.createElement("div");
    donutWrap.className = "stack-donut-wrap";

    const donut = document.createElement("div");
    donut.className = "stack-donut";
    donut.setAttribute("aria-label", buildFocusAriaLabel(focus, total));

    const svgNs = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNs, "svg");
    svg.classList.add("stack-donut__svg");
    svg.setAttribute("viewBox", "0 0 240 240");

    const track = document.createElementNS(svgNs, "circle");
    track.classList.add("stack-donut__track");
    track.setAttribute("cx", "120");
    track.setAttribute("cy", "120");
    track.setAttribute("r", "78");

    const slicesGroup = document.createElementNS(svgNs, "g");
    slicesGroup.classList.add("stack-donut__slices");
    slicesGroup.setAttribute("transform", "rotate(-90 120 120)");

    const sliceNodes = [];
    const circumference = 2 * Math.PI * 78;
    const segmentGap = segments.length > 1 ? 4 : 0;
    let cursor = 0;

    segments.forEach((segment, index) => {
      const slice = document.createElementNS(svgNs, "circle");
      slice.classList.add("stack-donut__slice");
      slice.setAttribute("cx", "120");
      slice.setAttribute("cy", "120");
      slice.setAttribute("r", "78");
      slice.setAttribute("tabindex", "0");
      slice.setAttribute("role", "button");
      slice.setAttribute("aria-label", `${segment.label}, ${segment.share}% del foco`);
      slice.style.stroke = segment.color;

      const rawLength = circumference * segment.ratio;
      const visibleLength = Math.max(0, rawLength - segmentGap);
      const centerAngle = -Math.PI / 2 + ((cursor + rawLength / 2) / circumference) * Math.PI * 2;

      slice.setAttribute("stroke-dasharray", `${visibleLength.toFixed(2)} ${circumference.toFixed(2)}`);
      slice.setAttribute("stroke-dashoffset", `${(-cursor).toFixed(2)}`);
      slice.style.setProperty("--shift-x", `${(Math.cos(centerAngle) * 7).toFixed(2)}px`);
      slice.style.setProperty("--shift-y", `${(Math.sin(centerAngle) * 7).toFixed(2)}px`);

      slicesGroup.appendChild(slice);
      sliceNodes.push(slice);
      cursor += rawLength;

      if (segment.ratio <= 0) {
        slice.classList.add("is-empty");
        slice.setAttribute("tabindex", "-1");
        slice.removeAttribute("role");
      }
    });

    svg.append(track, slicesGroup);

    const center = document.createElement("div");
    center.className = "stack-donut__center";

    const eyebrow = document.createElement("span");
    eyebrow.className = "stack-donut__eyebrow";
    eyebrow.textContent = profile || "Stack";

    const value = document.createElement("strong");
    value.className = "stack-donut__value";
    value.textContent = "0%";

    const label = document.createElement("span");
    label.className = "stack-donut__label";
    label.textContent = "Sin datos";

    const hint = document.createElement("span");
    hint.className = "stack-donut__hint";
    hint.textContent = "Pasa el raton por cada bloque";

    center.append(eyebrow, value, label, hint);
    donut.append(svg, center);
    donutWrap.appendChild(donut);

    const summary = document.createElement("div");
    summary.className = "stack-summary";

    const copy = document.createElement("p");
    copy.className = "stack-summary__copy";
    copy.textContent = buildFocusSummary(focus, total);

    const legend = document.createElement("ul");
    legend.className = "stack-legend";

    const legendNodes = [];
    segments.forEach((segment) => {
      const item = createLegendItem(segment);
      legendNodes.push(item);
      legend.appendChild(item);
    });

    function applyActiveState(index) {
      const segment = segments[index];

      sliceNodes.forEach((node, nodeIndex) => {
        node.classList.toggle("is-active", nodeIndex === index);
        node.classList.toggle("is-dimmed", index !== -1 && nodeIndex !== index);
      });

      legendNodes.forEach((node, nodeIndex) => {
        node.classList.toggle("is-active", nodeIndex === index);
        node.classList.toggle("is-dimmed", index !== -1 && nodeIndex !== index);
      });

      if (!segment) {
        value.textContent = "0%";
        label.textContent = "Sin datos";
        copy.textContent = "No hay datos suficientes para resumir el stack.";
        return;
      }

      value.textContent = `${segment.share}%`;
      label.textContent = simplifyLabel(segment.label);
      copy.textContent = buildSegmentSummary(segment);
    }

    function resetActiveState() {
      applyActiveState(defaultIndex);
    }

    function handleBlurReset() {
      requestAnimationFrame(() => {
        if (!wrapper.contains(document.activeElement)) {
          resetActiveState();
        }
      });
    }

    sliceNodes.forEach((node, index) => {
      node.addEventListener("mouseenter", () => applyActiveState(index));
      node.addEventListener("focus", () => applyActiveState(index));
      node.addEventListener("blur", handleBlurReset);
    });

    legendNodes.forEach((node, index) => {
      node.addEventListener("mouseenter", () => applyActiveState(index));
      node.addEventListener("focus", () => applyActiveState(index));
      node.addEventListener("blur", handleBlurReset);
    });

    donutWrap.addEventListener("mouseleave", resetActiveState);
    legend.addEventListener("mouseleave", resetActiveState);

    resetActiveState();
    summary.append(copy, legend);
    wrapper.append(donutWrap, summary);
    return wrapper;
  }

  function createEvidenceIntro(scale) {
    const intro = document.createElement("div");
    intro.className = "stack-evidence__introbox";

    const title = document.createElement("h3");
    title.className = "stack-evidence__title";
    title.textContent = "Evidencia tecnica";

    const text = document.createElement("p");
    text.className = "stack-evidence__intro";
    text.textContent = `Lectura rapida del nivel actual por bloque sobre ${scale.max}. No es humo: son senales concretas de cosas ya tocadas.`;

    intro.append(title, text);
    return intro;
  }

  function createLegendItem(item) {
    const entry = document.createElement("li");
    entry.className = "stack-legend__item";
    entry.setAttribute("tabindex", "0");
    entry.setAttribute("role", "button");
    entry.setAttribute("aria-label", `${item.label}, ${item.share}% del foco`);

    const dot = document.createElement("span");
    dot.className = "stack-legend__dot";
    dot.style.background = item.color;

    const label = document.createElement("span");
    label.className = "stack-legend__label";
    label.textContent = item.label;

    const value = document.createElement("span");
    value.className = "stack-legend__value";
    value.textContent = `${item.share}%`;

    entry.append(dot, label, value);
    return entry;
  }

  function createEvidenceCard(metric, scale) {
    const card = document.createElement("article");
    card.className = "evidence-card";

    const head = document.createElement("div");
    head.className = "evidence-card__head";

    const title = document.createElement("h4");
    title.textContent = metric.label;

    const score = document.createElement("span");
    score.className = "evidence-card__score";
    score.textContent = `${metric.score}/${scale.max}`;

    const list = document.createElement("ul");
    list.className = "evidence-list";

    for (const point of metric.evidence) {
      const li = document.createElement("li");
      li.textContent = point;
      list.appendChild(li);
    }

    head.append(title, score);
    card.append(head, list);
    return card;
  }

  function buildFocusAriaLabel(focus, total) {
    if (!focus.length || total <= 0) {
      return "Grafico circular del stack sin datos";
    }

    const parts = focus.map((item) => `${item.label}: ${formatShare(item.value, total)} por ciento`);
    return `Grafico circular del stack. ${parts.join(". ")}`;
  }

  function buildFocusSummary(focus, total) {
    if (!focus.length || total <= 0) {
      return "No hay datos suficientes para resumir el stack.";
    }

    const ordered = [...focus].sort((a, b) => b.value - a.value);
    const primary = ordered[0];
    const secondary = ordered[1];

    if (!secondary) {
      return `${simplifyLabel(primary.label)} concentra ${formatShare(primary.value, total)}% del foco actual.`;
    }

    return `${simplifyLabel(primary.label)} lleva el peso principal con ${formatShare(primary.value, total)}%, seguido de ${simplifyLabel(secondary.label)} con ${formatShare(secondary.value, total)}%.`;
  }

  function buildSegmentSummary(segment) {
    if (!segment) {
      return "No hay datos suficientes para resumir el stack.";
    }

    return `${simplifyLabel(segment.label)} representa ${segment.share}% del foco actual. Pasa por otro bloque para comparar prioridades.`;
  }

  function getDominantSegmentIndex(segments) {
    return segments.reduce((bestIndex, segment, index, list) => {
      if (bestIndex === -1 || segment.value > list[bestIndex].value) {
        return index;
      }

      return bestIndex;
    }, -1);
  }

  function formatShare(value, total) {
    if (!total) {
      return 0;
    }

    return Math.round((Math.max(0, value || 0) / total) * 100);
  }

  function simplifyLabel(label) {
    return String(label || "").split("(")[0].trim() || "Bloque";
  }

  function initBackgroundNetwork() {
    const canvas = document.getElementById("bg");
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state = {
      w: 0,
      h: 0,
      nodes: [],
      mouse: { x: null, y: null },
      cfg: {
        nodeCount: 44,
        maxDist: 130,
        speed: 0.16,
        mouseInfluenceDist: 160
      }
    };

    function resize() {
      state.w = Math.floor(window.innerWidth);
      state.h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(state.w * dpr);
      canvas.height = Math.floor(state.h * dpr);
      canvas.style.width = `${state.w}px`;
      canvas.style.height = `${state.h}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function random(min, max) {
      return min + Math.random() * (max - min);
    }

    function createNodes() {
      const nodes = [];
      for (let i = 0; i < state.cfg.nodeCount; i++) {
        nodes.push({
          x: random(0, state.w),
          y: random(0, state.h),
          vx: random(-1, 1) * state.cfg.speed,
          vy: random(-1, 1) * state.cfg.speed,
          r: random(1.2, 2.3)
        });
      }
      state.nodes = nodes;
    }

    function draw() {
      context.clearRect(0, 0, state.w, state.h);

      for (const node of state.nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > state.w) node.vx *= -1;
        if (node.y < 0 || node.y > state.h) node.vy *= -1;

        node.x = Math.max(0, Math.min(state.w, node.x));
        node.y = Math.max(0, Math.min(state.h, node.y));
      }

      for (let i = 0; i < state.nodes.length; i++) {
        for (let j = i + 1; j < state.nodes.length; j++) {
          const a = state.nodes[i];
          const b = state.nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);

          if (distance > state.cfg.maxDist) continue;

          const alpha = 1 - distance / state.cfg.maxDist;
          context.strokeStyle = `rgba(51,65,85,${0.24 * alpha})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(a.x, a.y);
          context.lineTo(b.x, b.y);
          context.stroke();
        }
      }

      const mx = state.mouse.x;
      const my = state.mouse.y;

      for (const node of state.nodes) {
        let glow = 0;
        if (mx != null && my != null) {
          const distance = Math.hypot(node.x - mx, node.y - my);
          if (distance < state.cfg.mouseInfluenceDist) {
            glow = 1 - distance / state.cfg.mouseInfluenceDist;
          }
        }

        context.fillStyle = "rgba(30,41,59,0.48)";
        context.beginPath();
        context.arc(node.x, node.y, node.r, 0, Math.PI * 2);
        context.fill();

        if (glow > 0) {
          context.strokeStyle = `rgba(71,85,105,${0.33 * glow})`;
          context.lineWidth = 1.8;
          context.beginPath();
          context.arc(node.x, node.y, node.r + 3 + 6 * glow, 0, Math.PI * 2);
          context.stroke();
        }
      }
    }

    function animate() {
      draw();
      if (!prefersReducedMotion) {
        requestAnimationFrame(animate);
      }
    }

    window.addEventListener("resize", () => {
      resize();
      createNodes();
    });

    window.addEventListener("mousemove", (event) => {
      state.mouse.x = event.clientX;
      state.mouse.y = event.clientY;
    });

    window.addEventListener("mouseleave", () => {
      state.mouse.x = null;
      state.mouse.y = null;
    });

    resize();
    createNodes();
    animate();
  }
})();
