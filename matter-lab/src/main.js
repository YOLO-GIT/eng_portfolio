// import './style.css'
import './custom_css/custom.css'
import Matter from 'matter-js'

import { engine, render, runner } from './physics/engine'
import { createBalls } from './entities/balls'
import { setupWorld } from './physics/world'
import { addMouseControl } from './physics/controls'
import { updateStats } from './ui/stats'
import { drawVelocityArrow } from './ui/velocityArrows'
import { calculateMomentum, calculateKE } from './utils/physics'

import horrorMusicUrl from './assets/j_theme_new.mp3'
import imageUrl from './assets/i_can_see_you.png'

// --- UI DOM ELEMENTS ---
const velocityInput = document.getElementById('velocityInput')
const launchBtn = document.getElementById('launchBtn')
const resetBtn = document.getElementById('resetBtn')

const velocityText = document.getElementById('velocityText')
const momentumText = document.getElementById('momentumText')
const energyText = document.getElementById('energyText') // FIXED: Added missing tracking reference
const collisionText = document.getElementById('collisionText')

const slowmoBtn = document.getElementById('slowmoBtn')
const normalSpeedBtn = document.getElementById('normalSpeedBtn')
const toggleShakeBtn = document.getElementById('toggleShakeBtn')
const linearModeBtn = document.getElementById('linearModeBtn')

const beforeMomentum = document.getElementById('beforeMomentum')
const afterMomentum = document.getElementById('afterMomentum')
const beforeKE = document.getElementById('beforeKE')
const afterKE = document.getElementById('afterKE')

const mass1Input = document.getElementById('mass1Input')
const mass2Input = document.getElementById('mass2Input')
const toggleSettingsBtn = document.getElementById('toggleSettingsBtn')
const settingsPanel = document.getElementById('settingsPanel')

// --- TRACKING STATE GLOBAL VARIABLES ---
let balls = [];
let ball1 = null;
let ball2 = null;
let isCorrupted = false;
let shakeEnabled = false;
let linearMode = false;
let settingsVisible = true;
let initialMomentum = 0;
let initialKE = 0;

// --- DYNAMIC RE-SPAWN BLUEPRINT FUNCTION ---
function spawnNormalBalls() {
  // Clear out anything existing in the engine world first (including old swarm)
  Matter.World.clear(engine.world, false);

  // Rebuild boundaries & track setup inside the physics matrix
  setupWorld(engine, []);

  // Generate completely new ball objects and update the parent references safely
  balls = createBalls();
  ball1 = balls[0];
  ball2 = balls[1];

  // Inject them back into active simulation loops
  Matter.World.add(engine.world, [ball1, ball2]);
  addMouseControl(engine, render);
}

// Initial Boot Call on Page Load
spawnNormalBalls();

// --- BASE APPLICATION FUNCTIONAL LISTENERS ---

// Launch Engine Configuration Trigger
launchBtn.addEventListener('click', () => {
  if (isCorrupted || !ball1 || !ball2) return;

  const velocity = Number(velocityInput.value);
  const mass1 = Number(mass1Input.value);
  const mass2 = Number(mass2Input.value);

  Matter.Body.setMass(ball1, mass1);
  Matter.Body.setMass(ball2, mass2);

  Matter.Body.setVelocity(ball1, { x: velocity, y: 0 });

  initialMomentum = calculateMomentum(ball1) + calculateMomentum(ball2);
  initialKE = calculateKE(ball1) + calculateKE(ball2);
});

// Interactive Reset Execution Point
resetBtn.addEventListener('click', () => {
  if (isCorrupted || !ball1 || !ball2) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  balls.forEach(ball => {
    if (!ball) return;
    Matter.Body.setPosition(ball, {
      x: Math.random() * (w * 0.8) + (w * 0.1),
      y: Math.random() * (h * 0.5) + (h * 0.1)
    });

    const scale = 0.8 + Math.random() * 0.4;
    Matter.Body.scale(ball, scale, scale);
  });

  collisionText.innerText = "Everything is new again. Or is it?";
});

toggleShakeBtn.addEventListener('click', () => {
  shakeEnabled = !shakeEnabled;
  toggleShakeBtn.innerText = shakeEnabled ? 'Disable Shake' : 'Enable Shake';
});

slowmoBtn.addEventListener('click', () => { engine.timing.timeScale = 0.2; });
normalSpeedBtn.addEventListener('click', () => { engine.timing.timeScale = 1; });

toggleSettingsBtn.addEventListener('click', () => {
  settingsVisible = !settingsVisible;
  settingsPanel.classList.toggle('hidden');
  toggleSettingsBtn.innerText = settingsVisible ? 'Hide' : 'Show';
});

linearModeBtn.addEventListener('click', () => {
  linearMode = !linearMode;
  linearModeBtn.innerText = linearMode ? 'Linear Mode ON' : 'Linear Collision';
});

