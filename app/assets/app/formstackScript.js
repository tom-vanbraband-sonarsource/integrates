/* eslint no-magic-numbers: ["error", { "ignore": [-1,0,0.950,1,2,5] }]*/
/* global document, $, alertify, setInterval, timew, Tabletop, v:true, obj:true, $msg */
let remember = null;
$(document).ready(function () {
  remember = function () {
    try {
      alertify.log("<div class=\"\" style=\"padding: 8px;\"><p class=\"text-center\">Recordatorio</p><p class=\"text-left\"> Recuerda personalizar los campos dependiendo de la situación que vas a reportar!</p> </div>");
    }
    catch (err) {
      return false;
    }
  };
  remember();
  const timew = 35000;
  setInterval(function () {
    remember();
  }, timew);
  document.getElementsByTagName("select")[5].onchange = function () {
    const verf = document.getElementsByTagName("select")[5].value;
    if (verf == "Verificación") {
      alertify.success("<p class=\"text-center\"> Información: </p> <p class=\"text-left\"> Verificacion debe usarse para reportar hallazgos en chequeos cruzados </p>");
    }
  };
});

/**
 * Function isUpperCase return input string in uppercase
 */
function isUpperCase (str) {
  return str === str.toUpperCase();
}

String.prototype.capitalizeFirstLetter = function () { /* eslint no-extend-native: ["error", { "exceptions": ["String"] }]*/
  return this.charAt(0).toUpperCase() + this.slice(1);
};

const description = $("#field32202728");
const requirement = $("#field38254586");
const solution = $("#field38619077");
const threat = $("#field38193361");
const risk = $("#field38193362");
const donde = $("#field38193357");
const has_solution = $("#field38861717_1");
const has_no_solution = $("#field38861717_2");
const solution_kb = $("#field38861739");
const tipo = $("#field54319180");
const debilidad = $("#field38899046");
const solution_pdf = $("#field38307753");
const evidencia_hallazgo = $("#field32202896");
const exploit = $("#field38307199");
const evidencia_explotacion = $("#field38307222");
const animacion = $("#field38307272");
const si_evidente = $("#field49132420_1");
const no_evidente = $("#field49132420_2");
const public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/1L37WnF6enoC8Ws8vs9sr0G29qBLwbe-3ztbuopu1nvc/pubhtml";

/**
 * Function showInfo return info about findings
 */
function showInfo (data, tabletop) {
  const obj = $.parseJSON(JSON.stringify(data));
  $("#field32201810").change(function () {
    const title = $("#field32201810").val();
    for (let cont = 0; cont < obj.length; cont++) {
      if (obj[cont].Titulo == title) {
        description.val(obj[cont].Descripcion);
        requirement.val(obj[cont].Requisito);
        solution.val(obj[cont].Recomendacion);
        donde.attr("placeholder", obj[cont].Donde);
        debilidad.val(obj[cont].CWE.split("/")[5].split(".")[0]);
        tipo.val(obj[cont].Tipo);
        if (obj[cont].Evidente == "Sí") {
          si_evidente.attr("checked", true);
        }
        else {
          no_evidente.attr("checked", true);
        }
        if (obj[cont].Solucion_KB != "-") {
          has_solution.attr("checked", true);
          $("#fsCell38861739").removeClass("fsHidden");
          $("#fsCell38307753").removeClass("fsHidden");
          solution_pdf.removeAttr("disabled");
          solution_kb.val(obj[cont].Solucion_KB);
        }
        else if (obj[cont].Solucion_KB == "-") {
          has_no_solution.attr("checked", true);
          $("#fsCell38861739").addClass("fsHidden");
          $("#fsCell38307753").addClass("fsHidden");
          solution_pdf.attr("disabled");
        }

        if ($("#field38392454").val() == "Detallado") {
          threat.val(obj[cont].Amenaza);
          risk.val(obj[cont].Riesgo);
        }

        // If(obj[cont].Exploit == "Sí"){
        if ($("#field38529253").val() == 0.950) {
          exploit.prop("required", true);
          exploit.addClass("fsRequired");
          exploit.attr("aria-required", true);
          exploit.attr("fsRequired");
          evidencia_explotacion.prop("required", true);
          evidencia_explotacion.addClass("fsRequired");
          evidencia_explotacion.attr("aria-required", true);
          evidencia_explotacion.attr("fsRequired");
        }
        else {
          exploit.prop("required", false);
          exploit.removeClass("fsRequired");
          exploit.attr("aria-required", false);
          evidencia_explotacion.prop("required", false);
          evidencia_explotacion.removeClass("fsRequired");
          evidencia_explotacion.attr("aria-required", false);
          animacion.prop("required", false);
          animacion.removeClass("fsRequired");
          animacion.attr("aria-required", false);
        }
        break;
      }
      if (cont == obj.length - 1) {
        description.val("");
        requirement.val("");
        solution.val("");
        threat.val("");
        risk.val("");
        tipo.val("");
        debilidad.val(0);
        donde.attr("placeholder", "Formato DONDE dependiendo de la vulnerabilidad.");
        $("#fsCell38861739").addClass("fsHidden");
        $("#fsCell38307753").addClass("fsHidden");
        $("#field38307753").attr("disabled");
      }
    }
  });
}

