'use strict';

var Pushpop = window['Pushpop'] || {};

Pushpop.TableView = function TableView(element) {
  var $window = $(window['addEventListener'] ? window : document.body);
  
  var $element = this.$element = $(element);
  var element = this.element = $element[0];
  
  var tableView = element.tableView;
  if (tableView) return tableView;
  
  element.tableView = this;
  
  var scrollViewElement = $element.parents('.sk-scroll-view')[0];
  if (!scrollViewElement) return;
  
  var self = this;
  
  var reusableCells = this._reusableCells = [];
  var visibleCells = this._visibleCells = [];
  var selectedRowIndexes = this._selectedRowIndexes = [];
  
  var scrollView = this.scrollView = scrollViewElement.scrollView;
  
  var containsSearchBar = $element.attr('data-contains-search-bar') || 'false';
  containsSearchBar = containsSearchBar !== 'false';
  
  var searchBar = null;
  if (containsSearchBar) searchBar = this._searchBar = new Pushpop.TableViewSearchBar(this);
  
  var visibleHeight = this._visibleHeight = scrollView.getSize().height;
  var numberOfBufferedCells = this._numberOfBufferedCells;
  var selectionTimeoutDuration = this._selectionTimeoutDuration;
  var lastOffset = -scrollView.y;
  
  // Render table view cells "virtually" when the view is scrolled.
  scrollView.$element.bind(SKScrollEventType.ScrollChange, function(evt) {
    var offset = -scrollView.y;
    if (offset < 0) return;
    
    var firstCellElement = $element.children('li:first-child')[0];
    var lastCellElement = $element.children('li:last-child')[0];
    if (!firstCellElement || !lastCellElement || firstCellElement === lastCellElement) return;
    
    var dataSource = self.getDataSource();
    var rowHeight = self.getRowHeight();
    var totalCellCount = dataSource.getNumberOfRows();
    var visibleCellCount = self.getNumberOfVisibleCells();
    var selectedRowIndex = self.getIndexForSelectedRow();
    
    var firstCell = firstCellElement.tableViewCell;
    var firstCellIndex = firstCell.getIndex();
    var lastCell = lastCellElement.tableViewCell;
    var lastCellIndex = lastCell.getIndex();
    
    // Manually calculate offset instead of calling .offset().
    var margin = scrollView.getMargin();
    var firstCellOffset = margin.top - offset;
    var lastCellOffset = firstCellOffset + (visibleCellCount * rowHeight);
    var delta = offset - lastOffset;
    
    lastOffset = offset;
    
    // Handle scrolling when swiping up (scrolling towards the bottom).
    if (delta > 0 && lastCellIndex + 1 < totalCellCount && firstCellOffset < 0 - (rowHeight * numberOfBufferedCells)) {
      $element.children('li:nth-child(-n+' + numberOfBufferedCells + ')').each(function(index, element) {
        var newCellIndex = lastCellIndex + index + 1;
        if (newCellIndex >= totalCellCount) return;
        
        var cell = element.tableViewCell;
        cell.prepareForReuse();
        
        var newCell = dataSource.getCellForRowAtIndex(self, newCellIndex);
        if (self.isRowSelectedAtIndex(newCellIndex)) newCell.setSelected(true);
        $element.append(newCell.$element);
        
        scrollView.setMargin({
          top: margin.top + (rowHeight * (index + 1)),
          bottom: margin.bottom - (rowHeight * (index + 1))
        });
      });
    }
    
    // Handle scrolling when swiping down (scrolling towards the top).
    else if (delta < 0 && firstCellIndex - 1 >= 0 && lastCellOffset > visibleHeight + (rowHeight * numberOfBufferedCells)) {
      $element.children('li:nth-child(n+' + (visibleCellCount - numberOfBufferedCells + 1) + ')').each(function(index, element) {
        var newCellIndex = firstCellIndex - index - 1;
        if (newCellIndex < 0) return;
        
        var cell = element.tableViewCell;
        cell.prepareForReuse();
        
        var newCell = dataSource.getCellForRowAtIndex(self, newCellIndex);
        if (self.isRowSelectedAtIndex(newCellIndex)) newCell.setSelected(true);
        $element.prepend(newCell.$element);
        
        scrollView.setMargin({
          top: margin.top - (rowHeight * (index + 1)),
          bottom: margin.bottom + (rowHeight * (index + 1))
        });
      });
    }
  });
  
  // Handle mouse/touch events to allow the user to make row selections.
  var isPendingSelection = false, selectionTimeout = null;

  $element.delegate('li', !!('ontouchstart' in window) ? 'touchstart' : 'mousedown', function(evt) {
    isPendingSelection = true;
    
    var tableViewCell = this.tableViewCell;
    
    selectionTimeout = window.setTimeout(function() {
      if (!isPendingSelection) return;
      isPendingSelection = false;
      
      self.deselectAllRows();
      self.selectRowAtIndex(tableViewCell.getIndex());
    }, selectionTimeoutDuration);
  });
  
  $element.bind(!!('ontouchmove' in window) ? 'touchmove' : 'mousemove', function(evt) {
    if (!isPendingSelection) return;
    isPendingSelection = false;
    
    window.clearTimeout(selectionTimeout);
  });
  
  $element.delegate('li', !!('ontouchend' in window) ? 'touchend' : 'mouseup', function(evt) {
    if (!isPendingSelection) return;
    isPendingSelection = false;
    
    window.clearTimeout(selectionTimeout);
  
    var tableViewCell = this.tableViewCell;
    
    self.deselectAllRows();
    self.selectRowAtIndex(tableViewCell.getIndex());
  });
  
  var dataSetUrl = $element.attr('data-set-url');
  if (dataSetUrl) $.getJSON(dataSetUrl, function(dataSet) {
    var dataSource = new Pushpop.TableViewDataSource(dataSet);
    self.setDataSource(dataSource);
  });
};

