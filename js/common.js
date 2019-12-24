$(document).ready(function(){
	$('.menu-col .toggle').click(() => {
		$('.profile').toggleClass('big');
		$('.state').toggleClass('big');
		$('.menu-col').toggleClass('small');
	});
	const popupClose = function() {$('.pop-up').removeClass('visible')}
	$('.pop-up-bg').click(popupClose);
	$('.pop-up-close').click(popupClose);
});
