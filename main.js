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
/*



client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
  client.end();
});
*/
const { Client } = require('pg');
server.get('/db/doc_set',function (request, response){
	response.header("Access-Control-Allow-Origin", "*");
	const client = new Client({
	  connectionString: process.env.DATABASE_URL,
	  ssl: true,
	});
	var k = request.query.data_key;
	var v = request.query.data_value;
	var api = request.query.api;
	client.connect();
    client.query(' SELECT key FROM api WHERE (key=$1) AND writeable=true ',[api], function(err, result) {
		if (err) {
			console.error(err);
			client.end();
			response.send("Error " + err);
		}else{
			if(result.rows[0].key == api.toUpperCase()){
				client.query('  INSERT INTO documents (name, content) '+
				' VALUES ($1, $2) ON CONFLICT (name) DO UPDATE '+
				' SET  name=$1, content=$2 ',[k,v], function(err, result) {
				if (err){
					console.error(err);
					client.end();
					response.send("Error " + err);
				}else{
					client.end();
					response.send("result"+result);
				}
				});
			}else{
				client.end();
				response.send("Error API Key");
			}
		}
	});
});
server.get('/db/doc_get',function (request, response){
	response.header("Access-Control-Allow-Origin", "*");
	const client = new Client({
	  connectionString: process.env.DATABASE_URL,
	  ssl: true,
	});
	var k = request.query.data_key;
	var api = request.query.api;
	client.connect();
    client.query(' SELECT key FROM api WHERE (key=$1) ',[api], function(err, result) {
		if (err) {
			console.error(err);
			client.end();
			response.send("Error " + err);
		}else{
			if(result.rows[0].key == api.toUpperCase()){
				client.query('  SELECT (name, content) FROM documents '+
				' WHERE  name=$1 ',[k], function(err, result) {
				if (err){
					console.error(err);
					client.end();
					response.send("Error " + err);
				}else{
					client.end();
					response.send(result.rows[0]);
				}
				});
			}else{
				client.end();
				response.send("Error API Key");
			}
		}
	});
});

server.use('/html', express.static('html'));

