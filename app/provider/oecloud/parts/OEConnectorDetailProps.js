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

import {
  ReduxStore
} from '../../../state/store';

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
var CUSTOM_MODEL_NAME = 'Custom Model';
var CUSTOM_METHOD_NAME = 'Custom Method';

function getModelOptions(modelData) {
  return [{
    name: '',
    value: ''
  }].concat(Object.keys(modelData).map(m => {
    return {
      name: m,
      value: m
    }
  })).concat({
    name: CUSTOM_MODEL_NAME,
    value: CUSTOM_MODEL_NAME
  });
}

function getMethodOptions(model, modelData) {
  let METHOD_OPTIONS = [{
    name: '',
    value: ''
  }];
  if (model && modelData[model]) {
    METHOD_OPTIONS = METHOD_OPTIONS.concat(Object.keys(modelData[model]).map(m => {
      return {
        name: m,
        value: m
      }
    }));
  }
  return METHOD_OPTIONS.concat({
    name: CUSTOM_METHOD_NAME,
    value: CUSTOM_METHOD_NAME
  });
}

function OEConnectorDetailProps(group, element, bpmnFactory) {

  //var ctype = ImplementationTypeHelper.getImplementationType(element);
  //if (ctype === 'OeConnector') {
  var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
  var modelValue = bo.$attrs.modelValue;
  let modelData = ReduxStore.getState().models;

  group.entries.push(EntryFactory.selectBox({
    id: 'modelValue',
    label: 'Select Model',
    modelProperty: 'modelValue',
    selectOptions: getModelOptions(modelData),

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var value = bo && bo.get('modelValue');
      var connector = bo && getConnector(bo);
      if (connector && connector.get('model')) {
        if (!value) {
          value = connector.get('model');
        }
        if (value && !modelData.hasOwnProperty(value)) {
          value = CUSTOM_MODEL_NAME;
        }
        bo.$attrs.modelValue = value;
        if (value !== CUSTOM_MODEL_NAME) {
          connector.set('model', value);
        }
      }
      return {
        modelValue: value
      };
    },

    set: function (element, values, node) {
      var res = {};
      if (values.modelValue !== '') {
        res.modelValue = values.modelValue;
      } else {
        res.modelValue = undefined;
      }
      return CmdHelper.updateProperties(element, res);
    },
  }));

  group.entries.push(EntryFactory.textField({
    id: 'connectorModel',
    label: 'Model',
    modelProperty: 'model',

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
      return CmdHelper.updateBusinessObject(element, connector, {
        model: values.model || undefined
      });
    },

    hidden: function (element) {
      return element.businessObject.$attrs.modelValue !== CUSTOM_MODEL_NAME
    }
  }));


  group.entries.push(EntryFactory.selectBox({
    id: 'methodValue',
    label: 'Select Method',
    selectOptions: getMethodOptions(modelValue, modelData),
    modelProperty: 'methodValue',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);
      var modelValue = bo.get('modelValue');
      var value = bo.get('methodValue');
      var selectBox = domQuery('select[name=methodValue]', node);
      domClear(selectBox);
      var METHOD_OPTIONS = getMethodOptions(modelValue, modelData);
      METHOD_OPTIONS.forEach(function (option) {
        var optionEntry = domify('<option value="' + escapeHTML(option.value) + '">' + escapeHTML(option.name) + '</option>');
        selectBox.appendChild(optionEntry);
      });

      if (modelValue === CUSTOM_MODEL_NAME || !modelData.hasOwnProperty(modelValue)) {
        value = CUSTOM_METHOD_NAME;
      }
      if (!value && connector && connector.get('method')) {
        value = connector.get('method');
      }
      bo.$attrs.methodValue = value;
      if (value !== CUSTOM_METHOD_NAME) {
        connector.set('method', value);
      }
      return {
        methodValue: value
      };
    },

    set: function (element, values, node) {
      var result = {};
      if (values.methodValue !== '') {
        result.methodValue = values.methodValue;
      } else {
        result.methodValue = undefined;
      }
      return CmdHelper.updateProperties(element, result)
    }

  }));

  group.entries.push(EntryFactory.textField({
    id: 'method',
    label: 'Method',
    modelProperty: 'method',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);
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
      });
    },
    hidden: function (element) {
      return element.businessObject.$attrs.methodValue !== CUSTOM_METHOD_NAME
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