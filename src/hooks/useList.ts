import React from 'react';

export function useList<T>() {
  const reducer: React.Reducer<T[], T> = (listSoFar, element) => listSoFar.concat(element);
  return React.useReducer(reducer, []);
}
