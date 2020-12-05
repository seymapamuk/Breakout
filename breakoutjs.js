var game = {};
var paddle = {};
var bricks = new Array(40);
var ball = {};

var brickCount = 40;
var column = 10; 
var row = 4;

var lifes = {};

var controls = {
	LEFT : "a",
	RIGHT : "d",
	START : "z",
	COLOR : "c",
	RB : "r",
}

var keysPressed = {};

var lastTick = 0;
var paddleSpeed = 500 / 1000;
var ballSpeed = 300 / 1000;

var rand = 0;

var colorIndex = 0;
var colorCodes = [];
colorCodes[0] = {};
colorCodes[0].oneLife = "#75D3F6";
colorCodes[0].twoLife = "#7593f6";

colorCodes[1] = {};
colorCodes[1].oneLife = "#3e7d46";
colorCodes[1].twoLife = "#1c5c24";

colorCodes[2] = {};
colorCodes[2].oneLife = "#6119a8";
colorCodes[2].twoLife = "#37105e";

colorCodes[3] = {};
colorCodes[3].oneLife = "#93d65c";
colorCodes[3].twoLife = "#73ff00";

colorCodes[4] = {};
colorCodes[4].oneLife = "#eb1023";
colorCodes[4].twoLife = "#690710";

colorCodes[5] = {};
colorCodes[5].oneLife = "#ffae52";
colorCodes[5].twoLife = "#f78400";

var powerup;
var itemBool = false;
var type;

var start = false;
var party = false;
var audio = new Audio("nyan.mp3");

function init(){
	game = document.getElementById("game");
	paddle = document.getElementById("paddle");
	ball = document.getElementById("ball");
	
	lifes.dom = document.getElementById("lifebox");
	lifes.count = 3;
	lifes.dom.innerHTML = ("Lifes = " + lifes.count);

	initGOs();

	document.addEventListener("keyup", function (keyEvent){
		keysPressed[keyEvent.key]  = false;
	});

	document.addEventListener("keydown", function (keyEvent){
		keysPressed[keyEvent.key] = true;
		if(keysPressed[controls.START])
			start = true;

		if(keysPressed[controls.RB])
			party = true;
	});

	window.addEventListener('resize', function (event){
		console.log(event);
		console.log(window.innerWidth);
	});

	requestAnimationFrame(loop);
}

function loop(ts){
	var delta = ts - lastTick;

	handleInput(delta);
	
	if(start)
		updateGame(delta);

	if(party)
		bricks.forEach(partyMode);
	

	lastTick = ts;

	requestAnimationFrame(loop);
}

function handleInput(dt){
	if(keysPressed[controls.RIGHT]){
		paddle.x += dt * paddleSpeed;
	}
	if(keysPressed[controls.LEFT]){
		paddle.x -= dt * paddleSpeed;
	}

	if(paddle.x < 0){
		paddle.x = 0;
	}
	
	if(paddle.x > game.width - paddle.width){
		paddle.x = game.width - paddle.width;
	}

	updateDOMFromGO(paddle);

	if(!start){
		ball.x = paddle.x + (paddle.width / 2);
		ball.y = paddle.y - ball.height;
		updateDOMFromGO(ball);
	}

	if(keysPressed[controls.COLOR]){
		party = false;
		colorIndex = Math.floor(Math.random() * 6);
		bricks.forEach(changeColor);
		keysPressed[controls.COLOR] = false;
	}
}

function updateGame(delta){
	ball.x += delta * ballSpeed * ball.direction.x;
	ball.y += delta * ballSpeed * ball.direction.y;

	if(ball.x < 0){
		ball.x = 0;
		ball.direction.x *= -1;
	}
	if(ball.x > game.width - ball.width){
		ball.x = game.width - ball.width;
		ball.direction.x *= -1;
	}
	if(ball.y < 0){
		ball.y = 0;
		ball.direction.y *= -1;
	}
	if(ball.y > game.height - ball.height){
		ball.y = game.height - ball.height;
		ball.direction.y *= -1;
		lifes.count--;
		paddle.x = (game.width - paddle.width) / 2;
		paddle.y = game.height - (paddle.height * 4);
		ball.x = paddle.x + (paddle.width / 2);
		ball.y = paddle.y - ball.height;
		start = false;
	}

	if(aabbCollision(ball, paddle)){
		ball.direction.y *= -1;
	}

	bricks.forEach(ballBrickColl);

	if(bricks.length == 0){
		var input = confirm("you have won!");
		if(input){
			location.reload();
		}
	}

	if(itemBool){
		powerup.y += delta * powerup.speed;
		updateDOMFromGO(powerup);

		if(powerup.y > game.height - powerup.height){
			powerup.dom.parentNode.removeChild(powerup.dom);
			itemBool = false;
		}

		if(aabbCollision(powerup, paddle)){
			type = powerup.type;
			powerup.dom.parentNode.removeChild(powerup.dom);
			paddleItemCreate();
			setTimeout(paddleItemFix, 4000);
			itemBool = false;
		}
	}

	updateDOMFromGO(ball);

	lifes.dom.innerHTML = ("Lifes = " + lifes.count);
	if(lifes.count == 0){
		var input = confirm("game over");
		if(input){
			location.reload();
		}
	}
}

