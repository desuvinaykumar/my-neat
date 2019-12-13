var WebServiceAutomateModule = angular.module('WebServiceAutomateModule', ["ngRoute"]);

WebServiceAutomateModule.controller("WebServiceAutomateModuleController", function ($scope, $http){
	
	$scope.help1 = true;
	$scope.help2 = true;
	$scope.help3 = true;
	$scope.help4 = true;
	$scope.help5 = false;
	
	$scope.showHelpPage = function(){
		location.hash="#!help"
	}
	
	$scope.showHelp = function(helpNum, bool){
	
		$scope.help1 = true;
		$scope.help2 = true;
		$scope.help3 = true;
		$scope.help4 = true;
		$scope.help5 = true;
		if(!bool){
			switch(helpNum){
				case 1:
				$scope.help1 = false;
				break;
				case 2:
				$scope.help2 = false;
				break;
				case 3:
				$scope.help3 = false;
				break;
				case 4:
				$scope.help4 = false;
				break;
				case 5:
				$scope.help5 = false;
				break;
			}
		}
	}
	
})