import test from 'node:test';
import assert from 'node:assert/strict';
import {initialWorld,addEmails,advanceWorld,chooseActivity,stockholm,safeLoad} from '../site/world.js';
const now=Date.parse('2026-11-06T12:00:00Z');
test('five new email arrivals deliver once with remainder across updates',()=>{
 const w=initialWorld(now,123);addEmails(w,4);assert.equal(w.parcels,0);addEmails(w,3);assert.equal(w.parcels,1);assert.equal(w.emailRemainder,2);addEmails(w,13);assert.equal(w.parcels,4);assert.equal(w.emailRemainder,0);
});
test('invalid counts cannot create or remove parcels',()=>{
 const w=initialWorld(now,1);for(const n of [-10,NaN,Infinity,'5',1.5])addEmails(w,n);assert.equal(w.parcels,0);assert.equal(w.emailRemainder,0);
});
test('a busy calendar changes likelihood rather than ordering an activity',()=>{
 const quiet=chooseActivity({hour:14,busyHours:0,weather:'clear'},()=>0.4);
 const busy=chooseActivity({hour:14,busyHours:4,weather:'clear'},()=>0.4);
 assert.equal(quiet.kind,'wander');assert.equal(busy.kind,'tinker');
 assert.equal(chooseActivity({hour:2,busyHours:8,weather:'clear'},()=>0.4).kind,'sleep');
});
test('absence can leave nothing significant changed and never introduces care penalties',()=>{
 const w=initialWorld(now,22);const before=JSON.stringify(w.inventory);advanceWorld(w,now+3600e3,{hour:14,busyHours:0,weather:'clear'},()=>0.99);assert.equal(JSON.stringify(w.inventory),before);assert.ok(!('loneliness' in w));assert.ok(!('hunger' in w));assert.equal(w.lastSeen,now+3600e3);
});
test('catch-up remains bounded after years and does not replay backward time',()=>{
 const w=initialWorld(now,42);advanceWorld(w,now+365*86400e3,{hour:14,busyHours:0,weather:'clear'},()=>0.1);assert.ok(w.journal.length<=16);assert.ok(w.inventory.length<=12);const seen=w.lastSeen;advanceWorld(w,now,{},()=>0.1);assert.equal(w.lastSeen,seen);
});
test('Stockholm uses local date and seasonal month across UTC midnight and DST',()=>{
 assert.equal(stockholm(new Date('2026-03-31T22:30:00Z')).month,4);
 assert.equal(stockholm(new Date('2026-06-01T12:00:00Z')).hour,14);
 assert.equal(stockholm(new Date('2026-12-01T12:00:00Z')).hour,13);
 assert.equal(stockholm(new Date('2026-12-01T12:00:00Z')).season,'winter');
});
test('corrupt or unavailable storage safely creates a local world',()=>{
 for(const storage of [{getItem(){throw Error('blocked')}},{getItem(){return 'broken'}},{getItem(){return '{"version":1,"parcels":"oops"}'}}]){
  const w=safeLoad(storage,'world',now);assert.equal(w.parcels,0);assert.equal(w.lastSeen,now);
 }
});
test('a warm spring day has longer daylight than Stockholm winter',async()=>{
 const {daylight}=await import('../site/world.js');const summer=daylight({year:2026,month:6,day:21}),winter=daylight({year:2026,month:12,day:21});assert.ok(summer.sunset-summer.sunrise>18);assert.ok(winter.sunset-winter.sunrise<7);
});
test('small autonomous changes are possible while watching but never compulsory',async()=>{
 const {livingMoment}=await import('../site/world.js');const w=initialWorld(now,21);assert.equal(livingMoment(w,'garden',()=>.99),false);assert.equal(w.changes,0);assert.equal(livingMoment(w,'garden',()=>.001),true);assert.equal(w.changes,1);assert.ok(w.journal[0].text.includes('garden'));assert.equal(livingMoment(w,'sleep',()=>0),false);
});
test('switching tabs in a simulation cannot mutate the saved real world',async()=>{
 const {resumeWorld}=await import('../site/world.js');const w=initialWorld(now,1),before=structuredClone(w);resumeWorld(w,now+24*36e5,{hour:2,busyHours:10,weather:'storm'},true);assert.deepEqual(w,before);resumeWorld(w,now+24*36e5,{hour:14,busyHours:0,weather:'clear'},false);assert.equal(w.lastSeen,now+24*36e5);
});
test('saved activity resolves to a consistent scene and label',async()=>{
 const {activityDetails}=await import('../site/world.js');assert.deepEqual(activityDetails('read'),{kind:'read',place:'inside',label:'Reading absolutely nothing urgent'});assert.equal(activityDetails('garden').place,'outside');
});
test('finite but unusable journal dates are discarded and bad lastSeen resets safely',()=>{
 const w=initialWorld(now,1);w.journal=[{text:'a bad date',at:1e100}];let got=safeLoad({getItem:()=>JSON.stringify(w)},'world',now);assert.equal(got.journal.length,0);w.lastSeen=1e100;got=safeLoad({getItem:()=>JSON.stringify(w)},'world',now);assert.equal(got.lastSeen,now);
});
