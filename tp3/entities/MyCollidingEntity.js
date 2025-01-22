import * as THREE from 'three';
import { MyEntity } from "./MyEntity.js";
import { MyContents } from '../MyContents.js';

class MyCollidingEntity extends MyEntity{
    /**
     * Constructs a colliding entity.
     * @param {MyContents} contents - The contents of the game
     * @param {number} mass The mass of the entity
     * @param {boolean} enableCollision If the entity currently should be able to collide or not.
     */
    constructor(contents, mass, enableCollision){
        super(contents);
        
        this.mass = mass;
        
        this.hitboxes = [];


        if(enableCollision) this.enableCollision(true);
    }
    /**
     * Adds a mesh to the entity but also adds hitboxes. A sphere hitbox if it's a spherical mesh or a Box hitbox if it's a non spherical mesh.
     * @param {THREE.Mesh} mesh - The mesh to add.
     */
    addMesh(mesh){
        super.addMesh(mesh);
        if(mesh.geometry instanceof THREE.SphereGeometry){
            mesh.geometry.computeBoundingSphere();
            const sphere = new THREE.Sphere(mesh.geometry.boundingSphere.center.clone(),  mesh.geometry.boundingSphere.radius);
            this.hitboxes.push(sphere);
        }
        else{
            const box = new THREE.Box3().setFromObject(mesh);
            this.hitboxes.push(box);
        }
    }
    /**
     * Updates entity to move it's hitboxes along with the corresponding meshes transformations.
     */
    update(){
        for(let index = 0; index < this.hitboxes.length; index++){
            const mesh = this.meshes[index];
            if(mesh.geometry instanceof THREE.SphereGeometry) {
                this.hitboxes[index].copy(mesh.geometry.boundingSphere).applyMatrix4(mesh.matrixWorld);
            }
            else this.hitboxes[index].copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
        }
    }
    /**
     * Adds the entity to the collidingEntities list of the game or removes the entity from it.
     * @param {boolean} enable - Add to colliding entities or remove from it.
     */
    enableCollision(enable = true){
        if(enable && !this.contents.game.collidingEntities.has(this.id)){
            this.contents.game.collidingEntities.set(this.id, this);
        }
        else if(!enable && this.contents.game.collidingEntities.has(this.id)){
            this.contents.game.collidingEntities.delete(this.id);
        }
    }
    /**
     * Abstract collision handler for children of this class when they collide with a collidable entity.
     */
    handleCollision(){

    }
    /**
     * Displays the entity and adds it to the collidingEntities list.
     */
    reAddObject(){
        this.display(true)
        this.enableCollision(true);
    }
}

export { MyCollidingEntity };