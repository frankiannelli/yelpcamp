let express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose")
    Campground = require("./models/campground")

mongoose.connect("mongodb://localhost/yelp_camp");

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

app.listen(3000, function(){
    console.log("yelpcamp server started")
})

app.get("/", function(req,res){
    res.render("landing");
})

app.get("/campgrounds", function(req,res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("index", {campgrounds:allCampgrounds});
        }
    })
})

app.get("/campgrounds/new", function(req,res){
    res.render("new");
})

app.get("/campgrounds/:id", function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err) {
            console.log(err);
        } else {
            res.render("show", {campground:foundCampground});
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