function ballBrickColl(item, index){
	if(aabbCollision(ball, item)){
		item.life--;

		if(item.life == 2)
			item.dom.style.backgroundColor = colorCodes[colorIndex].twoLife;
		

		else if(item.life == 1)
			item.dom.style.backgroundColor = colorCodes[colorIndex].oneLife;

		else if(item.life == 0){
			item.dom.parentNode.removeChild(item.dom);
			bricks.splice(index,1);
		}

		ball.direction.y *= -1;

		rand = Math.floor(Math.random() * 15);
		if(!itemBool && rand % 6 == 0){
			powerup = createItem(item.x, item.y);
			updateDOMFromGO(powerup);
		}
	}
}

function initGOs(){
	game.x = 0;
	game.y = 0;
	game.dom = document.getElementById("game");
	game.width = game.dom.offsetWidth;
	game.height = game.dom.offsetHeight;
	game.dom.style.backgroundImage = "url('citywallpaper.png')";

	updateDOMFromGO(game);

	paddle.dom = document.getElementById("paddle");
	paddle.width = paddle.dom.offsetWidth;
	paddle.height = paddle.dom.offsetHeight;
	paddle.x = (game.width - paddle.width) / 2;
	paddle.y = game.height - (paddle.height * 4);

	updateDOMFromGO(paddle);

	ball.dom = document.getElementById("ball");
	ball.width = ball.dom.offsetWidth;
	ball.height = ball.dom.offsetHeight;
	ball.x = paddle.x + (paddle.width / 2);
	ball.y = paddle.y - ball.height;
	ball.direction = {
		x : 1,
		y : -1
	}

	updateDOMFromGO(ball);

	brickSet();
}

function updateDOMFromGO(go){
	go.dom.style.width = go.width + "px";
	go.dom.style.height = go.height + "px";
	go.dom.style.top = go.y + "px";
	go.dom.style.left = go.x + "px";
}

function aabbCollision(go1, go2){
	if(go1.x < go2.x + go2.width && go1.x + go1.width > go2.x
		&& go1.y < go2.y + go2.height && go1.y + go1.height > go2.y){
		return true;
	}
	else{
	return false;
	}
}

function createBricks(x, y, life){
	var brick = {};
	brick.dom = document.createElement("div");
	brick.width = 75;
	brick.height = 25;
	brick.x = x;
	brick.y = y;
	brick.dom.style.backgroundColor = "#75D3F6";
	brick.dom.style.position = "absolute";
	brick.life = life;
	game.dom.appendChild(brick.dom);

	return brick;
}

function brickSet(){
	var th = 60;
	var tw = game.width / 2;
	var count = 0;
	for(var i = 0; i < 4; i++){
		tw = game.width / 2 - (120*5);
		for(var j = 0; j < 10; j++){
			rand = Math.floor(Math.random() * 15);
			if(rand%5 == 0){
				bricks[count] = createBricks(tw, th, 3); 
				bricks[count].dom.style.backgroundColor = "#2d5bf1";
			}
			else if(rand%3 == 0){
				bricks[count] = createBricks(tw, th, 2);
				bricks[count].dom.style.backgroundColor = "#7593f6";
			}
			else
				bricks[count] = createBricks(tw, th, 1);

			updateDOMFromGO(bricks[count]);
			count++;
			tw += 120;
		}
		th += 90;
	}
}

function rainbow() {
   	var step = Math.floor(Math.random() * 100);
   	var numOfSteps = Math.floor(Math.random() * 100);

    var r, g, b;
    var h = step / numOfSteps;
    var i = ~~(h * 6);
    var f = h * 6 - i;
    var q = 1 - f;
    switch(i % 6){
        case 0: r = 1; g = f; b = 0; break;
        case 1: r = q; g = 1; b = 0; break;
        case 2: r = 0; g = 1; b = f; break;
        case 3: r = 0; g = q; b = 1; break;
        case 4: r = f; g = 0; b = 1; break;
        case 5: r = 1; g = 0; b = q; break;
    }

    var c = "#" + ("00" + (~ ~(r * 255)).toString(16)).slice(-2) + ("00" + (~ ~(g * 255)).toString(16)).slice(-2) + ("00" + (~ ~(b * 255)).toString(16)).slice(-2);
    return (c);
}

