//Como vamos a trabajar con una BBDD de pruebas, usamos MongoDB Atlas
const mongoose = require('mongoose')
//Usamos el paquete supertest para poder probar la API, se debe instalar npm i --save-dev supertest
const supertest = require('supertest')
const app = require('../app') //Express appn
//la prueba importa la aplicación de Express del modulo app.js, y la envuelve con la función supertest
//En un objeto llamado superagent. Este objeto se asigna a la variable api y las pruebas pueden usarlo
//para realizar solicitudes HTTP al backend
const api = supertest(app)
//Dato curioso, supertest se encarga de que la aplicación que estamos testeando se inicie en un puerto que usa
//internamente, por tanto podemos correr las pruebas de forma paralela mientras el sever está en producción

//creamos los datos en nuestra BBDD, para poder correr nuestros tests
//llamamos al modelo
const Note = require('../models/note')
//Almacenamos en una variable nuestros datos
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
//Esta propiedad de jest, nos permite ejecutar operaciones antes que se hagan los test
//se deben cargar previamente los datos a la BBDD para poder correr nuestras pruebas
//Primero eliminamos cualquier dato existente con Note.deleteMany({})
//luego agregamos cada nota haciendo uso del modelo Note y de la propiedad .save(), al ser peticiones
//se deben usar promesas o funciones asíncronas, en este caso, es más sencillo usar async/await
beforeEach(async () => {
    await Note.deleteMany({})
    let noteObject = new Note(initialNotes[0])
    await noteObject.save()
    noteObject = new Note(initialNotes[1])
    await noteObject.save()
})
//Este test realiza una solicitud HTTP GET a la url api/notes, verifica que se respona con un código de estado 200
//Y también se verifica que el encabezado Content-Type se establece en application/json (nuestro formato deseado)
//con respecto a la verificación del encabezado, usamos una expresión regular /application\/json/
//se establece un \ porque normalmente el encabezado es: application/json, entonces para que no se entienda como
//una terminación de la expresión.
test('notes are returned as json', async () => {
    await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/)
})


//Con el siguiente test, ya con datos cargados, comprobamos que el total de elementos sea 2
test('there are two notes', async () => {
    const response = await api.get('/api/notes')

    //expect(response.body).toHaveLength(2)
    expect(response.body).toHaveLength(initialNotes.length)
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

//una vez terminada la ejecución de todas las pruebas, cerramos la conexión a la BBDD
afterAll(() => {
    mongoose.connection.close()
})

//para ejecutar solamente este archivo podemos escribir npm test -- test/note_api.test.js o npm test -- -t 'nombre especifico del test
//Nota: si se ejecuta un solo test, es posible que no se cierre la conexión a la BBDD porque no se ejecutaría
//la función  afterAll