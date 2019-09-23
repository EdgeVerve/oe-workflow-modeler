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
  setFilesAction
} from '../state/actions';

import Communicator from './communicator';

import {
  saveAsOld,
  loadAsNew
} from './xml-parser';

function ConfigureButtons(bpmnModeler) {


  var communicator = new Communicator();
  communicator.onDiagramContent(function (data) {
    openDiagram(path.basename(data.path), data.path, new TextDecoder('utf-8').decode(Buffer.from(data.fileContents)));
  });

  communicator.onSaveSuccess(function (data) {
    ReduxStore.dispatch(diagramSavedAction());
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
        fullPath: entry,
        name: pathObject.base.replace(pathObject.ext, '')
      };
    });


    ReduxStore.dispatch(setFilesAction(allFiles));
    ReduxStore.dispatch(receiveFlowsSuccessAction(allFiles.map(entry => entry.name)));

    let primaryFolder = Object.keys(allFolders).reduce((a, b) => allFolders[a] > allFolders[b] ? a : b, '.');
    ReduxStore.dispatch(setPrimaryFolderAction(primaryFolder));
  });

  communicator.onRuleFiles(function (results) {
    let rules = results.map(entry => path.basename(entry).replace(path.extname(entry), ''));
    ReduxStore.dispatch(receiveRulesSuccessAction(rules));
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
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(newState.errorMessage);
      console.error(newState.errorMessage);
    } else {
      $('.buttons').removeClass('hidden');
      $('#props-toggle').removeClass('hidden');
      $('#oe-version').removeClass('hidden');
      $('#js-properties-panel').removeClass('closed');

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
      newHTML.push('<a class="dropdown-item">' + array[i].fullPath + '</a>');
    }
    newHTML.push('<div class="dropdown-divider"></div>');
    $(".list").html(newHTML.join(""));
    $(".dropdown1-menu .list a").click(function () {
      var fileName = $(this).text();
      if (fileName) {
          communicator.getFileContent(fileName);
          $('#file-list').addClass('hidden');
        }
    });
  });

  Subscribe(['extensions'], function (newState) {
    bpmnModeler.get('palette')._update();
  });

  $('#js-file-name').keypress(function (evt) {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      evt.currentTarget.blur();
      ReduxStore.dispatch(changeFileNameAction(evt.currentTarget.innerText));
    }
  });

  function openDiagram(fileName, filePath, xml) {
    filePath = filePath ? filePath.replace(fileName, '') : '';
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
  // $(document).ready(function(){ 
  //   let state = ReduxStore.getState();
  //   let array = state.files;
  //   let newHTML = [];
  //   for (var i = 0; i < array.length; i++) {
  //       newHTML.push('<a class="dropdown-item">' + array[i].name + '</a>');
  //   }
  //   newHTML.push('<div class="dropdown-divider"></div>');
  //   $(".list").html(newHTML.join(""));
  // });
  $('.js-create-diagram').click(function (e) {
    openDiagram('newDiagram.bpmn', null, diagramXML);
  });

  $('#js-menu').click(function (e) {
    $('.menu-items').toggleClass('hidden');
  });

  $('#props-toggle').click(function (e) {
    if ($(this).is('.closed')) {
      $(this).removeClass('closed');
      $('#js-properties-panel').removeClass('closed');
      $('.buttons').removeClass('move');
      $('.menu-items').removeClass('move-items');
      $('#props-toggle').removeClass('move-toggle');
    } else {
      $(this).addClass('closed');
      $('#js-properties-panel').addClass('closed');
      $('.buttons').addClass('move');
      $('.menu-items').addClass('move-items');
      $('#props-toggle').addClass('move-toggle');
    }
  });

  $('#open-local-file').click(function (e) {
    if ($('#file-list').is('.hidden')) {
      $('#file-list').removeClass('hidden');
    }
    else
    {
      $('#file-list').addClass('hidden');
    }
  });

  $('#upload-file').click(function (e) {
    $('#file-input').click();
  });

  $('#file-input').change(function (e) {
    var file = e.target.files[0];
    if (file) {
      readFileText(file, openDiagram);
    }
  });


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
    let fileName = state.fileName || 'diagram.bpmn';
    fileName = fileName.replace(/bpmn$/, extn);
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

  $("select.custom-select").change(function(){
      var selectedVersion = $(this).children("option:selected").val();
      alert("You have selected the version " + selectedVersion);
  });

  $('#js-download-diagram').click(function () {
    bpmnModeler.saveXML({
      format: true
    }, function (err, data) {
      downloadFile(getFilename('bpmn').name, data);
    });
  });

  $('#js-save-diagram').click(function () {
    bpmnModeler.saveXML({
      format: true
    }, function (err, data) {
      communicator.saveDiagramContent(getFilename('bpmn').fullName, data);
    });
  });

  // $('#js-file-node').click(function (evt) {
  //   let fileName = evt.currentTarget.dataset.file;
  //   if (fileName) {
  //     communicator.getFileContent(fileName);
  //   }
  // });
}

export {
  ConfigureButtons
};