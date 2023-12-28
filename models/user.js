const mongoose = require('mongoose');
//tuvimos que reversar una versión de mongoose para poder usar 
//el uniqueValidator
const uniqueValidator = require('mongoose-unique-validator')

//en username, podemos ahora usar "unique: true"
//con respecto a notes es como asociamos el otro modelo en los users,
//Un usuario puede tener muchas notas
const userSchema = new mongoose.Schema({
   username:{
    type: String,
    unique: true,
   }, 
   name: String,
   passwordHash: String,
   notes: [
     {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'Note'
     }
   ],
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        //the passwordHash should not be revealed
        delete returnedObject.passwordHash
    }
})

//de esta forma es como se aplica el plugin del uniqueValidator
userSchema.plugin(uniqueValidator)

const User = mongoose.model('User', userSchema)

module.exports = User