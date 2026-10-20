/* A static, source-first research explorer. No external libraries or tracking. */
(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
  const uniq = xs => [...new Set(xs)];
  const textValue = value => typeof value === 'string' ? value : Array.isArray(value) ? value.map(textValue).join(' ') : value && typeof value === 'object' ? Object.values(value).map(textValue).join(' ') : value == null ? '' : String(value);
  const norm = s => textValue(s).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const makeButton = (label, action, cls) => { const b = el('button', cls, label); b.type = 'button'; b.addEventListener('click', action); return b; };
  const empty = msg => el('div', 'empty', msg);
  const params = new URLSearchParams(location.search);
  const allowedViews = ['timeline', 'cases', 'connections', 'directory', 'rosters', 'sources', 'coverage'];
  const caseStatuses = {'conviction':'Criminal conviction','court-finding':'Court finding','regulatory-action':'Regulatory action','civil-settlement':'Civil settlement','official-investigation':'Official investigation','allegation':'Allegation / charge'};
  const state = {view: allowedViews.includes(params.get('view')) ? params.get('view') : 'timeline', q: params.get('q') || '', topic: params.get('topic') || '', evidence: params.get('evidence') || '', entity: params.get('entity') || '', status: params.get('status') || '', case: params.get('case') || '', page: 1};
  const PAGE_SIZE = 30;
  let data, entities, sources, adjacent, panel;
  function link(url, label) {
    const a = el('a', '', label); const parsed = new URL(url, location.origin);
    if (!['https:', 'http:'].includes(parsed.protocol)) return el('span', '', label);
    a.href = parsed.href; a.target = '_blank'; a.rel = 'noopener noreferrer'; return a;
  }
  function sourceLinks(ids) {
    const wrap = el('div', 'source-links');
    uniq(ids || []).forEach(id => {
      const s = sources.get(id);
      if (!s) return;
      const a = link(s.url, `${s.publisher || 'Source'} ↗`); a.title = s.title; wrap.append(a);
    }); return wrap;
  }
  function badge(value) { return el('span', `badge ${value}`, value === 'documented' ? 'Documented record' : value === 'reported' ? 'Reported / attributed' : value === 'allegation' ? 'Allegation' : value); }
  function entityChip(id) {
    const entity = entities.get(id);
    return makeButton(entity?.name || id, () => showProfile(id), 'chip');
  }
  function limitation(value) { return value ? el('p', 'limitation', textValue(value)) : null; }
  function saveURL() {
    const p = new URLSearchParams();
    for (const k of ['view','q','topic','evidence','entity','status','case']) if(state[k] && !(k === 'view' && state[k] === 'timeline') && (!(k==='case'||k==='status')||state.view==='cases')) p.set(k, state[k]);
    history.replaceState(null, '', location.pathname + (p.size ? '?' + p.toString() : ''));
  }
  function changeView(view) { state.view = view; state.case=''; state.page = 1; render(); }
  function recordMatches(record) {
    if (state.topic && record.topic !== state.topic && !(record.topics || []).includes(state.topic)) return false;
    if (state.view!=='cases' && state.evidence && record.evidence !== state.evidence) return false;
    const haystack = norm([record.title,record.name,record.summary,record.context,record.label,record.date,record.type,record.limitations,record.findings,record.response,record.outcome,record.statusDetail,record.entityIds?.map(id => entities.get(id)?.name),entities.get(record.from)?.name,entities.get(record.to)?.name]);
    return !state.q || norm(state.q).split(/\s+/).filter(Boolean).every(word => haystack.includes(word));
  }
  function relatedRecords(id) { return (adjacent.get(id) || []); }
  function filteredEntities() {
    const relatedIds = new Set([...data.events, ...data.relationships, ...data.cases].filter(recordMatches).flatMap(r => r.entityIds || [r.from, r.to]));
    return data.entities.filter(e => {
      const searchOK = !state.q || norm([e.name,e.summary,e.aliases,e.type]).includes(norm(state.q)) || relatedIds.has(e.id);
      const scopeOK = !state.topic && !state.evidence || relatedIds.has(e.id);
      return searchOK && scopeOK;
    }).sort((a,b) => a.name.localeCompare(b.name));
  }
  function paginate(items, renderItem, container) {
    items.slice(0, PAGE_SIZE * state.page).forEach(x => container.append(renderItem(x)));
    panel.append(container);
    if (items.length > PAGE_SIZE) {
      const nav = el('div','more'); nav.append(el('span','pager-label',`Showing ${Math.min(items.length, PAGE_SIZE * state.page).toLocaleString()} of ${items.length.toLocaleString()}`));
      if (items.length > PAGE_SIZE * state.page) nav.append(makeButton('Show 30 more', () => {state.page++; render(false);}));
      panel.append(nav);
    }
  }
  function caseLink(item, label=item.title) {
    const a=el('a','case-link',label);a.href='/timeline/?view=cases&case='+encodeURIComponent(item.id);return a;
  }
  function renderEvent(event, includeCases=true) {
    const li = el('li', 'event'); li.id = event.id;
    const left = el('div'); left.append(el('div', 'event-date', event.date), el('div', 'event-topic', event.topic));
    const body = el('article'); body.append(el('h3','',event.title), el('p','',event.summary));
    const footer = el('div','record-footer'); footer.append(badge(event.evidence));
    (event.entityIds || []).slice(0,8).forEach(id => footer.append(entityChip(id))); body.append(footer);
    const note = limitation(event.limitations); if(note)body.append(note);
    body.append(sourceLinks(event.sourceIds));
    if(includeCases) data.cases.filter(c=>c.eventIds.includes(event.id)).forEach(c=>body.append(caseLink(c,'Read case: '+c.title+' ↗')));
    li.append(left,body); return li;
  }
  function renderRelation(record) {
    const article = el('article','relation');
    article.append(el('div','relation-direction',`${record.date || 'Date not specified'} · ${record.type.replaceAll('_',' ')} · ${record.topic}`));
    const who = el('div','record-footer'); who.append(entityChip(record.from), el('span','','→'), entityChip(record.to));
    article.append(who,el('h3','',record.label),el('p','',record.context || ''));
    article.append(badge(record.evidence));
    const note = limitation(record.limitations); if(note)article.append(note);
    article.append(sourceLinks(record.sourceIds)); return article;
  }
  function renderTimeline() {
    const items = data.events.filter(recordMatches).sort((a,b) => a.sortDate.localeCompare(b.sortDate) || a.title.localeCompare(b.title));
    $('#result-count').textContent = `${items.length.toLocaleString()} dated records · oldest first`;
    if(!items.length){panel.append(empty('No dated records match these filters. Try a broader search or reset the filters.')); return;}
    paginate(items,renderEvent,el('ol','timeline-list'));
  }
  function renderCaseCard(item) {
    const article=el('article','case-card');
    article.append(el('div','eyebrow red',`${item.date} · ${item.topic}`),el('span','badge case-badge',caseStatuses[item.status]));
    const heading=el('h2');heading.append(caseLink(item));article.append(heading,el('p','case-summary',item.summary),el('p','small',item.statusDetail),sourceLinks(item.sourceIds));
    article.append(caseLink(item,'Read findings, response & outcome ↗'));return article;
  }
  function renderCaseDetail(item) {
    $('#result-count').textContent=`Case record · reviewed ${item.reviewed}`;
    const back=el('a','case-back','← All cases & findings');back.href='/timeline/?view=cases';panel.append(back);
    const article=el('article','case-detail');article.append(el('p','eyebrow red',`${item.date} · ${item.topic}`),el('span','badge case-badge',caseStatuses[item.status]),el('h2','',item.title),el('p','case-summary',item.summary));
    const status=el('div','case-status');status.append(el('h3','','Status of the cited action'),el('p','',item.statusDetail));article.append(status);
    const roles=el('section','case-roles');roles.append(el('h3','','People & institutions in this record'));
    const roleList=el('dl');
    item.entityRoles.forEach(r=>{const row=el('div'),name=el('dt');name.append(entityChip(r.entityId));row.append(name,el('dd','',r.role));roleList.append(row);});
    roles.append(roleList);article.append(roles);
    const sections=el('div','case-sections');
    [['Findings or allegations','findings'],['Response & contested points','response'],['Outcome & remedy','outcome'],['What this record does not establish','limitations']].forEach(([heading,key])=>{
      const section=el('section');section.append(el('h3','',heading),el('p','',item[key]));sections.append(section);
    });article.append(sections);
    const documents=el('section','case-documents');documents.append(el('h3','','Source documents'));
    const sourceList=el('ol');
    item.sourceIds.forEach(id=>{const source=sources.get(id),li=el('li');li.append(link(source.url,source.title),el('p','small',`${source.publisher}${source.published?' · '+source.published:''}`));if(source.notes)li.append(el('p','small',textValue(source.notes)));sourceList.append(li);});
    documents.append(sourceList);article.append(documents);
    const events=data.events.filter(e=>item.eventIds.includes(e.id)).sort((a,b)=>a.sortDate.localeCompare(b.sortDate));
    if(events.length){article.append(el('h3','','Case chronology'));const list=el('ol','timeline-list');events.forEach(e=>list.append(renderEvent(e,false)));article.append(list);}
    panel.append(article);
  }
  function renderCases() {
    if(state.case) {
      const item=data.cases.find(c=>c.id===state.case);
      if(item){renderCaseDetail(item);return;}
      $('#result-count').textContent='Case not found';panel.append(empty('This case ID is not in the current edition.'));
      panel.append(makeButton('Browse all cases',()=>{state.case='';render();}));return;
    }
    const items=data.cases.filter(c=>(!state.status||c.status===state.status)&&recordMatches(c)).sort((a,b)=>b.sortDate.localeCompare(a.sortDate)||a.title.localeCompare(b.title));
    $('#result-count').textContent=`${items.length} case dossiers · newest cited action first`;
    const intro=el('div','case-intro');intro.append(el('h2','','Cases & findings'),el('p','','Documented harms, allegations and institutional failures, with the response and outcome alongside the evidence. Categories describe a cited legal or investigative action; later appeals, pardons and settlements are explained inside each case.'));panel.append(intro);
    if(!items.length){panel.append(empty('No cases match these filters. Try another category or reset the filters.'));return;}
    paginate(items,renderCaseCard,el('div','case-grid'));
  }
  function renderDirectory() {
    const items = filteredEntities();
    $('#result-count').textContent = `${items.length.toLocaleString()} people, organizations and events`;
    if(!items.length){panel.append(empty('No entries match these filters.'));return;}
    paginate(items, e => {
      const card = makeButton('', () => showProfile(e.id),'entity-card');
      card.append(el('span','entity-kind',e.type), el('h3','',e.name), el('p','',e.summary)); return card;
    },el('div','directory'));
  }
  function showProfile(id) {
    const e = entities.get(id); if(!e)return;
    const body = $('#profile-content'); body.replaceChildren();
    const head = el('div','profile-head'); const title = el('div'),heading=el('h2','',e.name);heading.id='profile-heading';title.append(el('span','eyebrow red',e.type),heading);
    head.append(title,makeButton('×',()=>$('#profile').close(),'profile-close')); head.lastChild.setAttribute('aria-label','Close profile');
    body.append(head,el('p','',e.summary),sourceLinks(e.sourceIds));
    if (e.aliases?.length) body.append(el('p','small','Also indexed as: '+e.aliases.join(', ')));
    const relatedCases=data.cases.filter(c=>c.entityIds.includes(id));
    if(relatedCases.length){body.append(el('h3','','Related cases & findings'));relatedCases.forEach(c=>{const row=el('p');row.append(caseLink(c),el('span','small',' — '+c.entityRoles.filter(r=>r.entityId===id).map(r=>r.role).join('; ')));body.append(row);});}
    if(adjacent.has(id))body.append(makeButton('Explore connections ↗',()=>{state.entity=id;state.q='';state.topic='';state.evidence='';$('#search').value='';$('#topic').value='';$('#evidence').value='';$('#profile').close();changeView('connections');},'primary'));
    const records = relatedRecords(id).sort((a,b)=>(a.date||'').localeCompare(b.date||''));
    body.append(el('h3','',`${records.length} indexed relationships`));
    records.slice(0,50).forEach(r=>body.append(renderRelation(r)));
    if(records.length>50)body.append(el('p','small','First 50 relationships shown here. Use Explore connections to browse the complete list.'));
    const timelineEvents=data.events.filter(event=>event.entityIds.includes(id));
    if(timelineEvents.length){body.append(el('h3','','Related timeline records'));const list=el('ol','timeline-list');timelineEvents.forEach(event=>list.append(renderEvent(event)));body.append(list);}
    const dialog = $('#profile'); if(!dialog.open)dialog.showModal();
  }
  function svgNode(tag, attrs, text) {const n = document.createElementNS('http://www.w3.org/2000/svg',tag); Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;return n;}
  function drawNetwork(id, records) {
    const wrap = el('div','network-pane'); wrap.append(el('div','graph-heading',entities.get(id)?.name || 'Select an entity'));
    const svg = svgNode('svg',{viewBox:'0 0 600 470',role:'img','aria-label':`Relationships around ${entities.get(id)?.name || 'selected entity'}. The adjacent list provides full evidence.`});
    const neighborIds = uniq(records.map(r=>r.from===id?r.to:r.from)).slice(0,14);
    const center={x:300,y:235};
    const positions = neighborIds.map((nid,i)=>({id:nid,x:center.x+220*Math.cos(-Math.PI/2+2*Math.PI*i/neighborIds.length),y:center.y+175*Math.sin(-Math.PI/2+2*Math.PI*i/neighborIds.length)}));
    positions.forEach(p=>{const relation=records.find(r=>r.from===p.id||r.to===p.id);svg.append(svgNode('line',{x1:center.x,y1:center.y,x2:p.x,y2:p.y,class:`graph-line ${relation.evidence}`}));});
    [...positions,{id,...center,center:true}].forEach(p=>{
      const g=svgNode('g',{class:'graph-node'+(p.center?' center':''),tabindex:'0',role:'button','aria-label':`View ${entities.get(p.id)?.name || p.id}`});
      const name=entities.get(p.id)?.name||p.id;
      g.append(svgNode('circle',{cx:p.x,cy:p.y,r:p.center?53:8}),svgNode('title',{},name));
      const words = name.split(' '); let lines=[''];
      words.forEach(w=>{if((lines.at(-1)+' '+w).length>22&&lines.at(-1))lines.push(w);else lines[lines.length-1]+=(lines.at(-1)?' ':'')+w;});
      lines=lines.slice(0,3);
      lines.forEach((line,i)=>g.append(svgNode('text',{x:p.x,y:p.y+(p.center?-5:22)+i*13,'text-anchor':'middle'},line)));
      const open=()=>{state.entity=p.id;state.q='';$('#search').value='';state.page=1;render();};
      g.addEventListener('click',open);g.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open();}});svg.append(g);
    });
    wrap.append(svg,el('div','network-note',`${neighborIds.length} of ${uniq(records.map(r=>r.from===id?r.to:r.from)).length} connected entities drawn. All matching records are listed. Click a node to refocus; dashed lines indicate reporting. Arrows in the list identify the recorded relationship.`));
    return wrap;
  }
  function getPath(from,to) {
    if(from===to)return [];
    const queue=[from], prev=new Map([[from,null]]);
    for(let i=0;i<queue.length;i++) {
      const current=queue[i];
      for(const r of relatedRecords(current)) {
        if(state.evidence && r.evidence!==state.evidence || state.topic && r.topic!==state.topic)continue;
        const next=r.from===current?r.to:r.from;
        if(prev.has(next))continue;
        prev.set(next,{node:current,edge:r});
        if(next===to){const path=[];let n=to;while(prev.get(n)){path.unshift({...prev.get(n),to:n});n=prev.get(n).node;}return path;}
        queue.push(next);
      }
    } return null;
  }
  function renderTrace() {
    const box=el('div','trace-box');box.append(el('h3','','Trace the indexed records'),el('p','','Find a shortest chain in this dataset. A chain may cross decades or include invitations; it does not establish coordination, access or wrongdoing. Topic and evidence filters apply.'));
    const controls=el('div','trace-controls');const all=data.entities.filter(e=>adjacent.has(e.id)).sort((a,b)=>a.name.localeCompare(b.name));
    const select=(label,id)=>{const l=el('label','',label),s=el('select');s.id=id;all.forEach(e=>{const o=el('option','',e.name);o.value=e.id;s.append(o);});l.append(s);controls.append(l);return s;};
    const from=select('Starting point','trace-from'),to=select('Destination','trace-to');
    from.value=state.entity||all[0]?.id;
    const defaultTarget=data.entities.find(e=>/artificial intelligence|openai|blackrock/i.test(e.name)&&e.id!==from.value);
    to.value=defaultTarget?.id||all.at(-1)?.id;
    const result=el('div','trace-result'); result.setAttribute('aria-live','polite');
    controls.append(makeButton('Find a path',()=>{
      result.replaceChildren();
      const path=getPath(from.value,to.value);
      if(!path){result.append(empty('No indexed path matches the active topic and evidence filters. Absence here is not evidence that no relationship exists.'));return;}
      if(!path.length){result.append(el('p','','Choose two different entries.'));return;}
      result.append(el('p','small',`${path.length} recorded links. Each link below retains its own date, direction and evidence status. Search text does not constrain path finding.`));
      path.forEach((step,i)=>{const s=el('div','trace-step');s.append(el('span','step-label',`Step ${i+1}: ${entities.get(step.node)?.name} → ${entities.get(step.to)?.name}`),renderRelation(step.edge));result.append(s);});
    },'primary'));
    box.append(controls,result);return box;
  }
  function renderConnections() {
    const choices=filteredEntities().filter(e=>adjacent.has(e.id));
    if(!choices.length){$('#result-count').textContent='0 matching connected entries';panel.append(empty('No connected entries match these filters.'));return;}
    if(!choices.some(e=>e.id===state.entity))state.entity=choices.find(e=>e.name==='Peter Thiel')?.id||choices[0].id;
    const controls=el('div','graph-tools');const label=el('label','sr-only','Focus entity');label.htmlFor='focus-entity';
    const select=el('select');select.id='focus-entity';choices.forEach(e=>{const o=el('option','',e.name);o.value=e.id;select.append(o);});select.value=state.entity;
    select.addEventListener('change',()=>{state.entity=select.value;state.page=1;render();});
    controls.append(label,select,makeButton('Profile',()=>showProfile(state.entity)));
    panel.append(controls);
    // A name search finds the focal entity; neighbors remain visible when they satisfy topic/evidence.
    const records=relatedRecords(state.entity).filter(r=>(!state.topic||r.topic===state.topic)&&(!state.evidence||r.evidence===state.evidence));
    $('#result-count').textContent=`${records.length.toLocaleString()} relationships for ${entities.get(state.entity).name} · ${choices.length} matching focal entries`;
    panel.append(renderTrace());
    const layout=el('div','graph-layout');layout.append(drawNetwork(state.entity,records));const list=el('div');
    records.slice(0,state.page*PAGE_SIZE).forEach(r=>list.append(renderRelation(r)));
    if(!records.length)list.append(empty('This entry has no relationships under the current topic/evidence filters.'));
    if(records.length>state.page*PAGE_SIZE)list.append(makeButton('Show 30 more relationships',()=>{state.page++;render(false);}));
    layout.append(list);panel.append(layout);
  }
  function renderSources() {
    const scopeIds=new Set([...data.events,...data.relationships,...data.cases].filter(r=>(!state.topic||r.topic===state.topic)&&(!state.evidence||r.evidence===state.evidence)).flatMap(r=>r.sourceIds||[]));
    const searchIds=new Set([...data.events,...data.relationships,...data.cases].filter(recordMatches).flatMap(r=>r.sourceIds||[]));
    const items=data.sources.filter(s=>(!state.topic&&!state.evidence||scopeIds.has(s.id))&&(!state.q||norm([s.title,s.publisher,s.notes,s.url]).includes(norm(state.q))||searchIds.has(s.id)));
    $('#result-count').textContent=`${items.length} sources · links point to publishers or identified document copies`;
    paginate(items,s=>{
      const li=el('li','source-item'),body=el('div');li.append(el('span','source-index',String(data.sources.indexOf(s)+1).padStart(2,'0')));
      const title=el('h3');title.append(link(s.url,s.title));body.append(title,el('p','',`${s.publisher||'Publisher not specified'}${s.published?' · Published '+s.published:''} · Reviewed ${s.accessed||data.updated}`));
      if(s.notes)body.append(el('p','',textValue(s.notes)));
      body.append(link(s.url,new URL(s.url).hostname+' ↗'));li.append(body);return li;
    },el('ol','source-list'));
  }
  function renderRosters() {
    const q=norm(state.q);
    const rosters=(data.rosters||[]).filter(r=>(!state.topic||state.topic==='Bilderberg & Dialog')&&(!state.evidence||r.evidence===state.evidence)).map(r=>({...r,matching:r.entries.filter(e=>!q||norm([r.title,e.name,e.listedName,e.listedAffiliation,e.role,entities.get(e.entityId)?.name]).includes(q))})).filter(r=>r.matching.length).sort((a,b)=>String(b.date||'').localeCompare(String(a.date||'')));
    $('#result-count').textContent=`${rosters.length} published lists · ${rosters.reduce((sum,r)=>sum+r.matching.length,0).toLocaleString()} matching list entries`;
    panel.append(el('p','limitation','These are entries in specific published lists. The same person may appear in multiple years or roles. Invited, anticipated and listed participants are not interchangeable with independently confirmed attendance.'));
    if(!rosters.length){panel.append(empty('No published lists match these filters.'));return;}
    for(const roster of rosters) {
      const details=el('details','roster');const summary=el('summary');summary.append(el('span','',roster.title),el('span','small',` · ${roster.matching.length} of ${roster.count} entries`));details.append(summary);
      const content=el('div','roster-content');content.append(el('p','small',`${roster.date||'Date not specified'} · ${roster.status||'Published source list'} · ${roster.completeForSource?'Complete for the cited list':'Partial extraction'}. This does not establish a complete organizational membership or historical roll.`),badge(roster.evidence),sourceLinks(roster.sourceIds));
      if(roster.notes)content.append(el('p','limitation',textValue(roster.notes)));
      if(roster.uniquePeopleCount && roster.uniquePeopleCount!==roster.count)content.append(el('p','small',`${roster.count} list rows represent ${roster.uniquePeopleCount} distinct people; separate roles can repeat a person.`));
      const wrap=el('div','roster-table-wrap'),table=el('table','roster-table');const caption=el('caption','sr-only',roster.title);table.append(caption);
      const head=el('thead'),row=el('tr');for(const title of ['Person','Role or affiliation as listed','List notation']){const th=el('th','',title);th.scope='col';row.append(th);}head.append(row);table.append(head);const tbody=el('tbody');
      roster.matching.forEach(entry=>{const tr=el('tr'),person=el('td');person.append(entityChip(entry.entityId));tr.append(person,el('td','',entry.listedAffiliation||entry.role||'Not specified'),el('td','',entry.countryCode||entry.status||'—'));tbody.append(tr);});
      table.append(tbody);wrap.append(table);content.append(wrap);details.append(content);panel.append(details);
    }
  }
  function renderCoverage() {
    $('#result-count').textContent=`Coverage reviewed ${data.updated} · a bounded research edition`;
    const grid=el('div','coverage');
    const sections=[
      ['What a line establishes','Every relationship has a type, a date where known and at least one source. Employment, governance, investment, an invitation, listed participation, a meeting, correspondence, a charge and a conviction are different claims. The graph keeps them separate.'],
      ['Documented, reported, alleged','Documented means a cited primary record establishes the narrow claim: an official list, filing, court result or institution’s own statement. It is not a universal truth rating. Reported means a claim is attributed to reporting or an account. Allegations are identified and do not imply conviction. Self-published institutional accounts can have limitations.'],
      ['Reading cases and findings','A case category describes the dated action cited in that dossier. A documented indictment establishes that charges were filed, not that the accused committed them. Settlements can resolve disputed claims without admissions. The response and outcome sections preserve denials, appeals, dismissals, pardons and other qualifications. Entity roles distinguish investigators, courts, defendants and other institutions. These dossiers are selected records, not an exhaustive catalog of wrongdoing or a ranking of people.'],
      ['Reading meeting lists','Bilderberg publishes participant lists for individual meetings, not a roll of permanent members. Steering-committee service is separate. A Dialog invitation or registration list does not prove attendance. Sharing a meeting node does not prove a personal relationship between every participant. No complete public register of all private dinners and lunches is available in this edition.'],
      ['Reading the Epstein files','The releases combine different document types and include unverified submissions. A contact entry, travel record, invitation or mention is not proof of criminal conduct. This edition focuses on sourced public institutional records, proceedings and identified connections. It does not publish a supposed “client list” or victim/private contact details.'],
      ['Historical and geographic scope','The timeline begins in 1600 and offers selected institutional milestones, not a complete history of several centuries. States, governments, ministries, companies and individuals remain distinct. Nationality, religion and ancestry do not establish institutional affiliation or collective responsibility. A chronological sequence alone does not establish causation.'],
      ['This edition and the original map','The source-led atlas is a separately reviewed expansion. The original network remains available at /network/ with its existing content and evidence labels; those older claims have not all been reverified in this edition. The new atlas does not silently combine legacy claims with newly researched records.']
    ];
    sections.forEach(([title,text])=>{const a=el('article');a.append(el('h3','',title),el('p','',text));grid.append(a);});
    (data.coverage||[]).forEach(c=>{
      const a=el('article');a.append(el('h3','',c.title||'Research coverage'));
      if(c.summary)a.append(el('p','',c.summary));
      (c.notes||[]).forEach(n=>a.append(el('p','',textValue(n))));
      if(c.sourceIds)a.append(sourceLinks(c.sourceIds));
      grid.append(a);
    });
    panel.append(grid);
  }
  function render(resetScroll=true) {
    saveURL();panel.replaceChildren();
    document.title=state.view==='cases'?(data.cases.find(c=>c.id===state.case)?.title||'Cases & findings')+' — Bad Tengu':'Timeline & connections — Bad Tengu';
    document.querySelectorAll('[data-view]').forEach(b=>{const active=b.dataset.view===state.view;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;});
    panel.setAttribute('aria-labelledby','tab-'+state.view);
    $('#filters').hidden=state.view==='coverage'||state.view==='cases'&&!!state.case;
    $('#evidence-control').hidden=state.view==='cases';
    $('#case-status-control').hidden=state.view!=='cases';
    ({timeline:renderTimeline,cases:renderCases,connections:renderConnections,directory:renderDirectory,rosters:renderRosters,sources:renderSources,coverage:renderCoverage})[state.view]();
    saveURL();
  }
  async function init() {
    const response=await fetch('/data/atlas.json',{cache:'no-cache'});if(!response.ok)throw Error('Research dataset returned '+response.status);
    data=await response.json();data.cases=data.cases||[];
    entities=new Map(data.entities.map(e=>[e.id,e]));sources=new Map(data.sources.map(s=>[s.id,s]));adjacent=new Map();
    data.relationships.forEach(r=>{for(const id of uniq([r.from,r.to])){if(!adjacent.has(id))adjacent.set(id,[]);adjacent.get(id).push(r);}});
    if($('#home-metrics')) {
      $('#metric-events').textContent=data.events.length.toLocaleString();$('#metric-entities').textContent=data.entities.length.toLocaleString();$('#metric-sources').textContent=data.sources.length.toLocaleString();$('#case-count').textContent=data.cases.length+' case dossiers';return;
    }
    panel=$('#panel');$('#edition').replaceChildren(el('span','','RESEARCH EDITION'),el('br'),el('span','',data.updated+' · '+data.relationships.length.toLocaleString()+' indexed relationships'));
    const topics=uniq([...data.events,...data.relationships,...data.cases].map(r=>r.topic)).filter(Boolean).sort();
    topics.forEach(t=>{const option=el('option','',t);option.value=t;$('#topic').append(option);});
    if(!topics.includes(state.topic))state.topic='';
    if(!['','documented','reported','allegation'].includes(state.evidence))state.evidence='';
    if(!caseStatuses[state.status])state.status='';
    Object.entries(caseStatuses).forEach(([value,label])=>{const option=el('option','',label);option.value=value;$('#case-status').append(option);});
    $('#case-status').value=state.status;
    $('#case-status').addEventListener('change',()=>{state.status=$('#case-status').value;state.page=1;render();});
    $('#search').value=state.q;$('#topic').value=state.topic;$('#evidence').value=state.evidence;
    let timer;
    $('#search').addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{state.q=$('#search').value;state.page=1;render();},180);});
    for(const key of ['topic','evidence'])$('#'+key).addEventListener('change',()=>{state[key]=$('#'+key).value;state.page=1;render();});
    document.querySelectorAll('[data-view]').forEach(b=>{
      b.addEventListener('click',()=>changeView(b.dataset.view));
      b.addEventListener('keydown',ev=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(ev.key)){ev.preventDefault();let i=allowedViews.indexOf(state.view);i=ev.key==='Home'?0:ev.key==='End'?allowedViews.length-1:(i+(ev.key==='ArrowRight'?1:-1)+allowedViews.length)%allowedViews.length;changeView(allowedViews[i]);$('#tab-'+allowedViews[i]).focus();}});
    });
    $('#reset').addEventListener('click',()=>{clearTimeout(timer);state.q=state.topic=state.evidence=state.entity=state.status=state.case='';state.page=1;$('#search').value=$('#topic').value=$('#evidence').value=$('#case-status').value='';render();});
    $('#share').addEventListener('click',async()=>{saveURL();try{await navigator.clipboard.writeText(location.href);$('#share').textContent='Copied';}catch{$('#share').textContent='Copy the address in your browser';}setTimeout(()=>$('#share').textContent='Copy this view',3000);});
    $('#profile').addEventListener('click',ev=>{if(ev.target===$('#profile'))$('#profile').close();});
    render();
  }
  init().catch(err=>{const target=$('#panel')||$('#home-metrics');target.replaceChildren(el('p','status-error','The research data could not be loaded. Please reload the page.'));console.error(err);});
})();
