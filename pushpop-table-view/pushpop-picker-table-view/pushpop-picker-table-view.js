;'use strict';

// The base Pushpop object.
var Pushpop = window['Pushpop'] || {};

/**
  Creates a new PickerTableView.
  @param {HTMLUListElement} element The UL element to initialize as a new PickerTableView.
  @constructor
  @extends Pushpop.TableView
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
    
    var isPickerCell = (index === dataSource.getPickerCellIndex());
    if (!isPickerCell) return;
    
    var viewStack = self.getViewStack();
    var view = self.getView();
    
    if (!viewStack || !view) return;
    
    var pickerCellDataSource = self.getPickerCellDataSource();
    var pickerCellView = self.getPickerCellView();
    
    if (pickerCellDataSource) {
      viewStack.pushNewTableView(function(newTableView) {
        newTableView.setSearchBar(new Pushpop.TableViewSearchBar(newTableView));
        newTableView.setDataSource(pickerCellDataSource);
        
        newTableView.$bind(Pushpop.TableView.EventType.DidSelectRowAtIndex, function(evt) {
          if (evt.hasChildDataSource) return;
        
          var tableView = evt.tableView;
          var pickerCellDataSource = tableView.getDataSource();
          var item = pickerCellDataSource.getFilteredItemAtIndex(evt.index);
        
          newTableView.$trigger($.Event(Pushpop.PickerTableView.EventType.DidFinishSelectingItem, { item: item }));
        });
        
        newTableView.getView().$bind(Pushpop.PickerTableView.EventType.DidFinishSelectingItem, function(evt) {
          self.didFinishSelectingItem(evt.item);
        });
      });
    }
    
    else if (pickerCellView) {      
      viewStack.push(pickerCellView);
    }
  });
  
  // Listen for tap events on the editing accessory buttons to add items and to toggle
  // the confirmation button to delete an item.
  this.$bind(Pushpop.TableView.EventType.EditingAccessoryButtonTappedForRowWithIndex, function(evt) {
    var dataSource = self.getDataSource();
    var index = evt.index;
    
    var isPickerCell = (index === dataSource.getPickerCellIndex());
    if (isPickerCell) return self.selectRowAtIndex(index);
    
    // Disable all previously "active" delete buttons in this table view (e.g.: delete
    // buttons waiting for confirmation).
    var $editingAccessoryButton = evt.tableViewCell.$element.children('.pp-table-view-cell-editing-accessory').first();
    evt.tableView.$element.find('span.pp-table-view-cell-editing-accessory.pp-active').each(function(index, element) {
      if (element !== $editingAccessoryButton[0]) $(element).removeClass('pp-active');
    });
    
    // Toggle the delete confirmation on the row that the editing accessory button was tapped.
    $editingAccessoryButton.toggleClass('pp-active');
  });
  
  this.$bind(Pushpop.TableView.EventType.AccessoryButtonTappedForRowWithIndex, function(evt) {
    var dataSource = self.getDataSource();
    var index = evt.index;
    
    var isPickerCell = (index === dataSource.getPickerCellIndex());
    if (isPickerCell) return;
    
    // Check that the accessory button that was tapped was a delete confirmation.
    var $accessoryButton = evt.tableViewCell.$element.children('.pp-table-view-cell-accessory').first();
    if (!$accessoryButton.hasClass('pp-table-view-cell-accessory-confirm-delete-button')) return;
    
    // Remove the item from the data source.
    dataSource.removeItem(dataSource.getItemAtIndex(index));
  });
};

Pushpop.PickerTableView.EventType = {
  DidFinishSelectingItem: 'Pushpop:PickerTableView:DidFinishSelectingItem'
};

// Create the prototype for the Pushpop.PickerTableView as a "sub-class" of Pushpop.TableView.
Pushpop.PickerTableView.prototype = new Pushpop.TableView();
Pushpop.PickerTableView.prototype.constructor = Pushpop.PickerTableView;

Pushpop.PickerTableView.prototype._editing = true;

/**
  Used for setting the table view in or out of editing mode. However, In the case of a picker
  table view, this method will invoke a warning since picker table views are permenantly in
  editing mode.
  @param {Boolean} editing A flag indicating if the TableView should be in editing mode.
  @param {Boolean} [animated] An optional flag indicating if the transition in or out of
  editing mode should be animated (default: true).
*/
Pushpop.PickerTableView.prototype.setEditing = function(editing, animated) {
  if (!window['console']) return;
  window.console.warn('Attempting to change the editing mode of Pushpop.PickerTableView not allowed; Pushpop.PickerTableView must always be in editing mode');
};

