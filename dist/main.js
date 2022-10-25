//////MODULES//////
import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { OBJLoader } from "OBJLoader";
import { GLTFLoader } from "GLTFLoader";
import { Box3, Group, RedIntegerFormat, Spherical, Vector3 } from "three";

var strDownloadMime = "image/octet-stream";

//////THREE.JS CANVAS//////
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
);
camera.position.set(5, 5, 5);
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
scene.background = new THREE.Color(0x000000);
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
controls.listenToKeyEvents(window);
controls.keyPanSpeed = 28;
// controls.keys = {
// 	LEFT: 'KeyA',
// 	UP: 'KeyW',
// 	RIGHT: 'KeyD',
// 	BOTTOM: 'KeyS'
// };

//////GLOBALS//////
var mouse, raycaster, moveRaycaster;
const zoomFactor = 0.95; // factor must be <1
const rotateFactor = Math.PI * 0.1; // factor of 1 is a full rotation
const moveFactor = 0.25;
var heldObject, heldObjectBB;
const items = new THREE.Group();
const loader = new THREE.ObjectLoader();
const objloader = new OBJLoader();

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
// document.getElementById("loadObject").addEventListener("change", function () { loadObj(event) });

const gltfLoader = new GLTFLoader();
function loadGLTF() {
	var file = document.getElementById("loadObject");

}

//load objects from file
// // export function importObject() {
// 	const fileInput = document.getElementById("loadObject");
// 	fileInput.addEventListener('change', function () {
// 		console.log('object changed');
// 		const reader = new FileReader();

// 		var url = URL.createObjectURL(fileInput.files[0])
// 		var fileName = fileInput.files[0].name

// 		reader.addEventListener('load', async function (event) {
// 			const contents = event.target.result;
// 			const object = new OBJLoader().parse(contents);
// 			object.name = fileName;
// 			let width = document.getElementById("objectImportWidth").value;
// 			let depth = document.getElementById("objectImportDepth").value;
// 			let height = document.getElementById("objectImportHeight").value;
// 			let boxSize = new THREE.Vector3();
// 			let boundingBox = new THREE.Box3().setFromObject(object);
// 			boundingBox.getSize(boxSize);
// 			let xFactor = width / boxSize.x;
// 			let yFactor = height / boxSize.y;
// 			let zFactor = depth / boxSize.z;
// 			object.scale.x = xFactor;
// 			object.scale.y = yFactor;
// 			object.scale.z = zFactor;
// 			object.position.x = room.Width/2;
// 			object.position.z = room.Depth/2;

// 			items.add(object);

// 			scene.add(items)

// 		}, false);
// 		reader.readAsText(fileInput.files[0]);

// 		url = url.replace(/^(\.?\/)/, '');
// 		console.log(url);

// 		// const[file] = evt.target.files
// 		// if(file) {
// 		// 	objloader.load(URL.createObjectURL(file), function(obkect) {
// 		// 		scene.add(object);
// 		// 	},
// 		// 	function (xhr) {
// 		// 		console.log((xhr.loaded/xhr.total*100) + '% loaded');
// 		// 	},
// 		// 	function(error) {
// 		// 		console.log('Error loading the object');
// 		// 	})
// 		// }
// 	})
// // }

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
		let xFactor = width / boxSize.x;
		let yFactor = height / boxSize.y;
		let zFactor = depth / boxSize.z;
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


//////FUNCTIONS//////


export function createNewObject(dimensions) {
	var geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
	var wireframe = new THREE.WireframeGeometry(geometry);
	var line = new THREE.LineSegments(wireframe);
	line.material.depthTest = true;
	line.material.opacity = 0.75;
	line.material.transparent = true;
	line.material.color.setHex(0x00ff00);
	line.position.set(0,dimensions.height/2,0);

	items.add(line);
	scene.add(items);
}

function loadJSON(sense) {
	var data;
	let path = 'models/json/' + sense + '.json';
	fetch(path).then((response) => response.json()).then((json) => data = json);
	// fetch(path).then(response => {return response.json();}).then(jsondata => console.log(jsondata));
	fetch(path).then(response => { return response.json() })

	return data;
}

