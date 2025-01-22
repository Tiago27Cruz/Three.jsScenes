import * as THREE from 'three';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import { MyContents } from './MyContents.js';

class MyEntity{
    /**
       constructs an entity
       @param {MyContents} contents The contents of the application
       @param {string} name The name of the entity
    */
    constructor(contents, name = "Entity"){
        this.contents = contents
        this.name = name
        this.parent = null
        this.material = null
        this.castShadows = false
        this.receiveShadows = false
    }
    /**
       Sets the parent of the current entity and deals with inherited properties.
       @param {parent} MyEntity The parent entity
    */
    setParent(parent){
        //if the parent isn't a LOD
        if(this.mindist === undefined) parent.group.add(this.group);
        //if parent is a LOD
        else parent.group.addLevel(this.group, this.mindist);
        
        //if this entity has no material, then inherit the parent's material
        if(this.material === null) this.material = parent.material
        
        //it this entity doesn't cast or receive shadows then inherit the respective parents properties.
        if(this.castShadows === false) this.castShadows = parent.castShadows
        if(this.receiveShadows === false) this.receiveShadows = parent.receiveShadows
    }
    /**
       Helper function to convert degrees into radians
       @param {number} degree The degrees to be converted
       @returns {number} The radians that were converted from degrees.
    */
    degreeToRadians(degree){
        return degree * Math.PI / 180
    }
    /**
       Constructs an entity that is a LOD
       @param {JSON} data Part of the json file where this entity is located at.
    */
    lodConstructor(data){
        if(data === undefined) throw new Error("Data not defined for entity: " + this.name)
        //Create LOD object.
        this.group = new THREE.LOD();
        
    }
    /**
       constructs an Entity that has children that reference other nodes or LODS.
       @param {JSON} data Part of the json file where this entity is located at.
    */
    entityConstructor(data){
        if(data === undefined) throw new Error("Data not defined for entity: " + this.name)
        //Create the Group object
        this.group = new THREE.Group()

        // Shadows
        if(data.castshadows !== undefined) this.castShadows = data.castshadows
        if(data.receiveshadows !== undefined) this.receiveShadows = data.receiveshadows
        
        // Transformations
        if (data.transforms !== undefined) {
            for (let transform of data.transforms) {
                switch (transform.type) {
                    case "translate":
                        this.translate = [transform.amount.x, transform.amount.y, transform.amount.z]
                        break
                    case "rotate":
                        this.rotate = [transform.amount.x, transform.amount.y, transform.amount.z]
                        break
                    case "scale":
                        this.scale = [transform.amount.x, transform.amount.y, transform.amount.z]
                        break
                    default:
                        throw new Error("Invalid transformation type")
                }
            }
        }
        //declare default transformations to apply in case they weren't mentioned in the json file
        let defaultTrans = [0,0,0]
        let defaultRot = [0,0,0]
        let defaultScale = [1,1,1]

        if (this.translate === undefined) this.translate = defaultTrans
        if (this.rotate === undefined) this.rotate = defaultRot
        if (this.scale === undefined) this.scale = defaultScale

        //convert rotation degrees to radians.
        this.rotate[0] = this.degreeToRadians(this.rotate[0])
        this.rotate[1] = this.degreeToRadians(this.rotate[1])
        this.rotate[2] = this.degreeToRadians(this.rotate[2])
        //apply transformations
        if (this.translate !== defaultTrans) this.group.position.set(this.translate[0], this.translate[1], this.translate[2])
        if (this.rotate !== defaultRot) this.group.rotation.set(this.rotate[0], this.rotate[1], this.rotate[2])
        if (this.scale !== defaultScale) this.group.scale.set(this.scale[0], this.scale[1], this.scale[2])

        // Material
        if (data.materialref !== undefined) {

            if (typeof data.materialref !== "object" || data.materialref === null) throw new Error("materialId not defined or null")
            if (data.materialref.materialId === undefined) throw new Error("materialId not defined")
            let material = this.contents.materials.get(data.materialref.materialId)
            if (material === undefined) throw new Error("Material " + data.materialref.materialId + " not found")
            this.material = material
        }
    }

