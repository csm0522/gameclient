//创建websocket服务器
var server = require('http').createServer();
var io = require('socket.io')(server);
var users = {};
//socket就是客户端与服务器的通道
io.on('connection', function(socket){
	socket.join("public");
  console.log("一个用户连接到服务器");
  
  socket.on('user.online',function(user){
  	user.room= 'public';
		users[user.id]=user;//保存用户信息
		//广播也用户信息
		io.sockets.emit('user.online',getUser());
  });
socket.on('chat.send',function(chat){
	var user = users[socket.id.replace("/#",'')];
	socket.to(user.room).emit("chat.newchat",chat);
})

  socket.on('disconnect', function(){
     delete users[socket.id.replace("/#",'')];
     io.sockets.emit('user.online',getUser());
  });
});
function getUser(){
	var arr = [];
	for(var key in users)//循环users
	{
		arr.push(users[key]);//把users 的值传值
	}
	return arr;
}
//开启服务器
server.listen(3000);
console.log('服务器开启成功!');