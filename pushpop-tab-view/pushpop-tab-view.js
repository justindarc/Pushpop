;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new TabView.
  @param {HTMLDivElement} element The DIV element to initialize as a new TabView.
  @constructor
  @extends Pushpop.View
*/
Pushpop.TabView = function TabView(element) {
  
  // Call the "super" constructor.
  Pushpop.View.prototype.constructor.apply(this, arguments);
  
  var $element = this.$element.addClass('pp-view');
  
  // Initialize the tab bar.
  var tabBar = this._tabBar = new Pushpop.TabBar(this);
  
  // Initialize the tab view stacks.
  var tabViewStacks = this._tabViewStacks = [], viewStacks = [];
  $element.children('.pp-view-stack').each(function(index, element) {
    viewStacks.push(new Pushpop.ViewStack(element));
  });
  
  this.setTabViewStacks(viewStacks);
  
  // Set the initial selected index.
  if (tabViewStacks.length > 0) this.setSelectedIndex(0);
};

/**
  Event types for Pushpop.TabView.
*/
Pushpop.TabView.EventType = {
  DidSelectTabViewStack: 'Pushpop:TabView:DidSelectTabViewStack'
};

// Create the prototype for the Pushpop.TabView as a "sub-class" of Pushpop.View.
Pushpop.TabView.prototype = new Pushpop.View();
Pushpop.TabView.prototype.constructor = Pushpop.TabView;

Pushpop.TabView.prototype._tabBar = null;

/**

*/
Pushpop.TabView.prototype.getTabBar = function() { return this._tabBar; };

Pushpop.TabView.prototype._tabViewStacks = null; // []

/**

*/
Pushpop.TabView.prototype.getTabViewStacks = function() { return this._tabViewStacks; };

/**

*/
Pushpop.TabView.prototype.setTabViewStacks = function(tabViewStacks) {
  var _tabViewStacks = this._tabViewStacks;
  _tabViewStacks.length = 0;
  
  var tabBarButtons = [];
  
  for (var i = 0, length = tabViewStacks.length, tabViewStack; i < length; i++) {
    _tabViewStacks.push(tabViewStack = tabViewStacks[i]);
    tabBarButtons.push(new Pushpop.TabBarButton(tabViewStack));
  }
  
  this.getTabBar().setTabBarButtons(tabBarButtons);
};

Pushpop.TabView.prototype._selectedIndex = -1;

/**

*/
Pushpop.TabView.prototype.getSelectedIndex = function() { return this._selectedIndex; };

/**

*/
Pushpop.TabView.prototype.setSelectedIndex = function(selectedIndex) {
  var tabViewStacks = this.getTabViewStacks();
  if (selectedIndex === this._selectedIndex || selectedIndex < 0 || selectedIndex >= tabViewStacks.length) return;
  
  var previousSelectedTabViewStack = this._selectedTabViewStack;
  var selectedTabViewStack = this._selectedTabViewStack = tabViewStacks[this._selectedIndex = selectedIndex];
  
  if (previousSelectedTabViewStack) previousSelectedTabViewStack.$element.removeClass('pp-active');
  selectedTabViewStack.$element.addClass('pp-active');
  
  this.$element.trigger($.Event(Pushpop.TabView.EventType.DidSelectTabViewStack, {
    previousSelectedTabViewStack: previousSelectedTabViewStack,
    selectedTabViewStack: selectedTabViewStack
  }));
};

Pushpop.TabView.prototype._selectedTabViewStack = null;

/**

*/
Pushpop.TabView.prototype.getSelectedTabViewStack = function() { return this._selectedTabViewStack; };

/**

*/
Pushpop.TabView.prototype.setSelectedTabViewStack = function(selectedTabViewStack) {
  var tabViewStacks = this.getTabViewStacks();
  var previousSelectedTabViewStack = this._selectedTabViewStack;
  if (!selectedTabViewStack || selectedTabViewStack === previousSelectedTabViewStack) return;
  
  for (var i = 0, length = tabViewStacks.length; i < length; i++) {
    if (selectedTabViewStack === tabViewStacks[i]) {
      this._selectedTabViewStack = selectedTabViewStack;
      this._selectedIndex = i;
      break;
    }
  }
  
  if (previousSelectedTabViewStack) previousSelectedTabViewStack.$element.removeClass('pp-active');
  selectedTabViewStack.$element.addClass('pp-active');
  
  this.$element.trigger($.Event(Pushpop.TabView.EventType.DidSelectTabViewStack, {
    previousSelectedTabViewStack: previousSelectedTabViewStack,
    selectedTabViewStack: selectedTabViewStack
  }));
};

