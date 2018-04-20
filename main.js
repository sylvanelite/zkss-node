'use strict';

const express = require('express');
const path = require('path');

const PORT =  process.env.PORT || 8080;
const INDEX = path.join(__dirname, './index.html');
// define routes and socket
const server = express();
server.get('/', function(req, res) { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, '.')));
let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

/*
var pg = require('pg');
server.get('/db/init',function (request, response){
  response.header("Access-Control-Allow-Origin", "*");
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT MAX(id) FROM messages', function(err, result) {
		done();
		if (err){
			console.error(err);
			response.send("Error " + err);
		}else{
			response.send(result.rows[0]);
		}
		 pg.connect(process.env.DATABASE_URL, function(err2, client2, done2) {
			client2.query("DELETE FROM messages WHERE timestamp < now()::date - 7", function(err2, result2) {
				done2();
				if (err2){
					console.error(err2);
				}else{
					console.log(result2);
				}
			});
		  });
    });
  });
});
server.get('/db/kvs_save',function (request, response){
  response.header("Access-Control-Allow-Origin", "*");
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	var k = request.query.data_key;
	var v = request.query.data_value;
    client.query('  INSERT INTO kvs (data_key, data_value) '+
				' VALUES ($1, $2) ON CONFLICT (data_key) DO UPDATE '+
				' SET  data_key=$1, data_value=$2 ',[k,v], function(err, result) {
		done();
		if (err){
			console.error(err);
			response.send("Error " + err);
		}else{
			response.send("result"+result);
		}
    });
  });
});
server.get('/db/kvs_load',function (request, response){
  response.header("Access-Control-Allow-Origin", "*");
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	var k = request.query.data_key;
    client.query(' SELECT data_value FROM kvs WHERE (data_key=$1)',[k], function(err, result) {
		done();
		if (err){
			console.error(err);
			response.send("Error " + err);
		}else{
			response.send(result.rows[0]);
		}
    });
  });
});
server.get('/db/getUpdates',function (request, response){
  response.header("Access-Control-Allow-Origin", "*");
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	var uid = request.query.uid;
	var area = request.query.area;
	var mid = request.query.mid;
    client.query('SELECT id,message FROM messages WHERE (id > $1 and "user" != $2 and area = $3)',[mid,uid,area], function(err, result) {
		done();
		if (err){
			console.error(err);
			response.send("Error " + err);
		}else{
			var xml =  "<root>";
			for(var i=0;i<result.rows.length;i+=1){
				xml+= "<m><i>" + result.rows[i].id + "</i>";
				xml+= "<t>" + result.rows[i].message + "</t></m>";
			}
			xml+= "</root>";
			response.send(xml);
		}
    });
  });
});
server.get('/db/setUpdates',function (request, response){
  response.header("Access-Control-Allow-Origin", "*");
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
	var uid = request.query.uid;
	var area = request.query.area;
	var message = request.query.message;
    client.query(' INSERT INTO messages ("user",area,message) VALUES ($1,$2,$3)',[uid,area,message], function(err, result) {
		done();
		if (err){
			console.error(err);
			response.send("Error " + err);
		}else{
			response.send("result"+result);
		}
    });
  });
});
*/
server.use('/html', express.static('html'));