// --- ENGINE RECURRENT TICK EVENT LISTENERS ---

// Collisions Framework Monitor
Matter.Events.on(engine, 'collisionStart', () => {
  if (isCorrupted || !ball1 || !ball2) return;

  collisionText.innerText = 'Collision Status: COLLIDED!';

  const finalMomentum = calculateMomentum(ball1) + calculateMomentum(ball2);
  const finalKE = calculateKE(ball1) + calculateKE(ball2);

  beforeMomentum.innerText = `Before Momentum: ${initialMomentum.toFixed(2)}`;
  afterMomentum.innerText = `After Momentum: ${finalMomentum.toFixed(2)}`;
  beforeKE.innerText = `Before KE: ${initialKE.toFixed(2)}`;
  afterKE.innerText = `After KE: ${finalKE.toFixed(2)}`;

  const force = ball1.speed + ball2.speed;
  if (shakeEnabled && force > 5) {
    document.body.style.transition = '0.05s';
    document.body.style.transform = `translate(${Math.random() * 20}px, ${Math.random() * 20}px)`;
    setTimeout(() => { document.body.style.transform = `translate(0, 0)`; }, 50);
  }
});

// Realtime Interface Data Panel Dispatcher
Matter.Events.on(engine, 'afterUpdate', () => {
  if (isCorrupted || !ball1 || !ball2) {
    velocityText.innerText = "0";
    momentumText.innerText = "ERROR";
    if (energyText) energyText.innerText = "ERROR";
  } else {
    updateStats(ball1, velocityText, momentumText, energyText);
  }
});

// Velocity Vector Renderer Layer
Matter.Events.on(render, 'afterRender', () => {
  const context = render.context;
  if (ball1 && ball1.position) drawVelocityArrow(context, ball1, '#00bfff');
  if (ball2 && ball2.position) drawVelocityArrow(context, ball2, '#ff6b6b');
});

// Linear Trajectory Enforcer Constraint
Matter.Events.on(engine, 'beforeUpdate', () => {
  if (isCorrupted || !ball1 || !ball2) {
    engine.gravity.y = 0;
    return;
  }

  if (!linearMode) {
    engine.gravity.y = 1;
  } else {
    engine.gravity.y = 0;
    Matter.Body.setPosition(ball1, { x: ball1.position.x, y: window.innerHeight / 2 });
    Matter.Body.setVelocity(ball1, { x: ball1.velocity.x, y: 0 });
    Matter.Body.setPosition(ball2, { x: ball2.position.x, y: window.innerHeight / 2 });
    Matter.Body.setVelocity(ball2, { x: ball2.velocity.x, y: 0 });
  }
});

// ============================================================================
// HORROR MECHANISM: AUDIO TIMESTAMP-DRIVEN ARCHITECTURE (NO POPUP)
// ============================================================================
const voidBtn = document.createElement('button');
voidBtn.id = 'voidBtn';
voidBtn.innerText = 'system.ext_001';
document.body.appendChild(voidBtn);

