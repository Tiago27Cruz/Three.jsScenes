
export const State = {
    SETUP_HOME_MENU: 0,
    HOME_MENU: 1,
    SETUP_PICK_BALLOON_USER: 2,
    PICK_BALLOON_USER: 3,
    SETUP_PICK_BALLOON_OPPONENT: 4,
    PICK_BALLOON_OPPONENT: 5,
    SETUP_PLAY_MENU: 6,
    PLAY_MENU: 7,
    SETUP_PICK_STARTING_POINT: 8,
    PICK_STARTING_POINT: 9,
    SETUP_RACE: 10,
    RACE: 11,
    SETUP_END_OF_RACE: 12,
    SETUP_END_OF_RACE: 13,
    END_OF_RACE: 14,
    SETUP_PAUSE: 15,
    PAUSE: 16,
    SETUP_UNPAUSE: 17,
    RESET: 18,
    RESTART: 19
}

/**
 * General Class that keeps track of the state of the game.
 * It is responsible for updating the state of all the elements of the game.
 */
class MyGameState{

    constructor(game){
        this.game = game;
        this.state = State.SETUP_HOME_MENU;
    }

    /**
     * Calls the updateState function of the homeMenu and passes the state of the game to it.
     */
    updateHomeMenu(){
        this.game.contents.homeMenu.updateState(this.state);
    }

    /**
     * Calls the updateState function of the active camera and passes the state of the game to it.
     */
    updateActiveCamera(){
        this.game.activeCamera.updateState(this.state);
    }

    /**
     * Calls the updateState function of all the cameras and passes the state of the game to them.
     */
    updateCameras(){
        for(const camera of this.game.contents.cameras){
            camera.updateState(this.state);
        }
    }

    /**
     * Calls the updateState function of the picker (MyPicker) and passes the state of the game to it.
     */
    updatePicker(){
        this.game.contents.picker.updateState(this.state);
    }

    /**
     * Calls the updateState function of the planner (MyGamePlanner) and passes the state of the game to it.
     */
    updatePlanner(){
        this.game.planner.updateState(this.state);
    }

    /**
     * Calls the updateState function of all the balloons and passes the state of the game to them.
     */
    updateBalloons(){
        for(const balloon of this.game.contents.opBalloons){
            balloon.updateState(this.state);
        }
        for(const balloon of this.game.contents.plBalloons){
            balloon.updateState(this.state);
        }
    }

    /**
     * Calls the updateState function of all the players and passes the state of the game to them.
     */
    updatePlayers(){
        for(const player of this.game.players){
            player.updateState(this.state);
        }
    }

    /**
     * Calls the updateState function of the map (MyReader) and passes the state of the game to it.
     */
    updateMap(){
        this.game.map.updateState(this.state);
    }

    /**
     * Calls the update function of all the shaders in the game
     */
    updateShaders(){
        for (const shader of this.game.shaders.values()){
            shader.update();
        }
    }

    /**
     * Calls the updateState function of the displays and passes the state of the game to them.
     */
    updateDisplays(){
        for(const display of this.game.contents.displays){
            display.updateState(this.state);
        }
    }

    /**
     * Calls the updateState function of the eventHandler and passes the state of the game to it.
     */
    updateEventHandler(){
        this.game.eventHandler.updateState(this.state);
    }

    /**
     * Calls the updateState function of the playMenu and passes the state of the game to it.
     */
    updatePlayMenu(){
        this.game.contents.playMenu.updateState(this.state);
    }

    /**
     * Calls the updateState function of the finalMenu and passes the state of the game to it.
     */
    updateFinalMenu(){
        this.game.contents.finalMenu.updateState(this.state);
    }

    /**
     * Calls the updateState function of the fireworks and passes the state of the game to it.
     */
    updateFireworks(){
        this.game.contents.fireworks.updateState(this.state);
    }

    /**
     * Calls the updateState function of the elements of the game based on who needs to update on a given state
     */
    update(){
        switch(this.state){
            case State.SETUP_HOME_MENU:{
                this.updateDisplays();
                this.updateEventHandler()
                this.updateHomeMenu();
                this.updateActiveCamera()
                this.updatePicker();
                this.updatePlanner();
                this.state = State.HOME_MENU;
                break;
            }
            case State.HOME_MENU:{
                break;
            }
            case State.SETUP_PICK_BALLOON_USER:{
                this.updateHomeMenu();
                this.updateEventHandler()
                this.updatePlanner();
                this.updatePicker();
                this.updateBalloons();
                this.updateActiveCamera();
                this.state = State.PICK_BALLOON_USER;
                break;
            }
            case State.PICK_BALLOON_USER:{
                this.updateShaders();
                break;
            }
            case State.SETUP_PICK_BALLOON_OPPONENT:{
                this.updateActiveCamera();
                this.updatePlayers();
                this.updatePicker();
                this.state = State.PICK_BALLOON_OPPONENT;
                break;
            }
            case State.PICK_BALLOON_OPPONENT:{
                break;
            }
            case State.SETUP_PLAY_MENU:{
                this.updatePlayers();
                this.updatePicker();
                this.updateActiveCamera();
                this.updatePlayMenu();
                this.updatePlayers();
                this.state = State.PLAY_MENU;
                break;
            }
            case State.PLAY_MENU:{
                this.updatePicker();
                break;
            }
            case State.SETUP_PICK_STARTING_POINT:{
                this.updatePlayMenu();
                this.updatePlayers();
                this.updateBalloons();
                this.updateActiveCamera();
                this.updatePlanner();
                this.updateMap();
                this.updatePicker();
                this.state = State.PICK_STARTING_POINT;
                break;
            }
            case State.PICK_STARTING_POINT:{
                this.updateShaders();
                break;
            }
            case State.SETUP_RACE:{
                this.updateMap();
                this.updateCameras();
                this.updatePlayers();
                this.updatePicker();
                this.updatePlanner();
                this.updateDisplays();
                this.state = State.RACE;
                break;
            }
            case State.RACE:{
                this.updateDisplays();
                this.updateCameras();
                this.updatePlayers();
                this.updateShaders();
                this.updatePlanner();
                break;
            }
            case State.SETUP_PAUSE:{
                this.updatePlayers();
                this.updateDisplays();
                this.state = State.PAUSE;
                break;
            }
            case State.PAUSE:{
                break;
            }
            case State.SETUP_UNPAUSE:{
                this.updatePlayers();
                this.updateDisplays();
                this.state = State.RACE;
                break;
            }
            case State.SETUP_END_OF_RACE:{
                this.updatePlayers();
                this.updatePlanner();
                this.updateCameras();
                this.updateFinalMenu();
                this.updatePicker();
                this.updateFireworks();
                this.updatePlayers();
                this.state = State.END_OF_RACE;
                break;
            }
            case State.END_OF_RACE:{
                this.updateFireworks();
                this.updateShaders();
                this.updatePicker();
                break;
            }
            case State.RESET:{
                this.updateHomeMenu();
                this.updateActiveCamera()
                this.updatePicker()
                this.updateFinalMenu();
                this.updateFireworks();
                this.updateDisplays();
                this.updatePlayers();
                this.updateMap();
                this.updatePlanner();
                this.state = State.SETUP_HOME_MENU;
                break;
            }
            case State.RESTART:{
                this.updateFinalMenu();
                this.updateFireworks();
                this.updateDisplays();
                this.updatePlayers();
                this.updateMap();
                this.updatePlanner();
                this.state = State.SETUP_PICK_STARTING_POINT;
                break;
            }
            default:{
                console.warn("Invalid state inside MyGame");
            }
        }
    }

    

}

export { MyGameState };