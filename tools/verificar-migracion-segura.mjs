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
  const OPTIONS = {
    transportesPorAcceso: {
      Terrestre: ['Auto', 'Bicicleta']
    },
    actividadesPorExperiencia: {
      'Cultura y Patrimonio': ['Consumo cultural'],
      'Turismo de reuniones, viajes de incentivos, conferencias y exhibiciones (MICE)': ['Participación en congresos y eventos']
    }
  };
  const sections = [{
    fields: [{
      name: 'tiposExperiencia',
      options: [
        'Cultura y Patrimonio',
        'Turismo de reuniones, viajes de incentivos, conferencias y exhibiciones (MICE)'
      ]
    }]
  }];
  ${loadedHelpersMatch[0]}
  return {
    normalizeLoadedDateValue,
    normalizeLoadedTimeValue,
    normalizeLoadedPhoneValue,
    normalizeLoadedFormValues,
    normalizeLoadedArrayValue
  };
`)();
const uniqueIdHelpersMatch = indexHtml.match(
  /function ensureUniqueId\(\) \{[\s\S]*?(?=\n    function setPhotoUploadProgress)/
);
if (!uniqueIdHelpersMatch) throw new Error("No fue posible leer la lógica de ID territorial.");

function runUniqueIdFixture({ id, attractionCode, codes, preserveLegacyId = false }) {
  return Function(`
    const state = {
      values: {
        id_unico: ${JSON.stringify(id)},
        codigo_atractivo: ${JSON.stringify(attractionCode)},
        fecha_sincronizacion: '2026-07-31T12:00:00-04:00'
      },
      preserveLegacyId: ${JSON.stringify(preserveLegacyId)},
      originalOnlineId: ${JSON.stringify(id)}
    };
    function ensureTerritoryCodes() { return ${JSON.stringify(codes)}; }
    function createAttractionCode() { return 'NUEVO1'; }
    function isLegacyUniqueId(value) { return /^R\\d{2}-C\\d{5}-A[A-Z0-9]+$/i.test(String(value || '').trim()); }
    function autosave() {}
    ${uniqueIdHelpersMatch[0]}
    ensureUniqueId();
    return {
      id: state.values.id_unico,
      attractionCode: state.values.codigo_atractivo,
      internalCode: state.values.idInterno,
      originalOnlineId: state.originalOnlineId,
      migration: getPendingTerritoryMigration()
    };
  `)();
}

const modernIdMigration = runUniqueIdFixture({
  id: "R10-P104-C10401-AQS3QCB",
  attractionCode: "QS3QCB",
  codes: {
    codigo_region: "13",
    codigo_provincia: "131",
    codigo_comuna: "13101",
    codigo_unico_territorial: "13-131-13101"
  }
});
const legacyIdMigration = runUniqueIdFixture({
  id: "R13-C13114-A2YLAM6",
  attractionCode: "2YLAM6",
  codes: {
    codigo_region: "10",
    codigo_provincia: "101",
    codigo_comuna: "10101",
    codigo_unico_territorial: "10-101-10101"
  },
  preserveLegacyId: true
});

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
const territoryMigrationBody = appScript.match(/function migrateRecordTerritory_\([\s\S]*?(?=\nfunction getRecordById_)/)?.[0] || "";
const loadRecordBody = indexHtml.match(/async function loadRecordByUniqueId\(idOverride = ''\) \{([\s\S]*?)\n    \}/)?.[1] || "";
const syncDraftBody = indexHtml.match(/async function syncDraftOnline\(\) \{([\s\S]*?)(?=\n    function sameSavedVersion)/)?.[1] || "";
const photoUploadBody = indexHtml.match(/async function uploadPhotosToDrive\(\) \{([\s\S]*?)(?=\n    async function submitPayloadToGoogleSheet)/)?.[1] || "";
const renderFormBody = indexHtml.match(/function renderForm\(\) \{([\s\S]*?)(?=\n    function setSectionCollapsed)/)?.[1] || "";
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
  onlineRecordPrecedesLocalDraft:
    loadRecordBody.indexOf("fetch(googleScriptUrl") >= 0 &&
    loadRecordBody.indexOf("if (localDraft)") > loadRecordBody.indexOf("fetch(googleScriptUrl"),
  restoresStoredMultipleSelections:
    JSON.stringify(loadedHelpers.normalizeLoadedArrayValue(
      "tiposExperiencia",
      "Cultura y Patrimonio, Turismo de reuniones, viajes de incentivos, conferencias y exhibiciones (MICE)"
    )) === JSON.stringify([
      "Cultura y Patrimonio",
      "Turismo de reuniones, viajes de incentivos, conferencias y exhibiciones (MICE)"
    ]),
  rebuildsDependentOptionsAfterRender:
    indexHtml.includes("updateTransportOptionsByAccess({ prune: false })") &&
    indexHtml.includes("updateActivitiesByExperience({ prune: false })"),
  recalculatesTerritorialIdAfterOnlineLoad:
    indexHtml.includes("originalOnlineId") &&
    indexHtml.includes("if (!existingId || isPlaceholderId || territoryDoesNotMatch)") &&
    !indexHtml.includes("territoryDoesNotMatch && !alreadySyncedOnline"),
  preservesModernAttractionCodeWhenTerritoryChanges:
    modernIdMigration.id === "R13-P131-C13101-AQS3QCB" &&
    modernIdMigration.attractionCode === "QS3QCB" &&
    modernIdMigration.internalCode === "AQS3QCB" &&
    modernIdMigration.originalOnlineId === "R10-P104-C10401-AQS3QCB" &&
    modernIdMigration.migration?.previousId === "R10-P104-C10401-AQS3QCB" &&
    modernIdMigration.migration?.nextId === "R13-P131-C13101-AQS3QCB",
  upgradesLegacyIdOnlyWhenTerritoryChanges:
    legacyIdMigration.id === "R10-P101-C10101-A2YLAM6" &&
    legacyIdMigration.internalCode === "A2YLAM6" &&
    legacyIdMigration.originalOnlineId === "R13-C13114-A2YLAM6",
  sendsPreviousAndNewId:
    indexHtml.includes("action: pendingMigration ? 'migrateRecordTerritory' : 'saveRecord'") &&
    indexHtml.includes("id_unico_anterior: pendingMigration?.previousId || ''") &&
    appScript.includes("payload.id_unico_anterior"),
  blocksMigrationAgainstOldAppsScript:
    appScript.includes("action === 'capabilities'") &&
    appScript.includes("territory_migration: true") &&
    appScript.includes("drive_folder_migration: true") &&
    indexHtml.includes("assertTerritoryMigrationCapability") &&
    syncDraftBody.includes("if (payload.id_unico_anterior)") &&
    syncDraftBody.indexOf("await assertTerritoryMigrationCapability()") < syncDraftBody.indexOf("await submitPayloadToGoogleSheet(payload)"),
  migratesOnlyExistingRecord:
    territoryMigrationBody.includes("findRowsById_(sheet, headers, previousId)") &&
    territoryMigrationBody.includes("No se creó un registro nuevo") &&
    territoryMigrationBody.includes("sheet.getRange(targetRow, 1, 1, headers.length).setValues([updateRow])") &&
    !territoryMigrationBody.includes("sheet.getLastRow() + 1"),
  preservesAttractionCodeDuringMigration:
    territoryMigrationBody.includes("previousAttractionCode !== newAttractionCode") &&
    territoryMigrationBody.includes("values.codigo_atractivo = previousAttractionCode") &&
    territoryMigrationBody.includes("values.idInterno = 'A' + previousAttractionCode"),
  movesExistingDriveFolder:
    appScript.includes("migratePhotoFolderForRecord_") &&
    appScript.includes("folder.moveTo(comunaFolder)") &&
    appScript.includes("folder.setName(sanitizeFileName_(newId))") &&
    appScript.includes("rollbackPhotoFolderMigration_"),
  rejectsMigrationCollisions:
    territoryMigrationBody.includes("El nuevo ID ") &&
    territoryMigrationBody.includes("ya existe en la fila") &&
    appScript.includes("LockService.getScriptLock()"),
  blocksPhotosUntilMigrationCompletes:
    indexHtml.includes("Primero guarda online el cambio territorial") &&
    indexHtml.includes("const pendingMigration = getPendingTerritoryMigration()"),
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
  verifiesPhotoUploadWithRetries:
    indexHtml.includes("async function verifyPhotoUpload(payload, expectedCount, attempts = 8)") &&
    indexHtml.includes("await sleep(1500)") &&
    indexHtml.includes("onlineCount >= expectedCount") &&
    photoUploadBody.includes("await verifyPhotoUpload(payload, state.photos.length)") &&
    !photoUploadBody.includes("await sleep(2500)"),
  restoresVerifiedPhotoMetadata:
    photoUploadBody.includes("state.values.fotos_cantidad = Number(verifiedRecord.fotos_cantidad") &&
    photoUploadBody.includes("state.values.fotos_carpeta_drive = verifiedRecord.fotos_carpeta_drive") &&
    photoUploadBody.includes("state.values.fotos_ruta_drive = verifiedRecord.fotos_ruta_drive") &&
    photoUploadBody.includes("state.values.fotos_links = verifiedRecord.fotos_links"),
  rendersSafeDriveFolderLink:
    indexHtml.includes("function getSafeDriveFolderUrl(value)") &&
    indexHtml.includes("url.hostname !== 'drive.google.com'") &&
    indexHtml.includes("Abrir carpeta en Drive"),
  refreshesOnlinePhotoStatusAfterRender:
    renderFormBody.indexOf("renderPhotos();") > renderFormBody.indexOf("renderSocialAccountRows();") &&
    renderFormBody.indexOf("renderPhotos();") < renderFormBody.indexOf("renderStatus();") &&
    indexHtml.includes("function getDisplayedPhotoCount()") &&
    indexHtml.includes("Math.max(localCount, Number.isFinite(onlineCount) ? onlineCount : 0)") &&
    indexHtml.includes("`${getDisplayedPhotoCount()} / 5`"),
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
