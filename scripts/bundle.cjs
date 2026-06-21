/* Regenerate data.js (inline bundle) from data/*.json so the app runs on file://
 * without a server. Run:  node scripts/bundle.cjs
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8").trim();

const out =
  "/* AUTO-GENERATED from data/*.json — run `node scripts/bundle.cjs` to regenerate. Do not edit by hand. */\n" +
  "window.PUNJAB = {\n" +
  "  constituencies: " + read("data/constituencies.json") + ",\n" +
  "  pincodes: " + read("data/pincodes.json") + ",\n" +
  "  framework: " + read("data/framework.json") + "\n" +
  "};\n";

fs.writeFileSync(path.join(root, "data.js"), out);
console.log("Wrote data.js (" + out.length + " bytes)");
