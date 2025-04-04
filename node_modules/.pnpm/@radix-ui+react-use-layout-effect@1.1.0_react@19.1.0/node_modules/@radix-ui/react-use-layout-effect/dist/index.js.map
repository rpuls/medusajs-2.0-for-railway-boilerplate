{
  "version": 3,
  "sources": ["../src/index.ts", "../src/useLayoutEffect.tsx"],
  "sourcesContent": ["export { useLayoutEffect } from './useLayoutEffect';\n", "import * as React from 'react';\n\n/**\n * On the server, React emits a warning when calling `useLayoutEffect`.\n * This is because neither `useLayoutEffect` nor `useEffect` run on the server.\n * We use this safe version which suppresses the warning by replacing it with a noop on the server.\n *\n * See: https://reactjs.org/docs/hooks-reference.html#uselayouteffect\n */\nconst useLayoutEffect = Boolean(globalThis?.document) ? React.useLayoutEffect : () => {};\n\nexport { useLayoutEffect };\n"],
  "mappings": ";;;;;;;;;;;;;;;;;;;;;;;;;;;;;;AAAA;AAAA;AAAA,yBAAAA;AAAA;AAAA;;;ACAA,YAAuB;AASvB,IAAMC,mBAAkB,QAAQ,YAAY,QAAQ,IAAU,wBAAkB,MAAM;AAAC;",
  "names": ["useLayoutEffect", "useLayoutEffect"]
}
