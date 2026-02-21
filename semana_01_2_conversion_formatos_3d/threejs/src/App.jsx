import { useState, Suspense, useRef, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF, useFBX, Environment, Grid } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import "./App.css";

// ─── Loaders ────────────────────────────────────────────────

function OBJModel({ onInfo, wireframe }) {
  const obj = useLoader(OBJLoader, "/models/modelo_uno.obj");

  // Contar vértices/caras solo una vez al cargar
  useEffect(() => {
    let verts = 0, faces = 0;
    obj.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const pos = child.geometry.attributes.position;
        if (pos) verts += pos.count;
        if (child.geometry.index) faces += child.geometry.index.count / 3;
        else if (pos) faces += pos.count / 3;
      }
    });
    onInfo({ vertices: verts, faces: Math.round(faces) });
  }, [obj]);

  // Aplicar/quitar wireframe cada vez que cambia el toggle
  useEffect(() => {
    obj.traverse((child) => {
      if (child.isMesh) {
        // Si el material viene del OBJ lo clonamos para no mutarlo globalmente
        if (!child.userData.originalMat) {
          child.userData.originalMat = new THREE.MeshStandardMaterial({
            color: "#c8a97e",
            roughness: 0.6,
            metalness: 0.1,
            side: THREE.DoubleSide,
          });
        }
        child.material = child.userData.originalMat;
        child.material.wireframe = wireframe;
      }
    });
  }, [obj, wireframe]);

  return <primitive object={obj} />;
}

function STLModel({ onInfo, wireframe }) {
  const geometry = useLoader(STLLoader, "/models/modelo_dos.stl");

  useEffect(() => {
    const pos = geometry.attributes.position;
    const verts = pos ? pos.count : 0;
    const faces = geometry.index ? geometry.index.count / 3 : verts / 3;
    onInfo({ vertices: verts, faces: Math.round(faces) });
  }, [geometry]);

  return (
    <mesh geometry={geometry}>
      {/* wireframe se pasa directamente como prop al material declarativo */}
      <meshStandardMaterial
        color="#7eb8c8"
        roughness={0.4}
        metalness={0.3}
        side={THREE.DoubleSide}
        wireframe={wireframe}
      />
    </mesh>
  );
}

function GLTFModel({ onInfo, wireframe }) {
  const { scene } = useGLTF("/models/modelo_tres.gltf");

  useEffect(() => {
    let verts = 0, faces = 0;
    scene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const pos = child.geometry.attributes.position;
        if (pos) verts += pos.count;
        if (child.geometry.index) faces += child.geometry.index.count / 3;
        else if (pos) faces += pos.count / 3;
      }
    });
    onInfo({ vertices: verts, faces: Math.round(faces) });
  }, [scene]);

  // El GLTF tiene sus propios materiales: los recorremos y actualizamos
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        // El material puede ser un array (multi-material) o uno solo
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => { mat.wireframe = wireframe; });
      }
    });
  }, [scene, wireframe]);

  return <primitive object={scene} />;
}

// ─── Scene wrapper ───────────────────────────────────────────

function ModelScene({ active, onInfo, wireframe }) {
  return (
    <Suspense fallback={<LoadingMesh />}>
      {active === "OBJ"  && <OBJModel  onInfo={onInfo} wireframe={wireframe} />}
      {active === "STL"  && <STLModel  onInfo={onInfo} wireframe={wireframe} />}
      {active === "GLTF" && <GLTFModel onInfo={onInfo} wireframe={wireframe} />}
    </Suspense>
  );
}

function LoadingMesh() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#333" wireframe />
    </mesh>
  );
}

// ─── App ─────────────────────────────────────────────────────

const MODELS = [
  { id: "OBJ",  label: "OBJ",  file: "modelo_uno.obj",   desc: "Wavefront OBJ — geometría + materiales .mtl" },
  { id: "STL",  label: "STL",  file: "modelo_dos.stl",   desc: "STL — solo geometría, sin color ni textura" },
  { id: "GLTF", label: "GLTF", file: "modelo_tres.gltf", desc: "GLTF — geometría + materiales + animaciones" },
];

