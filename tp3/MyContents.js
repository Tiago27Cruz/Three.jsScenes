import * as THREE from 'three';
import { MyControllableBalloon } from './entities/balloons/MyControllableBalloon.js';
import { MyNonControllableBalloon } from './entities/balloons/MyNonControllableBalloon.js';
import { MyPicker } from './MyPicker.js';
import { MyAtmosphere } from './map/MyAtmosphere.js';
import { MySkybox } from './entities/background/MySkybox.js';
import { MyInformativeDisplay } from './entities/background/MyInformativeDisplay.js';
import { MyGame } from './MyGame.js';
import { MyRoute } from './map/MyRoute.js';
import { MyReader } from './map/MyReader.js';
import { MyFloor } from './entities/background/MyFloor.js';
import { MyScenario } from './entities/background/MyScenario.js';
import { My3PCamera } from './entities/cameras/My3PCamera.js';
import { My1PCamera } from './entities/cameras/My1PCamera.js';
import { MyDebugCamera } from './entities/cameras/MyDebugCamera.js';
import { MySpritesheetLoader } from './MySpritesheetLoader.js';
import { MyHomeMenu } from './entities/MyHomeMenu.js';
import { MyFinalMenu } from './entities/MyFinalMenu.js';
import { MyParticleEmitter } from './particles/MyParticleEmitter.js';
import { MyParticle } from './particles/MyParticle.js';
import { MyCameraDisplay } from './entities/background/MyCameraDisplay.js';
import { MyPlayMenu } from './entities/MyPlayMenu.js';
import { Config } from './CONFIG.js';



