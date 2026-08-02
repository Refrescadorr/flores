// Controlador principal

class CamelliaApp {
    constructor() {
        this.canvas = document.getElementById('gardenCanvas');
        this.ctx = this.canvas.getContext('2d', { alpha: true });

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.plant = null;
        this.particleSystem = new ParticleSystem();
        this.audio = new AmbientAudio();

        this.windTime = 0;

        this.initCanvas();
        this.initEvents();
        this.initUI();

        this.bloomNewPlant();

        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }

    initCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.particleSystem.initAmbientParticles(this.width, this.height, 35);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    bloomNewPlant() {
        const centerX = this.width / 2;
        const startY = this.height;

        const isMobile = this.width < 600;
        const targetH = isMobile ? Math.min(420, this.height * 0.62) : Math.min(480, this.height * 0.70);

        this.plant = new RealisticCamelliaPlant(centerX, startY, {
            seed: Math.random(),
            height: targetH
        });

        this.audio.playBloomChime();
    }

    initEvents() {
        this.lastTouch = 0;

        this.canvas.addEventListener('click', (e) => {
            // en móvil el navegador dispara click justo después de touchstart,
            // así que lo ignoramos si ya lo manejamos con touch
            if (Date.now() - this.lastTouch < 400) return;
            if (e.target.closest('.app-header') || e.target.closest('.modal-card')) return;
            this.handlePointerClick(e.clientX, e.clientY);
        });

        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                if (e.target.closest('.app-header') || e.target.closest('.modal-card')) return;
                this.lastTouch = Date.now();
                this.handlePointerClick(touch.clientX, touch.clientY);
            }
        }, { passive: true });
    }

    handlePointerClick(x, y) {
        if (!this.plant) return;

        let handled = false;

        // click sobre una flor
        if (this.plant.flowers) {
            for (let item of this.plant.flowers) {
                const flower = item.flower;
                if (!flower || flower.bloomProgress < 0.25 || flower.currentSize < 8) continue;

                const dist = Math.hypot(flower.x - x, flower.y - y);
                const currentRadius = flower.currentSize;

                if (dist <= currentRadius * 1.1) {
                    handled = true;

                    if (dist <= currentRadius * 0.28) {
                        this.particleSystem.spawnGoldenPollenBurst(flower.x, flower.y, 14);
                    } else {
                        this.particleSystem.spawnPetalBurst(flower.x, flower.y, flower.palette, 5);
                    }

                    this.audio.playBloomChime();
                    break;
                }
            }
        }

        // click sobre una rama o tallo
        if (!handled) {
            const greenHit = this.plant.checkGreenHitbox(x, y, this.windTime);
            if (greenHit) {
                handled = true;
                this.plant.addExtensionBranch(greenHit.startX, greenHit.startY, greenHit.tScale);

                this.particleSystem.spawnLeafSproutSparkle(greenHit.startX, greenHit.startY, 10);
                this.audio.playBloomChime();
            }
        }

        // click en el fondo
        if (!handled) {
            this.particleSystem.spawnPollenBurst(x, y, 7);
        }
    }

    initUI() {
        // botón de nacer (como le ponia no)
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.bloomNewPlant());
        }

        // descargar imagen del canvas como PNG
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadImage());
        }

        // modal de variedades
        const encyclopediaBtn = document.getElementById('encyclopediaBtn');
        const encyclopediaModal = document.getElementById('encyclopediaModal');
        const closeEncyclopediaBtn = document.getElementById('closeEncyclopediaBtn');

        if (encyclopediaBtn && encyclopediaModal) {
            encyclopediaBtn.addEventListener('click', () => {
                encyclopediaModal.classList.remove('hidden');
                this.renderEncyclopediaThumbnails();
            });

            if (closeEncyclopediaBtn) {
                closeEncyclopediaBtn.addEventListener('click', () => encyclopediaModal.classList.add('hidden'));
            }

            encyclopediaModal.addEventListener('click', (e) => {
                if (e.target === encyclopediaModal) encyclopediaModal.classList.add('hidden');
            });
        }

        // Modal / Nota (idea descartada xd)
        const dedicationBtn = document.getElementById('dedicationBtn');
        const dedicationModal = document.getElementById('dedicationModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const saveDedicationBtn = document.getElementById('saveDedicationBtn');

        if (dedicationBtn && dedicationModal) {
            dedicationBtn.addEventListener('click', () => dedicationModal.classList.remove('hidden'));
            if (closeModalBtn) closeModalBtn.addEventListener('click', () => dedicationModal.classList.add('hidden'));
            if (saveDedicationBtn) saveDedicationBtn.addEventListener('click', () => dedicationModal.classList.add('hidden'));

            dedicationModal.addEventListener('click', (e) => {
                if (e.target === dedicationModal) dedicationModal.classList.add('hidden');
            });
        }

        // audio
        const soundBtn = document.getElementById('soundBtn');
        const soundIcon = document.getElementById('soundIcon');

        if (soundBtn) {
            soundBtn.addEventListener('click', () => {
                const isPlaying = this.audio.toggleSound();
                soundBtn.classList.toggle('active', isPlaying);

                if (soundIcon) {
                    soundIcon.textContent = isPlaying ? '🔊' : '🎵';
                }
            });
        }
    }

    renderEncyclopediaThumbnails() {
        const canvases = document.querySelectorAll('.species-canvas');
        canvases.forEach(canvas => {
            const ctx = canvas.getContext('2d');
            const speciesKey = canvas.getAttribute('data-species');
            if (!speciesKey) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const flower = new CamelliaFlower(canvas.width / 2, canvas.height / 2, 34, speciesKey);
            flower.setBloomProgress(1.0);
            flower.draw(ctx, 0);
        });
    }

    downloadImage() {
        // nombre con fecha para que cada descarga sea única
        const date = new Date();
        const name = `camelias-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}.png`;

        const dataUrl = this.canvas.toDataURL('image/png');

        // por si da error en ios )?
        try {
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = name;
            a.click();
        } catch (e) {
            window.open(dataUrl, '_blank');
        }
    }

    loop() {
        try {
            this.windTime += 0.012;

            this.ctx.clearRect(0, 0, this.width, this.height);

            if (this.plant) {
                this.plant.grow(0.0035);

                if (this.plant.growthProgress > 0.65 && Math.random() < 0.035) {
                    if (this.plant.flowers && this.plant.flowers.length > 0) {
                        const flowerItem = this.plant.flowers[Math.floor(Math.random() * this.plant.flowers.length)];
                        if (flowerItem && flowerItem.flower && flowerItem.flower.bloomProgress > 0.5) {
                            this.particleSystem.spawnFallingPetal(
                                flowerItem.x,
                                flowerItem.y,
                                flowerItem.flower.palette
                            );
                        }
                    }
                }

                this.plant.draw(this.ctx, this.windTime);
            }

            this.particleSystem.update(this.width, this.height);
            this.particleSystem.draw(this.ctx);
        } catch (err) {
            console.error("Error en el bucle de renderizado:", err);
        }

        requestAnimationFrame(this.loop);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new CamelliaApp();
});
