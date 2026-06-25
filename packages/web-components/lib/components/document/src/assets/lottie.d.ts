// dotLottie animations imported as inlined data URIs via Vite's ?inline query
// so they ship inside the JS bundle (no loose asset files that break in
// library mode), mirroring how shimmer SVGs are inlined via ?raw.
declare module '*.lottie?inline' {
  const src: string;
  export default src;
}

declare module '*.lottie' {
  const src: string;
  export default src;
}
