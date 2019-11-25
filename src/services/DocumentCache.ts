import { TripleDocument, Reference, fetchDocument, TripleSubject } from 'tripledoc';
import React from 'react';

const promises: {[iri: string]: Promise<TripleDocument>} = {};

export function getDocument(url: string): Promise<TripleDocument> {
  // Remove fragment identifiers (e.g. `#me`) from the URI:
  console.log('removing fragment', url);
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
export function useDocument(url: string | null): TripleDocument | null {
  // Sometimes a component will need to do some conditional work before
  // it can call `useDocument`. For instance, to display an inbox item,
  // you need to fetch the profile doc it points to, but if the inbox item
  // doesn't correctly point to a profile doc then you want to render that
  // component as "(invalid inbox item)", or not display it at all.
  // Since React doesn't allow conditional calls to hooks, I resorted to
  // sometimes (uselessly) calling `useDocument(null)`. It feels like there
  // must be a better solution for this, but leaving it as this for now:
  const [ doc, setDoc ] = React.useState<TripleDocument | null>(null);

  if (url === null) {
    return null;
  }

  function loadDocument(url: string) {
    return getDocument(url).then((fetched: TripleDocument) => {
      setDoc(fetched);
    }).catch((e: Error) => {
      // console.error('getDocument failed (again?)', e.message);
    });
  }
  
  if (!doc) {
    loadDocument(url);
    return null;
  }
  return Object.assign({
    load: async () => {
      return loadDocument(url);
    },
    save: async () => {
      const newDoc = await doc.save();
      setDoc(newDoc);
      return newDoc;
    }
  }, doc);
}