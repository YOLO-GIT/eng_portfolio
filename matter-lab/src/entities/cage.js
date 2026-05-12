import Matter from 'matter-js'
const { Bodies, Composite } = Matter

export function createCage(engine) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const thickness = 12; // Slimmer, more modern look
    const cageSize = Math.min(w, h) * 0.6; // Scales based on smallest screen dimension
    const centerX = w / 2;
    const centerY = h / 2;

    // Visual options for a "Neon" look
    const neonWallOptions = {
        isStatic: true,
        chamfer: { radius: 10 }, // Beautiful rounded corners
        render: {
            fillStyle: 'rgba(0, 191, 255, 0.05)', // Faint transparent blue fill
            strokeStyle: '#00bfff',              // Bright neon blue border
            lineWidth: 3
        }
    };

    const leftWall = Bodies.rectangle(
        centerX - cageSize / 2, centerY,
        thickness, cageSize, neonWallOptions
    );

    const rightWall = Bodies.rectangle(
        centerX + cageSize / 2, centerY,
        thickness, cageSize, neonWallOptions
    );

    const topWall = Bodies.rectangle(
        centerX, centerY - cageSize / 2,
        cageSize, thickness, neonWallOptions
    );

    const bottomWall = Bodies.rectangle(
        centerX, centerY + cageSize / 2,
        cageSize, thickness, neonWallOptions
    );

    // Clear previous cage if it exists to prevent stacking
    const existingWalls = engine.world.bodies.filter(b => b.label === 'cage-wall');
    Composite.remove(engine.world, existingWalls);

    // Label them so we can find/remove them later
    [leftWall, rightWall, topWall, bottomWall].forEach(wall => wall.label = 'cage-wall');

    Composite.add(engine.world, [leftWall, rightWall, topWall, bottomWall]);
}
