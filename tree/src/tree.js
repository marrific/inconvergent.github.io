// @inconvergent. 2015
// this is a port of of: https://github.com/inconvergent/tree

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function(callback){
            window.setTimeout(callback,1000/60);
          };
})();

function randInt(n){
  return Math.floor(Math.random()*n);
}

var sin = Math.sin;
var cos = Math.cos;
var random = Math.random;
var pow = Math.pow;
var sqrt = Math.sqrt;

var BLACK = '#000000';
var WHITE = '#FFFFFF';

var PI = Math.PI;
var PII = Math.PI*2;

var COUNT = 0;

var CTX;
var SIZE = 800;
var MID = SIZE/2;

var INIT_BRANCH = SIZE*0.03;
var GRAINS = 5;

var BRANCH_DIMINISH = 1./35.;
var BRANCH_SPLIT_DIMINISH = 0.71;
var BRANCH_SPLIT_ANGLE = 0.3*PI;
var BRANCH_PROB_SCALE = 0.9;
var BRANCH_ANGLE_MAX = 10.*PI/SIZE;
var BRANCH_ANGLE_EXP = 3.0;

var SPEEDUP = 20;

function Branch(tree,x,y,r,a,g){

  this.tree = tree;
  this.x = x;
  this.y = y;
  this.r = r;
  this.a = a;
  this.shade = 0;
  this.i = 0;
  this.g = g;


  this.step = function(){
    this.r = this.r - this.tree.branchDiminish;
    var angle = (0.5-random())*this.tree.branchAngleMax;
    var scale = 1.0+this.tree.rootR-this.r;

    var exp = this.tree.branchAngleExp;
    var da = pow(1.+scale/this.tree.rootR,exp);
    this.a += da*angle;

    var dx = cos(this.a);
    var dy = sin(this.a);

    this.x += dx
    this.y += dy

    this.i += 1
  }

  this.draw = function(){
    var a = this.a;
    var r = this.r
    var x = this.x;
    var y = this.y;

    var x1 = x + cos(a-0.5*PI)*r;
    var x2 = x + cos(a+0.5*PI)*r;
    var y1 = y + sin(a-0.5*PI)*r;
    var y2 = y + sin(a+0.5*PI)*r

    // TRUNK STROKE
    CTX.beginPath();
    CTX.strokeStyle = WHITE;
    CTX.moveTo(x1,y1);
    CTX.lineTo(x2,y2);
    CTX.closePath();
    CTX.stroke();

    // OUTLINE
    CTX.fillStyle = BLACK;

    CTX.rect(x1,y1,1,1);
    CTX.fill();
    CTX.rect(x2,y2,1,1);
    CTX.fill();

    CTX.fillStyle = 'rgba(0,0,0,0.1)';

    // TRUNK SHADE RIGHT
    var dd = sqrt(pow(x-x2,2) + pow(y-y2,2));
    var the = 0.5*PI + a
    var costhe = cos(the);
    var sinthe = sin(the);
    for (var k=0;k<GRAINS;k++){
      var s = random()*dd*random();
      var xx = x2 - s*costhe;
      var yy = y2 - s*sinthe;
      CTX.rect(xx,yy,1,1);
      CTX.fill();
    }

     //TRUNK SHADE LEFT
    //dd = sqrt(pow(x-x1,2) + pow(y-y1,2));
    the = a - 0.5*PI;
    costhe = cos(the);
    sinthe = sin(the);
    for (var k=0;k<GRAINS;k+=2){
      var s = random()*dd*random();
      var xx = x1 - s*costhe;
      var yy = y1 - s*sinthe;
      CTX.rect(xx,yy,1,1);
      CTX.fill();
    }
  }
}

function Tree(
  rootX,
  rootY,
  rootR,
  rootA,
  branchSplitAngle,
  branchProbScale,
  branchDiminish,
  branchSplitDiminish,
  branchAngleMax,
  branchAngleExp
  ){

  this.rootX = rootX;
  this.rootY = rootY;
  this.rootR = rootR;

  this.branchSplitAngle = branchSplitAngle;
  this.branchDiminish = branchDiminish;
  this.branchSplitDiminish = branchSplitDiminish;
  this.branchAngleMax = branchAngleMax;
  this.branchAngleExp = branchAngleExp;

  this.branchProbScale = branchProbScale;


  this.init = function(){
    delete this.Q;
    this.Q = [];
    branch = new Branch(this,rootX,rootY,rootR,rootA,0);
    this.Q.push(branch);
  }

  this.step = function(){

    var self = this;

    var qNew = [];

    this.Q = this.Q.map(function(b){
      b.step();
      b.draw();
      if (b.r<=0.5){
        return;
      }

      var branchProb = (self.rootR-b.r+1.0)/SIZE*self.branchProbScale;
      if (random()<branchProb){
        var x = b.x;
        var y = b.y;
        var a = b.a;
        var r = b.r;
        var g = b.g;

        var newR = self.branchSplitDiminish*r;
        var ra = pow(-1,randInt(2))*random()*self.branchSplitAngle;
        var branch = new Branch(self,x,y,newR,a+ra,g+1);
        qNew.push(branch);
      }

      return b;
    }).filter(function(b){
      return !(b === undefined);
    });

    Array.prototype.push.apply(this.Q,qNew);
  }
}

$(document).ready(function(){

  $('<canvas>').attr({
    id: 'inconvergent'
  }).css({
    width: SIZE + 'px',
    height: SIZE + 'px' 
  }).attr({
    width: SIZE,
    height: SIZE 
  }).appendTo('#box');

  var C = $('#inconvergent') ;
  CTX = C[0].getContext("2d");

  var tree = new Tree(
    MID,
    SIZE,
    INIT_BRANCH,
    -PI*0.5,
    BRANCH_SPLIT_ANGLE,
    BRANCH_PROB_SCALE,
    BRANCH_DIMINISH,
    BRANCH_SPLIT_DIMINISH,
    BRANCH_ANGLE_MAX,
    BRANCH_ANGLE_EXP
  );

  tree.init();

  $('body').click(function(){
    CTX.clearRect (0,0,SIZE,SIZE);
    tree.init();
  });

  (function animloop(){

    for (var k=0;k<SPEEDUP;k++){
      tree.step();
    }
    requestAnimFrame(animloop);
  })();
});

