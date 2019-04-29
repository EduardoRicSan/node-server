//Obteniendo los recursos de express
const express = require('express');

const bcrypt = require('bcrypt');

const _ = require('underscore');

//obteniendo el usuario
const Usuario = require('../models/usuario');

//Inicializando app 
const app = express();
app.get('/usuario', function(req, res) {
    ///Schema

    let desde = req.query.desde || 0; //Define la variable desde para que el usuario pueda decidir que pagina ver o si no lo hace, comenzar en la pág.0
    //Parseando la variable desde para que sea numérica
    desde = Number(desde);

    let limite = req.query.limite || 5; //número de registros por página
    limite = Number(limite);


    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde) //Salta los primeros 5 registros
        .limit(limite) //Muestra los siguientes 5 registros
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            Usuario.count({ estado: true }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });

        });

});

app.post('/usuario', function(req, res) {

    let body = req.body;

    //creando la instancia del usuario
    //creando el objeto usuario con sus valores
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role

    });

    //grabando en la BD
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

//PUT funciona para actualizar registros 
app.put('/usuario/:id', function(req, res) {

    /**
     * Obteniendo el id mediante let nombreVariable =  req.params.x 
     * La segunda palabra "x" debe coincidir con el parámetro de búsqueda asignado 
     *  */
    let id = req.params.id;
    //Enviando todos los argumentos que se desean mostrar 
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });



});

// app.delete('/usuario/:id', function(req, res) {
//     //Obteniendo el id dado en el url /usuario/:id
//     let id = req.params.id;

//     Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
//         if (err) {
//             return res.status(400).json({
//                 ok: false,
//                 err
//             });
//         };
//         if (!usuarioBorrado) { //si el usuario no existe
//             return res.status(400).json({
//                 ok: false,
//                 err: {
//                     message: 'Usuario no encontrado'
//                 }
//             });
//         }
//         res.json({
//             ok: true,
//             usuario: usuarioBorrado
//         });
//     });
// });


app.delete('/usuario/:id', function(req, res) {
    //Obteniendo el id dado en la url
    let id = req.params.id;

    //El segundo parámetro son las propiedades en las cuales se ejecutan las acciones, en este caso el campo estado será actualizado
    //Creando la data para obtener el campo estado
    let cambiaEstado = {
            estado: false
        }
        //el {new:  true} funciona para que los cambios que se ejecutan se muestren en pantalla.
    Usuario.findByIdAndUpdate(id, cambiaEstado, { new: true }, (err, usuarioBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        };

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioBorrado
        });
    });


});

//exportando archivos externos
module.exports = app;