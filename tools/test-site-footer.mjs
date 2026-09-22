import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const pages = ['index.html', 'dashboard.html', 'manual.html'];

for (const page of pages) {
  const html = await readFile(resolve(root, page), 'utf8');
  assert.match(html, /site-footer\.css/, `${page} debe cargar los estilos del pie`);
  assert.match(html, /site-footer\.js/, `${page} debe cargar el contador`);
  assert.match(html, /Desarrollado por Luis Bravo/, `${page} debe mostrar la autoría`);
  assert.match(html, /https:\/\/geofoto\.cl/, `${page} debe enlazar geofoto.cl`);
  assert.match(html, /data-site-visit-count/, `${page} debe incluir el contador visible`);
}

const counterScript = await readFile(resolve(root, 'site-footer.js'), 'utf8');
assert.match(counterScript, /action', 'visit'/, 'El cliente debe solicitar la acción visit');
assert.match(counterScript, /localStorage/, 'El cliente debe evitar más de un conteo diario por navegador');
assert.match(counterScript, /geofotodata\.github\.io/, 'El entorno local no debe incrementar visitas');
assert.match(counterScript, /visitas_demo/, 'El borrador local debe permitir previsualizar una cifra sin incrementarla');

const appsScript = await readFile(resolve(root, 'apps-script-migracion-segura.gs'), 'utf8');
assert.match(appsScript, /action === 'visit'/, 'Apps Script debe implementar la acción visit');
assert.match(appsScript, /PropertiesService\.getScriptProperties/, 'El total debe persistirse en Script Properties');
assert.match(appsScript, /LockService\.getScriptLock/, 'El incremento debe protegerse contra concurrencia');
assert.match(appsScript, /No se almacenan direcciones IP ni datos personales/, 'La respuesta debe declarar su criterio de privacidad');

console.log(JSON.stringify({ ok: true, pages: pages.length, author: 'Luis Bravo', counter: 'global-private' }, null, 2));
