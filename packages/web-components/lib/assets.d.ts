// Ambient module declarations for non-code assets resolved by Vite.
//
// These live in a dedicated file (with no top-level `import`/`export`) so
// they remain in the global script namespace. `lib/types.d.ts` is a module
// (it ends with `export {}` so it can use `declare global`), which would
// otherwise demote these wildcards to module scope and stop them matching
// imports across the codebase.

declare module '*.lottie' {
  const src: string;
  export default src;
}

declare module '*.lottie?url' {
  const src: string;
  export default src;
}
