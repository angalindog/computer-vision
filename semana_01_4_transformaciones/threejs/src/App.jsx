/**
 * Archivo: src/App.jsx
 * El cubo recibe:
 *   1. Traslación → trayectoria elíptica con cos(t) / sin(t)
 *   2. Rotación   → incremental cada frame en X, Y, Z
 *   3. Escala     → pulsante con Math.sin(t)
 * Extras: OrbitControls + Grid + ejes de referencia + panel HUD
 */

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Line, Grid } from '@react-three/drei'
import * as THREE from 'three'


// COMPONENTE: CuboAnimado
function CuboAnimado({ onUpdate }) {
  const meshRef = useRef()

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return

    const t = state.clock.elapsedTime   // tiempo en segundos

    // ── 1. TRASLACIÓN elíptica ─────────────────────────
    // cos(t) y sin(t) recorren un círculo.
    // Al usar frecuencias y radios distintos obtenemos una elipse.
    mesh.position.x = 2.5 * Math.cos(t * 0.7)
    mesh.position.y = 1.2 * Math.sin(t * 1.1)
    mesh.position.z = 0.8 * Math.sin(t * 0.5)   // leve movimiento en Z

    // ── 2. ROTACIÓN incremental ────────────────────────
    // Sumamos un delta cada frame → ángulo crece sin parar → giro continuo.
    mesh.rotation.x += 0.008
    mesh.rotation.y += 0.013
    mesh.rotation.z += 0.005

    // ── 3. ESCALA pulsante ─────────────────────────────
    // (1 + 0.4 * sin(t)) oscila entre 0.6 y 1.4.
    const s = 1 + 0.4 * Math.sin(t * 1.8)
    mesh.scale.set(s, s, s)

    // Actualizamos el panel HUD con los valores del frame actual
    if (onUpdate) {
      onUpdate({
        t:  t.toFixed(2),
        px: mesh.position.x.toFixed(2),
        py: mesh.position.y.toFixed(2),
        ry: THREE.MathUtils.radToDeg(mesh.rotation.y % (Math.PI * 2)).toFixed(1),
        s:  s.toFixed(3),
      })
    }
  })

  return (
    <mesh ref={meshRef} castShadow>
      {/*
        boxGeometry(ancho, alto, profundidad)
        El cubo mide 1×1×1 unidades. Su tamaño visual real lo controla mesh.scale.
      */}
      <boxGeometry args={[1, 1, 1]} />
      {/*
        meshStandardMaterial: iluminación PBR (necesita luces en la escena).
          color     → color base del material
          metalness → 0 = plástico, 1 = metal
          roughness → 0 = espejo, 1 = mate
      */}
      <meshStandardMaterial color="#89b4fa" metalness={0.25} roughness={0.35} />
    </mesh>
  )
}


// COMPONENTE: EjesReferencia
function EjesReferencia() {
  const largo = 4

  return (
    <group>
      <Line points={[[-largo,0,0],[largo,0,0]]} color="red"      lineWidth={1.5} />
      <Line points={[[0,-largo,0],[0,largo,0]]} color="#00dd00"  lineWidth={1.5} />
      <Line points={[[0,0,-largo],[0,0,largo]]} color="#4488ff"  lineWidth={1.5} />
    </group>
  )
}


// COMPONENTE RAÍZ: App
export default function App() {
  // Estado React para mostrar los valores del frame en el HUD HTML
  const [hud, setHud] = useState({ t: '0', px: '0', py: '0', ry: '0', s: '1' })

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#1e1e2e' }}>

      {/* ── Panel HUD (HTML puro, encima del canvas) ── */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        color: '#cdd6f4', fontFamily: 'monospace', fontSize: 13,
        background: 'rgba(49,50,68,0.85)',
        padding: '12px 16px', borderRadius: 10,
        lineHeight: 1.9,
        pointerEvents: 'none',
        border: '1px solid rgba(137,180,250,0.2)',
        minWidth: 240,
      }}>
        <div style={{ color: '#89b4fa', fontWeight: 'bold', marginBottom: 6 }}>
          Taller — Transformaciones 3D
        </div>
        <div>⏱ t = <span style={{color:'#a6e3a1'}}>{hud.t}</span> s</div>
        <div>📍 pos ( <span style={{color:'#fab387'}}>{hud.px}</span> , <span style={{color:'#fab387'}}>{hud.py}</span> )</div>
        <div>🔄 rot.Y = <span style={{color:'#f38ba8'}}>{hud.ry}</span>°</div>
        <div>📐 escala = <span style={{color:'#a6e3a1'}}>{hud.s}</span></div>
        <div style={{ marginTop: 8, color: '#6c7086', fontSize: 11 }}>
          Arrastra para orbitar · Scroll para zoom
        </div>
      </div>

      {/* ── Canvas 3D ── */}
      <Canvas camera={{ position: [6, 4, 6], fov: 50 }} shadows>

        {/* Luces — necesarias para que meshStandardMaterial tenga volumen */}
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 5]} intensity={1.4} castShadow />
        <pointLight position={[-4, 3, -4]} intensity={0.9} color="#cba6f7" />

        {/* Cubo con las tres transformaciones animadas */}
        <CuboAnimado onUpdate={setHud} />

        {/* Ejes X Y Z de referencia */}
        <EjesReferencia />

        {/* Cuadrícula en el plano inferior */}
        <Grid
          args={[12, 12]}
          position={[0, -2.5, 0]}
          cellColor="#45475a"
          sectionColor="#585b70"
          fadeDistance={20}
        />

        {/*
          OrbitControls:
            - Click izquierdo + arrastrar → rotar cámara
            - Scroll                       → zoom
            - Click derecho + arrastrar    → pan (desplazar)
          makeDefault registra los controles en R3F para que
          otros helpers puedan detectar interacciones del usuario.
        */}
        <OrbitControls makeDefault />

      </Canvas>
    </div>
  )
}