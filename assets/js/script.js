document.addEventListener('DOMContentLoaded', () => {

    /* --- THEME TOGGLE --- */
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isLight = html.getAttribute('data-theme') === 'light';
            if (isLight) {
                html.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            } else {
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });
    }

    /* --- FADE-IN OBSERVER --- */
    const fadeObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

    /* --- HERO STAGGER ANIMATION --- */
    const heroStaggers = document.querySelectorAll('.hero-content .fade-in-stagger');
    heroStaggers.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
    });
    heroStaggers.forEach((el, i) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.transition = 'opacity 1s cubic-bezier(0.16,1,0.3,1), transform 1s cubic-bezier(0.16,1,0.3,1)';
        }, 180 * (i + 1));
    });

    /* --- CURSOR GLOW --- */
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        let mX = window.innerWidth / 2, mY = window.innerHeight / 2;
        let gX = mX, gY = mY;
        (function loop() {
            gX += (mX - gX) * 0.08;
            gY += (mY - gY) * 0.08;
            cursorGlow.style.left = gX + 'px';
            cursorGlow.style.top  = gY + 'px';
            requestAnimationFrame(loop);
        })();
        document.addEventListener('mousemove', e => { mX = e.clientX; mY = e.clientY; });
        document.addEventListener('mousedown', e => {
            const r = document.createElement('div');
            r.className = 'cursor-ripple';
            r.style.left = e.clientX + 'px';
            r.style.top  = e.clientY + 'px';
            document.body.appendChild(r);
            setTimeout(() => r.remove(), 600);
        });
    }

    /* --- HERO TYPING EFFECT --- */
    const identityEl = document.querySelector('.hero-identity');
    if (identityEl) {
        const text = identityEl.innerText;
        identityEl.innerHTML = '<span class="typed-text"></span><span class="typing-cursor"></span>';
        const span = identityEl.querySelector('.typed-text');
        let i = 0;
        function type() {
            if (i < text.length) { span.textContent += text[i++]; setTimeout(type, 45 + Math.random() * 55); }
        }
        setTimeout(type, 1000);
    }

    /* --- NEURAL CANVAS --- */
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let W = canvas.width = window.innerWidth;
        let H = canvas.height = window.innerHeight;
        window.addEventListener('resize', () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        });
        const n = Math.min(Math.floor(W / 20), 70);
        const pts = Array.from({ length: n }, () => ({
            x: Math.random() * W, y: Math.random() * H,
            vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 1.2 + 0.4
        }));
        (function draw() {
            ctx.clearRect(0, 0, W, H);
            const rgb = html.getAttribute('data-theme') === 'light' ? '122,98,64' : '201,168,108';
            pts.forEach((p, i) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > W) p.vx *= -1;
                if (p.y < 0 || p.y > H) p.vy *= -1;
                ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb},0.5)`; ctx.fill();
                for (let j = i + 1; j < pts.length; j++) {
                    const q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
                    if (d < 140) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${rgb},${0.2 * (1 - d / 140)})`;
                        ctx.lineWidth = 0.5; ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(draw);
        })();
    }

    /* --- CARD SPOTLIGHT --- */
    document.querySelectorAll('.card-spotlight').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
            card.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
        });
    });

    /* --- SECTION LABEL SCRAMBLE --- */
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function scramble(el) {
        const orig = el.dataset.value || el.innerText;
        el.dataset.value = orig;
        let iter = 0;
        clearInterval(el._sc);
        el._sc = setInterval(() => {
            el.innerText = orig.split('').map((ch, idx) =>
                idx < iter ? orig[idx] : ch === ' ' ? ' ' : CHARS[Math.floor(Math.random() * 26)]
            ).join('');
            if (iter >= orig.length) clearInterval(el._sc);
            iter += 1 / 3;
        }, 28);
    }
    const scrambleObs = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) { scramble(e.target); scrambleObs.unobserve(e.target); } });
    }, { threshold: 0.8 });
    document.querySelectorAll('.section-label').forEach(el => scrambleObs.observe(el));

    /* --- HOVER GLITCH --- */
    document.querySelectorAll('.nav-links a, .social-item').forEach(link => {
        link.addEventListener('mouseenter', () => {
            const orig = link.dataset.value || link.innerText;
            if (!link.dataset.value) link.dataset.value = orig;
            let iter = 0;
            clearInterval(link._gl);
            link._gl = setInterval(() => {
                link.innerText = orig.split('').map((ch, idx) =>
                    idx < iter ? orig[idx] : ch === ' ' ? ' ' : CHARS[Math.floor(Math.random() * 26)]
                ).join('');
                if (iter >= orig.length) clearInterval(link._gl);
                iter += 1 / 2;
            }, 28);
        });
    });

    /* --- MAGNETIC LINKS --- */
    document.querySelectorAll('.nav-links a, .social-item, .nav-cta, .link-arrow').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            el.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.3}px,${(e.clientY - r.top - r.height/2) * 0.3}px) scale(1.04)`;
            el.style.transition = 'transform 0.08s cubic-bezier(0.2,0.8,0.2,1)';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1)';
        });
    });

    /* --- PARALLAX ORBS --- */
    const orbs = document.querySelectorAll('.ambient-orb');
    if (orbs.length) {
        document.addEventListener('mousemove', e => {
            const x = e.clientX / window.innerWidth - 0.5;
            const y = e.clientY / window.innerHeight - 0.5;
            orbs.forEach((orb, i) => {
                orb.style.transform = `translate(${x * (i === 0 ? 50 : -70)}px,${y * (i === 0 ? 50 : -70)}px)`;
            });
        });
    }

    /* --- SCROLL: PROGRESS + ACTIVE NAV + BACK-TO-TOP --- */
    const progressBar = document.getElementById('scroll-progress');
    const backToTop   = document.getElementById('back-to-top');
    const sections    = document.querySelectorAll('section[id]');
    const navAnchors  = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        // progress bar
        if (progressBar) {
            const s = document.documentElement.scrollTop;
            const h = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            progressBar.style.width = (s / h * 100) + '%';
        }
        // active nav
        let current = '';
        sections.forEach(sec => { if (window.scrollY >= sec.offsetTop - 320) current = sec.id; });
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
        // back-to-top
        if (backToTop) backToTop.classList.toggle('visible', window.scrollY > window.innerHeight * 0.8);
    }, { passive: true });

    /* --- SMOOTH SCROLL --- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute('href'));
            if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    /* --- BACK TO TOP CLICK --- */
    if (backToTop) backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    /* --- COPY EMAIL --- */
    const copyBtn   = document.getElementById('copy-email');
    const copyIcon  = document.getElementById('copy-icon');
    const checkIcon = document.getElementById('check-icon');
    if (copyBtn && copyIcon && checkIcon) {
        copyBtn.addEventListener('click', async () => {
            try { await navigator.clipboard.writeText('kushsingh2604@gmail.com'); } catch (_) {}
            copyIcon.style.display  = 'none';
            checkIcon.style.display = 'block';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyIcon.style.display  = 'block';
                checkIcon.style.display = 'none';
                copyBtn.classList.remove('copied');
            }, 2000);
        });
    }

    /* --- MOBILE CARD EXPAND --- */
    if (window.innerWidth <= 768) {
        document.querySelectorAll('.bento-card').forEach(card => {
            const content = card.querySelector('.card-content');
            if (!content) return;
            const body = document.createElement('div');
            body.className = 'bento-card-body';
            content.querySelectorAll('p, .stack-tags, .link-group, .card-link').forEach(el => body.appendChild(el));
            content.appendChild(body);
            const hint = document.createElement('div');
            hint.className = 'card-expand-hint';
            hint.innerHTML = 'tap to expand <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
            content.appendChild(hint);
            card.addEventListener('click', () => card.classList.toggle('expanded'));
        });
    }

    /* --- GITHUB CONTRIBUTION GRID --- */
    (async function buildContribGrid() {
        const grid = document.getElementById('contrib-grid');
        if (!grid) return;

        const WEEKS = 52, DAYS = 7;
        const username = 'Kush-Singh-26';
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let cells = null;

        try {
            const resp = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
            if (resp.ok) {
                const data = await resp.json();
                cells = (data.contributions || []).slice(-364).map(d => {
                    const c = d.count;
                    return c === 0 ? 0 : c <= 2 ? 1 : c <= 5 ? 2 : c <= 9 ? 3 : 4;
                });
            }
        } catch (_) {}

        // Seeded fallback
        if (!cells || cells.length < WEEKS * DAYS) {
            let s = username.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
            const rnd = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
            cells = [];
            for (let w = 0; w < WEEKS; w++) {
                for (let d = 0; d < DAYS; d++) {
                    const v = rnd() * (d > 0 && d < 6 ? 1.6 : 0.6) * (w > 40 ? 1.3 : 1);
                    cells.push(v < 0.45 ? 0 : v < 0.75 ? 1 : v < 0.9 ? 2 : v < 0.97 ? 3 : 4);
                }
            }
        }
        while (cells.length < WEEKS * DAYS) cells.unshift(0);

        // Month label bar
        const labelRow = document.createElement('div');
        labelRow.className = 'contrib-months mono-text';
        const now = new Date();
        let lastMo = -1;
        for (let w = 0; w < WEEKS; w++) {
            const d = new Date(now);
            d.setDate(d.getDate() - (WEEKS - 1 - w) * 7);
            const mo = d.getMonth();
            if (mo !== lastMo) {
                const lbl = document.createElement('span');
                lbl.textContent = monthNames[mo];
                lbl.style.gridColumn = (w + 1).toString();
                labelRow.appendChild(lbl);
                lastMo = mo;
            }
        }
        grid.parentElement.insertBefore(labelRow, grid);

        // Build cells with tooltips
        const frag = document.createDocumentFragment();
        for (let w = 0; w < WEEKS; w++) {
            const wkDate = new Date(now);
            wkDate.setDate(wkDate.getDate() - (WEEKS - 1 - w) * 7);
            for (let d = 0; d < DAYS; d++) {
                const cell = document.createElement('div');
                cell.className = 'contrib-cell';
                const level = cells[w * DAYS + d] ?? 0;
                cell.dataset.level = level;
                const dayDate = new Date(wkDate);
                dayDate.setDate(dayDate.getDate() - (6 - d));
                const countLabel = ['No','1–2','3–5','6–9','10+'][level];
                cell.title = `${dayDate.toDateString()} · ${countLabel} contributions`;
                frag.appendChild(cell);
            }
        }
        grid.appendChild(frag);
    })();

});