import * as THREE from "three";
import { gsap } from "gsap";
import Lenis from "@studio-freight/lenis";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { supabase } from "./supabase.js";

// ─── Lenis scroll suave ──────────────────────────────────────────────────────
const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
function lenisRaf(t) { lenis.raf(t); requestAnimationFrame(lenisRaf); }
requestAnimationFrame(lenisRaf);

// ─── Elementos DOM ───────────────────────────────────────────────────────────
const canvas    = document.getElementById("dna-canvas");
const video     = document.getElementById("cam-video");
const dotCamera = document.getElementById("dot-camera");
const dotHand   = document.getElementById("dot-hand");
const valCamera = document.getElementById("val-camera");
const valHand   = document.getElementById("val-hand");
const valPinch  = document.getElementById("val-pinch");
const valDir    = document.getElementById("val-dir");

// ─── Three.js setup ──────────────────────────────────────────────────────────
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 18);

// ─── Luzes ───────────────────────────────────────────────────────────────────
scene.add(new THREE.AmbientLight(0x0a0a2e, 3));

const dirLight = new THREE.DirectionalLight(0x00d4ff, 4);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

const purpleLight = new THREE.PointLight(0x7c3aed, 6, 30);
purpleLight.position.set(-6, 0, 5);
scene.add(purpleLight);

const blueLight = new THREE.PointLight(0x00d4ff, 5, 25);
blueLight.position.set(6, 4, 3);
scene.add(blueLight);

const greenLight = new THREE.PointLight(0x00ff88, 3, 20);
greenLight.position.set(0, -8, 4);
scene.add(greenLight);

// ─── DNA ─────────────────────────────────────────────────────────────────────
const DNA_PAIRS     = 70;
const HELIX_RADIUS  = 2.2;
const HELIX_PITCH   = 0.45;   // altura por par
const TOTAL_HEIGHT  = DNA_PAIRS * HELIX_PITCH;

const dnaGroup = new THREE.Group();
scene.add(dnaGroup);
dnaGroup.position.y = -TOTAL_HEIGHT / 2;

// Materiais
const mat = {
  strand1: new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x003355, roughness: 0.3, metalness: 0.7 }),
  strand2: new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x1a0040, roughness: 0.3, metalness: 0.7 }),
  baseA:   new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x003322, roughness: 0.4, metalness: 0.5 }),
  baseB:   new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0x330011, roughness: 0.4, metalness: 0.5 }),
  rung:    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x111111, roughness: 0.6, metalness: 0.3, transparent: true, opacity: 0.55 }),
};

// Geometrias reutilizadas
const sphereGeo   = new THREE.SphereGeometry(0.18, 16, 16);
const rungGeo     = new THREE.CylinderGeometry(0.04, 0.04, 1, 8);

const spheres1 = [], spheres2 = [], rungs = [];

for (let i = 0; i < DNA_PAIRS; i++) {
  const t = i / (DNA_PAIRS - 1);
  const angle = i * 0.38;          // radianos por par (passo helicoidal)
  const y = i * HELIX_PITCH;

  // Posições das duas fitas
  const x1 =  Math.cos(angle) * HELIX_RADIUS;
  const z1 =  Math.sin(angle) * HELIX_RADIUS;
  const x2 =  Math.cos(angle + Math.PI) * HELIX_RADIUS;
  const z2 =  Math.sin(angle + Math.PI) * HELIX_RADIUS;

  // Esferas fita 1
  const s1 = new THREE.Mesh(sphereGeo, mat.strand1.clone());
  s1.position.set(x1, y, z1);
  dnaGroup.add(s1);
  spheres1.push(s1);

  // Esferas fita 2
  const s2 = new THREE.Mesh(sphereGeo, mat.strand2.clone());
  s2.position.set(x2, y, z2);
  dnaGroup.add(s2);
  spheres2.push(s2);

  // Bases (par) — a cada 2 pares para não poluir
  if (i % 2 === 0) {
    const baseMat = (i % 4 === 0) ? mat.baseA : mat.baseB;
    const p1 = new THREE.Vector3(x1, y, z1);
    const p2 = new THREE.Vector3(x2, y, z2);
    const mid = p1.clone().lerp(p2, 0.5);
    const dist = p1.distanceTo(p2);

    // Cilindro que liga as duas fitas
    const rung = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, dist, 8),
      baseMat.clone()
    );
    rung.position.copy(mid);
    rung.lookAt(p2);
    rung.rotateX(Math.PI / 2);
    dnaGroup.add(rung);
    rungs.push(rung);

    // Esfera central pequena
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat.rung.clone());
    center.position.copy(mid);
    dnaGroup.add(center);
  }
}

// ─── Partículas de fundo ─────────────────────────────────────────────────────
const PARTICLE_COUNT = 900;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(PARTICLE_COUNT * 3);
for (let i = 0; i < PARTICLE_COUNT; i++) {
  pPos[i * 3]     = (Math.random() - 0.5) * 60;
  pPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
  pPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
}
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
const pMat = new THREE.PointsMaterial({ color: 0x00d4ff, size: 0.08, transparent: true, opacity: 0.5, sizeAttenuation: true });
scene.add(new THREE.Points(pGeo, pMat));

// ─── Estado ──────────────────────────────────────────────────────────────────
let autoRotate   = true;
let rotDir       = 1;          // +1 direita, -1 esquerda
let targetRotY   = 0;
let currentRotY  = 0;
let targetZ      = 18;         // posição Z da câmera
let pinchActive  = false;

