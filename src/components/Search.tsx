import React from 'react';
import { PersonDetails, PersonType } from '../services/usePersonDetails';
import {
  usePersonTypeLists,
  PersonTypeLists
} from '../services/usePersonTypeLists';

interface Props {
  onSelect: (webId: string) => void;
}

export const Search: React.FC<Props> = props => {
  var [webId, setWebId] = React.useState('');
  var search: string = '';

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWebId(event.target.value);
  };

  const searchForName = (search: string) => {
    webId = search;
    return webId;
  };
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    webId = searchForName(search);
    props.onSelect(webId);
    setWebId('');
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className='field has-addons'>
          <div className='control'>
            <input
              className='input'
              onChange={onChange}
              value={search}
              type='url'
              name='search'
              id='search'
            />
          </div>
          <div className='control'>
            <button type='submit' className='button is-primary'>
              Search
            </button>
          </div>
        </div>
      </form>
    </>
  );
};
