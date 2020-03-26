import inherits from 'inherits';

/* Override ImplementationTypeHelper */
import {
  OEImplementationTypeHelper
} from './helper/OEImplementationTypeHelper';
import './UtilsOverride';

import PropertiesActivator from 'bpmn-js-properties-panel/lib/PropertiesActivator';
const ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');
const ExtensionsElementHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
const EventDefinitionHelper = require('bpmn-js-properties-panel/lib/helper/EventDefinitionHelper');

import userTaskProps from './parts/UserTaskProps';
import BusinessRuleTaskProps from './parts/BusinessRuleTaskProps';
import CallActivityProps from './parts/CallActivityProps';

import {
  FTConnectorDetailProps
} from './parts/FTConnectorDetailProps';
import {
  OEConnectorDetailProps
} from './parts/OEConnectorDetailProps';
import {
  RestConnectorDetailProps
} from './parts/RestConnectorDetailProps';

import {
  OEImplementationType
} from './parts/OEImplementationType';

import {
  ReduxStore
} from '../../state/store';
import {
  diagramChangedAction
} from '../../state/actions';

function createRestConnectorGroup(element, bpmnFactory, elementRegistry) {
  var RestConnectorDetailsGroup = {
    id: 'restconn-details',
    label: 'REST Settings',
    entries: [],
    enabled: function (element) {
      var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
      return bo && ImplementationTypeHelper.getImplementationType(bo) === 'RestConnector';
    }

  };
  RestConnectorDetailProps(RestConnectorDetailsGroup, element, bpmnFactory);
  return RestConnectorDetailsGroup;
}


function createFTConnectorGroup(element, bpmnFactory, elementRegistry) {
  var FTConnectorDetailsGroup = {
    id: 'ftconnector-details',
    label: 'Finalize Transaction',
    entries: [],
    enabled: function (element) {
      var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
      return bo && ImplementationTypeHelper.getImplementationType(bo) === 'FinalizeTransactionConnector';
    }
  };
  FTConnectorDetailProps(FTConnectorDetailsGroup, element, bpmnFactory);
  return FTConnectorDetailsGroup;
}

function createOEConnectorGroup(element, bpmnFactory, elementRegistry) {
  var OEConnectorDetailsGroup = {
    id: 'oeconn-details',
    label: 'Model method',
    entries: [],
    enabled: function (element) {
      var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
      return bo && ImplementationTypeHelper.getImplementationType(bo) === 'OeConnector';
    }
  };
  OEConnectorDetailProps(OEConnectorDetailsGroup, element, bpmnFactory);
  return OEConnectorDetailsGroup;
}

function handleInputOutputTab(element, tabsArr){
  let inputOutputTab = tabsArr.find(item => item.id === 'input-output');
  let inputOutputParameterGroup = inputOutputTab.groups.find(item => item.id === 'input-output-parameter');
  if(inputOutputParameterGroup.entries.length){
    /* Adding monaco editor to input/output type 'script' */
    let scriptTypeEntry = inputOutputParameterGroup.entries.find(item => item.id === 'parameterType-script');
    scriptTypeEntry.script.showEditor = function (evt){
      let scriptNode = document.querySelector('[data-tab=input-output] [data-group=input-output-parameter] [data-entry=parameterType-script]');
      let value = scriptTypeEntry.get(element, scriptNode);

      function updateValue(scriptValue) {
        let scriptNode = document.querySelector('[data-tab=input-output] [data-group=input-output-parameter] [data-entry=parameterType-script]');
        let scriptFormatNode = scriptNode.querySelector('input[name=scriptFormat]');
        scriptFormatNode.value = 'javascript';
        scriptFormatNode.dispatchEvent(new Event('change', {
          bubbles: true
        }));

        let scriptTypeNode = scriptNode.querySelector('select[name=scriptType]');
        scriptTypeNode.value = 'script';
        scriptTypeNode.dispatchEvent(new Event('change', {
          bubbles: true
        }));

        let scriptValueNode = scriptNode.querySelector('textarea[name=scriptValue]');
        scriptValueNode.value = scriptValue;
        scriptValueNode.dispatchEvent(new Event('change', {
          bubbles: true
        }));
      }

      window.dispatchEvent(new CustomEvent('open-script-editor', {
        detail: {
          script: value.scriptValue,
          cb: updateValue
        }
      }));
    }

    if(document.querySelector('[data-tab=input-output] [data-group=input-output-parameter] [data-entry=parameterType]')){
      let inputOutputTypedropDown = document.querySelector('[data-tab=input-output] [data-group=input-output-parameter] [data-entry=parameterType]');
      // changing the label name of script to 'Expression' in dropdown
      inputOutputTypedropDown.querySelector('#camunda-parameterType-select').options[1].label = "Expression";
    }

    if(document.querySelector('[data-tab=input-output] [data-group=input-output-parameter] [data-entry=parameterType-script]')){
      let scriptAttributes = document.querySelector('[data-tab=input-output] [data-group=input-output-parameter] [data-entry=parameterType-script]');
      // hiding scriptFormat field and the default value will be 'javascript'
      scriptAttributes.querySelector('.bpp-textfield').style.display = 'none';
      // hiding scriptType dropdown and the selected value is 'Inline Script'
      scriptAttributes.querySelectorAll('.bpp-row')[1].style.display = 'none';
      // changing the label of script field to 'Expression'
      scriptAttributes.querySelectorAll('[for="cam-script-val"]')[0].textContent="Expression";
    }
    scriptTypeEntry.html = scriptTypeEntry.html.replace('<textarea id="cam-script-val" type="text" name="scriptValue"></textarea>', '<textarea id="cam-script-val" data-action="script.showEditor" type="text" name="scriptValue"></textarea>');
  }
  return tabsArr;
};

