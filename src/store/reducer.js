// third party
import { combineReducers } from 'redux';

// project import
import customizationReducer from './customizationReducer';
import systemRightsReducer from '../reduxSlices/systemRightSlice';
import { baseApi } from 'services/baseApi';
import  authSlice from '../reduxSlices/authSlice';
// ==============================|| REDUCER ||============================== //

const reducer = combineReducers({
  auth:authSlice,
  customization: customizationReducer,
  systemRights: systemRightsReducer,
  [baseApi.reducerPath]: baseApi.reducer
});

export default reducer;
