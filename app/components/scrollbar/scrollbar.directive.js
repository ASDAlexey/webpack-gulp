var directive = function($parse, $window, config){
    return {
      restrict: 'A',
      replace: true,
      transclude: true,
      scope:{
        'showYScrollbar': '=?isBarShown',
        'disableWhen': '=?disableWhen'
      },
      link: function(scope, element, attrs) {

        var mainElm, transculdedContainer, tools, thumb, thumbLine, track;

        var flags = {
          bottom: attrs.hasOwnProperty('bottom'),
          top: attrs.hasOwnProperty('top')
        };

        var win = angular.element($window);

        var hasAddEventListener = !!win[0].addEventListener;
        var hasRemoveEventListener = !!win[0].removeEventListener;

        // Elements
        var dragger = { top: 0 },
            page = { top: 0 };

        // Styles
        var scrollboxStyle, draggerStyle, draggerLineStyle, pageStyle;

        var calcStyles = function () {
          scrollboxStyle = {
            position: 'relative',
            overflow: 'hidden',
            'max-width': '100%',
            height: '100%'
          };

          if (page.height) {
            scrollboxStyle.height = page.height + 'px';
          }

          draggerStyle = {
            position: 'absolute',
            height: dragger.height + 'px',
            top: dragger.top + 'px'
          };

          draggerLineStyle = {
            position: 'relative',
            'line-height': dragger.height + 'px'
          };

          pageStyle = {
            position: 'relative',
            top: page.top + 'px',
            overflow: 'hidden'
          };
        };

        var reset = function() {
            dragger = { top: 0 };
            page = { top: 0 };

            rebuild();
        };

        var redraw = function() {
          var duration = 300,
              draggerOffset,
              $thumb = $(thumb),
              $transculdedContainer = $(transculdedContainer);

          draggerOffset = dragger.top / page.height;
          page.top = -Math.round(page.scrollHeight * draggerOffset);

          if (config.isTouch) {
             thumb.css('top', dragger.top + 'px');
             transculdedContainer.css('top', page.top + 'px');
          } else {
            $thumb.stop(false, true).animate({
                top: dragger.top + 'px'
            }, duration, 'linear');

            $transculdedContainer.stop(false, true).animate({
                top: page.top + 'px'
            }, duration, 'linear');
          }
        };

        var trackClick = function(event) {
          var offsetY = event.hasOwnProperty('offsetY') ? event.offsetY : event.layerY;
          var newTop = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));

          dragger.top = newTop;
          redraw();

          event.stopPropagation();
        };

        var wheelHandler = function(event) {

          var wheelSpeed = 40,
              scrollSpeed = 7;

          // Mousewheel speed normalization approach adopted from
          // http://stackoverflow.com/a/13650579/1427418
          var o = event, d = o.detail, w = o.wheelDelta, n = 225, n1 = n-1;

          // Normalize delta
          d = d ? w && (f = w/d) ? d/f : -d/1.35 : w/120;
          // Quadratic scale if |d| > 1
          d = d < 1 ? d < -1 ? (-Math.pow(d, 2) - n1) / n : d : (Math.pow(d, 2) + n1) / n;
          // Delta *should* not be greater than 2...
          event.delta = Math.min(Math.max(d / 2, -1), 1);

          event.delta = event.delta * wheelSpeed;

          // dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10) - event.delta));
          var newValue = parseInt(dragger.top, 10) - ((parseInt(dragger.height, 10) / parseInt(page.height, 10)) * event.delta * scrollSpeed);
          dragger.top = Math.round(Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), newValue)));
          redraw();

          if (!!event.preventDefault) {
            event.preventDefault();
          } else {
            return false;
          }
        };

        var lastOffsetY = 0;
        var lastTouchPageY = 0;

        var thumbDrag = function (event, offsetX, offsetY) {
          dragger.top = Math.max(0, Math.min(parseInt(dragger.trackHeight, 10) - parseInt(dragger.height, 10), offsetY));
          event.stopPropagation();
        };

        var dragHandler = function (event) {
          var newOffsetX = 0;
          var newOffsetY = event.pageY - thumb[0].scrollTop - lastOffsetY;
          thumbDrag(event, newOffsetX, newOffsetY);
          redraw();
        };

        var _mouseUp = function (event) {
          win.off('mousemove', dragHandler);
          win.off('mouseup', _mouseUp);
          event.stopPropagation();
        };

        var _touchDragHandler = function (event) {
          event.stopPropagation();

          var newOffsetX = 0;
          var newOffsetY = event.originalEvent.changedTouches[0].pageY - thumb[0].scrollTop - lastOffsetY;
          thumbDrag(event, newOffsetX, newOffsetY);
          redraw();
        };

        var _touchEnd = function (event) {
          win.off('touchmove', _touchDragHandler);
          win.off('touchend', _touchEnd);
          event.stopPropagation();
        };

        var registerEvent = function(elm) {
          var wheelEvent = win[0].onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
          if (hasAddEventListener) {
            elm.addEventListener(wheelEvent, wheelHandler, false);
          } else {
            elm.attachEvent('onmousewheel', wheelHandler);
          }
        };

        var removeEvent = function(elm) {
          var wheelEvent = win[0].onmousewheel !== undefined ? 'mousewheel' : 'DOMMouseScroll';
          if (hasRemoveEventListener) {
            elm.removeEventListener(wheelEvent, wheelHandler, false);
          } else {
            elm.detachEvent('onmousewheel', wheelHandler);
          }
        };

        var buildScrollbar = function (rollToBottom) {

          rollToBottom = flags.bottom || rollToBottom;
          mainElm = angular.element(element.children()[0]);
          transculdedContainer = angular.element(mainElm.children()[0]);
          tools = angular.element(mainElm.children()[1]);
          thumb = angular.element(angular.element(tools.children()[0]).children()[0]);
          thumbLine = angular.element(thumb.children()[0]);
          track = angular.element(angular.element(tools.children()[0]).children()[1]);

          page.height = element[0].offsetHeight;
          page.scrollHeight = transculdedContainer[0].scrollHeight;

          if (!scope.disableWhen && page.height < page.scrollHeight) {
            scope.showYScrollbar = true;
            scope.$emit('scrollbar.show');

            // Calculate the dragger height
            dragger.height = Math.round(page.height / page.scrollHeight * page.height);
            dragger.trackHeight = page.height;

            // update the transcluded content style and clear the parent's
            calcStyles();
            element.css({overflow: 'hidden'});
            mainElm.css(scrollboxStyle);
            transculdedContainer.css(pageStyle);
            thumb.css(draggerStyle);
            thumbLine.css(draggerLineStyle);

            // Bind scroll bar events
            track.bind('click', trackClick);

            // Handle mousewheel
            registerEvent(transculdedContainer[0]);

            // Drag the scroller with the mouse
            thumb.on('mousedown', function (event) {
              lastOffsetY = event.pageY - thumb[0].offsetTop;
              win.on('mouseup', _mouseUp);
              win.on('mousemove', dragHandler);
              event.preventDefault();
            });

            // Drag the scroller by touch
            thumb.on('touchstart', _thumbTouchStart);

            var _thumbTouchStart = function (event) {
              lastOffsetY = event.originalEvent.changedTouches[0].pageY - thumb[0].offsetTop;
              win.on('touchend', _touchEnd);
              win.on('touchmove', _touchDragHandler);
              event.preventDefault();
            };

            /////////////////////////
            transculdedContainer.on('touchstart', function(event){
              event.stopPropagation();
              lastTouchPageY = event.originalEvent.changedTouches[0].pageY;
              transculdedContainer.on('touchend', _containerTouchEnd);
              transculdedContainer.on('touchmove', _containerTouchDragHandler);
            });

            var _containerTouchEnd = function(event){
              transculdedContainer.off('touchmove', _containerTouchDragHandler);
              transculdedContainer.off('touchend', _containerTouchEnd);
              event.stopPropagation();
            };

            var _containerTouchDragHandler = function(event){
              event.preventDefault();
              event.stopPropagation();

              var touchSpeed = 0.7,
                  newOffsetX = 0,
                  delta,
                  newOffsetY,
                  offsetTop = thumb[0].offsetTop,
                  pageY = event.originalEvent.changedTouches[0].pageY;

              delta = pageY - lastTouchPageY;
              lastTouchPageY = pageY;

              delta = delta * touchSpeed;

              newOffsetY = Math.round(offsetTop - delta);

              thumbDrag(event, newOffsetX, newOffsetY);
              redraw();
            };
            /////////////////////////

            if (rollToBottom) {
              // flags.bottom = false;
              dragger.top = parseInt(page.height, 10) - parseInt(dragger.height, 10);
            } else {
              // dragger.top = parseInt(page.height, 10) - parseInt(dragger.height, 10);
              dragger.top = Math.max(0, Math.min(parseInt(page.height, 10) - parseInt(dragger.height, 10), parseInt(dragger.top, 10)));
            }

            redraw();
          } else {
            scope.showYScrollbar = false;
            scope.$emit('scrollbar.hide');

            thumb.off('mousedown');
            /////////////////////////
            thumb.off('touchstart', _thumbTouchStart);
            transculdedContainer.off('touchmove', _containerTouchDragHandler);
            transculdedContainer.off('touchend', _containerTouchEnd);
            win.off('touchmove', _touchDragHandler);
            win.off('touchend', _touchEnd);
            /////////////////////////
            removeEvent(transculdedContainer[0]);
            transculdedContainer.attr('style', 'position:relative;top:0'); // little hack to remove other inline styles
            mainElm.css({height: '100%'});
          }
        };

        var rebuildTimer;

        var rebuild = function(e, data) {
          /* jshint -W116 */
          if (rebuildTimer != null) {
            clearTimeout(rebuildTimer);
          }
          /* jshint +W116 */
          var rollToBottom = !!data && !!data.rollToBottom;
          rebuildTimer = setTimeout(function () {
            page.height = null;
            buildScrollbar(rollToBottom);
            if (!scope.$$phase) {
              scope.$digest();
            }
            // update parent for flag update
            if(!scope.$parent.$$phase){
              scope.$parent.$digest();
            }
          }, 72);
        };

        buildScrollbar();

        if (!!attrs.rebuildOn) {
          attrs.rebuildOn.split(' ').forEach(function (eventName) {
            scope.$on(eventName, rebuild);
          });
        }

        if (!!attrs.resetOn) {
          attrs.resetOn.split(' ').forEach(function (eventName) {
            scope.$on(eventName, reset);
          });
        }

        if (attrs.hasOwnProperty('rebuildOnResize')) {
          win.on('resize', rebuild);
        }
      },
      template: '<div>' +
        '<div class="ngsb-wrap">' +
          '<div class="ngsb-container" ng-transclude></div>' +
          '<div class="ngsb-scrollbar" style="position: absolute; display: block;" ng-show="showYScrollbar">' +
            '<div class="ngsb-thumb-container">' +
              '<div class="ngsb-thumb-pos" oncontextmenu="return false;">' +
                '<div class="ngsb-thumb" ></div>' +
              '</div>' +
              '<div class="ngsb-track"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    };
};

export default directive;
