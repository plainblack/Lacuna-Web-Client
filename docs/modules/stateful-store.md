# StatefulStore

## Usage

```javascript
var Reflux        = require('reflux');
var StatefulStore = require('js/stores/mixins/stateful');

var MyStore = Reflux.createStore({
    mixins : [
        StatefulStore
    ],

    ...
});
```

## Methods

`StatefulStore` mixes the following methods into your store.

### `getDefaultData`

Override this method to return the default data that the store should return.

### `emit`

Use this method to save data in `this.state` and then send it off to whatever's listening to it.

### `getData`

Use this method to get the data that's currently in the store. (Don't use this inside a store, it's for if some code somewhere else wants something from a store without needing to know when it changes later.)

## Tips

**Do not ever mutate `this.state` inside a store method!**

Stores need to be immutable so that each React component's [`shouldComponentUpdate` method](https://facebook.github.io/react/docs/component-specs.html#updating-shouldcomponentupdate) has the correct "previous state" value. Mutating state in place will cause the "previous state" and "current state" to look the same (which means we can't optimize on rendering). To do this, every time you end a method with `this.emit` you should start with a new object. The most common pattern is to clone `this.state` (using `util.clone`) and then modify and emit that new object.

## Example

```javascript
var Reflux        = require('reflux');
var StatefulStore = require('js/stores/mixins/stateful');

var clone         = require('js/util').clone;

var MyStore = Reflux.createStore({
    mixins : [
        StatefulStore
    ],

    getDefaultData : function() {
        return {
            foo    : 'bar',
            spam   : 'eggs',
            points : 10,
            users  : [
                'Dave',
                'Bob',
                'Harry'
            ]
        }
    },

    onAddUser : function(name) {
        // Clone the store's state. See above for reasoning.
        var state = clone(this.state);

        // Modify the copied object however we deem necessary.
        state.users.push(name);

        // Send it out to whoever is listening.
        this.emit(name);
    },

    clear : function() {
        // This is common pattern for reseting a store back to its initial data.
        this.emit(this.getDefaultData());
    }
});

// Elsewhere...

function somethingThatOnlyNeedsPointsOnce() {
    // Note: only do this if you need something from the store once. Otherwise, you should
    // listen to it and handle when the data changes.
    var points = MyStore.getData().points;
}
```
