define([
	'dispatcher',
	'THREE',
	'TweenMax',
	'resize/resize.store',
	'scheme/scheme.store',
	'slide-scroll/slide-scroll.store',
	'utils'
], function(
	dispatcher,
	THREE,
	TweenMax,
	resizeStore,
	schemeStore,
	slideStore,
	utils
) {
	"use strict";

	var dpr = 1;
	var requestAnimationFrame = utils.getRequestAnimationFrame();

	var base = function(component) {
		var renderer;
		var init = function() {
			var ww = resizeStore.getData().width;
			var wh = resizeStore.getData().height;

			var blurH = 0.4/ww;
			var blurW = 0.4/wh;

			var simpleVertex = document.getElementById('simpleVertexShader').innerHTML;
			var simpleFragment = document.getElementById('simpleFragmentShader').innerHTML;
			var bufferFragment = document.getElementById('bufferFragmentShader').innerHTML;
			var postFragment = document.getElementById('postProcessingShader').innerHTML;

			var finalMaterial, quad;

			var camera, scene;
			var buffer = {
				scene: new THREE.Scene(),
				textureA: new THREE.WebGLRenderTarget(ww, wh, { 
					minFilter: THREE.LinearFilter, 
					magFilter: THREE.NearestFilter
				}),
				textureB: new THREE.WebGLRenderTarget(ww, wh, { 
					minFilter: THREE.LinearFilter, 
					magFilter: THREE.NearestFilter
				}),
				plane: new THREE.PlaneBufferGeometry(ww, wh)
			}

			buffer.material = new THREE.ShaderMaterial({
				uniforms: {
					bufferTexture: { type: 't', value: buffer.textureA.texture },
					st: { type: 'f', value: 1 },
					blurH: { type: 'f', value: blurH },
					blurW: { type: 'f', value: blurW },
					gBox: { type: 'v4', value: new THREE.Vector4(0, 0, 0, 0) },
					gxs: { type: 'f', value: 0 },
					gxe: { type: 'f', value: 0 },
					gys: { type: 'f', value: 0 },
					gye: { type: 'f', value: 0 },
					shift: { type: 'f', value: 0 },
					res: { type: 'v2', value:new THREE.Vector2(ww, wh) }
				},
				fragmentShader: bufferFragment
			});

			buffer.object = new THREE.Mesh(buffer.plane, buffer.material);
			buffer.scene.add(buffer.object);

			// finalMaterial = new THREE.MeshBasicMaterial({map: buffer.textureB.texture});

			finalMaterial = new THREE.ShaderMaterial({
				uniforms: {
					tDiffuse: { type: 't', value: buffer.textureB.texture},
					time: { type: 'f', value: 0 },
					nIntensity: { type: 'f', value: 0 },
					sIntensity: { type: 'f', value: 0 },
					sCount: { type: 'f', value: wh/1.1 },
					colorScheme: { type: 'f', value: 0 }
				},
				vertexShader: simpleVertex,
				fragmentShader: postFragment
			});

			quad = new THREE.Mesh(buffer.plane, finalMaterial);

			camera = new THREE.OrthographicCamera(
				ww*dpr / -2, 
				ww*dpr / 2,  
				wh*dpr / 2, 
				wh*dpr / -2, 
				-100, 
				100
			);

			scene = new THREE.Scene();

			scene.add(quad);

			renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true
			});
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize(ww, wh);

			renderer.domElement.style.width  = '100%';
			renderer.domElement.style.height = '100%';
			renderer.setClearColor(0x40dbe1);

			component.appendChild(renderer.domElement);

			component._renderer = renderer;
			component._camera = camera;
			component._scene = scene;
			component._buffer = buffer;
			component._material = finalMaterial;
		}

		var resize = function() {
			var ww = resizeStore.getData().width;
			var wh = resizeStore.getData().height;

			if (component._camera && renderer) {
				component._camera.left =   ww*dpr / -2;
				component._camera.right =  ww*dpr / 2;
				component._camera.top =    wh*dpr / 2;
				component._camera.bottom = wh*dpr / -2;

				component._camera.updateProjectionMatrix();
				renderer.setPixelRatio(window.devicePixelRatio);
				renderer.setSize(ww, wh);

				renderer.domElement.style.width  = '100%';
				renderer.domElement.style.height = '100%';
			}
		}

		var handleScheme = function() {
			var scheme = schemeStore.getData().scheme;
			var targetValue;
			var material;

			if (component._scheme === scheme) return;

			material = component._material;

			if (scheme === 'dark') {
				targetValue = 1;
			} else {
				targetValue = 0;
			}

			if (component._scheme === undefined) {
				material.uniforms.colorScheme.value = targetValue;
			} else {
				TweenMax.killTweensOf(material.uniforms.colorScheme);
				TweenMax.to(material.uniforms.colorScheme, 0.3, {
					value: targetValue
				});
			}

			component._scheme = scheme;
		}

		var glitch = function(material) {
			var rand = Math.random();
			var gys, gye;
			var gxs, gxe;
			var shift;

			if (rand < 0.01) {
				gys = 0.2 + Math.random()/4;
				gye = gys + 0.05;
				shift = (Math.random() - 0.5)/2;
				gxs = Math.random();
				gxe = Math.random();
				material.uniforms.gBox.value = new THREE.Vector4(gxs, gys, gxe, gye);
				material.uniforms.shift.value = shift;
			}
		}

		var noise = function(material) {
			var rand = Math.random();
			var duration;
			var tl;

			if (rand < 0.02 && material.uniforms.nIntensity.value < 0.01) {
				duration = Math.random()*4 + 1;

				tl = new TimelineLite();
				tl.to(material.uniforms.nIntensity, duration, {
					value: 0.2
				});
				tl.to(material.uniforms.nIntensity, duration, {
					value: 0
				});
			}
		}

		var render = function() {
			var scene = component._scene;
			var camera = component._camera;
			var renderer = component._renderer;
			var buffer = component._buffer;
			var postMaterial = component._material;

			var tmpTexture;

			//component._composer.render(component._scene, component._camera);
			renderer.render(buffer.scene, camera, buffer.textureB, true);
			tmpTexture = buffer.textureA;
			buffer.textureA = buffer.textureB;
			buffer.textureB = tmpTexture;
			buffer.material.uniforms.bufferTexture.value = buffer.textureA.texture;
			buffer.material.uniforms.st.value = component._step;
			postMaterial.uniforms.time.value = component._step/10;

			glitch(buffer.material);
			noise(postMaterial);

			component._step++;
			if (component._step >= 10000) {
				component._step = 2;
			}

			renderer.render(scene, camera);
		}

		return {
			init: init,
			render: render,
			resize: resize,
			handleScheme: handleScheme
		}
	}

	var rect = function(component) {
		var planes = [];
		var vertexShader, fragmentShader;

		var _addPlane = function() {
			var wh = resizeStore.getData().height;
			var ww = resizeStore.getData().width;
			var geometry = new THREE.PlaneGeometry(1, 1);
			var material = new THREE.ShaderMaterial({
				transparent: true,
				vertexShader: vertexShader,
				fragmentShader: fragmentShader
			});
			var plane = new THREE.Mesh(geometry, material);

			plane.position.x = Math.random()*ww - ww/2;
			plane.position.y = Math.random()*wh - wh/2;
			plane.position.z = 0;

			plane.speed = Math.floor(Math.random()*5 + 5)/16;

			//plane.scale.set(Math.random()*200 + 40, Math.random()*500 + 200, 1);
			plane.scale.set(Math.random()*200 + 40, 200, 1);
			planes.push(plane);
			component._buffer.scene.add(plane);
		}

		var init = function() {
			vertexShader = document.getElementById('simpleVertexShader').innerHTML;
			fragmentShader = document.getElementById('gradientFragmentShader').innerHTML;

			for (var i = 0; i < 15; i++) {
				_addPlane();
			}
			
		}

		var update = function() {
			var wh = resizeStore.getData().height;
			var ww = resizeStore.getData().width;
			var botY = component._camera.position.y + component._camera.bottom; 
			var topY = component._camera.position.y + component._camera.top;

			planes.forEach(function(plane) {
				plane.position.y -= plane.speed;
				if (plane.position.y + plane.scale.y/2 < botY) {
					plane.position.x = Math.random()*ww - ww/2;
					plane.position.y = topY + plane.scale.y/2;
				}
			});
		}

		var handleSlideScroll = function() {

		}

		var resize = function() {

		}

		return {
			init: init,
			resize: resize,
			update: update,
			handleSlideScroll: handleSlideScroll
		}
	}

	var elementProto = function() {
		var handleScheme = function() {
			var scheme = schemeStore.getData().scheme;
		}

		var loop = function() {
			this._rect.update();
			this._base.render();

			requestAnimationFrame(this._loop);
		}

		var createdCallback = function() {
			this._camera;
			this._scene;
			this._composer;
			this._base = base(this);
			this._rect = rect(this);
			this._handleScheme = this._base.handleScheme;
			this._handleSlideScroll = this._rect.handleSlideScroll;
			this._loop = loop.bind(this);
			this._step = 0;
		}
		var attachedCallback = function() {

			document.getElementsByTagName('html')[0].classList.add('no-webgl');
			document.getElementsByTagName('html')[0].classList.remove('webgl');
			return;

			this._base.init();
			this._base.resize();
			this._rect.init();

			this._handleScheme();
			this._loop();
			schemeStore.eventEmitter.subscribe(this._handleScheme);
			slideStore.eventEmitter.subscribe(this._handleSlideScroll);


		}

		var detachedCallback = function() {
			schemeStore.eventEmitter.unsubscribe(this._handleScheme);
			slideStore.eventEmitter.unsubscribe(this._handleSlideScroll);
		}


		return {
			createdCallback: createdCallback,
			attachedCallback: attachedCallback,
			detachedCallback: detachedCallback
		}
	}();

	Object.setPrototypeOf(elementProto, HTMLElement.prototype);
	document.registerElement('stage-component', {
		prototype: elementProto
	});
});