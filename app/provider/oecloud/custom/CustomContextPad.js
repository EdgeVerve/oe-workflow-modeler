export default class CustomContextPad {
  constructor(config, contextPad, create, elementFactory, injector, translate) {
    this.create = create;
    this.elementFactory = elementFactory;
    this.translate = translate;

    if (config.autoPlace !== false) {
      this.autoPlace = injector.get('autoPlace', false);
    }

    contextPad.registerProvider(this);
  }

  getContextPadEntries(element) {
    const {
      autoPlace,
      create,
      elementFactory,
      translate
    } = this;

    let entries = {};
    function openCalledActivity(event, element) {
      window.dispatchEvent(new CustomEvent('open-diagram', {detail: element.businessObject.calledElement}));
    }

    if(element.type === 'bpmn:CallActivity' && element.businessObject && element.businessObject.calledElement){
      entries['drilldown.call-activity'] = {
        group: 'model',
        className: 'bpmn-icon-data-output',
        title: translate('Open Call Activity Flow'),
        action: {
          click: openCalledActivity
        }
      };
    }

    return entries;
  }
}

CustomContextPad.$inject = [
  'config',
  'contextPad',
  'create',
  'elementFactory',
  'injector',
  'translate'
];