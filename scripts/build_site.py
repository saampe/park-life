"""Copy verified source to a dedicated Pages artifact; no bundling or asset rewriting."""
import argparse,shutil
from pathlib import Path
from validate import validate_site

def build_site(root,output):
 root=Path(root).resolve();raw=Path(output);output=raw.resolve()
 if raw.is_symlink() or output.parent!=root or not (output.name=='_site' or output.name.startswith('_site-')):raise ValueError('build output must be a dedicated _site or _site-* directory directly under repository root')
 validate_site(root)
 if output.exists():
  if not output.is_dir():raise ValueError('build output is not a directory')
  shutil.rmtree(output)
 shutil.copytree(root/'site',output,symlinks=False)
 (output/'.nojekyll').touch()
 source={p.relative_to(root/'site').as_posix():p.read_bytes() for p in (root/'site').rglob('*') if p.is_file()}
 built={p.relative_to(output).as_posix():p.read_bytes() for p in output.rglob('*') if p.is_file() and p.name!='.nojekyll'}
 if source!=built:raise ValueError('staged artifact differs from source')
 return output

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--output',default='_site');args=parser.parse_args();root=Path(__file__).resolve().parents[1]
 try:print('Staged:',build_site(root,root/args.output))
 except (ValueError,OSError) as error:raise SystemExit(str(error))
