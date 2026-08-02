// Planta de Camelia

class RealisticCamelliaPlant {
    constructor(startX, startY, options = {}) {
        this.startX = startX || 0;
        this.startY = startY || 0;
        this.targetHeight = options.height || 440;
        this.seed = options.seed || Math.random();
        this.growthProgress = 0.0;

        this.branches = [];
        this.leaves = [];
        this.flowers = [];
        this.extensionBranches = [];

        this.generateBotanicalStructure();
    }

    getRandomSpeciesKey(allowGolden = true, allowDark = true) {
        // 18% de probabilidad para la Camelia Dorada
        if (allowGolden && Math.random() < 0.18) {
            return 'golden';
        }

        // Borgoña (6%)
        if (allowDark && Math.random() < 0.06) {
            return 'burgundy';
        }

        // colores vivos para la mayoria
        const brightSpecies = [
            'pink',
            'white',
            'crimson',
            'ruby',
            'ruby', // duplicada para que aparezca más seguido xddd (nadie leerá esto, qué hago hablando solo en los comentarios de un código que nadie verá? esquizofrenia 🤣😂😭😭😭😭 auida)
            'peach',
            'variegated_red_white',
            'variegated_pink_white'
        ];

        return brightSpecies[Math.floor(Math.random() * brightSpecies.length)];
    }

    generateBotanicalStructure() {
        this.branches = [];
        this.leaves = [];
        this.flowers = [];
        this.extensionBranches = [];

        const bend = (Math.sin(this.seed * 20) - 0.5) * 50;
        const p0 = { x: this.startX, y: this.startY };
        const p1 = { x: this.startX + bend * 0.4, y: this.startY - this.targetHeight * 0.35 };
        const p2 = { x: this.startX + bend, y: this.startY - this.targetHeight * 0.70 };
        const p3 = { x: this.startX + bend * 0.6, y: this.startY - this.targetHeight };

        this.trunkCurve = { p0, p1, p2, p3 };

        // flor principal arriba
        const topColor = this.getRandomSpeciesKey(false, false);
        const topFlower = new CamelliaFlower(p3.x, p3.y, 56, topColor);
        this.flowers.push({ flower: topFlower, tStart: 0.55, x: p3.x, y: p3.y });

        // ramas laterales
        const branchConfigs = [
            { tHeight: 0.38, len: 100, angle: -Math.PI * 0.72, color: this.getRandomSpeciesKey(false, false), flowerSize: 48 },
            { tHeight: 0.62, len: 95, angle: -Math.PI * 0.28, color: this.getRandomSpeciesKey(false, false), flowerSize: 50 },
            { tHeight: 0.82, len: 75, angle: -Math.PI * 0.78, color: this.getRandomSpeciesKey(false, false), flowerSize: 44 }
        ];

        for (let config of branchConfigs) {
            const pt = this.getTrunkPointAtT(config.tHeight);
            const endX = pt.x + Math.cos(config.angle) * config.len;
            const endY = pt.y + Math.sin(config.angle) * config.len;

            const flower = new CamelliaFlower(endX, endY, config.flowerSize, config.color);

            this.branches.push({
                startX: pt.x,
                startY: pt.y,
                endX: endX,
                endY: endY,
                tGrowthStart: config.tHeight * 0.5,
                tGrowthEnd: config.tHeight * 0.95
            });

            this.flowers.push({
                flower: flower,
                tStart: config.tHeight * 0.8,
                x: endX,
                y: endY
            });
        }

        // hojas
        const leafHeights = [0.18, 0.32, 0.48, 0.65, 0.78, 0.90];
        for (let i = 0; i < leafHeights.length; i++) {
            const t = leafHeights[i];
            const pt = this.getTrunkPointAtT(t);
            const side = i % 2 === 0 ? 1 : -1;

            this.leaves.push({
                x: pt.x,
                y: pt.y,
                side: side,
                tThreshold: t * 0.5,
                size: 26 + Math.random() * 8,
                angle: (Math.PI / 4) * side + (Math.sin(i) * 0.2)
            });
        }
    }

