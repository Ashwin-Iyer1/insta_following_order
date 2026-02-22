(() => {
    (async () => {
        let f = (e) => new Promise((s) => setTimeout(s, e));

        // Detect if currently on a user profile page (e.g. instagram.com/{username})
        const pathParts = location.pathname.split("/").filter(Boolean);
        const knownPaths = ["explore", "reels", "direct", "stories", "accounts", "tv", "p", "ar", "about", "hashtag", "locations", "audio"];
        const isProfilePage = pathParts.length >= 1 && !knownPaths.includes(pathParts[0]);

        let i, fileLabel;

        if (isProfilePage) {
            const targetUsername = pathParts[0];
            console.log(`On profile page — looking up user ID for @${targetUsername} ...`);
            let res = await fetch(`https://www.instagram.com/web/search/topsearch/?query=${encodeURIComponent(targetUsername)}`, { credentials: "include" });
            let data = await res.json();
            let c = data.users?.find((e) => e.user.username === targetUsername)?.user;
            if (!c) throw new Error(`User "${targetUsername}" not found in search results`);
            i = c.pk;
            fileLabel = targetUsername;
            console.log(`User ID: ${i}`);
        } else {
            // Fall back to the logged-in user via the ds_user_id cookie
            let cookieId = ("; " + document.cookie).split("; ds_user_id=").length === 2
                ? ("; " + document.cookie).split("; ds_user_id=").pop().split(";").shift()
                : null;
            if (!cookieId) throw new Error("Not logged in — ds_user_id cookie not found");
            i = cookieId;
            fileLabel = cookieId;
            console.log(`User ID: ${i}`);
        }
        let w = "d04b0a864b4b54837c0d870b0e77e076",
            n = [],
            u = !0,
            a = null;
        for (; u; ) {
            let e = { id: i, include_reel: !0, fetch_mutual: !0, first: 50 };
            a && (e.after = a);
            let s = `https://www.instagram.com/graphql/query/?query_hash=${w}&variables=${encodeURIComponent(JSON.stringify(e))}`;
            await f(2e3 + Math.random() * 3e3);
            let l = await fetch(s, { credentials: "include" });
            if (!l.ok) {
                console.error(`Request failed: ${l.status}`);
                break;
            }
            let r = (await l.json()).data.user.edge_follow;
            for (let d of r.edges) n.push({ username: d.node.username, full_name: d.node.full_name || "" });
            (u = r.page_info.has_next_page),
                (a = r.page_info.end_cursor),
                console.log(`  Fetched ${n.length} so far ...`);
        }
        console.log(`\nTotal following: ${n.length}\n`);
        console.log(`Most recently followed → oldest:\n`);
        console.table(n.map((e, s) => ({ "#": s + 1, username: `@${e.username}`, full_name: e.full_name })));

        // ── JSON download ──────────────────────────────────────────────
        let g = new Blob([JSON.stringify(n, null, 2)], { type: "application/json" }),
            dl = document.createElement("a");
        dl.href = URL.createObjectURL(g);
        dl.download = `${fileLabel}_following.json`;
        dl.click();
        console.log(`\n✓ Downloaded ${fileLabel}_following.json`);

        // ── HTML visualisation tab ──────────────────────────────────────
        const tableRows = n.map((e, idx) => `
            <tr data-index="${idx + 1}" data-username="${e.username.toLowerCase()}" data-fullname="${(e.full_name || "").toLowerCase().replace(/"/g, '&quot;')}">
                <td class="num">${idx + 1}</td>
                <td><a href="https://www.instagram.com/${e.username}/" target="_blank" rel="noreferrer">@${e.username}</a></td>
                <td class="full">${(e.full_name || "").replace(/</g, '&lt;').replace(/>/g, '&gt;')}</td>
            </tr>`).join("");

        // Build the filter JS as a separate blob to bypass Instagram's CSP
        const filterJS = `(function(){
  var q=document.getElementById('q');
  var rows=Array.from(document.querySelectorAll('#tbody tr'));
  var label=document.getElementById('countLabel');
  var empty=document.getElementById('empty');
  function filter(){
    var v=q.value.trim();
    var c=0;
    var isNum=/^[0-9]+$/.test(v);
    rows.forEach(function(r){
      var match;
      if(v===''){match=true;}
      else if(isNum){match=r.dataset.index===v;}
      else{var lv=v.toLowerCase();match=r.dataset.username.indexOf(lv)!==-1||r.dataset.fullname.indexOf(lv)!==-1;}
      r.style.display=match?'':'none';
      if(match)c++;
    });
    label.textContent=c+' account'+(c===1?'':'s');
    empty.style.display=c===0?'block':'none';
  }
  q.addEventListener('input',filter);
  q.addEventListener('keyup',filter);
})();`;
        const jsBlob = new Blob([filterJS], { type: "application/javascript" });
        const jsBlobUrl = URL.createObjectURL(jsBlob);

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${fileLabel} — Following (${n.length})</title>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#0a0a0a;color:#e0e0e0;padding:2rem 1.5rem 4rem}
  h1{font-size:1.5rem;font-weight:700;color:#fff;margin-bottom:0.3rem}
  .meta{color:#666;font-size:0.85rem;margin-bottom:1.5rem}
  .meta span{color:#aaa}
  .toolbar{display:flex;gap:1rem;align-items:center;margin-bottom:1.2rem;flex-wrap:wrap}
  input{flex:1;min-width:200px;background:#141414;border:1px solid #2a2a2a;border-radius:8px;padding:0.6rem 1rem;color:#e0e0e0;font-size:0.9rem;outline:none}
  input:focus{border-color:#0070f3}
  input::placeholder{color:#555}
  .count{color:#555;font-size:0.85rem;white-space:nowrap}
  table{width:100%;border-collapse:collapse}
  thead th{text-align:left;padding:0.6rem 0.9rem;font-size:0.72rem;text-transform:uppercase;letter-spacing:0.07em;color:#555;border-bottom:1px solid #1e1e1e}
  tbody tr{border-bottom:1px solid #151515;transition:background 0.1s}
  tbody tr:hover{background:#121212}
  td{padding:0.65rem 0.9rem;font-size:0.875rem;vertical-align:middle}
  td.num{color:#444;width:3rem;font-size:0.78rem}
  td a{color:#a0c4ff;text-decoration:none;font-weight:500}
  td a:hover{text-decoration:underline}
  td.full{color:#888}
  .empty{text-align:center;padding:3rem;color:#444;font-size:0.9rem}
</style>
</head>
<body>
<h1>@${fileLabel} — Following</h1>
<p class="meta">Exported <span>${new Date().toLocaleString()}</span> &nbsp;·&nbsp; <span>${n.length} accounts</span> &nbsp;·&nbsp; most recently followed → oldest</p>
<div class="toolbar">
  <input id="q" type="text" placeholder="Filter by username or name…" autofocus/>
  <span class="count" id="countLabel">${n.length} accounts</span>
</div>
<table>
  <thead><tr><th>#</th><th>Username</th><th>Full Name</th></tr></thead>
  <tbody id="tbody">${tableRows}</tbody>
</table>
<p class="empty" id="empty" style="display:none">No results</p>
<script src="${jsBlobUrl}"></script>
</body>
</html>`;

        const vizBlob = new Blob([html], { type: "text/html" });
        window.open(URL.createObjectURL(vizBlob), "_blank");
        console.log(`✓ Opened visualisation tab`);
    })();
})();
