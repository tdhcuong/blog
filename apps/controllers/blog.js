var express = require("express");
var router = express.Router();
var post_md = require("../models/post");

router.get("/", function(req, res){
    var data = post_md.getAllPosts();
    data.then(function(posts){
        var data = {
            posts : posts,
            error : false
        };
        res.render("blog/index", {data : data});
    }).catch(function(err){
        res.render("blog/index", {data : {error : "Can't get post! " + err}});
    });
});

router.get("/post/:id", function(req, res){
    var data = post_md.getPostById(req.params.id);
    data.then(function(posts){
       var post = posts[0];
       var data = {
           post : post,
           error: false
       };
       res.render("blog/post", {data : data});
    }).catch(function(err){
        res.render("blog/post", {data : {error : "Can't get post detail! " + err}});
    });
});

router.get("/about", function(req, res){
    res.render("blog/about");
});

module.exports = router;