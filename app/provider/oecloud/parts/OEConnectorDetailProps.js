/**
 * Implements OeConnector tab and related properties handling on Service Node.
 * OeConnector allows programatic invocation of oeCloud Model Methods from workflow engine.
 * This works only if workflow engine is running embedded inside oeCloud application.
 * Use RestConnector if engine and oeCloud application are running as separate instances. 
 */

const ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');
const CmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
const EntryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

import {
  OEInputOutputHelper
} from '../helper/OEInputOutputHelper';

import {
  escapeHTML
} from 'bpmn-js-properties-panel/lib/Utils';

const domQuery = require('min-dom').query;
const domClear = require('min-dom').clear;
const domify = require('min-dom').domify;

import {ReduxStore} from '../../../state/store';

function getImplementationType(element) {
  return ImplementationTypeHelper.getImplementationType(element);
}

function getBusinessObject(element) {
  return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function getConnector(bo) {
  return OEInputOutputHelper.getOEConnector(bo);
}

function isConnector(element) {
  return getImplementationType(element) === 'OeConnector';
}

// TODO
//loadModelData();

var MODEL_OPTIONS = [];
var METHOD_OPTIONS = [];

function getModelOptions(modelData){
  return [{
    value: ''
  }].concat(Object.keys(modelData).map(m => {
    return {
      name: m,
      value: m
    }
  }));
}

function getMethodOptions(model, modelData){
  let METHOD_OPTIONS = [];
  if (model && modelData[model]) {
    METHOD_OPTIONS = [{
      value: '',
      name: ''
    }].concat(Object.keys(modelData[model]).map(m => {
      return {
        name: m,
        value: m
      }
    }));
  }
  return METHOD_OPTIONS;
}

function OEConnectorDetailProps(group, element, bpmnFactory) {

  //var ctype = ImplementationTypeHelper.getImplementationType(element);
  //if (ctype === 'OeConnector') {
    var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
    var co = bo && getConnector(bo);
    var model = co && co.get('model');


    let modelData = ReduxStore.getState().models;

    group.entries.push(EntryFactory.selectBox({
      id: 'connectorModel',
      label: 'Model',
      modelProperty: 'model',
      selectOptions: getModelOptions(modelData),

      get: function (element, node) {
        var bo = getBusinessObject(element);
        var connector = bo && getConnector(bo);
        var value = connector && connector.get('model');
        return {
          model: value
        };
      },

      set: function (element, values, node) {
        var bo = getBusinessObject(element);
        var connector = getConnector(bo);

        // TODO
        //populateMethods(values.model);
        return CmdHelper.updateBusinessObject(element, connector, {
          model: values.model || undefined
        });
      },
    }));


    group.entries.push(EntryFactory.selectBox({
      id: 'method',
      label: 'Method',
      selectOptions: getMethodOptions(model, modelData),
      modelProperty: 'method',

      get: function (element, node) {
        var bo = getBusinessObject(element);
        var connector = bo && getConnector(bo);
        var model = connector && connector.get('model');

        var selectBox = domQuery('select[name=method]', node);
        domClear(selectBox);
        var METHOD_OPTIONS = getMethodOptions(model, modelData);
        METHOD_OPTIONS.forEach(function (option) {
          var optionEntry = domify('<option value="' + escapeHTML(option.value) + '">' + escapeHTML(option.name) + '</option>');
          selectBox.appendChild(optionEntry);
        });

        var value = connector && connector.get('method');
        return {
          method: value
        };
      },
      set: function (element, values, node) {
        var bo = getBusinessObject(element);
        var connector = getConnector(bo);
        return CmdHelper.updateBusinessObject(element, connector, {
          method: values.method || undefined
          //        args: values.args || undefined
        });
      }
    }));

    group.entries.push(EntryFactory.textField({
      id: 'args',
      label: 'Arguments',
      modelProperty: 'args',
      expandable: true,

      get: function (element, node) {
        var bo = getBusinessObject(element);
        var connector = bo && getConnector(bo);
        var value = connector && connector.get('args');
        return {
          args: value
        };
      },

      set: function (element, values, node) {
        var bo = getBusinessObject(element);
        var connector = getConnector(bo);
        return CmdHelper.updateBusinessObject(element, connector, {
          args: values.args || undefined
        });
      }

    }));
  //}

  /***************************************Model configuration for oe connector********************************************/
};

export {
  OEConnectorDetailProps
};