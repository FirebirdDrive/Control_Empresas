'use strict'

var User = require('../models/user.model');
var Empleado = require('../models/empleado.model');
var pdf = require('html-pdf');

function setEmpleado(req, res){
    var userId = req.params.id;
    var params = req.body;
    var empleado = new Empleado();

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'})
            }else if(userFind){
                empleado.name = params.name;
                empleado.lastname = params.lastname;
                empleado.phone = params.phone;
                empleado.puesto = params.puesto;
                empleado.departamento = params.departamento;

                empleado.save((err, empleadoSaved)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al guardar'})
                    }else if(empleadoSaved){
                        User.findByIdAndUpdate(userId, {$push:{empleados: empleadoSaved._id}}, {new: true}, (err, empleadoPush)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al agregar empleado'})
                            }else if(empleadoPush){
                                return res.send({message: 'Empleado agregado', empleadoPush});
                            }else{
                                return res.status(500).send({message: 'Error al agregar empleado'})
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'No se guardó el empleado'})
                    }
                })
            }else{
                return res.status(404).send({message: 'La empresa que deseas agregar los empleados no existe.'})
            }
        })
    }
}

function updateEmpleado(req, res){
    let userId = req.params.idU;
    let empleadoId = req.params.idE;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.name || update.phone || update.puesto || update.departamento){
            Empleado.findById(empleadoId, (err, empleadoFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar'});
                }else if(empleadoFind){
                    User.findOne({_id: userId, empleados: empleadoId}, (err, userFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en la busqueda de usuario'});
                        }else if(userFind){
                            Empleado.findByIdAndUpdate(empleadoId, update, {new: true}, (err, empleadoUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general en la actualización'});
                                }else if(empleadoUpdated){
                                    return res.send({message: 'Empleado actualizado', empleadoUpdated});
                                }else{
                                    return res.status(404).send({message: 'Empleado no actualizado'});
                                }
                            })
                        }else{
                            return res.status(404).send({message: 'Usuario no encontrado'})
                        }
                    })
                }else{
                    return res.status(404).send({message: 'Empleado a actualizar inexistente'});
                }
            })
        }else{
            return res.status(404).send({message: 'Por favor ingresa los datos mínimos para actualizar'});
        }
    }
}

function removeEmpleado(req, res){
    let userId = req.params.idU;
    let empleadoId = req.params.idE;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findOneAndUpdate({_id: userId, empleados: empleadoId},
            {$pull:{empleados: empleadoId}}, {new:true}, (err, empleadoPull)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }else if(empleadoPull){
                    Empleado.findByIdAndRemove(empleadoId, (err, empleadoRemoved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al eliminar el empleado'});
                        }else if(empleadoRemoved){
                            return res.send({message: 'Empleado eliminado', empleadoPull});
                        }else{
                            return res.status(500).send({message: 'Empleado no encontrado, o ya eliminado'});
                        }
                    })
                }else{
                    return res.status(500).send({message: 'No se pudo eliminar el empleado de la empresa'});
                }
            }).populate('empleado')
    }
}

function search(req, res){
    var params = req.body;

    if(params.search){
        Empleado.find({$or:[{name: params.search},
                        {lastname: params.search},
                        {puesto: params.search},
                        {departamento: params.search}]}, (err, resultSearch)=>{
                            if(err){
                                console.log(err)
                                return res.status(500).send({message: 'Error general'});
                            }else if(resultSearch){
                                return res.send({message: 'Coincidencias encontradas: ', resultSearch});
                            }else{
                                return res.status(403).send({message: 'Búsqueda sin coincidencias'});
                            }
                        })
    }else{
        return res.status(403).send({message: 'Ingrese datos en el campo de búsqueda'});
    }
}



module.exports ={
    setEmpleado,
    updateEmpleado,
    removeEmpleado,
    search
}