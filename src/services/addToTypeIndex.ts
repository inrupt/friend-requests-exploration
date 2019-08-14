import { TripleDocument, NodeRef } from 'tripledoc';
import { rdf, solid } from 'rdf-namespaces';

export async function addToTypeIndex (
  typeIndex: TripleDocument,
  document: TripleDocument,
  forClass: NodeRef,
) {
  const typeRegistration = typeIndex.addSubject();
  typeRegistration.addNodeRef(rdf.type, solid.TypeRegistration)
  typeRegistration.addNodeRef(solid.instance, document.asNodeRef())
  typeRegistration.addNodeRef(solid.forClass, forClass)
  return typeIndex.save([ typeRegistration ]);
}
