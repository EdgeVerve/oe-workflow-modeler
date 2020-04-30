import EntryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import CmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';


import {ReduxStore} from '../../../state/store';

export default function (group, element) {

  // Only return an entry, if the currently selected
  // element is a business rule task.


  if (is(element, 'bpmn:BusinessRuleTask')) {

    let rulesEntries = ReduxStore.getState().rules || [];
    rulesEntries = rulesEntries.map(item => {
      return {
        name: item.split('-').map(p => p[0].toUpperCase()+p.substr(1)).join(' '),
        value: item
      };
    }).concat({
      name: 'Custom',
      value: 'custom'
    });
  

    // Task Implementation
    group.entries.push(EntryFactory.selectBox({
      id: 'implementation',
      label: 'Implementation',
      selectOptions: [{
        name: 'DMN',
        value: 'dmn'
      }],
      modelProperty: 'implementation'
    }));

    // Task Implementation
    group.entries.push(EntryFactory.selectBox({
      id: 'decisionRefBinding',
      label: 'Decision Type',
      selectOptions: rulesEntries,
      modelProperty: 'decisionRefBinding',
      set: function (element, values) {
        var res = {};
        if (values.decisionRefBinding !== '') {
          res.decisionRefBinding = values.decisionRefBinding;
        } else {
          res.decisionRefBinding = undefined;
        }
        if(res.decisionRefBinding !== 'custom'){
          res.decisionRef = res.decisionRefBinding;
        }
        return CmdHelper.updateProperties(element, res);
      }
    }));


    // completionHook
    group.entries.push(EntryFactory.textField({
      id: 'decisionRef',
      label: 'Decision Ref',
      modelProperty: 'decisionRef',
      disabled: function (element) {
        return getBusinessObject(element).decisionRefBinding !== 'custom';
      }
    }));
  }
}