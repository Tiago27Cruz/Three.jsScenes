import * as THREE from 'three';
import { MyWindLayer } from './MyWindLayer.js';

class MyAtmosphere{
    /**
     * Constructs the atmosphere of the scene
     * @param {Array<number>} layerSizes - Sizes of the wind layers.
     * @param {Array<number>} windSpeeds - The speed of each layer.
     */
    constructor(layerSizes, windSpeeds){
        this.layers = [];
        this.build(layerSizes, windSpeeds);
    }
    /**
     * Builds the wind layers in the atmosphere.
     * @param {Array<number>} layerSizes - Sizes of the wind layers.
     * @param {Array<number>} windSpeeds - The speed of each layer.
     */
    build(layerSizes, windSpeeds){
        const directions = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];
        let y = 0;
        for(let layer = 0; layer < 5; layer++){
            this.layers.push(new MyWindLayer(y, y+layerSizes[layer]-1, layer, windSpeeds[layer], directions[layer]));
            y += layerSizes[layer];
        }
    }

    /**
     * Gets the wind layer given the layer index
     * @param {number} windLayerIndex - The wind layer index.
     */
    getLayer(windLayerIndex){
        if(windLayerIndex < 0 || windLayerIndex >= this.layers.length){
            return null;
        }
        return this.layers[windLayerIndex];
    }






}

export { MyAtmosphere };