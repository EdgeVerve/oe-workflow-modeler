/*
Copyright Notice
	©2016 EdgeVerve Systems Limited (a fully owned Infosys subsidiary), Bangalore, India. All Rights Reserved.
	The EdgeVerve proprietary software program ("Program"), is protected by copyrights laws, international treaties and other pending or existing intellectual property rights in India, the United States and other countries. The Program may contain / reference third party or open source components, the rights to which continue to remain with the applicable third party licensors or the open source community as the case may be and nothing here transfers the rights to the third party and open source components, except as expressly permitted. Any unauthorized reproduction, storage, transmission in any form or by any means (including without limitation to electronic, mechanical, printing, photocopying, recording or  otherwise), or any distribution of this Program, or any portion of it, may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under the law.

	
*/	
'use strict';

/*
*modified by: arul_ranjith
* adding evf connector
*/
var fs = require('fs');
if (window.listenerData === undefined) {window.listenerData = {};}


if (window.assignmentTypeData === undefined) {window.assignmentTypeData = {};}
window.currentIO = '';
window.currentFileStatus = 'new';
var $ = require('jquery'),
  BpmnModeler = require('bpmn-js/lib/Modeler');

var propertiesPanelModule = require('oe-workflow-properties-panel'),
  propertiesProviderModule = require('oe-workflow-properties-panel/lib/provider/camunda'),
  camundaModdleDescriptor = require('oe-camunda-bpmn-moddle/resources/camunda');

var container = $('#js-drop-zone');

var canvas = $('#js-canvas');

var bpmnModeler = new BpmnModeler({
  container: canvas,
  propertiesPanel: {
    parent: '#js-properties-panel'
  },
  additionalModules: [
    propertiesPanelModule,
    propertiesProviderModule
  ],
  moddleExtensions: {
    camunda: camundaModdleDescriptor
  }
});

window.bpmnModeler = bpmnModeler;

var logger = function()
{
    var oldConsoleLog = null;
    var pub = {};

    pub.enableLogger =  function enableLogger() 
                        {
                            if(oldConsoleLog == null) {return;}

                            window.console.log = oldConsoleLog;
                        };

    pub.disableLogger = function disableLogger()
                        {
                            oldConsoleLog = console.log;
                            window.console.log = function() {};
                        };

    return pub;
}();

logger.disableLogger();
//logger.enableLogger();
var eventBus = bpmnModeler.get('eventBus');
eventBus.on('element.dblclick',drillDown);

function drillDown(e) {
	var type = e.element ? e.element.type : e.data.shape.type;
	if(type == "bpmn:CallActivity") {
		  openCallActivity(e);
	  }else if(type == "bpmn:BusinessRuleTask") {
		  openDecision(e);
		  
	  }else{
		  return;
	  }
}

function openDecision(e) {
	var id = e.element.id;
	var elementRegistry =  bpmnModeler.get('elementRegistry');
	var bpmnElement = elementRegistry.get(id);
	var bpmnObj = bpmnElement.businessObject;
	window.parent.postMessage(bpmnObj.decisionRef,"*");
}

function openCallActivity(e) {
  var id = e.element ? e.element.id : e.data.shape.id;
  if(!window.currentWFOpened) {
	  alert("Please save the parent process")
	  return;
  }
  if(!window.wfOpenedHistStack) {
	  window.wfOpenedHistStack = [];
  }
  window.wfOpenedHistStack.push(window.currentWFOpened);	  
  var elementRegistry =  bpmnModeler.get('elementRegistry');
  var bpmnElement = elementRegistry.get(id);
  var bpmnObj = bpmnElement.businessObject;
  window.openDiagramByName(bpmnObj.calledElement);
  
}

window.openDiagramByName = function(name){
	var diagramDetails = {
        async: true,
        crossDomain: true,
        url: '/api/bpmndata?filter={"where":{"bpmnname":"'+name+'"}}',
        method: 'GET',
        headers: {
            'cache-control': 'no-cache'
        },
        error: function () {
            alert('something went wrong');
        }
    }

    $.ajax(diagramDetails).done(function (response) {
		if(response.length == 0) {
			alert("Unable to find the call activity");
		}
		window.currentWFOpened = {"name": name};
		$("#js-back-to-parent").attr("disabled",false);
		openDiagram(response[0].xmldata)	
	});
  }


var newDiagramXML = fs.readFileSync(__dirname + '/../resources/newDiagram.bpmn', 'utf-8');

function createNewDiagram() {
  window.currentFileStatus = 'new';
  openDiagram(newDiagramXML);
}

window.createDiagram = function createNewDiagram(xmldata) {
  window.currentFileStatus = 'old';
  openDiagram(xmldata);
}


