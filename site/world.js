export const ITEMS=['a slightly wonky fern','a tiny record player','a very ordinary rock','a striped porch cushion','a mysterious garden gnome','an ambitious tomato plant','a secondhand lamp','a suspiciously fancy shell'];
export function initialWorld(now=Date.now(),seed=314159){return {version:1,seed:seed>>>0,lastSeen:now,parcels:0,emailRemainder:0,inventory:[],journal:[],activity:'wander',changes:0};}
export function randomFor(world){return ()=>{let x=world.seed||1234567;x^=x<<13;x^=x>>>17;x^=x<<5;world.seed=x>>>0;return world.seed/4294967296;};}
export function remember(world,text,now=Date.now()){world.journal.unshift({text,at:now});world.journal=world.journal.slice(0,16);}
export function addEmails(world,count){
 if(typeof count!=='number'||!Number.isSafeInteger(count)||count<0)return 0;
 const total=world.emailRemainder+count;const deliveries=Math.floor(total/5);world.emailRemainder=total%5;world.parcels+=deliveries;
 const rng=randomFor(world);for(let i=0;i<Math.min(deliveries,12);i++){const item=ITEMS[Math.floor(rng()*ITEMS.length)];world.inventory.push(item);remember(world,`A parcel brought ${item}.`);}
 world.inventory=world.inventory.slice(-12);return deliveries;
}
export function stockholm(date=new Date()){
 const parts=Object.fromEntries(new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Stockholm',hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'}).formatToParts(date).map(p=>[p.type,p.value]));
 const month=Number(parts.month),hour=Number(parts.hour),minute=Number(parts.minute);return {year:Number(parts.year),month,day:Number(parts.day),hour,minute,season:month<3||month===12?'winter':month<6?'spring':month<9?'summer':'autumn'};
}
export function daylight(local){
 const day=(Date.UTC(local.year,local.month-1,local.day)-Date.UTC(local.year,0,0))/864e5;
 const declination=-23.44*Math.cos(2*Math.PI*(day+10)/365)*Math.PI/180;
 const length=24*Math.acos(Math.max(-1,Math.min(1,-Math.tan(59.3293*Math.PI/180)*Math.tan(declination))))/Math.PI;
 const utcDate=new Date(Date.UTC(local.year,local.month-1,local.day,12));const offset=stockholm(utcDate).hour-12;const noon=12+offset-18.0686/15;
 return {sunrise:noon-length/2,sunset:noon+length/2};
}
const ACT={wander:{kind:'wander',place:'outside',label:'Taking the long way around'},garden:{kind:'garden',place:'outside',label:'Checking on an ambitious plant'},porch:{kind:'porch',place:'outside',label:'Doing very little on the porch'},tinker:{kind:'tinker',place:'inside',label:'Working on something of questionable usefulness'},read:{kind:'read',place:'inside',label:'Reading absolutely nothing urgent'},rest:{kind:'rest',place:'inside',label:'Taking his afternoon seriously'},sleep:{kind:'sleep',place:'inside',label:'Calling it a day'}};
export function chooseActivity(context={},rng=Math.random){
 const hour=context.hour??14;if(hour<6||hour>=23)return ACT.sleep;
 let choices=context.busyHours>=4?[['tinker',.55],['garden',.15],['read',.2],['porch',.1]]:[['garden',.22],['wander',.38],['porch',.18],['read',.12],['rest',.1]];
 if(context.weather==='rain'||context.weather==='storm')choices=[['read',.35],['tinker',.3],['rest',.25],['porch',.1]];
 if(hour>=20)choices=[['read',.45],['rest',.4],['porch',.15]];
 let draw=rng();for(const [key,weight]of choices){draw-=weight;if(draw<0)return ACT[key];}return ACT[choices.at(-1)[0]];
}
const CHANGES=['He rearranged the porch chair. He seems pleased.','A small plant has appeared beside the house.','He found an interesting rock. It is mostly rock.','The living-room cushion has migrated again.','A very modest garden project is underway.'];
export function advanceWorld(world,now,context={},rng=randomFor(world)){
 if(!Number.isFinite(now)||now<=world.lastSeen)return world;
 const hours=Math.min((now-world.lastSeen)/36e5,24*14);const opportunities=Math.min(24,Math.floor(hours/3));
 for(let i=0;i<opportunities;i++)if(rng()<0.14){remember(world,CHANGES[Math.floor(rng()*CHANGES.length)],now);world.changes++;}
 world.activity=chooseActivity(context,rng).kind;world.lastSeen=now;world.journal=world.journal.slice(0,16);return world;
}
const usableDate=value=>Number.isFinite(value)&&Math.abs(value)<=8640000000000000;
export function safeLoad(storage,key,now=Date.now()){
 try {const w=JSON.parse(storage.getItem(key));if(w?.version===1&&Number.isSafeInteger(w.parcels)&&w.parcels>=0&&Number.isInteger(w.emailRemainder)&&w.emailRemainder>=0&&w.emailRemainder<5&&usableDate(w.lastSeen)&&Array.isArray(w.inventory)&&Array.isArray(w.journal)&&Number.isInteger(w.seed))return {...w,lastSeen:Math.min(w.lastSeen,now),inventory:w.inventory.filter(i=>typeof i==='string').slice(-12),journal:w.journal.filter(i=>typeof i?.text==='string'&&usableDate(i?.at)).slice(0,16)};}catch{}
 return initialWorld(now,Math.floor(Math.random()*4294967295));
}
export function livingMoment(world,activity,rng=Math.random){
 if(!['garden','tinker'].includes(activity)||rng()>=1/480)return false;
 world.changes++;
 remember(world,activity==='garden'?'A very modest garden project is underway.':'He rearranged something indoors. It apparently works better now.');
 return true;
}
export function resumeWorld(world,now,context,simulationActive){return simulationActive?world:advanceWorld(world,now,context);}
export function activityDetails(kind,context={},rng=Math.random){return ACT[kind]||chooseActivity(context,rng);}
