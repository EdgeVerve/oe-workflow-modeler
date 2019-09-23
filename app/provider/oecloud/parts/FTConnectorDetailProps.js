const ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');
const CmdHelper = require('bpmn-js-properties-panel/lib/helper/CmdHelper');
const EntryFactory = require('bpmn-js-properties-panel/lib/factory/EntryFactory');

import {OEInputOutputHelper} from '../helper/OEInputOutputHelper';
const domClosest = require('min-dom').closest;


var disableInput =false;

var DEFAULT_OPTIONS = [
  { value: '', name: '' },
  { value: 'processvariable', name: 'ProcessVariable' },
  { value: 'message', name: 'Message' },
  { value: 'approve', name: 'Approve' },
  { value: 'reject', name: 'Reject' }
];

function getBusinessObject(element) {
  return ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
}

function getConnector(bo) {
  return OEInputOutputHelper.getFTConnector(bo);
}

function isConnector(element) {
  return ImplementationTypeHelper.getImplementationType(element) === 'FinalizeTransactionConnector';
}

function FTConnectorDetailProps(group, element, bpmnFactory) {

  group.entries.push(EntryFactory.selectBox({
    id: 'ftType',
    description: 'Configure the type of the task.',
    label: 'Type',
    selectOptions: DEFAULT_OPTIONS,// selectOptions,
    modelProperty: 'FTType',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);
      var value = connector && connector.get('FTType');
   
      return { FTType: value };
    },
    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var connector = getConnector(bo);
      if(values.FTType === ''){
          values.FTType=undefined;
      }

      var res = {
        FTType: values.FTType || undefined,
        FTValue: values.FTValue || undefined
      };

      if(values.FTType === 'approve' || values.FTType === 'reject'){
        res.FTValue = undefined;
      }

      return CmdHelper.updateBusinessObject(element, connector, res);
    }
  }));

  /***************************************Model configuration for OE connector********************************************/
  group.entries.push(EntryFactory.textField({
    id: 'ftValue',
    label: 'Value',
    modelProperty: 'FTValue',

    get: function (element, node) {
      var bo = getBusinessObject(element);
      var connector = bo && getConnector(bo);
      var value = connector && connector.get('FTValue');

      return { FTValue: value };
    },

    set: function (element, values, node) {
      var bo = getBusinessObject(element);
      var connector = getConnector(bo);
      return CmdHelper.updateBusinessObject(element, connector, {
        FTValue: values.FTValue || undefined
      });
    },

    validate: function (element, values, node) {
      return true;//isConnector(element) && !values.headers ? { connectorId: 'Must provide a value'} : {};
    },

    disabled: function (element, node) {

      return disableInput;//false;//!isConnector(element);
    }

  }));


};
export {FTConnectorDetailProps};