function openDiagram(xml) {

  window.listenerData = {};
  var parser = new DOMParser();
  var xmlDoc = parser.parseFromString(xml, 'text/xml');
  var processNode = xmlDoc.childNodes[0].childNodes;

  for (var i = 0; i < processNode.length; i++) {
    if (processNode[i].nodeName === 'bpmn2:process') {
      var processChildren = processNode[i].childNodes;
      for (var j = 0; j < processChildren.length; j++) {
        if (processChildren[j].nodeName.includes('task')) {
          var taskChildren = processChildren[j].childNodes;
          for (var k = 0; k < taskChildren.length; k++) {
            if (taskChildren[k].nodeName.includes('extensionElements')) {
              var inputOutputChildren = taskChildren[k].childNodes;
              for (var t = 0; t < inputOutputChildren.length; t++) {
                if (inputOutputChildren[t].nodeName.includes('input') || inputOutputChildren[t].nodeName.includes('output')) {
                  //console.log(inputOutputChildren[t]);
                  var parameters = inputOutputChildren[t].childNodes;
                  for (var h = 0; h < parameters.length; h++) {
                    if ((parameters[h].nodeName.includes('input') || parameters[h].nodeName.includes('output')) && parameters[h].attributes.eventType !== undefined) {
                      window.listenerData[parameters[h].attributes.name.nodeValue] = parameters[h].attributes.eventType.nodeValue;
                      //console.log(parameters[h].attributes.name.nodeValue + ' ' + parameters[h].attributes.eventType.nodeValue);
                    }

                  }
                }

              }
            }
          }
        }
      }
    }
  }


  bpmnModeler.importXML(xml, function(err) {

    if (err) {
      container
        .removeClass('with-diagram')
        .addClass('with-error');

      container.find('.error pre').text(err.message);

      console.error(err);
    } else {
      container
        .removeClass('with-error')
        .addClass('with-diagram');
    }


  });
}

function saveSVG(done) {
  bpmnModeler.saveSVG(done);
}

function saveDiagram(done) {

  bpmnModeler.saveXML({
    format: true
  }, function(err, xml) {
    done(err, xml);
  });
}

function registerFileDrop(container, callback) {

  function handleFileSelect(e) {
    e.stopPropagation();
    e.preventDefault();

    var files = e.dataTransfer.files;

    var file = files[0];

    var reader = new FileReader();

    reader.onload = function(e) {

      var xml = e.target.result;
      window.currentFileStatus = 'new';
      callback(xml);
    };

    reader.readAsText(file);
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

// bootstrap diagram functions

$(document).on('ready', function() {

  $('#js-create-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();

    createNewDiagram();
  });
   $('#js-new-diagram').click(function(e) {
    e.stopPropagation();
    e.preventDefault();
    if(xmldata!==''){
    var xmldata = '';
    createNewDiagram();
    }else{

    }
  });
  var xmldata = '';
  var downloadLink = $('#js-download-diagram');
  var simulateLink = $('#js-simulate-diagram');
  var downloadSvgLink = $('#js-download-svg')
  var saveLink = $('#js-save-diagram');
  var publishLink = $('#js-publish-diagram');
  $('#js-save-diagram').click(function() {
    // alert("test");
    //  console.log($('#savelinkd'));
    // $('#savelinkd').click();
    window.openSave(xmldata);
  });

  function saveData(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      console.log(link);
      xmldata = data;
      link.attr('disabled', false);
      link.addClass('active').removeClass('disabled').removeClass('nopointer').addClass('pointer');

      /*.attr({
              'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
              'download': name
            });*/
      //  alert(data);
    } else {
      link.removeClass('active');
      link.addClass('disabled');
      link.addClass('nopointer');
      link.removeClass('pointer');
      
      link.attr('disabled', true);
    }
  }
  $('.buttons a').click(function(e) {
    if (!$(this).is('.active')) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  function setEncoded(link, name, data) {
    var encodedData = encodeURIComponent(data);

    if (data) {
      xmldata = data;
      link.attr('disabled', false);
      link.addClass('active').removeClass('disabled').removeClass('nopointer').addClass('pointer').attr({
        'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
        'download': name
      });
    } else {
      link.removeClass('active');
      link.addClass('disabled');
       link.addClass('nopointer');
      link.removeClass('pointer');
      link.attr('disabled', true)
   //   console.log(link.attr('disabled', true));
    }
  }

  var debounce = require('lodash/function/debounce');

  var exportArtifacts = debounce(function() {

    saveSVG(function(err, svg) {
      setEncoded(downloadSvgLink, 'diagram.svg', err ? null : svg);
    });
    saveDiagram(function(err, xml) {
      saveData(saveLink, 'diagram.bpmn', err ? null : xml);
    });
	saveDiagram(function(err, xml) {
      saveData(simulateLink, 'diagram.bpmn', err ? null : xml);
    });
    saveDiagram(function(err, xml) {
      saveData(publishLink, 'diagram.bpmn', err ? null : xml);
    });
    saveDiagram(function(err, xml) {
      setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
    });
  }, 500);

  bpmnModeler.on('commandStack.changed', exportArtifacts);
});