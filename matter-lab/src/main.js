// import './style.css'
import './custom_css/custom.css'

import Matter from 'matter-js'

import {
  engine,
  render,
  runner,

} from './physics/engine'

import {
  createBalls
} from './entities/balls'

import {
  setupWorld
} from './physics/world'

import {
  addMouseControl
} from './physics/controls'

import {
  updateStats
} from './ui/stats'

const velocityInput =
  document.getElementById('velocityInput')

const launchBtn =
  document.getElementById('launchBtn')

const resetBtn =
  document.getElementById('resetBtn')

const velocityText =
  document.getElementById('velocityText')

const momentumText =
  document.getElementById('momentumText')


// Update your initial setup
let balls = createBalls()
let ball1 = balls[0]
let ball2 = balls[1]

setupWorld(engine, balls)

// Mouse control
addMouseControl(engine, render)

// Launch button
launchBtn.addEventListener('click', () => {

  const velocity =
    Number(velocityInput.value)

  const mass1 =
    Number(mass1Input.value)

  const mass2 =
    Number(mass2Input.value)

  Matter.Body.setMass(ball1, mass1)
  Matter.Body.setMass(ball2, mass2)

  Matter.Body.setVelocity(ball1, {
    x: velocity,
    y: 0
  })

})

// Reset button
resetBtn.addEventListener('click', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Reset Ball 1 (Match the logic in your createBalls function)
  Matter.Body.setPosition(ball1, { x: w * 0.7, y: h * 0.4 });
  Matter.Body.setVelocity(ball1, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(ball1, 0);

  // Reset Ball 2
  Matter.Body.setPosition(ball2, { x: w * 0.8, y: h * 0.5 });
  Matter.Body.setVelocity(ball2, { x: 0, y: 0 });
  Matter.Body.setAngularVelocity(ball2, 0);

  collisionText.innerText = 'Collision Status: Waiting...';
});

// Stats Update
Matter.Events.on(engine, 'collisionStart', () => {
  collisionText.innerText =
    'Collision Status: COLLIDED!'
})

// Update stats
Matter.Events.on(engine, 'afterUpdate', () => {

  updateStats(
    ball1,
    velocityText,
    momentumText,
    energyText
  )

})
// Stats Update end

// engine.gravity.y = 0

// UI Elements
const collisionText =
  document.getElementById('collisionText')

const mass1Input =
  document.getElementById('mass1Input')

const mass2Input =
  document.getElementById('mass2Input')
// UI Elements end

// Settings panel toggle
const toggleSettingsBtn =
  document.getElementById('toggleSettingsBtn')

const settingsPanel =
  document.getElementById('settingsPanel')

let settingsVisible = true

toggleSettingsBtn.addEventListener('click', () => {

  settingsVisible =
    !settingsVisible

  settingsPanel.classList.toggle(
    'hidden'
  )

  toggleSettingsBtn.innerText =
    settingsVisible
      ? 'Hide'
      : 'Show'

})
// Settings panel toggle end

window.addEventListener('resize', () => {
  // 1. Update Canvas
  render.canvas.width = window.innerWidth;
  render.canvas.height = window.innerHeight;

  // 2. Update Ground (assuming you labeled it 'ground' in world.js)
  const ground = engine.world.bodies.find(b => b.label === 'ground');
  if (ground) {
    Matter.Body.setPosition(ground, {
      x: window.innerWidth / 2,
      y: window.innerHeight - 30
    });
  }
});

window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const thickness = 100;

  // Find our specific walls by label and snap them to new edges
  const bodies = engine.world.bodies;

  const ground = bodies.find(b => b.label === 'bound-ground');
  const ceiling = bodies.find(b => b.label === 'bound-ceiling');
  const left = bodies.find(b => b.label === 'bound-left');
  const right = bodies.find(b => b.label === 'bound-right');

  if (ground) Body.setPosition(ground, { x: w / 2, y: h + thickness / 2 });
  if (ceiling) Body.setPosition(ceiling, { x: w / 2, y: -thickness / 2 });
  if (left) Body.setPosition(left, { x: -thickness / 2, y: h / 2 });
  if (right) Body.setPosition(right, { x: w + thickness / 2, y: h / 2 });

  // Also resize the ground width if necessary
  // Body.scale(ground, w / oldW, 1); 
});



// Run app
Matter.Render.run(render)
Matter.Runner.run(runner, engine)