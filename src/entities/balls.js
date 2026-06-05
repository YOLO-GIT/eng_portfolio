import Matter from 'matter-js'
const { Bodies } = Matter

// Use functions instead of constants so you can recalculate on load/resize
export const createBalls = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const ball1 = Bodies.circle(
        width * 0.7,  // 70% from the left
        height * 0.4, // 40% from the top
        40,
        {
            restitution: 1,
            mass: 5,
            render: {
                fillStyle: '#00bfff',
                strokeStyle: '#ffffff22',
                lineWidth: 2
            }
        }
    );

    const ball2 = Bodies.circle(
        width * 0.8,  // 80% from the left
        height * 0.5, // 50% from the top
        60,
        {
            restitution: 1,
            mass: 10,
            render: {
                fillStyle: '#ff6b6b',
                strokeStyle: '#ffffff22',
                lineWidth: 2
            }
        }
    );

    return [ball1, ball2];
}
