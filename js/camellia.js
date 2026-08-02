// Flor de Camelia

class CamelliaFlower {
    static PALETTES = {
        pink: {
            name: "Rosa Clásico",
            primary: "#f76c85",
            secondary: "#e84364",
            inner: "#ff9aa2",
            shadow: "#a81d36",
            highlight: "#ffc6d0",
            stamen: "#ffcf33"
        },
        white: {
            name: "Blanco Marfil",
            primary: "#f5f0eb",
            secondary: "#e5ded7",
            inner: "#ffffff",
            shadow: "#c0b4a6",
            highlight: "#ffffff",
            stamen: "#ffd54f"
        },
        crimson: {
            name: "Rojo Carmín",
            primary: "#d90429",
            secondary: "#aa001e",
            inner: "#ff2a4b",
            shadow: "#59000f",
            highlight: "#ff5b73",
            stamen: "#ffe066"
        },
        ruby: {
            name: "Camelia Ruby (Peonía)",
            primary: "#d90429",
            secondary: "#800016",
            inner: "#ff4d6d",
            shadow: "#3d000a",
            highlight: "#ff85a1",
            stamen: "#ffea00",
            isRuby: true
        },
        peach: {
            name: "Durazno Coral",
            primary: "#ff9aa2",
            secondary: "#f27988",
            inner: "#ffb7b2",
            shadow: "#c44662",
            highlight: "#ffe3d8",
            stamen: "#ffe066"
        },
        burgundy: {
            name: "Borgoña Black Magic",
            primary: "#4a0408",
            secondary: "#2b0004",
            inner: "#6b0a14",
            shadow: "#140002",
            highlight: "#8c1122",
            stamen: "#ffea00",
            isDark: true
        },
        golden: {
            name: "Camelia Chrysantha (Dorada)",
            primary: "#f5c518",
            secondary: "#d49f07",
            inner: "#ffe066",
            shadow: "#8a6600",
            highlight: "#fff5b3",
            stamen: "#ff8800",
            isGolden: true
        },
        variegated_red_white: {
            name: "Jaspeada Carmín & Blanco",
            primary: "#fff9f5",
            secondary: "#f7e3dd",
            inner: "#ffffff",
            shadow: "#a83244",
            highlight: "#ffffff",
            stripe: "#d90429",
            isVariegated: true
        },
        variegated_pink_white: {
            name: "Jaspeada Rosa & Nácar",
            primary: "#f26d85",
            secondary: "#d64763",
            inner: "#ffa8b8",
            shadow: "#8a1c31",
            highlight: "#ffffff",
            edge: "rgba(255, 255, 255, 0.85)",
            isVariegatedEdge: true
        }
    };

    constructor(x, y, targetSize = 52, colorKey = 'pink') {
        this.x = x || 0;
        this.y = y || 0;
        this.targetSize = targetSize;
        this.currentSize = 0;
        this.bloomProgress = 0.0;
        this.colorKey = colorKey;
        this.palette = CamelliaFlower.PALETTES[colorKey] || CamelliaFlower.PALETTES.pink;
        this.rotationOffset = Math.random() * Math.PI * 2;

        this.cachedCanvas = null;
        this.cachedSize = 0;
        this.isCached = false;

        this.layers = this.palette.isRuby ? [
            { count: 8, radiusRatio: 1.05, widthRatio: 0.76, angleOffset: 0, ruffle: true },
            { count: 8, radiusRatio: 0.88, widthRatio: 0.68, angleOffset: Math.PI / 8, ruffle: true },
            { count: 7, radiusRatio: 0.72, widthRatio: 0.58, angleOffset: Math.PI / 6, ruffle: true },
            { count: 7, radiusRatio: 0.56, widthRatio: 0.48, angleOffset: Math.PI / 5, ruffle: true },
            { count: 6, radiusRatio: 0.40, widthRatio: 0.40, angleOffset: Math.PI / 4, ruffle: true },
            { count: 6, radiusRatio: 0.25, widthRatio: 0.32, angleOffset: Math.PI / 3, ruffle: true }
        ] : [
            { count: 6, radiusRatio: 1.0, widthRatio: 0.68, angleOffset: 0 },
            { count: 6, radiusRatio: 0.84, widthRatio: 0.60, angleOffset: Math.PI / 6 },
            { count: 6, radiusRatio: 0.68, widthRatio: 0.52, angleOffset: Math.PI / 5 },
            { count: 5, radiusRatio: 0.50, widthRatio: 0.44, angleOffset: Math.PI / 4 },
            { count: 5, radiusRatio: 0.34, widthRatio: 0.36, angleOffset: Math.PI / 3 }
        ];

        this.petalVariations = this.layers.map(layer =>
            Array.from({ length: layer.count }, () => ({
                lengthMult: 0.92 + Math.random() * 0.16,
                curveMult: (Math.random() - 0.5) * 0.12,
                stripePos: (Math.random() - 0.5) * 0.4,
                wavePeak: (Math.random() - 0.5) * 0.18
            }))
        );
    }

