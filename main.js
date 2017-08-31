'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');

const PORT =  process.env.PORT || 8080;
const INDEX = path.join(__dirname, './index.html');
const GAME = path.join(__dirname, './game.html');

// define routes and socket
const server = express();
server.get('/', function(req, res) { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, '.')));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const io = socketIO(requestHandler);

// Game Server
const MyServerEngine = require(path.join(__dirname, 'src/server/SLServerEngine.js'));
const MyGameEngine = require(path.join(__dirname, 'src/common/SLGameEngine.js'));
const CannonPhysicsEngine = require('lance-gg').physics.CannonPhysicsEngine;
// Game Instances
/*
    static get TRACE_ALL() { return 0; }
    static get TRACE_DEBUG() { return 1; }
    static get TRACE_INFO() { return 2; }
    static get TRACE_WARN() { return 3; }
    static get TRACE_ERROR() { return 4; }
    static get TRACE_NONE() { return 1000; }*/
var physicsEngine = new CannonPhysicsEngine();
var gameEngine = new MyGameEngine({ physicsEngine, traceLevel: 1000 });
var serverEngine = new MyServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });
var started = false;

var stopEngine = function (){
	//stop the existing game loop
	serverEngine.scheduler.nextTick = function(){console.log("final tick");};
	//disconnect existing clients
	var srvSockets = io.sockets.sockets;
	var skeys = Object.keys(srvSockets);
	for(var i=0;i<skeys.length;i+=1){
		console.log("disconnect: "+skeys[i]);
		srvSockets[skeys[i]].disconnect();
	}
	//... todo: remove bindings?
	//https://github.com/lance-gg/lance/blob/master/src/ServerEngine.js
	console.log("Stop triggered...");
	//create new instances
	physicsEngine = new CannonPhysicsEngine();
	gameEngine = new MyGameEngine({ physicsEngine, traceLevel: 1000 });
	serverEngine = new MyServerEngine(io, gameEngine, { debug: {}, updateRate: 6 });
};
// start the game
server.get('/game', function(req, res) {
	if(!started){
		serverEngine.start();
		started = true;
	}
	res.sendFile(GAME);
});
server.get('/start', function(req, res) {
	if(started){
		stopEngine();
	}
	serverEngine.start();
	started = true;
	res.send("Started");
	//res.redirect("/game");
});
server.get('/stop', function(req, res) {
	if(started){
		stopEngine();
	}
	started = false;
	res.send("Stopped");
});

var pg = require('pg');
server.get('/db',function (request, response){
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       {
		
	result.send("Query"+result.rows);
		
		 }
    });
  });
	
});