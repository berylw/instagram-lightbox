var express		= require('express');
var bodyParser 	= require('body-parser');
var app 		= express(); 
var config 		= require('config');
var http 		= require('http');
var httpServer  = http.createServer(app);
var io 			= require('socket.io').listen(httpServer);

httpServer.listen(process.env.PORT || 3001);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
})

io.sockets.on('connection', function(socket) {
	console.log("New socket connected");
})

app.get('/callback/tag', function(req, res) {
	if (req.query['hub.mode'] == 'subscribe') {
		console.log("received get request");
		res.send(req.query['hub.challenge']);
	} else {
		console.log("get request failed");
		res.send('This API endpoint is reserved for subscription requests.');
	}
})
 
app.post('/callback/tag', function(req, res) {
	io.sockets.emit('update', { numNewPhotos: req.body.length });
	res.send('Request acknowledged');
})