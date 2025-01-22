import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyEntity } from './MyEntity.js';

class MyShadow extends MyEntity{
    /**
       constructs a Shadow
       @param {MyContents} contents The contents of the game
       @param {number} width The width of the track
       @param {number} x The x position of the shadow.
       @param {number} y The y position of the shadow.
       @param {number} z The z position of the shadow.
    */
    constructor(contents, width, x = 0, y = 0, z = 0){
        super(contents)
        this.width = width;
        this.target = null;
        this.startingPoint = [x, y, z];
        this.build();
        this.moveTo(x, y, z);

    }
    /**
     * Moves the shadow to it's initial position, removes it from the scene, and removes the target that it's following and it's texture.
     */
    reset(){
        this.moveTo(this.startingPoint[0], this.startingPoint[1], this.startingPoint[2]);
        this.target = null;
        this.display(false);
        this.shadowMaterial.map = null;
    }

    /**
     * Restarts the shadow to go to it's initial position, and to set it's material color equal to it's color. Also clears the texture and the target associated to it.
     */
    restart(){
        this.moveTo(this.startingPoint[0], this.startingPoint[1], this.startingPoint[2]);
        this.shadowMaterial.map = null;
        this.shadowMaterial.color.set('#808080');
        this.shadowMaterial.needsUpdate = true;
        this.target = null;
    }
    /**
     * Gives the Shadow a target to follow and updates the shadow texture to the following target's texture.
     * @param {MyEntity} entity - Entity to follow.
     */
    setTarget(entity){
        this.target = entity;
        this.updateTexture();
    }
    /**
     * Updates the texture of the shadow to the same texture of the entity that it is following (only works for balloon entities)
     */
    updateTexture(){
        const name = this.target.name
        const textName = "balloons/" + name + "shadow.jpg"
        const texture = this.contents.loadTexture(textName);
        texture.rotation = -Math.PI/2;
        this.shadowMaterial.map = texture
        this.shadowMaterial.color.set('#ffffff');
        this.shadowMaterial.needsUpdate = true;
    }
    /**
     * Builds the shadow
     */
    build(){
        const shadowGeometry = new THREE.CircleGeometry(
            this.width/4
        );
        
        this.shadowMaterial = this.contents.materials.get('PhongDoubleSide').clone();
        this.shadowMaterial.color.set('#808080');

        this.addMesh(new THREE.Mesh(shadowGeometry, this.shadowMaterial));

        this.rotateTo(Math.PI/2);


    }
    /**
     * Updates the shadow to follow the target entity in the x and z coordinates but not the y coordinate.
     */
    update(){
        this.moveTo(this.target.entity.position.x, null, this.target.entity.position.z);
    }








}

export { MyShadow };