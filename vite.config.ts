import { defineConfig } from 'vite'

/*
It looks like we have to specifically exclude resolved module IDs, i.e.,
the full, absolute path to the module within node_modules. 
*/
function matchLit(id: string, parentId: string | undefined, isResolved: boolean) {
  if (id.match(/lit/)) {
    return true;
  }
  return false;
}

export default defineConfig({
  build: {
    sourcemap: true,
    lib: {
      entry: './lib/index.ts',
      formats: ['es']
    },
    rollupOptions: {
      external: matchLit
    }
  },
  server: {
    port: 5171
  },
})
