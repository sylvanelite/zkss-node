'use strict';

const express = require('express');
const path = require('path');

const PORT =  process.env.PORT || 8080;
const INDEX = path.join(__dirname, './index.html');
// define routes and socket
const server = express();

server.use(express.urlencoded({extended:true}));

let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

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
		client.connect();
		client.query(' SELECT key FROM api WHERE (key=$1) AND writeable=true ',[api])
		.then(function(result){
				if(result.rows&&
					 result.rows.length>0&&
					 result.rows[0] &&
					 result.rows[0].key == api.toUpperCase()){
					let client2 = new Client({
						connectionString: process.env.DATABASE_URL,
						ssl: {
							rejectUnauthorized: false
						}
					});
					client2.query('  INSERT INTO documents (name, content) '+
					' VALUES ($1, $2) ON CONFLICT (name) DO UPDATE '+
					' SET content=$2 WHERE documents.name=$1',[k,v])
						.then(function(result2){
							responseObj.success=true;
							responseObj.data="success";
							response.send(JSON.stringify(responseObj));
						}).catch(function(err){
							console.error(err);
							responseObj.success=false;
							responseObj.data="Error Doc store";
							response.send(JSON.stringify(responseObj));
						}).then(function(){
							client2.end();
						});
				}else{
					responseObj.success=false;
					responseObj.data="Error API Key";
					response.send(JSON.stringify(responseObj));
				}
			}).catch(function(err) {
				console.log(err);
				client.release();
				responseObj.success=false;
				responseObj.data="Error API lookup";
				response.send(JSON.stringify(responseObj));
			})
		.then(function(){client.end();});
	}
});
server.get('/db/doc_get',function  (request, response) {
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
		var k = request.query.data_key;
		var api = request.query.api;
		client.query(' SELECT key FROM api WHERE (key=$1) ',[api])
			.then(function(result){
			  if(result.rows&&
				 result.rows.length>0&&
				 result.rows[0] &&
				  result.rows[0].key == api.toUpperCase()){
					let client2 = new Client({
						connectionString: process.env.DATABASE_URL,
						ssl: {
							rejectUnauthorized: false
						}
					});
					client2.query('  SELECT name, content FROM documents '+
										  ' WHERE  name=$1 ',[k])
							.then(function(result2){
								if(result2.rows&&
								result2.rows.length>0&&
								result2.rows[0] ){
										 responseObj.success=true;
										 responseObj.data=result2.rows[0].content;
										 response.send(JSON.stringify(responseObj));
								}else{
										 responseObj.success=false;
										 responseObj.data="no document found";
										 response.send(JSON.stringify(responseObj));
								}
						}).catch(function(err){
							console.error(err);
							responseObj.success=false;
							responseObj.data="Error document store retreival";
						response.send(JSON.stringify(responseObj));
						}).then(function(){
								client2.end();
								});
			  }else{
				  responseObj.success=false;
				  responseObj.data="Error API Key";
					response.send(JSON.stringify(responseObj));
			  }
		  }).catch(function(err) {
			  console.log(err);
			  responseObj.success=false;
			  responseObj.data="Error API lookup";
			  response.send(JSON.stringify(responseObj));
		  }).then(function(){ client.end(); });
	}
});

//anything in /html/<project>/node/<file>.js is loaded and then run
server.use('/html/*/node', function(request, response){
	//check the requested file exists
	
	console.log("starting client");
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
	console.log("connecting client");

client.connect();

	console.log("query client");
client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
	console.log("callback client");
  if (err) throw err;
  for (let row of res.rows) {
    console.log(JSON.stringify(row));
  }
	console.log("end client");
  client.end();
});
	console.log("query client done");
	
	/*
	
	try{
		let pth = "./html/zkss-au/node/getmessage.mjs";//TODO: remove this, request.path??
		import(pth).then(function(js){
			js.default(request,response,client);
		});
	}catch(e){
			response.send("err: "+e);
	}*/
});



//anything in /html is served as a static file
server.use('/html', express.static('html'));
