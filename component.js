const path = require('path');
const bodyParser = require('body-parser');
const MODELER_UI_ROOT = path.join(__dirname, 'dist');

function configureRoutes(app, options) {
  const loopback = app.loopback;
  const router = new loopback.Router();
  router.use(bodyParser.urlencoded({
    extended: false
  }));
  router.use(bodyParser.text());

  function getCallContext(req) {
    return req.callContext || options.callContext || {
      ignoreAutoScope: true
    };
  }

  if (options.extensionsPath) {
    router.get('/extensions', function getExtensions(req, res, next) {
      let extensionsFile = path.join(__dirname, options.extensionsPath);
      try {
        let extensions = require(extensionsFile);
        res.send(extensions);
      } catch (err) {
        next(err);
      }
    });
  }

  router.get('/flows', function getFlows(req, res, next) {
    var filter = {
      where: {
        'latest': true
      },
      fields: ['name']
    };

    app.models.WorkflowDefinition.find(filter, getCallContext(req),
      function fetchWD(err, wfDefns) {
        if (err) {
          return next(err);
        }
        res.send(wfDefns.map(item => item.name));
      });
  });

  router.get('/rules', function getRules(req, res, next) {
    app.models.DecisionTable.find({
        fields: ['name']
      }, getCallContext(req),
      function fetchDecisionTable(err, decisionTable) {
        if (err) {
          return next(err);
        }
        res.send(decisionTable.map(item => item.name));
      });
  });

  router.get('/files/:filename', function getWfModel(req, res, next) {
    var fileName = req.params.filename;
    app.models.bpmndata.find({
        where: {
          bpmnname: fileName
        },
        fields: ['xmldata', 'versionmessage']
      }, getCallContext(req),
      function fetchBpmn(err, bpmndata) {
        if (err) {
          next(err);
        } else if (bpmndata.length) {
          bpmndata.sort((a, b) => (a.versionmessage < b.versionmessage) ? 1 : -1);
          res.send(bpmndata[0].xmldata);
        } else {
          res.send({
            status: 404
          });
        }
      });
  });
  router.post('/files/:filename', function postWfModel(req, res, next) {
    var fileName = req.params.filename;
    var xmlData = req.body;
    app.models.bpmndata.find({
        where: {
          bpmnname: fileName
        },
        fields: ['bpmnname', 'versionmessage']
      }, getCallContext(req),
      function findBpmn(err, bpmndata) {
        var bpmnData = {};
        if (err) {
          next(err);
        } else if (bpmndata.length) {
          var version = [];
          bpmndata.forEach(bpmndata => {
            version.push(parseFloat(bpmndata.versionmessage) * 10);
          });
          version.sort((a, b) => (b - a));
          bpmnData.bpmnname = fileName;
          var newVersion = (version[0] + 1) / 10;
          bpmnData.versionmessage = newVersion;
          bpmnData.xmldata = xmlData;
          app.models.bpmndata.upsert(bpmnData, getCallContext(req),
            function updateBpmn(err, bpmn) {
              if (err) {
                next(err);
              } else if (bpmn) {
                app.models.WorkflowDefinition.create({
                    name: bpmnData.bpmnname,
                    xmldata: bpmnData.xmldata
                  }, getCallContext(req),
                  function createWf(err, wfModel) {
                    if (err) {
                      next(err);
                    }
                    res.send(wfModel);
                  });
              }
            });
        } else {
          bpmnData.versionmessage = '1.0';
          bpmnData.xmldata = xmlData;
          bpmnData.bpmnname = fileName;
          app.models.bpmndata.create(bpmnData, getCallContext(req),
            function insertBpmn(err, bpmn) {
              if (err) {
                next(err);
              } else if (bpmn) {
                app.models.WorkflowDefinition.create({
                    name: bpmnData.bpmnname,
                    xmldata: bpmnData.xmldata
                  }, getCallContext(req),
                  function createWf(err, wfModel) {
                    if (err) {
                      next(err);
                    }
                    res.send(wfModel);
                  });
              }
            });
        }
      });
  });
  router.use(loopback.static(MODELER_UI_ROOT));
  return router;
}


module.exports = function wfmodeler(app, options) {
  options = Object.assign({}, {
    mountPath: '/wfmodeler'
  }, options);
  app.use(
    options.mountPath,
    configureRoutes(app, options)
  );
  app.set('oe-workflow-modeler', options);
};