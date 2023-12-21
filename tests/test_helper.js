const Note = require('../models/note')

const initialNotes = [
    {
        content: 'You can do it, dont feel fear, work hard and have patient, everything will come to you',
        date: new Date(),
        important: true,
    },
    {
        content: 'Browser can execute only Javascript',
        date: new Date(),
        important: true,
    },
]

const nonExistingId = async () => {
    const note = new Note({content: "Creating a new note for delete and test", date: new Date()})
    await note.save()
    await note.remove()

    return note._id.toString()
}

const notesInDb = async () => {
    const notes = await Note.find({})

    return notes.map(note => note.toJSON())
}

module.exports = {
    initialNotes, 
    nonExistingId,
    notesInDb
}