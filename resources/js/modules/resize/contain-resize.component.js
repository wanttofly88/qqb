define(['dispatcher', 'resize/resize.store'], function(dispatcher, resizeStore) {
	"use strict";

	var elementProto = function() {
		var handleResize = function() {
			var pw = this.parentNode.clientWidth;
			var ph = this.parentNode.clientHeight;
			var cw = pw/this._naturalWidth;
			var ch = ph/this._naturalHeight;

			if (cw > ch) {
				this.style.width  = this._naturalWidth*ch  + 'px';
				this.style.height = this._naturalHeight*ch + 'px';
			} else {
				this.style.width  = this._naturalWidth*cw  + 'px';
				this.style.height = this._naturalHeight*cw + 'px';
			}
		}

		var createdCallback = function() {
			this._handleResize = handleResize.bind(this);
		}
		var attachedCallback = function() {
			this._naturalWidth  = parseInt(this.getAttribute('data-width'));
			this._naturalHeight = parseInt(this.getAttribute('data-height'));


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
	document.registerElement('contain-resize', {
		prototype: elementProto
	});
});