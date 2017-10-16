/*
Copyright Notice
	©2016 EdgeVerve Systems Limited (a fully owned Infosys subsidiary), Bangalore, India. All Rights Reserved.
	The EdgeVerve proprietary software program ("Program"), is protected by copyrights laws, international treaties and other pending or existing intellectual property rights in India, the United States and other countries. The Program may contain / reference third party or open source components, the rights to which continue to remain with the applicable third party licensors or the open source community as the case may be and nothing here transfers the rights to the third party and open source components, except as expressly permitted. Any unauthorized reproduction, storage, transmission in any form or by any means (including without limitation to electronic, mechanical, printing, photocopying, recording or  otherwise), or any distribution of this Program, or any portion of it, may result in severe civil and criminal penalties, and will be prosecuted to the maximum extent possible under the law.
*/
// $(document).ready(function(){
//     if(!sessionStorage.getItem('auth_token')){
//         window.location.href = '../';

//     }
// });
/*
Changes:- changed the auth token method to auto fetch from session.
*/
// $(document).ready(function () {
//     $('.openbutton').click(function () {
//         alert("test")
//     });
//     // Handler for .ready() called.
//     alert("initiate alert")

// });

var generalXMLDef = {};
window.currFileName = '';
window.openSave = function (data) {
    //console.log('data===>>>' + data);
    $('#xmldata').val(data);
    $('#savelinkd').click();

};
window.openSaveAsComponent = function (data) {
    //console.log('data===>>>' + data);
    $('#xmldata1').val(data);
    $('#savelinkd1').click();

};
var callback;
$('#savebpmnbtn').click(function () {
    event.preventDefault();

    saveDiagram(callback);

    // $.ajax({
    //     url: './api/bpmndata?access_token=' + accessToken,
    //     data: JSON.stringify(data),
    //     error: function (jqXHR, exception) {
    //         alert('An error has occurred');
    //         //console.log(jqXHR);
    //         //console.log(exception);
    //         //   $('#info').html('<p>An error has occurred</p>');
    //     },

    //     headers: {
    //         "content-type": "application/json",
    //         "cache-control": "no-cache"
    //     },
    //     success: function (data) {
    //         //console.log(data);
    //     },
    //     method: 'POST'
    // });
    return false;
});

// $('#openlinkd').click(function () {

//     window.createDiagram();
//     //console.log("creating new diagram....."); versionmessage
// });
function saveDiagram(callback) {
    if ($('#bpmnname').val() === '') {
        $('#bpmnname').removeClass('valid');
        $('#bpmnname').addClass('invalid');

    } else if ($('#versionmessage').val() === '') {
        $('#versionmessage').removeClass('valid');
        $('#versionmessage').addClass('invalid');
    } else if ($('#version').val() !== '') {



        ajaxSave();

    } else {

        validateAndSaveFile(callback);

    }
}


window.saveDiagramAsComponent = function(domainGroup, processGroup, callback) {
    if ($('#bpmnname1').val() === '') {
        $('#bpmnname1').removeClass('valid');
        $('#bpmnname1').addClass('invalid');

    } else if ($('#versionmessage1').val() === '') {
        $('#versionmessage1').removeClass('valid');
        $('#versionmessage1').addClass('invalid');
    } else if ($('#version1').val() !== '') {
        ajaxSave1();

    } else {
        validateAndSaveFile1(domainGroup, processGroup, callback);

    }
}
function opendiagram(id) {
    var version = $('#' + $.trim(id)).val();
    window.createDiagram(generalXMLDef[version].data);
    window.currFileName = generalXMLDef[version].name;
    $('#bpmnname').val(window.currFileName);
    $('#version').val(version);
    $('#xmldata').val(generalXMLDef[version].data);
    $('#modal2').closeModal();
	window.currentWFOpened = {"id": id}; 
}

window.opendiagram = opendiagram;


