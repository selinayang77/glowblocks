# GlowBlocks

A mobile-first screen fill light built with React, TypeScript and Vite.

```bash
npm install
npm run dev      # serves on http://localhost:5173 and your LAN IP (open that on your phone)
npm run build    # type-check and production build into dist/
```

- Colour presets: `src/data/palette.ts`
- Scene suggestions: `src/data/scenes.ts`
- The intensity slider dims the on-screen colour only. Web apps can't change the phone's hardware brightness.
