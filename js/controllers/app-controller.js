(function() {

  'use strict';

  var controllers = angular.module('starter.controllers');

  function AppController($scope, $rootScope) {

   	$scope.init = function(){

   		console.log("init running");

   	};

   	$scope.teste = "teste angular";

  }

  AppController.$inject = ["$scope","$rootScope"];

  module.exports = controllers.controller("AppController", AppController);
})();
