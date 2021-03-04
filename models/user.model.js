'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    username: String,
    password: String,
    email: String,
    phone: Number,
    role: String,
    cantidadEmpleados: Number,
    empleados: [{type: Schema.ObjectId, ref: 'empleado'}]
})

module.exports = mongoose.model('user', userSchema);