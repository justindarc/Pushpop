;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new SplitView.
  @param {HTMLDivElement} element The <div/> element to initialize as a new SplitView.
  @constructor
*/
Pushpop.SplitView = function SplitView(element) {
  var $element = this.$element = $(element);
  var element = this.element = $element[0];
  
  var splitView = element.splitView;
  if (splitView) return splitView;
  
  element.splitView = this;
  
  var $window = $(window['addEventListener'] ? window : document.body);
  
  // TODO: Implement responsive design and auto-collapse the split view into a
  // single view stack on a mobile phone.
  $window.bind('resize', function(evt) {
    
  });
};

Pushpop.SplitView.prototype = {
  constructor: Pushpop.SplitView,
  
  element: null,
  $element: null
};

$(function() { $('.pp-split-view').each(function(index, element) { new Pushpop.SplitView(element); }); });