    /**
       Constructs the primitive child of an entity
       @param {JSON} data Part of the json file where this entity is located at.
       @param {MyEntity} parent The parent Entity of this entity
    */
    childConstructor(data, parent){
        if (parent === null) throw new Error("Parent not defined")

        let texlength_s = 1
        let texlength_t = 1
        //if the parent of this entity doesn't exist than obtain a default material
        if(parent.material === null){
            this.material = this.contents.materials.get("DEFAULT")
        } 
        else {
            //obtain the parents texlength attributes
            texlength_s = parent.material.texlength.s
            texlength_t = parent.material.texlength.t
            //clone the parent material and texture in order to apply the texlengths correctly
            this.material = parent.material.clone()
            if(parent.material.map !== null) this.material.map = parent.material.map.clone();
        }
        //initialize variables
        let geometry, parts_x, parts_y, parts_z
        let base, top, width, height, depth, slices, stacks, thetastart, thetalength, phistart, philength, dir1, dir2, v0, v1, v2, normal, normals, uvs
        let texture, repeat_u, repeat_v

        let vertices


        switch(data.type){
            case "rectangle":
                
                parts_x = data.parts_x ?? 1
                parts_y = data.parts_y ?? 1

                if (data.xy1.x === undefined) throw new Error("Rectangle xy1.x not defined");
                if (data.xy1.y === undefined) throw new Error("Rectangle xy1.y not defined");
                if (data.xy2.x === undefined) throw new Error("Rectangle xy2.x not defined");
                if (data.xy2.y === undefined) throw new Error("Rectangle xy2.y not defined");

                width = Math.abs(data.xy2.x - data.xy1.x)
                height = Math.abs(data.xy2.y - data.xy1.y)

                geometry = new THREE.PlaneGeometry(
                    width, height,
                    parts_x, parts_y
                )

                this.applyTexLength(texlength_s, texlength_t, width, height);


                this.mesh = new THREE.Mesh( geometry, this.material );
                this.mesh.position.set(data.xy1.x + width/2, data.xy1.y + height/2, 0)
                this.mesh.receiveShadow = parent.receiveShadows
                this.mesh.castShadow = parent.castShadows

                parent.group.add(this.mesh)
                break;
            case "triangle":
                geometry = new THREE.BufferGeometry()
                if (data.xyz1.x === undefined) throw new Error("Triangle xyz.x not defined");
                if (data.xyz1.y === undefined) throw new Error("Triangle xyz.y not defined");
                if (data.xyz1.z === undefined) throw new Error("Triangle xyz.z not defined");
                if (data.xyz2.x === undefined) throw new Error("Triangle xyz.x not defined");
                if (data.xyz2.y === undefined) throw new Error("Triangle xyz.y not defined");
                if (data.xyz2.z === undefined) throw new Error("Triangle xyz.z not defined");
                if (data.xyz3.x === undefined) throw new Error("Triangle xyz.x not defined");
                if (data.xyz3.y === undefined) throw new Error("Triangle xyz.y not defined");
                if (data.xyz3.z === undefined) throw new Error("Triangle xyz.z not defined");
                vertices = new Float32Array([
                    data.xyz1.x, data.xyz1.y, data.xyz1.z,
                    data.xyz2.x, data.xyz2.y, data.xyz2.z,
                    data.xyz3.x, data.xyz3.y, data.xyz3.z
                ])

                geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

                // Calculate normals
                v0 = new THREE.Vector3(data.xyz1.x, data.xyz1.y, data.xyz1.z);
                v1 = new THREE.Vector3(data.xyz2.x, data.xyz2.y, data.xyz2.z);
                v2 = new THREE.Vector3(data.xyz3.x, data.xyz3.y, data.xyz3.z);

                // dir1 = v1 - v0
                dir1 = new THREE.Vector3().subVectors(v1, v0);
                // dir2 = v2 - v0
                dir2 = new THREE.Vector3().subVectors(v2, v0);

                // Cross vectors calculates the normal to both vectors
                normal = new THREE.Vector3().crossVectors(dir1, dir2).normalize();

                normals = new Float32Array([
                    normal.x, normal.y, normal.z,
                    normal.x, normal.y, normal.z,
                    normal.x, normal.y, normal.z
                ]);

                geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

                // UVs
                let c = dir1.length()
                let b = dir2.length()
                let a = (new THREE.Vector3().subVectors(v2, v1)).length()

                let cosa = (b**2 + c**2 - a**2) / (2* b* c)
                let alpha = Math.acos(cosa)
                let sina = Math.sin(alpha)

                let uv2 = c / texlength_s

                let uv31 = b * cosa / texlength_s
                let uv32 = b * sina / texlength_t
                
                uvs = new Float32Array([
                    0, 0,
                    uv2, 0,
                    uv31, uv32
                ]);

                geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

                this.mesh = new THREE.Mesh( geometry, this.material );
                this.mesh.receiveShadow = parent.receiveShadows
                this.mesh.castShadow = parent.castShadows

                parent.group.add(this.mesh)

                break;
            case "box":
                parts_x = data.parts_x ?? 1
                parts_y = data.parts_y ?? 1
                parts_z = data.parts_z ?? 1

                if (data.xyz1.x === undefined) throw new Error("Box xyz1.x not defined");
                if (data.xyz1.y === undefined) throw new Error("Box xyz1.y not defined");
                if (data.xyz1.z === undefined) throw new Error("Box xyz1.z not defined");
                if (data.xyz2.x === undefined) throw new Error("Box xyz2.x not defined");
                if (data.xyz2.y === undefined) throw new Error("Box xyz2.y not defined");
                if (data.xyz2.z === undefined) throw new Error("Box xyz2.z not defined");

                width = Math.abs(data.xyz2.x - data.xyz1.x)
                height = Math.abs(data.xyz2.y - data.xyz1.y)
                depth = Math.abs(data.xyz2.z - data.xyz1.z)

                geometry = new THREE.BoxGeometry(
                    width, height, depth,
                    parts_x, parts_y, parts_z
                )
                this.applyTexLength(texlength_s, texlength_t, width, height);

                

                this.mesh = new THREE.Mesh( geometry, this.material );
                this.mesh.position.set(data.xyz1.x + width/2, data.xyz1.y + height/2, data.xyz1.z + depth/2)
                this.mesh.receiveShadow = parent.receiveShadows
                this.mesh.castShadow = parent.castShadows

                parent.group.add(this.mesh)

                break;
            case "cylinder":
                // Obligatory
                if(data.base === undefined) throw new Error("Cylinder Base not defined"); else base = data.base
                if(data.top === undefined) throw new Error("Cylinder Top not defined"); else top = data.top
                if(data.height === undefined) throw new Error("Cylinder Height not defined"); else height = data.height
                if(data.slices === undefined) throw new Error("Cylinder Slices not defined"); else slices = data.slices
                if(data.stacks === undefined) throw new Error("Cylinder Stacks not defined"); else stacks = data.stacks
                // Optional
                data.capsclose = data.capsclose ?? false;
                data.thetastart = data.thetastart ?? 0;
                data.thetalength = data.thetalength ?? 360;



                geometry = new THREE.CylinderGeometry(
                    top, base, height, slices, stacks, !data.capsclose, this.degreeToRadians(data.thetastart), this.degreeToRadians(data.thetalength)
                )
                this.applyTexLength(texlength_s, texlength_t, 2 * Math.PI * base, height);
                

                this.mesh = new THREE.Mesh( geometry, this.material );
                this.mesh.receiveShadow = parent.receiveShadows
                this.mesh.castShadow = parent.castShadows

                parent.group.add(this.mesh)

                break;
            case "sphere":
                // Obligatory
                if(data.radius === undefined) throw new Error("Sphere Radius not defined")
                if(data.slices === undefined) throw new Error("Sphere Slices not defined")
                if(data.stacks === undefined) throw new Error("Sphere Stacks not defined")

                // Optional
                thetastart = data.thetastart ?? 0
                thetalength = data.thetalength ?? Math.PI
                phistart = data.phistart ?? 0
                philength = data.philength ?? 2*Math.PI
                
                geometry = new THREE.SphereGeometry(
                    data.radius, data.slices, data.stacks, phistart, philength, thetastart, thetalength
                )
                this.applyTexLength(texlength_s, texlength_t, 2 * Math.PI * data.radius, data.radius);



                this.mesh = new THREE.Mesh( geometry, this.material );
                this.mesh.receiveShadow = parent.receiveShadows
                this.mesh.castShadow = parent.castShadows

                parent.group.add(this.mesh)

                break;
            case "nurbs":
                // Obligatory
                if (data.degree_u === undefined) throw new Error("NURBS Degree_u not defined")
                if (data.degree_v=== undefined) throw new Error("NURBS Degree_v not defined")
                if (data.parts_v === undefined) throw new Error("NURBS Parts_v not defined")
                if (data.parts_u === undefined) throw new Error("NURBS Parts_u not defined")
                if (data.controlpoints === undefined) throw new Error("NURBS ControlPoints not defined")

                let controlpoints = []
                let points = []
                let counter_v = 0
                let counter_u = 0

                for (let i = 0; i < data.controlpoints.length; i++) {
                    points.push([data.controlpoints[i].x, data.controlpoints[i].y, data.controlpoints[i].z])
                    
                    counter_v++
                    if (counter_v === data.degree_v+1) {
                        controlpoints.push(points)
                        points = []
                        counter_v = 0
                        counter_u++
                    }
                }

                if (counter_u !== data.degree_u+1) throw new Error("NURBS ControlPoints degree_u not correct in: " + this.name)
                if (counter_v > 0) throw new Error("NURBS ControlPoints degree_v not correct in: " + this.name)

                const builder = new MyNurbsBuilder()
                const surfaceData = builder.build(controlpoints, data.degree_u, data.degree_v, data.parts_u, data.parts_v)
                this.mesh = new THREE.Mesh(surfaceData, this.material)
                this.mesh.receiveShadow = parent.receiveShadows
                this.mesh.castShadow = parent.castShadows
                
                parent.group.add(this.mesh)

                break;
            case "polygon":

                if (data.radius === undefined) throw new Error("Polygon radius not defined");
                if (data.stacks === undefined) throw new Error("Polygon stacks not defined");
                if (data.slices === undefined) throw new Error("Polygon slices not defined");
                if (data.color_c === undefined) throw new Error("Polygon center color not defined");
                if (data.color_p === undefined) throw new Error("Polygon periphery color not defined");
                
                let radius = data.radius;
                stacks = data.stacks;
                slices = data.slices;
                let colorC = new THREE.Color(data.color_c.r, data.color_c.g, data.color_c.b);
                let colorP = new THREE.Color(data.color_p.r, data.color_p.g, data.color_p.b);
            
                //clone parent material so the colors of this polygon can override the parent's colors.
                this.material = this.material.clone();
                //set vertex colors to true to that colors can be visibally applied to the geometry
                this.material.vertexColors = true;


                vertices = [0, 0, 0]
                normals = [0, 0, 1]
                //const center_s = radius/(texlength_s);
                //const center_t = radius/(texlength_t);
                //uvs = [center_s, center_t];
                //initialize the center as half of the dimensions of the texture
                uvs = [0.5, 0.5];
                const colors = [colorC.r, colorC.g, colorC.b]
                const indices = []
                //for every slice
                for(let current_slice = 0; current_slice < slices; current_slice++){
                    let angle = (2*Math.PI*current_slice)/slices;
                    if(slices % 2 == 0) angle += (2*Math.PI)/(slices*2);
                    else angle += (2*Math.PI)/(slices*4);
                    let rad = radius;
                    //for every stack
                    for(let current_stack = 0; current_stack <stacks; current_stack++){
                        //INDICES
                        let current_vertice = stacks*current_slice+1+current_stack
                        let next_slice_vertice = current_vertice + stacks
                        if(current_slice == slices-1){
                            next_slice_vertice = 1+current_stack
                        }
                        if(current_stack < stacks-1){
                            indices.push(next_slice_vertice, next_slice_vertice+1, current_vertice)
                            indices.push(next_slice_vertice+1, current_vertice+1, current_vertice)
                        }
                        else{
                            indices.push(next_slice_vertice, 0, current_vertice)
                        }
                        //VERTICES
                        vertices.push(rad*Math.cos(angle), rad*Math.sin(angle), 0)
                        //NORMALS
                        normals.push(0, 0, 1)

                        //uvs.push(center_s+rad*Math.cos(angle)/texlength_s, center_t+rad*Math.sin(angle)/texlength_t);

                        
                        //UVS
                        uvs.push(0.5+(rad*0.5)*Math.cos(angle)/radius, 0.5+(rad*0.5)*Math.sin(angle)/radius);
                        //uvs.push(texlength_s/2+((rad*texlength_s/2)/(radius))*Math.cos(angle), texlength_t/2+((rad*texlength_t/2)/(radius))*Math.sin(angle))

                        //COLORS
                        const interpolated_color = colorC.clone().lerp(colorP, rad/radius);
                        colors.push(interpolated_color.r, interpolated_color.g, interpolated_color.b);
                        rad -= radius/stacks
                    }
                }

                const bufferGeometry = new THREE.BufferGeometry()
                bufferGeometry.setIndex(indices)
                bufferGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute(vertices, 3).onUpload(disposeArray));
                bufferGeometry.setAttribute( 'normal', new THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray));
                bufferGeometry.setAttribute('uv', new THREE.Float32BufferAttribute( uvs, 2).onUpload(disposeArray));
                bufferGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
                this.applyTexLength(texlength_s, texlength_t, radius*2, radius*2);
                this.mesh = new THREE.Mesh(bufferGeometry, this.material);
                this.mesh.receiveShadow = parent.receiveShadows
                this.mesh.castShadow = parent.castShadows
                //recompute vertex normals so that the colors actually display into the screen
                bufferGeometry.computeVertexNormals()
                parent.group.add(this.mesh)
                //set this material into the global materials map so that it can be referenced later on if needed
                this.contents.materials.set(parent.name + "PolygonChildMaterial:" + this.name, this.material);

