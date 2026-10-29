/**
 * Chain of Proof - 3D Cinematic Hyper-Tesseract Matrix
 * Interactive 4D Quantum Cryptographic Folding Tesseract Hypercube,
 * Transmissive Sapphire Core, Swirling Hash Bit Particles,
 * and Physical Studio Lighting with Software-WebGL safeguards.
 */

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface Cinematic3DBackgroundProps {
  isZoomed?: boolean;
  opacity?: number;
}

export const Cinematic3DBackground: React.FC<Cinematic3DBackgroundProps> = ({
  isZoomed = false,
  opacity = 0.88,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const isZoomedRef = useRef(isZoomed);
  isZoomedRef.current = isZoomed;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect Software WebGL
    const isSoftwareGl = (() => {
      try {
        const testCanvas = document.createElement('canvas');
        const gl = testCanvas.getContext('webgl2') || testCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 2. Setup Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.debug.checkShaderErrors = false;
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    container.appendChild(renderer.domElement);

    // 3. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xEAEBEE, 0.03);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 8.2);
    camera.lookAt(0, 0, 0);

    // 4. Studio Environment Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmremGenerator.fromScene(roomEnv, 0.04).texture;
    pmremGenerator.dispose();

    // 5. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Warm Key Light (Marigold Accent)
    const keyLight = new THREE.DirectionalLight(0xF59E0B, 3.2);
    keyLight.position.set(6, 8, 6);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    // Cool Hemisphere Fill (Deep Aubergine to Silver)
    const hemiLight = new THREE.HemisphereLight(0xEAEBEE, 0x2A1B24, 1.8);
    hemiLight.position.set(-4, 6, -2);
    scene.add(hemiLight);

    // Cyan Rim Light
    const rimLight = new THREE.DirectionalLight(0x60A5FA, 2.2);
    rimLight.position.set(-6, 2, -5);
    scene.add(rimLight);

    // 6. 4D Hypercube (Tesseract) Mathematical Data Structure
    // 16 Vertices in 4D space
    const vertices4D: number[][] = [];
    for (let i = 0; i < 16; i++) {
      vertices4D.push([
        (i & 1) ? 1 : -1,
        (i & 2) ? 1 : -1,
        (i & 4) ? 1 : -1,
        (i & 8) ? 1 : -1,
      ]);
    }

    // 32 Edges in 4D hypercube
    const edges4D: [number, number][] = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        // Difference in bit count (Hamming distance) must be 1
        const diff = i ^ j;
        if ((diff & (diff - 1)) === 0) {
          edges4D.push([i, j]);
        }
      }
    }

    // 7. Assemble 3D Hyper-Tesseract Group
    const tesseractGroup = new THREE.Group();
    scene.add(tesseractGroup);

    // --- 7A. 32 Edge Cylinders (InstancedMesh) ---
    const edgeCount = edges4D.length; // 32
    const cylinderGeo = new THREE.CylinderGeometry(0.028, 0.028, 1, 12);
    cylinderGeo.rotateX(Math.PI / 2); // Align cylinder axis along Z for lookAt positioning
    const edgeMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xF59E0B,
      emissiveIntensity: 0.35,
    });
    const instancedEdges = new THREE.InstancedMesh(cylinderGeo, edgeMat, edgeCount);
    tesseractGroup.add(instancedEdges);

    // --- 7B. 16 Vertex Quantum Nodes (InstancedMesh) ---
    const nodeGeo = new THREE.OctahedronGeometry(0.12, 0);
    const nodeMat = new THREE.MeshPhysicalMaterial({
      color: 0xEAEBEE,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 1.0,
      emissive: 0x2A1B24,
      emissiveIntensity: 0.2,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, 16);
    tesseractGroup.add(instancedNodes);

    // --- 7C. Central Transmissive Sapphire Crystal Core ---
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.92,
      opacity: isSoftwareGl ? 0.8 : 1,
      transparent: true,
      ior: 1.6,
      thickness: 1.2,
      clearcoat: 1.0,
      attenuationColor: new THREE.Color(0xF59E0B),
      attenuationDistance: 1.0,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    tesseractGroup.add(coreMesh);

    // Inner Glowing Core Energy Source
    const innerCoreGeo = new THREE.OctahedronGeometry(0.42, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      emissive: 0xF59E0B,
      emissiveIntensity: 1.2,
    });
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    tesseractGroup.add(innerCoreMesh);

    // --- 7D. Swirling SHA-256 Quantum Bit Particle Cloud ---
    const particleCount = 280;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeeds = new Float32Array(particleCount);
    const particleRadii = new Float32Array(particleCount);
    const particleAngles = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.2 + Math.random() * 3.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 4;

      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;

      particleRadii[i] = radius;
      particleAngles[i] = angle;
      particleSpeeds[i] = 0.2 + Math.random() * 0.6;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Canvas particle map
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#F59E0B';
      pCtx.beginPath();
      pCtx.arc(16, 16, 12, 0, Math.PI * 2);
      pCtx.fill();
    }
    const pTexture = new THREE.CanvasTexture(pCanvas);

    const particleMat = new THREE.PointsMaterial({
      color: 0xF59E0B,
      size: 0.08,
      map: pTexture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // --- 7E. Ground Reflection Base & Shadow Plane ---
    const shadowPlaneGeo = new THREE.PlaneGeometry(10, 10);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d');
    if (sCtx) {
      const grad = sCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(42, 27, 36, 0.45)');
      grad.addColorStop(0.5, 'rgba(42, 27, 36, 0.15)');
      grad.addColorStop(1, 'rgba(42, 27, 36, 0)');
      sCtx.fillStyle = grad;
      sCtx.fillRect(0, 0, 128, 128);
    }
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.2;
    scene.add(shadowPlane);

    // 8. Pointer Interaction & Kinetic Momentum
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, velocity: 0 };
    let lastMousePos = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      const dx = nx - lastMousePos.x;
      const dy = ny - lastMousePos.y;
      pointer.velocity = Math.sqrt(dx * dx + dy * dy) * 3;

      pointer.targetX = nx;
      pointer.targetY = ny;
      lastMousePos = { x: nx, y: ny };
    };

    window.addEventListener('mousemove', handlePointerMove);

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // 10. Reusable Matrix Helpers for Zero GC
    const dummyNode = new THREE.Object3D();
    const dummyEdge = new THREE.Object3D();
    const edgeStart = new THREE.Vector3();
    const edgeEnd = new THREE.Vector3();
    const edgeMid = new THREE.Vector3();
    const edgeDir = new THREE.Vector3();
    const projected3D: THREE.Vector3[] = Array.from({ length: 16 }, () => new THREE.Vector3());

    const _targetCamPos = new THREE.Vector3();
    const _lookAtTarget = new THREE.Vector3();

    // 11. Animation Loop with 4D Hypercube Math
    let frameId = 0;
    const timer = new THREE.Timer();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tick = () => {
      timer.update();
      const delta = Math.min(timer.getDelta(), 0.1);
      const elapsedTime = timer.getElapsed();

      // Pointer smooth damping (very low speed for cinematic smoothness)
      pointer.x = THREE.MathUtils.damp(pointer.x, pointer.targetX, 1.2, delta);
      pointer.y = THREE.MathUtils.damp(pointer.y, pointer.targetY, 1.2, delta);
      pointer.velocity = THREE.MathUtils.damp(pointer.velocity, 0, 1.5, delta);

      // Speed multipliers based on CTA hover and kinetic mouse velocity
      const speedMult = isZoomedRef.current ? 1.3 : 1.0 + pointer.velocity * 0.1;

      // 4D Rotation Angles with gentle pointer influence
      const angleXW = elapsedTime * 0.25 * speedMult + pointer.x * 0.25;
      const angleYZ = elapsedTime * 0.20 * speedMult - pointer.y * 0.25;
      const angleZW = elapsedTime * 0.18 * speedMult;

      const cosXW = Math.cos(angleXW), sinXW = Math.sin(angleXW);
      const cosYZ = Math.cos(angleYZ), sinYZ = Math.sin(angleYZ);
      const cosZW = Math.cos(angleZW), sinZW = Math.sin(angleZW);

      // 4D -> 3D Projection Math for 16 Vertices
      for (let i = 0; i < 16; i++) {
        let [x, y, z, w] = vertices4D[i];

        // 1. Rotate in XW plane
        const x1 = x * cosXW - w * sinXW;
        const w1 = x * sinXW + w * cosXW;

        // 2. Rotate in YZ plane
        const y2 = y * cosYZ - z * sinYZ;
        const z2 = y * sinYZ + z * cosYZ;

        // 3. Rotate in ZW plane
        const z3 = z2 * cosZW - w1 * sinZW;
        const w3 = z2 * sinZW + w1 * cosZW;

        // Perspective projection from 4D to 3D
        const distance = 3.2;
        const scale = 2.2 / (distance - w3);

        projected3D[i].set(x1 * scale, y2 * scale, z3 * scale);

        // Update 16 Vertex Node Instances
        dummyNode.position.copy(projected3D[i]);
        dummyNode.rotation.set(elapsedTime + i, elapsedTime * 0.5, 0);
        dummyNode.scale.setScalar(0.8 + Math.sin(elapsedTime * 2 + i) * 0.2);
        dummyNode.updateMatrix();
        instancedNodes.setMatrixAt(i, dummyNode.matrix);
      }
      instancedNodes.instanceMatrix.needsUpdate = true;

      // Update 32 Edge Cylinder Instances
      for (let e = 0; e < edgeCount; e++) {
        const [idxA, idxB] = edges4D[e];
        edgeStart.copy(projected3D[idxA]);
        edgeEnd.copy(projected3D[idxB]);

        edgeMid.addVectors(edgeStart, edgeEnd).multiplyScalar(0.5);
        const edgeLength = edgeStart.distanceTo(edgeEnd);

        dummyEdge.position.copy(edgeMid);
        dummyEdge.scale.set(1, 1, edgeLength);

        // Orient cylinder along edge direction
        edgeDir.subVectors(edgeEnd, edgeStart).normalize();
        dummyEdge.lookAt(edgeEnd);

        dummyEdge.updateMatrix();
        instancedEdges.setMatrixAt(e, dummyEdge.matrix);
      }
      instancedEdges.instanceMatrix.needsUpdate = true;

      // Central Sapphire Crystal Pulse & Multi-Axis Spin
      coreMesh.rotation.y = elapsedTime * 0.5;
      coreMesh.rotation.x = Math.sin(elapsedTime * 0.6) * 0.3;
      innerCoreMesh.rotation.y = -elapsedTime * 0.8;
      innerCoreMesh.rotation.z = elapsedTime * 0.4;
      innerCoreMat.emissiveIntensity = 1.0 + Math.sin(elapsedTime * 4) * 0.4;

      // Swirling SHA-256 Quantum Particle Cloud Update
      const pPositions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        particleAngles[i] += particleSpeeds[i] * 0.015 * speedMult;
        const r = particleRadii[i] + Math.sin(elapsedTime + i) * 0.15 + pointer.velocity * 0.2;
        pPositions[i * 3] = Math.cos(particleAngles[i]) * r;
        pPositions[i * 3 + 2] = Math.sin(particleAngles[i]) * r;
      }
      particleGeo.attributes.position.needsUpdate = true;
      particleSystem.rotation.y = elapsedTime * 0.05;

      // Camera Track-In & Cursor Kinematics (Ultra gentle lerp)
      const targetZ = isZoomedRef.current ? 5.8 : 8.2;
      const targetY = isZoomedRef.current ? 0.6 : 1.2;
      _targetCamPos.set(pointer.x * 0.35, targetY - pointer.y * 0.25, targetZ);
      camera.position.lerp(_targetCamPos, 0.025);

      _lookAtTarget.set(0, 0, 0);
      camera.lookAt(_lookAtTarget);

      // Render Frame
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    tick();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        clearTimeout(frameId);
      } else {
        cancelAnimationFrame(frameId);
      }

      cylinderGeo.dispose();
      edgeMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      innerCoreGeo.dispose();
      innerCoreMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      pTexture.dispose();
      shadowPlaneGeo.dispose();
      shadowMat.dispose();
      shadowTex.dispose();

      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ opacity }}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-opacity duration-700 ease-out"
    />
  );
};
