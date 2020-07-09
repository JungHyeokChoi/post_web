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
        console.log(res.locals.currentUser)
        res.locals.errors = req.flash("error");
        res.locals.infos = req.flash("info");
        next()
    })

    router.route('/')
    .get((req, res, next) => {
        res.render('index')
    })

    router.route('/signup')
        .get(loggedOutOnly, (req, res, next) =>{
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
        .get(loggedOutOnly, (req, res, next) => {
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
        .get(loggedInOnly, async(req, res, next) => {
            var userData = await queryUtil.queryAllUsers()

            await Noticeboard.find((err, result) => {
                if(err) { console.log(err) }

                var user = JSON.parse(userData)
                res.render('main', {data:result, user:user ,moment })
            }).sort({"title" : 1})
        })
        .post(loggedInOnly, (req ,res, next) => {
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

    router.route('/insert')
        .get(loggedInOnly, (req, res, next) => {
            res.render('insert')
        })
        .post(loggedInOnly, (req, res, next) => {
            var contact = new Noticeboard()

            contact.title = req.body.title
            contact.author = req.body.author
            contact.email = req.body.email
            contact.description = req.body.description

            var blogNumber = req.body.blogNumber
            var userNumber = req.body.userNumber
            var title = req.body.title
            var description = req.body.description

            queryUtil.createBlog(blogNumber, userNumber, title, description)

            contact.save((err, result)=>{
                if(err) {
                    console.log(err)
                }
                console.log(result)
                res.redirect("/main")
            })
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

    router.route('/delete/:id')
        .post(loggedInOnly, (req, res) => {
            var id = req.params.id
            Noticeboard.findOneAndDelete({_id : id}, (err, result) => {
                if(err) console.log(err)
                res.redirect('/main')
            })
        })

    router.all("/logout", (req, res, next) => {
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