                break;
            case "pointlight":
                this.enabled = data.enabled ?? true
                
                if (data.color === undefined) throw new Error("PointLight Color not defined")
                this.color = new THREE.Color()
                this.color.r = data.color.r
                this.color.g = data.color.g
                this.color.b = data.color.b
                this.intensity = data.intensity ?? 1
                this.distance = data.distance ?? 1000

                this.decay = data.decay ?? 2

                if (data.position === undefined) throw new Error("PointLight Position not defined")
                this.position = data.position
                
                this.castShadow = data.castshadow ?? false

                this.shadowFar = data.shadowfar ?? 500

                this.shadowMapSize = data.shadowmapsize ?? 512

                this.light = new THREE.PointLight(this.color, this.intensity, this.distance, this.decay)
                this.light.position.set(this.position.x, this.position.y, this.position.z)
                this.light.castShadow = this.castShadow
                this.light.shadow.camera.far = this.shadowFar
                this.light.shadow.mapSize.width = this.shadowMapSize
                this.light.shadow.mapSize.height = this.shadowMapSize

                parent.group.add(this.light)
                break;
            case "spotlight":
                this.enabled = data.enabled ?? true

                if (data.color === undefined) throw new Error("SpotLight Color not defined")
                
                this.color = new THREE.Color()
                this.color.r = data.color.r
                this.color.g = data.color.g
                this.color.b = data.color.b
                this.intensity = data.intensity ?? 1
                this.distance = data.distance ?? 1000

