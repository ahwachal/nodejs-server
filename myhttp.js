//Andrew Wachal
//CS316
//Professor Linton
//11/11/19
//Project 3
//Run by "node myhttp.js"
const MINPORT = 5000;
const MAXPORT = 35000;
const URL = /^\/(UNLINK|SIZE|FETCH)\/([A-Z]+\/)*[a-z_]+\.(txt|html|mp3|jpg)$/;		//single regex to accept all valid URLS
const REPART1 = /^\/UNLINK\/([A-Z]+\/)*[a-z_]+\.(txt|html|mp3|jpg)$/;		//regex to accept UNLINK URLs
const REPART2 = /^\/SIZE\/([A-Z]+\/)*[a-z_]+\.(txt|html|mp3|jpg)$/;		//regex to accept SIZE URLs
const REPART3 = /^\/FETCH\/([A-Z]+\/)*[a-z_]+\.(txt|html|mp3|jpg)$/;		//regex to accept FETCH URLs
const WORKDIRECTORY = "WEBSERVER/";
const VALIDEXT = [
	["txt", "text/plain"],
	["html", "text/html"],
	["mp3", "audio/mp3"],
	["jpg", "image/jpeg"],
];
const STARTMSG = "Server started. Listening on http://localhost:";
const ERRCODE = 400;
const OKCODE = 200;
const ERRINCOMING = "Incoming (invalid) request with the URL: ";
const OKINCOMING = "Incoming (valid) request with the URL: ";
const ERROUT = "INVALID URL: ";
const ERRUNLINK = "ERROR: could not unlink file ";
const ERRSIZE = "ERROR: could not stat file ";
const ERRFETCH = "ERROR: unable to fetch URL ";

const http = require("http");
const fs = require("fs");

const port =  randomPort(MINPORT, MAXPORT);

//function to generate a random number between max and min
//random number used for port address
function randomPort(min , max){
	var randomnum =  Math.floor(Math.random() * (max-min)) + min;
	return randomnum;
}

//event listener function for http.createServer
function incoming(request, response) {
	var xurl = request.url;
	//if the requested URL is a valid URL, then test to see which function to call
	if(URL.test(xurl)){
		console.log(OKINCOMING + xurl);
		//if it is UNLINK, then doRemove
		if(REPART1.test(xurl)){
			doRemove(request, response);
		}
		//if it is SIZE, then doSize
		else if(REPART2.test(xurl)){
			doSize(request, response);
		}
		//if it is FETCH, then do fetch
		else if(REPART3.test(xurl)){
			doFetch(request, response);
		}
		//just in case it gets here, give error
		else {
			response.statusCode = 403;
			response.write(ERROUT + xurl + "\n");
		}
	}
	//if the URL is invalid, return errors
	else{
		console.log(ERRINCOMING + xurl);
		response.statusCode = ERRCODE;
		response.end(ERROUT +xurl + "\n");
	}


}

//remove a file from the directoy using fs.unlink()
function doRemove(request, response){
	response.setHeader('Content-Type', 'text/plain');
	var xurl = request.url;
	var file = xurl.replace("/UNLINK/", WORKDIRECTORY);	//make the file name a valid path
	fs.unlink(file, (err) => {
		//if there's an error, return errors to console and client
		if (err){
			console.log("Error: " + err);
			response.statusCode = ERRCODE;
			response.end(ERRUNLINK +xurl+"\n");
		}
		//if not, remove the file and tell the client
		else {
			response.statusCode = OKCODE;
			response.end("UNLINK: the URL "+xurl+" was removed.\n");
		}
	})
}

//find the size of a file and return to client
function doSize(request, response){
	response.setHeader('Content-Type', 'text/plain');
	var xurl = request.url;
	var file = xurl.replace("/SIZE/", WORKDIRECTORY);	//make the file name a valid path
	fs.stat(file, function(err, stats) {
		//if there;s an error, return errors to console and client
		if(err){
			console.log("Error: " + err);
			response.statusCode = ERRCODE;
			response.end(ERRSIZE +xurl+"\n");
		}
		//if no error, tell client the size
		else{
			response.statusCode = OKCODE;
			response.end("STAT: the URL "+xurl+" size is "+stats.size+"\n");
		}
	})
}

//read the file and return its contents to client
function doFetch(request, response){
	var xurl = request.url;
	var file = xurl.replace("/FETCH/", WORKDIRECTORY);	//make file name a valid path
	var index = file.indexOf(".");
	var ext = file.slice(index);		//find the value of the file extension
	//search the VALIDEXT arrary for the extension, and set the header accordingly
	for (var i = 0; i < VALIDEXT.length; i++){
		if (ext == VALIDEXT[i][0]){
			var header = VALIDEXT[i][1];
			response.setHeader('Content-Type', header);
		}
	}
	fs.readFile(file, (err, data) => {
		//if there's an error, return errors to console and client
		if (err){
			console.log("Error: " + err);
			response.statusCode = ERRCODE;
			response.end(ERRFETCH +xurl+"\n");
		}
		//if no error, return the data from the file to the user
		else{
			response.statusCode = OKCODE;
			response.end(data);
		}
	})
}
		
		
	
	
// create a server, passing it the event function

var server = http.createServer(incoming);

//  try to listen to incoming requests.
// each incoming request should invoke incoming()
try {
	server.on('error', function(e) {
		console.log("Error! "+e.code);
	}); // server.on()
	
	server.listen(port);
	console.log(STARTMSG + port);
} catch (error) {
} // try
