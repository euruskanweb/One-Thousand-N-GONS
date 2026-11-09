javascript:(function() {
    const e = {
        name: "cursor",
        descriptionFunction() {
            return `a cursor that follows the mouse<br>click to damage mobs<br><strong>${Number((0.5 * this.ammoPack).toFixed(1))}</strong> clicks per ${powerUps.orb.ammo()}`;
        },
        ammo: 60,
        ammoPack: 10,
        defaultAmmoPack: 10,
        have: false,
        cooldown: 0,
        cdLength: 12,
        damage: 12,
        techPower: false,
        techPierce: false,
        techChain: false,
        techNova: false,

        fire() {
            const point = simulation.mouseInGame;
            const damage = this.damage * (this.techPower ? 2 : 1);

            for (let i = 0; i < mob.length; i++) {
                const target = mob[i];
                if (!target || target.alive === false || !target.position) continue;

                const dx = target.position.x - point.x;
                const dy = target.position.y - point.y;
                const radius = Math.max(18, target.radius || 20);

                if (dx * dx + dy * dy <= radius * radius) {
                    target.damage(damage);

                    if (!this.techPierce) break;

                    if (this.techChain) {
                        for (let j = 0; j < mob.length; j++) {
                            const other = mob[j];
                            if (!other || other === target || other.alive === false || !other.position) continue;

                            const ox = other.position.x - target.position.x;
                            const oy = other.position.y - target.position.y;

                            if (ox * ox + oy * oy < 140 * 140) {
                                other.damage(damage * 0.5);
                            }
                        }
                    }

                    if (this.techNova && typeof b.explosion === "function") {
                        b.explosion(
                            { x: target.position.x, y: target.position.y },
                            80,
                            "rgba(100, 190, 255, 0.45)"
                        );
                    }
                }
            }

            this.cooldown = m.cycle + this.cdLength;
            m.fireCDcycle = m.cycle + Math.floor(this.cdLength * b.fireCDscale);
        },

        do() {
            const p = simulation.mouseInGame;

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.strokeStyle = "#ffffff";
            ctx.fillStyle = "rgba(0,0,0,0.75)";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, 24);
            ctx.lineTo(6, 17);
            ctx.lineTo(12, 27);
            ctx.lineTo(16, 25);
            ctx.lineTo(10, 15);
            ctx.lineTo(19, 14);
            ctx.closePath();

            ctx.fill();
            ctx.stroke();
            ctx.restore();
        }
    };

    b.guns = b.guns.filter(gun => gun.name !== e.name);
    b.guns.push(e);
    b.guns = b.guns.filter((obj, index, self) =>
        index === self.findIndex(item => item.name === obj.name)
    );

    const hasCursor = () => {
        const gun = b.guns.find(gun => gun.name === "cursor");
        return !!gun && gun.have === true;
    };

    const cursorTechs = [
        {
            name: "Cursor Power",
            description: "Cursor clicks deal <strong>twice as much damage</strong>",
            maxCount: 1,
            count: 0,
            frequency: 2,
            frequencyDefault: 2,
            isGunTech: true,
            allowed() {
                return hasCursor() && !e.techPower;
            },
            requires: "Cursor",
            effect() {
                e.techPower = true;
            },
            remove() {
                e.techPower = false;
            }
        },
        {
            name: "Cursor Pierce",
            description: "Cursor clicks hit <strong>all mobs under the cursor</strong>",
            maxCount: 1,
            count: 0,
            frequency: 2,
            frequencyDefault: 2,
            isGunTech: true,
            allowed() {
                return hasCursor() && !e.techPierce;
            },
            requires: "Cursor",
            effect() {
                e.techPierce = true;
            },
            remove() {
                e.techPierce = false;
            }
        },
        {
            name: "Cursor Chain",
            description: "Cursor hits also deal <strong>half damage to nearby mobs</strong>",
            maxCount: 1,
            count: 0,
            frequency: 2,
            frequencyDefault: 2,
            isGunTech: true,
            allowed() {
                return hasCursor() && !e.techChain;
            },
            requires: "Cursor",
            effect() {
                e.techChain = true;
            },
            remove() {
                e.techChain = false;
            }
        },
        {
            name: "Cursor Nova",
            description: "Cursor hits create a small <strong>explosion</strong>",
            maxCount: 1,
            count: 0,
            frequency: 2,
            frequencyDefault: 2,
            isGunTech: true,
            allowed() {
                return hasCursor() && !e.techNova;
            },
            requires: "Cursor",
            effect() {
                e.techNova = true;
            },
            remove() {
                e.techNova = false;
            }
        }
    ];

    for (const item of cursorTechs) {
        if (!tech.tech.some(existing => existing.name === item.name)) {
            tech.tech.push(item);
        }
    }

    console.log("Cursor weapon installed");
})();
