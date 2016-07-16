var pen = null;
var type = "pen"; //pen line rect arc
var isdraw = false;
var cans = $("#cans");
pen = cans.get(0).getContext("2d");
var offest = cans.offset();
var lcolor = "";
var lwidth = 1;
$(function() {

	left = offest.left;
	tops = offest.top;
	pencil();

	$("#pencil").click(function() {
		pencil();
	});
	$("#line").click(function() {
		lines();
	});
	$("#rect").click(function() {
		rectangle();
	});
	$("#circle").click(function() {
		circle();
	});
	$("#rcircle").click(function() {
		roundcircle();
	});
	$("#saver").click(function() {
		var str = cans.get(0).toDataURL();
		$("#res").prepend("<img src='" + str + "' style='margin-top:10px;border:1px solid gray;'>");
	});
	$("#eraser").click(function() {
		cleaner();
	})
	$("#linewidth").change(function() {
		pen.lineWidth = $(this).val();
	});
	$("#linecolor").change(function() {
		pen.strokeStyle = $(this).val();
	})
});

function pencil() {
	cans.unbind().mousedown(function(event) {
		isdraw = true;
		pen.beginPath();
		pen.moveTo(event.clientX - offest.left, event.clientY - offest.top);
	}).mousemove(function(event) {
		if(isdraw) {
			pen.lineTo(event.clientX - offest.left, event.clientY - offest.top);
			pen.stroke();
		}
	}).mouseup(function(event) {
		pen.closePath();
		isdraw = false;
	}).mouseleave(function() {
		isdraw = false;
	});
}

function lines() {
	cans.unbind().mousedown(function(event) {
		isdraw = true;
		pen.beginPath();
		pen.moveTo(event.clientX - offest.left, event.clientY - offest.top);
	}).mouseup(function(event) {
		if(isdraw) {
			pen.lineTo(event.clientX - offest.left, event.clientY - offest.top);
			pen.stroke();
			pen.closePath();
			isdraw = false;
		}
	}).mouseleave(function(event) {
		isdraw = false;
	});
}

function circle() {
	var circlex = circley = 0;
	cans.unbind().mousedown(function(event) {
		isdraw = true;
		pen.beginPath(); //开启端点
		pen.lineCap = "round";
		circlex = event.clientX - offest.left;
		circley = event.clientY - offest.top;
	}).mouseup(function(event) {
		if(isdraw) {
			var r = (circlex - event.clientX) * (circlex - event.clientX) + (circley - event.clientY) * (circley - event.clientY);
			r = 0.5 * Math.sqrt(r);
			pen.arc(circlex, circley, r, 0, 2 * Math.PI); //x,y,r,start,end
			pen.stroke();
			pen.closePath();
		}
		isdraw = false;
	});
	cans.mouseleave(function(event) {
		isdraw = false;
		pen.stroke();
		pen.closePath();
	});
}

function roundcircle() {
	var circlex = circley = 0;
	cans.unbind().mousedown(function(event) {
		isdraw = true;
		pen.beginPath(); //开启端点
		pen.lineCap = "round";
		circlex = event.clientX - offest.left;
		circley = event.clientY - offest.top;
	}).mousemove(function(event) {
		if(isdraw) {
			var r = (circlex - event.clientX) * (circlex - event.clientX) + (circley - event.clientY) * (circley - event.clientY);
			r = 0.5 * Math.sqrt(r);
			pen.arc(circlex, circley, r, 0, 2 * Math.PI); //x,y,r,start,end
			pen.stroke();
			pen.closePath();
		}
	}).mouseup(function(event) {
		isdraw = false;
	});
	cans.mouseleave(function(event) {
		isdraw = false;
		pen.stroke();
		pen.closePath();
	});
}

function rectangle() {
	var rectx = 0;
	var recty = 0;
	cans.unbind().mousedown(function(event) {
		isdraw = true;
		pen.beginPath();
		rectx = event.clientX - offest.left;
		recty = event.clientY - offest.top;
	}).mouseup(function(event) {
		if(isdraw) {
			var w = event.clientX - offest.left - rectx;
			var h = event.clientY - offest.top - recty;
			pen.rect(rectx, recty, w, h); //x,y,w,h
			pen.stroke();
			pen.closePath();
		}
		isdraw = false;
	}).mouseleave(function(event) {
		isdraw = false;
	});
}

function cleaner() {
	cans.unbind().mousedown(function(event) {
		isdraw = true;
	}).mousemove(function(event) {
		if(isdraw) {
			var width = pen.lineWidth * 10;
			pen.clearRect(event.clientX - offest.left, event.clientY - offest.top, width, width);
		}
	}).mouseup(function(event) {
		isdraw = false;
	})
}