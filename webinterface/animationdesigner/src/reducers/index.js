import * as ActionTypes from '../actions';
import { routerReducer as routing } from 'react-router-redux';
import { combineReducers } from 'redux';


// Updates error message to notify about the failed fetches.
const errorMessage = (state = null, action) => {
  const { type, error } = action;

  if (type === ActionTypes.RESET_ERROR_MESSAGE) {
    return null;
  } else if (error) {
    return error;
  }

  return state;
};

// Updates the pagination data for different actions.
const handlers = (state = [], action) => {
  if (action.type === ActionTypes.HANDLERS_SUCCESS) {
    return action.response;
  }

  return state;
};

// Updates the pagination data for different actions.
const animations = (state = [], action) => {
  if (action.type === ActionTypes.ANIMATIONS_SUCCESS) {
    return action.response;
  }

  return state;
};

const rootReducer = combineReducers({
  handlers,
  animations,
  errorMessage,
  routing
});

export default rootReducer;
