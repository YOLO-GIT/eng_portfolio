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
import imageUrl2 from './assets/bruh.png'
import num1Url from './assets/1.webp'
import num2Url from './assets/2.webp'
import num3Url from './assets/3.webp'
import num4Url from './assets/4.webp'
import num5Url from './assets/5.webp'
import num6Url from './assets/6.webp'
import num7Url from './assets/7.webp'
import num8Url from './assets/8.webp'
import num9Url from './assets/9.webp'
// import late1Url from './assets/mile_3_1.webp'
// import late2Url from './assets/mile_3_2.webp'
// import late3Url from './assets/mile_3_3.webp'
// import late4Url from './assets/mile_3_4.webp'
// import late5Url from './assets/mile_3_5.webp'
// import late6Url from './assets/mile_3_6.webp'

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
// Velocity Vector Renderer Layer & Password Highlighter
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
// HORROR MECHANISM: AUDIO TIMESTAMP-DRIVEN ARCHITECTURE (ORIGINAL SMOOTH SWARM)
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
  const originalTitle = document.title; // <--- ADD THIS LINE
  const allElements = document.querySelectorAll('h1, h2, p, label, button, span');
  allElements.forEach(el => textRecoveryMap.set(el, el.innerText));
  const creepyMessages = ["IT HURTS", "STOP IT", "LEAKING", "HELP US", "VOID"];

  // FIXED: Handles the frame updates keeping ONLY the original smooth circling logic
  const swarmAnimationListener = () => {
    if (!isCorrupted || swarmEntities.length === 0) return;
    const time = Date.now() * 0.001; // Smooth, slow rotation speed

    swarmEntities.forEach((tooth) => {
      // Create a perfect dial: spaces the 9 numbers evenly around a circle
      const angleOffset = (tooth.indexOffset / 9) * Math.PI * 2;
      const radius = 250; // The size of the circle (adjust if you want it wider)

      const targetPos = {
        x: (window.innerWidth / 2) + Math.cos(time + angleOffset) * radius,
        y: (window.innerHeight / 2) + Math.sin(time + angleOffset) * radius
      };

      const force = 0.0005;
      Matter.Body.applyForce(tooth, tooth.position, {
        x: (targetPos.x - tooth.position.x) * force,
        y: (targetPos.y - tooth.position.y) * force
      });

      // Smooth continuous spin for each individual number
      Matter.Body.setAngle(tooth, tooth.angle + 0.02);
    });
  };
  Matter.Events.on(engine, 'beforeUpdate', swarmAnimationListener);

  // TIMESTAMP EVENT GATEKEEPERS
  const milestones = {
    alarmStarted: false,
    droneDropped: false,
    screechTriggered: false,
    voidStateTriggered: false, // ADD THIS NEW FLAG
    systemRecovered: false
  };

  horrorMusic.addEventListener('timeupdate', () => {
    const time = horrorMusic.currentTime;

    // --- MILESTONE 1: 4.5 Seconds (The Electronic Alarm Starts - Spawn Ring) ---
    if (time >= 4.5 && !milestones.alarmStarted) {
      milestones.alarmStarted = true;
      if (collisionText) collisionText.innerText = "WARNING: UNSTABLE MEMORY RUNTIME";
      document.body.style.filter = 'contrast(200%)';

      const numberImages = [
        { value: 1, url: num1Url }, { value: 2, url: num2Url }, { value: 3, url: num3Url },
        { value: 4, url: num4Url }, { value: 5, url: num5Url }, { value: 6, url: num6Url },
        { value: 7, url: num7Url }, { value: 8, url: num8Url }, { value: 9, url: num9Url }
      ];

      // THE 6 TARGET PASSWORD DIGITS (These will glow red!)
      const secretPassword = [0, 4, 2, 1, 7, 1];

      // Spawn exactly 9 items
      for (let i = 0; i < 9; i++) {
        const item = numberImages[i];
        const isTargetDigit = secretPassword.includes(item.value);

        const tooth = Matter.Bodies.polygon(
          window.innerWidth / 2, // Start them all in the center, they will fly out to their ring
          window.innerHeight / 2,
          3, 15,
          {
            render: { sprite: { texture: item.url, xScale: 0.5, yScale: 0.5 } }, // Kept size reasonable
            frictionAir: 0.08,
            isSensor: true,
            label: 'entity',
            isPassword: isTargetDigit,
            indexOffset: i // CUSTOM FLAG: We use this to space them evenly in the animation loop
          }
        );

        tooth.ignoreGravity = true;

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
        // Randomly pick a creepy message
        const randomCreepyText = creepyMessages[Math.floor(Math.random() * creepyMessages.length)];

        // 1. Glitch the browser tab title!
        document.title = randomCreepyText;

        // 2. Glitch the website text
        const target = allElements[Math.floor(Math.random() * allElements.length)];
        if (target && target.innerText) {
          target.innerText = randomCreepyText;
          target.style.color = "#a00";
          target.style.fontFamily = "serif";
        }
      }, 180);
    }

    // --- MILESTONE 3: 17.0 Seconds (The Distorted Electronic Screech - Transform Swarm) ---
    if (time >= 17.0 && !milestones.screechTriggered) {
      milestones.screechTriggered = true;

      document.body.classList.add('corrupted');
      document.body.style.filter = 'contrast(200%)';

      // Forces the baseline backdrop to be pitch black
      document.body.style.backgroundColor = '#000000';

      // Keep your background face image setup
      document.body.style.backgroundImage = `url('${imageUrl}')`;
      document.body.style.backgroundSize = 'contain';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundBlendMode = 'normal';

      if (render && render.options) render.options.background = 'transparent';

      // --- NEW: DYNAMIC FAVICON CHANGE ---
      // This grabs the favicon link element from the head of your index.html
      const faviconLink = document.querySelector("link[rel~='icon']");
      if (faviconLink) {
        // Change the source to your corrupted asset sitting in the public folder
        faviconLink.href = '/favicon-corrupted.png';
      }

      // --- TRANSFORM ALL FLOATING NUMBERS INTO THE NEW IMAGES ---
      // const lateImages = [late1Url, late2Url, late3Url];

      // swarmEntities.forEach(tooth => {
      //   // 1. Swap the image texture
      //   tooth.render.sprite.texture = imageUrl2; // Change this to your desired image variable!

      //   tooth.render.sprite.xScale = 0.5;
      //   tooth.render.sprite.yScale = 0.5;
      //   tooth.isPassword = false;
      // });

      swarmEntities.forEach(tooth => {
        // 1. Swap the image texture
        tooth.render.sprite.texture = imageUrl2; // Change this to your desired image variable!

        // 2. Adjust the scale if your new image is too big/small
        tooth.render.sprite.xScale = 0.5;
        tooth.render.sprite.yScale = 0.5;

        // 3. Turn off the red password glow so it doesn't stay on the new images
        tooth.isPassword = false;
      });
    }

    // --- MILESTONE 4: 34.0 Seconds (The Void - Hide everything except the face) ---
    if (time >= 34.0 && !milestones.voidStateTriggered) {
      milestones.voidStateTriggered = true;

      // 1. Stop the glitching intervals so text stops changing
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (uiInterval) clearInterval(uiInterval);

      // 2. Wipe the physics engine clean
      Matter.World.clear(engine.world, false);

      // 3. FULL UI WIPE: Hide the main UI div, the inputs, and the canvas completely
      const uiContainer = document.getElementById('ui');
      if (uiContainer) uiContainer.style.opacity = "0";

      if (render && render.canvas) render.canvas.style.opacity = "0"; // Hides the physics box

      document.querySelectorAll('input').forEach(el => el.style.opacity = "0"); // Hides text boxes

      // Hide all loose text elements
      allElements.forEach(el => { el.style.opacity = "0"; });
      if (collisionText) collisionText.style.opacity = "0";
    }

    // --- MILESTONE 5: 36.0 Seconds (Instant Automated Recovery) ---
    if (time >= 36.0 && !milestones.systemRecovered) {
      milestones.systemRecovered = true;

      // 1. Instantly tear down all audio engines now that the track is done
      horrorMusic.pause();
      osc.stop();

      // 2. Stagger the structural physics reboot to avoid console maxFrameTime warning drops
      setTimeout(() => {
        isCorrupted = false;
        Matter.Events.off(engine, 'beforeUpdate', swarmAnimationListener);

        // Clear layout elements out and revive stable bouncing bodies
        spawnNormalBalls();

        // Restore core website design aesthetics
        document.body.classList.remove('corrupted');
        document.body.style.filter = 'none';
        document.body.style.backgroundColor = '#14151f';
        document.body.style.backgroundImage = 'none';

        // --- ADD THE TITLE RESET HERE! ---
        document.title = originalTitle;

        // 2. RESET THE FAVICON BACK TO ORIGINAL
        const faviconLink = document.querySelector("link[rel~='icon']");
        if (faviconLink) {
          faviconLink.href = '/favicon.png'; // Restores your clean original tab logo
        }

        if (render && render.options) render.options.background = '#14151f';

        // 3. BRING EVERYTHING BACK: Restore the UI div, inputs, and canvas
        const uiContainer = document.getElementById('ui');
        if (uiContainer) uiContainer.style.opacity = "1";

        if (render && render.canvas) render.canvas.style.opacity = "1";

        document.querySelectorAll('input').forEach(el => el.style.opacity = "1");

        // Repair typography states back to original string values AND make them visible again
        allElements.forEach(el => {
          if (textRecoveryMap.has(el)) {
            el.innerText = textRecoveryMap.get(el);
            el.style.color = "";
            el.style.fontFamily = "";
            el.style.opacity = "1";
          }
        });

        if (collisionText) {
          collisionText.innerText = "Collision Status: STABLE";
          collisionText.style.opacity = "1";
        }
      }, 50);
    }
  });

  // Safe fallback if audio context closes on natural termination paths
  horrorMusic.addEventListener('ended', () => {
    if (!milestones.systemRecovered) {
      milestones.systemRecovered = true;
      isCorrupted = false;

      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (uiInterval) clearInterval(uiInterval);
      try { osc.stop(); } catch (e) { }
      Matter.Events.off(engine, 'beforeUpdate', swarmAnimationListener);

      spawnNormalBalls();

      document.body.classList.remove('corrupted');
      document.body.style.filter = 'none';
      document.body.style.backgroundColor = '#14151f';
      document.body.style.backgroundImage = 'none';

      // Restore the original browser tab name
      document.title = originalTitle;

      if (render && render.options) render.options.background = '#14151f';

      // --- NEW ADDITION: Restore the UI div, inputs, and canvas ---
      const uiContainer = document.getElementById('ui');
      if (uiContainer) uiContainer.style.opacity = "1";
      if (render && render.canvas) render.canvas.style.opacity = "1";
      document.querySelectorAll('input').forEach(el => el.style.opacity = "1");
      // ------------------------------------------------------------

      allElements.forEach(el => {
        if (textRecoveryMap.has(el)) {
          el.innerText = textRecoveryMap.get(el);
          el.style.color = "";
          el.style.fontFamily = "";
          el.style.opacity = "1";
        }
      });

      if (collisionText) {
        collisionText.innerText = "Collision Status: STABLE";
        collisionText.style.opacity = "1";
      }
    }
  });

  voidBtn.remove();
});

// Run app Core Cycles
Matter.Render.run(render)
Matter.Runner.run(runner, engine)