function hideUnusedTabsAndGroups(tabsArr) {
  /* Do not show listeners tab */
  tabsArr = tabsArr.filter(item => item.id !== 'listeners');

  /* Do not show field-injections */
  tabsArr = tabsArr.filter(item => item.id !== 'field-injections');

  /* Remove 'async' group from general tab for all elements */
  let generalTab = tabsArr.find(item => item.id === 'general');
  generalTab.groups = generalTab.groups.filter(item => item.id !== 'async');

  /* Remove multiInstance-async-before and async-after entries for all elements */
  let multiInstanceGroup = generalTab.groups.find(item => item.id === 'multiInstance');
  multiInstanceGroup.entries = multiInstanceGroup.entries.filter(item => ['multiInstance-asyncBefore', 'multiInstance-asyncAfter', 'multiInstance-exclusive'].indexOf(item.id) < 0);

  return tabsArr;
}

function handleProcessElement(element, tabsArr) {
  if (element.type === 'bpmn:Process') {
    /* only show general and document groups on general tab */
    let generalTab = tabsArr.find(item => item.id === 'general');
    generalTab.groups = generalTab.groups.filter(item => item.id === 'general' || item.id === 'documentation');
  }
  return tabsArr;
}

function handleStartEvent(element, tabsArr) {
  if (element.type === 'bpmn:StartEvent') {
    /* do not show forms tab */
    tabsArr = tabsArr.filter(item => item.id !== 'forms');
    /* only show general and document groups on general tab */
    let generalTab = tabsArr.find(item => item.id === 'general');
    if (EventDefinitionHelper.getTimerEventDefinition(element.businessObject) ||
      EventDefinitionHelper.getMessageEventDefinition(element.businessObject) ||
      EventDefinitionHelper.getSignalEventDefinition(element.businessObject) ||
      EventDefinitionHelper.getConditionalEventDefinition(element.businessObject)) {
      /* Remove details tab. Keep only general, details and documentation tabs */
      generalTab.groups = generalTab.groups.filter(item => ['general', 'details', 'documentation'].indexOf(item.id) >= 0);

      /* Remove initiator field from details tab*/
      let detailsTab = generalTab.groups.find(item => item.id === 'details');
      detailsTab.entries = detailsTab.entries.filter(item => item.id !== 'initiator');
    } else {
      /* Remove details tab. Keep only general and documentation tabs */
      generalTab.groups = generalTab.groups.filter(item => item.id === 'general' || item.id === 'documentation');
    }

  }
  return tabsArr;
}

function handleEndEvent(element, tabsArr) {
  if (element.type === 'bpmn:EndEvent') {
    /* do not show input-output  tab */
    tabsArr = tabsArr.filter(item => item.id !== 'input-output');
  }
  return tabsArr;
}

function handleUserTask(element, tabsArr) {
  if (element.type === 'bpmn:UserTask') {
    let generalTab = tabsArr.find(item => item.id === 'general');
    let detailsGroup = generalTab.groups.find(item => item.id === 'details');
    detailsGroup.entries = [];
    userTaskProps(detailsGroup, element);
  }
  return tabsArr;
}

