define(['dispatcher', 'resize/resize.store'], function(dispatcher, resizeStore) {
	"use strict";

	var elementProto = function() {
		var handleResize = function() {
			var ch = this.clientHeight;
			var cw = this.clientWidth;
			var ih = this._img.naturalHeight;
			var iw = this._img.naturalWidth;
			var contCoef = ch/cw;
			var imgCoef = ih/iw;

			if (contCoef < imgCoef) {
				this._img.style.width = cw + 'px';
				this._img.style.height = 'auto';
				this._img.style.left = '0px';
				this._img.style.top = (ch - cw*imgCoef)/2 + 'px';
			} else {
				this._img.style.height = ch + 'px';
				this._img.style.width = 'auto';
				this._img.style.top = '0px';
				this._img.style.left = (cw - ch/imgCoef)/2 + 'px';
			}
		}

		var createdCallback = function() {
			this._handleResize = handleResize.bind(this);
		}
		var attachedCallback = function() {
			this._img = this.getElementsByTagName('img')[0];

			if (Modernizr && Modernizr.objectfit) {
				this._img.style.width = '100%';
				this._img.style.height = '100%';
				this._img.style.objectFit = 'cover';

				return;
			}
			this._handleResize();
			
			resizeStore.eventEmitter.subscribe(this._handleResize);
		}
		var detachedCallback = function() {
			resizeStore.eventEmitter.unsubscribe(this._handleResize);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('full-img', {
		prototype: elementProto
	});
});