import {daylight,ITEMS} from './world.js';
const W=1487,H=1058;
const assetNames=['park','autumn','winter','interior','shark','shark-body','left-leg','right-leg','fish','objects','leaf'];
export const assetUrl=name=>window.PARK_ASSETS?.[name]||`assets/${name}.png`;
export class ParkScene{
 constructor(canvas,onPlace){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.onPlace=onPlace;this.images={};this.place='outside';this.targetPlace='outside';this.actor={x:330,y:1032,s:1};this.target={...this.actor};this.follow=true;this.reduced=false;this.model={hour:14,season:'summer',weather:'clear',world:{inventory:[],changes:0},local:{year:2026,month:7,day:1}};this.particles=Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,v:1+Math.random()*2,r:1+Math.random()*3}));this.last=0;this.t=0;this.deliveryUntil=0;this.fishIntro=12;this.fade=0;this.stopped=false;}
 async load(){await Promise.all(assetNames.map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{this.images[name]=img;resolve();};img.onerror=()=>reject(new Error(`Couldn't load ${name}`));img.src=assetUrl(name);})));this.canvas.dataset.ready='true';requestAnimationFrame(t=>this.frame(t));}
 set(model){this.model=model;}
 setPlace(place){if(this.targetPlace===place)return;this.targetPlace=place;this.fade=1;}
 deliver(count=1){this.deliveryUntil=this.t+9+Math.min(count-1,3)*2;}
 act(activity){
  if(this.follow)this.setPlace(activity.place);
  const inside=activity.place==='inside';
  if(inside)this.target={x:activity.kind==='tinker'?470:420+Math.random()*120,y:1000,s:.88};
  else if(activity.kind==='porch')this.target={x:850,y:652,s:.38};
  else if(activity.kind==='garden')this.target={x:1090,y:900,s:.7};
  else this.target={x:330+Math.random()*720,y:860+Math.random()*160,s:.75+Math.random()*.2};
 }
 previewHome(){this.setPlace(this.targetPlace==='outside'?'inside':'outside');if(this.targetPlace==='inside'){this.actor={x:450,y:1000,s:.88};this.target={...this.actor};}else{this.actor={x:330,y:1032,s:1};this.target={...this.actor};}}
 sprite(name,x,y,scale=1,angle=0,pivot={x:330,y:1032}){
  const c=this.ctx;c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(angle);c.drawImage(this.images[name],229-pivot.x,459-pivot.y);c.restore();
 }
 frame(ms){if(this.stopped)return;const dt=Math.min((ms-this.last)/1000||0,.06);this.last=ms;this.t+=dt;this.draw(dt);requestAnimationFrame(t=>this.frame(t));}
 draw(dt=0){
  const c=this.ctx,m=this.model;const inside=this.place==='inside';
  if(this.fade>0){this.fade-=dt*2.2;if(this.fade<.5&&this.place!==this.targetPlace){this.place=this.targetPlace;this.actor=this.place==='inside'?{x:450,y:1000,s:.88}:{x:330,y:1032,s:1};if(this.place==='outside'&&this.target.s===.88)this.target={...this.actor};this.onPlace?.(this.place);}}
  const bg=this.place==='inside'?'interior':m.season==='winter'?'winter':m.season==='autumn'?'autumn':'park';
  c.save();c.clearRect(0,0,W,H);c.filter=m.season==='spring'&&this.place==='outside'?'saturate(1.08) brightness(1.02)':'none';c.drawImage(this.images[bg],0,0,W,H);c.filter='none';
  const actualInside=this.place==='inside';
  const dx=this.target.x-this.actor.x,dy=this.target.y-this.actor.y;const moving=Math.hypot(dx,dy)>3;
  const speed=this.reduced?.45:.65;const k=1-Math.exp(-dt*speed);this.actor.x+=dx*k;this.actor.y+=dy*k;this.actor.s+=(this.target.s-this.actor.s)*k;
  const bob=this.reduced?0:Math.sin(this.t*(moving?9:1.6))*(moving?2.5:.65);
  const step=moving&&!this.reduced?Math.sin(this.t*7)*.052:0;
  // Each leg is extracted from the approved raster; the arm stays untouched.
  for(const [name,pivot,angle]of [['left-leg',{x:309,y:835},step],['right-leg',{x:341,y:835},-step]]){
   c.save();c.translate(this.actor.x,this.actor.y+bob);c.scale(this.actor.s,this.actor.s);c.translate(pivot.x-330,pivot.y-1032);c.rotate(angle);c.drawImage(this.images[name],229-pivot.x,459-pivot.y);c.restore();
  }
  this.sprite('shark-body',this.actor.x,this.actor.y+bob,this.actor.s,this.reduced?0:Math.sin(this.t*1.3)*.0018);
  // Game-selected parcels become little objects in the yard or living room.
  const possessions=m.world.inventory.slice(-5);if(m.world.changes>0)possessions.push(ITEMS[m.world.changes%ITEMS.length]);
  possessions.slice(-6).forEach((item,i)=>{const index=Math.max(0,ITEMS.indexOf(item));const col=index%4,row=Math.floor(index/4);const sheet=this.images.objects;
   const x=actualInside?650+i*90:510+i*105,y=actualInside?930:875+(i%2)*34;const sz=actualInside?95:75;
   c.drawImage(sheet,col*sheet.width/4,row*sheet.height/2,sheet.width/4,sheet.height/2,x-sz/2,y-sz,sz,sz*1.2);
  });
  if(!actualInside){const delivery=this.deliveryUntil>this.t;const intro=this.t<this.fishIntro;
   if(delivery||intro){const prog=delivery?Math.max(0,Math.min(1,(this.deliveryUntil-this.t)/9)):1;const travel=delivery?(prog>.5?(prog-.5)*1800:0):0;const fy=535+(this.reduced?0:Math.sin(this.t*2.4)*7);
    c.save();c.translate(507+travel,fy);c.rotate(this.reduced?0:Math.sin(this.t*1.5)*.015);c.drawImage(this.images.fish,0,0,200,149);c.restore();}
  }
  const {sunrise,sunset}=daylight(m.local);const hr=m.hour;let darkness=hr<sunrise-1||hr>sunset+1?.49:hr<sunrise+.7||hr>sunset-.7?.16:0;
  if(m.weather==='cloudy')darkness+=.07;if(m.weather==='rain')darkness+=.14;if(m.weather==='storm')darkness+=.24;
  if(actualInside)darkness*=.55;
  if(darkness>0){c.fillStyle=`rgba(22,35,67,${darkness})`;c.fillRect(0,0,W,H);}
  if(hr>=sunset-.5||hr<sunrise+.2){c.save();c.globalCompositeOperation='screen';c.fillStyle=actualInside?'rgba(248,181,85,.12)':'rgba(255,196,97,.28)';if(actualInside)c.fillRect(0,0,W,H);else for(const [x,y,w,h]of [[732,290,40,60],[906,293,44,59],[950,292,47,57],[1019,293,42,58],[731,433,78,72],[1150,436,70,75],[846,72,37,55]])c.fillRect(x,y,w,h);c.restore();}
  if(hr>=sunrise-1&&hr<sunrise+1||hr>sunset-1&&hr<=sunset+1){c.fillStyle='rgba(239,155,99,.07)';c.fillRect(0,0,W,H);}
  if(!this.reduced){
   c.save();if(actualInside){c.beginPath();c.rect(80,180,350,295);c.clip();}
   const snow=m.season==='winter'&&(m.weather==='rain'||m.weather==='storm'||m.weather==='cloudy');const rain=!snow&&(m.weather==='rain'||m.weather==='storm');const leaves=m.season==='autumn'&&!rain&&!snow;
   const count=snow?60:rain?(m.weather==='storm'?80:50):leaves?15:0;
   for(let i=0;i<count;i++){const p=this.particles[i];p.y+=dt*(rain?650:30)*p.v;p.x+=dt*(rain?-140:snow?18:30);if(p.y>H+30){p.y=-30;p.x=Math.random()*W;}if(p.x<0)p.x=W;
    if(rain){c.strokeStyle='rgba(192,215,230,.64)';c.lineWidth=1.8;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x-5,p.y+18);c.stroke();}
    else if(snow){c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill();}
    else{c.save();c.translate(p.x,p.y);c.rotate(this.t*.7+i);c.filter='sepia(1) saturate(1.7)';c.drawImage(this.images.leaf,-8,-12,16,24);c.restore();}
   }c.restore();
   if(m.weather==='storm'&&Math.sin(this.t*.7)>.998){c.fillStyle='rgba(221,233,243,.12)';c.fillRect(0,0,W,H);}
  }
  if(this.fade>0){c.fillStyle=`rgba(32,40,34,${Math.max(0,1-Math.abs(this.fade-.5)*2)*.8})`;c.fillRect(0,0,W,H);}
  c.restore();
 }
}
