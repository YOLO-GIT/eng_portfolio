import Matter from 'matter-js'

const {
    Engine,
    Render,
    Runner
} = Matter

export const engine = Matter.Engine.create();
export const render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false
    }
});

window.addEventListener('resize', () => {
    render.bounds.max.x = window.innerWidth;
    render.bounds.max.y = window.innerHeight;
    render.options.width = window.innerWidth;
    render.options.height = window.innerHeight;
    render.canvas.width = window.innerWidth;
    render.canvas.height = window.innerHeight;
});


export const runner = Runner.create()