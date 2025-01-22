import * as THREE from 'three'
import { MyEntity } from './MyEntity.js';

class MyLamp extends MyEntity{
    /**
     * Lamp constructor
     * @param {MyContents} contents 
     * @param {Text} name 
     * @param {MyEntity} parent 
     * @param {Number} width 
     * @param {Number} height 
     * @param {Number} depth 
     */
    constructor(contents, name = "Lamp", parent = null, width = 1, height = 1, depth = 1){
        super(contents, name, parent, width, height, depth);
        this.init()
    }

    /**
     * Initializes the lamp
     */
    init(){
        super.init(this);

        this.initTextures();
        this.initMaterials();

        this.build();

        this.initGui();
    }

    /**
     * Initializes the textures used by the lamp
     */
    initTextures(){
        this.legoTexture = this.contents.loadTexture('single_lego2').clone();
    }

    /**
     * Initializes the materials used by the lamp
     */
    initMaterials(){
        // Create the material to be used by the exterior of the lamp
        this.outerMaterial = this.contents.materials.get("Phong").clone();
        this.outerMaterial.color = new THREE.Color(0x808080);

        // Create the material to be used by the bulb
        this.bulbMaterial = this.contents.materials.get("Phong").clone();
        this.bulbMaterial.color = new THREE.Color(0xffff00);
        this.bulbMaterial.emissive = this.bulbMaterial.color
        this.bulbMaterial.transparent = true;
        this.bulbMaterial.opacity = 1

        // Create the material to be used by the screws
        this.screwMaterial = this.contents.materials.get("Phong").clone();
        this.screwMaterial.color = new THREE.Color(0x121212);

        // Create the material to be used by the lampshade
        this.shadeMaterial = this.contents.materials.get("PhongDoubleSide").clone();
        this.shadeMaterial.color = new THREE.Color(0x661111);
    }

    /**
     * Builds the lamp
     */
    build(){
        this.buildBase();
        this.buildPole();
        this.buildBulb();
        this.buildLampShade();
    }

    /**
     * Builds the base of the lamp
     */
    buildBase(){
        const baseObj = this.contents.buildObject('Box')
        const baseHeight = 0.05*this.height;
        this.base = new MyEntity(this.contents, "baseLamp", this, this.width, this.depth, baseHeight, baseObj, this.outerMaterial, this.legoTexture, true, false)
        // Place the bottom of the base at 0,0,0
        this.base.move(0,baseHeight/2, 0);
    }

    /**
     * Builds the pole of the lamp
     */
    buildPole(){
        // Create the bottom pole
        const obj = this.contents.buildObject('Cylinder', 1, 1, 1, 32);
        const poleBottomWidth = 0.1*this.width;
        const poleBottomDepth = poleBottomWidth;
        const poleBottomHeight = 0.55*this.height;

        this.poleBottom = new MyEntity(this.contents, "poleBottom", this, poleBottomWidth, poleBottomDepth, poleBottomHeight, obj, this.outerMaterial, null, true, false);
        // Place it on top of the base
        this.poleBottom.move(0, poleBottomHeight/2 + this.base.height, 0);

        // Create a thinner and smaller pole on top of the bottom pole
        const poleTopWidth = 0.05*this.width;
        const poleTopDepth = poleTopWidth;
        const poleTopHeight = 0.3*this.height;
        this.poleTop = new MyEntity(this.contents, "poleTop", this, poleTopWidth, poleTopDepth, poleTopHeight, obj, this.outerMaterial, null, true, false);
        this.poleTop.move(0, poleTopHeight/2 + this.poleBottom.height + this.base.height, 0);
    }

