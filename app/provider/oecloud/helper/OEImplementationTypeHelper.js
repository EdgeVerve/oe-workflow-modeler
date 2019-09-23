const ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');
const ExtensionsElementHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');

/**
 * Hack override getImplementationType method to check if this is one of our connector extension
 * Call original method finally.
 * 
 * Note that the export from this module is empty. This is loaded only to override 'getImplementationType'
 */
let originalGetImplementationType = ImplementationTypeHelper.getImplementationType.bind(ImplementationTypeHelper);

ImplementationTypeHelper.getImplementationType = function (element) {
  var bo = this.getServiceTaskLikeBusinessObject(element);
  if (this.isServiceTaskLike(bo)) {
    let connectors = ExtensionsElementHelper.getExtensionElements(bo, 'oecloud:RestConnector');
    if (typeof connectors !== 'undefined') {
      return 'RestConnector';
    }

    connectors = ExtensionsElementHelper.getExtensionElements(bo, 'oecloud:OeConnector');
    if (typeof connectors !== 'undefined') {
      return 'OeConnector';
    }
    connectors = ExtensionsElementHelper.getExtensionElements(bo, 'oecloud:FinalizeTransactionConnector');
    if (typeof connectors !== 'undefined') {
      return 'FinalizeTransactionConnector';
    }
  }
  return originalGetImplementationType(element);
}

let OEImplementationTypeHelper = {};
export {
  OEImplementationTypeHelper
};