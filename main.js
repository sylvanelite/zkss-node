'use strict';

const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT =  process.env.PORT || 8080;
const INDEX = path.join(__dirname, './index.html');
// define routes and socket
const server = express();

server.use(express.urlencoded({extended:true}));

let requestHandler = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));

const { Pool } = require('pg');

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: true
});


pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
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
		pool.connect().then(function(client){
			return client.query(' SELECT key FROM api WHERE (key=$1) AND writeable=true ',[api])
			.then(function(result){
					client.release();
					if(result.rows&&
					   result.rows.length>0&&
					   result.rows[0] &&
					   result.rows[0].key == api.toUpperCase()){
						pool.connect().then(function(client2){
						return client2.query('  INSERT INTO documents (name, content) '+
						' VALUES ($1, $2) ON CONFLICT (name) DO UPDATE '+
						' SET content=$2 WHERE documents.name=$1',[k,v])
							.then(function(result2){
								client.release();
								responseObj.success=true;
								responseObj.data="success";
								response.send(JSON.stringify(responseObj));
							}).catch(function(err){
								console.error(err);
								client2.release();
								responseObj.success=false;
								responseObj.data="Error Doc store";
								response.send(JSON.stringify(responseObj));
							});
						}).catch(function(err){
							console.error(err);
							client.release();
							responseObj.success=false;
							responseObj.data="Error connecting to Doc store";
							response.send(JSON.stringify(responseObj));
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
				});
		}).catch(function(err){
			console.log(err);
			responseObj.success=false;
			responseObj.data="Error Connecting to DB";
			response.send(JSON.stringify(responseObj));
		});
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
		pool.connect().then(function(client){
			return client.query(' SELECT key FROM api WHERE (key=$1) ',[api])
			.then(function(result){
				client.release();
			  if(result.rows&&
				 result.rows.length>0&&
				 result.rows[0] &&
				  result.rows[0].key == api.toUpperCase()){
				pool.connect().then(function(client2){
					return client2.query('  SELECT name, content FROM documents '+
										  ' WHERE  name=$1 ',[k])
							.then(function(result2){
											 client2.release();
								
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
							});
						}).catch(function(err){
						console.error(err);
						responseObj.success=false;
						responseObj.data="Error document store connect";
					  response.send(JSON.stringify(responseObj));
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
		  });
		}).catch(function(err){
			console.log(err);
			responseObj.success=false;
			responseObj.data="Error Connecting to DB";
			response.send(JSON.stringify(responseObj));
		});
	}
});

//anything in /html/<project>/node/<file>.js is loaded and then run
server.use('/html/*/node', function(req, res, next){
	//check the requested file exists
  var file = req.url;
  fs.stat(file, function(err, stats) {
    if (err || !stats.isFile()) {
      res.writeHead(404);
      res.send();
      return;
    }

    fs.readFile(file, function(err, data) {
      res.writeHead(200);
			
			//TODO: eval data??
			
      res.send(data);
    });
  });
	res.send("hello node");
});



//anything in /html is served as a static file
server.use('/html', express.static('html'));
