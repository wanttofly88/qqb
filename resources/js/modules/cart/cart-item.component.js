define(['dispatcher'], function(dispatcher) {
	"use strict";

	var elementProto = Object.create(HTMLElement.prototype);

	var parsePrice = function(num) {
		var str = num.toString().split('.');
		if (str[0].length >= 5) {
			str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1 ');
		}
		if (str[1] && str[1].length === 1) {
			str[1] = str[1] + '0';
		} else if (!str[1]) {
			str[1] = '00';
		}
		return str.join('.');
	}

	var translate = function(element, position, speed, opacity) {
		element.style.transitionDuration = speed + 'ms';
		element.style.transform = 'translateX(' + position + 'px) translateZ(0)';
		element.style.opacity = opacity;
	}

	elementProto.create = function(data) {
		var di = document.createElement('div');
		var img = document.createElement('img');
		var l = document.createElement('div');
		var r = document.createElement('div');
		var tp = document.createElement('div');
		var nm = document.createElement('div');
		var t = document.createElement('div');
		var p = document.createElement('div');
		var rm = document.createElement('div');
		var self = this;

		di.className = 'img';
		l.className = 'l';
		r.className = 'r';
		tp.className = 'type';
		nm.className = 'name';
		t.className = 't';
		p.className = 'price';
		rm.className = 'remove';

		img.src = data.img;
		tp.innerHTML = data.type;
		nm.innerHTML = data.name;
		t.innerHTML = 'Price';
		p.innerHTML = parsePrice(data.price) + ' $';

		this.appendChild(di);
		di.appendChild(img);
		this.appendChild(l);
		l.appendChild(tp);
		l.appendChild(nm);
		this.appendChild(r);
		r.appendChild(t);
		r.appendChild(p);
		this.appendChild(rm);

		this._id = data.id;
		this.className = 'item';

		rm.addEventListener('click', function() {
			translate(self, 150, 600, 0);
			setTimeout(function() {
				self.remove();
			}, 350);
		});

		return this;
	}
	elementProto.remove = function() {
		dispatcher.dispatch({
			type: 'cart-remove',
			id: this._id
		});
		if (this && this.parentNode) {
			this.parentNode.removeChild(this);
		}
	}

	elementProto.TouchHandler = function(component) {
		this.component = component;
		this._start = {};
		this._delta = {};
		this._vertical = undefined;

		this.ontouchstart = function(e) {
			var touches = e.touches[0];

			this.ww = this.component.clientWidth;

			this._start = {
				x: touches.pageX,
				y: touches.pageY,
				time: +new Date
			}
			this._delta = {}
			this._vertical = undefined;

			this.component.addEventListener('touchmove', this.ontouchmove);
			this.component.addEventListener('touchend',  this.ontouchend);
		}.bind(this);

		this.ontouchmove = function(e) {
			var touches;
			var move = 0;
			var touchMoveEvent;

			if (e.touches.length > 1 || e.scale && e.scale !== 1) return;
			touches = event.touches[0];

			this.touches = event.touches[0];

			this._delta = {
				x: this.touches.pageX - this._start.x,
				y: this.touches.pageY - this._start.y
			}

			if (typeof this._vertical === undefined) {
				this._vertical = !!(this._vertical || Math.abs(this._delta.x) < Math.abs(this._delta.y));
			}

			if (this._vertical) return;

			move = this._delta.x/3;

			translate(this.component, move, 0, 1);
		}.bind(this);

		this.ontouchend =  function(e) {
			var duration = +new Date - this._start.time;
			var check = parseInt(duration) < 250 && Math.abs(this._delta.x) > 20 || Math.abs(this._delta.x) > 170;
			var returnSpeed = 250;
			var touchEndEvent;
			var self = this;

			this.component.removeEventListener('touchmove', this.ontouchmove, false);
			this.component.removeEventListener('touchend',  this.ontouchend, false);

			if (this._vertical) return;

			if (check) {
				if (this._delta.x > 0) {
					translate(this.component, 150, 250, 0);
				} else {
					translate(this.component, -150, 250, 0);
				}
				setTimeout(function() {
					self.component.remove();
				}, 250);
			} else {
				translate(this.component, 0, returnSpeed, 1);
			}
		}.bind(this);

		this.set = function() {
			this.component.addEventListener('touchstart', this.ontouchstart);
		}

		this.remove = function() {
			this.component.removeEventListener('touchstart', this.ontouchstart);
			this.component.removeEventListener('touchmove', this.ontouchmove);
			this.component.removeEventListener('touchend',  this.ontouchend);
		}
	}

	elementProto.createdCallback = function() {
		this.create = this.create.bind(this);
		this.remove = this.remove.bind(this);

		this.touchHandler  = new this.TouchHandler(this);
	}
	elementProto.attachedCallback = function() {
		this._id = this._id || this.getAttribute('data-id');
		this.setAttribute('data-id', this._id);

		this.touchHandler.set();
	}
	elementProto.detachedCallback = function() {
		this.touchHandler.remove();
	}

	document.registerElement('cart-item', {
		prototype: elementProto
	});
});