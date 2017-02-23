define(['dispatcher', 'utils'], function(dispatcher, utils) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	elementProto.basicTranisiton = function() {
		var start = function(e) {
			dispatcher.dispatch({
				type: 'transition-check',
				step: 1
			});
		}
		var end = function(e) {
			dispatcher.dispatch({
				type: 'transition-check',
				step: 3
			});
		}

		return {
			start: start.bind(this),
			end: end.bind(this)
		}
	}

	elementProto.menuTransition = function() {
		var start = function (e) {
			this.tmpElements;
			var el = e.transitionData.element;
			var mt = el.getElementsByTagName('menu-text')[0];
			var mg = el.getElementsByClassName('glitch-fake')[0];
			var bc = mt.getBoundingClientRect();
			var fake = document.createElement('div');
			var fakeInnerFinish = document.createElement('div');
			var fakeInnerStart = document.createElement('div');
			var delay = 400;

			dispatcher.dispatch({
				type: 'preload-start',
				transitionData: this._tmpTransitionData
			});

			this.innerHTML = '';

			fake.className = 'menu-fake';
			fake.style.position = 'absolute';
			fake.style.width = bc.width + 'px';
			fake.style.height = bc.height + 'px';
			fake.style.top = bc.top + 'px';
			fake.style.left = bc.left + 'px';

			fake.appendChild(fakeInnerFinish);
			fake.appendChild(fakeInnerStart);

			fakeInnerFinish.className = 'menu-fake-top';
			fakeInnerStart.className = 'menu-fake-bottom';

			fakeInnerFinish.setAttribute('data-text', mt.getAttribute('data-to'));
			fakeInnerStart.setAttribute('data-text', mg.innerHTML);

			this.appendChild(fake);

			this.tmpElements = {
				fake: fake
			}

			if (Modernizr.touchevents) {
				fake.classList.add('touch');
				setTimeout(function() {
					fake.classList.add('active');
				}, 20);
				delay = 800;
			} else {
				fake.classList.add('active');
			}

			dispatcher.dispatch({
				type: 'scroll-block'
			});

			this.classList.add('active');

			setTimeout(function() {
				dispatcher.dispatch({
					type: 'popup-close-all'
				});
			}, 200);

			setTimeout(function() {
				dispatcher.dispatch({
					type: 'transition-check',
					step: 1
				});
			}, delay);
		}

		var end = function(e) {
			var self = this;
			var fake = this.tmpElements.fake;

			window.scrollTo(0, 0);

			if (fake) {
				fake.classList.remove('active');
				fake.classList.add('hidden');
			}

			this.tmpElements = {};

			setTimeout(function() {
				dispatcher.dispatch({
					type: 'preload-complete',
					transitionData: this._tmpTransitionData
				});

				setTimeout(function() {
					self.classList.remove('active');
				}, 100);

				setTimeout(function() {
					dispatcher.dispatch({
						type: 'scroll-unblock'
					});
					dispatcher.dispatch({
						type: 'transition-check',
						step: 3
					});
				}, 300);
			}, 500);
		}

		return {
			start: start.bind(this),
			end: end.bind(this)
		}
	}

	elementProto.basicTransition = function() {
		var start = function (e) {
			var url =  e.transitionData.url;
			var menu = document.getElementsByClassName('menu-popup')[0];
			var menuActive = menu.querySelector('a.active');
			var el;
			var delay = 400;

			if (menuActive) {
				el = menuActive;
			} else {
				el = menu.getElementsByTagName('a')[1];
			}

			menu.classList.add('active');

			var mt = el.getElementsByTagName('menu-text')[0];
			var mg = el.getElementsByClassName('glitch-fake')[0];
			var bc = mt.getBoundingClientRect();
			var fake = document.createElement('div');
			var fakeInnerFinish = document.createElement('div');

			menu.classList.remove('active');

			dispatcher.dispatch({
				type: 'preload-start',
				transitionData: this._tmpTransitionData
			});

			this.innerHTML = '';

			fake.className = 'menu-fake';
			fake.style.position = 'absolute';
			fake.style.width = bc.width + 'px';
			fake.style.height = bc.height + 'px';
			fake.style.top = bc.top + 'px';
			fake.style.left = bc.left + 'px';

			fake.appendChild(fakeInnerFinish);

			fakeInnerFinish.className = 'menu-fake-top';

			if (menuActive) {
				fakeInnerFinish.setAttribute('data-text', mt.getAttribute('data-to'));
			} else {
				fakeInnerFinish.setAttribute('data-text', 'Sound');
			}	

			this.appendChild(fake);

			this.tmpElements = {
				fake: fake
			}

			fake.classList.add('simple');
			setTimeout(function() {
				fake.classList.add('active');
			}, 20);
			delay = 800;


			dispatcher.dispatch({
				type: 'scroll-block'
			});

			this.classList.add('active');

			setTimeout(function() {
				dispatcher.dispatch({
					type: 'popup-close-all'
				});
			}, 200);

			setTimeout(function() {
				dispatcher.dispatch({
					type: 'transition-check',
					step: 1
				});
			}, delay);
		}

		var end = function(e) {
			var self = this;
			var fake = this.tmpElements.fake;

			window.scrollTo(0, 0);

			if (fake) {
				fake.classList.remove('active');
				fake.classList.add('hidden');
			}

			this.tmpElements = {};

			setTimeout(function() {
				dispatcher.dispatch({
					type: 'preload-complete',
					transitionData: this._tmpTransitionData
				});

				setTimeout(function() {
					self.classList.remove('active');
				}, 100);

				setTimeout(function() {
					dispatcher.dispatch({
						type: 'scroll-unblock'
					});
					dispatcher.dispatch({
						type: 'transition-check',
						step: 3
					});
				}, 300);
			}, 500);
		}

		return {
			start: start.bind(this),
			end: end.bind(this)
		}
	}

	elementProto.handleDispatcher = function(e) {
		if (e.type === 'transition-start') {
			if (!e.transitionData) {
				e.transitionData = {}
			}
			if (!e.transitionData.animation) {
				e.transitionData.animation = 'basic';
			}

			if (e.transitionData.animation === 'menu') {
				this.menuTransition.start(e);
			}
			if (e.transitionData.animation === 'basic') {
				this.basicTransition.start(e);
			}
		}
		if (e.type === 'transition-end') {
			if (!e.transitionData) {
				e.transitionData = {}
			}
			if (!e.transitionData.animation) {
				e.transitionData.animation = 'basic';
			}

			if (e.transitionData.animation === 'menu') {
				this.menuTransition.end(e);
			}
			if (e.transitionData.animation === 'basic') {
				this.basicTransition.end(e);
			}
		}
	}

	elementProto.createdCallback = function() {
		this.handleDispatcher = this.handleDispatcher.bind(this);
		this.menuTransition = this.menuTransition.bind(this)();
		this.basicTransition = this.basicTransition.bind(this)();
	}
	elementProto.attachedCallback = function() {
		dispatcher.subscribe(this.handleDispatcher);
	}
	elementProto.detachedCallback = function() {
		dispatcher.unsubscribe(this.handleDispatcher);
	}

	document.registerElement('page-transition', {
		prototype: elementProto
	});
});