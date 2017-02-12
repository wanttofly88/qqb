define(['print/print.store'], function(printStore) {

	"use strict";
	
	var items = [];

	var animationSpeed = 500;
	var charactersToRandomize = 4;

	var charPool = ['a', '_', '%', '_', '_', 'р', '.', 'z', '4', '_', 'я', '?', '1', '_', 'н', '_', 'м'];
	charPool = ['а', 'у', 'к', 'е', 'н', 'г', 'з', 'ф', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'я', 'ч'];

	var _animate = function(line, value1, value2) {
		var charNum = 0;
		var tmpValue = '';

		var way = line.way;
		var delay = line.delay;

		var speed = animationSpeed/value2.length;

		var _getRandomChar = function() {
			return charPool[Math.floor(Math.random()*charPool.length)];
		}

		line.element.innerHTML = '';

		var _loop = function() {
			if (charNum >= value2.length + charactersToRandomize + 1) return;

			if (way === 'reverse') {
				tmpValue = value2.substring(value2.length - charNum, value2.length);
				for (var i = 0; i <= charactersToRandomize; i++) {
					if (value2.length - charNum - i > 0) {
						tmpValue = tmpValue.replaceAt(i, _getRandomChar());
					}
				}
			} else {
				tmpValue = value2.substring(0, charNum);
				for (var i = 0; i <= charactersToRandomize; i++) {
					tmpValue = tmpValue.replaceAt(charNum - i, _getRandomChar());
				}
			}

			line.element.innerHTML = tmpValue;
			charNum++;

			line.to = setTimeout(_loop, speed);
		}
		clearTimeout(line.to);
		line.to = setTimeout(_loop, line.delay);
	}

	var _setInitial = function() {
		var _checkItem = function(item) {
			var data;
			var id = item.id;
			var _setValues = function(line, dataLine) {
				if (line.value === dataLine.value) return;

				line.innerHTML = dataLine.value
				line.value = dataLine.value;
			}

			data = printStore.getDataById(id);
			
			if (item.active === data.active) return;

			item.active = data.active;

			for (var i = 0; i <= item.lines.length - 1; i++) {
				_setValues(item.lines[i], data.models[data.active].lines[i]);
			}
		}

		for (var i = items.length - 1; i >= 0; i--) {
			_checkItem(items[i]);
		}
	}

	var _handleChange = function() {

		var _checkItem = function(item) {
			var data;
			var id = item.id;
			var _setValues = function(line, dataLine) {
				if (line.value === dataLine.value) return;

				_animate(line, line.value, dataLine.value);

				line.value = dataLine.value;
			}

			data = printStore.getDataById(id);
			
			if (item.active === data.active) return;

			item.active = data.active;

			for (var i = 0; i <= item.lines.length - 1; i++) {
				_setValues(item.lines[i], data.models[data.active].lines[i]);
			}
		}

		for (var i = items.length - 1; i >= 0; i--) {
			_checkItem(items[i]);
		}
	}

	var _add = function(view) {
		var lines;
		var item;
		var lineItems = [];

		var _addLine = function(lineElement) {
			var way = lineElement.getAttribute('data-way') || 'normal';
			var delay = lineElement.getAttribute('data-delay') || 0;
			delay = parseInt(delay);

			lineItems.push({
				way: way,
				delay: delay,
				to: false,
				value: lineElement.innerHTML,
				element: lineElement
			});
		}

		lines = view.querySelectorAll('.print-line');

		if (!lines || !lines.length) {
			console.warn('no print lines specified');
			return;
		}

		for (var i = 0; i <= lines.length - 1; i++) {
			_addLine(lines[i]);
		}

		items.push({
			active: false,
			container: view,
			lines: lineItems,
			id: view.id
		});
	}

	var init = function() {
		var views = document.querySelectorAll('.print-view');
		for (var i = views.length - 1; i >= 0; i--) {
			_add(views[i]);
		}

		String.prototype.replaceAt = function(index, character) {
			if (index < 0) return this;
			if (index >= this.length) return this;
			return this.substr(0, index) + character + this.substr(index + character.length);
		}

		_setInitial();

		printStore.eventEmitter.subscribe(_handleChange);
	}

	return {
		init: init
	}
});