/**
 * Cyber Buddy 3D Mascot — Interactive WebGL Companion
 * Built with Three.js (Procedural cartoon robot)
 * Tracks cursor, floats naturally, reacts to clicks, and adapts to Light/Dark mode.
 */
(function () {
  'use strict';

  // Check WebGL availability
  if (!window.WebGLRenderingContext) return;

  const container = document.getElementById('mascotCompanion');
  const canvas = document.getElementById('mascotCanvas');
  const bubble = document.getElementById('mascotBubble');
  if (!container || !canvas || !window.THREE) return;

  const THREE = window.THREE;

  // Scene setup
  const scene = new THREE.Scene();
  const width = 140;
  const height = 140;

  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0, 6.2);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  // -------------------------------------------------------------
  // Materials setup (Light vs Dark mode)
  // -------------------------------------------------------------
  const headMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.18,
    metalness: 0.08,
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: 0x009789,
    roughness: 0.25,
    metalness: 0.2,
  });

  const visorMat = new THREE.MeshStandardMaterial({
    color: 0x071e1b,
    roughness: 0.06,
    metalness: 0.85,
  });

  const eyeMat = new THREE.MeshBasicMaterial({
    color: 0x00ffd5,
    depthTest: false,
    transparent: true,
  });

  const eyeGleamMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    depthTest: false,
    transparent: true,
  });

  const antennaTipMat = new THREE.MeshStandardMaterial({
    color: 0x00ffd5,
    emissive: 0x009789,
    emissiveIntensity: 0.6,
    roughness: 0.2,
  });

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
  keyLight.position.set(3, 4, 4);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x00d6c2, 0.6);
  fillLight.position.set(-3, -1, 2);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0x00d6c2, 0.85);
  rimLight.position.set(0, -3, -3);
  scene.add(rimLight);

  // -------------------------------------------------------------
  // Construct 3D Mascot Character
  // -------------------------------------------------------------
  const mascotRoot = new THREE.Group();
  scene.add(mascotRoot);

  const headGroup = new THREE.Group();
  mascotRoot.add(headGroup);

  // Head sphere
  const headGeo = new THREE.SphereGeometry(1.0, 32, 32);
  headGeo.scale(1.0, 0.94, 0.96);
  const headMesh = new THREE.Mesh(headGeo, headMat);
  headGroup.add(headMesh);

  // Visor (glossy front screen)
  const visorGeo = new THREE.SphereGeometry(0.78, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
  visorGeo.scale(1.02, 0.72, 0.7);
  visorGeo.rotateX(Math.PI * 0.5);
  const visorMesh = new THREE.Mesh(visorGeo, visorMat);
  visorMesh.position.set(0, -0.02, 0.42);
  headGroup.add(visorMesh);

  // Eyes Group (sits on front of visor with depthTest false so always visible)
  const eyesGroup = new THREE.Group();
  eyesGroup.position.set(0, 0.02, 1.01);
  headGroup.add(eyesGroup);

  // Eye geometries (vibrant cartoon oval eyes with shiny gleam)
  const eyeGeo = new THREE.SphereGeometry(0.13, 24, 24);
  eyeGeo.scale(0.8, 1.45, 0.3);

  const gleamGeo = new THREE.SphereGeometry(0.04, 16, 16);

  // Left Eye
  const leftEyeGroup = new THREE.Group();
  leftEyeGroup.position.set(-0.28, 0, 0);
  eyesGroup.add(leftEyeGroup);

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.renderOrder = 100;
  leftEyeGroup.add(leftEye);

  const leftGleam = new THREE.Mesh(gleamGeo, eyeGleamMat);
  leftGleam.position.set(0.03, 0.07, 0.04);
  leftGleam.renderOrder = 101;
  leftEyeGroup.add(leftGleam);

  // Right Eye
  const rightEyeGroup = new THREE.Group();
  rightEyeGroup.position.set(0.28, 0, 0);
  eyesGroup.add(rightEyeGroup);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.renderOrder = 100;
  rightEyeGroup.add(rightEye);

  const rightGleam = new THREE.Mesh(gleamGeo, eyeGleamMat);
  rightGleam.position.set(0.03, 0.07, 0.04);
  rightGleam.renderOrder = 101;
  rightEyeGroup.add(rightGleam);

  // Headphones / Ear caps
  const earGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 24);
  earGeo.rotateZ(Math.PI * 0.5);

  const leftEar = new THREE.Mesh(earGeo, accentMat);
  leftEar.position.set(-1.02, 0, 0);
  headGroup.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, accentMat);
  rightEar.position.set(1.02, 0, 0);
  headGroup.add(rightEar);

  // Headphone inner ring
  const earRingGeo = new THREE.TorusGeometry(0.18, 0.035, 12, 24);
  earRingGeo.rotateY(Math.PI * 0.5);
  const leftRing = new THREE.Mesh(earRingGeo, eyeMat);
  leftRing.position.set(-1.08, 0, 0);
  headGroup.add(leftRing);

  const rightRing = new THREE.Mesh(earRingGeo, eyeMat);
  rightRing.position.set(1.08, 0, 0);
  headGroup.add(rightRing);

  // Antenna
  const antennaStemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 12);
  const antennaStem = new THREE.Mesh(antennaStemGeo, accentMat);
  antennaStem.position.set(0, 1.1, 0);
  headGroup.add(antennaStem);

  const antennaTipGeo = new THREE.SphereGeometry(0.11, 16, 16);
  const antennaTip = new THREE.Mesh(antennaTipGeo, antennaTipMat);
  antennaTip.position.set(0, 1.3, 0);
  headGroup.add(antennaTip);

  // Floating Body / Collar
  const collarGeo = new THREE.TorusGeometry(0.55, 0.12, 16, 32);
  collarGeo.rotateX(Math.PI * 0.5);
  const collarMesh = new THREE.Mesh(collarGeo, accentMat);
  collarMesh.position.set(0, -1.05, 0);
  mascotRoot.add(collarMesh);

  // Floating Hands / Mittens
  const handGeo = new THREE.SphereGeometry(0.18, 16, 16);
  handGeo.scale(1.0, 0.85, 1.1);

  const leftHand = new THREE.Mesh(handGeo, headMat);
  leftHand.position.set(-0.85, -1.05, 0.2);
  mascotRoot.add(leftHand);

  const rightHand = new THREE.Mesh(handGeo, headMat);
  rightHand.position.set(0.85, -1.05, 0.2);
  mascotRoot.add(rightHand);

  // -------------------------------------------------------------
  // Theme Color Synchronization
  // -------------------------------------------------------------
  function syncTheme(isDark) {
    if (isDark) {
      headMat.color.setHex(0x063b35);
      headMat.roughness = 0.25;
      headMat.metalness = 0.2;
      accentMat.color.setHex(0x00d6c2);
      visorMat.color.setHex(0x021614);
      eyeMat.color.setHex(0x00ffd5);
      antennaTipMat.color.setHex(0x00ffd5);
      antennaTipMat.emissive.setHex(0x00d6c2);
      rimLight.color.setHex(0x00ffd5);
      keyLight.color.setHex(0xe0f7f4);
    } else {
      headMat.color.setHex(0xffffff);
      headMat.roughness = 0.18;
      headMat.metalness = 0.08;
      accentMat.color.setHex(0x009789);
      visorMat.color.setHex(0x071e1b);
      eyeMat.color.setHex(0x00ffd5);
      antennaTipMat.color.setHex(0x00ffd5);
      antennaTipMat.emissive.setHex(0x009789);
      rimLight.color.setHex(0x00d6c2);
      keyLight.color.setHex(0xffffff);
    }
  }

  const checkTheme = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'inverted';
    syncTheme(isDark);
  };
  checkTheme();

  // Watch for theme toggle clicks
  const observer = new MutationObserver(checkTheme);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  // -------------------------------------------------------------
  // Mouse Tracking & Physics
  // -------------------------------------------------------------
  const mouse = { x: 0, y: 0, rawX: window.innerWidth * 0.5, rawY: window.innerHeight * 0.5 };
  let targetRotX = 0;
  let targetRotY = 0;
  let targetEyeX = 0;
  let targetEyeY = 0;

  window.addEventListener(
    'mousemove',
    (e) => {
      mouse.rawX = e.clientX;
      mouse.rawY = e.clientY;

      // Calculate vector from mascot center to cursor
      const rect = container.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;

      const dx = (e.clientX - centerX) / window.innerWidth;
      const dy = (e.clientY - centerY) / window.innerHeight;

      targetRotY = dx * 1.5;
      targetRotX = dy * 1.1;

      // Clamp rotation for realism
      targetRotY = Math.max(-0.75, Math.min(0.75, targetRotY));
      targetRotX = Math.max(-0.45, Math.min(0.45, targetRotX));

      targetEyeX = Math.max(-0.16, Math.min(0.16, dx * 0.6));
      targetEyeY = Math.max(-0.1, Math.min(0.1, -dy * 0.4));
    },
    { passive: true }
  );

  // -------------------------------------------------------------
  // Blinking Animation
  // -------------------------------------------------------------
  let isBlinking = false;
  function triggerBlink() {
    if (isBlinking) return;
    isBlinking = true;
    leftEyeGroup.scale.y = 0.08;
    rightEyeGroup.scale.y = 0.08;
    setTimeout(() => {
      leftEyeGroup.scale.y = 1.0;
      rightEyeGroup.scale.y = 1.0;
      isBlinking = false;
      scheduleNextBlink();
    }, 160);
  }

  function scheduleNextBlink() {
    const nextInterval = 2500 + Math.random() * 4000;
    setTimeout(triggerBlink, nextInterval);
  }
  scheduleNextBlink();

  // -------------------------------------------------------------
  // Click Interaction (Jump, Spin, Speech Bubble)
  // -------------------------------------------------------------
  let isJumping = false;
  let jumpProgress = 0;
  const messages = [
    'Hello.',
    'Building reliable web systems.',
    'Clean, maintainable code.',
    'High performance & architecture.',
    'Software Engineer.',
    'Explore the portfolio below.',
  ];
  let msgIndex = 0;
  let bubbleTimeout = null;

  function showBubble() {
    if (!bubble) return;
    bubble.textContent = messages[msgIndex % messages.length];
    msgIndex++;
    bubble.classList.add('visible');

    if (bubbleTimeout) clearTimeout(bubbleTimeout);
    bubbleTimeout = setTimeout(() => {
      bubble.classList.remove('visible');
    }, 2800);
  }

  container.addEventListener('click', () => {
    showBubble();
    if (isJumping) return;
    isJumping = true;
    jumpProgress = 0;
  });

  // -------------------------------------------------------------
  // Render Loop (60FPS with lerp smoothing)
  // -------------------------------------------------------------
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    // Natural floating hover
    const floatY = Math.sin(time * 2.2) * 0.08;
    mascotRoot.position.y = floatY;

    // Subtle hand float
    leftHand.position.y = -1.05 + Math.sin(time * 2.8) * 0.04;
    rightHand.position.y = -1.05 + Math.cos(time * 2.8) * 0.04;

    // Smooth head look-at with lerp
    headGroup.rotation.y += (targetRotY - headGroup.rotation.y) * 0.1;
    headGroup.rotation.x += (targetRotX - headGroup.rotation.x) * 0.1;

    // Subtle head tilt
    headGroup.rotation.z = -headGroup.rotation.y * 0.15;

    // Smooth eyes look-at
    eyesGroup.position.x += (targetEyeX - eyesGroup.position.x) * 0.14;
    eyesGroup.position.y += (targetEyeY - eyesGroup.position.y) * 0.14;

    // Jump / Spin reaction
    if (isJumping) {
      jumpProgress += delta * 3.5;
      const jumpCurve = Math.sin(jumpProgress * Math.PI);
      mascotRoot.position.y += jumpCurve * 0.6;
      mascotRoot.rotation.y += delta * 7.0;

      // Happy wave with hands
      rightHand.position.y = -0.5 + Math.sin(time * 20) * 0.15;
      rightHand.position.x = 0.95 + Math.cos(time * 20) * 0.05;

      if (jumpProgress >= 1) {
        isJumping = false;
        mascotRoot.rotation.y = 0;
        rightHand.position.set(0.85, -1.05, 0.2);
      }
    }

    renderer.render(scene, camera);
  }

  animate();
})();
