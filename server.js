// set up ========================
var http = require('http')
var request = require('request');
var express  = require('express');
var app      = express();                               // create our app w/ express
var serverinst = http.createServer(app);
var mongoose = require('mongoose');                     // mongoose for mongodb
var morgan = require('morgan');             // log requests to the console (express4)
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');

var server_port = process.env.PORT || 5000
var mongodb_connection_string = 'mongodb://desuvinaykumar:Mydb*123@ds353738.mlab.com:53738/' + "automation";

var et = require('elementtree');

var webClients = [];

// configuration =================

mongoose.connect(mongodb_connection_string);     // connect to mongoDB database on modulus.io

app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
app.use(morgan('dev'));                                         // log every request to the console
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(methodOverride());

app.use( bodyParser.raw({limit: '1mb'}) ); 

// define model =================
var TestCodes = mongoose.model('TestCodes', {
	text : String
});

var WSTemplates = mongoose.model('WSTemplates', {
	name : String,
	url : String,
	httpmethod : String,
	requestType : String,
	responseType : String,
	requestFormat : String
});

var SpecReqTemplates = mongoose.model('SpecReqTemplates', {
	name : String,
	template : String,
	type : String
});

var HeaderTemplates = mongoose.model('HeaderTemplates', {
	name : String,
	template : String
});

var TestCases = mongoose.model('TestCases', {
	name : String,
	wstemplate : String,
	wsheadertemplate : String,
	wsspecreqtemplate : String,
	inputdata : String,
	outputdata : String
});

var ExecutionResults = mongoose.model('ExecutionResults', {
	testcasename : String,
	reqText : String,
	resText : String,
	dateofexecution : String, 
	status : String
});

// api ---------------------------------------------------------------------
app.delete('/api/fileOperation/:filename', function(req, res) {
	fs.unlink(__dirname+"/uploads/"+req.params.filename, function(err){
		fs.readdir(__dirname+"/uploads", function(err, files) {
			if (err){
				res.end({});
				return;
			}else{
				var temp = {"fileNames":[]};
				files.forEach(function(f) {
					temp.fileNames.push({"fileName":f});
				});	
				res.send(temp);
			}
		});
	});
	
});

app.get('/api/analyzeFile/:filename', function(req,res){
	fs.readFile(__dirname+"/uploads/"+req.params.filename, function(err, data) {
		if(err) throw err;
		var array = data.toString().split("\n");
		var tempAr = {};
		var prevLine = "";
		var methodName = "";
		for(i in array) {
			var line = array[i];
			if(line.indexOf("Methode Java")!=-1){
				if(methodName){
					tempAr[methodName]["endTime"]=prevLine.substring(prevLine.indexOf(" ")+1,prevLine.indexOf("."));
				}
				var tempmethodName = line.substring(line.lastIndexOf(" ")+1);
				var tempstr = line.substring(line.indexOf(" ")+1,line.indexOf("."));
				tempAr[tempmethodName] = {"startTime":tempstr};
				methodName = tempmethodName;
			}
			if(line.indexOf(".DEBUG.")!=-1){
				prevLine = line;	
			}
			//console.log(array[i]);
		}
		if(prevLine){
	        	if(methodName){
            		tempAr[methodName]["endTime"]=prevLine.substring(prevLine.indexOf(" ")+1,prevLine.indexOf("."));
            	}
	        }
		res.send(tempAr);
	});
});

app.get('/api/fileOperation', function(req, res) {

	fs.readdir(__dirname+"/uploads", function(err, files) {
		if (err){
			res.end("");
			return;
		}else{
			var temp = {"fileNames":[]};
			files.forEach(function(f) {
				temp.fileNames.push({"fileName":f});
			});	
			res.send(temp);
		}
	});
	
});

app.post('/upload', function(req, res){
	// create an incoming form object
	var form = new formidable.IncomingForm();

	// specify that we want to allow the user to upload multiple files in a single request
	form.multiples = true;

	// store all uploads in the /uploads directory
	form.uploadDir = path.join(__dirname, '/uploads');

	// every time a file has been uploaded successfully,
	// rename it to it's orignal name
	form.on('file', function(field, file) {
		fs.rename(file.path, path.join(form.uploadDir, file.name));
	});

	// log any errors that occur
	form.on('error', function(err) {
		console.log('An error has occured: \n' + err);
	});

	// once all the files have been uploaded, send a response to the client
	form.on('end', function() {
		res.end("success");
	});

	// parse the incoming request containing the form data
	form.parse(req);
});

