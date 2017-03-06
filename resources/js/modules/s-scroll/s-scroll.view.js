define(['dispatcher', 'utils', 'TweenMax'], function(dispatcher, utils, TweenMax) {

	"use strict";

	var _scroll = function(e) {
		var speed = 0.35;
		var pos;
		var scrollContainer = window;

		var animate = function() {
			var obj = {
				y: 0
			}
			var position = (window.pageYOffset || window.document.scrollTop) - (window.document.clientTop || 0);
			if (isNaN(position)) position = 0;

			obj.y = position;

			TweenMax.to(obj, speed, {
				y: pos,
				ease:Sine.easeInOut,
				onUpdate: function() {
					if (scrollContainer === window) {
						scrollContainer.scrollTo(0, obj.y);
					} else {
						scrollContainer.scrollTop  = obj.y;
					}
				}
			});
		}

		if (e.hasOwnProperty('speed') && typeof e.speed === 'number') {
			speed = e.speed;
		}
		if (e.hasOwnProperty('scrollContainer')) {
			scrollContainer = e.scrollContainer;
		}
		if (e.hasOwnProperty('position') && typeof e.position === 'number') {
			pos = e.position;
			animate();
		} else if (e.hasOwnProperty('element')) {
			pos = utils.offset(e.element).top;
			animate();
		}
	}

	dispatcher.subscribe(function(e) {
		if (e.type === 'scroll-to') {
			_scroll(e);
		}
	});
});