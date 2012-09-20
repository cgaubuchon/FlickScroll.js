//Create FS namespace if not already there.
var FS = FS || {};

FS.FlickScroll = (function(win, doc, $) {
	'use strict';

	var _name = "FlickScroll",
		_documentEl = document.documentElement,
		_defaults = {
			flickDistanceThreshold: 200, //in pixels
			flickTimeMax: 1000, //in milliseconds
			allowTapScroll: false, //allow scroll to positon on touch as well as a flick
			axis: 'vertical', //Direction of scroll intent (horizontal, vertical, all) TODO: implement 'all'
			debug: true 
		},
		_scrollSpot = {
			'x': 0,
			'y': 0
		},
		_eventStorage = {
			'touchStartPositionX': 0,
			'touchStartPositionY': 0,
			'touchStartTime': 0,
			'touchEndPositionX': 0,
			'touchEndPositionY': 0,
			'touchEndTime': 0,
			'eventDirectionX': '',
			'eventDirectionY': ''
		},
		debugPanel = '',
		_flickOptions = {};

	var FlickScroll = function(options){
		this.options = $.extend({}, _defaults, options);
	};

	//--------------------------------------------------
	//EVENT HANDLERS
	//--------------------------------------------------
	
	function handleTouchStart(event){
		//Store first touch event data
		_scrollSpot.x = event.touches[0].pageX;
		_scrollSpot.y = event.touches[0].pageY;

		_eventStorage.touchStartPositionX = event.touches[0].clientX;
		_eventStorage.touchStartPositionY = event.touches[0].clientY;
		_eventStorage.touchStartTime = Date.now();

		debugPanel.find('.event').html('touchstart');

		document.body.addEventListener('touchend', handleTouchEnd, false);
	}

	function handleTouchEnd(event){
		debugPanel.find('.event').html('touchend');

		//Check for time difference vs. set max time to define a flick vs. scroll
			//Check for distance flicked vs. set distance threshold to define flick vs. scroll
		if(_flickOptions.totalFlickTime < FS.FlickScroll.options.flickTimeMax){
			//TODO: Logic for if vertical or horizontal scroll is desired
			if(_flickOptions.yDifference < FS.FlickScroll.options.flickDistanceThreshold && _flickOptions.yDifference > (FS.FlickScroll.options.flickDistanceThreshold*-1)){
				triggerFlick();
			}else{
				debugPanel.find('.success').html("Touch distance too long");
			}
		}else{
			console.log('Touch event took too long. Not treated as flick. Check $flickTimeMax option.');
			debugPanel.find('.success').html("Touch time too long");
		}
		document.body.removeEventListener('touchend');
	}

	function handleTouchMove(event){
		//Bug in Android Chrome only fires with preventDefault
		//event.preventDefault();

		//Only trigger with one finger flick
		if(event.touches.length == 1){
			_eventStorage.touchEndPositionX = event.touches[0].clientX;
			_eventStorage.touchEndPositionY = event.touches[0].clientY;
			_eventStorage.touchEndTime = Date.now();

			//Calculate differences to detect direction and speed of flick event to test against settings.
			_flickOptions = {
				'totalFlickTime': _eventStorage.touchEndTime - _eventStorage.touchStartTime,
				'xDifference': _eventStorage.touchStartPositionX - _eventStorage.touchEndPositionX,
				'yDifference': _eventStorage.touchStartPositionY - _eventStorage.touchEndPositionY
			};

			//Debug console to log values for testing only
			if(FS.FlickScroll.options.debug === true){
				debugPanel.find('.event').html('touchmove');
				debugPanel.find('.time').html("Time: " + _flickOptions.totalFlickTime + ' ms');
				debugPanel.find('.posX').html("X: S:"+_eventStorage.touchStartPositionX + " E: " +_eventStorage.touchEndPositionX+ " D: " + _flickOptions.xDifference + "px");
				debugPanel.find('.posY').html("Y: S:"+_eventStorage.touchStartPositionY + " E: " +_eventStorage.touchEndPositionY+ " D: " + _flickOptions.yDifference + "px");
			}
		}
	}

	function handleTouchCancel(event){
		//Set flick event end parameters
		//alert('touch end');
		debugPanel.find('.event').html('touchcancel');
	}

	function triggerFlick(){
		updateScrollPosition(_scrollSpot.x, _scrollSpot.y);
		debugPanel.find('.success').html("Successful Flick! "+_scrollSpot.x+', '+_scrollSpot.y);
		$('html').append('<div style="position:absolute;top:'+_scrollSpot.y+'px;left:'+_scrollSpot.x+'px;height:1px;width:1px;background:red;"></div>');
	}

	//--------------------------------------------------
	//PRIVATE METHODS
	//--------------------------------------------------

	function attachEvents(){
		document.body.addEventListener('touchstart', handleTouchStart, false);
		document.body.addEventListener('touchmove', handleTouchMove, false);
	}

	function updateScrollPosition(positionToX, positionToY){

		var currentPositionY = window.scrollY,
			currentPositionX = window.scrollX;
		
		if(currentPositionY < positionToY){
			window.scrollTo(currentPositionX,currentPositionY+1);
		}else{
			window.scrollTo(currentPositionX,currentPositionY-1);
		}

		if(currentPositionY != positionToY || currentPositionX != positionToX){
			requestAnimationFrame(updateScrollPosition(positionToX, positionToY));
		}else{
			return;
		}

		

		
	}

	//--------------------------------------------------
	//PUBLIC HANDLERS
	//--------------------------------------------------

	FlickScroll.prototype.init = function(){
		attachEvents();

		if(FS.FlickScroll.options.debug === true){
			$('html').append('<div class="debug-panel"><div class="event"></div><div class="time"></div><div class="posX"></div><div class="posY"></div><div class="direction"></div><div class="success"></div></div>');
			debugPanel = $('html').find('.debug-panel');
		}

		return this;
	};


	$('.flickScroll').each(function () {
		if (!$.data(this, 'FlickScroll_' + _name)) {
			$.data(this, 'FlickScroll_' + _name, new FlickScroll(this, {}));
		}
	});

	return new FlickScroll();

}(window, document, jQuery));

FS.FlickScroll.init();