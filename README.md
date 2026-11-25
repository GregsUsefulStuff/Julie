# Julie's Moonbook

A mobile moon, sky and tarot dashboard for Julie (Boise, ID). Everything runs in the browser: no server, no API keys.

## Put it online with GitHub Pages
1. Create a new GitHub repo (for example `moonbook`).
2. Upload every file in this folder to the repo root (Add file > Upload files).
3. Go to Settings > Pages. Under "Build and deployment", choose Deploy from a branch, pick `main` and `/ (root)`, then Save.
4. After a minute the site is live at `https://YOUR-USERNAME.github.io/moonbook/`.

## Add to Julie's phone
- iPhone: open the link in Safari, tap Share, then Add to Home Screen.
- Android: open in Chrome, tap the menu, then Add to Home screen.

## What's inside
- Today's moon phase, moon sign, rise/set times and the week ahead (for Boise)
- A daily tarot card, the same all day and new each morning (tap to flip)
- A Grateful Dead song of the day (title, album and a listen link)
- Live planet positions and how they touch Julie's chart
- Julie's birth chart: Nov 22, 1978, 3:48 am, Modesto, CA

## Customizing
Everything lives in `index.html`. Birth data is near the top of the script (`BIRTH`), and the tarot messages, Dead songs and moon text are plain lists you can edit.
