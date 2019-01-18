/* eslint-disable max-len */
/*
 * This file does not allow exports or globals.
 */
/* eslint-disable no-unused-vars */
const fieldsToTranslate = [
  "actor",
  "authentication",
  "category",
  "accessComplexity",
  "scenario",
  "estado",
  "exploitability",
  "exploitable",
  "confidentialityImpact",
  "availabilityImpact",
  "integrityImpact",
  "confidenceLevel",
  "resolutionLevel",
  "probability",
  "clientFindingType",
  "testType",
  "accessVector",
  "treatment",
  "releaseStatus"
];
const eventsTranslations = [
  "eventType",
  "eventStatus"
];
const keysToTranslate = {
  "100% Vulnerado Anteriormente": "finding_formstack.probability.prev_vuln",
  "25% Difícil de vulnerar": "finding_formstack.probability.diffic_vuln",
  "50% Posible de vulnerar": "finding_formstack.probability.possible_vuln",
  "75% Fácil de vulnerar": "finding_formstack.probability.easy_vuln",
  "Abierto": "finding_formstack.status.open",
  "Actualizar y configurar las líneas base de seguridad de los componentes": "finding_formstack.category.update_base",
  "Alcance difiere a lo aprobado": "eventFormstack.type.toe_differs",
  "Ambiente inestable": "eventFormstack.type.uns_ambient",
  "Ambiente no accesible": "eventFormstack.type.inacc_ambient",
  "Análisis": "finding_formstack.test_method.analysis",
  "Anónimo desde Internet": "finding_formstack.scenario.anon_inter",
  "Anónimo desde Intranet": "finding_formstack.scenario.anon_intra",
  "Aplicación": "finding_formstack.test_method.app",
  "Aprobación de alta disponibilidad": "eventFormstack.type.high_approval",
  "Asumido": "finding_formstack.treatment_header.asummed",
  "Autorización para ataque especial": "eventFormstack.type.auth_attack",
  "Binario": "finding_formstack.test_method.binary",
  "Cerrado": "finding_formstack.status.close",
  "Cliente aprueba cambio de alcance": "eventFormstack.type.approv_change",
  "Cliente cancela el proyecto/hito": "eventFormstack.type.cancel_proj",
  "Cliente detecta ataque": "eventFormstack.type.det_attack",
  "Cliente suspende explicitamente": "eventFormstack.type.explic_suspend",
  "Cualquier cliente de la organización": "finding_formstack.actor.any_costumer",
  "Cualquier empleado de la organización": "finding_formstack.actor.any_employee",
  "Cualquier persona con acceso a la estación": "finding_formstack.actor.any_access",
  "Código": "finding_formstack.test_method.code",
  "Definir el modelo de autorización considerando el principio de mínimo privilegio": "finding_formstack.category.define_model",
  "Desempeño": "finding_formstack.category.performance",
  "Escaneo de Infraestructura": "finding_formstack.scenario.infra_scan",
  "Eventualidad": "finding_formstack.category.event",
  "Evitar exponer la información técnica de la aplicación, servidores y plataformas": "finding_formstack.category.avoid_technical",
  "Excluir datos sensibles del código fuente y del registro de eventos": "finding_formstack.category.exclude_finding",
  "Fortalecer controles en autenticación y manejo de sesión": "finding_formstack.category.strengt_authen",
  "Fortalecer controles en el procesamiento de archivos": "finding_formstack.category.strengt_process",
  "Fortalecer la protección de datos almacenados relacionados con contraseñas o llaves criptográficas": "finding_formstack.category.strengt_protect",
  "Higiene": "finding_formstack.findingType.hygiene",
  "Implementar controles para validar datos de entrada": "finding_formstack.category.validate_input",
  "Infraestructura": "finding_formstack.test_method.infras",
  "Insumos incorrectos o faltantes": "eventFormstack.type.incor_supplies",
  "Mantenibilidad": "finding_formstack.category.maintain",
  "No": "finding_formstack.exploitable.no",
  "Nuevo": "finding_formstack.treatment_header.working",
  "Otro": "eventFormstack.type.other",
  "Parcialmente cerrado": "finding_formstack.status.part_close",
  "Pendiente": "eventFormstack.status.unsolve",
  "Registrar eventos para trazabilidad y auditoría": "finding_formstack.category.record_event",
  "Remediar": "finding_formstack.treatment_header.remediated",
  "Si": "finding_formstack.exploitable.yes",
  "Solo algunos clientes de la organización": "finding_formstack.actor.some_costumer",
  "Solo algunos empleados": "finding_formstack.actor.some_employee",
  "Solo un empleado": "finding_formstack.actor.one_employee",
  "Tratada": "eventFormstack.status.solve",
  "Usuario de Extranet no autorizado": "finding_formstack.scenario.unauth_extra",
  "Usuario de Internet autorizado": "finding_formstack.scenario.auth_inter",
  "Usuario de Internet no autorizado": "finding_formstack.scenario.unauth_inter",
  "Usuario de Intranet autorizado": "finding_formstack.scenario.auth_intra",
  "Usuario de Intranet no autorizado": "finding_formstack.scenario.unauth_intra",
  "Utilizar protocolos de comunicación seguros": "finding_formstack.category.secure_protoc",
  "Validar la integridad de las transacciones en peticiones HTTP": "finding_formstack.category.validate_http",
  "Vulnerabilidad": "finding_formstack.findingType.vuln",
  "​Cualquier persona en Internet": "finding_formstack.actor.any_internet"
};
