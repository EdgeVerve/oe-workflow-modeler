import {
  createStore,
  compose,
  applyMiddleware,
  combineReducers
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import {createLogger} from 'redux-logger/src';
import ModelerApp from './reducers';
import ReduxSubscriber from 'redux-subscriber';

const loggerMiddleware = createLogger();

const ReduxStore = createStore(ModelerApp, applyMiddleware(thunkMiddleware, loggerMiddleware));
const __Subscribe = ReduxSubscriber(ReduxStore);

const Subscribe = function(keys, cb){
  if(Array.isArray(keys)){
    keys.forEach(key => __Subscribe(key, cb));
  } else {
    __Subscribe(keys, cb);
  }
}

export {ReduxStore, Subscribe};