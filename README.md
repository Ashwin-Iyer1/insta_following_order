# 📱 Instagram Following List Exporter

A simple browser console script that exports a full Instagram following list to a JSON file.  
Works for **your own account** or **any other user's profile** — no downloads or installations required, runs entirely in your browser!

## ⚠️ WARNING

This tool uses the Instagram internal GraphQL API.  
**Use at your own risk — excessive use may trigger temporary rate limits.**

## 🖥️ Usage

![Demo](Untitled%202.jpg)

1. Go to [the copy page](https://ashwin-iyer1.github.io/insta_following_order/) and click **COPY** to copy the script.

2. Log in to [Instagram](https://www.instagram.com) in your browser.

3. **Navigate to the right page before running the script:**
   - To export **your own** following list → stay on any page (home, explore, etc.)
   - To export **another user's** following list → navigate to their profile page (`instagram.com/{username}`)

4. Open the developer console:
   - **Windows/Linux:** `Ctrl + Shift + J`
   - **Mac OS:** `⌘ + ⌥ + J`

5. Paste the copied script and press **Enter**.

6. The script will begin fetching the following list, logging progress as it goes:
   ```
   On profile page — looking up user ID for @someuser ...
   User ID: 123456789
     Fetched 50 so far ...
     Fetched 100 so far ...
   ```

7. When complete, a JSON file named `<username>_following.json` will automatically download.

## ⚡ How It Works

- **Auto-detects the target account** based on the current URL:
  - On a profile page (`instagram.com/{username}`) → looks up that user's ID via Instagram's search API
  - On any other page → falls back to reading your `ds_user_id` session cookie to identify the logged-in user
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

- 🔍 Exports any user's complete Instagram following list
- 🌐 **Profile page detection** — run on `instagram.com/{username}` to fetch that user's list automatically
- 🍪 Falls back to auto-detecting your logged-in account via browser cookie
- 💾 Downloads results as a `.json` file named `{username}_following.json`
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
