"""Build web-ready GLBs: iter_tokamak.glb + w7x_stellarator.glb"""
import bpy, os, math, mathutils
import numpy as np

S = os.path.dirname(os.path.abspath(__file__))
M = os.path.join(S, "models")
OUT = os.path.join(S, "out")
os.makedirs(OUT, exist_ok=True)
SCALE = 9.44

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)

def imp(path, name):
    bpy.ops.wm.stl_import(filepath=path)
    o = bpy.context.selected_objects[0]
    o.name = name
    return o

def verts_np(o):
    n = len(o.data.vertices)
    a = np.empty(n * 3, dtype=np.float32)
    o.data.vertices.foreach_get("co", a)
    return a.reshape(n, 3)

def apply_all(o):
    bpy.ops.object.select_all(action='DESELECT')
    o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

def decimate(o, ratio):
    bpy.context.view_layer.objects.active = o
    m = o.modifiers.new("pla", 'DECIMATE')
    m.decimate_type = 'DISSOLVE'
    m.angle_limit = __import__("math").radians(4)
    bpy.ops.object.modifier_apply(modifier=m.name)
    m = o.modifiers.new("tri", 'TRIANGULATE')
    bpy.ops.object.modifier_apply(modifier=m.name)
    if ratio < 1.0:
        m = o.modifiers.new("dec", 'DECIMATE')
        m.ratio = ratio
        bpy.ops.object.modifier_apply(modifier=m.name)

def weld_smooth(o, merge=0.05, angle=40):
    bpy.context.view_layer.objects.active = o
    m = o.modifiers.new("weld", 'WELD'); m.merge_threshold = merge
    bpy.ops.object.modifier_apply(modifier=m.name)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(angle))

def mat(name, color, metallic=0.0, rough=0.5, emissive=None, estr=1.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = rough
    if emissive:
        bsdf.inputs["Emission Color"].default_value = (*emissive, 1)
        bsdf.inputs["Emission Strength"].default_value = estr
    if alpha < 1:
        bsdf.inputs["Alpha"].default_value = alpha
        m.blend_method = 'BLEND'
    return m

def setmat(o, m):
    o.data.materials.clear()
    o.data.materials.append(m)

def export(path):
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB',
                              export_apply=True, export_yup=True)
    print("wrote", path, os.path.getsize(path) // 1024, "KB")

STEEL = (0.44, 0.50, 0.58)
STEEL2 = (0.35, 0.40, 0.48)
TOK_GLOW = (0.94, 0.45, 0.18)   # ember  (#dd6528-ish)
STEL_GLOW = (0.31, 0.58, 0.94)  # cool blue (#4e93f0-ish)

# ================= ITER TOKAMAK =================
reset()
scene = bpy.context.scene
m_steel = mat("steel", STEEL, metallic=0.9, rough=0.42)
m_steel2 = mat("steel2", STEEL2, metallic=0.9, rough=0.5)
m_plasma_t = mat("plasma", (0.05, 0.01, 0.0), emissive=TOK_GLOW, estr=4.0)

# TF coil (one mesh, 18 linked copies)
tf = imp(os.path.join(M, "iter_tf_coil_a.stl"), "tf")
v = verts_np(tf)
xy = v[:, :2] - v[:, :2].mean(axis=0)
cov = np.cov(xy.T)
evals, evecs = np.linalg.eigh(cov)
major = evecs[:, np.argmax(evals)]
rotz = math.pi / 2 - math.atan2(major[1], major[0])
tf.rotation_euler = (0, 0, rotz); apply_all(tf)
xy2 = verts_np(tf)
ybins = np.linspace(xy2[:, 1].min(), xy2[:, 1].max(), 40)
mins, maxs = [], []
for i in range(14, 26):
    msk = (xy2[:, 1] >= ybins[i]) & (xy2[:, 1] < ybins[i + 1])
    if msk.sum() > 10:
        mins.append(xy2[msk, 0].min()); maxs.append(xy2[msk, 0].max())
if np.var(mins) > np.var(maxs):
    tf.rotation_euler = (0, 0, math.pi); apply_all(tf)
tf.rotation_euler = (math.pi / 2, 0, 0); apply_all(tf)
v = verts_np(tf)
tf.location = (2.55 * SCALE - v[:, 0].min(),
               -(v[:, 1].min() + v[:, 1].max()) / 2,
               -(v[:, 2].min() + v[:, 2].max()) / 2)
apply_all(tf)
weld_smooth(tf, 0.05, 40)
decimate(tf, 0.6)
setmat(tf, m_steel)
print("tf tris:", len(tf.data.polygons))
for k in range(1, 18):
    o = tf.copy()
    scene.collection.objects.link(o)
    o.rotation_euler = (0, 0, k * 2 * math.pi / 18)

PF = {"iter_pf1": (3.94, 7.56), "iter_pf2": (8.28, 6.53), "iter_pf3": (11.99, 3.27),
      "iter_pf4": (11.96, -2.26), "iter_pf5": (8.40, -6.73), "iter_pf6": (4.29, -7.56)}
for name, (r, z) in PF.items():
    o = imp(os.path.join(M, name + ".stl"), name)
    v = verts_np(o)
    o.location = (0, 0, z * SCALE - (v[:, 2].min() + v[:, 2].max()) / 2)
    apply_all(o)
    weld_smooth(o, 0.05, 40)
    decimate(o, 0.3)
    setmat(o, m_steel2)
    print(name, "tris:", len(o.data.polygons))

cs = imp(os.path.join(M, "iter_solenoid.stl"), "solenoid")
v = verts_np(cs)
cs.location = (0, 0, -(v[:, 2].min() + v[:, 2].max()) / 2)
apply_all(cs)
weld_smooth(cs, 0.05, 40)
decimate(cs, 0.18)
setmat(cs, m_steel2)
print("solenoid tris:", len(cs.data.polygons))

# plasma
R0, a, kappa, delta = 6.2, 2.0, 1.7, 0.33
mesh = bpy.data.meshes.new("plasma")
NP, NT = 96, 40
vs, fs = [], []
for i in range(NP):
    p = i / NP * 2 * math.pi
    for j in range(NT):
        t = j / NT * 2 * math.pi
        r = R0 + a * math.cos(t + delta * math.sin(t))
        z = kappa * a * math.sin(t)
        vs.append((r * math.cos(p) * SCALE, r * math.sin(p) * SCALE, z * SCALE))
for i in range(NP):
    for j in range(NT):
        i2, j2 = (i + 1) % NP, (j + 1) % NT
        fs.append((i * NT + j, i2 * NT + j, i2 * NT + j2, i * NT + j2))
mesh.from_pydata(vs, [], fs)
mesh.update()
pl = bpy.data.objects.new("plasma", mesh)
scene.collection.objects.link(pl)
bpy.ops.object.select_all(action='DESELECT')
pl.select_set(True); bpy.context.view_layer.objects.active = pl
bpy.ops.object.shade_smooth()
setmat(pl, m_plasma_t)

# normalize: scale whole machine so outer radius ~= 1.0
allobjs = [o for o in bpy.data.objects if o.type == 'MESH']
rmax = 0
for o in allobjs:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c)
        rmax = max(rmax, math.hypot(w.x, w.y))
