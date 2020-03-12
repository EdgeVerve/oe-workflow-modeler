import $ from 'jquery';
import diagramXML from '../../resources/newDiagram.bpmn';

const path = require('path');

import {
  ReduxStore,
  Subscribe
} from '../state/store';
import {
  diagramLoadedAction,
  diagramSavedAction,
  changeFileNameAction,
  receiveRulesSuccessAction,
  receiveFlowsSuccessAction,
  receiveModelsSuccessAction,
  extensionsReceivedAction,
  setPrimaryFolderAction,
  setFilesAction,
  changeVersionAction,
  popActivityFlow,
  emptyActivityFlow
} from '../state/actions';

import Communicator from './communicator';

import {
  convertToOld,
  loadAsNew
} from './xml-parser';

function ConfigureButtons(bpmnModeler) {


  var communicator = new Communicator();

  function fetchDiagramData(detail){
    
    detail.callback = detail.callback || function(){};
    let fileName = detail.name;
    
    let state = ReduxStore.getState();
    if(state.hasChanged){
      window.dispatchEvent(new CustomEvent('oe-show-confirm', {detail: {
        message: `Changes to ${state.fileName} will be lost. Continue?`,
        ok: function(){
          communicator.getFileContent(fileName);
          detail.callback(true);
        },
        cancel: function(){
          detail.callback(false);
        }
      }}))
    } else {
      communicator.getFileContent(fileName);
      detail.callback(true);
    }
  }
  window.addEventListener('open-diagram', function(evt){
    fetchDiagramData(evt.detail);
  });
  communicator.onDiagramContent(function (data) {
    openDiagram(path.basename(data.path), data.path, new TextDecoder('utf-8').decode(Buffer.from(data.fileContents)));
  });

  communicator.onSaveSuccess(function (data) {
    ReduxStore.dispatch(diagramSavedAction());
    if(typeof data === 'object' && data.name){
      if(data.versionmessage){
        data = `Saved successfully [${data.name}/${data.versionmessage}]`
      } else {
        data = `Saved successfully [${data.name}]`
      }
    }
    window.dispatchEvent(new CustomEvent('oe-show-success', {detail: data}));
  });

  communicator.onError(function(message){
    window.dispatchEvent(new CustomEvent('oe-show-error', {detail: message}));
  });
  communicator.onModels(function (data) {
    ReduxStore.dispatch(receiveModelsSuccessAction(data));
  });

  communicator.onExtensions(function (data) {
    ReduxStore.dispatch(extensionsReceivedAction(data));
  })
  communicator.onFlowFiles(function (results) {
    let allFolders = {};
    let allFiles = results.map(entry => {
      let pathObject = {
        dir: path.dirname(entry),
        ext: path.extname(entry),
        base: path.basename(entry)
      }
      if (allFolders[pathObject.dir]) {
        allFolders[pathObject.dir] = allFolders[pathObject.dir] + 1;
      } else {
        allFolders[pathObject.dir] = 1;
      }
      return {
        fullPath: entry.replace(pathObject.ext, ''),
        name: pathObject.base.replace(pathObject.ext, ''),
        ext: pathObject.ext
      };
    });

    ReduxStore.dispatch(setFilesAction(allFiles));
    ReduxStore.dispatch(receiveFlowsSuccessAction(allFiles.map(entry => entry.name)));

    let primaryFolder = Object.keys(allFolders).reduce((a, b) => allFolders[a] > allFolders[b] ? a : b, '.');
    ReduxStore.dispatch(setPrimaryFolderAction(primaryFolder));
  });

  communicator.onRuleFiles(function (data) {
    ReduxStore.dispatch(receiveRulesSuccessAction(data));
  });

  if (window.oeStudio) {
    communicator.connect('studio');
  } else {
    window.addEventListener('oestudio-attached', function () {
      communicator.connect('studio');
    });
    setTimeout(function () {
      /* If we have not connected yet, lets connect remote */
      if (!communicator.isStudioMode) {
        communicator.connect('remote');
      }
    }, 3000);
  }

  let container = $('#js-drop-zone');

  /** Subscribe to fileName and errorMessage change in redux store 
   * Update the view accordingly.
   */
  Subscribe(['fileName', 'errorMessage'], function (newState) {
    if (newState.fileName) {
      $('#js-file-name').html(newState.fileName);
    }
    if (newState.errorMessage) {
      window.dispatchEvent(new CustomEvent('oe-show-error', {detail: {
        message: `Invalid file type, Upload BPMN file`
      }
    }));
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(newState.errorMessage);
      console.error(newState.errorMessage);
      $('#props-toggle').addClass('hidden');
      $('.buttons').addClass('hidden');
      $('#js-properties-panel').addClass('closed');
    } else {
      $('.buttons').removeClass('hidden');
      $('#props-toggle').removeClass('hidden');
      $('#js-properties-panel').removeClass('closed');
      $('#props-toggle').removeClass('closed');
      $('.buttons').removeClass('move');
      $('#props-toggle').removeClass('move-toggle');
      $('#error').addClass('hidden');
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }
  });

  Subscribe(['fileName', 'hasChanged'], function (newState) {
    let element = $('#js-file-name');
    if (newState.hasChanged) {
      element.addClass('modified');
    } else {
      element.removeClass('modified');
    }
    element.html(newState.fileName);
  });
  Subscribe(['files'], function (newState) {
    var array = newState.files;
    var newHTML = [];
    for (var i = 0; i < array.length; i++) {
      newHTML.push('<a class="dropdown-item" tabindex="0">' + array[i].fullPath + '</a>');
    }
    $(".list").html(newHTML.join(""));
    $(".dropdown1-menu .list a").click(function (e) {
      var fileName = $(this).text();
      if (fileName) {
        fetchDiagramData({
          name: fileName, 
          callback: function(isOpened){
            if(isOpened) {
              ReduxStore.dispatch(emptyActivityFlow());
              $('#view-parent-flow').addClass('hidden');
            }
          }
        });
        $('#file-list').addClass('hidden');
      }
    });
  });

  Subscribe(['extensions'], function (newState) {
    bpmnModeler.get('palette')._update();
  });
  $("#srch-term").on("keyup", function(e) {
    var value = $(this).val().toLowerCase();
    $(".list a").filter(function() {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
    });
  });
  $('#js-file-name').keypress(function (evt) {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      evt.currentTarget.blur();
    }
  });

  $('#js-file-name').blur(function (evt) {
    ReduxStore.dispatch(changeFileNameAction(evt.currentTarget.innerText));
  });
  function openDiagram(fileName, filePath, xml) {
    let version;
    filePath = filePath ? filePath.replace(fileName, '') : '';
    if (xml.includes('oecloud:')) {
      version = 'v2'
    } else {
      version = 'v1'
    }
    $('select option').removeAttr('selected').filter('[value=' + version + ']').attr('selected', true);
    ReduxStore.getState().activityFlow.length ? $('#view-parent-flow').removeClass('hidden') : $('#view-parent-flow').addClass('hidden');
    ReduxStore.dispatch(changeVersionAction(version));
    /* Always convert to New for editing */
    xml = loadAsNew(xml);
    bpmnModeler.importXML(xml, function (err) {
      if (err) {
        ReduxStore.dispatch(diagramLoadedAction(fileName, filePath, err.message));
      } else {
        ReduxStore.dispatch(diagramLoadedAction(fileName, filePath));
      }
    });
  }

  function readFileText(file, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var xml = e.target.result;
      callback(file.name, file.path, xml);
    };
    reader.readAsText(file);
    ReduxStore.dispatch(emptyActivityFlow());
    $('view-parent-flow').addClass('hidden');
  }
  function registerFileDrop(container, callback) {

    function handleFileSelect(e) {
      e.stopPropagation();
      e.preventDefault();

      var files = e.dataTransfer.files;

      var file = files[0];
      readFileText(file, callback);
    }

    function handleDragOver(e) {
      e.stopPropagation();
      e.preventDefault();
      
      e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }

    container.get(0).addEventListener('dragover', handleDragOver, false);
    container.get(0).addEventListener('drop', handleFileSelect, false);
  }

  ////// file drag / drop ///////////////////////

  // check file api availability
  if (!window.FileList || !window.FileReader) {
    window.alert(
      'Looks like you use an older browser that does not support drag and drop. ' +
      'Try using Chrome, Firefox or the Internet Explorer > 10.');
  } else {
    registerFileDrop(container, openDiagram);
  }

  $('.js-create-diagram').click(function (e) {
    openDiagram('newDiagram.bpmn', null, diagramXML);
    ReduxStore.dispatch(emptyActivityFlow());
    $('#view-parent-flow').addClass('hidden');
    $('#file-list').addClass('hidden');
  });

  $('#js-menu').click(function (e) {
    $('.menu-items').toggleClass('hidden');
  });
  $(document).mouseup(function (e) { 
    if(e.target.id !== 'js-menu' && e.target.id !== 'open-local-file' && 
    e.target.id !== 'upload-file' && e.target.id !== 'oe-version' && e.target.id !== 'srch-term' 
    && e.target.parentNode.id !== 'srch-btn' && e.target.parentNode.id !== 'js-menu' && 
    e.target.parentNode.id !== 'open-local-file'){
      $('.menu-items').addClass('hidden');
      $('#file-list').addClass('hidden');
    }
  }); 
  $('#props-toggle').click(function (e) {
    $('#props-toggle').toggleClass('closed');
    $('#js-properties-panel').toggleClass('closed');
    $('.buttons').toggleClass('move');
    $('#props-toggle').toggleClass('move-toggle');
  });

  $('#open-local-file').click(function (e) {
    $('#file-list').toggleClass('hidden');
  });

  $('#upload-file').click(function (e) {
    $('#file-list').toggleClass('hidden');
    $('#file-input').click();
  });

  $('#file-input').change(function (e) {
    var file = e.target.files[0];
    if (file) {
      readFileText(file, openDiagram);
    }
  });

  $('#view-parent-flow').click(function () {
    var actArray = ReduxStore.getState().activityFlow;
    window.dispatchEvent(
      new CustomEvent('open-diagram', {
        detail: {
          name: actArray[actArray.length-1],
          callback: function(isOpened){
            if(isOpened){
              ReduxStore.dispatch(popActivityFlow());
            }
          }
        }
      }));
  })

  function downloadFile(filename, data) {
    let link = document.createElement('a');
    var encodedData = encodeURIComponent(data);
    $(link).attr({
      'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
      'download': filename
    });
    link.click();
  }

  function getFilename(extn) {
    let state = ReduxStore.getState();
    let fileName = state.fileName || 'workflow-diagram';
    fileName = extn && !fileName.endsWith(extn)?`${fileName}.${extn}`: fileName;
    return {
      name: fileName,
      fullName: path.join(state.filePath || state.primaryFolder || '.', fileName)
    };
  }

  $('#js-download-svg').click(function () {
    bpmnModeler.saveSVG(function (err, data) {
      downloadFile(getFilename('svg').name, data);
    });
  });

  $("select.custom-select").change(function () {
    var selectedVersion = $(this)[0].value;
    ReduxStore.dispatch(changeVersionAction(selectedVersion));
  });

  $('#js-download-diagram').click(function () {
    bpmnModeler.saveXML({
      format: true
    }, function (err, data) {
      if (ReduxStore.getState().version === 'v1') {
        data = convertToOld(data);
      }
      downloadFile(getFilename('bpmn').name, data);
    });
  });

  $('#js-save-diagram').click(function () {
    bpmnModeler.saveXML({
      format: true
    }, function (err, data) {
      if (ReduxStore.getState().version === 'v1') {
        data = convertToOld(data);
      }
      communicator.saveDiagramContent(getFilename().fullName, data);
    });
  });
}

export {
  ConfigureButtons
};