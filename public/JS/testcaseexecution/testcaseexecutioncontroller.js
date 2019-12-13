WebServiceAutomateModule.controller("TestCaseExecutionController", function($scope, $http){

	$scope.execution = {};
	$scope.execution.testcase = "";
	
	$scope.execute = function(){
		var selectedTestcase = {};
		for(var i in $scope.testcaseslist){
			if($scope.testcaseslist[i].name == $scope.execution.testcase){
				selectedTestcase = $scope.testcaseslist[i];
				break;
			}
		}
		if(selectedTestcase.name){
			$http.post('/api/fireurl',selectedTestcase)
			.then(function(response){
				if(response.data.dataError){
					alert(response.data.dataError);
				}else{
					$scope.execution.testcase = "";
					$scope.executionresults = response.data;
				}
			}, function(response){
				alert(response.statusText);
			});
		}
	};
	
	$scope.removeExecutionResult = function(id){
		$http.delete('/api/ExecutionResults/'+id)
			.then(function(response){
				$scope.executionresults = response.data;
			}, function(response){
				console.log(response.statusText);
			});
	};
	
	$http.get('/api/TestCases')
		.then(function(response) {
				$scope.testcaseslist = response.data;
			}, function(response) {
				console.log(response.statusText);
			});
				
	$http.get('/api/ExecutionResults')
		.then(function(response) {
				$scope.executionresults = response.data;
			}, function(response) {
				console.log(response.statusText);
			})
	
});