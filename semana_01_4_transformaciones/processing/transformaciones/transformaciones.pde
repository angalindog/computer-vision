/**
 * Qué hace este sketch:
 *   1. Traslación: el cubo se mueve en trayectoria elíptica con sin() y cos()
 *   2. Rotación:   gira en los tres ejes con frameCount
 *   3. Escala:     tamaño pulsante con sin()
 * Controles:
 *   Tecla S → guarda captura de pantalla en la carpeta del sketch
 */


// VARIABLES GLOBALES
float amplitudX = 180;    // píxeles de desplazamiento en X
float amplitudY = 90;     // píxeles de desplazamiento en Y

float velRotX = 0.007;    // radianes por frame en X
float velRotY = 0.011;    // radianes por frame en Y
float velRotZ = 0.004;    // radianes por frame en Z

float escalaBase = 120;   // tamaño base del cubo (píxeles)
float amplEsc    = 0.45;  // cuánto varía la escala

// Variables calculadas en draw() — se usan en el HUD
float tx, ty;
float angX, angY, angZ;
float factorEsc;
float t;


// SETUP
void setup() {
  size(800, 600, P3D);
  frameRate(60);
}

// DRAW
void draw() {
  background(30, 30, 46);
  // ── Luces ────────────────────────────────────
  // Las luces deben declararse ANTES de dibujar la geometría.
  // ambientLight: ilumina todo por igual (evita sombras totalmente negras)
  // pointLight:   luz puntual como una bombilla en (x,y,z)
  ambientLight(50, 50, 70);
  pointLight(220, 230, 255,  400, -300,  400);
  pointLight(160, 100, 220, -300,  300, -200);

  // ── Tiempo ───────────────────────────────────
  t = millis() / 1000.0;   // segundos desde que arrancó el sketch

  // ── Calcular transformaciones ─────────────────
  tx = amplitudX * cos(t * 0.8);
  ty = amplitudY * sin(t * 1.3);

  angX = frameCount * velRotX;
  angY = frameCount * velRotY;
  angZ = frameCount * velRotZ;

  factorEsc = escalaBase * (1.0 + amplEsc * sin(t * 2.0));

  //Dibujar cubo con pushMatrix / popMatrix
  pushMatrix();

    // 1. Mover el origen al centro de la ventana + traslación animada
    translate(width / 2.0 + tx,  height / 2.0 + ty,  0);

    // 2. Rotar alrededor de los tres ejes
    rotateX(angX);
    rotateY(angY);
    rotateZ(angZ);

    // 3. Escalar
    scale(factorEsc);

    // 4. Dibujar
    fill(137, 180, 250);
    stroke(255, 255, 255, 70);
    strokeWeight(0.8);
    box(1);   // cubo de lado 1 unidad; el tamaño real lo da scale() arriba

  popMatrix();   // aquí el sistema vuelve a su estado original

  // Como ya hicimos popMatrix(), el sistema de coordenadas está en (0,0,0).
  // hint(DISABLE_DEPTH_TEST) hace que el texto aparezca SIEMPRE encima
  // de la geometría 3D, sin importar su posición en Z.

  hint(DISABLE_DEPTH_TEST);
  camera();       // resetea la cámara a la vista ortogonal de pantalla
  noLights();     // desactiva las luces para que el texto no quede oscuro

  fill(255, 255, 255, 210);
  noStroke();
  textSize(13);
  textAlign(LEFT, TOP);

  text("t = "          + nf(t, 1, 2)   + " s",                          14, 14);
  text("Traslacion:   (" + nf(tx, 1, 1) + ", " + nf(ty, 1, 1) + ")",    14, 32);
  text("Angulo Y:      " + nf(degrees(angY) % 360, 3, 1) + "g",         14, 50);
  text("Factor escala: " + nf(factorEsc, 1, 2),                          14, 68);
  text("Frame:         " + frameCount,                                    14, 86);

  fill(150, 150, 170, 180);
  textAlign(LEFT, BOTTOM);
  textSize(12);
  text("[ S ] guardar captura", 14, height - 10);

  hint(ENABLE_DEPTH_TEST);   // restaurar para el siguiente frame

  // ── Captura ───────────────────────────────────
  if (keyPressed && (key == 's' || key == 'S')) {
    saveFrame("captura_####.png");
    println("Captura guardada");
  }
}
