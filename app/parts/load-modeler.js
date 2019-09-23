import BpmnModeler from 'bpmn-js/lib/Modeler';

import propertiesPanelModule from 'bpmn-js-properties-panel';
import oePropertiesProviderModule from '../provider/oecloud';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';

import oecloudModdleDescriptor from '../descriptors/oecloud';
import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
import CustomRendererModule from '../provider/oecloud/renderer';
import CustomControlsModule from '../provider/oecloud/custom';

function CreateModeler(canvasSelector, panelSelector){

  var bpmnModeler = new BpmnModeler({
    container: canvasSelector,
    propertiesPanel: {
      parent: panelSelector
    },
    additionalModules: [
      propertiesPanelModule,
      propertiesProviderModule,
      oePropertiesProviderModule,
      CustomRendererModule,
      CustomControlsModule
    ],
    moddleExtensions: {
      oecloud: oecloudModdleDescriptor,
      camunda: camundaModdleDescriptor
    }
  });
  return bpmnModeler;
}

export {CreateModeler};
