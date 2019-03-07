import React from 'react';
import SearchResult from './searchresult';

const SearchList = ({results}) => {

  return results.map((result, index) => <SearchResult key={index} restaurant={result}/>);
}

export default SearchList;