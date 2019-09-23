import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';


export default function (group, element) {

  // Only return an entry, if the currently selected
  // element is a user task.

  if (is(element, 'bpmn:UserTask')) {
    // Task Category
    group.entries.push(entryFactory.selectBox({
      id: 'taskCategory',
      label: 'Task Category',
      selectOptions: [{
        name: 'Basic Task',
        value: 'basic'
      }, {
        name: 'Multi Maker',
        value: 'multiMaker'
      }, {
        name: 'Checker',
        value: 'checker'
      }, {
        name: 'Checker-AutoFinalize',
        value: 'checkerAutoFinalize'
      }],
      modelProperty: 'taskCategory'
    }));

    // Candidate Users
    group.entries.push(entryFactory.textField({
      id: 'candidateUsers',
      label: 'Candidate Users',
      modelProperty: 'candidateUsers'
    }));

    group.entries.push(entryFactory.textField({
      id: 'candidateRoles',
      label: 'Candidate Roles',
      modelProperty: 'candidateRoles'
    }));

    // Candidate Groups
    group.entries.push(entryFactory.textField({
      id: 'candidateGroups',
      label: 'Candidate Groups',
      modelProperty: 'candidateGroups'
    }));


    group.entries.push(entryFactory.textField({
      id: 'excludedUsers',
      label: 'Excluded Users',
      modelProperty: 'excludedUsers'
    }));

    group.entries.push(entryFactory.textField({
      id: 'excludedRoles',
      label: 'Excluded Roles',
      modelProperty: 'excludedRoles'
    }));

    group.entries.push(entryFactory.textField({
      id: 'excludedGroups',
      label: 'Excluded Groups',
      modelProperty: 'excludedGroups'
    }));


    // Due Date
    group.entries.push(entryFactory.textField({
      id: 'dueDate',
      //description: 'The due date as an EL expression (e.g. ${someDate} or an ISO date (e.g. 2015-06-26T09:54:00)',
      label: 'Due Date',
      modelProperty: 'dueDate'
    }));

    // FollowUp Date
    group.entries.push(entryFactory.textField({
      id: 'followUpDate',
      //description: 'The follow up date as an EL expression (e.g. ${someDate} or an ' +
      //  'ISO date (e.g. 2015-06-26T09:54:00)',
      label: 'Follow Up Date',
      modelProperty: 'followUpDate'
    }));

    // priority
    group.entries.push(entryFactory.textField({
      id: 'priority',
      label: 'Priority',
      modelProperty: 'priority'
    }));

    // creationHook
    group.entries.push(entryFactory.textField({
      id: 'creationHook',
      description: 'before create hook',
      label: 'Creation Hook',
      modelProperty: 'creationHook'
    }));

    // completionHook
    group.entries.push(entryFactory.textField({
      id: 'completionHook',
      description: 'before comlpletion hook',
      label: 'Completion Hook',
      modelProperty: 'completionHook'
    }));

  }
}