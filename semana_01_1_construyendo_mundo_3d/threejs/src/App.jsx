//Importación de las librerías
import React, { Suspense, useState, useMemo } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Edges, Center, Stage } from '@react-three/drei';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

// Componente model
function Model({ wireframe, onLoadModel }) {
  //Se carga el archivo modelo2.obj que está en la carpeta public
  const obj = useLoader(OBJLoader, '/modelo2.obj');
  
  // Busca dentro del archivo hasta encontrar la primera malla y extraer su geometría
  // Calcula la cantidad de vértices y caras
  const geometry = useMemo(() => {
    let geo = null;
    obj.traverse((child) => {
      if (child.isMesh && !geo) {
        geo = child.geometry;
      }
    });

    if (geo && onLoadModel) {
      // Calculamos los datos
      const vCount = geo.attributes.position.count;
      const fCount = geo.index ? geo.index.count / 3 : geo.attributes.position.count / 3;
      // Enviamos los datos al componente padre (App)
      onLoadModel({ vertices: vCount, faces: Math.round(fCount) });
    }
    return geo;
  }, [obj, onLoadModel]);

  if (!geometry) return null;

  // Se renderiza la malla, se define cómo se ve la superficie y el wireframe se activa o desactiva
  // Se dibujan lineas negras cuando esta en modo solido
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color='#7edfdf' wireframe={wireframe} />
      {!wireframe && <Edges color="black" threshold={15} />}
    </mesh>
  );
}

// Contiene la parte visual, es decir, la interfaz y el escenario
export default function App() {
  // Booleano para alternar los modos de visualización
  const [showWireframe, setShowWireframe] = useState(false);
  // Se crea un objeto que guarda la cantidad de vertices y caras para mostrarlos en pantalla
  const [modelStats, setModelStats] = useState({ vertices: 0, faces: 0 });

  // Botones y texto flotan sobre el canvas del objeto 3D usando css
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#ffffff' }}>
      <div style={{ 
        position: 'absolute', top: 20, left: 20, zIndex: 10, 
        background: 'rgba(46, 5, 122, 0.9)', padding: '15px', borderRadius: '8px',
        fontFamily: 'sans-serif' 
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Visor 3D: Nave</h2>
        <p><strong>Vértices:</strong> {modelStats.vertices}</p>
        <p><strong>Caras:</strong> {modelStats.faces}</p>
        <button 
          onClick={() => setShowWireframe(!showWireframe)}
          style={{ padding: '8px 12px', cursor: 'pointer', marginTop: '10px' }}
        >
          {showWireframe ? 'Ver Sólido' : 'Ver Estructura (Wireframe)'}
        </button>
      </div>

      <Canvas camera={{ position: [0, 0, 5] }}>
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <Center>
              <Model 
                wireframe={showWireframe} 
                onLoadModel={(stats) => setModelStats(stats)} 
              />
            </Center>
          </Stage>
        </Suspense>
        <OrbitControls makeDefault />
      </Canvas>
    </div>
  );
}