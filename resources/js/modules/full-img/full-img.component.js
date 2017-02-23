define(['dispatcher', 'resize/resize.store'], function(dispatcher, resizeStore) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleResize = function() {
		var ch = this.clientHeight;
		var cw = this.clientWidth;
		var ih = this.img.naturalHeight;
		var iw = this.img.naturalWidth;
		var contCoef = ch/cw;
		var imgCoef = ih/iw;

		if (contCoef < imgCoef) {
			this.img.style.width = cw + 'px';
			this.img.style.height = 'auto';
			this.img.style.left = '0px';
			this.img.style.top = (ch - cw*imgCoef)/2 + 'px';
		} else {
			this.img.style.height = ch + 'px';
			this.img.style.width = 'auto';
			this.img.style.top = '0px';
			this.img.style.left = (cw - ch/imgCoef)/2 + 'px';
		}
	}

	elementProto.createdCallback = function() {
		this.handleResize = this.handleResize.bind(this);
	}
	elementProto.attachedCallback = function() {
		this.img = this.getElementsByTagName('img')[0];

		if (Modernizr && Modernizr.objectfit) {
			this.img.style.width = '100%';
			this.img.style.height = '100%';
			this.img.style.objectFit = 'cover';

			return;
		}
		this.handleResize();
		
		resizeStore.eventEmitter.subscribe(this.handleResize);
	}
	elementProto.detachedCallback = function() {
		resizeStore.eventEmitter.unsubscribe(this.handleResize);
	}

	document.registerElement('full-img', {
		prototype: elementProto
	});
});