"use strict";



var SprBck={
	createNew:function(gmeTmp, imgMrk){
		var gme=gmeTmp;
		var _this=Sprite.createNew(gme, imgMrk);
		var tickPar=_this.tick;
		var wEdge=5;
		_this.tick=function(){
			var ctx=gme.ctx;
			ctx.drawImage(_this.img, 0, 0, ctx.canvas.width, wEdge);//top
			ctx.drawImage(_this.img, 0, ctx.canvas.height-wEdge, ctx.canvas.width, wEdge);//bottom
			ctx.drawImage(_this.img, 0, 0, wEdge, ctx.canvas.height);//left
			ctx.drawImage(_this.img, ctx.canvas.width-wEdge, 0, wEdge, ctx.canvas.height);//r
			//console.log("spriteMy tick");
		};

		_this.onClck=function(){
			//console.log("sprBck is clicked.")
		}

		return _this;
	}
};

var SprPthLne={
	createNew:function(gmeTmp, imgMrk){
		var gme=gmeTmp;
		var _this=Sprite.createNew(gme, imgMrk);
		var tickPar=_this.tick;
		var elapse=0;
		_this.pLst=[];
		_this.sprLst=[];
		_this.tick=function(){
			var ctx=gme.ctx;
			var pLst=_this.pLst
			ctx.lineWidth=5;
			ctx.strokeStyle='orange';
			if(pLst.length>0){
				ctx.beginPath();
				ctx.moveTo(pLst[0][0], pLst[0][1]);
			
				for(let i=1;i<pLst.length;i++){
					var p=pLst[i];
					ctx.lineTo(p[0], p[1]);
				}
				ctx.stroke();
				elapse++;
				if(elapse>10){
					elapse=0;
					_this.pLst.splice(0,_this.pLst.length);
					_this.sprLst[0].shown=false;
					_this.sprLst[1].shown=false;
					_this.sprLst.splice(0,_this.sprLst.length);

				}
			}
		};

		return _this;
	}
};

var SprBox={
	createNew:function(gmeTmp, imgMrk){
		var gme=gmeTmp;
		var _this=Sprite.createNew(gme, imgMrk);
		var tickPar=_this.tick;
		_this.mrk=0;//当前方格的标识，如果两格的标识相同，就表示它们的图案相同
		_this.rInd=0;//row index
		_this.cInd=0;//column index
		_this.shown=true;//hidden or shown
		_this.turn=[[-1,-1,-1],[-1,-1,-1]];
		//两组值。组1：三个值是基于横向的分别表示是否存在0折的路线，是否存在1折以内的路线，是否存在2折以内的路线，是为1，否为0，未检测为-1
		//组2:同理，基于竖向
		_this.tick=function(){
			var ctx=gme.ctx;
			tickPar();
			var isSelected=gme.sprLstClcked.indexOf(_this);
			if(_this.shown==false){
				_this.alpha=0.0;
			}else if(isSelected==-1){
				_this.alpha=1.0;
			}else{
				//when it is selected
				ctx.fillStyle="#FF0000";
				ctx.globalAlpha=0.5;
				ctx.fillRect(_this.xCur,_this.yCur,_this.wCur,_this.hCur);
				ctx.fillStyle="#000000";
				ctx.globalAlpha=1;
			}
		};
		_this.onClck=function(){
			var ctx=gme.ctx;
			if(gme.sprLstClcked.length<2){
				if(_this.shown){
					gme.sprLstClcked.push(_this);
				}else{
					gme.sprLstClcked.splice(0, gme.sprLstClcked.length);
				}
			}
			console.log(_this.mrk+"  is clicked.");
		};
		return _this;
	}
}

