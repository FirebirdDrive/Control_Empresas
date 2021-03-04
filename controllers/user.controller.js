'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require("../services/jwt");
var Empleado = require('../models/empleado.model')
var pdf = require('html-pdf');


function createInit(req,res){
    let user = new User();
    User.findOne({username: 'Admin'},(err, userFind)=>{
        if(err){
            console.log("Error al crear el administrador");
        }else if(userFind){
            console.log("El administrador ha sido creado");
        }else{
            user.password = "12345";
            bcrypt.hash(user.password, null, null, (err,passwordHash)=>{
                if(err){
                    res.status(500).send({message: "Error al encriptar la contraseña"})
                }else if(passwordHash){
                    user.username = "Admin",
                    user.password = passwordHash;
                    user.role = "ROL_ADMIN"
                    user.save((err,userSave)=>{
                        if(err){
                            console.log("Error al crear el useristrador");
                        }else if(userSave){
                            console.log('El administrador ha sido creado con exito!');
                        }else{
                            console.log("El administrador no se pudo crear");
                        }
                    })
                }
            })
        }
    })
}

function login(req,res){
    var params = req.body;

    if(params.username && params.password){
        User.findOne({username: params.username}, (err,userFind)=>{
            if(err){
                return res.status(500).send({message: "Error general"})
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err,checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: "Error en la verificacion de la contraseña"})
                    }else if(checkPassword){
                        if(params.getToken){
                            return res.send({ token: jwt.createToken(userFind)})
                        }else{
                            return res.send({message: "Usuario logeado, no puedes generar un token nuevo"})
                        }
                    }else{
                        return res.status(404).send({message: "Contraseña incorrecta"})
                    }
                })
            }else{
                return res.send({message: "Usuario no encontrado"})
            }
        })
    }else{
        return res.status(404).send({message: "Porfavor ingresa todos los campos"})
    }
}

function saveEmpresa(req, res) {
    var user = new User();
    var params = req.body;

    if (params.name && params.username && params.password && params.role) {
        User.findOne({ username: params.username }, (err, userFind) => { //busqueda de un solo registro 
            if (err) {
                res.status(500).send({ message: 'Error', err })
            } else if (userFind) {
                res.status(200).send({ message: 'Esta empresa ya esta creada!' })
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                    if (err) {
                        res.status(500).send({ message: ' Error en la encriptacion de la contraseña' })
                    } else if (passwordHash) {
                        user.name = params.name;
                        user.username = params.username;
                        user.password = params.password;
                        user.role = params.role;
                        user.phone = params.phone;
                        user.email = params.email;
                        user.password = passwordHash
                        user.save((err, empresaSaved) => {
                            if (err) {
                                res.status(500).send({ message: 'Error al guardar los datos' })
                            } else if (empresaSaved) {
                                res.status(200).send({ message: 'Empresa creada correctamente', empresaSaved })
                            }else{
                                return res.status(500).send({message: "Error al guardar la empresa"})
                            }
                        })
                    }
                })
            }
        })
    } else {
        res.status(200).send({ message: 'por favor ingrese todo los datos obligatorio' })
    }
}

function getEmpresas(req,res){
    User.find({}).populate("empleados").exec((err,users)=>{
        if(err){
            res.status(500).send({message: "Error en el servidor al intentar buscar"})
        }else if(users){
            res.status(200).send({message: "Empresas encontradas:", users})
        }else{
            res.status(200).send({message: "No hay datos"})
        }
    })
}

function getEmpresa(req, res){
    let userId = req.params.id;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findById(userId).populate('empleados').exec((err, user)=>{
            if(err){
                res.status(500).send({message: 'Error en el servidor al intentar buscar'});
            }else if(user){
                res.status(200).send({message: 'Empresa encontrada', user});
            }else{
                res.status(200).send({message: 'No hay registros'});
            }
        })  
    }
}


function updateEmpresa(req,res){
    let userId = req.params.id;
    let update = req.body;

        if(update.password || update.password == ""){
            return res.status(500).send({message: "No puedes actualizar la contraseña"});
        }
        if(update.username ||  update.username == ""){
            User.findOne({username: update.username.toLowerCase()}, (err,userFind)=>{
                if(err){
                    return res.status(500).send({message: "Error general"});
                }else if(userFind){
                    return res.send({message: "No se puede actualizar, el nombre de usuario esta en uso"})
                }else{
                    return res.status(500).send({message: "No se puede actualizar"});
                }
            })
        }else{
            User.findByIdAndUpdate(userId, update, {new: true},(err,userUpdated)=>{
                if(err){
                    return res.status(500).send({message: "Error general al actualizar"});
                }else if(userUpdated){
                    return res.send({message: "Usuario actualizado", userUpdated})
                }else{
                    return res.status(500).send({message: "No se actualizo al usuario"});
                }
            })
        }
}

