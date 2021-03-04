'use Strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion_EMPRESAS@'

exports.createToken = (user)=>{
    var payload ={
        sub:  user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        iat: moment().unix(),
        exp: moment().add(400, 'seconds').unix()
    }
    return jwt.encode(payload, secretKey);
}


