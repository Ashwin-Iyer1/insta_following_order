'use strict';
const $=id=>document.getElementById(id);
let current=null,previous=null,visible=[],page=0,version={current:0,previous:0};
const PAGE=50;
const labels={'current':'In current snapshot','shared':'In both','only-current':'Only in current','only-previous':'Only in previous'};
function sample(){
  version.current++;version.previous++;
  const names=['fieldnotes.lab','orbital.studio','paperandcode','bluehour.design','signal.workshop','mossandmath','small.batch','citysketches','quiet.circuits','kinetic.forms','atlas.reads','pixel.garden'];
  const rows=names.map((username,i)=>({username,full_name:['Field Notes','Orbital Studio','Paper & Code','Blue Hour','Signal Workshop','Moss & Math','Small Batch','City Sketches','Quiet Circuits','Kinetic Forms','Atlas Reads','Pixel Garden'][i],timestamp:i%4===0?null:1759276800-i*86400}));
  current=FollowingCore.parse({schema:'following-snapshot/v1',complete:true,capturedAt:'2026-10-16T12:00:00Z',source:'fictional-demo',accounts:rows},'Fictional current');
  previous=FollowingCore.parse({schema:'following-snapshot/v1',complete:true,capturedAt:'2026-10-01T12:00:00Z',source:'fictional-demo',accounts:[...rows.slice(2),{username:'old.example',full_name:'Previous example'}]},'Fictional previous');
  $('status').textContent='Loaded fictional examples. These names and relationships are invented.';resetFilters();render();
}
function resetFilters(){page=0;$('search').value='';$('filter').value='all';$('sort').value='source';}
async function importFile(kind,file){
  if(!file)return; const request=++version[kind];
  try{if(file.size>10*1024*1024)throw Error('File exceeds the 10 MiB limit.');const text=await file.text();const parsed=FollowingCore.parse(text,file.name);if(request!==version[kind])return;
    if(kind==='current')current=parsed;else previous=parsed;
    $('status').textContent=`Loaded ${file.name}. ${parsed.accounts.length} unique accounts; ${parsed.quality.duplicates} duplicates and ${parsed.quality.invalid} invalid records skipped.`;resetFilters();render();
  }catch(error){if(request===version[kind])$('status').textContent=error.message;}
}
function summary(snapshot){if(!snapshot)return 'No file loaded';const completeness=snapshot.complete===true?'Marked complete':snapshot.complete===false?'Marked partial':'Completeness unknown';return `${snapshot.label} · ${snapshot.accounts.length} accounts · ${completeness}${snapshot.capturedAt?' · '+snapshot.capturedAt.slice(0,10):''}`;}
function render(){
  $('current-info').textContent=summary(current);$('previous-info').textContent=summary(previous);
  const rows=current?(previous?FollowingCore.compare(current,previous):current.accounts.map(x=>({...x,status:'current'}))):[];
  const counts={shared:0,'only-current':0,'only-previous':0};rows.forEach(x=>{if(x.status in counts)counts[x.status]++;});
  $('total').textContent=current?.accounts.length??'—';$('shared').textContent=previous&&current?counts.shared:'—';$('added').textContent=previous&&current?counts['only-current']:'—';$('removed').textContent=previous&&current?counts['only-previous']:'—';
  const comparing=Boolean(current&&previous);$('filter').disabled=!comparing;$('clear-previous').disabled=!previous;
  if(!comparing)$('filter').value='all';
  visible=FollowingCore.select(rows,{query:$('search').value,status:$('filter').value,sort:$('sort').value});
  page=Math.min(page,Math.max(0,Math.ceil(visible.length/PAGE)-1));
  $('csv').disabled=!visible.length;$('json').disabled=!current;
  $('warning').textContent=comparing?'Presence differences are observations, not proof of follows or unfollows. Partial exports, collection timing, account renames and missing pages can change the result.':'Original API order is not a verified follow chronology. Recorded timestamps are shown only when present in the imported data.';
  $('rows').replaceChildren();
  for(const item of visible.slice(page*PAGE,(page+1)*PAGE)){
    const tr=document.createElement('tr');
    const name=document.createElement('td');const strong=document.createElement('strong');strong.textContent='@'+item.username;const sub=document.createElement('small');sub.textContent=item.full_name||'No display name';name.append(strong,sub);
    const state=document.createElement('td');const badge=document.createElement('span');badge.className='badge '+item.status;badge.textContent=labels[item.status];state.append(badge);
    const stamp=document.createElement('td');stamp.textContent=item.timestamp?new Date(item.timestamp*1000).toISOString().slice(0,10):'Not provided';
    const rank=document.createElement('td');rank.textContent=item.sourceIndex;
    tr.append(name,state,stamp,rank);$('rows').append(tr);
  }
  $('empty').hidden=visible.length>0;$('empty').textContent=current?'No accounts match these filters.':'Load a current snapshot or try the fictional example.';
  $('page-label').textContent=visible.length?`${page*PAGE+1}–${Math.min((page+1)*PAGE,visible.length)} of ${visible.length} accounts`:'0 accounts';
  $('back').disabled=page===0;$('next').disabled=(page+1)*PAGE>=visible.length;
}
function download(name,type,data){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('current-file').addEventListener('change',event=>void importFile('current',event.target.files[0]));
$('previous-file').addEventListener('change',event=>void importFile('previous',event.target.files[0]));
$('sample').onclick=sample;
$('clear-previous').onclick=()=>{version.previous++;previous=null;$('previous-file').value='';page=0;render();};
$('clear').onclick=()=>{version.current++;version.previous++;current=null;previous=null;$('current-file').value='';$('previous-file').value='';$('status').textContent='Cleared this tab’s imported data.';resetFilters();render();};
for(const id of ['search','filter','sort'])$(id).addEventListener('input',()=>{page=0;render();});
$('back').onclick=()=>{page--;render();};$('next').onclick=()=>{page++;render();};
$('csv').onclick=()=>download('following-view.csv','text/csv;charset=utf-8',FollowingCore.csv(visible));
$('json').onclick=()=>download('following-snapshot.json','application/json',JSON.stringify(current,null,2));
render();
