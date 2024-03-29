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
delaunay = delaunay.delaunay;

var C;
var camera;
var renderer;
var winWidth = window.innerWidth;
var winHeight = window.innerHeight;
var offset; //$container.offset();
var $container;

window.mouseX = 0;
window.mouseY = 0;

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(callback){
            window.setTimeout(callback,1000/60);
          };
})();


$(function() {
  var timer_id;
  $(window).resize(function() {
      clearTimeout(timer_id);
      timer_id = setTimeout(function() {
        windowAdjust();
      }, 300);
  });
}); 


function windowAdjust() {
  winWidth = window.innerWidth;
  winHeight = window.innerHeight;

  camera.left = winWidth*0.5;
  camera.right = -winWidth*0.5;
  camera.top = winHeight*0.5;
  camera.bottom = -winHeight*0.5;

  camera.updateProjectionMatrix();
  renderer.setSize(winWidth,winHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  console.log(winWidth,winHeight);

  offset = $container.offset();
}


function generate(){
  C = new City();

  var NV = 1000;
  var proximity = 30;
  var xinit = 0;
  var yinit = 0;
  var rinit = 1500;

  var points = RandomCircle(xinit,yinit,rinit,proximity,NV);
  var triangles = delaunay(toTuples(points));

  var N = triangles.length;

  console.log('NV',NV);
  console.log('N',N);

  var coords = triangles.map(function(t){
    var co = t.map(function(ti){
      return [
        points.get(ti,0),
        points.get(ti,1),
      ];
    })
    return co;
  });

  C.init(N);

  coords.forEach(function(co){
    var x = new THREE.Vector2(co[0]);
    C.addTri(
      new THREE.Vector2(co[0][0],co[0][1]),
      new THREE.Vector2(co[1][0],co[1][1]),
      new THREE.Vector2(co[2][0],co[2][1])
    );
  });

}


// yes, yes, i just did this.
$.when(
  $.ajax({
    url: 'shaders/triangle.frag',
    dataType: 'text'
  }),
  $.ajax({
    url: 'shaders/triangle.vert',
    dataType: 'text'
  }),
  $(document).ready()
).done(function(fragment, vertex){

  if (!Detector.webgl){
    Detector.addGetWebGLMessage();
  }

  console.log('start');

  // RENDERER, SCENE AND CAMERA

  $container = $('#box');
  window.itt = 0;

  renderer = new THREE.WebGLRenderer({
    alpha: true,
    preserveDrawingBuffer: false
  });
  $container.append(renderer.domElement);

  scene = new THREE.Scene();

  camera = new THREE.OrthographicCamera(
    winWidth*0.5, -winWidth*0.5, 
    winHeight*0.5, -winHeight*0.5,
    0, 1000
  );
  camera.position.z = 500;
  camera.position.x = 0;
  camera.position.y = 0;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);

  scene.add(camera);

  //$('body').on('touchmove mousemove touchstart',function(e) {
    //window.mouseX = winWidth*0.5-e.pageX+offset.left;
    //window.mouseY = winHeight*0.5-e.pageY+offset.top;
  //});

  // INIT
  //
  var uniforms = {
    itt: {
      type: 'f',
      value:  0
    },
    mousePos: {
      type: '2f',
      value:  [0, 0]
    }
  };
  //
  //

  var shaderMat = new THREE.ShaderMaterial({
      vertexShader: vertex[0],
      fragmentShader: fragment[0],
      uniforms: uniforms,
      transparent: true
  });
  shaderMat.side = THREE.DoubleSide;

  generate();
  C.addToScene(camera,scene,shaderMat);

  $('body').click(function(){
    C.remove(scene);
    generate();
    C.addToScene(camera,scene,shaderMat);
  });

  windowAdjust();



  // ANIMATE
  //
  lightFreq = 50;

  function animate(){
    window.itt += 1;
    requestAnimationFrame(animate);
    uniforms.itt.value = itt;
    //uniforms.mousePos.value = [window.mouseX, window.mouseY];
    render();
  }

  function render(){
    renderer.render(scene, camera);
  }

  // START
  animate();

});
