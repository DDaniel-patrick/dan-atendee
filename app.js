//importing express module
const express= require('express');
//turning it to something usefool
const app= express();


//session
const sesseion = require('express-session');
// initializing my session
app.use(sesseion({secret:"Daniel1234567", saveUninitialized:true, resave:true}))

const port = process.env.PORT || 3000

// requiring our database
const mongoose = require('mongoose');
//connecting datbase
mongoose.connect("mongodb+srv://dan:test123@cluster0.cessj.mongodb.net/?retryWrites=true&w=majority",{useNewUrlParser:true,useUnifiedTopology:true}).then((result)=>{
    if (result){
        console.log("Your database is connected");

        // when db is connected then load our server                
        // creating our server 
        app.listen(port,()=>{
            console.log("http://localhost:3000/");
        });
    }
}).catch((error)=>{
    console.log(error);
})


//database models
const userLogin = require('./model/userlogin');//user login model

const additem =require('./model/addItem');//items model

const userHistory = require('./model/history')


//requiring bodyparser to read json easily
const bodyParser= require('body-parser');
// const req = require('express/lib/request');
// setting body parser 
app.use(bodyParser.urlencoded({extended:true}));


// setting up our views engine
app.set("view engine","ejs");


//setting up static folder
app.use(express.static('static'))


// home page
app.get("/",(req, res)=>{
    var sess = req.session;

    if(sess.usernameStrg){
        additem.find({userName:sess.usernameStrg}, (err,data)=>{
            if (err){
                console.log(err);
            }else {
                
                additem.find({userName:sess.usernameStrg},(err, data)=>{
                    if (err){
                        console.log(err);
                    }else{
                        res.render('home',{name: sess.usernameStrg, items:data});
                    }
                })
                
            }
        })
        
    }else{
        res.redirect("/login");
    }
})

// app.get("/clear", (req, res)=>){

// }
//login page
app.get("/login",(req,res)=>{
    res.render('login', {msg:""});
})
app.get("/home", (req, res)=>{
res.redirect("/");
})
//login post route
app.post("/login", (req,res)=>{
    var collect=req.body;
    var sess =req.session;
    if(collect.UserName==""|| collect.password==""){
        res.render("login",{msg:"please fill the complete form"})
    }else{
        userLogin.findOne({username: collect.UserName,password:collect.password}, (err, data)=>{
            if (err){
                console.log(err);
            }else{
                if (data){
                    sess.usernameStrg=collect.UserName;
                    console.log("successfully logged in");
                    res.redirect("/");
                }else{
                    res.render("login",{msg:"incorrect details"})
                }
            }
        })
    }
})


//register page
app.get("/register",(req,res)=>{
    res.render('register',{msg:""});
})

// register post route 
app.post("/register",(req,res)=>{
    const collect = req.body
    var newuser= new userLogin,
    sess= req.session;
    userLogin.findOne({username: collect.username}, (err, data)=>{
        if (err) {
            console.log(err);
        }else{
            if(collect.username==""|| collect.pass1==""|| collect.password==""){
                res.render('register', {msg:"please fill the complete form"});
            }else{
                if(data){
                // console.log("data");
                    res.render('register', {msg:"user already exist"});                
                }else{
                    newuser.username= collect.username;
                    newuser.pass1= collect.pass1;
                    newuser.password=collect.password;
                    newuser.save(function (err) {
                        if (err) {
                            console.log(err);
                        }else{
                            console.log("new user added");
                            sess.usernameStrg=collect.username;
                            sess.usernameStrg = collect.pass1;
                            res.redirect("/")
                            
                        }
                    })
                }
            }
            
        }
    })
})


//logout of the session
app.get("/logout", (req,res)=>{
    var sess= req.session;
    if (sess.usernameStrg) {
        sess.destroy((err)=>{
            if (err) {
                console.log(err);
            }else{
                res.redirect("/");
            }
        })
    }else{
        res.redirect("/");
    }
})





//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items//items


//additem page
app.get('/addItem', (req, res)=>{
    var sess= req.session;
    if (sess.usernameStrg) {
        res.render('addItem',{message:''})
    }else{
        res.redirect('/')
    }
})

app.post('/addItem',(req,res)=>{
    const sess= req.session;
    const collect= req.body;
    const newItem = new additem()
    var addhistory = new userHistory();
    var now= new Date()
    if (sess.usernameStrg) {
        if(collect.itemName==""||collect.attendName==""|| collect.dateTime==""){
            res.render('addItem', {message:"Complete Attendee Information."})
        }else{
            newItem.itemName= collect.itemName
            newItem.userName= sess.usernameStrg
            newItem.attendName =collect.attendName
            newItem.Date= collect.dateTime
            newItem.save((err)=>{
                if (err) {
                    console.log(err);
                }else{
                    addhistory.userName= sess.usernameStrg
                    addhistory.itemName = collect.itemName
                    addhistory.action = "Added Item"
                    addhistory.qauntityActed= collect.itemQuantity;
                    // addhistory.date = toString(now.getDate)+"-"+toString(now.getMonth)+"-"+toString(now.getFullYear)+"--"+toString(now.getHours)+":"+toString(now.getMinutes);
                    addhistory.save((err)=>{
                                        if (err){
                                            console.log(err);
                                        }else{
                                            res.redirect("/")
                                        }
                    })
                }
            })
        }
    }else{
        res.redirect("/")
    }
})

