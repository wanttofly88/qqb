define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	slideStore
) {

	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleClick = function() {
		var index;
		var storeItems = slideStore.getData().items;
		var dataElement;
		var src;

		if (!storeItems.hasOwnProperty(this._parentId)) return;

		index = storeItems[this._parentId].index;

		dataElement = this._sections[index].querySelector('button[is="video-play"]');
		src = dataElement.getAttribute('data-src');

		dispatcher.dispatch({
			type: 'video-play',
			src: src
		});
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
	}
	elementProto.attachedCallback = function() {
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections = parent.getElementsByTagName('section');

		this._parentId = parent.getAttribute('data-id');
		this._sections = sections;

		this.addEventListener('click', this.handleClick);
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
	}

	document.registerElement('video-play-fixed', {
		extends: 'button',
		prototype: elementProto
	});
});