javascript:(function() {
    const e = {
        name: "rocket engine",
        descriptionFunction() {
            return `dash forward at high speed<br>hitting a mob damages it<br>${Number((0.5 * this.ammoPack).toFixed(1))}</strong> dashes per ${powerUps.orb.ammo()}`;
        },
        ammo: 5,
        ammoPack: 50,
        defaultAmmoPack: 20,
        have: false,

        cycle: 0,
        canDashFire: true,
        cooldown: 45,
        cdLength: 45,
        dashLength: 12,
        dashSpeed: 45,
        dashDamage: 40,
        dashEndCycle: 0,
        dashHit: new Set(),
        techAzimuth: false,
        techMagBeam: false,
        techChemtrail: false,
        techWoodward: false,
        lastIceTrailCycle: -1,

        fire() {
            if (!this.canDashFire) return;

            this.canDashFire = false;
            this.cooldown = 0;
            this.dashEndCycle = m.cycle + this.dashLength;
            this.dashHit = new Set();

            // Make the player immune to damage during the dash.
            m.immuneCycle = m.cycle + this.dashLength;

            // Launch the player in the direction they are aiming.
            const speed = this.dashSpeed * (this.techAzimuth ? 2 : 1);
            Matter.Body.setVelocity(player, {
                x: speed * Math.cos(m.angle),
                y: speed * Math.sin(m.angle)
            });
        },

        do() {
            // Handle the weapon cooldown.
            if (!this.canDashFire) {
                this.cooldown++;

                if (this.cooldown > this.cdLength) {
                    this.cooldown = 0;
                    this.canDashFire = true;
                }
            }

            // Only apply dash movement and collision damage while dashing.
            if (m.cycle >= this.dashEndCycle) return;

            // Azimuth thruster: double dash speed.
            const currentDashSpeed = this.dashSpeed * (this.techAzimuth ? 2 : 1);

            Matter.Body.setVelocity(player, {
                x: currentDashSpeed * Math.cos(m.angle),
                y: currentDashSpeed * Math.sin(m.angle)
            });

            // Chemtrail: leave ice along the dash path.
            if (
                this.techChemtrail &&
                this.lastIceTrailCycle !== m.cycle &&
                m.cycle % 2 === 0 &&
                typeof b.iceIX === "function"
            ) {
                this.lastIceTrailCycle = m.cycle;
                b.iceIX(0, 0, {
                    x: player.position.x,
                    y: player.position.y
                });
            }

            // Damage each mob at most once per dash.
            for (let index = 0; index < mob.length; index++) {
                const target = mob[index];

                if (
                    !target ||
                    target.alive === false ||
                    this.dashHit.has(target)
                ) continue;

                if (Matter.Query.collides(player, [target]).length > 0) {
                    this.dashHit.add(target);
                    target.damage(this.dashDamage);

                    // MagBeam: create an explosion at the collision point.
                    if (this.techMagBeam) {
                        b.explosion(
                            {
                                x: target.position.x,
                                y: target.position.y
                            },
                            100,
                            "rgba(100, 190, 255, 0.6)"
                        );
                    }

                    // Woodward Effect: create an expanding wave at the collision.
                    if (
                        this.techWoodward &&
                        typeof b.isoWave360Solo === "function"
                    ) {
                        b.isoWave360Solo(
                            {
                                x: target.position.x,
                                y: target.position.y
                            },
                            180
                        );
                    }
                }
            }
        }
    };

    // Add the Rocket Engine weapon.
    b.guns.push(e);

    // Remove duplicate weapons with the same name.
    b.guns = b.guns.filter(
        (obj, index, self) =>
            index === self.findIndex(
                item => item.name === obj.name
            )
    );

    // Remove duplicate tech entries.
    tech.tech = tech.tech.filter(
        (obj, index, self) =>
            index === self.findIndex(
                item => item.name === obj.name
            )
    );

    // Check that Rocket Engine exists.
    const hasRocketEngine = () =>
        b.guns.some(gun => gun.name === "rocket engine");

    // Register the Rocket Engine techs.
    const rocketTechs = [
        {
            name: "Azimuth thruster",
            description: "Rocket Engine dashing is <strong>twice as fast</strong>",
            maxCount: 1,
            count: 0,
            frequency: 2,
            frequencyDefault: 2,
            isGunTech: true,

            allowed() {
                return hasRocketEngine() && !e.techAzimuth;
            },

            requires: "rocket engine",

            effect() {
                e.techAzimuth = true;
            },

            remove() {
                e.techAzimuth = false;
            }
        },

        {
            name: "MagBeam",
            description: "Rocket Engine dash collisions create an <strong class='color-e'>explosion</strong>",
            maxCount: 1,
            count: 0,
            frequency: 2,
            frequencyDefault: 2,
            isGunTech: true,

            allowed() {
                return hasRocketEngine() && !e.techMagBeam;
            },

            requires: "rocket engine",

            effect() {
                e.techMagBeam = true;
            },

            remove() {
                e.techMagBeam = false;
            }
        },

        {
            name: "Chemtrail",
            description: "Rocket Engine dashing leaves a trail of <strong>ice</strong>",
            maxCount: 1,
            count: 0,
            frequency: 2,
            frequencyDefault: 2,
            isGunTech: true,

            allowed() {
                return (
                    hasRocketEngine() &&
                    e.techAzimuth &&
                    !e.techChemtrail
                );
            },

            requires: "rocket engine, Azimuth thruster",

            effect() {
                e.techChemtrail = true;
            },

            remove() {
                e.techChemtrail = false;
            }
        },

        {
            name: "Woodward Effect",
            description: "Rocket Engine dash collisions emit expanding <strong>waves</strong>",
            maxCount: 1,
            count: 0,
            frequency: 2,
            frequencyDefault: 2,
            isGunTech: true,

            allowed() {
                return (
                    hasRocketEngine() &&
                    e.techMagBeam &&
                    !e.techWoodward
                );
            },

            requires: "rocket engine, MagBeam",

            effect() {
                e.techWoodward = true;
            },

            remove() {
                e.techWoodward = false;
            }
        }
    ];

    // Add each tech only if it is not already registered.
    for (const item of rocketTechs) {
        if (!tech.tech.some(existing => existing.name === item.name)) {
            tech.tech.push(item);
        }
    }

    console.log(
        "Rocket Thrust Check",
        "Rocket Thrust Active"
    );
})();
