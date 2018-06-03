let express = require("express");
let router = express.Router();
let Campground = require("../models/campground");

router.get("/", function(req,res){
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    })
})

router.get("/new", isLoggedIn, function(req,res){
    res.render("campgrounds/new");
})

router.get("/:id", function(req,res){
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err) {
            console.log(err);
        } else {
            console.log(foundCampground)
            res.render("campgrounds/show", {campground:foundCampground});
        }
    })
})

router.post("/", isLoggedIn, function(req,res){
    let name = req.body.name;
    let image = req.body.image;
    let description = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    let newCampground = {name: name, image: image, description: description, author: author}
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        }else {
            console.log(newlyCreated)
                res.redirect("/campgrounds");
        }
    })
})

router.get("/:id/edit", checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function (err, foundCampground) {
        if(err) {
            res.redirect("/campgrounds")
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    })
})

router.put("/:id", checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
        if(err) {
            res.redirect("/campgrounds");
        }else {
            res.redirect("/campgrounds/" + req.params.id)
        }
    })
})

router.delete("/:id", checkCampgroundOwnership, function (req, res) {
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if(err) {
            res.redirect("/campgrounds")
        }else {
            res.redirect("/campgrounds");
        }
    })
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

function checkCampgroundOwnership(req, res, next) {
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                res.redirect("back");
            } else {
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                }else {
                    res.redirect("back")
                }
            }
        })
    } else {
        res.redirect("back")
    }
}

module.exports = router;