// fire http
app.post('/api/fireurl', function(req, res){

	var selectedTestCase = req.body;
	if(!selectedTestCase.name){
		res.send({"dataError":"No Data to execute"});
	}else{
	
		var completeDetails = {};
		
	}
	
	fetchWSTemplateDetails();
	
	function fetchWSTemplateDetails(){
		WSTemplates.find({name:selectedTestCase.wstemplate},function(err, webServiceTemplate){
			if(webServiceTemplate.length){
				completeDetails.URL = webServiceTemplate[0].url;
				completeDetails.httpmethod = webServiceTemplate[0].httpmethod;
				completeDetails.requestType = webServiceTemplate[0].requestType;
				completeDetails.responseType = webServiceTemplate[0].responseType;
				completeDetails.requestFormat = webServiceTemplate[0].requestFormat;
				completeDetails.headers = {};
				completeDetails.headers["content-Type"] = completeDetails.requestType;
				completeDetails.headers["Accept"] = completeDetails.responseType;
				fetchWSHeaderDetails();
				
			}else{
				res.send({"dataError":"Web service template details not found"});
			}
		});
	}
	
	function fetchWSHeaderDetails(){
		HeaderTemplates.find({name:selectedTestCase.wsheadertemplate}, function(err, wsHeaderTemplate){
			if(wsHeaderTemplate.length){
				var tempHeaders = JSON.parse(wsHeaderTemplate[0].template);
				for(var k in tempHeaders){
					completeDetails.headers[k] = tempHeaders[k];
				}
			}
			fetchSpecRequestTemplate();
		});
	}

	function fetchSpecRequestTemplate(){
		SpecReqTemplates.find({name : selectedTestCase.wsspecreqtemplate, type: completeDetails.requestType}, function(err, reqTemplates) {
			if(reqTemplates.length){
				completeDetails.specReqTemplate = reqTemplates[0].template;
			}
			fireExternalWebService();
		});
	}
	
	function updateXMLRequest(_inputData){
		var xmldoc = et.parse(completeDetails.requestFormat);
		for(var _i in _inputData){
			xmldoc.find(_i).text = _inputData[_i];
		}
		completeDetails.requestFormat = xmldoc.write().replace("<?xml version='1.0' encoding='utf-8'?>","");
	}
	
	function updateJSONRequest(_inputData){
		var _temp = JSON.parse(completeDetails.requestFormat);
		mergeJSON(_temp,_inputData);
		completeDetails.requestFormat = JSON.stringify(_temp);
	}
	
	function mergeJSON(json1,json2)
	{
		for(var _k in json2){
			if(json2[k] instanceof Object){
				if(json1[k]==undefined || json1[k]==null){
					json1[k]={};
				}
				mergeJSON(json1[k],json2[k]);
			}else{
				json1[k] = json2[k];
			}
		}
	}
	
	function checkXMLResponse(_outputData){
		if(completeDetails.resText.indexOf("GoldWebServiceError")!=-1){
			completeDetails.status = "Error thrown by web service";
		}else{
			var xmldoc = et.parse(completeDetails.resText);
			var tempStr = "";
			for(var _i in _outputData){
				if(!(xmldoc.find(_i).text == _outputData[_i])){
					tempStr += "Value of "+_i+" is having "+xmldoc.find(_i).text+" and expected value is "+_outputData[_i]+",\n";
				}
			}
			if(tempStr){
				completeDetails.status = "Failed because of following :\n"+tempStr;
			}else{
				completeDetails.status = "Success";
			}
		}		
	}
	
	function checkJSONResponse(){
	}
	
	function fireExternalWebService(){
		if(selectedTestCase.inputdata){
			if(completeDetails.requestType.indexOf("xml")!=-1){
				updateXMLRequest(JSON.parse(selectedTestCase.inputdata));
			}else{
				updateJSONRequest(JSON.parse(selectedTestCase.inputdata));
			}
		}
		if(completeDetails.specReqTemplate){
			if(completeDetails.requestType.indexOf("xml")!=-1){
				completeDetails.requestFormat = completeDetails.specReqTemplate.replace("--BODY--", completeDetails.requestFormat);
			}else{
				var _tempData = JSON.parse(completeDetails.specReqTemplate);
				var _tempDataReq = JSON.parse(completeDetails.requestFormat);
				for(var k in _tempDataReq){
					_tempData[k]=_tempDataReq[k];
				}
				completeDetails.requestFormat = JSON.stringify(_tempData);
			}
			
		}	
			var reqbody = completeDetails.requestFormat;
		request({
				uri: completeDetails.URL,
				method: completeDetails.httpmethod,
				headers : completeDetails.headers,
				body: reqbody
			}, function(error, response, body) {
				if(error){
					completeDetails.resText = error;
					completeDetails.status = "Failed to due to error in web service call";
				}else{
					completeDetails.resText = body;
					if(selectedTestCase.outputdata){
						var _outputData = JSON.parse(selectedTestCase.outputdata);
						if(completeDetails.responseType.indexOf("xml")!=-1){
							checkXMLResponse(_outputData);
						}else{
							checkJSONResponse(_outputData);
						}
					}else{
						completeDetails.status = "Success";
					}					
				}
				ExecutionResults.create({
					testcasename : selectedTestCase.name, 
					reqText : reqbody, 
					resText:error?JSON.stringify(error):body,
					dateofexecution:new Date(),
					status : completeDetails.status,
					done: false},function(err, execresult){
					ExecutionResults.find(function(err, results) {
											if (err){
												res.send({"dataError":err});
											}else{
												res.json(results); 
											}
										});
				});
			}
		);
	}

});
//-----------------------------------------------------------------------------------------------
app.get('/api/ExecutionResults', function(req, res) {

	ExecutionResults.find(function(err, results) {
		if (err){
			res.send(err)
		}else{
			res.json(results); 
		}
	});
	
});

