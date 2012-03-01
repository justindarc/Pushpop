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
    
    $element.delegate('li', 'mousedown touchstart', function(evt) {
      _isMouseDown = (evt.type === 'mousedown' && !Modernizr.touch) || evt.type === 'touchstart';
      
      _$activeCellElement = $(this);
      
      if (_$activeCellElement.hasClass('pp-tableview-inline-text-input-cell') &&
          _$activeCellElement.children('input:first').is(':focus')) {
        _$activeCellElement = null;
        _isMouseDown = false;
        return;
      }
      
      _$activeCellLinkElement = _$activeCellElement.children('a:first');
      _$activeCellLinkElement.unbind('click', activeCellLinkClickHandler);
      
      var $editingAccessoryButtonElement = $('<div class="pp-tableview-editing-accessory-button"/>');
      _$activeCellElement.append($editingAccessoryButtonElement);
      
      var mouseX = (evt.type === 'touchstart') ? evt.originalEvent.targetTouches[0].pageX : evt.pageX;
      var mouseY = (evt.type === 'touchstart') ? evt.originalEvent.targetTouches[0].pageY : evt.pageY;
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
        $element.trigger(jQuery.Event(Pushpop.EventType.WillSelectCell, {
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
        $element.trigger(jQuery.Event(Pushpop.EventType.DidSelectCell, {
          cellElement: activeCellElement,
          $cellElement: _$activeCellElement,
          index: index
        }));
        
        if (_$activeCellElement.hasClass('pp-tableview-inline-text-input-cell')) _$activeCellElement.children('input:first').focus();
      } else {
        $element.trigger(jQuery.Event(Pushpop.EventType.AccessoryButtonTapped, {
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
      
      if ($cellElement.hasClass('pp-tableview-editing-accessory-delete')) {
        if ($cellElement.hasClass('pp-tableview-picker-value-cell')) {
          $cellElement.addClass('pp-tableview-editing-delete-confirmation');
          var value = $cellElement.data('value');
          var pickerCell = $cellElement.data('pickerCell');
          if (pickerCell) {
            $cellElement.slideUp(200, function() {
              var text = pickerCell.getTextByValue(value);
              var $cellElement = pickerCell.$element;
              var cellElement = $cellElement[0];
              
              pickerCell.removeValue(value);
              
              $element.trigger(jQuery.Event(Pushpop.EventType.DidRemoveValue, {
                cellElement: cellElement,
                $cellElement: $cellElement,
                value: value,
                text: text
              }));
              
              $element.trigger(jQuery.Event(Pushpop.EventType.DidChangeValue, {
                cellElement: cellElement,
                $cellElement: $cellElement,
                value: pickerCell.getValue()
              }));
            });
          }
        }
      }
    });
  };

  Pushpop.TableView.prototype = {
    element: null,
    $element: null,
    isEditing: false,
    getView: function() {
      return this.$element.parents('.pp-view:first').data('view');
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
    
    $tableViewElement.bind(Pushpop.EventType.DidSelectCell, function(evt) {
      var $cellElement = evt.$cellElement;
      var value = $cellElement.data('value');
      var text = self.getTextByValue(value);
      
      if (self.isMultiple) {
        self.setValue(value, true);
        $element.trigger(jQuery.Event(Pushpop.EventType.DidAddValue, {
          cellElement: element,
          $cellElement: $element,
          value: value,
          text: text
        }));
      } else {
        self.setValue(value);
      }
      
      $element.trigger(jQuery.Event(Pushpop.EventType.DidChangeValue, {
        cellElement: element,
        $cellElement: $element,
        value: self.getValue()
      }));
      
      viewStack.pop();
    });
  };

  Pushpop.TableViewPickerCell.prototype = {
    _value: null,
    element: null,
    $element: null,
    $selectedTextElement: null,
    view: null,
    tableView: null,
    isMultiple: false,
    getParentTableView: function() {
      return this.$element.parents('.pp-tableview:first').data('tableview');
    },
    getTextByValue: function(value) {
      return this.tableView.$element.children('[data-value="' + value + '"]:first').text();
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
        $tableViewElement.children('[data-value="' + value + '"]:first').addClass('pp-tableview-accessory-checkmark');
      } else {
        this._value = [value];
        $element.attr('data-value', this._value.join(',')).data('value', this._value);
        this.$selectedTextElement.html(text);
        
        $tableViewElement.children('.pp-tableview-accessory-checkmark').removeClass('pp-tableview-accessory-checkmark');
        $tableViewElement.children('[data-value="' + value + '"]:first').addClass('pp-tableview-accessory-checkmark');
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
        $tableViewElement.children('[data-value="' + value + '"]:first').removeClass('pp-tableview-accessory-checkmark');
        $element.prevAll('[data-value="' + value + '"]:first').remove();
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
    var $labelElement = $('<label class="pp-tableview-textarea-input-label">' + $element.children('label:first').text() + '</label>');
    var $textareaElement = this.$textareaElement = $element.children('textarea');
    var value = this._value = $textareaElement.val();
    $textareaElement.addClass('pp-tableview-textarea-input');
    $viewElement.append($labelElement).append($textareaElement);

    var $textElement = this.$textElement = $('<span/>').appendTo($element);
    var $doneButtonElement = this.$doneButtonElement = $('<a class="pp-tableview-textarea-input-done-button" href="#">Done</a>');
    $viewElement.append($doneButtonElement);

    $doneButtonElement.bind('click', function(evt) {
      var value = $textareaElement.val();
      
      if (value !== self.getValue()) {
        self.setValue($textareaElement.val());
      
        $element.trigger(jQuery.Event(Pushpop.EventType.DidChangeValue, {
          cellElement: element,
          $cellElement: $element,
          value: value
        }));
      }
      
      viewStack.pop();
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
      return this.$element.parents('.pp-tableview:first').data('tableview');
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
})();

$(function() {
  var $tableviews = $('.pp-tableview');
  $tableviews.each(function(index, element) {
    new Pushpop.TableView(element);
  });
});

