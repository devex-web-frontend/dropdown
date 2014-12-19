describe('DropDown', function() {
	var data = [
			{
				value: 'superman',
				text: 'super power',
				modifiers: ['hero', 'alien', 'superman'],
				data: {
					status: 'not avail.',
					jollyRoger: 'b',
					catwoman: 'Meow!'
				}
			},
			{
				value: 'batman',
				text: 'super rich'
			},
			{
				value: 'flash',
				text: 'super speed'
			}
		],
		elTmpl = [
			'<div id="test"></div>'
		].join(''),
		dropDown,
		testElement;

	beforeEach(function() {
		document.body.innerHTML = elTmpl;
		testElement = document.getElementById('test');
	});

	afterEach(function() {
		document.body.innerHTML = '';
		testElement = dropDown = null;
	});

	describe('#constructor', function() {
		it('should generate .dropDown element', function() {
			dropDown = new DropDown(testElement, {});

			expect(document.querySelector('.dropDown')).not.toBeNull();
			expect(document.querySelectorAll('.dropDown').length).toBe(1);
		});

		it('should initialize normally when config argument is omitted', function() {
			dropDown = new DropDown(testElement);

			expect(dropDown).toBeDefined();
			expect(dropDown instanceof DropDown).toBe(true);
		});

		it('should generate correct HTML sctructure', function() {
			dropDown = new DropDown(testElement);

			expect(document.querySelector('.dropDown--container')).not.toBeNull();
			expect(document.querySelector('.dropDown--listWrap')).not.toBeNull();
			expect(document.querySelector('.dropDown--list')).not.toBeNull();
			expect(document.querySelector('.dropDown--arrow')).not.toBeNull();
		});

		it('should initialize normally when custom dropdown template provided without .dropDown--list element', function() {
			expect(function() {
				dropDown = new DropDown(testElement, {
					innerTmpl:'<div></div>'
				});
			}).not.toThrow();
		});

		it('should add data-for attribute to the container', function() {
			var container;

			dropDown = new DropDown(testElement);
			container = document.querySelector('.dropDown');

			expect(container.hasAttribute('data-for')).toBe(true);
			expect(container.getAttribute('data-for')).not.toBe('');
		});

		it('should trigger E_CREATED once after DropDown is created', function() {
			var eventHandler = jasmine.createSpy('eventHandler');

			testElement.addEventListener(DropDown.E_CREATED, eventHandler);

			new DropDown(testElement);

			expect(eventHandler).toHaveBeenCalled();
			expect(eventHandler.calls.length).toBe(1);
		});

		it('should pass .dropDown to e.detail of E_CREATED', function() {
			var testDropdown;

			test.addEventListener(DropDown.E_CREATED, function(e) {
				testDropdown = e.detail.block;
			});

			new DropDown(testElement);

			expect(testDropdown).toBe(document.querySelector('.dropDown'));
		});
	});

	describe('#getBlock()', function() {
		it('should return DropDown container', function() {
			dropDown = new DropDown(testElement);

			expect(dropDown.getBlock()).toBe(document.querySelector('.dropDown'));
		});
	});

	describe('#show()', function() {
		it('should add "-shown" modifier to the block', function() {
			var ddElement;

			dropDown = new DropDown(testElement);
			ddElement = document.querySelector('.dropDown');
			dropDown.show();

			expect(ddElement.classList.contains('dropDown-shown')).toBe(true);
		});

		it('should remove "-hidden" modifier from the block', function() {
			var ddElement;

			dropDown = new DropDown(testElement);
			ddElement = document.querySelector('.dropDown');
			dropDown.show();

			expect(ddElement.classList.contains('dropDown-hidden')).toBe(false);
		});

		it('should fire E_SHOWN', function() {
			var shownEventHandler = jasmine.createSpy('shownEventFired');

			dropDown = new DropDown(testElement);
			document.querySelector('.dropDown').addEventListener(DropDown.E_SHOWN, shownEventHandler);

			dropDown.show();
			expect(shownEventHandler).toHaveBeenCalled();
		});
	});

	describe('#hide()', function() {
		it('should add "-hidden" modifier to the block', function() {
			var ddElement;

			dropDown = new DropDown(testElement);
			ddElement = document.querySelector('.dropDown');
			dropDown.hide();

			expect(ddElement.classList.contains('dropDown-hidden')).toBe(true);
		});

		it('should remove "-shown" modifier from the container', function() {
			var ddElement;

			dropDown = new DropDown(testElement);
			ddElement = document.querySelector('.dropDown');
			dropDown.hide();

			expect(ddElement.classList.contains('dropDown-shown')).toBe(false);
		});

		it('should fire E_HIDDEN', function() {
			var hiddenEventHandler = jasmine.createSpy('hiddenEventFired');

			dropDown = new DropDown(testElement);
			document.querySelector('.dropDown').addEventListener(DropDown.E_HIDDEN, hiddenEventHandler);

			dropDown.hide();
			expect(hiddenEventHandler).toHaveBeenCalled();
		});
	});

	describe('#isShown()', function() {
		it('should return correct state', function() {
			dropDown = new DropDown(testElement);

			expect(dropDown.isShown()).toBe(false);

			dropDown.show();

			expect(dropDown.isShown()).toBe(true);

			dropDown.hide();

			expect(dropDown.isShown()).toBe(false);
		});
	});

	describe('#setDataList()', function() {
		it('should create the same number of options as in data', function() {
			dropDown = new DropDown(testElement);
			dropDown.setDataList(data);

			expect(document.querySelectorAll('.dropDown--option').length).toEqual(data.length);

		});

		it('should work normally with empty list as data', function() {
			dropDown = new DropDown(testElement);
			dropDown.setDataList([]);

			expect(document.querySelectorAll('.dropDown--option').length).toEqual(0);
		});

		it('should pass data to data-attributes', function() {
			dropDown = new DropDown(testElement);
			dropDown.setDataList(data);

			var firstOption = document.querySelectorAll('.dropDown--option')[0];

			expect(firstOption.getAttribute('data-status')).toBe('not avail.');
			expect(firstOption.getAttribute('data-jolly-roger')).toBe('b');
			expect(firstOption.getAttribute('data-catwoman')).toBe('Meow!');
		});
	});

	describe('#setSelectedIndex()', function() {
		it('should add "-selected" modifier to the option of the index passed', function() {
			var options,
				selectedOptions;

			dropDown = new DropDown(testElement);
			dropDown.setDataList(data);
			dropDown.setSelectedIndex(1);

			options = document.querySelectorAll('.dropDown--option');
			selectedOptions = document.querySelectorAll('.dropDown--option-selected');

			expect(options[1].classList.contains('dropDown--option-selected')).toBe(true);
			expect(selectedOptions.length).toBe(1);
		});

		it('should work normally with index -1 passed', function() {
			var selectedOptions;

			dropDown = new DropDown(testElement);
			dropDown.setDataList(data);
			dropDown.setSelectedIndex(-1);

			selectedOptions = document.querySelectorAll('.dropDown--option-selected');

			expect(selectedOptions.length).toBe(0);
		});

		it('should work normally with index more than data.length passed', function() {
			var selectedOptions;

			dropDown = new DropDown(testElement);
			dropDown.setDataList(data);
			dropDown.setSelectedIndex(99);

			selectedOptions = document.querySelectorAll('.dropDown--option-selected');

			expect(selectedOptions.length).toBe(0);
		});
	});

	describe('#getSelectedIndex()', function() {
		it('should return selected index', function() {
			dropDown = new DropDown(testElement);
			dropDown.setDataList(data);

			expect(dropDown.getSelectedIndex()).toBe(0);

			dropDown.setSelectedIndex(1);

			expect(dropDown.getSelectedIndex()).toBe(1);
		});
	});

	describe('Constants', function() {
		it('should provide event names as public constants', function() {
			expect(DropDown.E_CHANGED).toBe('dropdown:changed');
			expect(DropDown.E_SHOWN).toBe('dropdown:shown');
			expect(DropDown.E_HIDDEN).toBe('dropdown:hidden');
			expect(DropDown.E_CREATED).toBe('dropdown:created');
		});
	});
});