"use strict"

var ENEMY = Object.freeze({
	enemyWidth: 1,
	enemyHeight: 2,
	enemyDepth: 1,
	enemyQuality: 1
});

function setUpEnemy(){
	var boxGeometry = new THREE.BoxGeometry(ENEMY.enemyWidth,ENEMY.enemyHeight,ENEMY.enemyDepth);
	var object = new THREE.Mesh(boxGeometry,new THREE.MeshLambertMaterial( { map: THREE.ImageUtils.loadTexture('images/ghost.jpg') } ) );
	object.position.x = Math.random() * 15 - 5;
	object.position.z = Math.random() * 15 - 5;
	object.receiveShadow = true;
	object.castShadow = true;
	return object;
}