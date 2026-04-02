/* enhancements.js — Command Palette, Interactive Terminal, ASCII Hero, 3D Globe, GLSL BG */

(function () {
    'use strict';

    /* =============================================
       UTILITIES
    ============================================= */
    function showToast(msg, duration = 2200) {
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('show'), duration);
    }

    /* =============================================
       1. GLSL SHADER BACKGROUND
    ============================================= */
    function initGLSL() {
        const canvas = document.getElementById('glsl-canvas');
        if (!canvas) return;

        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) { canvas.style.display = 'none'; return; }

        function resize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        resize();
        window.addEventListener('resize', resize);

        const vsSource = `
            attribute vec2 a_pos;
            void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
        `;

        const fsSource = `
            precision mediump float;
            uniform float u_time;
            uniform vec2 u_res;
            uniform vec2 u_mouse;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            float noise(vec2 p) {
                vec2 i = floor(p), f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(hash(i), hash(i + vec2(1,0)), u.x),
                    mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
            }

            float fbm(vec2 p) {
                float v = 0.0, a = 0.5;
                for (int i = 0; i < 5; i++) {
                    v += a * noise(p);
                    p = p * 2.1 + vec2(1.7, 9.2);
                    a *= 0.5;
                }
                return v;
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / u_res;
                vec2 m = u_mouse / u_res;
                float t = u_time * 0.09;

                vec2 q = vec2(fbm(uv + t * 0.4), fbm(uv + vec2(5.2, 1.3) + t * 0.35));
                vec2 r = vec2(fbm(uv + 3.0 * q + vec2(1.7, 9.2) + t * 0.15),
                              fbm(uv + 3.0 * q + vec2(8.3, 2.8) + t * 0.12));

                float f = fbm(uv + 3.0 * r + m * 0.15);

                // Warm amber/gold palette matching --accent-primary
                vec3 col = mix(
                    vec3(0.10, 0.09, 0.08),
                    vec3(0.79, 0.66, 0.42),
                    clamp(f * f * 4.0, 0.0, 1.0)
                );
                col = mix(col, vec3(0.54, 0.71, 0.78), clamp(length(q), 0.0, 1.0));
                col = mix(col, vec3(0.89, 0.78, 0.59), clamp(length(r.x), 0.0, 1.0));

                gl_FragColor = vec4(col * 0.18, 1.0);
            }
        `;

        function compileShader(src, type) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        }

        const prog = gl.createProgram();
        gl.attachShader(prog, compileShader(vsSource, gl.VERTEX_SHADER));
        gl.attachShader(prog, compileShader(fsSource, gl.FRAGMENT_SHADER));
        gl.linkProgram(prog);
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

        const aPosLoc = gl.getAttribLocation(prog, 'a_pos');
        gl.enableVertexAttribArray(aPosLoc);
        gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

        const uTime  = gl.getUniformLocation(prog, 'u_time');
        const uRes   = gl.getUniformLocation(prog, 'u_res');
        const uMouse = gl.getUniformLocation(prog, 'u_mouse');

        let mx = 0, my = 0;
        document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

        let start = performance.now();
        (function loop() {
            if (!document.hidden) {
                const t = (performance.now() - start) / 1000;
                gl.uniform1f(uTime, t);
                gl.uniform2f(uRes, canvas.width, canvas.height);
                gl.uniform2f(uMouse, mx, canvas.height - my);
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            }
            requestAnimationFrame(loop);
        })();
    }

    /* =============================================
       2. ASCII HERO
    ============================================= */
    function initASCII() {
        const el = document.getElementById('ascii-canvas');
        if (!el) return;

        // "KUSH" in a compact block font using ASCII art
        const frames = [
`██╗  ██╗██╗   ██╗███████╗██╗  ██╗
██║ ██╔╝██║   ██║██╔════╝██║  ██║
█████╔╝ ██║   ██║███████╗███████║
██╔═██╗ ██║   ██║╚════██║██╔══██║
██║  ██╗╚██████╔╝███████║██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝`,

`▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ █▄▀ █ █ █▀▀ █  █
█ █ █ ▀▄▀ ▀▀▄ █▀▀█
█▀▀▀▀ █  █ ▀▀▀ █  █
▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀`,
        ];

        // We'll use a single deterministic frame and add a glitch/dissolve effect
        const text = frames[0];
        const lines = text.split('\n');
        const CHARS = '░▒▓█▄▀╗╝╔╚║═▐▌';

        let glitching = false;
        let originalLines = lines.slice();

        function render(lns) {
            el.textContent = lns.join('\n');
        }

        render(lines);

        // Glitch on hover
        el.addEventListener('mouseenter', () => {
            if (glitching) return;
            glitching = true;
            let iter = 0;
            const maxIter = 18;
            const iv = setInterval(() => {
                const glitched = originalLines.map((line, li) => {
                    const progress = iter / maxIter;
                    return line.split('').map((ch, ci) => {
                        // dissolve from edges inward as iter increases
                        const distFromCenter = Math.abs(ci - line.length / 2) / (line.length / 2);
                        const threshold = 1 - progress;
                        if (distFromCenter > threshold && ch !== ' ') {
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        }
                        return ch;
                    }).join('');
                });
                render(glitched);
                iter++;
                if (iter > maxIter) clearInterval(iv);
            }, 35);
        });

        el.addEventListener('mouseleave', () => {
            glitching = false;
            // Reassemble
            let iter = 0;
            const maxIter = 20;
            const iv = setInterval(() => {
                const reassembled = originalLines.map((line) => {
                    const progress = iter / maxIter;
                    return line.split('').map((ch, ci) => {
                        const distFromCenter = Math.abs(ci - line.length / 2) / (line.length / 2);
                        const threshold = progress;
                        if (distFromCenter > threshold && ch !== ' ' && Math.random() > 0.5) {
                            return CHARS[Math.floor(Math.random() * CHARS.length)];
                        }
                        return ch;
                    }).join('');
                });
                render(reassembled);
                iter++;
                if (iter > maxIter) { render(originalLines); glitching = false; clearInterval(iv); }
            }, 30);
        });

        // Ambient micro-glitch every ~7s
        setInterval(() => {
            if (glitching) return;
            const lineIdx = Math.floor(Math.random() * lines.length);
            const orig = originalLines[lineIdx];
            const glitched = orig.split('').map((ch, i) => {
                return Math.random() < 0.06 && ch !== ' ' ? CHARS[Math.floor(Math.random() * CHARS.length)] : ch;
            }).join('');
            const temp = [...originalLines];
            temp[lineIdx] = glitched;
            render(temp);
            setTimeout(() => render(originalLines), 120);
        }, 7000);
    }

    /* =============================================
       3. 3D SKILL GLOBE (Three.js)
    ============================================= */
    function initGlobe() {
        const container = document.getElementById('globe-container');
        if (!container || typeof THREE === 'undefined') return;

        const skills = [
            'C++', 'Python', 'PyTorch', 'Golang', 'SIMD/AVX2',
            'LLMs', 'LoRA', 'GGUF', 'NumPy', 'Transformers',
            'KV-Cache', 'Docker', 'Linux', 'Git', 'CUDA',
        ];

        const W = container.offsetWidth;
        const H = container.offsetHeight;

        const renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('globe-canvas'),
            alpha: true,
            antialias: true
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.z = 2.8;

        // Determine accent color from CSS variable
        const accentHex = '#c9a86c';

        // Sphere wireframe
        const sphereGeo = new THREE.SphereGeometry(1, 20, 16);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: 0xc9a86c,
            wireframe: true,
            transparent: true,
            opacity: 0.06
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        scene.add(sphere);

        // Distribute skill labels on sphere surface using Fibonacci lattice
        const labelObjects = [];
        const N = skills.length;

        skills.forEach((skill, i) => {
            const phi = Math.acos(1 - 2 * (i + 0.5) / N);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.cos(phi);
            const z = Math.sin(phi) * Math.sin(theta);

            // Create canvas-based texture for each label
            const cvs = document.createElement('canvas');
            cvs.width = 256; cvs.height = 64;
            const ctx = cvs.getContext('2d');

            // Size based on importance (first 8 are bigger)
            const fontSize = i < 8 ? 28 : 22;
            ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
            ctx.fillStyle = i < 8 ? '#c9a86c' : '#8ab4c7';
            ctx.globalAlpha = i < 8 ? 0.9 : 0.65;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skill, 128, 32);

            const tex = new THREE.CanvasTexture(cvs);
            const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
            const sprite = new THREE.Sprite(mat);

            const radius = 1.12;
            sprite.position.set(x * radius, y * radius, z * radius);
            sprite.scale.set(0.55, 0.14, 1);

            scene.add(sprite);
            labelObjects.push({ sprite, baseX: x, baseY: y, baseZ: z });
        });

        // Mouse interaction
        let targetRotY = 0, targetRotX = 0;
        let currRotY = 0, currRotX = 0;
        let autoRotate = true;

        container.addEventListener('mousemove', (e) => {
            const r = container.getBoundingClientRect();
            targetRotY = ((e.clientX - r.left) / W - 0.5) * 1.0;
            targetRotX = ((e.clientY - r.top) / H - 0.5) * 0.6;
            autoRotate = false;
        });
        container.addEventListener('mouseleave', () => { autoRotate = true; });

        window.addEventListener('resize', () => {
            const nW = container.offsetWidth;
            const nH = container.offsetHeight;
            camera.aspect = nW / nH;
            camera.updateProjectionMatrix();
            renderer.setSize(nW, nH);
        });

        let t = 0;
        (function animate() {
            requestAnimationFrame(animate);
            if (document.hidden) return;
            t += 0.004;

            if (autoRotate) {
                currRotY += (t - currRotY) * 0.01;
                currRotX += (Math.sin(t * 0.3) * 0.15 - currRotX) * 0.02;
            } else {
                currRotY += (targetRotY - currRotY) * 0.02;
                currRotX += (targetRotX - currRotX) * 0.02;
            }

            sphere.rotation.y = currRotY;
            sphere.rotation.x = currRotX;

            labelObjects.forEach(({ sprite, baseX, baseY, baseZ }) => {
                // Rotate labels with globe
                const cosY = Math.cos(currRotY), sinY = Math.sin(currRotY);
                const cosX = Math.cos(currRotX), sinX = Math.sin(currRotX);

                const x1 = baseX * cosY + baseZ * sinY;
                const z1 = -baseX * sinY + baseZ * cosY;
                const y1 = baseY * cosX - z1 * sinX;
                const z2 = baseY * sinX + z1 * cosX;

                const r = 1.12;
                sprite.position.set(x1 * r, y1 * r, z2 * r);

                // Fade labels on back of sphere
                const opacity = Math.max(0, z2 * 0.8 + 0.35);
                sprite.material.opacity = opacity;
            });

            renderer.render(scene, camera);
        })();
    }

    /* =============================================
       4. INTERACTIVE TERMINAL
    ============================================= */
    function initInteractiveTerminal() {
        const iterm = document.getElementById('interactive-terminal');
        if (!iterm) return;

        const historyEl = iterm.querySelector('.iterm-history');
        const inputEl   = iterm.querySelector('.iterm-input');
        const bodyEl    = iterm.querySelector('.iterm-body');

        // Make terminal focusable by clicking anywhere
        iterm.addEventListener('click', () => inputEl.focus());

        const PROJECTS = [
            { name: 'inference-engine', desc: 'C++ LLM inference w/ SIMD/AVX2', url: 'https://github.com/Kush-Singh-26/Inference_Engine' },
            { name: 'mental-health-bot', desc: 'Llama 3 8B fine-tuned on counseling data', url: 'https://huggingface.co/Kush26/Mental_Health_ChatBot' },
            { name: 'transformer-translate', desc: 'BLEU 23.64 En→Hi from scratch', url: 'https://github.com/Kush-Singh-26/Transformer_Translate' },
            { name: 'lm_forge', desc: 'Modular LM training engine', url: 'https://github.com/Kush-Singh-26' },
            { name: 'kosh-ssg', desc: 'Static site generator in Golang', url: 'https://github.com/Kush-Singh-26/blogs' },
            { name: 'image-captioning', desc: 'CNN + LSTM caption generator', url: 'https://github.com/Kush-Singh-26/Image_Caption' },
            { name: 'micrograd', desc: 'Scalar autograd engine from scratch', url: 'https://github.com/Kush-Singh-26/Micrograd' },
        ];

        const COMMANDS = {
            help: () => [
                { text: 'Available commands:', cls: 'accent' },
                { text: '  help          — show this help' },
                { text: '  ls            — list sections' },
                { text: '  ls projects   — list all projects' },
                { text: '  cat profile   — print profile info' },
                { text: '  cat resume    — download resume' },
                { text: '  open <name>   — open a project repo' },
                { text: '  contact       — show contact info' },
                { text: '  whoami        — print identity' },
                { text: '  skills        — list competencies' },
                { text: '  clear         — clear terminal' },
                { text: '  exit          — close terminal (ESC)' },
            ],
            ls: (args) => {
                if (args[0] === 'projects') {
                    return [
                        { text: 'drwxr-xr-x  projects/', cls: 'accent' },
                        ...PROJECTS.map(p => ({ text: `  ├── ${p.name.padEnd(26)} ${p.desc}`, cls: 'cool' }))
                    ];
                }
                return [
                    { text: 'drwxr-xr-x  about/', cls: 'accent' },
                    { text: 'drwxr-xr-x  projects/', cls: 'accent' },
                    { text: 'drwxr-xr-x  skills/', cls: 'accent' },
                    { text: 'drwxr-xr-x  timeline/', cls: 'accent' },
                    { text: '-rw-r--r--  resume.pdf', cls: 'cool' },
                    { text: '-rw-r--r--  contact.txt', cls: 'cool' },
                ];
            },
            whoami: () => [
                { text: 'kush-singh — cs-undergrad, systems-thinker, ml-researcher', cls: 'green' },
                { text: 'KIIT University · Bhubaneswar, India · CGPA 9.16' },
            ],
            cat: (args) => {
                if (!args[0]) return [{ text: 'Usage: cat <file>', cls: 'err' }];
                if (args[0] === 'profile' || args[0] === 'profile.json') {
                    return [
                        { text: '{', cls: 'accent' },
                        { text: '  "name"     : "Kush Singh",' },
                        { text: '  "role"     : "ML/Systems Engineer",' },
                        { text: '  "stack"    : ["C++", "Python", "PyTorch", "Golang"],' },
                        { text: '  "focus"    : ["LLM Training", "Inference Optimization", "SIMD"],' },
                        { text: '  "cgpa"     : 9.16,' },
                        { text: '  "status"   : "open_to_opportunities"' },
                        { text: '}', cls: 'accent' },
                    ];
                }
                if (args[0] === 'resume' || args[0] === 'resume.pdf') {
                    window.open('./resume.pdf', '_blank');
                    return [{ text: '→ Opening resume.pdf in new tab...', cls: 'green' }];
                }
                if (args[0] === 'contact' || args[0] === 'contact.txt') {
                    return [
                        { text: 'email   : kushsingh2604@gmail.com', cls: 'cool' },
                        { text: 'github  : github.com/Kush-Singh-26', cls: 'cool' },
                        { text: 'linkedin: linkedin.com/in/kush-singh-2b2440280', cls: 'cool' },
                    ];
                }
                return [{ text: `cat: ${args[0]}: No such file or directory`, cls: 'err' }];
            },
            contact: () => [
                { text: 'email   : kushsingh2604@gmail.com', cls: 'cool' },
                { text: 'github  : github.com/Kush-Singh-26', cls: 'cool' },
                { text: 'linkedin: linkedin.com/in/kush-singh-2b2440280', cls: 'cool' },
            ],
            skills: () => [
                { text: '// languages', cls: 'accent' },
                { text: '   C++ · C · Python · JavaScript · Java · Golang' },
                { text: '// deep learning', cls: 'accent' },
                { text: '   PyTorch · HF Transformers · NumPy · Pandas · Scikit-Learn' },
                { text: '// devops & web', cls: 'accent' },
                { text: '   Docker · Kubernetes · Linux · GitHub Actions · HTML5/CSS3' },
            ],
            open: (args) => {
                if (!args[0]) return [{ text: 'Usage: open <project-name>', cls: 'err' }];
                const proj = PROJECTS.find(p => p.name.includes(args[0].toLowerCase()));
                if (proj) {
                    setTimeout(() => window.open(proj.url, '_blank'), 200);
                    return [{ text: `→ Opening ${proj.name}...`, cls: 'green' }];
                }
                return [{ text: `open: ${args[0]}: project not found. Try 'ls projects'`, cls: 'err' }];
            },
            clear: () => 'CLEAR',
            exit: () => { showToast('// terminal closed — press ESC or type exit'); return []; },
        };

        let cmdHistory = [];
        let histIdx = -1;

        function addLine(text, cls = '') {
            const div = document.createElement('div');
            div.className = 'iterm-output-line' + (cls ? ` ${cls}` : '');
            div.textContent = text;
            historyEl.appendChild(div);
        }

        function addPromptLine(cmd) {
            const div = document.createElement('div');
            div.className = 'iterm-line';
            div.innerHTML = `
                <span class="iterm-prompt-user">kush</span>
                <span class="iterm-prompt-at">@</span>
                <span class="iterm-prompt-host">portfolio</span>
                <span class="iterm-prompt-colon">:</span>
                <span class="iterm-prompt-path">~</span>
                <span class="iterm-prompt-sym">$</span>
                <span class="iterm-cmd-text"> ${cmd}</span>
            `;
            historyEl.appendChild(div);
        }

        function scrollBottom() {
            bodyEl.scrollTop = bodyEl.scrollHeight;
        }

        function runCommand(raw) {
            const trimmed = raw.trim();
            if (!trimmed) return;

            cmdHistory.unshift(trimmed);
            histIdx = -1;
            addPromptLine(trimmed);

            const parts = trimmed.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            if (COMMANDS[cmd]) {
                const result = COMMANDS[cmd](args);
                if (result === 'CLEAR') {
                    historyEl.innerHTML = '';
                    return;
                }
                if (Array.isArray(result)) {
                    result.forEach(r => addLine(r.text, r.cls || ''));
                }
            } else {
                addLine(`bash: command not found: ${cmd}. Type 'help' for commands.`, 'err');
            }
            scrollBottom();
        }

        // Boot sequence
        const bootMessages = [
            { text: '┌──────────────────────────────────────────┐', cls: 'accent' },
            { text: '│  kush@portfolio — interactive terminal   │', cls: 'accent' },
            { text: '│  type \'help\' to view available commands  │', cls: 'accent' },
            { text: '└──────────────────────────────────────────┘', cls: 'accent' },
            { text: ' ' },
        ];

        bootMessages.forEach((l, i) => {
            setTimeout(() => {
                addLine(l.text, l.cls);
                scrollBottom();
            }, i * 80);
        });

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = inputEl.value;
                inputEl.value = '';
                runCommand(val);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                histIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
                if (cmdHistory[histIdx]) inputEl.value = cmdHistory[histIdx];
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                histIdx = Math.max(histIdx - 1, -1);
                inputEl.value = histIdx >= 0 ? cmdHistory[histIdx] : '';
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Tab completion
                const val = inputEl.value;
                const cmds = Object.keys(COMMANDS);
                const match = cmds.find(c => c.startsWith(val));
                if (match) inputEl.value = match;
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                historyEl.innerHTML = '';
            }
        });

        scrollBottom();
    }

    /* =============================================
       5. COMMAND PALETTE
    ============================================= */
    function initCommandPalette() {
        const overlay = document.getElementById('cmd-overlay');
        if (!overlay) return;

        const input   = document.getElementById('cmd-input');
        const results = document.getElementById('cmd-results');

        const ALL_ITEMS = [
            // Navigation
            { group: 'Navigate', icon: '⌂', title: 'Home', desc: 'Scroll to top', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
            { group: 'Navigate', icon: '◈', title: 'About', desc: '#about section', action: () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }) },
            { group: 'Navigate', icon: '◈', title: 'Projects', desc: '#projects section', action: () => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }) },
            { group: 'Navigate', icon: '◈', title: 'Skills', desc: '#skills section', action: () => document.getElementById('skills')?.scrollIntoView({ behavior: 'smooth' }) },
            { group: 'Navigate', icon: '◈', title: 'Timeline', desc: '#education section', action: () => document.getElementById('education')?.scrollIntoView({ behavior: 'smooth' }) },
            { group: 'Navigate', icon: '◈', title: 'Contact', desc: '#contact section', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) },
            // Actions
            { group: 'Actions', icon: '↓', title: 'Download Resume', desc: 'Open resume.pdf', action: () => window.open('./resume.pdf', '_blank') },
            { group: 'Actions', icon: '@', title: 'Send Email', desc: 'kushsingh2604@gmail.com', action: () => window.open('mailto:kushsingh2604@gmail.com') },
            { group: 'Actions', icon: '☀', title: 'Toggle Theme', desc: 'Switch dark/light mode', action: () => document.getElementById('theme-toggle')?.click() },
            { group: 'Actions', icon: '✎', title: 'Copy Email', desc: 'Copy to clipboard', action: () => { navigator.clipboard.writeText('kushsingh2604@gmail.com'); showToast('// email copied to clipboard'); } },
            // Projects
            { group: 'Projects', icon: '▸', title: 'Inference Engine', desc: 'C++ · SIMD/AVX2 · KV-Cache', action: () => window.open('https://github.com/Kush-Singh-26/Inference_Engine', '_blank') },
            { group: 'Projects', icon: '▸', title: 'Mental Health ChatBot', desc: 'Llama 3 8B · PEFT/LoRA', action: () => window.open('https://huggingface.co/Kush26/Mental_Health_ChatBot', '_blank') },
            { group: 'Projects', icon: '▸', title: 'Transformer Translate', desc: 'BLEU 23.64 · En→Hi', action: () => window.open('https://github.com/Kush-Singh-26/Transformer_Translate', '_blank') },
            { group: 'Projects', icon: '▸', title: 'Kosh SSG', desc: 'Golang · Markdown · KaTeX', action: () => window.open('https://github.com/Kush-Singh-26/blogs', '_blank') },
            { group: 'Projects', icon: '▸', title: 'Image Captioning', desc: 'CNN + LSTM · HuggingFace', action: () => window.open('https://github.com/Kush-Singh-26/Image_Caption', '_blank') },
            // Links
            { group: 'Links', icon: '⎋', title: 'GitHub', desc: 'github.com/Kush-Singh-26', action: () => window.open('https://github.com/Kush-Singh-26', '_blank') },
            { group: 'Links', icon: '⎋', title: 'LinkedIn', desc: 'linkedin.com/in/kush-singh-2b2440280', action: () => window.open('https://www.linkedin.com/in/kush-singh-2b2440280', '_blank') },
            { group: 'Links', icon: '⎋', title: 'Blog', desc: 'kush-singh-26.github.io/blogs', action: () => window.open('https://kush-singh-26.github.io/blogs/', '_blank') },
            { group: 'Links', icon: '⎋', title: 'HuggingFace', desc: 'huggingface.co/Kush26', action: () => window.open('https://huggingface.co/Kush26', '_blank') },
        ];

        let selectedIdx = 0;
        let filtered = ALL_ITEMS;

        function open() {
            overlay.classList.add('open');
            input.value = '';
            render('');
            input.focus();
        }

        function close() {
            overlay.classList.remove('open');
        }

        function render(query) {
            const q = query.toLowerCase().trim();
            filtered = q ? ALL_ITEMS.filter(item =>
                item.title.toLowerCase().includes(q) ||
                item.desc.toLowerCase().includes(q) ||
                item.group.toLowerCase().includes(q)
            ) : ALL_ITEMS;

            selectedIdx = 0;
            results.innerHTML = '';

            if (!filtered.length) {
                results.innerHTML = '<div class="cmd-no-results">// no results found</div>';
                return;
            }

            // Group items
            const groups = {};
            filtered.forEach(item => {
                if (!groups[item.group]) groups[item.group] = [];
                groups[item.group].push(item);
            });

            Object.entries(groups).forEach(([gName, items]) => {
                const label = document.createElement('div');
                label.className = 'cmd-group-label';
                label.textContent = gName;
                results.appendChild(label);

                items.forEach((item) => {
                    const idx = filtered.indexOf(item);
                    const el = document.createElement('div');
                    el.className = 'cmd-item' + (idx === 0 ? ' selected' : '');
                    el.innerHTML = `
                        <div class="cmd-item-icon">${item.icon}</div>
                        <div class="cmd-item-text">
                            <span class="cmd-item-title">${item.title}</span>
                            <span class="cmd-item-desc">${item.desc}</span>
                        </div>
                        <span class="cmd-item-arrow">↵</span>
                    `;
                    el.addEventListener('click', () => { item.action(); close(); });
                    el.addEventListener('mouseenter', () => {
                        selectedIdx = idx;
                        updateSelected();
                    });
                    results.appendChild(el);
                });
            });
        }

        function updateSelected() {
            results.querySelectorAll('.cmd-item').forEach((el, i) => {
                el.classList.toggle('selected', i === selectedIdx);
                if (i === selectedIdx) el.scrollIntoView({ block: 'nearest' });
            });
        }

        function executeSelected() {
            if (filtered[selectedIdx]) {
                filtered[selectedIdx].action();
                close();
            }
        }

        input.addEventListener('input', () => render(input.value));

        document.addEventListener('keydown', (e) => {
            const isOpen = overlay.classList.contains('open');

            // Open: Cmd+K or Ctrl+K
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                isOpen ? close() : open();
                return;
            }

            if (!isOpen) return;

            if (e.key === 'Escape') { close(); return; }
            if (e.key === 'Enter') { e.preventDefault(); executeSelected(); return; }
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                selectedIdx = Math.min(selectedIdx + 1, filtered.length - 1);
                updateSelected();
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                selectedIdx = Math.max(selectedIdx - 1, 0);
                updateSelected();
            }
        });

        overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

        // Wire up trigger hints
        document.querySelectorAll('.cmd-trigger').forEach(el => {
            el.addEventListener('click', open);
        });
    }

    /* =============================================
       PERFORMANCE: Pause RAF when tab hidden
       (also patches the existing neural canvas)
    ============================================= */
    function patchNeuralCanvas() {
        // The original script.js already runs; we just ensure
        // the GLSL canvas replaces it visually (display:none via CSS).
        // Additional RAF pause is handled inside initGLSL above.
    }

    /* =============================================
       INIT ALL
    ============================================= */
    document.addEventListener('DOMContentLoaded', () => {
        initGLSL();
        initASCII();
        initCommandPalette();
        initInteractiveTerminal();

        // Globe init after Three.js loads
        const threeScript = document.querySelector('script[src*="three"]');
        if (threeScript) {
            threeScript.addEventListener('load', initGlobe);
            // If already loaded
            if (typeof THREE !== 'undefined') initGlobe();
        } else if (typeof THREE !== 'undefined') {
            initGlobe();
        }
    });

})();