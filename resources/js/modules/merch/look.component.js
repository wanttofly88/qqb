define([
	'dispatcher',
	'popup/popup-toggle.component'
], function(
	dispatcher,
	popupToggleProto
) {
	"use strict";

	var elementProto = Object.create(popupToggleProto);

	elementProto.handleMouseenter = function() {
		dispatcher.dispatch({
			type: 'look-mouseenter',
			id: this._id
		});
	}
	elementProto.handleMouseleave = function() {
		dispatcher.dispatch({
			type: 'look-mouseleave',
			id: this._id
		});
	}

	elementProto.createdCallback = function() {
		this.handleMouseenter = this.handleMouseenter.bind(this);
		this.handleMouseleave = this.handleMouseleave.bind(this);
		popupToggleProto.createdCallback.apply(this);
	}
	elementProto.attachedCallback = function() {
		popupToggleProto.attachedCallback.apply(this);

		this.addEventListener('mouseenter', this.handleMouseenter);
		this.addEventListener('mouseleave', this.handleMouseleave);
	}
	elementProto.detachedCallback = function() {
		popupToggleProto.detachedCallback.apply(this);

		this.removeEventListener('mouseenter', this.handleMouseenter);
		this.removeEventListener('mouseleave', this.handleMouseleave);
	}

	document.registerElement('look-component', {
		prototype: elementProto,
		extends: 'button'
	});
});