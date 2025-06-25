import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
  react(),
  tailwindcss(),
  viteStaticCopy({
    targets : [
      { src : "src/manifest.json" , dest : "."},
      { src : "src/icons/icon.svg" , dest : "./icons"}
    ]
  })],
  build : {
    outDir : "extension",
    rollupOptions : {
      input : {
        popup : path.resolve(__dirname , "src/popup/popup.html"),
        settings : path.resolve(__dirname , "src/settings/settings.html"),
        background : path.resolve(__dirname , "src/background.ts"),
        content_script : path.resolve(__dirname , "src/content_script.ts")
      },
      output : {
        // entryFileNames : ((chunkInfo)=>{
        //   if(chunkInfo.name === "popup" || chunkInfo.name === "settings") return `${chunkInfo.name}.js`
        //   else return "[name].js"
        // }),
        entryFileNames : "[name].js"
      }
    }
  }
})
