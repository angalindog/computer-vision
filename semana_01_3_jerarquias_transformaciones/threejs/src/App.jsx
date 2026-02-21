import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useControls } from 'leva'
import Scene from './Scene'

export default function App() {
  const padre = useControls('Padre', {
    posX: { value: 0, min: -5, max: 5, step: 0.1 },
    posY: { value: 0, min: -5, max: 5, step: 0.1 },
    rotY: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    rotX: { value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
  })

  const hijo = useControls('Hijo (relativo al padre)', {
    posX: { value: 2,  min: -5, max: 5, step: 0.1 },
    posY: { value: 0,  min: -5, max: 5, step: 0.1 },
    rotZ: { value: 0,  min: -Math.PI, max: Math.PI, step: 0.01 },
  })

  const nieto = useControls('Nieto (relativo al hijo)', {
    posX: { value: 2,  min: -5, max: 5, step: 0.1 }, 
    posY: { value: 0,  min: -5, max: 5, step: 0.1 }, 
    rotZ: { value: 0,  min: -Math.PI, max: Math.PI, step: 0.01 },
  })

  return (
    <div style={{ width: '120vw', height: '120vh', background: '#ffffff' }}>
      <Canvas camera={{ position: [0, 5, 12], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />

        {/* Grid y ejes del mundo - tamaño controlado */}
        <gridHelper args={[20, 20, '#12024d', '#5944a7']} />
        <axesHelper args={[2]} /> 

        <Scene padre={padre} hijo={hijo} nieto={nieto} />
        <OrbitControls />
      </Canvas>
    </div>
  )
}