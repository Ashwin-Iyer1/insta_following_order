/* Optional legacy console exporter. The local viewer does not execute this. */
(async () => {
  'use strict';
  if (location.protocol !== 'https:' || !['instagram.com', 'www.instagram.com'].includes(location.hostname)) throw Error('Run only on an Instagram HTTPS page.');
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  const read = async path => {
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 20000);
    try { const response = await fetch(new URL(path, location.origin), { credentials:'include', signal:controller.signal }); if (!response.ok) throw Error(`Request returned HTTP ${response.status}`); return await response.json(); }
    finally { clearTimeout(timer); }
  };
  const reserved = new Set(['explore','reels','direct','stories','accounts','tv','p','ar','about','hashtag','locations','audio','reel']);
  const parts = location.pathname.split('/').filter(Boolean);
  const username = parts.length === 1 && !reserved.has(parts[0]) && /^[A-Za-z0-9._]{1,30}$/.test(parts[0]) ? parts[0] : null;
  if (!confirm(`Export ${username ? '@'+username : 'your signed-in account'} following snapshot? This uses Instagram’s undocumented web API. It may be incomplete and its order is not verified chronology.`)) return;
  let id;
  if (username) {
    const lookup = await read('/web/search/topsearch/?query='+encodeURIComponent(username));
    id = lookup.users?.find(row=>row.user?.username?.toLowerCase()===username.toLowerCase())?.user.pk;
    if (!id) throw Error('Exact account was not found. No export was created.');
  } else id = document.cookie.split('; ').find(row=>row.startsWith('ds_user_id='))?.split('=')[1];
  if (!/^\d+$/.test(String(id||''))) throw Error('A valid account ID was not available.');
  const result = { schema:'following-snapshot/v1',source:'instagram-undocumented-web-api',capturedAt:new Date().toISOString(),complete:false,accounts:[],order:'API response order; chronology unverified',issue:null };
  const seen = new Set(),cursors = new Set(); let cursor=null;
  try {
    for(let page=0;page<1000;page++) {
      await pause(2000+Math.random()*3000);
      const variables={id:String(id),include_reel:false,fetch_mutual:false,first:50,...(cursor?{after:cursor}:{})};
      const data=await read('/graphql/query/?query_hash=d04b0a864b4b54837c0d870b0e77e076&variables='+encodeURIComponent(JSON.stringify(variables)));
      const connection=data.data?.user?.edge_follow;
      if(!Array.isArray(connection?.edges)||typeof connection?.page_info?.has_next_page!=='boolean')throw Error('Response format changed or account is unavailable.');
      for(const edge of connection.edges){const node=edge.node;if(!/^[A-Za-z0-9._]{1,30}$/.test(node?.username||''))throw Error('An invalid account record interrupted this page.');const key=node.username.toLowerCase();if(!seen.has(key)){seen.add(key);result.accounts.push({username:node.username,full_name:typeof node.full_name==='string'?node.full_name:''});}}
      console.info(`Following snapshot: ${result.accounts.length} unique accounts collected.`);
      if(!connection.page_info.has_next_page){result.complete=true;break;}
      cursor=connection.page_info.end_cursor;
      if(typeof cursor!=='string'||!cursor||cursors.has(cursor))throw Error('Missing or repeated pagination cursor.');
      cursors.add(cursor);
      if(page===999||result.accounts.length>=50000)throw Error('Stopped at the collection limit.');
    }
  }catch(error){result.issue=error.name==='AbortError'?'Request timed out.':error.message;console.warn('Partial snapshot: '+result.issue);}
  const link=document.createElement('a');const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);
  link.href=url;link.download=`${username||'my-account'}_following_${result.complete?'snapshot':'PARTIAL'}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
  console.info(`${result.complete?'Completed API pagination':'Partial export'}: ${result.accounts.length} unique records. Import JSON into Following Atlas. Completeness is not independently verified.`);
})().catch(error=>console.error('Following export stopped: '+error.message));