                if (data.angle === undefined) throw new Error("SpotLight Angle not defined")
                this.angle = this.degreeToRadians(data.angle)

                this.decay = data.decay ?? 2
                this.penumbra = data.penumbra ?? 1

                if (data.position === undefined) throw new Error("SpotLight Position not defined")
                this.position = data.position
                if(data.target === undefined) throw new Error("SpotLight Target not defined")
                this.target = data.target

                this.castShadow = data.castshadow ?? false
                this.shadowFar = data.shadowfar ?? 500
                this.shadowMapSize = data.shadowmapsize ?? 512

                this.light = new THREE.SpotLight(this.color, this.intensity, this.distance, this.angle, this.penumbra, this.decay)
                this.light.position.set(this.position.x, this.position.y, this.position.z)
                this.light.target.position.set(this.target.x, this.target.y, this.target.z)
                this.light.castShadow = this.castShadow
                this.light.shadow.camera.far = this.shadowFar
                this.light.shadow.mapSize.width = this.shadowMapSize
                this.light.shadow.mapSize.height = this.shadowMapSize

                parent.group.add(this.light)
                parent.group.add(this.light.target)

                break;
            case "directionallight":
                this.enabled = data.enabled ?? true

                if (data.color === undefined) throw new Error("DirectionalLight Color not defined")
                this.color = new THREE.Color()
                this.color.r = data.color.r
                this.color.g = data.color.g
                this.color.b = data.color.b
                this.intensity = data.intensity ?? 1

