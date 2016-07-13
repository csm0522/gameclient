$(".container .left img").on("click",function(){
	var type = $(this).data("type");
//	alert(type);
	var that = $(this);
	var rights = $(".container .right img");
	var index= Math.floor(Math.random() * 3);
	var right = $(rights[index]); 
	switch (type){
		case 0 : that.css("transform","translate(0px,150px)");break;
		case 1 : that.css("transform","translate(0px,150px)");break;
		case 2 : that.css("transform","translate(0px,150px)");break;
	}
	switch (index){
		case 0 : right.css("transform","translate(0px,150px)");break;
		case 1 : right.css("transform","translate(0px,150px)");break;
		case 2 : right.css("transform","translate(0px,150px)");break;
	}
	
	setTimeout(function(){
		that.css("transform","translate(0px,0px)");
		right.css("transform","translate(0px,0px)");
	},500);
	
	var res = type - index ;
	switch(res){
		case 0:$(".info ul").prepend("<li>平局\t"+new Date()+"</li>");break;
		case -1:$(".info ul").prepend("<li>胜局\t"+new Date()+"</li>");break;
		case 2:$(".info ul").prepend("<li>胜局\t"+new Date()+"</li>");break;
		default:$(".info ul").prepend("<li>败局\t"+new Date()+"</li>");break;
	}
	
})
