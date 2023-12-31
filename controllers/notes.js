const notesRouter = require('express').Router()
const Note = require('../models/note')
//agregamos el user
const User = require('../models/user')

//Creación de notes con token
const jwt = require('jsonwebtoken')


//Página inicial al ingresar al localhost
// notesRouter.get('/', (req, res) => {
//     res.send('<h1>Using express from NodeJS</h1>');
// })

//llamar todos los recursos
notesRouter.get('/', async (req, res) => {
    //res.json(notes);
    // Note.find({}).then(noteToSearch => {
    //     res.json(noteToSearch);
    // })
    const notes = await Note.find({}).populate('user', {username: 1, name: 1})
    res.json(notes)
})

//buscar un recurso por id
notesRouter.get('/:id', async (req, res) => {
    //como ahora usamos la libería que maneja los errores de async, no necesitamos el tercer parámetro next, así que se
    //omite
    // const id = Number(req.params.id);
    // const note = notes.find(note =>
    //solución para debuguear, en este caso estabamos comparando nos valores de diferentes tipos de datos, por ende no nos estaba dando, para descubrir el tipo de dato del parámetro usamos typeof y nos guiamos
    //console.log(note.id, typeof note.id, id, typeof id, note.id===id);
    //     note.id === id
    // )
    //-------------Usando try/catch---------------
    // Note.findById(req.params.id).then(note => {
    //     if(note){
    //         res.json(note);
    //     }else{
    //         res.status(404).send('<h1>The resource does not exist in our database</h1>')
    //     }
    // }).catch(error => {
         // console.log(error.message)
         // res.status(400).send({error: 'malformatted id'})
         //lo pasamos a nuestro middleware
    //     next(error)
    // })
    //

    //----------Usando la librería express-async-errors-----
    const note = await Note.findById(req.params.id)

    if(note){
        res.json(note)
    }else{
        res.status(404).send('<h1>The resource does not exist in our database</h1>').end()
    }
})


// const generateId = () => {
//     const maxId = notes.length > 0
//         ? Math.max(...notes.map(not => not.id))
//         : 0;
//     return maxId + 1;
// }


//Se aisla el authorization y el bearer, de la cadena, solamente se retorna el token

const getTokenFrom = req => {
    const authorization = req.get('authorization')
    if(authorization && authorization.toLowerCase().startsWith('bearer ')){
        return authorization.substring(7)
    }
    return null
}

// agregando un recurso
notesRouter.post('/', async (req, res) => {
    //no necesitamos usar el tercer parámetro next, por eso lo eliminamos de la línea de arriba después de res.
    const body = req.body;
    //utilizamos el !body.content para implementar los falsy or thruty según sea el caso, en ese caso, si !body.content está vacío, indicará verdad y se enviará un 400, no se guardará la nota vacía. Pero si ocurre lo contrario se almacena la nota
    // if(!body.content){
    //     return res.status(400).json({
    //         error: 'content missing'
    //     })
    // }

    //Se trae el token de la función que aisla la cabecera authorization y bearer
    const token = getTokenFrom(req)
    //Acá el token se decodifica y podemos acceder a los valores disponibles del usuario, como su id, name o username. verify, hace la verificación y decodifica el token, devolviendo el objeto en el que se basó el mismo
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if(!token || !decodedToken){
        return res.status(401).json({ error: 'token missing or invalid'})
    }

    const user = await User.findById(decodedToken.id)


    //buscamos el usuario para agregar como nuevo parámetro a la nota
    //las configuraciones ya están realizadas en el modelo
    //Una opción corta en el dato important: body.important || false
    //indica que si body important no está definido, será false, en caso contrario será
    //lo que contenga body.important, lo escribo porque pondré otra sintaxis
    //const user = await User.findById(body.userId)
    console.log(user)
    const note = new Note({
        content: body.content,
        important: body.important === undefined ? false : body.important,
        date: new Date(),
        user: user._id
    })
    // notes = notes.concat(note)
    //console.log(note);
    //console.log(req.headers);
    //res.json(note);
    //De esta forma el código de abajo es más limpio, después de guardar la nota en la BBDD, en el primer then() la formateamos a .toJSON() y la retornamos. Luego en el segundo .then() la nota formateada la enviamos como res.json(), de esa forma tenemos un código más legible.
    // note.save()
    //     .then(savedNote => savedNote.toJSON())
    //     .then(savedAndFormattedNote => {
    //         res.json(savedAndFormattedNote)
    //     })
    //     .catch(err => next(err))

    //-------------Usando try/catch---------------
    //
    // try{
    //     const savedNote = await note.save()
    //     res.json(savedNote)
    // }catch(exception){
    //     next(exception)
    // }

    //----------Usando la librería express-async-errors-----
    const savedNote = await note.save()
    //Ingresamos a la matriz de notes que tiene el usuario, previamente
    //ya configurada, agregamos a la matriz el id de la note con 
    //.concat
    console.log(savedNote)
    user.notes = user.notes.concat(savedNote._id)
    await user.save()
    //luego hacemos la conversión
    res.json(savedNote)
})

// modificar un recurso
notesRouter.put('/:id', async (req, res) => {
    const body = req.body
    // console.log(body);
    // res.json(body)

    const note = {
        content: body.content,
        important: body.important,
    }
    //-------------Usando try/catch---------------
    // Note.findByIdAndUpdate(req.params.id, note, {new: true})
    //     .then(updatedNote => { 
    //         res.json(updatedNote)
    //     })
    //     .catch(err => next(err))

    //----------Usando la librería express-async-errors-----
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, note, {new: true})
    res.json(updatedNote)


})

// Eliminar un recurso
notesRouter.delete('/:id', async (req, res) => {
    // const id = Number(req.params.id);
    // notes = notes.filter(note => note.id !== id)
    // res.status(204).end()
    //------------Usando try/catch-------------
    // Note.findByIdAndDelete(req.params.id)
    //     .then(result => {
    //         res.status(204).end()
    //     })
    //     .catch(err => next(err))
    //----------Usando la librería express-async-errors-----
    await Note.findByIdAndDelete(req.params.id)
    res.status(204).end()
})

module.exports = notesRouter