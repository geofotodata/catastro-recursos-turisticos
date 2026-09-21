import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const dashboard = fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf8');
const appsScript = fs.readFileSync(new URL('../apps-script-migracion-segura.gs', import.meta.url), 'utf8');
const scripts = [...dashboard.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)];
const inlineScript = scripts.at(-1)?.[1];
assert.ok(inlineScript, 'No se encontró el script principal del dashboard.');

const headersMatch = appsScript.match(/var HEADERS = (\[[\s\S]*?\n\]);/);
assert.ok(headersMatch, 'No se encontró HEADERS en Apps Script.');
const headers = vm.runInNewContext(headersMatch[1]);

function elementStub(id = '') {
  return {
    id,
    value: '',
    textContent: '',
    innerHTML: '',
    className: '',
    disabled: false,
    options: [],
    style: {},
    dataset: {},
    addEventListener() {},
    appendChild() {},
    remove() {},
    click() {},
    querySelectorAll() { return []; },
    setAttribute() {},
    classList: { toggle() {} }
  };
}

const elements = new Map();
const exportButtonIds = ['exportExcelBtn', 'exportGeoJsonBtn', 'exportKmlBtn', 'exportKmzBtn', 'exportShapeBtn'];
for (const id of exportButtonIds) elements.set(id, elementStub(id));

const documentStub = {
  body: elementStub('body'),
  getElementById(id) {
    if (!elements.has(id)) elements.set(id, elementStub(id));
    return elements.get(id);
  },
  querySelectorAll(selector) {
    if (selector === '.export-button') return exportButtonIds.map(id => elements.get(id));
    return [];
  },
  createElement() { return elementStub(); }
};

const mapStub = {
  setView() { return this; },
  fitBounds() { return this; }
};
const layerStub = { addTo() { return this; }, clearLayers() {} };
const leafletStub = {
  map() { return mapStub; },
  tileLayer() { return layerStub; },
  layerGroup() { return layerStub; },
  circleMarker() { return { bindPopup() {}, addTo() {} }; }
};

const context = vm.createContext({
  console,
  document: documentStub,
  L: leafletStub,
  Intl,
  Date,
  Math,
  Number,
  String,
  Array,
  Object,
  Set,
  Map,
  JSON,
  RegExp,
  TextEncoder,
  Uint8Array,
  ArrayBuffer,
  DataView,
  Blob,
  URL,
  encodeURIComponent,
  setTimeout,
  clearTimeout,
  fetch: async () => ({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ ok: true, records: [] })
  })
});
context.window = context;

new vm.Script(inlineScript, { filename: 'dashboard-inline.js' }).runInContext(context);

let fallbackCall = 0;
context.fetch = async () => {
  fallbackCall += 1;
  if (fallbackCall === 1) {
    return {
      ok: true,
      status: 200,
      text: async () => '<!DOCTYPE html><html><body>Archivo no encontrado</body></html>'
    };
  }
  return {
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ ok: true, records: [{ id_unico: 'RESPALDO-1' }] })
  };
};
await vm.runInContext('loadData()', context);
assert.equal(fallbackCall, 2, 'Debe intentar el segundo endpoint cuando el primero devuelve HTML.');
assert.equal(vm.runInContext('records.length', context), 1);
assert.match(elements.get('statusBox').textContent, /conexión de respaldo/);

const sample = Object.fromEntries(headers.map(header => [header, 'Valor ' + header]));
Object.assign(sample, {
  id_unico: 'R13-P131-C13114-APRUEBA',
  nombreRecurso: 'Recurso de prueba',
  region: 'Región Metropolitana de Santiago',
  provincia: 'Santiago',
  comuna: 'Las Condes',
  latitud: -33.41,
  longitud: -70.58
});
context.sampleForExport = sample;
vm.runInContext("records = [normalizeRecord(sampleForExport)]; filtered = records.slice(); els.region.value = 'Región Metropolitana de Santiago'; els.province.value = 'Santiago'; els.commune.value = 'Las Condes';", context);

const exportedHeaders = vm.runInContext('exportHeaders(filtered)', context);
assert.equal(exportedHeaders.length, headers.length, 'La exportación debe conservar todos los encabezados de Apps Script.');

const geojson = vm.runInContext('buildGeoJson()', context);
assert.equal(geojson.features.length, 1);
assert.deepEqual(Array.from(geojson.features[0].geometry.coordinates), [-70.58, -33.41]);
assert.equal(Object.keys(geojson.features[0].properties).length, headers.length);

const kml = vm.runInContext('buildKml()', context);
assert.equal((kml.match(/<Data name=/g) || []).length, headers.length);
assert.match(kml, /<coordinates>-70\.58,-33\.41,0<\/coordinates>/);

const shape = vm.runInContext('buildPointShapeFiles(filtered)', context);
assert.equal(new DataView(shape.shp.buffer).getInt32(0, false), 9994);
assert.equal(new DataView(shape.shp.buffer).getInt32(32, true), 1);
assert.equal(shape.shp.byteLength, 128);
assert.equal(shape.shx.byteLength, 108);

context.headersForExport = exportedHeaders;
vm.runInContext('fieldNamesForExport = dbfFieldNames(headersForExport); dbfForExport = buildDbf(filtered, headersForExport, fieldNamesForExport);', context);
const dbf = vm.runInContext('dbfForExport', context);
const dbfView = new DataView(dbf.buffer, dbf.byteOffset, dbf.byteLength);
assert.equal(dbfView.getUint32(4, true), 1);
assert.equal((dbfView.getUint16(8, true) - 33) / 32, headers.length);

const withoutGeometry = { ...sample, id_unico: 'R13-P131-C13114-ASINPUN', latitud: '', longitud: '' };
context.withoutGeometry = withoutGeometry;
vm.runInContext('filtered = [normalizeRecord(sampleForExport), normalizeRecord(withoutGeometry)]; updateExportControls();', context);
assert.equal(vm.runInContext('filtered.length', context), 2, 'Excel debe considerar todos los registros filtrados.');
assert.equal(vm.runInContext('buildGeoJson().features.length', context), 1, 'Los formatos espaciales deben omitir coordenadas inválidas.');
assert.equal(elements.get('exportExcelBtn').disabled, false);
assert.equal(elements.get('exportGeoJsonBtn').disabled, false);

vm.runInContext('filtered = [normalizeRecord(withoutGeometry)]; updateExportControls();', context);
assert.equal(elements.get('exportExcelBtn').disabled, false, 'Excel debe seguir disponible sin geometría.');
assert.equal(elements.get('exportGeoJsonBtn').disabled, true, 'Los formatos espaciales deben deshabilitarse sin geometría.');

vm.runInContext("els.province.value = ''; updateExportControls();", context);
assert.equal(elements.get('exportExcelBtn').disabled, true, 'La descarga requiere región, provincia y comuna.');
assert.match(elements.get('exportStatus').textContent, /Provincia/);

assert.match(dashboard, /xlsx-0\.20\.3\/package\/dist\/xlsx\.full\.min\.js/);
assert.match(dashboard, /jszip@3\.10\.1\/dist\/jszip\.min\.js/);

console.log(JSON.stringify({
  ok: true,
  headers: headers.length,
  geojsonFeatures: geojson.features.length,
  kmlAttributes: (kml.match(/<Data name=/g) || []).length,
  shapePoints: 1,
  dbfFields: headers.length
}, null, 2));
