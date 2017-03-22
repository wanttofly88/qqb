define([
	'dispatcher',
	'slide-scroll/slide-scroll.store',
	'router/router.store',
	'utils'
], function(
	dispatcher,
	slideStore,
	routerStore,
	utils
) {
	"use strict";

	var elementProto = Object.create(HTMLAnchorElement.prototype);
	var ie = utils.getIEVersion();

	elementProto.handleClick = function(e) {
		var href = routerStore.getData().page.href;
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
	elementProto.handleSlide = function() {
		var index;
		var storeItems = slideStore.getData().items;
		var href;

		if (!storeItems[this._parentId]) {
			console.warn('object with id ' + this._parentId + ' is missing in store');
			return;
		};

		index = slideStore.getData().items[this._parentId].index;

		href = this._hrefData[index];
		if (!href) return;

		if (this.href.indexOf('index') !== -1) {
			this.href = this.href.replace('/index.html', '');
			this.href = this.href.replace('/index.php', '');
		}

		this.setAttribute('href', href);
	}
	elementProto.handleRouter = function() {
		var href = routerStore.getData().page.href;

		if (href === this.href) {
			this.classList.add('active');
		} else {
			this.classList.remove('active');
		}
	}


	elementProto.createdCallback = function() {
		this.handleClick = this.handleClick.bind(this);
		this.handleSlide = this.handleSlide.bind(this);
		this.handleRouter = this.handleRouter.bind(this);
	}
	elementProto.attachedCallback = function() {
		var self = this;
		var parent  = document.getElementsByTagName('slide-scroll')[0];
		var sections = parent.getElementsByTagName('section');

		this._id = this.getAttribute('data-id');
		this._parentId = parent.getAttribute('data-id');
		self._hrefData = [];

		Array.prototype.forEach.call(sections, function(section, index) {
			var hrefData = section.querySelector('.data-href[data-id="' + self._id + '"]');

			if (hrefData) {
				self._hrefData[index] = hrefData.href;
			}
		});

		this.handleSlide();
		this.handleRouter();
		this.addEventListener('click', this.handleClick);
		slideStore.eventEmitter.subscribe(this.handleSlide);
		routerStore.eventEmitter.subscribe(this.handleRouter);
	}
	elementProto.detachedCallback = function() {
		slideStore.eventEmitter.unsubscribe(this.handleSlide);
		routerStore.eventEmitter.unsubscribe(this.handleRouter);
	}

	document.registerElement('href-slider', {
		extends: 'a',
		prototype: elementProto
	});
});