Pushpop.TableView.prototype = {
  constructor: Pushpop.TableView,
  
  element: null,
  $element: null,
  
  scrollView: null,
  
  _visibleHeight: 0,
  _numberOfBufferedCells: 16,
  _selectionTimeoutDuration: 250,
  
  _reusableCells: null,
  getReusableCells: function() { return this._reusableCells; },
  dequeueReusableCellWithIdentifier: function(reuseIdentifier) {
    var reusableCells = this.getReusableCells();
    var visibleCells = this.getVisibleCells();
    var cell = null;
    
    for (var i = 0, length = reusableCells.length; i < length; i++) {
      if (reusableCells[i].reuseIdentifier === reuseIdentifier) {
        visibleCells.push(cell = reusableCells[i]);
        reusableCells.splice(i, 1);
        break;
      }
    }
    
    if (!cell) visibleCells.push(cell = new Pushpop.TableViewCell(reuseIdentifier));
    
    cell.tableView = this;
    
    return cell;
  },
  
  _visibleCells: null,
  getVisibleCells: function() { return this._visibleCells; },
  getNumberOfVisibleCells: function() { return Math.ceil(this._visibleHeight / this.getRowHeight()) + this._numberOfBufferedCells },
  
  _selectedRowIndexes: null,
  getIndexForSelectedRow: function() {
    var selectedRowIndexes = this._selectedRowIndexes;
    return (selectedRowIndexes && selectedRowIndexes.length > 0) ? selectedRowIndexes[0] : -1;
  },
  getIndexesForSelectedRows: function() {
    return this._selectedRowIndexes;
  },
  isRowSelectedAtIndex: function(index) {
    var selectedRowIndexes = this._selectedRowIndexes;
    for (var i = 0, length = selectedRowIndexes.length; i < length; i++) if (selectedRowIndexes[i] === index) return true;
    return false;
  },
  selectRowAtIndex: function(index, animated) {
    this._selectedRowIndexes.push(index);
    
    var tableViewCell, $cells = this.$element.children();
    for (var i = 0, length = $cells.length; i < length; i++) {
      tableViewCell = $cells[i].tableViewCell;
      if (tableViewCell.getIndex() === index) {
        tableViewCell.setSelected(true);
        return;
      }
    }
  },
  deselectRowAtIndex: function(index, animated) {
    var selectedRowIndexes = this._selectedRowIndexes;
    for (var i = 0, length = selectedRowIndexes.length; i < length; i++) {
      if (selectedRowIndexes[i] === index) {
        selectedRowIndexes.splice(i, 1);
        break;
      }
    }
    
    var tableViewCell, $selectedCells = this.$element.children('.pp-table-view-selected-state');
    for (var i = 0, length = $cells.length; i < length; i++) {
      tableViewCell = $cells[i].tableViewCell;
      if (tableViewCell.getIndex() === index) {
        tableViewCell.setSelected(false);
        return;
      }
    }
  },
  deselectAllRows: function() {
    this._selectedRowIndexes.length = 0;
    this.$element.children('.pp-table-view-selected-state').each(function(index, element) {
      element.tableViewCell.setSelected(false);
    });
  },
  
  scrollToTop: function() {
    var totalCellCount = this.getDataSource().getNumberOfRows();
    var visibleCellCount = Math.min(this.getNumberOfVisibleCells(), totalCellCount);
    var hiddenCellCount = totalCellCount - visibleCellCount;
    
    var scrollView = this.scrollView;
    
    // Scroll to the top of the table view without animating.
    scrollView.setContentOffset({ x: 0, y: 0 }, false);
    
    // Set the scroll view margin.
    scrollView.setMargin({
      top: 0,
      bottom: hiddenCellCount * this.getRowHeight()
    });
  },
  
  reloadData: function() {
    var $element = this.$element;
    
    var dataSource = this.getDataSource();
    
    var visibleCells = this.getVisibleCells();
    var i, length, visibleCellsToReuse = [];
    for (i = 0, length = visibleCells.length; i < length; i++) visibleCellsToReuse.push(visibleCells[i]);
    for (i = 0, length = visibleCellsToReuse.length; i < length; i++) visibleCellsToReuse[i].prepareForReuse();
    
    var totalCellCount = dataSource.getNumberOfRows();
    var visibleCellCount = Math.min(this.getNumberOfVisibleCells(), totalCellCount);
    var hiddenCellCount = totalCellCount - visibleCellCount;
    
    for (i = 0; i < visibleCellCount; i++) {
      var cell = dataSource.getCellForRowAtIndex(this, i);      
      $element.append(cell.$element);
    }
    
    this.scrollToTop();
  },
  
  _searchBar: null,
  getSearchBar: function() { return this._searchBar; },
  setSearchBar: function(searchBar) {
    this._searchBar = searchBar;
  },
  
  _dataSource: null,
  getDataSource: function() { return this._dataSource; },
  setDataSource: function(dataSource) {
    this._dataSource = dataSource;
    dataSource.setTableView(this);
    
    this.reloadData();
  },
  
  _rowHeight: 44,
  getRowHeight: function() { return this._rowHeight; },
  setRowHeight: function(rowHeight) {
    this._rowHeight = rowHeight;
  },
  
  _editing: false,
  getEditing: function() { return this._editing; },
  setEditing: function(editing, animated) {
    this._editing = editing;
  }
};

