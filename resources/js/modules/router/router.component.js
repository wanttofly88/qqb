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

	var elementProto = function() {
		var check = function(step) {
			this._steps[step].current++;
			if (this._steps[step].current >= this._steps[step].total) {
				dispatcher.dispatch({
					type: 'transition-step-' + step + '-complete'
				});
			}
		}

		var fetch = function(href) {
			var self = this;

			utils.http(href).get().then(function(responce) {
				var newTitle;

				self._tmpDocument = document.createElement('div');
				self._tmpDocument.innerHTML = responce;
				
				dispatcher.dispatch({
					type: 'transition-check',
					step: 1
				});
			});
		}

		var route = function(e) {
			this._tmpTransitionData = e.transitionData;

			dispatcher.dispatch({
				type: 'transition-start',
				transitionData: e.transitionData
			});

			dispatcher.dispatch({
				type: 'router-page-change',
				href: e.href
			});

			this._fetch(e.href);
		}

		var replace = function() {
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

				newContainer = self._tmpDocument.querySelector('.replaceable[data-id="' + id + '"]');
				
				if (!newContainer) {
					console.warn('unable to find container with data-id ' + id + 'on fetched document');
					return;
				}

				container.innerHTML = newContainer.innerHTML;
			}

			if (!this._tmpDocument) return;

			containers = document.getElementsByClassName('replaceable');
			title = this._tmpDocument.getElementsByTagName('title')[0];
			titleValue = title.innerHTML;

			Array.prototype.forEach.call(containers, function(container) {
				replaceConteiner(container);
			});

			document.title = titleValue;

			if (!this._routingByHistory) {
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

		var handleDispatcher = function(e) {
			if (e.type === 'route') {
				if (this._isTransitioning) return;

				if (e.byHistory) {
					this._routingByHistory = true;
				} else {
					this._routingByHistory = false;
				}

				this._isTransitioning = true;
				this._route(e);
			}
			if (e.type === 'transition-check') {
				this._check(e.step);
			}
			if (e.type === 'transition-step-1-complete') {
				this._replace();
			}
			if (e.type === 'transition-step-2-complete') {
				dispatcher.dispatch({
					type: 'transition-end',
					transitionData: this._tmpTransitionData
				});

				this._isTransitioning = false;
				this._reset();
			}
			if (e.type === 'transition-step-3-complete') {

			}
		}

		var handleHistory = function(e) {
			var url = e.state.url;
			if (!url) return;

			dispatcher.dispatch({
				type: 'route',
				href: url,
				byHistory: true
			});
		}

		var reset = function() {
			this._steps = {
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

		var createdCallback = function() {
			this._isTransitioning = false;
			this._tmpTransitionData = null;

			this._check = check.bind(this);
			this._fetch = fetch.bind(this);
			this._route = route.bind(this);
			this._replace = replace.bind(this);
			this._handleDispatcher = handleDispatcher.bind(this);
			this._reset = reset.bind(this);
			this._handleHistory = handleHistory.bind(this);

			this._reset();

			window.onpopstate = this._handleHistory;
		}
		var attachedCallback = function() {
			var url = location.origin + location.pathname;

			window.history.replaceState({url: url}, false, url);
			dispatcher.dispatch({
				type: 'router-page-change',
				href: url
			});

			dispatcher.subscribe(this._handleDispatcher);
		}
		var detachedCallback = function() {
			dispatcher.unsubscribe(this._handleDispatcher);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();


	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('router-component', {
		prototype: elementProto
	});
});