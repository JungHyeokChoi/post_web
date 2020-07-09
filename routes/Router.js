var express = require('express')
var router = express.Router()
var User = require('../models/User.js')
var Noticeboard = require('../models/Noticeboard.js')
var moment = require('moment')
var queryUtil = require('../utils/util')

moment.locale('ko')

    function loggedInOnly(req, res, next){
    if(req.isAuthenticated()) next()
    else res.redirect('/login')
} 

function loggedOutOnly(req, res, next){
    if(req.isUnauthenticated()) next()
    else res.redirect('/')
} 

function authenticate(passport){
    router.use((req, res, next) => {
        res.locals.currentUser = req.user
        // console.log(res.locals.currentUser)
        res.locals.errors = req.flash("error");
        res.locals.infos = req.flash("info");
        next()
    })

    router.route('/')
    .get((req, res, next) => {
        res.render('index')
    })

    router.route('/signup')
        .get(loggedOutOnly, (req, res) =>{
            res.render('signup', {message : "true"})
        })
        .post((req, res ,next) => {
            var username = req.body.username
            var password = req.body.password
            var email = req.body.email

            User.findOne({username : username} , (err, user) => {
                if(err) { return next(err) }
                if(user) { return res.render('signup',  {message:"false", data:user.username}) }                 
                 
                User.create({ username, email, password  })
                .then(user => {
                    req.login(user , err => {
                        if(err) next(err)
                        else res.redirect('/main')
                    })
                })
                .catch(err=> {
                    console.log(err)
                    if(err.name == "ValidationError") {
                        res.redirect("/signup")
                    } else next(err);
                })   
            })
        })

    router.route('/login')
        .get(loggedOutOnly, (req, res) => {
            res.render('login')
        })
        .post(
            passport.authenticate("local", {
                successRedirect : "/main",
                failureRedirect : "/login",
                failureFlash : true    
            })
        )

    router.route('/main')
        .get(loggedInOnly, async(req, res) => {
            await Noticeboard.find((err, result) => {
                if(err) { console.log(err) }

                res.render('main', {data:result, moment })
            }).sort({"title" : 1})
        })
        .post(loggedInOnly, (req ,res) => {
            var search = req.body.search
            // //All keys search
            // var allKeys = Noticeboard.findOne()
            // var keys = []
            // for (key in allKeys.schema.obj) keys.push(key)

            Noticeboard.find({ 'title' : search }, (err, result) =>{
                if(err) { console.log(err) }
                res.render('main', {data:result, moment})
            }).sort({"title" : 1})
        })

    router.route('/user')
        .get(loggedInOnly, async(req, res) => {
            var userData = await queryUtil.queryAllUsers()
            var user = JSON.parse(userData)

            res.render('user', {data:user})
        })
    
    router.route('/blog')
        .get(loggedInOnly, async(req, res) => {
            var blogData = await queryUtil.queryAllBlogs()
            var blog = JSON.parse(blogData)

            res.render('blog', {data:blog})
        })

    router.route('/create')
        .get(loggedInOnly, (req, res) => {
            res.render('create')
        })
        .post(loggedInOnly, (req, res) => {
            var contact = new Noticeboard()

            contact.title = req.body.title
            contact.author = req.body.author
            contact.email = req.body.email
            contact.description = req.body.description

            contact.save((err, result)=>{
                if(err) {
                    console.log(err)
                }
                res.redirect("/main")
            })
        })

    router.route('/createUser')
        .get(loggedInOnly, (req, res) => {
            res.render('createUser')
        })
        .post(loggedInOnly, async (req, res) => {
            var userNumber = req.body.userNumber
            var username = req.body.username
            var email = req.body.email
            var phone = req.body.phone
            var words = req.body.words

            await queryUtil.createUser(userNumber, username, email, phone, words)
            await res.redirect('/user')
        })
        
    router.route('/createBlog')
        .get(loggedInOnly, (req, res) => {
            res.render('createBlog')
        })
        .post(loggedInOnly, async (req, res) => {
            var blogNumber = req.body.blogNumber
            var userNumber = req.body.userNumber
            var title = req.body.title
            var description = req.body.description

            await queryUtil.createBlog(blogNumber, userNumber, title, description)
            await res.redirect('/blog')
        })

    router.route('/update/:id')
        .get(loggedInOnly, (req, res, next) => {   
            var id = req.params.id  

            Noticeboard.findOne({_id : id}, (err, result) => {
                 if(err) { return next(err) }
                 console.log(result)
                 res.render('update', {data : result})
            })
        })
        .post(loggedInOnly, (req, res, next) => {
            var id = req.params.id
            var title = req.body.title
            var author = req.body.author
            var email = req.body.email
            var description = req.body.description

            Noticeboard.findOneAndUpdate({_id : id}, {title, author, email, description}, (err, result) => {
                if(err) { return next(err) }
                res.redirect('/main')
            })
        })

    router.route('/updateUser/:userNumber')
        .get(loggedInOnly, async (req, res) => {
            var userNumber = req.params.userNumber
            var user = await queryUtil.queryUser(userNumber)
            var userData = await JSON.parse(user)

            res.render('updateUser', {data:userData, userNumber:userNumber})
        })
        .post(loggedInOnly, async (req, res) => {
            var userNumber = req.params.userNumber
            var newUsername = req.body.newUsername

            await queryUtil.changeUserName(userNumber, newUsername)
            await res.redirect('/user')
        })

    router.route('/updateBlog/:blogNumber')
        .get(loggedInOnly, async (req, res) => {
            var blogNumber = req.params.blogNumber
            var blog = await queryUtil.queryBlog(blogNumber)
            var blogData = await JSON.parse(blog)

            res.render('updateBlog', {data:blogData, blogNumber:blogNumber})
        })

        .post(loggedInOnly, async (req, res) => {
            var blogNumber = req.params.blogNumber
            var title = req.body.title
            var description = req.body.description

            await queryUtil.changeBlog(blogNumber, title, description)
            await res.redirect('/blog')
        })

    router.route('/delete/:id')
        .post(loggedInOnly, (req, res) => {
            var id = req.params.id
            Noticeboard.findOneAndDelete({_id : id}, (err, result) => {
                if(err) console.log(err)
                res.redirect('/main')
            })
        })

    router.all("/logout", (req, res) => {
        req.logout()
        res.redirect('/')
    })

    //Error Handler
    router.use((err, req, res) => {
        console.error(err.stack)
    })

    return router
}

module.exports = authenticate;