/**
  Creates a new TabBar.
  @param {Pushpop.TabView} tabView The tab view to initialize this tab bar for.
  @constructor
*/
Pushpop.TabBar = function TabBar(tabView) {
  var $element = this.$element = $('<div class="pp-tab-bar"/>');
  var element = this.element = $element[0];
  
  var self = element.tabBar = this;
  
  this.tabView = tabView;
  
  var tabBarButtons = this._tabBarButtons = [];

  tabView.$element.append($element).bind(Pushpop.TabView.EventType.DidSelectTabViewStack, function(evt) {
    var previousSelectedTabViewStack = evt.previousSelectedTabViewStack;
    var selectedTabViewStack = evt.selectedTabViewStack;
    var previousSelectedTabBarButton, selectedTabBarButton;
    
    for (var i = 0, length = tabBarButtons.length, tabBarButton, tabBarButtonViewStack; i < length; i++) {
      tabBarButton = tabBarButtons[i];
      tabBarButtonViewStack = tabBarButton.getTabViewStack();
      
      if (previousSelectedTabViewStack && tabBarButtonViewStack === previousSelectedTabViewStack) previousSelectedTabBarButton = tabBarButton;
      if (selectedTabViewStack && tabBarButtonViewStack === selectedTabViewStack) selectedTabBarButton = tabBarButton;
      
      if ((previousSelectedTabBarButton || !previousSelectedTabViewStack) && (selectedTabBarButton || !selectedTabViewStack)) break;
    }
    
    if (previousSelectedTabBarButton) previousSelectedTabBarButton.$element.removeClass('pp-active');
    if (selectedTabBarButton) selectedTabBarButton.$element.addClass('pp-active');
  });

  $element.delegate('.pp-tab-bar-button', !!('ontouchstart' in window) ? 'touchstart' : 'mousedown', function(evt) {
    var tabBarButton = this.tabBarButton;
    tabView.setSelectedTabViewStack(tabBarButton.getTabViewStack());
  });
};

Pushpop.TabBar.prototype = {
  constructor: Pushpop.TabBar,
  
  element: null,
  $element: null,
  
  tabView: null,
  
  _tabBarButtons: null, // []
  
  /**
  
  */
  getTabBarButtons: function() { return this._tabBarButtons; },
  
  /**
  
  */
  setTabBarButtons: function(tabBarButtons) {
    var _tabBarButtons = this._tabBarButtons;
    _tabBarButtons.length = 0;
    
    var $element = this.$element;
    $element.html('');
    
    for (var i = 0, length = tabBarButtons.length, tabBarButton; i < length; i++) {
      _tabBarButtons.push(tabBarButton = tabBarButtons[i]);
      tabBarButton.setTabBar(this);
      $element.append(tabBarButton.$element);
    }
  }
};

/**
  Creates a new TabBarButton.
  @param {Pushpop.ViewStack} tabViewStack The view stack containing the tab bar button to initialize.
  @constructor
*/
Pushpop.TabBarButton = function TabBarButton(tabViewStack) {
  var $element = this.$element = tabViewStack.$element.children('.pp-tab-bar-button').first();
  var element = this.element = $element[0];
  
  var self = element.tabBarButton = this;
  
  this._tabViewStack = tabViewStack;
  
  var $iconElement = this.$iconElement = $element.children('.pp-tab-bar-button-icon').first();
  var icon = this._icon = ''; // TODO: Implement this.
  
  var $titleElement = this.$titleElement = $element.children('.pp-tab-bar-button-title').first();
  var title = this._title = $titleElement.html();
};

Pushpop.TabBarButton.prototype = {
  constructor: Pushpop.TabBarButton,
  
  element: null,
  $element: null,
  $iconElement: null,
  $titleElement: null,
  
  _tabViewStack: null, // []
  
  /**
  
  */
  getTabViewStack: function() { return this._tabViewStack; },
  
  /**
  
  */
  setTabViewStack: function(tabViewStack) {
    this._tabViewStack = tabViewStack;
  },
  
  _tabBar: null,
  
  /**
  
  */
  getTabBar: function() { return this._tabBar; },
  
  /**
  
  */
  setTabBar: function(tabBar) { this._tabBar = tabBar; },
  
  _icon: '',
  
  /**
  
  */
  getIcon: function() { return this._icon; },
  
  /**
  
  */
  setIcon: function(icon) {
    this._icon = icon;
  },
  
  _title: '',
  
  /**
  
  */
  getTitle: function() { return this._title; },
  
  /**
  
  */
  setTitle: function(title) { this.$titleElement.html(this._title = title); }
};
