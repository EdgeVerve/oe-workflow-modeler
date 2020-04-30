'use strict';

/**
 * This file is a modification over (bpmn-js-property-panel/ * * /ImplementationType.js)
 * Additing additional fields and tabs for OeConnector and RestConnector appears difficult
 * without having to copy and modify the file itself.
 */
var entryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory'),
  cmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper'),
  extensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper'),
  elementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');

var ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');

const Utils = require('bpmn-js-properties-panel/lib/Utils')
var map = require('lodash/map');

var domQuery = require('min-dom').query,
  domClosest = require('min-dom').closest,
  domClasses = require('min-dom').classes;

import {
  OEInputOutputHelper
} from '../helper/OEInputOutputHelper';

var DEFAULT_DELEGATE_PROPS = ['class', 'expression', 'delegateExpression'];

var DELEGATE_PROPS = {
  'camunda:class': undefined,
  'camunda:expression': undefined,
  'camunda:delegateExpression': undefined,
  'camunda:resultVariable': undefined
};

var DMN_CAPABLE_PROPS = {
  'camunda:decisionRef': undefined,
  'camunda:decisionRefBinding': 'latest',
  'camunda:decisionRefVersion': undefined,
  'camunda:mapDecisionResult': 'resultList'
};


var EXTERNAL_CAPABLE_PROPS = {
  'camunda:type': undefined,
  'camunda:topic': undefined
};

var DEFAULT_OPTIONS = [{
    value: 'class',
    name: 'Java Class'
  },
  {
    value: 'expression',
    name: 'Expression'
  },
  {
    value: 'delegateExpression',
    name: 'Delegate Expression'
  }
];

var DMN_OPTION = [{
  value: 'dmn',
  name: 'DMN'
}];

var EXTERNAL_OPTION = [{
  value: 'external',
  name: 'External'
}];

var REST_CONNECTOR_OPTION = [{
    value: 'RestConnector',
    name: 'Rest Connector'
  },
  //,{ value: 'dmn', name: 'DMN'}
];
var OECONNECTOR_OPTION = [{
  value: 'OeConnector',
  name: 'OE Connector'
}];

var FTCONNECTOR_OPTION = [{
  value: 'FinalizeTransactionConnector',
  name: 'Finalize Transaction Connector'
}];
var SCRIPT_OPTION = [{
  value: 'script',
  name: 'Script'
}];

