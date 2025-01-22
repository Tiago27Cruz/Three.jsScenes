import * as THREE from 'three';
import { MyContents } from '../../MyContents.js';
import { MyMovingCollidingEntity } from '../MyMovingCollidingEntity.js';
import { State } from '../../MyGameState.js';
import { MyParticleEmitter } from '../../particles/MyParticleEmitter.js';
import { MyParticle } from '../../particles/MyParticle.js';
import { Config } from '../../CONFIG.js';

class MyBalloon extends MyMovingCollidingEntity{
    static WindowPosition = {
        BACK: 0,
        MIDDLE: 1,
        FRONT: 2
    }

    /**
       Constructs a Balloon.
       @param {MyContents} contents The contents of the game.
       @param {string} name The name of the balloon.
       @param {number} mass The mass of the balloon.
       @param {number} x The x position of the balloon.
       @param {number} y The y position of the balloon.
       @param {number} z The z position of the balloon.
       @param {boolean} enableCollisions If the balloon should be collidable or not.
    */
    constructor(contents, name, mass, x = 0, y = 0, z = 0, enableCollisions = true){
        super(contents, mass, enableCollisions);
        this.name = name;
        this.shadow = null;
        this.build();
        this.timedOut = false;
        
        
        this.entity.position.set(x, y, z);
        this.positionWindow = null;
        this.movedDistance = null;
    }

    /**
       Build the materials for the balloon according to the texture that is associated with the name of the balloon.
    */
    buildBaseMaterial(){
        const map = this.contents.loadTexture("balloons/basket/color.jpg");
        const ao = this.contents.loadTexture("balloons/basket/ao.jpg");
        const bump = this.contents.loadTexture("balloons/basket/height.png");
        const normal = this.contents.loadTexture("balloons/basket/normal.png");
        const rough = this.contents.loadTexture("balloons/basket/rough.jpg");

        const material = this.contents.materials.get('PhongDoubleSide').clone();
        material.color.set('#eeeeee');
        material.map = map;
        material.aoMap = ao;
        material.normalMap = normal;
        material.bumpMap = bump;
        material.roughnessMap = rough;

        return material;
    }

    /**
       Builds the balloon.
    */
    build(){
        /**
         * Builds the base of the balloon, which is composed of 5 boxes
         */
        const buildBaseMesh = () =>{
            const baseMaterial = this.buildBaseMaterial();

            const width = 0.5;
            const height = 0.5;
            const planeGeometry = new THREE.BoxGeometry(
                width, height, 0.01
            );
    
            const startingIndex = this.meshes.length;
            for(let i = 0; i < 5; i++){
                this.addMesh(new THREE.Mesh( planeGeometry, baseMaterial));
                this.meshes[startingIndex+i].position.y += 0.25;
            }
    
            // Places each boxes in the correct position
            this.meshes[startingIndex].position.z+=0.25;
            this.meshes[startingIndex+1].position.z-=0.25;
            this.meshes[startingIndex+2].rotation.y = Math.PI/2;
            this.meshes[startingIndex+2].position.x-=0.25;
            this.meshes[startingIndex+3].rotation.y = Math.PI/2;
            this.meshes[startingIndex+3].position.x+=0.25;
            this.meshes[startingIndex+4].rotation.x = Math.PI/2;
            this.meshes[startingIndex+4].position.y-=0.25;

        }

        /**
         * Builds the top of the balloon, which is composed of a sphere and a cylinder
         */
        const buildTopMesh = () =>{
            const radius = 1;
            const sphereGeometry = new THREE.SphereGeometry(
                radius, 32, 32, 0, 2*Math.PI, 2*Math.PI + Math.PI/4
            );

            const texture = this.contents.loadTexture("balloons/" + this.name + ".jpg");
            texture.offset.set(0.5, 0.2);
            texture.repeat.set(2, 1);
            texture.rotation = Math.PI;
    
            this.sphereMaterial = this.contents.materials.get('Phong').clone();
            this.sphereMaterial.map = texture
            this.sphereMaterial.color.set('#ffffff');

    
            const sphereMesh = new THREE.Mesh(sphereGeometry, this.sphereMaterial);
            sphereMesh.rotation.x = Math.PI;
            sphereMesh.position.y += 2;

            this.height = radius*2+2;

            this.addMesh(sphereMesh);

            const cylinderGeometry = new THREE.CylinderGeometry(0.81*radius, 0.4*radius, 0.5, 32, 1, true);
            const cylinderMaterial = this.contents.materials.get('PhongDoubleSide').clone();
            cylinderMaterial.color.set('#ffffff');
            const cylTexture = texture.clone();
            cylTexture.wrapS = THREE.ClampToEdgeWrapping
            cylTexture.wrapT = THREE.ClampToEdgeWrapping
            cylTexture.offset.set(10, 10);
            cylinderMaterial.map = cylTexture;
            const cylinderMesh = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
            cylinderMesh.position.y += 1.161
            this.addMesh(cylinderMesh);
        }

        /**
         * Builds the connections between the base and bottom of the balloon
         */
        const buildBaseConnections = () =>{
            const height = 0.42
            const angle = Math.PI/50
            const radius = 0.005

            const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 16);

            const material = this.contents.materials.get('Phong').clone();
            material.color.set('#999999');
            
            const cylinderMesh = new THREE.Mesh(cylinderGeometry, material); // bottom left
            const cyl2 = cylinderMesh.clone(); // bottom right
            const cyl3 = cylinderMesh.clone(); // top left
            const cyl4 = cylinderMesh.clone(); // top right

            // bottom left
            cylinderMesh.rotation.x = angle;
            cylinderMesh.rotation.z = -angle;

            const xMove = 0.256 + radius * Math.cos(angle);
            const zMove = 0.256 + radius * Math.sin(angle);

            cylinderMesh.position.set(xMove, 0.5 + height/2, zMove);
            this.addMesh(cylinderMesh);

            // bottom right
            cyl2.rotation.x = -angle;
            cyl2.rotation.z = -angle;
            cyl2.position.set(xMove, 0.5 + height/2, -zMove);
            this.addMesh(cyl2);

            // top left
            cyl3.rotation.x = angle;
            cyl3.rotation.z = angle;
            cyl3.position.set(-xMove, 0.5 + height/2, zMove);
            this.addMesh(cyl3);

            // top right
            cyl4.rotation.x = -angle;
            cyl4.rotation.z = angle;
            cyl4.position.set(-xMove, 0.5 + height/2, -zMove);
            this.addMesh(cyl4);
        }

