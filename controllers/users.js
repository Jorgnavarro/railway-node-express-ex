const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

//Con populate nos estamos trayendo toda la información de las notas
//asignadas a ese usuario, Si solamente agregamos .populate('notes'), nos traeremos toda la info
//de la nota, pero si agregamos .populate('notes', {content: 1, date: 1}), solamente nos traeremos
//esas propiedades del objeto note

usersRouter.get('/', async (req, res) => {
    const users = await User.find({}).populate('notes', {content: 1, date: 1})
    
    res.json(users)
})

usersRouter.post('/', async (req, res) => {
    const body = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
        username: body.username,
        name: body.name,
        passwordHash,
    })

    const savedUser = await user.save()

    res.json(savedUser)
})

module.exports = usersRouter