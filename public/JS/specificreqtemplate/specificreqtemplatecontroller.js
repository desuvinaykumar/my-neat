WebServiceAutomateModule.controller("SpecificReqTemplateController", function($scope, $http){

	$scope.reqTemplate={};
	$scope.hideSpecRequest = false;
	$scope.hideSpecHeaders = true;
	$scope.headerTemplate={};

	$scope.showSpecRequest = function(bool){
		$scope.hideSpecRequest = bool;
	};
	
	$scope.showSpecHeaders = function(bool){
		$scope.hideSpecHeaders = bool;
	};
	
	$scope.createSpecReqTemplate = function(){
		
		if(!$scope.reqTemplate.name 
			|| !$scope.reqTemplate.template
			|| !$scope.reqTemplate.type){
			alert("Please enter all data.");
			return;
		}
		
		$http.post('/api/SpecReqTemplates', $scope.reqTemplate)
			.then(function(response){
				if(response.data.dataError){
					alert(response.data.dataError);
				}else{
					$scope.reqTemplate={};
					$scope.reqTemplatesList = response.data;
				}
			}, function(response){
				alert(response.statusText);
			});
	
	};
	
	$scope.removeSpecReqTemplate = function(id){
		$http.delete('/api/SpecReqTemplates/'+id)
			.then(function(response){
				$scope.reqTemplatesList = response.data;
			}, function(response){
				console.log(response.statusText);
			});
	};
	
	$scope.createHeaderTemplate = function(){
		if(!$scope.headerTemplate.name 
			|| !$scope.headerTemplate.template){
			alert("Please enter all data.");
			return;
		}
		
		$http.post('/api/HeaderTemplates', $scope.headerTemplate)
			.then(function(response){
				if(response.data.dataError){
					alert(response.data.dataError);
				}else{
					$scope.headerTemplate={};
					$scope.headerTemplateList = response.data;
				}
			}, function(response){
				alert(response.statusText);
			});
	};
	
	$scope.removeHeaderTemplate = function(id){
		$http.delete('/api/HeaderTemplates/'+id)
			.then(function(response){
				$scope.headerTemplateList = response.data;
			}, function(response){
				console.log(response.statusText);
			});
	};
	
	$http.get('/api/SpecReqTemplates')
		.then(function(response) {
				$scope.reqTemplatesList = response.data;
			}, function(response) {
				console.log(response.statusText);
			});
	
	$http.get('/api/HeaderTemplates')
		.then(function(response) {
				$scope.headerTemplateList = response.data;
			}, function(response) {
				console.log(response.statusText);
			})
});