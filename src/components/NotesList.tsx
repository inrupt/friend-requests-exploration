import React from 'react';
import { addNote } from '../services/addNote';
import { getNotes, useNotesList } from '../hooks/useNotesList';
import { useList } from '../hooks/useList';
import { TripleSubject } from 'tripledoc';
import { schema } from 'rdf-namespaces';

export const NotesList: React.FC = () => {
  const notesList = useNotesList();
  const [formContent, setFormContent] = React.useState('');

  if (!notesList) {
    return null;
  }
  const notes = getNotes(notesList);

  async function saveNote(event: React.FormEvent) {
    event.preventDefault();
    if (!notesList) {
      return;
    }
    await addNote(formContent, notesList);
    setFormContent('');
  }

  const noteElements = notes.sort(byDate).map((note, i) => (
    <section key={`note${i}`} className="section content">
      <pre>
        {note.getLiteral(schema.text)}
      </pre>
    </section>
  ));

  return (
    <>
      <section className="section">
        <form onSubmit={saveNote}>
          <div className="field">
            <div className="control">
              <textarea
                onChange={(e) => { e.preventDefault(); setFormContent(e.target.value); }}
                name="note"
                id="note"
                className="textarea"
                value={formContent}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button type="submit" className="button is-primary">Add note</button>
            </div>
          </div>
        </form>
      </section>
      {noteElements}
    </>
  );
};

function byDate(note1: TripleSubject, note2: TripleSubject): number {
  const date1 = note1.getLiteral(schema.dateCreated);
  const date2 = note2.getLiteral(schema.dateCreated);
  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    return 0;
  }

  return date2.getTime() - date1.getTime();
}
