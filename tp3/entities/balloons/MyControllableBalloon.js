import * as THREE from 'three';
import { MyContents } from '../../MyContents.js';
import { MyInformativeDisplay } from '../background/MyInformativeDisplay.js';
import { MyDisplay } from '../background/MyDisplay.js';
import { MyBalloon } from './MyBalloon.js';
import { State } from '../../MyGameState.js';
import { MyArrow } from '../MyArrow.js';

class MyControllableBalloon extends MyBalloon{

    /**
       Constructs a Controllable Balloon.
       @param {MyContents} contents The contents of the game.
       @param {string} name The name of the balloon.
       @param {number} mass The mass of the balloon.
       @param {number} x The x position of the balloon.
       @param {number} y The y position of the balloon.
       @param {number} z The z position of the balloon.
    */
    constructor(contents, name, mass, x = 0, y = 0, z = 0){
        super(contents, name, mass, x, y, z, true);

        this.windLayerIndex = 0;
        this.offset1P = 0.75;
    }

    /**
       Updates the balloon according to the state of the game.
       @param {State} state The state of the game.
    */
    updateState(state){
        switch(state){
            case State.SETUP_RACE:{
                this.changeLayer(-this.windLayerIndex);
                break;
            }
        }
        super.updateState(state);
    }




    /**
       Changes wind layer of the balloon (when he moves up or down)
       @param {number} value Changes wind layer index by this number.
    */
    changeLayer(value){
        this.windLayerIndex = Math.max(0, Math.min(this.contents.game.map.atmosphere.layers.length-1, this.windLayerIndex+value));
        const windLayer = this.contents.game.map.atmosphere.getLayer(this.windLayerIndex);
        let y = windLayer.getCenter();
        if(this.windLayerIndex == 0) y = 0.3;
        this.moveTo(null, y);
        this.contents.displays[MyDisplay.Type.INFORMATIVE].update(MyInformativeDisplay.Option.AIR_LAYER, this.windLayerIndex);
        this.contents.game.players[0].guiBalloon.moveInCamera(0.15 , this.windLayerIndex * MyArrow.Y_OFFSET);

    }


    /**
       Verifies if balloon is outside the track or not
       @returns {boolean} is outside the track or not.
    */
    isOutsideTrack(){
        const middlePoint = this.contents.game.map.track.getPoint(this.positionWindow[MyBalloon.WindowPosition.MIDDLE]);
        return this.shadow.distanceTo(middlePoint) >= this.contents.game.map.track.width+this.shadow.width/5;
    }


    /**
       Updates the balloon during the racing state of the game.
       @param {number} t The time passed between frames.
    */
    update(t){
        super.update(t);
        if(this.isOutsideTrack()){
            const middlePoint = this.contents.game.map.track.getPoint(this.positionWindow[MyBalloon.WindowPosition.MIDDLE]);
            this.moveTo(middlePoint.x, null, middlePoint.z);
            this.contents.game.handleOutOfTrack()
        }
    }

    /**
       Handles the collision of the balloon by emitting smoke and adding it to the timed out list.
    */
    handleCollision(){
        this.timedOut = true
        this.contents.game.addTimedOutPlayer();
        this.particleEmitters[1].initFollowingEntity(this, new THREE.Vector3(0, 3, 0), true);
    }


}

export { MyControllableBalloon };