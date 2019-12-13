var TestCodesModule = angular.module('TestCodesModule', []);

function TestCodesModuleController($scope, $http){
	
	$scope.formData = {};
	
	// when landing on the page, get all todos and show them
	console.log($http.get('/api/WebClients'));
    $http.get('/api/WebClients')
        .success(function(data) {
            $scope.webClients = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
	
	// when landing on the page, get all todos and show them
    $http.get('/api/TestCodes')
        .success(function(data) {
            $scope.testCodes = data;
            console.log(data);
        })
        .error(function(data) {
            console.log('Error: ' + data);
        });
	
	// when submitting the add form, send the text to the node API
    $scope.createTestCode = function() {
        $http.post('/api/TestCodes', $scope.formData)
            .success(function(data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.testCodes = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
	
	// delete a test code after checking it
    $scope.deleteTestCode = function(id) {
        $http.delete('/api/TestCodes/' + id)
            .success(function(data) {
                $scope.testCodes = data;
                console.log(data);
            })
            .error(function(data) {
                console.log('Error: ' + data);
            });
    };
	
}