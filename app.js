const config = require('./utils/config')
const express = require('express')
//con esta biblioteca, omitimos el uso de try/catch
//Ya no se necesita usar next(err) o next(exception), la biblioteca se encarga de todo lo que hay por debajo del capó
//Si ocurre una excepción en una ruta async, la ejecución se pasa automáticamente al middleware de manejo de errores.
require('express-async-errors')
const app = express()
const cors = require('cors')
const morgan = require('morgan');
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(result =>{
        logger.info('Conected to MongoDB');
    })
    .catch(err => {
        logger.error('Error connecting to MongoDB: ', err.message);
    })
    
//podemos conectar nuestro back y front con diferentes direcciones antes debemos hacer npm i cors
app.use(cors())

//agregamos este middleware para poder correr la página estática de nuestro front
app.use(express.static('dist'))

//necesitamos usar el json-parser para que los datos JSON se transformen a un objeto JS
app.use(express.json())

//deshabilitamos la cabecera que viene en express por default()
app.disable('x-powered-by')

//llevamos un registro de nuestras solicitudes y respuestas de nuestro servidor usando Morgan
//mostramos el cuerpo de una solicitud post
morgan.token('body', (req) => JSON.stringify(req.body))
//salida por consola de nuestras solicitudes
app.use(morgan(':method :url :status :res[content-length] :response-time ms :body'))


app.use(middleware.requestLogger)

app.use('/api/notes', notesRouter)

app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)

app.use(middleware.errorHandler)

module.exports = app