    checkGreenHitbox(x, y, windTime = 0) {
        if (this.growthProgress <= 0.08) return null;

        const windSway = Math.sin(windTime + this.seed * 5) * 8 * this.growthProgress;

        // tronco
        const maxT = Math.min(1.0, this.growthProgress * 1.3);
        for (let t = 0.05; t <= maxT; t += 0.04) {
            const pt = this.getTrunkPointAtT(t);
            const sway = (t * t) * windSway;
            if (Math.hypot(pt.x + sway - x, pt.y - y) < 48) {
                return { startX: pt.x, startY: pt.y, tScale: t * t };
            }
        }

        // ramas iniciales
        for (let b of this.branches) {
            if (this.growthProgress > b.tGrowthStart) {
                const unswayedMidX = (b.startX + b.endX) / 2;
                const unswayedMidY = (b.startY + b.endY) / 2;
                const swayedMidX = unswayedMidX + windSway * 0.5;

                if (Math.hypot(swayedMidX - x, unswayedMidY - y) < 48) {
                    return { startX: unswayedMidX, startY: unswayedMidY, tScale: 0.5 };
                }
            }
        }

        // más ramas, más, más y más
        for (let ext of this.extensionBranches) {
            if (ext.progress > 0.2) {
                const unswayedBx = 0.25 * ext.startX + 0.5 * ext.controlX + 0.25 * ext.endX;
                const unswayedBy = 0.25 * ext.startY + 0.5 * ext.controlY + 0.25 * ext.endY;
                const swayedBx = unswayedBx + windSway * 0.6;

                if (Math.hypot(swayedBx - x, unswayedBy - y) < 46) {
                    return { startX: unswayedBx, startY: unswayedBy, tScale: 0.6 };
                }
            }
        }

        // Y MÁS HOJAS
        for (let leaf of this.leaves) {
            if (this.growthProgress > leaf.tThreshold) {
                const sway = windSway * 0.5;
                if (Math.hypot(leaf.x + sway - x, leaf.y - y) < 42) {
                    return { startX: leaf.x, startY: leaf.y, tScale: 0.5 };
                }
            }
        }

        return null;
    }

    findBestOpenSpaceAngle(startX, startY, branchLen) {
        let bestAngle = -Math.PI * 0.5;
        let maxMinDist = -1;

        const candidateAngles = [];
        for (let i = 0; i < 18; i++) {
            candidateAngles.push(-Math.PI * 0.95 + (i / 17) * Math.PI * 0.90);
        }

        for (let angle of candidateAngles) {
            const endX = startX + Math.cos(angle) * branchLen;
            const endY = startY + Math.sin(angle) * branchLen;

            if (endX < 50 || endX > window.innerWidth - 50 || endY < 70 || endY > window.innerHeight - 40) {
                continue;
            }

            let minDistToFlower = 9999;
            for (let f of this.flowers) {
                const d = Math.hypot(f.x - endX, f.y - endY);
                if (d < minDistToFlower) {
                    minDistToFlower = d;
                }
            }

            if (minDistToFlower > maxMinDist) {
                maxMinDist = minDistToFlower;
                bestAngle = angle;
            }
        }

        return bestAngle;
    }

