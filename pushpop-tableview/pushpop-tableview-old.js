'use strict';

if (!window['Pushpop']) window.Pushpop = {};

Pushpop.TableView = function(element) {
  var $element = $(element);
  var $body = $(document.body);
  
  if ($element.size() === 1) {
    $element.data('tableview', this);
    
    // Required to enable :active pseudo-state to occur.
    $element.bind('touchstart', function() {});
    
    // Set up picker cells.
    $element.children('li.picker-cell').each(function(index, element) {
      var $element = $(element);
      var $pickerTableView = $element.children('ul.tableview:first');
      
      if ($pickerTableView.size() !== 1) return;
      
      var $input = $element.children('input[type="hidden"]:first');
      var value = $input.val();
      
      var $selectedCell = $pickerTableView.children('li[data-value="' + value + '"]:first');
      
      if ($selectedCell.size() === 0) {
        $selectedCell = $pickerTableView.children('li:contains("' + value + '")');
      }
      
      $selectedCell.addClass('checkmark');
      
      var text = ($selectedCell.size() > 0) ? $selectedCell.text() : '(None)';
      var $span = $('<span>' + text + '</span>');
      
      $element.append($span).append($input);
      
      var $view = $('<div class="view"/>').append($pickerTableView);
      
      $body.append($view);
      
      $pickerTableView.delegate('li', 'click', function(evt) {
        var $this = $(this);
        
        if ($this.hasClass('header')) return;
        
        var text = $this.text();
        var value = $this.attr('data-value') || text;
        
        $pickerTableView.find('li.checkmark').removeClass('checkmark');
        $this.addClass('checkmark');
      
        $span.html(text);
        $input.val(value);
        
        Pushpop.pop();
      });
      
      $element.data('picker-view', new Pushpop.View($view));
      $element.data('picker-selection', $span.get(0));
    });
    
    $element.delegate('li.picker-cell', 'click', function(evt) {
      var $this = $(this);
      var pickerView = $this.data('picker-view');
      
      Pushpop.push(pickerView, 'slideHorizontal');
    });
    
    // Set up text input cells.
    $element.children('li.text-input-cell').each(function(index, element) {
      var $element = $(element);
      var $input = $element.children('input[type="text"],textArea:first');
      
      if ($input.size() !== 1) return;
      
      var value = $input.val();
      var $span = $('<span>' + value + '</span>');
      
      $element.append($span);
      
      var $doneButton = $('<a class="btn" href="#">Done</a>');
      var $view = $('<div class="view"/>').append($input).append($doneButton);
      
      $body.append($view);
      
      $doneButton.bind('click', function(evt) {
        var $this = $(this);
        
        if ($this.hasClass('header')) return;
        
        var text = $input.val();
        var value = $this.attr('data-value') || text;
      
        $span.html(text);
        $input.val(value);
        
        Pushpop.pop();
      });
      
      $element.data('text-input-view', new Pushpop.View($view));
      $element.data('text-input-selection', $span.get(0));
    });
    
    $element.delegate('li.text-input-cell', 'click', function(evt) {
      var $this = $(this);
      var inputView = $this.data('text-input-view');
      
      Pushpop.push(inputView, 'slideHorizontal');
    });
    
    // Set up picker Adder cells.
    $element.children('li.picker-adder-cell').each(function(index, element) {
      var $element = $(element);
      var $pickerAdderTableView = $element.children('ul.tableview:first');
      
      if ($pickerAdderTableView.size() !== 1) return;
      
      var $input = $element.children('input[type="hidden"]:first');
      var value = $input.val();
      
      var $selectedCell = $pickerAdderTableView.children('li[data-value="' + value + '"]:first');
      
      if ($selectedCell.size() === 0) {
        $selectedCell = $pickerAdderTableView.children('li:contains("' + value + '")');
      }
      
      var text = ($selectedCell.size() > 0) ? $selectedCell.text() : '';
      var $span = $('<span>' + text + '</span>');
      
      var $view = $('<div class="view"/>').append($pickerAdderTableView);
      
      $body.append($view);
      
      $pickerAdderTableView.delegate('li', 'click', function(evt) {
        var $this = $(this);
        var $input = $element.children('input[type= "hidden"]:first');
        var inputData = $input.val();
        var values = inputData.split(',');
        var isDuplicate = false;
           
        if ($this.hasClass('header')) return;
        
        var text = $this.text();
        var value = $this.attr('data-value') || text;
           
        for (var i = 0; i < values.length; i++) {
          if (values[i] === value) {
            isDuplicate = true;
            break;
          }
        }
        
        if (!isDuplicate) {     
          $('li.picker-adder-cell').before('<li class= delete-button>' + value + '</li>');
        }
              
        $span.html(text);
        $input.val(value);
        
        Pushpop.pop();
      });
      
      $element.data('picker-adder-view', new Pushpop.View($view));
      $element.data('picker-adder-selection', $span.get(0));
    });
    
    $element.delegate('li.picker-adder-cell', 'click', function(evt) {
      var $this = $(this);
      var pickerAdderView = $this.data('picker-adder-view');
      
      Pushpop.push(pickerAdderView, 'slideHorizontal');
    });
    
    this.element = $element.get(0);
  }
};

Pushpop.TableView.prototype = {
  element: null,
  $element: null
};

$(function() {
  $('.tableview').each(function(index, element) {
    var tableView = new Pushpop.TableView(element);
  });
});
