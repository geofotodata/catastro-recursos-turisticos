var SHEET_NAME = 'registros';
var TIMEZONE = 'America/Santiago';
var DRIVE_ROOT_FOLDER_ID = '1kGhyvjtAeepzigR3uymWsW4zN2rKYl8U';

var HEADERS = [
  'id_unico',
  'id_unico_formato',
  'codigo_unico_territorial',
  'codigo_region',
  'codigo_provincia',
  'codigo_comuna',
  'codigo_atractivo',
  'idInterno',
  'estado',
  'nombreRecurso',
  'region',
  'provincia',
  'comuna',
  'localidad',
  'responsable',
  'correoResponsable',
  'telefonoResponsable',
  'institucion',
  'fechaRegistro',
  'coordenadas',
  'latitud',
  'longitud',
  'coordX',
  'coordY',
  'utmZona',
  'categoria',
  'tipoRecurso',
  'subtipoRecurso',
  'descripcion',
  'propiedad',
  'nombrePropietario',
  'tipoOrgPropietario',
  'correoPropietario',
  'telefonoPropietario',
  'administracion',
  'nombreAdministrador',
  'tipoOrgAdministrador',
  'correoAdministrador',
  'telefonoAdministrador',
  'sitioWeb',
  'alcanceActuacion',
  'operacionConcesion',
  'patrocinioEvento',
  'tipoAcceso',
  'mediosTransporte',
  'distanciaCapitalRegional',
  'distanciaCapitalComunal',
  'tiposExperiencia',
  'actividades',
  'tieneInstalaciones',
  'instalacionesPublicas',
  'nAdmin',
  'nOperacion',
  'nTurismo',
  'nIdiomas',
  'idiomas',
  'lenguasOriginarias',
  'tipoIngreso',
  'tipoPago',
  'medioPago',
  'reserva',
  'tipoReserva',
  'mesesOperacion',
  'diasOperacion',
  'horaDesde',
  'horaHasta',
  'mesesRecomendados',
  'ingresoMascotas',
  'continuidad',
  'sistemaVisitas',
  'tipoRegistro',
  'ultimoAnoRegistro',
  'reportesVisita',
  'frecuenciaReportes',
  'visitantesTotal',
  'visitantesNacionales',
  'visitantesExtranjeros',
  'tieneServiciosTuristicos',
  'serviciosTuristicos',
  'tieneServiciosBasicos',
  'serviciosBasicos',
  'tieneSeguridad',
  'instalacionesSeguridad',
  'accesibilidadUniversal',
  'elementosAccesibles',
  'aptoDiscapacidades',
  'fichaIdat',
  'perrosGuia',
  'apoyoEmocional',
  'tieneReconocimiento',
  'alcanceReconocimiento',
  'institucionReconocimiento',
  'denominacionReconocimiento',
  'fechaReconocimiento',
  'amenazasNaturales',
  'planRRD',
  'planEmergencia',
  'enPlanificacion',
  'instrumentosGestion',
  'capacidadCarga',
  'resolucionSanitaria',
  'sePromociona',
  'escalaPromocion',
  'instrumentoPromocion',
  'instrumentosPromocion',
  'escalaComercializacion',
  'canalesComercializacion',
  'tieneWeb',
  'urlWeb',
  'periodicidadWeb',
  'tieneRedes',
  'redesSociales',
  'redesSocialesDetalle',
  'nombreCuenta',
  'periodicidadRedes',
  'puntoInfoTuristica',
  'periodicidadInfoTuristica',
  'mediosComunicacion',
  'tiposMedios',
  'feriasEventos',
  'nombreFeria',
  'periodicidadFerias',
  'folleteria',
  'tipoFolleteria',
  'periodicidadFolleteria',
  'otrosMedios',
  'fotos_cantidad',
  'fotos_links',
  'fotos_carpeta_drive',
  'fotos_ruta_drive',
  'fecha_subida_fotos',
  'observaciones',
  'fecha_creacion',
  'fecha_actualizacion',
  'fecha_sincronizacion',
  'zona_horaria_usuario'
];

var TEXT_HEADERS = [
  'id_unico',
  'id_unico_formato',
  'codigo_unico_territorial',
  'codigo_region',
  'codigo_provincia',
  'codigo_comuna',
  'codigo_atractivo',
  'idInterno',
  'telefonoResponsable',
  'telefonoPropietario',
  'telefonoAdministrador'
];

var DATE_ONLY_HEADERS = ['fechaRegistro', 'fechaReconocimiento'];
var TIME_ONLY_HEADERS = ['horaDesde', 'horaHasta'];

function doGet(e) {
  try {
    var action = e && e.parameter && e.parameter.action ? String(e.parameter.action) : '';

    if (action === 'get') {
      var id = e.parameter && e.parameter.id_unico ? String(e.parameter.id_unico).trim() : '';
      var record = getRecordById_(id);
      return jsonResponse_({
        ok: Boolean(record),
        record: record || null,
        message: record ? 'Registro encontrado' : 'Registro no encontrado',
        timestamp: now_()
      });
    }

    if (action === 'list') {
      return jsonResponse_({
        ok: true,
        records: listRecords_(),
        timestamp: now_()
      });
    }

    if (action === 'authCheck') return authCheck_();

    if (action === 'schema') {
      return jsonResponse_({
        ok: true,
        schema_version: 2,
        total_headers: HEADERS.length,
        headers: HEADERS.slice(),
        timestamp: now_()
      });
    }

    if (action === 'capabilities') {
      return jsonResponse_({
        ok: true,
        schema_version: 2,
        features: {
          territory_migration: true,
          drive_folder_migration: true
        },
        timestamp: now_()
      });
    }

    if (action === 'repairHeaders') {
      return jsonResponse_(repararEncabezadosSinBorrarNada());
    }

    return jsonResponse_({
      ok: true,
      message: 'API del Catastro funcionando',
      actions: ['list', 'get', 'schema', 'capabilities', 'authCheck', 'repairHeaders'],
      timestamp: now_()
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: String(error && error.message ? error.message : error),
      timestamp: now_()
    });
  }
}