//deleteitem route
app.get('/delete/:ids',(req,res)=>{
    const routing= req.params.ids;
    var sess =req.session;
    var addhistory = new userHistory();
    var now= new Date()
    if(sess.usernameStrg){
        additem.findOne({_id:routing, userName:sess.usernameStrg},(err,data)=>{
            if (err){
                console.log(err);
            }else{
                if (data) {
                    
                    additem.remove({_id:routing, userName:sess.usernameStrg},(err)=>{
                        if (err) {
                            console.log(err);
                        }else{
                            console.log("deleted");
                            // res.redirect("/")
                        }
                    })
                    addhistory.userName= sess.usernameStrg
                    addhistory.itemName = data.itemName
                    addhistory.action = "deleted"
                    addhistory.qauntityActed= data.quantity;
                    // addhistory.date = toString(now.getDate)+"-"+toString(now.getMonth)+"-"+toString(now.getFullYear)+"--"+toString(now.getHours)+":"+toString(now.getMinutes);
                    addhistory.save((err)=>{
                                        if (err){
                                            console.log(err);
                                        }else{
                                            res.redirect("/")
                                        }
                    })
                }else{
                    res.redirect("/unkown")
                }
            }
        })
        
    }else{
        res.redirect("/")
    }
    // console.log(routing);
})

//add quantity
app.get('/add/:ids', (req,res)=>{
    var sess =req.session;
    var routing = req.params.ids
    var addhistory = new userHistory();
    var now= new Date()
    if (sess.usernameStrg) {
        additem.findOne({_id:routing, userName:sess.usernameStrg}, (err, data) => {
            //i stopped here
            if (err) {
                console.log(err);
            }else{
                if (data) {
                    // console.log(data.quantity);
                    var quantityadd= data.quantity + 1;
                    additem.updateOne({_id:routing, userName:sess.usernameStrg},{quantity:quantityadd}, (err)=>{
                        if (err) {
                            console.log(err);
                        }else{
                            
                                    
                                
                            
                            // res.redirect("/");
                        }
                    })
                    addhistory.userName= sess.usernameStrg
                    addhistory.itemName = data.itemName
                    addhistory.action = "increased"
                    addhistory.qauntityActed= 1;
                    // addhistory.date = toString(now.getDate)+"-"+toString(now.getMonth)+"-"+toString(now.getFullYear)+"--"+toString(now.getHours)+":"+toString(now.getMinutes);
                    addhistory.save((err)=>{
                                        if (err){
                                            console.log(err);
                                        }else{
                                            res.redirect("/")
                                        }
                    })
                }else{
                    res.redirect("/unkownuseredit");
                }
            }
        })
    } else {
        res.redirect("/")
    }
})

//subtract quantity
app.get('/minus/:ids',(req,res)=>{
    var idNem= req.params.ids;
    var sess= req.session;
    var addhistory = new userHistory();
    var now= new Date()
    if (sess.usernameStrg){
        additem.findOne({_id:idNem, userName:sess.usernameStrg},(err, data)=>{
            if (err) {
                console.log(err);
            }else{
                if (data) {
                    if (data.quantity<1) {
                        res.redirect("/")
                        // window.alert("empty")
                    }else{
                        var minusdata= data.quantity - 1
                        
                        
                        additem.updateOne({_id:idNem, userName:sess.usernameStrg}, {quantity:minusdata},(err)=>{
                            if(err){
                                console.log(err);
                            }else{
                                addhistory.userName= sess.usernameStrg
                                addhistory.itemName = data.itemName
                                addhistory.action = "removed"
                                addhistory.qauntityActed= 1;
                                // addhistory.date = now.getDate+"-"+toString(now.getMonth)+"-"+toString(now.getFullYear)+"--"+toString(now.getHours)+":"+toString(now.getMinutes);
                                addhistory.save((err)=>{
                                    if (err){
                                        console.log(err);
                                    }else{
                                        res.redirect("/")
                                    }
                                })
                                // res.jsonp({success:true})
                               
                            }
                        })

                    }
                    // console.log();
                }else{
                    res.redirect('/unknowndata')
                }
            }
        })
    }else{
        res.redirect('/uknown')
    }
})



app.get("/clear_history",(req,res)=>{
    const sess = req.session;
    if (sess.usernameStrg) {
        userLogin.findOne({username:sess.usernameStrg},(err,data)=>{
            if (err) {
                console.log(err);
            } else {
                if (data) {
                additem.deleteMany({userName:sess.usernameStrg},(err)=>{
                    if (err) {
                        console.log(err);
                    }else{
                        res.redirect('/')
                    }
                })
                } else {
                    res.redirect('/lost')
                }
            }
        })
    } else {
        res.redirect('/')
    }
})




// 404 page 
app.use((req,res)=>{
    res.status(404).render('404')
})
