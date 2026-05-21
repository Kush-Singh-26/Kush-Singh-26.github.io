// Animation Loader (Web Component)
// Manages the shared animation engine from /static/wasm/
let wasmBinaryCache = null;
let wasmBinaryCachePromise = null;

// Inject shared styles once
(function injectStyles() {
  if (document.getElementById('wasm-sim-styles')) return;
  const style = document.createElement('style');
  style.id = 'wasm-sim-styles';
  style.textContent = `
    .sim-btn {
      padding: 10px 16px;
      background: var(--accent-primary);
      color: var(--bg-card); /* High contrast against button color */
      border: none;
      border-radius: 6px;
      cursor: pointer;
      width: 100%;
      font-weight: 600;
      font-size: 14px;
      font-family: inherit;
      transition: background 0.2s, transform 0.1s;
    }
    .sim-btn:hover { 
      background: var(--accent-tertiary);
    }
    .sim-btn:active { transform: scale(0.97); }

    .sim-slider-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .sim-label {
      color: var(--text-secondary);
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sim-val {
      color: var(--accent-primary);
      font-weight: 600;
      font-size: 14px;
    }

    .sim-slider-track {
      position: relative;
      height: 8px;
      background: var(--sim-track);
      border-radius: 4px;
      border: 1px solid var(--border);
      cursor: pointer;
      width: 100%;
      box-sizing: border-box;
    }
    .sim-slider-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: var(--accent-primary);
      border-radius: 3px;
      pointer-events: none;
      transition: background 0.2s;
    }
    .sim-slider-track:hover .sim-slider-fill {
      background: var(--accent-tertiary);
    }

    .sim-slider-track input[type="range"] {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      transform: translateY(-50%);
      -webkit-appearance: none;
      appearance: none;
      background: transparent;
      outline: none;
      cursor: pointer;
      margin: 0;
      height: 30px;
      border: none;
    }
    .sim-slider-track input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--accent-secondary);
      cursor: pointer;
      border: 2px solid var(--bg-card);
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: transform 0.1s, background 0.2s;
    }
    .sim-slider-track input[type="range"]::-webkit-slider-thumb:hover {
      background: var(--accent-primary);
      transform: translateY(0) scale(1.1);
    }
    .sim-slider-track input[type="range"]::-moz-range-thumb {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--accent-secondary);
      cursor: pointer;
      border: 2px solid var(--bg-card);
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    .sim-slider-track input[type="range"]::-moz-range-track {
      background: transparent;
      border: none;
    }

    .sim-chk-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      height: 100%;
    }
    .sim-chk-wrapper input[type="checkbox"] {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      border: 2px solid var(--sim-chk-border);
      border-radius: 5px;
      background: transparent;
      cursor: pointer;
      position: relative;
      flex-shrink: 0;
      transition: background 0.2s, border-color 0.2s;
    }
    .sim-chk-wrapper input[type="checkbox"]:hover {
      border-color: var(--accent-primary);
    }
    .sim-chk-wrapper input[type="checkbox"]:checked {
      background: var(--accent-primary);
      border-color: var(--accent-primary);
    }
    .sim-chk-wrapper input[type="checkbox"]:checked::after {
      content: '\\2713';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: var(--bg-card);
      font-weight: bold;
      font-size: 14px;
      line-height: 1;
    }
    .sim-chk-wrapper label {
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 13px;
      line-height: 1.4;
    }

  `;
  document.head.appendChild(style);
})();

