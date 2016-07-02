var express=require("express");
var path=require("path");
var bodyParser=require("body-parser");
var crypto=require("crypto");
var app=express();
var session=require("express-session");
var moment=require("moment"); 	//改变GMT格式日期为日常格式

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//引入mongoose
var mongoose=require("mongoose");
var model=require("./model/model");
var User=model.User;
var Note=model.Note;
//使用mongoose连接服务
mongoose.connect("mongodb://localhost:27017/note");
mongoose.connection.on("error",console.error.bind(console,"连接数据库失败！"));

//建立session模型
app.use(session({
    secret:'1234',
    name:'mynote',
    resave:false,
    cookie:{maxAge:1000*60*20},//设置cookie的保存时间为20分钟
    saveUninitialized:true
}));
app.get("/",function(req,res){
    res.render("index",{
        user:req.session.user,
        title:"首页"});
});

//注册
app.get("/register",function(req,res){
    console.log("注册");
    res.render("register",{
        user:req.session.user,
        title:"注册",
        error:""
    });
});
app.post("/register",function(req,res){
    console.log("注册");
    //req.body可以获取表单数据
    var username=req.body.username;
    var password=req.body.password;
    var passwordRepeat=req.body.passwordRepeat;
    if(username.trim().length==0){
        console.log("用户名不能为空！");
        return res.redirect("/register");
    }
    if(password.trim().length==0 || passwordRepeat.trim().length==0){
        console.log("密码不能为空！");
        return res.redirect("/register");
    }
    if(password.trim()!=passwordRepeat.trim()){
        console.log("两次输入的密码不一致！");
        return res.redirect("/register");
    }
    //检查用户是否存在
    User.findOne({username:username},function(error,user){
        if (error){
            console.log(error);
            res.redirect("/register");
        }
        if (user){
            console.log("用户名已存在！");
            res.redirect("/register");
        }
              //对密码进行md5加密
        var md5=crypto.createHash("md5");
        md5password=md5.update(password).digest("hex");

        //新建user对象用于保存数据
        var newUser=new User({
            username:username,
            password:md5password
        });
        newUser.save(function(err,doc){
            if(err){
                console.log(err);
                return res.redirect("/register")
            }
            console.log("注册成功");
          // res.setHeader(name, value)
           // return res.render("index",{title:"注册"});
        });

    })
    res.render("index",{
        user:req.session.user,
        title:"注册",
        error:""
    });
});

//登录
app.get("/login",function(req,res){
    console.log("登录");
    res.render("login",{
        user:req.session.user,
        title:"登录"});
});
app.post("/login",function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    console.log("登录");
    User.findOne({username:username},function(err,user){
        if (err){
            console.log(error);
            res.redirect("/login");
        }
        if (!user){
            console.log("用户不存在！");
            res.redirect("/login");
        }
        //对密码进行md5加密
        var md5=crypto.createHash("md5");
        md5password=md5.update(password).digest("hex");
        if(user.password!=md5password){
            console.log("用户密码错误！");
            res.redirect("/login");
        }
        console.log("登录成功");
        user.password=null;
        delete user.password;
        req.session.user=user;
        res.redirect("/");
    });
    //res.render("login",{title:"登录"});
});

//发表
app.get("/post",function(request,response){
    console.log("发表");
    response.render("post",{
        title:"发表",
        user:request.session.user
    });
});
app.post("/post",function(req,res){
    var note=new Note({
        title:req.body.title,
        author:req.session.user.username,
        tag:req.body.tag,
        content:req.body.content
    });
    note.save(function(err,doc){
        if(err){
            console.log(err);
            return res.redirect("/post");
        }
        console.log("文章发表成功！");
        return res.redirect("/");
    });
});

//查看笔记列表
app.get("/noteList",function(req,res){
	console.log("查看笔记列表");
	console.log(req.session.user.username);
	 Note.find({"author":req.session.user.username}).exec(function(err,allNotes){
        if(err){
            console.log(err);
            return res.redirect("/");
        }
        console.log(allNotes);
        req.session.notes=allNotes;
        res.render("noteList",{
            title:"查看笔记列表",
            notes:allNotes,
            user:req.session.user
        });
    });
//	res.render("noteList",{title:"查看笔记列表",user:req.session.user,noteSet:req.session.notes});
	
});
// app.post("/noteList",function(req,res){
	
// });
//退出
app.get("/logout",function(req,res){
    console.log("退出");
    req.session.user=null;res.render("login",{title:"登录",user:req.session.user
    });
   // res.redirection("/login");
});

//发布
app.get("/post",function(req,res){
    console.log("发布");
    res.render("post",{title:"发布"});
});

//笔记详情
app.get("/detail/:_id",function(req,res){
    console.log("笔记详情");
    Note.findOne({_id:req.params._id}).exec(function(err,art) {
    	if(err){
    		console.log(err);
    		return res.redirect("/");
    	}
    	if(art){
    		res.render("detail",{
    			title:"笔记详情",
    			user:req.session.user,
    			art:art,
    			moment:moment
    		});
    	}
    });
   // res.render("detail",{title:"笔记详情"});
});

app.listen(3000,function(req,res){
    console.log("app is running at port 3000 ！");
})