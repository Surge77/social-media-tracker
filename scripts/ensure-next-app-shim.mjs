import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()

const commonJsTarget = path.join(root, 'node_modules', 'next', 'dist', 'pages', '_app.js')
const esmTarget = path.join(root, 'node_modules', 'next', 'dist', 'esm', 'pages', '_app.js')

const commonJsSource = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
function App(props) {
  const Component = props.Component;
  return (0, jsx_runtime_1.jsx)(Component, { ...props.pageProps });
}
exports.default = App;
`

const esmSource = `import { jsx as _jsx } from "react/jsx-runtime";
export default function App(props) {
  const Component = props.Component;
  return _jsx(Component, { ...props.pageProps });
}
`

await mkdir(path.dirname(commonJsTarget), { recursive: true })
await mkdir(path.dirname(esmTarget), { recursive: true })
await writeFile(commonJsTarget, commonJsSource, 'utf8')
await writeFile(esmTarget, esmSource, 'utf8')
