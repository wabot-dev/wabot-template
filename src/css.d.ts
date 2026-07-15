// Ambient types for stylesheet imports.
//   import href from './x.css'          -> served, cacheable URL (a string)
//   import styles from './x.module.css' -> scoped class map
declare module '*.module.css' {
  const classes: { readonly [key: string]: string }
  export default classes
}

declare module '*.css' {
  const href: string
  export default href
}
