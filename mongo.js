const mongoose = require('mongoose');

//config Mongo

//El tercer argumento, es decir 1.node 2.mongo.js 3.password, será quién nos permita la conexión con la base de datos y lo que con ella conlleva, hacer consultas, agregar información, eliminar información, actualizar información.

//por ello, en el if de abajo indicamos que si los argumentos son menores a 3, mandamos un mensaje al usuario y salimos del programa.

if (process.argv.length < 3) {
    console.log("Please provide the password as an argument: node mongo.js <password>");
    process.exit(1);
}

//capturamos la contraseña que seteamos para nuestra BBDD en Atlas
const password = process.argv[2]

//configuramos la URI con la que nos vamos a conectar, le introducimos el parámetro de la contraseña
const url = `mongodb+srv://fullstack:${password}@cluster0.ocikxl3.mongodb.net/note-app?retryWrites=true&w=majority`

//De esta forma nos conectamos con la BBDD en la nube
mongoose.connect(url)

//Creamos el esquema que subiremos a nuestra base de datos, este contiene el modelo del objeto principal de nuestra aplicación
const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
})

//Creamos el constructor de nuestro esquema para poder instanciarlo las veces que lo necesitamos
const Note = mongoose.model('Note', noteSchema)

//creamos nuestra primera instancia para almacenar en nuestra BBDD
const note = new Note({
    content: 'Another day another opportunity, if you want her, go ahead',
    date: new Date(),
    important: false,
})

// con "note.save" estamos guardando la instancia creada en nuestra BBDD, con este objeto obtendremos una promesa, .then(result =>) con la que podremos operar, pero también debemos cerrar la conexión de nuestra BBDD para que se detenga el programa después de guardado.

/*
note.save().then(result => {
    console.log('note saved!')
    mongoose.connection.close()
})
*/

//forma de llamar todos los elementos de la BBDD

Note.find({}).then(result => {
    result.forEach(note => {
        console.log(note)
    })
    mongoose.connection.close()
})

