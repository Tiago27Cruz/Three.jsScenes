import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MyJsonLoader } from './MyJsonLoader.js';
/**
 *  This class contains the contents of out application
 */
class MyContents {

    /**
       constructs the object
       @param {MyApp} app The application object
    */
    constructor(app) {
        this.app = app
        this.axis = null

        //event variables
        this.keys = new Set();
        this.speed = 1;

        this.initMaps()

        this.reader = new MyFileReader(this.onSceneLoaded.bind(this));
        this.reader.open("scenes/prowrestling/prowrestling.json");

        this.up = new THREE.Vector3(0, 1, 0);
        this.direction = new THREE.Vector3();
    }
    /**
       initializes the maps to store the globals, textures and materials
    */
    initMaps(){
        this.globals = new Map()
        this.textures = new Map()
        this.materials = new Map()
    }

    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }
    }

    /**
     * Called when the scene JSON file load is completed
     * @param {Object} data with the entire scene object
     */
    onSceneLoaded(data) {
        console.info("YASF loaded.")
        this.onAfterSceneLoadedAndBeforeRender(data);
    }

    printEntities() {
        let count = 0;
        let meshes = 0;
        this.app.scene.traverse((child) => {
            count++;
            if (child instanceof THREE.Mesh) {
                meshes++;
            }
        });
        console.log('Total number of objects in the scene: ', count, ' meshes: ', meshes);
    }

    /**
       Reads the json file after scene is loaded but before it's rendered
       @param {JSON} data The json file's contents
    */
    onAfterSceneLoadedAndBeforeRender(data) {
        //Add the axis to the scene
        this.init()
        //try to load the json file, but dont wait for it
        let loader = new MyJsonLoader(this, this.app, data)
        loader.init().then(()=>{
            //free space from memory
            loader.textureLoader = null;
            //initialize the GUI
            this.app.gui.init()
            //this.printEntities()
            let wireframe = false;
            //add the activate wireframe checkbox to the GUI
            this.app.gui.datgui.addFolder('Activate Wireframe').add( { wireframe: wireframe }, 'wireframe').onChange((value) => {
                //iterate though every object in the graph and turn on it's wireframe changed value
                this.app.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.material.wireframe = value;
                    }
                });
            });
    
            let shadows = false;
            //add the activate shadow checkbox to the GUI
            this.app.gui.datgui.addFolder('Activate Shadows').add( { shadows: shadows }, 'shadows').onChange((value) => {
                //iterate through every object in the graph and turn it's cast shadow and receive shadow to the value changed
                this.app.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = value;
                        child.receiveShadow = value;
                    }
                });
            });
            //free no longer needed variables
            this.globals = null
            this.textures = null
            //initialize the render loop
            this.app.render()
        });
        //this.printTraverse()
        

    }
    /**
       updates the app. It's called every frame in order to manage camera controls
    */
    update() {
        
        if(this.keys.size > 0){
            //manages camera controls by using event handling to move around using wasd, space, shift, and the arrow keys.
            for(const key of this.keys){
                if(key == 'w') {
                    this.app.activeCamera.getWorldDirection(this.direction);
                    this.app.activeCamera.position.addScaledVector(this.direction, this.speed);
                    this.app.activeControl.target.addScaledVector(this.direction, this.speed);
                }
                else if(key == 's') {
                    this.app.activeCamera.getWorldDirection(this.direction);
                    this.app.activeCamera.position.addScaledVector(this.direction, -this.speed);
                    this.app.activeControl.target.addScaledVector(this.direction, -this.speed);
                }
                else if(key == 'a') {
                    this.app.activeCamera.getWorldDirection(this.direction);
                    this.direction.crossVectors(this.direction, this.up).normalize();
                    this.app.activeCamera.position.addScaledVector(this.direction, -this.speed);
                    this.app.activeControl.target.addScaledVector(this.direction, -this.speed);

                }
                else if(key == 'd') {
                    this.app.activeCamera.getWorldDirection(this.direction);
                    this.direction.crossVectors(this.direction, this.up).normalize();
                    this.app.activeCamera.position.addScaledVector(this.direction, this.speed);
                    this.app.activeControl.target.addScaledVector(this.direction, this.speed);
                }
                else if(key == ' '){
                    this.app.activeCamera.position.addScaledVector(this.up, this.speed);
                    this.app.activeControl.target.addScaledVector(this.up, this.speed)
                }
                else if(key == 'shift'){
                    this.app.activeCamera.position.addScaledVector(this.up, -this.speed);
                    this.app.activeControl.target.addScaledVector(this.up, -this.speed);
                }
                else if(key == 'arrowup') this.app.activeCamera.translateY(this.speed);
                else if(key == 'arrowdown') this.app.activeCamera.translateY(-this.speed);
                else if(key == 'arrowleft') this.app.activeCamera.translateX(-this.speed);
                else if(key == 'arrowright')this.app.activeCamera.translateX(this.speed);
            }

        }
    }
}

export { MyContents };
