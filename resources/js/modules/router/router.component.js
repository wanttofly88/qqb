define([
	'dispatcher',
	'utils',
	'router/router.store'
], function(
	dispatcher,
	utils,
	store
) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.check = function(step) {
		this.steps[step].current++;
		if (this.steps[step].current >= this.steps[step].total) {
			dispatcher.dispatch({
				type: 'transition-step-' + step + '-complete'
			});
		}
	}

	elementProto.fetch = function(href) {
		var self = this;

		utils.http(href).get().then(function(responce) {
			var newTitle;

			self.tmpDocument = document.createElement('div');
			self.tmpDocument.innerHTML = responce;
			
			dispatcher.dispatch({
				type: 'transition-check',
				step: 1
			});
		});
	}

	elementProto.route = function(e) {
		this.tmpTransitionData = e.transitionData;

		dispatcher.dispatch({
			type: 'router-page-change',
			href: e.href
		});

		dispatcher.dispatch({
			type: 'transition-start',
			transitionData: e.transitionData
		});

		this.fetch(e.href);
	}

	elementProto.replace = function() {
		var self = this;
		var title;
		var titleValue;
		var containers;
		var url = store.getData().page.href;

		var replaceConteiner = function(container) {
			var id = container.getAttribute('data-id');
			var newContainer;

			if (!id) {
				console.warn('data-id attribute is missing');
				return;
			}

			newContainer = self.tmpDocument.querySelector('.replaceable[data-id="' + id + '"]');
			
			if (!newContainer) {
				console.warn('unable to find container with data-id ' + id + 'on fetched document');
				return;
			}

			container.innerHTML = newContainer.innerHTML;
		}

		if (!this.tmpDocument) return;

		containers = document.getElementsByClassName('replaceable');
		title = this.tmpDocument.getElementsByTagName('title')[0];
		titleValue = title.innerHTML;

		Array.prototype.forEach.call(containers, function(container) {
			replaceConteiner(container);
		});

		document.title = titleValue;

		if (!this.routingByHistory && window.history) {
			window.history.pushState({url: url}, titleValue, url);
		}

		dispatcher.dispatch({
			type: 'transition-check',
			step: 2
		});

		setTimeout(function() {
			dispatcher.dispatch({
				type: 'page-mutated'
			});
		}, 0);
	}

	elementProto.handleDispatcher = function(e) {
		if (e.type === 'route') {
			if (this.isTransitioning) return;

			if (e.byHistory) {
				this.routingByHistory = true;
			} else {
				this.routingByHistory = false;
			}

			this.isTransitioning = true;
			this.route(e);
		}
		if (e.type === 'transition-check') {
			this.check(e.step);
		}
		if (e.type === 'transition-step-1-complete') {
			this.replace();
		}
		if (e.type === 'transition-step-2-complete') {
			dispatcher.dispatch({
				type: 'transition-end',
				transitionData: this.tmpTransitionData
			});

			this.isTransitioning = false;
			this.reset();
		}
		if (e.type === 'transition-step-3-complete') {

		}
	}

	elementProto.handleHistory = function(e) {
		var url = e.state.url;
		e.preventDefault();
		if (!url) return;

		dispatcher.dispatch({
			type: 'route',
			href: url,
			byHistory: true
		});
	}

	elementProto.reset = function() {
		this.steps = {
			1: {
				current: 0,
				total: 2
			},
			2: {
				current: 0,
				total: 1
			},
			3: {
				current: 0,
				total: 1
			}
		}
	}

	elementProto.createdCallback = function() {
		this.isTransitioning = false;
		this.tmpTransitionData = null;

		this.check = this.check.bind(this);
		this.fetch = this.fetch.bind(this);
		this.route = this.route.bind(this);
		this.replace = this.replace.bind(this);
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.reset = this.reset.bind(this);
		this.handleHistory = this.handleHistory.bind(this);

		this.reset();
	}
	elementProto.attachedCallback = function() {
		var url = location.origin + location.pathname;
		
		var ie = utils.getIEVersion();

		if (ie > -1 && ie < 11) {
			return;
		}

		if (window.history) {
			window.history.replaceState({url: url}, false, url);
		}
		dispatcher.dispatch({
			type: 'router-page-change',
			href: url
		});

		window.onpopstate = this.handleHistory;
		dispatcher.subscribe(this.handleDispatcher);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
	}


	document.registerElement('router-component', {
		prototype: elementProto
	});
});