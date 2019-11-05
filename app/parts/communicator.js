
export default class Communicator {
  get isStudioMode() {
    return this.mode === 'studio' && typeof window.oeStudio !== 'undefined';
  }

  _responseEventHandler(evt){
    let data = evt.detail;
    console.log(evt);
    switch(data.name){
      case 'show-file-content': 
      {
        if(data.detail.path.endsWith('workflow-extensions.json')){
          return this._onExtensions && this._onExtensions(JSON.parse(new TextDecoder('utf-8').decode(Buffer.from(data.detail.fileContents))));
        } else {
          return this._onDiagramContent && this._onDiagramContent(data.detail);
        }
      }
      case 'show-success-message': {
        return this._onSaveSuccess && this._onSaveSuccess(data.detail);
      }
      case 'files-matching-search': {
        if(data.detail.pattern === '*.bpmn'){
          return this._onFlowFiles && this._onFlowFiles(data.detail.result);
        } else if(data.detail.pattern === '*.dmn'){
          return this._onRuleFiles && this._onRuleFiles(data.detail.result);
        } else if(data.detail.pattern === 'workflow-extensions.json'){
          if(data.detail.result[0]){
            this.getFileContent(data.detail.result[0]);
          }
        }
        break;
      }
      case 'model-data': {
        return this._onModels && this._onModels(data.detail);
      }
    }
  }

  _sendToStudio(type, data){
    window.dispatchEvent(new CustomEvent('ipc-client-event', {detail: {type: type, detail: data}}));
  }

  _xhrget(url, mime, callback){
    if(!callback && typeof mime === 'function'){
      callback = mime;
      mime = 'json';
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', function(evt){
      if(evt.target.status >= 200 && evt.target.status < 300){
        callback(null, evt.target.response);
      } else {
        callback(evt.target.statusText, null);
      }
    });
    oReq.addEventListener('error', function(err){
      callback(err);
    });

    oReq.open("GET", url);
    oReq.responseType = mime;
    oReq.send();
  }

  _xhrpost(url, body, mime, callback){
    if(!callback && typeof mime === 'function'){
      callback = mime;
      mime = 'json';
    }
    var oReq = new XMLHttpRequest();
    oReq.addEventListener('load', function(evt){
      if(evt.target.status >= 200 && evt.target.status < 300){
        callback(null, evt.target.response);
      } else {
        callback(evt.target.statusText, null);
      }
    });
    oReq.addEventListener('error', function(err){
      callback(err);
    });

    oReq.open("POST", url);
    oReq.responseType = mime;
    oReq.send(body);
  }

  connect(mode) {
    this.mode = mode;

    if(this._boundResponseEventHandler){
      window.removeEventListener('ipc-server-event', this._boundResponseEventHandler);
    }
    this._boundResponseEventHandler = this._responseEventHandler.bind(this);
    window.addEventListener('ipc-server-event', this._boundResponseEventHandler);

    this.getFlowFiles();
    this.getExtensions();
    this.getRuleFiles();
    this.getModels();
  }


  getFlowFiles() {
    if (this.isStudioMode) {
      this._sendToStudio('search-for-pattern', '*.bpmn');
    } else {
      var self = this;
      self._xhrget('flows', function(err, data){
        if(!err && self._onFlowFiles){
          self._onFlowFiles(data);
        }
      });
    }
  }
  onFlowFiles(callback) {
    this._onFlowFiles = callback;
  }

  getRuleFiles() {
    if (this.isStudioMode) {
      this._sendToStudio('search-for-pattern', '*.dmn');
    } else {
      var self = this;
      self._xhrget('rules', function(err, data){
        if(err){
          self.handleError(`Error Loading rules: ${err.message||err}`);
        }
        if(!err && self._onRuleFiles){
          self._onRuleFiles(data);
        }
      });
    }
  }
  onRuleFiles(callback) {
    this._onRuleFiles = callback;
  }

  getModels() {
    if (this.isStudioMode) {
      this._sendToStudio('request-models', {});

      window.dispatchEvent(new CustomEvent('ipc-server-event', {detail: {name: 'model-data', detail:{
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
        }
      }}));

    } else {
      var self = this;
      self._xhrget('models', function(err, data){
        if(err){
          self.handleError(`Error Loading models: ${err.message||err}`);
        }
        if(!err && self._onModels){
          self._onModels(data);
        }
      });      
    }
  }
  onModels(callback) {
    this._onModels = callback;
  }

  getExtensions() {
    if (this.isStudioMode) {
      this._sendToStudio('search-for-pattern', 'workflow-extensions.json');
    } else {
      var self = this;
      self._xhrget('extensions', function(err, data){
        if(err){
          self.handleError(`Error Loading extensions: ${err.message||err}`);
        }
        if(!err && self._onExtensions){
          self._onExtensions(data);
        }
      });      
    }
  }
  onExtensions(callback) {
    this._onExtensions = callback;
  }

  getFileContent(fileName) {
    if (this.isStudioMode) {
      this._sendToStudio('open-selected-file', {
        path: `${fileName}.bpmn`
      });
    } else {
      var self = this;
      self._xhrget(`files/${fileName}`, 'arraybuffer', function(err, data){
        if(err){
          self.handleError(`Unable to load ${fileName}: ${err.message||err}`);
        }
        if(!err && self._onDiagramContent){
          self._onDiagramContent({path: fileName, fileContents: data});
        }
      });
    }
  }

  onDiagramContent(callback) {
    this._onDiagramContent = callback;
  }
  saveDiagramContent(fileName, fileContent) {
    if (this.isStudioMode) {
      this._sendToStudio('save-file-content', {
        path: `${fileName}.bpmn`,
        content: fileContent
      });
    } else {
      var self = this;
      self._xhrpost(`files/${fileName}`, fileContent, function(err, data){
        if(err){
          self.handleError(`Unable to save ${fileName}: ${err.message||err}`);
        }
        if(!err && self._onSaveSuccess){
          self._onSaveSuccess(data);
        }
      });
    }
  }
  onSaveSuccess(callback) {
    this._onSaveSuccess = callback;
  }

  handleError(message){
    if(this._onError){
      this._onError(message);
    } else {
      console.error(message);
    }
  }
  onError(callback) {
    this._onError = callback;
  }
}