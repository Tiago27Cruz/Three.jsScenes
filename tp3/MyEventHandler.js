import * as THREE from 'three';
import { State } from './MyGameState.js';



class MyEventHandler{

    static Type = {
        onKeyDown: 0,
        onKeyUp: 1,
        whileHeldDown: 2,
    }

    constructor(game){
        this.game = game;
        this.pressableKeys = new Set();
        this.deletedKeys = new Set();
        this.pressedKeys = new Map();
        this.connections = new Map();
        this.mouse_pos = new THREE.Vector2();
    }

    /**
     * Function to fill the pressable keys for the menu. Adds enter, backspace, empty space, numbers and the alphabet.
     */
    fillPressableKeysMenu(){
        const pressableKeys = ['enter', ' ', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'backspace'
        ];
        for(const key of pressableKeys){
            this.pressableKeys.add(key);
        }
    }
    
    fillPressableKeysGame(){
        const pressableKeys = ['w', 's', 't', 'f', 'g', 'h', 'shift', ' ', 'enter', 'escape', '1', '3', '0', 'arrowup', 'arrowleft', 'arrowright', 'arrowdown', 'capslock'];
        for(const key of pressableKeys){
            this.pressableKeys.add(key);
        }
    }

    changeToHomeMenuKeys(){
        this.pressableKeys.clear();
        this.fillPressableKeysMenu();
    }

    /**
     * Changes the pressable keys from the menu to the game keys.
     */
    changeToGameKeys(){
        this.pressableKeys.clear();
        this.fillPressableKeysGame();
    }

    onResize(){
        this.deletedKeys.add('resize');
        //this.contents.game.activeCamera.onResize();
    }

    onMouseClick(event){
        this.mouse_pos.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse_pos.y = -(event.clientY / window.innerHeight) * 2 + 1;
        this.deletedKeys.add('mouseclick');
        //this.contents.picker.handleIntersections()
    }

    onKeyDown(event){
        const key = event.key.toLowerCase();
        this.addKey(key);
    }

    onKeyUp(event){
        const key = event.key.toLowerCase();
        this.deleteKey(key);
    }

    addKey(key){
        if(!this.isKeyPressed(key) && this.pressableKeys.has(key)){
            this.pressedKeys.set(key, 0);
        }
    }

    deleteKey(key){
        if(this.isKeyPressed(key)){
            this.pressedKeys.delete(key);
            this.deletedKeys.add(key);
        }
    }

    isKeyPressed(key){
        return this.pressedKeys.has(key)
    }

    connect(entity, func, key, type = MyEventHandler.Type.onKeyUp){
        if(this.connections.has(key)){
            const keyConnections = this.connections.get(key);
            keyConnections.push([entity, type, func.bind(entity)]);
            this.connections.set(key, keyConnections);
        }
        else{
            this.connections.set(key, [[entity, type, func.bind(entity)]]);
        }
    }

    connectAllKeys(entity, func, type = MyEventHandler.Type.onKeyDown){
        for(const key of this.pressableKeys){
            this.connect(entity, func, key, type);
        }
    }

    disconnectAllKeys(entity){
        for(const key of this.pressableKeys){
            this.disconnect(entity, key);
        }
    }

    disconnect(entity, key){
        if(this.connections.has(key)){
            const keyConnections = this.connections.get(key);
            for(let index = 0; index < keyConnections.length; index++){
                const [connectedEntity, type, func] = keyConnections[index];
                if(entity == connectedEntity){
                    keyConnections.splice(index, 1);
                    break;
                }
            }
            this.connections.set(key, keyConnections);
        }
    }

    dispatchKey(key, timesPressed){
        if(this.connections.has(key)){
            const keyConnections = this.connections.get(key);
            for(const [entity, type, func] of keyConnections){
                switch(type){
                    case MyEventHandler.Type.onKeyDown:{
                        if(timesPressed == 0) func(key);
                        break;
                    }
                    case MyEventHandler.Type.onKeyUp:{
                        if(timesPressed == -1) func(key);
                        break;
                    }
                    case MyEventHandler.Type.whileHeldDown:{
                        if(timesPressed != -1) func(key);
                        break;
                    }
                }
            }
        }
    }

    update(){
        for(const key of this.deletedKeys){
            this.dispatchKey(key, -1);
            this.deletedKeys.delete(key);
        }
        for(const [key, timesPressed] of this.pressedKeys.entries()){
            this.dispatchKey(key, timesPressed);
            this.pressedKeys.set(key, timesPressed+1);
        }
    }

    /**
     * Updates how the event handler should behave in a certain state.
     * @param {State} state 
     */
    updateState(state){
        switch(state){
            case State.SETUP_HOME_MENU:
                this.changeToHomeMenuKeys();
                break;
            case State.SETUP_PICK_BALLOON_USER:
                this.changeToGameKeys();
                break;
            default:
                console.warn("Missing state in MyEventHandler.updateState: ", state);
        }
    }


    

}

export { MyEventHandler };