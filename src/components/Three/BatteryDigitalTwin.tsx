import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface BatteryDigitalTwinProps {
  soh: number;
  isExploded?: boolean;
}

export const BatteryDigitalTwin: React.FC<BatteryDigitalTwinProps> = ({ soh, isExploded = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const frameIdRef = useRef<number>(0);
  const explosionFactorRef = useRef<number>(0);

  const isSoftwareGl = (() => {
    if (typeof document === 'undefined') return true;
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 4, 8);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 10, 5);
    scene.add(keyLight);

    const fillLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(fillLight);

    // 4. Procedural Battery Pack
    const group = new THREE.Group();
    groupRef.current = group;
    scene.add(group);

    // Materials
    const casingMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1a1a,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,
      anisotropy: 0.8,
    });

    const moduleColor = new THREE.Color().setHSL(soh / 100 * 0.33, 0.8, 0.5); // Green to Red
    const moduleMaterial = new THREE.MeshPhysicalMaterial({
      color: moduleColor,
      metalness: 0.7,
      roughness: 0.3,
      emissive: moduleColor,
      emissiveIntensity: 0.2,
    });

    // 4.1 Casing (Primary Silhouette)
    const casingGeo = new THREE.BoxGeometry(4, 1, 3);
    const casing = new THREE.Mesh(casingGeo, casingMaterial);
    casing.name = 'casing';
    group.add(casing);

    // 4.2 Battery Modules (Secondary Read)
    const moduleGeo = new THREE.BoxGeometry(0.8, 0.4, 0.6);
    const modules: THREE.Mesh[] = [];
    for (let x = -1.5; x <= 1.5; x += 1.0) {
      for (let z = -0.8; z <= 0.8; z += 0.8) {
        const module = new THREE.Mesh(moduleGeo, moduleMaterial.clone());
        module.position.set(x, 0, z);
        module.userData.originalY = 0;
        module.name = 'module';
        group.add(module);
        modules.push(module);
      }
    }

    // 4.3 Cooling Ribs (Accent Detail)
    const ribGeo = new THREE.BoxGeometry(3.8, 0.05, 0.1);
    for (let i = 0; i < 6; i++) {
      const rib = new THREE.Mesh(ribGeo, casingMaterial);
      rib.position.set(0, 0.51, -1.2 + i * 0.5);
      group.add(rib);
    }

    // 5. Animation Loop
    let lastTime = performance.now();
    
    function animate() {
      const time = performance.now();
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (groupRef.current) {
        groupRef.current.rotation.y += delta * 0.2;
        
        // Exploded View Interpolation
        const targetExplosion = isExploded ? 1 : 0;
        explosionFactorRef.current = THREE.MathUtils.damp(explosionFactorRef.current, targetExplosion, 4, delta);
        
        groupRef.current.children.forEach((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.name === 'module') {
            mesh.position.y = explosionFactorRef.current * 1.5;
            // Add some jitter/wave for impact
            mesh.position.y += Math.sin(time * 0.002 + mesh.position.x) * 0.05 * explosionFactorRef.current;
          }
          if (mesh.name === 'casing') {
            mesh.scale.y = 1 - explosionFactorRef.current * 0.8;
            mesh.position.y = -explosionFactorRef.current * 0.5;
            const mat = mesh.material as THREE.MeshPhysicalMaterial;
            mat.opacity = 1 - explosionFactorRef.current * 0.5;
            mat.transparent = true;
          }
        });
      }

      renderer.render(scene, camera);
      
      if (isSoftwareGl) {
        frameIdRef.current = window.setTimeout(animate, 80);
      } else {
        frameIdRef.current = requestAnimationFrame(animate);
      }
    }

    animate();

    // 6. Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (isSoftwareGl) {
        clearTimeout(frameIdRef.current);
      } else {
        cancelAnimationFrame(frameIdRef.current);
      }
      renderer.dispose();
      casingGeo.dispose();
      moduleGeo.dispose();
      ribGeo.dispose();
      casingMaterial.dispose();
      moduleMaterial.dispose();
    };
  }, [isExploded, soh]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[400px] rounded-2xl bg-[#2A1B24]/5 border border-[#2A1B24]/10 relative overflow-hidden shadow-inner"
    >
      <div className="absolute top-4 left-4 z-10 space-y-1">
        <div className="text-[10px] font-mono font-bold text-[#F59E0B] uppercase tracking-widest">
          3D Digital Twin v2.1
        </div>
        <div className="text-[10px] font-mono text-[#2A1B24]/60 uppercase tracking-tighter">
          Procedural Mesh | PBR Materials
        </div>
      </div>
      
      {isSoftwareGl && (
        <div className="absolute bottom-4 right-4 z-10">
          <span className="text-[9px] font-mono font-bold text-red-600/60 uppercase border border-red-600/20 px-2 py-0.5 rounded-lg bg-white/80">
            Software WebGL Mode
          </span>
        </div>
      )}
    </div>
  );
};
