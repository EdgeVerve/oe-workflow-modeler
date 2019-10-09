export const DIAGRAM_LOADED = 'DIAGRAM_LOADED';
export function diagramLoadedAction(fileName, filePath, errorMessage) {
  return {
    type: DIAGRAM_LOADED,
    fileName,
    filePath,
    errorMessage
  };
}

export const CHANGE_FILENAME = 'CHANGE_FILENAME';
export function changeFileNameAction(fileName) {
  return {
    type: CHANGE_FILENAME,
    fileName
  };
}


export const DIAGRAM_SAVED = 'DIAGRAM_SAVED';
export function diagramSavedAction() {
  return {
    type: DIAGRAM_SAVED
  };
}
export const DIAGRAM_CHANGED = 'DIAGRAM_CHANGED';
export function diagramChangedAction() {
  return {
    type: DIAGRAM_CHANGED
  };
}

export const SET_PRIMARY_FOLDER = 'SET_PRIMARY_FOLDER';
export function setPrimaryFolderAction(folder){
  return {
    type: SET_PRIMARY_FOLDER,
    folder
  }
}

export const SET_FILES = 'SET_FILES';
export function setFilesAction(files){
  return {
    type: SET_FILES,
    files
  }
}

export const RECEIVE_MODELS_SUCCESS = 'RECEIVE_MODELS_SUCCESS';
export function receiveModelsSuccessAction(modelsData) {
  return {
    type: RECEIVE_MODELS_SUCCESS,
    data: modelsData
  };
}

export const RECEIVE_FLOWS_SUCCESS = 'RECEIVE_FLOWS_SUCCESS';
export function receiveFlowsSuccessAction(flowsData) {
  return {
    type: RECEIVE_FLOWS_SUCCESS,
    data: flowsData
  };
}

export const RECEIVE_RULES_SUCCESS = 'RECEIVE_RULES_SUCCESS';
export function receiveRulesSuccessAction(rulesData) {
  return {
    type: RECEIVE_RULES_SUCCESS,
    data: rulesData
  };
}

export const EXTENSIONS_RECEIVED = 'EXTENSIONS_RECEIVED';
export function extensionsReceivedAction(data) {
  return {
    type: EXTENSIONS_RECEIVED,
    data: data
  };
}

export const CHANGE_VERSION = 'CHANGE_VERSION';
export function changeVersionAction(version) {
  return {
    type: CHANGE_VERSION,
    version
  };
}