function doPost(e) {
  try {
    var payload = parsePayload_(e);
    var action = payload.action || 'saveRecord';
    if (e && e.parameter && e.parameter.action) action = e.parameter.action;

    if (action === 'uploadPhotos') {
      var uploadResult = uploadPhotos_(payload);
      payload.values = payload.values || {};
      payload.values.fotos_carpeta_drive = uploadResult.folderUrl;
      payload.values.fotos_ruta_drive = uploadResult.folderPath;
      payload.values.fotos_links = uploadResult.fileUrls.join('\n');
      payload.values.fotos_cantidad = uploadResult.fileUrls.length;
      payload.values.fecha_subida_fotos = now_();
      var savedPhotos = saveRecord_(payload);
      return jsonResponse_({
        ok: true,
        action: action,
        saved: savedPhotos,
        upload: uploadResult,
        timestamp: now_()
      });
    }

    var saved = saveRecord_(payload);
    return jsonResponse_({
      ok: true,
      action: action,
      saved: saved,
      timestamp: now_()
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: String(error && error.message ? error.message : error),
      timestamp: now_()
    });
  }
}

function parsePayload_(e) {
  if (e && e.parameter && e.parameter.payload) {
    return JSON.parse(e.parameter.payload);
  }

  var raw = '';
  if (e && e.postData && e.postData.contents) raw = e.postData.contents;
  if (!raw) throw new Error('No llegó payload desde el formulario.');

  if (raw.charAt(0) === '{') return JSON.parse(raw);
  throw new Error('Formato no reconocido. El HTML debe enviar parameter payload.');
}

function saveRecord_(payload) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    var sheet = getSheet_();
    var headers = ensureHeaders_(sheet);
    var values = Object.assign({}, payload.values || {});
    var id = normalizeId_(payload.id_unico || values.id_unico);
    var previousId = normalizeId_(payload.id_unico_anterior || values.id_unico_anterior);
    if (!id) throw new Error('Falta id_unico. No se puede guardar el registro.');

    delete values.id_unico_anterior;
    values.id_unico = id;
    values.codigo_atractivo = payload.codigo_atractivo || values.codigo_atractivo || extractAttractionCode_(id);
    values.estado = payload.estado || values.estado || 'borrador';
    values.fecha_actualizacion = values.fecha_actualizacion || now_();
    values.fecha_sincronizacion = values.fecha_sincronizacion || now_();
    values.zona_horaria_usuario = values.zona_horaria_usuario || TIMEZONE;
    enrichIdentifiers_(values, id);

    if (previousId && previousId !== id) {
      return migrateRecordTerritory_(sheet, headers, values, previousId, id);
    }

    var foundRows = findRowsById_(sheet, headers, id);
    var foundRow = foundRows.length ? foundRows[0] : -1;

    if (foundRow > 0) {
      var existing = sheet.getRange(foundRow, 1, 1, headers.length).getValues()[0];
      var createdIndex = headers.indexOf('fecha_creacion');
      if (createdIndex >= 0 && existing[createdIndex]) {
        values.fecha_creacion = existing[createdIndex];
      } else {
        values.fecha_creacion = values.fecha_creacion || now_();
      }

      var updateRow = mergeRow_(headers, existing, values);
      applyTextFormatsToRows_(sheet, headers, foundRow, 1);
      sheet.getRange(foundRow, 1, 1, headers.length).setValues([updateRow]);
      return {
        mode: foundRows.length > 1 ? 'updated_with_duplicate_warning' : 'updated',
        row: foundRow,
        id_unico: id,
        duplicates_detected: Math.max(0, foundRows.length - 1),
        duplicate_rows: foundRows.slice(1)
      };
    }

    values.fecha_creacion = values.fecha_creacion || now_();
    var newRow = buildRow_(headers, values);
    var targetRow = sheet.getLastRow() + 1;
    applyTextFormatsToRows_(sheet, headers, targetRow, 1);
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([newRow]);
    return { mode: 'created', row: targetRow, id_unico: id };
  } finally {
    lock.releaseLock();
  }
}