function OEImplementationType(element, bpmnFactory, options) {

  var getType = options.getImplementationType,
    getBusinessObject = options.getBusinessObject;


  var hasDmnSupport = options.hasDmnSupport,
    hasExternalSupport = options.hasExternalSupport,
    hasServiceTaskLikeSupport = options.hasServiceTaskLikeSupport,
    hasScriptSupport = options.hasScriptSupport;

  var entries = [];

  var selectOptions = DEFAULT_OPTIONS.concat([]);
  var selectOptions1 = [{
    value: ''
  }];


  if (hasDmnSupport) {
    selectOptions1 = selectOptions1.concat(DMN_OPTION);
  }

  if (hasExternalSupport) {
    selectOptions = selectOptions.concat(EXTERNAL_OPTION);
  }

  if (hasServiceTaskLikeSupport) {
    selectOptions1 = selectOptions1.concat(REST_CONNECTOR_OPTION);
    selectOptions1 = selectOptions1.concat(OECONNECTOR_OPTION);
    selectOptions1 = selectOptions1.concat(FTCONNECTOR_OPTION);
  }
  if (hasScriptSupport) {
    selectOptions = selectOptions.concat(SCRIPT_OPTION);
  }

  selectOptions.push({
    value: ''
  });

  entries.push(entryFactory.selectBox({
    id: 'implementation',
    description: 'Configure the implementation of the task.',
    label: 'Implementation',
    selectOptions: selectOptions1, // selectOptions,
    modelProperty: 'implType',

    get: function (element, node) {
      return {
        implType: getType(element) || ''
      };
    },

    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var oldType = getType(element);
      var newType = values.implType;

      var props = Object.assign({}, DELEGATE_PROPS);

      if (DEFAULT_DELEGATE_PROPS.indexOf(newType) !== -1) {

        var newValue = '';
        if (DEFAULT_DELEGATE_PROPS.indexOf(oldType) !== -1) {
          newValue = bo.get('camunda:' + oldType);
        }
        props['camunda:' + newType] = newValue;
      }

      if (hasDmnSupport) {
        props = Object.assign(props, DMN_CAPABLE_PROPS);
        if (newType === 'dmn') {
          props['camunda:decisionRef'] = '';
        }
      }

      if (hasExternalSupport) {
        props = Object.assign(props, EXTERNAL_CAPABLE_PROPS);
        if (newType === 'external') {
          props['camunda:type'] = 'external';
          props['camunda:topic'] = '';
        }
      }

      if (hasScriptSupport) {
        props['camunda:script'] = undefined;

        if (newType === 'script') {
          props['camunda:script'] = elementHelper.createElement('camunda:Script', {}, bo, bpmnFactory);
        }
      }

      var commands = [];
      commands.push(cmdHelper.updateBusinessObject(element, bo, props));

      if (hasServiceTaskLikeSupport) {

        var connectorsToRemove = [
          'oecloud:RestConnector',
          'oecloud:FinalizeTransactionConnector',
          'oecloud:OeConnector'
        ];

        connectorsToRemove.forEach(connectorName => {
          let connectors = extensionElementsHelper.getExtensionElements(bo, connectorName);
          commands.push(map(connectors, function (connector) {
            return extensionElementsHelper.removeEntry(bo, element, connector);
          }));
        });



        var extensionElements = elementHelper.createElement('bpmn:ExtensionElements', {
          values: []
        }, bo, bpmnFactory);
        commands.push(cmdHelper.updateBusinessObject(element, bo, {
          extensionElements: extensionElements
        }));

        var connector;
        if (newType === 'RestConnector') {
          connector = elementHelper.createElement('oecloud:RestConnector', {}, extensionElements, bpmnFactory);
        } else if (newType === 'OeConnector') {
          connector = elementHelper.createElement('oecloud:OeConnector', {}, extensionElements, bpmnFactory);
        } else if (newType === 'FinalizeTransactionConnector') {
          connector = elementHelper.createElement('oecloud:FinalizeTransactionConnector', {}, extensionElements, bpmnFactory);
        }
        if (connector) {
          commands.push(cmdHelper.addAndRemoveElementsFromList(
            element,
            extensionElements,
            'values',
            'extensionElements', [connector], []
          ));
        }

      }
      return commands;
    }
  }));

  entries.push(entryFactory.link({
    id: 'configureConnectorLink',
    label: 'Configure Connector',
    handleClick: function (element, node) {
      var panel = domClosest(node, 'div.djs-properties-panel');
      let targetLink = domQuery('a[data-tab-target="connector"]', panel);
      Utils.triggerClickEvent(targetLink);
    },
    showLink: function (element, node) {
      var link = domQuery('a', node);
      link.innerHTML = link.textContent = '';
      domClasses(link).remove('pp-error-message');

      let connectorType = ImplementationTypeHelper.getImplementationType(element);

      let hasConnectorDetails = false;
      if (connectorType === 'RestConnector') {
        hasConnectorDetails = !!OEInputOutputHelper.getRestConnector(element).url;
      } else if (connectorType === 'OeConnector') {
        hasConnectorDetails = !!OEInputOutputHelper.getOEConnector(element).model;
      } else if (connectorType === 'FinalizeTransactionConnector') {
        hasConnectorDetails = !!OEInputOutputHelper.getFTConnector(element).FTType;
      } else {
        hasConnectorDetails = true;
      }

      if (hasConnectorDetails && connectorType) {
        link.textContent = 'Configure Connector';
      } else if (!hasConnectorDetails) {
        link.innerHTML = '<span class="pp-icon-warning"></span> Must configure Connector';
        domClasses(link).add('pp-error-message');
      }
      return !hasConnectorDetails;
    }
  }));

  return entries;

};

export {
  OEImplementationType
};