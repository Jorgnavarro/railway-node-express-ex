//Como vamos a trabajar con una BBDD de pruebas, usamos MongoDB Atlas
const mongoose = require('mongoose')
//Usamos el paquete supertest para poder probar la API, se debe instalar npm i --save-dev supertest
const supertest = require('supertest')
const app = require('../app') //Express app
//la prueba importa la aplicación de Express del modulo app.js, y la envuelve con la función supertest
//En un objeto llamado superagent. Este objeto se asigna a la variable api y las pruebas pueden usarlo
//para realizar solicitudes HTTP al backend
const api = supertest(app)
//Dato curioso, supertest se encarga de que la aplicación que estamos testeando se inicie en un puerto que usa
//internamente, por tanto podemos correr las pruebas de forma paralela mientras el sever está en producción

//---------------------Refactorizamos nuestra app------------------------
const helper = require('./test_helper')


//creamos los datos en nuestra BBDD, para poder correr nuestros tests
//llamamos al modelo
const Note = require('../models/note')
//Almacenamos en una variable nuestros datos
/*
Antes de refactorizar nuestro back, primero debemos refactorizar nuestros tests, para asegurarnos que todo funcione
en orden. Por ello, const initial notes, ahora está alojado en un archivo externo ./test_helper.js, debemos llamarlo de allá
const initialNotes = [
    {
        content: 'You can do it',
        date: new Date(),
        important: false,
    },
    {
        content: 'Browser can execute only Javascript',
        date: new Date(),
        important: true,
    },
]
*/
//Esta propiedad de jest, nos permite ejecutar operaciones antes que se hagan los test
//se deben cargar previamente los datos a la BBDD para poder correr nuestras pruebas
//Primero eliminamos cualquier dato existente con Note.deleteMany({})
//luego agregamos cada nota haciendo uso del modelo Note y de la propiedad .save(), al ser peticiones
//se deben usar promesas o funciones asíncronas, en este caso, es más sencillo usar async/await
beforeEach(async () => {
    //al refactorizar nuestros test, traemos nuestras notas de helper
    await Note.deleteMany({})
    //Forma de guardar notas en la BBDD con operaciones separadas
    // let noteObject = new Note(helper.initialNotes[0])
    // await noteObject.save()
    // noteObject = new Note(helper.initialNotes[1])
    // await noteObject.save()
    
    //---------forma más óptima, para guardar varios elementos en una BBDD en una sola operación.--------
    //Todas las notas las mapeamos y almancenamos en noteObjects, ya creadas con la función constructora Note
    //UN array de objetos Mongoose
    const noteObjects = helper.initialNotes.map(note => new Note(note))
    //Creamos un array de promesas al usar la propiedad .save(), con los objetos mongoose
    const promiseArray = noteObjects.map(note => note.save())
    //Con el método Promise.all(), se puede usar para transformar una serie de promesas en una única
    //Que se cumplirá una vez que se resuelva cada promesa en la matriz que se le pasa como parámetro, en este caso
    //promiseArray. Con await nos garantizamos que se espere cuando finalice cada promesa al guardar una nota, entonces
    //la BBDD se habrá inicializado.
    await Promise.all(promiseArray)
})
//Este test realiza una solicitud HTTP GET a la url api/notes, verifica que se respona con un código de estado 200
//Y también se verifica que el encabezado Content-Type se establece en application/json (nuestro formato deseado)
//con respecto a la verificación del encabezado, usamos una expresión regular /application\/json/
//se establece un \ porque normalmente el encabezado es: application/json, entonces para que no se entienda como
//una terminación de la expresión.
test('Notes are returned as json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})


//Con el siguiente test, ya con datos cargados, comprobamos que el total de elementos sea 2
test('There are two notes', async () => {
    const response = await api.get('/api/notes')

    //expect(response.body).toHaveLength(2)
    //cambiamos inital notes lo traemos del file helper
    expect(response.body).toHaveLength(helper.initialNotes.length)
})

//Acá comprobamos que el contenido de la primera nota almacenada en la BBDD sea el pasado en .toBe en el primer
//Caso
//Para hacerlo más dinámico, recorremos la colección devuelta al obtener todos los contenidos de las notas
//en la variable contents, luego con el método .toContain, comprobamos que exista dicho contenido en al menos
//una de las notas de nuestra colección
test('Here we check the content of the notes', async () => {
    const response = await api.get('/api/notes')

    //expect(response.body[0].content).toBe('You can do it')
    const contents = response.body.map(note => note.content)
    expect(contents).toContain(
        'Browser can execute only Javascript'
    )
})

test('a valid note can be added', async () => {
    const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
    }

    await api
        .post('/api/notes')
        .send(newNote)
        .expect(200)
        .expect('Content-Type', /application\/json/)

    //const response = await api.get('/api/notes')
    //refactorizamos nuestro test, agregando una nota más
    const notesAtEnd = await helper.notesInDb()
    //expect(response.body).toHaveLength(initialNotes.length + 1)
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length + 1)


    //const contents = response.body.map(note => note.content)
    const contents = notesAtEnd.map(note => note.content)

    expect(contents).toContain(
        'async/await simplifies making async calls'
    )

})

//Se prueba de que una nota que no tenga contenido no se guarde.
//con la const response, estamos verificando el almacenamiento en nuestr BBDD test

test('note without content is not added', async () => {
    const newNote = {
        important: true
    }
    await api
    .post('/api/notes')
    .send(newNote)
    .expect(400)

    //const response = await api.get('/api/notes')
    const notesAtEnd = await helper.notesInDb()

    //expect(response.body).toHaveLength(initialNotes.length)
    expect(notesAtEnd).toHaveLength(helper.initialNotes.length)
})

test('A specific note can be viewed', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToView = notesAtStart[0]

    const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    
    const processedNoteToView = JSON.parse(JSON.stringify(noteToView))

    expect(resultNote.body).toEqual(processedNoteToView)
})

test('A note can be deleted', async () => {
    const notesAtStart = await helper.notesInDb()

    const noteToDelete = notesAtStart[0]
    
    await api 
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204)
    
    const notesAtEnd = await helper.notesInDb()

    expect(notesAtEnd).toHaveLength(helper.initialNotes.length - 1)

    const contents = notesAtEnd.map(note => note.content)

    expect(contents).not.toContain(noteToDelete.content)
})

//una vez terminada la ejecución de todas las pruebas, cerramos la conexión a la BBDD
afterAll(() => {
    mongoose.connection.close()
})

//para ejecutar solamente este archivo podemos escribir npm test -- tests/note_api.test.js o npm test -- -t 'nombre especifico del test
//Nota: si se ejecuta un solo test, es posible que no se cierre la conexión a la BBDD porque no se ejecutaría
//la función  afterAll