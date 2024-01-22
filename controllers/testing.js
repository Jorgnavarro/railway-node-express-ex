const router = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')

//Creamos este archivo para resetar la BBDD para pruebas, para que la misma no se vea comprometida al testear

router.post('/reset', async (req, res) => {
    await Note.deleteMany({})
    await User.deleteMany({})
    res.status(204).end()
})

module.exports = router