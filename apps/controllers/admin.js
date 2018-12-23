var express = require("express");
var router = express.Router();
var user_md = require("../models/user");
var post_md = require("../models/post")
var helper = require("../helpers/helper");

router.get("/", function(req, res){
    if(req.session.user){
        var data = post_md.getAllPosts();
        data.then(function(posts){
            var data = {
                posts : posts,
                error : false
            };
            res.render("admin/dashboard",{data: data});
        }).catch(function(err){
            res.render("admin/dashboard",{data: {error : "Fail to get posts!"}});
        });
    } else {
        res.redirect("/admin/signin");
    }
   
});

router.get("/signin", function(req, res){
    res.render("signin", {data : {}});
});

router.post("/signin", function(req, res){
    var params = req.body;

    if(params.email.trim().length == 0){
        res.render("signin", {data : {error: "Please enter email!"}});
    } else {
    var data = user_md.getUserByEmail(params.email);
    data.then(function(users){
        if(users && users.length){
            user = users[0];
            var status = helper.compare_password(params.password, user.password);
            if(!status){
                res.render("signin", {data : {error: "Wrong password!"}});
            } else {
                req.session.user = user;
                res.redirect("/admin");
            }
        } else {
            res.render("signin", {data : {error: "The user doesn't exist"}});
        }
    });     
   }

});

router.get("/signup", function(req, res){
    res.render("signup", {data : {}});
});
router.post("/signup", function(req, res){
   var user = req.body;
  
   if(user.email.trim().length == 0){
        res.render("signup", {data : {error: "Email is required"}});
   }

   if(user.passwd.trim().length == 0){
        res.render("signup", {data : {error: "Password is required"}});
   }

   if(user.passwd != user.repasswd && user.passwd.trim().length != 0){
        res.render("signup", {data : {error: "Password is not match"}});
   }

   var encrypt_password = helper.hash_password(user.passwd);
   user = {
       email: user.email,
       password: encrypt_password,
       first_name: user.firstname,
       last_name: user.lastname
   };

   var result = user_md.addUser(user);
   result.then(function(data){
        res.redirect("/admin/signin");
   }).catch(function(err){
        res.render("signup", {data : {error: err}});
   });
});

router.get("/post/new", function(req, res){
    if(req.session.user){
        res.render("admin/post/new", {data: {error: false}});
    } else {
        res.redirect("/admin/signin");
    }
});

router.post("/post/new", function(req, res){
    var params = req.body;

    if(params.title.trim().length == 0){
        var data = {
            error : "Please enter a title!"
        };
        res.render("admin/post/new", {data: data});
    } else {
        var now = new Date();
        params.created_at = now;
        params.update_at = now;

        var data = post_md.addPost(params);
        data.then(function(result){
            res.redirect("/admin");
        }).catch(function(error){
            var data = {
                error: "Could not insert into database!"
            };
            res.render("admin/post/new", {data: data});
        });
    }
});

router.get("/post/edit/:id",function(req, res){
    if(req.session.user){
        var id = req.params.id;
        var data = post_md.getPostById(id);

        if(data){
            data.then(function(posts){
                var post = posts[0];
                data = {
                    post: post,
                    error: false
                };
                res.render("admin/post/edit", {data : data});
            }).catch(function(err){
                data = {
                    error: "Cannot get post by ID! " + err
                };
                res.render("admin/post/edit", {data : data});
            });
        } else {
            data = {
                error: "Cannot get post by ID!"
            };
            res.render("admin/post/edit", {data : data});
        }
    } else {
        res.redirect("/admin/signin");
    }
})

router.put("/post/edit", function(req, res){
    var params = req.body;
    var data = post_md.updatePost(params);
    
    if(!data){
        res.json({status_code: 500});
    } else {
        data.then(function(result){
            res.json({status_code: 200});
        }).catch(function(err){
            res.json({status_code: 500});
        })
    }
});

router.delete("/post/delete", function(req, res){
    var post_id = req.body.id;
    var data = post_md.deletePost(post_id);
    if(!data){
        res.json({status_code: 500});
    } else {
        data.then(function(result){
            res.json({status_code: 200});
        }).catch(function(err){
            res.json({status_code: 500});
        })
    }
});

router.get("/post", function(req, res){
    res.redirect("/admin");
});

router.get("/user", function(req, res){
    if(req.session.user){
        var data = user_md.getAllUsers();
        if(data){
            data.then(function(users){
                var data = {
                    users : users,
                    error : false
                };
                res.render("admin/user", {data : data});
            }).catch(function(err){
                res.render("admin/user", {data : {error: "Can't get all users"}});
            });
        } else{
            res.redirect("admin/user", {data: {error: "Can't get all users"}});
        }
    } else {
        res.redirect("/admin/signin");
    }
})

module.exports = router;