function migrateRecordTerritory_(sheet, headers, values, previousId, newId) {
  var previousRows = findRowsById_(sheet, headers, previousId);
  if (previousRows.length === 0) {
    throw new Error('No se encontró el ID anterior ' + previousId + '. No se creó un registro nuevo.');
  }
  if (previousRows.length > 1) {
    throw new Error('El ID anterior ' + previousId + ' está duplicado en las filas ' + previousRows.join(', ') + '. Corrige ese conflicto antes de cambiar el territorio.');
  }

  var targetRow = previousRows[0];
  var newRows = findRowsById_(sheet, headers, newId).filter(function(row) {
    return row !== targetRow;
  });
  if (newRows.length) {
    throw new Error('El nuevo ID ' + newId + ' ya existe en la fila ' + newRows[0] + '. No se modificó el registro original.');
  }

  var previousAttractionCode = extractAttractionCode_(previousId);
  var newAttractionCode = extractAttractionCode_(newId);
  if (!previousAttractionCode || previousAttractionCode !== newAttractionCode) {
    throw new Error('El cambio territorial debe conservar el código propio del atractivo: A' + previousAttractionCode + '.');
  }

  values.codigo_atractivo = previousAttractionCode;
  values.idInterno = 'A' + previousAttractionCode;
  values.id_unico = newId;
  values.id_unico_formato = 'cut-region-provincia-comuna';

  var existing = sheet.getRange(targetRow, 1, 1, headers.length).getValues()[0];
  var existingRecord = {};
  for (var i = 0; i < headers.length; i++) existingRecord[headers[i]] = existing[i];

  var createdIndex = headers.indexOf('fecha_creacion');
  if (createdIndex >= 0 && existing[createdIndex]) {
    values.fecha_creacion = existing[createdIndex];
  } else {
    values.fecha_creacion = values.fecha_creacion || now_();
  }

  var folderMigration = migratePhotoFolderForRecord_(previousId, newId, existingRecord, values);
  var updateRow = mergeRow_(headers, existing, values);

  try {
    applyTextFormatsToRows_(sheet, headers, targetRow, 1);
    sheet.getRange(targetRow, 1, 1, headers.length).setValues([updateRow]);
  } catch (error) {
    rollbackPhotoFolderMigration_(folderMigration);
    throw error;
  }

  return {
    mode: 'territory_migrated',
    row: targetRow,
    id_unico_anterior: previousId,
    id_unico: newId,
    codigo_atractivo: previousAttractionCode,
    carpeta_drive_movida: Boolean(folderMigration && folderMigration.changed),
    carpeta_drive_ruta: folderMigration && folderMigration.folderPath ? folderMigration.folderPath : ''
  };
}

function getRecordById_(id) {
  id = normalizeId_(id);
  if (!id) return null;
  var sheet = getSheet_();
  var headers = ensureHeaders_(sheet);
  var row = findRowById_(sheet, headers, id);
  if (row < 1) return null;

  var rowValues = sheet.getRange(row, 1, 1, headers.length).getValues()[0];
  var record = {};
  for (var i = 0; i < headers.length; i++) {
    record[headers[i]] = serializeRecordValue_(headers[i], rowValues[i]);
  }
  return record;
}

function listRecords_() {
  var sheet = getSheet_();
  var headers = ensureHeaders_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  var values = sheet.getRange(2, 1, lastRow - 1, headers.length).getValues();
  var records = [];

  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    var record = {};
    var empty = true;

    for (var c = 0; c < headers.length; c++) {
      var value = row[c];
      if (value !== '' && value !== null && value !== undefined) empty = false;
      record[headers[c]] = serializeRecordValue_(headers[c], value);
    }

    if (!empty) records.push(record);
  }

  return records;
}

function aplicarFormatosTextoSeguros() {
  var sheet = getSheet_();
  var headers = ensureHeaders_(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { ok: true, rows: 0, message: 'No hay registros para normalizar.' };
  }

  var rowCount = lastRow - 1;
  var values = sheet.getRange(2, 1, rowCount, headers.length).getValues();
  var formulas = sheet.getRange(2, 1, rowCount, headers.length).getFormulas();
  var idIndex = headers.indexOf('id_unico');
  var normalized = {};

  for (var t = 0; t < TEXT_HEADERS.length; t++) {
    var header = TEXT_HEADERS[t];
    var columnIndex = headers.indexOf(header);
    if (columnIndex < 0) continue;

    var columnValues = [];
    for (var r = 0; r < rowCount; r++) {
      var id = idIndex >= 0 ? String(values[r][idIndex] || '').trim() : '';
      var value = values[r][columnIndex];

      if (header === 'telefonoResponsable' || header === 'telefonoPropietario' || header === 'telefonoAdministrador') {
        value = normalizePhoneForSheet_(value, formulas[r][columnIndex]);
      } else if (header === 'codigo_region') {
        value = normalizeTerritoryCode_(value || extractCodeFromId_(id, /R(\d+)/), 2);
      } else if (header === 'codigo_provincia') {
        value = normalizeTerritoryCode_(value || extractCodeFromId_(id, /-P(\d+)/), 3);
      } else if (header === 'codigo_comuna') {
        value = normalizeTerritoryCode_(value || extractCodeFromId_(id, /-C(\d+)/), 5);
      } else if (header === 'codigo_atractivo') {
        value = String(value || extractAttractionCode_(id));
      } else if (header === 'idInterno') {
        value = String(value || (extractAttractionCode_(id) ? 'A' + extractAttractionCode_(id) : ''));
      } else if (value !== '' && value !== null && value !== undefined) {
        value = String(value);
      }

      columnValues.push([value === null || value === undefined ? '' : value]);
    }

    var columnRange = sheet.getRange(2, columnIndex + 1, rowCount, 1);
    columnRange.setNumberFormat('@');
    columnRange.setValues(columnValues);
    normalized[header] = rowCount;
  }

  var regionIndex = headers.indexOf('codigo_region');
  var provinceIndex = headers.indexOf('codigo_provincia');
  var comunaIndex = headers.indexOf('codigo_comuna');
  var cutIndex = headers.indexOf('codigo_unico_territorial');
  if (cutIndex >= 0 && regionIndex >= 0 && provinceIndex >= 0 && comunaIndex >= 0) {
    var cutValues = [];
    var refreshed = sheet.getRange(2, 1, rowCount, headers.length).getDisplayValues();
    for (var i = 0; i < rowCount; i++) {
      var region = normalizeTerritoryCode_(refreshed[i][regionIndex], 2);
      var province = normalizeTerritoryCode_(refreshed[i][provinceIndex], 3);
      var comuna = normalizeTerritoryCode_(refreshed[i][comunaIndex], 5);
      cutValues.push([region && province && comuna ? [region, province, comuna].join('-') : refreshed[i][cutIndex]]);
    }
    var cutRange = sheet.getRange(2, cutIndex + 1, rowCount, 1);
    cutRange.setNumberFormat('@');
    cutRange.setValues(cutValues);
  }

  return {
    ok: true,
    rows: rowCount,
    text_headers: TEXT_HEADERS.length,
    message: 'Telefonos, identificadores y codigos territoriales normalizados como texto.'
  };
}

