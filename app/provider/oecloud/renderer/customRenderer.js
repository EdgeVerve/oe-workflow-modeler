import BaseRenderer from 'diagram-js/lib/draw/BaseRenderer';
const ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  getRoundRectPath
} from 'bpmn-js/lib/draw/BpmnRenderUtil';

import {
  createLine
} from 'diagram-js/lib/util/RenderUtil';

import {
  is
} from 'bpmn-js/lib/util/ModelUtil';
import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';

const HIGH_PRIORITY = 1500,
  TASK_BORDER_RADIUS = 10;


export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, bpmnRenderer, textRenderer) {
    super(eventBus, HIGH_PRIORITY);

    this.bpmnRenderer = bpmnRenderer;
    this.textRenderer = textRenderer;
  }

  canRender(element) {

    // only render tasks and events (ignore labels)
    return isAny(element, ['bpmn:ServiceTask', 'bpmn:ScriptTask', 'bpmn:Event']) && !element.labelTarget;
  }

  drawShape(parentNode, element) {
    const shape = this.bpmnRenderer.drawShape(parentNode, element);

    if (is(element, 'bpmn:ServiceTask')) {
      var connectorName = '';
      switch (ImplementationTypeHelper.getImplementationType(element)) {
        case 'FinalizeTransactionConnector':
          connectorName = '</FIN>'
          break;
        case 'RestConnector':
          connectorName = '{API}'
          break;
        case 'OeConnector':
          connectorName = 'fx(){...}'
          break;
      }

      // const line = drawLine(parentNode, [{x:0, y:60}, {x:100, y:60}], '#cc0000');
      // appendTo(line, parentNode);
      if (connectorName) {
        const text = this.renderLabel(parentNode, connectorName);
        appendTo(text, parentNode);
        svgAttr(text, {
          transform: 'translate(0, 65)'
        });
      }
    } else if (is(element, 'bpmn:ScriptTask')) {
      if (element.businessObject && element.businessObject.isUpdateVariablesType) {
        const text = this.renderLabel(parentNode, '=>PV');
        appendTo(text, parentNode);
        svgAttr(text, {
          transform: 'translate(0, 65)'
        });
        svgRemove(shape);
        const rect = drawRect(parentNode, 100, 80, TASK_BORDER_RADIUS, '#00dddd');
        prependTo(rect, parentNode);
      }
    }

    return shape;
  }

  getShapePath(shape) {
    if (is(shape, 'bpmn:ServiceTask')) {
      return getRoundRectPath(shape, TASK_BORDER_RADIUS);
    }

    return this.bpmnRenderer.getShapePath(shape);
  }

  renderLabel(parentGfx, label, options) {

    options = Object.assign({
      size: {
        width: 100
      }
    }, options);

    var text = this.textRenderer.createText(label || '', options);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

}

CustomRenderer.$inject = ['eventBus', 'bpmnRenderer', 'textRenderer'];

// helpers //////////

// copied from https://github.com/bpmn-io/bpmn-js/blob/master/lib/draw/BpmnRenderer.js
function drawRect(parentNode, width, height, borderRadius, strokeColor) {
  const rect = svgCreate('rect');

  svgAttr(rect, {
    width: width,
    height: height,
    rx: borderRadius,
    ry: borderRadius,
    stroke: strokeColor || '#000',
    strokeWidth: 2,
    fill: '#fff'
  });

  svgAppend(parentNode, rect);

  return rect;
}

function drawLine(parentNode, points, strokeColor) {
  const line = createLine(points);

  svgAttr(line, {
    stroke: strokeColor || '#000',
    strokeWidth: 2
  });

  svgAppend(parentNode, line);

  return line;
}


// copied from https://github.com/bpmn-io/diagram-js/blob/master/lib/core/GraphicsFactory.js
function prependTo(newNode, parentNode, siblingNode) {
  parentNode.insertBefore(newNode, siblingNode || parentNode.firstChild);
}

function appendTo(newNode, parentNode, siblingNode) {
  //referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);

  parentNode.append(newNode);
}