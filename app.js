let express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment"),
    seedDB = require("./seeds"),
    User = require("./models/user")

seedDB();
mongoose.connect("mongodb://localhost/yelp_camp");

//passport setup
app.use(require("express-session")({
    secret: "rusty is the best dog",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    next();
})

// Campground.create(
//     {
//         name: "salmon33 creek",
//         image: "http://www.photosforclass.com/download/pixabay-3414020?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2Fea31b00b28f6013ed1584d05fb1d4e97e07ee3d21cac104497f7c378afebb4bb_960.jpg&user=davidraynisley",
//         description: "a great camp ground"
    
//     }, function(err, campground) {
//         if(err){
//             console.log(err);
//         } else {
//             console.log("newly created campground");
//             console.log(campground);
//         }
//     })

app.use(bodyParser.urlencoded({extended: true}))

app.set("view engine", "ejs")
app.use(express.static(__dirname + "/public"))

app.get("/", function(req,res){
    res.render("landing");
})

app.get("/campgrounds", function(req,res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    })
})

app.get("/campgrounds/new", function(req,res){
    res.render("campgrounds/new");
})

app.get("/campgrounds/:id", function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err) {
            console.log(err);
        } else {
            console.log(foundCampground)
            res.render("campgrounds/show", {campground:foundCampground});
        }
    })
})

app.post("/campgrounds", function(req,res){
    let name = req.body.name;
    let image = req.body.image;
    let description = req.body.description;
    let newCampground = {name: name, image: image, description: description}
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else {
                res.redirect("/campgrounds");
        }
    })
})

app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground) {
    if (err){
        console.log(err);
    } else {
        res.render("comments/new", {campground: campground});
    }
})
})

app.post("/campgrounds/:id/comments", isLoggedIn, function(req,res){
    Campground.findById(req.params.id, function(err, campground){
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else {
            Comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else {
                    campground.comments.push(comment)
                    campground.save()
                    res.redirect('/campgrounds/' + campground._id)
                }
            })
        }
    })
})

app.get("/register", function(req, res){
    res.render("register");
})

app.post("/register", function(req, res){
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register")
        }
        passport.authenticate("local")(req, res, function() {
            res.redirect("/campgrounds");
        })
    })
})

//login routes

app.get("/login", function(req, res){
    res.render("login")
})

app.post("/login", passport.authenticate("local",
    {
        successRedirect: "/campgrounds",
        failureRedirect: "/login"
    }), function(req, res){

    })

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/campgrounds");
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function(){
    console.log("yelpcamp server started")
})