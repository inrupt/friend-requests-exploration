import React from 'react';
import { RouteComponentProps, Link } from '@reach/router';

type Props = RouteComponentProps;

export const Home: React.FC<Props> = (props) => {
  return <>
    <section className="section">
      <div className="buttons">
        <Link
          to="publisher"
          className="button is-primary"
        >Publisher</Link>
        <Link
          to="consumer"
          className="button"
        >Consumer</Link>
      </div>
    </section>
  </>;
};
