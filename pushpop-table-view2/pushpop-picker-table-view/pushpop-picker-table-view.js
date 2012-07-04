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
  
  // Put the table view in editing mode.
  this.$element.addClass('pp-table-view-editing');
  
  // Replace the existing data source with a PickerTableViewDataSource.
  var dataSource = this.getDataSource();
  var dataSet = dataSource.getDataSet();
  var defaultReuseIdentifier = dataSource.getDefaultReuseIdentifier();
  
  dataSource = new Pushpop.PickerTableViewDataSource(dataSet, defaultReuseIdentifier);
  this.setDataSource(dataSource);
  
  var self = this;
  
  // Listen for the "picker cell" to be selected and push a new table view with the picker
  // cell's data source to present a list of items to select from.
  this.$bind(Pushpop.TableView.EventType.DidSelectRowAtIndex, function(evt) {
    var dataSource = self.getDataSource();
    var index = evt.index;
    
    var pickerCellDataSource = self.getPickerCellDataSource();
    if (!pickerCellDataSource) return;
    
    var isPickerCell = (index === dataSource.getPickerCellIndex());
    if (!isPickerCell) return;
    
    var viewStack = self.getViewStack();
    if (!viewStack) return;
    
    var view = self.getView();
    if (!view) return;
    
    viewStack.pushNewTableView(function(newTableView) {
      newTableView.setSearchBar(new Pushpop.TableViewSearchBar(newTableView));
      newTableView.setDataSource(pickerCellDataSource);
      
      newTableView.$bind(Pushpop.TableView.EventType.DidSelectRowAtIndex, function(evt) {
        if (evt.hasChildDataSource) return;
        
        var tableView = evt.tableView;
        var pickerCellDataSource = tableView.getDataSource();
        var item = pickerCellDataSource.getFilteredItemAtIndex(evt.index);
        dataSource.addItem(item);
        viewStack.pop(view);
      });
    });
  });
  
  // Listen for tap events on the editing accessory buttons to add/remove items.
  this.$bind(Pushpop.TableView.EventType.EditingAccessoryButtonTappedForRowWithIndex, function(evt) {
    var dataSource = self.getDataSource();
    var index = evt.index;
    
    var isPickerCell = (index === dataSource.getPickerCellIndex());
    if (isPickerCell) return self.selectRowAtIndex(index);
    
    dataSource.removeItem(dataSource.getItemAtIndex(index));
  });
};

// Create the prototype for the Pushpop.PickerTableView as a "sub-class" of Pushpop.TableView.
Pushpop.PickerTableView.prototype = new Pushpop.TableView();
Pushpop.PickerTableView.prototype.constructor = Pushpop.PickerTableView;

Pushpop.PickerTableView.prototype._editing = true;

Pushpop.PickerTableView.prototype.setEditing = function(editing, animated) {
  if (!window['console']) return;
  window.console.warn('Attempting to change the editing mode of Pushpop.PickerTableView not allowed; Pushpop.PickerTableView must always be in editing mode');
};

Pushpop.PickerTableView.prototype._pickerCellDataSource = null;

Pushpop.PickerTableView.prototype.getPickerCellDataSource = function() { return this._pickerCellDataSource; };

Pushpop.PickerTableView.prototype.setPickerCellDataSource = function(pickerCellDataSource) {
  this._pickerCellDataSource = pickerCellDataSource;
};

/**
  Creates a new data source for a PickerTableView.
  @param {Array} [dataSet] An optional array of data to initialize a default data source.
  @param {Array} [dataSet.id] The unique identifier for a specific record.
  @param {Array} [dataSet.value] The (sometimes) hidden value for a specific record.
  @param {Array} [dataSet.title] The title to be displayed in a TableViewCell for a specific record.
  @param {String} [defaultReuseIdentifier] The optional reuse identifier to be used for rows that do
  not specify a specific reuse identifier.
  @constructor
*/
Pushpop.PickerTableViewDataSource = function PickerTableViewDataSource(dataSet, defaultReuseIdentifier, pickerCellTitle) {
  
  // Call the "super" constructor.
  Pushpop.TableViewDataSource.prototype.constructor.apply(this, arguments);
  
  // Set the picker cell's title.
  this.setPickerCellTitle(pickerCellTitle || this.getPickerCellTitle());
};

