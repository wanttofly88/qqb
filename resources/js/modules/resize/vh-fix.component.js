define(['dispatcher'], function(dispatcher) {
	"use strict";

	// mostly for some ios safari wierdness
	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.resizeHandler = function() {
		var wh = window.innerHeight;
		if (this.handledVhCollection && this.handledVhCollection.length !== 0) {
			Array.prototype.forEach.call(this.handledVhCollection, function(element) {
				if (element.clientHeight === wh) return;
				element.style.height = wh + 'px';
			});
		}
		if (this.handledVhMinCollection && this.handledVhMinCollection.length !== 0) {
			Array.prototype.forEach.call(this.handledVhMinCollection, function(element) {
				element.style.minHeight = wh + 'px';
			});
		}
	}

	elementProto.handleDispatcher = function(e) {
		if (e.type === 'page-mutated') {
			this.resizeHandler();
		}
	}

	elementProto.createdCallback = function() {
		this.resizeHandler = this.resizeHandler.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
	}

	elementProto.attachedCallback = function() {
		this.handledVhCollection = document.getElementsByClassName('vh-height');
		this.handledVhMinCollection = document.getElementsByClassName('vh-min-height');
		this.resizeHandler();
		window.addEventListener('resize', this.resizeHandler);
		dispatcher.subscribe(this.handleDispatcher);
	}

	elementProto.detachedCallback = function() {
			window.removeEventListener('resize', this.resizeHandler);
			dispatcher.unsubscribe(this.handleDispatcher);
		}

	document.registerElement('vh-fix', {
		prototype: elementProto,
	});
});