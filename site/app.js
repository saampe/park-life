import {initialWorld,addEmails,advanceWorld,chooseActivity,stockholm,safeLoad,randomFor,remember,livingMoment,resumeWorld,activityDetails} from './world.js';
import {ParkScene,assetUrl} from './scene.js';
const $=id=>document.getElementById(id);
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('unavailable');}};}
const KEY='park-life-world-v1';let world=safeLoad(storage,KEY);const before=world.lastSeen;
let sim=null,options={hour:null,season:'auto',weather:'clear',busyHours:0},follow=true;
const motionQuery=matchMedia('(prefers-reduced-motion: reduce)');let reduced=motionQuery.matches;
try{reduced=JSON.parse(storage.getItem('park-life-gentle-motion'))??reduced;}catch{}
$('motion').checked=reduced;
function context(){let local=stockholm();if(options.season!=='auto')local={...local,month:{spring:3,summer:6,autumn:9,winter:12}[options.season],day:21};return {...local,local,hour:options.hour??local.hour+local.minute/60,season:options.season==='auto'?local.season:options.season,weather:options.weather,busyHours:options.busyHours};}
advanceWorld(world,Date.now(),context());
let current=activityDetails(world.activity,context());let activeKind=world.activity||'wander';
const scene=new ParkScene($('world'),place=>{$('view').setAttribute('aria-label',place==='inside'?'Look outside in the park':'Look inside the house');$('view').title=place==='inside'?'Look outside':'Look inside';});
scene.reduced=reduced;
const active=()=>sim||world;
function beginSim(){if(sim)return;sim=structuredClone(world);$('sim-return').hidden=false;}
let noticeTimer;
function notice(text,duration=7000){clearTimeout(noticeTimer);$('notice').textContent=text;$('notice').hidden=false;noticeTimer=setTimeout(()=>$('notice').hidden=true,duration);}
$('notice').addEventListener('click',()=>$('notice').hidden=true);
function save(){try{storage.setItem(KEY,JSON.stringify(world));$('save-status').textContent=sim?'Trying a day · Your saved world is untouched':'Saved on this device · No accounts connected';}catch{$('save-status').textContent='Saving is unavailable here · Your world lasts for this visit';}}
function renderJournal(){
 const w=active(),j=$('journal');j.replaceChildren();
 const rows=w.journal.length?w.journal:[{text:'An ordinary afternoon. He seems to have plans of his own.',at:w.lastSeen}];
 rows.slice(0,8).forEach(item=>{const p=document.createElement('p');p.textContent=item.text;const time=document.createElement('time');time.dateTime=new Date(item.at).toISOString();time.textContent=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Stockholm',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(item.at));p.append(time);j.append(p);});
 $('journal-count').textContent=w.journal.length?`· ${w.journal.length}`:'';
 $('possessions').textContent=w.inventory.length?`Around the house: ${[...new Set(w.inventory)].join(', ')}.`:'Nothing new to put away. A perfectly good state of affairs.';
}
function update(){const ctx=context(),w=active();scene.set({...ctx,world:w});
 $('time-label').value=`${String(Math.floor(ctx.hour)).padStart(2,'0')}:${String(Math.round(ctx.hour%1*60)).padStart(2,'0')}${options.hour===null?' · local':''}`;
 $('hour').value=ctx.hour;$('busy-label').value=`${options.busyHours} ${options.busyHours===1?'hour':'hours'}`;
 $('busy-description').textContent=options.busyHours>=4?'A full day. He might find a project to get absorbed in.':'A quiet day. Plenty of time to wander.';
 $('email-progress').textContent=`${w.emailRemainder} of 5 toward the next parcel.`;$('parcel-count').textContent=`${w.parcels} ${w.parcels===1?'parcel':'parcels'}`;
 $('activity-label').textContent=current.label;$('current-moment').textContent=current.label+'.';$('follow').textContent=`Follow him: ${follow?'on':'off'}`;$('follow').setAttribute('aria-pressed',String(follow));
 renderJournal();save();
}
function newMoment({record=false}={}){const w=active();current=chooseActivity(context(),randomFor(w));activeKind=current.kind;w.activity=activeKind;scene.act(current);if(record)remember(w,current.label+'.');update();}
function returnWorld(){sim=null;options={hour:null,season:'auto',weather:'clear',busyHours:0};$('live-time').checked=true;$('season').value='auto';$('weather').value='clear';$('busy').value='0';$('sim-return').hidden=true;advanceWorld(world,Date.now(),context());current=activityDetails(world.activity,context());activeKind=current.kind;scene.act(current);update();notice('Back to his little life. Your test day stays a what-if.');}
function openPanel(journal=false){if(!$('controls').open)$('controls').showModal();if(journal){$('journal-details').open=true;requestAnimationFrame(()=>$('journal-details').scrollIntoView({block:'start',behavior:reduced?'instant':'smooth'}));}update();}
$('try').addEventListener('click',()=>openPanel());$('life').addEventListener('click',()=>openPanel(true));$('close').addEventListener('click',()=>$('controls').close());
$('controls').addEventListener('click',event=>{if(event.target!==$('controls'))return;const r=$('controls').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('controls').close();});
$('view').addEventListener('click',()=>{scene.previewHome();});
$('hour').addEventListener('input',()=>{beginSim();options.hour=Number($('hour').value);$('live-time').checked=false;update();});
$('hour').addEventListener('change',()=>newMoment());
$('live-time').addEventListener('change',()=>{beginSim();options.hour=$('live-time').checked?null:Number($('hour').value);newMoment();});
$('weather').addEventListener('change',()=>{beginSim();options.weather=$('weather').value;newMoment();});
$('season').addEventListener('change',()=>{beginSim();options.season=$('season').value;update();});
$('busy').addEventListener('input',()=>{beginSim();options.busyHours=Number($('busy').value);update();});
$('busy').addEventListener('change',()=>newMoment());
for(const [id,count]of [['one-email',1],['five-emails',5]])$(id).addEventListener('click',()=>{
 beginSim();const deliveries=addEmails(active(),count);if(deliveries){scene.deliver(deliveries);notice('A parcel is on its way. The fish has a system.');}else notice(`${active().emailRemainder} new emails. The fish is waiting for five.`,4000);update();
});
$('come-back').addEventListener('click',()=>{beginSim();const w=active(),old=w.changes,hours=Number($('away').value);advanceWorld(w,w.lastSeen+hours*36e5,context());newMoment();notice(w.changes>old?'While you were away, he made a few small changes.':'He had a perfectly ordinary time. Nothing needed changing.',9000);});
$('choose').addEventListener('click',()=>{beginSim();newMoment({record:true});notice(current.label+'.',5000);});
$('follow').addEventListener('click',()=>{follow=!follow;scene.follow=follow;if(follow)scene.act(current);update();});
$('motion').addEventListener('change',()=>{reduced=$('motion').checked;scene.reduced=reduced;try{storage.setItem('park-life-gentle-motion',JSON.stringify(reduced));}catch{}});
$('sim-return').addEventListener('click',returnWorld);$('return-world').addEventListener('click',()=>{returnWorld();$('controls').close();});
// Rasterized controls are part of the approved artwork; their buttons remain native and accessible.
for(const [id,name]of [['view','home-button'],['try','try-button']])$(id).querySelector('img').src=assetUrl(name);
update();
scene.load().then(()=>{
 $('loading').hidden=true;
 if(new URLSearchParams(location.search).get('art')!=='approved')scene.act(current);if(before<Date.now()-6*36e5)notice(world.journal[0]?.text||'He kept himself occupied. An uneventful chapter is still a chapter.',9000);
 const params=new URLSearchParams(location.search);if(params.get('art')==='approved'){beginSim();options.hour=14;options.season='summer';options.weather='clear';scene.reduced=true;update();}
}).catch(error=>{$('loading').textContent='The artwork could not be loaded. Please reopen the app or refresh.';console.error(error);});
let ticks=0;
setInterval(()=>{if(document.hidden)return;ticks++;if(livingMoment(active(),activeKind)){update();if(!$('controls').open)notice('He seems to have made a small improvement.');}if(Math.random()<1/38&&!$('controls').open)newMoment();if(!sim)world.lastSeen=Date.now();if(ticks%15===0)save();if(ticks%10===0)update();},1000);
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(!sim)world.lastSeen=Date.now();save();}else{resumeWorld(world,Date.now(),context(),!!sim);if(!sim){current=activityDetails(world.activity,context());activeKind=current.kind;scene.act(current);}update();}});
window.addEventListener('pagehide',()=>{if(!sim)world.lastSeen=Date.now();save();});
// Read-only snapshots support local verification without exposing account data.
window.parkLife={snapshot:()=>structuredClone({world:active(),context:context(),simulation:!!sim,place:scene.place}),ready:()=>$('world').dataset.ready==='true'};
