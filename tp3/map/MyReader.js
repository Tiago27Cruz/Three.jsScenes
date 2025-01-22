import * as THREE from 'three';
import { MyTrack } from '../entities/MyTrack.js';
import { MyObstacle } from '../entities/MyObstacle.js';
import { MyPowerup } from '../entities/MyPowerup.js';
import { State } from '../MyGameState.js';
import { Config } from '../CONFIG.js';
import { MyRoute } from './MyRoute.js';
import { MyContents } from '../MyContents.js';
import { MyAtmosphere } from './MyAtmosphere.js';

class MyReader {
    /**
     * Constructs the reader of the map.
     * @param {MyContents} contents - Contents of the game.
     * @param {MyRoute} trackRoute - Route of the track.
     * @param {MyRoute} obstacleRoute - Route of the obstacles.
     * @param {MyRoute} powerupRoute - Route of the powerups.
     * @param {MyAtmosphere} atmosphere - The atmosphere of the map.
     */
    constructor(contents, trackRoute, obstacleRoute, powerupRoute, atmosphere){
        this.contents = contents;
        this.atmosphere = atmosphere;

        this.guideInScene = false;
        this.obstaclesInScene = false;
        this.powerupsInScene = false;

        this.track = null;
        this.guide = new THREE.Group();
        this.obstacles = []
        this.powerups =  []


        this.buildTrack(trackRoute);
        // this.buildGuide(guideRoute);
        this.buildObstacles(obstacleRoute);
        this.buildPowerups(powerupRoute);

        this.displayAll(true);
    }
    /**
     * Updates the state of the map given the state of the game.
     * @param {State} state - Current state of the game.
     */
    updateState(state){
        switch(state){
            case State.SETUP_PICK_STARTING_POINT:{
                this.track.displayStartingPoints(true);
                break;
            }
            case State.SETUP_RACE:{
                break;
            }
            case State.RESET:{
                this.track.resetSPs();
                break;
            }
            case State.RESTART:{
                this.track.restartSPs();
                break;
            }
        }
    }
    /**
     * Builds the track given a route
     * @param {MyRoute} route - Route of points of the track.
     */
    buildTrack(route){
        this.track = new MyTrack(this.contents, "basicTrack", route.points, 160, Config.TRACK_WIDTH, 3, 3);
    }
    /**
     * Builds the guide given a name of a route.
     * @param {text} name - Name of the route.
     */
    buildGuide(name){
        let route;
        switch(name){
            case "mario":{
                route = this.contents.routes[MyRoute.Name.MARIO];
                break;
            }
            case "luigi":{
                route = this.contents.routes[MyRoute.Name.LUIGI];
                break;
            }
            case "lego":{
                route = this.contents.routes[MyRoute.Name.LEGO];
                break;
            }
            case "rmysterio":{
                route = this.contents.routes[MyRoute.Name.RMYSTERIO];
                break;
            }
        }

        if(this.sphere === undefined){
            let sphere = new THREE.SphereGeometry(0.3);
            const material = new THREE.MeshBasicMaterial({color: 0xff0000});
            this.sphere = new THREE.Mesh(sphere, material);
        }

        this.guidePath = new THREE.CatmullRomCurve3(route.points);
        
        for (let i = 0; i < route.points.length; i++){
            let sphere = this.sphere.clone();
            sphere.position.set(route.points[i].x, route.points[i].y, route.points[i].z);
            this.guide.add(sphere);
        }
    }
    /**
     * Builds the obstacles given a route
     * @param {MyRoute} route - Route of points of the obstacles.
     */
    buildObstacles(route){
        for (let obstaclePoint of route.points){
            const obstacle = new MyObstacle(this.contents, obstaclePoint.x, this.atmosphere.layers[obstaclePoint.y].getCenter(), obstaclePoint.z, 0.5, 0.5, 0.5);
            this.obstacles.push(obstacle);
        }
    }
    /**
     * Builds the powerups given a route.
     * @param {MyRoute} route - Route of points of the powerups.
     */
    buildPowerups(route){
        for (let powerupPoint of route.points){
            const powerup = new MyPowerup(this.contents, powerupPoint.x, this.atmosphere.layers[powerupPoint.y].getCenter(), powerupPoint.z, 0.5, 0.5, 0.5);
            this.powerups.push(powerup);
        }
    }
    /**
     * Adds or removes the track in the scene
     * @param {boolean} display - If true then adds the track to the scene, if false then it removes it from the scene.
     */
    displayTrack(display){
        this.track.display(display);
    }
    /**
     * Adds or removes the guide in the scene
     * @param {boolean} display - If true then adds the guide to the scene, if false then it removes it from the scene.
     */
    displayGuide(display){
        if(display && !this.guideInScene){
            this.contents.app.scene.add(this.guide);
            this.guideInScene = true;
        }
        else if(!display && this.guideInScene){
            this.contents.app.scene.remove(this.guide);
            this.guideInScene = false;
        }
    }
    /**
     * Adds or removes the obstacles in the scene
     * @param {boolean} display - If true then adds the obstacles to the scene, if false then it removes it from the scene.
     */
    displayObstacles(display){
        if(display && !this.obstaclesInScene){
            for (let obstacle of this.obstacles){
                obstacle.display(true);
            }
            this.obstaclesInScene = true;
        }
        else if(!display && this.obstaclesInScene){
            for (let obstacle of this.obstacles){
                obstacle.display(false);
            }
            this.obstaclesInScene = false;
        }
    }
    /**
     * Adds or removes the powerups in the scene
     * @param {boolean} display - If true then adds the powerups to the scene, if false then it removes it from the scene.
     */
    displayPowerups(display){
        if(display && !this.powerupsInScene){
            for (let powerup of this.powerups){
                powerup.display(true);
            }
            this.powerupsInScene = true;
        }
        else if(!display && this.powerupsInScene){
            for (let powerup of this.powerups){
                powerup.display(false);
            }
            this.powerupsInScene = false;
        }
    }
    /**
     * Adds or removes the the map in the scene except the guide.
     * @param {boolean} display - If true then adds the map to the scene, if false then it removes it from the scene.
     */
    displayAll(display){
        this.displayTrack(display);
        // this.displayGuide(display); 
        this.displayObstacles(display);
        this.displayPowerups(display);
    }

}

export { MyReader };