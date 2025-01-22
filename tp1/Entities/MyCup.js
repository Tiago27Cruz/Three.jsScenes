import * as THREE from 'three';
import {MyEntity} from './MyEntity.js';

class MyCup extends MyEntity {
    /**
     * Cup constructor
     * @param {MyContents} contents
     * @param {string} name
     * @param {MyEntity} parent
     * @param {number} width
     * @param {number} depth
     * @param {number} height
     */
    constructor(contents, name = "Cup", parent = null, width = 1, depth= 1, height=1) {
        super(contents, name, parent, width, depth, height, null, contents.materials.get('PhongDoubleSide').clone(), contents.loadTexture("face2").clone());
        
        this.init();
    }

    /**
     * Initializes the cup
     */
    init(){
        // Calls the parent init method for the default initialization
        super.init(this);
        this.initGui();

        this.build();


    }

    /**
     * Builds the cup
     */
    build(){
        const controlPoints = [];
        const num_points = 10;

        //builds the nurbs
        this.contents.nurbs_builder.buildControlPoints(controlPoints, 0.000001, 0.000001, 0.00001, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, 0, this.width/8, this.depth/8, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height/20, this.width/8, this.depth/8, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height/20, this.width/3, this.depth/3, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height/4, this.width/2, this.depth/2, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height/3, this.width/4, this.depth/4, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*2/3, this.width/4, this.depth/4, num_points);

        //create geometry for the cup
        const geometry = this.contents.nurbs_builder.build(controlPoints, controlPoints.length-1, controlPoints[0].length-1, 60, 20);

        //rotate and update it's color
        this.updateColor("#fef801");
        this.texture.rotation = -Math.PI/2;

        //create the mesh and position it accordingly
        const mesh = new THREE.Mesh(geometry, this.material);
        mesh.position.y -= 0.5;

        //create cup entity
        const entity = new MyEntity(this.contents, "CupMesh", this, 1,1,1, null, this.material, null);
        entity.mesh = mesh;
        entity.group = null
        entity.isNurbs = true;

        //add cup entity to its parent
        this.children.set("CupMesh", entity);
        this.group.add(mesh);

    }
    
    /**
     * Adds the GUI elements of the candle
     */
    initGui(){
        super.initGui();
    }
}

export {MyCup};