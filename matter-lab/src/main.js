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

import {
  drawVelocityArrow
} from './ui/velocityArrows'

import {
  calculateMomentum,
  calculateKE
} from './utils/physics'

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

const pauseBtn =
  document.getElementById('pauseBtn')

const resumeBtn =
  document.getElementById('resumeBtn')

const slowmoBtn =
  document.getElementById('slowmoBtn')

const normalSpeedBtn =
  document.getElementById('normalSpeedBtn')

const zeroGravityBtn =
  document.getElementById('zeroGravityBtn')

const GravityBtn = document.getElementById('GravityBtn')

const beforeMomentum =
  document.getElementById('beforeMomentum')

const afterMomentum =
  document.getElementById('afterMomentum')

const beforeKE =
  document.getElementById('beforeKE')

const afterKE =
  document.getElementById('afterKE')

// Update your initial setup
let balls = createBalls()
let ball1 = balls[0]
let ball2 = balls[1]

setupWorld(engine, balls)

// Mouse control
addMouseControl(engine, render)

let initialMomentum = 0
let initialKE = 0

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

  initialMomentum =
    calculateMomentum(ball1) +
    calculateMomentum(ball2)

  initialKE =
    calculateKE(ball1) +
    calculateKE(ball2)

})

// Reset button
resetBtn.addEventListener('click', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;

  balls.forEach(ball => {
    // Teleport to a random spot instead of a fixed one
    Matter.Body.setPosition(ball, {
      x: Math.random() * w,
      y: Math.random() * h
    });

    // Make them slightly different sizes every reset
    const scale = 0.8 + Math.random() * 0.4;
    Matter.Body.scale(ball, scale, scale);

    // Change their color randomly (if you have access to the render style)
    ball.render.fillStyle = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  });

  collisionText.innerText = "Everything is new again. Or is it?";
});

// Stats Update
Matter.Events.on(engine, 'collisionStart', () => {

  collisionText.innerText =
    'Collision Status: COLLIDED!'

  const finalMomentum =
    calculateMomentum(ball1) +
    calculateMomentum(ball2)

  const finalKE =
    calculateKE(ball1) +
    calculateKE(ball2)

  beforeMomentum.innerText =
    `Before Momentum: ${initialMomentum.toFixed(2)}`

  afterMomentum.innerText =
    `After Momentum: ${finalMomentum.toFixed(2)}`

  beforeKE.innerText =
    `Before KE: ${initialKE.toFixed(2)}`

  afterKE.innerText =
    `After KE: ${finalKE.toFixed(2)}`

  const force = ball1.speed + ball2.speed;

  if (force > 5) {
    document.body.style.transition = '0.05s';
    document.body.style.transform = `translate(${Math.random() * 20}px, ${Math.random() * 20}px)`;

    setTimeout(() => {
      document.body.style.transform = `translate(0, 0)`;
    }, 50);
  }

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

Matter.Events.on(render, 'afterRender', () => {

  const context = render.context

  drawVelocityArrow(
    context,
    ball1,
    '#00bfff'
  )

  drawVelocityArrow(
    context,
    ball2,
    '#ff6b6b'
  )

})

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

//Buttons for pause, resume, slow motion, and normal speed
pauseBtn.addEventListener('click', () => { Matter.Runner.stop(runner) })
resumeBtn.addEventListener('click', () => { Matter.Runner.run(runner, engine) })
slowmoBtn.addEventListener('click', () => { engine.timing.timeScale = 0.2 })
normalSpeedBtn.addEventListener('click', () => { engine.timing.timeScale = 1 })
zeroGravityBtn.addEventListener('click', () => { engine.gravity.y = 0 })
GravityBtn.addEventListener('click', () => { engine.gravity.y = 1 }) // Reset to normal gravity
// Buttons end  

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
  const Body = Matter.Body;
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