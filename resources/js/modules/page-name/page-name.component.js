define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.handleMutation = function() {
		var title = document.getElementsByTagName('title')[0];
		var text = title.innerHTML;
		console.log(text);
	}

	elementProto.handleDispatcher = function(e) {
		if (e.type === 'page-mutated') {
			this.handleMutation();
		}
	}
	elementProto.createdCallback = function() {
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.handleMutation = this.handleMutation.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._text = this.innerHTML;
		this.handleMutation();
		dispatcher.subscribe(this.handleDispatcher);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
	}

	document.registerElement('page-name', {
		prototype: elementProto
	});
});