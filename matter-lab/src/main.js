import './style.css'

import Matter from 'matter-js'

const {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Mouse,
  MouseConstraint
} = Matter

// Create engine
const engine = Engine.create()

// Create renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 800,
    height: 600,
    wireframes: false,
    background: '#111',
  }
})

// Create floor
const ground = Bodies.rectangle(
  400,
  580,
  810,
  60,
  {
    isStatic: true,
    render: {
      fillStyle: '#444'
    }
  }
)

// Create boxes
for (let i = 0; i < 8; i++) {
  const box = Bodies.rectangle(
    200 + i * 40,
    100,
    40,
    40,
    {
      render: {
        fillStyle: '#00bfff'
      }
    }
  )

  Composite.add(engine.world, box)
}

// Add ground
Composite.add(engine.world, ground)

// Mouse drag
const mouse = Mouse.create(render.canvas)

const mouseConstraint = MouseConstraint.create(
  engine,
  {
    mouse: mouse
  }
)

Composite.add(engine.world, mouseConstraint)

// Run renderer
Render.run(render)

// Run engine
const runner = Runner.create()
Runner.run(runner, engine)