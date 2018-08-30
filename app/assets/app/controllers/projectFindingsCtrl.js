/* eslint-disable max-lines */
/* eslint no-magic-numbers: ["error", { "ignore":[-1,0,1] }]*/
/* eslint no-shadow: ["error", { "allow":
                                   ["$scope","$stateParams", "projectFtry"] }]*/
/* global
BASE, downLink:true, Morris, estado:true, exploitLabel:true, projectData:true,
nonexploitLabel:true, totalHigLabel:true, $scope:true,exploitable:true, i:true,
totalSegLabel:true, openLabel:true, partialLabel:true, $msg, integrates, j:true,
document, userName, userEmail, Rollbar, aux:true, json:true, eventsData:true, $,
closeLabel:true, mixPanelDashboard, win:true, window, Organization, userRole,
fieldsToTranslate, keysToTranslate, removeHour:true, labelState:true, angular,
$window */
/**
 * @file projectFindingsCtrl.js
 * @author engineering@fluidattacks.com
 */
/**
 * @function removeHour
 * @param {string} value Date of the finging with hour
 * @member integrates.registerCtrl
 * @return {string} Date without hour
 */
/* eslint-disable-next-line  func-name-matching */
removeHour = function removeHourFunction (value) {
  if (value.indexOf(":") !== -1) {
    return value.split(" ")[0];
  }
  return value;
};

/**
 * @function labelState
 * @param {string} value Status of the finding
 * @member integrates.registerCtrl
 * @return {string} Html code for specific label
 */

/**
 * Controller definition for finding tab view.
 * @name ProjectCtrl
 * @param {Object} $scope
 * @param {Object} $uibModal
 * @param {Object} $stateParams
 * @param {Object} $state
 * @param {Object} $timeout
 * @return {undefined}
 */
