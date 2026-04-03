/* terminal.js — Interactive terminal */
(function () {
    'use strict';

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

    function initInteractiveTerminal() {
        const iterm = document.getElementById('interactive-terminal');
        if (!iterm) return;

        const historyEl = iterm.querySelector('.iterm-history');
        const inputEl   = iterm.querySelector('.iterm-input');
        const bodyEl    = iterm.querySelector('.iterm-body');

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

        const FILES = ['profile.json', 'resume.pdf', 'contact.txt', '.secrets', 'config.yaml'];

        let isRoot = false;

        const PROMPT_SYM_NORMAL = '>';
        const PROMPT_SYM_ROOT = '#';
        const PROMPT_USER_NORMAL = 'kush';
        const PROMPT_USER_ROOT = 'root';

        function updatePromptDisplay() {
            const userEl = iterm.querySelector('.iterm-prompt-user');
            const symEl = iterm.querySelector('.iterm-prompt-sym');
            if (userEl) {
                userEl.textContent = isRoot ? PROMPT_USER_ROOT : PROMPT_USER_NORMAL;
                userEl.style.color = isRoot ? '#f87171' : '#4ade80';
            }
            if (symEl) {
                symEl.textContent = isRoot ? PROMPT_SYM_ROOT : PROMPT_SYM_NORMAL;
                symEl.style.textShadow = isRoot ? '0 0 8px #f87171' : 'none';
            }
        }

        const COMMANDS = {
            help: () => [
                { text: 'Available commands:', cls: 'accent' },
                { text: '  help          — show this help' },
                { text: '  ls [-a]       — list files/sections' },
                { text: '  cat <file>    — print file info' },
                { text: '  open <proj>   — open project repo' },
                { text: '  neofetch      — system summary' },
                { text: '  top           — process monitor' },
                { text: '  matrix        — enter the source' },
                { text: '  skills        — competencies' },
                { text: '  whoami        — identity' },
                { text: '  clear         — clear terminal' },
                { text: '  sudo <pass>   — elevate privileges', cls: 'cool' },
                { text: '  exit          — close (ESC)' },
            ],
            ls: (args) => {
                const showHidden = args.includes('-a');
                if (args.includes('projects')) {
                    return [
                        { text: 'drwxr-xr-x  projects/', cls: 'accent' },
                        ...PROJECTS.map(p => ({ text: `  ├── ${p.name.padEnd(20)} ${p.desc}`, cls: 'cool' }))
                    ];
                }
                const sections = [
                    { t: 'drwxr-xr-x  about/', c: 'accent' },
                    { t: 'drwxr-xr-x  projects/', c: 'accent' },
                    { t: 'drwxr-xr-x  skills/', c: 'accent' },
                    { t: 'drwxr-xr-x  timeline/', c: 'accent' },
                    { t: '-rw-r--r--  profile.json', c: 'cool' },
                    { t: '-rw-r--r--  resume.pdf', c: 'cool' },
                    { t: '-rw-r--r--  contact.txt', c: 'cool' },
                    { t: '-rw-r--r--  config.yaml', c: 'cool' },
                ];
                if (showHidden) sections.unshift({ t: '-rw-------  .secrets', c: 'err' });
                return sections.map(s => ({ text: s.t, cls: s.c }));
            },
            cat: (args) => {
                if (!args[0]) return [{ text: 'Usage: cat <file>', cls: 'err' }];
                const f = args[0].toLowerCase();
                if (f === 'profile' || f === 'profile.json') {
                    return [
                        { text: '{', cls: 'accent' },
                        { text: '  "name": "Kush Singh",' },
                        { text: '  "role": "ML/Systems Engineer",' },
                        { text: '  "status": "building_the_future"' },
                        { text: '}', cls: 'accent' },
                    ];
                }
                if (f === 'config' || f === 'config.yaml') {
                    return [
                        { text: '---', cls: 'cool' },
                        { text: 'system:', cls: 'accent' },
                        { text: '  password_hint: "the_second_word_of_the_headline"' },
                        { text: '  security_level: restricted', cls: 'err' },
                        { text: '  authorized_users: []', cls: 'cool' },
                        { text: '---', cls: 'cool' },
                    ];
                }
                if (f === '.secrets') {
                    if (!isRoot) return [{ text: "Nice try. Access denied: Insufficient clearance.", cls: 'err' }];
                    return [
                        { text: '╔══════════════════════════════════════════════╗', cls: 'accent' },
                        { text: '║ CLASSIFIED: PROJECT BLACKBOX                 ║', cls: 'accent' },
                        { text: '╠══════════════════════════════════════════════╣', cls: 'accent' },
                        { text: '║ Status:    ACTIVE                            ║', cls: 'green' },
                        { text: '║ Location:  KIIT University, Bhubaneswar      ║', cls: 'cool' },
                        { text: '║ Objective: Decoding neural pathways...       ║', cls: 'cool' },
                        { text: '╠══════════════════════════════════════════════╣', cls: 'accent' },
                        { text: '║ COORDINATES: 20.2667° N, 85.8431° E          ║', cls: 'accent' },
                        { text: '║ (Coffee spot near Block 6)                   ║', cls: 'cool' },
                        { text: '╠══════════════════════════════════════════════╣', cls: 'accent' },
                        { text: '║ ★ ACHIEVEMENT: Digital Archaeologist         ║', cls: 'green' },
                        { text: '╚══════════════════════════════════════════════╝', cls: 'accent' },
                    ];
                }
                if (f === 'resume' || f === 'resume.pdf') { window.open('./resume.pdf', '_blank'); return [{ text: '→ Launching resume...', cls: 'green' }]; }
                if (f === 'contact' || f === 'contact.txt') {
                    return [
                        { text: 'Email:  kushsingh2604@gmail.com', cls: 'cool' },
                        { text: 'GitHub: github.com/Kush-Singh-26', cls: 'cool' },
                        { text: 'LinkedIn: linkedin.com/in/kush-singh-2b2440280', cls: 'cool' },
                    ];
                }
                return [{ text: `cat: ${f}: No such file or directory`, cls: 'err' }];
            },
            neofetch: () => {
                const ascii = `  /\\_/\\  
  ( o.o ) 
   > ^ <  `;
                const div = document.createElement('div');
                div.className = 'iterm-nf-wrap';
                div.innerHTML = `
                    <div class="iterm-nf-ascii">${ascii}</div>
                    <div class="iterm-nf-data">
                        <span><b>kush</b>@<b>portfolio</b></span>
                        <span>-----------------</span>
                        <span><b>OS</b>: Kush-OS v2.6 x86_64</span>
                        <span><b>Host</b>: Deep-Learning-Workstation</span>
                        <span><b>Kernel</b>: 5.15.0-transformers-generic</span>
                        <span><b>Uptime</b>: 1024 epochs</span>
                        <span><b>Shell</b>: ksh 4.2 (kush-shell)</span>
                        <span><b>GPU</b>: NVIDIA RTX 4090 x 2 (Mock)</span>
                        <span><b>Memory</b>: 64GiB / 128GiB</span>
                    </div>
                `;
                historyEl.appendChild(div);
                return [];
            },
            top: () => [
                { text: 'PID   USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND', cls: 'accent' },
                { text: '1240  kush      20   0   42.4g  12.1g   2.1g R  98.2  18.4  12:44.20 neural_engine' },
                { text: '2391  kush      20   0   18.1g   4.2g   1.1g S  12.4   6.2   0:15.02 coffee_intake' },
                { text: '882   root      20   0    1.2g   0.1g   0.0g S   0.5   0.1   4:02.12 sys_daemon' },
                { text: '102   kush      20   0  512.0m  64.0m   8.0m S   0.1   0.0   0:00.42 bash' },
            ],
            matrix: () => {
                const chars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%&*+-";
                for (let i = 0; i < 25; i++) {
                    const col = document.createElement('div');
                    col.className = 'iterm-matrix-col';
                    col.style.left = Math.random() * 95 + '%';
                    col.style.animation = `matrix-fall ${2 + Math.random() * 3}s linear infinite`;
                    col.style.animationDelay = Math.random() * 2 + 's';
                    
                    let content = "";
                    for (let j = 0; j < 15; j++) content += chars[Math.floor(Math.random() * chars.length)] + "<br>";
                    col.innerHTML = content;
                    bodyEl.appendChild(col);
                    setTimeout(() => col.remove(), 5000);
                }
                return [{ text: "Decoding reality...", cls: "green" }];
            },
            open: (args) => {
                if (!args[0]) return [{ text: 'Usage: open <project>', cls: 'err' }];
                const proj = PROJECTS.find(p => p.name.toLowerCase() === args[0].toLowerCase());
                if (proj) { window.open(proj.url, '_blank'); return [{ text: `→ Opening ${proj.name}...`, cls: 'green' }]; }
                return [{ text: `open: ${args[0]}: project not found`, cls: 'err' }];
            },
            whoami: () => [{ text: 'kush — ML/Systems Engineer building the future', cls: 'accent' }],
            skills: () => [
                { text: 'Languages:   C++, Python, Golang', cls: 'cool' },
                { text: 'ML/AI:       PyTorch, Transformers, LoRA, GGUF, KV-Cache', cls: 'cool' },
                { text: 'Systems:      SIMD/AVX2, CUDA, Docker, Linux', cls: 'cool' },
                { text: 'Tools:        Git, NumPy, HuggingFace', cls: 'cool' },
            ],
            sudo: (args) => {
                if (!args[0]) return [{ text: 'Usage: sudo <password>', cls: 'err' }];
                const pass = args[0].toLowerCase();
                if (pass === 'binary') {
                    isRoot = true;
                    updatePromptDisplay();
                    showToast('✓ Elevated to root access');
                    return [
                        { text: 'Wee!', cls: 'green' },
                        { text: '  Access level: ROOT', cls: 'accent' },
                        { text: '  Try: cat .secrets', cls: 'cool' },
                    ];
                }
                return [{ text: 'Sorry, try: sudo binary', cls: 'err' }];
            },
            clear: () => 'CLEAR',
            exit: () => { showToast('// terminal closed'); return []; }
        };

        // History Management
        let cmdHistory = JSON.parse(localStorage.getItem('iterm_history') || '[]');
        let histIdx = -1;

        function addLine(text, cls = '') {
            const div = document.createElement('div');
            div.className = 'iterm-output-line' + (cls ? ` ${cls}` : '');
            div.textContent = text;
            historyEl.appendChild(div);
        }

        function runCommand(raw) {
            const trimmed = raw.trim();
            if (!trimmed) return;

            if (trimmed !== cmdHistory[0]) {
                cmdHistory.unshift(trimmed);
                if (cmdHistory.length > 50) cmdHistory.pop();
                localStorage.setItem('iterm_history', JSON.stringify(cmdHistory));
            }
            histIdx = -1;

            const currentUser = isRoot ? PROMPT_USER_ROOT : PROMPT_USER_NORMAL;
            const currentSym = isRoot ? PROMPT_SYM_ROOT : PROMPT_SYM_NORMAL;
            
            const div = document.createElement('div');
            div.className = 'iterm-line';
            div.innerHTML = `<span class="iterm-prompt-user">${currentUser}</span><span class="iterm-prompt-at">@</span><span class="iterm-prompt-host">portfolio</span><span class="iterm-prompt-colon">:</span><span class="iterm-prompt-path">~</span><span class="iterm-prompt-sym">${currentSym}</span><span class="iterm-cmd-text"> ${trimmed}</span>`;
            historyEl.appendChild(div);

            const parts = trimmed.split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            if (COMMANDS[cmd]) {
                const result = COMMANDS[cmd](args);
                if (result === 'CLEAR') { historyEl.innerHTML = ''; }
                else if (Array.isArray(result)) {
                    result.forEach(r => addLine(r.text, r.cls));
                }
            } else {
                iterm.classList.add('glitch');
                setTimeout(() => iterm.classList.remove('glitch'), 250);
                addLine(`bash: ${cmd}: command not found`, 'err');
            }
            bodyEl.scrollTop = bodyEl.scrollHeight;
        }

        inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const v = inputEl.value; inputEl.value = ''; runCommand(v);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault(); histIdx = Math.min(histIdx + 1, cmdHistory.length - 1);
                if (histIdx >= 0) inputEl.value = cmdHistory[histIdx];
            } else if (e.key === 'ArrowDown') {
                e.preventDefault(); histIdx = Math.max(histIdx - 1, -1);
                inputEl.value = histIdx >= 0 ? cmdHistory[histIdx] : '';
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const val = inputEl.value.trim().split(/\s+/);
                const last = val[val.length - 1].toLowerCase();
                
                let matches = [];
                if (val.length === 1) {
                    matches = Object.keys(COMMANDS).filter(c => c.startsWith(last));
                } else if (val[0] === 'cat' || val[0] === 'open') {
                    const pool = val[0] === 'cat' ? FILES : PROJECTS.map(p => p.name);
                    matches = pool.filter(p => p.startsWith(last));
                }
                
                if (matches.length === 1) {
                    val[val.length - 1] = matches[0];
                    inputEl.value = val.join(' ');
                }
            }
        });

        // Boot sequence
        const bootMessages = [
            { text: '╭──────────────────────────────────────────╮', cls: 'accent' },
            { text: '│  Welcome to Portfolio Terminal           │', cls: 'accent' },
            { text: '│  Type \'help\' to view commands            │', cls: 'accent' },
            { text: '│  Hint: Check config.yaml for secrets     │', cls: 'cool' },
            { text: '╰──────────────────────────────────────────╯', cls: 'accent' },
            { text: ' ' },
        ];

        bootMessages.forEach((l, i) => {
            setTimeout(() => {
                addLine(l.text, l.cls);
                bodyEl.scrollTop = bodyEl.scrollHeight;
            }, i * 80);
        });
    }

    document.addEventListener('DOMContentLoaded', initInteractiveTerminal);
})();
