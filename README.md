# 📱 Instagram Following List Exporter

A simple browser console script that exports your full Instagram following list to a JSON file.  
<u>No downloads or installations required — runs entirely in your browser!</u>

## ⚠️ WARNING

This tool uses the Instagram internal GraphQL API.  
**Use at your own risk — excessive use may trigger temporary rate limits.**

## 🖥️ Usage

![Demo](Untitled%202.jpg)

1. Go to [the copy page](https://ashwin-iyer1.github.io/insta_following_order/) and click **COPY** to copy the script.

2. Log in to [Instagram](https://www.instagram.com) in your browser.

3. Open the developer console:
   - **Windows/Linux:** `Ctrl + Shift + J`
   - **Mac OS:** `⌘ + ⌥ + J`

4. Paste the copied script and press **Enter**.

5. The script will begin fetching your following list, logging progress as it goes:
   ```
   User ID: 123456789
     Fetched 50 so far ...
     Fetched 100 so far ...
   ```

6. When complete, a JSON file named `<your_user_id>_following.json` will automatically download containing all accounts you follow.

## ⚡ How It Works

- Reads your `ds_user_id` session cookie to identify the logged-in user — **no username input needed**
- Paginates through Instagram's GraphQL API (`edge_follow`) fetching 50 accounts per request
- Adds a randomized delay (2–5 seconds) between requests to avoid rate limiting
- Outputs a JSON array of `{ username, full_name }` objects sorted most-recently-followed → oldest

## 📦 Output Format

```json
[
  { "username": "someuser", "full_name": "Some User" },
  { "username": "anotheruser", "full_name": "Another User" }
]
```

## ✨ Features

- 🔍 Exports your complete Instagram following list
- 🍪 Auto-detects your logged-in account via browser cookie
- 💾 Downloads results as a `.json` file
- ⏱️ Built-in rate-limit protection with randomized delays
- 🔒 Runs entirely in your browser — no data sent to any external server

## 🛠️ Development

To modify and rebuild the script:

```bash
# Install esbuild
npm install -D esbuild

# Build minified output
npx esbuild fetch_following_list.js --bundle --minify --outfile=fetch_following_console.min.js
```

Edit `fetch_following_list.js`, then rebuild to update `fetch_following_console.min.js`.

## ⚖️ Legal & License

**Disclaimer:** This tool is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram or Meta.

⚠️ Use at your own risk!

📜 Licensed under the [MIT License](LICENSE)
- ✅ Free to use, copy, and modify
- 🤝 Open source and community-friendly
