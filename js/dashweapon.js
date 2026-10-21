javascript:(function() {
    const e = {
        name: "thrusters",
        descriptionFunction() {
            return `dash forward at high speed<br>hitting a mob damages it<br>${Number((0.5 * this.ammoPack).toFixed(1))}</strong> dashes per ${powerUps.orb.ammo()}`;
        },
        ammo: 5,
        ammoPack: 10,
        defaultAmmoPack: 10,
        have: false,

        cycle: 0,
        canDashFire: true,
        cooldown: 0,
        cdLength: 450,
        dashLength: 12,
        dashSpeed: 45,
        dashDamage: 35,
        dashEndCycle: 0,
        dashHit: new Set(),

        fire() {
            if (!this.canDashFire) return;

            this.canDashFire = false;
            this.cooldown = 0;
            this.dashEndCycle = m.cycle + this.dashLength;
            this.dashHit = new Set();

            // Make the player immune to damage during the dash.
            m.immuneCycle = m.cycle + this.dashLength;

            // Launch the player in the direction they are aiming.
            Matter.Body.setVelocity(player, {
                x: this.dashSpeed * Math.cos(m.angle),
                y: this.dashSpeed * Math.sin(m.angle)
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

            // Keep the player moving quickly in the aiming direction.
            Matter.Body.setVelocity(player, {
                x: this.dashSpeed * Math.cos(m.angle),
                y: this.dashSpeed * Math.sin(m.angle)
            });

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
                }
            }
        },
    };

    // Add the Dash weapon.
    b.guns.push(e);

    // Remove duplicate weapons with the same name.
    const gunArray = b.guns.filter(
        (obj, index, self) =>
            index === self.findIndex(
                (item) => item.name === obj.name
            )
    );

    // Remove duplicate tech entries, matching sniper.js.
    const techArray = tech.tech.filter(
        (obj, index, self) =>
            index === self.findIndex(
                (item) => item.name === obj.name
            )
    );

    b.guns = gunArray;
    tech.tech = techArray;

    console.log("%cDash mod successfully installed", "color: gray");
})();
