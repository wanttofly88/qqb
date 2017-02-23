define(function() {

	var getIEVersion = function() {
		var rv = -1;
		if (navigator.appName == 'Microsoft Internet Explorer') {
			var ua = navigator.userAgent;
			var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
			rv = parseFloat( RegExp.$1 );
		}
		return rv;
	}

	var offset = function(elem) {
		function getOffsetSum(elem) {
			var top = 0, left = 0;
			while(elem) {
				top = top + parseInt(elem.offsetTop);
				left = left + parseInt(elem.offsetLeft);
				elem = elem.offsetParent;
			}

			return {top: top, left: left};
		}

		function getOffsetRect(elem) {
			var box = elem.getBoundingClientRect();

			var body = document.body;
			var docElem = document.documentElement;

			var scrollTop = window.pageYOffset  || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

			var clientTop = docElem.clientTop   || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;

			var top  = box.top  + scrollTop  - clientTop;
			var left = box.left + scrollLeft - clientLeft;

			return {
				top:  Math.round(top), 
				left: Math.round(left)
			};
		}

		if (elem.getBoundingClientRect) {
			return getOffsetRect(elem);
		} else {
			return getOffsetSum(elem);
		}
	}

	var requestAnimFrame = (function(){
		return  window.requestAnimationFrame   ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame    ||
			window.oRequestAnimationFrame      ||
			window.msRequestAnimationFrame     ||
			function(callback, element){
				window.setTimeout(callback, 1000 / 60);
			}
	})();

	var Tween = function(from, to, duration, easing, func) {
		this.i = 0;
		this.duration = duration*60;
		this.current  = from;
		this.func     = func;
		this.to       = to;
		this.halt     = false;

		this.stop = function() {
			this.halt = true;
			this.i = 0;
			this.current = from;
		}

		this.animate = function() {
			var scope = this;
			this.halt = false;

			this.func(this.current);

			var loop = function() {
				var progress;
				var delta;
				var current;

				if (scope.halt) {
					return;
				}

				scope.i++;
				progress = scope.i/scope.duration;
				if (progress > 1) {
					progress = 1;
				}

				if (easing) {
					delta = easing(progress);
				} else {
					delta = progress;
				}
				
				scope.current = from + (to - from)*delta;
				scope.func(scope.current);

				if (Math.floor(scope.current - scope.to) === 0)  {
					return;
				}

				requestAnimFrame(loop);
			}
			loop();
		}
	}

	var http = function(url) {
		var core = {
			ajax: function(method, url, args, type) {
				var promise = new Promise(function(resolve, reject) {
					var client = new XMLHttpRequest();
					var query;
					var json;
					var argcount;
					var key;

					client.onload = function () {
						if (this.status >= 200 && this.status < 300) {
							resolve(this.response);
						} else {
							reject(this.statusText);
						}
					}
					client.onerror = function () {
						reject(this.statusText);
					}

					if (!args) {
						client.open(method, url);
						client.send();
					} else {
						if (!type || type === 'urlencoded') {
							query = '';
							argcount = 0;
							for (key in args) {
								if (args.hasOwnProperty(key)) {
									if (argcount++) {
										query += '&';
									}
									query += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
								}
							}
						} else if (type === 'json') {
							json = JSON.stringify(args);
						}

						if ((method === 'GET' || method === 'DELETE')) {
							client.open(method, url + '?' + query);
							client.send(args);
						} else {
							client.open(method, url);

							if (type === 'json') {
								client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
								client.send(json);
							} else if (type === 'urlencoded') {
								client.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
								client.send(query);
							} else {
								client.send(args);
							}
						}
					}
				});
				return promise;
			}
		}

		return {
			'get': function(args, type) {
				return core.ajax('GET', url, args, type);
			},
			'post': function(args, type) {
				return core.ajax('POST', url, args, type);
			},
			'put': function(args, type) {
				return core.ajax('PUT', url, args, type);
			},
			'delete': function(args, type) {
				return core.ajax('DELETE', url, args, type);
			}
		}
	}

	var getRequestAnimationFrame = function() {
		return requestAnimFrame;
	}

	var queryParse = function (str) {
		if (typeof str !== 'string') {
			return {};
		}

		str = str.trim().replace(/^(\?|#|&)/, '');

		if (!str) {
			return {};
		}

		return str.split('&').reduce(function (ret, param) {
			var parts = param.replace(/\+/g, ' ').split('=');
			var key = parts[0];
			var val = parts[1];

			key = decodeURIComponent(key);

			val = val === undefined ? null : decodeURIComponent(val);

			if (!ret.hasOwnProperty(key)) {
				ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
			} else {
				ret[key] = [ret[key], val];
			}

			return ret;
		}, {});
	}

	var EventEmitter = function() {
		this._handlers = [];

		this.dispatch = function(event) {
			this._handlers.forEach(function(handler) {
				handler(event);
			});
		}
		this.subscribe = function(handler) {
			if (this._handlers.indexOf(handler) === -1 
				&& typeof handler === 'function') {
				this._handlers.push(handler);
			}
		}
		this.unsubscribe = function(handler) {
			if (this._handlers.indexOf(handler) === -1) {
			}
			this._handlers = this._handlers.filter(function(h) {
				return h !== handler;
			});
		}
	}

	return {
		offset: offset,
		Tween: Tween,
		getRequestAnimationFrame: getRequestAnimationFrame,
		http: http,
		queryParse: queryParse,
		getIEVersion: getIEVersion,
		EventEmitter: EventEmitter
	}

});