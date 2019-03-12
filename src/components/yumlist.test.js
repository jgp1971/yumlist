import React from 'react';
import {mount, shallow, render} from 'enzyme';
import {Yumlist} from './yumlist';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducers from '../reducers';
import { MemoryRouter } from "react-router-dom";
import { ConnectedSearchbar } from './searchbar'

const props = {
  match: {
    params: {
      id: 'hey'
    }
  },
  favoritesList: []
}

let store = createStore(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())

describe('unit test component Yumlist', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = shallow (
      // <Provider store={store}>
      //   <MemoryRouter initialEntries={[ '/list/:id' ]}>
          <Yumlist {...props} />
      //   </MemoryRouter>
      // </Provider>
    );
  });

  it('all components are present', () => {

    expect(wrapper.find(ConnectedSearchbar).length).toBe(1);
    expect(wrapper.find('Modal').length).toBe(1);
    expect(wrapper.find('img').length).toBe(0);
    expect(wrapper.find('div.yumlist-wrapper').length).toBe(1);
    expect(wrapper.find('div.yumlist-items').length).toBe(1);

  });

  it('when no restaurant is present, the shared list button is hidden', () => {

    const props = {
      match: {
        params: {
          id: 'hey'
        }
      },
      favoritesList: []
    }
    const wrapper = shallow (
      <Yumlist {...props} />
    );
    expect(wrapper.find('button.share-list').length).toBe(0);

  });

  it('when a restaurant is present, a shared list button appears', () => {

    const props = {
      match: {
        params: {
          id: 'hey'
        }
      },
      favoritesList: [{key: 1, id: 1}]
    }
    const wrapper = shallow (
      <Yumlist {...props} />
    );
    expect(wrapper.find('button.share-list').length).toBe(1);
    const spy = jest.spyOn(wrapper.instance(), 'shareList');
    const button = wrapper.find('button.share-list')
    button.simulate('click')
    expect(spy).toHaveBeenCalled();

  });

});