                if (data.position === undefined) throw new Error("DirectionalLight Position not defined")
                this.position = data.position

                this.castShadow = data.castshadow ?? false
                this.shadowLeft = data.shadowleft ?? -5
                this.shadowRight = data.shadowright ?? 5
                this.shadowBottom = data.shadowbottom ?? -5
                this.shadowTop = data.shadowtop ?? 5
                this.shadowFar = data.shadowfar ?? 500
                this.shadowMapSize = data.shadowmapsize ?? 512

                this.light = new THREE.DirectionalLight(this.color, this.intensity)
                this.light.position.set(this.position.x, this.position.y, this.position.z)
                this.light.castShadow = this.castShadow
                this.light.shadow.camera.left = this.shadowLeft
                this.light.shadow.camera.right = this.shadowRight
                this.light.shadow.camera.bottom = this.shadowBottom
                this.light.shadow.camera.top = this.shadowTop
                this.light.shadow.camera.far = this.shadowFar
                this.light.shadow.mapSize.width = this.shadowMapSize
                this.light.shadow.mapSize.height = this.shadowMapSize

                parent.group.add(this.light)
                break;
        }
    }
    /**
       Applies the texlength to an Entity
       @param {number} texlength_s The texlength_s attribute of the entity's material
       @param {number} texlength_t The texlength_t attribute of the entity's material
       @param {number} s_real_dimension The dimensions of the geometry on the direction where texlength_s will be applied
       @param {number} t_real_dimension The dimensions of the geometry on the direction where texlength_t will be applied

    */
    applyTexLength(texlength_s, texlength_t, s_real_dimension, t_real_dimension){
        if (this.material.map !== null) {
            const texture = this.material.map  

            const repeat_u = s_real_dimension / texlength_s
            const repeat_v = t_real_dimension / texlength_t

            texture.repeat.set(repeat_u, repeat_v)
            this.material.map = texture
        }
    }

}
    /**
       Disposes of the array, through a callback, when it is not needed anymore
    */
    function disposeArray(){
        this.array = null
    /*
    initGui(){
        this.folder = this.contents.app.gui.addFolder(this);
        this.folder.close()
    }*/
    }

export { MyEntity };