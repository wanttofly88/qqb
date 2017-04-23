define([
	'dispatcher',
	'router/router.store',
	'utils'
], function(
	dispatcher,
	store,
	utils
) {
	"use strict";

	var elementProto = Object.create(HTMLAnchorElement.prototype);
	var ie = utils.getIEVersion();

	elementProto.handleClick = function(e) {
		var href = store.getData().page.href;
		var self = this;

		if (ie > -1 && ie < 11) {
			return;
		}

		e.preventDefault();
		if (href === this.href) return;

		dispatcher.dispatch({
			type: 'route',
			href: self.href,
			transitionData: {
				animation: 'basic',
				url: href,
				element: self
			}
		});
	}
	elementProto.handleStore = function() {
		var href = store.getData().page.href;

		if (href === this.href) {
			this.classList.add('active');
		} else {
			this.classList.remove('active');
		}
	}

	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
		this.handleStore = this.handleStore.bind(this);
	}
	elementProto.attachedCallback = function() {
		// this.href = this.href;

		// if (this.href.indexOf('index') !== -1) {
		// 	this.href = this.href.replace('/index.html', '');
		// 	this.href = this.href.replace('/index.php', '');
		// }


		this.handleStore();

		this.addEventListener('click', this.handleClick);
		store.eventEmitter.subscribe(this.handleStore);
	}
	elementProto.detachedCallback = function() {
		store.eventEmitter.unsubscribe(this.handleStore);
	}

	document.registerElement('inner-link', {
		extends: 'a',
		prototype: elementProto
	});
});