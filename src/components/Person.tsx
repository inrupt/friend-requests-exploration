import React from 'react';
import { fetchDocument, TripleSubject } from 'tripledoc';
import { foaf, vcard } from 'rdf-namespaces';
import { Link } from 'react-router-dom';

interface Props {
  webId: string;
};

export const Person: React.FC<Props> = (props) => {
  const [friendSubject, setFriendSubject] = React.useState();

  React.useEffect(() => {
    fetchDocument(props.webId).then((friendDoc) => {
      setFriendSubject(friendDoc.getSubject(props.webId));
    });
  }, [props.webId]);

  const profile = (friendSubject)
    ? <Profile subject={friendSubject}/>
    : <code>{props.webId}</code>;

  return <>
    {profile}
  </>;
};

const Profile: React.FC<{ subject: TripleSubject }> = (props) => {
  const profile = props.subject;

  const photoUrl = profile.getNodeRef(vcard.hasPhoto);
  const photo = (!photoUrl)
    ? null
    : <>
        <figure className="media-left">
          <p className="image is-64x64">
            <img src={profile.getNodeRef(vcard.hasPhoto)!} alt="Avatar" className="is-rounded"/>
          </p>
        </figure>
      </>;

  return <>
    <div className="media">
      {photo}
      <div className="media-content">
        <p className="content">
          <Link
            to={`/profile/${encodeURIComponent(profile.asNodeRef())}`}
            title="View this person's friends"
          >
            {profile.getLiteral(foaf.name) || profile.getLiteral(vcard.fn) || profile.asNodeRef()}
          </Link>
        </p>
      </div>
    </div>
  </>;
};
