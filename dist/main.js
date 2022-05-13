import * as THREE from "three";
import {OrbitControls} from "OrbitControls";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	100
);
camera.position.set(0, 1, 2);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({
	color: 0x00ff00,
	wireframe: true,
});
const cube = new THREE.Mesh(geometry, material);
cube.castShadow = true;
cube.position.set(0,1,0);
scene.add(cube);

const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(2048,1024,10,10),
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

const controls = new OrbitControls(camera, renderer.domElement);

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
