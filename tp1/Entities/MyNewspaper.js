import * as THREE from 'three';
import { MyEntity } from './MyEntity.js';
import { MyNurbsBuilder } from '../MyNurbsBuilder.js';

class MyNewspaper extends MyEntity {
    constructor(contents, name = "Newspaper", parent = null, width = 1, height = 1.5, depth = 1, lego = null, parent_legos = null) {
        super(contents, name, parent, width, height, depth, null, null, null, false, true, true, true);
        this.lego = lego;
        this.parent_legos = parent_legos;
        this.init();
    }

    /**
     * Initializes the newspaper
     */
    init() {
        super.init(this);
        this.initTexture()
        this.initMaterial();
        this.builder = new MyNurbsBuilder();
        this.createSurface();
        this.initGui();
        
    }

    /**
     * Builds and prepares the this.texture for the newspaper
     */
    initTexture() {
        this.texture = this.contents.loadTexture("newspaper").clone();
        this.texture.wrapS = THREE.RepeatWrapping;
        this.texture.wrapT = THREE.RepeatWrapping;
        const UVRate = this.height / this.width;
        
        const textureUVRate = 1027 / 1491;
        const textureRepeatU = 2;
        const textureRepeatV = 1

        this.texture.repeat.set(textureRepeatU, textureRepeatV);
        this.texture.rotation = 0;
        this.texture.offset = new THREE.Vector2(0,0);

        this.texture.anisotropy = 16;
        this.texture.colorSpace = THREE.SRGBColorSpace;
    }

    /**
     * Initializes the material for the newspaper
     */
    initMaterial() {
        this.material = this.contents.materials.get("PhongDoubleSide").clone();
        this.material.color.set("#ffffff");
        
        this.material.map = this.texture;
    }

    /**
     * Creates the surface of the newspaper
     */
    createSurface(){
        this.samplesU = 64
        this.samplesV = 32
        let controlPoints = [];
        let surfaceData;
        let mesh;
        let orderU = 50
        let orderV = 1
        let row

        const radius = 0.3
        const spirals = 3
        let x,y,z,angle;

        y = this.height/2
         
        // Build the control points for the newspaper
        for (let i = 0; i <= orderU; i++) {
            row = [];
            // Calculate an angle, so  that the control points are distributed in a spiral
            angle = 2*Math.PI * (i / orderU) * spirals
            // X and Z are cosine and sine functions of the angle, multiplied by the radius and the i-th control point (from 0...1) so it keeps growing
            x = radius * Math.cos(angle) * (i / orderU)
            z = radius * Math.sin(angle) * (i / orderU)
            row.push([x, y, z, 1])
            row.push([x, -y, z, 1])
            controlPoints.push(row);
        }

        surfaceData = this.builder.build(controlPoints, orderU, orderV, this.samplesU,this.samplesV, this.material)  
        mesh = new THREE.Mesh( surfaceData, this.material );
        mesh.rotation.x = Math.PI/2
        mesh.rotation.y = 0
        mesh.rotation.z = 0
        mesh.scale.set( this.width,1,this.depth )
        mesh.position.y = this.width/8

        // Create as an entity so we can use MyEntity methods
        const newspaper = new MyEntity(this.contents, "Newspaper", this, this.width, this.height, this.depth, null, this.material);
        newspaper.mesh = mesh;
        newspaper.group = null
        newspaper.children = null

        this.group.add(mesh);
        this.children.set("Newspaper", newspaper);
    }

    /**
     * Initializes the GUI for the newspaper
     */
    initGui(){
        super.initGui();
        super.initGuiColor();
        if(this.lego !== null) super.initGuiMoveToLego();
        if(this.lego === null) super.initGuiMove(true, false, true, [[-5.5,0,-0.5],[5.5,0,2]])
        super.initGuiScale()
        super.initGuiRotate();
        super.initGuiTexture();
        
        super.initGuiShadow();
    }
}

export { MyNewspaper };