function uploadPhotos_(payload) {
  var id = normalizeId_(payload.id_unico || (payload.values && payload.values.id_unico));
  if (!id) throw new Error('Falta id_unico para crear carpeta de fotos.');

  var photos = Array.isArray(payload.photos) ? payload.photos : [];
  if (photos.length === 0) throw new Error('No llegaron fotografías para subir.');
  if (photos.length > 5) throw new Error('El máximo permitido es 5 fotografías por registro.');

  var values = payload.values || {};
  var root = DriveApp.getFolderById(DRIVE_ROOT_FOLDER_ID);

  var codigoRegion = cleanCode_(values.codigo_region) || extractCodeFromId_(id, /R(\d+)/) || '00';
  var codigoComuna = cleanCode_(values.codigo_comuna) || extractCodeFromId_(id, /-C(\d+)/) || '00000';
  var codigoProvincia = cleanCode_(values.codigo_provincia);

  if (!codigoProvincia && codigoComuna.length > 2) codigoProvincia = codigoComuna.slice(0, -2);
  if (!codigoProvincia) codigoProvincia = codigoRegion + '0';

  var regionFolder = getOrCreateFolderNormalized_(root, 'R' + codigoRegion);
  var provinceFolder = getOrCreateFolderNormalized_(regionFolder, 'P' + codigoProvincia);
  var comunaFolder = getOrCreateFolderNormalized_(provinceFolder, 'C' + codigoComuna);
  var folder = getOrCreateFolderNormalized_(comunaFolder, sanitizeFileName_(id));

  var folderPath = [
    root.getName(),
    regionFolder.getName(),
    provinceFolder.getName(),
    comunaFolder.getName(),
    folder.getName()
  ].join(' / ');

  var replaceExisting = payload.replaceExistingPhotos !== false;
  if (replaceExisting) clearFolderFiles_(folder);

  var urls = [];
  for (var i = 0; i < photos.length; i++) {
    var photo = photos[i];
    if (!photo || !photo.dataUrl) continue;

    var parsed = parseDataUrl_(photo.dataUrl, photo.type);
    if (!parsed || !parsed.base64) continue;

    var bytes = Utilities.base64Decode(parsed.base64);
    var mime = parsed.mime || guessMimeFromName_(photo.name) || 'application/octet-stream';
    var safeName = sanitizeFileName_(photo.name || ('foto_' + (i + 1) + extensionFromMime_(mime)));
    var numberedName = Utilities.formatString('%02d_%s', i + 1, safeName);
    var blob = Utilities.newBlob(bytes, mime, numberedName);
    var file = folder.createFile(blob);
    urls.push(file.getUrl());
  }

  if (urls.length === 0) throw new Error('Las fotografías llegaron vacías o en un formato no válido.');

  return {
    folderUrl: folder.getUrl(),
    folderPath: folderPath,
    fileUrls: urls,
    count: urls.length
  };
}

function migratePhotoFolderForRecord_(previousId, newId, existingRecord, values) {
  var root = DriveApp.getFolderById(DRIVE_ROOT_FOLDER_ID);
  var folder = findRecordPhotoFolder_(root, previousId, existingRecord);
  if (!folder) return { changed: false, folderPath: '' };

  var codigoRegion = cleanCode_(values.codigo_region) || extractCodeFromId_(newId, /R(\d+)/);
  var codigoProvincia = cleanCode_(values.codigo_provincia) || extractCodeFromId_(newId, /-P(\d+)/);
  var codigoComuna = cleanCode_(values.codigo_comuna) || extractCodeFromId_(newId, /-C(\d+)/);
  if (!codigoRegion || !codigoProvincia || !codigoComuna) {
    throw new Error('No fue posible determinar la nueva ruta territorial de la carpeta de fotografías.');
  }

  var regionFolder = getOrCreateFolderNormalized_(root, 'R' + codigoRegion);
  var provinceFolder = getOrCreateFolderNormalized_(regionFolder, 'P' + codigoProvincia);
  var comunaFolder = getOrCreateFolderNormalized_(provinceFolder, 'C' + codigoComuna);
  var targetFolder = findFolderNormalized_(comunaFolder, newId);
  if (targetFolder && targetFolder.getId() !== folder.getId()) {
    throw new Error('Ya existe una carpeta distinta para el nuevo ID ' + newId + '. No se movieron las fotografías.');
  }

  var parents = folder.getParents();
  var oldParent = parents.hasNext() ? parents.next() : null;
  var oldName = folder.getName();
  var changed = normalizeFolderName_(oldName) !== normalizeFolderName_(newId)
    || !oldParent
    || oldParent.getId() !== comunaFolder.getId();

  if (normalizeFolderName_(oldName) !== normalizeFolderName_(newId)) folder.setName(sanitizeFileName_(newId));
  if (!oldParent || oldParent.getId() !== comunaFolder.getId()) folder.moveTo(comunaFolder);

  var folderPath = [
    root.getName(),
    regionFolder.getName(),
    provinceFolder.getName(),
    comunaFolder.getName(),
    folder.getName()
  ].join(' / ');

  values.fotos_carpeta_drive = folder.getUrl();
  values.fotos_ruta_drive = folderPath;

  return {
    changed: changed,
    folder: folder,
    oldParent: oldParent,
    oldName: oldName,
    folderPath: folderPath
  };
}

