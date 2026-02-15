import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import fs from "fs";

// Copy static extension files to dist
function copyExtensionFiles() {
  return {
    name: "copy-extension-files",
    writeBundle() {
      const publicDir = resolve(__dirname, "public");
      const distDir = resolve(__dirname, "dist");

      // Copy manifest.json
      fs.copyFileSync(
        resolve(publicDir, "manifest.json"),
        resolve(distDir, "manifest.json"),
      );

      // Copy background.js
      fs.copyFileSync(
        resolve(publicDir, "background.js"),
        resolve(distDir, "background.js"),
      );

      // Copy content.js
      fs.copyFileSync(
        resolve(publicDir, "content.js"),
        resolve(distDir, "content.js"),
      );

      // Copy icons directory
      const iconsDir = resolve(publicDir, "icons");
      const distIconsDir = resolve(distDir, "icons");
      if (fs.existsSync(iconsDir)) {
        if (!fs.existsSync(distIconsDir)) {
          fs.mkdirSync(distIconsDir, { recursive: true });
        }
        fs.readdirSync(iconsDir).forEach((file) => {
          fs.copyFileSync(resolve(iconsDir, file), resolve(distIconsDir, file));
        });
      }
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), copyExtensionFiles()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "index.html"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
