import * as THREE from 'three';

/**
     * MySinCurve Constructor
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
 */
class MySinCurve extends THREE.Curve{
    constructor(width = 1, depth = 1,height = 1){
        super();
        this.width = width;
        this.depth = depth;
        this.height = height;
    }

    /**
     * gets the point in the time function of the curve
     * @param {Number} t
     * @param {THREE.Vector3} optionalTarget
     * @returns {THREE.Vector3}
     */
    getPoint( t, optionalTarget = new THREE.Vector3() ) {

        this.tx = t*Math.sin( 2 * Math.PI * t )*this.width;
        this.ty = t*this.height;
        this.tz = t*Math.cos( 2 * Math.PI * t )*this.depth;

        if(t == 1) {
            this.stem_direction = new THREE.Vector3(this.width * (Math.sin(2*Math.PI*t) + 2*Math.PI*t*Math.cos(2 * Math.PI * t)), this.height, this.depth * (Math.cos(2*Math.PI*t) + 2*Math.PI*t*Math.sin(2 * Math.PI * t))).normalize();
        }


		return optionalTarget.set( this.tx, this.ty, this.tz );
	}
  


}

export {MySinCurve};