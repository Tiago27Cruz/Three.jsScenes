import {MyEntity} from './MyEntity.js';

class MyTv extends MyEntity {
    /**
     * Tv constructor
     * @param {MyContents} contents
     * @param {Text} name
     * @param {MyEntity} parent
     * @param {Number} width
     * @param {Number} depth
     * @param {Number} height
     * @param {MyEntity} lego - Lego entity associated with the TV
     * @param {MyEntity} parent_legos - All legos of the parent entity (as a single entity)
     */
    constructor(contents, name = "Tv", parent = null, width = 1, depth= 1, height=1, lego = null, parent_legos = null) {
        super(contents, name, parent, width, depth, height);
        this.lego = lego;
        this.parent_legos = parent_legos;
        this.init();
    }

    /**
     * Initializes the TV
     */
    init(){
        // Calls the parent init method for the default initialization
        super.init(this);
        

        this.initPrimitives();
        this.initTextures();
        this.initMaterials();
        
        this.initGui();
        this.box_size = 1;

        this.build();
    }

    /**
     * Initializes the primitives used by the TV
     */
    initPrimitives(){
        this.box_primitive = this.contents.buildObject('Box');
        this.button_primitive = this.contents.buildObject('Cylinder', 1, 1, 1, 32, 1, false);
        this.ball_primitive = this.contents.buildObject('Sphere', 1, 32);
    }

    /**
     * Initializes the materials used by the TV
     */
    initMaterials(){
        this.frame_material = this.contents.materials.get('Phong').clone();
        this.frame_material.color.set('#D3D3D3');

        this.button_material = this.contents.materials.get("Phong").clone();
        this.button_material.color.set('#808080');

        this.screen_colors = ['#FFFFFF', '#FFFF00', '#00FFFF', '#32CD32', '#FFC0CB', '#FF0000', '#0000FF'];
    }

