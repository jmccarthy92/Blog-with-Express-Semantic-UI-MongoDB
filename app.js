var bodyParser = require('body-parser')
    , methodOverride = require('method-override')
    , expressSanitizer = require('express-sanitizer')
    , mongoose = require('mongoose')
    , express = require('express')
    , app = express();
   
// All in one file wouldn't be good practice
// usually each config would have it's seperate file

   
// APP CONFIG
mongoose.connect("mongodb://localhost/restful_blog_app");
app.use(bodyParser.urlencoded({extended: true} ) );
app.set("view engine","ejs");
// anything with _method treat whatever is next to it as a put
// or delete request
app.use(methodOverride("_method"));
//makes sure no scripts can be run in a form that allows html
// such as the blog body 
app.use(expressSanitizer());
//so we can serve our custom stylesheet whe nwe need it
app.use(express.static("public"));




//MONGOOSE/MODEL CONFIG
var BlogSchema = new mongoose.Schema({
    title: String,
    // also for image we could do {type: String, default: "error.png"}
    image: String,
    body: String,
    // created should be a date and there shoudl a default value date.now
    created: {type: Date, default: Date.now }
});

var Blog = mongoose.model("Blog",BlogSchema);


//RESTFUL ROUTES

app.get("/", function(req,res){
    res.redirect("/blogs");
});

//INDEX ROUTE
app.get("/blogs", function(req,res){
    Blog.find({}, function(err, allBlogs){
        if(err)
            console.log(err);
        else
            res.render("index",{blogs: allBlogs});
    });
   
});


//NEW ROUTE
app.get("/blogs/new",function(req,res){
    res.render("new"); 
});

//CREATE ROUTE
app.post("/blogs", function(req,res){
    //create blog
    //because everything is inside of blog[]
    // it automatically has image ,title, and body
    
    //sanitizes any harmful scripts that might be in html written
    // in the create blog body
    req.body.blog.body = req.sanitize(req.body.blog.body); 
    
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        }
        else {
             //then, redirect to index
            res.redirect("/blogs");
        }
    });
   
});

// SHOW ROUTE
app.get("/blogs/:id", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err)
            res.redirect("/blogs");
        else 
            res.render("show",{blog: foundBlog});
    });
});

//EDIT ROUTE sort of a hybrid of show and new
app.get("/blogs/:id/edit", function(req,res){
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err)
            res.redirect("/blogs");
        else
            res.render("edit", {blog: foundBlog});
    })
})

//UPDATE ROUTE
app.put("/blogs/:id", function(req,res){
    
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
        if(err)
            res.redirect("/blogs");
        else
            res.redirect("/blogs/" + req.params.id);
    });
});
 
//DELETE ROUTE  delete route will delete than redirect you somewhere else (index)
app.delete("/blogs/:id", function(req,res){
    //destroy blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
            res.redirect("/blogs");
        } else {
            res.redirect("/blogs");
        } 
    })
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("SERVER RUNNING");
});
