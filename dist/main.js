//////MODULES//////
import * as THREE from "three";
import { OrbitControls } from "OrbitControls";
import { OBJLoader } from "OBJLoader";
import { Box3, Group, RedIntegerFormat, Vector3 } from "three";

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

//light the 3d space
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

//mouse camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI / 12;
controls.maxPolarAngle = 5 * Math.PI / 12;



//////GLOBALS//////
var mouse, clickMouse, raycaster, moveRaycaster;
const zoomFactor = 0.25; // factor must be <1
const rotateFactor = Math.PI * 0.5; // factor of 1 is a full rotation
const moveFactor = 0.25;
var heldObject, heldObjectBB;
const items = new THREE.Group();
const loader = new THREE.ObjectLoader();
const objloader = new OBJLoader();

//mouse tracking within canvas
mouse = new THREE.Vector2();
clickMouse = new THREE.Vector2();

//
raycaster = new THREE.Raycaster();
moveRaycaster = new THREE.Raycaster();



//////3D SPACE GENERATION//////
//create blank room
var room = {
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

//plane for object location tracking
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

//populate scene
scene.add(room.walls);
scene.add(grid);

// //bounding box testing
// var cubeBB = new Box3().setFromObject(cube);
// const geometryBB = new THREE.BoxGeometry(cubeBB.min.x,cubeBB.max.y,cubeBB.min.z);
// const materialBB = new THREE.MeshPhongMaterial({
// 	color: 0xff0000,
// 	wireframe: true,
// });
// const cubeBBox = new THREE.Mesh(geometryBB, materialBB);
// var cubeBBoxBox = new Box3().setFromObject(cubeBBox);
// cubeBBox.position.set(2,1,2);

// var cubeBBHelper = new THREE.Box3Helper(cubeBB, 0xff0000)
// scene.add(cubeBBHelper);

//start application
regenerateRoom();
animate();



//////UI INTEGRATION//////
document.getElementById("rotateUp").addEventListener("click", function () { rotateCamera('up') });
document.getElementById("rotateDown").addEventListener("click", function () { rotateCamera('down') });
document.getElementById("rotateLeft").addEventListener("click", function () { rotateCamera('left') });
document.getElementById("rotateRight").addEventListener("click", function () { rotateCamera('right') });
document.getElementById("roomRegen").addEventListener("click", regenerateRoom);
document.getElementById("zoomIn").addEventListener("click", function () { zoomCamera(1) });
document.getElementById("zoomOut").addEventListener("click", function () { zoomCamera(0) });
document.getElementById("moveUp").addEventListener("click", function () { moveCamera('up') });
document.getElementById("moveDown").addEventListener("click", function () { moveCamera('down') });
document.getElementById("moveLeft").addEventListener("click", function () { moveCamera('left') });
document.getElementById("moveRight").addEventListener("click", function () { moveCamera('right') });
document.getElementById("taste").addEventListener("click", function () { loadObject('taste') });
document.getElementById("touch").addEventListener("click", function () { loadObject('touch') });
document.getElementById("sight").addEventListener("click", function () { loadObject('sight') });
document.getElementById("sound").addEventListener("click", function () { loadObject('sound') });
document.getElementById("smell").addEventListener("click", function () { loadObject('smell') });
document.getElementById("loadObject").addEventListener("change", function () { loadObj(event) })

// setup collapsable dropdown menus
setupDropdown();

//track mouse position
window.addEventListener('mousemove', onMouseMove, false);
//object grab
window.addEventListener('click', onMouseClick, false);
window.addEventListener('drag', dragObject, false);

//load objects from file
const fileInput = document.getElementById("loadObject");
fileInput.addEventListener('change', function () {
	const reader = new FileReader();

	var url = URL.createObjectURL(fileInput.files[0])
	var fileName = fileInput.files[0].name

	reader.addEventListener('load', async function (event) {
		const contents = event.target.result;
		const object = new OBJLoader().parse(contents);
		object.name = fileName;

		items.add(object);

	}, false);
	reader.readAsText(fileInput.files[0]);

	url = url.replace(/^(\.?\/)/, '');
	console.log(url);

	// const[file] = evt.target.files
	// if(file) {
	// 	objloader.load(URL.createObjectURL(file), function(obkect) {
	// 		scene.add(object);
	// 	},
	// 	function (xhr) {
	// 		console.log((xhr.loaded/xhr.total*100) + '% loaded');
	// 	},
	// 	function(error) {
	// 		console.log('Error loading the object');
	// 	})
	// }
})
function loadObj(evt) {

}

//////FUNCTIONS//////
function loadJSON(sense) {
	var data;
	let path = 'models/json/' + sense + '.json';
	fetch(path).then((response) => response.json()).then((json) => data = json);
	// fetch(path).then(response => {return response.json();}).then(jsondata => console.log(jsondata));
	fetch(path).then(response => { return response.json() })

	return data;
}

function loadObject(sense) {
	loader.load('models/json/' + sense + '.json', function (obj) {
		obj.position.set(room.Width / 2, 0.5, room.Depth / 2);
		items.add(obj);
		scene.add(items);
	});
	var data = loadJSON(sense);
	// var object = loader.parse(data);
	// var mesh = new THREE.Mesh(object.geometry, object.materials[0]);
	// scene.add(mesh);
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

function rotateCamera(direction) {
	if (direction == 'up') {
		camera.translateY(1);
		// console.log(camera.position.y);
		// console.log(camera.position.z);
		// console.log(camera.position.x);
	}
	else if (direction == 'down') {
		camera.translateY(-1);
		// console.log(camera.position.y);
		// console.log(camera.position.z);
		// console.log(camera.position.x);
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

function zoomCamera(zoom) {
	if (zoom == 1) {
		if (camera.zoom >= 2) {
			// console.log(camera.zoom); 
			return;
		}
		camera.zoom += 0.25;
	}
	else if (zoom == 0) {
		if (camera.zoom <= zoomFactor) {
			return;
		}
		camera.zoom -= 0.25;
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

function regenerateRoom() {
	var width = parseFloat(document.getElementById('roomWidth').value);
	var depth = parseFloat(document.getElementById('roomDepth').value);

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

	const xCenter = width / 2;
	const yCenter = depth / 2;
	const wallThickness = 0.1;

	let newSideWallGeometry = new THREE.BoxGeometry(depth + wallThickness, room.Height, wallThickness);
	let newBackWallGeometry = new THREE.BoxGeometry(width + wallThickness, room.Height, wallThickness);
	room.leftWall.geometry = newSideWallGeometry;
	room.rightWall.geometry = newSideWallGeometry;
	room.backWall.geometry = newBackWallGeometry;
	room.frontWall.geometry = newBackWallGeometry;

	room.leftWall.position.set(0, room.Height / 2, yCenter);
	room.leftWall.rotation.set(0, Math.PI / 2, 0);

	room.backWall.position.set(xCenter, room.Height / 2, 0);

	room.rightWall.position.set(width, room.Height / 2, yCenter);
	room.rightWall.rotation.set(0, Math.PI / 2, 0);

	room.frontWall.position.set(xCenter, room.Height / 2, depth);

	plane.geometry = new THREE.PlaneGeometry(width, room.Depth, 10, 10);
	plane.position.set(xCenter, 0, yCenter);
	plane.material.map.repeat.set(width / 2, depth / 2);

	light.position.set(xCenter, 2.7, yCenter);
	light.distance = Math.max(width, depth) * 1.5

	camera.lookAt(xCenter, 0, yCenter);
	controls.target.set(xCenter, 0, yCenter);
	controls.update();
}

function onMouseMove(event) {
	dragObject();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onMouseClick(event) {
	if (heldObject) {
		// console.log('unsetting object');
		scene.remove(heldObjectBB);
		heldObject = undefined;
		heldObjectBB = undefined;
		return;
	}

	clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(clickMouse, camera);
	const intersects = raycaster.intersectObjects(items.children);
	if (intersects.length) {
		// console.log('setting object');
		heldObject = intersects[0].object;
		heldObjectBB = new THREE.BoxHelper(heldObject, 0xff0000);
		scene.add(heldObjectBB);
	}
}

function wallHiderToggle() {
	//note: add raycasts to each corner of the room to hide two walls when looking through a corner
	var dir = new THREE.Vector3();
	dir.subVectors(new Vector3(room.Width / 2, 0, room.Depth / 2), camera.position).normalize();
	raycaster.set(camera.position, dir);
	const intersects = raycaster.intersectObjects(room.walls.children);
	if (!intersects.length) {
		return;
	}

	room.walls.traverse(function (obj) {
		const newMaterial = intersects[0].object.material.clone();
		if (obj.position == intersects[0].object.position) {
			newMaterial.transparent = true;
			newMaterial.opacity = 0.25;
			obj.material = newMaterial;
		}
		else {
			newMaterial.transparent = false;
			newMaterial.opacity = 1;
			obj.material = newMaterial;
		}
	})
	// if(intersects[0].object.material.transparent) {
	// 	newMaterial.transparent = false;
	// 	newMaterial.opacity = 0;
	// }
	// else {
	// 	newMaterial.transparent = true;
	// 	newMaterial.opacity = 0.5;
	// }
}

function dragObject() {
	if (heldObject) {
		var collision = false;
		// scene.traverse(function(obj) {
		// 	var tempBB = new THREE.Box3().setFromObject(obj);
		// 	if(tempBB.equals(cubeBB) || tempBB.equals(cubeBBoxBox)) {
		// 		collision = false;
		// 	}
		// 	else if(tempBB.intersectsBox(cubeBB)) {
		// 		collision = true;
		// 		console.log('collision');
		// 		return;
		// 	}
		// 	else {
		// 		collision = false;
		// 	}
		// })
		if (collision) { return; }
		moveRaycaster.setFromCamera(mouse, camera);
		const moveGrid = moveRaycaster.intersectObjects(grid.children);
		if (moveGrid.length) {
			for (let obj of moveGrid) {
				// console.log(obj.point.x);
				heldObject.position.x = obj.point.x;
				heldObject.position.z = obj.point.z;
				// heldObjectBB.update();
				break;
			}
		}
	}
}

function findGridPos() {
	raycaster.setFromCamera(mouse, camera);
	const moveGrid = raycaster.intersectObjects(grid.children);
	if (moveGrid.length) {
		return new THREE.Vector2(moveGrid[0].point.x, moveGrid[0].point.z);
	}
}

function animate() {
	requestAnimationFrame(animate);

	wallHiderToggle();
	if (heldObjectBB) {
		heldObjectBB.update();
	}

	render();
}

function render() {
	renderer.render(scene, camera);
}


// handle dropdown category visibility
// todo: move this somewhere better
function setupDropdown() {
	var dropdown = document.getElementsByClassName("panelButtonDropdown");
	var i;

	for (i = 0; i < dropdown.length; i++) {
		dropdown[i].addEventListener("click", function () {
			this.classList.toggle("active");
			var dropdownContent = this.nextElementSibling;
			if (dropdownContent.style.display === "block") {
				dropdownContent.style.display = "none";
			} else {
				dropdownContent.style.display = "block";
			}
		});
	}
}

var dropdown = document.getElementsByClassName("sensoryItem");
var i;

for (i = 0; i < dropdown.length; i++) {
	var element = dropdown[i];
	// console.log(element.innerHTML)
	// console.log(element.innerHTML.toLowerCase())
	var data = loadJSON(element.innerHTML.toLowerCase());
	// console.log(data)
	// if(data) {
	// 	// print(data)
	// 	console.log(data);
	// }

	// dropdown[i].innerHTML


	// dropdown[i].addEventListener("click", function () {
	// 	this.classList.toggle("active");
	// 	var dropdownContent = this.nextElementSibling;
	// 	if (dropdownContent.style.display === "block") {
	// 		dropdownContent.style.display = "none";
	// 	} else {
	// 		dropdownContent.style.display = "block";
	// 	}
	// });
}

// loadJSON('taste')



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