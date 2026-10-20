import fs from 'node:fs';
import assert from 'node:assert/strict';

const data=JSON.parse(fs.readFileSync(new URL('../public/data/atlas.json',import.meta.url),'utf8'));
const ids = {};
for(const key of ['entities','events','relationships','sources','cases']) {
  assert(data[key].length>0,`${key} is empty`);
  ids[key]=new Set();
  for(const item of data[key]) {
    assert(item.id,`${key}: missing id`);
    assert(!ids[key].has(item.id),`${key}: duplicate ${item.id}`);
    ids[key].add(item.id);
  }
}
for(const source of data.sources) {
  assert(source.title && source.publisher,`${source.id}: missing source title/publisher`);
  assert(['https:','http:'].includes(new URL(source.url).protocol),`${source.id}: unsafe URL`);
}
for(const key of ['entities','events','relationships','cases']) for(const item of data[key]) {
  assert(item.sourceIds?.length,`${item.id}: no sources`);
  for(const id of item.sourceIds)assert(ids.sources.has(id),`${item.id}: unknown source ${id}`);
  if(key!=='entities') {
    assert(['documented','reported','allegation'].includes(item.evidence),`${item.id}: unknown evidence`);
    assert(item.topic,`${item.id}: no topic`);
    const refs=key==='relationships'?[item.from,item.to]:item.entityIds;
    assert(refs.length,`${item.id}: no entities`);
    for(const id of refs)assert(ids.entities.has(id),`${item.id}: unknown entity ${id}`);
  }
  if(key==='events')assert(/^\d{4}/.test(item.sortDate),`${item.id}: invalid sortDate`);
}
const caseStatuses=['conviction','court-finding','regulatory-action','civil-settlement','official-investigation','allegation'];
for(const item of data.cases) {
  assert(caseStatuses.includes(item.status),`${item.id}: invalid case category`);
  for(const field of ['title','date','summary','statusDetail','findings','response','outcome','limitations','reviewed'])assert(typeof item[field]==='string' && item[field].trim(),`${item.id}: missing ${field}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(item.reviewed),`${item.id}: invalid review date`);
  assert(item.eventIds?.length,`${item.id}: no timeline records`);
  for(const id of item.eventIds)assert(ids.events.has(id),`${item.id}: unknown event ${id}`);
  assert(item.entityRoles?.length,`${item.id}: missing entity roles`);
  for(const role of item.entityRoles)assert(item.entityIds.includes(role.entityId) && role.role?.trim(),`${item.id}: invalid entity role`);
  for(const id of item.entityIds)assert(item.entityRoles.some(role=>role.entityId===id),`${item.id}: missing role for ${id}`);
}
for(const roster of data.rosters) {
  assert.equal(roster.count,roster.entries.length,`${roster.id}: roster count mismatch`);
  assert.equal(new Set(roster.entries.map(e=>JSON.stringify(e))).size,roster.count,`${roster.id}: duplicate full roster entry`);
  for(const entry of roster.entries)assert(ids.entities.has(entry.entityId),`${roster.id}: unknown roster member`);
}
assert(ids.entities.has('jeff-epstein-former-oracle-cfo') && ids.entities.has('jeffrey-epstein'),'Epstein names must be separated');
const htmlFiles=['index.html','timeline/index.html','network/index.html'];
for(const file of htmlFiles) {
  const html=fs.readFileSync(new URL('../public/'+file,import.meta.url),'utf8');
  assert(html.includes('<title>'),`${file}: no page title`);
  assert(html.includes('lang="en"'),`${file}: missing language`);
  for(const [,script] of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))if(script.trim())new Function(script);
}
new Function(fs.readFileSync(new URL('../public/atlas.js',import.meta.url),'utf8'));
console.log(`Validated atlas references, evidence statuses, ${data.cases.length} case dossiers and roles, ${data.rosters.length} roster counts, separate Epstein identities and 3 pages.`);
