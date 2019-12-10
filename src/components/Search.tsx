import React from 'react';
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
  var options: { value: string; label: string | null }[] = [];

  Object.values(people).forEach(function(key, value) {
    var personArray = Object.values(key);
    personArray.forEach(function(value) {
      options.push({ value: value.webId, label: value.fullName });
    });
  });
  console.log('Options: ' + JSON.stringify(options));
  return options;
};
export const Search: React.FC<Props> = props => {
  console.log('Search props ' + JSON.stringify(props));
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
  /* <input
            className='input'
            onChange={onChange}
            value={query}
            name='search'
            id='search'
          /> */
  return (
    <>
      <form onSubmit={onSubmit}>
        <div className='field has-addons'>
          <Select options={options} />

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