function rollbackPhotoFolderMigration_(migration) {
  if (!migration || !migration.changed || !migration.folder) return;
  try {
    if (migration.oldParent) migration.folder.moveTo(migration.oldParent);
    migration.folder.setName(migration.oldName);
  } catch (rollbackError) {
    console.error('No fue posible revertir la carpeta después de un error en Google Sheet: ' + rollbackError);
  }
}

function findRecordPhotoFolder_(root, previousId, existingRecord) {
  var folderUrl = existingRecord && existingRecord.fotos_carpeta_drive
    ? String(existingRecord.fotos_carpeta_drive)
    : '';
  var folderFromUrl = getDriveFolderFromUrl_(folderUrl);
  if (folderFromUrl) return folderFromUrl;

  var codigoRegion = extractCodeFromId_(previousId, /R(\d+)/);
  var codigoProvincia = extractCodeFromId_(previousId, /-P(\d+)/);
  var codigoComuna = extractCodeFromId_(previousId, /-C(\d+)/);
  if (!codigoProvincia && codigoComuna.length > 2) codigoProvincia = codigoComuna.slice(0, -2);

  var regionFolder = codigoRegion ? findFolderNormalized_(root, 'R' + codigoRegion) : null;
  var provinceFolder = regionFolder && codigoProvincia
    ? findFolderNormalized_(regionFolder, 'P' + codigoProvincia)
    : null;
  var comunaFolder = provinceFolder && codigoComuna
    ? findFolderNormalized_(provinceFolder, 'C' + codigoComuna)
    : null;
  var nestedFolder = comunaFolder ? findFolderNormalized_(comunaFolder, previousId) : null;
  if (nestedFolder) return nestedFolder;

  return findFolderNormalized_(root, previousId);
}

function getDriveFolderFromUrl_(url) {
  var text = String(url || '');
  var match = text.match(/\/folders\/([A-Za-z0-9_-]+)/) || text.match(/[?&]id=([A-Za-z0-9_-]+)/);
  if (!match) return null;
  try {
    return DriveApp.getFolderById(match[1]);
  } catch (error) {
    return null;
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  return sheet;
}

function ensureHeaders_(sheet) {
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return HEADERS.slice();
  }

  var lastColumn = sheet.getLastColumn();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function(value) {
    return String(value || '').trim();
  });

  var missing = [];
  for (var i = 0; i < HEADERS.length; i++) {
    if (headers.indexOf(HEADERS[i]) === -1) missing.push(HEADERS[i]);
  }

  if (missing.length > 0) {
    sheet.getRange(1, headers.length + 1, 1, missing.length).setValues([missing]);
    headers = headers.concat(missing);
  }

  sheet.setFrozenRows(1);
  return headers;
}

function repararEncabezadosSinBorrarNada() {
  var sheet = getSheet_();
  var headers = ensureHeaders_(sheet);

  Logger.log('Encabezados faltantes agregados sin borrar registros ni mover datos.');
  Logger.log('Total columnas: ' + headers.length);
  Logger.log(headers.join(' | '));

  return {
    ok: true,
    message: 'Encabezados faltantes agregados sin borrar registros ni mover datos.',
    total_columnas: headers.length,
    encabezados: headers
  };
}

function repararEncabezadosBasicos_(sheet) {
  var minHeaders = [
    'id_unico',
    'codigo_atractivo',
    'nombreRecurso',
    'region',
    'provincia',
    'comuna',
    'fecha_creacion',
    'fecha_actualizacion',
    'fecha_sincronizacion',
    'zona_horaria_usuario'
  ];

  var lastColumn = Math.max(sheet.getLastColumn(), minHeaders.length, HEADERS.length);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
    return HEADERS.slice();
  }

  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  var changed = false;
  var used = {};
  var blankCounter = 1;

  for (var c = 0; c < headers.length; c++) {
    var header = String(headers[c] || '').trim();

    if (!header) {
      header = 'columna_sin_encabezado_' + blankCounter;
      blankCounter++;
      changed = true;
    }

    if (used[header]) {
      header = header + '_duplicado_' + (c + 1);
      changed = true;
    }

    headers[c] = header;
    used[header] = true;
  }

  minHeaders.forEach(function(header) {
    if (headers.indexOf(header) === -1) {
      headers.push(header);
      changed = true;
    }
  });

  if (changed) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return headers;
}

