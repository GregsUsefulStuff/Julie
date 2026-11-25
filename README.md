# Julie's Moonbook

A mobile moon, sky and tarot dashboard for Julie (Boise, ID). Everything runs in the browser: no server, no API keys.

## Files (upload all of them to the repo root)
- `index.html`: the page
- `style.css`: the look
- `app.js`: the logic, readings, tarot deck and song list
- `astronomy.min.js`: the astronomy library (don't edit)
- `icon-180.png`, `icon-512.png`, `manifest.webmanifest`: home-screen icon and app info

## Put it online with GitHub Pages
1. Create a new GitHub repo (for example `moonbook`).
2. Upload every file from this folder to the repo root (Add file > Upload files).
3. Go to Settings > Pages. Under "Build and deployment", choose Deploy from a branch, pick `main` and `/ (root)`, then Save.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/moonbook/`.

## Add to Julie's phone
- iPhone: open the link in Safari, tap Share, then Add to Home Screen.
- Android: open in Chrome, tap the menu, then Add to Home screen.

## What's inside
- Today's moon phase, moon sign, rise/set times and the week ahead (for Boise)
- A daily tarot card, the same all day and new each morning (tap to flip)
- A Grateful Dead song of the day with a play button (live recordings from the Internet Archive)
- Collective mood: the shared feel of today's sky
- Live planet positions and how they touch Julie's chart
- Julie's birth chart: Nov 22, 1978, 3:48 am, Modesto, CA

## Editing
Edit `app.js` in a plain-text editor or on GitHub (pencil icon). On a Mac, TextEdit must be in plain-text mode (Format > Make Plain Text) or it will corrupt the code. Birth data is near the top (`BIRTH`); tarot messages and the song list are plain lists.
