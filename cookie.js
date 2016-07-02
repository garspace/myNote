var express=require('express');
var cookieParser=require('cookie-parser');

var app=express();
app.use(cookieParser());

app.get('/write',function(req,res,next){
	res.json(req.cookies);
	//res.cookie('myCookie',);
});

app.get('/write',function(req,res,next){
	res.cookie("my_cookie","hello",{domain:'localhost'});
	res.json(req.cookies);
});

app.listen(3000);
console.log('server running at port:3000');