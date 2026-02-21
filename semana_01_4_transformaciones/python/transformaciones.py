# Importar librerias necesarias
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
import imageio.v2 as imageio
import os

#Figura de un gato
def figura_F():
    puntos = np.array([
        [0,0], [2,0], [2,2], [1.5,1.5], [0.5,1.5], [0,2], [0,0], # Cabeza y orejas
        [0.5, 0.8], [0.7, 0.8], # Ojo 1
        [1.3, 0.8], [1.5, 0.8]  # Ojo 2
    ], dtype=float).T
    
    unos = np.ones((1, puntos.shape[1]))
    return np.vstack([puntos, unos])


# MATRICES DE TRANSFORMACIÓN HOMOGÉNEAS
# Todas son 3×3 para operar en 2D homogéneo.
def mat_traslacion(tx, ty):
    """Matriz de traslación por (tx, ty)."""
    return np.array([
        [1, 0, tx],
        [0, 1, ty],
        [0, 0,  1],
    ], dtype=float)

def mat_rotacion(angulo_rad):
    """Matriz de rotación por 'angulo_rad' alrededor del origen."""
    c, s = np.cos(angulo_rad), np.sin(angulo_rad)
    return np.array([
        [ c, -s, 0],
        [ s,  c, 0],
        [ 0,  0, 1],
    ], dtype=float)

def mat_escala(sx, sy):
    """Matriz de escala (sx en X, sy en Y)."""
    return np.array([
        [sx,  0, 0],
        [ 0, sy, 0],
        [ 0,  0, 1],
    ], dtype=float)


# ANIMACIÓN FRAME A FRAME
# t ∈ [0, 1] representa el progreso del tiempo.
# Combinamos las tres transformaciones en una
# sola matriz M = T · R · S (orden importa).

NUM_FRAMES = 60          # cantidad de cuadros del GIF
FPS        = 20          # velocidad del GIF
OUTPUT_GIF = "animacion_transformaciones.gif"

os.makedirs("frames_temp", exist_ok=True)
frame_paths = []

figura_orig = figura_F()

for i in range(NUM_FRAMES):
    t = i / NUM_FRAMES    # t va de 0 a ~1

    # --- Traslación oscilante en X ---
    tx = 3 * np.sin(2 * np.pi * t)   # va y vuelve entre -3 y +3
    ty = 0

    # --- Rotación creciente ---
    angulo = 2 * np.pi * t            # una vuelta completa

    # --- Escala pulsante ---
    escala = 0.8 + 0.4 * np.sin(2 * np.pi * t)  # oscila entre 0.4 y 1.2

    # --- Matriz combinada: primero escala, luego rota, luego traslada ---
    # El orden de multiplicación es de derecha a izquierda:
    # M · punto = T( R( S(punto) ) )
    M = mat_traslacion(tx, ty) @ mat_rotacion(angulo) @ mat_escala(escala, escala)

    # Mostramos la matriz en consola para el frame 0, 20, 40
    if i % 20 == 0:
        print(f"\n── Frame {i} (t={t:.2f}) ──")
        print("Matriz combinada M:\n", np.round(M, 3))

    # --- Aplicar transformación ---
    figura_t = M @ figura_orig        # (3,3) @ (3,N) = (3,N)

    # --- Dibujar ---
    fig, axes = plt.subplots(1, 2, figsize=(10, 5))
    fig.patch.set_facecolor("#1e1e2e")

    for ax in axes:
        ax.set_facecolor("#1e1e2e")
        ax.set_xlim(-6, 6)
        ax.set_ylim(-6, 6)
        ax.set_aspect("equal")
        ax.axhline(0, color="#555", lw=0.8)
        ax.axvline(0, color="#555", lw=0.8)
        ax.tick_params(colors="gray")
        for spine in ax.spines.values():
            spine.set_edgecolor("#444")

    # Panel izquierdo: figura original (gris)
    axes[0].plot(*figura_orig[:2], color="#555577", lw=2)
    axes[0].fill(*figura_orig[:2], alpha=0.15, color="#555577")
    axes[0].set_title("Original", color="white", fontsize=11)

    # Panel derecho: figura transformada (coloreada)
    axes[1].plot(*figura_orig[:2], color="#444466", lw=1, linestyle="--", alpha=0.4)
    axes[1].plot(*figura_t[:2], color="#89b4fa", lw=2.5)
    axes[1].fill(*figura_t[:2], alpha=0.25, color="#89b4fa")
    axes[1].set_title(
        f"t={t:.2f}  |  tx={tx:.1f}  ang={np.degrees(angulo):.0f}°  s={escala:.2f}",
        color="white", fontsize=10
    )

    # Anotación de la matriz combinada (simplificada)
    mat_txt = (
        f"M = T·R·S\n"
        f"[{M[0,0]:.2f}  {M[0,1]:.2f}  {M[0,2]:.2f}]\n"
        f"[{M[1,0]:.2f}  {M[1,1]:.2f}  {M[1,2]:.2f}]\n"
        f"[{M[2,0]:.2f}  {M[2,1]:.2f}  {M[2,2]:.2f}]"
    )
    axes[1].text(
        -5.5, -4.5, mat_txt,
        fontsize=7.5, color="#a6e3a1",
        fontfamily="monospace",
        verticalalignment="bottom"
    )

    plt.tight_layout()

    path = f"frames_temp/frame_{i:03d}.png"
    plt.savefig(path, dpi=80, facecolor=fig.get_facecolor())
    plt.close(fig)
    frame_paths.append(path)


# EXPORTAR GIF
print("\nExportando GIF...")
frames = [imageio.imread(p) for p in frame_paths]
imageio.mimsave(OUTPUT_GIF, frames, fps=FPS, loop=0)
print(f"GIF guardado como '{OUTPUT_GIF}'")

# Limpiar frames temporales
import shutil
shutil.rmtree("frames_temp")
print("Frames temporales eliminados.")