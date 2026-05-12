import Matter from 'matter-js'
const { Bodies, Composite, Body } = Matter

export function setupWorld(engine, objects) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const thickness = 1000;

    // 1. Create the visible floor
    const ground = Bodies.rectangle(width / 2, height - 10, width * 2, 20, {
        isStatic: true,
        label: 'ground',
        render: { fillStyle: '#444' }
    });

    // 2. Create the invisible side/top boundaries
    const wallOptions = { isStatic: true, render: { visible: false } };
    const walls = [
        Bodies.rectangle(width / 2, -thickness / 2, width, thickness, { ...wallOptions, label: 'bound-ceiling' }),
        Bodies.rectangle(-thickness / 2, height / 2, thickness, height, { ...wallOptions, label: 'bound-left' }),
        Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, { ...wallOptions, label: 'bound-right' })
    ];

    Composite.add(engine.world, [ground, ...walls, ...objects]);

    // 3. Single resize listener to move everything
    window.addEventListener('resize', () => {
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Move the visible floor
        Body.setPosition(ground, { x: w / 2, y: h - 10 });

        // Find and move the invisible boundaries
        const bodies = engine.world.bodies;
        const ceiling = bodies.find(b => b.label === 'bound-ceiling');
        const left = bodies.find(b => b.label === 'bound-left');
        const right = bodies.find(b => b.label === 'bound-right');

        if (ceiling) Body.setPosition(ceiling, { x: w / 2, y: -thickness / 2 });
        if (left) Body.setPosition(left, { x: -thickness / 2, y: h / 2 });
        if (right) Body.setPosition(right, { x: w + thickness / 2, y: h / 2 });
    });
}
