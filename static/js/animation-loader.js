// Animation Loader (Web Component)
// Manages the shared animation engine from /static/wasm/
let wasmBinaryCache = null;
let wasmBinaryCachePromise = null;

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

        controls.forEach(c => {
            const type = c.type || 'slider';
            const wrapper = document.createElement('div');
            if (type === 'button') {
                wrapper.innerHTML = `<button class="sim-btn">${c.label}</button>`;
                wrapper.querySelector('button').onclick = () => callSimAction(c.id);
            } else if (type === 'checkbox') {
                setSimProp(c.id, !!c.val);
                wrapper.innerHTML = `<input type="checkbox" id="chk_${name}_${c.id}" ${c.val ? 'checked' : ''}> <label for="chk_${name}_${c.id}">${c.label}</label>`;
                wrapper.querySelector('input').onchange = (e) => setSimProp(c.id, e.target.checked);
            } else {
                setSimProp(c.id, c.val);
                wrapper.innerHTML = `<div>${c.label}: <span id="val_${name}_${c.id}">${c.val}</span></div><input type="range" min="${c.min}" max="${c.max}" step="${c.step}" value="${c.val}" style="width:100%">`;
                wrapper.querySelector('input').addEventListener('input', (e) => {
                    const val = parseFloat(e.target.value);
                    setSimProp(c.id, val);
                    wrapper.querySelector(`#val_${name}_${c.id}`).textContent = val.toFixed(2);
                });
            }
            ui.appendChild(wrapper);
        });
    }
}
customElements.define('wasm-sim', WasmSim);
