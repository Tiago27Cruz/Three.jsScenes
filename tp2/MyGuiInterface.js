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
        // Globals Folder
        const globalsFolder = this.datgui.addFolder('Globals')
        globalsFolder.addColor(this.app.scene, 'background').name("background color")
        const ambientLight = this.contents.globals.get('ambient')
        globalsFolder.addColor(ambientLight, 'color').name("ambient color")
        globalsFolder.add(ambientLight, 'intensity', 0, 1).name("ambient intensity")
        
        const fogFolder = globalsFolder.addFolder('Fog')
        fogFolder.add(this.app.scene.fog, 'near', 0, 100).name("near")
        fogFolder.add(this.app.scene.fog, 'far', 0.1, 500).name("far")
        fogFolder.addColor(this.app.scene.fog, 'color').name("color")
        fogFolder.close()

        globalsFolder.close()

        // Cameras Folder
        const cameraFolder = this.datgui.addFolder('Camera')
        const cameraNames = Object.keys(this.app.cameras);
        cameraFolder.add(this.app, 'activeCameraName', cameraNames ).name("active camera");
        cameraFolder.add(this.app.activeCamera.position, 'x', -50, 50).name("x coord")
        cameraFolder.close()
    }

    /**
     * Add a folder to the gui interface below the parent entity, if no parent is provided, the folder is added to the root of the gui interface
     * @param {MyEntity} entity 
     * @returns the folder created
     */
    addFolder(entity){
        if(entity.parent === null){
            return this.datgui.addFolder(entity.name);
        }

        return entity.parent.folder.addFolder(entity.name);

    }
}

export { MyGuiInterface };