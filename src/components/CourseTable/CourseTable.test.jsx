import React from 'react';
import { shallow } from 'enzyme';

import CourseTable from './index';

describe('CourseTable', () => {
  it('shows a table', () => {
    const component = shallow(<CourseTable />);
    expect(component).toMatchSnapshot();
  });

  it('hides table and button when blacklisted', () => {
    const publisherUserInfo = { organizations: [{ key: 'fake1', name: 'fake_name1' }] };
    const component = shallow(<CourseTable publisherUserInfo={publisherUserInfo} />);
    expect(component).toMatchSnapshot();
  });

  it('displays table and button when not blacklisted', () => {
    const publisherUserInfo = { organizations: [{ key: 'fake2', name: 'fake_name2' }] };
    const component = shallow(<CourseTable publisherUserInfo={publisherUserInfo} />);
    expect(component).toMatchSnapshot();
  });

  it('displays table and button when no blacklist exists', () => {
    process.env.ORG_BLACKLIST = [];
    const publisherUserInfo = { organizations: [{ key: 'fake1', name: 'fake_name1' }] };
    const component = shallow(<CourseTable publisherUserInfo={publisherUserInfo} />);
    expect(component).toMatchSnapshot();
  });

  it('displays table and button when user has no orgs', () => {
    const publisherUserInfo = { organizations: [] };
    const component = shallow(<CourseTable publisherUserInfo={publisherUserInfo} />);
    expect(component).toMatchSnapshot();
  });
});
