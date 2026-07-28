import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const pagePath = path.join(root, "carga-masiva.html");
const indexPath = path.join(root, "index.html");
const dashboardPath = path.join(root, "dashboard.html");

const page = fs.readFileSync(pagePath, "utf8");
const index = fs.readFileSync(indexPath, "utf8");
const dashboard = fs.readFileSync(dashboardPath, "utf8");

const inlineScripts = [...page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.includes("const DRAFTS_KEY"));

assert.equal(inlineScripts.length, 1, "Debe existir un script principal de carga masiva.");
const api = Function(`${inlineScripts[0]}; return BULK_TEST_API;`)();

const header = ["nombreRecurso", "categoria", "tipoRecurso", "subtipoRecurso"];
const natural = ["Recurso Natural", "Montaña", "Cerro"];
const cultural = ["Recurso Cultural", "Arquitectura", "Monumento histórico"];
const matrix = [
  header,
  ...Array.from({ length: 20 }, (_, index) => [
    `Atractivo de prueba ${String(index + 1).padStart(2, "0")}`,
    ...(index % 2 === 0 ? natural : cultural)
  ])
];

const rows = api.matrixToObjects(matrix);
const validations = api.validateBatch(rows, []);
assert.equal(rows.length, 20, "La carga debe conservar las 20 filas.");
assert.equal(validations.filter(item => item.valid).length, 20, "Las 20 filas deben ser válidas.");

const csv = [
  "nombreRecurso;categoria;tipoRecurso;subtipoRecurso",
  '"Mirador, Costero";Recurso Natural;Costa;Acantilado o farellón'
].join("\n");
const csvRows = api.matrixToObjects(api.parseDelimited(csv));
assert.equal(csvRows.length, 1);
assert.equal(csvRows[0].nombreRecurso, "Mirador, Costero");
assert.equal(api.validateBatch(csvRows, [])[0].valid, true);

const duplicated = [...rows, { ...rows[0], id: "duplicate-row" }];
const duplicateValidation = api.validateBatch(duplicated, []);
assert.equal(duplicateValidation.at(-1).valid, false);
assert.ok(duplicateValidation.at(-1).errors.includes("Duplicado dentro del lote"));

const invalid = api.canonicalizeRow({
  nombreRecurso: "Clasificación incorrecta",
  categoria: "Recurso Natural",
  tipoRecurso: "Arquitectura",
  subtipoRecurso: "Museo"
});
assert.equal(api.validateBatch([invalid], [])[0].valid, false);

const blankMatrix = [header, ["", "", "", ""]];
assert.equal(api.matrixToObjects(blankMatrix).length, 0, "La plantilla vacía no debe crear filas.");

const draft = api.createDraft(rows[0], "2026-07-28T12:00:00.000Z", "bulk-test");
assert.equal(draft.data.values.estado_registro, "borrador");
assert.equal(draft.data.values.id_unico, undefined);
assert.equal(draft.data.values.nombreRecurso, rows[0].nombreRecurso);
assert.equal(draft.data.photos.length, 0);

const checks = {
  pageSyntax: true,
  maxTwentyRows: page.includes("const MAX_BATCH_ROWS = 20"),
  supportsExcel: page.includes("xlsx.full.min.js") && page.includes("XLSX.read"),
  supportsCsvAndPaste: page.includes("parseDelimited") && page.includes("pasteInput"),
  usesCurrentDraftStorage: page.includes("catastro_prototipo_drafts_v3"),
  preventsDuplicates: page.includes("Duplicado dentro del lote"),
  indexKeepsDraftIdentity:
    index.includes("let activeDraftId = null")
    && index.includes("keepDraftIdentity")
    && index.includes("initialParams.get('draft')"),
  storesAtLeastTwentyDrafts: index.includes("nextDrafts.slice(0, 100)"),
  navigationConnected:
    index.includes('href="carga-masiva.html"')
    && dashboard.includes('href="carga-masiva.html"'),
  twentyValidRows: validations.every(item => item.valid)
};

const failed = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

console.log(JSON.stringify({
  ok: failed.length === 0,
  checks,
  failed,
  testedRows: rows.length
}, null, 2));

if (failed.length) process.exitCode = 1;
