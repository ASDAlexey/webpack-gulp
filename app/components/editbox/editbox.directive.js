var directive = function ($compile, $document, $window, $rootScope, $timeout, Geo) {
    var textTemplate = `<div class="editbox" ng-keypress="keypress($event)">
        <div class="editbox-arrow"></div>

        <input type="text" class="form-control inline editbox-input _text" ng-model="value">

        <button class="btn _green editbox-btn _ok" ng-click='clickOk()'>Send</button>
        <button class="btn _white _border-gray editbox-btn _close" ng-click='clickClose()'>Close</button>
    </div>`;
    var dateTemplate = `<div class="editbox" ng-keypress="keypress($event)">
        <div class="editbox-arrow"></div>

        <div date-select select-class="form-control inline" ng-model="value"></div>

        <button class="btn _green editbox-btn _ok" ng-click='clickOk()'>Send</button>
        <button class="btn _white _border-gray editbox-btn _close" ng-click='clickClose()'>Close</button>
    </div>`;
    var urlTemplate = `<div class="editbox" ng-keypress="keypress($event)">
        <div class="editbox-arrow"></div>

        <input type="url" class="form-control inline editbox-input _text" ng-model="value" http-prefix>

        <button class="btn _green editbox-btn _ok" ng-click='clickOk()'>Send</button>
        <button class="btn _white _border-gray editbox-btn _close" ng-click='clickClose()'>Close</button>
    </div>`;
    var bookmarkTemplate = `<div class="editbox" ng-keypress="keypress($event)">
        <div class="editbox-arrow"></div>
        <div>
            <input type="text" placeholder="Bookmark Title" class="form-control inline editbox-input _text" ng-model="additionalModel" maxlength="12">
        </div>
        <div class="bookmark-offset">
            <input type="url" placeholder="URL" class="form-control inline editbox-input _text" ng-model="value" http-prefix>
        </div>
    </div>`;
    var countryTemplate = `<div class="editbox" ng-keypress="keypress($event)">
        <div class="editbox-arrow"></div>

        <div class="pull-left">
            <input
                type="text"
                ng-model="value"
                location
                placeholder=""
                typeahead="country.name for country in getCountry($viewValue)"
                typeahead-on-select="selectLocation($item, $model, $label)"
                typeahead-focus-first="false"
                class="form-control inline editbox-input _text"
            >
        </div>

        <div class="pull-left">
            <button class="btn _green editbox-btn _ok" ng-click='selectLocation(currentLocation)' ng-disabled="value !== '' && !currentLocation">Send</button>
            <button class="btn _white _border-gray editbox-btn _close" ng-click='clickClose()'>Close</button>
        </div>
    </div>`;
    var cityTemplate = `<div class="editbox" ng-keypress="keypress($event)">
        <div class="editbox-arrow"></div>

        <div class="pull-left">
            <input
                type="text"
                ng-model="value"
                location
                placeholder=""
                typeahead="city.name for city in getCity($viewValue)"
                typeahead-on-select="selectLocation($item, $model, $label)"
                typeahead-focus-first="false"
                class="form-control inline editbox-input _text"
                ng-disabled="!attrs.state"
            >
        </div>

        <div class="pull-left">
            <button class="btn _green editbox-btn _ok" ng-click='selectLocation(currentLocation)' ng-disabled="(value !== '' && !currentLocation) || !attrs.state">Send</button>
            <button class="btn _white _border-gray editbox-btn _close" ng-click='clickClose()'>Close</button>
        </div>
    </div>`;
    var stateTemplate = `<div class="editbox" ng-keypress="keypress($event)">
        <div class="editbox-arrow"></div>

        <div class="pull-left">
            <input
                type="text"
                ng-model="value"
                location
                placeholder=""
                typeahead="state.name for state in getState($viewValue)"
                typeahead-on-select="selectLocation($item, $model, $label)"
                typeahead-focus-first="false"
                class="form-control inline editbox-input _text"
                ng-disabled="!attrs.country"
            >
        </div>

        <div class="pull-left">
            <button class="btn _green editbox-btn _ok" ng-click='selectLocation(currentLocation)' ng-disabled="(value !== '' && !currentLocation) || !attrs.country">Send</button>
            <button class="btn _white _border-gray editbox-btn _close" ng-click='clickClose()'>Close</button>
        </div>
    </div>`;
    var fileTemplate = `<div class="editbox" ng-keypress="keypress($event)">
        <div class="editbox-arrow"></div>

        <div class="choices pull-left">
            <div class="choices-item">
                <div class="radio _empty">
                    <input type="radio" name="type" id="file" value="file" ng-model="currentChoice" ng-change="changeTypeOfResource()">
                </div>
                <div class="upload btn _cyan">
                    <span ng-show="!fileName">Upload</span>
                    <span ng-show="fileName">{{ fileName }}</span>
                    <input type="file" class="form-control inline editbox-input _file" file-model="value" file-on-change="fileIsChanged">
                </div>
            </div>
        </div>

        <div class="pull-left">
            <button class="btn _green editbox-btn _ok" ng-click='clickOk()' ng-disabled="currentChoice === 'file' && !fileName">Send</button>
            <button class="btn _white _border-gray editbox-btn _close" ng-click='clickClose()'>Close</button>
        </div>
    </div>`;

    var editbox = null;
    var currentScope = null;
    var resizeTimer = null;
    var currentElement = null;

    function getTemplate(type) {
        var template = '';

        switch (type) {
            case 'text':
                template = textTemplate;
                break;
            case 'date':
                template = dateTemplate;
                break;
            case 'url':
                template = urlTemplate;
                break;
            case 'bookmark':
                template = bookmarkTemplate;
                break;
            case 'country':
                template = countryTemplate;
                break;
            case 'state':
                template = stateTemplate;
                break;
            case 'city':
                template = cityTemplate;
                break;
            case 'file':
                template = fileTemplate;
                break;
        }

        return template;
    }

    function handlerClick(e) {
        if (!$(e.target).closest('.editbox').length) {
            $rootScope.$broadcast('editbox.close', {scopeId: currentScope.$id});
        }
    }

    function handlerEscKey(e) {
        switch (e.which) {
            case 27:
                $rootScope.$broadcast('editbox.close', {scopeId: currentScope.$id});
                break;
        }
    }

    function removeEditbox() {
        if (editbox) {
            editbox.remove();
            editbox = null;
        }

        currentElement = null;

        $document.off("click touchend", handlerClick);
        $document.off("keypress keydown", handlerEscKey);
    }

    function createEditbox(scope, element, type) {
        // There can only be one editbox element per directive shown at once.
        if (editbox) {
            removeEditbox();
        }

        var template = getTemplate(type);

        editbox = $compile(template)(scope, function (editbox) {
            $document.find('body').append(editbox);
        });

        currentElement = element;
        currentScope = scope;
        $document.bind('click touchend', handlerClick);
        $document.bind('keypress keydown', handlerEscKey);
    }

    function hideEditbox(scope) {
        scope.isOpen = false;
        removeEditbox();
    }

    function showEditbox(scope, element, type) {
        createEditbox(scope, element, type);
        stylesEditbox(element);
    }

    function stylesEditbox(element) {
        var styles = {};
        var positions = calcPosition(element);
        styles.top = positions.top += 'px';
        styles.left = positions.left += 'px';
        styles.display = 'block';

        // Now set the calculated styles.
        editbox.css(styles);
        $(editbox[0]).find('.editbox-arrow').css('left', positions.arrowOffset + 'px');
    }

    function calcPosition(element) {
        var $element = $(element[0]),
            $editbox = $(editbox[0]),
            positions = $element.offset(),
            topOffset = 15,
            centerElement = positions.left + $element.outerWidth() / 2,
            leftOffset = positions.left - $element.outerWidth() / 2 - (positions.left - $editbox.outerWidth() / 2);

        positions.left = positions.left - leftOffset;
        positions.top = positions.top + $element.outerHeight() + topOffset;

        if (positions.left < 0) {
            positions.left = 0;
        } else if (positions.left > $window.innerWidth - $editbox.outerWidth()) {
            positions.left = $window.innerWidth - $editbox.outerWidth();
        }

        var arrowOffset = centerElement - positions.left;

        return {
            left: positions.left,
            top: positions.top,
            arrowOffset: arrowOffset
        };
    }

    return {
        restrict: 'A',
        scope: {
            model: '=editboxModel',
            additionalModel: '=editboxAdditionalModel',
            action: '&editboxAction',
            ellipsis: '@editboxEllipsis',
            attrs: '=editboxAttrs',
            isLoaded: '=editboxIsLoaded',
            isHome: "=editboxIsHome"
        },
        link: function (scope, element, attrs) {
            //add class to ignore click events of the plugin https://github.com/ftlabs/fastclick
            if (window.FastClick) element.addClass('needsclick');

            scope.isOpen = false;
            if (attrs.editboxType === 'file') {
                scope.currentChoice = 'file';
                scope.fileName = '';
            }

            function applyNewValue(scope, element, attrs) {
                element.addClass('editable-click');

                if (attrs.editboxType === 'file') return;

                if (attrs.editboxDisplay !== 'false') {
                    if (scope.value && scope.value !== '') {
                        var text = '';

                        switch (attrs.editboxType) {
                            case 'date':
                                text = moment(scope.value).format('D MMMM YYYY');
                                break;
                            case 'country':
                                text = angular.isObject(scope.value) ? scope.value.name || scope.value.ascii : scope.value;
                                break;
                            case 'state':
                                text = angular.isObject(scope.value) ? scope.value.name || scope.value.ascii : scope.value;
                                break;
                            case 'city':
                                text = angular.isObject(scope.value) ? scope.value.name || scope.value.ascii : scope.value;
                                break;
                            default:
                                text = scope.value;
                        }

                        element.removeClass('editable-empty');
                        $(element).text(text);

                        if (scope.ellipsis) {
                            $(element).dotdotdot({
                                ellipsis: scope.ellipsis,
                                wrap: 'letter',
                                tolerance: 2, // fix zooming of a page in Chrome
                                watch: true
                            });
                        }
                    } else if (attrs.editboxPlaceholder) {
                        element.addClass('editable-empty');
                        element.text(attrs.editboxPlaceholder);
                    } else {
                        element.text(scope.value);
                    }
                }
            }

            scope.fileIsChanged = function (event) {
                var files = event.target.files;

                if (files.length) {
                    scope.fileName = files[0].name;
                } else {
                    scope.fileName = '';
                }
            };

            scope.clickOk = function (e) {
                if (attrs.editboxType === 'file') {
                    switch (scope.currentChoice) {
                        case 'file':
                            scope.model = scope.value;
                            break;
                        default:
                            scope.model = '';
                    }
                } else {
                    scope.model = scope.value;
                }

                $timeout(()=> {
                    scope.$apply(function () {
                        if (!scope.isHome) {
                            scope.action();
                        }
                        $rootScope.$broadcast('editbox.close', {scopeId: scope.$id});
                    });
                });
            };

            scope.getCountry = function (value) {
                var promise = Geo.searchCountry(value);
                promise.then((countries)=> {
                    scope.currentLocation = _.find(countries, function (country) {
                        return country.name === value
                    });
                });
                return promise;
            };

            scope.getCity = function (value) {
                if (angular.isObject(scope.attrs.state)) {
                    var promise = Geo.searchCity(scope.attrs.state.id, value);

                    promise.then((cities)=> {
                        scope.currentLocation = _.find(cities, function (city) {
                            return city.name === value
                        });
                    });

                    return promise;
                }

                return false;
            };

            scope.getState = function (value) {
                if (angular.isObject(scope.attrs.country)) {
                    var promise = Geo.searchState(scope.attrs.country.id, value);

                    promise.then((states)=> {
                        scope.currentLocation = _.find(states, function (state) {
                            return state.name === value
                        });
                    });

                    return promise;
                }

                return false;
            };

            scope.selectLocation = function ($item, $model, $label) {
                scope.model = $model ? $item : '';

                $timeout(()=> {
                    scope.$apply(function () {
                        scope.action();
                        $rootScope.$broadcast('editbox.close', {scopeId: scope.$id});
                    });
                });
            };

            scope.keypress = function (event) {
                switch (event.which) {
                    case 13:
                        if (attrs.editboxType === 'country' || attrs.editboxType === 'state' || attrs.editboxType === 'city') {
                            if (scope.currentLocation) {
                                scope.selectLocation(scope.currentLocation, scope.value);
                            } else if (event.target.value === '') {
                                scope.selectLocation(null);
                            }
                        } else {
                            scope.clickOk();
                        }
                        break;
                }
            };

            angular.element($window).bind('resize', function () {
                if (currentElement) {
                    clearTimeout(resizeTimer);
                    resizeTimer = setTimeout(function () {
                        stylesEditbox(currentElement);
                    }, 100);
                }
            });

            scope.clickClose = function () {
                $rootScope.$broadcast('editbox.close', {scopeId: scope.$id});
            };

            element.bind('click', function (e) {
                e.stopPropagation();
                if (!scope.isOpen) {
                    $rootScope.$broadcast('editbox.open', {scopeId: scope.$id});
                } else {
                    $rootScope.$broadcast('editbox.close', {scopeId: scope.$id});
                }
            });

            scope.$on('editbox.open', function (event, message) {
                if (message.scopeId === scope.$id) {
                    scope.isOpen = true;
                    if (attrs.editboxType === 'file') {
                        scope.currentChoice = 'file';
                        scope.fileName = '';
                    }
                    showEditbox(scope, element, attrs.editboxType);

                    $(editbox[0]).find('.form-control._text').first().focus();
                } else {
                    scope.isOpen = false;
                }
            });

            scope.$on('editbox.close', function (event, message) {
                if (message.scopeId === scope.$id) {
                    if (attrs.editboxType == 'bookmark') {
                        $timeout(()=> {
                            scope.$apply(function () {
                                scope.model = scope.value;
                            });
                        });
                        scope.isLoaded = true;
                        scope.$applyAsync(()=> {
                            if (scope.isHome)
                                scope.action();
                        });
                    }
                    scope.isOpen = false;
                    hideEditbox(scope);
                }
            });

            scope.$watch(function () {
                return scope.model;
            }, (newValue, oldValue)=> {
                scope.value = scope.model;
                applyNewValue(scope, element, attrs);
            });

            scope.$on('$destroy', function () {
                removeEditbox();
            });
        }
    }
};

export default directive;
