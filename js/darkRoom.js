"use strict";

(function(){

	var scene, camera, renderer, cameraControls, clock;
	var box, enemy;
	var dirLight, flashlight;
	var stareLength;
	var rayHandler;
	var collidableMeshes = [];
	var collider;
	
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
		
		//raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(0,-1,0),0,10);
		
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
			collidableMeshes.push(object);
			scene.add(object);
			object.receiveShadow = true;
			object.castShadow = true;
		}
		
		box = new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
		scene.add(box);
		
		collider = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) );
		scene.add(collider);
		
		//building
        var roomGeometry = new THREE.BoxGeometry(13, 5, 13);
        var roomMaterial = new THREE.MeshLambertMaterial({color: "grey", side: THREE.BackSide});
        var room = new THREE.Mesh(roomGeometry, roomMaterial);
		room.position.set(0,2,0);
		room.receiveShadow = true;
		scene.add(room);
		
		load("models/monster.dae","enemy");
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

		if(enemy != undefined){
			checkBoxCollision();
			var delta = clock.getDelta();
			cameraControls.update(delta);
			box.position.set(cameraControls.target.x,cameraControls.target.y,cameraControls.target.z);
			flashlight.position.set(camera.position.x,camera.position.y-0.25,camera.position.z);
			flashlight.target = box;
			enemy.lookAt(camera.position);
			collider.position.set(camera.position.x,camera.position.y-0.25,camera.position.z);
		
			findDistance();
		}else{
			enemy = scene.getObjectByName( "enemy" );
		}
		
		renderer.render(scene,camera);
	}
	
	function checkBoxCollision(){
		var originPoint = collider.position.clone();
		
		for (var vertexIndex = 0; vertexIndex < collider.geometry.vertices.length; vertexIndex++)
		{		
			var localVertex = collider.geometry.vertices[vertexIndex].clone();
			var globalVertex = localVertex.applyMatrix4( collider.matrix );
			var directionVector = globalVertex.sub( collider.position );
			
			var ray = new THREE.Raycaster( originPoint, directionVector.clone().normalize() );
			var collisionResults = ray.intersectObjects( collidableMeshes );
			
			if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ){ 
				console.log(" Hit ");
				collisionResults[0].object.material.transparent = true;
				collisionResults[0].object.material.opacity = 0.3;
			}
		}	
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
		var ptZ = enemy.position.z;
		//console.log(rope.anchor1.location[0]);
		var p1X = camera.position.x;
		var p2X = box.position.x;
		var p1Y = camera.position.y;
		var p2Y = box.position.y;
		var p1Z = camera.position.z;
		var p2Z = box.position.z;
		
		var dx = p2X - p1X;
		var dy = p2Y - p1Y;
		var dz = p2Z - p1Z;
		
		//if it's a point rather than a segment
		if((dx == 0) && (dy == 0) && (dz == 0)){
			var closest = {x: p1X, y: p1Y, z: p1Z};
			dx = ptX - p1X;
			dy = ptY - p1Y;
			dz = ptZ - p1Z;
			return Math.sqrt(dx * dx + dy * dy + dz * dz);
		}
		
		//calculate the t that minimizes the distance
		var t = ((ptX - p1X) * dx + (ptY - p1Y) * dy + (ptZ - p1Z) * dz) / (dx * dx + dy * dy + dz * dz);
		
		//see if this represents one of the segment's end points or a point in the middle.
		if(t < 0){
			var closest = {x: p1X, y: p1Y, z: p1Z};
			dx = ptX - p1X;
			dy = ptY - p1Y;
			dz = ptZ - p1Z;
		} else if(t > 1){
			var closest = {x: p2X, y: p2Y, z: p2Z};
			dx = ptX - p2X;
			dy = ptY - p2Y;
			dz = ptZ - p2Z;
		} else {
			var closest = {x: p1X + t * dx, y: p1Y + t * dy, z: p1Z + t * dz};
			dx = ptX - closest.x;
			dy = ptY - closest.y;
			dz = ptZ - closest.z;
		}
		
		var leastDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
		//return Math.sqrt(dx * dx + dy * dy);
		
		if(leastDistance < ENEMY.radius){
			stareLength ++;
			console.log("HIT");
		}else{
			stareLength = 0;
		}
		if(stareLength >= 100){
			enemy.translateOnAxis(enemy.worldToLocal(
				new THREE.Vector3(camera.position.x,camera.position.y-0.25,camera.position.z)
			).normalize(),0.09);
		}
	}
	
	function load(file,name){
		var dae;
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( file, function ( collada ) {
			dae = collada.scene;
			dae.traverse( function ( child ) {
				if( child instanceof THREE.SkinnedMesh ) {
					var animation = new THREE.Animation( child, child.geometry.animation );
					animation.play();
				}
			});
			dae.scale.x = dae.scale.y = dae.scale.z = 0.0005;
			dae.position.x = Math.random() * 12 - 6;
			dae.position.z = Math.random() * 12 - 6;
			dae.updateMatrix();
			dae.name = name;
			scene.add(dae)
		});
	}

	document.body.onload = setup;

}())