import argparse,functools,http.server,pathlib
p=argparse.ArgumentParser();p.add_argument('--host',default='0.0.0.0');p.add_argument('--port',type=int,default=4173);p.add_argument('--strictPort',action='store_true');args=p.parse_args()
root=pathlib.Path(__file__).parent/'dist'
class Handler(http.server.SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header('Cache-Control','no-cache');super().end_headers()
server=http.server.ThreadingHTTPServer((args.host,args.port),functools.partial(Handler,directory=str(root)))
print(f'Park Life: http://{args.host}:{args.port}/',flush=True)
server.serve_forever()