$('#js-open-diagram').click(function () {
	window.simulationMode = false;
    var tenantId = sessionStorage.getItem('tenantId');
    var accessToken = sessionStorage.getItem('auth_token');
    var bpmnurl = '/api/bpmndata'; //?filter=[where][tenant]=' + tenantId + '&access_token=' + accessToken;
    var historyurl = '/api/bpmndata/history'; //?filter=[where][tenant]=' + tenantId + '&access_token=' + accessToken;
    //console.log("history:=  " + historyurl)
    var settingsBpmn = {
        async: true,
        crossDomain: true,
        url: bpmnurl,
        method: 'GET',
        headers: {
            'cache-control': 'no-cache'
        },
        error: function () {
            alert('something went wrong');
        }
    }
    var settingsHistory = {
        async: true,
        crossDomain: true,
        url: historyurl,
        method: 'GET',
        headers: {
            'cache-control': 'no-cache'
        },
        error: function () {
            alert('something went wrong');
        }
    }

    $.ajax(settingsBpmn).done(function (response) {
        //console.log(response);
        var totalBpmns = response;
        $('#filestable tbody tr').remove();
        for (var i = 0; i < totalBpmns.length; i++) {
            var obj = {};
            obj.data = totalBpmns[i].xmldata;
            obj.name = totalBpmns[i].bpmnname;
            obj.version = totalBpmns[i]._version;
            generalXMLDef[totalBpmns[i]._version] = obj;
            var tempoption = formatDate(new Date(totalBpmns[i]._modifiedOn));
            if (totalBpmns[i].versionmessage) {
                tempoption = totalBpmns[i].versionmessage.slice(0, 25) + '...' + formatDate(new Date(totalBpmns[i]._modifiedOn));
            }
            //console.log(totalBpmns[i].versionmessage.slice(0,25)+"..."+formatDate(new Date(totalBpmns[i]._modifiedOn)));
            var temp = '<tr class="style-scope work-flow"><td class="style-scope work-flow">' + totalBpmns[i].bpmnname + '</td><td class="style-scope work-flow"><select id="' + totalBpmns[i].id + '" class="style-scope work-flow"><option value="' + totalBpmns[i]._version + '" title="' + totalBpmns[i].versionmessage + '" class="style-scope work-flow">' +
                tempoption + '</option></select></td>' + //onclick="opendiagram(\'' + totalBpmns[i].id + '\')"
                '<td class="style-scope work-flow">  <button class="opendg btn-floating btn-large waves-effect waves-light red style-scope work-flow openbutton" name="'+totalBpmns[i].id+'" id="opend-' + totalBpmns[i].id + '" ><i class="material-icons style-scope work-flow">folder_open</i></button><td></tr>';
            $('#filestable tbody').append(temp);
           
            $('#opend-' + totalBpmns[i].id).bind("click", function () {
                //alert("User clicked on 'foo.'");
                opendiagram(this.name);

            });

        }
        $.ajax(settingsHistory).done(function (response) {
            //console.log(response);
            var totalBpmns = response;
            for (var i = 0; i < totalBpmns.length; i++) {
                var obj = {};
                obj.data = totalBpmns[i].xmldata;
                obj.name = totalBpmns[i].bpmnname;
                obj.version = totalBpmns[i]._version;
                generalXMLDef[totalBpmns[i]._version] = obj;
                //generalXMLDef[totalBpmns[i]._version].name = ;
                var tempoption = totalBpmns[i].versionmessage.slice(0, 25) + '...' + formatDate(new Date(totalBpmns[i]._modifiedOn));
                var temp = '<option value="' + totalBpmns[i]._version + '" title="' + totalBpmns[i].versionmessage + '">' + tempoption + '</option>';
                //var modelId = totalBpmns[i]._modelId;
                var tempId = '#' + totalBpmns[i]._modelId;
                //console.log($(tempId));
                $(tempId).append(temp);
                // $('#modal2').openModal();
            }
            $('#modal2').openModal();

        });
    });
});

function formatDate(date) {
    //console.log(typeof date);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    // the hour '0' should be '12'
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear() + ' ' + strTime;
}


function validateAndSaveFile1(domainGroup, processGroup, callback) {
    var tenantId = sessionStorage.getItem('tenantId');
    var accessToken = sessionStorage.getItem('auth_token');
    //filter=[where][and][0][tenant]=default&filter[where][and][1][bpmnname]=
    var bpmnurl = '/api/bpmndata?filter[where][and][1][bpmnname]=' + $('#bpmnname1').val(); // + '&filter=[where][and][0][tenant]=' + tenantId + '&&access_token=' + accessToken;
    var settingsHistory = {
        'async': true,
        'crossDomain': true,
        'url': bpmnurl,
        'method': 'GET',
        'headers': {
            'cache-control': 'no-cache'
        },
        'error': function () {
            alert('something went wrong');
        }
    };
    $.ajax(settingsHistory).done(function (response) {
        //console.log(response);
        if (response.length === 0) {
            ajaxSave1(domainGroup, processGroup, callback);
        } else {
            $('#bpmnname1').removeClass('valid');
            $('#bpmnname1').addClass('invalid');
            $('#bpmnname1').prop('aria-invalid', 'true');
            //  event.preventDefault();

        }

    });
    return true;
}