// ─── Webcam ───────────────────────────────────────────────────────────────────
let handLandmarker = null;
let lastVideoTime  = -1;
let cameraReady    = false;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" } });
    video.srcObject = stream;
    await new Promise(r => video.addEventListener("loadeddata", r, { once: true }));
    cameraReady = true;
    setStatus("camera", true, "ativa");
  } catch (e) {
    setStatus("camera", false, "bloqueada");
    console.warn("Webcam:", e.message);
  }
}

async function initMediaPipe() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
    );
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 1,
    });
  } catch (e) {
    console.warn("MediaPipe:", e.message);
  }
}

// ─── Detecção de gestos ───────────────────────────────────────────────────────
function processHand(landmarks) {
  // Ponto 0 = pulso, 8 = ponta indicador, 4 = ponta polegar
  const wrist = landmarks[0];
  const thumb = landmarks[4];
  const index = landmarks[8];

  // Direção: posição X do pulso (0=esquerda, 1=direita na imagem espelhada)
  // Vídeo está espelhado, então: x > 0.6 → mão à direita → DNA gira dir.
  const wx = wrist.x;
  if (wx > 0.6) {
    autoRotate = false;
    rotDir = 1;
    setVal("val-dir", "→ direita");
  } else if (wx < 0.4) {
    autoRotate = false;
    rotDir = -1;
    setVal("val-dir", "← esquerda");
  } else {
    autoRotate = false;
    rotDir = 0;
    setVal("val-dir", "centro");
  }

  // Pinça: distância entre polegar e indicador
  const dx = thumb.x - index.x;
  const dy = thumb.y - index.y;
  const pinchDist = Math.sqrt(dx * dx + dy * dy);
  const pinchNorm = Math.max(0, Math.min(1, pinchDist / 0.3));  // 0=fechado, 1=aberto

  setVal("val-pinch", pinchNorm.toFixed(2));

  // Zoom: pinça fechada (<0.15) → aproxima; aberta → afasta
  if (pinchDist < 0.08) {
    targetZ = Math.max(5, targetZ - 0.3);
    setVal("val-pinch", `${pinchNorm.toFixed(2)} 🔍`);
  } else if (pinchDist > 0.22) {
    targetZ = Math.min(28, targetZ + 0.15);
  }

  setStatus("hand", true, "detectada");
}

// ─── Loop de detecção ────────────────────────────────────────────────────────
function detectHands() {
  if (!handLandmarker || !cameraReady || video.readyState < 2) {
    requestAnimationFrame(detectHands);
    return;
  }

  const now = performance.now();
  if (video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    const results = handLandmarker.detectForVideo(video, now);

    if (results.landmarks && results.landmarks.length > 0) {
      processHand(results.landmarks[0]);
    } else {
      autoRotate = true;
      rotDir = 1;
      setStatus("hand", false, "não detectada");
      setVal("val-dir", "auto");
      setVal("val-pinch", "—");
    }
  }
  requestAnimationFrame(detectHands);
}

// ─── Helpers de UI ───────────────────────────────────────────────────────────
function setStatus(key, ok, text) {
  if (key === "camera") {
    dotCamera.className = "status-dot " + (ok ? "ok" : "warn");
    valCamera.textContent = text;
  } else {
    dotHand.className = "status-dot " + (ok ? "ok" : "warn");
    valHand.textContent = text;
  }
}

function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

// ─── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ─── Animação principal ───────────────────────────────────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // Rotação do DNA
  if (autoRotate) {
    currentRotY += delta * 0.4;
  } else if (rotDir !== 0) {
    currentRotY += delta * rotDir * 1.2;
  }
  dnaGroup.rotation.y = currentRotY;

  // Leve balanço vertical
  dnaGroup.position.y = -TOTAL_HEIGHT / 2 + Math.sin(elapsed * 0.3) * 0.3;

  // Luzes pulsantes
  purpleLight.intensity = 5 + Math.sin(elapsed * 1.1) * 2;
  blueLight.intensity   = 4 + Math.cos(elapsed * 0.9) * 1.5;
  greenLight.position.x = Math.sin(elapsed * 0.5) * 4;

  // Zoom suave
  camera.position.z += (targetZ - camera.position.z) * 0.06;

  // Cor das esferas pulsante
  const hue1 = (elapsed * 10) % 360;
  mat.strand1.emissiveIntensity = 0.3 + Math.sin(elapsed * 2) * 0.2;
  mat.strand2.emissiveIntensity = 0.3 + Math.cos(elapsed * 2) * 0.2;

  renderer.render(scene, camera);
}

// ─── Boot ────────────────────────────────────────────────────────────────────
async function boot() {
  // Log de sessão no Supabase (opcional, não bloqueia)
  try {
    await supabase.from("sessions").insert({ event: "dna_view_start", ts: new Date().toISOString() });
  } catch (_) {}

  // GSAP: entrada do título
  gsap.fromTo("#hero-content", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.6, ease: "power3.out", delay: 0.5 });
  gsap.fromTo("#status-panel", { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 1.2, ease: "power2.out", delay: 1 });
  gsap.fromTo("#cam-wrapper",  { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 1.2, ease: "power2.out", delay: 1.2 });

  await initMediaPipe();
  await initCamera();
  detectHands();
  animate();
}

boot();
