import * as Actions from './actions.js';

const initialState = {
  primaryFolder: undefined,
  fileName: undefined,
  filePath: undefined,
  hasChanged: false,
  errorMessage: undefined,
  models: {},
  flows: [],
  rules: [],
  files: [],
  extensions: [],
  version: 'v2'
};


function modelerApp(state = initialState, action) {
  switch (action.type) {
    case Actions.DIAGRAM_LOADED:
      return Object.assign({}, state, {
        fileName: action.fileName,
        filePath: action.filePath,
        errorMessage: action.errorMessage,
        hasChanged: false
      });
    case Actions.DIAGRAM_CHANGED:
      return Object.assign({}, state, {
        hasChanged: true
      });
    case Actions.DIAGRAM_SAVED:
      return Object.assign({}, state, {
        hasChanged: false
      });
    case Actions.CHANGE_FILENAME:
      return Object.assign({}, state, {
        fileName: action.fileName
      });
    case Actions.SET_PRIMARY_FOLDER:
      return Object.assign({}, state, {
        primaryFolder: action.folder
      });
    case Actions.SET_FILES:
      return Object.assign({}, state, {
        files: action.files
      });
    case Actions.RECEIVE_MODELS_SUCCESS:
      return Object.assign({}, state, {
        models: action.data
      });
    case Actions.EXTENSIONS_RECEIVED:
      return Object.assign({}, state, {
        extensions: action.data
      });
    case Actions.RECEIVE_FLOWS_SUCCESS:
      return Object.assign({}, state, {
        flows: action.data
      });
    case Actions.RECEIVE_RULES_SUCCESS:
      return Object.assign({}, state, {
        rules: action.data
      });
    case Actions.CHANGE_VERSION:
      return Object.assign({}, state, {
        version: action.version
      });
    default:
      return state;
  }
  return state;
}

export default modelerApp;