var https = require('https');
var fs = require('fs');
var qs = require('querystring');

var handler = require('./handler');

var options = {
	key: fs.readFileSync('privatekey.pem'),
	cert: fs.readFileSync('certificate.pem')
};

https.createServer(options, function (req, res) {
	// Capture the origin to enable CORS.
	var origin = (req.headers.origin || '*');

	// Send the appropriate header to enable cross-site scripting.
	res.setHeader('Content-Type', 'text/plain');
	res.setHeader('Access-Control-Allow-Origin', origin);

	// Function to return the proper response.
	function returnResponse (code, response) {
		res.writeHead(code);
		res.end(response);
	}

	// Function to handle POST data.
	function handlePostData (fn) {
		var body = '';
        req.on('data', function (data) {
            body += data;
        });

        req.on('end', function () {
        	// Parse the input into JSON format.
        	var tweet = JSON.parse(qs.parse(body).data);
			fn(tweet, returnResponse);
        });
	}

	// Route the request based on what's being asked of us.
	switch (req.url) {
		case '/map':
			// Log it.
			console.log('Received classification request.');

			// Only take care of it if it's a POST request.
			if (req.method == 'POST') {
				handlePostData(handler.map);
			} else {
        		return returnResponse(405, 'Invalid URL.');
    		}
			
    		break;
		case '/train':
			// Log it.
			console.log('Received training request.');

			// Only take care of it if it's a POST request. 
			if (req.method == 'POST') {
				handlePostData(handler.train);
			} else {
        		return returnResponse(405, 'Invalid URL.');
    		}

    		break;
		default:
			// Log it and return as unrecognized.
			var text = 'Unrecognized URL: ' + req.url;
			console.log(text);

			returnResponse(400, text);
			break;
			
	}
}).listen(47474);

console.log('Server running at https://127.0.0.1:47474/');