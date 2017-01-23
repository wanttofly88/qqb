define(['dispatcher'], function(dispatcher) {
	"use strict";

	// mostly for some ios safari wierdness

	var elementProto = function() {
		var resizeHandler = function() {
			var wh = window.innerHeight;
			if (this._handledVhCollection && this._handledVhCollection.length !== 0) {
				Array.prototype.forEach.call(this._handledVhCollection, function(element) {
					if (element.clientHeight === wh) return;
					element.style.height = wh + 'px';
				});
			}
			if (this._handledVhMinCollection && this._handledVhMinCollection.length !== 0) {
				Array.prototype.forEach.call(this._handledVhMinCollection, function(element) {
					element.style.minHeight = wh + 'px';
				});
			}
		}
		var handleDispatcher = function(e) {
			if (e.type === 'page-mutated') {
				this._resizeHandler();
			}
		}

		var createdCallback = function() {
			this._resizeHandler = resizeHandler.bind(this);
			this._handleDispatcher = handleDispatcher.bind(this);
		}
		var attachedCallback = function() {
			this._handledVhCollection = document.getElementsByClassName('vh-height');
			this._handledVhMinCollection = document.getElementsByClassName('vh-min-height');

			this._resizeHandler();
			window.addEventListener('resize', this._resizeHandler);
			dispatcher.subscribe(this._handleDispatcher);
		}
		var detachedCallback = function() {
			window.removeEventListener('resize', this._resizeHandler);
			dispatcher.unsubscribe(this._handleDispatcher);
		}

		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('vh-fix', {
		prototype: elementProto,
	});
});