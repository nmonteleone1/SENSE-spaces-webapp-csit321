// <!-- Meghan {file} -->
import { saveAsImage } from '../main.js'
import { regenerateRoom, getRoom, createNewObject, importObject } from "../main.js";



// handle new room form, parse data and navigate back to home page
export function handleNewRoomSubmit(event) {
    event.preventDefault();

    try {
        // reset validation messages
        document.getElementById('nameInvalid').innerHTML = "";
        document.getElementById('widthInvalid').innerHTML = "";
        document.getElementById('depthInvalid').innerHTML = "";
        document.getElementById('heightInvalid').innerHTML = "";

        // convert form values to json
        let newRoom = JSON.parse(`{"roomName":"${event.target.name.value}", "width":${event.target.width.value}, "depth":${event.target.depth.value}, "height":${event.target.height.value}}`)

        // close menus
        document.getElementById("newRoom").style.width = "0";
        document.getElementById("leftMenu").style.width = "0";

        // regenerate room
        regenerateRoom(newRoom.roomName, newRoom.width, newRoom.depth, newRoom.height);

    } catch (e) {
        if (event.target.name.value == "") {
            document.getElementById('nameInvalid').innerHTML = "name is a required field";
        }

        if (isNaN(event.target.width.value) || event.target.width.value == "") {
            document.getElementById('widthInvalid').innerHTML = "width is a required field";
        }

        if (isNaN(event.target.depth.value) || event.target.depth.value == "") {
            document.getElementById('depthInvalid').innerHTML = "depth is a required field";
        }

        if (isNaN(event.target.height.value) || event.target.height.value == "") {
            document.getElementById('heightInvalid').innerHTML = "height is a required field";
        }

        return
    }
}



// handle imported room file
export function handleImportRoomSubmit(event) {
    event.preventDefault();

    let file = document.getElementById('file');

    // handle no file being uploaded
    if (!file.value.length) {
        document.getElementById('errorMessage').innerHTML = "you must select a file to upload";
        return
    };

    let reader = new FileReader();
    reader.onload = handleRoomFile;
    reader.readAsText(file.files[0]);
}

// parse data from room file and navigate back to home page
function handleRoomFile(event) {
    try {
        let importedRoom = JSON.parse(event.target.result);
        document.getElementById('errorMessage').innerHTML = "";

        // regenerate room
        regenerateRoom(importedRoom.roomName, importedRoom.width, importedRoom.depth, importedRoom.height, importedRoom.objects);

        // close menus
        document.getElementById("importRoom").style.width = "0";
        document.getElementById("leftMenu").style.width = "0";
    } catch (e) {
        document.getElementById('errorMessage').innerHTML = "the format of the uploaded file is invalid";
        return
    }
}



// handle export form
export function handleExportSubmit(event) {
    event.preventDefault();
    
    // reset validation message
    document.getElementById('exportError').innerHTML = "";

    let data = getRoom();
    if (event.target.type.value == "json") {
        exportToJsonFile(data);
    } else if(event.target.type.value == "jpeg") {
        // handle export to .jpeg -- function exported from ../main.js
        saveAsImage()
    } else {
        document.getElementById("exportError").innerHTML = "you must select a type to export";
        return;
    }

    // close menus
    document.getElementById("export").style.width = "0";
    document.getElementById("leftMenu").style.width = "0";
}

// handle export to JSON file
function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    let exportFileDefaultName = `${jsonData.roomName}.json`;

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// THIS NO LONGER WORKS WITH THE WAY WE HAVE IMPLEMENTED IMPORT OBJECT
// handle export to txt file
function exportToTxtFile(jsonData) {
    let data = 'Room Name: ' + jsonData.roomName + ' \r\n' + 'Objects: ' + ' \r\n ';
    let objects = jsonData.objects.map(x => `\t-- ${x.name}: ${x.location[0]}, ${x.location[1]}, ${x.location[2]} \r\n`);
    let dataStr = data + objects.join("");

    let dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(dataStr);

    let exportFileDefaultName = `${jsonData.roomName}.txt`;

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}



// handle new object form, parse data and navigate back to right menu
export function handleNewObjectSubmit(event) {
    event.preventDefault();

    try {
        // reset validation messages
        document.getElementById('objWidthInvalid').innerHTML = "";
        document.getElementById('objDepthInvalid').innerHTML = "";
        document.getElementById('objHeightInvalid').innerHTML = "";

        // convert form values to json
        let newObject = JSON.parse(`{"width":${event.target.objectWidth.value}, "depth":${event.target.objectDepth.value}, "height":${event.target.objectHeight.value}}`);

        // create object
        createNewObject(newObject);

        // close menus
        document.getElementById("newObject").style.width = "0";
    } catch (e) {
        if (isNaN(event.target.objectWidth.value) || event.target.objectWidth.value == "") {
            document.getElementById('objWidthInvalid').innerHTML = "width is a required field";
        }

        if (isNaN(event.target.objectDepth.value) || event.target.objectDepth.value == "") {
            document.getElementById('objDepthInvalid').innerHTML = "depth is a required field";
        }

        if (isNaN(event.target.objectHeight.value) || event.target.objectHeight.value == "") {
            document.getElementById('objHeightInvalid').innerHTML = "height is a required field";
        }

        return
    }
}



// handle imported object file
export function handleImportObjectSubmit(event) {
    event.preventDefault();

    // get form values
    let fileInput = document.getElementById('loadObject');
    let width = document.getElementById("objectImportWidth").value;
    let depth = document.getElementById("objectImportDepth").value;
    let height = document.getElementById("objectImportHeight").value;

    // reset validation messages
    document.getElementById('objImportWidthInvalid').innerHTML = "";
    document.getElementById('objImportDepthInvalid').innerHTML = "";
    document.getElementById('objImportHeightInvalid').innerHTML = "";
    document.getElementById('objectErrorMessage').innerHTML = "";

    let errors = false;

    // handle no file being uploaded
    if (!fileInput.value.length) {
        document.getElementById('objectErrorMessage').innerHTML = "you must select a file to upload";
        errors = true;
    };

    // ensure width field is not empty
    if (isNaN(width) || width == "") {
        document.getElementById('objImportWidthInvalid').innerHTML = "width is a required field";
        errors = true;
    }

    // ensure depth field is not empty
    if (isNaN(depth) || depth == "") {
        document.getElementById('objImportDepthInvalid').innerHTML = "depth is a required field";
        errors = true;
    }

    // ensure height field is not empty
    if (isNaN(height) || height == "") {
        document.getElementById('objImportHeightInvalid').innerHTML = "height is a required field";
        errors = true;
    }

    // if any of the validation has failed, return
    if(errors) {
        return;
    }

    let reader = new FileReader();
    reader.onload = handleObjectFile(fileInput, width, height, depth);
    reader.readAsText(fileInput.files[0]);
}

// parse data from object file and navigate back to right menu
function handleObjectFile(fileInput, width, height, depth) {
    try {
        // import object
        importObject(fileInput, width, height, depth)

        // close menus
        document.getElementById("importObject").style.width = "0";
    } catch (e) {
        document.getElementById('objectErrorMessage').innerHTML = "the format of the uploaded file is invalid";
        return
    }
}