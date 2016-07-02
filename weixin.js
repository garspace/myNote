// var port=9529;
// var http=require("http");
// var qs=require("qs");
var mongoose=require('mongoose')

// var TOKEN="sspku";
// function checkSignature(params,token){
// 	var key=[token,params.timestamp,params.noncel].sort().join(' ');
// 	var sha1=require("crypto").createHash("sha1");
// 	return sha1.digest("hex")==params.signature;
// }

// var server=http.createServer(function(request,response){
// 	var query=require("url").parse(request.url).query;
// 	var params=qs.parse(query);

// 	console.log(params);
// 	console.log("token-->",TOKEN);

// 	if (checkSignature(params,TOKEN)) {
// 		response.end(params.echostr);
// 	}else{
// 		response.end("signature failed")
// 	}
// });

// server.listen(port);
// console.log("server running at port:"+port+".");


var connection=mongoose.createConnection('mongodb://localhost:27017/test2',function(err){
	if(err){
		throw err;
	}
});
var Schema=mongoose.Schema;
var schema=new Schema({
	name:String,
	password:String
});
connection.model('uuu',schema);
var user=connection.model('uuu');
var u=new user({
	name:'dengjie3',
	password:'1234'
});
u.save(function(err,ret){
	if(err) throw err;
	console.log(ret);
});
user.find({},function(err,ret){
	if(err) throw err;
	console.log(ret);
	connection.close();
})
