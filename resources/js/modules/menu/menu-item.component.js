define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = function() {
		var animate = function() {
			// this._glith.setPropertyes({
			// 	sim: 2,
			// 	throttle: 2
			// });
			// this._glith.stop();
			this._glith.animate(this._glith.getAttribute('data-to'));
		}
		var stopAnimation = function() {
			// this._glith.setPropertyes({
			// 	sim: 2,
			// 	throttle: 2
			// });
			this._glith.stop();
			// this._glith.animate(false);
		}

		var createdCallback = function() {
			this._animate = animate.bind(this);
			this._stopAnimation = stopAnimation.bind(this);
		}
		var attachedCallback = function() {
			this._link  = this.getElementsByTagName('a')[0];
			this._glith = this.getElementsByTagName('text-glitch')[0];

			this._link.addEventListener('mouseenter', this._animate);
			this._link.addEventListener('mouseleave', this._stopAnimation);
		}
		var detachedCallback = function() {
			this._link.removeEventListener('mouseenter', this._animate);
			this._link.removeEventListener('mouseleave', this._stopAnimation);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('menu-item', {
		prototype: elementProto
	});
});