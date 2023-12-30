//Para poder generar el token tenemos que hacer
//npm i jsonwebtoken
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
//creamos el router para poder hacer el post y generar el token
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (req, res) => {
    const body = req.body
    //de la solicitud hecha en el body, tratamos primeramente de encontrar un user que corresponda con el username en nuestra BBDD
    const user = await User.findOne({ username: body.username })
    // si el user no existe, retornará false, en caso de existir
    // se hará un segundo paso, comparar la contraseña enviada en el cuerpo con el passwordHash que seteamos en el controller de user
    const passwordCorrect = user === null 
    ? false
    : await bcrypt.compare(body.password, user.passwordHash)
    //Si no se retorna un user y tampoco una respuesta al comparar 
    //las contraseñas, detenemos el proceso retornando un 401 unauthorized y un mensaje de error
    if(!(user && passwordCorrect)){
        return res.status(401).json({
            error: 'invalid username or password'
        })
    }
    //En caso de que lo anterior no se cumpla, entonces comenzamos a configurar nuestro token
    //En la constante userForToken, almacenamos el username del usuario encontrado al igual que su id
    const userForToken = {
        username: user.username,
        id: user._id,
    }

    //Usamos la propiedad para crear la firma digital del token
    //jwt.sign y por parámetros le pasamos el userForToken, junto con el process.env.SECRET, con ese proceso se le indica al token que ha sido firmado digitalmente usando una variable de entorno como secreto. Esto garantiza que aquellos que conozcan el secreto, solo las partes puedan generar un token válido.
    //El valor de la variable de entorno debe establecerse en el archivo .env
    const token = jwt.sign(userForToken, process.env.SECRET, { expiresIn: 60 * 60 })

    //La solicitud exitosa retorna un estatus 200 ok, con el token generado, el nombre de usuario y el username.
    res
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter