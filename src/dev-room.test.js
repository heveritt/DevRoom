import React from 'react';
import ReactDOM from 'react-dom';
import DevRoom from './dev-room';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<DevRoom />, div);
});
