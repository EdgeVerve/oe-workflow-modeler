const ElementHelper = require('bpmn-js-properties-panel/lib/helper/ElementHelper');
import {
  ReduxStore
} from '../../../state/store';

export default class CustomPalette {
  constructor(create, elementFactory, bpmnFactory, moddle, palette, translate) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;
    this.bpmnFactory = bpmnFactory;
    this.moddle = moddle;
    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const {
      create,
      elementFactory,
      bpmnFactory,
      moddle,
      translate
    } = this;

    function resolveData(data) {
      if (Array.isArray(data)) {
        data = data.map(resolveData)
      } else if (data && data.type) {
        data = bpmnFactory.create(data.type, resolveData(data.data));
      } else if (typeof data === 'object') {
        var ret = {};
        Object.keys(data).forEach(key => {
          if (typeof data[key] === 'object') {
            ret[key] = resolveData(data[key]);
          } else {
            ret[key] = data[key];
          }
        });
        data = ret;
      }
      return data;
    }

    function createCustomNode(event) {

      this.data.disableEdit = true;
      let bo = bpmnFactory.create(this.type, this.data);

      if (this.extensions) {
        var extensionElements = ElementHelper.createElement('bpmn:ExtensionElements', {
          values: []
        }, bo, bpmnFactory);

        extensionElements.values = this.extensions.map(item => {
          var element = bpmnFactory.create(item.type, resolveData(item.data));
          element.$parent = extensionElements;
          return element;
        });
        bo.extensionElements = extensionElements;
      }

      const shape = elementFactory.createShape({
        type: this.type,
        businessObject: bo
      });
      create.start(event, shape);
    }

    function createNodeForSetPV(event){

      let nodeType = 'bpmn:ScriptTask';
      let bo = bpmnFactory.create(nodeType, {isUpdateVariablesType: true});

      // var extensionElements = ElementHelper.createElement('bpmn:ExtensionElements', {
      //   values: []
      // }, bo, bpmnFactory);
      // var propertiesExtension = bpmnFactory.create('camunda:Properties', []);
      // propertiesExtension.$parent = extensionElements;
      // extensionElements.values.push(propertiesExtension);
      // bo.extensionElements = extensionElements;

      const shape = elementFactory.createShape({
        type: nodeType,
        businessObject: bo
      });
      create.start(event, shape);
    }

    let extensionEntries = {}

    /**
     * Add updateVariables Node
     */
    extensionEntries[`updateVariables`] = {
      group: 'custom',
      className: 'bpmn-icon-script-task',
      title: translate('Variables'),
      action: {
        dragstart: createNodeForSetPV,
        click: createNodeForSetPV
      }
    }

    let ExtensionElements = ReduxStore.getState().extensions;
    if (ExtensionElements && Array.isArray(ExtensionElements) && ExtensionElements.length > 0) {
      extensionEntries['custom-separator'] = {
        group: 'custom',
        separator: true
      };

      ExtensionElements.forEach((element, idx) => {
        extensionEntries[`custom-${idx}`] = {
          group: 'custom',
          className: element.className || 'bpmn-icon-task',
          title: translate(element.title || element.data && element.data.name ? element.data.name : ''),
          action: {
            dragstart: createCustomNode.bind(element),
            click: createCustomNode.bind(element)
          }
        }
      });

    }

    return extensionEntries;
  }
}

CustomPalette.$inject = [
  'create',
  'elementFactory',
  'bpmnFactory',
  'moddle',
  'palette',
  'translate'
];