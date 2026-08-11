# Catastro Nacional de Recursos Turisticos

Plataforma web para levantar, actualizar, revisar y consultar informacion territorial de recursos y atractivos turisticos de Chile.

El proyecto busca facilitar el trabajo de equipos tecnicos, municipios y organismos vinculados al turismo mediante una estructura comun de registro. Cada ficha permite reunir antecedentes territoriales, descriptivos, operativos, fotograficos y de gestion, manteniendo una relacion clara entre el recurso y su ubicacion regional, provincial y comunal.

## Proposito

La plataforma apoya la elaboracion y mantencion de un catastro turistico ordenado, comparable y georreferenciado. Su finalidad es reducir la dispersion de informacion, mejorar la revision de los registros y facilitar su respaldo para procesos de planificacion, validacion y toma de decisiones.

## Funciones principales

- Formulario guiado organizado en 18 secciones tematicas.
- Identificacion territorial mediante region, provincia y comuna.
- Generacion de un ID unico para cada recurso turistico.
- Georreferenciacion mediante mapa, coordenadas geograficas y coordenadas UTM.
- Proteccion de la ubicacion confirmada para evitar cambios accidentales.
- Estados de avance por seccion: pendiente, con avance y finalizado.
- Chequeo de admisibilidad antes del cierre de la ficha.
- Borradores locales y respaldos en formato JSON.
- Almacenamiento y previsualizacion de fotografias del recurso.
- Exportacion de una ficha completa y ordenada en PDF.
- Enlaces clickeables para correos, sitios web, redes sociales y fotografias.
- Dashboard territorial con mapa, indicadores, filtros y ordenamiento de registros.
- Edicion de registros existentes conservando la identidad propia del atractivo.
- Carga masiva para crear registros iniciales desde archivos Excel y continuar su edicion en el formulario.
- Consulta integrada del manual metodologico del catastro.

## Componentes

### Formulario

Permite crear una ficha nueva o editar un registro existente. Incluye validaciones, condiciones de avance, clasificacion del recurso, localizacion, administracion, accesibilidad, servicios, riesgos, promocion, fotografias y observaciones.

### Dashboard

Presenta una vision general de los registros disponibles. Permite buscar, filtrar, ordenar, revisar su distribucion territorial, abrir la ficha de un recurso y acceder al formulario para editarlo.

### Carga masiva

Facilita la incorporacion inicial de varios recursos desde una planilla. El usuario puede relacionar las columnas del archivo con los campos principales del catastro, validar el lote y generar registros que posteriormente deben completarse y revisarse individualmente.

### Manual

Entrega acceso al documento metodologico que orienta la clasificacion, digitalizacion y registro de los recursos turisticos.

## Flujo de trabajo

1. Crear un nuevo recurso o cargar un registro existente.
2. Completar sus datos generales y clasificacion.
3. Seleccionar manualmente el territorio y confirmar su ubicacion en el mapa.
4. Avanzar por las secciones del formulario y revisar la admisibilidad.
5. Incorporar fotografias y antecedentes complementarios.
6. Guardar el registro, revisar su ficha o exportarlo como PDF o JSON.
7. Consultar y editar posteriormente el recurso desde el dashboard.

## Archivos principales

- `index.html`: formulario principal del catastro.
- `dashboard.html`: consulta territorial y revision de registros.
- `carga-masiva.html`: importacion y validacion inicial de lotes.
- `manual.html`: visualizador del manual metodologico.
- `manual-catastro-recursos-turisticos.pdf`: documento de referencia.

## Estado del proyecto

El repositorio corresponde a un prototipo funcional en evolucion. Puede utilizarse localmente y tambien integrarse con servicios externos para sincronizar registros y respaldar fotografias.

Las futuras etapas consideran fortalecer la administracion de usuarios, los permisos territoriales, la trazabilidad de cambios, la calidad de datos y la generacion de reportes para distintos niveles de gestion.
