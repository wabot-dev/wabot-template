// Ambient types so TypeScript understands stylesheet imports. The island bundler
// (and, for SSR/dev/tests, `@wabot-dev/framework/ui/css-loader`) turn
// `*.module.css` into a scoped class map and treat plain `*.css` as global styles.
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.css' {
  const css: string
  export default css
}
