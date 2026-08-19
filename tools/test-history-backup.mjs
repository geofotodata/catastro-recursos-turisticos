import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const source = await readFile(resolve(root, 'apps-script-migracion-segura.gs'), 'utf8');

assert.match(source, /HISTORY_SHEET_NAME = 'registros_historico'/, 'Debe usar la pestaña registros_historico');
assert.match(source, /ensureInitialHistoryBackup_\(sheet, headers\)/, 'Cada guardado debe asegurar el respaldo inicial');
assert.match(source, /action: 'respaldo_inicial'/, 'La copia inicial debe quedar identificada');
assert.match(source, /action: 'territorio_migrado'/, 'Los cambios territoriales deben quedar registrados');
assert.match(source, /'fotos_actualizadas'/, 'La actualización de fotografías debe quedar registrada');
assert.match(source, /appendHistorySnapshot_\(sheet, headers, updateRow/, 'Las actualizaciones deben generar una versión histórica');
assert.match(source, /appendHistorySnapshot_\(sheet, headers, newRow/, 'Las creaciones deben generar una versión histórica');
assert.match(source, /sheet\.getRange\(foundRow, 1, 1, headers\.length\)\.setValues\(\[existing\]\)/, 'Una falla del historial debe restaurar el registro actualizado');
assert.match(source, /sheet\.deleteRow\(targetRow\)/, 'Una falla del historial debe retirar una creación incompleta');
assert.match(source, /Historial automático del catastro/, 'La pestaña histórica debe advertir antes de una edición manual');
assert.match(source, /function eliminarRegistroConRespaldo\(id, motivo\)/, 'Debe existir una eliminación controlada');
assert.match(source, /action: 'eliminado'/, 'La eliminación debe quedar identificada en el historial');
assert.match(source, /historial_motivo/, 'El historial debe conservar el motivo de eliminación');
assert.match(source, /\.addItem\('Eliminar registro con respaldo'/, 'Google Sheet debe ofrecer la eliminación segura en el menú Catastro');
assert.doesNotMatch(source, /if \(action === 'deleteRecord'\)/, 'La eliminación no debe exponerse como acción pública del web app');

const listFunction = source.match(/function listRecords_\(\)[\s\S]*?(?=\r?\nfunction aplicarFormatosTextoSeguros)/);
assert.ok(listFunction, 'Debe existir listRecords_');
assert.doesNotMatch(listFunction[0], /HISTORY_SHEET_NAME|registro_historico/, 'El dashboard debe seguir leyendo solo registros');

console.log(JSON.stringify({
  ok: true,
  currentSheet: 'registros',
  historySheet: 'registros_historico',
  dashboardUsesHistory: false
}, null, 2));
