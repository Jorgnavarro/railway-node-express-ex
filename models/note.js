
const mongoose = require('mongoose');

//dentro del objeto user, para poder usar populate, sea en notes o en users
//se deben definir los types, porque la base de datos no sabe que los ID
//almacenados hacen referencias a documentos en la colección usuario
//por ellos los types se definen en el schema de mongoose con la opción ref

const noteSchema = new mongoose.Schema({
    content:{
      type: String,
      minlength: 5,
      required: true
    },
    date:{
      type: Date,
      required: true
    },
    important: Boolean,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
})
    

noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Note', noteSchema)