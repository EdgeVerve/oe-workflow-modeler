module.exports.convertToOld = function convertToOld(data) {
    /* for supporting old modeler we need to add camunda url */
    if (!data.includes('xmlns:camunda=\"http://camunda.org/schema/1.0/bpmn\"')) {
        data = data.replace('xmlns:oecloud=\"http://oecloud\"', 'xmlns:camunda=\"http://camunda.org/schema/1.0/bpmn\"');
    } 
    data = data.replace(/oecloud:restConnector/g, 'camunda:connector');
    data = data.replace(/oecloud:/g, 'camunda:');
    /* Remove camunda: from isUpdateVariablesType for old */
    data = data.replace(/camunda:isUpdateVariablesType/g, 'isUpdateVariablesType');
    return data;
}

module.exports.loadAsNew = function loadAsNew(data) {
    data = data.replace(/camunda:connector/g, 'oecloud:restConnector');
    data = data.replace(/camunda:(excluded(Users|Groups|Roles)|candidateRoles|taskCategory|creationHook|completionHook|ctype|url|method|data|headers|retries|timeout|oeConnector|model|args|finalizeTransactionConnector|FTType|FTValue)/g, function (b) {
        return b.replace('camunda:', 'oecloud:');
    });
    return data;
}