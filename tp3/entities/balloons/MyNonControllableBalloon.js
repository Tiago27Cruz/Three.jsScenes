import * as THREE from 'three';
import { MyContents } from '../../MyContents.js';
import { MyBalloon } from './MyBalloon.js';
import { State } from '../../MyGameState.js';
import { Config } from '../../CONFIG.js';

class MyNonControllableBalloon extends MyBalloon{
    /**
       Constructs a Non Controllable Balloon.
       @param {MyContents} contents The contents of the game.
       @param {string} name The name of the balloon.
       @param {number} mass The mass of the balloon.
       @param {number} x The x position of the balloon.
       @param {number} y The y position of the balloon.
       @param {number} z The z position of the balloon.
    */
    constructor(contents, name, mass, x = 0, y = 0, z = 0){
        super(contents, name, mass, x, y, z, false);
        this.t = null;
    }

    
    /**
       Updates the balloon according to the state of the game.
       @param {State} state The state of the game.
    */
    updateState(state){
        switch(state){
            case State.SETUP_RACE:{
                this.animate();
                this.enableCollision(true);
                break;
            }
        }
        super.updateState(state);
    }


    
    /**
       Uses keyframe animation in order to make the balloon move across the track.
    */
    animate() {
        const getPoints = 28

        const startingPoint = this.contents.game.getOpponentStartingPoint();

        const path = this.contents.game.map.guidePath;
        const points = path.getPoints(getPoints);

        const numPoints = getPoints*3 + 3

        const totalPoints = [];
        for (let i = 0; i < 3; i++) {
            totalPoints.push(...points);
        }
        
        const newPos = new THREE.Vector3(startingPoint.entity.position.x, 1,startingPoint.entity.position.z);
        totalPoints.unshift(newPos); // start of game
        totalPoints.push(newPos);  // end the game

        const flatPoints = totalPoints.flatMap(point => [point.x, point.y, point.z]);
        const duration = Config.TIME_LIMIT

        const times = totalPoints.map((_, index) => index * (duration / numPoints));
        const positionKF = new THREE.VectorKeyframeTrack('.position', times, flatPoints, THREE.InterpolateSmooth);

        const positionClip = new THREE.AnimationClip('positionAnimation', duration, [positionKF]);
        this.mixer = new THREE.AnimationMixer(this.entity);

        const positionAction = this.mixer.clipAction(positionClip);
        positionAction.play();

    }
    /**
     * Updates the movement of the balloon by updating the animation with the time during the frames.
     */
    updateMovement(){
        this.mixer.update(this.t);
    }

    /**
     * Updates the balloon during the racing state
     * @param {number} t - Time passed in between frames.
     */
    update(t){
        this.t = t;
        super.update();
    }

    /**
     * Handles the collision of the balloon by adding it to the timed out list.
     */
    handleCollision(){
        this.contents.game.addTimedOutEntity(this);
    }

}

export { MyNonControllableBalloon };