Pushpop.PickerTableView.prototype.didFinishSelectingItem = function(item) {
  var dataSource = this.getDataSource();
  if (!dataSource) return;
  
  dataSource.addItem(item);
  
  var viewStack = this.getViewStack();
  var view = this.getView();
  
  if (viewStack && view) viewStack.pop(view);
};

Pushpop.PickerTableView.prototype._pickerCellDataSource = null;

/**
  Returns the data source to be used for the table view containing a list of items to select
  from. The table view that this data source is bound to typically appears when the "Add"
  cell is selected from this table view.
  @type Pushpop.TableViewDataSource
*/
Pushpop.PickerTableView.prototype.getPickerCellDataSource = function() { return this._pickerCellDataSource; };

/**
  Sets the data source to be used for the table view containing a list of items to select
  from. The table view that this data source will be bound to typically appears when the
  "Add" cell is selected from this table view.
  @param {Pushpop.TableViewDataSource} dataSource The data source to bind to the table
  view containing a list of items to select from.
*/
Pushpop.PickerTableView.prototype.setPickerCellDataSource = function(pickerCellDataSource) { this._pickerCellDataSource = pickerCellDataSource; };

Pushpop.PickerTableView.prototype._pickerCellView = null;

Pushpop.PickerTableView.prototype.getPickerCellView = function() { return this._pickerCellView; };

Pushpop.PickerTableView.prototype.setPickerCellView = function(pickerCellView) {
  var oldPickerCellView = this._pickerCellView;
  if (oldPickerCellView) oldPickerCellView.$unbind(Pushpop.PickerTableView.EventType.DidFinishSelectingItem);
  
  this._pickerCellView = pickerCellView;
  
  var self = this;
  pickerCellView.$bind(Pushpop.PickerTableView.EventType.DidFinishSelectingItem, function(evt) {
    self.didFinishSelectingItem(evt.item);
  });
};

/**
  Creates a new data source for a PickerTableView.
  @description NOTE: This is not to be used as a data source for the list of items to select from.
  This is to be used by a PickerTableView to store the list of items that have been selected.
  @param {Array} [dataSet] An optional array of data to initialize a default data source.
  @param {Array} [dataSet.id] The unique identifier for a specific record.
  @param {Array} [dataSet.value] The (sometimes) hidden value for a specific record.
  @param {Array} [dataSet.title] The title to be displayed in a TableViewCell for a specific record.
  @param {String} [defaultReuseIdentifier] The optional reuse identifier to be used for rows that do
  not specify a specific reuse identifier.
  @constructor
  @extends Pushpop.TableViewDataSource
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
  Returns the number of rows provided by this data source.
  @description NOTE: This is the default implementation and should be overridden for data
  sources that are not driven directly from an in-memory data set. Also, in order to account
  for the picker cell, this method should always return the number of rows in the data source
  plus one.
  @type Number
*/
Pushpop.PickerTableViewDataSource.prototype.getNumberOfRows = function() { return this.getNumberOfFilteredItems() + 1; },

/**
  Returns a TableViewCell for the specified index.
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
  cell.setAccessoryType(isPickerCell ? Pushpop.TableViewCell.AccessoryType.DisclosureIndicator : Pushpop.TableViewCell.AccessoryType.ConfirmDeleteButton);
  cell.setEditingAccessoryType(isPickerCell ? Pushpop.TableViewCell.EditingAccessoryType.AddButton : Pushpop.TableViewCell.EditingAccessoryType.DeleteButton);
  cell.setData(item);
  
  return cell;
}

/**
  Returns an object containing the data for all "values" contained within the data source.
  This is typically used for retrieving form fields stored within a table view.
  @description NOTE: If a field name occurs more than once, its values will be put into an
  array.
  @param {String} [keyFieldName] The name of the field in the data source containing the
  values' keys. If not specified, the default value is 'name'.
  @param {String} [valueFieldName] The name of the field in the data source containing the
  values' values. If not specified, the default value is 'value.
  @type Object
*/
Pushpop.PickerTableViewDataSource.prototype.getValuesObject = function(keyFieldName, valueFieldName) {
  
  // Call the "super" method.
  var valuesObject = Pushpop.TableViewDataSource.prototype.getValuesObject.apply(this, arguments);
  
  if (keyFieldName && valuesObject[keyFieldName] && !(valuesObject[keyFieldName] instanceof Array)) valuesObject[keyFieldName] = [valuesObject[keyFieldName]];
  
  return valuesObject;
};

