import {
  REQUEST_COURSE_OPTIONS_FAIL,
  REQUEST_COURSE_OPTIONS_SUCCESS,
  REQUEST_COURSE_OPTIONS,
} from '../constants/courseOptions';


const initialState = {
  data: {},
  isFetching: false,
  error: null,
};

function courseOptions(state = initialState, action) {
  switch (action.type) {
    case REQUEST_COURSE_OPTIONS_FAIL:
      return Object.assign({}, state, {
        data: {},
        isFetching: false,
        error: action.error,
      });
    case REQUEST_COURSE_OPTIONS_SUCCESS:
      return Object.assign({}, state, {
        data: action.data,
        isFetching: false,
        error: null,
      });
    case REQUEST_COURSE_OPTIONS:
      return Object.assign({}, state, {
        data: {},
        isFetching: true,
        error: null,
      });
    default:
      return state;
  }
}

export default courseOptions;
