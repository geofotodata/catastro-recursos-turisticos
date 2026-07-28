import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, "..");
const outputDir = path.join(projectDir, "outputs", "simulacion_formulario");
const outputPath = path.join(outputDir, "simulacion_4_atractivos_todos_los_campos.xlsx");

const columns = [
  "id_unico", "id_unico_formato", "codigo_unico_territorial", "codigo_region", "codigo_provincia", "codigo_comuna", "codigo_atractivo", "idInterno", "estado",
  "nombreRecurso", "region", "provincia", "comuna", "localidad", "responsable", "correoResponsable", "telefonoResponsable", "institucion", "fechaRegistro",
  "coordenadas", "latitud", "longitud", "coordX", "coordY", "utmZona",
  "categoria", "tipoRecurso", "subtipoRecurso", "descripcion",
  "propiedad", "nombrePropietario", "tipoOrgPropietario", "correoPropietario", "telefonoPropietario",
  "administracion", "nombreAdministrador", "tipoOrgAdministrador", "correoAdministrador", "telefonoAdministrador", "sitioWeb", "alcanceActuacion", "operacionConcesion", "patrocinioEvento",
  "tipoAcceso", "mediosTransporte", "distanciaCapitalRegional", "distanciaCapitalComunal",
  "tiposExperiencia", "actividades",
  "tieneInstalaciones", "instalacionesPublicas",
  "nAdmin", "nOperacion", "nTurismo", "nIdiomas", "idiomas", "lenguasOriginarias",
  "tipoIngreso", "tipoPago", "medioPago", "reserva", "tipoReserva", "mesesOperacion", "diasOperacion", "horaDesde", "horaHasta", "mesesRecomendados", "ingresoMascotas", "continuidad",
  "sistemaVisitas", "tipoRegistro", "ultimoAnoRegistro", "reportesVisita", "frecuenciaReportes", "visitantesTotal", "visitantesNacionales", "visitantesExtranjeros",
  "tieneServiciosTuristicos", "serviciosTuristicos", "tieneServiciosBasicos", "serviciosBasicos",
  "tieneSeguridad", "instalacionesSeguridad", "accesibilidadUniversal", "elementosAccesibles", "aptoDiscapacidades", "fichaIdat", "perrosGuia", "apoyoEmocional",
  "tieneReconocimiento", "alcanceReconocimiento", "institucionReconocimiento", "denominacionReconocimiento", "fechaReconocimiento",
  "amenazasNaturales", "planRRD", "planEmergencia",
  "enPlanificacion", "instrumentosGestion", "capacidadCarga", "resolucionSanitaria",
  "sePromociona", "escalaPromocion", "instrumentoPromocion", "instrumentosPromocion", "escalaComercializacion", "canalesComercializacion",
  "tieneWeb", "urlWeb", "periodicidadWeb", "tieneRedes", "redesSociales", "redesSocialesDetalle", "nombreCuenta", "periodicidadRedes",
  "puntoInfoTuristica", "periodicidadInfoTuristica", "mediosComunicacion", "tiposMedios", "feriasEventos", "nombreFeria", "periodicidadFerias", "folleteria", "tipoFolleteria", "periodicidadFolleteria", "otrosMedios",
  "fotos_cantidad", "fotos_links", "fotos_carpeta_drive", "fotos_ruta_drive", "fecha_subida_fotos",
  "observaciones", "fecha_creacion", "fecha_actualizacion", "fecha_sincronizacion", "zona_horaria_usuario"
];

