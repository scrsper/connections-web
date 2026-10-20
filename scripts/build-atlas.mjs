import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = ['research-bilderberg-dialogue.json', 'research-epstein.json', 'research-history-ai-politics.json'];
const read = file => JSON.parse(fs.readFileSync(path.join(root, 'research', file), 'utf8').replace(/^\uFEFF/, ''));
const datasets = files.map(read);
const unique = values => [...new Set(values)];
const normalized = value => value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const entities = new Map(), sources = new Map(), names = new Map(), idMap = new Map();
const text = value => typeof value === 'string' ? value : Array.isArray(value) ? value.map(text).join(' ') : value && typeof value === 'object' ? Object.entries(value).map(([k,v])=>`${k}: ${text(v)}`).join('; ') : value == null ? '' : String(value);
// Match exact full names/IDs only. Jeff Epstein and Jeffrey Epstein are distinct people.
for (const d of datasets) {
  for (const s of d.sources) {
    if (sources.has(s.id) && sources.get(s.id).url !== s.url) throw Error(`Conflicting source ID: ${s.id}`);
    sources.set(s.id, { ...s, notes: text(s.notes) });
  }
  for (const e of d.entities) {
    const key = normalized(e.name);
    if(entities.has(e.id) && normalized(entities.get(e.id).name)!==key)throw Error(`Conflicting entity identity: ${e.id}`);
    const existing = entities.get(e.id) || entities.get(names.get(key));
    const id = existing?.id || e.id;
    idMap.set(e.id,id); names.set(key,id);
    if(existing) {
      existing.sourceIds = unique([...(existing.sourceIds||[]),...(e.sourceIds||[])]);
      if(!existing.summary && e.summary)existing.summary=e.summary;
      existing.aliases=unique([...(existing.aliases||[]),...(e.aliases||[]),...(e.name!==existing.name?[e.name]:[])]);
    } else entities.set(id,{...e,sourceIds:e.sourceIds||[]});
  }
}
const resolve = id => idMap.get(id) || id;
const events = datasets.flatMap(d=>d.events).map(e=>({...e,entityIds:unique(e.entityIds.map(resolve)),sortDate: String(e.date).match(/\d{4}(?:-\d{2})?(?:-\d{2})?/)?.[0] || '9999',limitations:text(e.limitations)}));
const relationships = datasets.flatMap(d=>d.relationships).map(r=>({...r,from:resolve(r.from),to:resolve(r.to),context:text(r.context),limitations:text(r.limitations)}));
const rosters = datasets.flatMap(d=>d.rosters||[]).map(r=>({...r,eventId:resolve(r.eventId),organizationId:resolve(r.organizationId),entries:r.entries.map(e=>({...e,entityId:resolve(e.entityId)}))}));
for(const e of entities.values()) {
  if(!e.summary) {
    const latest = relationships.filter(r=>r.from===e.id && r.context).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')))[0];
    e.summary=latest ? `${latest.date ? `Record dated ${latest.date}. ` : ''}${latest.context}` : 'Indexed in the cited public record. Open the profile to inspect the exact relationships and evidence.';
  }
}
const coverage = datasets.map((d,index)=>{
  const c=d.coverage;
  const details = Object.entries(c).filter(([k])=>!['title','scope','summary','sourceIds','limits','limitations','gaps','readingRules','topic','asOf'].includes(k)).map(([k,v])=>`${k.replace(/([a-z])([A-Z])/g,'$1 $2')}: ${text(v)}`);
  return {title:c.title||c.topic||['Bilderberg & Dialog','Epstein records','History, AI and public affairs'][index],summary:c.scope||c.summary||'',notes:[...details,...(c.limits||[]),...(c.limitations||[]),...(c.gaps||[]),...(c.readingRules||[])],sourceIds:c.sourceIds||[]};
});
const atlas = {version:1,updated:'2026-10-19',title:'Bad Tengu research atlas',sources:[...sources.values()],entities:[...entities.values()],events,relationships,rosters,coverage};
fs.mkdirSync(path.join(root,'public/data'),{recursive:true});
fs.writeFileSync(path.join(root,'public/data/atlas.json'),JSON.stringify(atlas,null,2)+'\n');
console.log(`Built atlas: ${atlas.entities.length} entities, ${events.length} events, ${relationships.length} relationships, ${sources.size} sources, ${rosters.length} rosters.`);
