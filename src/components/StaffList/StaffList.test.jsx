import React from 'react';
import { mount, shallow } from 'enzyme';
import MockAdapter from 'axios-mock-adapter';

import apiClient from '../../data/apiClient';
import StaffList from './index';

const mockClient = new MockAdapter(apiClient);
apiClient.isAccessTokenExpired = jest.fn();
apiClient.isAccessTokenExpired.mockReturnValue(false);

const input = {
  value: [
    {
      uuid: '6f23f2f8-10dd-454a-8497-2ba972c980c4',
      given_name: 'First',
      family_name: 'Last',
      profile_image_url: '/media/people/profile_images/6f23f2f8-10dd-454a-8497-2ba972c980c4-a411afec9477.jpeg',
    },
    {
      uuid: '17d0e2c0-9a02-421b-93bf-d081339090cc',
      given_name: 'Pippa',
      family_name: null,
      profile_image_url: '/media/people/profile_images/17d0e2c0-9a02-421b-93bf-d081339090cc-68912d27b6e7.jpeg',
    },
    {
      uuid: '2aba6189-ad7e-45a8-b269-bea071b80391',
      given_name: 'Dave',
      family_name: 'Grohl',
      profile_image_url: '/media/people/profile_images/2aba6189-ad7e-45a8-b269-bea071b80391-11df6812f839.png',
    },
  ],
  onChange: jest.fn(),
};
const owners = [{ key: 'MITx' }];
const autoCompletePersonResponses = {
  long: [
    {
      uuid: 'a7d0e2c0-9a02-421b-93bf-d081339090cc',
      profile_image_url: '/assets/new-80.png',
      given_name: 'Pippi',
      family_name: 'Longstocking',
    },
    {
      uuid: 'b7d0e2c0-9a02-421b-93bf-d081339090cc',
      profile_image_url: '/assets/new-80.png',
      given_name: 'Hank',
      family_name: 'Longfellow',
    }],
};

const defaultProps = {
  input,
  meta: {
    submitFailed: false,
    error: '',
  },
  courseUuid: '11111111-1111-1111-1111-111111111111',
  courseRunKey: 'DemoX+TestCourse',
};

const newStaffer = {
  uuid: '00000000-0000-0000-0000-000000000000',
  profile_image_url: '/assets/pic.png',
  given_name: 'Person',
  family_name: 'McPerson',
};

const referredProps = Object.assign(
  {},
  defaultProps,
  {
    stafferInfo: {
      data: newStaffer,
    },
    sourceInfo: {
      referringRun: 'DemoX+TestCourse',
    },
  },
);

jest.mock('../Staffer', () => ({
  Staffer: () => <div className="mock-staffer" />,
  // mock a generic name function so that drag and drop works
  getStafferName: staffer => staffer.given_name,
}));