export default function App() {
  const [active, setActive] = useState("OBJ");
  const [info, setInfo] = useState({ vertices: 0, faces: 0 });
  const [wireframe, setWireframe] = useState(false);
  const current = MODELS.find((m) => m.id === active);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-title">
          <span className="header-tag">COMPUTACIÓN VISUAL</span>
          <h1>3D Format<br />Explorer</h1>
        </div>
        <div className="header-desc">
          Comparación de formatos <em>.OBJ · .STL · .GLTF</em>
        </div>
      </header>

      {/* ── Main layout ── */}
      <main className="layout">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <section className="panel">
            <p className="panel-label">FORMATO ACTIVO</p>
            <div className="btn-group">
              {MODELS.map((m) => (
                <button
                  key={m.id}
                  className={`fmt-btn ${active === m.id ? "active" : ""}`}
                  onClick={() => { setActive(m.id); setInfo({ vertices: 0, faces: 0 }); }}
                >
                  <span className="fmt-ext">.{m.id}</span>
                  <span className="fmt-file">{m.file}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="panel info-panel">
            <p className="panel-label">INFO DEL MODELO</p>
            <div className="info-row">
              <span className="info-key">Formato</span>
              <span className="info-val tag">{active}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Vértices</span>
              <span className="info-val">{info.vertices.toLocaleString()}</span>
            </div>
            <div className="info-row">
              <span className="info-key">Caras</span>
              <span className="info-val">{info.faces.toLocaleString()}</span>
            </div>
            <div className="info-desc">{current.desc}</div>
          </section>

          <section className="panel">
            <p className="panel-label">OPCIONES</p>
            <button
              className={`opt-btn ${wireframe ? "active" : ""}`}
              onClick={() => setWireframe((w) => !w)}
            >
              {wireframe ? "● Wireframe ON" : "○ Wireframe OFF"}
            </button>
          </section>

          <section className="panel diff-panel">
            <p className="panel-label">DIFERENCIAS CLAVE</p>
            <ul className="diff-list">
              <li><strong>OBJ</strong> — texto plano, materiales externos (.mtl), amplia compatibilidad</li>
              <li><strong>STL</strong> — solo geometría triangulada, sin color. Ideal para impresión 3D</li>
              <li><strong>GLTF</strong> — JSON + binario, soporta materiales PBR, animaciones y texturas</li>
            </ul>
          </section>
        </aside>

        {/* ── Viewport ── */}
        <div className="viewport">
          <Canvas
            camera={{ position: [3, 2, 5], fov: 45 }}
            shadows
            gl={{ antialias: true }}
          >
            <color attach="background" args={["#0d0d0f"]} />

            {/* Iluminación */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
            <directionalLight position={[-4, 2, -3]} intensity={0.3} color="#4488ff" />
            <pointLight position={[0, -3, 0]} intensity={0.5} color="#ff6622" />

            {/* Grid de referencia */}
            <Grid
              args={[20, 20]}
              position={[0, -2, 0]}
              cellColor="#222"
              sectionColor="#333"
              fadeDistance={15}
            />

            {/* Modelo activo */}
            <ModelScene active={active} onInfo={setInfo} wireframe={wireframe} />

            {/* Controles orbitales */}
            <OrbitControls
              enablePan
              enableZoom
              enableRotate
              minDistance={1}
              maxDistance={20}
            />
          </Canvas>

          {/* Overlay HUD */}
          <div className="hud">
            <span className="hud-fmt">{active}</span>
            <span className="hud-sep">·</span>
            <span>{info.vertices.toLocaleString()} verts</span>
            <span className="hud-sep">·</span>
            <span>{info.faces.toLocaleString()} faces</span>
          </div>

          <div className="controls-hint">
            Arrastrar · Scroll zoom · Click derecho para pan
          </div>
        </div>
      </main>
    </div>
  );
}