$(function () {
	$(window).scroll(function () {
	  var scrollVal = $(this).scrollTop();
	  var scrollVal_L = $(this).scrollLeft();
	  $(".qScrollTop").text(scrollVal);

	  if(scrollVal >= 200){
	    $("#mainNav").css("background-color","#759532");
	    $("#mainNav .navbar-nav > li > a").css("color","#ffffff");
	    $("a.Logo_t").css("color","#ffffff");
	  }else{
	  	$("#mainNav").css("background-color","#ffffff");
	  	$("#mainNav .navbar-nav > li > a").css("color","#759532");
	  	$("a.Logo_t").css("color","#759532");
	  }

	  if (scrollVal >=350) {
	  	$(".header-content-a,.header-content-p").css("animation","opacity_ 1s ease-in forwards")
	  	$(".download-imgs-top,.download-imgs-bottom").css("animation","opacity_ 1s 0.5s ease-in forwards");
	  	$(".move-to-next1").css("animation","opacity_ 0.5s 1s ease-in forwards");
	  	$(".cellphone_demo").css("animation","opacity_ 1.5s 1.5s ease-in forwards");
	  	$(".move-to-next2").css("animation","opacity_ 0.5s 2s ease-in forwards");
	  	$(".d_map").css("animation","opacity_ 1s 2.5s ease-in forwards");
	  	$(".d_placeholder1").css("animation","opacity_ 0.5s 3.5s forwards");
	  	$(".d_placeholder2").css("animation","opacity_ 0.5s 4s forwards");
	  	$(".d_placeholder3").css("animation","opacity_ 0.5s 4.5s forwards");
	  	$(".d_placeholder4").css("animation","opacity_ 0.5s 5s forwards");

	  }

	});




});