/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null
        //event variables
        this.speed = 1;

        this.routes = [];
        this.maps = [];
        this.cameras = [];
        this.displays = [];
        this.fireworks = null;

        this.up = new THREE.Vector3(0, 1, 0);
        this.direction = new THREE.Vector3();

        this.clock = new THREE.Clock();
        this.clock.start();

        this.entityCount = 0;

    }

    /**
     * Creates the materials that will be used and saves them in the materials map
     */
    buildMaterials(){
        this.materials.set('Phong', new THREE.MeshPhongMaterial({ color: "#ffffff", 
            specular: "#777777", emissive: "#000000", shininess: 30 }));
        this.materials.set('PhongDoubleSide', new THREE.MeshPhongMaterial({ color: "#ffffff", 
            specular: "#777777", emissive: "#000000", shininess: 30, side: THREE.DoubleSide }));
        this.materials.set('Basic', new THREE.MeshBasicMaterial({ color: "#ffffff" }));
    }

    /**
     * Loads a texture when given it's name. If it's already loaded, returns, otherwise it loads it
     */
    loadTexture(name){
        //if texture is already present in the map then return it
        if(this.textures.has(name)){
            return this.textures.get(name);
        }
        let texture = new THREE.TextureLoader().load('Textures/' + name);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;

        // Add the texture to the map
        this.textures.set(name, texture)

        return texture;

    }




    /**
     * Builds the scene
     */
    buildScene(){

        this.game = new MyGame(this);
        this.picker = new MyPicker(this);
        
        this.buildMaterials();
        this.buildBackground();
        this.buildRoutes()
        this.buildMaps();
        this.buildBalloons();
        
        this.buildFireworks();
        this.finalMenu = new MyFinalMenu(this);

        
    }

    buildBackground(){
        this.skybox = new MySkybox(this);
        this.skybox.display(true);

        const light = new THREE.DirectionalLight(0xffffff, 2);
        light.position.set(50, 50, -50);
        this.app.scene.add(light);

        this.homeMenu = new MyHomeMenu(this);
        
        this.playMenu = new MyPlayMenu(this);
        this.playMenu.display(false);

        const floor = new MyFloor(this)
        floor.display(true);

        this.scenario = new MyScenario(this);
        this.scenario.display(true);
        this.buildDisplays();


    }

    buildDisplays(){
        this.displays = [];
        this.displays.push(new MyInformativeDisplay(this));
        this.displays.push(new MyCameraDisplay(this));
    }

    buildBalloons(){
        this.plBalloons = [];
        this.plBalloons.push(new MyControllableBalloon(this,"mario", 1, -19, 0, -20));
        this.plBalloons.push(new MyControllableBalloon(this,"luigi", 0.5, -19, 0, -16));
        this.plBalloons.push(new MyControllableBalloon(this,"lego", 0.5, -19, 0, -12));
        this.plBalloons.push(new MyControllableBalloon(this,"rmysterio", 1, -19, 0, -8));

        this.opBalloons = [];
        this.opBalloons.push(new MyNonControllableBalloon(this,"mario", 1, 19, 0, -20));
        this.opBalloons.push(new MyNonControllableBalloon(this,"luigi", 0.5, 19, 0, -16));
        this.opBalloons.push(new MyNonControllableBalloon(this,"lego", 0.5, 19, 0, -12));
        this.opBalloons.push(new MyNonControllableBalloon(this,"rmysterio", 1, 19, 0, -8));
    }


    buildRoutes(){
        this.routes = [];
        for(const key in MyRoute.Name){
            this.routes.push(new MyRoute(MyRoute.Name[key]))
        }
    }

    buildMaps(){
        this.maps = [];
        this.maps.push(new MyReader(this, this.routes[MyRoute.Name.TRACK1],
                                     this.routes[MyRoute.Name.PROPS1], this.routes[MyRoute.Name.PROPS2],
                                      new MyAtmosphere([1.5, 1.5, 1.5, 1.5, 1.5], [0, Config.NORTH_WIND_SPEED, Config.SOUTH_WIND_SPEED, Config.EAST_WIND_SPEED, Config.WEST_WIND_SPEED])));
        // Could be changed if we had more maps
        this.game.map = this.maps[0];
    }

    buildCameras(){
        this.cameras = [new My3PCamera(this, 0.01), new My1PCamera(this, 0.01), new MyDebugCamera(this, 0.1)];
    }

    buildFireworks(){
        

        //FIRE
        //this.addParticleEmitter(new MyParticleEmitter(this.contents, 200, new THREE.Vector3(4, 3, 4), 60, 0.2, 1, 0xff6400, MyParticle.Type.FIRE));
        //BRANCHING
        //this.addParticleEmitter(new MyParticleEmitter(this.contents, 20, new THREE.Vector3(10, 10, 10), 60, 0.1, 1, 0xffff00, MyParticle.Type.BRANCHING_SPARK));
        //orange: 0xff6400
        //yellow: 0xffff00
        //this.particleEmitter = new MyParticleEmitter(this.contents, 20, new THREE.Vector3(10, 10, 10), 60, 0.1, 1, 0xffff00, MyParticle.Type.BRANCHING_SPARK);
        //this.particleEmitter = new MyParticleEmitter(this.contents, 200, new THREE.Vector3(4, 3, 4), 60, 0.2, 1, 0xff6400, MyParticle.Type.FIRE);
        //this.particleEmitter = new MyParticleEmitter(this.contents, 200, new THREE.Vector3(4, 3, 4), 60, 0.15, 1, 0xffffff, MyParticle.Type.SMOKE);
        //this.particleEmitter = new MyParticleEmitter(this.contents, 200, new THREE.Vector3(4, 3, 4), 60, 0.1, 1, 0x000000, MyParticle.Type.FOUNTAIN);
        const spark = new  MyParticleEmitter(this, 100, new THREE.Vector3(30, 30, 30), 60, 0.2, 1, null, MyParticle.Type.SPARK);
        this.fireworks = new MyParticleEmitter(this, 3, new THREE.Vector3(5, 5, 1), 60, 0.15, 1, 0xffffff, MyParticle.Type.FIREWORK, spark);
    }

    /**
     * initializes the contents
     */
    init() {
        //build Cameras
        this.buildCameras();
        // Create maps to store the materials and textures so they can be accessed easily later and avoid the need to create them again
        this.materials = new Map();
        this.textures = new Map();
        this.spritesheetLoader = new MySpritesheetLoader(this);

        // add an ambient light
        this.ambientLight = new THREE.AmbientLight( 0xffffff );
        this.ambientLight.intensity = 0.2;
        this.app.scene.add(this.ambientLight );

        
    }
    

}

export { MyContents };