const records = [
  {
    id_unico: "R13-P136-C13603-A7K2M9Q", id_unico_formato: "cut-region-provincia-comuna", codigo_unico_territorial: "13-136-13603", codigo_region: "13", codigo_provincia: "136", codigo_comuna: "13603", codigo_atractivo: "7K2M9Q", idInterno: "A7K2M9Q",
    nombreRecurso: "Mirador del Viento", region: "Región Metropolitana de Santiago", provincia: "Talagante", comuna: "Isla de Maipo", localidad: "Camino La Puntilla", responsable: "Camila Rojas", correoResponsable: "camila.rojas@municipio.cl", telefonoResponsable: "+56981234567", institucion: "Municipalidad de Isla de Maipo", fechaRegistro: new Date("2026-07-19"),
    coordenadas: "-33.752210, -70.902450", latitud: -33.752210, longitud: -70.902450, coordX: 323456.22, coordY: 6261401.88, utmZona: "19S",
    categoria: "Recurso Natural", tipoRecurso: "Montaña", subtipoRecurso: "Cerro", descripcion: "Cerro bajo con vista panorámica hacia viñedos y paisaje rural.",
    propiedad: "Pública", nombrePropietario: "Estado de Chile", tipoOrgPropietario: "Jurídica", administracion: "Pública", nombreAdministrador: "Municipalidad de Isla de Maipo", tipoOrgAdministrador: "Jurídica", correoAdministrador: "turismo@islademaipo.cl", telefonoAdministrador: "+56987654321", alcanceActuacion: "Local",
    tipoAcceso: ["Terrestre"], mediosTransporte: ["Auto", "Bicicleta"], distanciaCapitalRegional: 52, distanciaCapitalComunal: 6,
    tiposExperiencia: ["Turismo de naturaleza y/o ecoturismo", "Turismo rural"], actividades: ["Observación de paisajes", "Senderismo o hiking", "Observación de paisaje"],
    tieneInstalaciones: "Sí", instalacionesPublicas: ["Miradores", "Señalética informativa (entrega información práctica u objetiva que ayuda al visitante)"],
    nAdmin: 2, nOperacion: 4, nTurismo: 1, nIdiomas: 1, idiomas: ["Español", "Inglés"], lenguasOriginarias: [],
    tipoIngreso: "Libre", mesesOperacion: ["Todo el año"], diasOperacion: ["Toda la semana"], mesesRecomendados: ["Septiembre", "Octubre", "Noviembre"], ingresoMascotas: "Sí", continuidad: 5,
    sistemaVisitas: "No",
    tieneServiciosTuristicos: "Sí", serviciosTuristicos: ["Guía de turismo", "Restaurantes y similares"], tieneServiciosBasicos: "Sí", serviciosBasicos: ["Cobertura de internet móvil", "Recolección de residuos sólidos domiciliarios y/o asimilables"],
    tieneSeguridad: "Sí", instalacionesSeguridad: ["Señalética de seguridad"], accesibilidadUniversal: "No", perrosGuia: "Sí", apoyoEmocional: "No",
    tieneReconocimiento: "No", amenazasNaturales: ["Incendios forestales", "Calor intenso o extremo"], planRRD: "No", planEmergencia: "Sí",
    enPlanificacion: "Sí", instrumentosGestion: ["Plan de desarrollo turístico (PLADETUR)"], capacidadCarga: "No",
    sePromociona: "Sí", escalaPromocion: "Regional", instrumentoPromocion: "Sí", instrumentosPromocion: ["Chile es tuyo"], escalaComercializacion: "Se comercializa a nivel local", canalesComercializacion: ["Operadores turisticos locales"],
    tieneWeb: "Sí", urlWeb: "https://turismo.islademaipo.cl/mirador", periodicidadWeb: "Permanente", tieneRedes: "Sí", redesSociales: ["Instagram", "Facebook"], redesSocialesDetalle: JSON.stringify([{ red: "Instagram", cuenta: "@miradordelviento", url: "https://instagram.com/miradordelviento" }, { red: "Facebook", cuenta: "Mirador del Viento", url: "" }]), nombreCuenta: "Instagram: @miradordelviento | Facebook: Mirador del Viento", periodicidadRedes: "Permanente",
    puntoInfoTuristica: "Sí", periodicidadInfoTuristica: "Permanente", mediosComunicacion: "No", feriasEventos: "No", folleteria: "Sí", tipoFolleteria: "Digital", periodicidadFolleteria: "Esporádica",
    fotos_cantidad: 4, fotos_links: "https://drive.google.com/folder/mirador", fotos_carpeta_drive: "Catastro fotos recursos turisticos/13/136/13603/R13-P136-C13603-A7K2M9Q", fecha_subida_fotos: "2026-07-19T10:15:00-04:00",
    observaciones: "Registro ficticio completo para prueba.", fecha_creacion: "2026-07-19T10:00:00-04:00", fecha_actualizacion: "2026-07-19T10:20:00-04:00", fecha_sincronizacion: "2026-07-19T10:21:00-04:00", zona_horaria_usuario: "America/Santiago"
  },
  {
    id_unico: "R05-P051-C05109-AQ8Z1VB", id_unico_formato: "cut-region-provincia-comuna", codigo_unico_territorial: "05-051-05109", codigo_region: "05", codigo_provincia: "051", codigo_comuna: "05109", codigo_atractivo: "Q8Z1VB", idInterno: "AQ8Z1VB",
    nombreRecurso: "Festival Costero del Atardecer", region: "Región de Valparaíso", provincia: "Valparaíso", comuna: "Viña del Mar", localidad: "", responsable: "Diego Muñoz", correoResponsable: "diego.munoz@evento.cl", institucion: "Corporación Cultural Local", fechaRegistro: new Date("2026-07-18"),
    coordenadas: "-33.024500, -71.552300", latitud: -33.0245, longitud: -71.5523, categoria: "Recurso Cultural", tipoRecurso: "Acontecimientos programados", subtipoRecurso: "Evento de música, canto o danza", descripcion: "Evento musical de temporada en borde costero.",
    administracion: "Privada", nombreAdministrador: "Productora Costa Viva", tipoOrgAdministrador: "Jurídica", correoAdministrador: "produccion@costaviva.cl", alcanceActuacion: "Regional", patrocinioEvento: "Regional",
    tipoAcceso: ["Terrestre"], mediosTransporte: ["Bus o minibús", "Metro o metrotrén"], tiposExperiencia: ["Cultura y Patrimonio", "Turismo urbano"], actividades: ["Consumo cultural", "Cafés, bares y vida nocturna"],
    tieneInstalaciones: "No", nAdmin: 3, nOperacion: 25, idiomas: ["Español"], tipoIngreso: "Pagado", tipoPago: "Online", medioPago: ["Electrónico"], reserva: "Reserva anticipada", tipoReserva: "Online", mesesOperacion: ["Enero", "Febrero"], diasOperacion: ["Viernes", "Sábado"], continuidad: 2,
    sistemaVisitas: "Sí", tipoRegistro: "Digital", ultimoAnoRegistro: 2025, reportesVisita: "Sí", frecuenciaReportes: "Anual", visitantesTotal: 12000,
    tieneServiciosTuristicos: "Sí", serviciosTuristicos: ["Restaurantes y similares", "Transporte de pasajeros"], tieneServiciosBasicos: "Sí", serviciosBasicos: ["Agua potable", "Energía eléctrica", "Servicios higiénicos"],
    tieneSeguridad: "Sí", instalacionesSeguridad: ["Puesto de control o acceso", "Puntos de encuentro (emergencia)"], accesibilidadUniversal: "Sí", elementosAccesibles: ["Accesos", "Baños"], aptoDiscapacidades: ["Física", "Sensorial"], fichaIdat: "No", perrosGuia: "Sí",
    tieneReconocimiento: "Sí", alcanceReconocimiento: "Local", institucionReconocimiento: "Municipalidad", denominacionReconocimiento: "Evento destacado de verano", fechaReconocimiento: new Date("2025-12-15"),
    enPlanificacion: "No", capacidadCarga: "Sí", sePromociona: "Sí", escalaPromocion: "Nacional", instrumentoPromocion: "No", escalaComercializacion: "No se comercializa",
    tieneRedes: "Sí", redesSociales: ["TikTok"], redesSocialesDetalle: JSON.stringify([{ red: "TikTok", cuenta: "@festivalatardecer", url: "" }]), nombreCuenta: "TikTok: @festivalatardecer",
    fotos_cantidad: 0, observaciones: "Faltan fotos y algunos datos opcionales."
  },
  {
    id_unico: "R16-P161-C16101-AP4N6XD", id_unico_formato: "cut-region-provincia-comuna", codigo_unico_territorial: "16-161-16101", codigo_region: "16", codigo_provincia: "161", codigo_comuna: "16101", codigo_atractivo: "P4N6XD", idInterno: "AP4N6XD",
    nombreRecurso: "Museo de Oficios del Valle", region: "Región de Ñuble", provincia: "Diguillín", comuna: "Chillán", responsable: "Valentina Vera", correoResponsable: "valentina.vera@nuble.cl", telefonoResponsable: "", institucion: "Gobierno Regional", fechaRegistro: new Date("2026-07-17"),
    categoria: "Recurso Cultural", tipoRecurso: "Manifestación Cultural", subtipoRecurso: "Museo", descripcion: "Museo ficticio orientado a oficios rurales y memoria local.",
    coordenadas: "-36.606262, -72.102336", latitud: -36.606262, longitud: -72.102336,
    propiedad: "Privada", nombrePropietario: "Fundación Oficios del Valle", tipoOrgPropietario: "Jurídica", administracion: "Privada", nombreAdministrador: "Fundación Oficios del Valle", tipoOrgAdministrador: "Jurídica", correoAdministrador: "contacto@oficiosvalle.cl", sitioWeb: "https://oficiosvalle.cl", alcanceActuacion: "Local",
    tipoAcceso: ["Terrestre"], mediosTransporte: ["Auto", "Bus o minibús"], tiposExperiencia: ["Cultura y Patrimonio"], actividades: ["Visitas guiadas patrimoniales", "Talleres culturales o patrimoniales"],
    tieneInstalaciones: "Sí", instalacionesPublicas: ["Oficina de información turística", "Servicios higiénicos", "Señalética interpretativa (entrega información para que el visitante comprenda y valore elementos del entorno)"],
    nAdmin: 1, nOperacion: 6, nTurismo: 2, nIdiomas: 0, idiomas: ["Español"], tipoIngreso: "Semi-restringido (previo permiso)", mesesOperacion: ["Todo el año"], diasOperacion: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"], horaDesde: "10:00", horaHasta: "17:00", continuidad: 8,
    sistemaVisitas: "Sí", tipoRegistro: "Papel", ultimoAnoRegistro: 2025, reportesVisita: "No", visitantesTotal: 1800, visitantesNacionales: 1750, visitantesExtranjeros: 50,
    tieneServiciosTuristicos: "No", tieneServiciosBasicos: "Sí", serviciosBasicos: ["Agua potable", "Energía eléctrica", "Baños químicos"],
    tieneSeguridad: "No", accesibilidadUniversal: "Sí", elementosAccesibles: ["Accesos", "Información adaptada", "Personal capacitado"], aptoDiscapacidades: ["Intelectual y/o cognitiva", "Física"], fichaIdat: "Sí", perrosGuia: "Sí",
    amenazasNaturales: ["Terremotos"], planRRD: "Sí", planEmergencia: "Sí", enPlanificacion: "Sí", instrumentosGestion: ["Estrategia o politica regional de turismo", "Plan regional de desarrollo turistico"], capacidadCarga: "No",
    sePromociona: "No", instrumentoPromocion: "Sí", instrumentosPromocion: ["Material promocional de empresas privadas"], escalaComercializacion: "Se comercializa a nivel regional", canalesComercializacion: ["Agencias de viaje receptivas", "Operadores turisticos locales"],
    tieneWeb: "Sí", urlWeb: "https://oficiosvalle.cl", periodicidadWeb: "Permanente", tieneRedes: "No", puntoInfoTuristica: "No", mediosComunicacion: "Sí", tiposMedios: ["Radios", "Periódicos"], feriasEventos: "Sí", nombreFeria: "Feria de Patrimonio Local", periodicidadFerias: "Anual", folleteria: "No",
    fotos_cantidad: 3, observaciones: ""
  },
  {
    id_unico: "R01-C01107-AL3G9RT", id_unico_formato: "legacy-cut-comuna", codigo_unico_territorial: "01-011-01107", codigo_region: "01", codigo_provincia: "011", codigo_comuna: "01107", codigo_atractivo: "L3G9RT", idInterno: "AL3G9RT",
    nombreRecurso: "Oasis Urbano Alto Hospicio", region: "Región de Tarapacá", provincia: "Iquique", comuna: "Alto Hospicio", localidad: "Sector mirador urbano", responsable: "Martín Flores", correoResponsable: "martin.flores@municipal.cl", institucion: "Municipalidad de Alto Hospicio", fechaRegistro: new Date("2026-07-16"),
    categoria: "Recurso Natural", tipoRecurso: "Planicie", subtipoRecurso: "Oasis", descripcion: "",
    coordenadas: "", latitud: null, longitud: null,
    administracion: "", nombreAdministrador: "", tipoOrgAdministrador: "", correoAdministrador: "", alcanceActuacion: "",
    tipoAcceso: ["Terrestre"], mediosTransporte: [], tiposExperiencia: ["Turismo urbano"], actividades: [],
    tieneInstalaciones: "", nAdmin: 0, nOperacion: 0, idiomas: ["Otro"],
    tipoIngreso: "", mesesOperacion: [], diasOperacion: [], continuidad: null,
    sistemaVisitas: "", tieneServiciosTuristicos: "", tieneServiciosBasicos: "", tieneSeguridad: "", accesibilidadUniversal: "", perrosGuia: "",
    tieneReconocimiento: "", enPlanificacion: "", capacidadCarga: "", sePromociona: "", instrumentoPromocion: "", escalaComercializacion: "",
    fotos_cantidad: 0, observaciones: "Registro incompleto intencional para revisar columnas vacías."
  }
];

