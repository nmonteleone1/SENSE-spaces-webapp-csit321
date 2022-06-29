import * as THREE from "three";
import {OrbitControls} from "OrbitControls";
import {GUI} from 'dat-gui';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
);
camera.position.set(5, 5, 5);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1,1);
const material = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	wireframe: true,
});
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.position.set(2,1,2);
scene.add(cube);

const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(),
	new THREE.MeshStandardMaterial({
		color: 0xffffff
	})
);
plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xffffff,0.25);
const light = new THREE.DirectionalLight(0xffffff,0.5);
light.position.set(-100,100,100);
light.target.position.set(0,0,0);
light.castShadow = true;
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
	wallMaterial: new THREE.MeshStandardMaterial({
		color: 0xaaaaaa
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

const controls = new OrbitControls(camera, renderer.domElement);

const gui = new GUI({autoPlace:false});
document.getElementById("gui").appendChild(gui.domElement);
const cubeFolder = gui.addFolder('Cube');
cubeFolder.add(cube.position, 'x', -10, 10);
cubeFolder.add(cube.position, 'y', -10, 10);
cubeFolder.add(cube.position, 'z', -10, 10);
cubeFolder.open();
const roomFolder = gui.addFolder('Room Size');
roomFolder.add(room, 'Width', 0.2, 10);
roomFolder.add(room, 'Depth', 0.2, 10);
roomFolder.add(room, 'Height', 0.2, 5);
var regenRoom = { RegenerateRoom:function(){
	regenerateRoom();
}};
roomFolder.add(regenRoom, 'RegenerateRoom');
roomFolder.open();
const cameraFolder = gui.addFolder('Camera');
var cameraFunctions = { 
	rotateLeft:function(){rotateCamera('cw');},
	rotateRight:function(){rotateCamera('ccw');},
	zoomIn:function(){zoomCamera(1);},
	zoomOut:function(){zoomCamera(0);}
}
cameraFolder.add(cameraFunctions, 'rotateLeft');
cameraFolder.add(cameraFunctions, 'rotateRight');
cameraFolder.add(cameraFunctions, 'zoomIn');
cameraFolder.add(cameraFunctions, 'zoomOut');
cameraFolder.open();

function zoomCamera(zoom) {
	if(zoom == 1) {
		controls.constraint.dollyIn();
	}
	else if(zoom == 0) {
		controls.constraint.dollyOut();
	}
	else {

	}
}

function rotateCamera(direction) {
	if(direction == 'cw') {

	}
	else if(direction == 'ccw') {

	}
	else {
		console.log('error rotating camera');
	}
}

function regenerateRoom() {
	const xCenter = room.Width/2;
	const yCenter = room.Depth/2;

	let newSideWallGeometry = new THREE.BoxGeometry(room.Depth,room.Height,0.1);
	let newBackWallGeometry = new THREE.BoxGeometry(room.Width,room.Height,0.1);
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
