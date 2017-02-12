"use strict";

var __path;
var pathElements =  document.getElementsByName('resources-path');
if (pathElements && pathElements.length) {
	__path = pathElements[0].content;
} else {
	__path = document.getElementsByTagName('head')[0].getAttribute('data-path');
}

if (__path.slice(-1) !== '/') __path += '/';

require.config({
	baseUrl: __path + 'js/modules',
	paths: {
		TweenMax: '../libs/TweenMax',
		THREE: '../libs/THREE',
		THREEShaders: '../libs/THREE-Shaders'
	},
	shim: {
		THREE: {
			exports: 'THREE'
		}
	}
});


require([
	'resize/vh-fix.component',
	'resize/proportional-height.component',

	'full-img/full-img.component',

	'scheme/scheme.component',

	'router/router.component',
	'router/menu-link.component',
	'router/inner-link.component',
	'router/page-transition.component',

	'audio/audio-player.component',
	'audio/audio-progress.component',
	'audio/audio-progressbar.component',
	'audio/audio-pause.component',

	'track-list/track-list.component',

	'text-glitch/menu-text.component',

	'popup/popup.component',
	'popup/popup-toggle.component',
	'popup/popup-close.component',

	'helpers/beats-helper.component',
	'helpers/albums-helper.component',
	'helpers/videos-helper.component',
	'helpers/album-helper.component',

	'slide-scroll/slide-scroll.component',
	'slide-scroll/slide-scroll-index.component',
	'slide-scroll/slide-scroll-total.component',
	'slide-scroll/slide-scroll-control.component',

	'beat-slider/beat-bg-slider.component',

	'decor/header-appear.component',

	'loading-screen/loading-screen.component',
	'stage/stage.component',
	'preloader/preloader.component'
]);