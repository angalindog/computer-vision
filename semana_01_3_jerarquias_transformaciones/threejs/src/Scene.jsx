export default function Scene({ padre, hijo, nieto }) {
  return (
    <>
      {/*NIVEL 1 — PADRE  (cubo azul, 1x1x1)
          Posición y rotación en espacio MUNDO*/}
      <group
        position={[padre.posX, padre.posY, 0]}
        rotation={[padre.rotX, padre.rotY, 0]}
      >
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#00ffbf" />
        </mesh>
        {/* Ejes locales del padre */}
        <axesHelper args={[1.2]} />

        {/* NIVEL 2 — HIJO  (cubo verde, 0.8x0.8)
            Posición relativa al PADRE*/}
        <group
          position={[hijo.posX, hijo.posY, 0]}
          rotation={[0, 0, hijo.rotZ]}
        >
          <mesh>
            <boxGeometry args={[0.8, 0.8, 0.8]} />
            <meshStandardMaterial color="#001aff" />
          </mesh>
          {/* Ejes locales del hijo */}
          <axesHelper args={[1]} />

          {/* NIVEL 3 — NIETO  (cubo rojo, 0.5x0.5)
              BONUS: posición relativa al HIJO*/}
          <group
            position={[nieto.posX, nieto.posY, 0]}
            rotation={[0, 0, nieto.rotZ]}
          >
            <mesh>
              <boxGeometry args={[0.5, 0.5, 0.5]} />
              <meshStandardMaterial color="#ff0000" />
            </mesh>
            {/* Ejes locales del nieto */}
            <axesHelper args={[0.7]} />
          </group>

        </group>
      </group>
    </>
  )
}