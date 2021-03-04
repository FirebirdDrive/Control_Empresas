'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'encriptacion_EMPRESAS@';

exports.ensureAuth = (req,res,next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: "La peticion de cabecera no lleva autenticación"});
    }else{
        var token = req.headers.authorization.replace(/['"']+/g, '');
        try{
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: "Token ha expirado"})
            }
        }catch(err){
            return res.status(404).send({message: "Token inválido"})
        }
        req.user = payload;
        console.log(req.user)
        next();
    }
}

exports.ensureAuthAdmin = (req,res,next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: "La petición no tiene cabecera de autenticación"})
    }else{
        var token = req.headers.authorization.replace(/['"']+/g, '');
        try{
            var payload = jwt.decode(token,secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: "Token expirado"})
            }
            if(payload.role != "ROL_ADMIN"){
                return res.status(401).send({message: "No tienes permiso para usar esta ruta"})
            }
        }catch(ex){
            return res.status(401).send({message: "Token inválido"})
        }
        req.user = payload;
        next();
    }
}