const technicalColumns = new Set([
  "mediosTransporte", "actividades", "utmZona", "codigo_region", "codigo_provincia", "codigo_comuna",
  "codigo_atractivo", "id_unico", "id_unico_formato", "nombreCuenta", "fecha_subida_fotos",
  "fotos_cantidad", "fotos_carpeta_drive", "fotos_ruta_drive", "fotos_links", "estado",
  "fecha_creacion", "fecha_actualizacion", "fecha_sincronizacion", "zona_horaria_usuario"
]);

const missingInCurrentAppsScript = [
  "codigo_unico_territorial", "correoAdministrador", "id_unico_formato", "periodicidadFerias",
  "periodicidadFolleteria", "periodicidadInfoTuristica", "puntoInfoTuristica",
  "redesSocialesDetalle", "telefonoAdministrador", "visitantesTotal"
];

const arrayDefaults = {
  tipoAcceso: ["Terrestre", "Aéreo"],
  mediosTransporte: ["Auto", "Bus o minibús", "Avión o avioneta"],
  tiposExperiencia: ["Cultura y Patrimonio", "Turismo de naturaleza y/o ecoturismo"],
  actividades: ["Visitas guiadas patrimoniales", "Observación de paisajes"],
  instalacionesPublicas: ["Áreas de descanso", "Miradores", "Servicios higiénicos"],
  idiomas: ["Español", "Inglés"],
  lenguasOriginarias: ["Mapuzungún (lengua mapuche)"],
  medioPago: ["Efectivo", "Electrónico", "Transferencia"],
  mesesOperacion: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  diasOperacion: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"],
  mesesRecomendados: ["Enero", "Febrero", "Marzo", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  serviciosTuristicos: ["Guía de turismo", "Restaurantes y similares"],
  serviciosBasicos: ["Agua potable", "Energía eléctrica", "Conexión a internet (Wifi)"],
  instalacionesSeguridad: ["Puesto de primeros auxilios", "Señalética de seguridad"],
  elementosAccesibles: ["Accesos", "Baños", "Estacionamiento"],
  aptoDiscapacidades: ["Física", "Sensorial"],
  amenazasNaturales: ["Terremotos", "Incendios forestales"],
  instrumentosGestion: ["Plan de desarrollo turístico (PLADETUR)"],
  instrumentosPromocion: ["Chile es tuyo", "Chile travel"],
  canalesComercializacion: ["Agencias de viaje receptivas", "Operadores turísticos locales"],
  redesSociales: ["Facebook", "Instagram"],
  tiposMedios: ["Páginas web", "Radios", "Televisión"]
};

const numericDefaults = new Set([
  "latitud", "longitud", "coordX", "coordY", "distanciaCapitalRegional", "distanciaCapitalComunal",
  "nAdmin", "nOperacion", "nTurismo", "nIdiomas", "continuidad", "ultimoAnoRegistro",
  "visitantesTotal", "visitantesNacionales", "visitantesExtranjeros", "fotos_cantidad"
]);

const yesNoDefaults = new Set([
  "ingresoMascotas", "sistemaVisitas", "reportesVisita", "tieneServiciosTuristicos", "tieneServiciosBasicos",
  "tieneSeguridad", "accesibilidadUniversal", "fichaIdat", "perrosGuia", "apoyoEmocional",
  "tieneReconocimiento", "planRRD", "planEmergencia", "enPlanificacion", "capacidadCarga",
  "resolucionSanitaria", "sePromociona", "instrumentoPromocion", "tieneWeb", "tieneRedes",
  "puntoInfoTuristica", "mediosComunicacion", "feriasEventos", "folleteria"
]);

function defaultForColumn(column, index, record) {
  if (arrayDefaults[column]) return arrayDefaults[column].slice();
  if (numericDefaults.has(column)) {
    const numeric = {
      latitud: -33.45 - index * 0.25,
      longitud: -70.65 - index * 0.2,
      coordX: 350000 + index * 12500,
      coordY: 6200000 - index * 25000,
      distanciaCapitalRegional: 25 + index * 18,
      distanciaCapitalComunal: 4 + index * 3,
      nAdmin: 2 + index,
      nOperacion: 6 + index * 2,
      nTurismo: 2 + index,
      nIdiomas: 1 + index,
      continuidad: 5 + index,
      ultimoAnoRegistro: 2025,
      visitantesTotal: 12000 + index * 1750,
      visitantesNacionales: 10000 + index * 1500,
      visitantesExtranjeros: 2000 + index * 250,
      fotos_cantidad: 3 + (index % 3)
    };
    return numeric[column];
  }
  if (yesNoDefaults.has(column)) return "Sí";
  if (["fechaRegistro", "fechaReconocimiento"].includes(column)) return new Date(`2026-07-${String(19 - index).padStart(2, "0")}`);
  if (["fecha_creacion", "fecha_actualizacion", "fecha_sincronizacion", "fecha_subida_fotos"].includes(column)) return `2026-07-${String(19 - index).padStart(2, "0")}T10:${String(index * 10).padStart(2, "0")}:00-04:00`;
  if (column.toLowerCase().includes("correo")) return `contacto${index + 1}@ejemplo.cl`;
  if (column.toLowerCase().includes("telefono")) return `+5698123456${index}`;
  if (["sitioWeb", "urlWeb"].includes(column)) return `https://www.recurso${index + 1}.cl`;
  if (column === "redesSocialesDetalle") return JSON.stringify([
    { red: "Instagram", cuenta: `@recurso${index + 1}`, url: `https://instagram.com/recurso${index + 1}` },
    { red: "Facebook", cuenta: `Recurso ${index + 1}`, url: `https://facebook.com/recurso${index + 1}` }
  ]);
  if (column === "nombreCuenta") return `Instagram: @recurso${index + 1} | Facebook: Recurso ${index + 1}`;
  if (column === "fotos_links") return `https://drive.google.com/file/d/foto_${index + 1}_01\nhttps://drive.google.com/file/d/foto_${index + 1}_02\nhttps://drive.google.com/file/d/foto_${index + 1}_03`;
  if (column === "fotos_carpeta_drive") return `https://drive.google.com/drive/folders/recurso_${index + 1}`;
  if (column === "fotos_ruta_drive") return `Catastro fotos recursos turisticos / R${record.codigo_region} / P${record.codigo_provincia} / C${record.codigo_comuna} / ${record.id_unico}`;
  const defaults = {
    estado: "finalizado", utmZona: "19S", tipoIngreso: "Pagado", tipoPago: "Ambas",
    reserva: "Reserva anticipada", tipoReserva: "Online", horaDesde: "09:00", horaHasta: "18:00",
    propiedad: "Pública", tipoOrgPropietario: "Jurídica", administracion: "Pública",
    tipoOrgAdministrador: "Jurídica", alcanceActuacion: "Regional", patrocinioEvento: "Regional",
    tipoRegistro: "Digital", frecuenciaReportes: "Mensual", alcanceReconocimiento: "Regional",
    escalaPromocion: "Regional", escalaComercializacion: "Se comercializa a nivel regional",
    periodicidadWeb: "Permanente", periodicidadRedes: "Permanente", periodicidadInfoTuristica: "Permanente",
    periodicidadFerias: "Permanente", periodicidadFolleteria: "Permanente", tipoFolleteria: "Digital",
    zona_horaria_usuario: "America/Santiago"
  };
  return defaults[column] || `Dato de prueba ${index + 1} - ${column}`;
}

function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}