/** @export */
angular.module("FluidIntegrates").controller(
  "projectFindingsCtrl",
  function projectFindingsCtrl (
    $location,
    $scope,
    $state,
    $stateParams,
    $timeout,
    $translate,
    $uibModal,
    $window,
    functionsFtry1,
    functionsFtry3,
    functionsFtry4,
    projectFtry,
    projectFtry2
  ) {
    $scope.init = function init () {
      const projectName = $stateParams.project;
      const findingId = $stateParams.finding;
      $scope.userRole = userRole;
      functionsFtry4.verifyRoles($scope, projectName, userEmail, userRole);
      // Default flags value for view visualization.
      $scope.view = {};
      $scope.view.project = false;
      $scope.view.finding = false;
      // Route parameters.
      if (angular.isDefined(findingId)) {
        $scope.findingId = findingId;
      }
      if (angular.isDefined(projectName) &&
                projectName !== "") {
        $scope.project = projectName;
        $scope.search();
        const org = Organization.toUpperCase();
        const projt = projectName.toUpperCase();
        mixPanelDashboard.trackReports(
          "ProjectFindings",
          userName,
          userEmail,
          org,
          projt
        );
      }
      // Search function assignation to button and enter key configuration.
      functionsFtry3.configKeyboardView($scope);
      $scope.goUp();
      $scope.finding = {};
    };
    $scope.deleteProject = function deleteProject () {
      functionsFtry4.deleteProject();
    };
    $scope.goUp = function goUp () {
      angular.element("html, body").animate({"scrollTop": 0}, "fast");
    };
    $scope.search = function search () {
      const projectName = $stateParams.project;
      const tableFilter = $scope.filter;
      let hasAccess = true;
      if (angular.isUndefined(projectName) ||
                projectName === "") {
        const attentionAt = $translate.instant("proj_alerts.attentTitle");
        const attentionAc = $translate.instant("proj_alerts.attent_cont");
        $msg.warning(attentionAc, attentionAt);
        return false;
      }
      if ($stateParams.project !== $scope.project) {
        $state.go("ProjectIndicators", {"project": $scope.project});
      }
      else if ($stateParams.project === $scope.project) {
        $scope.view.project = false;
        $scope.view.finding = false;

        // Handling presentation button
        const searchAt = $translate.instant("proj_alerts.search_title");
        const searchAc = $translate.instant("proj_alerts.search_cont");
        $msg.info(searchAc, searchAt);
        if (eventsData.length === 0 || (eventsData.length > 0 &&
                   eventsData[0].fluidProject.toLowerCase() !==
                   $scope.project.toLowerCase())) {
          const reqEventualities = projectFtry.eventualityByName(
            projectName,
            "Name"
          );
          reqEventualities.then((response) => {
            if (!response.error) {
              if (angular.isUndefined(response.data)) {
                location.reload();
              }
              eventsData = response.data;
            }
            else if (response.message === "Access to project denied") {
              hasAccess = false;
            }
          });
        }
        if (projectData.length > 0 &&
            projectData[0].fluidProject.toLowerCase() ===
            $scope.project.toLowerCase()) {
          $scope.view.project = true;
          $scope.loadFindingContent(projectData);
        }
        else {
          const reqProject = projectFtry.projectByName(
            projectName,
            tableFilter
          );
          reqProject.then((response) => {
            $scope.view.project = true;
            if (!response.error) {
              if (angular.isUndefined(response.data)) {
                location.reload();
              }
              else {
                // Mixpanel tracking
                mixPanelDashboard.trackSearch(
                  "SearchFinding",
                  userEmail,
                  projectName
                );
                if (response.data.length === 0 && eventsData.length === 0) {
                  if ($scope.isManager) {
                    const reqDrafts = projectFtry2.draftsByName(
                      projectName,
                      tableFilter
                    );
                    reqDrafts.then((resp) => {
                      $scope.view.project = true;
                      if (!resp.error && resp.data.length > 0) {
                        $state.go(
                          "ProjectDrafts",
                          {"project": projectName.toLowerCase()}
                        );
                      }
                      else {
                        Rollbar.error("Error: An error occurred getting " +
                                      "drafts");
                      }
                    });
                  }
                  else {
                    $scope.view.project = false;
                    $scope.view.finding = false;
                    $msg.error($translate.instant("proj_alerts.not_found"));
                  }
                }
                else {
                  projectData = response.data;
                  $scope.loadFindingContent(projectData);
                }
              }
            }
            else if (response.error) {
              $scope.view.project = false;
              $scope.view.finding = false;
              if (response.message === "Access denied" || !hasAccess) {
                $msg.error($translate.instant("proj_alerts.access_denied"));
              }
              else if (response.message === "Project masked") {
                $msg.error($translate.instant("proj_alerts.project_deleted"));
              }
              else {
                $msg.error($translate.instant("proj_alerts.error_text"));
              }
            }
          });
        }
      }
      return true;
    };
    $scope.goToFinding = function goToFinding (rowInfo) {
      // Mixpanel tracking
      mixPanelDashboard.trackFinding("ReadFinding", userEmail, rowInfo.id);
      $scope.currentScrollPosition = angular.element(document).scrollTop();
      $state.go("FindingDescription", {
        "id": rowInfo.id,
        "project": rowInfo.fluidProject.toLowerCase()
      });
    };
    $scope.loadFindingContent = function loadFindingContent (datatest) {
      const org = Organization.toUpperCase();
      const projt = $stateParams.project.toUpperCase();
      functionsFtry1.alertHeader(org, projt);
      for (let cont = 0; cont < datatest.length; cont++) {
        for (let inc = 0; inc < fieldsToTranslate.length; inc++) {
          if (datatest[cont][fieldsToTranslate[inc]] in keysToTranslate) {
            datatest[cont][fieldsToTranslate[inc]] =
                  $translate.instant(keysToTranslate[
                    datatest[cont][fieldsToTranslate[inc]]
                  ]);
          }
        }
      }
      // Findings table configuration
      $scope.tblFindingsHeaders = [
        {
          "align": "center",
          "dataField": "edad",
          "header": $translate.instant("search_findings.headings.age"),
          "width": "4.8%"
        },
        {
          "align": "center",
          "dataField": "lastVulnerability",
          "header":
            $translate.instant("search_findings.headings.lastVulnerability"),
          "width": "4.8%"
        },
        {
          "align": "center",
          "dataField": "clientFindingType",
          "header": $translate.instant("search_findings.headings.type"),
          "width": "6.5%"
        },
        {
          "align": "left",
          "dataField": "finding",
          "header": $translate.instant("search_findings.headings.finding"),
          "width": "6%",
          "wrapped": true
        },
        {
          "align": "left",
          "dataField": "vulnerability",
          "header":
            $translate.instant("search_findings.headings.vulnerability"),
          "width": "13%",
          "wrapped": true
        },
        {
          "align": "center",
          "dataField": "criticity",
          "header": $translate.instant("search_findings.headings.criticity"),
          "width": "5.5%"
        },
        {
          "align": "center",
          "dataField": "openVulnerabilities",
          "header": $translate.instant("search_findings.headings.cardinality"),
          "width": "5%"
        },
        {
          "align": "center",
          "dataField": "estado",
          "header": $translate.instant("search_findings.headings.state"),
          "isStatus": true,
          "width": "10.5%"
        },
        {
          "align": "center",
          "dataField": "treatment",
          "header": $translate.instant("search_findings.headings.treatment"),
          "width": "6%"
        },
        {
          "align": "center",
          "dataField": "exploitable",
          "header": $translate.instant("search_findings.headings.exploit"),
          "width": "6%"
        }
      ];
      $scope.findingsDataset = datatest;
      angular.element("#search_section").show();
      angular.element("[data-toggle=\"tooltip\"]").tooltip();

      if (angular.isDefined($stateParams.finding)) {
        $scope.finding.id = $stateParams.finding;
        $scope.view.project = false;
        $scope.view.finding = false;
      }
      if (!$scope.isManager) {
        $scope.openEvents = projectFtry.alertEvents(eventsData);
        $scope.atAlert = $translate.instant("main_content.eventualities." +
                                            "descSingularAlert1");
        if ($scope.openEvents === 1) {
          $scope.descAlert1 = $translate.instant("main_content.eventualities." +
                                                  "descSingularAlert2");
          $scope.descAlert2 = $translate.instant("main_content.eventualities." +
                                                  "descSingularAlert3");
          angular.element("#events_alert").show();
        }
        else if ($scope.openEvents > 1) {
          $scope.descAlert1 = $translate.instant("main_content.eventualities." +
                                                  "descPluralAlert1");
          $scope.descAlert2 = $translate.instant("main_content.eventualities." +
                                                  "descPluralAlert2");
          angular.element("#events_alert").show();
        }
      }
    };
    $scope.openModalAvance = function openModalAvance () {
      $uibModal.open({
        "animation": true,
        "backdrop": "static",
        "controller" ($scope, $uibModalInstance) {
          const auxiliar =
                  angular.element("#vulnerabilities").bootstrapTable("getData");
          const data = auxiliar;
          for (let cont = 0; cont < data.length; cont++) {
            data[cont].atributos = 0;
            data[cont].link = `${$window.location.href.split("project/")[0]}` +
                          `project/${data[cont].fluidProject.toLowerCase()}` +
                          `/${data[cont].id}/description`;
            if (angular.isDefined(data[cont].records) &&
                data[cont].records !== "") {
              data[cont].atributos = 1 + (data[cont].records.match(/\n/g) ||
                                     []).length;
            }
          }
          for (let cont = 0; cont < data.length - 1; cont++) {
            for (let incj = cont + 1; incj < data.length; incj++) {
              if (parseFloat(data[cont].criticity) <
                  parseFloat(data[incj].criticity)) {
                const aux = data[cont];
                data[cont] = data[incj];
                data[incj] = aux;
              }
            }
          }
          $scope.rows = data;
          let severity = 0;
          angular.forEach(data, (cont) => {
            try {
              if (cont.finding_type === "Seguridad") {
                const BaseScore = projectFtry.calCCssv2(cont)[0];
                severity += BaseScore * parseFloat(cont.cardinalidad_total);
              }
            }
            catch (err) {
              Rollbar.error("Error: An error ocurred calculating " +
                            "cardinality", err);
            }
          });
          $scope.totalSeverity = severity.toFixed(0);
          $scope.closeModalAvance = function closeModalAvance () {
            const TIMEOUT = 100;
            $uibModalInstance.close();
            $timeout(() => {
              angular.element("#vulnerabilities").bootstrapTable(
                "load",
                auxiliar
              );
            }, TIMEOUT);
          };
        },
        "keyboard": false,
        "resolve": {"ok": true},
        "templateUrl": "avance.html",
        "windowClass": "modal avance-modal"
      });
    };
    $scope.urlIndicators = function urlIndicators () {
      $state.go("ProjectIndicators", {"project": $scope.project});
    };
    $scope.urlFindings = function urlFindings () {
      $state.go("ProjectFindings", {"project": $scope.project});
    };
    $scope.urlEvents = function urlEvents () {
      $state.go("ProjectEvents", {"project": $scope.project});
    };
    $scope.urlUsers = function urlUsers () {
      $state.go("ProjectUsers", {"project": $scope.project});
    };
    $scope.urlDrafts = function urlDrafts () {
      $state.go("ProjectDrafts", {"project": $scope.project});
    };
    $scope.urlResources = function urlResources () {
      $state.go("ProjectResources", {"project": $scope.project});
    };
    $scope.init();
  }
);