export function loadObject(path) {
	loader.load(path, function (obj) {
		obj.position.set(room.Width / 2, 0.5, room.Depth / 2);
		items.add(obj);
		scene.add(items);
	});
}

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

// var cameraMatrix = new THREE.Matrix4();
function rotateCamera(direction) {
	// cameraMatrix = camera.projectionMatrix;
	if (direction == 'up') {
		// cameraMatrix.makeRotationZ(rotateFactor)
		// cameraMatrix.makeRotationX(-rotateFactor)
		camera.translateY(1);
	}
	else if (direction == 'down') {
		// cameraMatrix.makeRotationZ(-rotateFactor)
		// cameraMatrix.makeRotationX(rotateFactor)
		camera.translateY(-1);
	}
	else if (direction == 'left') {
		// cameraMatrix.makeRotationY(-rotateFactor)
		camera.translateX(-1 * rotateFactor);
	}
	else if (direction == 'right') {
		// cameraMatrix.makeRotationY(+rotateFactor)
		camera.translateX(1 * rotateFactor);
	}
	else {
		console.log('error rotating camera');
	}
	// camera.projectionMatrix = cameraMatrix;
	camera.lookAt(scene.position);
	camera.updateProjectionMatrix();
	controls.update();
}

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

// function rotateCamera(direction) {
// 	if(direction == 'cw') {
// 		camera.position.applyQuaternion( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(0,1,0), rotateFactor*Math.PI*2));
// 	}
// 	else if(direction == 'ccw') {
// 		camera.position.applyQuaternion( new THREE.Quaternion().setFromAxisAngle( new THREE.Vector3(0,1,0), rotateFactor*-Math.PI*2));
// 	}
// 	else if(direction == 'up') {

// 	}
// 	else if(direction == 'down') {

// 	}
// 	else {
// 		console.log('error rotating camera');
// 	}
// 	camera.lookAt(scene.position);
// 	camera.updateProjectionMatrix();
// 	controls.update();
// }

// room initializer, called on first run, on new room submit, on import room submit - Nick
export function regenerateRoom(name = room.name, width = room.Width, depth = room.Depth, height = room.Height, objects = []) {
	room.name = name;

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

	plane.geometry = new THREE.PlaneGeometry(width, room.Depth, 10, 10);
	plane.position.set(xCenter, 0, yCenter);
	plane.material.map.repeat.set(width / 2, depth / 2);

	light.position.set(xCenter, height, yCenter);
	light.distance = Math.max(width, depth) * 1.5;

	for(let i = 1; i < objects.length; i++) {
		const object = loader.parse(objects[i]);
		items.add(object);
	}
	
	scene.add(items);
	// console.log(scene);

	camera.lookAt(xCenter, 0, yCenter);
	controls.target.set(xCenter, 0, yCenter);
	controls.update();
}

//// MOUSE CONTROLS ////

// set flag for if an object should track with mouse - Nick
var draggable = false;

// track mouse position - Nick
renderer.domElement.addEventListener('mousemove', onMouseMove, false);
function onMouseMove(event) {
	mouse.x = (event.offsetX / renderer.domElement.width) * 2 - 1;
	mouse.y = -(event.offsetY / renderer.domElement.height) * 2 + 1;

	// if object is draggable follow mouse
	if (draggable) {
		dragObject();
	}
}

// turn off camera controls if an object is under mouse for manipulation - Nick
renderer.domElement.addEventListener('mousedown', onMouseDown, false);
function onMouseDown() {
	selectObject();
	if (heldObject) {
		controls.enabled = false;
		draggable = true;
	}
}

// turn on camera controls after dragging is complete - Nick
renderer.domElement.addEventListener('mouseup', onMouseUp, false);
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
		if (heldObject == intersects[0].object) {return;}
		else {
			deselectObject();
			heldObject = intersects[0].object;
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
	console.log(parent);
	if(parent == scene || parent == items) {
		console.log('parent scene')
		return object;
	}
	while (parent != items) {
		parent = object.parent;
		console.log(object);
		if(parent == scene) {
			return object;
		}
		object = parent;
	}
	
	return object;
}

