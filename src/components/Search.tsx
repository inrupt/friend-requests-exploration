import React, { useEffect } from 'react';
import { PersonType } from '../services/usePersonDetails';
import { getPersonTypeLists, PersonTypeLists } from 'solid-friend-picker';

interface Props {
  onSelect: (webId: string) => void;
}

const createOptions = (people: PersonTypeLists) => {
  let allOptions: JSX.Element[] = [];
  Object.values(people).forEach(function(key, value) {
    let personArray = Object.values(key);

    const options = personArray.map(function(value) {
      return <option value={value.webId} label={value.fullName || ''}></option>;
    });
    allOptions = allOptions.concat(options);
  });

  return allOptions;
};
export const Search: React.FC<Props> = props => {
  let [query, setQueryId] = React.useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let [list, setList] = React.useState({
    [PersonType.me]: {},
    [PersonType.requester]: {},
    [PersonType.requested]: {},
    [PersonType.friend]: {},
    [PersonType.blocked]: {},
    [PersonType.stranger]: {}
  });
  let [selectedOption, setSelectedOption] = React.useState('');  // eslint-disable-line @typescript-eslint/no-unused-vars
  let webId = '';
  let [options, setOptions] = React.useState<JSX.Element[]>([]);

  // const handleChange = (selectedOption: string) => {
  //   setSelectedOption(selectedOption);
  // };
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQueryId(event.target.value);
    //change list according to what has been entered so far
  };

  useEffect(() => {
    (async () => {
      let generator = getPersonTypeLists();
      console.log('Generator ' + JSON.stringify(generator));
      //think I need to call generator.next()...
      for await (let list of generator) {
        console.log('Lists in react app' + JSON.stringify(list));
        setList(list);
        setOptions(createOptions(list));
      }
    })();
  }, []);
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
