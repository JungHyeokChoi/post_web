var express = require('express')
var path = require('path')
var app = express()
var bodyParser = require('body-parser')
var passport = require('passport')
require('ejs')
const mongoose = require('mongoose');
mongoose.Promise = global.Promise
var User = require('./models/User')

var dotenv = require('dotenv')
var session = require('express-session')
var cookieParser = require('cookie-parser')
var flash = require('express-flash-messages')
var apiRouter = require('./routes/Router')


//MongoDB Connection
dotenv.config()
var url = process.env.M_URL
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

// process.cwd() 현재 경로 찾기
app.set('views', path.resolve(__dirname + '/views'))
app.set('view engine', 'ejs')

// Error : app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile);

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(session({
    secret : "3ojhtpioteuws90fdfhhereteteteryryt",
    resave : true,
    saveUninitialized : true
}))

/*  
   Set the absolute path when using params. 
   This is Because the Request URL error occurs.
*/ 
app.use(express.static(__dirname + '/public'))
app.use(express.static(path.join(__dirname, 'public/css')));
app.use(express.static(path.join(__dirname, 'public/scss')));
app.use(express.static(path.join(__dirname, 'public/vendor')));
app.use(express.static(path.join(__dirname, 'public/js')));
app.use(express.static(path.join(__dirname, 'public/assets')));

console.log(path.join(__dirname, 'public/vendor'))


app.use(flash())

//Passport
app.use(passport.initialize())
app.use(passport.session())
passport.serializeUser((user, done) => {
    done(null, user._id)
})

passport.deserializeUser((userId, done) => {
    User.findById(userId, (err, result) => { done(err, result) })
})

const LocalStrategy = require('passport-local').Strategy
const local = new LocalStrategy((username, password, done) => {
    User.findOne({ username })
    .then(user => {
        if(!user || !user.validPassword(password)){
            done(null, false, {message : "Invaild username password"})
        } else {
            done(null, user) 
        }
    })
    .catch(e => done(e))
})
passport.use("local", local)

//Add Routing File List on Middleware
app.use('/', apiRouter(passport))

const port = process.env.PORT
app.listen(port, () => {
    console.log(`Server is Starting at http://localhost:${port}`)
})