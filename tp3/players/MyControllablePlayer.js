import { MyContents } from '../MyContents.js';
import { MyPlayer } from './MyPlayer.js';
import { MyPowerup } from '../entities/MyPowerup.js';
import { MyInformativeDisplay } from '../entities/background/MyInformativeDisplay.js';
import { State } from '../MyGameState.js';
import { MyEventHandler } from '../MyEventHandler.js';
import { MyDisplay } from '../entities/background/MyDisplay.js';
import { MyArrow } from '../entities/MyArrow.js';
import { MyBalloon } from '../entities/balloons/MyBalloon.js';

class MyControllablePlayer extends MyPlayer{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(contents, color){
        super(contents, color);
        this.vouchers = 0;
        for(let arrowCount = MyArrow.Type.NORTH; arrowCount <= MyArrow.Type.WEST; arrowCount++){
            this.arrows.push(new MyArrow(this.contents, this.color, arrowCount));
        }
        this.guiBalloon = null;
    }

    clear(){
        super.clear();
        if (this.guiBalloon!==null) this.guiBalloon.removeFromCamera();
    }


    updateState(state){
        switch(state){
            case State.SETUP_PICK_BALLOON_OPPONENT:{
                this.balloon = this.contents.picker.pickedObj;
                this.guiBalloon = new MyBalloon(this.contents, this.balloon.name, 1, 0, 0, 0, false);
                break;
            }
            case State.SETUP_PLAY_MENU:{
                this.balloon.moveTo(-10.5, 14, 10);
                break;
            }
            case State.SETUP_RACE:{
                this.set_balloon_shadow(this.contents.picker.pickedObj);
                this.vouchers = 0;
                this.connectControls(true);
                this.updateArrows();
                this.setupGUiBalloon();
                break;
            }
            case State.SETUP_PAUSE:{
                this.connectControls(false);
                break;
            }
            case State.SETUP_UNPAUSE:{
                this.connectControls(true);
                break;
            }
            case State.SETUP_END_OF_RACE:{
                this.connectControls(false);
                this.balloon.moveTo(-10.5, 14, 10);
                this.updateArrows();
                this.guiBalloon.removeFromCamera();
                break;
            }
        }
        super.updateState(state);
        
    }

    setupGUiBalloon(){
        this.guiBalloon.entity.scale.x = 0.015;
        this.guiBalloon.entity.scale.y = 0.015;
        this.guiBalloon.entity.scale.z = 0.015;
        this.guiBalloon.addToCamera(0, 0);
    }

    connectControls(connect = true){
        if(connect){
            this.contents.game.eventHandler.connect(this, this.moveUp, 'w', MyEventHandler.Type.onKeyDown);
            this.contents.game.eventHandler.connect(this, this.moveDown, 's', MyEventHandler.Type.onKeyDown);
        }
        else{
            this.contents.game.eventHandler.disconnect(this, 'w');
            this.contents.game.eventHandler.disconnect(this, 's');
        }
    }

    moveUp(){
        this.balloon.changeLayer(1);
    }

    moveDown(){
        this.balloon.changeLayer(-1);
    }



    update(t){
        super.update(t);
        this.updateArrows();
        if(this.completedLap()){
            this.lapsCompleted++;
            this.contents.displays[MyDisplay.Type.INFORMATIVE].update(MyInformativeDisplay.Option.LAPS_COMPLETED, this.lapsCompleted);
        }
    }

    handleCollision(collidingObject){
        if (collidingObject instanceof MyPowerup){
            this.vouchers++;
            this.contents.displays[MyDisplay.Type.INFORMATIVE].update(MyInformativeDisplay.Option.VOUCHERS, this.vouchers);
            return
        }
        else if (this.vouchers > 0){
            this.vouchers--;
            this.contents.displays[MyDisplay.Type.INFORMATIVE].update(MyInformativeDisplay.Option.VOUCHERS, this.vouchers);
            return
        }

        this.balloon.handleCollision();
    }

}

export { MyControllablePlayer };