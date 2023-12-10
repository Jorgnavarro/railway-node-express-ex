const logger = require('./logger')

const requestLogger = (req, res, next) => {
    console.log('Method:', req.method);
    console.log('Path: ', req.path);
    console.log('Body: ', req.body);
    console.log('----');
    next()
}


const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknow endpoint' })
}


//manejar un error cuando el formato proporcionado en el parámetro del id es incorrecto
const errorHandler = (err, req, res, next) => {
    console.log(err.message)
    if(err.name === "CastError"){
        return res.status(400).send({error: 'malformatted id'})
    }else if(err.name === 'ValidationError'){
        return res.status(400).json({error: err.message})
    }
    next(err)
}


module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler
}