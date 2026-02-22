(() => {
    (async () => {
        let o = ("; " + document.cookie).split("; ds_user_id=").length === 2
            ? ("; " + document.cookie).split("; ds_user_id=").pop().split(";").shift()
            : null;
        if (!o) throw new Error("Not logged in — ds_user_id cookie not found");
        let f = (e) => new Promise((s) => setTimeout(s, e));
        let i = o;
        console.log(`User ID: ${i}`);
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
        console.log(`
Total following: ${n.length}
`),
            console.log(`Most recently followed \u2192 oldest:
`),
            console.table(n.map((e, s) => ({ "#": s + 1, username: `@${e.username}`, full_name: e.full_name })));
        let g = new Blob([JSON.stringify(n, null, 2)], { type: "application/json" }),
            t = document.createElement("a");
        (t.href = URL.createObjectURL(g)),
            (t.download = `${o}_following.json`),
            t.click(),
            console.log(`\n✓ Downloaded ${o}_following.json`);
    })();
})();