records.forEach((record, index) => {
  columns.forEach(column => {
    if (!isFilled(record[column])) record[column] = defaultForColumn(column, index, record);
  });
  if (Number(record.fotos_cantidad) < 1) record.fotos_cantidad = 3 + (index % 3);
});

const duplicateColumns = columns.filter((column, index) => columns.indexOf(column) !== index);
const emptyCells = records.flatMap((record, recordIndex) => columns
  .filter(column => !isFilled(record[column]))
  .map(column => ({ record: recordIndex + 1, column })));
if (duplicateColumns.length) throw new Error(`Encabezados duplicados: ${duplicateColumns.join(", ")}`);
if (emptyCells.length) throw new Error(`Quedaron celdas vacías: ${JSON.stringify(emptyCells)}`);

function printable(value) {
  if (Array.isArray(value)) return value.join(" | ");
  if (value instanceof Date) return value;
  if (value === undefined || value === null) return "";
  return value;
}

const matrix = [columns, ...records.map(record => columns.map(col => printable(record[col])))];

await fs.mkdir(outputDir, { recursive: true });

const workbook = Workbook.create();
const registros = workbook.worksheets.add("Registros simulados");
registros.showGridLines = false;
registros.getRangeByIndexes(0, 0, matrix.length, columns.length).values = matrix;
registros.getRangeByIndexes(0, 0, 1, columns.length).format = {
  fill: "#0F3B4F",
  font: { bold: true, color: "#FFFFFF" },
  wrapText: true
};
registros.getRangeByIndexes(1, 0, records.length, columns.length).format = {
  wrapText: true,
  verticalAlignment: "top"
};
registros.getRangeByIndexes(1, columns.indexOf("fechaRegistro"), records.length, 1).format.numberFormat = "yyyy-mm-dd";
[
  "id_unico", "id_unico_formato", "codigo_unico_territorial", "codigo_atractivo", "idInterno"
].forEach(column => {
  registros.getRangeByIndexes(1, columns.indexOf(column), records.length, 1).format.numberFormat = "@";
});
registros.getRangeByIndexes(1, columns.indexOf("codigo_region"), records.length, 1).format.numberFormat = "00";
registros.getRangeByIndexes(1, columns.indexOf("codigo_provincia"), records.length, 1).format.numberFormat = "000";
registros.getRangeByIndexes(1, columns.indexOf("codigo_comuna"), records.length, 1).format.numberFormat = "00000";
registros.freezePanes.freezeRows(1);
registros.freezePanes.freezeColumns(2);
registros.tables.add(`A1:${columnLetter(columns.length)}${records.length + 1}`, true, "TablaRegistrosSimulados");
registros.getUsedRange().format.autofitColumns();
for (let i = 0; i < columns.length; i++) {
  const width = i < 3 ? 210 : i < 8 ? 145 : Math.min(240, Math.max(100, String(columns[i]).length * 8));
  registros.getRangeByIndexes(0, i, records.length + 1, 1).format.columnWidthPx = width;
}

