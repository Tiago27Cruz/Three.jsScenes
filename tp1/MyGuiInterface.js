import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
        this.test = false;
        this.children = new Map();
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // 
        const shadowFolder = this.datgui.addFolder('Shadow Quality')
        shadowFolder.add(this.app.renderer.shadowMap, 'enabled').name("enabled").onChange(() => {
            this.app.renderer.shadowMap.needsUpdate = true;
            this.contents.deleteScene();
            this.contents.buildScene();
        });
        shadowFolder.add(this.app.renderer.shadowMap, 'type', {BasicShadowMap: 0, PCFShadowMap: 1, PCFSoftShadowMap: 2}).name("type").onChange(() => {
            this.app.renderer.shadowMap.needsUpdate = true;
            this.contents.deleteScene();
            this.contents.buildScene();
        });
        shadowFolder.close()


        // Add a folder for the ambient light
        const ambientLightFolder = this.datgui.addFolder('Ambient Light')
        ambientLightFolder.addColor(this.contents.ambientLight, 'color').name("color")
        ambientLightFolder.add(this.contents.ambientLight, 'intensity', 0, 1).name("intensity")
        ambientLightFolder.close()

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Perspective2', 'Left', 'Right', 'Top', 'Front', 'Bottom' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.close()
    }

    /**
     * Add a folder to the gui interface below the parent entity, if no parent is provided, the folder is added to the root of the gui interface
     * @param {MyEntity} entity 
     * @returns the folder created
     */
    addFolder(entity){
        if(entity.parent === null){
            this.children.set(entity.name, entity);
            return this.datgui.addFolder(entity.name);
        }

        return entity.parent.folder.addFolder(entity.name);

    }

}

export { MyGuiInterface };