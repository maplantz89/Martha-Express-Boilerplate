const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNotes = note => ({
  id: note.id,
  title: xss(note.title),
  date_modified: note.date_modified,
  content: xss(note.content),
});

notesRouter
  .route('/')
  .get((req, res, next) => {
    NotesService.getAllNotes(req.app.get('db'))
      .then(notes => {
        res.json(notes.map(serializeNotes));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, date_modified, content } = req.body;
    const newNote = { title };

    for (const [key, value] of Object.entries(newNote)){
      if(value === null){
        return res.status(400).json({
          error: {message: `Missing ${key}`}
        });
      }
    }

    newNote.date_modified = date_modified;
    newNote.content = content;

    NotesService.insertNotes(
      req.app.get('db'),
      newNote
    )
      .then(note =>{
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNotes(note));
      })
      .catch(next);
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    NotesService.getById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if(!note){
          return res.status(404).json({
            error: {message: 'Note does not exist'}
          });
        }
        res.note = note;
        next();
      })
      .catch(next); 
  })
  .get((req, res, next) =>{
    res.json(serializeNotes(res.note));
  })
  .delete((res, req, next)=> {
    NotesService.deleteNotes(
      req.app.get('db'),
      req.params.note_id
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });


module.exports = notesRouter;