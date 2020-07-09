var mongoose = require('mongoose')
var bcrypt = require('bcryptjs')

var userSchema = mongoose.Schema({
    username : {
        type : String,
        required: true
    },
    passwordHash : {
        type : String,
        required: true
    },
    email:String,
    createAt : {
        type : Date,
        default : Date.now
    }
})

/* 
   Error : () => {}
   Using : function() {}
   Don’t use arrow functions when you use Mongoose (Schema.method(), Schema.virtual() etc...)
   Because arrow functions don’t bind the this keyword as the function expression does.
*/
userSchema.methods.validPassword = function(password){
    return bcrypt.compareSync(password, this.passwordHash)
}

userSchema.virtual("password")
    .set(function(value) {
        this.passwordHash = bcrypt.hashSync(value, 12)
    })

var User = mongoose.model('user', userSchema)
module.exports = User