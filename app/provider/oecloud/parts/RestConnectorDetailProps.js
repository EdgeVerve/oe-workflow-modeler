/**
 * Implements RestConnector tab and related properties handling on Service Node.
 */
const ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');
const CmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
const EntryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

import {
  OEInputOutputHelper
} from '../helper/OEInputOutputHelper';


function getImplementationType(element) {
  return ImplementationTypeHelper.getImplementationType(element);
}

function getBusinessObject(element) {
  return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function getConnector(bo) {
  return OEInputOutputHelper.getRestConnector(bo);
}

function isConnector(element) {
  return getImplementationType(element) === 'RestConnector';
}

function RestConnectorDetailProps(group, element, bpmnFactory) {

  group.entries.push(EntryFactory.textField({
    id: 'connectorUrl',
    label: 'URL',
    modelProperty: 'url',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);
      var value = connector && connector.get('url');

      return {
        url: value,
        ctype: 'rest'
      };
    },

    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var connector = getConnector(bo);
      return CmdHelper.updateBusinessObject(element, connector, {
        url: values.url || undefined,
        ctype: "rest"
      });
    },

    validate: function (element, values, node) {
      return isConnector(element) && !values.url ? {
        url: 'Must provide a value'
      } : {};
    },

    disabled: function (element, node) {
      return !isConnector(element);
    }

  }));

  group.entries.push(EntryFactory.textField({
    id: 'connectorMethod',
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

    validate: function (element, values, node) {
      return isConnector(element) && !values.method ? {
        method: 'Must provide a value'
      } : {};
    },

    disabled: function (element, node) {
      return !isConnector(element);
    }

  }));

  group.entries.push(EntryFactory.textBox({
    id: 'connectorData',
    label: 'Data',
    modelProperty: 'data',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);
      var value = connector && connector.get('data');
      return {
        data: value
      };
    },

    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var connector = getConnector(bo);
      return CmdHelper.updateBusinessObject(element, connector, {
        data: values.data || undefined
      });
    },

    validate: function (element, values, node) {
      return isConnector(element) && !values.data ? {
        data: 'Must provide a value'
      } : {};
    },

    disabled: function (element, node) {
      return !isConnector(element);
    }

  }));

  group.entries.push(EntryFactory.textField({
    id: 'connectorHeaders',
    label: 'Headers',
    modelProperty: 'headers',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);
      var value = connector && connector.get('headers');
      return {
        headers: value
      };
    },

    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var connector = getConnector(bo);
      return CmdHelper.updateBusinessObject(element, connector, {
        headers: values.headers || undefined
      });
    },

    validate: function (element, values, node) {
      return true; //isConnector(element) && !values.headers ? { connectorId: 'Must provide a value'} : {};
    },

    disabled: function (element, node) {
      return !isConnector(element);
    }

  }));


  group.entries.push(EntryFactory.textField({
    id: 'connectorRetries',
    label: 'Number Of Retries',
    modelProperty: 'retries',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);

      var value = connector && connector.get('retries');
      return {
        retries: value
      };
    },

    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var connector = getConnector(bo);
      return CmdHelper.updateBusinessObject(element, connector, {
        retries: values.retries || undefined
      });
    },

    validate: function (element, values, node) {
      return true; //isConnector(element) && !values.retries ? { retries: 'Must provide a value'} : {};
    },

    disabled: function (element, node) {
      return !isConnector(element);
    }

  }));

  group.entries.push(EntryFactory.textField({
    id: 'connectorTimeout',
    label: 'Timeout(ms)',
    modelProperty: 'timeout',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);
      var value = connector && connector.get('timeout');
      return {
        timeout: value
      };
    },

    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var connector = getConnector(bo);
      return CmdHelper.updateBusinessObject(element, connector, {
        timeout: values.timeout || undefined
      });
    },

    validate: function (element, values, node) {
      return true; //isConnector(element) && !values.timeout ? { timeout: 'Must provide a value'} : {};
    },

    disabled: function (element, node) {
      return !isConnector(element);
    }

  }));

};



export {
  RestConnectorDetailProps
};