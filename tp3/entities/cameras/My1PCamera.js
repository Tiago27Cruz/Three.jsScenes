import { MyContents } from '../../MyContents.js';
import { MyCamera } from './MyCamera.js';
import { State } from '../../MyGameState.js';
import { MyEntity } from '../MyEntity.js';

class My1PCamera extends MyCamera{
    /**
       constructs a first person camera
       @param {MyContents} contents The contents of the game
       @param {number} speed The speed of the camera.
    */
    constructor(contents, speed = 0.01){
        super(contents);
        this.followEntity = null;
        this.followDistance = null;
        this.movedDistance = null;
        this.speed = speed;
    }

    /**
     * Updates the state of the Camera according to the state of the game.
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
        }
        super.updateState(state);
    }

    /**
     * Set the camera to follow an entity on the scene
     * @param {MyEntity} followEntity - The entity to follow.
     * @param {number} followDistance - The distance on which the camera looks ahead in the points of the track from the entity.
     */
    setFollowEntity(followEntity, followDistance = 1){
        this.followEntity = followEntity;
        this.followDistance = followDistance;
        this.movedDistance = followDistance;
    }

    /**
     * Updates the point on which the camera will look at.
     */
    updateLookAt(){
        const nextPoint = this.contents.game.map.track.getPointAt(this.movedDistance);
        this.lookAtEntity(nextPoint);

        const followEntityMovedDistance = this.followEntity.movedDistance;
        if(followEntityMovedDistance+this.followDistance > this.movedDistance){
            this.movedDistance = Math.min(this.movedDistance+this.speed, followEntityMovedDistance+this.followDistance);
        }
        else if(followEntityMovedDistance+this.followDistance < this.movedDistance){
            this.movedDistance = Math.max(this.movedDistance-this.speed, followEntityMovedDistance+this.followDistance);
        }

    }
    /**
     * Updates the camera during the race.
     */
    update(){
        this.moveToEntity(this.followEntity.entity.position);
        this.move(0, this.followEntity.offset1P);
        this.updateLookAt();

    }




}

export { My1PCamera };