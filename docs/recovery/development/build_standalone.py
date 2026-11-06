from pathlib import Path
import base64,json,re
root=Path(__file__).parent;dist=root/'dist'
html=(dist/'index.html').read_text()
css=(dist/'style.css').read_text()
assets={p.stem:'data:image/png;base64,'+base64.b64encode(p.read_bytes()).decode() for p in (dist/'assets').glob('*.png') if p.stem!='approved'}
code='\n'.join(re.sub(r'^export ', '', re.sub(r'^import[^\n]*\n','', (dist/name).read_text(),flags=re.M),flags=re.M) for name in ['world.js','scene.js','app.js'])
# Artwork is embedded; opening this file makes no external source requests.
for name in ['home-button','try-button']:html=html.replace('src="assets/'+name+'.png"','src="'+assets[name]+'"')
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+css+'</style>')
html=html.replace('<script type="module" src="app.js"></script>','<script>window.PARK_ASSETS='+json.dumps(assets,separators=(',',':'))+';</script>\n<script type="module">'+code+'</script>')
out=root.parent/'Park-Life.html';out.write_text(html)
(root/'standalone-syntax.mjs').write_text(code)
print(f'Self-contained app: {out} ({out.stat().st_size:,} bytes)')
