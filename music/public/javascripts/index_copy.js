function $(s){
	 return document.querySelectorAll(s);
}

var lis = $("#list li");

for(var i =0;i<lis.length ;i++){
	 lis[i].onclick = function(){
	 	 for(var j =0 ; j<lis.length;j++){
	 	 	lis[j].className = "";
	 	 }
	 	 this.className="selected";
	 	 load("/media/"+this.title);
	 }
}

var xhr = new XMLHttpRequest();
var ac = new (window.AudioContext||window.webkitAudioContext)();
var gainNode = ac[ac.createGain?"createGain":"createGainNode"]();
gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
var size = 128;
analyser.fftSize = size*2;
analyser.connect(gainNode);


var source = null;
var count = 0;

var requestAnimationFrame = window.requestAnimationFrame||
                            window.webkitRequestAnimationFrame||
                            window.mozRequestAnimationFrame;

var box = $("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

var line;
var Dots = [];
var drawType = "circle";//circle column

function random(min,max){
	 return Math.round(Math.random()*(max-min)+min);
}

function getDots(){
	Dots = [];
    for(var i =0;i<size;i++){
    	 var x = random(0,width);
    	 var y =random(0,height);
    	 var color = "rgb("+random(0,255)+","+random(0,255)+","+random(0,255)+")";
    	 Dots.push({
    	 	x:x,
    	 	y:y,
    	 	color:color
    	 })
    }
}

function resize(){
	height=box.clientHeight;
	width = box.clientWidth;
	canvas.height = height;
	canvas.width = width;
	line = ctx.createLinearGradient(0,0,0,height);
	line.addColorStop(0,"red");
	line.addColorStop(0.5,"yellow");
	line.addColorStop(1,"green");
    ctx.fillStyle = line;
    getDots();
}

resize();

window.onresize = resize;

function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width/size;
    ctx.fillStyle = line;
	 for(var i =0; i<size;i++){
	 	if(drawType=="column"){
	 		var h = arr[i]/256*height*0.8;
	 	    ctx.fillRect(w*i,height-h,w*0.6,h);
	 	}else{
	 		ctx.beginPath();
	 		var r = arr[i]/256*50;
            var o =Dots[i];
	 		ctx.arc(o.x,o.y,r,0,Math.PI*2);
	 		var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
	 		g.addColorStop(0,"#fff");
	 		g.addColorStop(1,o.color);
	 		ctx.fillStyle = g;
	 		ctx.fill();
	 	}
	 
	 }

}

function load(url){
	 var n = ++count;
	 source&&source[source.stop?"stop":"noteOff"]();
	 xhr.abort();
	 xhr.open("GET",url,true);
	 xhr.responseType = "arraybuffer";
	 xhr.onload = function(){
	 	if(n!=count){
	 		return;
	 	}
	 	 ac.decodeAudioData(xhr.response,function(buffer){
	 	 		if(n!=count){
	 		      return;
	 	         }
               var bufferSource = ac.createBufferSource();
               bufferSource.buffer = buffer;
               bufferSource.connect(analyser);
               bufferSource[bufferSource.start?"start":"noteOn"](0);
               source = bufferSource;
	 	 },function(err){
	 	 	console.log(err);
	 	 });
	 }
	 xhr.send();
}
function visualizer(){
	 var arr = new Uint8Array(analyser.frequencyBinCount);
  
     (function v(){
	     analyser.getByteFrequencyData(arr);
	     draw(arr);
	     requestAnimationFrame(v);
     })();  
}

visualizer();

function changeVolume(percent){
	gainNode.gain.value = percent*percent;
}

$("#volume")[0].onchange = function(){
	changeVolume(this.value/this.max);
}
$("#box canvas")[0].onclick=function(){
	drawType = (drawType=="column"?"circle":"column");
}

$("#volume")[0].onchange();