    addExtensionBranch(startX, startY, tScale = 0.5) {
        const randomColor = this.getRandomSpeciesKey(true, true);

        const sizeTier = Math.random();
        let flowerSize;
        if (sizeTier < 0.30) {
            flowerSize = 34 + Math.random() * 8;
        } else if (sizeTier < 0.70) {
            flowerSize = 46 + Math.random() * 8;
        } else {
            flowerSize = 58 + Math.random() * 10;
        }

        const branchLen = 140 + Math.random() * 90;
        const chosenAngle = this.findBestOpenSpaceAngle(startX, startY, branchLen);

        const endX = startX + Math.cos(chosenAngle) * branchLen;
        const endY = startY + Math.sin(chosenAngle) * branchLen;

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const sideSign = (this.extensionBranches.length % 2 === 0) ? 1 : -1;
        const perpX = -(endY - startY) * 0.28 * sideSign;
        const perpY = (endX - startX) * 0.28 * sideSign;

        const controlX = midX + perpX;
        const controlY = midY + perpY;

        const flower = new CamelliaFlower(endX, endY, flowerSize, randomColor);

        const leafSize1 = 24 + Math.random() * 6;
        const leafSize2 = 20 + Math.random() * 6;

        const extObj = {
            startX: startX,
            startY: startY,
            endX: endX,
            endY: endY,
            controlX: controlX,
            controlY: controlY,
            tScale: tScale,
            flower: flower,
            leaves: [
                { tPos: 0.35, side: sideSign, size: leafSize1, angle: chosenAngle + Math.PI / 4 },
                { tPos: 0.70, side: -sideSign, size: leafSize2, angle: chosenAngle - Math.PI / 4 }
            ],
            progress: 0.0
        };

        this.extensionBranches.push(extObj);

        this.flowers.push({
            flower: flower,
            tStart: 0,
            x: endX,
            y: endY,
            isExtension: true
        });

        return extObj;
    }

    getTrunkPointAtT(t) {
        const { p0, p1, p2, p3 } = this.trunkCurve;
        const cx = 3 * (p1.x - p0.x);
        const bx = 3 * (p2.x - p1.x) - cx;
        const ax = p3.x - p0.x - cx - bx;

        const cy = 3 * (p1.y - p0.y);
        const by = 3 * (p2.y - p1.y) - cy;
        const ay = p3.y - p0.y - cy - by;

        const xt = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
        const yt = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

        return { x: xt, y: yt };
    }

    grow(amount) {
        this.growthProgress = Math.min(1.0, this.growthProgress + (amount || 0.003));

        for (let item of this.flowers) {
            if (!item.isExtension && this.growthProgress > item.tStart) {
                const flowerBloom = (this.growthProgress - item.tStart) / (1.0 - item.tStart);
                item.flower.setBloomProgress(flowerBloom);
            }
        }

        for (let ext of this.extensionBranches) {
            if (ext.progress < 1.0) {
                ext.progress = Math.min(1.0, ext.progress + 0.012);
                const flowerBloom = Math.min(1.0, Math.max(0.0, (ext.progress - 0.25) / 0.75));
                ext.flower.setBloomProgress(flowerBloom);
            }
        }
    }

