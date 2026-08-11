import fs from "node:fs";

const html = fs.readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const scriptPattern = /<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g;
const nodePattern = /\{id:"([^"]+)", label:/g;
const edgePattern = /\{id:"([^"]+)", a:"([^"]+)", b:"([^"]+)"/g;

const inlineScripts = [...html.matchAll(scriptPattern)]
  .map((match) => match[1])
  .filter((script) => script.trim());
for (const script of inlineScripts) {
  new Function(script);
}

const nodeIds = [...html.matchAll(nodePattern)].map((match) => match[1]);
const edges = [...html.matchAll(edgePattern)].map((match) => ({
  id: match[1],
  source: match[2],
  target: match[3]
}));
const duplicates = (items) => [...new Set(items.filter((item, index) => items.indexOf(item) !== index))];
const missingEndpoints = [...new Set(edges.flatMap((edge) => [edge.source, edge.target]).filter((id) => !nodeIds.includes(id)))];
const duplicateNodes = duplicates(nodeIds);
const duplicateEdges = duplicates(edges.map((edge) => edge.id));

if (duplicateNodes.length || duplicateEdges.length || missingEndpoints.length) {
  console.error({duplicateNodes, duplicateEdges, missingEndpoints});
  process.exit(1);
}

const requiredFeatures = [
  'id="degree-depth"',
  'id="copy-trace"',
  "function appendEvidenceStep",
  "function setTraceUrl",
  "recentRandomPairs"
];
const missingFeatures = requiredFeatures.filter((feature) => !html.includes(feature));
if (missingFeatures.length) {
  console.error({missingFeatures});
  process.exit(1);
}

console.log(`Validated ${nodeIds.length} nodes, ${edges.length} edges, and ${inlineScripts.length} inline scripts.`);
