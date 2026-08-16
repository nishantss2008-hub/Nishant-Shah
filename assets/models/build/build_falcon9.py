import bpy, os, math
import numpy as np
S = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
bpy.ops.wm.stl_import(filepath=os.path.join(S, "models", "falcon9.stl"))
o = bpy.context.selected_objects[0]; o.name = "falcon9"
bpy.context.view_layer.objects.active = o

# split into loose parts, keep only the assembled rocket (left, x < -1)
bpy.ops.mesh.separate(type='LOOSE')
kept = []
for p in [x for x in bpy.data.objects if x.type == 'MESH']:
    n = len(p.data.vertices)
    a = np.empty(n*3, dtype=np.float32); p.data.vertices.foreach_get("co", a); v = a.reshape(n,3)
    cx = float(v[:,0].mean())
    if cx < -1.0:
        kept.append(p)
    else:
        bpy.data.objects.remove(p, do_unlink=True)
print("kept parts:", len(kept))
bpy.ops.object.select_all(action='DESELECT')
for p in kept: p.select_set(True)
bpy.context.view_layer.objects.active = kept[0]
if len(kept) > 1: bpy.ops.object.join()
o = bpy.context.view_layer.objects.active; o.name = "falcon9"

# weld + decimate hard (1.1M tris source)
bpy.ops.object.shade_smooth_by_angle(angle=math.radians(32))
m = o.modifiers.new("dec", 'DECIMATE'); m.ratio = 0.14
bpy.ops.object.modifier_apply(modifier=m.name)
print("tris after decimate:", len(o.data.polygons))

# material: falcon white
mat = bpy.data.materials.new("f9white"); mat.use_nodes = True
b = mat.node_tree.nodes["Principled BSDF"]
b.inputs["Base Color"].default_value = (0.85, 0.86, 0.88, 1)
b.inputs["Metallic"].default_value = 0.15
b.inputs["Roughness"].default_value = 0.45
o.data.materials.clear(); o.data.materials.append(mat)

# center + normalize height to 2 (matches other card models)
n = len(o.data.vertices)
a = np.empty(n*3, dtype=np.float32); o.data.vertices.foreach_get("co", a); v = a.reshape(n,3)
mn, mx = v.min(axis=0), v.max(axis=0)
ctr = (mn + mx) / 2
f = 2.0 / float(mx[2] - mn[2])
o.location = (-ctr[0]*f, -ctr[1]*f, -ctr[2]*f)
o.scale = (f, f, f)
bpy.ops.object.select_all(action='SELECT')
out = os.path.join(S, "out", "falcon9.glb")
bpy.ops.export_scene.gltf(filepath=out, export_format='GLB', export_apply=True, export_yup=True)
print("wrote", out, os.path.getsize(out)//1024, "KB")
