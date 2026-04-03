/* globe.js — Three.js 3D skill globe (Enhanced) */
(function () {
    'use strict';

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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setSize(W, H);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.z = 2.8;

        // Theme colors
        let isLight = document.documentElement.getAttribute('data-theme') === 'light';
        
        function getThemeColors(light) {
            return {
                accentColor: light ? 0x3d2b14 : 0xc9a86c,
                labelColor1: light ? '#000000' : '#f0e0c0',
                labelColor2: light ? '#000000' : '#a0b8c8',
                sphereOpacity: light ? 0.35 : 0.08,
                pointOpacity: light ? 0.75 : 0.6,
                pointSize: light ? 0.024 : 0.012,
                glowOpacity: light ? 0.35 : 0.12
            };
        }

        let colors = getThemeColors(isLight);

        // ── 1. Inner Wireframe Sphere ──
        const sphereGeo = new THREE.SphereGeometry(1, 20, 16);
        const sphereMat = new THREE.MeshBasicMaterial({
            color: colors.accentColor,
            wireframe: true,
            transparent: true,
            opacity: colors.sphereOpacity
        });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        scene.add(sphere);

        // ── 2. Point Cloud Layer (dense data texture) ──
        const pointGeo = new THREE.SphereGeometry(1.02, 48, 32);
        const pointMat = new THREE.PointsMaterial({
            color: colors.accentColor,
            size: colors.pointSize,
            transparent: true,
            opacity: colors.pointOpacity,
            sizeAttenuation: true,
            depthWrite: false
        });
        const pointCloud = new THREE.Points(pointGeo, pointMat);
        scene.add(pointCloud);

        // ── 3. Atmosphere Glow (Fresnel-like rim shader) ──
        const glowVertexShader = `
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `;
        const glowFragmentShader = `
            uniform vec3 glowColor;
            uniform float opacity;
            varying vec3 vNormal;
            varying vec3 vPosition;
            void main() {
                vec3 viewDir = normalize(-vPosition);
                float rim = 1.0 - max(0.0, dot(viewDir, vNormal));
                float intensity = pow(rim, 2.5) * opacity;
                gl_FragColor = vec4(glowColor, intensity);
            }
        `;
        const glowMat = new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(colors.accentColor) },
                opacity: { value: colors.glowOpacity }
            },
            vertexShader: glowVertexShader,
            fragmentShader: glowFragmentShader,
            transparent: true,
            side: THREE.FrontSide,
            depthWrite: false,
            blending: isLight ? THREE.NormalBlending : THREE.AdditiveBlending
        });
        const glowSphere = new THREE.Mesh(new THREE.SphereGeometry(1.15, 32, 32), glowMat);
        scene.add(glowSphere);

        // ── 5. Skill Labels (Fibonacci distribution) ──
        const labelObjects = [];
        const N = skills.length;

        function createLabelCanvas(skill, i, light) {
            const currentColors = getThemeColors(light);
            const cvs = document.createElement('canvas');
            cvs.width = 256; cvs.height = 64;
            const ctx = cvs.getContext('2d');

            const fontSize = i < 8 ? 28 : 22;
            ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
            ctx.fillStyle = i < 8 ? currentColors.labelColor1 : currentColors.labelColor2;
            ctx.globalAlpha = light ? 1.0 : (i < 8 ? 0.95 : 0.7);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skill, 128, 32);
            return cvs;
        }

        skills.forEach((skill, i) => {
            const phi = Math.acos(1 - 2 * (i + 0.5) / N);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.cos(phi);
            const z = Math.sin(phi) * Math.sin(theta);

            const cvs = createLabelCanvas(skill, i, isLight);
            const tex = new THREE.CanvasTexture(cvs);
            const spriteMat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
            const sprite = new THREE.Sprite(spriteMat);

            const radius = 1.18;
            sprite.position.set(x * radius, y * radius, z * radius);
            sprite.scale.set(0.55, 0.14, 1);

            scene.add(sprite);
            labelObjects.push({ sprite, baseX: x, baseY: y, baseZ: z, isPrimary: i < 8, skill, index: i });
        });

        // ── 6. React to Theme Changes ──
        let currentPointOpacityBase = colors.pointOpacity;

        window.addEventListener('themechanged', (e) => {
            const light = e.detail.theme === 'light';
            const newColors = getThemeColors(light);
            
            // Update materials
            sphereMat.color.set(newColors.accentColor);
            sphereMat.opacity = newColors.sphereOpacity;
            
            pointMat.color.set(newColors.accentColor);
            pointMat.size = newColors.pointSize;
            currentPointOpacityBase = newColors.pointOpacity;

            glowMat.uniforms.glowColor.value.set(newColors.accentColor);
            glowMat.uniforms.opacity.value = newColors.glowOpacity;
            glowMat.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending;
            glowMat.needsUpdate = true;

            // Update labels
            labelObjects.forEach((obj) => {
                const newCvs = createLabelCanvas(obj.skill, obj.index, light);
                obj.sprite.material.map.image = newCvs;
                obj.sprite.material.map.needsUpdate = true;
            });
        });

        // ── 7. Drag-to-Rotate with Inertia ──
        let isDragging = false;
        let prevMouse = { x: 0, y: 0 };
        let velocity = { x: 0, y: 0 };
        let currRotY = 0, currRotX = 0;
        let autoRotate = true;

        container.addEventListener('mousedown', (e) => {
            isDragging = true;
            autoRotate = false;
            prevMouse.x = e.clientX;
            prevMouse.y = e.clientY;
            velocity.x = 0;
            velocity.y = 0;
            container.style.cursor = 'grabbing';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const dx = e.clientX - prevMouse.x;
            const dy = e.clientY - prevMouse.y;
            velocity.x = dx * 0.005;
            velocity.y = dy * 0.005;
            currRotY += velocity.x;
            currRotX += velocity.y;
            currRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, currRotX));
            prevMouse.x = e.clientX;
            prevMouse.y = e.clientY;
        });

        window.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                container.style.cursor = 'grab';
                setTimeout(() => { autoRotate = true; }, 3000);
            }
        });

        container.addEventListener('mouseleave', () => {
            if (!isDragging) autoRotate = true;
        });

        container.style.cursor = 'grab';

        // ── 8. Hover scaling for labels ──
        let mouseX = 0, mouseY = 0;
        container.addEventListener('mousemove', (e) => {
            const rect = container.getBoundingClientRect();
            mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        });

        // ── Resize handling ──
        window.addEventListener('resize', () => {
            const nW = container.offsetWidth;
            const nH = container.offsetHeight;
            camera.aspect = nW / nH;
            camera.updateProjectionMatrix();
            renderer.setSize(nW, nH);
        }, { passive: true });

        let isVisible = true;
        const visibilityObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.target === container) isVisible = entry.isIntersecting;
            });
        }, { threshold: 0.15 });
        visibilityObs.observe(container);

        // ── Animation Loop ──
        let t = 0;
        let lastTime = performance.now();

        (function animate() {
            requestAnimationFrame(animate);
            if (document.hidden || !isVisible) return;

            const now = performance.now();
            const dt = (now - lastTime) / 1000;
            lastTime = now;
            t += 0.004;

            // Auto rotation
            if (autoRotate && !isDragging) {
                const autoSpeed = 0.15;
                velocity.x += (autoSpeed - velocity.x) * 0.01;
                velocity.y += (Math.sin(t * 0.3) * 0.05 - velocity.y) * 0.02;
                currRotY += velocity.x * dt;
                currRotX += velocity.y * dt;
                currRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, currRotX));
            } else if (!isDragging) {
                // Inertia damping
                velocity.x *= 0.96;
                velocity.y *= 0.96;
                currRotY += velocity.x;
                currRotX += velocity.y;
                currRotX = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, currRotX));
            }

            // Rotate all globe elements
            sphere.rotation.y = currRotY;
            sphere.rotation.x = currRotX;
            pointCloud.rotation.y = currRotY;
            pointCloud.rotation.x = currRotX;

            // Update labels
            labelObjects.forEach(({ sprite, baseX, baseY, baseZ, isPrimary }) => {
                const cosY = Math.cos(currRotY), sinY = Math.sin(currRotY);
                const cosX = Math.cos(currRotX), sinX = Math.sin(currRotX);

                const x1 = baseX * cosY + baseZ * sinY;
                const z1 = -baseX * sinY + baseZ * cosY;
                const y1 = baseY * cosX - z1 * sinX;
                const z2 = baseY * sinX + z1 * cosX;

                const r = 1.18;
                sprite.position.set(x1 * r, y1 * r, z2 * r);

                const depthFade = Math.max(0, z2 * 0.8 + 0.35);
                const baseOpacity = isPrimary ? 0.95 : 0.7;
                sprite.material.opacity = depthFade * baseOpacity;

                // Hover scaling
                const hoverScale = 1 + Math.max(0, z2) * 0.15;
                sprite.scale.set(0.55 * hoverScale, 0.14 * hoverScale, 1);
            });

            // Subtle point cloud pulse
            pointMat.opacity = currentPointOpacityBase + Math.sin(t * 2) * 0.1;

            renderer.render(scene, camera);
        })();
    }

    // Init after Three.js loads
    document.addEventListener('DOMContentLoaded', () => {
        const threeScript = document.querySelector('script[src*="three"]');
        if (threeScript) {
            threeScript.addEventListener('load', initGlobe);
            if (typeof THREE !== 'undefined') initGlobe();
        } else if (typeof THREE !== 'undefined') {
            initGlobe();
        }
    });
})();
