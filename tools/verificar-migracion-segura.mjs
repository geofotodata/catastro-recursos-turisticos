import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.resolve(__dirname, "..");
const scriptPath = path.join(projectDir, "apps-script-migracion-segura.gs");
const indexPath = path.join(projectDir, "index.html");
const schemaPath = path.join(projectDir, "tools", "build-simulacion-formulario.mjs");

const appScript = fs.readFileSync(scriptPath, "utf8");
const indexHtml = fs.readFileSync(indexPath, "utf8");
const schemaSource = fs.readFileSync(schemaPath, "utf8");

new Function(appScript);

const headersMatch = appScript.match(/var HEADERS = (\[[\s\S]*?\n\]);/);
const columnsMatch = schemaSource.match(/const columns = (\[[\s\S]*?\n\]);/);
if (!headersMatch || !columnsMatch) throw new Error("No fue posible leer los esquemas.");

const headers = Function(`return ${headersMatch[1]}`)();
const expectedColumns = Function(`return ${columnsMatch[1]}`)();
const inlineScripts = [...indexHtml.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.includes("const STORAGE_KEY"));
inlineScripts.forEach(source => new Function(source));
const loadedHelpersMatch = indexHtml.match(
  /function normalizeLoadedDateValue[\s\S]*?(?=\n    function applyLoadedState)/
);
if (!loadedHelpersMatch) throw new Error("No fue posible leer los normalizadores de carga.");
const loadedHelpers = Function(`
  ${loadedHelpersMatch[0]}
  return {
    normalizeLoadedDateValue,
    normalizeLoadedTimeValue,
    normalizeLoadedPhoneValue,
    normalizeLoadedFormValues
  };
`)();

const helpers = Function(`
  ${appScript}
  return { mergeRow_, enrichIdentifiers_, buildRow_ };
`)();

const existingValues = {
  id_unico: "R13-C13603-AJQ51ME",
  nombreRecurso: "Nombre anterior",
  region: "Región Metropolitana de Santiago",
  provincia: "Talagante",
  comuna: "Isla de Maipo",
  descripcion: "Descripción histórica que no debe perderse",
  fotos_links: "https://drive.google.com/file/d/ejemplo"
};
const existingRow = helpers.buildRow_(headers, existingValues);
const partialUpdate = {
  id_unico: existingValues.id_unico,
  nombreRecurso: "Nombre actualizado",
  fecha_actualizacion: "2026-07-28T12:00:00.000-04:00"
};
const mergedRow = helpers.mergeRow_(headers, existingRow, partialUpdate);
const mergedRecord = Object.fromEntries(headers.map((header, index) => [header, mergedRow[index]]));

const derived = {
  id_unico: "R13-C13603-AJQ51ME",
  codigo_atractivo: "JQ51ME"
};
helpers.enrichIdentifiers_(derived, derived.id_unico);
const dateFixture = new Date("2026-07-28T12:00:00.000Z");
const dateRow = helpers.buildRow_(headers, { fecha_creacion: dateFixture });

const saveRecordBody = appScript.match(/function saveRecord_\(payload\) \{([\s\S]*?)\n\}/)?.[1] || "";
const checks = {
  appsScriptSyntax: true,
  indexSyntax: inlineScripts.length === 1,
  totalHeaders: headers.length === 136,
  schemaExact:
    headers.length === expectedColumns.length &&
    headers.every((header, index) => header === expectedColumns[index]),
  noDuplicateHeaders: new Set(headers).size === headers.length,
  preservesNativeDates:
    dateRow[headers.indexOf("fecha_creacion")] instanceof Date,
  preservesOmittedDescription:
    mergedRecord.descripcion === existingValues.descripcion,
  preservesOmittedPhotoLinks:
    mergedRecord.fotos_links === existingValues.fotos_links,
  updatesReceivedField:
    mergedRecord.nombreRecurso === partialUpdate.nombreRecurso,
  derivesLegacyTerritory:
    derived.codigo_region === "13" &&
    derived.codigo_provincia === "136" &&
    derived.codigo_comuna === "13603" &&
    derived.codigo_unico_territorial === "13-136-13603" &&
    derived.id_unico_formato === "legacy-cut-comuna",
  doesNotDeleteDuplicatesOnSave:
    !saveRecordBody.includes("deleteDuplicateRows_("),
  verifiesOnlineSave:
    indexHtml.includes("verifyOnlineSave(payload)") &&
    indexHtml.includes("sameSavedVersion(record, payload)"),
  lookupButtonUsesWrapper:
    indexHtml.includes("addEventListener('click', () => loadRecordByUniqueId())"),
  normalizesLoadedDateAndTime:
    indexHtml.includes("normalizeLoadedFormValues") &&
    indexHtml.includes("normalizeLoadedDateValue") &&
    indexHtml.includes("normalizeLoadedTimeValue"),
  serializesSheetDatesAndTimes:
    appScript.includes("serializeRecordValue_") &&
    appScript.includes("DATE_ONLY_HEADERS") &&
    appScript.includes("TIME_ONLY_HEADERS"),
  preservesPhonesAndCodesAsText:
    appScript.includes("applyTextFormatsToRows_") &&
    appScript.includes("normalizePhoneForSheet_") &&
    appScript.includes("normalizeTerritoryCode_"),
  loadedValuesAreHtmlCompatible:
    loadedHelpers.normalizeLoadedDateValue("2026-07-28T04:00:00.000Z") === "2026-07-28" &&
    loadedHelpers.normalizeLoadedTimeValue("1899-12-30T13:42:45.000Z") === "09:00" &&
    loadedHelpers.normalizeLoadedTimeValue("1899-12-30T22:42:45.000Z") === "18:00" &&
    loadedHelpers.normalizeLoadedPhoneValue("56912345678") === "+56912345678" &&
    loadedHelpers.normalizeLoadedPhoneValue("912345678") === "+56912345678" &&
    loadedHelpers.normalizeLoadedPhoneValue("5622750112") === "+5622750112" &&
    loadedHelpers.normalizeLoadedFormValues({
      codigo_region: 1,
      codigo_provincia: 11,
      codigo_comuna: 1107
    }).codigo_unico_territorial === undefined &&
    loadedHelpers.normalizeLoadedFormValues({
      codigo_region: 1,
      codigo_provincia: 11,
      codigo_comuna: 1107
    }).codigo_region === "01" &&
    loadedHelpers.normalizeLoadedFormValues({
      codigo_region: 1,
      codigo_provincia: 11,
      codigo_comuna: 1107
    }).codigo_provincia === "011" &&
    loadedHelpers.normalizeLoadedFormValues({
      codigo_region: 1,
      codigo_provincia: 11,
      codigo_comuna: 1107
    }).codigo_comuna === "01107"
};

const failed = Object.entries(checks)
  .filter(([, passed]) => !passed)
  .map(([name]) => name);

console.log(JSON.stringify({
  ok: failed.length === 0,
  checks,
  failed,
  headers: headers.length
}, null, 2));

if (failed.length) process.exitCode = 1;
