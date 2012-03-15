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
  
  var activeView = viewStack.getActiveView();
  this.setTitle(activeView.title);
  this.loadNavbarButtons(activeView);
  
  viewStack.$element.bind(Pushpop.EventType.WillPresentView, function(evt) {
    var view = evt.view;
    self.setTitle(view.title);
    self.loadNavbarButtons(view)
  });
  
  viewStack.$element.bind(Pushpop.EventType.WillPushView, function(evt) {
		if (!evt.view.hideNavBackButton) {
		  $backButtonElement.addClass('pop active');
		}
  });
  
  viewStack.$element.bind(Pushpop.EventType.WillPopView, function(evt) {
    if (viewStack.views.length < 2) $backButtonElement.removeClass('pop active');
  });
};

Pushpop.NavigationBar.prototype = {
  element: null,
  $element: null,
  $backButtonElement: null,
  $otherNavButtonElements: null,
  $titleElement: null,
  viewStack: null,
  setTitle: function(value) {
    var $titleElement = this.$titleElement;
    if ($titleElement) $titleElement.remove();
    
    this.$titleElement = $('<h1 class="pp-navigationbar-title">' + ((value) ? value : '') + '</h1>').appendTo(this.$element);
  },
	loadNavbarButtons: function(view) {
	  // Clear any nav buttons currently in the navbar (other than the back button)
	  if (this.$otherNavButtons) this.$otherNavButtons.remove();
    
  	var $element = this.$element;
    // Does this view have navbar buttons?
    var $navbarButtons = view.$navbarButtons;
    if ($navbarButtons.length > 0) {
      // Append buttons for this view
      $element.append($navbarButtons);
    }
    this.$otherNavButtons = $navbarButtons;
	}
};

$(function() {
  var $navigationBars = $('.pp-navigationbar');
  $navigationBars.each(function(index, element) {
    new Pushpop.NavigationBar(element);
  });
});
