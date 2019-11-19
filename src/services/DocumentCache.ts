import { TripleDocument, Reference, fetchDocument, TripleSubject } from 'tripledoc';
import React from 'react';

const promises: {[iri: string]: Promise<TripleDocument>} = {};

function getDocument(url: string): Promise<TripleDocument> {
  // Remove fragment identifiers (e.g. `#me`) from the URI:
  const docUrl = new URL(url);
  const documentRef: Reference = docUrl.origin + docUrl.pathname + docUrl.search;

  if (typeof promises[documentRef] !== 'undefined') {
    return promises[documentRef];
  }

  const documentPromise = fetchDocument(url).then((document) => {
    // Overwrite the `.save()` method on the Document to make sure the cache is updated when it's called:
    const actualSave = document.save;
    const cachingSave = async (subjects?: TripleSubject[]) => {
      const updatedDocument = await actualSave(subjects);
      promises[documentRef] = Promise.resolve(updatedDocument);
      return updatedDocument;
    };

    return {
      ...document,
      save: cachingSave,
    };
  });
  promises[documentRef] = documentPromise;

  return documentPromise;
}

// FIXME: make this shared state across the whole app?
// I think this way it will work to trigger a re-render of the
// current component, but not of others.
export function useDocument(url: string): TripleDocument | null {
  const [ doc, setDoc ] = React.useState<TripleDocument | null>(null);
  if (!doc) {
    getDocument(url).then((fetched: TripleDocument) => {
      setDoc(fetched);
    }).catch((e: Error) => {
      // console.error('getDocument failed (again?)', e.message);
    });
    return null;
  }
  return Object.assign({
    save: async () => {
      const newDoc = await doc.save();
      setDoc(newDoc);
      return newDoc;
    }
  }, doc);
}