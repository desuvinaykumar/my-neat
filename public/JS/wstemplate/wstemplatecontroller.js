WebServiceAutomateModule.controller("WSTemplateController", function($scope, $http){

	$scope.newTemplate={};

	$scope.createWSTemplate = function(){
		if(!$scope.newTemplate.name 
			|| !$scope.newTemplate.url
			|| !$scope.newTemplate.httpmethod
			|| !$scope.newTemplate.requestType
			|| !$scope.newTemplate.responseType
			|| !$scope.newTemplate.requestFormat){
			alert("Please enter all data.");
			return;
		}
		
		
		/*$http.post('/api/fireurl', $scope.newTemplate).then(function(response){
			console.log(response.data);
		},function(response){
			console.log(response.statusText);
		});*/
		$http.post('/api/WSTemplates', $scope.newTemplate)
			.then(function(response){
				if(response.data.dataError){
					alert(response.data.dataError);
				}else{
					$scope.newTemplate={};
					$scope.templatesList = response.data;
				}
			}, function(response){
				alert(response.statusText);
			});
	};
	
	$scope.removeWSTemplate = function(id){
		$http.delete('/api/WSTemplates/'+id)
			.then(function(response){
				$scope.templatesList = response.data;
			}, function(response){
				console.log(response.statusText);
			});
	};
	
	$scope.editWSTemplate = function(template){
		
	};
	
	// when landing on the page, get all todos and show them
    $http.get('/api/WSTemplates')
		.then(function(response) {
				$scope.templatesList = response.data;
			}, function(response) {
				console.log(response.statusText);
			})
});