voidBtn.addEventListener('click', () => {
  if (isCorrupted) return;
  isCorrupted = true;

  // Kill initial dynamic references instantly
  Matter.World.clear(engine.world, false);
  ball1 = null;
  ball2 = null;
  balls = [];

  document.body.classList.add('corrupted');
  document.body.style.filter = 'contrast(200%)';

  const horrorMusic = new Audio(horrorMusicUrl);
  horrorMusic.loop = false;
  horrorMusic.volume = 1.0;
  horrorMusic.play().catch(err => console.log("Audio blocked:", err));

  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(40, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.005, audioCtx.currentTime);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();

  let heartbeatInterval = null;
  let uiInterval = null;
  const swarmEntities = [];

  // Cache text metrics to restore later
  const textRecoveryMap = new Map();
  const allElements = document.querySelectorAll('h1, h2, p, label, button, span');
  allElements.forEach(el => textRecoveryMap.set(el, el.innerText));
  const creepyMessages = ["IT HURTS", "STOP IT", "LEAKING", "HELP US", "VOID"];

  // Handle the single frame updates for the swarm
  const swarmAnimationListener = () => {
    if (!isCorrupted || swarmEntities.length === 0) return;
    const time = Date.now() * 0.002;

    swarmEntities.forEach((tooth, idx) => {
      const ghostPos = {
        x: (window.innerWidth / 2) + Math.cos(time + idx) * 300,
        y: (window.innerHeight / 2) + Math.sin(time + idx) * 300
      };

      const isSongDistorted = horrorMusic.currentTime >= 15.0;

      if (!isSongDistorted) {
        const force = 0.0003;
        Matter.Body.applyForce(tooth, tooth.position, {
          x: (ghostPos.x - tooth.position.x) * force,
          y: (ghostPos.y - tooth.position.y) * force
        });
        Matter.Body.setAngularVelocity(tooth, 0.02);
      } else {
        const randomX = Math.random() * 2 - 1;
        const randomY = Math.random() * 2 - 1;
        const swarmIntensity = 0.007;
        Matter.Body.applyForce(tooth, tooth.position, {
          x: randomX * swarmIntensity,
          y: randomY * swarmIntensity
        });
        Matter.Body.setAngularVelocity(tooth, Math.random() * 0.5 - 0.25);
      }
    });
  };
  Matter.Events.on(engine, 'beforeUpdate', swarmAnimationListener);

  // TIMESTAMP EVENT GATEKEEPERS
  const milestones = {
    alarmStarted: false,
    droneDropped: false,
    screechTriggered: false,
    systemRecovered: false
  };

  horrorMusic.addEventListener('timeupdate', () => {
    const time = horrorMusic.currentTime;

    // --- MILESTONE 1: 4.5 Seconds (The Electronic Alarm Starts) ---
    if (time >= 4.5 && !milestones.alarmStarted) {
      milestones.alarmStarted = true;
      if (collisionText) collisionText.innerText = "WARNING: UNSTABLE MEMORY RUNTIME";
      document.body.style.filter = 'contrast(120%)';

      for (let i = 0; i < 66; i++) {
        const tooth = Matter.Bodies.polygon(
          Math.random() * window.innerWidth,
          Math.random() * window.innerHeight,
          3, 15,
          {
            render: { sprite: { texture: imageUrl, xScale: 0.5, yScale: 0.5 } },
            frictionAir: 0.05,
            label: 'entity'
          }
        );
        swarmEntities.push(tooth);
        Matter.World.add(engine.world, tooth);
      }
    }

    // --- MILESTONE 2: 11.0 Seconds (The Heavy Beat/Drone Drop) ---
    if (time >= 11.0 && !milestones.droneDropped) {
      milestones.droneDropped = true;
      if (collisionText) collisionText.innerText = "CRITICAL SYSTEM FAILURE";
      document.body.style.filter = 'contrast(200%)';

      heartbeatInterval = setInterval(() => {
        const pOsc = audioCtx.createOscillator();
        const pGain = audioCtx.createGain();
        pOsc.type = 'sine';
        pOsc.frequency.setValueAtTime(50, audioCtx.currentTime);
        pGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        pGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        pOsc.connect(pGain);
        pGain.connect(audioCtx.destination);
        pOsc.start();
        pOsc.stop(audioCtx.currentTime + 0.5);
      }, 850);

      uiInterval = setInterval(() => {
        const target = allElements[Math.floor(Math.random() * allElements.length)];
        if (target && target.innerText) {
          target.innerText = creepyMessages[Math.floor(Math.random() * creepyMessages.length)];
          target.style.color = "#a00";
          target.style.fontFamily = "serif";
        }
      }, 180);
    }

    // --- MILESTONE 3: 15.0 Seconds (The Distorted Electronic Screech) ---
    if (time >= 15.0 && !milestones.screechTriggered) {
      milestones.screechTriggered = true;

      document.body.classList.add('corrupted');
      document.body.style.filter = 'contrast(300%)';

      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundBlendMode = 'difference';

      if (render && render.options) render.options.background = 'transparent';
    }

    // --- MILESTONE 4: 20.0 Seconds (Instant Automated Recovery) ---
    if (time >= 34.0 && !milestones.systemRecovered) {
      milestones.systemRecovered = true;

      // 1. Instantly tear down all audio engines
      horrorMusic.pause();
      osc.stop();
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (uiInterval) clearInterval(uiInterval);

      // 2. Stagger the structural physics reboot to avoid console maxFrameTime warning drops
      setTimeout(() => {
        isCorrupted = false;
        Matter.Events.off(engine, 'beforeUpdate', swarmAnimationListener);

        // Clear layout elements out and revive stable bouncing bodies
        spawnNormalBalls();

        // Restore core website design aesthetics
        document.body.classList.remove('corrupted');
        document.body.style.filter = 'none';
        document.body.style.background = '#14151f';
        document.body.style.backgroundImage = 'none';

        if (render && render.options) render.options.background = '#14151f';

        // Repair typography states back to original string values
        allElements.forEach(el => {
          if (textRecoveryMap.has(el)) {
            el.innerText = textRecoveryMap.get(el);
            el.style.color = "";
            el.style.fontFamily = "";
            el.style.opacity = "1";
          }
        });

        if (collisionText) collisionText.innerText = "Collision Status: STABLE";
      }, 50);
    }
  });

  // Safe fallback if audio context closes on natural termination loop paths
  horrorMusic.addEventListener('ended', () => {
    if (!milestones.systemRecovered) {
      voidBtn.click(); // If ended fires before timeupdate hits check loops, force process completion
    }
  });

  voidBtn.remove();
});

// Run app Core Cycles
Matter.Render.run(render)
Matter.Runner.run(runner, engine)