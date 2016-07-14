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
	})

	socket.on('disconnect', function() {
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
		 socket.in(roomname).emit("room.success",rooms[roomname]);
		//更新状态新消息
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