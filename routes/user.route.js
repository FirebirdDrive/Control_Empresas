'use strict'

var express = require('express');
var userController = require('../controllers/user.controller');
var mdAuth = require('../middlewares/authenticated');


var api = express.Router();

api.post('/createInit', userController.createInit);
api.post('/login', userController.login);
api.put('/saveEmpresa', mdAuth.ensureAuthAdmin, userController.saveEmpresa);
api.get('/getEmpresas/',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.getEmpresas);
api.put('/updateEmpresa/:id', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.updateEmpresa);
api.put('/removeEmpresa/:id',[mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], userController.removeEmpresa);
api.post('/getEmpresa/:id', mdAuth.ensureAuth, userController.getEmpresa);
api.post('/pdfEmpleados/:id', userController.pdfEmpleados);


module.exports = api;