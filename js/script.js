/* ==========================================================================
   BeeDrop - Interactive Animations & High-Performance Script
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Initialize Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }

    // 2. Register GSAP Plugins
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);
    }

    // 3. Lenis Smooth Scroll Setup
    let lenis;
    if (typeof Lenis !== "undefined" && !prefersReducedMotion) {
        lenis = new Lenis({
            lerp: 0.08, // Physics-based normal smooth scroll (120fps optimized)
            wheelMultiplier: 1,
            touchMultiplier: 2,
            normalizeWheel: true
        });

        // Sync Lenis with GSAP ScrollTrigger
        if (window.gsap && window.ScrollTrigger) {
            lenis.on('scroll', ScrollTrigger.update);
            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });
            gsap.ticker.lagSmoothing(0, 0);
        }
    }

    // 4. Mouse Spotlight Follower (GPU quickTo)
    const spotlight = document.getElementById("mouse-spotlight");
    if (spotlight && window.gsap && !prefersReducedMotion) {
        const xTo = gsap.quickTo(spotlight, "x", { duration: 0.35, ease: "power3" });
        const yTo = gsap.quickTo(spotlight, "y", { duration: 0.35, ease: "power3" });

        window.addEventListener("mousemove", (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        }, { passive: true });
    }

    // 5. 3D Tilt Card & Glare Effect (GPU-accelerated properties only)
    if (!prefersReducedMotion) {
        const tiltCards = document.querySelectorAll(".tilt-card, .hover-img-card");
        tiltCards.forEach((card) => {
            let ticking = false;
            card.addEventListener("mousemove", (e) => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const rect = card.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const centerX = rect.width / 2;
                        const centerY = rect.height / 2;

                        const rotateX = ((y - centerY) / centerY) * -8;
                        const rotateY = ((x - centerX) / centerX) * 8;

                        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });

            card.addEventListener("mouseleave", () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    // 6. Image Lightbox Modal Handler
    const lightboxModal = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxClose = document.getElementById("lightbox-close");
    const hoverImgCards = document.querySelectorAll(".hover-img-card, .hero-featured-card");

    if (lightboxModal && lightboxImg) {
        hoverImgCards.forEach((card) => {
            card.addEventListener("click", () => {
                const img = card.querySelector("img");
                if (img) {
                    lightboxImg.src = img.src;
                    lightboxImg.alt = img.alt || "BeeDrop App Screenshot";
                    lightboxModal.classList.add("active");
                    if (lenis) lenis.stop();
                }
            });
        });

        const closeLightbox = () => {
            lightboxModal.classList.remove("active");
            if (lenis) lenis.start();
        };

        if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
        lightboxModal.addEventListener("click", (e) => {
            if (e.target === lightboxModal) closeLightbox();
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && lightboxModal.classList.contains("active")) {
                closeLightbox();
            }
        });
    }

    // 7. FAQ Accordion Handler (Accessible)
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach((item) => {
        const question = item.querySelector(".faq-question");
        if (question) {
            question.setAttribute("tabindex", "0");
            question.setAttribute("role", "button");
            question.setAttribute("aria-expanded", "false");

            const toggleFaq = () => {
                const isActive = item.classList.contains("active");
                faqItems.forEach((other) => {
                    other.classList.remove("active");
                    const otherQ = other.querySelector(".faq-question");
                    if (otherQ) otherQ.setAttribute("aria-expanded", "false");
                });
                if (!isActive) {
                    item.classList.add("active");
                    question.setAttribute("aria-expanded", "true");
                }
            };

            question.addEventListener("click", toggleFaq);
            question.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleFaq();
                }
            });
        }
    });

    // 8. GSAP ScrollTrigger Animations
    if (window.gsap && window.ScrollTrigger) {
        if (prefersReducedMotion) {
            gsap.set(".gsap-reveal, .hero-animate", { opacity: 1, y: 0 });
        } else {
            // Element Reveal with once: true
            const reveals = document.querySelectorAll(".gsap-reveal");
            reveals.forEach((el) => {
                gsap.to(el, {
                    scrollTrigger: {
                        trigger: el,
                        start: "top 88%",
                        once: true
                    },
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "power3.out"
                });
            });

            // Hero Section Initial Animation
            gsap.from(".hero-animate", {
                opacity: 0,
                y: 30,
                duration: 0.9,
                stagger: 0.15,
                ease: "power3.out",
                delay: 0.05
            });

            // Hero Parallax Scroll
            gsap.fromTo(".hero-visual-wrapper",
                { y: 0, opacity: 1 },
                {
                    scrollTrigger: {
                        trigger: "#hero",
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    },
                    y: 80,
                    opacity: 0.1,
                    ease: "none",
                    immediateRender: false
                }
            );

            // Stagger Animation for Speed Table Rows
            if (document.querySelector(".speed-table")) {
                gsap.from(".speed-table tbody tr", {
                    scrollTrigger: {
                        trigger: ".speed-table-container",
                        start: "top 82%",
                        once: true
                    },
                    opacity: 0,
                    x: -25,
                    stagger: 0.06,
                    duration: 0.55,
                    ease: "power2.out"
                });
            }
        }
    }

    // 9. Sidebar Navigation Logic (ScrollSpy & Mobile Toggle)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            document.body.classList.toggle('mobile-menu-active');
        });
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                document.body.classList.remove('mobile-menu-active');
            });
        });
    }

    // ScrollSpy to highlight active sidebar link
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');
    
    if (sections.length > 0 && navLinks.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);
        
        sections.forEach(sec => observer.observe(sec));
    }

    // 10. Precision Anchor Smooth Scroll Handler
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    if (lenis) {
                        lenis.scrollTo(targetEl, { offset: -30, lerp: 0.1 });
                    } else {
                        const y = targetEl.getBoundingClientRect().top + window.pageYOffset - 30;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                }
            }
        });
    });

    // 11. Optimized Three.js WebGL Canvas (Delayed Initialization & Page Visibility API)
    function initThreeBackground() {
        const canvas = document.getElementById('webgl-canvas');
        if (!canvas || !window.THREE || prefersReducedMotion) return;

        let isTabVisible = !document.hidden;
        let isCanvasVisible = true;
        let animationFrameId;

        // Page Visibility API handler
        document.addEventListener('visibilitychange', () => {
            isTabVisible = !document.hidden;
            if (isTabVisible && isCanvasVisible) {
                if (!animationFrameId) animate();
            } else {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
            }
        });

        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0x07080B, 0.06);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 1, 9);

        const renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance",
            precision: "mediump"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25));

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x07080b, 1.0);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xFBBF24, 2, 15);
        scene.add(pointLight);

        const cyanLight = new THREE.PointLight(0x38BDF8, 1, 20);
        cyanLight.position.set(5, 5, 2);
        scene.add(cyanLight);

        const magentaLight = new THREE.PointLight(0xd946ef, 1, 20);
        magentaLight.position.set(-5, -5, 2);
        scene.add(magentaLight);

        // Load Textures
        const textureLoader = new THREE.TextureLoader();
        const macTexture = textureLoader.load('assets/beedrop_mac_app.webp');
        const pcTexture = textureLoader.load('assets/beedrop_live_transfer.webp');
        const phoneTexture = textureLoader.load('assets/beedrop_qr_pairing.webp');

        const macScreenMat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: macTexture, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        const pcScreenMat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: pcTexture, transparent: true, opacity: 0.9, side: THREE.DoubleSide });
        const phoneScreenMat = new THREE.MeshBasicMaterial({ color: 0xffffff, map: phoneTexture, transparent: true, opacity: 0.9, side: THREE.DoubleSide });

        const glassMat = new THREE.MeshPhysicalMaterial({
            color: 0x0f172a,
            metalness: 0.9,
            roughness: 0.1,
            transmission: 0.9,
            transparent: true,
            opacity: 0.7,
            emissive: 0x38BDF8,
            emissiveIntensity: 0.2
        });
        const neonWireMat = new THREE.LineBasicMaterial({ 
            color: 0x38BDF8, 
            transparent: true, 
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        function createHoloDevice(geom, hasScreen = false, screenGeom = null, screenPos = new THREE.Vector3(), customScreenMat = null) {
            const group = new THREE.Group();
            const mesh = new THREE.Mesh(geom, glassMat);
            const edges = new THREE.EdgesGeometry(geom);
            const line = new THREE.LineSegments(edges, neonWireMat);
            
            group.add(mesh);
            group.add(line);
            
            const glowLine = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
                color: 0x38BDF8, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending
            }));
            glowLine.scale.set(1.04, 1.04, 1.04);
            group.add(glowLine);

            if (hasScreen && screenGeom) {
                const screen = new THREE.Mesh(screenGeom, customScreenMat || macScreenMat);
                screen.position.copy(screenPos);
                group.add(screen);
            }

            return group;
        }

        // 1. Holographic Mac
        const macGroup = new THREE.Group();
        const macBase = createHoloDevice(new THREE.BoxGeometry(2.2, 0.1, 1.6));
        const macScreen = createHoloDevice(new THREE.BoxGeometry(2.2, 1.4, 0.05), true, new THREE.PlaneGeometry(2.1, 1.3), new THREE.Vector3(0, 0, 0.03), macScreenMat);
        macScreen.position.set(0, 0.7, -0.75);
        macScreen.rotation.x = -0.15;
        macGroup.add(macBase, macScreen);
        macGroup.position.set(-3.5, -1, -2);
        macGroup.rotation.y = Math.PI / 5;
        scene.add(macGroup);

        // 2. Holographic PC Monitor
        const winGroup = new THREE.Group();
        const winMonitor = createHoloDevice(new THREE.BoxGeometry(2.8, 1.6, 0.1), true, new THREE.PlaneGeometry(2.7, 1.5), new THREE.Vector3(0, 0, 0.06), pcScreenMat);
        winMonitor.position.y = 1.2;
        const winStand = createHoloDevice(new THREE.CylinderGeometry(0.1, 0.2, 0.8, 8));
        winStand.position.y = 0.4;
        const winBase = createHoloDevice(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16));
        winGroup.add(winMonitor, winStand, winBase);
        winGroup.position.set(3.5, 0, -4);
        winGroup.rotation.y = -Math.PI / 6;
        scene.add(winGroup);

        // 3. Holographic Phone
        const phoneGroup = new THREE.Group();
        const phone = createHoloDevice(new THREE.BoxGeometry(0.9, 1.8, 0.1), true, new THREE.PlaneGeometry(0.8, 1.7), new THREE.Vector3(0, 0, 0.06), phoneScreenMat);
        phoneGroup.add(phone);
        phoneGroup.position.set(0, -2, 1.5);
        phoneGroup.rotation.x = -0.2;
        scene.add(phoneGroup);

        // 4. The Golden Bee Orb
        const beeGroup = new THREE.Group();
        const orbG = new THREE.SphereGeometry(0.2, 12, 12);
        const orbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const beeOrb = new THREE.Mesh(orbG, orbMat);
        
        const haloG = new THREE.SphereGeometry(0.28, 12, 12);
        const haloMat = new THREE.MeshBasicMaterial({ color: 0xFBBF24, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
        const halo = new THREE.Mesh(haloG, haloMat);
        
        const wingG = new THREE.TorusGeometry(0.4, 0.02, 4, 16);
        const wingMat = new THREE.MeshBasicMaterial({ color: 0xFBBF24, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
        const wing1 = new THREE.Mesh(wingG, wingMat);
        wing1.rotation.x = Math.PI / 2;
        const wing2 = new THREE.Mesh(wingG, wingMat);
        wing2.rotation.y = Math.PI / 2;
        
        beeGroup.add(beeOrb, halo, wing1, wing2);
        beeGroup.position.copy(macGroup.position);
        beeGroup.position.y += 1.5;
        scene.add(beeGroup);

        // 5. Optimized Net Background (Balanced particles for smooth fps and visuals)
        const netParticlesCount = 80;
        const netPositions = new Float32Array(netParticlesCount * 3);
        const netVelocities = [];

        for (let i = 0; i < netParticlesCount; i++) {
            netPositions[i * 3] = (Math.random() - 0.5) * 30;
            netPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            netPositions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;
            
            netVelocities.push({
                x: (Math.random() - 0.5) * 0.015,
                y: (Math.random() - 0.5) * 0.015,
                z: (Math.random() - 0.5) * 0.015
            });
        }

        const netGeom = new THREE.BufferGeometry();
        netGeom.setAttribute('position', new THREE.BufferAttribute(netPositions, 3));
        
        const createCircleTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(16, 16, 14, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            return new THREE.CanvasTexture(canvas);
        };

        const netMat = new THREE.PointsMaterial({
            size: 0.15,
            color: 0xed9f18,
            transparent: true,
            opacity: 0.8,
            map: createCircleTexture(),
            alphaTest: 0.1,
            depthWrite: false
        });
        const netPoints = new THREE.Points(netGeom, netMat);
        scene.add(netPoints);

        const maxLines = (netParticlesCount * (netParticlesCount - 1)) / 2;
        const linePositions = new Float32Array(maxLines * 6);
        const lineColors = new Float32Array(maxLines * 6);
        const lineGeom = new THREE.BufferGeometry();
        lineGeom.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        lineGeom.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
        
        const lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });
        const netLines = new THREE.LineSegments(lineGeom, lineMat);
        scene.add(netLines);

        // 6. Data Stream Particles
        const streamParticles = [];
        const streamGroup = new THREE.Group();
        scene.add(streamGroup);

        function createDataStream(startPos, endPos) {
            const curve = new THREE.QuadraticBezierCurve3(
                startPos,
                new THREE.Vector3((startPos.x + endPos.x)/2, Math.max(startPos.y, endPos.y) + 3, (startPos.z + endPos.z)/2),
                endPos
            );
            
            const count = 18;
            for (let i = 0; i < count; i++) {
                const pMesh = new THREE.Mesh(
                    new THREE.SphereGeometry(0.04, 4, 4),
                    new THREE.MeshBasicMaterial({ color: 0xFBBF24, transparent: true, opacity: 0, blending: THREE.AdditiveBlending })
                );
                streamGroup.add(pMesh);
                streamParticles.push({
                    mesh: pMesh,
                    curve: curve,
                    progress: Math.random(),
                    speed: 0.004 + Math.random() * 0.008
                });
            }
            return streamParticles;
        }

        createDataStream(macGroup.position, winGroup.position);
        createDataStream(winGroup.position, phoneGroup.position);
        createDataStream(phoneGroup.position, macGroup.position);

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }, { passive: true });

        const clock = new THREE.Clock();
        const baseColor = new THREE.Color(0xed9f18);

        function animate() {
            if (!isTabVisible) {
                animationFrameId = null;
                return;
            }

            animationFrameId = requestAnimationFrame(animate);
            const time = clock.getElapsedTime();
            
            macGroup.position.y = -1 + Math.sin(time * 0.8) * 0.15;
            winGroup.position.y = Math.cos(time * 0.6) * 0.15;
            phoneGroup.position.y = -2 + Math.sin(time * 0.9) * 0.15;
            
            beeGroup.position.y += Math.sin(time * 8) * 0.015;
            halo.scale.setScalar(1 + Math.sin(time * 10) * 0.1);
            wing1.rotation.z = time * 2;
            wing2.rotation.x = time * -2.5;
            
            // Net Animation Update
            const positions = netPoints.geometry.attributes.position.array;
            const linesPos = netLines.geometry.attributes.position.array;
            const linesCol = netLines.geometry.attributes.color.array;
            let lineIndex = 0;
            let colorIndex = 0;

            for (let i = 0; i < netParticlesCount; i++) {
                positions[i * 3] += netVelocities[i].x;
                positions[i * 3 + 1] += netVelocities[i].y;
                positions[i * 3 + 2] += netVelocities[i].z;

                if (Math.abs(positions[i * 3]) > 15) netVelocities[i].x *= -1;
                if (Math.abs(positions[i * 3 + 1]) > 10) netVelocities[i].y *= -1;
                if (Math.abs(positions[i * 3 + 2] + 5) > 10) netVelocities[i].z *= -1;

                for (let j = i + 1; j < netParticlesCount; j++) {
                    const dx = positions[i * 3] - positions[j * 3];
                    const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                    const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                    const distSq = dx * dx + dy * dy + dz * dz;

                    if (distSq < 22) { 
                        const alpha = 1.0 - (distSq / 22);
                        
                        linesPos[lineIndex++] = positions[i * 3];
                        linesPos[lineIndex++] = positions[i * 3 + 1];
                        linesPos[lineIndex++] = positions[i * 3 + 2];
                        
                        linesPos[lineIndex++] = positions[j * 3];
                        linesPos[lineIndex++] = positions[j * 3 + 1];
                        linesPos[lineIndex++] = positions[j * 3 + 2];

                        linesCol[colorIndex++] = baseColor.r * alpha;
                        linesCol[colorIndex++] = baseColor.g * alpha;
                        linesCol[colorIndex++] = baseColor.b * alpha;

                        linesCol[colorIndex++] = baseColor.r * alpha;
                        linesCol[colorIndex++] = baseColor.g * alpha;
                        linesCol[colorIndex++] = baseColor.b * alpha;
                    }
                }
            }
            netPoints.geometry.attributes.position.needsUpdate = true;
            netLines.geometry.setDrawRange(0, lineIndex / 3);
            netLines.geometry.attributes.position.needsUpdate = true;
            netLines.geometry.attributes.color.needsUpdate = true;
            
            streamParticles.forEach(sp => {
                sp.progress += sp.speed;
                if (sp.progress > 1) sp.progress = 0;
                const pos = sp.curve.getPoint(sp.progress);
                sp.mesh.position.copy(pos);
            });

            pointLight.position.copy(beeGroup.position);
            renderer.render(scene, camera);
        }

        animate();

        // GSAP Timeline for 3D Camera & Orb
        if (window.gsap && window.ScrollTrigger) {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true
                }
            });

            const p1 = macGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0));
            const p2 = winGroup.position.clone().add(new THREE.Vector3(0, 2.5, 0));
            const p3 = phoneGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0));
            const allStreamMats = streamParticles.map(sp => sp.mesh.material);

            tl.to(beeGroup.position, { x: p2.x, y: p2.y, z: p2.z, duration: 2, ease: "power1.inOut" }, 0)
              .to(camera.position, { x: 2, y: 0.5, z: 8, duration: 2, ease: "power1.inOut" }, 0)
              .to(allStreamMats.slice(0, 18), { opacity: 0.8, duration: 0.5, yoyo: true, repeat: 1, stagger: 0.02 }, 1)

              .to(beeGroup.position, { x: p3.x, y: p3.y, z: p3.z, duration: 2, ease: "power1.inOut" }, 2)
              .to(camera.position, { x: -2, y: 0, z: 7, duration: 2, ease: "power1.inOut" }, 2)
              .to(allStreamMats.slice(18, 36), { opacity: 0.8, duration: 0.5, yoyo: true, repeat: 1, stagger: 0.02 }, 3)

              .to(beeGroup.position, { x: p1.x, y: p1.y, z: p1.z, duration: 2, ease: "power1.inOut" }, 4)
              .to(camera.position, { x: 0, y: 1, z: 9, duration: 2, ease: "power1.inOut" }, 4)
              .to(allStreamMats.slice(36, 54), { opacity: 0.8, duration: 0.5, yoyo: true, repeat: 1, stagger: 0.02 }, 5);
        }
    }

    // Prioritize critical rendering before initializing Three.js WebGL canvas
    const startThreeJS = () => {
        if (prefersReducedMotion) return;
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        threeScript.onload = () => {
            if (window.requestIdleCallback) {
                requestIdleCallback(() => initThreeBackground(), { timeout: 500 });
            } else {
                setTimeout(initThreeBackground, 250);
            }
        };
        document.body.appendChild(threeScript);
    };

    if (document.readyState === 'complete') {
        startThreeJS();
    } else {
        window.addEventListener('load', startThreeJS);
    }
});
