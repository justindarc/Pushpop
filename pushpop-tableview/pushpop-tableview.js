'use strict';

if (!window['Pushpop']) window.Pushpop = {};

(function() {
  var kMaximumTapArea = 5;
  
  var _$window = $(window['addEventListener'] ? window : document.body);
  var _lastPickerViewId = 0;
  
  if (!Pushpop['EventType']) Pushpop.EventType = {};
  $.extend(Pushpop.EventType, {
    WillSelectCell: 'Pushpop:WillSelectCell',
    DidSelectCell: 'Pushpop:DidSelectCell'
  });
  
  Pushpop.TableView = function(element) {
    var _$activeCellElement = null;
    var _$activeCellLinkElement = null;
    var _isMouseDown = false;
    
    var $element = this.$element = $(element);
  
    var tableview = $element.data('tableview');
    if (tableview) return tableview;
  
    $element.data('tableview', this);
  
    element = this.element = $element[0];
  
    var $pickerCells = $element.children('.pp-tableview-picker-cell');
    $pickerCells.each(function(index, element) {
      new Pushpop.TableViewPickerCell(element);
    });
  
    var activeCellLinkClickHandler = function(evt) {
      $(this).unbind(evt);
      evt.stopImmediatePropagation();
      evt.preventDefault();
    };
  
    $element.delegate('li', 'mousedown touchstart', function(evt) {
      _isMouseDown = (evt.type === 'mousedown' && !Modernizr.touch) || evt.type === 'touchstart';
    
      _$activeCellElement = $(this);
      _$activeCellLinkElement = _$activeCellElement.children('a:first');
    
      _$activeCellLinkElement.unbind('click', activeCellLinkClickHandler);
    
      if (_isMouseDown) {
        _$activeCellElement.addClass('active');
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
    });
  
    _$window.bind('mouseup touchend', function(evt) {
      if (!_isMouseDown) return;
      
      var index = _$activeCellElement.index();
      var activeCellElement = _$activeCellElement[0];
      
      $element.trigger(jQuery.Event(Pushpop.EventType.WillSelectCell, {
        cellElement: activeCellElement,
        $cellElement: _$activeCellElement,
        index: index
      }));
      
      if (evt.type === 'touchend') {
        _$activeCellLinkElement.unbind('click', activeCellLinkClickHandler);
        _$activeCellLinkElement.trigger('click');
      }
    
      var pickerCell = _$activeCellElement.data('pickerCell');
      if (pickerCell) pickerCell.show();
      
      $element.trigger(jQuery.Event(Pushpop.EventType.DidSelectCell, {
        cellElement: activeCellElement,
        $cellElement: _$activeCellElement,
        index: index
      }));
      
      _$activeCellElement.removeClass('active');
      _$activeCellElement = null;
      _$activeCellLinkElement = null;
      _isMouseDown = false;
    });
  };

  Pushpop.TableView.prototype = {
    element: null,
    $element: null,
    getView: function() {
      return this.$element.parents('.pp-view:first').data('view');
    }
  };

  Pushpop.TableViewPickerCell = function(element) {
    var _isMouseDown = false;
    
    var $element = this.$element = $(element);
  
    var pickerCell = $element.data('pickerCell');
    if (pickerCell) return pickerCell;
  
    $element.data('pickerCell', this);
    
    element = this.element = $element[0];
    
    var self = this;
    var viewStack = this.getParentTableView().getView().getViewStack();
    var $viewElement = $('<div class="pp-view sk-scroll-view" id="pp-tableview-picker-view-' + (++_lastPickerViewId) + '"/>');
    viewStack.$element.append($viewElement);
    
    var scrollView = new SKScrollView($viewElement);
    var $scrollViewContentElement = scrollView.content.$element;
    var view = this.view = new Pushpop.View($viewElement);
    var $tableViewElement = $element.children('.pp-tableview');
    var tableView = this.tableView = new Pushpop.TableView($tableViewElement);
    $scrollViewContentElement.append($tableViewElement);
    
    var value = this._value = $element.data('value');
    var text = this._text = $element.data('text');
    var $selectedTextElement = this.$selectedTextElement = $('<span/>').appendTo($element);
    
    this.setValue(value, text);
    
    $tableViewElement.bind(Pushpop.EventType.DidSelectCell, function(evt) {
      var $oldSelectedCellElements = $tableViewElement.children('.checkmark');
      var $cellElement = evt.$cellElement;
      var value = $cellElement.data('value');
      var text = $cellElement.text();
      
      self.setValue(value, text);
      
      viewStack.pop();
    });
  };

  Pushpop.TableViewPickerCell.prototype = {
    _value: null,
    _text: null,
    element: null,
    $element: null,
    $selectedTextElement: null,
    view: null,
    tableView: null,
    getParentTableView: function() {
      return this.$element.parents('.pp-tableview:first').data('tableview');
    },
    getText: function() {
      return this._text;
    },
    getValue: function() {
      return this._value;
    },
    setValue: function(value, text) {
      this._value = value;
      this._text = text;
      this.$element.attr('data-value', value).data('value', value);
      this.$element.attr('data-text', text).data('text', text);
      this.$selectedTextElement.html(text);
      
      var $tableViewElement = this.tableView.$element;
      $tableViewElement.children('.checkmark').removeClass('checkmark');
      $tableViewElement.children('[data-value="' + value + '"]:first').addClass('checkmark');
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
