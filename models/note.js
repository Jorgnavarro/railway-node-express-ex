
const mongoose = require('mongoose');

const url = process.env.MONGODB_URI

console.log('conecting to', url)

mongoose.connect(url)
    .then(result =>{
        console.log('Conected to MongoDB');
    })
    .catch(err => {
        console.log('Error connecting to MongoDB: ', err.message);
    })

const noteSchema = new mongoose.Schema({
    content: String,
    date: Date,
    important: Boolean,
})
    

noteSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Note', noteSchema)