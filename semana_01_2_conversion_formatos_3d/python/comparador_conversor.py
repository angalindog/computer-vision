# Se importan las librerias
import trimesh # Libreria princiapl de manipulación de mallas
import numpy as np # Manejo de valores numéricos como coordenadas 
import os # Para la gestion de archivos

# Se configuran las rutas, de salida y de llegada en la conversion
MODELS_DIR = "models" # Punto origen
OUTPUT_DIR = "output" # Punto destino
os.makedirs(OUTPUT_DIR, exist_ok=True)

MODELS = {
    "OBJ":  os.path.join(MODELS_DIR, "modelo_uno.obj"),
    "STL":  os.path.join(MODELS_DIR, "modelo_dos.stl"),
    "GLTF": os.path.join(MODELS_DIR, "modelo_tres.gltf"),
}

# FUNCIÓN: Cargar modelo (OBJ, STL, GLTF)
# trimesh puede devolver Mesh o Scene según el archivo
def load_mesh(path):
    """Carga un modelo 3D y lo convierte a trimesh.Trimesh si es una escena."""
    loaded = trimesh.load(path, force="mesh")
    if isinstance(loaded, trimesh.Scene):
        # Combinar todas las geometrías de la escena en una sola malla
        meshes = list(loaded.geometry.values())
        if len(meshes) == 0:
            raise ValueError(f"No se encontraron geometrías en {path}")
        loaded = trimesh.util.concatenate(meshes)
    return loaded

# FUNCIÓN: Analizar un modelo
def analyze_mesh(name, mesh):
    """Imprime información detallada de la malla."""
    print(f"\n{'='*50}")
    print(f"  Modelo: {name}")
    print(f"{'='*50}")

    # Geometría básica
    print(f"  Vértices        : {len(mesh.vertices)}")
    print(f"  Caras           : {len(mesh.faces)}")

    # Normales
    has_vertex_normals = mesh.vertex_normals is not None and len(mesh.vertex_normals) > 0
    has_face_normals   = mesh.face_normals   is not None and len(mesh.face_normals)   > 0
    print(f"  Normales de vértice: {'Sí' if has_vertex_normals else 'No'}")
    print(f"  Normales de cara   : {'Sí' if has_face_normals   else 'No'}")

    # Duplicados de vértices
    unique_verts = np.unique(mesh.vertices, axis=0)
    duplicados   = len(mesh.vertices) - len(unique_verts)
    print(f"  Vértices duplicados: {duplicados}")

    # Watertight (malla cerrada, sin agujeros)
    print(f"  Es watertight   : {mesh.is_watertight}")

    # Bounding box
    bb = mesh.bounding_box.extents
    print(f"  Bounding Box    : X={bb[0]:.4f}  Y={bb[1]:.4f}  Z={bb[2]:.4f}")

    # Área superficial y volumen (solo si es watertight)
    print(f"  Área superficial: {mesh.area:.4f}")
    if mesh.is_watertight:
        print(f"  Volumen         : {mesh.volume:.4f}")
    else:
        print(f"  Volumen         : N/A (malla no cerrada)")

    print(f"{'='*50}\n")
    return {
        "name":       name,
        "vertices":   len(mesh.vertices),
        "faces":      len(mesh.faces),
        "duplicados": duplicados,
        "watertight": mesh.is_watertight,
        "area":       mesh.area,
    }

# FUNCIÓN: Convertir y guardar en otro formato
def export_mesh(mesh, filename):
    """Exporta la malla al formato indicado por la extensión del filename."""
    out_path = os.path.join(OUTPUT_DIR, filename)
    mesh.export(out_path)
    print(f"  [OK] Exportado: {out_path}")
    return out_path

# FUNCIÓN: Visualizar un modelo
# (abre ventana interactiva con pyglet/pyopengl)
def visualize_mesh(mesh, title="Modelo 3D"):
    """Muestra el modelo en una ventana 3D interactiva."""
    print(f"\n  Visualizando: {title}")
    print("  (Cierra la ventana para continuar...)")
    scene = trimesh.Scene(mesh)
    scene.show(title=title)

# FUNCIÓN: Comparar todos los modelos
def compare_models(stats_list):
    """Tabla comparativa entre todos los modelos analizados."""
    print("\n" + "="*60)
    print("  COMPARACIÓN ENTRE MODELOS")
    print("="*60)
    header = f"{'Modelo':<8} {'Vértices':>10} {'Caras':>8} {'Duplic.':>8} {'Watertight':>12} {'Área':>12}"
    print(header)
    print("-"*60)
    for s in stats_list:
        wt = "Sí" if s["watertight"] else "No"
        print(f"{s['name']:<8} {s['vertices']:>10} {s['faces']:>8} {s['duplicados']:>8} {wt:>12} {s['area']:>12.4f}")
    print("="*60)

# MAIN
def main():
    print("\n" + "#"*60)
    print("#   ANÁLISIS Y CONVERSIÓN DE MODELOS 3D")
    print("#   Taller - Computación Visual")
    print("#"*60)

    meshes = {}
    stats  = []

    # ── 1. Cargar y analizar cada modelo ──────────────────────
    print("\n[1] CARGANDO Y ANALIZANDO MODELOS...")
    for fmt, path in MODELS.items():
        if not os.path.exists(path):
            print(f"  [WARN] No se encontró: {path} — saltando.")
            continue
        try:
            mesh = load_mesh(path)
            meshes[fmt] = mesh
            s = analyze_mesh(fmt, mesh)
            stats.append(s)
        except Exception as e:
            print(f"  [ERROR] No se pudo cargar {path}: {e}")

    if not meshes:
        print("\n  No se cargó ningún modelo. Verifica que los archivos existan en models/")
        return

    # ── 2. Tabla comparativa ───────────────────────────────────
    print("\n[2] COMPARATIVA...")
    compare_models(stats)

    # ── 3. Conversiones entre formatos ─────────────────────────
    print("\n[3] CONVIRTIENDO FORMATOS...")

    # OBJ → STL y GLTF
    if "OBJ" in meshes:
        export_mesh(meshes["OBJ"], "modelo_uno_desde_obj.stl")
        export_mesh(meshes["OBJ"], "modelo_uno_desde_obj.glb")  # GLB = GLTF binario

    # STL → OBJ y GLTF
    if "STL" in meshes:
        export_mesh(meshes["STL"], "modelo_dos_desde_stl.obj")
        export_mesh(meshes["STL"], "modelo_dos_desde_stl.glb")

    # GLTF → OBJ y STL
    if "GLTF" in meshes:
        export_mesh(meshes["GLTF"], "modelo_tres_desde_gltf.obj")
        export_mesh(meshes["GLTF"], "modelo_tres_desde_gltf.stl")

    # ── 4. Visualización ───────────────────────────────────────
    print("\n[4] VISUALIZACIÓN INTERACTIVA...")
    print("  Se abrirá una ventana por cada modelo.")
    print("  Usa el ratón para rotar/zoom. Cierra cada ventana para continuar.\n")

    for fmt, mesh in meshes.items():
        try:
            visualize_mesh(mesh, title=f"Modelo {fmt}")
        except Exception as e:
            print(f"  [WARN] No se pudo visualizar {fmt}: {e}")
            print("         Instala 'pyglet' o ejecuta en un entorno con GUI.")

    print("Revisa la carpeta output para los archivos convertidos.")


if __name__ == "__main__":
    main()