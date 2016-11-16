var storage = {
	store : function(key,value) {
		// body...
		if (typeof (Storage) !== "undefined") {
            window.localStorage.setItem(key, value);
        }
	},
	get : function(key) {
		if (typeof (Storage) !== "undefined" && localStorage.getItem(key) !== null) {
			return localStorage.getItem(key);
		} else{
			return false;
		}
	}
}

var progress_bar = {
		show : function(){
			jQuery('[rel="progress_bar"]').removeClass('hide');
		},
		hide : function() {
			jQuery('[rel="progress_bar"]').addClass('hide');
		}
}

$(function() {
	$(window).resize(function(){
		var window_height = jQuery(window).height();
	  jQuery(".main").height(window_height - 120);
	});
});