    draw(ctx, windTime = 0) {
        if (this.growthProgress <= 0.001) return;

        ctx.save();

        const windSway = Math.sin(windTime + this.seed * 5) * 8 * this.growthProgress;

        const trunkWidth = Math.max(3, 9 * (1 - this.growthProgress * 0.25));
        ctx.strokeStyle = "#1b3a24";
        ctx.lineWidth = trunkWidth;
        ctx.lineCap = "round";

        const currentT = Math.min(1.0, this.growthProgress * 1.3);
        ctx.beginPath();
        ctx.moveTo(this.trunkCurve.p0.x, this.trunkCurve.p0.y);

        const steps = 24;
        for (let i = 1; i <= steps; i++) {
            const t = (i / steps) * currentT;
            const pt = this.getTrunkPointAtT(t);
            const sway = (t * t) * windSway;
            ctx.lineTo(pt.x + sway, pt.y);
        }
        ctx.stroke();

        for (let branch of this.branches) {
            if (this.growthProgress > branch.tGrowthStart) {
                const branchProgress = Math.min(1.0, (this.growthProgress - branch.tGrowthStart) / (branch.tGrowthEnd - branch.tGrowthStart));
                const curEndX = branch.startX + (branch.endX - branch.startX) * branchProgress;
                const curEndY = branch.startY + (branch.endY - branch.startY) * branchProgress;

                ctx.strokeStyle = "#285233";
                ctx.lineWidth = 3.2;
                ctx.beginPath();
                ctx.moveTo(branch.startX + windSway * 0.4, branch.startY);
                ctx.quadraticCurveTo(
                    branch.startX + (curEndX - branch.startX) * 0.5 + windSway * 0.6,
                    branch.startY - 10,
                    curEndX + windSway,
                    curEndY
                );
                ctx.stroke();
            }
        }

        for (let ext of this.extensionBranches) {
            if (ext.progress > 0.01) {
                const p = Math.min(1.0, ext.progress / 0.45);
                const startSwayMult = ext.tScale || 0.5;

                ctx.strokeStyle = "#285233";
                ctx.lineWidth = Math.max(2.2, 4.0 * (1 - p * 0.25));
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(ext.startX + windSway * startSwayMult, ext.startY);

                const curveSteps = 18;
                for (let s = 1; s <= curveSteps; s++) {
                    const stepT = (s / curveSteps) * p;
                    const bx = (1 - stepT) * (1 - stepT) * ext.startX + 2 * (1 - stepT) * stepT * ext.controlX + stepT * stepT * ext.endX;
                    const by = (1 - stepT) * (1 - stepT) * ext.startY + 2 * (1 - stepT) * stepT * ext.controlY + stepT * stepT * ext.endY;

                    const curSwayMult = startSwayMult + (0.75 - startSwayMult) * stepT;
                    const sway = windSway * curSwayMult;
                    ctx.lineTo(bx + sway, by);
                }
                ctx.stroke();

                for (let leaf of ext.leaves) {
                    if (ext.progress > leaf.tPos * 0.4) {
                        const leafScale = Math.min(1.0, (ext.progress - leaf.tPos * 0.4) / 0.3);
                        const t = leaf.tPos * p;
                        const lx = (1 - t) * (1 - t) * ext.startX + 2 * (1 - t) * t * ext.controlX + t * t * ext.endX;
                        const ly = (1 - t) * (1 - t) * ext.startY + 2 * (1 - t) * t * ext.controlY + t * t * ext.endY;

                        const leafSwayMult = startSwayMult + (0.75 - startSwayMult) * t;
                        const sway = windSway * leafSwayMult;
                        this.drawLeaf(ctx, lx + sway, ly, leaf.side, leaf.size * leafScale, leaf.angle);
                    }
                }

                if (ext.progress > 0.25) {
                    const flowerSway = windSway * 0.75;
                    ext.flower.x = ext.endX;
                    ext.flower.y = ext.endY;
                    ext.flower.draw(ctx, flowerSway);
                }
            }
        }

        // hojas iniciales
        for (let leaf of this.leaves) {
            if (this.growthProgress > leaf.tThreshold) {
                const leafProgress = Math.min(1.0, (this.growthProgress - leaf.tThreshold) / 0.15);
                const sway = windSway * 0.5;
                this.drawLeaf(ctx, leaf.x + sway, leaf.y, leaf.side, leaf.size * leafProgress, leaf.angle);
            }
        }

        // flores del arbol base ase se e e e e e
        for (let item of this.flowers) {
            if (!item.isExtension && this.growthProgress > item.tStart) {
                item.flower.draw(ctx, windSway);
            }
        }

        ctx.restore();
    }

    drawLeaf(ctx, x, y, side, size, angle) {
        if (!size || size <= 0.5) return;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(side, 1);

        const grad = ctx.createLinearGradient(0, 0, size, 0);
        grad.addColorStop(0, "#16331e");
        grad.addColorStop(0.5, "#255633");
        grad.addColorStop(1, "#3b8550");

        ctx.fillStyle = grad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.4, -size * 0.45, size, 0);
        ctx.quadraticCurveTo(size * 0.4, size * 0.45, 0, 0);
        ctx.fill();

        ctx.strokeStyle = "rgba(180, 240, 195, 0.35)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 0.85, 0);
        ctx.stroke();

        ctx.restore();
    }
}
