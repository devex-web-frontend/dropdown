/**
 * @copyright Devexperts
 *
 * @requires DX
 * @requires DX.Measure
 * @requires DX.Dom
 * @requires DX.Bem
 * @requires DX.Event
 * @requires DX.String
 * @requires DX.Tmpl
 * @namespace
 */

var DropDown = (function (DX) {
    'use strict';

    var CN_DROPDOWN = 'dropDown',
        M_SHOWN = 'shown',
        M_HIDDEN = 'hidden',
        CN_CONTAINER = CN_DROPDOWN + '--container',
        CN_LIST_WRAP = CN_DROPDOWN + '--listWrap',
        CN_LIST = CN_DROPDOWN + '--list',
        CN_OPTION = CN_DROPDOWN + '--option',
        M_SELECTED = 'selected',
        M_HOVERED = 'hovered',
        CN_GROUP = CN_DROPDOWN + '--group',
        CN_GROUP_TITLE = CN_DROPDOWN + '--groupTitle',
        A_FOR = 'data-for',
        ESC_KEY_CODE = 27,
        defaults = {
            modifiers: [],
            width: 'control',
            optionTmpl: '<li class="{%= classNames %}" value="{%= value %}" {%= dataAttrs %}>{%= optionInnerTmpl %}{%= currentMarkTmpl %}</li>',
            optionInnerTmpl: '{%= text %}',
            currentMarkTmpl: null,
            groupTmpl: [
                '<li class="' + CN_GROUP + '">',
                '<span class="' + CN_GROUP_TITLE + '">{%= label %}</span>',
                '<ul>{%= optionList %}</ul>',
                '</li>'
            ].join(''),
            innerTmpl: [
                '<div class="' + CN_CONTAINER + '">',
                '<div class="' + CN_LIST_WRAP + '">',
                '<ul class="' + CN_LIST + '"></ul>',
                '</div>',
                '</div>'
            ].join(''),
            hideOnClick: true,
            animationTime: 0.2
        };

    /**
     * Check is object variable
     * @param {*} param
     * @returns {boolean}
     */
    function isObject(param) {
        var type = typeof param;
        return type === 'object' && !Array.isArray(param);
    }

    function rePosition(block, control) {
        var offset = DX.Measure.getPosition(control),
            controlPosition = control.getBoundingClientRect(),
            blockPosition,
            upDirectionTopCoordinates,
            leftDirectionLeftCoordinates;

        block.style.top = offset.y + controlPosition.height + 'px';
        block.style.left = offset.x + 'px';

        blockPosition = block.getBoundingClientRect();

        upDirectionTopCoordinates = document.body.scrollTop + controlPosition.top - blockPosition.height + controlPosition.height;
        leftDirectionLeftCoordinates = document.body.scrollLeft + controlPosition.left - blockPosition.width + controlPosition.width;

        if (blockPosition.top + blockPosition.height > window.innerHeight && upDirectionTopCoordinates > 0) {
            block.style.top = upDirectionTopCoordinates + 'px';
        }

        if (blockPosition.left + blockPosition.width > window.innerWidth && leftDirectionLeftCoordinates > 0) {
            block.style.left = leftDirectionLeftCoordinates + 'px';
        }
    }

    function reCalculateWidth(block, control, config) {
        if (isNaN(config.width)) {
            block.style.minWidth = DX.Measure.getSize(control, true).width + 'px';
        } else {
            block.style.width = config.width + 'px';
        }
    }

    function reCalculateAnimationDelay(block, config) {
        var listChildren = block.querySelectorAll("." + CN_OPTION + ", ." + CN_GROUP_TITLE);

        for (var i = 0; i < listChildren.length; i++) {
            var delay = config.animationTime / listChildren.length * i;

            listChildren[i].style.animationDelay = delay.toFixed(3) + 's';
        }
    }

    function reCalculateHeight(block) {
        block.style.height = calcHiddenElementHeight(block) + 'px';
    }

    function calcHiddenElementHeight(block) {
        block.style.height = '';
        block.style.display = 'block';
        var dropDownHeight = DX.Measure.getSize(block, true).height;
        block.style.display = '';
        return dropDownHeight;
    }

    function getOptionListHTML(data, config) {
        return data.reduce(function (prevValue, item) {
            var result = '';
            if (isObject(item)) {
                var isItGroup = Array.isArray(item.options);
                result = prevValue + (isItGroup ? getOptgroupHTML(item, config) : getOptionHTML(item, config));
            }
            return result;
        }, '');
    }

    function getOptgroupHTML(data, config) {
        data = Object.assign({}, data);
        data.optionList = getOptionListHTML(data.options, config);

        return DX.Tmpl.process(config.groupTmpl, data);
    }

    function getOptionHTML(data, config) {
        var dataAttrs = '',
            template = config.optionTmpl;
        data = Object.assign({}, data);
        data.classNames = DX.Bem.createModifiedClassName(CN_OPTION, data.modifiers);

        if (data.data) {
            Object.keys(data.data).forEach(function (key) {
                var item = data.data[key];
                dataAttrs += 'data-' + DX.String.hyphenate(key) + '="' + item + '" ';
            });

            data.dataAttrs = dataAttrs;
        }

        data.currentMarkTmpl = config.currentMarkTmpl;
        data.optionInnerTmpl = DX.Tmpl.process(config.optionInnerTmpl, data);

        return DX.Tmpl.process(template, data);
    }

    function createElements(control, config) {
        var block,
            list;

        block = DX.Dom.createElement('div', {
            className: DX.Bem.createModifiedClassName(CN_DROPDOWN, config.modifiers),
            innerHTML: config.innerTmpl
        });

        if (control.id) {
            block.setAttribute(A_FOR, control.id);
        }

        list = DX.$$('.' + CN_LIST, block);

        return {
            block: block,
            list: list
        };
    }

    function keyDownHandler(e) {

        var key;
        key = e.key || e.which;
        if (key === ESC_KEY_CODE || key === 'Escape') {
            setTimeout(hideAllDropDowns, 0);
        }
    }

    function hideAllDropDowns() {
        var dropDownsArray = DX.$$$('.' + CN_DROPDOWN);
        Array.prototype.forEach.call(dropDownsArray, function (dropdown) {
            DX.Event.trigger(dropdown, DropDown.E_HIDE);
        });

    }

    if (typeof document !== 'undefined') {
        document.addEventListener(DX.Event.KEY_DOWN, keyDownHandler);
    }

    function prefixedEvent(element, type, callback, removeEvent) {
        var prefix = ['webkit', 'moz', 'MS', 'o', ''];
        for (var i = 0; i < prefix.length; i++) {
            if (!prefix[i]) type = type.toLowerCase();

            if (removeEvent) {
                element.removeEventListener(prefix[i] + type, callback, false);
                removeScrollHeight(element);
            } else {
                element.addEventListener(prefix[i] + type, callback, false);
            }
        }
    }

    function setScrollHeight(block, control) {
        var height = calcHiddenElementHeight(block),
            offset = DX.Measure.getPosition(control),
            controlPosition = control.getBoundingClientRect(),
            coords = height + offset.y + controlPosition.height,
            difference = window.innerHeight - coords,
            minIndent = 25,
            optionHeight = 27,
            cutHeight,
            newHeight;

        if (difference < minIndent) {
            cutHeight = minIndent - difference;
            newHeight = height - cutHeight;

            if (newHeight < optionHeight * 2) {
                newHeight = optionHeight * 2;
            }

            block.style.height = newHeight + 'px';

            addScrolling(block, newHeight);
        }
    }

    function addScrolling(block, height) {
        var scrollBlock = block.querySelector('.' + CN_LIST_WRAP),
            scrollable = block.querySelector('.scrollable');

        if (!scrollable) {
            var scroll = new Scrollable(scrollBlock);
        }

        var scrollElement = block.querySelector('.scrollable--wrapper');

        scrollElement.style.height = height + 'px';
    }

    function removeScrollHeight(block) {
        var scrollElement = block.querySelector('.scrollable--wrapper');

        if (scrollElement) {
            block.style.height = '';
            scrollElement.style.height = '';
        }
    }

    /**
     * Creates new dropdown
     * @constructor DropDown
     * @param {Node|Element} control
     * @param {Object} config - {Array:modifiers, String|Number:width, String:optionTmpl, String:groupTmpl, String:innerTmpl, String:currentMarkTmpl}
     */
    return function DropDown(control, config) {
        var elements,
            selectedIndex,
            hoveredIndex,
            optionElements,
            selectedOptionElement,
            hoveredOptionElement,
            isShownOnce;

        /**
         * Dropdown is created
         *
         * @event dropdown:created
         */
        function init() {
            config = Object.assign({}, defaults, (config || {}));
            elements = createElements(control, config);
            selectedIndex = 0;
            hoveredIndex = null;
            isShownOnce = false;
        }

        function initListeners() {
            var block = getEventTarget();
            block.addEventListener(DropDown.E_HIDE, hide);
            document.addEventListener(DropDown.E_HIDE_ALL, hideAllDropDowns);

            if (elements.list) {
                elements.list.addEventListener('click', elementsListClickHandler, true);
            }
        }

        /**
         * Dropdown is destroyed
         *
         * @event dropdown:destroyed
         */
        function destroy() {
            removeListeners();
            DX.Event.trigger(elements.block, DropDown.E_DESTROYED);
            elements.block.parentNode.removeChild(elements.block);
        }

        function removeListeners() {
            var block = getEventTarget();
            block.removeEventListener(DropDown.E_HIDE, hide);
            prefixedEvent(block, 'AnimationEnd', animationListener, true);
            document.removeEventListener(DX.Event.KEY_DOWN, keyDownHandler);
            if (typeof document !== 'undefined') {
                document.removeEventListener(DropDown.E_HIDE_ALL, hideAllDropDowns);
            }
            document.removeEventListener('mousedown', documentClickHandler, true);

            if (elements.list) {
                elements.list.removeEventListener('click', elementsListClickHandler, true);
            }
        }

        function animationListener(e) {
            if (e.animationName === 'slideDropdownUp') {
                destroy();
            }
        }

        /**
         * Sets popup data list
         * @method setDataList
         * @param {Object} data
         */
        function setDataList(data) {
            var block = elements.block;

            elements.list.innerHTML = getOptionListHTML(data, config);
            optionElements = DX.$$$('.' + CN_OPTION, elements.list);
            reCalculateAnimationDelay(block, config);
            reCalculateHeight(block);
        }

        /**
         * Shows dropdown
         * @method show
         */
        /**
         * Dropdown is shown
         *
         * @event dropdown:shown
         */
        function show() {
            var body = document.body,
                block = elements.block;

            initListeners();

            DX.Event.trigger(control, DropDown.E_CREATED, {
                detail: {
                    block: elements.block,
                    eventTarget: elements.block
                }
            });

            body.appendChild(block);

            if (!isShownOnce) {
                isShownOnce = true;
                reCalculateWidth(block, control, config);
                reCalculateAnimationDelay(block, config);
                reCalculateHeight(block);
            }

            setHoveredIndex(0);
            setScrollHeight(block, control);

            DX.Bem.removeModifier(block, M_HIDDEN, CN_DROPDOWN);
            DX.Bem.addModifier(block, M_SHOWN, CN_DROPDOWN);
            rePosition(block, control);

            document.addEventListener('mousedown', documentClickHandler, true);

            DX.Event.trigger(block, DropDown.E_SHOWN);
        }

        /**
         * Hides dropdown
         * @method hide
         */
        /**
         * Dropdown is hidden
         *
         * @event dropdown:hidden
         */
        /**
         * Hide dropdown
         *
         * @event dropdown:hide
         */
        function hide() {
            var block = elements.block;

            clearHoveredIndex();
            DX.Bem.removeModifier(block, M_SHOWN, CN_DROPDOWN);
            DX.Bem.addModifier(block, M_HIDDEN, CN_DROPDOWN);

            document.removeEventListener(DX.Event.TOUCH_CLICK, documentClickHandler, true);
            DX.Event.trigger(block, DropDown.E_HIDDEN);

            prefixedEvent(block, 'AnimationEnd', animationListener, false);
        }


        function normalizeIndex(index) {
            if (index <= 0) {
                index = 0;
            }
            if (optionElements && index >= optionElements.length) {
                index = optionElements.length - 1;
            }
            return index;
        }

        /**
         * Sets popup selectedelement by index
         * @method setSelectedIndex
         * @param {Number} index
         * @param {bool=} [triggerChangeEvent=false] whether or not trigger dropdown:changed event
         */
        /**
         * Dropdown has changed
         *
         * @event dropdown:changed
         */
        function setSelectedIndex(index, triggerChangeEvent) {
            if (selectedOptionElement) {
                DX.Bem.removeModifier(selectedOptionElement, M_SELECTED, CN_OPTION);
            }

            selectedIndex = index;
            selectedOptionElement = optionElements[index];
            if (selectedOptionElement) {
                DX.Bem.addModifier(selectedOptionElement, M_SELECTED, CN_OPTION);
                if (triggerChangeEvent) {
                    DX.Event.trigger(elements.block, DropDown.E_CHANGED);
                }
            }
        }

        /**
         * Sets popup hoveredelement by index
         * @method setHoveredIndex
         * @param {Number} index
         */
        function setHoveredIndex(index) {
            if (hoveredOptionElement) {
                DX.Bem.removeModifier(hoveredOptionElement, M_HOVERED, CN_OPTION);
            }

            index = normalizeIndex(index);

            hoveredIndex = index;
            hoveredOptionElement = optionElements ? optionElements[index] : null;

            if (hoveredOptionElement) {
                DX.Bem.addModifier(hoveredOptionElement, M_HOVERED, CN_OPTION);

            }
        }

        function clearHoveredIndex() {
            if (hoveredOptionElement) {
                DX.Bem.removeModifier(hoveredOptionElement, M_HOVERED, CN_OPTION);
            }
            hoveredIndex = null;
            hoveredOptionElement = null;
        }

        /**
         * Gets popup selectedelement by index
         * @method getSelectedIndex
         * @returns {Number} selectedIndex
         */
        function getSelectedIndex() {
            return selectedIndex;
        }

        /**
         * Gets popup hoveredelement by index
         * @method getHoveredIndex
         * @returns {Number} hoveredIndex
         */
        function getHoveredIndex() {
            return hoveredIndex;
        }

        /**
         * Gets HTMLNode containing dropdown
         * @method getBlock
         * @returns {Node}
         */
        function getBlock() {
            return elements.block;
        }

        /**
         * Gets element which listens to events
         * @method getEventTarget
         * @returns {Node}
         */
        function getEventTarget() {
            return elements.block;
        }

        function documentClickHandler(e) {
            var target = e.target,
                closestDropDown = DX.Dom.getAscendantByClassName(target, CN_DROPDOWN),
                block = elements.block,
                id = block.getAttribute(A_FOR),
                forElement;

            if (id) {
                forElement = DX.Dom.getAscendantByAttribute(target, 'id', id);
            }

            if (closestDropDown !== block && !forElement) {
                hide();
            }
        }

        function elementsListClickHandler(e) {
            var optionElement = DX.Dom.getAscendantByClassName(e.target, CN_OPTION),
                index;

            if (optionElement) {
                index = Array.prototype.indexOf.call(optionElements, optionElement);

                if (index !== selectedIndex) {
                    selectedIndex = index;
                    setSelectedIndex(index);
                    DX.Event.trigger(elements.block, DropDown.E_CHANGED);
                }

                if (config.hideOnClick) {
                    hide();
                }
            }
        }

        /**
         * Gets whether dropdown is shown
         * @method isShown
         * @returns {bool}
         */
        function isShown() {
            return DX.Bem.hasModifier(elements.block, M_SHOWN, CN_DROPDOWN);
        }

        init();

        this.destroy = destroy;
        this.setDataList = setDataList;
        this.setSelectedIndex = setSelectedIndex;
        this.getSelectedIndex = getSelectedIndex;
        this.setHoveredIndex = setHoveredIndex;
        this.getHoveredIndex = getHoveredIndex;
        this.show = show;
        this.hide = hide;
        this.isShown = isShown;
        this.getBlock = getBlock;
        this.getEventTarget = getEventTarget;
    };
})(DX);

