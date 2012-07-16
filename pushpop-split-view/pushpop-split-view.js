;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new SplitView.
  @param {HTMLDivElement} element The DIV element to initialize as a new SplitView.
  @constructor
*/
Pushpop.SplitView = function SplitView(element) {
  
  // Call the "super" constructor.
  Pushpop.View.prototype.constructor.apply(this, arguments);
  
  this.$element.addClass('pp-view');
  
  // TODO: Implement responsive design and auto-collapse the split view into a
  // single view stack on a mobile phone.
};

// Create the prototype for the Pushpop.SplitView as a "sub-class" of Pushpop.View.
Pushpop.SplitView.prototype = new Pushpop.View();
Pushpop.SplitView.prototype.constructor = Pushpop.SplitView;

Pushpop.SplitView.prototype.getMasterViewStack = function() {
  return this.$element.children('.pp-split-view-stack-master')[0].viewStack;
};

Pushpop.SplitView.prototype.getDetailViewStack = function() {
  return this.$element.children('.pp-split-view-stack-detail')[0].viewStack;
};

$(function() { $('.pp-split-view').each(function(index, element) { new Pushpop.SplitView(element); }); });