const control = workbook.worksheets.add("Control llenado");
control.showGridLines = false;
const controlHeader = ["campo", ...records.map(r => r.nombreRecurso || r.id_unico), "llenos", "vacios"];
const controlRows = columns.map(col => {
  const statuses = records.map(record => {
    const value = record[col];
    const filled = Array.isArray(value) ? value.length > 0 : !(value === undefined || value === null || value === "");
    return filled ? "Lleno" : "Vacío";
  });
  const filledCount = statuses.filter(s => s === "Lleno").length;
  return [col, ...statuses, filledCount, records.length - filledCount];
});
control.getRangeByIndexes(0, 0, controlRows.length + 1, controlHeader.length).values = [controlHeader, ...controlRows];
control.getRangeByIndexes(0, 0, 1, controlHeader.length).format = { fill: "#1D4ED8", font: { bold: true, color: "#FFFFFF" } };
control.getRangeByIndexes(1, 1, controlRows.length, records.length).format = { horizontalAlignment: "center" };
control.freezePanes.freezeRows(1);
control.freezePanes.freezeColumns(1);
control.tables.add(`A1:${columnLetter(controlHeader.length)}${controlRows.length + 1}`, true, "TablaControlLlenado");
control.getUsedRange().format.autofitColumns();

const resumen = workbook.worksheets.add("Resumen");
resumen.showGridLines = false;
resumen.getRange("A1:F1").values = [["Simulación de formulario - 4 atractivos", "", "", "", "", ""]];
resumen.getRange("A1:F1").merge();
resumen.getRange("A1:F1").format = { fill: "#0F766E", font: { bold: true, color: "#FFFFFF", size: 16 } };
resumen.getRange("A3:B10").values = [
  ["Registros simulados", records.length],
  ["Columnas totales esperadas", columns.length],
  ["Campos declarados mediante controles", columns.length - technicalColumns.size],
  ["Claves dinámicas, generadas o técnicas", technicalColumns.size],
  ["Columnas declaradas en Apps Script actual", columns.length - missingInCurrentAppsScript.length],
  ["Columnas faltantes en Apps Script actual", missingInCurrentAppsScript.length],
  ["Registros con fotos", records.filter(r => Number(r.fotos_cantidad || 0) > 0).length],
  ["Celdas vacías en los 4 registros", emptyCells.length]
];
resumen.getRange("A3:A10").format = { fill: "#EEF6F5", font: { bold: true } };
resumen.getRange("A12:F12").values = [["Atractivo", "ID único", "CUT", "Comuna", "Clasificación", "Fotos"]];
resumen.getRange("A12:F12").format = { fill: "#17324D", font: { bold: true, color: "#FFFFFF" } };
resumen.getRangeByIndexes(12, 0, records.length, 6).values = records.map(r => [
  r.nombreRecurso, r.id_unico, r.codigo_unico_territorial, r.comuna, [r.categoria, r.tipoRecurso, r.subtipoRecurso].filter(Boolean).join(" / "), Number(r.fotos_cantidad || 0)
]);
resumen.getUsedRange().format.autofitColumns();

