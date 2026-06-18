// SVG icons imported as inlined data URIs via Vite's ?inline query so they
// ship inside the JS bundle (no loose asset files that break in library mode)
// while still being usable as an <img src>. Used for guideline illustrations
// that exceed Vite's default inline byte limit.
declare module '*.svg?inline' {
  const src: string;
  export default src;
}
