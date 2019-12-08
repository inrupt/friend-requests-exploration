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
  var [query, setQueryId] = React.useState('');
  var webId = '';
  var list = usePersonTypeLists();
  console.log(list);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQueryId(event.target.value);
    console.log(query);
  };

  const searchForName = (search: string) => {
    console.log(list);
    return search;
  };
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    webId = searchForName(query);
    props.onSelect(webId);
    setQueryId('');
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className='field has-addons'>
          <div className='control'>
            <input
              className='input'
              onChange={onChange}
              value={query}
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