/**
  Creates a new data source for a TableView.
  @param {Array} [dataSet] An optional array of data to initialize a default data source.
  @param {Array} [dataSet.id] The unique identifier for a specific record.
  @param {Array} [dataSet.value] The (sometimes) hidden value for a specific record.
  @param {Array} [dataSet.title] The title to be displayed in a TableViewCell for a specific record.
  @constructor
*/
Pushpop.TableViewDataSource = function TableViewDataSource(dataSet) {
  if (!dataSet || dataSet.constructor !== Array) return;
  
  this.setDataSet(dataSet);
  this.shouldReloadTableForSearchString();
  
  // Default implementation if using an in-memory data set.
  this.getNumberOfRows = function() { return this.getFilteredDataSet().length; };
  
  // Default implementation if using an in-memory data set.
  this.getCellForRowAtIndex = function(tableView, index) {
    var cell = tableView.dequeueReusableCellWithIdentifier('pushpop.tableviewcell.default');
    
    var data = this.getFilteredDataSet()[index];
    cell.setIndex(index);
    cell.setId(data.id);
    cell.setValue(data.value);
    cell.setTitle(data.title);
    
    return cell;
  };
};

/**
  @description NOTE: In order to have a TableView with custom TableViewCells, a custom
  TableViewDataSource must be implemented with at least the two required methods defined
  in this prototype. A third optional method may also be implemented as defined in this
  prototype.
*/
Pushpop.TableViewDataSource.prototype = {
  constructor: Pushpop.TableViewDataSource,
  
  /**
    REQUIRED: Returns the number of rows provided by this data source.
    @type Number
  */
  getNumberOfRows: function() { return 0; },
  
  /**
    REQUIRED: Returns a TableViewCell for the specified index.
    @param {Pushpop.TableView} tableView The TableView the TableViewCell should be returned for.
    @param {Number} index The index of the data to be used when populating the TableViewCell.
    @type Pushpop.TableViewCell
  */
  getCellForRowAtIndex: function(tableView, index) { return null; },
  
  /**
    OPTIONAL: Executes the current filter function against each item in the data set to determine
    if the table view should be reloaded to display a new filtered data set.
    @param {String} searchString The search string to be used for matching items in the data set.
    @param {Boolean} [isCaseSensitive] An optional boolean flag for forcing a case-sensitive RegExp
    to be used when executing the filter function.
    @type Boolean
  */
  shouldReloadTableForSearchString: function(searchString, isCaseSensitive) {
    var dataSet = this.getDataSet();
    if (!dataSet) return false;
    
    var filterFunction = this.getFilterFunction();
    var tableView = this.getTableView();
    
    if (!filterFunction || typeof filterFunction !== 'function' || !searchString) {
      this._lastSearchString = null;
      
      if (this._filteredDataSet !== dataSet) {
        this._filteredDataSet = dataSet;
        return true;
      }
      
      return false;
    }
    
    var filteredDataSet = [];
    var regExp = new RegExp(searchString + '+', (!isCaseSensitive ? 'i' : '') + 'm');
    var item, i, length;
    
    // The search string is a continuation of the last search string (e.g.: 'ab' -> 'abc').
    if (searchString.indexOf(this._lastSearchString) === 0) {
      
      // Search the previous filtered data set instead of the whole data set.
      var lastFilteredDataSet = this._filteredDataSet;
      for (i = 0, length = lastFilteredDataSet.length; i < length; i++) if (filterFunction(regExp, item = lastFilteredDataSet[i])) filteredDataSet.push(item);
    }
    
    // The search string is NOT a contination of the last search string (e.g.: 'abc' -> 'ab').
    else {
      
      // Search the whole data set.
      for (i = 0, length = dataSet.length; i < length; i++) if (filterFunction(regExp, item = dataSet[i])) filteredDataSet.push(item);
    }
    
    this._filteredDataSet = filteredDataSet;
    this._lastSearchString = searchString;
    return true;
  },
  
  _lastSearchString: null,
  
  _tableView: null,
  getTableView: function() { return this._tableView; },
  setTableView: function(tableView) { this._tableView = tableView; },
  
  _dataSet: null,
  getDataSet: function() { return this._dataSet; },
  setDataSet: function(dataSet) { this._dataSet = dataSet; },
  
  _filteredDataSet: null,
  getFilteredDataSet: function() { return this._filteredDataSet; },
  
  // Default filter function that searches an item's title.
  _filterFunction: function(regExp, item) { return regExp.test(item.title); },
  
  /**
    Returns the current filter function for searching this TableView.
    @type Function
  */
  getFilterFunction: function() { return this._filterFunction; },
  
  /**
    Sets a filter function to be used when searching this TableView.
    @param {Function} filterFunction The filter function to be used when searching this TableView.
    @description The filter function gets called for each item in the data set during a search. A
    valid filter function must take two parameters (regExp, item) and return a Boolean value. The
    |regExp| parameter contains a RegExp object based on the search string to be used to match items
    in the data set. The |item| parameter contains an item from the data set that the search string
    in the RegExp should be tested against. The provided filter function should return a Boolean
    value: |true| if the item should match the search string or |false| if it should be filtered out.
  */
  setFilterFunction: function(filterFunction) { this._filterFunction = filterFunction; }
};

