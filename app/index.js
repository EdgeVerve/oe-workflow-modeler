import $ from 'jquery';

import {
  CreateModeler
} from './parts/load-modeler';
import {ConfigureButtons} from './parts/configure-handlers';

import {
  ConfigureScriptEditor
} from './parts/load-editor';


import 'oe-message-handler/oe-message-handler.js'

import '../styles/app.less';

$(function () {
  let bpmnModeler = CreateModeler('#js-canvas', '#js-properties-panel');
  // bootstrap diagram functions
  ConfigureButtons(bpmnModeler);
  ConfigureScriptEditor();
});