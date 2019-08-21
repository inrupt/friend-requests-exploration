import { TripleDocument, TripleSubject } from 'tripledoc';
import { rdf, schema } from 'rdf-namespaces';

export async function addNote(note: string, notesList: TripleDocument): Promise<TripleSubject | null> {
  const newNote = notesList.addSubject();
  newNote.addNodeRef(rdf.type, schema.TextDigitalDocument);
  newNote.addLiteral(schema.text, note);
  newNote.addLiteral(schema.dateCreated, new Date(Date.now()))

  const success = await notesList.save([newNote]);
  if (success) {
    return newNote;
  }
  return null;
}
