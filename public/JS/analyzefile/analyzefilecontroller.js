WebServiceAutomateModule.controller("AnalyzeFileController", function($scope, $http){
	$scope.filesList = [];
	$scope.analysisResult = [];
	
	$http.get('/api/fileOperation')
			.then(function(response){
				$("#fileSelected").val(''); 
				if(response.data.dataError){
					alert(response.data.dataError);
				}else{
					$scope.filesList = response.data.fileNames;
				}
			}, function(response){
				alert(response.statusText);
			});
	
	$scope.deleteFile = function(fileName){
		$scope.analysisResult = [];
		$http.delete('/api/fileOperation/'+fileName)
			.then(function(response){
				$scope.filesList = response.data.fileNames;
			},function(response){
				alert(response.statusText);
			});
	}
	
	$scope.processFile = function(fileName){
		$scope.analysisResult = [];
		$http.get('/api/analyzeFile/'+fileName)
		.then(function(response){
			var tempData = response.data;
			var temparr = [];
			for(var i in tempData){
			
				var startDate = new Date("January 1, 1970 " + tempData[i].startTime);
				var endDate = new Date("January 1, 1970 " + tempData[i].endTime);
				var timeDiff = Math.abs(startDate - endDate);

				var hh = Math.floor(timeDiff / 1000 / 60 / 60);
				if(hh < 10) {
					hh = '0' + hh;
				}
				timeDiff -= hh * 1000 * 60 * 60;
				var mm = Math.floor(timeDiff / 1000 / 60);
				if(mm < 10) {
					mm = '0' + mm;
				}
				timeDiff -= mm * 1000 * 60;
				var ss = Math.floor(timeDiff / 1000);
				if(ss < 10) {
					ss = '0' + ss;
				}
				
				temparr.push({"methodName":i,"startTime":tempData[i].startTime,"endTime":tempData[i].endTime,"executionTime":(hh + ":" + mm + ":" + ss)});
			}
			$scope.analysisResult = temparr;
		}, function(response){
		});
	}
	
	$scope.uploadFile = function(){
		$scope.analysisResult = [];
		var files = $("#fileSelected").get(0).files;
		if (files.length > 0){
			var formData = new FormData();
			formData.append('uploads[]', files[0], files[0].name);
			
			$.ajax({
				url: '/upload',
				type: 'POST',
				data: formData,
				processData: false,
				contentType: false,
				success: function(data){
				  
				  $http.get('/api/fileOperation')
					.then(function(response){
						$("#fileSelected").val(''); 
						if(response.data.dataError){
							alert(response.data.dataError);
						}else{
							$scope.filesList = response.data.fileNames;
						}
					}, function(response){
						alert(response.statusText);
					});
				}
				});
			
		}
	};

});