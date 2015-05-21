"use strict";

(function(){

	var scene, camera, renderer, cameraControls, clock;
	var box, enemy, floor, room;
	var dirLight, flashlight;
	var stareLength;
	var rayHandler;
	var collidableMeshes = [];
	var transMeshes = [];
	var collectables = [];
	var collider;
	var collectableCount = 2;
	var prevPosX, prevPosY, prevPosZ;
	var hold; //for mouse holding
	var fVec, theMat, theMesh;
	var breathing, footsteps, collect, violin1, hit1, hit2, bang, creep;
	var antsy = 300, attackSpeed = 150;
	var inGame = true;
	
	var MATERIAL = Object.seal({
		boxMaterial: undefined,
		floorMaterial: undefined,
		enemyMaterial: undefined
	});
	
	//Sets up all variables, sounds, cameras, scene, and calls functions to start the game
	function setup(){
	
		createText("Dark Room",window.innerWidth/2-75,
				window.innerHeight/2-100,window.innerWidth,50,"TitleScreen");
		createText("Loading",window.innerWidth/2-50,
				window.innerHeight/2+10,window.innerWidth,50,"LoadScreen");
				
		
				
		//footsteps = new Audio('sound/footsteps.wav');
		footsteps = document.querySelector("#footsteps");
		footsteps.volume = 0.5;
		footsteps.loop = true;
		
		
		//breathing = new Audio('sound/breathing.wav');
		breathing = document.querySelector("#breathing");
		breathing.volume = 0.05;
		breathing.loop = true;
		breathing.play();
		
		//collect = new Audio('sound/collect.wav');
		collect = document.querySelector("#collect");
		collect.volume = 0.07;
		
		//violin1 = new Audio('sound/scareViolins1.ogg');
		violin1 = document.querySelector("#violin1");
		violin1.loop = true;
		violin1.volume = 0.7;
		
		//hit1 = new Audio('sound/hit1.wav');
		hit1 = document.querySelector("#hit1");
		hit1.volume = 0.6;
		
		//hit2 = new Audio('sound/hit2.mp3');
		hit2 = document.querySelector("#hit2");
		hit2.volume = 0.3;
		
		//bang = new Audio('sound/bang.wav');
		bang = document.querySelector("#bang");
		bang.volume = 1;
		
		//creep = new Audio('sound/ambientViolin1.wav');
		creep = document.querySelector("#creep");
		creep.volume = 0.8;
		creep.oncanplaythrough = function(){
			document.getElementById("LoadScreen").style.visibility = "hidden";
			document.getElementById("TitleScreen").style.visibility = "hidden";
			
			fVec = new THREE.Vector3(0,0,-1);
			clock = new THREE.Clock();
			
			THREE.ImageUtils.crossOrigin = '';
			stareLength = 0;
			createText("Find the hidden orbs by clicking the mouse to search boxes", 10, 10, 150,10,"collectableText");
			createText(collectableCount, window.innerWidth/2, 10, 150,10,"count");
			createText("W,A,S,D to move, Mouse to look", 10,480,200,200,"instructions");
			createText("You Have Rid The World From His Evil.",window.innerWidth/8+20,
					window.innerHeight-50,window.innerWidth,50,"SuccessScreen");
			document.getElementById("SuccessScreen").style.visibility = "hidden";
			// create a WebGL renderer
			renderer = new THREE.WebGLRenderer();
			renderer.setSize(window.innerWidth, window.innerHeight);
			document.body.appendChild(renderer.domElement);

			scene = new THREE.Scene();
			
			camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
			camera.position.y = 0.25;
			
			cameraControls = new THREE.FirstPersonControls(camera);
			cameraControls.lookSpeed = 0.2;
			cameraControls.movementSpeed = 1;
			cameraControls.lookVertical = true;
			
			hold = false;
			

			createLighting();
			createMaterials();
			createModels();
			
			//raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3(0,-1,0),0,10);
			
			document.onmousedown = doMousedown;
			document.onmouseup = function(){hold = false;}; //mouse is no longer held
			document.onkeydown = function(){footsteps.play();};
			document.onkeyup = function(){footsteps.pause();};
			document.getElementById("restart").onclick = restart;
		
			// get started!
			update();
		}
	
	}
	
	//creates the materials to be used by the models in the scene
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
	
	//creates the models to populate the scene
	function createModels(){	
	
		//building
        //var roomGeometry = new THREE.BoxGeometry(20, 5, 20,90,90,90);
		var roomGeometry = new THREE.BoxGeometry(15, 5, 15,30,30,30);
        var roomMaterial = new THREE.MeshLambertMaterial({color: "grey", side: THREE.BackSide});
        room = new THREE.Mesh(roomGeometry, roomMaterial);
		room.position.set(0,2,0);
		room.receiveShadow = true;
		scene.add(room);
	
		var boxGeometry = new THREE.BoxGeometry(1,1,1,10,10,10);
		for(var i = 0; i < 10; i++){
			//var object = new THREE.Mesh(boxGeometry,new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
			var object = new THREE.Mesh(boxGeometry, new THREE.MeshLambertMaterial({color: "rgb(51,25,0)"}));
			object.position.x = Math.random() * 14 - 7;
			object.position.z = Math.random() * 14 - 7;
			object.scale.y = Math.random()*2+1;
			var ranScale =  Math.random()*1+1;
			object.scale.x = ranScale;
			object.scale.z = ranScale;
			if(!(i<2)){
				collidableMeshes.push(object);
			}
			transMeshes.push(object);
			scene.add(object);
			object.receiveShadow = true;
			object.castShadow = true;
			object.radius = object.scale.x/2;
			if(i < 2){
				//create the collectables
				var obj = setUpCollectable(object.position);
				scene.add(obj);
				collidableMeshes.push(obj);
				collectables.push(obj);
			}
		}
		
		box = new THREE.Mesh(new THREE.BoxGeometry(0.01,0.01,0.01),new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );
		scene.add(box);
		
		collider = new THREE.Mesh(new THREE.BoxGeometry(1,1,1) );
		scene.add(collider);
		
		load("models/monster.dae","enemy");
	}
	
	//Sets up lighting in the scene - flashlight and ambient
	function createLighting(){
		var ambient = new THREE.AmbientLight( 0xffffff);
		ambient.color.setHSL( 0.1, 0.1, 0.1 );
		//ambient.color.setHSL( 0.05, 0.05, 0.05 );
		scene.add(ambient);
	
		flashlight = new THREE.SpotLight(0xffffff,3,10);
		flashlight.castShadow = true;
		flashlight.intensity = 0.9;
		flashlight.distance = 6;
		scene.add(flashlight);
		flashlight.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
		renderer.shadowMapEnabled = true;
		renderer.shadowMapType = THREE.PCFSoftShadowMap;
	}
	
	//all things that need to be constantly called go here
	function update(){
		requestAnimationFrame(update);
		prevPosX = cameraControls.object.position.x;
		prevPosY = cameraControls.object.position.y;
		prevPosZ = cameraControls.object.position.z;
		fVec.applyQuaternion(camera.quaternion);
		
		if(enemy != undefined){
			var delta = clock.getDelta();
			cameraControls.update(delta);
			moveEnemy();
			collider.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
			checkBoxCollision();
			
			var boxPos = new THREE.Vector3(cameraControls.target.x,cameraControls.target.y,cameraControls.target.z);
			boxPos.normalize();
			boxPos.multiplyScalar(4);
			box.position.set(camera.position.x+boxPos.x,camera.position.y+boxPos.y-0.1,camera.position.z+boxPos.z);
			flashlight.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
			flashlight.target = box;
			flashlight.intensity -= 0.0002;
			enemy.lookAt(camera.position);
			//collider.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
			findDistance();
			
			if(camera.position.x > 7){
				camera.position.x = 7;
				collider.position.set(camera.position.x, camera.position.y-0.1, camera.position.z);
				flashlight.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
				flashlight.target = box;
			} else if(camera.position.x < -7){
				camera.position.x = -7;
				collider.position.set(camera.position.x, camera.position.y-0.1, camera.position.z);
				flashlight.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
				flashlight.target = box;
			} else if(camera.position.z > 7){
				camera.position.z = 7;
				collider.position.set(camera.position.x, camera.position.y-0.1, camera.position.z);
				flashlight.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
				flashlight.target = box;
			} else if(camera.position.z < -7){
				camera.position.z = -7;
				collider.position.set(camera.position.x, camera.position.y-0.1, camera.position.z);
				flashlight.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
				flashlight.target = box;
			}
			
			if((Math.floor(Math.random() * 60)) == 3){
				playHit();
			}
			if((Math.floor(Math.random() * 1000)) == 3){
				bang.play();
			}
			
			
			for(var i = 0; i < transMeshes.length; i++){
				var ele = document.getElementById("progress");
				if(hold){
					ele.value -= 0.02;
					boxInView(transMeshes[i]);
				} else {
					ele.value += 0.01;
					if(ele.value > 100){
						ele.value = 100;
					}
					transMeshes[i].material.opacity = 1;
				}
			}
			
			findEnd();
			
		}else{
			enemy = scene.getObjectByName( "enemy" );
		}

		renderer.render(scene,camera);
	}
	
	//manipulates the enemy position to follow you conditionally
	function moveEnemy(){
		antsy --;
		if(antsy <= 0){
			var ran = parseInt(Math.random()*3);
			if(ran == 0){
				var moveToPosition = new THREE.Vector3(cameraControls.target.x,
					cameraControls.target.y, cameraControls.target.z);
				moveToPosition.negate();
				moveToPosition.normalize();
				moveToPosition.multiplyScalar(Math.random()*collectableCount + 2);
				enemy.position.set(camera.position.x+moveToPosition.x, 
					enemy.position.y,camera.position.z+moveToPosition.z);
			}else if(ran == 1){
				enemy.position.set(Math.random() * 20 - 10,enemy.position.y,Math.random() * 20 - 10);
			}else if(ran == 2){
				enemy.position.set(Math.random()*12 - 6 + camera.position.x, enemy.position.y, 
					Math.random()*12 - 6 + camera.position.z)
			}
			switch(collectableCount){
				case 5:
					antsy = 1500;
				break;
				case 4:
					antsy = 1000;
					attackSpeed = 120;
				break;
				case 3:
					antsy = 700;
					attackSpeed = 100;
				break;
				case 2:
					antsy = 450;
					attackSpeed = 70;
				break;
				case 1: 
					antsy = 300;
					attackSpeed = 50;
				break;
			}
		
		}
	}
	
	//checks collision between player and boxes in the scene
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
				if(collisionResults[0].object.name == "collectable"){
					collect.play();
					collectableCount --;
					flashlight.intensity = 0.9;
					scene.remove(collisionResults[0].object);
					collidableMeshes.splice(collidableMeshes.indexOf(collisionResults[0].object),1);
					document.getElementById("count").innerHTML = collectableCount + "";
					
					if(collectableCount < 3){
						creep.play();
					}
					if(collectableCount <= 0){
						win();
					}
				}
				//make box transparent upon contact with camera
				//collisionResults[0].object.material.transparent = true;
				//collisionResults[0].object.material.opacity = 0.3;
				
				//cameraControls.object.position.set(prevPosX, prevPosY, prevPosZ);
				//collider.position.set(prevPosX, prevPosY, prevPosZ);
				
				camera.translateZ( fVec.z * 0.1 );
				camera.position.y = 0.25;
				collider.position.set(camera.position.x, camera.position.y-0.1, camera.position.z);
				flashlight.position.set(camera.position.x,camera.position.y-0.1,camera.position.z);
				flashlight.target = box;
			} else {
				//var delta = clock.getDelta();
				//cameraControls.update(0.001);
			}
		}	
	}
	
	//checks if player is clicking a box to make it transparent
	function doMousedown(event) {
		if(inGame){
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
	
		if (enemyClick.length > 0 && collectableCount == 0) {
			scene.remove(enemy);
			document.getElementById("SuccessScreen").style.visibility = "visible";
		}
		
		//mouse is being held
		hold = true;
		}
	}
	
	//calculate shortest distance between centerpoint and rope line for collision
	//collision between where the player is looking, and the enemy's radius
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
			violin1.play();
			hit2.play();
			antsy = 300;
		}else{
			stareLength = 0;
			violin1.pause();
		}
		if(stareLength >= attackSpeed){
			enemy.translateOnAxis(enemy.worldToLocal(
				new THREE.Vector3(camera.position.x,camera.position.y-0.1,camera.position.z)
			).normalize(),0.03);
		}
	}
	
	//calculate shortest distance between centerpoint and rope line for collision
	//if the box is in the view of the player's lookat line
	function boxInView(theBox){
		var ptX = theBox.position.x;
		var ptY = theBox.position.y;
		var ptZ = theBox.position.z;
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
		
		if(leastDistance < theBox.radius){
			if(!(document.getElementById("progress").value <= 0)){
				theBox.material.transparent = true;
				theBox.material.opacity = 0.3;
			}else{
				theBox.material.opacity = 1;
			}
		} else {
			theBox.material.opacity = 1;
		}
	}
	
	//plays the dramatic sound based on the enemy's distance
	function playHit(){
		var pX = camera.position.x;
		var pY = camera.position.y;
		var pZ = camera.position.z;
		var eX = enemy.position.x;
		var eY = enemy.position.y;
		var eZ = enemy.position.z;
		
		var xDif = eX - pX;
		var yDif = eY - pY;
		var zDif = eZ - pZ;
		
		var theDistance = Math.sqrt((xDif*xDif)+(yDif*yDif)+(zDif*zDif));

		if(theDistance < 1){
			hit1.volume = 1;
		} else if(theDistance < 2){
			hit1.volume = 0.8;
		} else if(theDistance < 3){
			hit1.volume = 0.6;
		} else if(theDistance < 4){
			hit1.volume = 0.4;
		} else if(theDistance < 5){
			hit1.volume = 0.2;
		} else {
			hit1.volume = 0.1;
		}
		hit1.play();
	}
	
	//find if the player got killed by the enemy
	function findEnd(){
		var pX = camera.position.x;
		var pY = camera.position.y;
		var pZ = camera.position.z;
		var eX = enemy.position.x;
		var eY = enemy.position.y;
		var eZ = enemy.position.z;
		
		var xDif = eX - pX;
		var yDif = eY - pY;
		var zDif = eZ - pZ;
		
		var theDistance = Math.sqrt((xDif*xDif)+(yDif*yDif)+(zDif*zDif));

		if(theDistance < 0.1){
			destroyScene();
		}
	}
	
	//load the model
	function load(file,name){
		var dae;
		var loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.load( file, function ( collada ) {
			//dae = collada.scene;
			//dae.traverse( function ( child ) {
				//if( child instanceof THREE.SkinnedMesh ) {
					//var animation = new THREE.Animation( child, child.geometry.animation );
					//animation.play();
				//}
			//});
			//dae.scale.x = dae.scale.y = dae.scale.z = 0.15;
			//dae.position.y = -0.5;
			//dae.updateMatrix();
			//dae.name = name;
			//scene.add(dae)
			dae = collada.scene;
			dae.traverse( function(child){
				theMat = new THREE.MeshLambertMaterial({color: "black"});
				theMesh = new THREE.Mesh(
					child.geometry,
					theMat
				);
				
				
			
			});
			
			theMesh.scale.x = theMesh.scale.y = theMesh.scale.z = 0.15;
			theMesh.position.x = Math.random() * 12 - 6;
			theMesh.position.z = Math.random() * 12 - 6;
			theMesh.position.y = 0.5;
			theMesh.updateMatrix();
			theMesh.name = name;
			scene.add(theMesh);
			
		});
	}
	
	//remove everything from the scene
	function destroyScene(){
		inGame = false;
		document.getElementById("restart").style.visibility = "visible";
	}
	
	//reset everything
	function restart(){
		for(var i = 0; i < transMeshes.length; i ++){
			scene.remove(transMeshes[i]);
		}
		for(var i = 0; i < collectables.length; i++){
			scene.remove(collectables[i]);
		}
		transMeshes = [];
		collectables = [];
		collidableMeshes = [];
		scene.remove(enemy);
		scene.remove(box);
		scene.remove(room);
		scene.remove(collider);
		enemy = undefined;
		breathing.pause();
		footsteps.pause();
		violin1.pause();
		
		createModels();
		antsy = 300;
		attackSpeed = 150;
		collectableCount = 2;
		flashlight.distance = 6;
		flashlight.intensity = 0.9;
		inGame = true;
		document.getElementById("restart").style.visibility = "hidden";
		document.getElementById("count").innerHTML = collectableCount + "";
		document.getElementById("SuccessScreen").style.visibility = "hidden";
		document.getElementById("collectableText").innerHTML = "Find the hidden orbs by clicking the mouse to search boxes";
		breathing.play();
	}
	
	function win(){
		flashlight.distance = 30;
		document.getElementById("collectableText").innerHTML = "Go Get That Man!";
	}

	document.body.onload = setup;

}())