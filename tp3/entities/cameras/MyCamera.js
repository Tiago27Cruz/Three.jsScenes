
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyContents } from '../../MyContents.js';
import { MyEntity } from '../MyEntity.js';
import { State } from '../../MyGameState.js';

class MyCamera extends MyEntity{
    static Mode = {
        ThirdP: 0,
        FirstP: 1,
        Debug: 2
    }

    /**
       constructs a camera
       @param {MyContents} contents The contents of the game
    */
    constructor(contents){
        super(contents);
        this.controls = null;
        this.build();
        this.direction = new THREE.Vector3(0, 0, 0);
        this.distanceFromCamera = -this.entity.near-0.1;
    }

    /**
     * Builds the controls of the camera so it can look at different targets of the scene.
     */
    buildOrbitalControls(){
        this.controls = new OrbitControls(this.entity, this.contents.app.renderer.domElement);
        this.controls.target.set(0, 0, 0);
    }
    /**
     * Builds the camera and it's controls.
     */
    build(){
    
        const aspect = window.innerWidth / window.innerHeight;
        this.entity = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000);
        this.moveTo(60, 70, 60);
        this.buildOrbitalControls();

    }
    /**
     * Get the x and y offset on camera local space coordinates in order to offset an entity in that space.
     * @param {number} x - The x coordinate of the entity on the screen (0-1)
     * @param {number} y - The y coordinate of the entity on the screen (0-1)
     * @returns {THREE.Vector3} the vector which represents the position of the entity on the camera local space.
     */
    getCameraViewOffset(x, y){

        const fov = this.entity.fov * Math.PI/180;

        const frustumHeight = 2 * Math.tan(fov / 2) * Math.abs(this.distanceFromCamera);
        const frustumWidth = frustumHeight * this.entity.aspect;

        return new THREE.Vector3(-frustumWidth/2+x*frustumWidth, -frustumHeight/2+y*frustumHeight, this.distanceFromCamera);
    }

    /**
     * Removes an entity from the camera by identifying which meshes of the camera share the same id.
     * @param {MyEntity} entity - Entity of the scene.
     */
    removeEntity(entity){
        for(let index = 0; index < this.meshes.length; index++){
            const mesh = this.meshes[index];
            if(mesh.cameraID == entity.id){
                this.entity.remove(mesh);
                this.meshes.splice(index, 1);
                break;
            }
        }
    }
    /**
     * Adds an entity group, lod, light, mesh to the camera viewing space, also positions it accordingly.
     * @param {*} entity - The entity group, lod, light or mesh to add to the camera
     * @param {number} x - The x coordinate of the entity on the screen (0-1)
     * @param {number} y - The y coordinate of the entity on the screen (0-1) 
     */
    addEntity(entity, x, y){
        const offset = this.getCameraViewOffset(x, y);
        entity.position.set(offset.x, offset.y, offset.z);



        this.entity.add(entity);
        this.meshes.push(entity);
    }

    /**
     * Moves the entity in the camera space given it's new camera local space coordinates.
     * @param {MyEntity} entity - Entity of the scene.
     * @param {number} x - The new x coordinate of the entity on the screen (0-1)
     * @param {number} y - The new y coordinate of the entity on the screen (0-1)
     */
    moveEntityInCamera(entity, x, y){
        for(const mesh of this.meshes){
            if(mesh.cameraID == entity.id){
                const offset = this.getCameraViewOffset(x, y);
                mesh.position.set(offset.x, offset.y, offset.z);
                break;
            }
        }
    }

    
    /**
     * Renders the scene
     */
    render(){
        this.contents.app.renderFrame(this.entity);
        this.controls.update();
    }
    /**
     * Saves the current render frame on a render target so that it can be used by the camera display
     */
    saveFrame(){
        this.contents.app.saveFrame(this.entity);
    }

    /**
     * Updates the state of the camera according to the state of the game.
     * @param {State} state - The state of the game.
     */
    updateState(state){
        switch(state){
            case State.SETUP_HOME_MENU:{
                this.contents.game.eventHandler.connect(this, this.onResize, "resize");
                this.moveTo(0, 15, 20);
                this.lookAt(0, 15, 0);
                break;
            }
            case State.SETUP_PICK_BALLOON_USER:{
                this.moveTo(-12.5, 7, -2);
                this.lookAt(-12.5, 0, -12);
                break;
            }
            case State.SETUP_PICK_BALLOON_OPPONENT:{
                this.moveTo(12.5, 7, -2);
                this.lookAt(12.5, 0, -12);
                break;
            }
            case State.SETUP_PLAY_MENU:{
                this.moveTo(0, 15, 20);
                this.lookAt(0, 15, 0);
                break;
            }
            case State.SETUP_PICK_STARTING_POINT:{
                this.moveTo(-5, 5, -5);
                this.lookAt(0, 0, 0);
                break;
            }
            case State.SETUP_END_OF_RACE:{
                this.moveTo(0, 15, 30);
                this.lookAt(0, 15, 0);
                break;
            }
        }
        this.entity.getWorldDirection(this.direction);
    }

    /**
     * Handles on screen resizes.
     */
    onResize(){
        this.aspect = window.innerWidth / window.innerHeight;
        this.entity.updateProjectionMatrix();
        this.contents.app.onResize();
    }

    /**
     * Changes the target to look at the entitie's position
     * @param {THREE.Vector3} position - The position of the entity.
     */
    lookAtEntity(position){
        this.lookAt(position.x, position.y, position.z);
    }
    /**
     * Looks at a specific point in the scene.
     * @param {number} x - The x coordinate of the new point.
     * @param {number} y - The y coordinate of the new point.
     * @param {number} z - The z coordinate of the new point.
     */
    lookAt(x=null,y=null,z=null){
        if(x === null) x = this.controls.target.x;
        if(y === null) y = this.controls.target.y;
        if(z === null) z = this.controls.target.z;

        this.controls.target.set(x, y, z);
    }
    /**
     * increments the looking vector by amounts provided in argument.
     * @param {State} state - The state of the game.
     * @param {number} x - The x increment to be made.
     * @param {number} y - The y increment to be made.
     * @param {number} z - The z increment to be made.
     */
    look(x=0,y=0,z=0){
        this.controls.target.x += x;
        this.controls.target.y += y;
        this.controls.target.z += z;
    }



}

export { MyCamera };