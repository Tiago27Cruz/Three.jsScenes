import * as THREE from 'three';
import { MyEntity } from './MyEntity.js';
import {MyFlower} from './MyFlower.js';

class MyJar extends MyEntity {
    /**
     * Constructor
     * @param {MyContents} contents
     * @param {Text} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     * @param {Number} bottomRadius 
     * @param {Number} middleRadius 
     * @param {Number} topRadius 
     * @param {Number} numDivisions 
     * @param {Boolean} isOpen 
     * @param {THREE.Texture} texture 
     * @param {MyEntity} lego 
     * @param {MyEntity} parent_legos 
     * @param {Boolean} addFolder
     */
    constructor(contents, name = "Jar", parent = null, width = 1, depth = 1, height = 5, bottomRadius = 0.5, middleRadius = 0.5, topRadius = 0.5, numDivisions = 10, isOpen = true, texture = null, lego = null, parent_legos = null, addFolder = true){
        super(contents, name, parent, width, depth, height, null, contents.materials.get('PhongDoubleSide').clone(), texture);
        this.bottomRadius = bottomRadius;
        this.middleRadius = middleRadius;
        this.topRadius = topRadius;
        this.numDivisions = numDivisions;
        this.lego = lego;
        this.parent_legos = parent_legos;
        this.isOpen = isOpen;
        this.init(addFolder);
    }
    /**
     * initializes the jar
     * @param {Boolean} addFolder
     * 
     */
    init(addFolder){
        super.init(this, addFolder)
        this.build()
        this.initGui(addFolder);
    }
    /**
     * builds the jar
     * 
     */
    build(){
        //  Bottom
        let controlPoints = [
        ]

        const num_points = 10;

        //creates the nurb points
        this.contents.nurbs_builder.buildControlPoints(controlPoints, 0.000001, 0.000001, 0.00001, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, 0, this.width/5, this.depth/5, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height/20, this.width/5, this.depth/5, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height/20, this.width/3, this.depth/3, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height/4, this.width/3, this.depth/3, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height/2, this.bottomRadius*this.width/3, this.bottomRadius*this.depth/3, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.6/5, this.middleRadius*this.width/3, this.middleRadius*this.depth/3, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.6/5, this.topRadius*this.width/3, this.topRadius*this.depth/3, num_points);
        this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.6/5, this.width/20, this.depth/20, num_points);
        //if the top is closed then dont leave it open
        if(!this.isOpen) this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.6/5, 0.000001, 0.00001, num_points);

        //create the bottom part of the jar
        const bottom = this.contents.nurbs_builder.build(controlPoints, controlPoints.length-1, controlPoints[0].length-1, 60, this.numDivisions);

        
        this.material.color.set("#fef801");


        this.material.map = this.texture;

        const bottomMesh = new THREE.Mesh(bottom, this.material);

        //create the bottom part of the jar entity and add it to it's parent
        const bottomEntity = new MyEntity(this.contents, "Bottom", this, 1,1,1, null, this.material, null, true, false, true);
        bottomEntity.isNurbs = true;
        bottomEntity.mesh = bottomMesh;
        bottomEntity.group = null
        this.children.set("JarBottom", bottomEntity);

        this.group.add(bottomMesh);
    
        // Top
        if(this.isOpen){
            controlPoints = [];

            //creates the nurbs points
            this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.6/5, this.width/20, this.depth/20, num_points);
            this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.7/5, this.width/15, this.depth/15, num_points);
            this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.7/5, this.width/20, this.depth/20, num_points);
            this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.9/5, this.width/20, this.depth/20, num_points);
            this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height*4.9/5, this.width/15, this.depth/15, num_points);
            this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height, this.width/15, this.depth/15, num_points);
            this.contents.nurbs_builder.buildControlPoints(controlPoints, this.height, this.width/20, this.depth/20, num_points);

            //creates the top part of the jar or the lid
            const top = this.contents.nurbs_builder.build(controlPoints, controlPoints.length-1, controlPoints[0].length-1, 5, 10);

            //get top lid material
            this.topMaterial = this.contents.materials.get('PhongDoubleSide').clone();
            this.topMaterial.color.set("#fef801");

            //get top lid texture
            const lidTexture = this.contents.loadTexture("lid").clone();
            lidTexture.repeat.set(10, 1);
            lidTexture.rotation = -Math.PI/2;
            lidTexture.anisotropy = 16;
            lidTexture.colorSpace = THREE.SRGBColorSpace;


            const topMesh = new THREE.Mesh(top, this.topMaterial);

            //create top lid entity and add it to it's parent
            const topEntity = new MyEntity(this.contents, "Top", this, 1,1,1, null, this.topMaterial, null);
            topEntity.mesh = topMesh;
            topEntity.group = null
            topEntity.isNurbs = true;
            this.children.set("JarTop", topEntity);

            this.group.add(topMesh);

            // Add 1 or 2 flowers
            for(let i = 0; i < this.contents.getRandom(0, 3); i++){
                let flower = new MyFlower(this.contents, "Flower", this, 1, 1, this.contents.getRandom(5, 15), 0.15);
                flower.move(0, this.height*4/5);
            }
        }

        //flower.moveTo(topMesh.position.x, topMesh.position.y, topMesh.position.z);        
    }


    /**
     * Gui initialization
     */
    initGui(addFolder){
        if(addFolder){
            super.initGui();
            this.initGuiColorMaterials([this.material, this.topMaterial])
            //create GUI for moving only if the jar is in a lego
            if(this.lego !== null) super.initGuiMoveToLego();
            if(this.lego === null) super.initGuiMove(true, false, true, [[-5.5,0,-0.5],[5.5,0,2]])
            super.initGuiScale();
            super.initGuiRotate(false, true, false);
            super.initGuiTexture();
            super.initGuiShadow();
        }
    }

}

export {MyJar};