var pen = null;
var flag = 0; //1->white,0 ->black
var cheese = [];
var res = 0;
var status = "run"; //run & wait
function gameInit(id, _flag) {

	var html = '<canvas id="five" width="600px" height="600px" style="display:block;background-color:teal"></canvas>'

	if(id) {
		$("#" + id).append(html);
	} else {
		$("body").append(html);
	}
	//由于页面还未渲染。所以在渲染之前取对象无效
	var cans = $("#five");
	var offset = cans.offset();
	pen = cans[0].getContext("2d");
	pen.strokeStyle = "#CCCCCC";
	pen.beginPath();
	//draw the platform
	for(var i = 0; i < 15; i++) {
		pen.moveTo(0, i * 40);
		pen.lineTo(600, i * 40);
		pen.stroke();
	}
	for(var i = 0; i < 15; i++) {
		pen.moveTo(i * 40, 0);
		pen.lineTo(i * 40, 600);
		pen.stroke();
	}
	//Init Array
	cheese = [];
	for(var i = 0; i < 15; i++) {
		var temp = [];
		for(var j = 0; j < 15; j++) {
			temp.push(-1);
		}
		cheese.push(temp);
	}
	pen.closePath();
	
	switch(_flag) {
		//first is black
		case 0:
			flag = 0;
			status = "run";
			showChat({
				nickname: "系统提示",
				msg: "系统分配，先手执黑"
			}, true);
			break;
		case 1:
			flag = 1;
			status = "wait";
			showChat({
				nickname: "系统提示",
				msg: "系统分配，先手执黑"
			}, true);
			break;
	}

	cans.unbind().mousedown(function(evnet) {
		if(status == "wait") {
			alert("目前由对方执棋");
			return;
		}
		if(res == 0) {
			var x = event.clientX - offset.left;
			var y = event.clientY - offset.top;
			var row = Math.floor(y / 40.0);
			var col = Math.floor(x / 40.0);

			console.log(row, col);
			if(cheese[row][col] != -1) {
				return;
			} else if(cheese[row][col] == -1) {
				cheese[row][col] = flag;
				pen.beginPath();
				switch(flag) { //first is black
					case 0:
						pen.fillStyle = "#000000";
						break;
					case 1:
						pen.fillStyle = "#eee";
						break;
				}
				pen.arc(col * 40 + 20, row * 40 + 20, 15, 0, 2 * Math.PI); //x,y,r,start,end
				pen.fill();
				pen.closePath();
				//change
				socket.emit("game.changedata", {
					row: row,
					col: col,
					flag: flag,
				});
				status = "wait";
				if(gameover(row, col, flag)) {
					socket.emit("game.over");
				}
				//flag = flag == 0 ? 1 : 0;
			}
		}
	})

}

function draw(row, col, flag) {
	cheese[row][col] = flag;
	pen.beginPath();
	switch(flag) { //first is black
		case 0:
			pen.fillStyle = "#000000";
			break;
		case 1:
			pen.fillStyle = "#eee";
			break;
	}
	pen.arc(col * 40 + 20, row * 40 + 20, 15, 0, 2 * Math.PI); //x,y,r,start,end
	pen.fill();
	pen.closePath();
}

function gameover(row, col, flag) {
	var count = 1;
	var str = flag == 0 ? "black" : "white";
	//上下
	for(var i = row - 1; i >= 0; i--) {
		if(cheese[i][col] == flag) {
			count++;
		} else {
			break;
		}
	}
	if(count >= 5) {
		//alert("game over!" + str + " win");
		res = 1;
		return true;
	}
	count = 1;
	for(var i = row + 1; i < 15; i++) {
		if(cheese[i][col] == flag) {
			count++;
		} else {
			break;
		}
	}
	if(count >= 5) {
		//		alert("game over!" + str + " win");
		res = 1;
		return true;

	}
	count = 1;
	//左右
	for(var i = col - 1; i >= 0; i--) {
		if(cheese[row][i] == flag) {
			count++;
		} else {
			break;
		}
	}
	if(count >= 5) {
		//		alert("game over!" + str + " win")
		res = 1;
		return true;
	}
	count = 1;
	for(var i = row + 1; i < 15; i++) {
		if(cheese[row][i] == flag) {
			count++;
		} else {
			break;
		}
	}
	if(count >= 5) {
		//		alert("game over!" + str + " win");
		res = 1;
		return true;
	}
	count = 1;
	//对角线row col
	//左上x-y-
	for(var i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
		if(cheese[i][j] == flag) {
			count++;
		} else {
			break;
		}
	}
	if(count >= 5) {
		//		alert("game over!" + str + " win");
		res = 1;
		return true;
	}
	count = 1;
	//右上row-col+
	for(var i = row - 1, j = col + 1; i >= 0 && j < 15; i--, j++) {
		if(cheese[i][j] == flag) {
			count++;
		} else {
			break;
		}
	}
	if(count >= 5) {
		//		alert("game over!" + str + " win");
		res = 1;
		return true;
	}
	count = 1;
	//左下row +col-
	for(var i = row + 1, j = col - 1; i < 15 && j >= 0; i++, j--) {
		if(cheese[i][j] == flag) {
			count++;
		} else {
			break;
		}
	}
	if(count >= 5) {
		//		alert("game over!" + str + " win");
		res = 1;
		return true;
	}
	count = 1;
	//右下row + col +
	for(var i = row + 1, j = col + 1; i < 15 && j < 15; i++, j++) {
		if(cheese[i][j] == flag) {
			count++;
		} else {
			break;
		}
	}
	if(count >= 5) {
		//		alert("game over!" + str + " win");
		res = 1;
		return true;
	}
	count = 1;
}

$("#replay").click(function() {
		pen.clearRect(0, 0, 600, 600);
		res = 0;
		cheese = [];
		gameInit();
	})
	//when game over : 
	//1:to tell server that the game is over,it must be the player won the game;
	//2:update the players status,win,and total
	//3:update the information of players and the list of online
function whenGameover() {

}