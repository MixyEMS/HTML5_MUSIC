function $(s){
	 return document.querySelectorAll(s);
}

var lis = $("#list li");

var requestAnimationFrame = window.requestAnimationFrame||
                            window.webkitRequestAnimationFrame||
                            window.mozRequestAnimationFrame;

var box = $("#box")[0];
var height,width;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

var size = 64;
var line;
var Dots = [];
var drawType = "circle";//circle column

var musicVisualizer = new MusicVisualizer({
	size:size,
	draw:draw
});

var curMusic = 0;

function random(min,max){
	 return Math.round(Math.random()*(max-min)+min);
}

function getDots(){
	Dots = [];
    for(var i =0;i<size;i++){
    	 var x = random(0,width);
    	 var y =random(0,2*height);
    	 var dy = random(0.5,1)*0.3;
    	 var color = "rgba("+random(0,255)+","+random(0,255)+","+random(0,255)+",0)";
    	 Dots.push({
    	 	x:x,
    	 	y:y,
    	 	color:color,
    	 	cap:0,
    	 	dy:dy
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

function draw(arr){
	ctx.clearRect(0,0,width,height);
	var w = width/size;
	var cw = w*0.6;
	var capH = cw;
    ctx.fillStyle = line;
	 for(var i =0; i<size;i++){
	 	var o =Dots[i];
	 	if(drawType=="column"){
	 		 var h = (arr[i]/(size*2))*height*0.5;
	 		 if(o.cap<capH){
	 		 	if(h==0){
	 		 		o.cap = capH;
	 		 	}
	 	    	else{
	 	    		o.cap = o.cap<0?20*capH:o.cap;
	 	    	}
	 	    }
	 	    ctx.fillRect(w*i,height-h,cw,h);
	 	    ctx.fillRect(w*i,height-h-o.cap,cw,capH);
	 	    o.cap--;
	 	   
	 	}else{
	 		ctx.beginPath();
	 		var r = arr[i]/(size*2)*50;
	 		o.y-=o.dy;
	 		if(o.y <0){
	 			o.y = 2*height;
	 		}
	 		ctx.arc(o.x,o.y,r,0,Math.PI*2);
	 		var g = ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);
	 		g.addColorStop(0,"#fff");
	 		g.addColorStop(1,o.color);
	 		ctx.fillStyle = g;
	 		ctx.fill();
	 		
	 	}
	 
	 }

}

function setInfo(info){
     $("#player .info .name")[0].innerHTML=info.name;
}

window.onresize = resize;

$("#volume")[0].onchange = function(){
  musicVisualizer.changeVolume(this.value/this.max);
}
$("#box canvas")[0].onclick=function(){
	drawType = (drawType=="column"?"circle":"column");
}

for(var i =0;i<lis.length ;i++){
	 lis[i].onclick = function(){
	 	 for(var j =0 ; j<lis.length;j++){
	 	 	lis[j].className = "";
	 	 	if(lis[j]==this){
	 	 		curMusic = j;
	 	 	}
	 	 }
	 	 this.className="selected";
	 	 setInfo({
	 	 	name:this.title.slice(0,this.title.length-4),
	 	 });
	   	musicVisualizer.play("/media/"+this.title);
	 }
}

 $("#player .control .prev")[0].onclick = function(){
       if(curMusic>=1){
       	  curMusic--;
       }else{
       	  curMusic =lis.length-1;
       }

       lis[curMusic].click();
 }

 $("#player .control .next")[0].onclick = function(){
       if(curMusic < lis.length-1){
       	  curMusic++;
       }else{
       	  curMusic =0;
       }

       lis[curMusic].click();
 }

$("#player .control .stateC")[0].onclick = function(){
	if(musicVisualizer.ac.state =="running"){
		musicVisualizer.ac.suspend();
		this.innerHTML="&#9658";
	}else{
		musicVisualizer.ac.resume();
		this.innerHTML="&#921&#921";
	}	
 }

$(".left .more")[0].onclick = function(){
	var s = this.innerHTML;
	if(s == "More"){
		$(".left")[0].className = "left open";
		this.innerHTML="Return";
		$("#header")[0].className = "hide";
    }else{
    	$(".left")[0].className = "left close";
		this.innerHTML="More";
		$("#header")[0].className = "";
    }
 }


resize();

$("#volume")[0].onchange();