function ajaxSave1(domainGroup, processGroup, callback) {
    $('#bpmnname1').addClass('valid');
    $('#bpmnname1').removeClass('invalid');
    $('#versionmessage1').addClass('valid');
    $('#versionmessage1').removeClass('invalid');
    //console.log("Validation success..............................");//versionmessage
    var accessToken = sessionStorage.getItem('auth_token');
    var tenantId = sessionStorage.getItem('tenantId');
    var postUrl = '';
    var settings = {
        'async': true,
        'crossDomain': true,
        //"url":postUrl,
        'method': 'POST',
        'headers': {
            'content-type': 'application/json',
            'cache-control': 'no-cache'
        },
        'processData': false
    };
    var data;
    if ((window.currentFileStatus && window.currentFileStatus === 'new') || (window.currFileName != $('#bpmnname').val())) {
        postUrl = '/api/bpmndata'; //?access_token=' + accessToken;
        data = {
            bpmnname: $('#bpmnname1').val(),
            tenant: tenantId,
            xmldata: $('#xmldata1').val(),
            versionmessage: $('#versionmessage1').val()
        };
        settings.data = JSON.stringify(data);
        settings.url = postUrl;
    } else if (window.currentFileStatus === 'old') {
        postUrl = '/api/bpmndata/' + $('#modelId1').val(); // + '?access_token=' + accessToken;
        data = {
            bpmnname: $('#bpmnname1').val(),
            tenant: tenantId,
            xmldata: $('#xmldata1').val(),
            _version: $('#version1').val(),
            versionmessage: $('#versionmessage1').val()

        };
        settings.method = 'PUT';
        settings.url = postUrl;
        settings.data = JSON.stringify(data);
    }
    //console.log(data);

    $.ajax(settings).done(function (response) {
        //console.log(response);
        window.currentFileStatus = 'old';
        window.currFileName = response.bpmnname;
        $('#version1').val(response._version);
        $('#modelId1').val(response.id);
        $('#modal1').closeModal();
		$('#modal4').closeModal();
        if (callback) {
            callback();
            callback = undefined;
        }
		saveComponentDetails(domainGroup, processGroup, response);

    }).fail(function (xhr, status, errorThrown) {
        alert('Sorry, there was a problem!');
        //console.log("Error: " + errorThrown);
        //console.log("Status: " + status);
        //console.dir(xhr);
    });
}

function saveComponentDetails(domainGroup, processGroup, response) {
	var accessToken = sessionStorage.getItem('auth_token');
    var tenantId = sessionStorage.getItem('tenantId');
    var postUrl = '';
    var settings = {
        'async': true,
        'crossDomain': true,
        //"url":postUrl,
        'method': 'POST',
        'headers': {
            'content-type': 'application/json',
            'cache-control': 'no-cache'
        },
        'processData': false
    };
	var data;
	postUrl = '/api/WorkflowComponentMetadatas'; //?access_token=' + accessToken;
        data = {
            bpmnName: response.bpmnname,
            tenant: tenantId,
            bpmnId: response.id,
			description: $('#description').val(),
            domainGroup: domainGroup,
			processGroup: processGroup
        };
        settings.data = JSON.stringify(JSON.parse(JSON.stringify(data)));
        settings.url = postUrl;
		$.ajax(settings).done(function (response) {
			
		})
		.fail(function(err)
		{
			alert('Failed to save as component');
			});
}

function validateAndSaveFile(callback) {
    var tenantId = sessionStorage.getItem('tenantId');
    var accessToken = sessionStorage.getItem('auth_token');

    //filter=[where][and][0][tenant]=default&filter[where][and][1][bpmnname]=
    var bpmnurl = '/api/bpmndata?filter[where][and][1][bpmnname]=' + $('#bpmnname').val(); // + '&filter=[where][and][0][tenant]=' + tenantId + '&&access_token=' + accessToken;
    var settingsHistory = {
        'async': true,
        'crossDomain': true,
        'url': bpmnurl,
        'method': 'GET',
        'headers': {
            'cache-control': 'no-cache'
        },
        'error': function () {
            alert('something went wrong');
        }
    };

    $.ajax(settingsHistory).done(function (response) {
        //console.log(response);
        if (response.length === 0) {
            ajaxSave(callback);
        } else {
            $('#bpmnname').removeClass('valid');
            $('#bpmnname').addClass('invalid');
            $('#bpmnname').prop('aria-invalid', 'true');
            //  event.preventDefault();

        }

    });
    return true;
}