    /**
     * Builds the bulb of the lamp and the light
     */
    buildBulb(){
        // Build the stem of the bulb
        const bulbStemObj = this.contents.buildObject('Cylinder', 1.3, 1, 1, 32);
        const bulbStemWidth = 0.05*this.width;
        const bulbStemDepth = bulbStemWidth;
        const bulbStemHeight = 0.05*this.height;
        this.bulbStem = new MyEntity(this.contents, "bulbStem", this, bulbStemWidth, bulbStemDepth, bulbStemHeight, bulbStemObj, this.bulbMaterial, null, true, false, false);
        this.bulbStem.move(0, bulbStemHeight/2 + this.poleTop.height + this.poleBottom.height + this.base.height, 0);

        // Build the round bulb
        const bulbObj = this.contents.buildObject('Sphere', 1, 32, 16);
        const bulbWidth = 0.05*this.height;
        const bulbDepth = bulbWidth;
        const bulbHeight = bulbWidth;
        this.bulb = new MyEntity(this.contents, "bulb", this, bulbWidth, bulbDepth, bulbHeight, bulbObj, this.bulbMaterial, null, true, false, false);
        const bulbY = bulbHeight/2 + this.bulbStem.height + this.poleTop.height + this.poleBottom.height + this.base.height
        this.bulb.move(0, bulbY, 0);

        // Build some screws
        this.screw1 = this.buildScrew();
        this.screw1.move(0, bulbStemHeight/2 + this.poleTop.height + this.poleBottom.height + this.base.height - bulbStemHeight/2, 0);

        this.screw2 = this.buildScrew();
        // Make it a bit bigger to correspond to the fact that bulbStem also gets bigger
        this.screw2.scaleTo(1.05, 1.05, null)
        this.screw2.move(0, bulbStemHeight/2 + this.poleTop.height + this.poleBottom.height + this.base.height - bulbStemHeight/2 + this.screw2.height/2, 0);

        // Create the light
        this.light = new THREE.PointLight(this.bulbMaterial.color, 500, 500);

        this.light.position.set(0, bulbStemHeight + this.poleTop.height + this.poleBottom.height + this.base.height, 0);
        this.group.add(this.light);

    }

    /**
     * Builds a screw for the lamp
     * @returns {MyEntity} The screw entity
     */
    buildScrew(){
        const screwObj = this.contents.buildObject('Torus')
        const screwWidth = this.bulbStem.width + this.bulbStem.width*0.2
        const screwDepth = 0.4*this.bulbStem.height
        const screwHeight = screwWidth

        let ent = new MyEntity(this.contents, "Screw", this, screwWidth, screwDepth, screwHeight, screwObj, this.screwMaterial, null, true, false, false);
        ent.rotate(Math.PI/2, 0, 0);

        return ent
    }

    /**
     * Builds the lampshade and the connectors to the pole
     */
    buildLampShade(){
        // Build the lampshade
        const obj = this.contents.buildObject('Cylinder', 1, 1.3, 1, 32, 1, true);
        const shadeWidth = 0.5*this.width;
        const shadeDepth = shadeWidth;
        const shadeHeight = 0.4*this.height;
        this.shade = new MyEntity(this.contents, "Lampshade", this, shadeWidth, shadeDepth, shadeHeight, obj, this.shadeMaterial, null, true, true);
        const lampShadeY = this.bulb.height + this.bulbStem.height + this.poleTop.height + this.poleBottom.height + this.base.height
        this.shade.move(0, lampShadeY, 0);

        // Build Cylinders that connect the lampshade
        const cylObj = this.contents.buildObject('Cylinder', 1, 1, 1, 32);
        const cylWidth = 0.02*this.width;
        const cylDepth = cylWidth;
        const cylHeight = shadeWidth*2*1.28;
        this.cyl1 = new MyEntity(this.contents, "cyl1", this, cylWidth, cylDepth, cylHeight, cylObj, this.outerMaterial, null, true, false);
        this.cyl1.move(0, lampShadeY - shadeHeight/2+ cylWidth, 0);
        this.cyl1.mesh.rotateX(Math.PI/2);
        this.cyl2 = new MyEntity(this.contents, "cyl2", this, cylWidth, cylDepth, cylHeight, cylObj, this.outerMaterial, null, true, false);
        this.cyl2.move(0, lampShadeY - shadeHeight/2 + cylWidth, 0);
        this.cyl2.mesh.rotateZ(Math.PI/2);
    }

    /**
     * Initializes the GUI for the lamp
     */
    initGui(){
        super.initGui(this);
        super.initGuiColorMaterials([this.outerMaterial]);
        this.initGuiMove();
        this.initGuiScale();
        super.initGuiLight(this.light, this.bulbMaterial);
        super.initGuiShadow();

        this.shade.initGui();
        this.shade.initGuiColor()
    }

    /**
     * Initializes the GUI elements for moving the candle
     */
    initGuiMove(){
        const moveFolder = this.folder.addFolder('Move');
        moveFolder.close()
        const step = 7 // lego distance

        moveFolder.add(this.group.position, 'x', -step*6, step*6, step).name('X')
        moveFolder.add(this.group.position, 'z', -step*6, step*6, step).name('Z')
    }

    /**
     * Initializes the GUI for scaling the fireplace
     */
    initGuiScale(){
        const scaleFolder = this.folder.addFolder('Scale');
        scaleFolder.close();
        this.scaleToX = scaleFolder.add(this.group.scale, 'x', 1, 7).name('width').step(1)
        this.scaleToY = scaleFolder.add(this.group.scale, 'y', 0.1, 1.6).name('height')
        this.scaleToZ = scaleFolder.add(this.group.scale, 'z', 1, 7).name('depth').step(1)
    }
}

export {MyLamp};

