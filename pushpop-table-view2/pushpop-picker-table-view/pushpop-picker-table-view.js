;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new PickerTableView.
  @param {HTMLDivElement} element The <div/> element to initialize as a new ModalViewStack.
  @constructor
*/
Pushpop.PickerTableView = function PickerTableView(element) {
  
  // Call the "super" constructor.
  Pushpop.TableView.prototype.constructor.apply(this, arguments);
  
  var $element = this.$element;
};

// Create the prototype for the Pushpop.PickerTableView as a "sub-class" of Pushpop.TableView.
Pushpop.PickerTableView.prototype = new Pushpop.TableView();
Pushpop.PickerTableView.prototype.constructor = Pushpop.PickerTableView;

$(function() {
  $('.pp-picker-table-view').each(function(index, element) { new Pushpop.PickerTableView(element); });
});
