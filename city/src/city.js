function City(){

  this.init = function init(n){
   
    var tnum = 3*n;
    var vnum = 3*tnum;
    this.tnum = tnum;
    this.vnum = vnum;

    this.index = new Uint16Array(tnum*3);
    this.position = new Float32Array(vnum*3);
    this.color = new Float32Array(vnum*3);

    this.ndindex = ndarray(this.index,[tnum,3]);
    this.ndposition = ndarray(this.position,[vnum,3]);
    this.ndcolor = ndarray(this.color,[vnum,3]);

    this.geometry = new THREE.BufferGeometry();

    this.geometry.addAttribute('index', new THREE.BufferAttribute(this.index, 1));
    this.geometry.addAttribute('position', new THREE.BufferAttribute(this.position, 3));
    this.geometry.addAttribute('color', new THREE.BufferAttribute(this.color, 3));


    for (var t=0; t<this.tnum; t++){
      this.ndindex.set(t,0,0);
      this.ndindex.set(t,1,0);
      this.ndindex.set(t,2,0);
    }

    for (var v=0; v<this.vnum; v++){
      this.ndposition.set(v,0,0);
      this.ndposition.set(v,1,0);
      this.ndposition.set(v,2,0);

      this.ndcolor.set(v,0,0);
      this.ndcolor.set(v,1,0);
      this.ndcolor.set(v,2,0);
    }

    this.geometry.attributes.index.needsUpdate = true;
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;

    this.ntri = 0;
    this.nvert = 0;
  };

  this.addTri = function addTri(a,b,c){

    var ab = new THREE.Vector2();
    ab.subVectors(b,a);
    var ac = new THREE.Vector2();
    ac.subVectors(c,a);

    var mid = new THREE.Vector2();
    mid.addVectors(a,b);
    mid.add(c);
    mid.divideScalar(3.0);
    
    var ntri = this.ntri;
    var nvert = this.nvert;

    rgb = color[floor(rand()*color.length)];

    this.ndcolor.set(nvert,0,rgb[0]);
    this.ndcolor.set(nvert,1,rgb[1]);
    this.ndcolor.set(nvert,2,rgb[2]);

    this.ndcolor.set(nvert+1,0,rgb[0]);
    this.ndcolor.set(nvert+1,1,rgb[1]);
    this.ndcolor.set(nvert+1,2,rgb[2]);

    this.ndcolor.set(nvert+2,0,rgb[0]);
    this.ndcolor.set(nvert+2,1,rgb[1]);
    this.ndcolor.set(nvert+2,2,rgb[2]);

    this.ndcolor.set(nvert+3,0,rgb[0]);
    this.ndcolor.set(nvert+3,1,rgb[1]);
    this.ndcolor.set(nvert+3,2,rgb[2]);


    this.ndposition.set(nvert,0,a.x);
    this.ndposition.set(nvert,1,a.y);
    this.ndposition.set(nvert,2,0);

    this.ndposition.set(nvert+1,0,b.x);
    this.ndposition.set(nvert+1,1,b.y);
    this.ndposition.set(nvert+1,2,0);

    this.ndposition.set(nvert+2,0,c.x);
    this.ndposition.set(nvert+2,1,c.y);
    this.ndposition.set(nvert+2,2,0);

    this.ndposition.set(nvert+3,0,mid.x);
    this.ndposition.set(nvert+3,1,mid.y);
    this.ndposition.set(nvert+3,2,1);

    this.ndindex.set(ntri,0,nvert+0);
    this.ndindex.set(ntri,1,nvert+1);
    this.ndindex.set(ntri,2,nvert+3);

    this.ndindex.set(ntri+1,0,nvert+0);
    this.ndindex.set(ntri+1,1,nvert+2);
    this.ndindex.set(ntri+1,2,nvert+3);

    this.ndindex.set(ntri+2,0,nvert+1);
    this.ndindex.set(ntri+2,1,nvert+2);
    this.ndindex.set(ntri+2,2,nvert+3);

    this.ntri = ntri+3;
    this.nvert = nvert+4;

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.index.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  };

  this.addToScene = function addToScene(camera,scene,mat){
    mesh = new THREE.Mesh(this.geometry, mat);
    this.mesh = mesh;
    mesh.frustumCulled = false;
    camera.add(mesh);
    scene.add(mesh);
  };

  this.remove = function remove(scene){
    scene.remove(this.mesh);
  };
}