function randomShades() {
    var x = Math.floor(Math.random() * 25) + 50;
	var y = Math.floor(Math.random() * 50) + 100;
	var z = Math.floor(Math.random() * 80) + 175;

	switch(colorIndex){
		case 0: var c = "#" + ("00" + (~ ~(x)).toString(16)).slice(-2) + ("00" + (~ ~(y)).toString(16)).slice(-2) + ("00" + (~ ~(z)).toString(16)).slice(-2);
				break;
		case 1: var c = "#" + ("00" + (~ ~(x)).toString(16)).slice(-2) + ("00" + (~ ~(z)).toString(16)).slice(-2) + ("00" + (~ ~(y)).toString(16)).slice(-2);
				break;
		case 2: var c = "#" + ("00" + (~ ~(y)).toString(16)).slice(-2) + ("00" + (~ ~(x)).toString(16)).slice(-2) + ("00" + (~ ~(z)).toString(16)).slice(-2);
				break;
		case 3: var c = "#" + ("00" + (~ ~(y)).toString(16)).slice(-2) + ("00" + (~ ~(z)).toString(16)).slice(-2) + ("00" + (~ ~(x)).toString(16)).slice(-2);
				break;
		case 4: var c = "#" + ("00" + (~ ~(z)).toString(16)).slice(-2) + ("00" + (~ ~(x)).toString(16)).slice(-2) + ("00" + (~ ~(y)).toString(16)).slice(-2);
				break;
		case 5: var c = "#" + ("00" + (~ ~(z)).toString(16)).slice(-2) + ("00" + (~ ~(y)).toString(16)).slice(-2) + ("00" + (~ ~(x)).toString(16)).slice(-2);
				break;
	}
    //var c = "#" + ("00" + (~ ~(r)).toString(16)).slice(-2) + ("00" + (~ ~(g)).toString(16)).slice(-2) + ("00" + (~ ~(b)).toString(16)).slice(-2);
    console.log(rand);
    return c;
}

function partyMode(item, index){
	game.dom.style.backgroundImage = "url('nyancat.jpg')";
	item.dom.style.backgroundColor = rainbow();
	audio.play();
}

function changeColor(item, index){
	item.dom.style.backgroundColor = randomShades();
}

function createItem(x,y){
	var item = {};

	item.type = Math.floor(Math.random() * 6) + 1;

	itemBool = true;
	item.dom = document.createElement("item");
	item.width = 30;
	item.height = 30;
	item.dom.style.borderRadius = "%50";
	item.x = x;
	item.y = y;
	item.speed = 200 / 1000;

	switch(item.type){
		case 1: item.dom.style.backgroundColor = "pink";
			break;
		case 2: item.dom.style.backgroundColor = "yellow";
			break;
		case 3: item.dom.style.backgroundColor = "orange";
			break;
		case 4: item.dom.style.backgroundColor = "green";
			break;
		case 5: item.dom.style.backgroundColor = "red";
			break;
		case 6: item.dom.style.backgroundColor = "purple";
			break;
	}

	item.dom.style.position = "absolute";

	game.dom.appendChild(item.dom);

	return item;
}

function paddleItemFix(){
	switch(type){
	case 1: paddle.width = paddle.width / 2;
		updateDOMFromGO(paddle);
		break;
	case 2: ball.width /= 2;
		ball.height /= 2;
		updateDOMFromGO(ball);
		break;
	case 3: paddleSpeed /= 2;
		break;
	case 4: paddle.width *= 2;
		updateDOMFromGO(paddle);
		break;
	case 5: ballSpeed /= 2;
		break;
	case 6: ball.width *= 2;
		ball.height *= 2;
		updateDOMFromGO(ball);
		break;
	}
}

function paddleItemCreate(){
	switch(type){
	case 1: paddle.width = paddle.width * 2;
		updateDOMFromGO(paddle);
		break;
	case 2: ball.width *= 2;
		ball.height *= 2;
		updateDOMFromGO(ball);
		break;
	case 3: paddleSpeed *= 2;
		break;
	case 4: paddle.width /= 2;
		updateDOMFromGO(paddle);
		break;
	case 5: ballSpeed *= 2;
		break;
	case 6: ball.width /= 2;
		ball.height /= 2;
		updateDOMFromGO(ball);
		break;
	}
}