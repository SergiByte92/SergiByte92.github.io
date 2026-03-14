(() => {
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      initIntersectionReveal();
      const network = initNetworkBackground(prefersReducedMotion);
      initSectionNetworkReactions(network);
      initProjectsCarousel(prefersReducedMotion);

      // Reveal de secciones: ejecuta una sola vez al entrar en viewport.
      function initIntersectionReveal() {
        const items = document.querySelectorAll("[data-reveal]");
        const revealObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }

            const delay = Number(entry.target.getAttribute("data-delay") || 0);
            entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        }, {
          threshold: 0.2,
          rootMargin: "0px 0px -10% 0px"
        });

        for (const item of items) {
          item.classList.add("reveal");
          revealObserver.observe(item);
        }
      }

      // Fondo de nodos: movimiento organico y conexiones por distancia real.
      function initNetworkBackground(reducedMotion) {
        const canvas = document.getElementById("network-bg");
        const ctx = canvas.getContext("2d", { alpha: true });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const baseNodes = window.innerWidth < 768 ? 34 : 58;
        const interactionRadius = 120;
        const interactionRadiusSq = interactionRadius * interactionRadius;
        const mouse = { x: null, y: null };
        const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
        const isTouchDevice = hasCoarsePointer || navigator.maxTouchPoints > 0;

        const state = {
          width: 0,
          height: 0,
          nodes: [],
          reducedMotion,
          mode: "hero",
          modeTransition: null,
          modeConfig: {
            speed: 1.08,
            threshold: 132,
            glowBoost: 0.16,
            drift: 0.015
          }
        };

        function lerp(start, end, amount) {
          return start + (end - start) * amount;
        }

        const modeMap = {
          hero: { speed: 1.08, threshold: 132, glowBoost: 0.16, drift: 0.015 },
          perfil: { speed: 1.02, threshold: 128, glowBoost: 0.18, drift: 0.012 },
          stack: { speed: 1.1, threshold: 138, glowBoost: 0.3, drift: 0.014 },
          educacion: { speed: 1.1, threshold: 146, glowBoost: 0.22, drift: 0.017 },
          proyectos: { speed: 1.16, threshold: 158, glowBoost: 0.24, drift: 0.02 },
          experiencia: { speed: 1.08, threshold: 146, glowBoost: 0.2, drift: 0.014 },
          contacto: { speed: 0.94, threshold: 124, glowBoost: 0.14, drift: 0.01 }
        };

        function resize() {
          state.width = window.innerWidth;
          state.height = window.innerHeight;

          canvas.width = Math.floor(state.width * dpr);
          canvas.height = Math.floor(state.height * dpr);
          canvas.style.width = `${state.width}px`;
          canvas.style.height = `${state.height}px`;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

          const targetCount = Math.max(16, Math.round(baseNodes * (state.reducedMotion ? 0.55 : 1)));
          state.nodes = createNodes(targetCount);
        }

        // Crea nodos con velocidad base y radio para pintar puntos sobrios.
        function createNodes(count) {
          const nodes = [];
          for (let i = 0; i < count; i += 1) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.24 + Math.random() * 0.36;
            const baseRadius = 1 + Math.random() * 1.8;
            nodes.push({
              x: Math.random() * state.width,
              y: Math.random() * state.height,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              radius: baseRadius,
              baseRadius,
              opacityBoost: 0,
              proximity: 0,
              seed: Math.random() * Math.PI * 2
            });
          }
          return nodes;
        }

        // Interpola el modo actual para cambiar el fondo por seccion sin saltos.
        function setMode(modeName) {
          const nextMode = modeMap[modeName];
          if (!nextMode || modeName === state.mode) {
            return;
          }

          state.mode = modeName;
          state.modeTransition = {
            start: performance.now(),
            duration: 620,
            from: { ...state.modeConfig },
            to: { ...nextMode }
          };
        }

        // Aplica interpolacion suave entre configuraciones.
        function updateMode() {
          if (!state.modeTransition) {
            return;
          }

          const now = performance.now();
          const t = Math.min(1, (now - state.modeTransition.start) / state.modeTransition.duration);
          const eased = 1 - Math.pow(1 - t, 3);
          const { from, to } = state.modeTransition;

          for (const key of Object.keys(to)) {
            state.modeConfig[key] = from[key] + (to[key] - from[key]) * eased;
          }

          if (t >= 1) {
            state.modeTransition = null;
          }
        }

        // Actualiza posiciones con deriva organica y rebote en bordes.
        function stepNodes() {
          const cfg = state.modeConfig;
          const speedFactor = state.reducedMotion ? 0.5 : cfg.speed;
          const now = performance.now() * 0.001;
          const canUseMouse = !isTouchDevice && mouse.x !== null && mouse.y !== null;

          for (const node of state.nodes) {
            const organicX = Math.sin(now + node.seed) * cfg.drift;
            const organicY = Math.cos(now * 0.85 + node.seed) * cfg.drift;
            node.vx += organicX;
            node.vy += organicY;

            let proximityTarget = 0;
            if (canUseMouse) {
              const dx = mouse.x - node.x;
              const dy = mouse.y - node.y;
              const distSq = dx * dx + dy * dy;

              if (distSq < interactionRadiusSq) {
                const dist = Math.sqrt(distSq);
                proximityTarget = 1 - dist / interactionRadius;

                // Atraccion muy suave hacia el cursor.
                node.vx += dx * 0.00002 * proximityTarget;
                node.vy += dy * 0.00002 * proximityTarget;

                // Cerca del cursor, el nodo desacelera ligeramente.
                const slowFactor = lerp(1, 0.92, proximityTarget);
                node.vx = lerp(node.vx, node.vx * slowFactor, 0.18);
                node.vy = lerp(node.vy, node.vy * slowFactor, 0.18);
              }
            }

            node.vx *= 0.992;
            node.vy *= 0.992;

            node.x += node.vx * speedFactor;
            node.y += node.vy * speedFactor;

            if (node.x < 0 || node.x > state.width) {
              node.vx *= -1;
            }
            if (node.y < 0 || node.y > state.height) {
              node.vy *= -1;
            }

            node.x = Math.max(0, Math.min(state.width, node.x));
            node.y = Math.max(0, Math.min(state.height, node.y));

            // Interpolacion de realce visual para evitar saltos bruscos.
            node.proximity = lerp(node.proximity, proximityTarget, 0.12);
            node.radius = lerp(node.radius, node.baseRadius * (1 + node.proximity * 0.2), 0.14);
            node.opacityBoost = lerp(node.opacityBoost, node.proximity * 0.18, 0.12);
          }
        }

        // Dibuja lineas y nodos usando solo regla por distancia:
        // distance < threshold -> linea con alpha proporcional.
        function draw() {
          ctx.clearRect(0, 0, state.width, state.height);

          const cfg = state.modeConfig;
          const threshold = cfg.threshold;
          const thresholdSq = threshold * threshold;

          for (let i = 0; i < state.nodes.length; i += 1) {
            const a = state.nodes[i];

            for (let j = i + 1; j < state.nodes.length; j += 1) {
              const b = state.nodes[j];
              const dx = a.x - b.x;
              const dy = a.y - b.y;
              const distSq = dx * dx + dy * dy;

              if (distSq >= thresholdSq) {
                continue;
              }

              const dist = Math.sqrt(distSq);
              const baseAlpha = (1 - dist / threshold) * 0.3;
              const proximityBoost = Math.max(a.proximity, b.proximity) * 0.15;
              const alpha = Math.min(0.5, baseAlpha + proximityBoost);
              ctx.strokeStyle = `rgba(30,58,95,${alpha.toFixed(3)})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }

          for (const node of state.nodes) {
            const glowLevel = cfg.glowBoost;
            const nodeAlpha = 0.35 + glowLevel * 0.55 + node.opacityBoost;
            ctx.fillStyle = `rgba(11,37,69,${Math.min(0.9, nodeAlpha).toFixed(3)})`;
            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fill();

            if (glowLevel > 0.2) {
              ctx.strokeStyle = `rgba(59,130,246,${(glowLevel * 0.22).toFixed(3)})`;
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.arc(node.x, node.y, node.radius + 3.5 + glowLevel * 3, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }

        // Loop principal del canvas con requestAnimationFrame.
        function animate() {
          if (!document.hidden) {
            updateMode();
            stepNodes();
            draw();
          }
          requestAnimationFrame(animate);
        }

        // Seguimiento de cursor desactivado en dispositivos tactiles.
        if (!isTouchDevice) {
          window.addEventListener("mousemove", (event) => {
            mouse.x = event.clientX;
            mouse.y = event.clientY;
          });

          window.addEventListener("mouseleave", () => {
            mouse.x = null;
            mouse.y = null;
          });
        }

        window.addEventListener("resize", resize);
        resize();

        if (state.reducedMotion) {
          draw();
        } else {
          animate();
        }

        return { setMode };
      }

      function initSectionNetworkReactions(network) {
        const sections = document.querySelectorAll("main section[id]");
        const observer = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) {
              continue;
            }
            network.setMode(entry.target.id);
          }
        }, {
          threshold: 0.2,
          rootMargin: "-10% 0px -35% 0px"
        });

        for (const section of sections) {
          observer.observe(section);
        }
      }

      // Tarjetas de proyectos con layout fijo y scroll horizontal nativo.
      function initProjectsCarousel(reducedMotion) {
        const track = document.getElementById("projects-track");
        if (!track) {
          return;
        }
        const shell = track.closest(".projects-shell");
        if (!shell) {
          return;
        }

        const prevButton = shell.querySelector('[data-projects-nav="prev"]');
        const nextButton = shell.querySelector('[data-projects-nav="next"]');
        const getStep = () => {
          const firstCard = track.querySelector(".project-item");
          const styles = window.getComputedStyle(track);
          const gap = parseFloat(styles.gap || "0") || 0;
          return (firstCard ? firstCard.offsetWidth : 320) + gap;
        };

        const scrollByStep = (direction) => {
          shell.scrollBy({
            left: getStep() * direction,
            behavior: reducedMotion ? "auto" : "smooth"
          });
        };

        prevButton?.addEventListener("click", () => scrollByStep(-1));
        nextButton?.addEventListener("click", () => scrollByStep(1));

        const dragHint = document.getElementById("projects-drag-hint");
        if (dragHint) {
          window.setTimeout(() => {
            dragHint.classList.add("opacity-0");
            window.setTimeout(() => {
              dragHint.remove();
            }, 500);
          }, 4000);
        }

      }
    })();

(() => {
      const button = document.getElementById("mobile-menu-button");
      const panel = document.getElementById("mobile-menu-panel");
      const overlay = document.getElementById("mobile-menu-overlay");
      const links = document.querySelectorAll(".mobile-nav-link");

      if (!button || !panel || !overlay) {
        return;
      }

      const closeMenu = () => {
        panel.classList.add("hidden");
        overlay.classList.add("hidden");
        button.setAttribute("aria-expanded", "false");
      };

      const openMenu = () => {
        panel.classList.remove("hidden");
        overlay.classList.remove("hidden");
        button.setAttribute("aria-expanded", "true");
      };

      button.addEventListener("click", () => {
        const isOpen = !panel.classList.contains("hidden");
        if (isOpen) {
          closeMenu();
          return;
        }
        openMenu();
      });

      overlay.addEventListener("click", closeMenu);

      for (const link of links) {
        link.addEventListener("click", closeMenu);
      }

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      });
    })();

