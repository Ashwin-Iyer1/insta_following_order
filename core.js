(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FollowingCore=api;})(globalThis,()=>{
  'use strict';
  const LIMIT=50000;
  function parse(input,label='Imported snapshot'){
    if(typeof input==='string'){if(input.length>10*1024*1024)throw Error('File exceeds the 10 MiB limit.');try{input=JSON.parse(input);}catch{throw Error('Choose a valid JSON export.');}}
    let rows,format;
    if(Array.isArray(input)){rows=input;format='Legacy account list';}
    else if(input&&Array.isArray(input.relationships_following)){rows=input.relationships_following;format='Instagram account export';}
    else if(input&&input.schema==='following-snapshot/v1'&&Array.isArray(input.accounts)){rows=input.accounts;format='Following snapshot';}
    else throw Error('Unsupported JSON. Use an account array, relationships_following export, or following-snapshot/v1.');
    if(rows.length>LIMIT)throw Error(`Snapshot exceeds ${LIMIT.toLocaleString()} records.`);
    const accounts=[],seen=new Set();let duplicates=0,invalid=0;
    rows.forEach((row,index)=>{
      const item=row&&typeof row==='object'?row:{};
      const nested=Array.isArray(item.string_list_data)?item.string_list_data[0]:null;
      const raw=item.username||nested?.value||item.title;
      if(typeof raw!=='string'){invalid++;return;}
      const username=raw.trim().replace(/^@/,'');
      if(!/^[A-Za-z0-9._]{1,30}$/.test(username)){invalid++;return;}
      const key=username.toLowerCase();if(seen.has(key)){duplicates++;return;}seen.add(key);
      const stamp=item.timestamp??nested?.timestamp;
      const timestamp=typeof stamp==='number'&&Number.isSafeInteger(stamp)&&stamp>0&&stamp<=253402300799?stamp:null;
      const sourceIndex=input?.schema==='following-snapshot/v1'&&Number.isSafeInteger(item.sourceIndex)&&item.sourceIndex>0?item.sourceIndex:index+1;
      accounts.push({username,full_name:typeof item.full_name==='string'?item.full_name.slice(0,300):'',timestamp,sourceIndex});
    });
    if(rows.length&&accounts.length===0)throw Error('No valid account records found.');
    return {schema:'following-snapshot/v1',label:String(label).slice(0,100),source:typeof input?.source==='string'?input.source.slice(0,100):format,capturedAt:typeof input?.capturedAt==='string'&&Number.isFinite(Date.parse(input.capturedAt))?new Date(input.capturedAt).toISOString():null,complete:typeof input?.complete==='boolean'?input.complete:null,accounts,quality:{inputRows:rows.length,duplicates,invalid,undated:accounts.filter(x=>x.timestamp===null).length},format};
  }
  function compare(current,previous){
    const old=new Map(previous.accounts.map(x=>[x.username.toLowerCase(),x]));
    const now=new Set(current.accounts.map(x=>x.username.toLowerCase()));
    return [...current.accounts.map(account=>({...account,status:old.has(account.username.toLowerCase())?'shared':'only-current'})),...previous.accounts.filter(x=>!now.has(x.username.toLowerCase())).map(account=>({...account,status:'only-previous'}))];
  }
  function select(rows,{query='',status='all',sort='source'}={}){
    const needle=query.trim().toLowerCase();
    const selected=rows.filter(x=>(status==='all'||x.status===status)&&(!needle||(x.username+' '+x.full_name).toLowerCase().includes(needle)));
    if(sort==='name')selected.sort((a,b)=>a.username.toLowerCase().localeCompare(b.username.toLowerCase(),'en'));
    if(sort==='timestamp')selected.sort((a,b)=>(b.timestamp??-1)-(a.timestamp??-1)||a.username.localeCompare(b.username));
    return selected;
  }
  function csv(rows){
    const cell=value=>{let text=String(value??'');if(/^[\s]*[=+\-@]/.test(text)||/^[\t\r\n]/.test(text))text="'"+text;return '"'+text.replaceAll('"','""')+'"';};
    return ['username,full_name,status,recorded_timestamp,source_position',...rows.map(x=>[x.username,x.full_name,x.status||'current',x.timestamp?new Date(x.timestamp*1000).toISOString():'',x.sourceIndex].map(cell).join(','))].join('\r\n');
  }
  return {parse,compare,select,csv,LIMIT};
});