function ajaxSave(callback) {
    $('#bpmnname').addClass('valid');
    $('#bpmnname').removeClass('invalid');
    $('#versionmessage').addClass('valid');
    $('#versionmessage').removeClass('invalid');
    //console.log("Validation success..............................");//versionmessage
    var accessToken = sessionStorage.getItem('auth_token');
    var tenantId = sessionStorage.getItem('tenantId');
    var postUrl = '';
    var settings = {
        'async': true,
        'crossDomain': true,
        //"url":postUrl,
        'method': 'POST',
        'headers': {
            'content-type': 'application/json',
            'cache-control': 'no-cache'
        },
        'processData': false
    };
    var data;
    if ((window.currentFileStatus && window.currentFileStatus === 'new') || (window.currFileName != $('#bpmnname').val())) {
        postUrl = '/api/bpmndata'; //?access_token=' + accessToken;
        data = {
            bpmnname: $('#bpmnname').val(),
            tenant: tenantId,
            xmldata: $('#xmldata').val(),
            versionmessage: $('#versionmessage').val()
        };
        settings.data = JSON.stringify(data);
        settings.url = postUrl;
    } else if (window.currentFileStatus === 'old') {
        postUrl = '/api/bpmndata/' + $('#modelId').val(); // + '?access_token=' + accessToken;
        data = {
            bpmnname: $('#bpmnname').val(),
            tenant: tenantId,
            xmldata: $('#xmldata').val(),
            _version: $('#version').val(),
            versionmessage: $('#versionmessage').val()

        };
        settings.method = 'PUT';
        settings.url = postUrl;
        settings.data = JSON.stringify(data);
    }
    //console.log(data);

    $.ajax(settings).done(function (response) {
        //console.log(response);
        window.currentFileStatus = 'old';
        window.currFileName = response.bpmnname;
        $('#version').val(response._version);
        $('#modelId').val(response.id);
        $('#modal1').closeModal();
        if (callback) {
            callback();
            callback = undefined;
        }

    }).fail(function (xhr, status, errorThrown) {
        alert('Sorry, there was a problem!');
        //console.log("Error: " + errorThrown);
        //console.log("Status: " + status);
        //console.dir(xhr);
    });
}

$('#js-publish-diagram').click(function () {
    if (window.currentFileStatus != 'new') {
        publishWorkflow();
    } else {
        callback = publishWorkflow;
        $('#js-save-diagram')[0].click()

    }


});

var publishWorkflow = function () {
    //console.log('publishing......');
    if (window.currentFileStatus != 'new') {
        var accessToken = sessionStorage.getItem('auth_token');
        var tenantId = sessionStorage.getItem('tenantId');
        //var username = sessionStorage.getItem('username');
        var postUrl = '/api/WorkflowDefinitions'; //?access_token=' + accessToken;
        var settings = {
            'async': true,
            'crossDomain': true,
            'url': postUrl,
            'method': 'POST',
            'headers': {
                'content-type': 'application/json',
                'cache-control': 'no-cache'
            },
            'processData': false
        };
        var data = {
            name: $('#bpmnname').val(),
            tenant: tenantId,
            xmldata: $('#xmldata').val()


        };
        settings.data = JSON.stringify(data);
        $.ajax(settings).done(function (response) {
            //console.log(response);
            window.currentFileStatus = 'old';
            // $('oe-')
            alert('Workflow published successfully!!');


        }).fail(function (xhr, status, errorThrown) {
            var error = xhr.responseJSON.error.message;
            if (!error) {
                error = xhr.responseJSON.error.errmsg;
            }
            if (error === 'Process element name \'null\' must be unique.') {
                alert('Name attribute is mandatory for all elements!');

            } else if (error.includes('ProcessDefinition index: _id_ dup key')) {
                alert('Workflow with same name already running in the Server. Please change the workflow name!');

            } else {
                alert('Sorry, there was a problem!');
            }
            // console.log("Error: " + xhr);

        });
    }
}

// function textAreaAdjust(o) {
//     o.style.height = '1px';
//     o.style.height = (25 + o.scrollHeight) + 'px';
// }