    setBloomProgress(progress) {
        this.bloomProgress = Math.min(1.0, Math.max(0.0, progress || 0));
        this.currentSize = this.targetSize * Math.pow(this.bloomProgress, 0.75);
    }

    createCache() {
        if (this.isCached || this.targetSize <= 2) return;

        const pad = Math.ceil(this.targetSize * 2.4);
        const cache = document.createElement('canvas');
        cache.width = pad;
        cache.height = pad;
        const cCtx = cache.getContext('2d', { alpha: true });

        cCtx.save();
        cCtx.translate(pad / 2, pad / 2);

        const savedBloom = this.bloomProgress;
        const savedSize = this.currentSize;
        this.bloomProgress = 1.0;
        this.currentSize = this.targetSize;

        this.drawSepals(cCtx, 1.0);
        for (let lIndex = 0; lIndex < this.layers.length; lIndex++) {
            this.drawPetalLayer(cCtx, lIndex, this.layers[lIndex], 1.0);
        }
        this.drawStamens(cCtx, 1.0);

        this.bloomProgress = savedBloom;
        this.currentSize = savedSize;
        cCtx.restore();

        this.cachedCanvas = cache;
        this.cachedSize = pad;
        this.isCached = true;
    }

    draw(ctx, windSway = 0) {
        if (this.bloomProgress <= 0.01 || this.currentSize <= 0.5) return;

        // flor abierta
        if (this.bloomProgress >= 0.98) {
            if (!this.isCached) {
                this.createCache();
            }
            if (this.cachedCanvas) {
                ctx.save();
                ctx.translate(this.x + windSway, this.y);
                ctx.rotate(this.rotationOffset);
                ctx.drawImage(
                    this.cachedCanvas,
                    -this.cachedSize / 2,
                    -this.cachedSize / 2
                );
                ctx.restore();
                return;
            }
        }

        // mientras abre
        ctx.save();
        ctx.translate(this.x + windSway, this.y);
        ctx.rotate(this.rotationOffset);

        if (this.bloomProgress < 0.25) {
            this.drawBud(ctx);
        } else {
            const openFactor = (this.bloomProgress - 0.25) / 0.75;

            this.drawSepals(ctx, openFactor);

            for (let lIndex = 0; lIndex < this.layers.length; lIndex++) {
                const layer = this.layers[lIndex];
                const layerBloom = Math.min(1.0, Math.max(0.0, (openFactor * 1.3) - (lIndex * 0.12)));

                if (layerBloom > 0) {
                    this.drawPetalLayer(ctx, lIndex, layer, layerBloom);
                }
            }

            if (openFactor > 0.35) {
                const stamenBloom = (openFactor - 0.35) / 0.65;
                this.drawStamens(ctx, stamenBloom);
            }
        }

        ctx.restore();
    }

