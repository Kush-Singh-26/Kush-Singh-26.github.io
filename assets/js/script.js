document.addEventListener('DOMContentLoaded', () => {
    
    /* --- THEME TOGGLE --- */
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            if (newTheme === 'light') {
                html.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            } else {
                html.removeAttribute('data-theme');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    /* --- INTERSECTION OBSERVER FOR FADE-IN ANIMATION --- */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const elements = document.querySelectorAll('.fade-in');
    elements.forEach(el => observer.observe(el));
    
    // Stagger hero elements immediately on load if they exist
    const heroStaggers = document.querySelectorAll('.hero-content .fade-in-stagger');
    heroStaggers.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add('visible');
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
            el.style.transition = 'opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1)';
        }, 150 * (index + 1));
    });

    // Setup initial state for hero staggers
    heroStaggers.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(24px)';
    });

    /* --- CURSOR GLOW EFFECT & TRAIL --- */
    const cursorGlow = document.getElementById('cursor-glow');
    if (cursorGlow) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let glowX = mouseX;
        let glowY = mouseY;

        // Smooth trailing effect for the glow
        function animateGlow() {
            glowX += (mouseX - glowX) * 0.1;
            glowY += (mouseY - glowY) * 0.1;
            
            cursorGlow.style.left = `${glowX}px`;
            cursorGlow.style.top = `${glowY}px`;
            
            requestAnimationFrame(animateGlow);
        }
        animateGlow();

        document.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        // Click ripple effect
        document.addEventListener('mousedown', e => {
            const ripple = document.createElement('div');
            ripple.className = 'cursor-ripple';
            ripple.style.left = `${e.clientX}px`;
            ripple.style.top = `${e.clientY}px`;
            document.body.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    }

    /* --- HERO TERMINAL TYPING EFFECT --- */
    const identityText = document.querySelector('.hero-identity');
    if (identityText) {
        const text = identityText.innerText;
        identityText.innerHTML = '<span class="typed-text"></span><span class="typing-cursor"></span>';
        const typedSpan = identityText.querySelector('.typed-text');
        
        let charIndex = 0;
        function typeWriter() {
            if (charIndex < text.length) {
                typedSpan.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeWriter, 50 + Math.random() * 60);
            }
        }
        setTimeout(typeWriter, 1200); // Start after hero animation finishes
    }

    /* --- NEURAL NETWORK BACKGROUND CANVAS --- */
    const canvas = document.getElementById('neural-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        const particles = [];
        const particleCount = Math.floor(window.innerWidth / 18); // Responsive particle count

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.6,
                vy: (Math.random() - 0.5) * 0.6,
                radius: Math.random() * 1.5 + 0.5
            });
        }

        function drawNeural() {
            ctx.clearRect(0, 0, width, height);
            
            // Sync with theme colors (approximate hex values from CSS)
            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const rgb = isLight ? '122, 98, 64' : '201, 168, 108'; 
            
            particles.forEach((p, index) => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${rgb}, 0.6)`;
                ctx.fill();

                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 130) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(${rgb}, ${0.25 * (1 - distance / 130)})`;
                        ctx.lineWidth = 0.6;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(drawNeural);
        }
        drawNeural();
    }

    /* --- SPOTLIGHT EFFECT FOR CARDS --- */
    const cards = document.querySelectorAll('.card-spotlight');
    
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    /* --- SCROLL PROGRESS BAR --- */
    const progressBar = document.getElementById('scroll-progress');
    
    /* --- TEXT SCRAMBLE ON SCROLL --- */
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const labels = document.querySelectorAll('.section-label');
    
    /* --- HOVER GLITCH EFFECT FOR LINKS --- */
    const glitchLinks = document.querySelectorAll('.nav-links a, .social-item');
    glitchLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            let iteration = 0;
            const originalText = link.dataset.value || link.innerText;
            if (!link.dataset.value) link.dataset.value = originalText;
            
            clearInterval(link.hoverInterval);
            
            link.hoverInterval = setInterval(() => {
                link.innerText = originalText
                    .split('')
                    .map((letter, index) => {
                        if(index < iteration) return originalText[index];
                        return originalText[index] === ' ' ? ' ' : letters[Math.floor(Math.random() * 26)];
                    })
                    .join('');
                
                if(iteration >= originalText.length) clearInterval(link.hoverInterval);
                iteration += 1 / 2;
            }, 30);
        });
    });

    const scrambleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                let iteration = 0;
                const element = entry.target;
                const originalText = element.dataset.value || element.innerText;
                element.dataset.value = originalText;
                
                clearInterval(element.interval);
                
                element.interval = setInterval(() => {
                    element.innerText = originalText
                        .split('')
                        .map((letter, index) => {
                            if(index < iteration) {
                                return originalText[index];
                            }
                            return originalText[index] === ' ' ? ' ' : letters[Math.floor(Math.random() * 26)];
                        })
                        .join('');
                    
                    if(iteration >= originalText.length){
                        clearInterval(element.interval);
                    }
                    
                    iteration += 1 / 3;
                }, 30);
                
                scrambleObserver.unobserve(element);
            }
        });
    }, { threshold: 0.8 });

    labels.forEach(label => scrambleObserver.observe(label));

    /* --- MAGNETIC LINKS --- */
    const magneticLinks = document.querySelectorAll('.nav-links a, .social-item, .nav-cta, .link-arrow');
    magneticLinks.forEach(link => {
        link.addEventListener('mousemove', e => {
            const rect = link.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            // Apply a slight spring effect
            link.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px) scale(1.05)`;
            link.style.transition = 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1)';
        });
        link.addEventListener('mouseleave', () => {
            link.style.transform = 'translate(0px, 0px) scale(1)';
            link.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
        });
    });

    /* --- PARALLAX BACKGROUND ORBS --- */
    const orbs = document.querySelectorAll('.ambient-orb');
    if (orbs.length > 0) {
        document.addEventListener('mousemove', e => {
            const x = e.clientX / window.innerWidth - 0.5;
            const y = e.clientY / window.innerHeight - 0.5;
            
            orbs.forEach((orb, index) => {
                const factor = index === 0 ? 60 : -80; // different speeds
                orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
            });
        });
    }

    /* --- ACTIVE NAV HIGHLIGHT --- */
    // Updates the active nav link as you scroll
    window.addEventListener('scroll', () => {
        if (progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + '%';
        }

        let current = '';
        const sections = document.querySelectorAll('section');
        
        // Logic to determine which section is currently on screen
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // 300px offset helps trigger the next section a bit earlier for better UX
            if (scrollY >= (sectionTop - 300)) {
                current = section.getAttribute('id');
            }
        });

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    /* --- SMOOTH SCROLL --- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});