// Create the prototype for the Pushpop.PickerTableViewDataSource as a "sub-class" of Pushpop.TableViewDataSource.
Pushpop.PickerTableViewDataSource.prototype = new Pushpop.TableViewDataSource();
Pushpop.PickerTableViewDataSource.prototype.constructor = Pushpop.PickerTableViewDataSource;

/**
  REQUIRED: Returns the number of rows provided by this data source.
  @description NOTE: This is the default implementation and should be overridden for data
  sources that are not driven directly from an in-memory data set. Also, in order to account
  for the picker cell, this method should always return the number of rows in the data source
  plus one.
  @type Number
*/
Pushpop.PickerTableViewDataSource.prototype.getNumberOfRows = function() { return this.getNumberOfFilteredItems() + 1; },

/**
  REQUIRED: Returns a TableViewCell for the specified index.
  @description NOTE: This is the default implementation and should be overridden for data
  sources that are not driven directly from an in-memory data set. Also, in order to account
  for the picker cell, this method should always return the picker cell for the last available
  index.
  @param {Pushpop.TableView} tableView The TableView the TableViewCell should be returned for.
  @param {Number} index The index of the data to be used when populating the TableViewCell.
  @type Pushpop.TableViewCell
*/
Pushpop.PickerTableViewDataSource.prototype.getCellForRowAtIndex = function(tableView, index) {
  var isPickerCell = (index === this.getPickerCellIndex());
  var item, reuseIdentifier, cell;
  
  item = (isPickerCell) ? {
    title: this.getPickerCellTitle(),
    reuseIdentifier: this.getPickerCellReuseIdentifier()
  } : this.getFilteredItemAtIndex(index);
  
  reuseIdentifier = item.reuseIdentifier || this.getDefaultReuseIdentifier();
  cell = tableView.dequeueReusableCellWithIdentifier(reuseIdentifier);
  
  cell.setIndex(index);
  cell.setAccessoryType(item.accessoryType);
  cell.setEditingAccessoryType(isPickerCell ? Pushpop.TableViewCell.EditingAccessoryType.AddButton : Pushpop.TableViewCell.EditingAccessoryType.DeleteButton);
  cell.setData(item);
  
  return cell;
}

Pushpop.PickerTableViewDataSource.prototype._pickerCellTitle = 'Add Item';

Pushpop.PickerTableViewDataSource.prototype.getPickerCellTitle = function() { return this._pickerCellTitle; };

Pushpop.PickerTableViewDataSource.prototype.setPickerCellTitle = function(pickerCellTitle) {
  this._pickerCellTitle = pickerCellTitle;
};

Pushpop.PickerTableViewDataSource.prototype._pickerCellReuseIdentifier = 'pp-table-view-cell-default';

Pushpop.PickerTableViewDataSource.prototype.getPickerCellReuseIdentifier = function() { return this._pickerCellReuseIdentifier; };

Pushpop.PickerTableViewDataSource.prototype.setPickerCellReuseIdentifier = function(pickerCellReuseIdentifier) {
  this._pickerCellReuseIdentifier = pickerCellReuseIdentifier;
};

Pushpop.PickerTableViewDataSource.prototype.getPickerCellIndex = function() { return this.getNumberOfRows() - 1; };

Pushpop.PickerTableViewDataSource.prototype.addItem = function(item) {
  var numberOfItems = this.getNumberOfItems();
  var dataSet = this.getDataSet();
  for (var i = 0; i < numberOfItems; i++) if (this.getItemAtIndex(i) === item) return;
  
  dataSet.push(item);
  this.setDataSet(dataSet);
};

Pushpop.PickerTableViewDataSource.prototype.removeItem = function(item) {
  var numberOfItems = this.getNumberOfItems();
  var dataSet = this.getDataSet();
  for (var i = 0; i < numberOfItems; i++) if (this.getItemAtIndex(i) === item) {
    dataSet.splice(i, 1);
    this.setDataSet(dataSet);
    return;
  }
};

$(function() {
  $('.pp-picker-table-view').each(function(index, element) { new Pushpop.PickerTableView(element); });
});
