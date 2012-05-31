;'use strict';

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
  
  $window.bind('resize', function(evt) {
    console.log('here');
  })
};

Pushpop.SplitView.prototype = {
  constructor: Pushpop.SplitView,
  
  element: null,
  $element: null
};

$(function() { $('.pp-split-view').each(function(index, element) { new Pushpop.SplitView(element); }); });