app.delete('/api/ExecutionResults/:templateId', function(req, res) {
	ExecutionResults.remove({
		_id : req.params.templateId
	}, function(err, temp) {
		if (err){
			res.send(err);
		}else{
			// get and return all the test codes after you create another
			ExecutionResults.find(function(err, results) {
				if (err){
					res.send(err)
				}else{
					res.json(results); 
				}
			});
		}
	});
});

//-----------------------------------------------------------------------------------------------
app.get('/api/TestCases', function(req, res) {

	TestCases.find(function(err, testcases) {
		if (err){
			res.send(err)
		}else{
			res.json(testcases); 
		}
	});
	
});

app.delete('/api/TestCases/:templateId', function(req, res) {
	TestCases.remove({
		_id : req.params.templateId
	}, function(err, temp) {
		if (err){
			res.send(err);
		}else{
			// get and return all the test codes after you create another
			TestCases.find(function(err, testcases) {
				if (err){
					res.send(err)
				}else{
					res.json(testcases); 
				}
			});
		}
	});
});

app.post('/api/TestCases', function(req, res) {

	TestCases.find({name:req.body.name}, function(err, testcases){
		if (err){
			res.status(400).send(err);
		}else{
			if(testcases.length){
				res.send({"dataError":"record already exists"});
			}else{
				TestCases.create({
					name : req.body.name,
					wstemplate:req.body.wstemplate,
					wsheadertemplate:req.body.wsheadertemplate,
					wsspecreqtemplate:req.body.wsspecreqtemplate,
					inputdata:req.body.inputdata,
					outputdata:req.body.outputdata,
					done : false
				}, function(err, temp) {
					if (err){
						res.send(err);
					}else{// get and return all the test codes after you create another
						TestCases.find(function(err, testcases) {
							if (err){
								res.send(err)
							}else{
								res.json(testcases);
							}
						});
					}
				});
			}
		}			
	});
});

//-----------------------------------------------------------------------------------------------
app.get('/api/HeaderTemplates', function(req, res) {

	HeaderTemplates.find(function(err, templates) {
		if (err){
			res.send(err)
		}else{
			res.json(templates); 
		}
	});
	
});

app.post('/api/HeaderTemplates', function(req, res) {

	HeaderTemplates.find({name:req.body.name}, function(err, templates){
		if (err){
			res.status(400).send(err);
		}else{
			if(templates.length){
				res.send({"dataError":"record already exists"});
			}else{
				HeaderTemplates.create({
					name : req.body.name,
					template : req.body.template,
					done : false
				}, function(err, temp) {
					if (err)
						res.send(err);
					// get and return all the test codes after you create another
					HeaderTemplates.find(function(err, templates) {
						if (err)
							res.send(err)
						res.json(templates);
					});
				});
			}
		}			
	});
});

app.delete('/api/HeaderTemplates/:templateId', function(req, res) {
	HeaderTemplates.remove({
		_id : req.params.templateId
	}, function(err, temp) {
		if (err)
			res.send(err);

		// get and return all the test codes after you create another
		HeaderTemplates.find(function(err, templates) {
			if (err)
				res.send(err)
			res.json(templates);
		});
	});
});

