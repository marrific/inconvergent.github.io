var rand = Math.random;
var round = Math.round;
var floor = Math.floor;
var max = Math.max;
var min = Math.min;
var cos = Math.cos;
var acos = Math.acos;
var atan2 = Math.atan2;
var sin = Math.sin;
var sqrt = Math.sqrt;
var pow = Math.pow;
var pi = Math.PI;
var pii = Math.PI*2.0;
var abs = Math.abs;

ndarray = ndarray.ndarray;

function halfrand(x){
  return (rand()-0.5)*x;
}

var size = 20*1024;
var size5 = size*0.5;
var hsize = 1024*9;

var opacity = 0.95;
var texSize = 256;

var lightFreq = 100;

var mountainItt = 8;
var mountainInitRange = 1.0;
var mountainH = 0.95;
//var mountainInitArray = [0,1,1,0];
var mountainInitArray = [rand(),rand(),rand(),rand()];
//var mountainInitArray = [0,0,0,0];

mouseX = 0;
mouseY = 0;
var winWidth = 500;
var winHeight = 500;

var tex;
var controls;
var camera;
var stats;


window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(callback){
            window.setTimeout(callback,1000/60);
          };
})();

function minMaxHeight(h,v){

  var mi = h.get(0,0,v);
  var ma = h.get(0,0,v);
  for (var i=0;i<h.shape[0];i++){
    for (var j=0;j<h.shape[1];j++){
      var cand = h.get(i,j,v);
      mi = min(mi,cand);
      ma = max(ma,cand);
    }
  }

  return {
    min: mi,
    max: ma,
    range: ma-mi
  };
}

function Isopleth(){

  this.init = function init(){

    var heights = mountain(mountainItt, mountainH, mountainInitRange, mountainInitArray);
    var mima = minMaxHeight(heights,2);

    var vnum = min(heights.shape[0], texSize);
    var vtot = vnum*vnum;
    var tnum = (vnum-1)*(vnum-1)*2;

    console.log('vnum',vnum,'texSize',texSize, 'tnum', tnum);

    this.vnum = vnum;
    this.vtot = vtot;
    this.tnum = tnum;

    this.positions = new Float32Array(3*vtot);
    this.colors = new Float32Array(3*vtot);
    this.tex = new Uint8Array(3*texSize*texSize);
    this.indices = new Uint16Array(3*tnum);

    this.ndpositions = ndarray(this.positions,[vnum,vnum,3]);
    this.ndcolors = ndarray(this.colors,[vnum,vnum,3]);
    this.ndindices = ndarray(this.indices,[tnum,3]);
    this.ndtex = ndarray(this.tex,[texSize,texSize,3]);

    this.geometry = new THREE.BufferGeometry();
    this.geometry.addAttribute('index', new THREE.BufferAttribute(this.indices, 1));
    this.geometry.addAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.addAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    var i,j;
    var rgb = [0.2,0.6,0.8];
    //var rgb = color[floor(rand()*color.length)];
    for (i=0;i<vnum;i++){
      for (j=0;j<vnum;j++){

        var z = heights.get(i,j);
        var z256 = (z-mima.min)/mima.range*255;

        this.ndpositions.set(i,j,0,(i+0.5)/vnum*size);
        this.ndpositions.set(i,j,1,(j+0.5)/vnum*size);
        this.ndpositions.set(i,j,2,0);

        this.ndtex.set(i,j,0,floor(i/vnum*255.0));
        this.ndtex.set(i,j,1,floor(j/vnum*255.0));
        this.ndtex.set(i,j,2,floor(z256));

        this.ndcolors.set(i,j,0,rgb[0]);
        this.ndcolors.set(i,j,1,rgb[1]);
        this.ndcolors.set(i,j,2,rgb[2]);
      }
    }
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;

    this.texture = new THREE.DataTexture(this.tex,
                                         this.ndtex.shape[0],
                                         this.ndtex.shape[1],
                                         THREE.RGBFormat);
    this.texture.needsUpdate = true;

    var tri = 0;
    for (i=0;i<vnum-1;i++){
      for (j=0;j<vnum-1;j++){
        var lowleft = vnum*j+i;
        var lowright = lowleft+1;
        var upleft = (vnum*(j+1))+i;
        var upright = upleft+1;

        this.ndindices.set(tri,0,lowleft);
        this.ndindices.set(tri,1,upright);
        this.ndindices.set(tri,2,lowright);
        tri += 1;
        this.ndindices.set(tri,0,lowleft);
        this.ndindices.set(tri,1,upleft);
        this.ndindices.set(tri,2,upright);
        tri += 1;
      }
    }

    this.geometry.attributes.index.needsUpdate = true;
  };

  this.addToScene = function addToScene(camera,scene,mat){
    mesh = new THREE.Mesh(this.geometry, mat);
    mesh.frustumCulled = false;
    camera.add(mesh);
    scene.add(mesh);
  };
}


