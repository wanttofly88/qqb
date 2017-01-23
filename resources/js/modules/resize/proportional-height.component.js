define([
	'dispatcher',
	'resize/resize.store'
], function(
	dispatcher,
	resizeStore
) {
	"use strict";

	var elementProto = function() {
		var handleResize = function() {
			var cw;
			var ch;

			if (this._changedWidth) {
				this.style.height = 'auto';
				this.style.width = this._widthCSS;

				this._changedWidth = false;
			}

			cw = this.clientWidth;
			ch = this.clientHeight;

			if (ch * this._coef === cw) return;

			this.style.height = Math.floor(cw * this._coef) + 'px';

			// max-height
			ch = this.clientHeight;
			if (ch * this._coef !== cw) {
				this.style.width = Math.floor(ch / this._coef) + 'px';
				this._changedWidth = true;
			}
		}
		var createdCallback = function() {
			this._handleResize = handleResize.bind(this);
			this._changedWidth = false;
		}
		var attachedCallback = function() {
			var style = window.getComputedStyle(this);

    		this._widthCSS = style.getPropertyValue('width');
			this._coef = this.getAttribute('data-coef') || 1;
			
			resizeStore.eventEmitter.subscribe(this._handleResize);
			this._handleResize();
			this.style.opacity = 1;
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
	document.registerElement('proportional-height', {
		prototype: elementProto
	});
});