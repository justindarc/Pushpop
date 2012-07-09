;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

Pushpop.NavigationBar = function(element) {    
  var $element = this.$element = $(element);
  element = this.element = $element[0];
  
  var navigationBar = element.navigationBar;
  if (navigationBar) return navigationBar;
  
  element.navigationBar = this;
  
  var self = this;

  var viewStack = this.viewStack = Pushpop.getViewStackForElement(element);
  if (!viewStack) return;
  
  var tapToTop = $element.attr('data-tap-to-top') || 'false';
  tapToTop = this.tapToTop = this.tapToTop || (tapToTop !== 'false');
  
  var $tapToTopElement = this.$tapToTopElement = $('<div class="pp-navigationbar-tap-to-top"/>').appendTo($element);
  $tapToTopElement.bind('click', function(evt) {
    if (!self.tapToTop) return;
    
    var activeView = viewStack.getActiveView();
    var scrollView = activeView.element.scrollView;
    if (scrollView && !scrollView.isScrolling) scrollView.scrollToTop();
  });
  
  var $backButtonElement = this.$backButtonElement = $('<a class="pp-barbutton pp-barbutton-align-left pp-barbutton-style-back" href="#">Back</a>').appendTo($element);
  
  viewStack.$element.bind(Pushpop.EventType.WillPresentView, function(evt) {
    var view = evt.view;
    self.setTitle(view.title);
    self.loadNavbarButtons(view, evt.action)
  });
  
  // Prevent dragging of the Navigation Bar.
  $element.bind('touchmove', function(evt) { return false; });
  
  var activeView = viewStack.getActiveView();
  if (!activeView) return;
  
  this.setTitle(activeView.title);
  this.loadNavbarButtons(activeView);
};

Pushpop.NavigationBar.prototype = {
  element: null,
  $element: null,
  $tapToTopElement: null,
  $backButtonElement: null,
  $viewSpecificNavButtons: null,
  $titleElement: null,
  viewStack: null,
  tapToTop: false,
  setTitle: function(value) {
    var $titleElement = this.$titleElement;
    if (!$titleElement) $titleElement = this.$titleElement = $('<h1 class="pp-navigationbar-title"/>').appendTo(this.$element);
    
    $titleElement.html(value || '');
  },
	loadNavbarButtons: function(view, action) {
    if (action === 'parent-push' || action === 'parent-pop') return;
    
	  // Clear any nav buttons currently in the navbar (other than the back button)
	  if (this.$viewSpecificNavButtons) this.$viewSpecificNavButtons.remove();

    // Append buttons for this view
    this.$element.append(this.$viewSpecificNavButtons = view.$navbarButtons);
    
    // Show/Hide the back button
    switch (action) {
      case 'push':
        if (!view.hideNavBackButton) {
          this.$backButtonElement.addClass('pop active');
        } else {
          this.$backButtonElement.removeClass('pop active');
        }
        break;
      case 'pop':
        if (!view.hideNavBackButton && this.viewStack.views.length > 1) {
          this.$backButtonElement.addClass('pop active');
        } else {
          this.$backButtonElement.removeClass('pop active');
        }
      default:
        break;
    }
	}
};

$(function() {
  var $navigationBars = $('.pp-navigationbar');
  $navigationBars.each(function(index, element) {
    new Pushpop.NavigationBar(element);
  });
});
