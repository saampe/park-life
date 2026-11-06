"""HTTP smoke checks under GitHub Pages' /park-life/ prefix. Not browser/visual QA."""
import functools,http.server,threading,urllib.request,tempfile,shutil
from pathlib import Path

def check_pages(root):
 root=Path(root).resolve();site=root/'_site'
 if not (site/'.nojekyll').is_file():raise ValueError('run the source build first')
 with tempfile.TemporaryDirectory() as tmp:
  dest=Path(tmp)/'park-life';shutil.copytree(site,dest)
  class QuietHandler(http.server.SimpleHTTPRequestHandler):
   def log_message(self,*args):pass
  handler=functools.partial(QuietHandler,directory=tmp)
  with http.server.ThreadingHTTPServer(('127.0.0.1',0),handler) as server:
   worker=threading.Thread(target=server.serve_forever,daemon=True);worker.start()
   try:
    base=f'http://127.0.0.1:{server.server_address[1]}/park-life/'
    paths=[p for p in site.rglob('*') if p.is_file()];total=0
    for path in paths:
     rel=path.relative_to(site).as_posix()
     with urllib.request.urlopen(base+rel,timeout=10) as response:
      if response.status!=200 or response.read()!=path.read_bytes():raise ValueError(f'HTTP bytes mismatch: {rel}')
      if path.suffix=='.js' and response.headers.get_content_type() not in ('text/javascript','application/javascript'):raise ValueError(f'wrong module MIME: {rel}')
     total+=1
    with urllib.request.urlopen(base,timeout=10) as response:
     if response.read()!=(site/'index.html').read_bytes():raise ValueError('index route mismatch')
    return total
   finally:server.shutdown();worker.join(timeout=5)

if __name__=='__main__':print(f'HTTP project-prefix routes passed: {check_pages(Path(__file__).resolve().parents[1])} files plus index route. Browser/visual QA not performed.')
