import * as THREE from 'three';

class MyWindLayer{
    /**
     * Constructs a wind layer
     * @param {number} beginY The y value where the wind layer begins.
     * @param {number} endY The y value where the wind layer ends.
     * @param {number} layer The layer index.
     * @param {number} speed The wind speed of the layer. 
     * @param {THREE.Vector3} direction The direction of the layer (none, north, south, east or west demonstrated in vector x, z, coordinates)
     */
    constructor(beginY, endY, layer, speed, direction){
        this.beginY = beginY;
        this.endY = endY;
        this.layer = layer;
        this.speed = speed;
        this.direction = direction;
    }
    /**
     * Obtains the Wind Layer force.
     * @returns {THREE.Vector3} The wind layer direction applied with it's speed.
     */
    getForce(){
        const vector = new THREE.Vector3(this.direction.x, this.direction.y, this.direction.z);
        return vector.multiplyScalar(this.speed);
    }
    /**
     * Obtains the center y of the layer.
     * @returns {number} The y coordinate of the center of the layer.
     */
    getCenter(){
        return this.beginY + (this.endY-this.beginY);
    }








}

export { MyWindLayer };