WebServiceAutomateModule.config(['$routeProvider', function($routeProvider) {
            $routeProvider            
            .when('/home', {
               templateUrl: '/wshome.html'
            })
			.when('/help', {
               templateUrl: '/help.html'
            })
            .when('/wstemplate', {
               templateUrl: '/JS/wstemplate/wstemplate.html'
               //,controller: 'WSTemplateController'
            })
            .when('/specreqtemplate', {
               templateUrl: '/JS/specificreqtemplate/specificreqtemplate.html'
               //,controller: 'SpecificReqTemplateController' // specified in the view itself, if we specify again the controller will be initialized twice
            })
			.when('/testcaseexecution', {
               templateUrl: '/JS/testcaseexecution/testcaseexecution.html'
               //,controller: 'TestCaseExecutionController'
            })
			.when('/testcasecreation', {
               templateUrl: '/JS/testcasecreation/testcasecreation.html'
               //,controller: 'TestCaseCreationController'
            })	
			.when('/analyze', {
               templateUrl: '/JS/analyzefile/analyzefile.html'
               //,controller: 'TestCaseCreationController'
            })				
            .otherwise({
               redirectTo: '/home'
            });
         }]);