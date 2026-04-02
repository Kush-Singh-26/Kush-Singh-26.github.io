/* visual2.js — 11 Visual Enhancements
   Variable Font · Oversized BG Text · Split Text
   Constellation · Scanlines · Depth Fog · Lava Blobs
   Progress Circuit · Transformer Diagram
   Section Particles · Avatar
*/
(function () {
    'use strict';

    /* ================================================
       UTILITY — run after DOM ready
    ================================================ */
    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    /* ================================================
       1. VARIABLE FONT BREATHING
       Wraps "Beyond." in .breathe-word span
    ================================================ */
    function initVariableFont() {
        const headline = document.querySelector('.headline');
        if (!headline) return;
        // headline HTML: "Beyond.<br><span class="accent-text">Binary.</span>"
        // We wrap the text node "Beyond." — parse the first text node
        const walker = document.createTreeWalker(headline, NodeFilter.SHOW_TEXT);
        const textNode = walker.nextNode();
        if (!textNode || !textNode.textContent.trim()) return;
        const wrap = document.createElement('span');
        wrap.className = 'breathe-word';
        textNode.replaceWith(wrap);
        wrap.appendChild(textNode);
    }

    /* ================================================
       2. OVERSIZED BACKGROUND TEXT
    ================================================ */
    function initBgWords() {
        const map = {
            'projects': 'WORK',
            'about':    'BUILD',
            'skills':   'CODE',
        };
        Object.entries(map).forEach(([id, word]) => {
            const section = document.getElementById(id);
            if (!section) return;
            const el = document.createElement('div');
            el.className = 'bg-word';
            el.setAttribute('aria-hidden', 'true');
            el.textContent = word;
            section.appendChild(el);
        });
    }

    /* ================================================
       3. OUTLINE/FILL SPLIT TEXT on "Binary."
    ================================================ */
    function initSplitText() {
        const accentEl = document.querySelector('.headline .accent-text');
        if (!accentEl) return;

        const text = accentEl.textContent; // "Binary."
        accentEl.classList.add('split-text-outer');
        accentEl.innerHTML = `
            <span class="split-text-fill">${text}</span>
            <span class="split-text-outline" aria-hidden="true">${text}</span>
        `;
        // Clear old gradient/clip from .accent-text since child handles it
        accentEl.style.background = 'none';
        accentEl.style.webkitTextFillColor = 'unset';
        accentEl.style.backgroundClip = 'unset';
    }

    /* ================================================
       4. CONSTELLATION BACKGROUND
    ================================================ */
    function initConstellation() {
        const canvas = document.getElementById('constellation-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let W, H;

        function resize() {
            W = canvas.width  = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }
        resize();
        window.addEventListener('resize', () => { resize(); buildStars(); });

        const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

        // Fixed star positions (regenerate on resize)
        let stars = [];
        function buildStars() {
            const count = Math.floor((W * H) / 9000);
            stars = Array.from({ length: count }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.1 + 0.2,
                twinkleOffset: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.3 + Math.random() * 0.7,
            }));
        }
        buildStars();

        // Slow global rotation angle
        let angle = 0;

        function draw(ts) {
            if (document.hidden) { requestAnimationFrame(draw); return; }
            ctx.clearRect(0, 0, W, H);

            angle += 0.00008; // very slow sky rotation
            const cos = Math.cos(angle), sin = Math.sin(angle);
            const cx = W / 2, cy = H / 2;
            const rgb = isLight() ? '122,98,64' : '201,168,108';
            const t = ts / 1000;

            // Rotated star positions
            const rotated = stars.map(s => {
                const dx = s.x - cx, dy = s.y - cy;
                return {
                    rx: cx + dx * cos - dy * sin,
                    ry: cy + dx * sin + dy * cos,
                    r:  s.r,
                    tw: 0.55 + 0.45 * Math.sin(t * s.twinkleSpeed + s.twinkleOffset),
                };
            });

            // Draw connections between nearby stars
            const maxDist = Math.min(W, H) * 0.12;
            ctx.lineWidth = 0.4;
            for (let i = 0; i < rotated.length; i++) {
                for (let j = i + 1; j < rotated.length; j++) {
                    const a = rotated[i], b = rotated[j];
                    const d = Math.hypot(a.rx - b.rx, a.ry - b.ry);
                    if (d < maxDist) {
                        const alpha = (1 - d / maxDist) * 0.12 * a.tw * b.tw;
                        ctx.strokeStyle = `rgba(${rgb},${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(a.rx, a.ry);
                        ctx.lineTo(b.rx, b.ry);
                        ctx.stroke();
                    }
                }
            }

            // Draw stars
            rotated.forEach(s => {
                const alpha = s.tw * (isLight() ? 0.5 : 0.7);
                ctx.beginPath();
                ctx.arc(s.rx, s.ry, s.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb},${alpha})`;
                ctx.fill();
            });

            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }

    /* ================================================
       5. SCANLINE CRT OVERLAY
       Pure CSS — just inject the element
    ================================================ */
    function initScanlines() {
        const el = document.createElement('div');
        el.className = 'scanline-overlay';
        el.setAttribute('aria-hidden', 'true');
        document.body.appendChild(el);
    }

    /* ================================================
       6. DEPTH FOG
       Sections away from viewport center get desaturated
    ================================================ */
    function initDepthFog() {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        if (!sections.length) return;

        const vh = window.innerHeight;

        function applyFog() {
            const midY = window.scrollY + vh / 2;
            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                const secMid = window.scrollY + rect.top + rect.height / 2;
                const dist = Math.abs(midY - secMid);
                // Normalize: 0 = perfectly centered, 1 = 2 viewport-heights away
                const t = Math.min(dist / (vh * 1.6), 1);
                const sat   = 100 - t * 28;           // desaturate up to 28%
                const bright = 1 - t * 0.12;           // dim up to 12%
                sec.style.filter = `saturate(${sat}%) brightness(${bright})`;
            });
        }

        window.addEventListener('scroll', applyFog, { passive: true });
        applyFog();
    }

    /* ================================================
       7. LAVA LAMP BLOBS — injected to DOM
    ================================================ */
    function initLavaBlobs() {
        const container = document.createElement('div');
        container.id = 'lava-container';
        container.setAttribute('aria-hidden', 'true');
        for (let i = 1; i <= 4; i++) {
            const blob = document.createElement('div');
            blob.className = `lava-blob lava-blob-${i}`;
            container.appendChild(blob);
        }
        document.body.appendChild(container);
    }

    /* ================================================
       8. PROGRESS-DRIVEN CIRCUIT DRAWING
    ================================================ */
    function initProgressCircuit() {
        // Build SVG circuit in right gutter
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.id = 'progress-circuit';
        svg.setAttribute('viewBox', '0 0 40 300');
        svg.setAttribute('aria-hidden', 'true');

        svg.innerHTML = `
            <defs>
                <marker id="arrowhead" markerWidth="6" markerHeight="6"
                    refX="3" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="rgba(201,168,108,0.6)"/>
                </marker>
            </defs>
            <!-- Circuit path: vertical line with bends and nodes -->
            <path id="circuit-path" d="
                M 20 10
                L 20 50
                L 10 60
                L 10 80
                L 30 90
                L 30 110
                L 20 120
                L 20 140
                L 8 150
                L 8 170
                L 32 180
                L 32 200
                L 20 210
                L 20 230
                L 14 240
                L 14 260
                L 20 270
                L 20 290
            "/>
            <!-- Nodes at key points -->
            <circle class="circuit-node" cx="20" cy="10"  r="3"/>
            <circle class="circuit-node" cx="10" cy="70"  r="2.5"/>
            <circle class="circuit-node" cx="30" cy="100" r="2.5"/>
            <circle class="circuit-node" cx="8"  cy="160" r="2.5"/>
            <circle class="circuit-node" cx="32" cy="190" r="2.5"/>
            <circle class="circuit-node" cx="14" cy="250" r="2.5"/>
            <circle class="circuit-node" cx="20" cy="290" r="3"/>
        `;
        document.body.appendChild(svg);

        const pathEl  = svg.querySelector('#circuit-path');
        const nodes   = svg.querySelectorAll('.circuit-node');
        const totalLen = pathEl.getTotalLength();

        pathEl.style.strokeDasharray  = totalLen;
        pathEl.style.strokeDashoffset = totalLen;

        function update() {
            const scrolled = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = Math.min(scrolled / maxScroll, 1);

            const offset = totalLen * (1 - progress);
            pathEl.style.strokeDashoffset = offset;

            // Light up nodes as we pass them
            nodes.forEach((node, i) => {
                const threshold = i / (nodes.length - 1);
                node.classList.toggle('lit', progress >= threshold - 0.02);
            });
        }

        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    /* ================================================
       9. LOSS LANDSCAPE VISUALIZATION
       Dynamic 3D wireframe representing optimization
    ================================================ */
    function buildLossLandscape() {
        const container = document.querySelector('.loss-landscape');
        if (!container) return;

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.classList.add('ll-svg');
        svg.setAttribute('viewBox', '0 0 720 380');
        container.appendChild(svg);

        // Grid parameters
        const cols = 24, rows = 16;
        const spacingX = 26, spacingY = 16;
        const startX = 40, startY = 60;
        const skew = 0.5;

        // State
        let currentBlobs = [];
        let nextBlobs = [];
        let morphAlpha = 1; // 1 = fully currentBlobs, 0-1 = transitioning
        let agent = { x: 0, y: 0, vx: 0, vy: 0, path: [], converged: false };
        let paths = { rows: [], cols: [] };
        let resetTimer = 0;
        let isMorphing = false;

        // Elements
        const meshGroup = document.createElementNS(svgNS, 'g');
        svg.appendChild(meshGroup);

        const pathPolyline = document.createElementNS(svgNS, 'polyline');
        pathPolyline.classList.add('ll-path');
        svg.appendChild(pathPolyline);

        const ball = document.createElementNS(svgNS, 'circle');
        ball.classList.add('ll-ball');
        ball.setAttribute('r', '5');
        svg.appendChild(ball);

        const caption = document.createElement('p');
        caption.className = 'll-caption mono-text';
        caption.textContent = '// non-convex optimization — smooth manifold transition & gravity-well physics';
        container.appendChild(caption);

        function generateBlobs() {
            const blobs = [];
            // Create a primary deep minimum
            blobs.push({
                cx: 0.3 + Math.random() * 0.4,
                cy: 0.3 + Math.random() * 0.4,
                amp: -70 - Math.random() * 50,
                sigma: 0.18 + Math.random() * 0.08
            });
            // Add random hills and valleys
            for (let i = 0; i < 7; i++) {
                blobs.push({
                    cx: Math.random(),
                    cy: Math.random(),
                    amp: (Math.random() - 0.35) * 100,
                    sigma: 0.08 + Math.random() * 0.15
                });
            }
            return blobs;
        }

        function initLandscape() {
            if (currentBlobs.length === 0) {
                currentBlobs = generateBlobs();
                nextBlobs = generateBlobs();
                morphAlpha = 1;
                resetAgent();
            } else {
                // Trigger smooth morph
                isMorphing = true;
                morphAlpha = 0;
                nextBlobs = generateBlobs();
            }
            
            // Initial mesh paths if first run
            if (meshGroup.children.length === 0) {
                paths.rows = Array.from({ length: rows }, () => {
                    const p = document.createElementNS(svgNS, 'path');
                    p.classList.add('ll-mesh');
                    meshGroup.appendChild(p);
                    return p;
                });
                paths.cols = Array.from({ length: cols }, () => {
                    const p = document.createElementNS(svgNS, 'path');
                    p.classList.add('ll-mesh');
                    meshGroup.appendChild(p);
                    return p;
                });
            }
        }

        function resetAgent() {
            let bestX = 0, bestY = 0, maxZ = -Infinity;
            for (let i = 0; i < 30; i++) {
                let rx = Math.random(), ry = Math.random();
                let rz = getZ(rx, ry);
                if (rz > maxZ) { maxZ = rz; bestX = rx; bestY = ry; }
            }
            agent = { x: bestX, y: bestY, vx: 0, vy: 0, path: [], converged: false };
            resetTimer = 0;
        }

        function getZ(nx, ny) {
            const calculateZ = (blobs) => {
                let z = 0;
                blobs.forEach(b => {
                    const dx = nx - b.cx, dy = ny - b.cy;
                    const d2 = dx*dx + dy*dy;
                    z += b.amp * Math.exp(-d2 / (2 * b.sigma * b.sigma));
                });
                return z;
            };

            const z1 = calculateZ(currentBlobs);
            const z2 = calculateZ(nextBlobs);
            
            // Interpolate between landscapes
            let z = z1 * (1 - morphAlpha) + z2 * morphAlpha;

            // Boundary Precautions: Add steep upward curve near edges to prevent sticking
            const b = 0.15; // border width
            const intensity = 45;
            if (nx < b) z += Math.pow((b - nx) / b, 2) * intensity;
            if (nx > 1 - b) z += Math.pow((nx - (1 - b)) / b, 2) * intensity;
            if (ny < b) z += Math.pow((b - ny) / b, 2) * intensity;
            if (ny > 1 - b) z += Math.pow((ny - (1 - b)) / b, 2) * intensity;

            z += (nx + ny) * 5; // Gentle tilt
            return z;
        }

        function getGradient(nx, ny) {
            const eps = 0.01;
            const dzdx = (getZ(nx + eps, ny) - getZ(nx - eps, ny)) / (2 * eps);
            const dzdy = (getZ(nx, ny + eps) - getZ(nx, ny - eps)) / (2 * eps);
            return { dx: dzdx, dy: dzdy };
        }

        function project(nx, ny, z) {
            const x = startX + (nx * cols * spacingX) + (ny * rows * spacingX * skew);
            const y = startY + (ny * rows * spacingY) - z;
            return { x, y };
        }

        function update() {
            if (document.hidden || !container.classList.contains('visible')) return;

            // 0. Handle Topography Morphing
            if (isMorphing) {
                morphAlpha += 0.015;
                if (morphAlpha >= 1) {
                    morphAlpha = 1;
                    isMorphing = false;
                    currentBlobs = nextBlobs;
                    resetAgent();
                }
            }

            // 1. Update Agent (Physics-based rolling)
            if (!agent.converged && !isMorphing) {
                const grad = getGradient(agent.x, agent.y);
                
                const gravity = 0.0001; 
                const friction = 0.94;
                
                agent.vx = (agent.vx - grad.dx * gravity) * friction;
                agent.vy = (agent.vy - grad.dy * gravity) * friction;
                
                agent.x += agent.vx;
                agent.y += agent.vy;
                
                // Physical collision with boundaries
                if (agent.x < 0) { agent.x = 0; agent.vx *= -0.2; }
                if (agent.x > 1) { agent.x = 1; agent.vx *= -0.2; }
                if (agent.y < 0) { agent.y = 0; agent.vy *= -0.2; }
                if (agent.y > 1) { agent.y = 1; agent.vy *= -0.2; }

                const p = project(agent.x, agent.y, getZ(agent.x, agent.y));
                agent.path.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
                if (agent.path.length > 150) agent.path.shift();

                const speed = Math.sqrt(agent.vx * agent.vx + agent.vy * agent.vy);
                const gradMag = Math.sqrt(grad.dx * grad.dx + grad.dy * grad.dy);
                
                if (speed < 0.0003 && gradMag < 0.12) {
                    agent.converged = true;
                }
            } else if (agent.converged) {
                resetTimer++;
                if (resetTimer > 180) initLandscape();
            }

            // 2. Render Mesh
            paths.rows.forEach((path, r) => {
                let d = '';
                for (let c = 0; c < cols; c++) {
                    const nx = c / (cols - 1), ny = r / (rows - 1);
                    const p = project(nx, ny, getZ(nx, ny));
                    d += (c === 0 ? 'M' : 'L') + `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                }
                path.setAttribute('d', d);
            });
            paths.cols.forEach((path, c) => {
                let d = '';
                for (let r = 0; r < rows; r++) {
                    const nx = c / (cols - 1), ny = r / (rows - 1);
                    const p = project(nx, ny, getZ(nx, ny));
                    d += (r === 0 ? 'M' : 'L') + `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
                }
                path.setAttribute('d', d);
            });

            // 3. Render Agent
            const curP = project(agent.x, agent.y, getZ(agent.x, agent.y));
            ball.setAttribute('cx', curP.x);
            ball.setAttribute('cy', curP.y);
            ball.style.opacity = agent.converged ? (Math.sin(Date.now() / 200) * 0.5 + 0.5) : 1;
            pathPolyline.setAttribute('points', agent.path.join(' '));
        }

        initLandscape();
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    container.classList.add('visible');
                    if (!container._iv) container._iv = setInterval(update, 32);
                } else {
                    clearInterval(container._iv);
                    container._iv = null;
                }
            });
        }, { threshold: 0.1 });
        obs.observe(container);
    }

    function initLossLandscape() {
        const about = document.getElementById('about');
        if (!about) return;
        const wrap = document.createElement('div');
        wrap.className = 'loss-landscape';
        const terminal = about.querySelector('.interactive-terminal');
        if (terminal) terminal.after(wrap);
        else about.querySelector('.content-block')?.appendChild(wrap);
        buildLossLandscape();
    }

    /* ================================================
       10. SECTION DIVIDER PARTICLES
    ================================================ */
    function initDividerParticles() {
        const dividers = document.querySelectorAll('.section-divider');

        function burst(divider) {
            const rect = divider.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2 + window.scrollY;

            const count = 10;
            for (let i = 0; i < count; i++) {
                const p = document.createElement('div');
                p.className = 'divider-particle';
                const angle = (i / count) * Math.PI * 2;
                const speed = 2 + Math.random() * 3.5;
                const size = 2 + Math.random() * 3;

                p.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    left: ${cx}px;
                    top: ${cy}px;
                    position: absolute;
                    background: hsl(${36 + Math.random() * 20}, 65%, ${55 + Math.random() * 20}%);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 500;
                `;
                document.body.appendChild(p);

                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed;
                let x = 0, y = 0, op = 1;

                const iv = setInterval(() => {
                    x += vx;
                    y += vy;
                    op -= 0.035;
                    p.style.transform = `translate(${x}px, ${y}px)`;
                    p.style.opacity = op;
                    if (op <= 0) { clearInterval(iv); p.remove(); }
                }, 16);
            }
        }

        // Observe each divider — burst once as it crosses viewport center
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting && !e.target._bursted) {
                    e.target._bursted = true;
                    burst(e.target);
                    // Reset after a delay so it can burst again on scroll back
                    setTimeout(() => { e.target._bursted = false; }, 3000);
                }
            });
        }, { threshold: 0.9 });

        dividers.forEach(d => obs.observe(d));
    }

    /* ================================================
       11. AVATAR
       Inserts avatar before the about section text
    ================================================ */
    function initAvatar() {
        const about = document.getElementById('about');
        if (!about) return;

        const contentBlock = about.querySelector('.content-block');
        if (!contentBlock) return;

        const wrap = document.createElement('div');
        wrap.className = 'avatar-wrap';

        // Use a placeholder monogram — replace src with real photo path if available
        // To use a real photo: <img class="avatar-img" src="assets/img/photo.jpg" alt="Kush Singh">
        const placeholder = document.createElement('div');
        placeholder.className = 'avatar-placeholder';
        placeholder.setAttribute('aria-label', 'Kush Singh');
        placeholder.textContent = 'KS';
        wrap.appendChild(placeholder);

        // Insert at top of content block
        contentBlock.insertBefore(wrap, contentBlock.firstChild);

        // Also wrap in a centering div
        wrap.style.display = 'block';
        wrap.style.margin = '0 auto 2rem';
    }

    /* ================================================
       INIT ALL
    ================================================ */
    ready(() => {
        initVariableFont();
        initBgWords();
        initSplitText();
        initConstellation();
        initScanlines();
        initDepthFog();
        initLavaBlobs();
        initProgressCircuit();
        initDividerParticles();
        initAvatar();
        // Loss Landscape visualization after a tick (needs DOM stable)
        setTimeout(initLossLandscape, 50);
    });

})();