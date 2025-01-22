import { MyContents } from '../MyContents.js';
import { MyArrow } from '../entities/MyArrow.js';
import { State } from '../MyGameState.js';

class MyPlayer{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(contents, color){
        this.contents = contents;
        this.color = color;
        this.balloon = null;
        this.lapsCompleted = 0;
        this.arrows = [];
        this.arrows.push(new MyArrow(this.contents, this.color, MyArrow.Type.PICKING));
    }

    clear(){
        if(this.balloon !== null) this.balloon.clearParticles();
        this.displayAllArrows(false);
        this.displayBalloon(false);
        this.lapsCompleted = 0;
    }

    updateState(state){
        switch(state){
            case State.SETUP_PICK_STARTING_POINT:{
                this.displayAllArrows(false);
                break;
            }
            case State.SETUP_RACE:{
                this.lapsCompleted = 0;
                this.balloon.updateState(state);
                break;
            }
            case State.RACE:{
                this.update(this.contents.game.delta_t);
                break;
            }
            case State.SETUP_END_OF_RACE:{
                this.balloon.clearParticles();
                break;
            }
            case State.RESET:{
                this.clear();
                break;
            }
            case State.RESTART:{
                this.restart();
                break;
            }
        }
    }

    set_balloon_shadow(shadow){
        if(this.balloon != null){
            this.balloon.shadow = shadow;
            this.balloon.shadow.shadowMaterial.color.set(this.color);
        }
    }

    displayBalloon(display){
        if(this.balloon != null){
            this.balloon.display(display);
        }
    }

    displayAllArrows(display = true){
        for(const arrow of this.arrows){
            arrow.display(display);
        }
    }

    updateArrows(){
        for(const arrow of this.arrows){
            arrow.updateState(this.contents.game.stateMachine.state);
        }
    }

    moveBalloonToStartingPoint(){
        if(this.balloon != null && this.balloon.shadow != null){
            this.balloon.moveToEntity(this.balloon.shadow.entity.position);
        }
    }

    completedLap(){
        const lapsCompleted = this.balloon.movedDistance / this.contents.game.map.track.pathLength;
        return Math.floor(lapsCompleted) > this.lapsCompleted;
    }

    hasWon(){
        return this.lapsCompleted >= 3;
    }


    /**
     * Resets laps completed to 0 so the player can play again
     */
    restart(){
        this.displayBalloon(false);
        this.balloon.timedOut = false;
        this.lapsCompleted = 0;
    }

    update(t){
        this.balloon.update(t);
        this.balloon.updateParticles(t);
    }


}

export { MyPlayer };