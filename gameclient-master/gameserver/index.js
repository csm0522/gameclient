//创建websocket服务器
var server = require('http').createServer();
var io = require('socket.io')(server);
var users = {};
var rooms = {};

//socket就是客户端与服务器的通道
io.on('connection', function(socket) {
	//	socket.join("public");
	console.log("一个用户连接到服务器");

	socket.on('user.online', function(user) {
		user.room = 'public';
		socket.join(user.room);
		users[user.id] = user; //保存用户信息
		//广播也用户信息
		io.sockets.emit('user.online', getArr(users));
		io.sockets.in("public").emit("room.rooms", getArr(rooms));
	});

	socket.on('room.create', function(roomname) {
		if(rooms[roomname]) {
			socket.emit("rooms.existroom");
			return;
		}
		//因为后端的socket.id 比前端多了一个／＃需要用正则判断去掉
		var user = users[socket.id.replace("/#", '')];
		rooms[roomname] = {
			roomname: roomname,
			player1: user,
			player2: null
		};
		//离开当前房间，进入新的房间
		socket.leave(user.room);
		user.room = roomname;
		socket.join(user.room);
		user.status = 2;
		//广播房间信息
		io.sockets.in("public").emit("room.rooms", getArr(rooms));
		//通知玩家
		socket.emit("room.success", rooms[roomname]);
		//更新状态新消息
		io.sockets.emit('user.online', getArr(users));
	});

	socket.on('chat.send', function(chat) {
		var user = users[socket.id.replace("/#", '')];
		socket.to(user.room).emit("chat.newchat", chat);
	});

	socket.on("room.leave", function() {
		var user = users[socket.id.replace("/#", '')];
		var room = rooms[user.room];
		if(user.id == room.player1.id) { //if it is the room owner
			delete rooms[user.room];
			if(room.player2) {
				room.player2.status = 1;
				room.player2.room = "public";
				var so = io.sockets.sockets["/#" + room.player2.id];
				so.leave(user.room);
				so.join("public");
			}
		} else {
			room.player2 = null;
			socket.in(user.room).emit("room.success", room);
		}

		socket.leave("user.room");
		socket.join("public");
		user.status = 1;
		user.room = "public";
		//自己离开，刷新房间列表
		io.sockets.in("public").emit("room.rooms", getArr(rooms));
		io.sockets.emit("user.online", getArr(users));
	});

	socket.on('disconnect', function() {
		var user = users[socket.id.replace("/#", '')];

		if(user.status == 3) {
			var room = rooms[user.room];
			if(user.id == room.player1.id) {
				delete rooms[user.room];
				room.player2.status = 1;
				room.player2.room = "public";
				room.player2.win += 1;
				room.player2.total += 1;
				//find 对方的socket。id 离开房间进入public
				var so = io.sockets.sockets["/#" + room.player2.id];
				so.leave(user.room);
				so.join("public");
				so.emit("game.over", room.player2);
				so.emit("chat.newchat", {
					nickname: "系统消息",
					msg: "对方已掉线"
				});
				io.sockets.in("public").emit("room.rooms", getArr(rooms));
			} else {
				var player1 = room.player1;
				player1.status = 2;
				player1.win += 1;
				player1.total += 1;
				room.player2 = null;
				socket.in(user.room).emit("game.over", room.player1);
				socket.in(user.room).emit("room.rooms", room);
				socket.in(user.room).emit("chat.newchat", {
					nickname: "系统消息",
					msg: "对方已掉线"
				})
			}
		} else if(user.status == 2) {
			var room = rooms[user.room];
			if(user.id == room.player1.id) {
				delete rooms[user.room];
			}
			if(room.player2) {
				room.player2.status = 1;
				room.player2.room = "public";
				var so = io.sockets.sockets["/#" + room.player2.id];
				so.leave(user.room);
				so.join("public");
			} else {
				room.player2 = null;
				socket.in(user.room).emit("room.rooms", room);
			}
		}
		//删掉自己，告知所有人
		delete users[socket.id.replace("/#", '')];
		io.sockets.emit('user.online', getArr(users));
	});
	//join room
	socket.on("room.join", function(roomname) {
		if(rooms[roomname].player2 != null) {
			socket.emit("room.full");
			return;
		}
		var user = users[socket.id.replace("/#", '')];
		socket.leave(user.room);
		user.room = roomname;
		socket.join(user.room);
		user.status = 2;
		rooms[roomname].player2 = user;
		//广播房间信息
		io.sockets.in("public").emit("room.rooms", getArr(rooms));
		//通知玩家
		socket.emit("room.joinOK", rooms[roomname]);
		//通知房主
		socket.in(roomname).emit("room.success", rooms[roomname]);
		//更新状态新消息
		io.sockets.emit('user.online', getArr(users));
	});

	socket.on("game.start", function() {
		var user = users[socket.id.replace("/#", '')];
		var room = rooms[user.room];
		if(room.player1 && room.player2) {
			//player1 gamestart order
			socket.emit("game.start", 0);
			//player2 gamestart order
			socket.in(user.room).emit("game.start", 1);

			room.player1.status = 3;
			room.player2.status = 3;
			
			io.sockets.emit("user.online", getArr(users));
		}
	});
	//change data between the player1 and player2
	socket.on("game.changedata", function(data) {
		var user = users[socket.id.replace("/#", '')];
		socket.in(user.room).emit("game.changedata", data);
	});

	//the order of gameover 
	socket.on("game.over", function() {
		//find the player
		var user = users[socket.id.replace("/#", '')];
		var room = rooms[user.room];
		//to figure out who is winner
		var winner = user.id == room.player1.id ? room.player1 : room.player2;
		var loser = user.id == room.player1.id ? room.player2 : room.player1;
		//update the info of player in the room
		winner.win += 1;
		winner.total += 1;
		winner.status = 2;
		loser.total += 1;
		loser.status = 2;
		//return the order of gameover
		socket.emit("game.over", winner);
		socket.in(user.room).emit("game.over", loser);
		//send system info
		io.sockets.in(user.room).emit("chat.newchat", {
			nickname: "系统消息",
			msg: winner.nickname + "win！"
		});
		//update online list
		io.sockets.emit('user.online', getArr(users));
	})

});
//object转为数组
function getArr(arrname) {
	var arr = [];
	for(var key in arrname) //循环users
	{
		arr.push(arrname[key]); //把users 的值传值
	}
	return arr;
}
//开启服务器
server.listen(3000);
console.log('服务器开启成功!');