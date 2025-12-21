/**
 * We can't use the `tsc` command to generate types for the project because it
 * will generate types for each file in the project, which isn't needed. We only
 * need a single file that exports the App component.
 */
async function generateTypes() {
  const fs = require("fs")
  const path = require("path")

  const distDir = path.resolve(__dirname, "../dist")
  const filePath = path.join(distDir, "index.d.ts")

  const fileContent = `
declare function App(props: {
  plugins?: any[]
}): JSX.Element

export default App

import type enTranslation from "./en.json"
export type Resources = {
  translation: typeof enTranslation
}
`

  // Ensure the dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir)
  }

  // Write the content to the index.d.ts file
  fs.writeFileSync(filePath, fileContent.trim(), "utf8")

  // Copy the canonical en translation for type inference
  const enTranslationSrcPath = path.join(
    __dirname, "../src/i18n/translations/en.json"
  )
  const enTranslationDistPath = path.join(distDir, "en.json")
  fs.copyFileSync(enTranslationSrcPath, enTranslationDistPath)

  console.log(`File created at ${filePath}`)
}

;(async () => {
  try {
    await generateTypes()
  } catch (e) {
    console.error(e)
  }
})()
