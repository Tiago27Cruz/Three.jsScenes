import { MyContents } from '../MyContents.js';
import { MyPlayer } from './MyPlayer.js';
import { State } from '../MyGameState.js';

class MyNonControllablePlayer extends MyPlayer{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(contents, color){
        super(contents, color);
    }

    updateState(state){
        switch(state){
            case State.SETUP_PLAY_MENU:{
                if (this.balloon == null) {
                    this.balloon = this.contents.picker.pickedObj;
                    this.contents.maps[0].buildGuide(this.balloon.name);
                }
                this.balloon.moveTo(10.5, 14, 10);
                break;
            }
            case State.SETUP_RACE:{
                const sp = this.contents.game.getOpponentStartingPoint();
                this.set_balloon_shadow(sp);
                this.displayBalloon(true);
                this.moveBalloonToStartingPoint();
                break;
            }
            case State.SETUP_END_OF_RACE:{
                this.balloon.moveTo(10.5, 14, 10);
                break;
            }
        }
        super.updateState(state);
    }


    update(t){
        super.update(t);
        if(this.completedLap()){
            this.lapsCompleted++;
            console.log(this.lapsCompleted);
        }
    }

}

export { MyNonControllablePlayer };