        /**
            Builds the Particle emitters of the balloon (fire and smoke)
        */
        const buildParticleEmitters = () =>{
            this.addParticleEmitter(new MyParticleEmitter(this.contents, 15, new THREE.Vector3(0, 0, 0), 60, 0.01, 1, 0xff6400, MyParticle.Type.FIRE));
            this.addParticleEmitter(new MyParticleEmitter(this.contents, 50, new THREE.Vector3(4, 3, 4), 60, 0.1, 1, 0xffffff, MyParticle.Type.SMOKE));
        }

        /**
            Builds an extra mesh for picking so that the user can click on the middle of the balloon and still pick it.
        */
        const buildPickingBoxMesh = () =>{
            const boxGeometry = new THREE.BoxGeometry(0.5, 1.25, 0.5);

            const boxMaterial = this.contents.materials.get('Phong').clone();
            boxMaterial.transparent = true;
            boxMaterial.opacity = 0;
            

            const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
            boxMesh.position.y += 0.6;
            this.addMesh(boxMesh);
        }

        /**
            Builds LOD of the balloon composed of a png sprite.
        */
        const buildSprite = () =>{
            const map = this.contents.loadTexture("balloons/" + this.name + "lod.png");
            map.transparent = true;
            const material = new THREE.SpriteMaterial({map: map});
            const sprite = new THREE.Sprite(material);
            sprite.position.y += 1.6;
            sprite.scale.set(3, 3.2, 2);
            this.createLod(sprite, Config.LOD_DISTANCE);
        }

        buildBaseMesh();
        buildTopMesh();
        buildBaseConnections();
        buildParticleEmitters();
        buildPickingBoxMesh();
        buildSprite();

    }

    /**
       Updates the balloon according to the game state
       @param {State} state - State of the game
    */
    updateState(state){
        switch(state){
            case State.SETUP_PICK_BALLOON_USER:{
                this.display(true);
                break;
            }
            case State.SETUP_PICK_STARTING_POINT:{
                this.enableCollision(false);
                break;
            }
            case State.SETUP_RACE:{
                this.positionWindow = [-1, 0, 1];
                this.movedDistance = 0;
                this.shadow.setTarget(this);
                this.particleEmitters[0].initFollowingEntity(this, new THREE.Vector3(0, 0.5, 0), true);
                break;
            }
        }
    }

    /**
       Updates the window position by a value, can be positive (moves forward) or negative (moves back)
       @param {number} value - value on which to increment or decrement the window position of the balloon.
    */
    changeWindowPosition(value){
        const prev_middle_position = this.positionWindow[MyBalloon.WindowPosition.MIDDLE];
        for(let index = MyBalloon.WindowPosition.BACK; index <= MyBalloon.WindowPosition.FRONT; index++){
            this.positionWindow[index] += value;
        }
        this.movedDistance += value*this.contents.game.map.track.getPoint(prev_middle_position).distanceTo(this.contents.game.map.track.getPoint(this.positionWindow[MyBalloon.WindowPosition.MIDDLE]));
    }

    /**
       Gets the window position index to which the balloon is closer to.
    */
    getNearestWindowPosition(){
        let nearestWindowPosition = -1;
        let nearestDistance = -1;
        for(let index = MyBalloon.WindowPosition.BACK; index <= MyBalloon.WindowPosition.FRONT; index++){
            let windowPosition = this.positionWindow[index];
            let windowPoint = this.contents.game.map.track.getPoint(windowPosition);
            let windowPointDistanceToBalloon = this.distanceTo(windowPoint);
            if(nearestDistance == -1 || windowPointDistanceToBalloon < nearestDistance){
                nearestDistance = windowPointDistanceToBalloon;
                nearestWindowPosition = index;
            }
        }
        return nearestWindowPosition;
    }


    /**
       Updates the window position of the balloon if it isn't closest to the middle position.
    */
    updatePositionWindow(){
        while(true){
            const nearestWindowPosition = this.getNearestWindowPosition();

            switch(nearestWindowPosition){
                case MyBalloon.WindowPosition.BACK:{
                    this.changeWindowPosition(-1);
                    break;
                }
                case MyBalloon.WindowPosition.MIDDLE:{
                    return;
                }
                case MyBalloon.WindowPosition.FRONT:{
                    this.changeWindowPosition(1);
                    break;
                }
                default:{
                }
            }
        }


        
    }

    /**
       Updates the balloon during the race.
       @param {number} t - Time between frames.
    */
    update(t){
        this.updateMovement();
        this.updatePositionWindow();
        super.update();
        this.shadow.update();
    }

}

export { MyBalloon };