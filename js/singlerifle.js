
javascript:(function() {
    const e = {
        name: "single shot rifle",
        descriptionFunction() {
            return `fire a single, high-speed <strong>bullet</strong><br>with a slow fire rate<br><strong>${Number((0.5 * this.ammoPack).toFixed(1))}</strong> shots per ${powerUps.orb.ammo()}`;
        },
        ammo: 24,
        ammoPack: 3,
        defaultAmmoPack: 3,
        have: false,
        cooldown: 0,
        cdLength: 30,

        fire() {
            // Fire exactly one projectile toward the mouse.
            const speed = 55;
            const damage = 4;

            b.nail(
                {
                    x: m.pos.x + 30 * Math.cos(m.angle),
                    y: m.pos.y + 30 * Math.sin(m.angle)
                },
                {
                    x: speed * Math.cos(m.angle),
                    y: speed * Math.sin(m.angle)
                },
                damage
            );

            // Set the weapon's firing cooldown.
            m.fireCDcycle = m.cycle + Math.floor(this.cdLength * b.fireCDscale);
        },

        do() {
            // The game's normal firing system handles ammo and cooldown.
        }
    };

    // Replace an existing copy so reinstalling does not create duplicates.
    b.guns = b.guns.filter(
        gun => gun.name !== e.name
    );

    b.guns.push(e);

    // Remove duplicate gun names, preserving the first occurrence.
    b.guns = b.guns.filter(
        (obj, index, self) =>
            index === self.findIndex(item => item.name === obj.name)
    );

    // Remove duplicate tech entries, matching your original framework.
    tech.tech = tech.tech.filter(
        (obj, index, self) =>
            index === self.findIndex(item => item.name === obj.name)
    );

    console.log("%cSingle Shot Rifle mod installed", "color: gray");
})();
