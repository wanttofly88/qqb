define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.getSelected = function() {
		return this._selected;
	}
	elementProto.setActive = function(activeItem) {
		var activeId = activeItem.getAttribute('data-productId');
		var evnt;
		var self = this;

		Array.prototype.forEach.call(this._items, function(item) {
			var itemId = item.getAttribute('data-productId');

			if (itemId === activeId) {
				item.classList.add('active');
				self._selected = itemId;
			} else {
				item.classList.remove('active');
			}
		});

		evnt = new CustomEvent('size-select', {
			'detail': activeId
		})
		self.dispatchEvent(evnt);
	}

	elementProto.createdCallback = function() {
		this._selected = null;
		this.getSelected = this.getSelected.bind(this);
		this.setActive = this.setActive.bind(this);
	}
	elementProto.attachedCallback = function() {
		var self = this;
		this._items = this.getElementsByClassName('item');

		Array.prototype.forEach.call(this._items, function(item) {
			item.addEventListener('click', function(e) {
				self.setActive(this)
			});
		});
	}

	elementProto.detachedCallback = function() {
	}

	document.registerElement('merch-sizes', {
		prototype: elementProto
	});
});