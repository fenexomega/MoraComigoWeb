(function () {

    'use strict';

  /**
  * The above global variables are visibale to each component (controllers, services...)
  * adds it self to them. E.g: controllers.controller('ExController', ExControllerDef)
  */
  var constants = angular.module("starter.constants", []);
  var controllers = angular.module("starter.controllers", []);
  var directives = angular.module("starter.directives", []);
  var factories = angular.module("starter.factories", []);
  var services = angular.module("starter.services", []);
  
  require('./controllers/app-controller');

  //require controllers, services etc.

  var app = angular.module("starter", [
    /**
    * Libraries modules dependencies
    */
    "ui.router","ui.materialize","ngMap",

    /**
    * Our modules  dependencies
    */
    "starter.constants", "starter.controllers", "starter.directives", "starter.factories", "starter.services"
  ])

  /**
  * Main function
  */
  .run(["$rootScope", "$state", function ($rootScope, Access, $state) {


    }])
  /**
  * States configuration
  */
  .config(["$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {

    /**
    * The above code shows how to add an state and state part.
    *
    * $stateProvider
    *  .state("stateName", {
    *    url: "stateUrl/"
    *    templateUrl: "templates/state.html",
    *    controller: "ControllerName"
    *  })
    *  .state("stateName.part", {
    *    url: "statePartUrl/"
    *    templateUrl: "templates/state/part.html",
    *    controller: "ControllerPartName"
    *  })
    */

    $stateProvider
      .state("app", {
        url: "/",
        templateUrl: "templates/app.html",
        controller: "AppController"
      });

      $urlRouterProvider.otherwise("/");

  }]);

  app.filter("trustUrl", ["$sce", function ($sce) {
        return function (recordingUrl) {
            return $sce.trustAsResourceUrl(recordingUrl);
        };
    }]);

  module.exports = app;

})();