function crearRespaldoRegistros() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var source = ss.getSheetByName(SHEET_NAME);
  if (!source) throw new Error('No existe la hoja "' + SHEET_NAME + '".');

  var name = uniqueSheetName_(ss, 'respaldo_registros_' + timestampForName_());
  var backup = source.copyTo(ss).setName(name);
  ss.setActiveSheet(backup);
  ss.moveActiveSheet(ss.getNumSheets());

  return {
    ok: true,
    source_sheet: SHEET_NAME,
    backup_sheet: name,
    rows: Math.max(0, source.getLastRow() - 1),
    columns: source.getLastColumn()
  };
}

function prepararHomologacionSegura() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var source = ss.getSheetByName(SHEET_NAME);
  if (!source) throw new Error('No existe la hoja "' + SHEET_NAME + '".');

  var backupResult = crearRespaldoRegistros();
  var sourceLastRow = source.getLastRow();
  var sourceLastColumn = source.getLastColumn();
  var sourceValues = sourceLastRow > 0 && sourceLastColumn > 0
    ? source.getRange(1, 1, sourceLastRow, sourceLastColumn).getValues()
    : [];
  var sourceHeaders = sourceValues.length ? sourceValues[0].map(function(value) {
    return String(value || '').trim();
  }) : [];
  var sourceIndex = {};

  sourceHeaders.forEach(function(header, index) {
    if (header && sourceIndex[header] === undefined) sourceIndex[header] = index;
  });

  var duplicateIds = {};
  var invalidCreationDates = [];
  var unknownColumnsWithData = {};
  var outputRows = [];

  for (var r = 1; r < sourceValues.length; r++) {
    var sourceRow = sourceValues[r];
    var record = {};

    HEADERS.forEach(function(header) {
      if (sourceIndex[header] !== undefined) {
        record[header] = sourceRow[sourceIndex[header]];
      }
    });

    var id = normalizeId_(record.id_unico);
    if (id) {
      duplicateIds[id] = (duplicateIds[id] || 0) + 1;
      record.id_unico = id;
      enrichIdentifiers_(record, id);
    }
    record.estado = record.estado || 'borrador';
    record.zona_horaria_usuario = record.zona_horaria_usuario || TIMEZONE;

    if (record.fecha_creacion !== '' && record.fecha_creacion !== null && record.fecha_creacion !== undefined
        && !isPlausibleDate_(record.fecha_creacion)) {
      invalidCreationDates.push({ row: r + 1, id_unico: id, value: String(record.fecha_creacion) });
    }

    sourceHeaders.forEach(function(header, c) {
      if (!header || HEADERS.indexOf(header) !== -1) return;
      var value = sourceRow[c];
      if (value !== '' && value !== null && value !== undefined) {
        unknownColumnsWithData[header] = (unknownColumnsWithData[header] || 0) + 1;
      }
    });

    outputRows.push(buildRow_(HEADERS, record));
  }

  var migrationName = uniqueSheetName_(ss, 'registros_homologados_v2_' + timestampForName_());
  var migrationSheet = ss.insertSheet(migrationName);
  migrationSheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  if (outputRows.length) {
    migrationSheet.getRange(2, 1, outputRows.length, HEADERS.length).setValues(outputRows);
  }
  formatMigrationSheet_(migrationSheet);

  var duplicated = Object.keys(duplicateIds).filter(function(id) {
    return duplicateIds[id] > 1;
  });
  var unknownNames = Object.keys(unknownColumnsWithData);
  var auditName = uniqueSheetName_(ss, 'auditoria_homologacion_' + timestampForName_());
  var auditSheet = ss.insertSheet(auditName);
  var auditRows = [
    ['indicador', 'valor', 'detalle'],
    ['hoja_origen', SHEET_NAME, 'La hoja original no fue modificada ni eliminada.'],
    ['hoja_respaldo', backupResult.backup_sheet, 'Copia completa previa a la homologación.'],
    ['hoja_homologada', migrationName, 'Candidata para revisión; no está activa automáticamente.'],
    ['filas_origen', Math.max(0, sourceLastRow - 1), 'Cantidad de registros antes de homologar.'],
    ['filas_homologadas', outputRows.length, 'Debe coincidir exactamente con filas_origen.'],
    ['columnas_esquema_v2', HEADERS.length, 'Esquema completo esperado por el formulario.'],
    ['ids_duplicados', duplicated.length, duplicated.join(', ')],
    ['fechas_creacion_invalidas', invalidCreationDates.length, invalidCreationDates.map(function(item) {
      return 'fila ' + item.row + ' (' + (item.id_unico || 'sin ID') + '): ' + item.value;
    }).join(' | ')],
    ['columnas_fuera_esquema_con_datos', unknownNames.length, unknownNames.map(function(header) {
      return header + ': ' + unknownColumnsWithData[header] + ' fila(s)';
    }).join(' | ')],
    ['lista_para_revision', duplicated.length === 0 && invalidCreationDates.length === 0 && unknownNames.length === 0 ? 'SI' : 'NO',
      'NO significa revisar la auditoría; nunca se borraron los datos originales.']
  ];
  auditSheet.getRange(1, 1, auditRows.length, 3).setValues(auditRows);
  formatAuditSheet_(auditSheet);

  return {
    ok: true,
    source_sheet: SHEET_NAME,
    backup_sheet: backupResult.backup_sheet,
    homologated_sheet: migrationName,
    audit_sheet: auditName,
    source_rows: Math.max(0, sourceLastRow - 1),
    homologated_rows: outputRows.length,
    schema_columns: HEADERS.length,
    duplicate_ids: duplicated,
    invalid_creation_dates: invalidCreationDates,
    unknown_columns_with_data: unknownColumnsWithData,
    ready_for_activation: duplicated.length === 0 && invalidCreationDates.length === 0 && unknownNames.length === 0
  };
}

function formatMigrationSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#0b4f6c')
    .setFontColor('#ffffff');
  sheet.autoResizeColumns(1, HEADERS.length);
}

function formatAuditSheet_(sheet) {
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, 3)
    .setFontWeight('bold')
    .setBackground('#0b4f6c')
    .setFontColor('#ffffff');
  sheet.setColumnWidth(1, 240);
  sheet.setColumnWidth(2, 220);
  sheet.setColumnWidth(3, 700);
  sheet.getDataRange().setWrap(true);
}

function timestampForName_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyyMMdd_HHmmss');
}

function uniqueSheetName_(ss, baseName) {
  var safeBase = String(baseName || 'copia').slice(0, 90);
  var name = safeBase;
  var counter = 2;
  while (ss.getSheetByName(name)) {
    name = (safeBase.slice(0, 86) + '_' + counter).slice(0, 99);
    counter++;
  }
  return name;
}

function isPlausibleDate_(value) {
  var date = value instanceof Date ? value : new Date(String(value).replace(/^"|"$/g, ''));
  if (isNaN(date.getTime())) return false;
  var year = date.getFullYear();
  return year >= 2000 && year <= 2100;
}

function normalizeId_(id) {
  return String(id || '').trim().toUpperCase();
}

function findRowsById_(sheet, headers, id) {
  id = normalizeId_(id);
  var idCol = headers.indexOf('id_unico') + 1;
  if (idCol < 1 || sheet.getLastRow() < 2) return [];

  var values = sheet.getRange(2, idCol, sheet.getLastRow() - 1, 1).getValues();
  var rows = [];
  for (var i = 0; i < values.length; i++) {
    if (normalizeId_(values[i][0]) === id) rows.push(i + 2);
  }
  return rows;
}

function findRowById_(sheet, headers, id) {
  var rows = findRowsById_(sheet, headers, id);
  return rows.length ? rows[0] : -1;
}

function deleteDuplicateRows_(sheet, rows, keepRow) {
  if (!rows || rows.length < 2) return 0;
  var removed = 0;
  rows.slice().sort(function(a, b) { return b - a; }).forEach(function(row) {
    if (row !== keepRow) {
      sheet.deleteRow(row);
      removed++;
    }
  });
  return removed;
}

function buildRow_(headers, values) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    row.push(cleanCellValue_(values[headers[i]]));
  }
  return row;
}

function mergeRow_(headers, existingRow, values) {
  var row = [];
  for (var i = 0; i < headers.length; i++) {
    var header = headers[i];
    if (Object.prototype.hasOwnProperty.call(values, header)) {
      row.push(cleanCellValue_(values[header]));
    } else {
      row.push(existingRow[i]);
    }
  }
  return row;
}

function enrichIdentifiers_(values, id) {
  var region = cleanCode_(values.codigo_region) || extractCodeFromId_(id, /R(\d+)/);
  var province = cleanCode_(values.codigo_provincia) || extractCodeFromId_(id, /-P(\d+)/);
  var comuna = cleanCode_(values.codigo_comuna) || extractCodeFromId_(id, /-C(\d+)/);
  var attraction = cleanCode_(values.codigo_atractivo) || extractAttractionCode_(id);

  if (!province && comuna.length >= 3) province = comuna.slice(0, 3);

  if (region) values.codigo_region = region;
  if (province) values.codigo_provincia = province;
  if (comuna) values.codigo_comuna = comuna;
  if (attraction) {
    values.codigo_atractivo = attraction;
    values.idInterno = values.idInterno || ('A' + attraction);
  }
  if (region && province && comuna) {
    values.codigo_unico_territorial = values.codigo_unico_territorial || [region, province, comuna].join('-');
  }
  values.id_unico_formato = values.id_unico_formato || (
    /-P\d+-C\d+-A/.test(id) ? 'cut-region-provincia-comuna' : 'legacy-cut-comuna'
  );
}

function cleanCellValue_(value) {
  if (value === undefined || value === null) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') return value;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
}

