'use strict'

// Importaciones

var express = require('express');
var bodyParser = require('body-parser');
var userRoutes = require('./routes/user.route');
var empleadoRoutes = require('./routes/empleado.route');

// Instancia

var app = express();

// Parseo de cualquier tipo de dato a JSON (Middleware)

app.use(bodyParser.urlencoded({extended:false})) // Codificacion de URL
app.use(bodyParser.json()); // El dato que venga lo convierte a JSON

// Metodo de testeo
//
// app.post('/prueba', (req, res)=>{
    //res.status(200).send({message: 'Hola mundo'})
//})

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

app.use('/v1', userRoutes);
app.use('/v1', empleadoRoutes);



// Exportar la clase

module.exports = app;