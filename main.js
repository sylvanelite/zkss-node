'use strict';

const express = require('express');
const path = require('path');

const PORT =  process.env.PORT || 8080;
const INDEX = path.join(__dirname, './index.html');
// define routes and socket
const server = express();
const fs = require('fs');

server.use(express.urlencoded({extended:true}));

let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const { Client } = require('pg');
const dbConfig = {
  connectionString: process.env.HEROKU_POSTGRESQL_BLACK_URL,
  connectionTimeoutMillis:5000,
  ssl: {
    rejectUnauthorized: false
  }
};

//https://stackoverflow.com/questions/61403073/heroku-postgres-node-connection-timeout
const client = new Client(dbConfig);

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
					let client2 = new Client(dbConfig);
					client2.query('  INSERT INTO documents (name, content) '+
					' VALUES ($1, $2) ON CONFLICT (name) DO UPDATE '+
					' SET content=$2 WHERE documents.name=$1',[k,v])
						.then(function(/*result2*/){
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
		client.connect();
		client.query(' SELECT key FROM api WHERE (key=$1) ',[api])
			.then(function(result){
			  if(result.rows&&
				 result.rows.length>0&&
				 result.rows[0] &&
				  result.rows[0].key == api.toUpperCase()){
					let client2 = new Client(dbConfig);
          client2.connect();
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
	try{
		let pth = "."+request.baseUrl+"/"+request.path;
    fs.access(pth, fs.F_OK, function(err) {
      if (err) {
			response.send("err: "+err);
        return;
      }
      import(pth).then(function(js){
        js.default(request,response,client);
      });
    });
	}catch(e){
			response.send("err: "+e);
	}
});



//anything in /html is served as a static file
server.use('/html', express.static('html'));
