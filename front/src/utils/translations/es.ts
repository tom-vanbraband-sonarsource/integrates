const esTranslations: dict = {
  confirmmodal: {
    cancel: "Cancelar",
    message: "¿Está seguro?",
    proceed: "Proceder",
    title_cvssv2: "Actualizar CVSSv2",
    title_generic: "Confirmar acción",
  },
  legalNotice: {
    acceptBtn: {
      text: "Aceptar y continuar",
      tooltip: "Haz click si entiendes y aceptas los términos anteriores",
    },
    description: "Integrates, Copyright (c) 2019 Fluid Attacks. Esta plataforma \
    contiene información de propiedad de Fluid Attacks. Dicha información \
    puede ser usada por el cliente sólo con el propósito de documentación sin \
    poder divulgar su contenido a terceras partes ya que contiene ideas, \
    conceptos, precios y/o estructuras de propiedad de Fluid Attacks. \
    La clasificación 'propietaria' significa que esta información es solo para \
    uso de las personas a quienes está dirigida. En caso de requerirse copias \
    totales o parciales se debe contar con la autorización expresa y escrita de \
    Fluid Attacks. Las normas que fundamentan la clasificación de la \
    información son los artículos 72 y siguientes de la decisión del acuerdo de \
    Cartagena, 344 de 1.993, el artículo 238 del código penal y los artículos \
    16 y siguientes de la ley 256 de 1.996.",
    rememberCbo: {
      text: "Recordar mi decisión",
      tooltip: "Marca la casilla si prefieres que esta decisión sea permanente",
    },
    title: "Aviso legal",
  },
  logout: "Cerrar sesión",
  navbar: {
    breadcrumbRoot: "Mis Proyectos",
    searchPlaceholder: "Nombre del proyecto",
  },
  proj_alerts: {
    access_denied: "Acceso denegado o proyecto no encontrado",
    error_textsad: "Hay un error :(",
    file_size: "El archivo debe tener un tamaño menor a 10mb",
    file_size_png: "La imagen debe tener un tamaño menor a 2mb",
    file_size_py: "El archivo debe tener un tamaño menor a 1mb",
    file_type_csv: "El archivo debe ser de tipo .csv",
    file_type_gif: "La imagen debe ser de tipo .gif",
    file_type_png: "La imagen debe ser de tipo .png",
    file_type_py: "El archivo debe ser de tipo .py",
    file_type_wrong: "El archivo tiene un formato desconocido o no permitido",
    file_type_yaml: "El archivo debe ser de tipo .yaml o .yml",
    file_updated: "Archivo Actualizado ;)",
    invalid_schema: "El archivo no cumple con el esquema",
    invalid_treatment_mgr: "Por favor seleccione un responsable del tratamiento",
    no_file_selected: "No se ha seleccionado ningún archivo",
    no_file_update: "Falló al actualizar el archivo",
    range_error: "Los límites del rango son incorrectos",
    title_success: "Felicitaciones",
    updated: "Actualizado",
    updated_title: "Correcto!",
    verified_success: "El hallazgo fue marcado como remediado.",
  },
  project: {
    tabs: {
      comments: "Comentarios",
      drafts: "Borradores",
      events: "Eventualidades",
      findings: "Hallazgos",
      indicators: "Indicadores",
      resources: "Insumos",
      users: "Usuarios",
    },
  },
  registration: {
    continue_btn: "Continuar como",
    greeting: "¡Hola",
    logged_in_message: "Por favor ciérrala antes de intentar acceder con otra cuenta.",
    logged_in_title: "Ya has iniciado sesión",
    unauthorized: "Aún no tienes autorización para ingresar. Por favor contacta al personal de Fluid Attacks o a tu " +
      "administrador de proyecto para obtener acceso.",
  },
  search_findings: {
    alert: {
      attention: "Atención",
    },
    critical_severity: "Crítica",
    delete: {
      justif: {
        duplicated: "Está Duplicado",
        evidence_change: "Cambio de Evidencia",
        finding_change: "Por Modificación del Hallazgo",
        label: "Justificación",
        not_vuln: "No es una Vulnerabilidad",
      },
      title: "Eliminar Hallazgo",
    },
    draft_approved: "Este hallazgo ha sido aprobado",
    environment_table: {
      environment: "Ambiente",
    },
    files_table: {
      description: "Descripción",
      file: "Archivo",
      upload_date: "Fecha",
    },
    finding_deleted: "El hallazgo {{findingId}} ha sido eliminado",
    high_severity: "Alta",
    low_severity: "Tolerable",
    medium_severity: "Moderada",
    openVulnsLabel: "Vulnerabilidades abiertas",
    reject: "Rechazar Draft",
    reportDateLabel: "Fecha de reporte",
    repositories_table: {
      branch: "Rama",
      repository: "URL Repositorio",
    },
    severityLabel: "Severidad",
    status: {
      closed: "Cerrado",
      open: "Abierto",
    },
    statusLabel: "Estado",
    tab_comments: {
      tab_title: "Comentarios",
    },
    tab_description: {
      action: "Acción",
      actor: {
        any_customer: "Cualquier cliente de la organización",
        any_employee: "Cualquier empleado de la organización",
        any_internet: "Cualquier persona en Internet",
        any_station: "Cualquier persona con acceso a la estación",
        one_employee: "Solo un empleado",
        some_customer: "Solo algunos clientes de la organización",
        some_employee: "Solo algunos empleados",
        title: "Actor",
      },
      affected_systems: "Sistemas comprometidos",
      ambit: {
        applications: "Aplicaciones",
        databases: "Bases de datos",
        infra: "Infraestructura",
        sourcecode: "Código fuente",
        title: "Ámbito",
      },
      attack_vectors: "Vectores de ataque",
      bts: "BTS Externo",
      category: {
        define_auth_model: "Definir el modelo de autorización considerando el principio de mínimo privilegio",
        event: "Eventualidad",
        expose_tech_info: "Evitar exponer la información técnica de la aplicación, servidores y plataformas",
        http_req_integrity: "Validar la integridad de las transacciones en peticiones HTTP",
        log_events: "Registrar eventos para trazabilidad y auditoría",
        maintainability: "Mantenibilidad",
        performance: "Desempeño",
        secure_protocols: "Utilizar protocolos de comunicación seguros",
        sensible_data_code: "Excluir datos sensibles del código fuente y del registro de eventos",
        strengthen_auth_session: "Fortalecer controles en autenticación y manejo de sesión",
        strengthen_file_processing: "Fortalecer controles en el procesamiento de archivos",
        strengthen_password_keys: "Fortalecer la protección de datos almacenados relacionados con contraseñas o llaves \
                                   criptográficas",
        title: "Categoría",
        update_sec_baselines: "Actualizar y configurar las líneas base de seguridad de los componentes",
        validate_input: "Implementar controles para validar datos de entrada",
      },
      compromised_attrs: "Atributos comprometidos",
      compromised_records: "Registros comprometidos",
      customer_project_code: "Código en el cliente",
      customer_project_name: "Nombre en el cliente",
      description: "Descripción",
      download_vulnerabilities: "Descargar Vulnerabilidades",
      editable: "Editar",
      errorFileVuln: "El archivo de vulnerabilidades tiene errores",
      field: "Campo",
      inputs: "Entradas",
      kb: "URL solución",
      line: "Línea",
      line_plural: "Líneas",
      mark_verified: "Verificar",
      path: "Ruta",
      port: "Puerto",
      port_plural: "Puertos",
      probability: {
        25: "25% Difícil de vulnerar",
        50: "50% Posible de vulnerar",
        75: "75% Fácil de vulnerar",
        100: "100% Vulnerado Anteriormente",
        title: "Probabilidad",
      },
      recommendation: "Recomendación",
      remediation_modal: {
        justification: "¿Cuál fue la solución aplicada?",
        title: "Hallazgo remediado",
      },
      reportLevel: {
        detailed: "Detallado",
        general: "General",
        title: "Nivel de reporte",
      },
      request_verify: "Solicitar verificación",
      requirements: "Requisitos",
      risk: "Riesgo",
      risk_level: "Nivel del riesgo",
      scenario: {
        anon_inter: "Anónimo desde Internet",
        anon_intra: "Anónimo desde Intranet",
        auth_extra: "Usuario de Extranet autorizado",
        auth_inter: "Usuario de Internet autorizado",
        auth_intra: "Usuario de Intranet autorizado",
        title: "Escenario",
        unauth_extra: "Usuario de Extranet no autorizado",
        unauth_inter: "Usuario de Internet no autorizado",
        unauth_intra: "Usuario de Intranet no autorizado",
      },
      severity: "Severidad",
      tab_title: "Descripción",
      threat: "Amenaza",
      title: "Título",
      treatment: {
        accepted: "Asumido",
        in_progress: "En progreso",
        new: "Nuevo",
        title: "Tratamiento",
      },
      treatment_just: "Justificación del tratamiento",
      treatment_mgr: "Responsable del tratamiento",
      type: {
        hygiene: "Higiene",
        security: "Seguridad",
        title: "Tipo de hallazgo",
      },
      update: "Actualizar",
      update_vulnerabilities: "Actualizar Vulnerabilidades",
      vulnDeleted: "La vulnerabilidad fue borrada de este hallazgo",
      weakness: "Debilidad",
      where: "Dónde",
    },
    tab_events: {
      affectation: "Afectación",
      affected_components: "Insumos afectados",
      analyst: "Analista",
      client: "Cliente",
      client_project: "Proyecto Cliente",
      date: "Fecha",
      description: "Descripción",
      edit: "Editar",
      event_in: "Eventualidad presente en",
      evidence: "Evidencia",
      fluid_project: "Proyecto Fluid Attacks",
      id: "ID",
      resume: "Resumen",
      status: "Estado",
      status_values: {
        solve: "Tratada",
        unknown: "-",
        unsolve: "Pendiente",
      },
      table_advice: "Haz click para ver el detalle",
      type: "Tipo",
      type_values: {
        approv_change: "Cliente aprueba cambio de alcance",
        auth_attack: "Autorización para ataque especial",
        cancel_proj: "Cliente cancela el proyecto/hito",
        det_attack: "Cliente detecta ataque",
        explic_suspend: "Cliente suspende explicitamente",
        high_approval: "Aprobación de alta disponibilidad",
        inacc_ambient: "Ambiente no accesible",
        incor_supplies: "Insumos incorrectos o faltantes",
        other: "Otro",
        toe_differs: "Alcance difiere a lo aprobado",
        unknown: "-",
        uns_ambient: "Ambiente inestable",
      },
    },
    tab_evidence: {
      animation_exploit: "Animación de explotación",
      detail: "Detalle",
      editable: "Editar",
      evidence_exploit: "Evidencia de explotación",
      tab_title: "Evidencia",
      update: "Actualizar",
    },
    tab_exploit : {
      tab_title: "Exploit",
    },
    tab_indicators: {
      closed: "Cerrado",
      closed_percentage: "Vulnerabilidades cerradas",
      days: "días",
      last_closing_vuln: "Días desde la última vulnerabilidad cerrada",
      max_open_severity: "Máxima severidad abierta",
      max_severity: "Máxima severidad encontrada",
      mean_remediate: "Tiempo promedio para remediar",
      open: "Abierto",
      pending_closing_check: "Vulnerabilidades pendientes por verificar",
      status_graph: "Estado",
      tags: {
        modal_title: "Agregar información de los tags",
      },
      total_findings: "Hallazgos totales",
      total_vulnerabilitites: "Vulnerabilidades totales",
      treatment_accepted: "Asumido",
      treatment_graph: "Tratamiento",
      treatment_in_progress: "En progreso",
      treatment_no_defined: "No definido",
      undefined_treatment: "Vulnerabilidades abiertas sin tratamiento definido",
    },
    tab_observations: {
      tab_title: "Observaciones",
    },
    tab_records: {
      tab_title: "Registros",
    },
    tab_resources: {
      add_repository: "Agregar",
      branch: "Rama",
      description: "Descripción",
      download: "Descargar",
      environment: "Ambiente",
      environments_title: "Ambientes",
      files_title: "Archivos",
      invalid_chars: "El nombre del archivo contiene caracteres inválidos.",
      modal_env_title: "Agregar información de los ambientes",
      modal_file_title: "Agregar archivo",
      modal_options_content: "Qué desea hacer con el archivo ",
      modal_options_title: "Opciones del archivo",
      modal_repo_title: "Agregar información de los repositorios",
      no_selection: "Debe seleccionar un ítem de la tabla.",
      remove_repository: "Remover",
      repeated_item: "Uno o varios ítems a añadir ya existen.",
      repositories_title: "Repositorios",
      repository: "URL Repositorio",
      success: "Ítem agregado exitosamente.",
      success_remove: "Ítem eliminado exitosamente.",
      total_envs: "Total ambientes: ",
      total_files: "Total archivos: ",
      total_repos: "Total repositorios: ",
    },
    tab_severity: {
      attack_complexity: "Complejidad de ataque",
      attack_complexity_options: {
        high: "Alta",
        low: "Baja",
      },
      attack_vector: "Vector de ataque",
      attack_vector_options: {
        adjacent: "Red adyacente",
        local: "Local",
        network: "Red",
        physical: "Físico",
      },
      authentication: "Autenticación",
      authentication_options: {
        multiple_auth: "Múltiple: Múltiples puntos de autenticación",
        no_auth: "Ninguna: No se requiere autenticación",
        single_auth: "Única: Único punto de autenticación",
      },
      availability: "Impacto Disponibilidad",
      availability_impact: "Impacto a la disponibilidad",
      availability_impact_options: {
        high: "Alto",
        low: "Bajo",
        none: "Ninguno",
      },
      availability_options: {
        complete: "Completo: Hay una caída total del objetivo",
        none: "Ninguno: No se presenta ningún impacto",
        partial: "Parcial: Se presenta intermitencia en el acceso al objetivo",
      },
      availability_requirement: "Requisito de disponibilidad",
      availability_requirement_options: {
        high: "Alto",
        low: "Bajo",
        medium: "Medio",
      },
      complexity: "Complejidad Acceso",
      complexity_options: {
        high_complex: "Alto: Se requieren condiciones especiales como acceso administrativo",
        low_complex: "Bajo: No se requiere ninguna condición especial",
        medium_complex: "Medio: Se requieren algunas condiciones como acceso al sistema",
      },
      confidence: "Nivel Confianza",
      confidence_options: {
        confirmed: "Confirmado: La vulnerabilidad es reconocida por el fabricante",
        not_confirm: "No confirmado: Existen pocas fuentes que reconocen la vulnerabilidad",
        not_corrob: "No corroborado: La vulnerabilidad es reconocida por fuentes no oficiales",
      },
      confidentiality: "Impacto Confidencialidad",
      confidentiality_impact: "Impacto a la confidencialidad",
      confidentiality_impact_options: {
        high: "Alto",
        low: "Bajo",
        none: "Ninguno",
      },
      confidentiality_options: {
        complete: "Completo: Se controla toda la información relacionada con el objetivo",
        none: "Ninguno: No se presenta ningún impacto",
        partial: "Parcial: Se obtiene acceso a la información pero no control sobre ella",
      },
      confidentiality_requirement: "Requisito de confidencialidad",
      confidentiality_requirement_options: {
        high: "Alto",
        low: "Bajo",
        medium: "Medio",
      },
      cvss_version: "Versión CVSS",
      editable: "Editar",
      exploitability: "Explotabilidad",
      exploitability_options: {
        conceptual: "Conceptual: Existen pruebas de laboratorio",
        functional: "Funcional: Existe exploit",
        high: "Alta: No se requiere exploit o se puede automatizar",
        improbable: "Improbable: No existe un exploit",
        proof_of_concept: "Prueba de Concepto",
        unproven: "No probada",
      },
      integrity: "Impacto Integridad",
      integrity_impact: "Impacto a la integridad",
      integrity_impact_options: {
        high: "Alto",
        low: "Bajo",
        none: "Ninguno",
      },
      integrity_options: {
        complete: "Completo: Es posible modificar toda la información del objetivo",
        none: "Ninguno: No se presenta ningún impacto",
        partial: "Parcial: Es posible modificar cierta información del objetivo",
      },
      integrity_requirement: "Requisito de integridad",
      integrity_requirement_options: {
        high: "Alto",
        low: "Bajo",
        medium: "Medio",
      },
      modified_attack_complexity: "Complejidad de ataque modificada",
      modified_attack_vector: "Vector de ataque modificado",
      modified_availability_impact: "Impacto a la disponibilidad modificada",
      modified_confidentiality_impact: "Impacto a la confidencialidad modificada",
      modified_integrity_impact: "Impacto a la integridad modificada",
      modified_privileges_required: "Privilegios requeridos modificados",
      modified_severity_scope: "Ambiente modificado",
      modified_user_interaction: "Interacción del usuario modificada",
      privileges_required: "Privilegios requeridos",
      privileges_required_options: {
        high: "Alto",
        low: "Bajo",
        none: "Ninguno",
      },
      remediation_level: "Nivel de resolución",
      remediation_level_options: {
        official_fix: "Oficial",
        temporary_fix: "Temporal",
        unavailable: "Inexistente",
        workaround: "Paliativa",
      },
      report_confidence: "Nivel de confianza",
      report_confidence_options: {
        confirmed: "Confirmado",
        reasonable: "Razonable",
        unknown: "Desconocido",
      },
      resolution: "Nivel Resolución",
      resolution_options: {
        non_existent: "Inexistente: No existe solución",
        official: "Oficial: Existe un parche disponible por el fabricante",
        palliative: "Paliativa: Existe un parche que no fue publicado por el fabricante",
        temporal: "Temporal: Existen soluciones temporales",
      },
      severity_scope: "Alcance",
      severity_scope_options: {
        changed: "Cambió",
        unchanged: "No Cambió",
      },
      tab_title: "Severidad",
      update: "Actualizar",
      user_interaction: "Interacción del usuario",
      user_interaction_options: {
        none: "Ninguna",
        required: "Requerida",
      },
      vector: "Vector de Acceso",
      vector_options: {
        adjacent: "Red adyacente: Explotable desde el mismo segmento de red",
        local: "Local: Explotable con acceso local al objetivo",
        network: "Red: Explotable desde Internet",
      },
    },
    tab_tracking: {
      closed: "Cerradas",
      cycle: "Ciclo",
      effectiveness: "Efectividad",
      founded: "Encontrado",
      open: "Abiertas",
      tab_title: "Seguimiento",
    },
    tab_users: {
      add_button: "Agregar",
      admin: "Admin",
      analyst: "Analista",
      customer: "Usuario",
      customer_admin: "Manager",
      days_ago: "{{count}} día atrás",
      days_ago_plural: "{{count}} días atrás",
      edit: "Editar",
      edit_user_title: "Editar información del usuario",
      email: "alguien@dominio.com",
      hours_ago: "{{count}} hora atrás",
      hours_ago_plural: "{{count}} horas atrás",
      minutes_ago: "{{count}} minuto atrás",
      minutes_ago_plural: "{{count}} minutos atrás",
      months_ago: "{{count}} mes atrás",
      months_ago_plural: "{{count}} meses atrás",
      no_selection: "Debe seleccionar un correo de la tabla.",
      phone_number: "Número Telefónico",
      remove_user: "Remover",
      responsibility_placeholder: "Product Owner, Gerente del " +
                                    "proyecto, Tester, ...",
      role: "Rol",
      success: " fue agregado a este proyecto exitosamente.",
      success_admin: "Información de usuario actualizada.",
      success_delete: " fue removido del proyecto.",
      textbox: "Ingresa el correo de la persona que deseas agregar, este " +
                  "debe ser un correo de Office 365 o Google.",
      title: "Agregar usuario a este proyecto",
      title_success: "Felicitaciones",
      user_organization: "Organización",
      user_responsibility: "Responsabilidad",
    },
    users_table: {
      firstlogin: "Primer ingreso",
      lastlogin: "Último ingreso",
      phoneNumber: "Número Telefónico",
      userOrganization: "Organización",
      userResponsibility: "Responsabilidad",
      userRole: "Rol",
      usermail: "Email",
    },
  },
  sidebar: {
    forms: "Formularios",
  },
  validations: {
    between: "Este valor debe estar entre {{min}} y {{max}}",
    email: "El formato de email no es válido",
    minLength: "Este campo requiere por lo menos {{count}} caracteres",
    numeric: "Este campo sólo puede contener números",
    required: "Este campo es obligatorio",
    tags: "Este campo sólo puede contener caracteres alfanuméricos y guiones medios",
  },
};

export = esTranslations;