// show object properties - Nick
document.getElementById("objectProperties").style.visibility = "hidden";
function objectProperties() {
	document.getElementById("objectProperties").style.visibility = "visible";
	// let xFactor = heldObject.scale.x;
	// let yFactor = heldObject.scale.y;
	// let zFactor = heldObject.scale.z;
	// let boxSize = new THREE.Vector3();
	// let boundingBox = new THREE.Box3().setFromObject(heldObject);
	// boundingBox.getSize(boxSize);
	// console.log(boxSize);
	// let width = xFactor * boxSize.x;
	// let height = yFactor * boxSize.y;
	// let depth = zFactor * boxSize.z;
	document.getElementById("propWidth").value = heldObject.scale.x;
	document.getElementById("propHeight").value = heldObject.scale.y;
	document.getElementById("propDepth").value = heldObject.scale.z;
}

// change object properties - Nick
const propWidth = document.getElementById("propWidth");
propWidth.addEventListener('change', updateProperties, false)
const propHeight = document.getElementById("propHeight");
propHeight.addEventListener('change', updateProperties, false)
const propDepth = document.getElementById("propDepth");
propDepth.addEventListener('change', updateProperties, false)

function updateProperties() {
	let width = document.getElementById("propWidth").value;
	let height = document.getElementById("propHeight").value;
	let depth = document.getElementById("propDepth").value;
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
			heldObject.position.y -= 0.1;
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
document.getElementById("moveObjectUp").addEventListener("click", function () { moveObject('up') });
document.getElementById("moveObjectDown").addEventListener("click", function () { moveObject('down') });
document.getElementById("moveObjectLeft").addEventListener("click", function () { moveObject('left') });
document.getElementById("moveObjectRight").addEventListener("click", function () { moveObject('right') });
document.getElementById("moveObjectForward").addEventListener("click", function () { moveObject('forward') });
document.getElementById("moveObjectBackward").addEventListener("click", function () { moveObject('backward') });

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
		heldObject.position.y = height/2;
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
	object.rotation.y += factor * 0.05;
}
function rotateUp(object, factor) {
	object.rotation.x += factor * 0.05;
}
document.getElementById("rotateObjectUp").addEventListener("click", function () { rotateUp(heldObject, Math.PI) });
document.getElementById("rotateObjectDown").addEventListener("click", function () { rotateUp(heldObject, -Math.PI) });
document.getElementById("rotateObjectLeft").addEventListener("click", function () { rotateObject(heldObject, Math.PI) });
document.getElementById("rotateObjectRight").addEventListener("click", function () { rotateObject(heldObject, -Math.PI) });

// unhighlight selected object - Nick
function deselectObject() {
	scene.remove(heldObjectBB);
	heldObject = undefined;
	heldObjectBB = undefined;
	document.getElementById("objectProperties").style.visibility = "hidden";
}

// remove object and object highlight from scene - Nick
function removeObject() {
	if (!heldObject) return;
	heldObject.parent.remove(heldObject);
	heldObjectBB.parent.remove(heldObjectBB);
	heldObject = undefined;
	heldObjectBB = undefined;
	document.getElementById("objectProperties").style.visibility = "hidden";
}
document.getElementById("removeObject").addEventListener("click", function () { removeObject() });

// adds object rotation when the object is selected, hovered, and the wheel is scrolled. - Nick
addEventListener('wheel', onMouseWheel, false);
function onMouseWheel(event) {
	controls.enableZoom = false;
	if (heldObject) {
		raycaster.setFromCamera(mouse, camera);
		const intersects = raycaster.intersectObject(heldObject);
		if(intersects.length) {
			rotateObject(heldObject, event.deltaY);
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
	dirs[0].subVectors(new Vector3(buffer, 0, buffer), camera.position).normalize();
	dirs[1].subVectors(new Vector3(buffer, 0, room.Depth - buffer), camera.position).normalize();
	dirs[2].subVectors(new Vector3(room.Width - buffer, 0, buffer), camera.position).normalize();
	dirs[3].subVectors(new Vector3(room.Width - buffer, 0, room.Depth - buffer), camera.position).normalize();

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
	var keyPressed = event.key
	// console.log(keyPressed)
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
		case "Backspace":
			removeObject();
			break;
		default:
			break;
	}
};