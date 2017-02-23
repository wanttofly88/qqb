define([
	'dispatcher',
	'resize/resize.store'
], function(
	dispatcher,
	resizeStore
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleResize = function() {
		var cw;
		var ch;

		if (this.changedWidth) {
			this.style.height = 'auto';
			this.style.width = this.widthCSS;

			this.changedWidth = false;
		}

		cw = this.clientWidth;
		ch = this.clientHeight;

		if (ch * this.coef === cw) return;

		this.style.height = Math.floor(cw * this.coef) + 'px';

		// max-height
		ch = this.clientHeight;

		if (ch * this.coef !== cw) {
			this.style.width = Math.floor(ch / this.coef) + 'px';
			this.changedWidth = true;
		}
	}
	elementProto.createdCallback = function() {
		this.handleResize = this.handleResize.bind(this);
		this.changedWidth = false;
	}
	elementProto.attachedCallback = function() {
		var style = window.getComputedStyle(this);

		this.widthCSS = style.getPropertyValue('width');
		this.coef = this.getAttribute('data-coef') || 1;
		
		resizeStore.eventEmitter.subscribe(this.handleResize);
		this.handleResize();
		this.style.opacity = 1;
	}
	elementProto.detachedCallback = function() {
		resizeStore.eventEmitter.unsubscribe(this.handleResize);
	}

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('proportional-height', {
		prototype: elementProto
	});
});