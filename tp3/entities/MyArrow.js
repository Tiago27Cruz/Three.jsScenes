import * as THREE from 'three';
import { MyContents } from '../MyContents.js';
import { MyEntity } from './MyEntity.js';
import { State } from '../MyGameState.js';

class MyArrow extends MyEntity{
    static Type = {
        PICKING: 0,
        NORTH: 1,
        SOUTH: 2,
        EAST: 3,
        WEST: 4
    }

    static Y_OFFSET = 0.15;
    /**
       constructs an arrow
       @param {MyContents} contents The contents of the game
       @param {THREE.Color} color The color of the arrow.
       @param {MyArrow.Type} type The type of arrow.
    */
    constructor(contents, color, type){
        super(contents);
        this.color = color;
        this.type = type;
        this.build();
        this.direction = new THREE.Vector3(1, 0, 0);
        this.screenCoordinates = null;
    }
    /**
     * builds the arrow
     */
    build(){
        const geometry = new THREE.BoxGeometry(0.3, 1, 0.3);

        this.material = this.contents.materials.get('Phong').clone();

        
        for(let i = 0; i < 3; i++){
            this.addMesh(new THREE.Mesh(geometry, this.material))
        }
        
        this.meshes[0].scale.y = 1;

        this.meshes[1].scale.y = 0.5
        this.meshes[1].rotation.z = Math.PI/4;
        this.meshes[1].position.y -= 0.22;
        this.meshes[1].position.x -= 0.235;

        this.meshes[2].scale.y = 0.5
        this.meshes[2].rotation.z = -Math.PI/4;
        this.meshes[2].position.y -= 0.22;
        this.meshes[2].position.x += 0.235;

    }
    /**
     * Sets the color of the material of the arrow to the arrow color.
     */
    setColor(){
        this.material.color.set(this.color);
    }
    /**
     * Updates the state of the arrow according to the state of the game.
     * @param {State} state - The state of the game.
     */
    updateState(state){
        switch(state){
            case State.SETUP_RACE:{
                if(this.type != MyArrow.Type.PICKING) {
                    this.display(true);
                    this.setRotation();
                }
                break;
            }
            case State.RACE:{
                if(this.type != MyArrow.Type.PICKING) this.update();
                break;
            }
            case State.END_OF_RACE:{
                if(this.type != MyArrow.Type.PICKING){
                    this.display(false);
                }
                break;
            }
        }
    }
    /**
     * Sets the rotation of the arrow given its direction type, and obtains the screen camera coordinates to move it.
     */
    setRotation(){
        this.entity.scale.y = 0.03
        this.entity.scale.x = 0.03;
        this.entity.scale.z = 0.03;
        this.rotateTo(null, null, Math.PI/2);
        switch(this.type){
            case MyArrow.Type.SOUTH:{
                this.rotateTo(null, Math.PI);
                break;
            }
            case MyArrow.Type.EAST:{
                this.rotateTo(null, -Math.PI/2);
                break;
            }
            case MyArrow.Type.WEST:{
                this.rotateTo(null, Math.PI/2);
                break;
            }
        }
        this.screenCoordinates = new THREE.Vector2(0.05, 0.05 + this.type * MyArrow.Y_OFFSET);
    }

    /**
     * Updates the arrow in the racing state of the game
     */
    update(){
        this.updateEntityInCameraNoRotation(this.screenCoordinates.x, this.screenCoordinates.y);
        
    }

}

export { MyArrow };