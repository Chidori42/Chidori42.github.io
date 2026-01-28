import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJsBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);

    camera.position.set(0, 12, 40);
    camera.lookAt(0, 0, 0);

    const textureLoader = new THREE.TextureLoader();

    // === REALISTIC BLACK HOLE ===
    const schwarzschildRadius = 3.0;
    const blackHoleGeometry = new THREE.SphereGeometry(schwarzschildRadius, 128, 128);
    const blackHoleMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
    });
    const blackHole = new THREE.Mesh(blackHoleGeometry, blackHoleMaterial);
    scene.add(blackHole);

    // Event Horizon - Schwarzschild radius glow with Hawking radiation
    const eventHorizonGeometry = new THREE.SphereGeometry(schwarzschildRadius * 1.15, 128, 128);
    const eventHorizonMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 viewDir = normalize(vPosition);
          float rim = 1.0 - abs(dot(vNormal, viewDir));
          float pulse = sin(time * 0.5) * 0.3 + 0.7;
          
          // Orange to red gradient for Hawking radiation
          vec3 color1 = vec3(1.0, 0.4, 0.0);
          vec3 color2 = vec3(1.0, 0.15, 0.0);
          vec3 finalColor = mix(color1, color2, sin(time * 0.3) * 0.5 + 0.5);
          
          float intensity = pow(rim, 3.0) * pulse;
          gl_FragColor = vec4(finalColor, intensity * 0.6);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const eventHorizon = new THREE.Mesh(eventHorizonGeometry, eventHorizonMaterial);
    scene.add(eventHorizon);

    // Photon Sphere - realistic light bending with multiple rings
    const photonRings: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const radius = schwarzschildRadius * 1.3 + i * 0.15;
      const geometry = new THREE.TorusGeometry(radius, 0.04, 16, 100);
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.08 - i * 0.02, 1.0, 0.5 + i * 0.1),
        transparent: true,
        opacity: 0.7 - i * 0.2,
      });
      const ring = new THREE.Mesh(geometry, material);
      ring.rotation.x = Math.PI / 2;
      photonRings.push(ring);
      scene.add(ring);
    }

    // Gravitational Lensing Effect
    const lensingGeometry = new THREE.SphereGeometry(schwarzschildRadius * 1.6, 128, 128);
    const lensingMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
          float radius = length(vUv - 0.5);
          
          float distortion = sin(angle * 6.0 + time) * 0.1 + sin(radius * 20.0 - time * 2.0) * 0.05;
          float intensity = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          
          vec3 color = vec3(1.0, 0.5, 0.1);
          gl_FragColor = vec4(color, (intensity + distortion) * 0.15);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const lensing = new THREE.Mesh(lensingGeometry, lensingMaterial);
    scene.add(lensing);

    // === ACCRETION DISK ===
    const diskInnerRadius = schwarzschildRadius * 2.5;
    const diskOuterRadius = schwarzschildRadius * 12;
    
    // Create realistic accretion disk with temperature gradients using particles
    const diskParticles: THREE.Points[] = [];
    const diskCount = 8;
    
    for (let ring = 0; ring < diskCount; ring++) {
      const particleCount = 5000;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const sizes = new Float32Array(particleCount);

      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = diskInnerRadius + ring * 1 + Math.random() * 1.2;
        
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 0.08 * (radius / 8);
        const z = Math.sin(angle) * radius;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Realistic temperature gradient (Wien's law)
        const temp = 1 - Math.pow((radius - diskInnerRadius) / 10, 0.7);
        
        if (temp > 0.8) {
          // Ultra-hot: blue-white
          colors[i * 3] = 0.9 + temp * 0.1;
          colors[i * 3 + 1] = 0.95;
          colors[i * 3 + 2] = 1.0;
        } else if (temp > 0.6) {
          // Very hot: white-yellow
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.95;
          colors[i * 3 + 2] = 0.8 + temp * 0.2;
        } else if (temp > 0.4) {
          // Hot: yellow-orange
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.7 + temp * 0.3;
          colors[i * 3 + 2] = 0.3;
        } else {
          // Cooler: orange-red
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.4 + temp * 0.3;
          colors[i * 3 + 2] = 0.1 + temp * 0.2;
        }

        sizes[i] = (Math.random() * 0.04 + 0.02) * (1 + temp * 0.5);
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const material = new THREE.PointsMaterial({
        size: 0.1,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const disk = new THREE.Points(geometry, material);
      diskParticles.push(disk);
      scene.add(disk);
    }

    // Secondary thin ring closer to black hole (innermost stable orbit glow)
    const iscoRingGeometry = new THREE.TorusGeometry(diskInnerRadius * 0.9, 0.15, 16, 128);
    const iscoRingMaterial = new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        void main() {
          float brightness = 0.8 + 0.2 * sin(vUv.x * 30.0 + time * 2.0);
          vec3 color = vec3(1.0, 0.7, 0.3) * brightness;
          gl_FragColor = vec4(color, 0.8);
        }
      `,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const iscoRing = new THREE.Mesh(iscoRingGeometry, iscoRingMaterial);
    iscoRing.rotation.x = Math.PI / 2;
    scene.add(iscoRing);

    // Einstein ring
    const einsteinRingGeometry = new THREE.TorusGeometry(schwarzschildRadius * 2.8, 0.08, 16, 128);
    const einsteinRingMaterial = new THREE.MeshBasicMaterial({
      color: 0xd94000,
      transparent: true,
      opacity: 0.3,
    });
    const einsteinRing = new THREE.Mesh(einsteinRingGeometry, einsteinRingMaterial);
    einsteinRing.rotation.x = Math.PI / 2;
    scene.add(einsteinRing);

    // === PLANETS ===
    interface Planet {
      mesh: THREE.Mesh;
      velocity: THREE.Vector3;
      mass: number;
      trail: THREE.Line;
      trailPositions: THREE.Vector3[];
      isShattering: boolean;
      shatterProgress: number;
      fragments?: THREE.Points;
      name: string;
    }

    const planets: Planet[] = [];
    
    const planetConfigs = [
      { 
        name: 'Earth', 
        size: 0.6, 
        color: 0x1a4d7a,
        textureUrl: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/earth_atmos_2048.jpg', 
        distance: 45, 
        angle: 0, 
        mass: 1.0,
        hasAtmosphere: true
      },
      { 
        name: 'Mars', 
        size: 0.35, 
        color: 0x8b4513,
        textureUrl: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/mars_1k_color.jpg', 
        distance: 38, 
        angle: Math.PI / 2, 
        mass: 0.11,
        hasAtmosphere: false
      },
      { 
        name: 'Jupiter', 
        size: 1.4, 
        color: 0xc4a676,
        textureUrl: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/jupiter_2k.jpg', 
        distance: 60, 
        angle: Math.PI, 
        mass: 318,
        hasAtmosphere: true
      },
      { 
        name: 'Moon', 
        size: 0.18, 
        color: 0x6b6b6b,
        textureUrl: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/moon_1024.jpg', 
        distance: 35, 
        angle: Math.PI * 1.3, 
        mass: 0.012,
        hasAtmosphere: false
      },
      { 
        name: 'Venus', 
        size: 0.55, 
        color: 0xe8d4a0,
        textureUrl: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/planets/venus_surface.jpg', 
        distance: 50, 
        angle: Math.PI * 1.7, 
        mass: 0.82,
        hasAtmosphere: true
      },
    ];

    const createPlanet = (config: typeof planetConfigs[0], texture?: THREE.Texture) => {
      const geometry = new THREE.SphereGeometry(config.size, 64, 64);
      
      // Create material based on whether texture loaded successfully
      const material = new THREE.MeshStandardMaterial({
        map: texture || null,
        color: texture ? 0xffffff : config.color,
        roughness: config.hasAtmosphere ? 0.7 : 0.95,
        metalness: 0.0,
        emissive: 0x000000,
        emissiveIntensity: 0,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      
      const x = Math.cos(config.angle) * config.distance;
      const z = Math.sin(config.angle) * config.distance;
      const y = (Math.random() - 0.5) * 3;
      mesh.position.set(x, y, z);
      scene.add(mesh);

      const G = 50;
      const blackHoleMass = 1000;
      const orbitalVelocity = Math.sqrt(G * blackHoleMass / config.distance) * 0.0008;
      const velocity = new THREE.Vector3(-z, 0, x).normalize().multiplyScalar(orbitalVelocity);

      const trailGeometry = new THREE.BufferGeometry();
      const trailMaterial = new THREE.LineBasicMaterial({ color: 0x304060, transparent: true, opacity: 0.4 });
      const trail = new THREE.Line(trailGeometry, trailMaterial);
      scene.add(trail);

      planets.push({
        mesh, velocity, mass: config.mass, trail, trailPositions: [],
        isShattering: false, shatterProgress: 0, name: config.name,
      });
    };

    planetConfigs.forEach((config) => {
      textureLoader.load(
        config.textureUrl, 
        (texture) => {
          // Texture loaded successfully
          createPlanet(config, texture);
        }, 
        undefined, 
        (error) => {
          // Texture failed to load, use fallback color
          console.warn(`Failed to load texture for ${config.name}, using fallback color`);
          createPlanet(config);
        }
      );
    });

    // === STARS ===
    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 4000;
    const starsPositions = new Float32Array(starsCount * 3);
    const starsColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 100 + Math.random() * 200;
      
      starsPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starsPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starsPositions[i * 3 + 2] = r * Math.cos(phi);

      const type = Math.random();
      if (type > 0.95) {
        starsColors[i * 3] = 0.7; starsColors[i * 3 + 1] = 0.8; starsColors[i * 3 + 2] = 1.0;
      } else if (type > 0.85) {
        starsColors[i * 3] = 1.0; starsColors[i * 3 + 1] = 0.6; starsColors[i * 3 + 2] = 0.4;
      } else {
        starsColors[i * 3] = 1.0; starsColors[i * 3 + 1] = 0.95; starsColors[i * 3 + 2] = 0.9;
      }
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starsColors, 3));
    const starsMaterial = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.9 });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // === LIGHTING ===
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
    sunLight.position.set(50, 50, 50);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x4466ff, 0.3);
    fillLight.position.set(-30, 20, -30);
    scene.add(fillLight);

    const blackHoleGlow = new THREE.PointLight(0xff6600, 5, 100);
    blackHoleGlow.position.set(0, 0, 0);
    scene.add(blackHoleGlow);

    const ambientLight = new THREE.AmbientLight(0x111122, 0.3);
    scene.add(ambientLight);

    // === INTERACTION ===
    let targetCameraX = 0;
    let targetCameraY = 12;
    let targetCameraZ = 40;

    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      const mouseY = (event.clientY / window.innerHeight - 0.5) * 2;
      targetCameraX = mouseX * 25;
      targetCameraY = 12 - mouseY * 15;
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const zoomSpeed = 0.05;
      targetCameraZ += event.deltaY * zoomSpeed;
      targetCameraZ = Math.max(10, Math.min(100, targetCameraZ));
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('wheel', handleWheel, { passive: false });

    // === ANIMATION ===
    const clock = new THREE.Clock();
    let animationFrameId: number;
    const G = 50;
    const blackHoleMass = 1000;
    const tidalDisruptionRadius = schwarzschildRadius * 3;

    const createShatterEffect = (planet: Planet) => {
      const fragmentCount = 300;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(fragmentCount * 3);
      const velocities: THREE.Vector3[] = [];
      const colors = new Float32Array(fragmentCount * 3);
      
      for (let i = 0; i < fragmentCount; i++) {
        const offset = new THREE.Vector3(
          (Math.random() - 0.5) * planet.mesh.scale.x * 2,
          (Math.random() - 0.5) * planet.mesh.scale.y * 2,
          (Math.random() - 0.5) * planet.mesh.scale.z * 2
        );
        
        positions[i * 3] = planet.mesh.position.x + offset.x;
        positions[i * 3 + 1] = planet.mesh.position.y + offset.y;
        positions[i * 3 + 2] = planet.mesh.position.z + offset.z;
        
        const toCenter = planet.mesh.position.clone().normalize();
        velocities.push(new THREE.Vector3(
          offset.x * 0.03 - toCenter.x * 0.08,
          offset.y * 0.02,
          offset.z * 0.03 - toCenter.z * 0.08
        ));
        
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.4 + Math.random() * 0.4; colors[i * 3 + 2] = 0.1 + Math.random() * 0.2;
      }
      
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
      const fragments = new THREE.Points(geometry, material);
      fragments.userData.velocities = velocities;
      scene.add(fragments);
      planet.fragments = fragments;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const deltaTime = Math.min(clock.getDelta(), 0.1);
      const elapsedTime = clock.getElapsedTime();

      // Update black hole shaders
      eventHorizonMaterial.uniforms.time.value = elapsedTime;
      lensingMaterial.uniforms.time.value = elapsedTime;
      iscoRingMaterial.uniforms.time.value = elapsedTime;

      // Rotate black hole core
      blackHole.rotation.y = elapsedTime * 0.03;

      // Rotate photon rings at different speeds
      photonRings.forEach((ring, i) => {
        ring.rotation.z = elapsedTime * (1.2 - i * 0.2);
      });

      // Rotate accretion disk with Keplerian velocities
      diskParticles.forEach((disk, ringIndex) => {
        const baseSpeed = 0.18 - ringIndex * 0.015;
        disk.rotation.y += baseSpeed * deltaTime;
      });

      iscoRing.rotation.z = elapsedTime * 0.08;

      planets.forEach((planet) => {
        if (planet.isShattering) {
          planet.shatterProgress += deltaTime;
          
          if (planet.fragments) {
            const fragPositions = planet.fragments.geometry.attributes.position.array as Float32Array;
            const velocities = planet.fragments.userData.velocities as THREE.Vector3[];
            const material = planet.fragments.material as THREE.PointsMaterial;
            
            for (let i = 0; i < velocities.length; i++) {
              const i3 = i * 3;
              const pos = new THREE.Vector3(fragPositions[i3], fragPositions[i3 + 1], fragPositions[i3 + 2]);
              const distance = pos.length();
              const forceMag = G * blackHoleMass / (distance * distance);
              const force = pos.clone().normalize().multiplyScalar(-forceMag * 0.001);
              velocities[i].add(force);
              pos.add(velocities[i]);
              fragPositions[i3] = pos.x; fragPositions[i3 + 1] = pos.y; fragPositions[i3 + 2] = pos.z;
            }
            
            planet.fragments.geometry.attributes.position.needsUpdate = true;
            material.opacity = Math.max(0, 1 - planet.shatterProgress * 0.3);
          }
          
          if (planet.shatterProgress > 4) {
            if (planet.fragments) {
              scene.remove(planet.fragments);
              planet.fragments.geometry.dispose();
              (planet.fragments.material as THREE.Material).dispose();
            }
            
            const angle = Math.random() * Math.PI * 2;
            const distance = 40 + Math.random() * 25;
            planet.mesh.position.set(Math.cos(angle) * distance, (Math.random() - 0.5) * 3, Math.sin(angle) * distance);
            const orbitalVelocity = Math.sqrt(G * blackHoleMass / distance) * 0.0008;
            planet.velocity.set(-planet.mesh.position.z, 0, planet.mesh.position.x).normalize().multiplyScalar(orbitalVelocity);
            planet.isShattering = false; planet.shatterProgress = 0; planet.trailPositions = [];
            scene.add(planet.mesh);
          }
          return;
        }

        const pos = planet.mesh.position;
        const distance = pos.length();
        const acceleration = G * blackHoleMass / (distance * distance);
        const forceDirection = pos.clone().normalize().multiplyScalar(-1);
        const force = forceDirection.multiplyScalar(acceleration * deltaTime * 0.001);
        
        planet.velocity.add(force);
        pos.add(planet.velocity.clone().multiplyScalar(deltaTime * 60));
        planet.mesh.rotation.y += deltaTime * 0.3;

        planet.trailPositions.push(pos.clone());
        if (planet.trailPositions.length > 100) planet.trailPositions.shift();
        planet.trail.geometry.setFromPoints(planet.trailPositions);

        if (distance < tidalDisruptionRadius) {
          scene.remove(planet.mesh);
          planet.isShattering = true;
          createShatterEffect(planet);
        }
      });

      camera.position.x += (targetCameraX - camera.position.x) * 0.03;
      camera.position.y += (targetCameraY - camera.position.y) * 0.03;
      camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);

      stars.rotation.y += deltaTime * 0.002;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }

      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      // Dispose photon rings
      photonRings.forEach(ring => {
        ring.geometry.dispose();
        (ring.material as THREE.Material).dispose();
      });

      // Dispose disk particles
      diskParticles.forEach(disk => {
        disk.geometry.dispose();
        (disk.material as THREE.Material).dispose();
      });
    };
  }, []);

  return <div ref={containerRef} className="fixed inset-0" style={{ background: 'black' }} />;
}