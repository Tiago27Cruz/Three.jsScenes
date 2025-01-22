import * as THREE from 'three'
import { MyEntity } from "./MyEntity.js";
import { State } from "../MyGameState.js";

class MyPlayMenu extends MyEntity{
    constructor(contents){
        super(contents);
        this.build();
    }

    /**
     * Builds the play button
     */
    build(){
        const geometry = new THREE.PlaneGeometry(20, 8);
        const texture = this.contents.loadTexture("play.png");
        const material = new THREE.MeshBasicMaterial(); // basic material since we do not want this to be affected as light
        material.map = texture;
        const button = new THREE.Mesh(geometry, material);
        button.position.set(0, 17, 9);
        this.addMesh(button);
    }

    /**
     * Tells the menu how to act based on the state of the game
     * @param {State} state 
     */
    updateState(state){
        switch(state){
            case State.SETUP_PLAY_MENU:
                this.display(true)
                break;
            case State.SETUP_PICK_STARTING_POINT: // after the player decides to start playing the game we no longer need the play button
                this.display(false);
                break;
        }
    }
}

export { MyPlayMenu };