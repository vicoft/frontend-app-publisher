import {
  COURSE_SUBMITTING_CANCEL,
  COURSE_SUBMITTING_FAILURE,
  COURSE_SUBMIT_RUN,
  COURSE_RUN_SUBMITTING,
  CLEAR_REVIEW_ALERT,
  COURSE_SUBMITTING_SUCCESS,
} from '../constants/courseSubmitInfo';


const initialState = {
  targetRun: null,
  isSubmittingRunReview: false,
  showReviewStatusAlert: false,
  errors: null,
};

function courseSubmitInfo(state = initialState, action) {
  switch (action.type) {
    case COURSE_SUBMIT_RUN:
      return Object.assign({}, state, {
        targetRun: action.targetRun,
        isSubmittingRunReview: false,
        errors: null,
      });
    case COURSE_RUN_SUBMITTING:
      return Object.assign({}, state, {
        isSubmittingRunReview: true,
      });
    case COURSE_SUBMITTING_SUCCESS:
      return Object.assign({}, state, {
        isSubmittingRunReview: false,
        showReviewStatusAlert: true,
        errors: null,
      });
    case CLEAR_REVIEW_ALERT:
      return Object.assign({}, state, {
        showReviewStatusAlert: false,
      });
    case COURSE_SUBMITTING_CANCEL:
      return Object.assign({}, state, {
        isSubmittingRunReview: false,
        errors: null,
      });
    case COURSE_SUBMITTING_FAILURE:
      return Object.assign({}, state, {
        isSubmittingRunReview: false,
        errors: action.errors,
      });
    default:
      return state;
  }
}

export default courseSubmitInfo;
