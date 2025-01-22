
import * as THREE from 'three';
import { MyContents } from '../../MyContents.js';
import { MyCamera } from './MyCamera.js';
import { State } from '../../MyGameState.js';
import { MyEntity } from '../MyEntity.js';

class My3PCamera extends MyCamera{
    /**
       constructs a third person camera
       @param {MyContents} contents The contents of the game
       @param {number} speed Speed of the camera
    */
    constructor(contents, speed = 0.01){
        super(contents);
        this.followEntity = null;
        this.followDistance = null;
        this.movedDistance = null;
        this.speed = speed;
    }

    /**
     * Updates the state of the camera according to the state of the game.
     * @param {State} state - The state of the game.
     */
    updateState(state){
        switch(state){
            case State.SETUP_RACE:{
                this.setFollowEntity(this.contents.game.players[0].balloon, 10);
                break;
            }
            case State.RACE:{
                this.update();
                break;
            }
            case State.SETUP_END_OF_RACE:{
                const winnerPlayer = this.contents.game.getWinnerPlayer();
                this.moveToEntity(winnerPlayer.balloon.entity.position);
                this.move(-5);
                this.lookAtEntity(winnerPlayer.balloon.entity.position);
                break;
            }
        }
        super.updateState(state);
    }

    /**
     * Sets the camera to follow an entity of the scene
     * @param {MyEntity} followEntity - The entity on which to follow.
     * @param {number} followDistance The distance on which the camera stays behind the entity.
     */
    setFollowEntity(followEntity, followDistance){
        this.followEntity = followEntity;
        this.followDistance = followDistance
        this.movedDistance = -followDistance;
    }

    /**
     * Updates the position of the camera.
     */
    updatePosition(){
        const nextPoint = this.contents.game.map.track.getPointAt(this.movedDistance);
        this.moveToEntity(nextPoint);

        const followEntityMovedDistance = this.followEntity.movedDistance;
        if(followEntityMovedDistance > this.movedDistance+this.followDistance){
            this.movedDistance = Math.min(this.movedDistance+this.speed, followEntityMovedDistance-this.followDistance);
        }
        else if(followEntityMovedDistance < this.movedDistance+this.followDistance){
            this.movedDistance = Math.max(this.movedDistance-this.speed, followEntityMovedDistance-this.followDistance);
        }

        this.moveTo(null, this.followEntity.entity.position.y+5);

        
    }
    /**
     * Updates the camera during the racing state of the game.
     */
    update(){
        this.updatePosition();
        this.lookAtEntity(this.followEntity.entity.position);
    }





}

export { My3PCamera };