import EntryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import CmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';


import {ReduxStore} from '../../../state/store';

export default function (group, element) {
  // Only return an entry, if the currently selected
  // element is a call activity.
  if (is(element, 'bpmn:CallActivity')) {

    let rulesEntries = ReduxStore.getState().flows || [];
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
        name: 'BPMN',
        value: 'bpmn'
      }],
      modelProperty: 'implementation'
    }));

    // Task Implementation
    group.entries.push(EntryFactory.selectBox({
      id: 'calledElementBinding',
      label: 'Workflow Type',
      selectOptions: rulesEntries,
      modelProperty: 'calledElementBinding',
      set: function (element, values) {
        var res = {};
        if (values.calledElementBinding !== '') {
          res.calledElementBinding = values.calledElementBinding;
        } else {
          res.calledElementBinding = undefined;
        }
        if(res.calledElementBinding !== 'custom'){
          res.calledElement = res.calledElementBinding;
        }
        return CmdHelper.updateProperties(element, res);
      }
    }));


    // completionHook
    group.entries.push(EntryFactory.textField({
      id: 'calledElement',
      label: 'Called Element',
      modelProperty: 'calledElement',
      disabled: function (element) {
        return getBusinessObject(element).calledElementBinding !== 'custom';
      }
    }));
  }
}