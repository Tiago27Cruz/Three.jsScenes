import * as THREE from 'three';

/**
 * Lego Curve Constructor
 * @param {Number} width
 * @param {Number} depth
 * @param {Number} height
 * @param {Boolean} isRight
 */
class MyLegoCurve extends THREE.Curve{ 
    constructor(width = 1, depth = 1,height = 1, isRight = true){
        super();
        this.width = width;
        this.depth = depth;
        this.height = height;
        this.isRight = isRight;
    }

    /**
     * gets the point in the time function of the curve
     * @param {Number} t
     * @param {THREE.Vector3} optionalTarget
     * @returns {THREE.Vector3}
     */
    getPoint( t, optionalTarget = new THREE.Vector3() ) {
        //set the y and z point of the vector according to the time function
        this.ty = -t*this.height*Math.cos(t);
        this.tz = t*this.depth*t;
        //if the geometry is at it's beggining offset it according to if it is right or left geometry.
        if(t == 0){
            if(this.isRight) this.tx = -t*this.width+1;
            else this.tx = t*this.width-1;
        }
        else{
            if(this.isRight) this.tx = -t*this.width*Math.cos(t);
            else this.tx = t*this.width*Math.cos(t);
        }



		return optionalTarget.set( this.tx, this.ty, this.tz );
	}
  


}

export {MyLegoCurve};