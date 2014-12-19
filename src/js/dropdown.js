/**
 * @copyright Devexperts
 *
 * @requires Object.clone
 * @requires Object.merge
 * @requires DX
 * @requires DX.Measure
 * @requires DX.Dom
 * @requires DX.Bem
 * @requires DX.Event
 * @requires DX.String
 * @requires DX.Tmpl
 */

var DropDown = (function(DX, window, document, undefined) {
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
			CN_ARROW = CN_DROPDOWN + '--arrow',
			A_FOR = 'data-for',
			defaults = {
				modifiers: [],
				width: 'control',
				optionTmpl: '<li class="{%= classNames %}" value="{%= value %}" {%= dataAttrs %}>{%= text %}</li>',
				groupTmpl: [
					'<li class="' + CN_GROUP + '">',
					'<span class="' + CN_GROUP_TITLE + '">{%= title %}</span>',
					'<ul>{%= optionList %}</ul>',
					'</li>'
				].join(''),
				innerTmpl: [
					'<div class="' + CN_CONTAINER + '">',
					'<div class="' + CN_LIST_WRAP + '">',
					'<ul class="' + CN_LIST + '"></ul>',
					'</div>',
					'</div>',
					'<span class="' + CN_ARROW + '"></span>'
				].join(''),
				hideOnClick: true
			};

	function rePosition(block, control) {
		var offset = DX.Measure.getPosition(control);

		block.style.top = offset.y + DX.Measure.getSize(control, true).height + 'px';
		block.style.left = offset.x + 'px';
	}

	function reCalculateWidth(block, control, config) {
		if (isNaN(config.width)) {
			block.style.minWidth = DX.Measure.getSize(control, true).width + 'px';
		} else {
			block.style.width = config.width + 'px';
		}
	}

	function getOptionListHTML(data, config) {
		return data.reduce(function(prevValue, item) {
			return prevValue + (item.title ? getOptgroupHTML(item, config) : getOptionHTML(item, config.optionTmpl));
		}, '');
	}

	function getOptgroupHTML(data, config) {
		data = Object.clone(data);
		data.optionList = getOptionListHTML(data.options, config);

		return DX.Tmpl.process(config.groupTmpl, data);
	}

	function getOptionHTML(data, template) {
		var dataAttrs = '';

		data = Object.clone(data);
		data.classNames = DX.Bem.createModifiedClassName(CN_OPTION, data.modifiers);

		if (data.data) {
			Object.forEach(data.data, function(item, key) {
				dataAttrs += 'data-' + DX.String.hyphenate(key) + '="' + item + '" ';
			});

			data.dataAttrs = dataAttrs;
		}

		return DX.Tmpl.process(template, data);
	}

	function createElements(control, config) {
		var body = document.body,
			block,
			list;

		block = DX.Dom.createElement('div', {
			className: DX.Bem.createModifiedClassName(CN_DROPDOWN, config.modifiers),
			innerHTML: config.innerTmpl
		});

		if (control.id) {
			block.setAttribute(A_FOR, control.id);
		}

		list = DX.$$('.' + CN_LIST, block);

		body.appendChild(block);

		return {
			block: block,
			list: list
		};
	}

	/**
	 * @constructor DropDown
	 * @param {Node|Element} control
	 * @param {Object} config - {Array:modifiers, String|Number:width, String:optionTmpl, String:groupTmpl, String:innerTmpl}
	 */
	return function DropDown(control, config) {
		var elements,
				selectedIndex,
				hoveredIndex,
				optionElements,
				selectedOptionElement,
				hoveredOptionElement,
				isShownOnce;

		function init() {
			config = Object.merge(defaults, (config || {}));
			elements = createElements(control, config);
			selectedIndex = 0;
			hoveredIndex = null;
			isShownOnce = false;

			initListeners();

			DX.Event.trigger(control, DropDown.E_CREATED, {
				detail: {
					block: elements.block,
					eventTarget: elements.block
				}
			});
		}

		function initListeners() {
			if (elements.list) {
				elements.list.addEventListener('click', function(e) {
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
				}, true);
			}
		}

		function setDataList(data) {
			elements.list.innerHTML = getOptionListHTML(data, config);
			optionElements = DX.$$$('.' + CN_OPTION, elements.list);
		}

		function show() {
			var block = elements.block;

			if (!isShownOnce) {
				isShownOnce = true;
				reCalculateWidth(block, control, config);
			}

			setHoveredIndex(0);

			rePosition(block, control);
			DX.Bem.removeModifier(block, M_HIDDEN, CN_DROPDOWN);
			DX.Bem.addModifier(block, M_SHOWN, CN_DROPDOWN);

			document.addEventListener(DX.Event.TOUCH_CLICK, documentClickHandler, true);
			DX.Event.trigger(block, DropDown.E_SHOWN);
		}

		function hide() {
			var block = elements.block;

			clearHoveredIndex();
			DX.Bem.removeModifier(block, M_SHOWN, CN_DROPDOWN);
			DX.Bem.addModifier(block, M_HIDDEN, CN_DROPDOWN);

			document.removeEventListener(DX.Event.TOUCH_CLICK, documentClickHandler, true);
			DX.Event.trigger(block, DropDown.E_HIDDEN);
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
		function getSelectedIndex() {
			return selectedIndex;
		}

		function getHoveredIndex() {
			return hoveredIndex;
		}
		function getBlock() {
			return elements.block;
		}

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

		function isShown() {
			return DX.Bem.hasModifier(elements.block, M_SHOWN, CN_DROPDOWN);
		}

		init();

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
})(DX, window, document);

DropDown.E_CREATED = 'dropdown:created';
DropDown.E_SHOWN = 'dropdown:shown';
DropDown.E_HIDDEN = 'dropdown:hidden';
DropDown.E_CHANGED = 'dropdown:changed';
