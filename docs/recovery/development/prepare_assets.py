from pathlib import Path
from PIL import Image,ImageDraw,ImageFilter
from scipy import ndimage as ndi
import numpy as np,json,shutil
root=Path('/workspace/park-life/dist/assets');root.mkdir(parents=True,exist_ok=True)
base=Image.open('/workspace/approved-art/park-life-approved.png').convert('RGB');raw=Image.open('/workspace/generated_images/exec-21d7431c-aa80-40fa-9708-14e7496390a9.png').convert('RGB').resize(base.size)
a=np.asarray(base).astype(int);h,w=a.shape[:2]
def sprite(name,roi,seed,extras=[]):
 r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];cand=((abs(g-r)<35)&(abs(b-g)<35)&(b>=g-10)&(g>=r-10))|(a.max(axis=2)<65)
 allow=np.zeros((h,w),bool);x0,y0,x1,y1=roi;allow[y0:y1,x0:x1]=True
 labels,n=ndi.label(cand&allow);m=labels==labels[seed[1],seed[0]]
 m&=allow
 for box in extras:
  x0,y0,x1,y1=box;m[y0:y1,x0:x1]|=(a.max(axis=2)[y0:y1,x0:x1]<65)
 m=ndi.binary_fill_holes(m);m=ndi.binary_dilation(m,iterations=1)
 if name=='shark':
  m[459:468,294:310]=False
  sh=Image.new('L',base.size);ImageDraw.Draw(sh).ellipse((230,1005,432,1031),fill=255);m|=np.asarray(sh)>0
 alpha=np.uint8(m)*255
 rgba=base.convert('RGBA');rgba.putalpha(Image.fromarray(alpha));box=(229,459,470,1032) if name=='shark' else rgba.getbbox();rgba.crop(box).save(root/(name+'.png'))
 return m,{'x':box[0],'y':box[1],'w':box[2]-box[0],'h':box[3]-box[1]}
sm,sbox=sprite('shark',(230,460,477,1033),(294,655),[(338,462,365,484),(370,460,398,483)])
fm,fbox=sprite('fish',(497,533,713,687),(556,599))
mask=np.uint8(ndi.binary_dilation(sm|fm,iterations=3))*255;mi=Image.fromarray(mask);d=ImageDraw.Draw(mi);d.rectangle((20,957,98,1034),fill=255);d.rectangle((1255,955,1475,1035),fill=255)
Image.composite(raw,base,mi).save(root/'park.png')
shutil.copyfile('/workspace/approved-art/park-life-approved.png',root/'approved.png')
shutil.copyfile('/workspace/approved-art/interior.png',root/'interior.png')
shutil.copyfile('/workspace/approved-art/winter.png',root/'winter.png')
# Autumn derives directly from the approved plate, retaining every line and shape.
p=np.array(Image.open(root/'park.png')).astype(float);r,g,b=p[:,:,0],p[:,:,1],p[:,:,2]
foliage=(g>r*1.04)&(g>b*1.2)&(np.indices((h,w))[0]<h*.52)&((np.indices((h,w))[1]<550)|((np.indices((h,w))[1]<700)&(np.indices((h,w))[0]<280))|(np.indices((h,w))[1]>1440))
p[foliage,0]=np.minimum(236,r[foliage]*1.25+15);p[foliage,1]=g[foliage]*.76;p[foliage,2]=b[foliage]*.7
Image.fromarray(np.uint8(np.clip(p,0,255))).save(root/'autumn.png')
(root/'sprites.json').write_text(json.dumps({'shark':sbox,'fish':fbox}))
print(json.dumps({'shark':sbox,'fish':fbox,'exterior_size':base.size}))
