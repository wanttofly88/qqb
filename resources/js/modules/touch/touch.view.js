define(['dispatcher', 'touch/touch.store'], function(dispatcher, store) {

	"use strict";

	var init = function() {
		var touch;
		var touchStart = 'ontouchstart' in window;
		var isFirefox  = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
		var html = document.getElementsByTagName('html')[0];

		if (isFirefox) {
			if (window.innerWidth >= 1000) {
				touch = false;
			} else {
				touch = true;
			}
		} else {
			if (touchStart) {
				touch = true;
			} else {
				touch = false;
			}
		}

		dispatcher.dispatch({
			type: 'touch-set',
			touch: touch
		});

		if (isFirefox) {
			html.classList.add('firefox-detected');
			html.classList.remove('touch-undetected');
		} else {
			html.classList.remove('touch-detected');
			html.classList.add('firefox-undetected');
		}

		if (touch) {
			html.classList.add('touch-detected');
			html.classList.remove('touch-undetected');
		} else {
			html.classList.remove('touch-detected');
			html.classList.add('touch-undetected');
		}
	}

	init();
});