$(document).ready(function() {
	
	setTimeout(function(){
        $('body').addClass('loaded');
        $("#header").remove();
        $("#wrapper").removeAttr("style");
		$('h1').css('color','#222222');
	}, 3000);
	
});