//-----------------------------------------------------------------------------------------------
// get all SpecReqTemplates
app.get('/api/SpecReqTemplates', function(req, res) {

	SpecReqTemplates.find(function(err, templates) {
		if (err){
			res.send(err)
		}else{
			res.json(templates); 
		}
	});
	
});

app.post('/api/SpecReqTemplates', function(req, res) {

	SpecReqTemplates.find({name:req.body.name}, function(err, template){
		if (err){
			res.status(400).send(err);
		}else{
			if(template.length){
				res.send({"dataError":"record already exists"});
			}else{
				SpecReqTemplates.create({
					name : req.body.name,
					template : req.body.template,
					type : req.body.type,
					done : false
				}, function(err, temp) {
					if (err)
						res.send(err);
					// get and return all the test codes after you create another
					SpecReqTemplates.find(function(err, templates) {
						if (err)
							res.send(err)
						res.json(templates);
					});
				});
			}
		}			
	});
});

app.delete('/api/SpecReqTemplates/:templateId', function(req, res) {
	SpecReqTemplates.remove({
		_id : req.params.templateId
	}, function(err, temp) {
		if (err)
			res.send(err);

		// get and return all the test codes after you create another
		SpecReqTemplates.find(function(err, templates) {
			if (err)
				res.send(err)
			res.json(templates);
		});
	});
});
//-----------------------------------------------------------------------------------------------
// get all WSTemplates
app.get('/api/WSTemplates', function(req, res) {
	console.log("entered")
	try{
	WSTemplates.find(function(err, templates) {
		if (err){
			console.log("records in error"+err)
			res.send(err)
		}else{
			console.log("records in success")
			res.json(templates); 
		}
	});
	}catch(e){
		console.log("fetch in error"+e);
		res.send({"dataError":err});
	}
});

app.post('/api/WSTemplates', function(req, res) {
	// create a todo, information comes from AJAX request from Angular
	WSTemplates.find({name:req.body.name}, function(err, template){
		if (err){
			res.status(400).send(err);
		}else{
			if(template.length){
				res.send({"dataError":"record already exists"});
			}else{
				WSTemplates.create({
					name : req.body.name,
					url : req.body.url,
					httpmethod : req.body.httpmethod,
					requestType : req.body.requestType,
					responseType : req.body.responseType,
					requestFormat : req.body.requestFormat,
					done : false
				}, function(err, temp) {
					if (err){
						res.status(400).send(err);
					}else{
						// get and return all the test codes after you create another
						WSTemplates.find(function(err, templates) {
							if (err)
								res.send(err)
							res.json(templates);
						});
					}
				});
			}
		}			
	});
});

app.delete('/api/WSTemplates/:codeId', function(req, res) {
	WSTemplates.remove({
		_id : req.params.codeId
	}, function(err, temp) {
		if (err)
			res.send(err);

		// get and return all the test codes after you create another
		WSTemplates.find(function(err, templates) {
			if (err)
				res.send(err)
			res.json(templates);
		});
	});
});
//-----------------------------------------------------------------------------------------------
// get all web clients
app.get('/api/WebClients', function(req, res) {

	var temp = [];
	for(var i in webClients){
		temp.push({"clientId" : (typeof webClients[i]._sender)});
	}
	res.json(temp);
	
});

// get all TestCodes
app.get('/api/TestCodes', function(req, res) {

	TestCodes.find(function(err, testcodes) {
		if (err)
			res.send(err)
		res.json(testcodes); 
	});
});

// create Test codes and send back all codes after creation
app.post('/api/TestCodes', function(req, res) {

	// create a todo, information comes from AJAX request from Angular
	TestCodes.create({
		text : req.body.text,
		done : false
	}, function(err, testcodes) {
		if (err)
			res.send(err);
		// get and return all the test codes after you create another
		TestCodes.find(function(err, testcodes) {
			if (err)
				res.send(err)
			res.json(testcodes);
		});
	});

});

// delete a test code
app.delete('/api/TestCodes/:codeId', function(req, res) {
	TestCodes.remove({
		_id : req.params.codeId
	}, function(err, testcode) {
		if (err)
			res.send(err);

		// get and return all the test codes after you create another
		TestCodes.find(function(err, testcodes) {
			if (err)
				res.send(err)
			res.json(testcodes);
		});
	});
});
	
// application -------------------------------------------------------------
app.get('*', function(req, res) {
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
serverinst.listen(server_port,function () {
  console.log( "Listening on port " + server_port )
});
