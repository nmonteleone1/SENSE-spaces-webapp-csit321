import { regenerateRoom } from "../main.js";

// handle imported file
export function handleImportSubmit(event) {
    event.preventDefault();

    if (!file.value.length) { 
        document.getElementById('errorMessage').innerHTML = "you must select a file to upload"; 
        return
    };

    let reader = new FileReader();
    reader.onload = logFile;
    reader.readAsText(file.files[0]);
}

// parse data from file and navigate back to home page
function logFile(event) {
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

        // reset form
        let form = document.getElementById('importroom');
        form.reset();
    } catch (e) {
        document.getElementById('errorMessage').innerHTML = "the format of the uploaded file is invalid"; 
        return
    }
}




// handle new room form, parse data and navigate back to home page
export function handleNewSubmit(event) {
    event.preventDefault();

    try {
        document.getElementById('nameInvalid').innerHTML = "";
        document.getElementById('widthInvalid').innerHTML = "";
        document.getElementById('depthInvalid').innerHTML = "";
        document.getElementById('heightInvalid').innerHTML = "";

        let newRoom = JSON.parse(`{"roomName":"${event.target.name.value}", "width":${event.target.width.value}, "depth":${event.target.depth.value}, "height":${event.target.height.value}}`)
        console.log("Room Name: ", newRoom.roomName);
        console.log("Dimensions: ", newRoom.width, " x ", newRoom.depth, " x ", newRoom.height);
    
        // close menus
        document.getElementById("newRoom").style.width = "0";
        document.getElementById("leftMenu").style.width = "0";

        // regenerate room
        regenerateRoom(newRoom.width, newRoom.depth, newRoom.height);

        // reset form
        let form = document.getElementById('newroom');
        form.reset();
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




// handle export form
export function handleExportSubmit(event) {
    event.preventDefault();

    let data = fakeRoomData(); 
    if(event.target.type.value == "json") {
        exportToJsonFile(data)
    } else {

    }

    // close menus
    document.getElementById("export").style.width = "0";
    document.getElementById("leftMenu").style.width = "0";

    // reset form
    let form = document.getElementById('exportitem');
    form.reset();
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

function fakeRoomData() {
    let tester = {
        "roomName": "myExportedRoom",
        "width": 4,
        "depth": 4,
        "height": 2.7,
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