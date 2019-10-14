const path = require('path');
const bodyParser = require('body-parser');
const MODELER_UI_ROOT = path.join(__dirname, 'dist');

function configureRoutes(app, options) {
  const loopback = app.loopback;
  const router = new loopback.Router();

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.text());

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
    app.models.WorkflowDefinition.find(filter, options,
      function fetchWD(err, wfDefns) {
        if (err) {
          next(err);
        }
        res.send(wfDefns.map(item => item.name));
      });
  });

  router.get('/rules', function getRules(req, res, next) {
    app.models.DecisionTable.find(options,
      function fetchDecisionTable(err, decisionTable) {
        if (err) {
          next(err);
        }
        res.send(decisionTable);
      });
  });

  router.get('/files/:filename', function getWfModel(req, res, next) {
    var fileName = req.params.fileName;
    app.models.bpmndata.findOne({ where: { bpmnname: fileName }, fields: ['xmldata'] }, options,
      function fetchBpmn(err, bpmndata) {
        if (err) {
          next(err);
        } else if (bpmndata) {
          res.send(bpmndata.xmldata);
        } else {
          res.send({ status: 404 });
        }
      });
  });
  router.post('/files/:filename', function postWfModel(req, res, next) {
    var fileName = req.params.filename;
    var xmlData = req.body;
    app.models.bpmndata.find({ where: { bpmnname: fileName }, fields: ['bpmnname', 'versionmessage'] }, options,
      function findBpmn(err, bpmndata) {
        var bpmnData = {};
        if (err) {
          next(err);
        } else if (bpmndata.length) {
          var version = [];
          bpmndata.forEach(bpmndata => {
            version.push(parseFloat(bpmndata.versionmessage) * 10);
          });
          version.sort(function sortVersion(a, b) { return b - a; });
          bpmnData.bpmnname = fileName;
          var newVersion = (version[0] + 1) / 10;
          bpmnData.versionmessage = newVersion;
          bpmnData.xmldata = xmlData;
          app.models.bpmndata.upsert(bpmnData,
            function updateBpmn(err, bpmn) {
              if (err) {
                next(err);
              } else if (bpmn) {
                app.models.WorkflowDefinition.create({ name: bpmnData.bpmnname, xmldata: bpmnData.xmldata },
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
          app.models.bpmndata.create(bpmnData,
            function insertBpmn(err, bpmn) {
              if (err) {
                next(err);
              } else if (bpmn) {
                app.models.WorkflowDefinition.create({ name: bpmnData.bpmnname, xmldata: bpmnData.xmldata },
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
