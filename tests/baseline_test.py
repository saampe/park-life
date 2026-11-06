"""New Stage 1A tooling tests, distinct from the recovered gameplay tests."""
import hashlib,importlib,sys,tempfile,unittest,zlib,struct,json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from validate import validate_site
from build_site import build_site

def png():
 def chunk(kind,data):return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
 return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',1,1,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(b'\0\xff\xff\xff\xff'))+chunk(b'IEND',b'')

class BaselineTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup);self.root=Path(self.tmp.name)
  files={'index.html':b'<script type="module" src="app.js"></script><img src="assets/approved.png">','app.js':b"import {x} from './world.js';",'world.js':b'export const x=1;','scene.js':b'// preserved renderer','style.css':b'body{margin:0}','assets/approved.png':png()}
  for name,data in files.items():p=self.root/'site'/name;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data)
  c=self.root/'checksums';c.mkdir();(c/'deployed-files.sha256').write_text(''.join(hashlib.sha256(data).hexdigest()+'  site/'+name+'\n' for name,data in sorted(files.items())))
  (c/'assets.sha256').write_text(hashlib.sha256(files['assets/approved.png']).hexdigest()+'  site/assets/approved.png\n')
 def test_unmodified_source_validates(self):self.assertEqual(validate_site(self.root)['files'],6)
 def test_changed_approved_asset_is_rejected(self):
  with (self.root/'site/assets/approved.png').open('ab') as f:f.write(b'changed')
  with self.assertRaisesRegex(ValueError,'checksum'):validate_site(self.root)
 def test_missing_relative_module_is_rejected_even_with_updated_checksum(self):
  p=self.root/'site/app.js';old=hashlib.sha256(p.read_bytes()).hexdigest();p.write_text("import {x} from './missing.js';")
  c=self.root/'checksums/deployed-files.sha256';c.write_text(c.read_text().replace(old,hashlib.sha256(p.read_bytes()).hexdigest()))
  with self.assertRaisesRegex(ValueError,'reference'):validate_site(self.root)
 def test_untracked_site_file_is_rejected(self):
  (self.root/'site/extra.js').write_text('unexpected')
  with self.assertRaisesRegex(ValueError,'inventory'):validate_site(self.root)
 def test_build_copies_source_exactly_and_adds_only_nojekyll(self):
  out=build_site(self.root,self.root/'_site')
  for f in (self.root/'site').rglob('*'):
   if f.is_file():self.assertEqual(f.read_bytes(),(out/f.relative_to(self.root/'site')).read_bytes())
  self.assertEqual((out/'.nojekyll').read_bytes(),b'')
 def test_build_refuses_source_and_repository_as_output(self):
  for out in [self.root,self.root/'site',self.root/'.git',self.root.parent]:
   with self.subTest(out=out),self.assertRaises(ValueError):build_site(self.root,out)
if __name__=='__main__':unittest.main()
