const path = require('path');

const MODELER_UI_ROOT = path.join(__dirname, 'dist');

function configureRoutes(app, options) {
  const loopback = app.loopback;
  const router = new loopback.Router();

  if (options.extensionsPath) {
    router.get('/extensions', function (req, res, next) {
      let extensionsFile = path.join(__dirname, options.extensionsPath);
      try {
        let extensions = require(extensionsFile);
        res.send(extensions);
      } catch(err) {
        next(err);
      }
    });
  }

  router.use(loopback.static(MODELER_UI_ROOT));
  return router;
}


module.exports = function (app, options) {
  options = Object.assign({}, {
    mountPath: '/wfmodeler'
  }, options);
  app.use(
    options.mountPath,
    configureRoutes(app, options)
  );
  app.set('oe-workflow-modeler', options);
}