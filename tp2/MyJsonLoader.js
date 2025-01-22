import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { MyEntity } from './MyEntity.js'
import { MyContents } from './MyContents.js';

class MyJsonLoader{
    /**
       Constructs the JsonLoader
       @param {MyContents} contents The application's contents
       @param {MyApp} app The application
       @param {JSON} data The json file read into a variable
    */
    constructor(contents, app, data){
        this.contents = contents
        this.app = app
        this.data = data
        this.textureLoader = new THREE.TextureLoader();
    }
    /**
       Initializes the JsonLoader
       @returns {Promise} Promises to store all of the json objects so it can be rendered into the scene
    */
    async init(){
        this.entities = new Map()

        return this.loadToMap(this.data)
        
        
    }
    /**
       Throws error
       @param {string} key The key of the error during parsing of the json
       @param {string} errorMessage The error message to display
    */
    throwError(key, errorMessage){
        throw new Error("At " + key + ": " + errorMessage);
    }
    /**
       Loads the globals from the json file
       @param {JSON} data The json file in the part where the globals are located at
    */
    loadGlobals(data){
        let r,g,b, color, intensity;

        for (let key in data) {
            switch (key) {
                case "background":
                    if (data[key].r === undefined) this.throwError(key, "Red component of background is not present");
                    if (data[key].g === undefined) this.throwError(key, "Green component of background is not present");
                    if (data[key].b === undefined) this.throwError(key, "Blue component of background is not present");
                    r = data[key].r;
                    g = data[key].g;
                    b = data[key].b;
                    color = new THREE.Color(r, g, b);
                    this.app.scene.background = color;
                    this.contents.globals.set(key, this.app.scene.background);
                    break;
                case "ambient":
                    if (data[key].r === undefined) this.throwError(key, "Red component of ambient is not present");
                    if (data[key].g === undefined) this.throwError(key, "Green component of ambient is not present");
                    if (data[key].b === undefined) this.throwError(key, "Blue component of ambient is not present");
                    r = data[key].r;
                    g = data[key].g;
                    b = data[key].b;
                    color = new THREE.Color(r, g, b);
                    if(data[key].intensity === undefined) this.throwError(key, "Intensity of ambient is not present");
                    intensity = data[key].intensity;
                    let ambientLight = new THREE.AmbientLight(color, intensity);
                    this.app.scene.add(ambientLight);
                    this.contents.globals.set(key, ambientLight);
                    break;
                case "fog":
                    let fogColor = new THREE.Color(data[key].color.r, data[key].color.g, data[key].color.b);
                    let fogNear = data[key].near;
                    let fogFar = data[key].far;
                    this.app.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);
                    this.contents.globals.set(key, this.app.scene.fog);
                    break;
                case "skybox":
                    let sbSizeX = data[key].size.x;
                    let sbSizeY = data[key].size.y;
                    let sbSizeZ = data[key].size.z;

                    let sbCenterX = data[key].center.x;
                    let sbCenterY = data[key].center.y;
                    let sbCenterZ = data[key].center.z;

                    let sbEmissiveR = data[key].emissive.r
                    let sbEmissiveG = data[key].emissive.g
                    let sbEmissiveB = data[key].emissive.b

                    let sbEmissiveColor = new THREE.Color(sbEmissiveR, sbEmissiveG, sbEmissiveB)

                    let sbIntensity = data[key].intensity
                    //store the textures of each side of the skybox
                    let sbTex = [data[key].front, data[key].back, data[key].up, data[key].down, data[key].left, data[key].right]

                    const sbGeo = new THREE.BoxGeometry(sbSizeX, sbSizeY, sbSizeZ);

                    
                    const sbMat = []
                    //create the materials for each side of the skybox
                    for(let i = 0; i < 6; i++){
                        sbMat.push(new THREE.MeshPhongMaterial(
                            {
                                side: THREE.BackSide, 
                                map: this.textureLoader.load(sbTex[i]),
                                emissive: sbEmissiveColor,
                                emissiveIntensity: sbIntensity
                                
                            }))
                    }
                    const sbMesh = new THREE.Mesh(sbGeo, sbMat);
                    sbMesh.position.set(sbCenterX, sbCenterY, sbCenterZ)

                    this.contents.app.scene.add(sbMesh)

                    this.contents.globals.set(key, data[key]);

                    break;
                default:
                    throw new Error("Globals Block key: " + key + " is not a valid key");
            }
        }
    }
    /**
       Loads the cameras from the json file
       @param {JSON} data The json file in the part where the cameras are located at
    */
    loadCameras(data){
        var camera

        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                camera = data[key]

                if (camera.type === "orthogonal"){
                    let cameraObject = new THREE.OrthographicCamera();

                    cameraObject.near = camera.near;
                    cameraObject.far = camera.far;

                    cameraObject.position.set(camera.location.x, camera.location.y, camera.location.z);

                    cameraObject.left = camera.left;
                    cameraObject.right = camera.right;
                    cameraObject.top = camera.top;
                    cameraObject.bottom = camera.bottom;
                    //create a new control for the camera so that when applying movement in the camera it doesn't affect the others
                    const control = new OrbitControls(cameraObject, this.app.renderer.domElement);
                    control.target.set(camera.target.x, camera.target.y, camera.target.z);
                    this.app.controls[key] = control;
                    this.app.cameras[key] = cameraObject;
                } else if (camera.type === "perspective") {
                    let cameraObject = new THREE.PerspectiveCamera();

                    cameraObject.fov = camera.angle
                    cameraObject.near = camera.near;
                    cameraObject.far = camera.far;

                    cameraObject.position.set(camera.location.x, camera.location.y, camera.location.z);
                    //create a new control for the camera so that when applying movement in the camera it doesn't affect the others
                    const control = new OrbitControls(cameraObject, this.app.renderer.domElement);
                    control.target.set(camera.target.x, camera.target.y, camera.target.z);
                    this.app.controls[key] = control;
                    this.app.cameras[key] = cameraObject;
                } else {
                    throw new Error("Camera Type: " + camera.type + " is not a valid type");
                }
            } else if (key === "initial") {
                this.initialCamera = data[key];
            } else {
                throw new Error("Cameras Block key: " + key + " is not a valid key");
            }
            
        }
        //sets the active camera to the one defined on the json file
        this.app.setActiveCamera(this.initialCamera);
    }
    /**
       Loads a Video Texture
       @param {string} key The key of the json file where the video texture is located at
       @param {JSON} data The json file in the part where the video texture is located at
    */
    async loadVideoTexture(key, data) {
        // Add video to HTML
        let video = document.createElement('video');
        video.style.display = 'none';
        video.id = key;
        video.autoplay = true;
        video.muted = true;
        video.preload = 'auto';
        video.loop = true;
    
        // Add source to video
        let source = document.createElement('source');
        source.src = data.filepath;
        source.type = 'video/mp4';
    
        // Append to HTML
        video.appendChild(source);
        document.body.appendChild(video);
    
        // Wait for the video to be ready
        const videoPromise = new Promise((resolve, reject) => {
            video.addEventListener('canplaythrough', resolve, { once: true });
            video.addEventListener('error', (err) => reject(new Error(`Failed to load video texture: ${err.message}`)), { once: true });
            resolve()
        });

        videoPromise.then(()=>{
            let texture = new THREE.VideoTexture(video);
            texture.colorSpace = THREE.SRGBColorSpace;
        
            // Add the texture to the contents
            this.contents.textures.set(key, texture);
        });
    
        // Create a video texture
        
    }
    /**
       Promises to load a mipmap of a texture
       @param {THREE.Texture} parentTexture the parent texture of the mipmap
       @param {number} level The index of the array where the mipmap is located at the texture.
       @param {string} path the path to the mipmap texture asset
       @returns {Promise} Promise that the mipmap was loaded
    */
    async loadMipmap(parentTexture, level, path)
    {
        return new Promise((resolve, reject) => {
            this.textureLoader.load(path, 
                function(mipmapTexture)  // onLoad callback
                {
                    if (mipmapTexture.image) {
                        parentTexture.mipmaps[level] = mipmapTexture.image;
                        parentTexture.needsUpdate = true;
                    } else {
                        console.error('Mipmap texture image is not loaded for path: ' + path);
                    }
                    resolve();
                },
                undefined, // onProgress callback currently not supported
                function(err) {
                    console.error('Unable to load the image ' + path + ' as mipmap level ' + level + ".", err)
                }
            )
    
        })
    }
    /**
       Loads the textures from the json file
       @param {JSON} data The json file in the part where the textures are located at
    */
    async loadTextures(data){
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                if(data[key].filepath === undefined) this.throwError(data[key], "Filepath is not present");
                if(data[key].isVideo === undefined) this.throwError(data[key], "isVideo is not present");

                // Load video textures in it's own function
                if(data[key].isVideo){
                    this.loadVideoTexture(key, data[key]);
                    continue
                }

                let texture = this.textureLoader.load(data[key].filepath);

                // Add mipmaps if they exist
                const keys = Object.keys(data[key]);
                if (keys.length > 2){
                    texture.generateMipmaps = false;
                    let index = 0
                    for(const mipmapKey of keys){
                        if (mipmapKey.startsWith("mipmap")) {
                            
                            // Check if the the mipmap number is valid
                            if ((index-2) === parseInt(mipmapKey.charAt(mipmapKey.length - 1))){
                                try{
                                    //await the loading of the mipmaps, so that the materials can't preemptively clone, thus loosing the parent's mipmap
                                    await this.loadMipmap(texture, index-2, data[key][mipmapKey])
                                    
                                }catch(err){
                                    console.error(err);
                                }

                            } else {
                                throw new Error("Textures Block key: " + mipmapKey + " is not valid due to invalid mipmap format");
                            }
                        } else if (mipmapKey !== "filepath" && mipmapKey !== "isVideo") {
                            throw new Error("Textures Block key: " + mipmapKey + " is not valid");
                        }
                        if (index > 9) throw new Error("Textures Block key: Too many parameters in: " + mipmapKey);
                        index++;
                    }
                }

                //store the texture
                this.contents.textures.set(key, texture);
            } else {
                throw new Error("Textures Block key: " + key + " is not valid");
            }
        }
    }
    /**
       Loads the materials from the json file
       @param {JSON} data The json file in the part where the materials are located at
    */
    loadMaterials(data){
        for (let key in data) {
            if (typeof data[key] !== 'object' || data[key] === null) {
                throw new Error("Materials Block key: " + key + " is not valid");
            }
            //if mandatory properties are not present, then throw an error
            if(data[key].color === undefined) this.throwError(data[key], "Color is not present");
            if(data[key].color.r === undefined) this.throwError(data[key], "Red component of color is not present");
            if(data[key].color.g === undefined) this.throwError(data[key], "Green component of color is not present");
            if(data[key].color.b === undefined) this.throwError(data[key], "Blue component of color is not present");
            if(data[key].specular === undefined) this.throwError(data[key], "Specular is not present");
            if(data[key].specular.r === undefined) this.throwError(data[key], "Red component of specular is not present");
            if(data[key].specular.g === undefined) this.throwError(data[key], "Green component of specular is not present");
            if(data[key].specular.b === undefined) this.throwError(data[key], "Blue component of specular is not present");
            if(data[key].shininess === undefined) this.throwError(data[key], "Shininess is not present");
            if(data[key].emissive === undefined) this.throwError(data[key], "Emissive is not present");
            if(data[key].emissive.r === undefined) this.throwError(data[key], "Red component of emissive is not present");
            if(data[key].emissive.g === undefined) this.throwError(data[key], "Green component of emissive is not present");
            if(data[key].emissive.b === undefined) this.throwError(data[key], "Blue component of emissive is not present");
            if(data[key].transparent === undefined) this.throwError(data[key], "Transparent is not present");
            if(data[key].opacity === undefined) this.throwError(data[key], "Opacity is not present");
            if(data[key].textureref !== undefined && (data[key].texlength_s === undefined || data[key].texlength_t === undefined)) this.throwError(data[key], "Texlength needs to be defined when a texture is present");

            let color = new THREE.Color(data[key].color.r, data[key].color.g, data[key].color.b);
            let specular = new THREE.Color(data[key].specular.r, data[key].specular.g, data[key].specular.b);
            let shininess = data[key].shininess;
            let emissive = new THREE.Color(data[key].emissive.r, data[key].emissive.g, data[key].emissive.b);
            let transparent = data[key].transparent;
            let opacity = data[key].opacity;

            // Optional values
            let wireframe = data[key].wireframe ?? false;
            let shadingbb = data[key].shading ?? false
            let texture = data[key].textureref ?? null;
            let texlength_s = data[key].texlength_s ?? 1; 
            let texlength_t = data[key].texlength_t ?? 1;
            let twosided = data[key].twosided ?? false;
            let bumpref = data[key].bumpref ?? null;
            let bumpscale = data[key].bumpscale ?? 1;
            let specularref = data[key].specularref ?? null;

            if (texture !== null) {
                if (!this.contents.textures.has(texture) && texture !== "null") {
                    throw new Error("Texture: " + texture + " for material: " + key + " does not exist");
                }
                if(texture === "null") texture = null;
                else {
                    //get the material's texture if he has one
                    texture = this.contents.textures.get(texture)
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                }
                
            }

            if (bumpref !== null) {
                if (!this.contents.textures.has(bumpref) && bumpref !== "null") {
                    throw new Error("Bump Texture: " + bumpref + " for material: " + key + " does not exist");
                }
                if (bumpref === "null") bumpref = null;
                else bumpref = this.contents.textures.get(bumpref).clone();
                //get the material's bump Map if he has one
                
            }

            if (specularref !== null) {
                if (!this.contents.textures.has(specularref) && specularref !== "null") {
                    throw new Error("Specular Texture: " + specularref + " for material: " + key + " does not exist");
                }
                if (specularref === "null") specularref = null;
                else specularref = this.contents.textures.get(specularref).clone();
                
            }
            //create the material
            let material = new THREE.MeshPhongMaterial({
                color: color,
                specular: specular,
                shininess: shininess,
                emissive: emissive,
                transparent: transparent,
                opacity: opacity,
                wireframe: wireframe,
                flatShading: shadingbb,
                map: texture,
                side: twosided ? THREE.DoubleSide : THREE.FrontSide,
                bumpMap: bumpref,
                bumpScale: bumpscale,
                specularMap: specularref
            });
            //store additional values to use later on
            material.texlength = {s: texlength_s, t: texlength_t};
            //store the material
            this.contents.materials.set(key, material);
        }
        if(!this.contents.materials.has("DEFAULT")){
            let defaultMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFFF});
            defaultMaterial.texlength = {s: 1, t: 1};
            this.contents.materials.set("DEFAULT", defaultMaterial);
        }

    }
    /**
       Loads the graph from the json file
       @param {JSON} data The json file in the part where the graph is located at
    */
    loadGraph(data){
        //store the parent entities of the json file
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                this.entities.set(key, data[key]);
            }
        }
        //create the root entity
        const root = new MyEntity(this.contents, data.rootid);
        root.entityConstructor(data[data.rootid]);
        if(root.material === null) {
            root.material = this.contents.materials.get("DEFAULT");
        }
        //create the entities that are children of the root
        this.createEntities(data.rootid, root);
        //add the root entity to the scene
        this.contents.app.scene.add(root.group)
        //free memory space
        this.entities = null;
    }
    /**
       Loads the everything from the json file
       @param {JSON} data The json file
       @returns {Promise} Promises to Load everything in the json file
    */
    async loadToMap(data) {
        for (let key in data) {
            if (typeof data[key] === 'object' && data[key] !== null) {
                switch (key) {
                    case "globals":
                        this.loadGlobals(data[key]);
                        break;
                    case "cameras":
                        this.loadCameras(data[key]);
                        break;
                    case "textures":
                        //await the mipmaps of the texture to finish loading before continuing
                        await this.loadTextures(data[key]);
                        break;
                    case "materials":
                        this.loadMaterials(data[key]);
                        break;
                    case "graph":
                        this.loadGraph(data[key]);
                        break;
                    case "yasf":
                        //await the loading of the graph after the first key of the json file
                        await this.loadToMap(data[key]);
                        break;
                    default:
                        if(key !== "yasf") {
                            throw new Error("Block Key: " + key + " is not a valid key");
                        }
                        break;
                }

            }
        }
        
    }
    /**
       Loads the children of the root node recursively
       @param {string} key The json key of the entity that is being loaded currently
       @param {MyEntity} node The parent entity of the current entity
    */
    createEntities(key, node){
        const object = this.entities.get(key);
        if(object === undefined) throw new Error("Entity in noderef " + key + " does not exist in the graph");
        let children = object.children;
        if(children !== undefined){
            //iterate through all the entity's children
            for (let [childKey, child] of Object.entries(children)){
                if(childKey === "nodesList"){
                    let nodeList = child;
                    //for each node in it's children
                    for (let noderef of nodeList){
                        //get the children node
                        let childObject = this.entities.get(noderef);
                        //create the children
                        let childEntity = new MyEntity(this.contents, noderef);
                        childEntity.entityConstructor(childObject);
                        //pass the parent's information
                        childEntity.setParent(node);
                        //visit the children's child
                        this.createEntities(noderef, childEntity);
                    }
                } 
                else if(childKey === "lodsList"){
                    let lodsList = child;
                    //for each load in it's children
                    for (let lod of lodsList){
                        //get the children lod
                        let childObject = this.entities.get(lod);
                        //create he lod
                        let childEntity = new MyEntity(this.contents, lod);
                        childEntity.lodConstructor(childObject);
                        //pass the parent's information
                        childEntity.setParent(node);
                        //visit the children's child
                        this.createEntities(lod, childEntity);
                    }
                }
                else {
                    // Create the child entity and set it's attributes
                    let childEntity = new MyEntity(this.contents, child);
                    childEntity.childConstructor(child, node);
                }
            }
        }
        let lodNodes = object.lodNodes;
        if(lodNodes !== undefined){
            //for each node in the entity's lodNodes
            for(let child of lodNodes){
                //get the child node
                let childObject = this.entities.get(child.nodeId);
                //create the child
                let childEntity = new MyEntity(this.contents);
                childEntity.entityConstructor(childObject);
                //set the distance to view it
                childEntity.mindist = child.mindist;
                //pass the parent's information
                childEntity.setParent(node);
                //visit the children's child
                this.createEntities(child.nodeId, childEntity);
            }
            

        }
        
    }


}

export { MyJsonLoader };