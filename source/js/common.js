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
			jQuery('.loader').removeClass('hide');
		},
		hide : function() {
			jQuery('.loader').addClass('hide');
		}
}

$(function() {
	$(window).resize(function(){
		var window_height = jQuery(window).height();
	  jQuery(".main").height(window_height - 120);
	});

	var hidden, visibilityChange;
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
	  hidden = "hidden";
	  visibilityChange = "visibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
	  hidden = "msHidden";
	  visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
	  hidden = "webkitHidden";
	  visibilityChange = "webkitvisibilitychange";
	}

	// Warn if the browser doesn't support addEventListener or the Page Visibility API
	if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
	  console.log("This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.");
	} else {
	  // Handle page visibility change
	  document.addEventListener(visibilityChange, handleVisibilityChange, false);
	}
});

pageInFocus = true;

function handleVisibilityChange() {
  if (document.hidden) {
  	pageInFocus = false;
  	//console.log('hidden');
  } else  {
  	pageInFocus = true;
    //console.log('shown');
  }
  jQuery(document).trigger('pageFocusChanged');
}
