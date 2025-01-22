import * as THREE from 'three';
import { MyEntity } from './MyEntity.js';
import { State } from '../MyGameState.js';
import { MyEventHandler } from '../MyEventHandler.js';

class MyHomeMenu extends MyEntity{
    constructor(contents){
        super(contents);
        this.build();
        this.name = ""
        
    }

    /**
     * Connects the controls to the HomeMenu writeName function so the player can write his name.
     */
    connectControls(){
        this.contents.game.eventHandler.connectAllKeys(this, this.writeName, MyEventHandler.Type.onKeyDown);
    }

    /**
     * Build the visual representation of the HomeMenu
     */
    build(){
        const geometry = new THREE.PlaneGeometry(20, 5);
        const texture = this.contents.loadTexture("homemenu.jpg");
        const material = new THREE.MeshBasicMaterial();
        material.map = texture;
        const info = new THREE.Mesh(geometry, material);
        info.position.set(0, 17, 9);
        this.addMesh(info);
        
        const nameGeometry = new THREE.PlaneGeometry(20, 2);
        const nameMaterial = new THREE.MeshBasicMaterial({ color: 0xdddddd });
        this.mesh = new THREE.Mesh(nameGeometry, nameMaterial);
        this.mesh.position.set(0, 13, 9);
        this.addMesh(this.mesh);
        
    }

    /**
     * Updates the name of the player on the screen.
     * @param {*} letter 
     */
    writeName(letter){
        if(letter == "backspace"){
            if(this.name.length > 0){
                this.name = this.name.slice(0, -1);
                const last = this.meshes.pop();
                this.entity.remove(last);
            }
            return;
        } else if (letter == "enter"){
            return
        }
        if(this.name.length >= 11){
            return;
        }
        if (!this.isNumber(letter)){
            letter = letter.toUpperCase();
        }
        const mesh = this.contents.spritesheetLoader.getMesh(letter, 0.9);
        mesh.position.set(-3.5+ 0.5 * this.name.length, 13, 9.1);
        this.addMesh(mesh);
        this.name += letter;
    }

    /**
     * Clears the name of the player. To be used on resets.
     */
    clearName(){
        if (this.name.length > 0){
            for (let i = 0; i < this.name.length; i++){
                const last = this.meshes.pop();
                this.entity.remove(last);
            }
            this.name = ""
        }
    }

    /**
     * Checks if a given character is a number
     * @param {String} n 
     * @returns True if the character is a number, false otherwise.
     */
    isNumber(n){
        return n >= '0' && n <= '9';
    }

    /**
     * Disconnects the controls from the HomeMenu
     */
    disconnectControls(){
        this.contents.game.eventHandler.disconnectAllKeys(this);
    }

    /**
     * Tells the HomeMenu how to act depending on the state of the game.
     * @param {State} state 
     */
    updateState(state){
        switch(state){
            case State.SETUP_HOME_MENU:{
                this.connectControls();
                this.display(true);
                break;
            }
            case State.SETUP_PICK_BALLOON_USER:{
                this.display(false);
                this.disconnectControls();
                break;
            }
            case State.RESET:{
                this.clearName();
                break
            }
        }
    }
}

export { MyHomeMenu };