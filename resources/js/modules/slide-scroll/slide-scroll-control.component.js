define([
	'dispatcher',
	'slide-scroll/slide-scroll.store'
], function(
	dispatcher,
	store
) {
	"use strict";

	var elementProto = Object.create(HTMLButtonElement.prototype);

	elementProto.handleStore = function() {
		var storeData = store.getData().items[this._id];
		var self = this;
		var timeForBlocking;

		if (!storeData || storeData.index === this._index) return;

		timeForBlocking = storeData.timeForBlocking || 800;

		this._index = storeData.index;
		this._animating = true;

		setTimeout(function() {
			self._animating = false;
		}, timeForBlocking);

		if (this._to === 'prev') {
			if (this._index === 0) {
				this.classList.add('inactive');
			} else {
				this.classList.remove('inactive');
			}
		} else if (this._to === 'next') {
			if (this._index === storeData.total - 1) {
				this.classList.add('inactive');
			} else {
				this.classList.remove('inactive');
			}
		}
	}
	elementProto.handleClick = function() {
		if (this._animating) return;

		if (this._to === 'next') {
			dispatcher.dispatch({
				type: 'slide-scroll',
				direction: 'bottom',
				id: this._id
			});
		} else if (this._to === 'prev') {
			dispatcher.dispatch({
				type: 'slide-scroll',
				direction: 'top',
				id: this._id
			});
		} else {
			dispatcher.dispatch({
				type: 'slide-scroll-to',
				index: parseInt(this._to),
				id: this._id
			});
		}
	}

	elementProto.createdCallback = function() {
		this._animating = false;
		this._index = null;

		this.handleStore = this.handleStore.bind(this);
		this.handleClick = this.handleClick.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._id = this.getAttribute('data-id');
		if (!this._id) {
			console.warn('data-id attribute is missing on slide-scroll-control');
		}
		this._to = this.getAttribute('data-to');
		if (!this._to) {
			console.warn('data-to attribute is missing on slide-scroll-control');
		}

		this.addEventListener('click', this.handleClick);
		store.eventEmitter.subscribe(this.handleStore);
		this.handleStore();
	}
	elementProto.detachedCallback = function() {
		this.removeEventListener('click', this.handleClick);
		store.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('slide-scroll-control', {
		extends: 'button',
		prototype: elementProto
	});
});