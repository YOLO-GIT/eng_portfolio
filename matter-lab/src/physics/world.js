import Matter from 'matter-js'

const { Bodies, Composite, Body } = Matter

export function setupWorld(engine, objects) {
    // 1. Use window dimensions for initial placement
    const width = window.innerWidth;
    const height = window.innerHeight;

    const ground = Bodies.rectangle(
        width / 2,      // Center horizontally
        height - 30,    // 30px from the bottom (half of its 60px height)
        width * 2,      // Extra wide to cover the screen
        60,
        {
            isStatic: true,
            label: 'ground', // Label makes it easy to find later
            render: { fillStyle: '#444' }
        }
    )

    Composite.add(engine.world, [ground, ...objects])

    // 2. Add a resize listener
    window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;

        // Update the ground position to stay at the bottom
        Body.setPosition(ground, {
            x: newWidth / 2,
            y: newHeight - 30
        });

        // Optional: Scale the ground if the width changes drastically
        // Body.scale(ground, newWidth / oldWidth, 1);
    });
}
