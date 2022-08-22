app.get("/clear", (req, res)=>){
   res.render('home')
 }

//login page

app.get("/login",(req,res)=>{

    res.render('login', {msg:""});

})

app.get("/home", (req, res)=>{

res.redirect("/");

})

app.get("/Faq", (req, res)=>){

   res.render('faq')

 }


app.get("/view", (req, res)=>){

   res.render('about')

}
app.get("/contact", (req, res)=>){

   res.render('contact')

}

