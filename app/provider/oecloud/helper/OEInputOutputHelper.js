const ExtensionElementsHelper = require('bpmn-js-properties-panel/lib/helper/ExtensionElementsHelper');
const ImplementationTypeHelper = require('bpmn-js-properties-panel/lib/helper/ImplementationTypeHelper');


function getElements(bo, type, prop) {
  var elems = ExtensionElementsHelper.getExtensionElements(bo, type) || [];
  return !prop ? elems : (elems[0] || {})[prop] || [];
}


let OEInputOutputHelper = {};

/**
 * Get a connector from the business object
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement} the connector object
 */
OEInputOutputHelper.getRestConnector = function(element) {
  var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
  return bo && (getElements(bo, 'oecloud:RestConnector')|| [])[0];  
};


/**
 * Get a connector from the business object
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement} the connector object
 */
OEInputOutputHelper.getOEConnector = function(element) {
  var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
  return bo && (getElements(bo, 'oecloud:OeConnector')|| [])[0];  
};


/**
 * Get a connector from the business object
 *
 * @param {djs.model.Base} element
 *
 * @return {ModdleElement} the connector object
 */
OEInputOutputHelper.getFTConnector = function(element) {
  var bo = ImplementationTypeHelper.getServiceTaskLikeBusinessObject(element);
  return bo && (getElements(bo, 'oecloud:FinalizeTransactionConnector')|| [])[0];  
};

export {OEInputOutputHelper};