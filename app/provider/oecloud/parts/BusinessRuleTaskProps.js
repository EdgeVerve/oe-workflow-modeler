import EntryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';
import CmdHelper from 'bpmn-js-properties-panel/lib/helper/CmdHelper';
import {
  is,
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';


import { ReduxStore } from '../../../state/store';

import {
  escapeHTML
} from 'bpmn-js-properties-panel/lib/Utils';

const path = require('path');
const domQuery = require('min-dom').query;
const domClear = require('min-dom').clear;
const domify = require('min-dom').domify;

function getDecisionOptions(mode, ruleData) {
  if (mode) {
    let rules = ruleData[mode].map(entry => path.basename(entry).replace(path.extname(entry), ''));
    let DECISION_OPTIONS = [{
      name: '',
      value: ''
    }];
    if (rules.length) {
      DECISION_OPTIONS = DECISION_OPTIONS.concat(rules.map(item => {
        return {
          name: item.split('-').map(p => p[0].toUpperCase() + p.substr(1)).join(' '),
          value: item
        }
      }));
    }
    return DECISION_OPTIONS.concat({
      name: 'Custom',
      value: 'custom'
    });
  } else {
    return [];
  }
}

export default function (group, element) {

  // Only return an entry, if the currently selected
  // element is a business rule task.


  if (is(element, 'bpmn:BusinessRuleTask')) {

    let mode = element.businessObject.mode;
    let ruleData = ReduxStore.getState().rules;

    group.entries.push(EntryFactory.selectBox({
      id: 'implementation',
      label: 'Implementation',
      selectOptions: [{
        name: 'DMN',
        value: 'dmn'
      }],
      modelProperty: 'implementation'
    }));

    group.entries.push(EntryFactory.selectBox({
      id: 'mode',
      label: 'Mode',
      selectOptions: [{
        name: '',
        value: ''
      }, {
        name: 'Decision Table',
        value: 'DecisionTable'
      }, {
        name: 'Decision Service',
        value: 'DecisionService'
      }, {
        name: 'Decision Tree',
        value: 'DecisionTree'
      }],
      modelProperty: 'mode'
    }));

    group.entries.push(EntryFactory.selectBox({
      id: 'decisionRefBinding',
      label: 'Select Name',
      selectOptions: getDecisionOptions(mode, ruleData),
      modelProperty: 'decisionRefBinding',

      get: function (element, node) {
        var bo = getBusinessObject(element);
        var mode = bo.mode;
        var selectBox = domQuery('select[name=decisionRefBinding]', node);
        domClear(selectBox);
        var DECISION_OPTIONS = getDecisionOptions(mode, ruleData)
        DECISION_OPTIONS.forEach(function (option) {
          var optionEntry = domify('<option value="' + escapeHTML(option.value) + '">' + escapeHTML(option.name) + '</option>');
          selectBox.appendChild(optionEntry);
        });
        var value = bo.decisionRefBinding;
        return {
          decisionRefBinding: value
        };
      },

      set: function (element, values) {
        var res = {};
        if (values.decisionRefBinding !== '') {
          res.decisionRefBinding = values.decisionRefBinding;
        } else {
          res.decisionRefBinding = undefined;
        }
        if (res.decisionRefBinding !== 'custom') {
          res.decisionRef = res.decisionRefBinding;
        } else {
          res.decisionRef = '';
        }
        return CmdHelper.updateProperties(element, res);
      }
    }));

    group.entries.push(EntryFactory.textField({
      id: 'decisionRef',
      label: 'Custom Name',
      modelProperty: 'decisionRef',
      hidden: function (element) {
        return getBusinessObject(element).decisionRefBinding !== 'custom';
      }
    }));
  }
}