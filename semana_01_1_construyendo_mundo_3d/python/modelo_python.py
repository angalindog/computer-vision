#Se importan las librerias necesarias
import trimesh
import imageio
import vedo
from vedo import Mesh, Points, Plotter

# Se carga el modelo para procesarlo
nombre_archivo = "modelo2.obj"

try:
    mesh_data = trimesh.load(nombre_archivo)
    # Si el archivo contiene múltiples objetos, los unimos en una sola malla
    if isinstance(mesh_data, trimesh.Scene):
        mesh_data = mesh_data.dump(concatenate=True)
    print("Modelo cargado")
except Exception as e:
    print("No se logro cargar el modelo")
    exit()

#Se configuran los colores del modelo
# Definimos la malla (caras y aristas)
# Color de caras, grosor de aristas y color de arista
vmesh = Mesh([mesh_data.vertices, mesh_data.faces]).c("#8ACCE5").lw(1).lc("#172291")

# Definimos los vértices como puntos independientes
vpoints = Points(mesh_data.vertices, c="#493db8", r=5)

# Se imprime información sobre el modelo
info_texto = (
    f"Modelo: {nombre_archivo}\n"
    f"Vertices: {len(mesh_data.vertices)}\n"
    f"Caras:    {len(mesh_data.faces)}\n"
    f"Aristas:  {len(mesh_data.edges_unique)}"
)

# Creamos el objeto de texto 2D para imprimir la información
txt = vedo.Text2D(info_texto, pos='top-left', s=0.8, c='white', bg='blue', font='Calibri')

# Se abre la ventana interactiva y al cerrarla se genera el gif
print("\n--- Información del Modelo ---")
print(info_texto)

plt = Plotter(title="Taller 3D: Interacción", axes=1)
plt.show(vmesh, vpoints, txt, interactive=True)
plt.close()

# Se establecen los parametros de movimiento del gif saliente
# Configuramos un plotter oculto para el renderizado del video
video_plt = Plotter(offscreen=True, axes=1)
video_plt.show(vmesh, vpoints, txt)

# Se aleja un poco la camara
video_plt.camera.Zoom(0.9)

frames = []
for i in range(40):
    # Rotación en Z (giro principal)
    vmesh.rotate_z(2)
    vpoints.rotate_z(2)
    
    # Rotación en Y (giro de inclinación para efecto "2D/3D" dinámico)
    vmesh.rotate_y(7)
    vpoints.rotate_y(7)
    
    # Capturamos el frame actual
    video_plt.render()
    frame = video_plt.screenshot(asarray=True)
    frames.append(frame)

# Guardamos la secuencia de imágenes como GIF
imageio.mimsave('evidencia.gif', frames, fps=25)

print("Finalizo exitosamente")