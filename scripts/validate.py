"""Validate the recovered static application without modifying it. Standard library only."""
import argparse,ast,hashlib,json,re,struct,zlib
from html.parser import HTMLParser
from pathlib import Path,PurePosixPath
from urllib.parse import unquote,urlsplit

def manifest(root,name):
 result={}
 for line in (root/'checksums'/name).read_text().splitlines():
  digest,sep,path=line.partition('  ')
  if not sep or not re.fullmatch('[a-f0-9]{64}',digest):raise ValueError('invalid checksum manifest')
  p=PurePosixPath(path)
  if p.is_absolute() or '..' in p.parts or not path.startswith('site/') or path in result:raise ValueError('unsafe checksum path')
  result[path]=digest
 return result

class References(HTMLParser):
 def __init__(self):super().__init__();self.refs=[];self.ids=[]
 def handle_starttag(self,tag,attrs):
  attrs=dict(attrs)
  if 'id' in attrs:self.ids.append(attrs['id'])
  for key in ('src','href'):
   if key in attrs:self.refs.append(attrs[key])

def check_reference(site,origin,value):
 parsed=urlsplit(value)
 if parsed.scheme or parsed.netloc or not parsed.path:return
 path=unquote(parsed.path)
 if path.startswith('/'):raise ValueError(f'root-relative reference breaks project Pages: {value}')
 dest=(origin.parent/path).resolve()
 if not dest.is_relative_to(site.resolve()) or not dest.is_file():raise ValueError(f'missing/unsafe reference in {origin.name}: {value}')

def check_png(data,path):
 if not data.startswith(b'\x89PNG\r\n\x1a\n'):raise ValueError(f'PNG signature: {path}')
 offset=8;dimensions=None;ended=False
 while offset<len(data):
  if offset+12>len(data):raise ValueError(f'truncated PNG: {path}')
  length=struct.unpack('>I',data[offset:offset+4])[0];kind=data[offset+4:offset+8];end=offset+8+length
  if end+4>len(data) or zlib.crc32(data[offset+4:end])&0xffffffff!=struct.unpack('>I',data[end:end+4])[0]:raise ValueError(f'PNG chunk integrity: {path}')
  if kind==b'IHDR':dimensions=struct.unpack('>II',data[offset+8:offset+16])
  offset=end+4
  if kind==b'IEND':ended=True;break
 if not ended or not dimensions or min(dimensions)<=0 or offset!=len(data):raise ValueError(f'incomplete PNG: {path}')
 return dimensions

def validate_site(root):
 root=Path(root).resolve();site=root/'site';expected=manifest(root,'deployed-files.sha256');assets=manifest(root,'assets.sha256')
 actual={'site/'+p.relative_to(site).as_posix() for p in site.rglob('*') if p.is_file()}
 if actual!=set(expected):raise ValueError(f'site inventory mismatch: missing={sorted(set(expected)-actual)}, unexpected={sorted(actual-set(expected))}')
 if assets!={p:d for p,d in expected.items() if p.startswith('site/assets/')}:raise ValueError('asset checksum manifests disagree')
 pngs=0
 for name,digest in expected.items():
  path=root/name
  if path.is_symlink() or any(p.is_symlink() for p in path.parents if p.is_relative_to(root)):raise ValueError(f'symlink in source: {name}')
  data=path.read_bytes()
  if hashlib.sha256(data).hexdigest()!=digest:raise ValueError(f'baseline checksum mismatch: {name}')
  if path.suffix=='.png':check_png(data,name);pngs+=1
  elif path.suffix=='.html':
   parser=References();parser.feed(data.decode());
   if len(parser.ids)!=len(set(parser.ids)):raise ValueError(f'duplicate control ids: {name}')
   for ref in parser.refs:check_reference(site,path,ref)
  elif path.suffix=='.js':
   text=data.decode()
   for ref in re.findall(r'\bfrom\s+[\"\']([^\"\']+)[\"\']',text):check_reference(site,path,ref)
   match=re.search(r'assetNames\s*=\s*(\[[^\]]+\])',text)
   if match:
    for name in ast.literal_eval(match.group(1)):check_reference(site,path,f'assets/{name}.png')
  elif path.suffix=='.css':
   for ref in re.findall(r'url\([\"\']?([^\)\"\']+)',data.decode()):check_reference(site,path,ref)
  elif path.suffix=='.json':json.loads(data)
 for name in ['index.html','app.js','world.js','scene.js','style.css']:
  if not (site/name).is_file():raise ValueError(f'missing entry point: {name}')
 return {'files':len(expected),'assets':len(assets),'pngs':pngs}

if __name__=='__main__':
 try:print('Validated:',validate_site(Path(__file__).resolve().parents[1]))
 except (ValueError,OSError) as error:raise SystemExit(str(error))
