
import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyContents } from './MyContents.js';
import Stats from 'three/addons/libs/stats.module.js'

/**
 * This class contains the application object
 */
class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null
        this.stats = null


        // other attributes
        this.renderer = null
        this.gui = null
        this.axis = null
        this.contents = null
        this.renderTarget = null;
        this.targetRenderTime = null;
        this.countdown = null;

    }
    /**
     * initializes the application
     */
    init() {
                
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );

        this.stats = new Stats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)


        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.scene.add(this.axis)
        }

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor("#000000");
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        // Configure renderer size
        this.renderer.setSize( window.innerWidth, window.innerHeight );


        this.renderTarget = new THREE.WebGLRenderTarget(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
        this.renderTarget.depthTexture = new THREE.DepthTexture();
        this.renderTarget.depthTexture.format = THREE.DepthFormat;
        this.renderTarget.depthTexture.type = THREE.FloatType;
        this.renderTarget.samples = 10;
        



        


        // Append Renderer to DOM
        document.getElementById("canvas").appendChild( this.renderer.domElement );

        //document.getElementById("canvas").style.filter = "blur(3px)";

        // manage window resizes
        window.addEventListener('resize', this.onResize.bind(this), false );

        //manage window keyboard event signals
        window.addEventListener('keydown', this.onKeyDown.bind(this), false);
        window.addEventListener('keyup', this.onKeyUp.bind(this), false);

        document.addEventListener(
            // "pointermove",
            // "mousemove",
            "pointerdown",
            // list of events: https://developer.mozilla.org/en-US/docs/Web/API/Element
            this.onMouseClick.bind(this)
        );
    }

    onMouseClick(event){
        if(this.contents !== null){
            this.contents.game.eventHandler.onMouseClick(event);
        }

    }

    /**
     * Handler for when the keyboard key is pressed
     * @param {Event} event
     */
    onKeyDown(event){
        if(this.contents !== null) {
            this.contents.game.eventHandler.onKeyDown(event);
        }
    }
    /**
     * Handler for when a keyboard key is released
     * @param {Event} event
     */
    onKeyUp(event){
        if(this.contents != undefined && this.contents !== null) {
            this.contents.game.eventHandler.onKeyUp(event);
        }
    }





    /**
     * the window resize handler
     */
    onResize() {
        if (this.contents != undefined && this.contents != null) {
            this.contents.game.eventHandler.onResize();
        }
    }
    /**
     * 
     * @param {MyContents} contents the contents object 
     */
    setContents(contents) {
        this.contents = contents;
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {   
        this.gui = gui
    }

    onResize(){
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderTarget.setSize(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio);
        this.countdown = 0;
        this.contents.game.activeCamera.saveFrame();
    }

    saveFrame(activeCamera){
        if(this.targetRenderTime != null) {
            this.countdown--;
            if(this.countdown <= 0) {
                this.countdown = this.targetRenderTime;
                this.renderer.setRenderTarget(this.renderTarget);
                this.renderer.render(this.scene, activeCamera);
                this.renderer.setRenderTarget(null);
            }
        }
    }

    renderFrame(activeCamera){

        this.renderer.render(this.scene, activeCamera);
    }

    renderToTargetOnInterval(timeout){
        this.targetRenderTime = timeout;
        this.countdown = this.targetRenderTime;
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
        this.stats.begin()


        // update camera and controls
        if(this.contents != null){
            this.contents.game.update();
        }


        // subsequent async calls to the render loop
        requestAnimationFrame( this.render.bind(this) );

        this.stats.end()
    }
}


export { MyApp };