"use strict";

(function(){

	var scene, camera, renderer, cameraControls, clock;
	var box, enemy;
	var dirLight, flashlight;
	var stareLength;
	
	var MATERIAL = Object.seal({
		boxMaterial: undefined,
		floorMaterial: undefined,
		enemyMaterial: undefined
	});
	
	function setup(){
	
		clock = new THREE.Clock();
		
		THREE.ImageUtils.crossOrigin = '';
		stareLength = 0;
		
		// create a WebGL renderer
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(renderer.domElement);

		scene = new THREE.Scene();
		
		camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
		camera.position.y = 0.5;
		
		cameraControls = new THREE.FirstPersonControls(camera);
        cameraControls.lookSpeed = 0.2;
        cameraControls.movementSpeed = 1;
        cameraControls.lookVertical = true;
        

		createLighting();
		createMaterials();
		createModels();
		
		document.onmousedown = doMousedown;
	
		// get started!
		update();
	}
	
	function createMaterials(){
		MATERIAL.floorMaterial = new THREE.MeshLambertMaterial(
		{
			color : 0xffffff
		});
		MATERIAL.enemyMaterial = new THREE.MeshLambertMaterial(
		{
			map: THREE.ImageUtils.loadTexture('images/ghost.jpg')
		});
	}
	
	function createModels(){	
		var boxGeometry = new THREE.BoxGeometry(1,1,1);
		for(var i = 0; i < 20; i++){
			//var object = new THREE.Mesh(boxGeometry,new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
			var object = new THREE.Mesh(boxGeometry, new THREE.MeshLambertMaterial({color: "rgb(51,25,0)"}));
			object.position.x = Math.random() * 12 - 6;
			object.position.z = Math.random() * 12 - 6;
			object.scale.y = Math.random()*1+1;
			scene.add(object);
			object.receiveShadow = true;
			object.castShadow = true;
		}
		
		box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
		scene.add(box);
		
		//building
        var roomGeometry = new THREE.BoxGeometry(13, 5, 13);
        var roomMaterial = new THREE.MeshLambertMaterial({color: "grey", side: THREE.BackSide});
        var room = new THREE.Mesh(roomGeometry, roomMaterial);
		room.position.set(0,2,0);
		room.receiveShadow = true;
		scene.add(room);
		
		enemy = setUpEnemy();
		scene.add(enemy);
	}
	
	function createLighting(){
		var ambient = new THREE.AmbientLight( 0xffffff);
		ambient.color.setHSL( 0.1, 0.1, 0.1 );
		//ambient.color.setHSL( 0.05, 0.05, 0.05 );
		scene.add(ambient);
	
		flashlight = new THREE.SpotLight(0xffffff,4,10);
		flashlight.castShadow = true;
		scene.add(flashlight);
		flashlight.position.set(camera.position.x,camera.position.y-0.25,camera.position.z);
		renderer.shadowMapEnabled = true;
		renderer.shadowMapType = THREE.PCFSoftShadowMap;
	}
	
	function update(){
		requestAnimationFrame(update);
		
		var delta = clock.getDelta();
		cameraControls.update(delta);
		box.position.set(cameraControls.target.x,cameraControls.target.y,cameraControls.target.z);
		flashlight.position.set(camera.position.x,camera.position.y-0.25,camera.position.z);
		flashlight.target = box;
		enemy.lookAt(camera.position);
		
		findDistance();
		
		renderer.render(scene,camera);
	}
	
	function doMousedown(event) {
		event.preventDefault();
		// 2D point where we clicked on the screen
		var vector = new THREE.Vector3(( event.clientX / window.innerWidth ) * 2 - 1, -( event.clientY / window.innerHeight ) * 2 + 1, 0.5);
	
		// cast a ray from the camera to the 3D point we clicked on
		var raycaster = new THREE.Raycaster();
		// 2D point converted to 3D point in world
		vector.unproject( camera );
		raycaster.set( camera.position, vector.sub( camera.position ).normalize() );
	
		// an array of objects we are checking for intersections
		// you’ll need to put your own objects here
		// make sure that these objects are declared in the global scope
		var enemyClick = raycaster.intersectObjects([enemy]);
	
		if (enemyClick.length > 0) {
			enemyClick[0].object.position.set(Math.random() * 12 - 6,0,Math.random() * 12 - 6);
			stareLength = 0;
		}
	}
	
	//calculate shortest distance between centerpoint and rope line for collision
	function findDistance(){
		var ptX = enemy.position.x;
		var ptY = enemy.position.y;
		//console.log(rope.anchor1.location[0]);
		var p1X = camera.position.x;
		var p2X = box.position.x;
		var p1Y = camera.position.y;
		var p2Y = box.position.y;
		
		var dx = p2X - p1X;
		var dy = p2Y - p1Y;
		
		//if it's a point rather than a segment
		if((dx == 0) && (dy == 0)){
			var closest = {x: p1X, y: p1Y};
			dx = ptX - p1X;
			dy = ptY - p1Y;
			return Math.sqrt(dx * dx + dy * dy);
		}
		
		//calculate the t that minimizes the distance
		var t = ((ptX - p1X) * dx + (ptY - p1Y) * dy) / (dx * dx + dy * dy);
		
		//see if this represents one of the segment's end points or a point in the middle.
		if(t < 0){
			var closest = {x: p1X, y: p1Y};
			dx = ptX - p1X;
			dy = ptY - p1Y;
		} else if(t > 1){
			var closest = {x: p2X, y: p2Y};
			dx = ptX - p2X;
			dy = ptY - p2Y;
		} else {
			var closest = {x: p1X + t * dx, y: p1Y + t * dy};
			dx = ptX - closest.x;
			dy = ptY - closest.y;
		}
		
		var leastDistance = Math.sqrt(dx * dx + dy * dy);
		//return Math.sqrt(dx * dx + dy * dy);
		
		if(leastDistance < ENEMY.radius){
			stareLength ++;
		}else{
			stareLength = 0;
		}
		if(stareLength >= 100){
			enemy.translateOnAxis(enemy.worldToLocal(
				new THREE.Vector3(camera.position.x,camera.position.y,camera.position.z)
			).normalize(),0.09);
		}
	}

	document.body.onload = setup;

}())