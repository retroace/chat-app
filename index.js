var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));
var socketEvents = require('./socketChat');


app.get('/', function(req, res){
	res.sendFile(__dirname+'/public/index.html');
});

var extra = require("./message.js");

io.on('connection', (socket) => socketEvents.socketConnection(socket,io));

http.listen(3000, function(){
	console.log('listening on *:3000');
});

