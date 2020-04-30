# oeCloud Workflow Modeler

## About


## Running the workflow modeler

Install all required dependencies:

```
npm install
npm install -g webpack
```

Build and run the project

```
npm run dev
```

## Enabling workflow modeler

```
npm install oe-workflow-modeler
```

Add following to the _server/component-config.json_

```
{
  "oe-workflow-modeler/component": {
    "mountPath": "/wfmodeler",
    "extensionsPath": "../../extensions.json"
  }
}
```




## License

MIT
