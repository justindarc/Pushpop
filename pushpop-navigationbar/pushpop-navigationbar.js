'use strict';

if (!window['Pushpop']) window.Pushpop = {};

Pushpop.NavigationBar = function(element) {    
  var $element = this.$element = $(element);
  
  var navigationBar = $element.data('navigationBar');
  if (navigationBar) return navigationBar;
  
  $element.data('navigationBar', this);
  
  element = this.element = $element[0];
  
  var self = this;
  var viewStack = this.viewStack = $element.parents('.pp-view-stack:first').data('viewStack');
	var $backButtonElement = this.$backButtonElement = $('<a class="pp-barbutton pp-barbutton-align-left pp-barbutton-style-back" href="#">Back</a>').appendTo($element);
  
	var dataBackButtonVisible = $element.data('backButtonVisible');
	this.backButtonVisible = dataBackButtonVisible || dataBackButtonVisible === undefined;

  this.setTitle(viewStack.getActiveView().title);
  
  viewStack.$element.bind(Pushpop.EventType.WillPresentView, function(evt) {
    self.setTitle(evt.view.title);
  });
  
  viewStack.$element.bind(Pushpop.EventType.WillPushView, function(evt) {
		if (self.backButtonVisible) $backButtonElement.addClass('pop active');
  });
  
  viewStack.$element.bind(Pushpop.EventType.WillPopView, function(evt) {
    if (viewStack.views.length < 2 && self.backButtonVisible) $backButtonElement.removeClass('pop active');
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
  },
	setBackButtonVisible: function(visible) {
		this.backButtonVisible = visible;
	}
};

$(function() {
  var $navigationBars = $('.pp-navigationbar');
  $navigationBars.each(function(index, element) {
    new Pushpop.NavigationBar(element);
  });
});