Pushpop.PickerTableViewDataSource.prototype._pickerCellTitle = 'Add Item';

/**
  Returns the title to be displayed for the "picker" cell.
  @description NOTE: The "picker" cell is the cell that will push a new table view with a
  list of items to select from when it is selected.
  @type String
*/
Pushpop.PickerTableViewDataSource.prototype.getPickerCellTitle = function() { return this._pickerCellTitle; };

/**
  Sets the title to be displayed for the "picker" cell.
  @description NOTE: The "picker" cell is the cell that will push a new table view with a
  list of items to select from when it is selected.
  @param {String} pickerCellTitle A string containing the title to be displayed for the
  "picker" cell.
*/
Pushpop.PickerTableViewDataSource.prototype.setPickerCellTitle = function(pickerCellTitle) {
  this._pickerCellTitle = pickerCellTitle;
};

Pushpop.PickerTableViewDataSource.prototype._pickerCellReuseIdentifier = 'pp-table-view-cell-default';

/**
  Returns the default reuse identifier that this data source will use when a
  reuse identifier is not specified in the data for the "picker" cell.
  @description NOTE: The "picker" cell is the cell that will push a new table view with a
  list of items to select from when it is selected.
  @type String
*/
Pushpop.PickerTableViewDataSource.prototype.getPickerCellReuseIdentifier = function() { return this._pickerCellReuseIdentifier; };

/**
  Sets the default reuse identifier that this data source will use when a
  reuse identifier is not specified in the data for the "picker" cell.
  @description NOTE: The "picker" cell is the cell that will push a new table view with a
  list of items to select from when it is selected.
  @param {String} pickerCellReuseIdentifier The reuse identifier to set as default for the
  "picker" cell.
*/
Pushpop.PickerTableViewDataSource.prototype.setPickerCellReuseIdentifier = function(pickerCellReuseIdentifier) {
  this._pickerCellReuseIdentifier = pickerCellReuseIdentifier;
};

/**
  Returns the index for the "picker" cell. This is used to differentiate the "picker" cell
  from the other cells representing the list of selected items.
  @description NOTE: The "picker" cell is the cell that will push a new table view with a
  list of items to select from when it is selected.
  @type Number
*/
Pushpop.PickerTableViewDataSource.prototype.getPickerCellIndex = function() { return this.getNumberOfRows() - 1; };

/**
  Adds the specified item to the end of the list of items that have been selected.
  @param {Object} item The item to add to the end of the list of items that have been selected.
*/
Pushpop.PickerTableViewDataSource.prototype.addItem = function(item) {
  var numberOfItems = this.getNumberOfItems();
  var dataSet = this.getDataSet();
  for (var i = 0; i < numberOfItems; i++) if (this.getItemAtIndex(i) === item) return;
  
  dataSet.push(item);
  this.setDataSet(dataSet);
};

/**
  Removes the specified item from the list of items that have been selected.
  @param {Object} item The item to remove from the list of items that have been selected.
*/
Pushpop.PickerTableViewDataSource.prototype.removeItem = function(item) {
  var numberOfItems = this.getNumberOfItems();
  var dataSet = this.getDataSet();
  for (var i = 0; i < numberOfItems; i++) if (this.getItemAtIndex(i) === item) {
    dataSet.splice(i, 1);
    this.setDataSet(dataSet);
    return;
  }
};

$(function() { $('.pp-picker-table-view').each(function(index, element) { new Pushpop.PickerTableView(element); }); });
