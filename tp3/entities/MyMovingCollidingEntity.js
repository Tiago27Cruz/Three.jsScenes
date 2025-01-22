import * as THREE from 'three';
import { MyCollidingEntity } from './MyCollidingEntity.js';

class MyMovingCollidingEntity extends MyCollidingEntity{
    /**
     * Constructs a moving colliding entity
     * @param {MyContents} contents - The contents of the game.
     * @param {number} mass - The mass of the entity.
     * @param {boolean} enableCollision - If the entity is able to collide yet or not.
     */
    constructor(contents, mass, enableCollision){
        super(contents, mass, enableCollision);
        
        this.resultantForce = new THREE.Vector3(0, 0, 0);
        this.prev_position = new THREE.Vector3(0, 0, 0);
        

        this.windLayerIndex = null;
    }


    /**
     * Updates the previous position of the entity to the current position.
     */
    updatePreviousPosition(){
        this.prev_position.x = this.entity.position.x;
        this.prev_position.y = this.entity.position.y;
        this.prev_position.z = this.entity.position.z;
    }
    /**
     * Adds the wind force of the current wind layer to the resultant force.
     */
    applyWindForce() {
        const windLayer = this.contents.game.map.atmosphere.getLayer(this.windLayerIndex);
        if(windLayer != null){
            this.resultantForce.add(windLayer.getForce());
        }
    }
    /**
     * Updates the movement of the entity
     */
    updateMovement(){
        if(this.timedOut) return

        this.updatePreviousPosition();

        if(this.windLayerIndex != null){
            this.applyWindForce();
        }

        this.move(this.resultantForce.x, this.resultantForce.y, this.resultantForce.z);

        this.resultantForce.set(0, 0, 0);

        
    }
}

export { MyMovingCollidingEntity };