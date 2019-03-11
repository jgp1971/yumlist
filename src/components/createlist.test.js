import React from 'react';
import {mount, shallow} from 'enzyme';
import CreateList from './createlist';

describe('unit test component CreateList', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(<CreateList />);
  });
  it('all components are present', () => {
    expect(wrapper.find('img').length).toBe(1);
    expect(wrapper.find('div').length).toBe(3);
    expect(wrapper.find('h2').length).toBe(1);
    expect(wrapper.find('input').length).toBe(2);
    expect(wrapper.find('button').length).toBe(1);
  });

  it('calls saveList when clicked if both inputs have text', () => {
    const firstInput = wrapper.find({ name: 'list-title' })
    firstInput.simulate('change', { target: { value: 'aa' } })
    const secondInput = wrapper.find({ name: 'list-details' })
    secondInput.simulate('change', { target: { value: 'aa' } })
    wrapper.instance().updateSendEnable();
    const spy = jest.spyOn(wrapper.instance(), 'saveList');
    const button = wrapper.find('button')
    button.simulate('click')
    expect(spy).toHaveBeenCalled();
  });

  it('does not call saveList when clicked if any inputs is empty', () => {
    const firstInput = wrapper.find({ name: 'list-title' })
    firstInput.simulate('change', { target: { value: '' } })
    const secondInput = wrapper.find({ name: 'list-details' })
    secondInput.simulate('change', { target: { value: 'aa' } })
    wrapper.instance().updateSendEnable();
    const spy = jest.spyOn(wrapper.instance(), 'saveList');
    const button = wrapper.find('button')
    button.simulate('click')
    expect(spy).not.toHaveBeenCalled();
  });
});