f = 1.0 / rmax
for o in allobjs:
    o.location = (o.location.x * f, o.location.y * f, o.location.z * f)
    o.scale = (o.scale.x * f,) * 3
export(os.path.join(OUT, "iter_tokamak.glb"))

# ================= W7-X STELLARATOR =================
reset()
scene = bpy.context.scene
m_steel_w = mat("steel", STEEL, metallic=0.9, rough=0.42)
m_plasma_s = mat("plasma", (0.0, 0.02, 0.05), emissive=STEL_GLOW, estr=4.0)

W = os.path.join(M, "w7x_parts")
coils = []
for i in range(50):
    o = imp(os.path.join(W, f"w7x_{i:03d}.stl"), f"coil_{i:03d}")
    coils.append(o)
# join coils into one object
bpy.ops.object.select_all(action='DESELECT')
for o in coils: o.select_set(True)
bpy.context.view_layer.objects.active = coils[0]
bpy.ops.object.join()
cj = bpy.context.view_layer.objects.active
cj.name = "coils"
weld_smooth(cj, 0.005, 45)
decimate(cj, 0.65)
setmat(cj, m_steel_w)
print("w7x coils tris:", len(cj.data.polygons))

plasma = imp(os.path.join(W, "w7x_050.stl"), "plasma")
weld_smooth(plasma, 0.005, 60)
decimate(plasma, 0.8)
setmat(plasma, m_plasma_s)
print("w7x plasma tris:", len(plasma.data.polygons))

allobjs = [o for o in bpy.data.objects if o.type == 'MESH']
# center at origin
mn = mathutils.Vector((1e9,) * 3); mx = mathutils.Vector((-1e9,) * 3)
for o in allobjs:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c)
        mn = mathutils.Vector(map(min, mn, w)); mx = mathutils.Vector(map(max, mx, w))
ctr = (mn + mx) / 2
rmax = 0
for o in allobjs:
    o.location -= ctr
for o in allobjs:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c)
        rmax = max(rmax, math.hypot(w.x, w.y))
f = 1.0 / rmax
for o in allobjs:
    o.location = (o.location.x * f, o.location.y * f, o.location.z * f)
    o.scale = (f, f, f)
export(os.path.join(OUT, "w7x_stellarator.glb"))
print("ALL DONE")
