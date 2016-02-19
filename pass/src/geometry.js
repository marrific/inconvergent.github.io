var ndarray = ndarray.ndarray


function Plane(){

  this.init = function init(vnum, size){

    size = size || vnum

    var vtot = vnum*vnum
    var tnum = (vnum-1)*(vnum-1)*2

    console.log('vnum', vnum, 'tnum', tnum, 'size', size)

    this.vnum = vnum
    this.vtot = vtot
    this.tnum = tnum

    this.positions = new Float32Array(3*vtot)
    this.normals = new Float32Array(3*vtot)
    this.colors = new Float32Array(3*vtot)
    //this.tex = new Uint8Array(3*texSize*texSize)
    this.indices = new Uint16Array(3*tnum)

    this.ndpositions = ndarray(this.positions,[vnum,vnum,3])
    this.ndnormals = ndarray(this.normals,[vnum,vnum,3])
    this.ndcolors = ndarray(this.colors,[vnum,vnum,3])
    this.ndindices = ndarray(this.indices,[tnum,3])
    //this.ndtex = ndarray(this.tex,[texSize,texSize,3])

    var i,j
    var rgb = [0.2,0.6,0.8]
    for (i=0;i<vnum;i++){
      for (j=0;j<vnum;j++){

        var z = i*j*Math.cos(i*0.1) * Math.sin(j*0.1)*0.1
        this.ndpositions.set(i,j,0,-size*0.5 + (i+0.5)/vnum*size)
        this.ndpositions.set(i,j,2,-size*0.5 + (j+0.5)/vnum*size)
        this.ndpositions.set(i,j,1,z)

        this.ndnormals.set(i,j,0,0)
        this.ndnormals.set(i,j,1,0)
        this.ndnormals.set(i,j,2,1)

        //this.ndtex.set(i,j,0,floor(i/vnum*255.0))
        //this.ndtex.set(i,j,1,floor(j/vnum*255.0))
        //this.ndtex.set(i,j,2,floor(z))

        this.ndcolors.set(i,j,0,rgb[0])
        this.ndcolors.set(i,j,1,rgb[1])
        this.ndcolors.set(i,j,2,rgb[2])
      }
    }

    //this.texture = new THREE.DataTexture(this.tex,
                                         //this.ndtex.shape[0],
                                         //this.ndtex.shape[1],
                                         //THREE.RGBFormat)
    //this.texture.needsUpdate = true

    var tri = 0
    for (i=0;i<vnum-1;i++){
      for (j=0;j<vnum-1;j++){
        var lowleft = vnum*j+i
        var lowright = lowleft+1
        var upleft = (vnum*(j+1))+i
        var upright = upleft+1

        this.ndindices.set(tri,0,lowleft)
        this.ndindices.set(tri,2,upright)
        this.ndindices.set(tri,1,lowright)
        tri += 1
        this.ndindices.set(tri,0,lowleft)
        this.ndindices.set(tri,2,upleft)
        this.ndindices.set(tri,1,upright)
        tri += 1
      }
    }

    this.geometry = new THREE.BufferGeometry()

    this.geometry.setIndex(new THREE.BufferAttribute(this.indices, 1))
    this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.addAttribute('normal', new THREE.BufferAttribute(this.normals, 3))
    this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.computeBoundingSphere()
    this.geometry.computeFaceNormals()
    this.geometry.computeVertexNormals()

    console.log(this.geometry)
  }

  this.addToScene = function addToScene(camera,scene,mat){
    mesh = new THREE.Mesh(this.geometry, mat)
    mesh.frustumCulled = false
    camera.add(mesh)
    scene.add(mesh)
  }
}

function Triangles(){

  this.init = function init(tnum, size){

    var vnum = 3*tnum

    console.log('vnum', vnum, 'tnum', tnum, 'size', size)

    this.vnum = vnum
    this.tnum = tnum
    this.size = size

    this.positions = new Float32Array(3*vnum)
    this.normals = new Float32Array(3*vnum)
    this.colors = new Float32Array(3*vnum)
    this.indices = new Uint16Array(3*tnum)

    this.ndpositions = ndarray(this.positions,[vnum,vnum,3])
    this.ndnormals = ndarray(this.normals,[vnum,vnum,3])
    this.ndcolors = ndarray(this.colors,[vnum,vnum,3])
    this.ndindices = ndarray(this.indices,[tnum,3])

    var i
    var rgb = [0.2,0.6,0.8]
    for (j=0;j<vnum;j++){
      for (i=0;i<3;i++){

        var x = Math.random()*size
        var y = Math.random()*size
        var z = 0

        this.ndpositions.set(i,j,0,x)
        this.ndpositions.set(i,j,2,y)
        this.ndpositions.set(i,j,1,z)

        this.ndnormals.set(i,j,0,0)
        this.ndnormals.set(i,j,1,0)
        this.ndnormals.set(i,j,2,1)

        this.ndcolors.set(i,j,0,rgb[0])
        this.ndcolors.set(i,j,1,rgb[1])
        this.ndcolors.set(i,j,2,rgb[2])
      }
    }

    //this.texture = new THREE.DataTexture(this.tex,
                                         //this.ndtex.shape[0],
                                         //this.ndtex.shape[1],
                                         //THREE.RGBFormat)
    //this.texture.needsUpdate = true

    var tri = 0
    for (j=0;j<vnum-1;j++){
      var a = (3*tri)
      var b = (3*tri)+1
      var c = (3*tri)+2

      this.ndindices.set(tri,0,a)
      this.ndindices.set(tri,1,b)
      this.ndindices.set(tri,2,c)
      tri += 1
    }

    this.geometry = new THREE.BufferGeometry()

    this.geometry.setIndex(new THREE.BufferAttribute(this.indices, 1))
    this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.addAttribute('normal', new THREE.BufferAttribute(this.normals, 3))
    this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.computeBoundingSphere()
    this.geometry.computeFaceNormals()
    this.geometry.computeVertexNormals()

    console.log(this.geometry)
  }

  this.addToScene = function addToScene(camera,scene,mat){
    mesh = new THREE.Mesh(this.geometry, mat)
    mesh.frustumCulled = false
    camera.add(mesh)
    scene.add(mesh)
  }
}


//var numGeo = 15
//var spread = 2000
//var size = 40

////var sections = 2
////var geo = new THREE.SphereGeometry(size*0.5, sections, sections)
//var geo = new THREE.CubeGeometry(size,size,size)

//for (var k=0; k<numGeo; k++){
  //for (var j=0; j<numGeo; j++){
    //for (var i=0; i<numGeo; i++){
      //var mesh = new THREE.Mesh(geo, geoMat)
      //mesh.position.x = -spread*0.5 + i*spread/numGeo
      //mesh.position.y = -spread*0.5 + j*spread/numGeo
      //mesh.position.z = -spread*0.5 + k*spread/numGeo
      ////mesh.position.z = Math.cos(i/numGeo*Math.PI*10)*500*Math.sin(j/numGeo*Math.PI*10)

      //mesh.rotateX(Math.random()*Math.PI*2)
      //mesh.rotateY(Math.random()*Math.PI*2)
      ////geo.computeFaceNormals()
      ////geo.normalsNeedUpdate = true
      ////mesh.matrixWorldNeedsUpdate = true
      //scene.add(mesh)
    //}
  //}
//}
//

