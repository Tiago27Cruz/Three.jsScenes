import { MyEntity } from './MyEntity.js';

class MyPlate extends MyEntity{
    /**
     * 
     * @param {MyContents} contents
     * @param {Text} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     */
    constructor(contents, name = "Plate", parent = null, width = 1,  depth = 1, height = 1){
        super(contents, name, parent, width, depth, height);
        this.init();
    }

    /**
     * Initializes everything related to the plate and builds it
     */
    init(){
        super.init(this)
        const plateColor = "#ffffff";

        // Cylinder of the plate 
        const cylinderMaterial = this.contents.materials.get('PhongDoubleSide').clone()
        const plate_texture = this.contents.loadTexture('plate2').clone();
        plate_texture.repeat.set(50, 10);
        cylinderMaterial.color.set(plateColor);

        this.cylinder = new MyEntity(this.contents, 'Cylinder', this, this.width, this.depth, this.height, this.contents.buildObject('Cylinder', 3, 1, 1, 32, 1, true), cylinderMaterial, plate_texture, true, false);

        // Bottom of the plate
        const circleMaterial = this.contents.materials.get('PhongDoubleSide').clone();
        circleMaterial.color.set(plateColor);

        // Since we will need to rotate this, depth will be in height and height in depth
        this.circle = new MyEntity(this.contents, 'Circle', this, this.width, this.height, this.depth, this.contents.buildObject('Circle', 1, 32), circleMaterial, null, true, false);
        this.circle.mesh.rotation.x = -Math.PI/2;
        this.circle.move(0, -this.cylinder.mesh.scale.y/2, 0);

        this.initGui();
    } 


    /**
     * Initializes the GUI for the plate
     */
    initGui(){
        super.initGui();
        this.initGuiColorMaterials([this.cylinder.material, this.circle.material]);
        super.initGuiMoveTo();
        super.initGuiScale();
        super.initGuiRotate(false, true, false)
        this.initGuiTexture(this.cylinder.texture);
        super.initGuiShadow();
    }
}
export {MyPlate};