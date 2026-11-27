import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'codemirror-langs',
              test: /node_modules[\\/](@codemirror[\\/]language-data|@codemirror[\\/]lang-|@lezer)/,
            },
            {
              name: 'codemirror',
              test: /node_modules[\\/](@codemirror|@uiw[\\/]react-codemirror)/,
            },
            {
              name: 'markdown',
              test: /node_modules[\\/](react-markdown|remark-|rehype-|unified|mdast-|hast-|micromark|vfile|unist-|property-information|comma-separated-tokens|space-separated-tokens)/,
            },
            {
              name: 'vendor',
              test: /node_modules[\\/](react|react-dom|date-fns|idb|nanoid)/,
            },
          ],
        },
      },
    },
  },
})
