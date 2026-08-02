// Particulas: destellos verdes, pétalos cayendo, polen y ondas de toque

class ParticleSystem {
    constructor() {
        this.particles = [];
        this.fallingPetals = [];
        this.touchRipples = [];
    }

    initAmbientParticles(width, height, count = 40) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2 + 0.8,
                colorPrefix: Math.random() > 0.4 ? 'rgba(255, 230, 160, ' : 'rgba(247, 108, 133, ',
                alpha: Math.random() * 0.6 + 0.2,
                baseAlpha: Math.random() * 0.6 + 0.2,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -Math.random() * 0.3 - 0.1,
                pulseSpeed: Math.random() * 0.03 + 0.01,
                pulseAngle: Math.random() * Math.PI * 2
            });
        }
    }

    // destellos verdes al nacer una rama
    spawnLeafSproutSparkle(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2.0 + 0.5;
            this.particles.push({
                x: (x || 0) + (Math.random() - 0.5) * 10,
                y: (y || 0) + (Math.random() - 0.5) * 10,
                radius: Math.random() * 2.5 + 1.2,
                colorPrefix: Math.random() > 0.5 ? 'rgba(46, 204, 113, ' : 'rgba(180, 240, 195, ',
                alpha: 0.95,
                baseAlpha: 0.6,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.6,
                pulseSpeed: 0.05,
                pulseAngle: Math.random() * Math.PI * 2
            });
        }

        this.touchRipples.push({
            x: x || 0,
            y: y || 0,
            radius: 4,
            maxRadius: 26,
            alpha: 0.8,
            color: 'rgba(46, 204, 113, '
        });
    }

    spawnGoldenPollenBurst(x, y, count = 14) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2.2 + 0.6;
            this.particles.push({
                x: (x || 0) + (Math.random() - 0.5) * 10,
                y: (y || 0) + (Math.random() - 0.5) * 10,
                radius: Math.random() * 2.8 + 1.2,
                colorPrefix: Math.random() > 0.3 ? 'rgba(255, 215, 0, ' : 'rgba(255, 240, 140, ',
                alpha: 0.95,
                baseAlpha: 0.7,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.8,
                pulseSpeed: 0.05,
                pulseAngle: Math.random() * Math.PI * 2
            });
        }

        this.touchRipples.push({
            x: x || 0,
            y: y || 0,
            radius: 4,
            maxRadius: 28,
            alpha: 0.8,
            color: 'rgba(255, 215, 0, '
        });
    }

    spawnFallingPetal(x, y, colorTheme) {
        if (this.fallingPetals.length > 20) return;

        const petalColor = (colorTheme && typeof colorTheme === 'object' && colorTheme.primary) 
            ? colorTheme.primary 
            : (typeof colorTheme === 'string' ? colorTheme : '#f76c85');

        this.fallingPetals.push({
            x: x || 0,
            y: y || 0,
            vx: (Math.random() - 0.5) * 0.7,
            vy: Math.random() * 0.6 + 0.3,
            rotation: Math.random() * Math.PI * 2,
            vRot: (Math.random() - 0.5) * 0.02,
            size: Math.random() * 6 + 6,
            color: petalColor,
            alpha: 0.95,
            life: 1.0,
            decay: 0.0025
        });
    }

    spawnPetalBurst(x, y, palette, count = 4) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI / 2) + (Math.random() - 0.5) * 1.2;
            const speed = Math.random() * 1.5 + 0.8;
            const petalColor = (palette && palette.primary) ? palette.primary : '#f76c85';

            this.fallingPetals.push({
                x: (x || 0) + (Math.random() - 0.5) * 20,
                y: (y || 0) + (Math.random() - 0.5) * 15,
                vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.5,
                vy: Math.sin(angle) * speed,
                rotation: Math.random() * Math.PI * 2,
                vRot: (Math.random() - 0.5) * 0.04,
                size: Math.random() * 6 + 6,
                color: petalColor,
                alpha: 0.95,
                life: 1.0,
                decay: 0.003
            });
        }
    }

    spawnPollenBurst(x, y, count = 8) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2 + 0.5;
            this.particles.push({
                x: x || 0,
                y: y || 0,
                radius: Math.random() * 2.5 + 1.2,
                colorPrefix: Math.random() > 0.5 ? 'rgba(255, 230, 160, ' : 'rgba(247, 108, 133, ',
                alpha: 0.9,
                baseAlpha: 0.5,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                pulseSpeed: 0.04,
                pulseAngle: Math.random() * Math.PI * 2
            });
        }

        this.touchRipples.push({
            x: x || 0,
            y: y || 0,
            radius: 4,
            maxRadius: 32,
            alpha: 0.7,
            color: 'rgba(247, 108, 133, '
        });
    }

    update(width, height) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.pulseAngle += p.pulseSpeed;
            p.alpha = Math.max(0, Math.min(1, p.baseAlpha + Math.sin(p.pulseAngle) * 0.25));

            if (p.y < -10 || p.x < -10 || p.x > width + 10) {
                if (this.particles.length > 50) {
                    this.particles.splice(i, 1);
                } else {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }
            }
        }

        for (let i = this.touchRipples.length - 1; i >= 0; i--) {
            let r = this.touchRipples[i];
            r.radius += 1.2;
            r.alpha -= 0.025;
            if (r.alpha <= 0 || r.radius >= r.maxRadius) {
                this.touchRipples.splice(i, 1);
            }
        }

        for (let i = this.fallingPetals.length - 1; i >= 0; i--) {
            let petal = this.fallingPetals[i];
            petal.x += petal.vx + Math.sin(petal.rotation) * 0.4;
            petal.y += petal.vy;
            petal.rotation += petal.vRot;
            petal.life -= petal.decay;
            petal.alpha = Math.max(0, Math.min(1, petal.life));

            if (petal.life <= 0 || petal.y > height + 20) {
                this.fallingPetals.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        for (let p of this.particles) {
            const a = Math.max(0, Math.min(1, p.alpha || 0.5));
            ctx.fillStyle = (p.colorPrefix || 'rgba(255, 230, 160, ') + a + ')';
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.radius || 1), 0, Math.PI * 2);
            ctx.fill();
        }

        for (let r of this.touchRipples) {
            if (r.radius <= 0) continue;
            const a = Math.max(0, Math.min(1, r.alpha || 0));
            const colorPrefix = r.color || 'rgba(247, 108, 133, ';
            ctx.strokeStyle = colorPrefix + a + ')';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.stroke();
        }

        for (let petal of this.fallingPetals) {
            if (petal.size <= 0.5) continue;
            ctx.save();
            ctx.translate(petal.x, petal.y);
            ctx.rotate(petal.rotation);
            ctx.fillStyle = petal.color || '#f76c85';
            ctx.globalAlpha = Math.max(0, Math.min(1, petal.alpha || 0.9));
            
            ctx.beginPath();
            ctx.moveTo(0, -petal.size);
            ctx.bezierCurveTo(petal.size, -petal.size * 0.5, petal.size, petal.size * 0.5, 0, petal.size);
            ctx.bezierCurveTo(-petal.size, petal.size * 0.5, -petal.size, -petal.size * 0.5, 0, -petal.size);
            ctx.fill();
            
            ctx.restore();
        }
    }
}
