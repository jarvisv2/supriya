# For Supriya — Birthday Experience

A responsive, animated, single-page birthday journey designed for GitHub Pages. The demo unlock date is **12 October 2026 at 3:00 PM IST**.

## Preview locally

1. Extract the ZIP.
2. Open `index.html` in a modern browser, or use VS Code → **Live Server** for the smoothest local preview.
3. To preview the whole journey immediately, change `UNLOCK_AT` near the top of `script.js` to a date/time in the past, save, then refresh.
4. To test the countdown, set `UNLOCK_AT` to a future time. The date includes `+05:30` so it is interpreted as Indian Standard Time.

> Remember to restore the real date/time before deploying. The configured demo deadline is already in the source.

## Add the soundtrack

Put your song here, with this exact filename:

`assets/audio/birthday-song.mp3`

The site uses one persistent HTML audio element for the entire journey; scene changes do not reload the audio. Browsers can block audible autoplay. The site attempts to start music when the countdown unlocks and shows a music prompt if the browser requires a click. The small **♫ Sound on** control can pause or resume it later.

## Add your photos

Put up to 12 photos in `assets/photos/` using these exact names:

```text
memory-01.jpg
memory-02.jpg
memory-03.jpg
memory-04.jpg
memory-05.jpg
memory-06.jpg
memory-07.jpg
memory-08.jpg
memory-09.jpg
memory-10.jpg
memory-11.jpg
memory-12.jpg
```

Use `.jpg` filenames as written, or update `PHOTO_EXTENSION` in `script.js` if your files use a different extension. Photos should ideally be portrait or square; the gallery crops images to fit its floating polaroid frames. Before you upload the photos, illustrated placeholder cards appear instead of broken image icons.

## Personalize the letter

Open `script.js` and replace `LETTER_TEXT` and `LETTER_SIGNOFF` near the top with your actual message. Use `\n\n` to create a blank line between paragraphs. The typewriter preserves these line breaks.

## Change the unlock date

At the top of `script.js`:

```js
UNLOCK_AT: '2026-10-12T15:00:00+05:30',
```

Use `YYYY-MM-DDTHH:mm:ss+05:30` for a date/time in IST. Example: `2026-10-20T18:30:00+05:30` means 20 October 2026, 6:30 PM IST.

## Deploy to GitHub Pages

1. Create or open the GitHub repository for this site.
2. Upload **the contents of this folder** (so `index.html` is at the repository root, not one folder deeper).
3. Commit and push the files to your selected branch.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**, select your branch (usually `main`) and folder `/ (root)`, then save.
6. Wait for GitHub Pages to finish its deployment and open the provided Pages URL.
7. Add the soundtrack and photos to their folders and commit them. After you add your real letter/date, commit those changes too.

No build step, npm install, API key, or backend is required.

## Folder structure

```text
supriya-birthday-site/
├── index.html
├── styles.css
├── script.js
├── favicon.svg
├── README.md
└── assets/
    ├── audio/
    │   ├── .gitkeep
    │   └── README.md
    └── photos/
        ├── .gitkeep
        └── README.md
```

## Notes

- A static GitHub Pages site is client-side. The countdown is a presentation lock, not a secure access-control system; visitors who inspect the source can see the date and website assets.
- Sound autoplay depends on the visitor's browser settings. This project handles autoplay being blocked by showing a prompt instead of silently failing.
- External Google Fonts are used with local system fallbacks. If a visitor is offline, the experience still works with the fallback fonts.

## Responsive layout

The layout adapts automatically to the available screen width and height using responsive CSS breakpoints and viewport sizing. Smaller phones use a compact cake and photo layout; short landscape screens use a more compact memory heading; larger phones and laptops use the expanded composition. No device-specific setup is needed.
