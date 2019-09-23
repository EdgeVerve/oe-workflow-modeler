module.exports.saveAsOld = function saveAsOld(data) {
    /* for supporting old modeler we need to add camunda url */
    if (!data.includes('xmlns:camunda=\"http://camunda.org/schema/1.0/bpmn\"')) {
        data = data.replace('xmlns:oecloud=\"http://oecloud\"', 'xmlns:camunda=\"http://camunda.org/schema/1.0/bpmn\"');
    }
    data = data.replace(/oecloud:restConnector/g, 'camunda:connector');
    data = data.replace(/oecloud:/g, 'camunda:');
    return data;
}

module.exports.loadAsNew = function loadAsNew(data) {
    var fileVersion;
    var loadInfo = {};
    data = data.replace(/camunda:connector/g, 'oecloud:restConnector');
    data = data.replace(/camunda:(excluded(Users|Groups|Roles)|candidateRoles|taskCategory|creationHook|completionHook|ctype|url|method|data|headers|retries|timeout|oeConnector|model|args|finalizeTransactionConnector|FTType|FTValue)/g, function (b) {
        return b.replace('camunda:', 'oecloud:');
    });
    if (data.includes('xmlns:camunda=\"http://camunda.org/schema/1.0/bpmn\"')) {
        fileVersion = '1.x';
    } else if (data.includes('xmlns:oecloud=\"http://oecloud\"')) {
        fileVersion = '2.x';
    }
    loadInfo = {
        data: data,
        fileVersion: fileVersion
    }

    return loadInfo;
}