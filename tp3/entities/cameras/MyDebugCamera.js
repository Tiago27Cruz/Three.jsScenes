
import * as THREE from 'three';
import { MyContents } from '../../MyContents.js';
import { MyCamera } from './MyCamera.js';
import { MyEventHandler } from '../../MyEventHandler.js';
import { State } from '../../MyGameState.js';

class MyDebugCamera extends MyCamera{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the game
       @param {number} speed The speed of the camera
    */
    constructor(contents, speed = 0.01){
        super(contents);
        this.speed = speed;

        this.up = new THREE.Vector3(0, 1, 0);
    }
    /**
     * Updates the state of the camera according to the state of the game.
     * @param {State} state - The state of the game.
     */
    updateState(state){
        switch(state){
            case State.SETUP_HOME_MENU:{
                this.connectControls();
                break;
            }
        }

        super.updateState(state);
    }
    /**
     * Connects the camera controls so that they can be handled.
     * @param {boolean} connect - true if they are to be connected and false if they are to be disconnected.
     */
    connectControls(connect = true){
        if(connect){
            this.contents.game.eventHandler.connect(this, this.moveFront, "t", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.moveBack, "g", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.moveLeft, "f", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.moveRight, "h", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.moveUp, "capslock", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.moveDown, "shift", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.rotateUp, "arrowup", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.rotateDown, "arrowdown", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.rotateLeft, "arrowleft", MyEventHandler.Type.whileHeldDown);
            this.contents.game.eventHandler.connect(this, this.rotateRight, "arrowright", MyEventHandler.Type.whileHeldDown);
        }
        else{
            this.contents.game.eventHandler.disconnect(this, "t");
            this.contents.game.eventHandler.disconnect(this, "f");
            this.contents.game.eventHandler.disconnect(this, "g");
            this.contents.game.eventHandler.disconnect(this, "h");
            this.contents.game.eventHandler.disconnect(this, "capslock");
            this.contents.game.eventHandler.disconnect(this, "shift");
            this.contents.game.eventHandler.disconnect(this, "arrowup");
            this.contents.game.eventHandler.disconnect(this, "arrowdown");
            this.contents.game.eventHandler.disconnect(this, "arrowleft");
            this.contents.game.eventHandler.disconnect(this, "arrowright");
        }
    }
    /**
     * Move to the front by pressing t
     */
    moveFront(){
        this.entity.position.addScaledVector(this.direction, this.speed);
        this.controls.target.addScaledVector(this.direction, this.speed);
    }
    /**
     * Moves to the back by pressing g
     */
    moveBack(){
        this.entity.position.addScaledVector(this.direction, -this.speed);
        this.controls.target.addScaledVector(this.direction, -this.speed);
    }
    /**
     * Moves to the left by pressing f
     */
    moveLeft(){
        const leftVector = new THREE.Vector3(0, 0, 0);
        leftVector.crossVectors(this.direction, this.up).normalize();
        this.entity.position.addScaledVector(leftVector, -this.speed);
        this.controls.target.addScaledVector(leftVector, -this.speed);
    }
    /**
     * Moves to the right by pressing h
     */
    moveRight(){
        const rightVector = new THREE.Vector3(0, 0, 0);
        rightVector.crossVectors(this.direction, this.up).normalize();
        this.entity.position.addScaledVector(rightVector, this.speed);
        this.controls.target.addScaledVector(rightVector, this.speed);
    }
    /**
     * Moves up by pressing capslock
     */
    moveUp(){
        this.entity.position.addScaledVector(this.up, this.speed);
        this.controls.target.addScaledVector(this.up, this.speed);
    }
    /**
     * moves down by pressing shift
     */
    moveDown(){
        this.entity.position.addScaledVector(this.up, -this.speed);
        this.controls.target.addScaledVector(this.up, -this.speed);
    }
    /**
     * rotates up by pressing the arrow key up
     */
    rotateUp(){
        this.entity.translateY(this.speed);
    }
    /**
     * rotates down by pressing the arrow key down.
     */
    rotateDown(){
        this.entity.translateY(-this.speed)
    }
    /**
     * rotates left by pressing the arrow key left
     */
    rotateLeft(){
        this.entity.translateX(-this.speed)
    }
    /**
     * rotates right by pressing the arrow key right
     */
    rotateRight(){
        this.entity.translateX(this.speed)
    }







}

export { MyDebugCamera };