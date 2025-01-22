import { MyEntity } from './MyEntity.js';

class MyFloor extends MyEntity{
    /**
     * Constructor of the class MyFloor
     * @param {MyContents} contents 
     * @param {String} name 
     * @param {MyEntity} parent 
     * @param {Number} width 
     * @param {Number} depth 
     * @param {Number} height 
     * @param {Number} lego_distance 
     */
    constructor(contents, name = "Floor", parent = null, width = 1, depth = 1, height = 1, lego_distance = 7){
        super(contents, name, parent, width, depth, height);
        this.lego_distance = lego_distance;
        this.init();
    }

    /**
     * Initializes the floor and builds it
     */
    init(){
        // Calls the parent init method for the default initialization
        super.init(this);
        
        // Create a new floor material that will be used by every lego piece and the floor itself
        this.material = this.contents.materials.get('Phong').clone();

        // Sets the color of the floor
        const color = "#ffffff";
        this.material.color.set(color);

        // Creates the plane object
        const plane = new MyEntity(this.contents, "Plane", this, this.width, this.height, this.depth, this.contents.buildObject('Plane'), this.material, null, true, false);
        // Rotates the plane object to be horizontal and act like the floor
        plane.mesh.rotation.x = -Math.PI/2;
        
        // Adds the lego bricks to the floor
        this.contents.buildLego(this, plane.mesh.position.x, plane.mesh.position.y,plane.mesh.position.z, this.width, this.depth, this.lego_distance, this.material);

        // Make the floor receive shadows
        this.addShadows(true, false);

        this.initGui();
    }
    


    /**
     * Adds the GUI elements of the floor
     */
    initGui(){
        super.initGui();
        super.initGuiMoveTo();
        super.initGuiColor();
        super.initGuiShadow();
    }
}
export {MyFloor};
