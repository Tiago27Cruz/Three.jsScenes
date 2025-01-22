import * as THREE from 'three';
import { MyContents } from './MyContents.js';
import { MyGameState } from './MyGameState.js';
import { MyCamera } from './entities/cameras/MyCamera.js';
import { MyBalloon } from './entities/balloons/MyBalloon.js';
import { MyEventHandler } from './MyEventHandler.js';
import { MyGamePlanner } from './MyGamePlanner.js';
import { Config } from './CONFIG.js';


class MyGame{


    static Player = {
        USER: 0,
        OPPONENT: 1
    }

    static Map = {
        BASIC: 0
    }

    /**
       Constructs the global variables the game needs to function
       @param {MyContents} contents The contents of the application
    */
    constructor(contents){
        this.contents = contents;
        this.eventHandler = new MyEventHandler(this);
        this.stateMachine = new MyGameState(this);
        this.planner = new MyGamePlanner(this);
        
        this.raceTime = 0;
        this.delta_t = 0;
        this.playerTimeOut = 0;
        this.activeCamera = null;
        this.prevCamera = null;

        this.players = [];
        this.collidingEntities = new Map();
        this.timedOutEntities = new Map()

        this.map = null

        this.planner.setActiveCamera(MyCamera.Mode.ThirdP);

        this.shaders = new Map();
        this.contents.app.renderToTargetOnInterval(Config.DISPLAY_DELAY);
    }

    /**
     * Resets the class info in order to prepare to a new game with different players.
     */
    reset(){
        this.raceTime = 0;
        this.playerTimeOut = 0;
        this.activeCamera = null;
        this.prevCamera = null;

        if(this.timedOutEntities !== undefined){
            for (let [entity, _] of this.timedOutEntities.entries()){
                entity.reAddObject()
            }
            this.timedOutEntities.clear();
        }
        
        if (this.planner !== undefined) this.planner.setActiveCamera(MyCamera.Mode.ThirdP);

        if (this.collidingEntities !== undefined){
             // remove balloons from colliding entities since new ones might be added
            for (let [entity, _] of this.collidingEntities.entries()){
                if (entity instanceof MyBalloon){
                    this.collidingEntities.delete(entity)
                }
            }
        }
       
    }

    /**
     * Restarts the game back to how it was at the beginning before picking the start positions.
     */
    restart(){
        this.raceTime = 0;
        this.playerTimeOut = 0;
        for (let [entity, _] of this.timedOutEntities.entries()){
            entity.reAddObject()
        }
        this.timedOutEntities.clear()
    }

    /**
     * Check if any player has won and returns it if so
     * @returns the player that has won the game, null if none has won yet.
     */
    getWinnerPlayer(){
        for(const player of this.players){
            if(player.hasWon()){
                return player;
            }
        }
        return null;
    }

    getOpponentStartingPoint(){
        let userSp = this.players[MyGame.Player.USER].balloon.shadow
        if(userSp == null) userSp = this.contents.picker.pickedObj;
        if(userSp != null){
            if(userSp.id == this.map.track.spA.id){
                return this.map.track.spB;
            }
            return this.map.track.spA;
        }
    }

    update(){
        this.activeCamera.saveFrame();
        this.delta_t = this.contents.clock.getDelta();
        this.contents.scenario.update(this.delta_t);
        this.eventHandler.update();
        this.stateMachine.update();
        this.activeCamera.render();
    }

    /**
     * Generates a random integer between the specified minimum and maximum values.
     * @param {number} min - The minimum value (inclusive).
     * @param {number} max - The maximum value (inclusive).
     * @returns {number} A random integer between min and max.
     */
    getRandom(min, max){
        return Math.ceil(Math.random() * (max-1-min)) + min;
    }

    isColliding(entity1, entity2){
        for(const hitbox1 of entity1.hitboxes){
            for(const hitbox2 of entity2.hitboxes){
                if(hitbox1 instanceof THREE.Sphere && hitbox2 instanceof THREE.Sphere){
                    if(hitbox1.intersectsSphere(hitbox2)) {
                        return true;
                    }
                }
                else if(hitbox1 instanceof THREE.Box3 && hitbox2 instanceof THREE.Box3){
                    if(hitbox1.intersectsBox(hitbox2)){
                        return true;
                    }
                }
                else if(hitbox1 instanceof THREE.Sphere && hitbox2 instanceof THREE.Box3){
                    if(hitbox2.intersectsSphere(hitbox1)){
                        return true;
                    }
                }
                else if(hitbox1 instanceof THREE.Box3 && hitbox2 instanceof THREE.Sphere){
                    if(hitbox1.intersectsSphere(hitbox2)){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * First calls 2 methods to try to remove timed out entities (objects then player). Then checks if the player balloon is colliding with any entity
     * @param {MyControllablePlayer} player 
     */
    handleCollisions(player){
        this.checkTimedOutEntities()
        if (this.playerTimedOut(player)) return // if the player is timed out, there is no need to check for collisions

        const playerBalloon = player.balloon;
        

        for(let entity of this.collidingEntities.values()){
            if(this.isColliding(entity, playerBalloon) && !this.timedOutEntities.has(entity)){
                player.handleCollision(entity);
                entity.handleCollision();
            }
        }
    }

    /**
     * Handles the case where the player has gone out of track. Calls the player's handleCollision method.
     */
    handleOutOfTrack(){
        this.players[MyGame.Player.USER].handleCollision();
    }

    /**
     * Adds the given entity to the map of entities that have been timed out.
     * @param {MyEntity} entity 
     */
    addTimedOutEntity(entity){
        this.timedOutEntities.set(entity, this.raceTime)
    }

    /**
     * Updates the value of the playerTimeOut to the current raceTime
     */
    addTimedOutPlayer(){
        this.playerTimeOut = this.raceTime;
    }

    /**
     * Check if the player is still timed out and if the time since the timeout is less than the penalty time.
     * If the timeout is over, it sets the timeOut variable value as false and stop displaying smoke particles.
     * @param {MyControllablePlayer} player 
     * @returns true if the player is timed out and the time since the timeout is less than the penalty time, false otherwise.
     */
    playerTimedOut(player){
        if (player.balloon.timedOut && this.raceTime - this.playerTimeOut < Config.PENALTY_TIME){
            return true
        } 
        else if (player.balloon.timedOut){
            player.balloon.timedOut = false
            player.balloon.particleEmitters[1].display(false);
        }
        return false
    }

    /**
     * Checks if the entities that have been timed out are able to be re-added to the game or to remove the penalty. If so, acts accordingly.
     */
    checkTimedOutEntities(){
        let removeEntities = []
        for (let [entity, time] of this.timedOutEntities.entries()){
            // Since they are ordered by time, we can break the loop if we reach an entity that has not been timed out for >= than PENALTY_TIME
            if (this.raceTime - time < Config.OBJECT_TIMED_OUT) break
            removeEntities.push(entity)

            if (entity instanceof MyBalloon){
                entity.timedOut = false
            } else {
                entity.reAddObject()
            }
            
        }
        for (let entity of removeEntities){
            this.timedOutEntities.delete(entity)
        }
    }

}

export { MyGame };