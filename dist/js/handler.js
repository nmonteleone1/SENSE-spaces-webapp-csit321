import { saveAsImage } from '../main.js'
import { regenerateRoom, getRoom } from "../main.js";



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
        regenerateRoom(newRoom.width, newRoom.depth, newRoom.height);

    } catch (e) {
        if(event.target.name.value == "") {
            document.getElementById('nameInvalid').innerHTML = "name is a required field";
        }
    
        if(isNaN(event.target.width.value) || event.target.width.value == "") {
            document.getElementById('widthInvalid').innerHTML = "width is a required field";
        }
    
        if(isNaN(event.target.depth.value) || event.target.depth.value == "") {
            document.getElementById('depthInvalid').innerHTML = "depth is a required field";
        }
    
        if(isNaN(event.target.height.value) || event.target.height.value == "") {
            document.getElementById('heightInvalid').innerHTML = "height is a required field";
        }

        return
    }
}



// handle imported room file
export function handleImportRoomSubmit(event) {
    event.preventDefault();

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

        // Values from the JSON can be accessed as follows
        console.log("Room Name: ", importedRoom.roomName);
        console.log("Dimensions: ", importedRoom.width, " x ", importedRoom.depth, " x ", importedRoom.height);
        importedRoom.objects.map((x, index) => console.log(`Object ${index + 1}: `, x.name, "--", x.path, "--", x.model, "--", x.location[0], ",", x.location[1], ",", x.location[2]));


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

    let data = fakeRoomData(); 
    if(event.target.type.value == "json") {
        exportToJsonFile(data);
    } else if(event.target.type.value == "txt") {
        exportToTxtFile(data);
    } else {
        // handle export to .jpeg -- function exported from ../main.js
        saveAsImage()
    }

    // close menus
    document.getElementById("export").style.width = "0";
    document.getElementById("leftMenu").style.width = "0";
}

// handle export to JSON file
function exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = `${jsonData.roomName}.json`;

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// handle export to txt file
function exportToTxtFile(jsonData) {
    let data = 'Room Name: ' + jsonData.roomName + ' \r\n' + 'Objects: ' + ' \r\n ';
    let objects =  jsonData.objects.map(x => `\t-- ${x.name}: ${x.location[0]}, ${x.location[1]}, ${x.location[2]} \r\n`);
    let dataStr = data + objects.join("");

    let dataUri = 'data:text/plain;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = `${jsonData.roomName}.txt`;

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function fakeRoomData() {
    let room = getRoom()
    let tester = {
        "roomName": "myExportedRoom",
        "width": room.Width,
        "depth": room.Depth,
        "height": room.Height,
        "objects": [
          {
            "name": "object1",
            "path": "../path/jsons/object1.json",
            "model": "../path/models/object1.stl",
            "location": [
              1,
              0.5,
              1
            ]
          },
          {
            "name": "object2",
            "path": "../path/jsons/object2.json",
            "model": "../path/models/object2.stl",
            "location": [
              2,
              0.5,
              2
            ]
          }
        ]
      }

    return tester;
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
        console.log(newObject)
    
        // close menus
        document.getElementById("newObject").style.width = "0";
    } catch (e) {    
        if(isNaN(event.target.objectWidth.value) || event.target.objectWidth.value == "") {
            document.getElementById('objWidthInvalid').innerHTML = "width is a required field";
        }
    
        if(isNaN(event.target.objectDepth.value) || event.target.objectDepth.value == "") {
            document.getElementById('objDepthInvalid').innerHTML = "depth is a required field";
        }
    
        if(isNaN(event.target.objectHeight.value) || event.target.objectHeight.value == "") {
            document.getElementById('objHeightInvalid').innerHTML = "height is a required field";
        }

        return
    }
}



// handle imported object file
export function handleImportObjectSubmit(event) {
    event.preventDefault();

    console.log(event)

    // handle no file being uploaded
    if (!objectFile.value.length) { 
        document.getElementById('objectErrorMessage').innerHTML = "you must select a file to upload"; 
        return
    };

    let reader = new FileReader();
    reader.onload = handleObjectFile;
    reader.readAsText(objectFile.files[0]);
}

// parse data from object file and navigate back to right menu
function handleObjectFile(event) {
    try {
        let importedObject = JSON.parse(event.target.result);
        document.getElementById('objectErrorMessage').innerHTML = ""; 

        // Values from the JSON can be accessed as follows
        console.log(importedObject);

        // close menus
        document.getElementById("importObject").style.width = "0";
    } catch (e) {
        document.getElementById('objectErrorMessage').innerHTML = "the format of the uploaded file is invalid"; 
        return
    }
}