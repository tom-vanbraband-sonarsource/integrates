/* eslint no-magic-numbers:
["error", { "ignore": [-1,0,1] }]*/
/* eslint no-shadow: ["error", { "allow": ["$scope","$stateParams",
                                          "$state","response"] }]*/
/* global
angular, $msg, Rollbar, userRole, eventsTranslations, keysToTranslate,
Organization
*/
/**
 * @file eventContentCtrl.js
 * @author engineering@fluidattacks.com
 */
/**
 * Controller definition for finding content view.
 * @name eventContentCtrl
 * @param {Object} $scope
 * @param {Object} $uibModal
 * @param {Object} $stateParams
 * @param {Object} $translate
 * @param {Object} ngNotify
 * @return {undefined}
 */
/** @export */
angular.module("FluidIntegrates").controller("eventContentCtrl", function
eventContentCtrl (
  $scope,
  $state,
  $stateParams,
  $timeout,
  $translate,
  $uibModal,
  $window,
  functionsFtry1,
  functionsFtry2,
  functionsFtry3,
  functionsFtry4,
  ngNotify,
  projectFtry,
  projectFtry2
) {
  $scope.goUp = function goUp () {
    angular.element("html, body").animate({"scrollTop": 0}, "fast");
  };

  $scope.hasUrl = function hasUrl (element) {
    if (angular.isDefined(element)) {
      if (element.indexOf("https://") !== -1 ||
          element.indexOf("http://") !== -1) {
        return true;
      }
    }
    return false;
  };
  $scope.isEmpty = function isEmpty (obj) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  };
  $scope.loadEvent = function loadEvent (project, id) {
    const reqEventualities = projectFtry.getEvent(id);
    reqEventualities.then((response) => {
      if (response.errors) {
        const {message} = response.errors[0];
        if (message === "Login required") {
          location.reload();
        }
        else if (message === "Access denied") {
          $msg.error($translate.instant("proj_alerts.access_denied"));
        }
        else {
          Rollbar.error(message);
        }
      }
      else {
        const eventData = response.data.event;
        if (eventData.accessibility === null) {
          $scope.hasAccessibility = false;
        }
        else {
          $scope.hasAccessibility = true;
        }
        if (eventData.affectedComponents === null) {
          $scope.hasAffectedComponents = false;
        }
        else {
          $scope.hasAffectedComponents = true;
        }
        for (let inc = 0; inc < eventsTranslations.length; inc++) {
          if (eventData[eventsTranslations[inc]] in keysToTranslate) {
            eventData[eventsTranslations[inc]] =
                    $translate.instant(keysToTranslate[
                      eventData[eventsTranslations[inc]]
                    ]);
          }
        }
        $scope.eventData = eventData;
        $scope.getEventEvidence(eventData);
        if ($scope.eventData.evidenceUrl.length === 0) {
          $scope.hasEvidence = false;
        }
        else {
          $scope.hasEvidence = true;
        }
      }
    });
  };

  $scope.getEventEvidence = function getEventEvidence (eventData) {
    if (eventData.evidence === "") {
      $scope.eventData.evidenceUrl = [];
    }
    else {
      const splitedUrl = $window.location.href.split("dashboard#!/");
      const evidenceUrl = `${splitedUrl[0] +
                          splitedUrl[1].replace("events/", "")}/${
        eventData.evidence}`;
      $scope.eventData.evidenceUrl =
                         [
                           {
                             "original": evidenceUrl,
                             "thumbnail": evidenceUrl
                           }
                         ];
    }
  };

  $scope.eventEdit = function eventEdit () {
    if ($scope.isEditable === false) {
      $scope.isEditable = true;
    }
    else {
      $scope.isEditable = false;
    }
  };

  $scope.configColorPalette = function configColorPalette () {
    $scope.colors = {};
    // Red
  };
  $scope.goBack = function goBack () {
    $state.go("ProjectEvents", {"project": $stateParams.project.toLowerCase()});
    angular.element("html, body").animate(
      {"scrollTop": $scope.currentScrollPosition},
      "fast"
    );
  };
  };
});
