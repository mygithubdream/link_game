"use strict";

var Sprite={
	createNew:function(gameTmp, imgMrk){
		var _this={};
		_this.game=gameTmp;
		var imgTmp=gameTmp.getImg(imgMrk);
		_this.img=imgTmp;
		_this.wCur=imgTmp.width;
		_this.hCur=imgTmp.height;
		_this.xCur=0;
		_this.yCur=0;
		_this.xClpCur=0;
		_this.yClpCur=0;
		_this.wClpCur=imgTmp.width;
		_this.hClpCur=imgTmp.height;
		_this.alpha=1;
		_this.setPos=function (xTmp, yTmp){
			_this.xCur=xTmp;
			_this.yCur=yTmp;
		};
	
		_this.tick=function(){
			_this.game.ctx.globalAlpha=_this.alpha;
			_this.game.ctx.drawImage(_this.img, _this.xClpCur, _this.yClpCur, _this.wClpCur, _this.hClpCur, _this.xCur, _this.yCur,_this.wCur, _this.hCur);
			//console.log("sprite tick");
		};

		_this.onClck=function(){
			//console.log("sprite is clicked.")
		}

		return _this;
	}
};

var Scene={
	createNew:function(){
		var _this={};
		_this.sprites=[];
		_this.tick=function(){
			for(let i=0;i<_this.sprites.length;i++){
				_this.sprites[i].tick();
			}
        	//console.log("scene tick");
    	};

		_this.pushSprite=function(spriteTmp){
			_this.sprites.push(spriteTmp); 
		};

		return _this;
	}
};

var Game={
	createNew:function(canvasIn){
		var _this={};
		var canvas;//private
		var scenes=[];
		_this.sceneCur=undefined;
		var imgs={};
		var rectCanvas;

		var clearCanvas=function(){
			_this.ctx.clearRect(0,0,canvas.width, canvas.height);
		};

		var mClkProc=function(e){
			var x = e.pageX;
			var y = e.pageY;
			x-=rectCanvas.left;
			y-=rectCanvas.top;
			//console.log("x: "+x+" y: ",y);
			var sprLst=_this.sceneCur.sprites;
			for(let i=0;i<sprLst.length;i++){
				var spr=sprLst[i]
				if(x>spr.xCur && x<spr.xCur+spr.wCur && y>spr.yCur && y<spr.yCur+spr.hCur){
					spr.onClck();
				}
			}
		}

		_this.tick=function(){
			clearCanvas();
			_this.sceneCur.tick();
			setTimeout(_this.tick, 1000/60);
		};
	
		_this.pushScene=function(sceneTmp){
			scenes.push(sceneTmp);
			if(_this.sceneCur==undefined){
				_this.sceneCur=sceneTmp;
			}
		};
	
		_this.loadImg=function(k, imgFleTmp){
			imgs[k]=new Image();
			imgs[k].src=imgFleTmp;
		};
	
		_this.getImg=function(k){
			return imgs[k];
		};
	
		canvas=canvasIn;
		_this.ctx=canvas.getContext("2d");
		rectCanvas = canvas.getBoundingClientRect();
		document.addEventListener('mouseup', mClkProc);
		return _this;
	}
};

var sleep=function(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
	  currentDate = Date.now();
	} while (currentDate - date < milliseconds);
};
  
  

