'use strict';

if (!window['Pushpop']) window.Pushpop = {};

(function() {
  var kMaximumTapArea = 5;
  
  var _$window = $(window['addEventListener'] ? window : document.body);
  var _lastPickerViewId = 0;
  var _lastTextareaInputViewId = 0;
  
  if (!Pushpop['EventType']) Pushpop.EventType = {};
  $.extend(Pushpop.EventType, {
    WillSelectCell: 'Pushpop:WillSelectCell',
    DidSelectCell: 'Pushpop:DidSelectCell',
    DidAddValue: 'Pushpop:DidAddValue',
    DidRemoveValue: 'Pushpop:DidRemoveValue',
    DidChangeValue: 'Pushpop:DidChangeValue',
    AccessoryButtonTapped: 'Pushpop:AccessoryButtonTapped'
  });
  
  Pushpop.TableView = function(element) {
    var _$activeCellElement = null;
    var _$activeCellLinkElement = null;
    var _isMouseDown = false;
    var _isAccessoryButtonPressed = false;
    var _isEditingAccessoryButtonPressed = false;
    
    var $element = this.$element = $(element);
    
    var tableview = $element.data('tableview');
    if (tableview) return tableview;
    
    $element.data('tableview', this);
    
    element = this.element = $element[0];
    
    var $pickerCells = $element.children('.pp-tableview-picker-cell');
    $pickerCells.each(function(index, element) { new Pushpop.TableViewPickerCell(element); });
    
    var $textareaInputCells = $element.children('.pp-tableview-textarea-input-cell');
    $textareaInputCells.each(function(index, element) { new Pushpop.TableViewTextareaInputCell(element); });
    
    var activeCellLinkClickHandler = function(evt) {
      $(this).unbind(evt);
      evt.stopImmediatePropagation();
      evt.preventDefault();
    };
    
    $element.delegate('li > a.pp-tableview-accessory-detail-disclosure-button, li > a.pp-button', 'mousedown touchstart', function(evt) {
      evt.stopPropagation();
    });
    
    $element.delegate('li', 'mousedown touchstart', function(evt) {
      _isMouseDown = (evt.type === 'mousedown' && !Modernizr.touch) || evt.type === 'touchstart';
      
      _$activeCellElement = $(this);
      
      if (_$activeCellElement.hasClass('pp-tableview-inline-text-input-cell') &&
          _$activeCellElement.children('input').first().is(':focus')) {
        _$activeCellElement = null;
        _isMouseDown = false;
        return;
      }
      
      _$activeCellLinkElement = _$activeCellElement.children('a:first-child');
      _$activeCellLinkElement.unbind('click', activeCellLinkClickHandler);
      
      var $editingAccessoryButtonElement = $('<div class="pp-tableview-editing-accessory-button"/>');
      _$activeCellElement.append($editingAccessoryButtonElement);
      
      var mouseX, mouseY;
      
      if (evt.type === 'touchstart') {
        var targetTouches = evt.targetTouches || evt.originalEvent.targetTouches;
        
        mouseX = targetTouches[0].pageX;
        mouseY = targetTouches[0].pageY;
      } else {
        mouseX = evt.pageX;
        mouseY = evt.pageY;
      }
      
      var editingAccessoryOffset = $editingAccessoryButtonElement.offset();
      var editingAccessoryWidth = $editingAccessoryButtonElement.width();
      var editingAccessoryHeight = $editingAccessoryButtonElement.height();
      
      _isEditingAccessoryButtonPressed = (
        (mouseX >= editingAccessoryOffset.left && mouseX <= editingAccessoryOffset.left + editingAccessoryWidth) &&
        (mouseY >= editingAccessoryOffset.top  && mouseY <= editingAccessoryOffset.top  + editingAccessoryHeight)
      );
      
      $editingAccessoryButtonElement.remove();
      
      if (_isMouseDown) {
        if (!_isAccessoryButtonPressed && !_isEditingAccessoryButtonPressed) _$activeCellElement.addClass('active');
      } else {      
        _$activeCellLinkElement.bind('click', activeCellLinkClickHandler);
      }
    });
    
    _$window.bind('mousemove touchmove', function(evt) {
      if (!_isMouseDown) return;
      
      _$activeCellLinkElement.unbind('click', activeCellLinkClickHandler);
      _$activeCellLinkElement.bind('click', activeCellLinkClickHandler);
      
      _$activeCellElement.removeClass('active');
      
      _$activeCellElement = null;
      _$activeCellLinkElement = null;
      _isMouseDown = false;
      _isAccessoryButtonPressed = false;
      _isEditingAccessoryButtonPressed = false;
    });
    
    _$window.bind('mouseup touchend', function(evt) {
      if (!_isMouseDown) return;
      
      var index = _$activeCellElement.index();
      var activeCellElement = _$activeCellElement[0];
      
      if (!_isAccessoryButtonPressed && !_isEditingAccessoryButtonPressed) {
        $element.trigger($.Event(Pushpop.EventType.WillSelectCell, {
          cellElement: activeCellElement,
          $cellElement: _$activeCellElement,
          index: index
        }));
      }
      
      if (evt.type === 'touchend') {
        _$activeCellLinkElement.unbind('click', activeCellLinkClickHandler);
        _$activeCellLinkElement.trigger('click');
      }
      
      if (!_isAccessoryButtonPressed && !_isEditingAccessoryButtonPressed) {
        $element.trigger($.Event(Pushpop.EventType.DidSelectCell, {
          cellElement: activeCellElement,
          $cellElement: _$activeCellElement,
          index: index
        }));
        
        if (_$activeCellElement.hasClass('pp-tableview-inline-text-input-cell')) _$activeCellElement.children('input').first().focus();
      } else {
        $element.trigger($.Event(Pushpop.EventType.AccessoryButtonTapped, {
          cellElement: activeCellElement,
          $cellElement: _$activeCellElement,
          index: index
        }));
      }
      
      _$activeCellElement.removeClass('active');
      
      _$activeCellElement = null;
      _$activeCellLinkElement = null;
      _isMouseDown = false;
      _isAccessoryButtonPressed = false;
      _isEditingAccessoryButtonPressed = false;
    });
    
    $element.bind(Pushpop.EventType.DidSelectCell, function(evt) {
      var $cellElement = evt.$cellElement;
      
      if ($cellElement.hasClass('pp-tableview-picker-cell')) {
        var pickerCell = $cellElement.data('pickerCell');
        if (pickerCell) pickerCell.show();
      }
      
      else if ($cellElement.hasClass('pp-tableview-textarea-input-cell')) {
        var textareaInputCell = $cellElement.data('textareaInputCell');
        if (textareaInputCell) textareaInputCell.show();
      }
    });
    
    $element.bind(Pushpop.EventType.AccessoryButtonTapped, function(evt) {
      var $cellElement = evt.$cellElement;
      
      if ($cellElement.hasClass('pp-tableview-editing-accessory-insert')) {
        if ($cellElement.hasClass('pp-tableview-picker-cell')) {
          var pickerCell = $cellElement.data('pickerCell');
          if (pickerCell) pickerCell.show();
        }
      } else if ($cellElement.hasClass('pp-tableview-editing-accessory-delete')) {
        if ($cellElement.hasClass('pp-tableview-picker-value-cell')) {
          if ($cellElement.hasClass('pp-tableview-editing-delete-confirmation')) return;
          
          $cellElement.addClass('pp-tableview-editing-delete-confirmation');
          
          var $deleteButtonContainer = $cellElement.children('div.delete-button-container');
          
          // Do we need to add a delete button to this li element?
          if ($deleteButtonContainer.length === 0) {
            // Add a delete button on the right side
            $deleteButtonContainer = $('<div class="delete-button-container"><a class="pp-button pp-delete-button">Delete</a></div>');
            $cellElement.append($deleteButtonContainer);
            // Force a reflow before adding the 'show-delete-button' class below so the transition will always occur
            $cellElement[0].offsetWidth;
          }
          
          $deleteButtonContainer.addClass('show-delete-button');
          
          // Bind to the mousedown of the delete button
          $deleteButtonContainer.children('a.pp-delete-button').one('mousedown touchstart', function(evt) {
            var value = $cellElement.data('value');
            var pickerCell = $cellElement.data('pickerCell');
            if (pickerCell) {
              $cellElement.slideUp(200, function() {
                var text = pickerCell.getTextByValue(value);
                var $cellElement = pickerCell.$element;
                var cellElement = $cellElement[0];

                pickerCell.removeValue(value);

                $element.trigger($.Event(Pushpop.EventType.DidRemoveValue, {
                  cellElement: cellElement,
                  $cellElement: $cellElement,
                  value: value,
                  text: text
                }));

                $element.trigger($.Event(Pushpop.EventType.DidChangeValue, {
                  cellElement: cellElement,
                  $cellElement: $cellElement,
                  value: pickerCell.getValue()
                }));
              });
            }
            
            evt.preventDefault();
            evt.stopImmediatePropagation();
          });
          
          // Bind to the body's mousedown event to hide the delete button
          $('body').bind('mousedown.cancelDelete touchstart.cancelDelete', function(evt) {
            if (evt.target !== $cellElement[0]) {
              $(this).unbind(evt);
              // Hide the delete button on right and rotate the delete icon on 
              // left back to its original state
              $deleteButtonContainer.removeClass('show-delete-button');
              $cellElement.removeClass('pp-tableview-editing-delete-confirmation');
            }
          });
          
        }
      }
    });
  };

  Pushpop.TableView.prototype = {
    element: null,
    $element: null,
    isEditing: false,
    getView: function() {
      var parent = this.$element.parents('.pp-view').first()[0];
      return (parent ? parent.view : null);
    }
  };

  Pushpop.TableViewPickerCell = function(element) {
    var $element = this.$element = $(element);
		
    var pickerCell = $element.data('pickerCell');
    if (pickerCell) return pickerCell;
  
    $element.data('pickerCell', this);
    
    element = this.element = $element[0];
    
    var self = this;
    
    var isMultiple = this.isMultiple = $element.data('multiple') ? true : false;
    if (isMultiple) $element.addClass('pp-tableview-editing-cell pp-tableview-editing-accessory-insert');
    
    var viewStack = this.getParentTableView().getView().getViewStack();
    var $viewElement = $('<div class="pp-view sk-scroll-view" id="pp-tableview-picker-view-' + (++_lastPickerViewId) + '"/>');
    viewStack.$element.append($viewElement);
    
    var scrollView = new SKScrollView($viewElement);
    var $scrollViewContentElement = scrollView.content.$element;
    var view = this.view = new Pushpop.View($viewElement);
    var $tableViewElement = $element.children('.pp-tableview');
    var tableView = this.tableView = new Pushpop.TableView($tableViewElement);
    $scrollViewContentElement.append($tableViewElement);
    
    var $selectedTextElement = this.$selectedTextElement = $('<span/>').appendTo($element);
    var values = (($element.data('value') || '') + '');
    values = (values) ? values.split(',') : [];
    
    this._value = [];
    
    if (isMultiple) {
      for (var i = 0, length = values.length; i < length; i++) this.setValue(values[i]);
    } else {
      if (values.length > 0) this.setValue(values[0]);
    }

		// This string is used to store the value of each item that is selected as the user
		//   is drilling down through the layers of the tableview data.
		var valueHierarchy = '';

		var callbackForDidSelectCell = function(evt) {
      var $cellElement = evt.$cellElement;
		  // Check if the cell was disabled.  If so, return.
		  if ($cellElement.hasClass('pp-tableview-cell-disabled')) return;
		  
      var value = $cellElement.data('value');
			// Is value an array?
			if ($.isArray(value)) {
				// Add the id of the item to the value hierarchy
				valueHierarchy += (valueHierarchy.length > 0 ? self.valuesDelimiter : '') + $cellElement.data('id');
				// Create a new pp-tableview with the choices being the values in this array
				var $viewElement = $('<div class="pp-view sk-scroll-view temp-view" id="pp-tableview-picker-view-' + (++_lastPickerViewId) + '"/>');
				// Append the new tableview to the viewstack
		    viewStack.$element.append($viewElement);
				// Give the new tableview a scrollview
				var scrollView = new SKScrollView($viewElement);
		    var $scrollViewContentElement = scrollView.content.$element;
				var view = new Pushpop.View($viewElement);
				// Make a new ul for the items
				var $ul = $('<ul class="pp-tableview" />');
				// Add the header item.  Give it the same text as the previous view
				$ul.append('<li class="header">' + $cellElement.siblings(':first-child').html() + '</li>')
				// Add the root level items. Note: we only add the root level items 
				// so we don't load the dom with too many elements
				for (var i = 0, length = value.length; i < length; i++) {
					// Create a new list item for this item
					var $li = $('<li data-id="' + value[i].id + '">' + value[i].title + '</li>');
					
					// If this value is not an array, check to see if it is already selected
					if (!$.isArray(value[i].value) && (self._value.indexOf(valueHierarchy + self.valuesDelimiter + value[i].value) > -1)) {
						$li.addClass('pp-tableview-accessory-checkmark pp-tableview-cell-disabled');
					}
					
					$li.data('value', value[i].value);
					
					// Append the list item to the list
					$ul.append($li);
				}
				
				var tableView = new Pushpop.TableView($ul);
		
				// Append the list to the scrollViewContentElement
				$scrollViewContentElement.append($ul);
				
				// Bind the DidSelectCell event for this tableViewElement
				$ul.bind(Pushpop.EventType.DidSelectCell, callbackForDidSelectCell);
				
				// Push the table view
				viewStack.push(view);
			} else {
				// Add this value to the value hierarchy
				valueHierarchy += (valueHierarchy.length > 0 ? self.valuesDelimiter : '') + value;
				
      	var text = self.getTextByValue(valueHierarchy);
      
	      if (self.isMultiple) {
	        self.setValue(valueHierarchy, true);
	        $element.trigger($.Event(Pushpop.EventType.DidAddValue, {
	          cellElement: element,
	          $cellElement: $element,
	          value: valueHierarchy,
	          text: text
	        }));
	      } else {
	        self.setValue(valueHierarchy);
	      }
      
	      $element.trigger($.Event(Pushpop.EventType.DidChangeValue, {
	        cellElement: element,
	        $cellElement: $element,
	        value: self.getValue()
	      }));
	
				// Clear the value hierarchy for next time
				valueHierarchy = ''
      
				// After popping the parent view, remove all temporary views from the dom
	      viewStack.pop(self.getParentTableView().getView(), function() { $('.temp-view').remove(); });
			}
    };
    
    $tableViewElement.bind(Pushpop.EventType.DidSelectCell, callbackForDidSelectCell);
  };

  Pushpop.TableViewPickerCell.prototype = {
    _value: null,
		_dataSource: null,
    element: null,
    $element: null,
    $selectedTextElement: null,
    view: null,
    tableView: null,
    isMultiple: false,
		valuesDelimiter: '-',
		displayTextProperty: 'title',
    getParentTableView: function() {
      return this.$element.parents('.pp-tableview').first().data('tableview');
    },
    getTextByValue: function(value) {
      // Does this picker cell have a datasource?
			if (this.getDataSource()) {
			  var item = this.getDataSourceItemByValue(value);
			  return (item ? item[this.displayTextProperty] : '');
			} 
			// There's no need to drill down through the data
			else return this.tableView.$element.children('[data-value="' + value + '"]').first().text();
    },
    getDataSourceItemByValue: function(value) {
      var valuesArray = [value];
      // Do we need to drill down?
      if (('' + value).indexOf(this.valuesDelimiter) > -1) {
        valuesArray = value.split(this.valuesDelimiter);
      }
			  
			return this.getDataSourceItemByValueRecursively(valuesArray, this.getDataSource());
	    
    },
		// Recursive method to drill down through the data (if necessary), 
		// and return the object with the specified value
		getDataSourceItemByValueRecursively: function(valuesArray, arrayOfItems) {
			// Get the first value in the array. Then remove it from the list
			var valueToSearchFor = valuesArray[0];
			valuesArray.splice(0, 1);
			
			// If this is not the last level, then we are need to search on the id property of the item,
			//   otherwise, we need to search on the value property of the item.
			var propertyToSearch = (valuesArray.length > 0 ? 'id' : 'value');

			// Loop through arrayOfItems and find the item with the right value
			for(var i = 0, length = arrayOfItems.length; i < length; i++) {
				if (arrayOfItems[i][propertyToSearch] == valueToSearchFor) {
					// Are there more levels to drill down to?
					if (valuesArray.length > 0) return this.getDataSourceItemByValueRecursively(valuesArray, arrayOfItems[i].value);
					// This is the last level, so return the text
					else return arrayOfItems[i];
				}
			}
		},
    getValue: function() {
      return this._value;
    },
    setValue: function(value) {
      var element = this.element;
      var $element = this.$element;
      var $tableViewElement = this.tableView.$element;
      var isMultiple = this.isMultiple;
      var text = this.getTextByValue(value);
      
      if (isMultiple) {
        for (var i = 0, length = this._value.length; i < length; i++) if (this._value[i] == value) return;
        
        this._value.push(value);
        $element.attr('data-value', this._value.join(',')).data('value', this._value);
        this.$selectedTextElement.html(null);
        
        var $valueCellElement = $('<li class="pp-tableview-picker-value-cell pp-tableview-editing-cell pp-tableview-editing-accessory-delete" data-value="' + value + '">' + text + '</li>');
        $valueCellElement.data('pickerCell', this);
        $element.before($valueCellElement);
        $tableViewElement.children('[data-value="' + value + '"]').first().addClass('pp-tableview-accessory-checkmark pp-tableview-cell-disabled');
      } else {
        this._value = [value];
        $element.attr('data-value', this._value.join(',')).data('value', this._value);
        this.$selectedTextElement.html(text);
        
        $tableViewElement.children('.pp-tableview-accessory-checkmark').removeClass('pp-tableview-accessory-checkmark pp-tableview-cell-disabled');
        $tableViewElement.children('[data-value="' + value + '"]').first().addClass('pp-tableview-accessory-checkmark pp-tableview-cell-disabled');
      }
    },
    getDataSource: function() {
			return this._dataSource;
		},
		setDataSource: function(value) {
			this._dataSource = value;
			
			// Get the existing tableview that holds the available choices
			var $ul = this.tableView.$element;
			
			// Clear any existing items (except the header)
			$ul.children('not(:first-child)').remove();
			
			// Add the root level items. Note: we only add the root level items 
			// so we don't load the dom with too many elements
			for (var i = 0, length = value.length; i < length; i++) {
				// Create a new list item for this item
				var $li = $('<li data-id="' + value[i].id + '">' + value[i].title + '</li>');
				// Set the items value.  This could be a simple type (int or string) or an array of objects.
				if ($.isArray(value[i].value)) {
					$li.data('value', value[i].value);
				} else {
					// Set the "data-value" attribute, because there is some code looking at this attribute to 
					//   get the text and to add the checkmark to the item, rather than using the .data() method.
					$li.attr('data-value', value[i].value);
				}
				
				// Append the list item to the list
				$ul.append($li);
			}			
		},
		removeValue: function(value) {
      var element = this.element;
      var $element = this.$element;
      var isMultiple = this.isMultiple;
      var text = this.getTextByValue(value);
      
      if (isMultiple) {
        var index;
        
        for (var i = 0, length = this._value.length; i < length; i++) {
          if (this._value[i] == value) {
            index = i;
            break;
          }
        }
        
        if (index === undefined) return;
        
        this._value.splice(index, 1);
        
        var $tableViewElement = this.tableView.$element;
        $tableViewElement.children('[data-value="' + value + '"]').first().removeClass('pp-tableview-accessory-checkmark pp-tableview-cell-disabled');
        $element.prevAll('[data-value="' + value + '"]').first().remove();
      } else {
        this._value = [];
      }
      
      $element.attr('data-value', this._value.join(',')).data('value', this._value);
      this.$selectedTextElement.html(null);
    },
    removeAll: function() {
      var i, length, values = [];
      
      for (i = 0, length = this._value.length; i < length; i++) values.push(this._value[i]);
      for (i = 0, length = values.length; i < length; i++) this.removeValue(values[i]);
    },
    show: function() {
      var view = this.view;
      var viewStack = view.getViewStack();
      
      viewStack.push(view);
    }
  };
  
  Pushpop.TableViewTextareaInputCell = function(element) {
    var $element = this.$element = $(element);

    var textareaInputCell = $element.data('textareaInputCell');
    if (textareaInputCell) return textareaInputCell;

    $element.data('textareaInputCell', this);

    element = this.element = $element[0];
    
    var self = this;
    var viewStack = this.getParentTableView().getView().getViewStack();
    var $viewElement = $('<div class="pp-view" id="pp-tableview-textarea-input-view-' + (++_lastTextareaInputViewId) + '"/>');
    viewStack.$element.append($viewElement);

    var view = this.view = new Pushpop.View($viewElement);
    var $labelElement = $('<label class="pp-tableview-textarea-input-label">' + $element.children('label:first-child').text() + '</label>');
    var $textareaElement = this.$textareaElement = $element.children('textarea');
    var value = this._value = $textareaElement.val();
    $textareaElement.addClass('pp-tableview-textarea-input');
    $viewElement.append($labelElement).append($textareaElement);

    var $textElement = this.$textElement = $('<span/>').appendTo($element);
    var $doneButtonElement = this.$doneButtonElement = $('<a class="pp-button" href="#">Done</a>');
    var $cancelButtonElement = this.$cancelButtonElement = $('<a class="pp-button pp-cancel-button" href="#">Cancel</a>');
		var $buttonContainer = $('<div class="pp-tableview-textarea-input-buttons" />');
		$buttonContainer.append($doneButtonElement).append($cancelButtonElement);
		$viewElement.append($buttonContainer);

    $doneButtonElement.bind('click', function(evt) {
      var value = $textareaElement.val();
      
      if (value !== self.getValue()) {
        self.setValue($textareaElement.val());
      
        $element.trigger($.Event(Pushpop.EventType.DidChangeValue, {
          cellElement: element,
          $cellElement: $element,
          value: value
        }));
      }
      
      viewStack.pop();
			evt.preventDefault();
    });

		$cancelButtonElement.bind('click', function(evt) {
			// Set text back to the original value
			$textareaElement.val(self.getValue());
			
      viewStack.pop();
			evt.preventDefault();
    });
  };

  Pushpop.TableViewTextareaInputCell.prototype = {
    _value: null,
    element: null,
    $element: null,
    $textElement: null,
    $textareaElement: null,
    $doneButtonElement: null,
    view: null,
    getParentTableView: function() {
      return this.$element.parents('.pp-tableview').first().data('tableview');
    },
    getValue: function() {
      return this._value;
    },
    setValue: function(value) {
      if (value === this._value) return;
      
      this.$textareaElement.val(value);
      this.$textElement.html(value);
      this._value = value
    },
    show: function() {
      var view = this.view;
      var viewStack = view.getViewStack();

      viewStack.push(view);
    }
  };
  
  Pushpop.TableViewIndex = function(element) {
    var $element = this.$element = $(element);

    var tableviewIndex = $element.data('tableviewIndex');
    if (tableviewIndex) return tableviewIndex;

    $element.data('tableviewIndex', this);

    element = this.element = $element[0];
    
    // Move the TableViewIndex outside of the ScrollView.
    var $parent = $element.parent();
    if ($parent.hasClass('sk-scroll-content')) $parent.parent().append($element);
    
    var self = this;
    
    $(window).bind('resize', function() {
      self.draw();
    });
    
    this.draw();
  };
  
  Pushpop.TableViewIndex.prototype = {
    element: null,
    $element: null,
    draw: function() {
      var $element = this.$element;
      var height = $element.height();
      var lineHeight = height / 28;
      var lineHeightInteger = Math.floor(lineHeight);
      var lineHeightPixels = lineHeightInteger + 'px';
      var lineHeightRemainder = (lineHeight - lineHeightInteger) * 28;

      $element.css({
        'margin-top': (lineHeightRemainder / 2) + 'px',
        'font-size': lineHeightPixels,
        'line-height': lineHeightPixels
      });
    }
  };
})();

$(function() {
  var $tableviews = $('.pp-tableview');
  $tableviews.each(function(index, element) {
    new Pushpop.TableView(element);
  });
  
  var $tableviewIndexes = $('.pp-tableview-index');
  $tableviewIndexes.each(function(index, element) {
    new Pushpop.TableViewIndex(element);
  });
});

