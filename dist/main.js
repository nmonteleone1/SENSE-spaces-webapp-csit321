//////MODULES//////
import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { OBJLoader } from "OBJLoader";

var strDownloadMime = "image/octet-stream";

//////THREE.JS CANVAS//////
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
);
camera.position.set(2, 5, -2);
const renderer = new THREE.WebGLRenderer({
	preserveDrawingBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

// light the 3d space - Nick
scene.background = new THREE.Color("rgb(119, 119, 119)"); // grey background
const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
const light = new THREE.PointLight(0xffffff, 1, 6, 2);
light.position.set(1, 3, 1);
light.castShadow = true;
light.shadow.bias = -0.0001;
light.shadow.mapSize.width = 1024 * 4;
light.shadow.mapSize.height = 1024 * 4;
scene.add(ambientLight);
scene.add(light);

// camera controls - Nick
const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI / 12;
controls.maxPolarAngle = 5 * Math.PI / 12;


//////GLOBALS//////
var mouse, raycaster, moveRaycaster;
const zoomFactor = 0.95; // factor must be <1
const rotateFactor = Math.PI * 0.05; // factor of 1 is a full rotation
const moveFactor = 0.25;
var heldObject, heldObjectBB;
var items = new THREE.Group();
const loader = new THREE.ObjectLoader();
var measurementScale = 1000;

// mouse tracking within canvas - Nick
mouse = new THREE.Vector2();

// raycasters to be used for object locations - Nick
raycaster = new THREE.Raycaster();
moveRaycaster = new THREE.Raycaster();



//////3D SPACE GENERATION//////
// create blank room - Nick
var room = {
	name: 'default',
	Width: 4,
	Depth: 4,
	Height: 2.7,
	sideGeometry: new THREE.BoxGeometry(),
	backWallGeometry: new THREE.BoxGeometry(),
	wallMaterial: new THREE.MeshPhongMaterial({
		color: 0xffffff
	}),
	walls: new THREE.Group(),
	leftWall: new THREE.Mesh(),
	backWall: new THREE.Mesh(),
	rightWall: new THREE.Mesh(),
	frontWall: new THREE.Mesh(),
}
room.leftWall = new THREE.Mesh(room.sideWallGeometry, room.wallMaterial);
room.backWall = new THREE.Mesh(room.backWallGeometry, room.wallMaterial);
room.rightWall = new THREE.Mesh(room.sideWallGeometry, room.wallMaterial);
room.frontWall = new THREE.Mesh(room.backWallGeometry, room.wallMaterial);
room.leftWall.receiveShadow = true;
room.backWall.receiveShadow = true;
room.rightWall.receiveShadow = true;
room.frontWall.receiveShadow = true;
room.walls.add(room.leftWall);
room.walls.add(room.backWall);
room.walls.add(room.rightWall);
room.walls.add(room.frontWall);

// plane for object location tracking - Nick
const grid = new THREE.Group();
const textureLoader = new THREE.TextureLoader();
var floorTexture;
floorTexture = textureLoader.load('textures/Wood_Floor_007_COLOR.jpg', function (tex) {
	tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
});
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(),
	new THREE.MeshStandardMaterial({
		color: 0xffffff,
		map: floorTexture
	})
);
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
grid.add(plane);

// populate scene with generated objects - Nick
scene.add(room.walls);
scene.add(grid);

// start application - Nick
regenerateRoom();
animate();



//////UI INTEGRATION//////
// adding functions to user input elements - Nick
document.getElementById("rotateUp").addEventListener("click", function () { rotateCamera('up') });
document.getElementById("rotateDown").addEventListener("click", function () { rotateCamera('down') });
document.getElementById("rotateLeft").addEventListener("click", function () { rotateCamera('left') });
document.getElementById("rotateRight").addEventListener("click", function () { rotateCamera('right') });
document.getElementById("zoomIn").addEventListener("click", function () { zoomCamera(1) });
document.getElementById("zoomOut").addEventListener("click", function () { zoomCamera(0) });
document.getElementById("moveUp").addEventListener("click", function () { moveCamera('up') });
document.getElementById("moveDown").addEventListener("click", function () { moveCamera('down') });
document.getElementById("moveLeft").addEventListener("click", function () { moveCamera('left') });
document.getElementById("moveRight").addEventListener("click", function () { moveCamera('right') });
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
addEventListener('wheel', onMouseWheel, false);


//////FUNCTIONS//////

// load objects from file - Nick
export function importObject(fileInput, width, height, depth) {
	const reader = new FileReader();

	var url = URL.createObjectURL(fileInput.files[0])
	var fileName = fileInput.files[0].name

	reader.addEventListener('load', async function (event) {
		const contents = event.target.result;
		const object = new OBJLoader().parse(contents);
		object.name = fileName;
		let boxSize = new THREE.Vector3();
		let boundingBox = new THREE.Box3().setFromObject(object);
		boundingBox.getSize(boxSize);
		let xFactor = (width / measurementScale) / boxSize.x;
		let yFactor = (height / measurementScale) / boxSize.y;
		let zFactor = (depth / measurementScale) / boxSize.z;
		object.scale.x = xFactor;
		object.scale.y = yFactor;
		object.scale.z = zFactor;
		object.position.x = room.Width/2;
		object.position.z = room.Depth/2;

		items.add(object);

		scene.add(items)

	}, false);
	reader.readAsText(fileInput.files[0]);

	url = url.replace(/^(\.?\/)/, '');
}

// create 'placeholder' objects, plain cube for visualising the space - Nick
export function createNewObject(dimensions) {
	let width = dimensions.width / measurementScale;
	let depth = dimensions.depth / measurementScale;
	let height = dimensions.height / measurementScale;
	
	var geometry = new THREE.BoxGeometry(width, height, depth);
	var material = new THREE.MeshPhongMaterial( {color: 0xA020F0} );
	var cube = new THREE.Mesh(geometry, material);
	cube.material.opacity = 0.75;
	cube.castShadow = true;
	cube.receiveShadow = true;

	cube.position.set(room.Width/2, height/2, room.Depth/2);
	items.add(cube);
	scene.add(items);
}


export function loadObject(path) {
	loader.load(path, function (obj) {
		obj.position.set(room.Width / 2, 0.5, room.Depth / 2);
		items.add(obj);
		scene.add(items);
	});
}

// move camera functionality for on-screen buttons - Nick
function moveCamera(direction) {
	switch (direction) {
		case 'up':
			camera.translateY(0.5);
			break;
		case 'down':
			camera.translateY(-0.5);
			break;
		case 'left':
			camera.translateX(-0.5);
			break;
		case 'right':
			camera.translateX(0.5);
			break;
	}
}

// rotate camera functionality for on-screen buttons - Nick
function rotateCamera(direction) {
	if (direction == 'up') {
		camera.translateY(1 * rotateFactor);
	}
	else if (direction == 'down') {
		camera.translateY(-1 * rotateFactor);
	}
	else if (direction == 'left') {
		camera.translateX(-1 * rotateFactor);
	}
	else if (direction == 'right') {
		camera.translateX(1 * rotateFactor);
	}
	else {
		console.log('error rotating camera');
	}
	camera.lookAt(scene.position);
	camera.updateProjectionMatrix();
	controls.update();
}

// zoom camera functionality for on-screen buttons
function zoomCamera(zoom) {
	if (zoom == 1) {
		if (camera.zoom >= 2) {
			return;
		}
		// controls.dollyIn(0.25);
		camera.fov *= zoomFactor;
		
	}
	else if (zoom == 0) {
		if (camera.zoom <= zoomFactor) {
			return;
		}
		camera.fov /= zoomFactor;
	}
	else {
		console.log('error zooming camera');
	}
	camera.updateProjectionMatrix();
	controls.update();
}

// room initializer, called on first run, on new room submit, on import room submit - Nick
export function regenerateRoom(name = room.name, width = room.Width, depth = room.Depth, height = room.Height, objects = []) {
	room.name = name;

	// check for undefined values, and set them as current, otherwise update current values - Nick
	if (isNaN(width)) {
		width = room.Width;
	}
	else {
		room.Width = width;
	}
	if (isNaN(depth)) {
		depth = room.Depth;
	}
	else {
		room.Depth = depth;
	}
	if (isNaN(height)) {
		height = room.Height;
	}
	else {
		room.Height = height;
	}

	const xCenter = width / 2;
	const yCenter = depth / 2;
	const wallThickness = 0.1;

	// create and position the 4 walls using basic geometries
	let newSideWallGeometry = new THREE.BoxGeometry(depth + wallThickness, height, wallThickness);
	let newBackWallGeometry = new THREE.BoxGeometry(width + wallThickness, height, wallThickness);
	room.leftWall.geometry = newSideWallGeometry;
	room.rightWall.geometry = newSideWallGeometry;
	room.backWall.geometry = newBackWallGeometry;
	room.frontWall.geometry = newBackWallGeometry;

	room.leftWall.position.set(0, height / 2, yCenter);
	room.leftWall.rotation.set(0, Math.PI / 2, 0);

	room.backWall.position.set(xCenter, height / 2, 0);

	room.rightWall.position.set(width, height / 2, yCenter);
	room.rightWall.rotation.set(0, Math.PI / 2, 0);

	room.frontWall.position.set(xCenter, height / 2, depth);

	// update the floor plane - Nick
	plane.geometry = new THREE.PlaneGeometry(width, room.Depth, 10, 10);
	plane.position.set(xCenter, 0, yCenter);
	plane.material.map.repeat.set(width / 2, depth / 2);

	// update the lighting - Nick
	light.position.set(xCenter, height, yCenter);
	light.distance = Math.max(width, depth) * 1.5;

	// remove all items currently loaded in - Nick
	while(items.children.length > 0) {
		items.remove(items.children[0]);
	}

	// if an object array was provided, load in each one (only imports the parent-groups if applicable) - Nick
	for(let i = 1; i < objects.length; i++) {
		const object = loader.parse(objects[i]);
		if (object.type == 'Group') {
			items.add(object);
			i += object.children.length;
			continue;
		}
		items.add(object);
	}
	
	scene.add(items);

	// update camera position - Nick
	camera.position.set(xCenter, 5, -yCenter);
	camera.lookAt(xCenter, 0, yCenter);
	controls.target.set(xCenter, 0, yCenter);
	controls.update();
}

//// MOUSE CONTROLS ////

// set flag for if an object should track with mouse - Nick
var draggable = false;

// track mouse position - Nick
function onMouseMove(event) {
	mouse.x = (event.offsetX / renderer.domElement.width) * 2 - 1;
	mouse.y = -(event.offsetY / renderer.domElement.height) * 2 + 1;

	// if object is draggable follow mouse
	if (draggable) {
		dragObject();
	}
}

// turn off camera controls if an object is under mouse for manipulation - Nick
function onMouseDown() {
	selectObject();
	if (heldObject) {
		controls.enabled = false;
		draggable = true;
	}
}

// turn on camera controls after dragging is complete - Nick
function onMouseUp() {
	controls.enabled = true;
	draggable = false;
}

// if object is under mouse pointer highlight it - Nick
function selectObject() {
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(items.children);
	if (intersects.length) {
		// if the object is already selected, break - Nick
		// var parent = getObjectGroup(intersects[0].object);
		let parent = getObjectGroup(intersects[0].object);
		if (heldObject == parent) {return;}
		else {
			deselectObject();
			heldObject = parent;
			heldObjectBB = new THREE.BoxHelper(heldObject, 0xff0000);
			scene.add(heldObjectBB);
			objectProperties();
		}	
	}
	else {
		deselectObject();
	}
}

// get grouped object - Nick
function getObjectGroup(object) {
	var parent = object.parent;
	if(parent == scene || parent == items) {
		return object;
	}
	while (parent != items) {
		object = parent;
		parent = object.parent;
	}
	
	return object;
}

// show object properties - Nick
document.getElementById("objectProperties").innerHTML = "";
function objectProperties() {
	document.getElementById("objectProperties").innerHTML = `
		<hr/>
		<div style="padding-left:20px; color: white;">
			<h2>Object Properties</h2>
		</div>
		<div class="smallContentContainer">
			<table>
				<tr>
					<td><label>Object Width:</label></td>
				</tr>
				<tr>
					<td><input style="width:200px" type="range" id="propWidth" min="0.1" max="5" step="0.1" oninput="this.nextElementSibling.value = this.value" />&nbsp;<output>${heldObject.scale.x}</output></td>
				</tr>
				<tr>
					<td><label>Object Depth:</label></td>
				</tr>
				<tr>
					<td><input style="width:200px" type="range" id="propDepth" min="0.1" max="5" step="0.1" oninput="this.nextElementSibling.value = this.value" />&nbsp;<output>${heldObject.scale.z}</output></td>
				</tr>
				<tr>
					<td><label>Object Height:</label></td>
				</tr>
				<tr>
					<td><input style="width:200px" type="range" id="propHeight" min="0.1" max="5" step="0.1" oninput="this.nextElementSibling.value = this.value" />&nbsp;<output>${heldObject.scale.y}</output></td>
				</tr>
			</table>
		</div>
		<div class="smallContentContainer">
			<button id="moveObjectUp" class="smallPanelButton">Move Up</button>
			<button id="moveObjectDown" class="smallPanelButton">Move Down</button>
		</div>
		<div class="smallContentContainer">
			<button id="moveObjectLeft" class="smallPanelButton">Move Left</button>
			<button id="moveObjectRight" class="smallPanelButton">Move Right</button>
		</div>
		<div class="smallContentContainer">
			<button id="moveObjectForward" class="smallPanelButton">Move Forward</button>
			<button id="moveObjectBackward" class="smallPanelButton">Move Backward</button>
		</div>
		<div class="smallContentContainer">
			<button id="rotateObjectUp" class="smallPanelButton">Rotate Up</button>
			<button id="rotateObjectDown" class="smallPanelButton">Rotate Down</button>
		</div>
		<div class="smallContentContainer">
			<button id="rotateObjectLeft" class="smallPanelButton">Rotate Left</button>
			<button id="rotateObjectRight" class="smallPanelButton">Rotate Right</button>
		</div>
		<div class="smallContentContainer">
			<button id="removeObject" class="panelButton">Remove Object</button>
		</div>
	`;

	setEventListeners();
}

// set the event listeners for the object properties - Nick
function setEventListeners() {
	const propWidth = document.getElementById("propWidth");
	propWidth.addEventListener('change', updateProperties, false)
	const propHeight = document.getElementById("propHeight");
	propHeight.addEventListener('change', updateProperties, false)
	const propDepth = document.getElementById("propDepth");
	propDepth.addEventListener('change', updateProperties, false)

	document.getElementById("moveObjectUp").addEventListener("click", function () { moveObject('up') });
	document.getElementById("moveObjectDown").addEventListener("click", function () { moveObject('down') });
	document.getElementById("moveObjectLeft").addEventListener("click", function () { moveObject('left') });
	document.getElementById("moveObjectRight").addEventListener("click", function () { moveObject('right') });
	document.getElementById("moveObjectForward").addEventListener("click", function () { moveObject('forward') });
	document.getElementById("moveObjectBackward").addEventListener("click", function () { moveObject('backward') });

	document.getElementById("rotateObjectUp").addEventListener("click", function () { rotateUp(heldObject, rotateFactor) });
	document.getElementById("rotateObjectDown").addEventListener("click", function () { rotateUp(heldObject, -rotateFactor) });
	document.getElementById("rotateObjectLeft").addEventListener("click", function () { rotateObject(heldObject, rotateFactor) });
	document.getElementById("rotateObjectRight").addEventListener("click", function () { rotateObject(heldObject, -rotateFactor) });

	document.getElementById("removeObject").addEventListener("click", function () { removeObject() });

	let measure = new THREE.Vector3();
	heldObject.getWorldScale(measure)
	propWidth.min = measure.x / 2;
	propWidth.max = measure.x * 2;
	propWidth.value = measure.x;
	propWidth.step = 0.01*propWidth.max;
	propHeight.min = measure.y / 2;
	propHeight.max = measure.y * 2;
	propHeight.value = measure.y;
	propHeight.step = 0.01*propHeight.max;
	propDepth.min = measure.z / 2;
	propDepth.max = measure.z * 2;
	propDepth.value = measure.z;
	propDepth.step = 0.01*propDepth.max;
}

// change object properties - Nick
function updateProperties() {
	let width = propWidth.value;
	let height = propHeight.value;
	let depth = propDepth.value;
	heldObject.scale.x = width;
	heldObject.scale.y = height;
	heldObject.scale.z = depth;
}

// move selected object (onscreen button) - Nick
function moveObject(direction) {
	scene.attach(heldObject);
	switch (direction) {
		case 'up':
			heldObject.position.y += moveFactor;
			break;
		case 'down':
			heldObject.position.y -= moveFactor;
			break;
		case 'left':
			heldObject.position.x += moveFactor;
			break;
		case 'right':
			heldObject.position.x -= moveFactor;
			break;
		case 'forward':
			heldObject.position.z += moveFactor;
			break;
		case 'backward':
			heldObject.position.z -= moveFactor;
			break;
	}
	items.attach(heldObject);
}

// check object is in bounds - Nick
function checkLocation() {
	scene.attach(heldObject);
	let pos = heldObject.position;
	let bb = new THREE.Box3();
	bb.setFromObject(heldObject, true);
	let width = bb.max.x - bb.min.x;
	let height = bb.max.y - bb.min.y;
	let depth = bb.max.z - bb.min.z;
	if(bb.min.x < 0+0.05) {
		heldObject.position.x = width/2 + 0.05;
	}
	if(bb.min.y < 0) {
		heldObject.position.y += 0-bb.min.y;
	}
	if(bb.min.z < 0+0.05) {
		heldObject.position.z = depth/2 + 0.05;
	}
	if(bb.max.x > room.Width-0.05) {
		heldObject.position.x = room.Width - width/2 - 0.05;
	}
	// if(bb.max.y > room.Height) {
	// 	heldObject.position.y = height/2;
	// }
	if(bb.max.z > room.Depth-0.05) {
		heldObject.position.z = room.Depth - depth/2 - 0.05;
	}
	items.attach(heldObject);
}

// rotate selected object - Nick
function rotateObject(object, factor) {
	// object.rotation.y += factor;	
	object.rotateY(factor);
}
function rotateUp(object, factor) {
	object.rotateX(factor);
}

// unhighlight selected object - Nick
function deselectObject() {
	scene.remove(heldObjectBB);
	heldObject = undefined;
	heldObjectBB = undefined;
	document.getElementById("objectProperties").innerHTML = "";
}

// remove object and object highlight from scene - Nick
function removeObject() {
	if (!heldObject) return; // return early if we're not holding an object
	heldObject.parent.remove(heldObject);
	heldObjectBB.parent.remove(heldObjectBB);
	heldObject = undefined;
	heldObjectBB = undefined;
	document.getElementById("objectProperties").innerHTML = "";
}

// adds object rotation when the object is selected, hovered, and the wheel is scrolled. - Nick
function onMouseWheel(event) {
	controls.enableZoom = false;
	if (heldObject) {
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObject(heldObject);
		if(intersects.length) {
			rotateObject(heldObject, rotateFactor * Math.sign(event.deltaY));
		}
		else {
			controls.enableZoom = true;
		}
	}
	else {
		controls.enableZoom = true;
	}
	
}

// move objects with mouse pointer (only across floor plane) - Nick
window.addEventListener('drag', dragObject, false);
function dragObject() {
	if (heldObject) {
		// converts the mouse position on the screen to its visual position on the floor plane - Nick
		moveRaycaster.setFromCamera(mouse, camera);
		const moveGrid = moveRaycaster.intersectObjects(grid.children);

		if (moveGrid.length) {
			for (let obj of moveGrid) {
				// removes the object from the item group, updates its global position, and then adds it back to the item group - Nick
				scene.attach(heldObject);
				heldObject.position.x = obj.point.x;
				heldObject.position.z = obj.point.z;
				items.attach(heldObject);
				break;
			}
		}
	}
}

// hide walls that block view to the room - Nick
function wallHiderToggle() {
	// get direction to each corner of the room, subtract some arbitrary distance to prevent collisions - Nick
	let buffer = 0.1;
	let dirs = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
	dirs[0].subVectors(new THREE.Vector3(buffer, 0, buffer), camera.position).normalize();
	dirs[1].subVectors(new THREE.Vector3(buffer, 0, room.Depth - buffer), camera.position).normalize();
	dirs[2].subVectors(new THREE.Vector3(room.Width - buffer, 0, buffer), camera.position).normalize();
	dirs[3].subVectors(new THREE.Vector3(room.Width - buffer, 0, room.Depth - buffer), camera.position).normalize();

	// create array for storing which walls are blocking view - Nick
	var intersectingWalls = [];

	// add blocking walls to array by checking vision to each corner - Nick
	for (let i = 0; i < dirs.length; i++) {
		raycaster.set(camera.position, dirs[i]);
		const intersects = raycaster.intersectObjects(room.walls.children);
		if (!intersects.length) {
			continue;
		}
		intersectingWalls.push(intersects[0])
	}

	// for each wall check if it is in the intersections array and then hide if so - Nick
	room.walls.traverse(function (obj) {

		if (obj.type != 'Mesh') { return; }
		const newMaterial = obj.material.clone();
		newMaterial.transparent = false;
		newMaterial.opacity = 1;
		for (let i = 0; i < intersectingWalls.length; i++) {
			if (obj.position == intersectingWalls[i].object.position) {
				newMaterial.transparent = true;
				newMaterial.opacity = 0;
				break;
			}
		}
		obj.material = newMaterial;
	})
}

// convert room data into an array for export - Nick
export function getRoom() {
	var roomObjects = [];
	items.traverse(function (obj) {
		roomObjects.push(obj);
	})
	let roomData = {
        "roomName": room.name,
        "width": room.Width,
        "depth": room.Depth,
        "height": room.Height,
        "objects": roomObjects
      }
	
	return roomData;
}

// animates the viewport, runs every frame. - Nick
function animate() {
	requestAnimationFrame(animate);

	wallHiderToggle();
	if (heldObjectBB) {
		heldObjectBB.update();
	}
	if(heldObject) {
		checkLocation(heldObject);
	}
	render();
}

function render() {
	renderer.render(scene, camera);
}

// <!-- Meghan -->
// handle export to .jpeg
export function saveAsImage() {
	var imgData, imgNode;

	try {
		var strMime = "image/jpeg";
		imgData = renderer.domElement.toDataURL(strMime);

		saveFile(imgData.replace(strMime, strDownloadMime), "test.jpg");

	} catch (e) {
		console.log(e);
		return;
	}
}

// <!-- Meghan -->
var saveFile = function (strData, filename) {
	var link = document.createElement('a');
	if (typeof link.download === 'string') {
		document.body.appendChild(link);
		link.download = filename;
		link.href = strData;
		link.click();
		document.body.removeChild(link);
	} else {
		location.replace(uri);
	}
}

// setup keypress handling for camera controls - Jackson
addEventListener('keydown', (event) => { });

onkeydown = (event) => {
	if (event.target.tagName == "INPUT") { return; } // return early if we're currently typing into an input field
	var keyPressed = event.key
	// if an object is selected, adjust object position instead of camera position
	if (heldObject) {
		switch (keyPressed) {
			case "w":
				moveObject('forward')
				break;
			case "s":
				moveObject('backward')
				break;
			case "a":
				moveObject('left')
				break;
			case "d":
				moveObject('right')
				break;
			case "q":
				moveObject('down')
				break;
			case "e":
				moveObject('up')
				break;
			case "Backspace":
				removeObject()
				break;
			default:
				break;
		}
		return; // return so we don't touch the camera position
	}

	// adjust camera position
	switch (keyPressed) {
		case "w":
			moveCamera('up')
			break;
		case "s":
			moveCamera('down')
			break;
		case "a":
			moveCamera('left')
			break;
		case "d":
			moveCamera('right')
			break;
		case "q":
			zoomCamera(1)
			break;
		case "e":
			zoomCamera(0)
			break;
		case "ArrowUp":
			rotateCamera('up')
			break;
		case "ArrowDown":
			rotateCamera('down')
			break;
		case "ArrowLeft":
			rotateCamera('left')
			break;
		case "ArrowRight":
			rotateCamera('right')
			break;
		default:
			break;
	}
};