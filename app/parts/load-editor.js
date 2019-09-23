import $ from 'jquery';
import * as monaco from 'monaco-editor';

function ConfigureScriptEditor(){
  window.MonacoEnvironment = {
    getWorkerUrl: function (moduleId, label) {
      if (label === 'json') {
        return './json.worker.js';
      }
      if (label === 'css') {
        return './css.worker.js';
      }
      if (label === 'html') {
        return './html.worker.js';
      }
      if (label === 'typescript' || label === 'javascript') {
        return './typescript.worker.js';
      }
      return './editor.worker.js';
    }
  }
    monaco.languages.typescript.javascriptDefaults.addExtraLib(
    `
    /**
      * Set process variable
      * @param name process variable name
      * @param value process variable value
      */
    declare function setPV(name: string, value: any): any;
    /**
      * Get a process variable value
      * @param name process variable name
      */
    declare function pv(name: string): any;
    /**
      * Set message to be sent to next node
      * @param msg message object
      */
    declare function sendMsg(msg: any): any;

    /**
      * Options Object
      */ 
    declare var options: any;
    /**
      * Access Token for executing user
      */ 
    declare var accessToken: any;
    /**
      * Incoming message from previous node
      */ 
    declare var msg: any;

    `, 'filename/facts.d.ts');

  var scriptEditor = monaco.editor.create(document.getElementById('script-editor'), {
    value: '',
    language: 'javascript',
    minimap: {
      enabled: false
    },
    lineNumbers: false,
    scrollBeyondLastLine: false,
    scrollbar: {
      // Subtle shadows to the left & top. Defaults to true.
      useShadows: false,
      verticalScrollbarSize: 6,
      horizontalScrollbarSize: 6    
    }    
  });

  var callback = null;
  $('.modal-content-btn').click(function(evt){
    if(callback){
      callback(scriptEditor.getValue());
      callback = null;
    }
  });
  
  window.addEventListener('open-script-editor', function(evt){
    scriptEditor.setValue(evt.detail.script || '');
    callback = evt.detail.cb;
    $('#modal-toggle')[0].checked = true;
  });
}

export {ConfigureScriptEditor};