const diccionario = workbook.worksheets.add("Diccionario de campos");
diccionario.showGridLines = false;
const dictionaryRows = columns.map((column, index) => [
  index + 1,
  column,
  technicalColumns.has(column) ? "Dinámico / generado / técnico" : "Declarado en el formulario",
  missingInCurrentAppsScript.includes(column) ? "Falta agregar al HEADERS actual" : "Disponible en HEADERS actual"
]);
diccionario.getRangeByIndexes(0, 0, dictionaryRows.length + 1, 4).values = [
  ["N°", "Nombre exacto del campo", "Origen", "Estado en Apps Script"],
  ...dictionaryRows
];
diccionario.getRange("A1:D1").format = { fill: "#7C2D12", font: { bold: true, color: "#FFFFFF" } };
diccionario.getRange("A2:A137").format.numberFormat = "0";
diccionario.getRange("B2:D137").format.wrapText = true;
diccionario.freezePanes.freezeRows(1);
diccionario.tables.add(`A1:D${dictionaryRows.length + 1}`, true, "TablaDiccionarioCampos");
diccionario.getUsedRange().format.autofitColumns();
diccionario.getRange("B1:B137").format.columnWidthPx = 220;
diccionario.getRange("C1:D137").format.columnWidthPx = 210;

const validacion = workbook.worksheets.add("Validación");
validacion.showGridLines = false;
validacion.getRange("A1:D1").values = [["Comprobación", "Resultado", "Esperado", "Estado"]];
validacion.getRange("A1:D1").format = { fill: "#1D4ED8", font: { bold: true, color: "#FFFFFF" } };
validacion.getRange("A2:D7").values = [
  ["Encabezados únicos", columns.length - duplicateColumns.length, columns.length, duplicateColumns.length ? "Revisar" : "Correcto"],
  ["Columnas totales", columns.length, 136, columns.length === 136 ? "Correcto" : "Revisar"],
  ["Registros de prueba", records.length, 4, records.length === 4 ? "Correcto" : "Revisar"],
  ["Celdas esperadas", columns.length * records.length, 544, columns.length * records.length === 544 ? "Correcto" : "Revisar"],
  ["Celdas con contenido", columns.length * records.length - emptyCells.length, 544, emptyCells.length === 0 ? "Correcto" : "Revisar"],
  ["Campos faltantes en HEADERS de Apps Script", missingInCurrentAppsScript.length, 0, missingInCurrentAppsScript.length === 0 ? "Correcto" : "Requiere actualización"]
];
validacion.getRange("A9:B9").values = [["N°", "Campos que faltan en Apps Script"]];
validacion.getRange("A9:B9").format = { fill: "#B45309", font: { bold: true, color: "#FFFFFF" } };
validacion.getRangeByIndexes(9, 0, missingInCurrentAppsScript.length, 2).values = missingInCurrentAppsScript.map((column, index) => [index + 1, column]);
validacion.getUsedRange().format.autofitColumns();
validacion.getRange("A1:A20").format.columnWidthPx = 300;
validacion.getRange("B1:B20").format.columnWidthPx = 250;
validacion.getRange("C1:D20").format.columnWidthPx = 180;

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan"
});
console.log(errors.ndjson);