function handleBusinessRuleTask(element, tabsArr) {
  if (element.type === 'bpmn:BusinessRuleTask') {
    let generalTab = tabsArr.find(item => item.id === 'general');
    let detailsGroup = generalTab.groups.find(item => item.id === 'details');
    detailsGroup.entries = [];
    BusinessRuleTaskProps(detailsGroup, element);
  }
  return tabsArr;
}

function handleCallActivity(element, tabsArr) {
  if (element.type === 'bpmn:CallActivity') {
    let generalTab = tabsArr.find(item => item.id === 'general');
    let detailsGroup = generalTab.groups.find(item => item.id === 'details');
    detailsGroup.entries = [];
    CallActivityProps(detailsGroup, element);
  }
  return tabsArr;
}

function handleScriptTask(element, tabsArr) {
  if (element.type === 'bpmn:ScriptTask') {

    /** For Special SetPV Script Node, 
     * 1. hide script editor fields 
     * 2. Move extension-properties to details tab
     * 3. and enable auto script update based on PV mappings */
    if (element.businessObject && element.businessObject.isUpdateVariablesType) {
      let generalTab = tabsArr.find(item => item.id === 'general');
      let detailsGroup = generalTab.groups.find(item => item.id === 'details');
      let extensionTab = tabsArr.find(item => item.id === 'extensionElements');
      detailsGroup.entries = extensionTab.groups.find(item => item.id === 'extensionElements-properties').entries;
    } else {
      /* normal script node: Setup Script Editor */
      let generalTab = tabsArr.find(item => item.id === 'general');
      let detailsGroup = generalTab.groups.find(item => item.id === 'details');

      let scriptBlockEntry = detailsGroup.entries.find(item => item.id === 'script-implementation');
      scriptBlockEntry.script.showEditor = function (evt) {
        let scriptNode = document.querySelector('[data-tab=general] [data-group=details] [data-entry=script-implementation]');
        let value = scriptBlockEntry.get(scriptNode);

        function updateValue(scriptValue) {
          let scriptNode = document.querySelector('[data-tab=general] [data-group=details] [data-entry=script-implementation]');
          let scriptFormatNode = scriptNode.querySelector('input[name=scriptFormat]');
          scriptFormatNode.value = 'javascript';
          scriptFormatNode.dispatchEvent(new Event('change', {
            bubbles: true
          }));

          let scriptTypeNode = scriptNode.querySelector('select[name=scriptType]');
          scriptTypeNode.value = 'script';
          scriptTypeNode.dispatchEvent(new Event('change', {
            bubbles: true
          }));

          let scriptValueNode = scriptNode.querySelector('textarea[name=scriptValue]');
          scriptValueNode.value = scriptValue;
          scriptValueNode.dispatchEvent(new Event('change', {
            bubbles: true
          }));
        }

        window.dispatchEvent(new CustomEvent('open-script-editor', {
          detail: {
            script: value.scriptValue,
            cb: updateValue
          }
        }));
      }
      scriptBlockEntry.html = scriptBlockEntry.html.replace('<textarea id="cam-script-val" type="text" name="scriptValue"></textarea>', '<textarea id="cam-script-val" data-action="script.showEditor" type="text" name="scriptValue"></textarea>');
    }
  }

  /* show extension tab only for ScriptNode configured to act as SetPV */
  tabsArr = tabsArr.filter(item => item.id !== 'extensionElements');

  return tabsArr;
}

function handleServiceTask(element, tabsArr, bpmnFactory, elementRegistry) {
  if (element.type === 'bpmn:ServiceTask') {
    let generalTab = tabsArr.find(item => item.id === 'general');
    let detailsGroup = generalTab.groups.find(item => item.id === 'details');

    detailsGroup.entries = OEImplementationType(element, bpmnFactory, {
      getImplementationType: ImplementationTypeHelper.getImplementationType.bind(ImplementationTypeHelper),
      getBusinessObject: ImplementationTypeHelper.getServiceTaskLikeBusinessObject.bind(ImplementationTypeHelper),
      hasServiceTaskLikeSupport: true
    });

    let connectorTab = tabsArr.find(item => item.id === 'connector');
    connectorTab.groups = [
      createRestConnectorGroup(element, bpmnFactory, elementRegistry),
      createFTConnectorGroup(element, bpmnFactory, elementRegistry),
      createOEConnectorGroup(element, bpmnFactory, elementRegistry)
    ];

    connectorTab.enabled = function (element) {
      var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
      return bo && ImplementationTypeHelper.getImplementationType(bo);
    }
  }
  return tabsArr;
}

