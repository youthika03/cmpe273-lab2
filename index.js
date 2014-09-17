var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

 function getSessionFrmCookies(request) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		return sid;
		
	}else {
		return null;
		
	}
};

function createSessionIdNameAndEmail(request){
	
	var paramName=request.body.name;
	var paramEmail = request.body.email;
	
	console.log(paramName);
    console.log(paramEmail);
	
	// var newSessionId = Login.login('xxx', 'xxx@gmail.com');
	var newSessionId = login.login(paramName, paramEmail);
	return newSessionId;
};


function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

function post(request, response) {
	// TODO: read 'name and email from the request.body'
	console.log("Read name and email from server");
	var newSessionId=createSessionIdNameAndEmail(request);
	
	
	// TODO: set new session id to the 'session_id' cookie in the response
	response.setHeader('Set-Cookie','session_id=' + newSessionId);
		
	// replace "Logged In" response with response.end(login.hello(newSessionId));

	//response.end("Logged In\n");
	response.end(login.hello(newSessionId));
};

function del(request, response) {
	console.log("DELETE:: Logout from the server");
	var delSessionId=getSessionFrmCookies(request);
	// TODO: remove session id via login.logout(xxx)

		if ( login.isLoggedIn(delSessionId) ) {
			login.logout(delSessionId);
			response.end('Logged out from the server\n');
			}
			else {
				response.end("Invalid session_id! \n");
		}
 	
 	// No need to set session id in the response cookies since you just logged out!
	
};


function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	var putSessionId=getSessionFrmCookies(request);
	var newSessionId=createSessionIdNameAndEmail(request);
	
	// TODO: refresh session id; similar to the post() function
	if(login.isLoggedIn(putSessionId)) {
		login.logout(putSessionId);
		response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
		response.end("Re-freshed session id\n");
	}else{
		response.end("Invalid session_id! \n");
	}
	
};

app.listen(8000);

console.log("Node.JS server running at 8000...");