describe('StaffList', () => {
  afterEach(() => {
    // Clear onChange's call count after each test
    input.onChange.mockClear();
    // reset api client response
    mockClient.reset();
  });

  it('renders a list of staff members and an autocomplete input', () => {
    const component = shallow(<StaffList {...defaultProps} />);
    expect(component).toMatchSnapshot();
  });

  it('renders correctly with referred props', () => {
    const component = shallow(<StaffList {...referredProps} />);
    expect(component).toMatchSnapshot();
  });

  it('renders correctly with an error after failed submission', () => {
    const metaFailedProps = Object.assign(
      {},
      defaultProps,
      {
        meta: {
          submitFailed: true,
          error: 'This field is required',
        },
      },
    );
    const component = shallow(<StaffList {...metaFailedProps} />);
    expect(component).toMatchSnapshot();
  });

  it('gets/clears suggestions for autocomplete', (done) => {
    mockClient.onGet('http://localhost:18381/api/v1/search/person_typeahead/?q=long&org=MITx')
      .replyOnce(200, JSON.stringify(autoCompletePersonResponses.long));
    const component = mount(<StaffList {...defaultProps} owners={owners} />);
    component.instance().onSuggestionsFetchRequested({ value: 'long' }).then(() => {
      let { suggestions } = component.state();
      // check that we get the expected response from the API
      expect(suggestions[0].family_name).toEqual('Longstocking');
      expect(suggestions[0].uuid).toEqual('a7d0e2c0-9a02-421b-93bf-d081339090cc');
      // check that we get the 'add new' link at the bottom of our expected results.
      expect(suggestions[2].url).not.toBeNull();
      expect(suggestions[2].item_text).toEqual('Add New Instructor');

      // check that clearing suggestions...clears suggestions
      component.instance().onSuggestionsClearRequested();
      ({ suggestions } = component.state());
      expect(suggestions.length).toEqual(0);
      // required because we are 'expect'ing inside of an async promise
      done();
    });
  });

  it('gets no suggestions for short autocomplete', (done) => {
    const component = mount(<StaffList {...defaultProps} />);
    component.instance().onSuggestionsFetchRequested({ value: 'lo' }).then(() => {
      const state = component.state().suggestions;
      // check that we get no suggestions for a query that is too short
      expect(state.length).toEqual(0);
      // required because we are 'expect'ing inside of an async promise
      done();
    });
  });

  it('updates selected staff on form', () => {
    const component = mount(<StaffList {...defaultProps} />);
    let { staffList } = component.state();
    // we start with 3 staff members
    expect(staffList.length).toEqual(3);
    component.instance().onSuggestionEntered(
      null,
      { suggestion: autoCompletePersonResponses.long[0] },
    );
    // confirm that entering a staff member not in the list adds it
    ({ staffList } = component.state());
    expect(staffList.length).toEqual(4);
    // confirm that entering a staff member already in the list does NOT add it
    component.instance().onSuggestionEntered(
      null,
      { suggestion: autoCompletePersonResponses.long[0] },
    );
    expect(staffList.length).toEqual(4);
  });

  it('correctly handles removing members of the staff', () => {
    const component = mount(<StaffList {...defaultProps} />);
    let staffers = component.find('.mock-staffer');
    expect(staffers).toHaveLength(input.value.length);

    const firstStaffer = component.state().staffList[0];
    // Petend we deleted the first staffer
    const firstUuid = input.value[0].uuid;
    component.instance().handleRemove(firstUuid);

    // Verify that the onChange method has been called
    expect(input.onChange).toBeCalled();

    // Verify that the first staffer has been removed
    component.update();
    staffers = component.find('.mock-staffer');
    expect(staffers).toHaveLength(input.value.length - 1);

    const newFirstStaffer = component.state().staffList[0];
    expect(firstStaffer).not.toEqual(newFirstStaffer);
  });

  it('correctly handles reordering members of the staff', () => {
    const component = mount(<StaffList {...defaultProps} />);
    // Find the first staffer.
    const firstStaffer = component.state().staffList[0].uuid;

    const result = {
      source: {
        index: 0,
      },
      destination: {
        index: 2,
      },
    };
    // Pretend we dragged the first staffer to the end.
    component.instance().onDragEnd(result);

    // Verify that the onChange method has been called
    expect(input.onChange).toBeCalled();

    // Verify that it is on the end.
    expect(firstStaffer).toEqual(component.state().staffList[2].uuid);
  });

  it('does not re-order when dragged outside of the list', () => {
    const component = mount(<StaffList {...defaultProps} />);
    // Find the first staffer.
    const firstStaffer = component.state().staffList[0].uuid;

    const result = {
      source: {
        index: 0,
      },
    };
    // Pretend we dragged the first staffer outside the list.
    component.instance().onDragEnd(result);

    // Verify that the onChange method has NOT been called
    expect(input.onChange).not.toBeCalled();
    expect(firstStaffer).toEqual(component.state().staffList[0].uuid);
  });

  it('does not re-order when dragged to the same position', () => {
    const component = mount(<StaffList {...defaultProps} />);
    // Find the first staffer.
    const firstStaffer = component.state().staffList[0].uuid;

    const result = {
      source: {
        index: 0,
      },
      destination: {
        index: 0,
      },
    };
    // Pretend we dragged the first staffer to their original position.
    component.instance().onDragEnd(result);
    // Verify that the onChange method has NOT been called
    expect(input.onChange).not.toBeCalled();
    expect(firstStaffer).toEqual(component.state().staffList[0].uuid);
  });

  it('adds the referred staffer to state when one is given', () => {
    const component = mount(<StaffList {...referredProps} />);

    const { staffList } = component.state();

    expect(staffList[staffList.length - 1]).toEqual(newStaffer);
  });
});
