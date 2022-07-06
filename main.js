import * as THREE from "three";
import {OrbitControls} from "OrbitControls";
import {GUI} from 'dat-gui';

const scene = new THREE.Scene();

var mouse, clickMouse, raycaster, moveRaycaster;
mouse = new THREE.Vector2();
clickMouse = new THREE.Vector2();
raycaster = new THREE.Raycaster();
moveRaycaster = new THREE.Raycaster();

var heldObject;

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
);
camera.position.set(5, 5, 5);
const zoomFactor = 0.25; // factor must be <1
const rotateFactor = Math.PI*0.5; // factor of 1 is a full rotation
const moveFactor = 0.25;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = Math.PI/12;
controls.maxPolarAngle = 5*Math.PI/12;

const geometry = new THREE.BoxGeometry(1,1);
const material = new THREE.MeshPhongMaterial({
	color: 0x00ff00,
	// wireframe: true,
});
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.receiveShadow = true;
cube.position.set(2,1,2);

const items = new THREE.Group();
items.add(cube);
scene.add(items);

const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(),
	new THREE.MeshStandardMaterial({
		color: 0xffffff
	})
);
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;

const grid = new THREE.Group();
grid.add(plane);
scene.add(grid);

const ambientLight = new THREE.AmbientLight(0xffffff,0.75);
const light = new THREE.DirectionalLight(0xffffff,0.75);
light.position.set(-10,50,-10);
light.target.position.set(0,0,0);
light.castShadow = true;
light.shadow.bias = -0.0001;
light.shadow.mapSize.width = 1024*4;
light.shadow.mapSize.height = 1024*4;
scene.add(ambientLight);
scene.add(light);

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	render();
}

var room = {
	Width: 4,
	Depth: 4,
	Height: 2.7,
	sideGeometry: new THREE.BoxGeometry(),
	backWallGeometry: new THREE.BoxGeometry(),
	wallMaterial: new THREE.MeshPhongMaterial({
		color: 0xffffff
	}),
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
regenerateRoom();
scene.add(room.leftWall, room.backWall, room.rightWall, room.frontWall);
scene.background = new THREE.Color(0x000000);

document.getElementById("rotateUp").addEventListener("click", function() {rotateCamera('up')});
document.getElementById("rotateDown").addEventListener("click", function() {rotateCamera('down')});
document.getElementById("rotateLeft").addEventListener("click", function() {rotateCamera('left')});
document.getElementById("rotateRight").addEventListener("click", function() {rotateCamera('right')});
document.getElementById("roomRegen").addEventListener("click", regenerateRoom);
document.getElementById("zoomIn").addEventListener("click", function() {zoomCamera(1)});
document.getElementById("zoomOut").addEventListener("click", function() {zoomCamera(0)});
document.getElementById("moveUp").addEventListener("click", function() {moveCamera('up')});
document.getElementById("moveDown").addEventListener("click", function() {moveCamera('down')});
document.getElementById("moveLeft").addEventListener("click", function() {moveCamera('left')});
document.getElementById("moveRight").addEventListener("click", function() {moveCamera('right')});

function moveCamera(direction) {
	switch(direction) {
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
	if(direction == 'up') {
		camera.translateY(1);
		console.log(camera.position.y);
		console.log(camera.position.z);
		console.log(camera.position.x);
	}
	else if(direction == 'down') {
		camera.translateY(-1);
		console.log(camera.position.y);
		console.log(camera.position.z);
		console.log(camera.position.x);
	}
	else if(direction == 'left') {
		camera.translateX(-1*rotateFactor);
	}
	else if(direction == 'right') {
		camera.translateX(1*rotateFactor);
	}
	else {
		console.log('error rotating camera');
	}
	camera.lookAt(scene.position);
	camera.updateProjectionMatrix();
	controls.update();
}

function zoomCamera(zoom) {
	if(zoom == 1) {
		if(camera.zoom >= 2) {console.log(camera.zoom); return;}
		camera.zoom += 0.25;
	}
	else if(zoom == 0) {
		if(camera.zoom <= zoomFactor) {return;}
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
	const xCenter = room.Width/2;
	const yCenter = room.Depth/2;
	const wallThickness = 0.1;

	let newSideWallGeometry = new THREE.BoxGeometry(room.Depth+wallThickness, room.Height, wallThickness);
	let newBackWallGeometry = new THREE.BoxGeometry(room.Width+wallThickness, room.Height, wallThickness);
	room.leftWall.geometry = newSideWallGeometry;
	room.rightWall.geometry = newSideWallGeometry;
	room.backWall.geometry = newBackWallGeometry;
	room.frontWall.geometry = newBackWallGeometry;	

	room.leftWall.position.set(0,room.Height/2,yCenter);
	room.leftWall.rotation.set(0,Math.PI/2,0);

	room.backWall.position.set(xCenter,room.Height/2,0);

	room.rightWall.position.set(room.Width, room.Height/2, yCenter);
	room.rightWall.rotation.set(0,Math.PI/2,0);

	room.frontWall.position.set(xCenter, room.Height/2, room.Depth);

	plane.geometry = new THREE.PlaneGeometry(room.Width,room.Depth,10,10);
	plane.position.set(xCenter,0,yCenter);

	camera.lookAt(xCenter,0,yCenter);
	controls.target.set(xCenter,0,yCenter);
	controls.update();
}

function onMouseMove(event) {
	dragObject();
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onMouseMove, false);

function onMouseClick(event) {
	if(heldObject) {
		console.log('unsetting object');
		heldObject = undefined;
		return;
	}

	clickMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	clickMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
	raycaster.setFromCamera(clickMouse, camera);
	const intersects = raycaster.intersectObjects(items.children);
	if(intersects.length) {
		console.log('setting object');
		heldObject = intersects[0].object;
	}
}
window.addEventListener('click', onMouseClick, false);

function hideToggle() {
	raycaster.setFromCamera(mouse, camera);
	const intersects = raycaster.intersectObjects(items.children);
	if(!intersects.length) {
		return;
	}
	const newMaterial = intersects[0].object.material.clone();
	if(intersects[0].object.material.transparent) {
		newMaterial.transparent = false;
		newMaterial.opacity = 0;
	}
	else {
		newMaterial.transparent = true;
		newMaterial.opacity = 0.5;
		intersects[0].object.material = newMaterial;
	}
	intersects[0].object.material = newMaterial;
}
// window.addEventListener('mousedown', hideToggle, false);

function dragObject() {
	if(heldObject) {
		moveRaycaster.setFromCamera(mouse, camera);
		const moveGrid = moveRaycaster.intersectObjects(grid.children);
		if(moveGrid.length) {
			for(let obj of moveGrid) {
				console.log(obj.point.x);
				heldObject.position.x = obj.point.x;
				heldObject.position.z = obj.point.z;
				break;
			}
		}		
	}
}
window.addEventListener('drag', dragObject, false);

function findGridPos() {
	raycaster.setFromCamera(mouse, camera);
	const moveGrid = raycaster.intersectObjects(grid.children);
	if(moveGrid.length) {
		return new THREE.Vector2(moveGrid[0].point.x, moveGrid[0].point.z);
	}
}

function animate() {
	requestAnimationFrame(animate);

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	render();
}

function render() {
	renderer.render(scene, camera);
}

animate();
