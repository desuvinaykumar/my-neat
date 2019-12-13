WebServiceAutomateModule.controller("TestCaseCreationController", function($scope, $http){

	$scope.newTestCase = {
							"name":"",
							"wstemplate":"",
							"wsheadertemplate":"",
							"wsspecreqtemplate":"",
							"inputdata":"",
							"outputdata":""
						};
	
	$scope.createTestCase = function(){
		if(!$scope.newTestCase.name 
			||!$scope.newTestCase.wstemplate){
			alert("Please enter mandatory data.")
			return;
		}
		
		$http.post("/api/TestCases",$scope.newTestCase)
				.then(function(response){
					if(response.data.dataError){
						alert(response.data.dataError);
					}else{
						$scope.newTestCase = {
												"name":"",
												"wstemplate":"",
												"wsheadertemplate":"",
												"wsspecreqtemplate":"",
												"inputdata":"",
												"outputdata":""
											};
						$scope.testcaseslist = response.data;
					}
				}, function(error){
					alert(error.statusText);
				});
		
	};
	
	$scope.removeTestCase = function(id){
		$http.delete('/api/TestCases/'+id)
			.then(function(response){
				$scope.testcaseslist = response.data;
			}, function(response){
				console.log(response.statusText);
			});
	};
	
	$http.get('/api/WSTemplates')
		.then(function(response) {
				$scope.wsTemplates = response.data;
			}, function(response) {
				console.log(response.statusText);
			})
	$http.get('/api/SpecReqTemplates')
		.then(function(response) {
				$scope.srTemplates = response.data;
			}, function(response) {
				console.log(response.statusText);
			})
	$http.get('/api/HeaderTemplates')
		.then(function(response) {
				$scope.headerTemplates = response.data;
			}, function(response) {
				console.log(response.statusText);
			})
	$http.get('/api/TestCases')
		.then(function(response) {
				$scope.testcaseslist = response.data;
			}, function(response) {
				console.log(response.statusText);
			})	
});