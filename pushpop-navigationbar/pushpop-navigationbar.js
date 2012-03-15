'use strict';

if (!window['Pushpop']) window.Pushpop = {};

Pushpop.NavigationBar = function(element) {    
  var $element = this.$element = $(element);
  element = this.element = $element[0];
  
  var navigationBar = element.navigationBar;
  if (navigationBar) return navigationBar;
  
  element.navigationBar = this;
  
  var self = this;
  var viewStack = $element.parents('.pp-view-stack')[0];
  
  if (viewStack) viewStack = this.viewStack = viewStack.viewStack;
  
  var $backButtonElement = this.$backButtonElement = $('<a class="pp-barbutton pp-barbutton-align-left pp-barbutton-style-back" href="#">Back</a>').appendTo($element);
  
  this.setTitle(viewStack.getActiveView().title);
  
  viewStack.$element.bind(Pushpop.EventType.WillPresentView, function(evt) {
    self.setTitle(evt.view.title);
  });
  
  viewStack.$element.bind(Pushpop.EventType.WillPushView, function(evt) {
    $backButtonElement.addClass('pop active');
  });
  
  viewStack.$element.bind(Pushpop.EventType.WillPopView, function(evt) {
    if (viewStack.views.length < 2) $backButtonElement.removeClass('pop active');
  });
};

Pushpop.NavigationBar.prototype = {
  element: null,
  $element: null,
  $backButtonElement: null,
  $titleElement: null,
  viewStack: null,
  setTitle: function(value) {
    var $titleElement = this.$titleElement;
    if ($titleElement) $titleElement.remove();
    
    this.$titleElement = $('<h1 class="pp-navigationbar-title">' + ((value) ? value : '') + '</h1>').appendTo(this.$element);
  }
};

$(function() {
  var $navigationBars = $('.pp-navigationbar');
  $navigationBars.each(function(index, element) {
    new Pushpop.NavigationBar(element);
  });
});
