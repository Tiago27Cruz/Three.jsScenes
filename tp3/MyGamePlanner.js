import * as THREE from 'three';
import { MyContents } from './MyContents.js';
import { MyEventHandler } from './MyEventHandler.js';
import { State } from './MyGameState.js';
import { MyControllablePlayer } from './players/MyControllablePlayer.js';
import { MyNonControllablePlayer } from './players/MyNonControllablePlayer.js';
import { MyCamera } from './entities/cameras/MyCamera.js';
import { MyGame } from './MyGame.js';
import { MyDebugCamera } from './entities/cameras/MyDebugCamera.js';



class MyGamePlanner{



    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
    */
    constructor(game){
        this.game = game;
    }

    reset(){
        this.game.stateMachine.state = State.RESET;
    }

    incrementState(){
        this.game.stateMachine.state++;
    }

    incrementStateIfPicked(){
        if(this.game.contents.picker.pickedObj != null){
            this.game.stateMachine.state++;
        }
    }

    set1P(){
        this.setActiveCamera(MyCamera.Mode.FirstP);
    }

    set3P(){
        this.setActiveCamera(MyCamera.Mode.ThirdP);
    }

    pauseUnPause(){
        if(this.game.stateMachine.state == State.PAUSE) this.game.stateMachine.state = State.SETUP_UNPAUSE;
        else this.game.stateMachine.state = State.SETUP_PAUSE;
    }

    toggleDebugCamera(){
        if(this.game.activeCamera instanceof MyDebugCamera){
            this.game.activeCamera.connectControls(false);
            this.game.activeCamera.display(false);
            this.game.activeCamera = this.game.prevCamera;
            this.game.activeCamera.display(true);
        }
        else{
            this.setActiveCamera(MyCamera.Mode.Debug);
            this.game.activeCamera.moveToEntity(this.game.prevCamera.entity.position);
            this.game.activeCamera.lookAtEntity(this.game.prevCamera.controls.target);
            this.game.activeCamera.connectControls(true);
        }
    }

    setActiveCamera(cameraMode){
        if(this.game.activeCamera != null)this.game.activeCamera.display(false);
        this.game.prevCamera = this.game.activeCamera;
        this.game.activeCamera = this.game.contents.cameras[cameraMode];
        this.game.activeCamera.display(true);
    }

    createPlayers(){
        this.game.players = [];
        this.game.players.push(new MyControllablePlayer(this.game.contents, '#FFFF00'));
        this.game.players.push(new MyNonControllablePlayer(this.game.contents, '#FF0000'));
    }

    resetBalloons(){
        this.game.contents.buildBalloons();
    }

    updateState(state){
        switch(state){
            case State.SETUP_HOME_MENU:{
                this.game.eventHandler.connect(this, this.toggleDebugCamera, '0', MyEventHandler.Type.onKeyDown);
                this.game.eventHandler.connect(this, this.incrementState, 'enter', MyEventHandler.Type.onKeyUp);
                break;
            }
            case State.SETUP_PICK_BALLOON_USER:{
                this.game.eventHandler.disconnect(this, 'enter');
                this.game.eventHandler.connect(this, this.incrementStateIfPicked, 'enter', MyEventHandler.Type.onKeyUp);
                this.game.eventHandler.connect(this, this.reset, 'escape', MyEventHandler.Type.onKeyUp);
                this.createPlayers();
                this.setActiveCamera(MyCamera.Mode.ThirdP);
                break;
            }
            case State.SETUP_PICK_STARTING_POINT:{
                break;
            }
            case State.SETUP_RACE:{
                this.game.eventHandler.disconnect(this, 'enter');
                this.game.eventHandler.connect(this, this.set1P, '1', MyEventHandler.Type.onKeyDown);
                this.game.eventHandler.connect(this, this.set3P, '3', MyEventHandler.Type.onKeyDown);
                this.game.eventHandler.connect(this, this.pauseUnPause, ' ', MyEventHandler.Type.onKeyUp);
                this.game.raceTime = 0;
                break;
            }
            case State.RACE:{
                this.game.raceTime += this.game.delta_t;
                this.game.handleCollisions(this.game.players[MyGame.Player.USER]);
                if(this.game.getWinnerPlayer() != null){
                    this.game.stateMachine.state = State.SETUP_END_OF_RACE;
                }
                break;
            }
            case State.SETUP_END_OF_RACE:{
                this.game.eventHandler.disconnect(this, '0');
                this.game.eventHandler.disconnect(this, '1');
                this.game.eventHandler.disconnect(this, '3');
                this.game.eventHandler.disconnect(this, ' ');
                if(!(this.game.activeCamera instanceof MyDebugCamera)) this.setActiveCamera(MyCamera.Mode.ThirdP);

                break;
            }
            case State.RESET:{
                this.resetBalloons();
                this.game.eventHandler.disconnect(this, 'enter');
                this.game.eventHandler.disconnect(this, '0');
                this.game.eventHandler.disconnect(this, '1');
                this.game.eventHandler.disconnect(this, '3');
                this.game.eventHandler.disconnect(this, ' ');
                this.game.eventHandler.disconnect(this, 'escape');
                this.game.reset();
                break;
            }
            case State.RESTART:{
                this.game.restart();
                this.game.eventHandler.connect(this, this.incrementStateIfPicked, 'enter', MyEventHandler.Type.onKeyUp);
                this.game.eventHandler.connect(this, this.toggleDebugCamera, '0', MyEventHandler.Type.onKeyDown);
                break;
            }
        }
    }



    

}

export { MyGamePlanner };