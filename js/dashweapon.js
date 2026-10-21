javascript:(function() {
    const e = {
        name: "dash",
        descriptionFunction() {
            return `Dash forward at high speed in the direction you are aiming. Hitting a mob during the dash damages it.`;
        },
        ammo: Infinity,
        ammoPack: Infinity,
        defaultAmmoPack: Infinity,
        have: false,

        cycle: 0,
        canDashFire: true,
        cooldown: 0,
        cdLength: 45,
        dashLength: 12,
        dashSpeed: 45,
        dashDamage: 0.35,
        dashEndCycle: 0,
        dashHit: new Set(),

        fire() {
            if (!this.canDashFire) return;

            this.canDashFire = false;
            this.cooldown = 0;
            this.dashEndCycle = m.cycle + this.dashLength;
            this.dashHit = new Set();

            // Launch the player in the direction they are aiming.
            Matter.Body.setVelocity(player, {
                x: this.dashSpeed * Math.cos(m.angle),
                y: this.dashSpeed * Math.sin(m.angle)
            });
        },

        do() {
            // Handle cooldown.
            if (!this.canDashFire) {
                this.cooldown++;

                if (this.cooldown > this.cdLength) {
                    this.cooldown = 0;
                    this.canDashFire = true;
                }
            }

            // Stop applying dash speed when the dash ends.
            if (m.cycle >= this.dashEndCycle) return;

            // Maintain high speed during the dash.
            Matter.Body.setVelocity(player, {
                x: this.dashSpeed * Math.cos(m.angle),
                y: this.dashSpeed * Math.sin(m.angle)
            });

            // Damage each mob only once per dash.
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
                }
            }
        },
    };

    b.guns.push(e);

    // Remove duplicate weapons with the same name.
    const gunArray = b.guns.filter(
        (obj, index, self) =>
            index === self.findIndex((item) => item.name === obj.name)
    );

    // Remove duplicate tech entries, matching the original mod format.
    const techArray = tech.tech.filter(
        (obj, index, self) =>
            index === self.findIndex((item) => item.name === obj.name)
    );

    b.guns = gunArray;
    tech.tech = techArray;

    console.log("%cDash mod successfully installed", "color: gray");
})();