$(document).ready(function(){

  if ( ! Detector.webgl ) Detector.addGetWebGLMessage();


  // RENDERER, SCENE AND CAMERA

  var $container = $('#box');
  window.itt = 0;

  var renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: false
  });
  $container.append(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    40,
    winWidth/winHeight,
    1,
    100000
  );
  var scene = new THREE.Scene();
  var fog = new THREE.Fog(0xffffff,6000,19000);
  scene.fog = fog;

  var camTarget = new THREE.Vector3(size*0.45,size,hsize*0.3);
  var camStart = new THREE.Vector3(size*0.65,0,hsize*1.2);

  camera.position.x = camStart.x;
  camera.position.y = camStart.y;
  camera.position.z = camStart.z;
  camera.lookAt(camTarget);
  camera.rotation.z = 0;

  aspect = window.innerWidth/window.innerHeight;
  camera.aspect = aspect;

  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  scene.add(camera);

  //controls = new THREE.OrbitControls(camera);
  //stats = new Stats();

  if (controls){
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 1.0;
    controls.noZoom = false;
    controls.noPan = false;
    //controls.autoRotate = true;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;
    controls.keys = [65,83,68];
    controls.addEventListener('change',render);
    controls.target.x = camTarget.x;
    controls.target.y = camTarget.y;
    controls.target.z = camTarget.z;
  }
  if (stats){
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.left = '0px';
    stats.domElement.style.zIndex = 100;
    $container.append( stats.domElement );
  }


  // INIT

  I = new Isopleth();
  I.init();

  var uniforms = {
    size: {
      type: 'f',
      value: size
    },
    hsize: {
      type: 'f',
      value: hsize
    },
    vnum: {
      type: 'f',
      value: I.vnum
    },
    mousePos: {
      type: '2f',
      value: [
        mouseX,
        mouseY
      ]
    },
    camPos: {
      type: '3f',
      value: [
        camera.position.x,
        camera.position.y,
        camera.position.z
      ]
    },
    heights: {
      type: 't',
      value: I.texture
    },
    texSize: {
      type: 'f',
      value: texSize
    },
    light: {
      type: '3f',
      value: [
        size5,
        size5,
        2*size
      ]
    },
    fogColor: {
      type: "c",
      value: scene.fog.color
    },
    fogNear: {
      type: "f",
      value: scene.fog.near
    },
    fogFar: {
      type: "f",
      value: scene.fog.far
    }
  };

  var vertexShader = $('#vertexShader').text();
  var fragmentShader = $('#fragmentShader').text();
  var shaderMat = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: uniforms,
      transparent: true
  });

  I.addToScene(camera,scene,shaderMat);

  $('body').click(function(){
    I.init();
    uniforms.heights.value = I.texture;
  });


  function windowAdjust() {
    winWidth = window.innerWidth;
    winHeight = window.innerHeight;

    aspect = window.innerWidth/window.innerHeight;
    camera.aspect = aspect;

    camera.updateProjectionMatrix();
    renderer.setSize(winWidth,winHeight);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    console.log(winWidth,winHeight);
  }

  windowAdjust();

  //var offset = $container.offset();
  //$(window).resize(function () {
    ////offset = $container.offset();
    //windowAdjust();
  //});
  //
  $(function() {
    var timer_id;
    $(window).resize(function() {
        clearTimeout(timer_id);
        timer_id = setTimeout(function() {
          windowAdjust();
        }, 300);
    });
  });

  // ANIMATE

  function animate(){
    window.itt += 1;
    requestAnimationFrame(animate);
    render();
    var cp = uniforms.camPos.value;
    cp[0] = camera.position.x;
    cp[1] = camera.position.y;
    cp[2] = camera.position.z;
    var l = uniforms.light.value;
    var x = (1+sin(window.itt/lightFreq))*size;
    var y = (1+cos(window.itt/lightFreq))*size;
    l[0] = x;
    l[1] = y;
    if (controls){
      controls.update();
    }
    if (stats){
      stats.update();
    }

    if (window.itt%100===0){
      // hack because mobile does not resize sometimes
      windowAdjust();
    }
  }

  function render(){
    renderer.render(scene, camera);
  }

  // START
  animate();

});
