# Actualización segura del formulario y Google Sheet

## Principio

No reemplazar `index.html`, no publicar el Apps Script nuevo y no renombrar la
hoja `registros` hasta completar el respaldo, la homologación y las pruebas.

## Archivos preparados

- `index-proyecto-paralelo-seguro.html`
- `apps-script-migracion-segura.gs`
- `tools/verificar-migracion-segura.mjs`

## Etapa 1: preparar una copia en Google Sheets

1. Pegar `apps-script-migracion-segura.gs` en el proyecto de Apps Script.
2. Guardar el proyecto, pero todavía no crear una nueva implementación.
3. Ejecutar manualmente `prepararHomologacionSegura`.
4. Autorizar los permisos solicitados.
5. Confirmar que se crearon tres pestañas:
   - `respaldo_registros_...`
   - `registros_homologados_v2_...`
   - `auditoria_homologacion_...`
6. Revisar que `filas_origen` y `filas_homologadas` sean iguales.
7. Revisar los IDs duplicados, fechas anómalas y columnas fuera del esquema.

La función no borra, renombra ni reemplaza la pestaña `registros`.

## Etapa 2: validar la hoja homologada

1. Comparar una muestra de registros antiguos entre `registros` y la nueva hoja.
2. Verificar nombre, territorio, clasificación, coordenadas, descripción y fotos.
3. Confirmar que la nueva hoja tiene 136 encabezados.
4. Corregir manualmente solo las anomalías informadas por la auditoría.
5. Conservar el ID antiguo de los registros existentes.

## Etapa 3: activar el esquema nuevo

Realizar esta etapa únicamente después de aprobar la auditoría.

1. Renombrar `registros` como `registros_legacy_YYYYMMDD`.
2. Renombrar la hoja homologada como `registros`.
3. Ejecutar `repararEncabezadosSinBorrarNada`.
4. Publicar una nueva versión de la aplicación web.
5. Abrir `.../exec?action=schema` y confirmar `total_headers: 136`.

## Etapa 4: probar antes de reemplazar el index principal

1. Poner la URL de la nueva implementación en `ONLINE_SYNC_URL` de
   `index-proyecto-paralelo-seguro.html`.
2. Cargar por ID un registro antiguo y comprobar que mantiene su ID.
3. Modificar un campo no crítico y guardar online.
4. Recargar el registro y comprobar que el cambio aparece sin vaciar otros campos.
5. Crear un registro de prueba nuevo y revisar las 136 columnas.
6. Probar fotografías y verificar enlaces y carpeta en Drive.
7. Recién después reemplazar `index.html` por la copia segura.

## Reversión

Si una prueba falla:

1. Volver a publicar la implementación anterior del Apps Script.
2. Mantener o restaurar el `index.html` anterior.
3. Renombrar `registros` con un nombre de diagnóstico.
4. Renombrar `registros_legacy_YYYYMMDD` nuevamente como `registros`.

El respaldo creado antes de la homologación debe conservarse sin cambios.
