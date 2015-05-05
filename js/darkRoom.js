"use strict";

(function(){

	var scene, camera, renderer;
	
	var MATERIAL = Object.seal({
		placeholder: undefined
	});
	
	function setup(){
		// create a WebGL renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		scene = new THREE.Scene();
	
		camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
		camera.position.z = 5;
	
		// get started!
		update();
	}
	
	function update(){
		requestAnimationFrame(update);
		renderer.render(scene,camera);
	}

	document.body.onload = setup;

}())