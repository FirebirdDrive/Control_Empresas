'use strict'

var mongoose = require('mongoose');
var admin = require("./controllers/user.controller")
var app = require('./app')
var port = 3000;

mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/EmpresaDB',{useNewUrlParser: true, useUnifiedTopology: true})
    .then(()=>{
        console.log('Conectado a la base de datos.')
        admin.createInit();
        app.listen(port, ()=>{
            console.log('Servidor de express en línea');
        })
    })
    .catch((err)=>{
        console.log('Error al conectarse a la base de datos', err)
    })