Pushpop.TableViewSearchBar = function TableViewSearchBar(tableView) {
  var $element = this.$element = $('<div class="pp-table-view-search-bar"/>');
  var element = this.element = $element[0];
  
  element.tableViewSearchBar = this;
  
  this.tableView = tableView;
  
  var $input = this.$input = $('<input type="text" placeholder="Search"/>').appendTo($element);
  var $cancelButton = this.$cancelButton = $('<a class="pp-table-view-search-bar-button" href="#">Cancel</a>').appendTo($element);
  var $overlay = this.$overlay = $('<div class="pp-table-view-search-bar-overlay"/>').appendTo(tableView.scrollView.$element);
  
  var willFocus = false;
  
  $input.bind('mousedown touchstart', function(evt) { evt.stopPropagation(); });
  $input.bind('mouseup touchend', function(evt) { $input.trigger('focus'); });
  $input.bind('focus', function(evt) { tableView.scrollToTop(); window.setTimeout(function() { $overlay.addClass('pp-active'); }, 0); });
  $input.bind('blur', function(evt) { $overlay.removeClass('pp-active'); });
  $cancelButton.bind('mousedown touchstart', function(evt) { evt.stopPropagation(); evt.preventDefault(); });
  $cancelButton.bind('mouseup touchend', function(evt) { $input.val(null).trigger('keyup').trigger('blur'); });
  $overlay.bind('mousedown touchstart', function(evt) { evt.stopPropagation(); evt.preventDefault(); });
  $overlay.bind('mouseup touchend', function(evt) { $input.trigger('blur'); });
  
  $input.bind('keyup', function(evt) {
    var searchString = $input.val();
    
    if (!searchString) {
      $overlay.addClass('pp-active');
    } else {
      $overlay.removeClass('pp-active');
    }
    
    if (tableView.getDataSource().shouldReloadTableForSearchString(searchString)) tableView.reloadData();
  });
  
  tableView.$element.before($element);
};