    /**
     * Initializes the textures used by the TV
     */
    initTextures(){
        this.single_lego_texture = this.contents.loadTexture('single_lego2').clone();
    }
    /**
     * builds the TV
     */
    build(){
        /**
         * builds the TV frame
         */
        const buildFrame = () => {
            let top;
            //fetch the top side of the tv if it already exists, otherwise create a new one
            if(this.children.has("Top")) top = this.children.get("Top");
            else top = new MyEntity(this.contents, "Top", this, this.width, this.depth, this.box_size, this.box_primitive, this.frame_material, this.single_lego_texture, true, false, true);
            top.moveTo(0, 0, 0);
            top.scaleTo(this.width+this.box_size*2, this.box_size, this.depth);
            top.move(this.box_size, top.mesh.scale.y/2 + this.height+this.box_size);
    
            let bottom;
            //fetch one of the bottom sides of the tv if it already exists, otherwise create a new one
            if(this.children.has("Bottom")) bottom = this.children.get("Bottom");
            else bottom = new MyEntity(this.contents, "Bottom", this, this.width, this.depth, this.box_size, this.box_primitive, this.frame_material, this.single_lego_texture, true, false, true);
            bottom.moveTo(0, 0, 0);
            bottom.scaleTo(this.width, this.box_size, this.depth);
            bottom.move(0, bottom.mesh.scale.y/2+bottom.mesh.scale.y);

            let bottom2;
            //fetch one of the bottom sides of the tv if it already exists, otherwise create a new one
            if(this.children.has("Bottom2"))bottom2 = this.children.get("Bottom2");
            else bottom2 = new MyEntity(this.contents, "Bottom2", this, this.width, this.depth, this.box_size, this.box_primitive, this.frame_material, this.single_lego_texture, true, false, true);
            bottom2.moveTo(0, 0, 0);
            bottom2.scaleTo(this.width, this.box_size, this.depth);
            bottom2.move(0, bottom2.mesh.scale.y/2);
    
            let left;
            //fetch the left side of the tv if it already exists, otherwise create a new one
            if(this.children.has("Left")) left = this.children.get("Left");
            else left = new MyEntity(this.contents, "Left", this, this.box_size, this.depth, this.height-this.box_size, this.box_primitive, this.frame_material, this.single_lego_texture, true, false, true);
            left.moveTo(0, 0, 0);
            left.scaleTo(this.box_size, this.height-this.box_size, this.depth);
            left.move(-this.width/2-left.mesh.scale.x/2, left.mesh.scale.y/2+bottom.mesh.scale.y+bottom2.mesh.scale.y);
    
            let right;
            //fetch the right side of the tv if it already exists, otherwise create a new one
            if(this.children.has("Right")) right = this.children.get("Right");
            else right = new MyEntity(this.contents, "Right", this, this.box_size*2, this.depth, this.height-this.box_size, this.box_primitive, this.frame_material, this.single_lego_texture, true, false, true);
            right.moveTo(0, 0, 0);
            right.scaleTo(this.box_size*2, this.height+this.box_size, this.depth);
            right.move(this.width/2+right.mesh.scale.x/2, right.mesh.scale.y/2);

            let back;
            //fetch the back of the tv if it already exists, otherwise create a new one
            if(this.children.has("Back")) back = this.children.get("Back");
            else back = new MyEntity(this.contents, "Back", this, this.width, this.box_size, this.height, this.box_primitive, this.frame_material, this.single_lego_texture, true, false, true);
            
            back.moveTo(0, 0, 0);
            back.scaleTo(this.width, this.height-this.box_size, this.box_size);
            back.move(-this.width/2+back.mesh.scale.x/2, back.mesh.scale.y/2+bottom.mesh.scale.y+bottom2.mesh.scale.y, -this.depth/2+back.mesh.scale.z/2-this.box_size);
        }

        /**
         * builds the TV buttons
         */
        const buildButtons = () => {
            const button_depth = 1;

            let topButton;
            //fetch the tv top button if it already exists, otherwise create a new one
            if(this.children.has("TopButton")) topButton = this.children.get("TopButton");
            else topButton = new MyEntity(this.contents, "TopButton", this, this.box_size/2, this.box_size/2, button_depth, this.button_primitive, this.button_material, this.single_lego_texture, true, false, true);

            topButton.moveTo(0, 0, 0);
            topButton.rotateTo(Math.PI/2);
            topButton.move(topButton.mesh.scale.x+this.width/2+this.box_size/2, topButton.mesh.scale.z+this.box_size*2+(this.height-this.box_size)/2, topButton.mesh.scale.y/2+this.depth/2);

            let bottomButton;
            //fetch the tv bottom button if it already exists, otherwise create a new one
            if(this.children.has("BottomButton")) bottomButton = this.children.get("BottomButton");
            else bottomButton = new MyEntity(this.contents, "BottomButton", this, this.box_size/2, this.box_size/2, button_depth, this.button_primitive, this.button_material, this.single_lego_texture, true, false, true);

            bottomButton.moveTo(0, 0, 0);
            bottomButton.rotateTo(Math.PI/2);
            bottomButton.move(bottomButton.mesh.scale.x+this.width/2+this.box_size/2, bottomButton.mesh.scale.z+this.box_size*2+(this.height-this.box_size)/2-topButton.mesh.scale.z*3, bottomButton.mesh.scale.y/2+this.depth/2);
        }

        /**
         * builds the TV Screen
         */
        const buildScreen = () => {
            //creates a entity for each block of the tv screen
            for(let i = 0; i < 7; i++){
                let screen;
                let name = "Screen" + (i+1);
                if(this.children.has(name)) screen = this.children.get(name);
                else {
                    screen = new MyEntity(this.contents, name, this, this.width/7, this.depth, this.height-this.box_size, this.box_primitive, this.contents.materials.get('Phong').clone(), this.single_lego_texture, true, false, true);
                    screen.updateColor(this.screen_colors[i], null, null, this.screen_colors[i], 0.3);
                }

                screen.moveTo(0, 0, 0);
                screen.scaleTo(this.width/7, this.height-this.box_size, this.depth);
                screen.move(-this.width/2+screen.mesh.scale.x/2+i*screen.mesh.scale.x, screen.mesh.scale.y/2+this.box_size*2);
                


            }
        }
        /**
         * builds the TV antenas
         */
        const buildAntenas = () => {
            const antena_height = 1;
            let antenaLeft;
            //fetch the left TV antena if it already exists, otherwise create a new one
            if(this.children.has("AntenaLeft")) antenaLeft = this.children.get("AntenaLeft");
            else antenaLeft = new MyEntity(this.contents, "AntenaLeft", this, this.box_size/2, this.box_size/2, antena_height, this.button_primitive, this.frame_material, this.single_lego_texture, true, false, true);

            antenaLeft.moveTo(0, 0, 0);
            antenaLeft.move(antenaLeft.mesh.scale.x*2-this.width/2, antenaLeft.mesh.scale.y/2+this.box_size*2+this.height);

            let antenaRight;
            //fetch the right TV antena if it already exists, otherwise create a new one
            if(this.children.has("AntenaRight")) antenaRight = this.children.get("AntenaRight");
            else antenaRight = new MyEntity(this.contents, "AntenaRight", this, this.box_size/2, this.box_size/2, antena_height, this.button_primitive, this.frame_material, this.single_lego_texture, true, false, true);

            antenaRight.moveTo(0, 0, 0);
            antenaRight.move(antenaRight.mesh.scale.x*2-this.width/2+antenaLeft.mesh.scale.x*3, antenaRight.mesh.scale.y/2+this.box_size*2+this.height);

            const line_height = 2;
            const rotation_angle = Math.PI/4;
            const y_offset = line_height/2-line_height*Math.sin(rotation_angle)/2;
            const x_offset = line_height*Math.cos(rotation_angle)/2;

            let leftLine;
            //fetch the left TV antena line if it already exists, otherwise create a new one
            if(this.children.has("LineLeft")) leftLine = this.children.get("LineLeft");
            else leftLine = new MyEntity(this.contents, "LineLeft", this, this.box_size/10, this.box_size/10, line_height, this.button_primitive, this.button_material, this.single_lego_texture, true, false, true);

            leftLine.rotateTo(null, null, rotation_angle);
            leftLine.moveToEntity(antenaLeft);
            leftLine.move(-x_offset, antenaLeft.mesh.scale.y/2+leftLine.mesh.scale.y/2-y_offset-leftLine.mesh.scale.x);

            let rightLine;
            //fetch the right TV antena line if it already exists, otherwise create a new one
            if(this.children.has("LineRight")) rightLine = this.children.get("LineRight");
            else rightLine = new MyEntity(this.contents, "LineRight", this, this.box_size/10, this.box_size/10, line_height, this.button_primitive, this.button_material, this.single_lego_texture, true, false, true);

            rightLine.rotateTo(null, null, -rotation_angle);
            rightLine.moveToEntity(antenaRight);
            rightLine.move(x_offset, antenaRight.mesh.scale.y/2+rightLine.mesh.scale.y/2-y_offset-rightLine.mesh.scale.x);

            const y_offset_ball = line_height*Math.sin(rotation_angle)/2;

            let leftBall;
            //fetch the left TV antena ball if it already exists, otherwise create a new one
            if(this.children.has("LeftBall")) leftBall = this.children.get("LeftBall");
            else leftBall = new MyEntity(this.contents, "LeftBall", this, this.box_size/10, this.box_size/10, this.box_size/10, this.ball_primitive, this.button_material, this.single_lego_texture, true, false, true);

            leftBall.moveToEntity(leftLine);
            leftBall.move(-x_offset-leftBall.mesh.scale.x/2, y_offset_ball+leftBall.mesh.scale.y/2);
            

            let rightBall;
            //fetch the right TV antena ball if it already exists, otherwise create a new one
            if(this.children.has("RightBall")) rightBall = this.children.get("RightBall");
            else rightBall = new MyEntity(this.contents, "RightBall", this, this.box_size/10, this.box_size/10, this.box_size/10, this.ball_primitive, this.button_material, this.single_lego_texture, true, false, true);

            rightBall.moveToEntity(rightLine);
            rightBall.move(x_offset+rightBall.mesh.scale.x/2, y_offset_ball+rightBall.mesh.scale.y/2);
        }

    
        buildFrame();

        buildButtons();

        buildScreen();

        buildAntenas();

    }

    /**
     * Adds the GUI elements of the candle
     */
    initGui(){
        super.initGui();
        super.initGuiColorMaterials([this.frame_material])
        //only move it if a tv lego exists
        if(this.lego !== null) super.initGuiMoveToLego();
        else super.initGuiMove(true, false, true);
        super.initGuiScale();
        super.initGuiRotate(false, true, false);
        this.initGuiShadow();

    }

}

export {MyTv};