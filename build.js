const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const file of fs.readdirSync(src)) {
    const s = path.join(src, file);
    const d = path.join(dest, file);
    if (fs.lstatSync(s).isDirectory()) {
      copyRecursive(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

async function run() {
  const srcDir = path.join("clients", "1.9");
  const outDir = path.join("dist", "1.9");

  console.log(`Copying ${srcDir} -> ${outDir}`);
  copyRecursive(srcDir, outDir);

  // If a main.js exists, bundle and minify it
  const mainFile = path.join(srcDir, "main.js");
  if (fs.existsSync(mainFile)) {
    await esbuild.build({
      entryPoints: [mainFile],
      bundle: true,
      minify: true,
      outfile: path.join(outDir, "bundle.js"),
      define: { "process.env.NODE_ENV": '"production"' },
      target: ["es2017"],
    });
  }

  // Copy landing page + styles
  fs.copyFileSync("index.html", "dist/index.html");
  if (fs.existsSync("styles.css")) {
    fs.copyFileSync("styles.css", "dist/styles.css");
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