const keyRanges = await workbook.inspect({
  kind: "table",
  range: "Resumen!A1:F16",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 8,
  maxChars: 5000
});
console.log(keyRanges.ndjson);

const validationRange = await workbook.inspect({
  kind: "table",
  range: "Validación!A1:D19",
  include: "values,formulas",
  tableMaxRows: 20,
  tableMaxCols: 6,
  maxChars: 5000
});
console.log(validationRange.ndjson);

const previews = [
  ["resumen", await workbook.render({ sheetName: "Resumen", autoCrop: "all", scale: 1, format: "png" })],
  ["registros", await workbook.render({ sheetName: "Registros simulados", range: "A1:M6", scale: 1, format: "png" })],
  ["control", await workbook.render({ sheetName: "Control llenado", range: "A1:G18", scale: 1, format: "png" })],
  ["diccionario", await workbook.render({ sheetName: "Diccionario de campos", range: "A1:D22", scale: 1, format: "png" })],
  ["validacion", await workbook.render({ sheetName: "Validación", autoCrop: "all", scale: 1, format: "png" })]
];
for (const [name, preview] of previews) {
  await fs.writeFile(path.join(outputDir, `preview_${name}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
console.log(outputPath);

function columnLetter(n) {
  let s = "";
  while (n > 0) {
    const m = (n - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    n = Math.floor((n - m) / 26);
  }
  return s;
}