function serializeRecordValue_(header, value) {
  if (Object.prototype.toString.call(value) !== '[object Date]') return value;
  if (DATE_ONLY_HEADERS.indexOf(header) !== -1) {
    return Utilities.formatDate(value, TIMEZONE, 'yyyy-MM-dd');
  }
  if (TIME_ONLY_HEADERS.indexOf(header) !== -1) {
    return Utilities.formatDate(value, TIMEZONE, 'HH:mm');
  }
  return Utilities.formatDate(value, TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX");
}

function applyTextFormatsToRows_(sheet, headers, startRow, rowCount) {
  if (!sheet || startRow < 1 || rowCount < 1) return;
  var endRow = startRow + rowCount - 1;
  var ranges = [];
  for (var i = 0; i < TEXT_HEADERS.length; i++) {
    var columnIndex = headers.indexOf(TEXT_HEADERS[i]);
    if (columnIndex < 0) continue;
    var column = columnLetter_(columnIndex + 1);
    ranges.push(column + startRow + ':' + column + endRow);
  }
  if (ranges.length) sheet.getRangeList(ranges).setNumberFormat('@');
}

function columnLetter_(columnNumber) {
  var result = '';
  var current = Number(columnNumber);
  while (current > 0) {
    current--;
    result = String.fromCharCode(65 + (current % 26)) + result;
    current = Math.floor(current / 26);
  }
  return result;
}

function normalizePhoneForSheet_(value, formula) {
  var source = formula ? String(formula).replace(/^=/, '') : String(value || '');
  var text = source.trim();
  if (!text) return '';
  var digits = text.replace(/\D/g, '');
  if (/^\d{9}$/.test(digits)) return '+56' + digits;
  if (/^56\d{8,9}$/.test(digits)) return '+' + digits;
  return text;
}

function normalizeTerritoryCode_(value, length) {
  var code = String(value || '').trim().replace(/\D/g, '');
  if (!code) return '';
  while (code.length < length) code = '0' + code;
  return code;
}

function extractAttractionCode_(id) {
  var match = String(id || '').match(/-A(.+)$/);
  return match ? match[1] : '';
}

function extractCodeFromId_(id, pattern) {
  var match = String(id || '').match(pattern);
  return match ? match[1] : '';
}

function cleanCode_(code) {
  return String(code || '').trim().replace(/[^0-9A-Za-z]/g, '');
}

function authCheck_() {
  try {
    var sheet = getSheet_();
    var headers = ensureHeaders_(sheet);
    var root = DriveApp.getFolderById(DRIVE_ROOT_FOLDER_ID);
    return jsonResponse_({
      ok: true,
      message: 'Autorización correcta: Google Sheet y Google Drive disponibles.',
      sheet: sheet.getName(),
      total_headers: headers.length,
      drive_root_folder: root.getName(),
      drive_root_folder_id: DRIVE_ROOT_FOLDER_ID,
      timestamp: now_()
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      message: String(error && error.message ? error.message : error),
      timestamp: now_()
    });
  }
}

function clearFolderFiles_(folder) {
  var files = folder.getFiles();
  while (files.hasNext()) {
    files.next().setTrashed(true);
  }
}

function normalizeFolderName_(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findFolderNormalized_(parent, name) {
  if (!parent) return null;
  var normalizedTarget = normalizeFolderName_(sanitizeFileName_(String(name || '').trim() || 'Sin nombre'));
  var folders = parent.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    if (normalizeFolderName_(folder.getName()) === normalizedTarget) return folder;
  }
  return null;
}

function getOrCreateFolderNormalized_(parent, name) {
  var cleanName = sanitizeFileName_(String(name || '').trim() || 'Sin nombre');
  var existingFolder = findFolderNormalized_(parent, cleanName);
  if (existingFolder) return existingFolder;

  return parent.createFolder(cleanName);
}

function parseDataUrl_(dataUrl, fallbackMime) {
  var text = String(dataUrl || '');
  var match = text.match(/^data:([^;]+);base64,(.*)$/);
  if (match) return { mime: match[1] || fallbackMime || '', base64: match[2] || '' };

  var comma = text.indexOf(',');
  if (comma >= 0) return { mime: fallbackMime || '', base64: text.slice(comma + 1) };
  return { mime: fallbackMime || '', base64: text };
}

function guessMimeFromName_(name) {
  var lower = String(name || '').toLowerCase();
  if (/\.jpe?g$/.test(lower)) return 'image/jpeg';
  if (/\.png$/.test(lower)) return 'image/png';
  if (/\.gif$/.test(lower)) return 'image/gif';
  if (/\.webp$/.test(lower)) return 'image/webp';
  if (/\.bmp$/.test(lower)) return 'image/bmp';
  if (/\.tiff?$/.test(lower)) return 'image/tiff';
  if (/\.heic$/.test(lower)) return 'image/heic';
  if (/\.heif$/.test(lower)) return 'image/heif';
  if (/\.avif$/.test(lower)) return 'image/avif';
  return '';
}

function extensionFromMime_(mime) {
  var map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/bmp': '.bmp',
    'image/tiff': '.tif',
    'image/heic': '.heic',
    'image/heif': '.heif',
    'image/avif': '.avif'
  };
  return map[String(mime || '').toLowerCase()] || '.img';
}

function sanitizeFileName_(name) {
  return String(name || 'archivo').replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
}

function now_() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function autorizarDrive() {
  var root = DriveApp.getFolderById(DRIVE_ROOT_FOLDER_ID);
  Logger.log('Drive conectado correctamente: ' + root.getName());
}

function limpiarDuplicadosPorIdUnico() {
  var sheet = getSheet_();
  var headers = ensureHeaders_(sheet);
  var idCol = headers.indexOf('id_unico') + 1;
  if (idCol < 1 || sheet.getLastRow() < 2) return 'No hay datos para revisar.';

  var lastRow = sheet.getLastRow();
  var values = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  var seen = {};
  var rowsToDelete = [];

  for (var i = 0; i < values.length; i++) {
    var id = normalizeId_(values[i][0]);
    var row = i + 2;
    if (!id) continue;
    if (seen[id]) rowsToDelete.push(row);
    else seen[id] = row;
  }

  rowsToDelete.sort(function(a, b) { return b - a; }).forEach(function(row) {
    sheet.deleteRow(row);
  });

  return 'Duplicados eliminados: ' + rowsToDelete.length;
}
