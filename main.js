"use strict";

var game;

var ready =function(){
	var canvas=document.getElementById("myCanvas");
	game=GameMy.createNew(canvas);
	game.loadImg("rabbit","./img/rabbit.jpg");
	game.loadImg("other","./img/other.jpg");
	game.loadImg("animals","./img/animals.jpg");
	console.log("DOMContentLoaded finish");
};

var start =function(){
	console.log("DOMContentLoaded complete finish");
	game.init();
	setTimeout(game.tick, 100);
}

document.addEventListener('DOMContentLoaded', ready);
window.addEventListener('load', start);