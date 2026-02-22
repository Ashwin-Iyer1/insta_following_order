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
        console.log(`
Total following: ${n.length}
`),
            console.log(`Most recently followed \u2192 oldest:
`),
            console.table(n.map((e, s) => ({ "#": s + 1, username: `@${e.username}`, full_name: e.full_name })));
        let g = new Blob([JSON.stringify(n, null, 2)], { type: "application/json" }),
            t = document.createElement("a");
        (t.href = URL.createObjectURL(g)),
            (t.download = `${fileLabel}_following.json`),
            t.click(),
            console.log(`\n✓ Downloaded ${fileLabel}_following.json`);
    })();
})();
