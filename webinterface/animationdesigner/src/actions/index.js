import { CALL_API } from '../middleware/api';

export const HANDLERS_REQUEST = 'HANDLERS_REQUEST'
export const HANDLERS_SUCCESS = 'HANDLERS_SUCCESS'
export const HANDLERS_FAILURE = 'HANDLERS_FAILURE'

// Fetches a page of handlers.
// Relies on the custom API middleware defined in ../middleware/api.js.
const fetchHandlers = (endpoint) => ({
  [CALL_API]: {
    types: [ HANDLERS_REQUEST, HANDLERS_SUCCESS, HANDLERS_FAILURE ],
    endpoint
  }
});

// Fetches a page of handlers.
// Bails out if page is cached and user didn't specifically request next page.
// Relies on Redux Thunk middleware.
export const loadHandlers = () => (dispatch, getState) => {
  return dispatch(fetchHandlers(`handlers/`));
};

export const ANIMATIONS_REQUEST = 'ANIMATIONS_REQUEST'
export const ANIMATIONS_SUCCESS = 'ANIMATIONS_SUCCESS'
export const ANIMATIONS_FAILURE = 'ANIMATIONS_FAILURE'

const fetchAnimations = (endpoint) => ({
  [CALL_API]: {
    types: [ ANIMATIONS_REQUEST, ANIMATIONS_SUCCESS, ANIMATIONS_FAILURE ],
    endpoint
  }
});

export const loadAnimations = () => (dispatch, getState) => {
  return dispatch(fetchAnimations(`animations/`));
};

export const RESET_ERROR_MESSAGE = 'RESET_ERROR_MESSAGE';

// Resets the currently visible error message.
export const resetErrorMessage = () => ({
    type: RESET_ERROR_MESSAGE
});