function removeEmpresa(req,res){
    let userId = req.params.id;
    let params = req.body;

        User.findOne({_id: userId}, (err,userFind)=>{
            if(err){
                return res.status(500).send({message: "Error general al momento de buscar al usuario"})
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err,checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: "Error general al momento de verificar la contraseña"})
                    }else if(checkPassword){
                        User.findByIdAndRemove(userId, (err, userRemoved)=>{
                            if(err){
                                return res.status(500).send({message: "Error general al momento de eliminar el usuario"})
                            }else if(userRemoved){
                                return res.send({message: "Usuario eliminado", userRemoved})
                            }else{
                                return res.status(404).send({message: "No se pudo eliminar al usuario o ya no existe"})
                            }
                        })
                    }else{
                        return res.status(404).send({message: "Contraseña incorrecta, porfavor vuelve a ingresarla"})
                    }
                })
            }else{
                return res.status(404).send({message: "Usuario no encontrado"})
            }
        })
 }

function pdfEmpleados (req,res){
    let userId = req.params.id;

    User.findOne({_id: userId}).exec((err,userFind)=>{
        if(err){
            return res.status(500).send({message: "Error al buscar empleados"});
        }else if(userFind){
            let empleados = userFind.empleados;
            let empleadosFounds = [];
            let empleadosPDF = [];

            empleados.forEach(elemento =>{
                empleadosFounds.push(elemento);
            })

            empleadosFounds.forEach(elemento => {
                Empleado.find({_id: elemento}).exec((err, empleadoFound)=>{
                    if(err){
                        return res.status(400).send({message: "Error general"});
                    }else if(empleadosFounds.length > 0){
                        let empleados = empleadoFound;
                        empleados.forEach(elemento=>{
                            empleadosPDF.push(elemento);
                        })
                        let content = `
                        <!doctype html>
                                <html>
                                <head>
                                <meta charset="utf-8">
                                    <title>Empleados</title>
                                <style>
                                    th {
                                        color: green;
                                        font-size: 30px;
                                        font-family: 'Roboto', sans-serif; 
                                    }
                                    td{
                                        font-size: 20px;
                                        font-family: 'Roboto', sans-serif;
                                    }
                                </style>
                                </head>
                        <body style="margin-top: 50px;">
                            <table>
                                <tbody>
                                    <tr>
                                        <th style="padding-right: 25px; padding-left: 20px;"> Nombre </th>
                                        <th style="padding-right: 20px; padding-left: 20px;"> Apellido </th>
                                        <th style="padding-right: 20px; padding-left: 20px;"> Departamento </th>
                                        <th style="padding-right: 20px; padding-left: 15px;"> Puesto </th>
                                        <th style="padding-left: 20px;"> Teléfono </th>
                                    </tr>
                                    <tr>
                                       ${empleadosPDF.map(empleado => `
                                                            <tr>
                                                            <td style="text-align: center";>${empleado.name}</td>
                                                            <td style="text-align: center";>${empleado.lastname}</td>
                                                            <td style="text-align: center";>${empleado.departamento}</td>
                                                            <td style="text-align: center";>${empleado.puesto}</td>
                                                            <td style="text-align: center";>${empleado.phone}</td>
                                                            </tr>
                                                            `).join('')}                   
                                    </tr>
                                </tbody>
                            </table>
                        </body>
                        </html>
                        `;
                    
                    let options = {
                        paginationOffset: 1,
                        "header":{
                            "height": "45px",
                            "contents": '<div style="text-align: center; font-size: 40px; background-color: green;">' + userFind.name + "</div>"
                        }
                    }
                    
                    pdf.create(content,options).toFile('./PDF/' + userFind.name + '.pdf', function(err,res){
                        if(err){
                            console.log(err);
                        }else{
                            console.log(res);
                        }
                    })

                    }else{
                        return res.status(400).send({message: "No se encontraron empleados"});
                    }
                })
            })
            return res.status(200).send({message: "El pdf fue creado"})
        }else{
            return res.status(403).send({message: "No existe ningún empleado"})
        }
    })
}




    
module.exports ={
    createInit,
    saveEmpresa,
    getEmpresas,
    updateEmpresa,
    removeEmpresa,
    login,
    pdfEmpleados,
    getEmpresa,
}