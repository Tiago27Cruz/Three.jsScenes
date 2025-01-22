import * as THREE from 'three';
import { MyContents } from './MyContents.js';
import { State } from './MyGameState.js';


class MyPicker{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
    */
    constructor(contents){
        this.contents = contents;

        this.raycaster = new THREE.Raycaster()
        this.raycaster.near = 1
        this.raycaster.far = 50
        this.raycaster.layers.enableAll();

        this.PickableObjIds = new Map();
        this.intersectableObjects = []
        this.pickedObj = null;
        this.prevPickedObj = null;

        this.contents.game.eventHandler.connect(this, this.handleIntersections, 'mouseclick');

        this.color = '#808080';
    }

    handleIntersections(){
        this.raycaster.setFromCamera(this.contents.game.eventHandler.mouse_pos, this.contents.game.activeCamera.entity);

        const intersects = this.raycaster.intersectObjects(this.intersectableObjects);

        this.prevPickedObj = this.pickedObj;
        if (intersects.length > 0) {
            const obj = intersects[0].object
            if (this.PickableObjIds.has(obj.name)) {
                this.pickedObj = this.PickableObjIds.get(obj.name);
            }
            else{
                this.pickedObj = null;
            }
                
        } else {
            this.pickedObj = null;
        }

        this.updateState(this.contents.game.stateMachine.state);
    }


    /**
     * Unpicks the balloon
     * @param {} playerArrow 
     */
    unpickBalloon(playerArrow){
        if(this.prevPickedObj !== null){
            playerArrow.display(false); 
        }
    }

    /**
     * Unpicks the starting point
     */
    unpickStartingPoint(){
        if(this.prevPickedObj !== null){
            this.prevPickedObj.shadowMaterial.color.set('#808080');
            this.contents.game.players[0].balloon.display(false);
        }
    }

    /**
     * Handles the picking of the balloon
     * @param {*} playerArrow 
     */
    pickBalloon(playerArrow){
        if(this.pickedObj !== null){
            playerArrow.display(true);
            playerArrow.setColor();
            playerArrow.moveToEntity(this.pickedObj.entity.position);
            playerArrow.move(0, this.pickedObj.height)
        }
    }

    /**
     * Handles the picking of the starting point
     */
    pickStartingPoint(){
        if(this.pickedObj !== null){
            this.pickedObj.shadowMaterial.color.set(this.color);
            this.contents.game.players[0].balloon.display(true);
            this.contents.game.players[0].balloon.moveToEntity(this.pickedObj.entity.position);
        }
    }

    /**
     * Handles the picking of the play menu
     */
    pickPlayMenu(){
        if(this.pickedObj !== null){
            this.contents.game.stateMachine.state = State.SETUP_PICK_STARTING_POINT;
        }
    }

    /**
     * Handles the picking of the final menu
     */
    pickFinalMenu(){
        if(this.pickedObj !== null){
            if(this.pickedObj === this.contents.finalMenu.playAgainMesh){
                this.contents.game.stateMachine.state = State.RESTART
            }
            else if(this.pickedObj === this.contents.finalMenu.homeMesh){
                this.contents.game.stateMachine.state = State.RESET
            }
            this.clear();
        }

    }

    /**
     * Enables the picking of an entity. If meshes are not provided, the entity itself will be picked (THREE.Group).
     * @param {Entity} entity
     * @param {Array<THREE.Mesh>} meshes
     */
    enablePicking(entity, meshes = null){
        if(meshes == null){
            this.intersectableObjects.push(entity.entity);
        }
        else{
            for(const mesh of meshes){
                this.intersectableObjects.push(mesh);
            }
        }
        this.PickableObjIds.set(entity.id, entity);
    }

    /**
     * Enables the picking of a mesh
     * @param {THREE.Mesh} mesh 
     */
    enableMeshPicking(mesh){
        this.intersectableObjects.push(mesh);
        this.PickableObjIds.set(mesh.name, mesh);
    }

    /**
     * Tells the picker how to act depending on the state of the game
     * @param {State} state 
     */
    updateState(state){
        switch(state){
            case State.SETUP_HOME_MENU:{
                this.clear();
                break;
            }
            case State.SETUP_PICK_BALLOON_USER:{
                this.clear();
                this.color = this.contents.game.players[0].color;
                for(const balloon of this.contents.plBalloons){
                    this.enablePicking(balloon, balloon.meshes);
                }
            }
            case State.PICK_BALLOON_USER:{
                this.unpickBalloon(this.contents.game.players[0].arrows[0]);
                this.pickBalloon(this.contents.game.players[0].arrows[0]);
                break;
            }
            case State.SETUP_PICK_BALLOON_OPPONENT:{
                this.clear();
                this.color = this.contents.game.players[1].color;
                for(const balloon of this.contents.opBalloons){
                    this.enablePicking(balloon, balloon.meshes);
                }
                break;
            }
            case State.PICK_BALLOON_OPPONENT:{
                this.unpickBalloon(this.contents.game.players[1].arrows[0]);
                this.pickBalloon(this.contents.game.players[1].arrows[0]);
                break;
            }
            case State.SETUP_PLAY_MENU:{
                this.clear()
                this.enablePicking(this.contents.playMenu)
                break;
            }
            case State.PLAY_MENU:{
                this.pickPlayMenu();
                break;
            }
            case State.SETUP_PICK_STARTING_POINT:{
                this.clear();
                this.enablePicking(this.contents.game.map.track.spA);
                this.enablePicking(this.contents.game.map.track.spB);
                break;
            }
            case State.PICK_STARTING_POINT:{
                this.unpickStartingPoint();
                this.pickStartingPoint();
                break;
            }
            case State.SETUP_RACE:{
                this.clear();
                break;
            }
            case State.SETUP_END_OF_RACE:{
                this.contents.game.eventHandler.connect(this, this.handleIntersections, 'mouseclick');
                this.enableMeshPicking(this.contents.finalMenu.playAgainMesh);
                this.enableMeshPicking(this.contents.finalMenu.homeMesh);
            }
            case State.END_OF_RACE:{
                this.pickFinalMenu();
                break;
            }
        }
    }

    /**
     * Clears the picker variables so that it can be used again.
     */
    clear(){
        this.pickedObj = null;
        this.prevPickedObj = null;
        this.intersectableObjects = [];
        this.PickableObjIds.clear();
    }


}

export { MyPicker };