class WasmSim extends HTMLElement {
    connectedCallback() { setTimeout(() => this.init(), 0); }
    init() {
        const simName = this.getAttribute('src');
        if (!simName) return;
        let controls = [];
        const scriptEl = this.querySelector('script[type="application/json"]');
        if (scriptEl) { try { controls = JSON.parse(scriptEl.textContent); } catch (e) {} }
        
        this.innerHTML = `
            <div style="background: var(--bg-card); padding: 20px; border-radius: 8px; border: 1px solid var(--border); display: inline-block; margin: 20px 0;">
                <div id="canvas_container_${simName}" style="position: relative; width: 800px; height: 600px; background: var(--bg-body); border: 1px solid var(--border); margin-bottom: 20px; overflow: hidden;">
                    <canvas id="canvas_${simName}" oncontextmenu="event.preventDefault()" style="width: 100%; height: 100%; display: block;"></canvas>
                </div>
                <div id="ui_${simName}" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; align-items: end;"></div>
            </div>`;
        this.initWasm(simName, controls);
    }

    async initWasm(name, controls) {
        const canvas = this.querySelector('canvas');
        if (!document.getElementById(`script_engine`)) {
            const script = document.createElement('script');
            script.id = `script_engine`;
            script.src = '/static/wasm/engine.js';
            document.body.appendChild(script);
        }
        await this.waitForEngine(name, canvas, controls);
    }

    async waitForEngine(name, canvas, controls) {
        while (!window[`create_engine`]) await new Promise(r => setTimeout(r, 50));
        if (!wasmBinaryCachePromise) {
            wasmBinaryCachePromise = fetch('/static/wasm/engine.wasm')
                .then(r => r.arrayBuffer()).then(b => { wasmBinaryCache = b; return b; });
        }
        await wasmBinaryCachePromise;
        const module = await window[`create_engine`]({
            canvas: canvas,
            wasmBinary: wasmBinaryCache,
            locateFile: (path) => '/static/wasm/' + path,
        });
        this.startSim(name, canvas, controls, module);
    }

    startSim(name, canvas, controls, module) {
        if (!module) return;
        module.loadSim(name);
        const simInstance = module.getCurrentSim();
        if (simInstance && simInstance.initHelper) simInstance.initHelper(800, 600, "#" + canvas.id);
        
        const ui = this.querySelector(`#ui_${name}`);
        const setSimProp = (id, val) => {
            if (typeof val === 'boolean') module.setSimBool(id, val);
            else if (typeof val === 'number') module.setSimFloat(id, val);
        };
        const callSimAction = (id) => module.callSimAction(id);

        const updateSliderFill = (input, val, min, max) => {
            const pct = ((val - min) / (max - min)) * 100;
            const fill = input.parentElement.querySelector('.sim-slider-fill');
            if (fill) fill.style.width = pct + '%';
        };

        controls.forEach(c => {
            const type = c.type || 'slider';
            const wrapper = document.createElement('div');
            if (type === 'button') {
                wrapper.innerHTML = `<button class="sim-btn">${c.label}</button>`;
                wrapper.querySelector('button').onclick = () => callSimAction(c.id);
            } else if (type === 'checkbox') {
                setSimProp(c.id, !!c.val);
                wrapper.className = 'sim-chk-wrapper';
                wrapper.innerHTML = `<input type="checkbox" id="chk_${name}_${c.id}" ${c.val ? 'checked' : ''}> <label for="chk_${name}_${c.id}">${c.label}</label>`;
                wrapper.querySelector('input').onchange = (e) => setSimProp(c.id, e.target.checked);
            } else {
                setSimProp(c.id, c.val);
                wrapper.className = 'sim-slider-wrapper';
                wrapper.innerHTML = `<div class="sim-label">${c.label}: <span class="sim-val" id="val_${name}_${c.id}">${c.val}</span></div><div class="sim-slider-track"><div class="sim-slider-fill"></div><input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.val}"></div>`;
                const input = wrapper.querySelector('input');
                updateSliderFill(input, c.val, c.min, c.max);
                input.addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    setSimProp(c.id, val);
                    wrapper.querySelector(`#val_${name}_${c.id}`).textContent = val.toFixed(2);
                    updateSliderFill(input, val, c.min, c.max);
                });
            }
            ui.appendChild(wrapper);
        });
    }
}
customElements.define('wasm-sim', WasmSim);