function handleSequenceFlow(element, tabsArr) {
  if (element.type === 'bpmn:SequenceFlow') {
    let bo = element.businessObject;
    if (bo && bo.sourceRef && bo.sourceRef.default === bo) {
      let generalTab = tabsArr.find(item => item.id === 'general');
      let detailsGroup = generalTab.groups.find(item => item.id === 'details');
      detailsGroup.entries = [];
    }
  }
  return tabsArr;
}

export default function oecloudPropertiesProvider(
  eventBus, bpmnFactory, canvas,
  elementRegistry, translate, propertiesProvider) {

  PropertiesActivator.call(this, eventBus);

  let camundaGetTabs = propertiesProvider.getTabs;

  propertiesProvider.getTabs = function (element) {
    var tabs = camundaGetTabs(element);

    tabs = handleInputOutputTab(element,tabs);
    tabs = hideUnusedTabsAndGroups(tabs);
    tabs = handleProcessElement(element, tabs);
    tabs = handleStartEvent(element, tabs);
    tabs = handleEndEvent(element, tabs);
    tabs = handleUserTask(element, tabs);
    tabs = handleBusinessRuleTask(element, tabs);
    tabs = handleCallActivity(element, tabs);
    tabs = handleScriptTask(element, tabs);
    tabs = handleServiceTask(element, tabs, bpmnFactory, elementRegistry);
    tabs = handleSequenceFlow(element, tabs);
    // if (element && element.businessObject && element.businessObject.$attrs && element.businessObject.$attrs.disableEdit) {
    //   tabs.forEach(t => {
    //     t.groups.forEach(g => {
    //       g.entries.forEach(e => {
    //         if(e.html){
    //           e.html = e.html.replace(/\<input/g, "<input disabled ").replace(/\<select/g, "<select disabled ").replace(/\<button/g, "<button disabled ")
    //           console.log(e);
    //         }
    //         e.isDisabled = function (x) {
    //                     console.log('Disabled ', x);
    //                     return true;
    //         };
    //       })
    //     })
    //   });
    // }
    return tabs;
  };

  eventBus.on('element.changed', function (event) {
    var element = event.element;
    /* If the new element is NOT Service Task, remove any non-relevant extension elements */
    if (element.type !== 'bpmn:ServiceTask' && element.businessObject.extensionElements) {
      element.businessObject.extensionElements.values = element.businessObject.extensionElements.values.filter(item => {
        return ['oecloud:RestConnector', 'oecloud:OeConnector', 'oecloud:FinalizeTransactionConnector'].indexOf(item.$type) < 0;
      });
      if (element.businessObject.extensionElements.values.length === 0) {
        element.businessObject.extensionElements = undefined;
      }
    }
    /** For Special SetPV Script Node, enable auto script update based on PV mappings */
    if (element.type === 'bpmn:ScriptTask' && element.businessObject && element.businessObject.isUpdateVariablesType) {

      let propsExtension = ExtensionsElementHelper.getExtensionElements(element.businessObject, 'camunda:Properties');
      propsExtension = propsExtension ? propsExtension[0] : {};
      let properties = propsExtension.values;
      if (properties && Array.isArray(properties)) {
        element.businessObject.script = properties.map(item => {
          let text = '';
          if (item.name) {
            let value = '';
            if (item.value) {
              if (item.value[0] === '@') {
                /* an expression, set value as it is */
                value = item.value.substr(1);
              } else {
                value = `'${item.value}'`;
              }
            }
            text = `_setPV('${item.name}', ${value});`;
          }
          return text;
        }).join('\n');
      }
    }

    ReduxStore.dispatch(diagramChangedAction());
  });

  // eventBus.on('commandStack.shape.create.postExecute', function(event) {
  //   // inspect the event; you'll find the created element
  //   // you can fiddle around with (i.e. to add additional properties)
  //   //console.log(event);
  //   event.context.shape.businessObject.name = 'The Node Name';
  // });
}

inherits(oecloudPropertiesProvider, PropertiesActivator);