Pushpop.TableViewSearchBar.prototype = {
  constructor: Pushpop.TableViewSearchBar,
  
  element: null,
  $element: null,
  $input: null,
  $cancelButton: null,
  $overlay: null,
  
  tableView: null,
  
  getSearchString: function() { return this.$input.val(); }
};

Pushpop.TableViewCell = function TableViewCell(reuseIdentifier) {
  var $element = this.$element = $('<li/>');
  var element = this.element = $element[0];
  
  element.tableViewCell = this;
  
  if (reuseIdentifier) this.reuseIdentifier = reuseIdentifier;
};

Pushpop.TableViewCell.prototype = {
  constructor: Pushpop.TableViewCell,
  
  element: null,
  $element: null,
  
  tableView: null,
  reuseIdentifier: 'pushpop.tableviewcell.default',
  
  /**
    Removes this TableViewCell from the TableView's visible cells, resets its
    data and prepares it to be reused by the TableView by placing it in the
    reusable cells queue.
  */
  prepareForReuse: function() {
    this.$element.remove();
    
    var tableView = this.tableView;
    var reusableCells = tableView.getReusableCells();
    var visibleCells = tableView.getVisibleCells();
    
    reusableCells.push(this);
    
    for (var i = 0, length = visibleCells.length; i < length; i++) {
      if (visibleCells[i] === this) {
        visibleCells.splice(i, 1);
        break;
      }
    }
    
    this.setSelected(false);
    this.setIndex(-1);
    this.setId(-1);
    this.setValue(null);
    this.setTitle('');
  },
  
  _isSelected: false,
  getSelected: function() { return this._isSelected; },
  setSelected: function(value) {
    if (this._isSelected = value) {
      this.$element.addClass('pp-table-view-selected-state');
    } else {
      this.$element.removeClass('pp-table-view-selected-state');
    }
  },
  
  _index: -1,
  getIndex: function() { return this._index; },
  setIndex: function(index) { this._index = index; },
  
  _id: -1,
  getId: function() { return this._id; },
  setId: function(id) { this._id = id; },
  
  _value: null,
  getValue: function() { return this._value; },
  setValue: function(value) { this._value = value; },
  
  _title: '',
  getTitle: function() { return this._title; },
  setTitle: function(title) { this.$element.html(this._title = title); }
};

$(function() {
  $('.pp-table-view').each(function(index, element) { new Pushpop.TableView(element); });
});
