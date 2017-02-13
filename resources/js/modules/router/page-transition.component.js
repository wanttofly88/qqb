define(['dispatcher', 'utils'], function(dispatcher, utils) {
	"use strict";

	// var postAnimation = function () {
	// 	var start = function (e, component) {
	// 		var offset;
	// 		var fakeWrapper;
	// 		var fakePost;
	// 		var postElement;
	// 		var header = document.getElementsByTagName('header')[0];

	// 		postElement = document.querySelector('[data-id="' + e.transitionData.postId + '"]');

	// 		if (!postElement) {
	// 			console.warn('post element wasn\'t found');
	// 			return;
	// 		}

	// 		while (component.firstChild) {
 //    			component.removeChild(component.firstChild);
	// 		}

	// 		fakeWrapper = document.createElement('div');
	// 		fakeWrapper.className = 'wrapper';
	// 		component.appendChild(fakeWrapper);
	// 		fakePost = document.createElement('blog-post');
	// 		fakePost.className = postElement.className;
	// 		fakeWrapper.appendChild(fakePost);

	// 		Array.prototype.forEach.call(postElement.childNodes, function(node) {
	// 			if (node.nodeType !== Node.ELEMENT_NODE) return;
	// 			if (node.classList.contains('more')) return;

	// 			fakePost.appendChild(node.cloneNode(true));
	// 		});

	// 		offset = utils.offset(postElement).top;

	// 		component.classList.add('active');
	// 		component.style.top = (offset - 500) + 'px';


	// 		dispatcher.dispatch({
	// 			type: 'scroll-to',
	// 			position: offset - header.clientHeight,
	// 			speed: 0.4
	// 		});

	// 	}

	// 	var end = function(e, component) {
	// 		var header = document.getElementsByTagName('header')[0];
	// 		window.scrollTo(0, 0);
	// 		component.style.top = (-500 + header.clientHeight) + 'px';
	// 		component.classList.remove('active');


	// 	}

	// 	return {
	// 		start: start,
	// 		end: end
	// 	}
	// }();

	var elementProto = function() {
		var basicTranisiton = function() {
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

		var menuTransition = function() {
			var start = function (e) {
				this._tmpElements;
				var el = e.transitionData.element;
				var mt = el.getElementsByTagName('menu-text')[0];
				var bc = mt.getBoundingClientRect();
				var fake = document.createElement('div');
				var fakeInner = document.createElement('div');

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

				fake.appendChild(fakeInner);

				fakeInner.setAttribute('data-text', mt.getAttribute('data-to'));

				this.appendChild(fake);

				this._tmpElements = {
					fake: fake,
					fakeInner: fakeInner
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
				}, 400);
			}

			var end = function(e) {
				var self = this;
				var fake = this._tmpElements.fake;
				var fakeInner = this._tmpElements.fakeInner;

				window.scrollTo(0, 0);

				if (fake && fakeInner) {
					fake.classList.add('hide');
				}

				this._tmpElements = {};

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

		var handleDispatcher = function(e) {
			if (e.type === 'transition-start') {
				if (!e.transitionData) {
					e.transitionData = {
						animation: 'basic'
					}
				}

				if (e.transitionData.animation === 'menu') {
					this._menuTransition.start(e);
				}
				if (e.transitionData.animation === 'basic') {
					this._basicTransition.start(e);
				}
			}
			if (e.type === 'transition-end') {
				if (!e.transitionData) {
					e.transitionData = {
						animation: 'basic'
					}
				}

				if (e.transitionData.animation === 'menu') {
					this._menuTransition.end(e);
				}
			}
			if (e.type === 'transition-end') {
				if (!e.transitionData) {
					e.transitionData = {
						animation: 'basic'
					}
				}

				if (e.transitionData.animation === 'menu') {
					this._menuTransition.end(e);
				}
			}
		}

		var createdCallback = function() {

			this._handleDispatcher = handleDispatcher.bind(this);
			this._menuTransition = menuTransition.bind(this)();
			this._basicTransition = basicTranisiton.bind(this)();
		}
		var attachedCallback = function() {
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
	document.registerElement('page-transition', {
		prototype: elementProto
	});
});