/** @constant
 * @type {string}
 * @default
 * @memberof DropDown
 */
DropDown.E_CREATED = 'dropdown:created';
/** @constant
 * @type {string}
 * @default
 * @memberof DropDown
 */
DropDown.E_DESTROYED = 'dropdown:destroyed';
/** @constant
 * @type {string}
 * @default
 * @memberof DropDown
 */
DropDown.E_SHOWN = 'dropdown:shown';
/** @constant
 * @type {string}
 * @default
 * @memberof DropDown
 */
DropDown.E_HIDDEN = 'dropdown:hidden';
/** @constant
 * @type {string}
 * @default
 * @memberof DropDown
 */
DropDown.E_CHANGED = 'dropdown:changed';
/** @constant
 * @type {string}
 * @default
 * @memberof DropDown
 */
DropDown.E_HIDE = 'dropdown:hide';

/**
 * @constant
 * @type {string}
 * @default
 * @memberof DropDown
 */
DropDown.E_HIDE_ALL = 'dropdown:hideAll';

/**
 * Gets if there is any shown dropdown
 * @method isAnyShown
 * @static
 * @memberof DropDown
 * @returns {Boolean}
 */
DropDown.isAnyShown = function () {
    'use strict';
    return document.querySelectorAll('.dropDown-shown').length > 0;
};


