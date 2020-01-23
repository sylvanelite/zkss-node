'use strict';

const express = require('express');
const path = require('path');

const PORT =  process.env.PORT || 8080;
const INDEX = path.join(__dirname, './index.html');
// define routes and socket
const server = express();
server.get('/', function(req, res) { res.sendFile(INDEX); });
server.use('/', express.static(path.join(__dirname, '.')));
server.use(express.urlencoded());

let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const { Client } = require('pg');
server.post('/db/doc_set',function (request, response){
	response.header("Access-Control-Allow-Origin", "*");
	var responseObj = {
		success:false,
		data:{}
	};
	if(!request.body||
	   !request.body.hasOwnProperty("data_key")||
	   !request.body.hasOwnProperty("data_value")||
	   !request.body.hasOwnProperty("api")){
		responseObj.success=false;
		responseObj.data="Error params";
		response.send(JSON.stringify(responseObj));
	}else{
		var k = request.body.data_key;
		var v = request.body.data_value;
		var api = request.body.api;
		const client = new Client({
		  connectionString: process.env.DATABASE_URL,
		  ssl: true,
		});
		client.connect();
		client.query(' SELECT key FROM api WHERE (key=$1) AND writeable=true ',[api], function(err, result) {
			if (err) {
				console.error(err);
				client.end();
				responseObj.success=false;
				responseObj.data="Error API lookup";
				response.send(JSON.stringify(responseObj));
			}else{
				if(result.rows&&
				   result.rows.length>0&&
				   result.rows[0] &&
				   result.rows[0].key == api.toUpperCase()){
					client.query('  INSERT INTO documents (name, content) '+
					' VALUES ($1, $2) ON CONFLICT (name) DO UPDATE '+
					' SET content=$2 WHERE documents.name=$1',[k,v], function(err, res) {
						if (err){
							console.error(err);
							client.end();
							responseObj.success=false;
							responseObj.data="Error Doc store";
							response.send(JSON.stringify(responseObj));
						}else{
							client.end();
							responseObj.success=true;
							responseObj.data="success";
							response.send(JSON.stringify(responseObj));
						}
					});
				}else{
					client.end();
					responseObj.success=false;
					responseObj.data="Error API Key";
					response.send(JSON.stringify(responseObj));
				}
			}
		});
	}
});
server.get('/db/doc_get',function (request, response){
	response.header("Access-Control-Allow-Origin", "*");
	var responseObj = {
		success:false,
		data:{}
	};
	if(!request.query||
	   !request.query.hasOwnProperty("data_key")||
	   !request.query.hasOwnProperty("api")){
		responseObj.success=false;
		responseObj.data="Error params";
		response.send(JSON.stringify(responseObj));
	}else{
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
				responseObj.success=false;
				responseObj.data="Error API lookup";
				response.send(JSON.stringify(responseObj));
			}else{
				if(result.rows&&
				   result.rows.length>0&&
				   result.rows[0] &&
					result.rows[0].key == api.toUpperCase()){
					client.query('  SELECT name, content FROM documents '+
					' WHERE  name=$1 ',[k], function(err, res) {
					if (err){
						console.error(err);
						client.end();
						responseObj.success=false;
						responseObj.data="Error document store";
						response.send(JSON.stringify(responseObj));
					}else{
						client.end();
						responseObj.success=true;
						responseObj.data=res.rows[0].content;
						response.send(JSON.stringify(responseObj));
					}
					});
				}else{
					client.end();
					responseObj.success=false;
					responseObj.data="Error API Key";
					response.send(JSON.stringify(responseObj));
				}
			}
		});
	}
});

server.use('/html', express.static('html'));