var GameMy={
	createNew:function(canvasIn){
		var _this=Game.createNew(canvasIn);
		var tickPar=_this.tick;
		_this.sprBoxM=[];
		_this.sprLstClcked=[];
		var atlas_wPerImg=175;
		var atlas_span=30;
		_this.rowCnt=4;
		_this.colCnt=4;
		_this.atlasRC_cnt=4;
		_this.sprPthLne=undefined;
		
		_this.tick=function(){
		    var route=[];
			if(_this.sprLstClcked.length==2){
				route=judgeDiff(_this.sprLstClcked[0],_this.sprLstClcked[1]);
			}
			if(route.length>=2){
			    
			    if(route.length>2){
					genLnePLst(route);
					_this.sprPthLne.sprLst.push(route[0]);
			    	_this.sprPthLne.sprLst.push(route[route.length-1]);
				}else{
					route[0].shown=false;
					route[route.length-1].shown=false;
				}
			}
			tickPar();
		};

		var getVecNorm=function(x,y){
			var mag=Math.sqrt(x*x+y*y);
			if(mag==0){
				return [0,0,0];
			}
			var ret=[x/mag,y/mag,mag];
			return ret;

		}
		var genLnePLst=function(r){
			var segCnt=10;
			for(let i=1;i<r.length;i++){
				var spr2=r[i];
				var spr1=r[i-1];
				var spr1xCent=spr1.xCur+spr1.wCur/2;
				var spr1yCent=spr1.yCur+spr1.hCur/2;
				var spr2xCent=spr2.xCur+spr2.wCur/2;
				var spr2yCent=spr2.yCur+spr2.hCur/2;
				var dir=[spr2xCent-spr1xCent,spr2yCent-spr1yCent];
				var vecRet=getVecNorm(dir[0],dir[1]);
				dir=[vecRet[0],vecRet[1]];
				var lenTot=vecRet[2];
				var lenSeg=lenTot/segCnt;
				for(let j=0;j<segCnt;j++){
					var lenTmp=lenSeg*j;
					var p=[spr1xCent+dir[0]*lenTmp,spr1yCent+dir[1]*lenTmp];
					_this.sprPthLne.pLst.push(p);
				}
			}

		}

		/**
		 * 
		 * @param {*} spr1 起始方格实例
		 * @param {*} spr2 结束方格实例
		 * @param {[]} needed 带有两个元素的数组，元素1：表示到达第二个方格的路线最终是横着到达的所需的最多折数。元素2：表示到达第二个方格的路线最终是竖着到达的所需的最多折数。初始值是[2,2]
		 * @param {[]} vstRecur 表示一次路线递归探测的过程中，已经探测过的方格，不能在递归中出现第二次探测
		 * @param {[]} route 记录有效通路的节点
		 * @returns 两元素数组，元素1：值0表示横向，值1表示竖向。元素2：表示经过几折到达
		 */
		var judgeRoute=function(spr1,spr2,needed,vstRecur,route){
			if(spr1.rInd==spr2.rInd && Math.abs(spr1.cInd-spr2.cInd)==1 && needed[0]>=0){
				return [0,0];
			}
			if(spr1.cInd==spr2.cInd && Math.abs(spr1.rInd-spr2.rInd)==1 && needed[1]>=0){
				return [1,0];
			}
			var offset=[[0,-1],[0,1],[-1,0],[1,0]];//围绕结束方格的上下左右四个格的偏移，前两个元素横向偏移，后两个元素竖向偏移
			for(let i=0;i<offset.length;i++){
				if(needed[0]<0 && i<2){
					continue;//如果i<2即将探测横向偏移的两个格，但need[0]<0(表示不需要横向偏移)
				}
				if(needed[1]<0 && i>=2){
					continue;//同上，但是关于竖向偏移
				}
				var p2Pre={rInd:spr2.rInd+offset[i][0],cInd:spr2.cInd+offset[i][1]};
				if(p2Pre.rInd<0 || p2Pre.rInd>=_this.sprBoxM.length || p2Pre.cInd<0 || p2Pre.cInd>=_this.sprBoxM.length){
					continue;
				}
				var sprPre=_this.sprBoxM[p2Pre.rInd][p2Pre.cInd];//到达spr2的前一个格子这里记做sprPre
				if(sprPre.shown){
					continue;
				}
				var sprPreExistInd=vstRecur.indexOf(sprPre);
				if(sprPreExistInd>=0){
					//console.log("vstRecur exist index:  "+sprPre.rInd+" "+sprPre.cInd+" "+sprPreExistInd);
					continue;
				}
				//上面三种情况是一些边界条件的探测，不符合的情况跳过
				var needR=i<2?needed[0]:needed[1]-1;//if sprPre是横向偏移的格子，那到达sprPre方格的路线最终是横着到达的所需的最多折数，等于spr2的needed[0]。
				var needC=i<2?needed[0]-1:needed[1];//if sprPre是横向偏移的格子，那到达sprPre方格的路线最终是竖着到达的所需的最多折数，等于spr2的needed[0]-1。
				var exstR=0;
				var exstC=0;
				//为了免去重复计算，这里存储了以前计算过的值。如下：
				if(needR>=0){
					exstR=sprPre.turn[0][needR];//先尝试sprPre的turn数组里的值。
				}
				if(exstR==1){
					return [0,needR];
				}
				if(needC>=0){
					exstC=sprPre.turn[1][needC];
				}
				if(exstC==1){
					return [1,needC];
				}
				//exstR=0 or -1, exstC=0 or -1
				if(exstR==0){
					needR=-1;//disable judge row
				}
				if(exstC==0){
					needC=-1;
				}
				vstRecur.push(sprPre);
				var ret=judgeRoute(spr1,sprPre,[needR,needC],vstRecur,route);
				vstRecur.pop();
				if(ret[0]>=0){
				    //find a path
					route.push(sprPre);
					sprPre.turn[ret[0]][ret[1]]=1;
					var tmpRet=[];
					if(i<2){//row's grid
						if(ret[0]==0){//from row
							tmpRet=[0,ret[1]];
						}else{
							tmpRet=[0,ret[1]+1];
						}
					}else{//col's grid
						if(ret[0]==0){//from row
							tmpRet=[1,ret[1]+1];
						}else{
							tmpRet=[1,ret[1]];
						}
					}
					return tmpRet;
				}else{
					sprPre.turn[0][needR]=0;
					sprPre.turn[1][needC]=0;
				}
				
			}
			return [-1,-1]; 
		}

		var judgeDiff=function(spr1, spr2){
		    var route=[];
			_this.sprLstClcked.splice(0, _this.sprLstClcked.length);
			if(spr1==spr2 || spr1.mrk!=spr2.mrk){
				return route;
			}
			route.push(spr1);
			var vstRecur=[spr1, spr2];
			var isOK=judgeRoute(spr1,spr2,[2,2],vstRecur,route);
		
			for(let i=0;i<_this.sprBoxM.length;i++){
				var boxRow=_this.sprBoxM[i];
				for(let j=0;j<boxRow.length;j++){
					var spr=boxRow[j];
					spr.turn=[[-1,-1,-1],[-1,-1,-1]];//[r,c]
				}
			}
			if(isOK[0]>=0){
			    route.push(spr2);
			    
			}
			return route;
		};

		var genPattern1=function(){
			var sprBoxM=_this.sprBoxM;
			var atlasRC_cnt=4;
			
			for(let i=0;i<sprBoxM.length;i++){
				var sprBoxRowLst=sprBoxM[i];
				for(let j=0;j<sprBoxRowLst.length;j++){
					var sprBox=sprBoxRowLst[j];
					var atlasRInd=Math.floor(Math.random()*atlasRC_cnt);//atlas row index
					var atlasCInd=Math.floor(Math.random()*atlasRC_cnt);
					sprBox.mrk=atlasRInd*atlasRC_cnt+atlasCInd;
					
					sprBox.xClpCur=atlasRInd*(atlas_wPerImg+atlas_span);
					sprBox.yClpCur=atlasCInd*(atlas_wPerImg+atlas_span-5);
				}
			}
		};

		var setMrk4Spr=function(atlasMrk, rInd, cInd,atlasRInd,atlasCInd){
			var spr=_this.sprBoxM[rInd][cInd];
			spr.mrk=atlasMrk;
			spr.xClpCur=atlasRInd*(atlas_wPerImg+atlas_span);
			spr.yClpCur=atlasCInd*(atlas_wPerImg+atlas_span-5);
		};

		var fndNbor=function(rInd1, cInd1){
			var rInd2=rInd1;
			var cInd2=cInd1;
			var fromMrk=Math.floor(Math.random()*2);
			if(fromMrk==0){
				//from row
				cInd2=cInd1+1;
				if(cInd1==_this.colCnt-1){
					cInd2=cInd1-1;
				}
			}else{
				rInd2=rInd1+1;
				if(rInd1==_this.rowCnt-1){
					rInd2=rInd1-1;
				}
			}
			return [rInd2,cInd2];
		};

		var selTwoGrd=function(spr1Ind,edgeGrdLst,edgeGrdIndLst){
			var spr2IndInd=Math.floor(Math.random()*edgeGrdIndLst.length);
			var spr2Ind=edgeGrdIndLst[spr2IndInd];
			var spr1=edgeGrdLst[spr1Ind];
			var spr2=edgeGrdLst[spr2Ind];
			var route=[];
			var vstRecur=[spr1, spr2];
			var isOK=judgeRoute(spr1,spr2,[2,2],vstRecur,route);
			var ret=[spr1,spr2];
			if(isOK[0]< 0){
				ret=undefined;
			}
			return ret;
		};

		//based on two grd, update edgeGrdLst
		var updEdgeGrdLst=function(rcIndLst,edgeGrdLst){
			var spr1=_this.sprBoxM[rcIndLst[0][0]][rcIndLst[0][1]];
			var spr2=_this.sprBoxM[rcIndLst[1][0]][rcIndLst[1][1]];
			edgeGrdLst.splice(edgeGrdLst.indexOf(spr1),1);
			edgeGrdLst.splice(edgeGrdLst.indexOf(spr2),1);
			spr1.shown=false;
			spr2.shown=false;
			var offsets=[[0,-1],[0,1],[-1,0],[1,0]];//four grid around
			for(let i=0;i<offsets.length;i++){
				var offset=offsets[i];
				for(let j=0;j<rcIndLst.length;j++){
					var rcInd=rcIndLst[j];
					var rTmp=rcInd[0]+offset[0];
					var cTmp=rcInd[1]+offset[1];
					if(rTmp<0 || rTmp>=_this.rowCnt||cTmp<0 || cTmp>=_this.colCnt){
						continue;
					}
					var spr=_this.sprBoxM[rTmp][cTmp];
					if(edgeGrdLst.indexOf(spr)>=0 || spr.shown==false){
						continue;
					}
					edgeGrdLst.push(spr);
				}
			}
		};

		var putClp=function(rcIndLst){
			var atlasRInd=Math.floor(Math.random()*_this.atlasRC_cnt);//atlas row index
			var atlasCInd=Math.floor(Math.random()*_this.atlasRC_cnt);
			var atlasMrk=atlasRInd*_this.atlasRC_cnt+atlasCInd;
			setMrk4Spr(atlasMrk, rcIndLst[0][0], rcIndLst[0][1],atlasRInd,atlasCInd);
			setMrk4Spr(atlasMrk, rcIndLst[1][0], rcIndLst[1][1],atlasRInd,atlasCInd);
		};

		var genPattern=function(){
			var edgeGrdLst=[];
			
			//init select two neighbor grids
			var rInd1=Math.floor(Math.random()*_this.rowCnt);
			var cInd1=Math.floor(Math.random()*_this.colCnt);
			var rcInd2=fndNbor(rInd1,cInd1);
			var rInd2=rcInd2[0];
			var cInd2=rcInd2[1];
			
			var rcIndLst=[[rInd1,cInd1],[rInd2,cInd2]];
			putClp(rcIndLst);
			updEdgeGrdLst(rcIndLst,edgeGrdLst);
			console.log([rInd1,cInd1,rInd2,cInd2].join(","));
			while(edgeGrdLst.length>0){
				var edgeGrdIndLst=[];
				for(let i=0;i<edgeGrdLst.length;i++){
					edgeGrdIndLst.push(i);
				}
				var ret=undefined;
				var spr1IndInd=Math.floor(Math.random()*edgeGrdIndLst.length);
				var spr1Ind=edgeGrdIndLst[spr1IndInd];
				edgeGrdIndLst.splice(spr1IndInd,1);
				while(ret==undefined){
					ret=selTwoGrd(spr1Ind,edgeGrdLst, edgeGrdIndLst);
				}
				var spr1=ret[0];
				var spr2=ret[1];
				rcIndLst=[[spr1.rInd,spr1.cInd],[spr2.rInd,spr2.cInd]];
				putClp(rcIndLst);
				updEdgeGrdLst(rcIndLst,edgeGrdLst);
			    //sleep(1000);
				/*
				var tmp=[spr1.rInd,spr1.cInd,spr2.rInd,spr2.cInd];
				for(let j=0;j<edgeGrdLst.length;j++){
					tmp.push(edgeGrdLst[j].rInd);
					tmp.push(edgeGrdLst[j].cInd);
					tmp.push("_");
				}
				console.log("find two "+tmp.join(","));
				*/
			}
			for(let i=0;i<_this.rowCnt;i++){
				for(let j=0;j<_this.colCnt;j++){
					var spr=_this.sprBoxM[i][j];
					spr.shown=true;
				}
			}

		};

		_this.init=function(){
			var scene1=Scene.createNew();
			_this.pushScene(scene1);
			
			//var sprBck=SprBck.createNew(game.getImg("other"));
			var sprBck=SprBck.createNew(_this, "other");
			scene1.pushSprite(sprBck);

			_this.sprPthLne=SprPthLne.createNew(_this, "other");
			scene1.pushSprite(_this.sprPthLne);

			var boxW=_this.ctx.canvas.width/_this.colCnt;
			var boxH=_this.ctx.canvas.height/_this.rowCnt;
			
			for(let i=0;i<_this.rowCnt;i++){
				var sprBoxRowLst=[];
				for(let j=0;j<_this.colCnt;j++){
					var sprBox=SprBox.createNew(_this, "animals");
					sprBox.wClpCur=atlas_wPerImg;
					sprBox.hClpCur=atlas_wPerImg;
					sprBox.xCur=boxW*j;
					sprBox.yCur=boxH*i;
					sprBox.wCur=boxW;
					sprBox.hCur=boxH;
					sprBox.shown=true;
					sprBox.rInd=i;
					sprBox.cInd=j;
					scene1.pushSprite(sprBox);
					sprBoxRowLst.push(sprBox);
				}
				_this.sprBoxM.push(sprBoxRowLst);
			}
			genPattern();
			
			

		};
		return _this;
	}
}
