import * as THREE from 'three';
import { MyDisplay } from './MyDisplay.js';
import { State } from '../../MyGameState.js';
import { MyContents } from '../../MyContents.js';

class MyCameraDisplay extends MyDisplay{

    /**
     * Constructs the Camera Display
     * @param {MyContents} contents - The contents of the game.
     */
    constructor(contents){
        super(contents);
        this.buildScreen();
        this.buildShader();
        this.moveTo(0, 0, 35);
    }    
    /**
     * Builds the Screen onto the display.
     */
    buildScreen(){
        const displayMesh = this.meshes[1].clone();
        this.meshes[1].scale.x *= 0.7;
        this.meshes[1].scale.y *= 0.7;
        const planeGeometry = new THREE.PlaneGeometry(displayMesh.geometry.parameters.width/2, displayMesh.geometry.parameters.height/2, 500, 500);
        const planeMaterial = this.contents.materials.get('PhongDoubleSide').clone();
        planeMaterial.color.set('#ffffff');
        const screenMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        screenMesh.position.y = displayMesh.position.y;
        screenMesh.position.z += displayMesh.geometry.parameters.depth/2 + 0.01;

        
        this.addMesh(screenMesh);
        this.rotateTo(null, Math.PI);
    }

    /**
     * Generates a random integer between the specified minimum and maximum values.
     * @param {State} state - State of the game.
     */
    updateState(state){
        switch(state){

        }
        super.updateState(state);
    }

    /**
     * Creates the shader for the camera display.
     */
    buildShader(){
        let map = this.contents.loadTexture('skybox/skybox1.jpg');

        const uniforms = {
            u_map: { type: 't', value: map },
            frameSample: { type: 't', value: null },
            depthSample: { type: 't', value: null },
            nearDistance: { type: 'f', value: 0.1},
            farDistance: { type: 'f', value: 1000.0}
        };

        this.createShader('depthOffset', 'simpleTex', uniforms);
        this.waitForShader(this.meshes.length-1);
    }


}

export { MyCameraDisplay };