    drawBud(ctx) {
        const budSize = Math.max(1, this.targetSize * 0.24 * (this.bloomProgress / 0.25));

        ctx.fillStyle = "#22442a";
        for (let i = 0; i < 4; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 2) * i);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(budSize * 0.6, -budSize * 0.8, 0, -budSize * 1.2);
            ctx.quadraticCurveTo(-budSize * 0.6, -budSize * 0.8, 0, 0);
            ctx.fill();
            ctx.restore();
        }

        ctx.fillStyle = this.palette.primary;
        ctx.beginPath();
        ctx.arc(0, -budSize * 0.35, Math.max(0.5, budSize * 0.5), 0, Math.PI * 2);
        ctx.fill();
    }

    drawSepals(ctx, openFactor) {
        const sepalSize = Math.max(1, this.currentSize * 0.38);
        ctx.fillStyle = "#1b3822";

        for (let i = 0; i < 5; i++) {
            const angle = (Math.PI * 2 / 5) * i;
            ctx.save();
            ctx.rotate(angle);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(sepalSize * 0.5, -sepalSize * 0.6, 0, -sepalSize * (1 + openFactor * 0.2));
            ctx.quadraticCurveTo(-sepalSize * 0.5, -sepalSize * 0.6, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }

    drawPetalLayer(ctx, layerIndex, layer, layerBloom) {
        const radius = this.currentSize * layer.radiusRatio * layerBloom;
        if (radius <= 0.5) return;

        const petalWidth = radius * layer.widthRatio;
        const angleStep = (Math.PI * 2) / layer.count;

        for (let i = 0; i < layer.count; i++) {
            const variation = this.petalVariations[layerIndex][i];
            const pRadius = radius * variation.lengthMult;
            if (pRadius <= 0.5) continue;

            const angle = i * angleStep + layer.angleOffset + variation.curveMult;

            ctx.save();
            ctx.rotate(angle);

            const grad = ctx.createLinearGradient(0, 0, 0, -pRadius);
            if (layerIndex === 0) {
                grad.addColorStop(0, this.palette.shadow);
                grad.addColorStop(0.5, this.palette.primary);
                grad.addColorStop(1, this.palette.highlight);
            } else if (layerIndex < 3) {
                grad.addColorStop(0, this.palette.secondary);
                grad.addColorStop(0.65, this.palette.primary);
                grad.addColorStop(1, this.palette.highlight);
            } else {
                grad.addColorStop(0, this.palette.secondary);
                grad.addColorStop(1, this.palette.inner);
            }

            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(0, 0);

            if (layer.ruffle) {
                const wPeak = variation.wavePeak * petalWidth;
                ctx.bezierCurveTo(
                    petalWidth * 1.3 + wPeak, -pRadius * 0.3,
                    petalWidth * 1.15, -pRadius * 0.82,
                    petalWidth * 0.3, -pRadius * 0.98
                );
                ctx.quadraticCurveTo(0, -pRadius * 1.05, -petalWidth * 0.3, -pRadius * 0.98);
                ctx.bezierCurveTo(
                    -petalWidth * 1.15, -pRadius * 0.82,
                    -petalWidth * 1.3 - wPeak, -pRadius * 0.3,
                    0, 0
                );
            } else {
                ctx.bezierCurveTo(
                    petalWidth * 1.1, -pRadius * 0.35,
                    petalWidth * 0.9, -pRadius * 0.9,
                    0, -pRadius
                );
                ctx.bezierCurveTo(
                    -petalWidth * 0.9, -pRadius * 0.9,
                    -petalWidth * 1.1, -pRadius * 0.35,
                    0, 0
                );
            }
            ctx.fill();

            if (this.palette.isRuby) {
                ctx.strokeStyle = "rgba(255, 180, 200, 0.4)";
                ctx.lineWidth = 1.3;
                ctx.beginPath();
                ctx.moveTo(petalWidth * 0.4, -pRadius * 0.85);
                ctx.quadraticCurveTo(0, -pRadius * 1.02, -petalWidth * 0.4, -pRadius * 0.85);
                ctx.stroke();
            }

            if (this.palette.isVariegated && this.palette.stripe) {
                ctx.fillStyle = this.palette.stripe;
                ctx.globalAlpha = 0.85;
                ctx.beginPath();
                const sx = petalWidth * variation.stripePos;
                ctx.moveTo(sx, -pRadius * 0.2);
                ctx.quadraticCurveTo(sx * 1.5, -pRadius * 0.6, sx * 0.5, -pRadius * 0.92);
                ctx.quadraticCurveTo(sx * 0.1, -pRadius * 0.6, sx, -pRadius * 0.2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            if (this.palette.isVariegatedEdge && this.palette.edge) {
                ctx.strokeStyle = this.palette.edge;
                ctx.lineWidth = 1.6;
                ctx.beginPath();
                ctx.arc(0, -pRadius * 0.85, petalWidth * 0.35, Math.PI * 0.8, Math.PI * 0.2, true);
                ctx.stroke();
            }

            ctx.strokeStyle = this.palette.isDark ? "rgba(255, 200, 210, 0.25)" : (this.palette.isRuby ? "rgba(255, 220, 230, 0.3)" : "rgba(255, 255, 255, 0.18)");
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -pRadius * 0.1);
            ctx.lineTo(0, -pRadius * 0.72);
            ctx.stroke();

            ctx.restore();
        }
    }

    drawStamens(ctx, stamenBloom) {
        if (stamenBloom <= 0.05) return;
        const count = this.palette.isRuby ? 28 : 22;
        const maxRadius = this.currentSize * (this.palette.isRuby ? 0.22 : 0.18) * stamenBloom;
        if (maxRadius <= 0.5) return;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const length = maxRadius * (0.6 + (i % 3) * 0.2);

            ctx.save();
            ctx.rotate(angle);

            ctx.strokeStyle = this.palette.isDark ? "rgba(255, 240, 180, 0.95)" : "rgba(255, 255, 230, 0.85)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, -length);
            ctx.stroke();

            ctx.fillStyle = this.palette.stamen;
            ctx.beginPath();
            ctx.arc(0, -length, Math.max(0.5, 1.9 * stamenBloom), 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }
}
