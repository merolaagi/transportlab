import http.server, json, os
from pathlib import Path
root=Path(__file__).resolve().parent
os.chdir(root/'dist')
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),http.server.SimpleHTTPRequestHandler)
(root/'.preview.json').write_text(json.dumps({'port':server.server_port,'pid':os.getpid()}))
print(f'http://127.0.0.1:{server.server_port}',flush=True)
server.serve_forever()
