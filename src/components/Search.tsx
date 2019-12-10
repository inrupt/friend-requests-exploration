import React, { useEffect } from 'react';
import Select from 'react-select';
import { PersonDetails, PersonType } from '../services/usePersonDetails';
import {
  usePersonTypeLists,
  PersonTypeLists
} from '../services/usePersonTypeLists';
import { string } from 'prop-types';

interface Props {
  onSelect: (webId: string) => void;
}

const createOptions = (people: PersonTypeLists) => {
  //var options: { value: string; label: string | null }[] = [];
  let allOptions: JSX.Element[] = [];
  Object.values(people).forEach(function(key, value) {
    var personArray = Object.values(key);

    const options = personArray.map(function(value) {
      // options.push({ value: value.webId, label: value.fullName });
      return <option value={value.webId} label={value.fullName || ''}></option>;
    });
    allOptions = allOptions.concat(options);
  });

  return allOptions;
};
export const Search: React.FC<Props> = props => {
  var [query, setQueryId] = React.useState('');
  var [selectedOption, setSelectedOption] = React.useState('');
  var webId = '';

  var options = createOptions(usePersonTypeLists());

  const handleChange = (selectedOption: string) => {
    setSelectedOption(selectedOption);
  };
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //setQueryId(event.target.value);
    //change list according to what has been entered so far
  };

  const searchForName = (search: string) => {
    return search;
  };
  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    //based on what was entered select the web id and display..
    webId = searchForName(query);
    props.onSelect(webId);
    setQueryId('');
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className='field has-addons'>
          <input
            className='input'
            list='friendOptions'
            onChange={onChange}
            value={query}
            name='search'
            id='search'
          />
          <datalist id='friendOptions'>{options}</datalist>
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
