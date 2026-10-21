
javascript:(function() {
    const e = {
        name: "single shot rifle",

        descriptionFunction() {
            return `fires one custom rounded-triangle bullet per shot`;
        },

        ammo: 24,
        ammoPack: 3,
        defaultAmmoPack: 3,
        have: false,
        cycle: 0,
        cooldown: 0,
        cdLength: 30,

        createTriangleBullet(where, velocity, damage) {
            const size = 9;
            const cornerCut = 0.28;

            // Three corners define the basic triangle, pointing forward.
            const corners = [
                { x: size, y: 0 },
                { x: -size * 0.7, y: -size * 0.75 },
                { x: -size * 0.7, y: size * 0.75 }
            ];

            // Build a rounded outline by adding points around each corner.
            const vertices = [];

            for (let i = 0; i < 3; i++) {
                const prev = corners[(i + 2) % 3];
                const curr = corners[i];
                const next = corners[(i + 1) % 3];

                const start = {
                    x: curr.x + (prev.x - curr.x) * cornerCut,
                    y: curr.y + (prev.y - curr.y) * cornerCut
                };

                const end = {
                    x: curr.x + (next.x - curr.x) * cornerCut,
                    y: curr.y + (next.y - curr.y) * cornerCut
                };

                vertices.push(start);

                // Approximate a curve between the two cut-off edges.
                for (let step = 1; step <= 4; step++) {
                    const t = step / 5;
                    const u = 1 - t;

                    vertices.push({
                        x: u * u * start.x +
                           2 * u * t * curr.x +
                           t * t * end.x,

                        y: u * u * start.y +
                           2 * u * t * curr.y +
                           t * t * end.y
                    });
                }

                vertices.push(end);
            }

            // Set up the projectile using n-gon's bullet attributes.
            const attributes = b.fireAttributes(m.angle, false);

            attributes.angle = m.angle;
            attributes.frictionAir = 0;
            attributes.friction = 0;
            attributes.restitution = 0.2;
            attributes.dmg = damage;
            attributes.minDmgSpeed = 0;
            attributes.endCycle = simulation.cycle + 180;
            attributes.classType = "bullet";
            attributes.bulletType = "rounded triangle";

            // Create the custom polygon-shaped physics body.
            const projectile = Bodies.fromVertices(
                where.x,
                where.y,
                [vertices],
                attributes
            );

            if (!projectile) return;

            // Add it to the physics world and projectile tracking list.
            Composite.add(engine.world, projectile);
            Matter.Body.setVelocity(projectile, velocity);
            bullet.push(projectile);
        },

        fire() {
            const speed = 55;
            const damage = 4;

            // Spawn the bullet just in front of the player.
            const where = {
                x: m.pos.x + 30 * Math.cos(m.angle),
                y: m.pos.y + 30 * Math.sin(m.angle)
            };

            // Aim toward the mouse and preserve some player momentum.
            const velocity = {
                x: 0.8 * player.velocity.x +
                   speed * Math.cos(m.angle),

                y: 0.5 * player.velocity.y +
                   speed * Math.sin(m.angle)
            };

            // Fire exactly one custom projectile.
            this.createTriangleBullet(where, velocity, damage);

            // Apply the normal n-gon weapon cooldown.
            m.fireCDcycle =
                m.cycle + Math.floor(this.cdLength * b.fireCDscale);
        },

        do() {
            // The normal game firing system handles input and ammo.
        }
    };

    // Remove an existing copy of this weapon before registering it.
    b.guns = b.guns.filter(
        gun => gun.name !== e.name
    );

    b.guns.push(e);

    // Prevent duplicate weapon entries.
    b.guns = b.guns.filter(
        (obj, index, self) =>
            index === self.findIndex(
                item => item.name === obj.name
            )
    );

    // Preserve the original snippet's duplicate-tech cleanup.
    tech.tech = tech.tech.filter(
        (obj, index, self) =>
            index === self.findIndex(
                item => item.name === obj.name
            )
    );

    console.log(
        "%cSingle Shot Rifle mod installed",
        "color: gray"
    );
})();
