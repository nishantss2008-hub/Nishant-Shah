"""Tessellate the Proxima W7-X STEP into per-solid STL files."""
import os, sys
from OCP.STEPControl import STEPControl_Reader
from OCP.IFSelect import IFSelect_RetDone
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID, TopAbs_SHELL
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.StlAPI import StlAPI_Writer
from OCP.Bnd import Bnd_Box
from OCP.BRepBndLib import BRepBndLib
from OCP.TopoDS import TopoDS

src, outdir = sys.argv[1], sys.argv[2]
os.makedirs(outdir, exist_ok=True)

r = STEPControl_Reader()
assert r.ReadFile(src) == IFSelect_RetDone, "STEP read failed"
r.TransferRoots()
shape = r.OneShape()

solids = []
ex = TopExp_Explorer(shape, TopAbs_SOLID)
while ex.More():
    solids.append(TopoDS.Solid_s(ex.Current()))
    ex.Next()
if not solids:
    ex = TopExp_Explorer(shape, TopAbs_SHELL)
    while ex.More():
        solids.append(TopoDS.Shell_s(ex.Current()))
        ex.Next()
print("solids/shells:", len(solids))

w = StlAPI_Writer()
w.ASCIIMode = False
for i, s in enumerate(solids):
    BRepMesh_IncrementalMesh(s, 0.04, False, 0.35, True)  # coarse-ish: linear defl 8 units, angular 0.6rad
    box = Bnd_Box()
    BRepBndLib.Add_s(s, box)
    xmin, ymin, zmin, xmax, ymax, zmax = box.Get()
    out = os.path.join(outdir, f"w7x_{i:03d}.stl")
    w.Write(s, out)
    print(f"{i:03d} bbox=({xmin:.0f},{ymin:.0f},{zmin:.0f})..({xmax:.0f},{ymax:.0f},{zmax:.0f}) size={os.path.getsize(out)//1024}KB")
print("done")
