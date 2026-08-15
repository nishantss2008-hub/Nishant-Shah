"""Procedural SpaceX Starship full stack (public dimensions, meters/10).
Ship 52.1m + Super Heavy 71m, 9m dia. Z-up in Blender, glTF exporter flips to Y-up."""
import bpy, os, math, mathutils

S = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(S, "out")
os.makedirs(OUT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
U = 1.0  # all literals below are in units of 10 m

def mat(name, color, metallic, rough):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1)
    b.inputs["Metallic"].default_value = metallic
    b.inputs["Roughness"].default_value = rough
    return m

STEEL = mat("steel", (0.72, 0.72, 0.74), 1.0, 0.32)
TILE  = mat("tiles", (0.035, 0.035, 0.04), 0.2, 0.85)
DARK  = mat("dark",  (0.16, 0.16, 0.18), 0.6, 0.55)

def setm(o, m):
    o.data.materials.clear(); o.data.materials.append(m)

def cyl(name, r, z0, z1, m=STEEL, verts=48, r_top=None):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r if r_top is None else r_top,
                                    depth=(z1 - z0), location=(0, 0, (z0 + z1) / 2))
    o = bpy.context.active_object; o.name = name; setm(o, m)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    return o

R = 0.45               # 9 m dia
BH = 7.1               # booster length (×10 m)
SH = 5.21              # ship length

# ---------- Super Heavy ----------
cyl("booster", R, 0, BH * U)
cyl("skirt", R * 1.01, 0, 0.28 * U, DARK)                     # engine skirt ring
# grid fins: 4 thin slabs near booster top
for k in range(4):
    a = k * math.pi / 2 + math.pi / 4
    bpy.ops.mesh.primitive_cube_add(location=(math.cos(a) * (R + 0.09 * U), math.sin(a) * (R + 0.09 * U), (BH - 0.55) * U))
    o = bpy.context.active_object; o.name = "gridfin"
    o.scale = (0.14 * U, 0.028 * U, 0.24 * U)
    o.rotation_euler = (0, 0, a)
    setm(o, DARK)
# hot-stage ring
cyl("hotstage", R * 1.012, BH * U, (BH + 0.09) * U, DARK)

# ---------- Ship ----------
Z0 = (BH + 0.09) * U
CYL_L = 3.3            # cylindrical section (×10 m)
cyl("ship", R, Z0, Z0 + CYL_L * U)
# nosecone: ogive via spin profile
NOSE_L = SH - CYL_L
prof = []
NP = 26
for i in range(NP + 1):
    t = i / NP
    z = t * NOSE_L * U
    r = R * math.sqrt(max(0.0, 1 - t * t)) * (1 - 0.12 * t) if t < 1 else 0.0
    prof.append((r, z))
mesh = bpy.data.meshes.new("nose")
vs, fs = [], []
NS = 48
for (r, z) in prof:
    for j in range(NS):
        a = j / NS * 2 * math.pi
        vs.append((r * math.cos(a), r * math.sin(a), Z0 + CYL_L * U + z))
for i in range(NP):
    for j in range(NS):
        j2 = (j + 1) % NS
        fs.append((i * NS + j, i * NS + j2, (i + 1) * NS + j2, (i + 1) * NS + j))
mesh.from_pydata(vs, [], fs); mesh.update()
nose = bpy.data.objects.new("nose", mesh); scene.collection.objects.link(nose)
setm(nose, STEEL)
bpy.ops.object.select_all(action='DESELECT'); nose.select_set(True)
bpy.context.view_layer.objects.active = nose
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))

# tile blanket: half shell over ship + nose, windward (+x) side
def half_shell(name, r, z0, z1, seg=24):
    m2 = bpy.data.meshes.new(name)
    vs2, fs2 = [], []
    rows = 2
    for k in range(rows):
        z = z0 + (z1 - z0) * k / (rows - 1)
        for j in range(seg + 1):
            a = -math.pi / 2 + j / seg * math.pi
            vs2.append((r * math.cos(a), r * math.sin(a), z))
    for j in range(seg):
        fs2.append((j, j + 1, seg + 1 + j + 1, seg + 1 + j))
    m2.from_pydata(vs2, [], fs2); m2.update()
    o = bpy.data.objects.new(name, m2); scene.collection.objects.link(o)
    setm(o, TILE)
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True)
    bpy.context.view_layer.objects.active = o
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))
    return o
half_shell("tiles_cyl", R * 1.008, Z0, Z0 + CYL_L * U)
# tiles on nose: scaled instance of nose shell — approximate with tapered half shell segments
for i in range(0, NP, 2):
    r0, z0n = prof[i]; r1, z1n = prof[min(i + 2, NP)]
    if r1 <= 0.01 * U: break
    m3 = bpy.data.meshes.new("tn")
    vs3, fs3 = [], []
    seg = 24
    for (rr, zz) in ((r0, z0n), (r1, z1n)):
        for j in range(seg + 1):
            a = -math.pi / 2 + j / seg * math.pi
            vs3.append((rr * 1.01 * math.cos(a), rr * 1.01 * math.sin(a), Z0 + CYL_L * U + zz))
    for j in range(seg):
        fs3.append((j, j + 1, seg + 1 + j + 1, seg + 1 + j))
    m3.from_pydata(vs3, [], fs3); m3.update()
    o3 = bpy.data.objects.new("tn", m3); scene.collection.objects.link(o3)
    setm(o3, TILE)
    bpy.ops.object.select_all(action='DESELECT'); o3.select_set(True)
    bpy.context.view_layer.objects.active = o3
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(35))

# flaps: tapered slabs hinged along the hull, tile-black, on the windward side
def flap2(name, z0f, z1f, w_root, w_tip, az, thick=0.05):
    m4 = bpy.data.meshes.new(name)
    h = z1f - z0f
    vs4, fs4 = [], []
    for sx in (1, -1):
        vs4 += [
            (R - 0.05, sx * thick, z0f),            # inner bottom
            (R + w_root, sx * thick, z0f + h * 0.12),  # outer bottom (swept up)
            (R + w_tip, sx * thick, z1f),           # outer top
            (R - 0.05, sx * thick, z1f),            # inner top
        ]
    fs4 = [(0,1,2,3),(7,6,5,4),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)]
    m4.from_pydata(vs4, [], fs4); m4.update()
    o4 = bpy.data.objects.new(name, m4); scene.collection.objects.link(o4)
    setm(o4, TILE)
    o4.rotation_euler = (0, 0, az)
    return o4

for s_ in (1, -1):
    flap2("aftflap", Z0 + 0.02, Z0 + 1.15, 0.42, 0.30, s_ * math.radians(62))
    flap2("fwdflap", Z0 + CYL_L + NOSE_L * 0.40, Z0 + CYL_L + NOSE_L * 0.40 + 0.62, 0.24, 0.15, s_ * math.radians(55), 0.04)

# center stack at origin (z), normalize height to ~2 units tall like other card models
allobjs = [o for o in bpy.data.objects if o.type == 'MESH']
zmax = (BH + 0.09 + SH) * U
zc = zmax / 2
f = 2.0 / zmax
for o in allobjs:
    o.location = ((o.location.x) * f, (o.location.y) * f, (o.location.z - zc) * f)
    o.scale = (o.scale.x * f, o.scale.y * f, o.scale.z * f)

bpy.ops.object.select_all(action='SELECT')
out = os.path.join(OUT, "starship.glb")
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True)
print("wrote", out, os.path.getsize(out) // 1024, "KB")
