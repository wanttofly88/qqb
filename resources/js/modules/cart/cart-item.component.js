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

		return this;
	}
	elementProto.remove = function() {

	}

	elementProto.createdCallback = function() {
		this.create = this.create.bind(this);
		this.remove = this.remove.bind(this);
	}
	elementProto.attachedCallback = function() {
		this._id = this._id || this.getAttribute('data-id');
		this.setAttribute('data-id', this._id);
	}
	elementProto.detachedCallback = function() {
	}

	document.registerElement('cart-item', {
		prototype: elementProto
	});
});