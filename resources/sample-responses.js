module.exports = {
  flows: ['process-one', 'process-two', 'process-three'],
  rules: ['decision-one', 'decision-two', 'decision-three'],
  models: {
      Account: {
        create: '[options, data]',
        update: '[options, id, data]',
        delete: '[options, id]'
      },
      Transaction: {
        create: '[options, data]',
        update: '[options, id, data]',
        delete: '[options, id]',
        approve: '[options, id]',
        reject: '[options, id]'
      }
  },
  extensions: [{
    "type": "bpmn:CallActivity",
    "title": "Create Account",
    "group":"Group-1",
    "className": "bpmn-icon-call-activity",
    "data": {
      "name": "Create Account",
      "calledElement": "create-account-flow"
    },
    "extensions": [{
        "type": "camunda:In",
        "data": {
          "source": "inSrc",
          "target": "inTgt"
        }
      },
      {
        "type": "camunda:Out",
        "data": {
          "source": "outSrc",
          "target": "outTgt"
        }
      },
      {
        "type": "camunda:InputOutput",
        "data": {
          "inputParameters": [{
            "type": "camunda:InputParameter",
            "data": {
              "name": "var-name",
              "value": "var-value"
            }
          },{
            "type": "camunda:InputParameter",
            "data": {
              "name": "map-var",
              "definition": {
                "type": "camunda:Map",
                "data": {
                  "entries": [{
                      "type": "camunda:Entry",
                      "data": {
                        "key": "mkey1",
                        "value": "Val-1"
                      }
                    },
                    {
                      "type": "camunda:Entry",
                      "data": {
                        "key": "mkey2",
                        "value": "Val-2"
                      }
                    }
                  ]
                }
              }
            }
          }],
          "outputParameters": [{
            "type": "camunda:OutputParameter",
            "data": {
              "name": "var-name",
              "definition": {
                "type": "camunda:List",
                "data": {
                  "items": [{
                      "type": "camunda:Value",
                      "data": {
                        "value": "Val-1"
                      }
                    },
                    {
                      "type": "camunda:Value",
                      "data": {
                        "value": "Val-2"
                      }
                    }
                  ]
                }
              }
            }
          }]
        }
      }
    ]
  },
  {
    "type": "bpmn:ServiceTask",
    "title": "Update Finacle",
    "group":  "Group-1",
    "className": "bpmn-icon-service-task",
    "data": {
      "name": "Update Finacle"
    },
    "extensions": [{
      "type": "oecloud:RestConnector",
      "data": {
        "oecloud:ctype": "rest",
        "oecloud:url": "http://localhost:3000/api/Literals",
        "oecloud:method": "GET",
        "oecloud:data": "{}"
      }
    }]

  },
  {
    "type": "bpmn:ScriptTask",
    "title": "Execute Code",
    "group":"Group-2",
    "className": "bpmn-icon-script-task",
    "data": {
      "name": "Set Variables",
      "script": "var x = new Date();\nsetPV('now',x);"
    }
  }
  ]
}