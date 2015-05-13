"use strict"

var ENEMY = Object.freeze({
	enemyWidth: 1,
	enemyHeight: 1.5,
	enemyDepth: 1,
	enemyQuality: 1,
	radius: 2
});

function setUpEnemy(){
	var boxGeometry = new THREE.BoxGeometry(ENEMY.enemyWidth,ENEMY.enemyHeight,ENEMY.enemyDepth);
	var object = new THREE.Mesh(boxGeometry,new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture('images/ghost.jpg') } ) );
	object.position.x = Math.random() * 12 - 6;
	object.position.z = Math.random() * 12 - 6;
	object.receiveShadow = true;
	object.castShadow = true;
	return object;
}

function attack(obj){
	
}

var COLLECTABLE = Object.freeze({
	width: 0.5,
	height: 0.5,
	depth: 0.5,
	radius: 0.25
});

function setUpCollectable(position){
	var dodecaGeometry = new THREE.DodecahedronGeometry(COLLECTABLE.radius);
	var object = new THREE.Mesh(dodecaGeometry, new THREE.MeshLambertMaterial({color: Math.random() * 0xffffff }));
	object.position.set(position.x,position.y,position.z);
	object.material.wireframe = true;
	return object;
}
