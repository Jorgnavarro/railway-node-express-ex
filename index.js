//const http = require("node:http");
require('dotenv').config()
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Note = require('./models/note')



const app = express();

//agregamos este middleware para poder correr la página estática de nuestro front
app.use(express.static('dist'))

//deshabilitamos la cabecera que viene en express por default()
app.disable('x-powered-by')

//llevamos un registro de nuestras solicitudes y respuestas de nuestro servidor usando Morgan
//mostramos el cuerpo de una solicitud post
morgan.token('body', (req) => JSON.stringify(req.body))
//salida por consola de nuestras solicitudes
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))

//podemos conectar nuestro back y front con diferentes direcciones antes debemos hacer npm i cors
app.use(cors())

//morgan('tiny')



let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2019-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2019-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2019-05-30T19:20:14.298Z",
        important: true
    }
]


// const app = http.createServer((req, res) => {
//     res.writeHead(200, { 'content-Type': 'application/json' })
// we need to convert notes to JSON text chain. 
//     res.end(JSON.stringify(notes))
// })

const requestLogger = (req, res, next) => {
    console.log('Method:', req.method);
    console.log('Path: ', req.path);
    console.log('Body: ', req.body);
    console.log('----');
    next()
}

app.use(requestLogger)


//Página inicial al ingresar al localhost
app.get('/', (req, res) => {
    res.send('<h1>Using express from NodeJS</h1>');
})

//llamar todos los recursos
app.get('/api/notes', (req, res) => {
    //res.json(notes);
    Note.find({}).then(noteToSearch => {
        res.json(noteToSearch);
    })
})

//buscar un recurso por id
app.get('/api/notes/:id', (req, res) => {
    // const id = Number(req.params.id);
    // const note = notes.find(note =>
    //     //solución para debuguear, en este caso estabamos comparando nos valores de diferentes tipos de datos, por ende no nos estaba dando, para descubrir el tipo de dato del parámetro usamos typeof y nos guiamos
    //     //console.log(note.id, typeof note.id, id, typeof id, note.id===id);
    //     note.id === id
    // )
    Note.findById(req.params.id).then(note => {
        res.json(note);
    })
})
//necesitamos usar el json-parser para que los datos JSON se transformen a un objeto JS
app.use(express.json())

// const generateId = () => {
//     const maxId = notes.length > 0
//         ? Math.max(...notes.map(not => not.id))
//         : 0;
//     return maxId + 1;
// }

// agregando un recurso
app.post('/api/notes', (req, res) => {
    const body = req.body;

    if(body.content === undefined){
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })
    // notes = notes.concat(note)
    //console.log(note);
    //console.log(req.headers);
    //res.json(note);

    note.save().then(savedNote => {
        res.json(savedNote)
    })
})

// modificar un recurso
app.put('/api/notes/:id', (req, res) => {
    const body = req.body
    console.log(body);
    res.json(body)
})

// Eliminar un recurso
app.delete('/api/notes/:id', (req, res) => {
    const id = Number(req.params.id);
    notes = notes.filter(note => note.id !== id)
    res.status(204).end()
})

const unknowEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknow endpoint' })
}

app.use(unknowEndpoint);

//configuramos por defecto el puerto 3001, como ya mandamos nuestro back a internet, se configura el puerto asignado por la plataforma donde hacemos deploy
const PORT = process.env.PORT || 3001

app.listen(PORT)

console.log(`Server running on port http://localhost:${PORT}`);