Tabletop.init({
  "callback": showInfo,
  "key": public_spreadsheet_url,
  "prettyColumnNames": true,
  "simpleSheet": true
});
$(donde).focusout(function () {
  donde.val($.trim(donde.val()));
});

$(requirement).focusout(function () {
  requirement.val($.trim(requirement.val()));
  if (requirement.val()[requirement.val().length - 1] != ".") {
    requirement.val(`${requirement.val()}.`);
  }
  if (isUpperCase(requirement.val()[0]) == false) {
    requirement.val(requirement.val().capitalizeFirstLetter());
  }
});

$(description).focusout(function () {
  description.val($.trim(description.val()));
  if (description.val()[description.val().length - 1] != ".") {
    description.val(`${description.val()}.`);
  }
  if (isUpperCase(description.val()[0]) == false) {
    description.val(description.val().capitalizeFirstLetter());
  }
  description.val(description.val());
});

$(solution).focusout(function () {
  solution.val($.trim(solution.val()));
  if (solution.val()[solution.val().length - 1] != ".") {
    solution.val(`${solution.val()}.`);
  }
  if (isUpperCase(solution.val()[0]) == false) {
    solution.val(solution.val().capitalizeFirstLetter());
  }
});

$(risk).focusout(function () {
  risk.val($.trim(risk.val()));
  if (risk.val()[risk.val().length - 1] != ".") {
    risk.val(`${risk.val()}.`);
  }
  if (isUpperCase(risk.val()[0]) == false) {
    risk.val(risk.val().capitalizeFirstLetter());
  }
});

$(threat).focusout(function () {
  threat.val($.trim(threat.val()));
  if (threat.val()[threat.val().length - 1] != ".") {
    threat.val(`${threat.val()}.`);
  }
  if (isUpperCase(threat.val()[0]) == false) {
    threat.val(threat.val().capitalizeFirstLetter());
  }
});

$(evidencia_hallazgo).change(function () {
  const hallazgo_upload = $(evidencia_hallazgo).val().
    split("\\")[2].split(".")[0];
  const substring = "evidencia";
  if (hallazgo_upload.indexOf(substring) === -1) {
    $msg.error("El archivo se debe contener la palabra evidencia");
    evidencia_hallazgo.val("");
  }
});

$(exploit).change(function () {
  const exploit_upload = $(exploit).val().
    split("\\")[2].split(".")[0];
  if (exploit_upload != "exploit") {
    $msg.error("El archivo se debe llamar: exploit");
    exploit.val("");
  }
  else if (exploit_upload == "exploit") {
    exploit.attr("aria-invalid", false);
  }
});

$(evidencia_explotacion).change(function () {
  const explotacion_upload = $(evidencia_explotacion).val().
    split("\\")[2].split(".")[0];
  if (explotacion_upload != "evidencia-de-explotacion") {
    $msg.error("El archivo se debe llamar: evidencia-de-explotacion");
    evidencia_explotacion.val("");
  }
  else if (explotacion_upload == "evidencia-de-explotacion") {
    evidencia_explotacion.attr("aria-invalid", false);
  }
});

$(animacion).change(function () {
  const animacion_upload = $(animacion).val().
    split("\\")[2].split(".")[0];
  if (animacion_upload != "animacion-de-explotacion") {
    $msg.error("El archivo se debe llamar: animacion-de-explotacion");
    animacion.val("");
  }
  else if (animacion_upload == "animacion-de-explotacion") {
    animacion.attr("aria-invalid", false);
  }
});

$(solution_pdf).change(function () {
  const sol_upload = $(solution_pdf).val().
    split("\\")[2].split(".")[0];
  if (sol_upload != "solucion") {
    $msg.error("El archivo se debe llamar: solucion");
    solution_pdf.val("");
  }
});
