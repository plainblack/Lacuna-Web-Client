# Implementing a Building

Before getting started on this, you'll need to have a basic understanding of [React](https://facebook.github.io/react/) and [Reflux](https://github.com/reflux/refluxjs). For the purpose of this document, let's imagine that we're implementing the Shipyard building.

# 1. Implement tab setup code

Each building should implement a function which returns the building's tabs. This function is given the building's view data that's received from the server and should return an array of [Tabber](../modules/tabber.md) tabs. This function should go in a file by itself in the `app/js/components/buildings` directory.

Below is an example of what I'm talking about. A few things to note:

- **Each `Tab` needs to specify a `title` and `key`.** The `title` is the text displayed on the tab. The `key` is so that React can tell the different tabs apart. (*An explanation:* when you render an array of elements React needs to be able to tell them apart so that it can apply it's DOM diffing algorithm most efficiently. The `key` attribute does just that. It can be the same as the title. It just needs to be unique to the other keys you've made.)
- **Put the actual tabs in another file.** This is done to keep a "one-component-per-file" standard which keeps the code clean and workable.

**Extra note!** If your building's `view` call returns additional data alongside the `building` block (such as the [Planetary Command Center](http://us1.lacunaexpanse.com/api/PlanetaryCommand.html#view_(_session_id%2C_building_id_)) you can access said data from `building.extraViewData`. This is basically a hack. Originally, only the `building` block was passed down. But it was later realized that other data was returned from the server and then needed. **We need a better solution to this. It's *ugly*.**


```javascript

var shipyard = function(building) {
    return [(
        <Tab title="Build Queue" key="Build Queue" onSelect={ShipyardActions.loadShipsBuildQueue}>
            <BuildQueueTab buildingId={building.id} />
        </Tab>
    ), (
        <Tab title="Build Ships" key="Build Ships" onSelect={ShipyardActions.getBuildableShips}>
            <BuildShipsTab buildingId={building.id} />
        </Tab>
    )];
};
```

# 2. Register your building with the building tabs manager

When you click on a building on the planet surface, that building's details are passed to a new "Building" window. This building window then checks if there are any tabs for it to take care of. It does this by checking the given building's `url` against a list.

You need to put your buildings tab setup function into this list so that your new building's tabs get handled properly. Open up `app/js/components/windows/building/buildingTabs.jsx`. Near to the top you'll see a `var BUILDINGS = {` line. Inside that object, you need to put your building. Set the key to your building's url and the value to your function for setting up the tabs.

Here's an example:

```javascript
var BUILDINGS = {
    // Other building definitions removed for brevity.
    '/shipyard' : require('js/components/buildings/shipyard')
}
```

**Note:** if you're "Reactifying" a building you'll need to do this process in reverse on the YUI side of the code. Open up `app/js-yui/mapPlanet.js` and remove the reference to the YUI version of the building in the `FactoryMap` object.

# 3. Implement the tabs

Now comes the most interesting part. You now need to implement the tabs that you've setup. This part of the process is almost entirely up to you. If you don't know how to approach this, try looking at buildings that have been implemented. There's also documentation here that might help with questions you have.

# 4. Remove old code (if any)

If you're "Reactifying" an existing building (as in, moving it from the old YUI approach to our new React/Reflux setup) then you'll have some old code to remove. I'll keep it brief.

1. Remove the old building's code from `app/js-yui/`.
2. Remove references to the old buildings code (a tool like [ack](http://beyondgrep.com/) might help for this). `app/js/load.js` and `app/js-yui/mapPlanet.js` are easy targets.
3. Once you've gotten everything, you can check it all works by running `gulp clean && gulp dev`.

# 5. Profit

You did it. Well done. :grinning:
