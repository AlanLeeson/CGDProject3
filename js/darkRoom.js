"use strict";

(function(){

	var scene, camera, renderer, cameraControls, clock;
	var box;
	var dirLight, flashlight;
	
	var MATERIAL = Object.seal({
		boxMaterial: undefined,
		floorMaterial: undefined
	});
	
	function setup(){
	
		clock = new THREE.Clock();
		
		// create a WebGL renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
		camera.position.y = 1;
		
		cameraControls = new THREE.FirstPersonControls(camera);
        cameraControls.lookSpeed = 0.4;
        cameraControls.movementSpeed = 10;
        cameraControls.lookVertical = true;

		createLighting();
		createMaterials();
		createModels();
	
		// get started!
		update();
	}
	
	function createMaterials(){
		MATERIAL.floorMaterial = new THREE.MeshLambertMaterial(
		{
			color : 0xffffff
		});
	}
	
	function createModels(){	
		var boxGeometry = new THREE.BoxGeometry(1,1,1);
		for(var i = 0; i < 20; i++){
			var object = new THREE.Mesh(boxGeometry,new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
			object.position.x = Math.random() * 15 - 5;
			object.position.z = Math.random() * 15 - 5;
			scene.add(object);
			object.receiveShadow = true;
			object.castShadow = true;
		}
		
		box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
		scene.add(box);

		var floor = new THREE.Mesh(
			new THREE.PlaneGeometry(20,20,10),
			MATERIAL.floorMaterial
		);
		floor.position.y = -0.5;
		floor.position.z = 0;
		floor.rotation.x = -0.5 * Math.PI;
		scene.add(floor);
		floor.receiveShadow = true;
	}
	
	function createLighting(){
		var ambient = new THREE.AmbientLight( 0xffffff);
		scene.add( ambient );
		ambient.color.setHSL( 0.2, 0, 0.2 );
	
		dirLight = new THREE.PointLight( 0xffffff, 2, 10 );
		dirLight.position.set( 0, 1, -5 );
	//	scene.add( dirLight );
	/*	
		var shadowLight = new THREE.PointLight(0xffffff);
		shadowLight.position.set(0,1,-5);
		scene.add(shadowLight);
		shadowLight.onlyShadow = true;
	*/
		var spotLight = new THREE.SpotLight(0xF8D898);
		spotLight.position.set(0,0,460);
		spotLight.intensity = 1.5;
		spotLight.castShadow = true;
	
		//scene.add(spotLight);
		flashlight = new THREE.SpotLight(0xffffff,4,10);
		flashlight.castShadow = true;
		scene.add(flashlight);
		flashlight.position.set(camera.position.x,camera.position.y,camera.position.z);
		renderer.shadowMapEnabled = true;
	}
	
	function update(){
		requestAnimationFrame(update);
		
		var delta = clock.getDelta();
		cameraControls.update(delta);
		box.position.set(cameraControls.target.x,cameraControls.target.y,cameraControls.target.z);
		flashlight.target = box;
		renderer.render(scene,camera);
	}

	document.body.onload = setup;

}())