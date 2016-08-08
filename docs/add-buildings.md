# Add code for Buildings

To understand the following, you should first understand the React, Reflux data
flow model as described in 'concepts'.

A new building window is created by a call to `WindowActions.windowAdd` passing in
the building component (e.g. `js/components/window/essentiavein`) together with an
object containing the options. (for example the ID of the building). This call is 
currently done in the js-yui/mapPlanet code.

Create a component for the building, e.g. `js/components/window/essentiavein` note
that for simplicity this should be the same as the url for the building as defined
in the API documentation (/essentiavein, /planetarycommand etc). Do not Camel case
this one filename.

Use an existing building as a template for what to do. You can define some options
for the window (width, height, title).  The building will use one or more stores, 
most likely this will be the `js/stores/rpc/building.js` object, most buildings will 
have an additional attribute `extraViewData` which will hold data specific to that 
building e.g. `planet` in the case of the PCC. This is handled by the store and 
will most likely not need changing.

The building code will need `StandardTabs` (production, repair) which will be in 
all building types. Then you need to add your own Tabs (e.g. `DrainTab` for the
essentiavein). This is where most of the new development will be done so use
existing code as a guide and if possible re-use components (e.g. ship lists, trades
etc.) rather than duplicating code.

## Create Actions for API calls.

On loading the building panel you will need to make a call to the API to request
the building data via the `view` method. This may also need to be called again on
making some changes (e.g. completing a trade, doing a repair etc.). In either case
this should be by triggering the action e.g. `requestRPCEssentiaVeinView`.

You will also need to add calls for other actions, e.g. `drain` for the essentia 
vein. `requestRPCEssentiaVeinDrain`

Create an actions class for these calls, this should be based on the url for the
building, e.g. `js/stores/rpc/essentiaVein.js` or `js/stores/rpc/planetaryCommand`

For each API call you need to create three actions, a `request` to trigger the 
call to the API, a `success` to handle the successfull reply and an `error` to 
handle any error condition. So, for the essentiaVein Drain command these actions
would be

```
    'requestRPCEssentiaVeinDrain',
    'successRPCEssentiaVeinDrain',
    'failureRPCEssentiaVeinDrain',
```

## Create Data Access Object (DAO) for all API calls

Each set of calls to the API can be handled by a DAO module. For example 
`js/dao/essentiaVein.js`

The DAO module for a new building can be created by inspection of an existing
module. All that it does is to listen for any of the `request` actions to be
triggered, make the call to the API and then trigger either a `success` or a
`failure` action as a result.

## Create an Object Store for the building

Some buildings will just need the 'default' store `js/stores/rpc/building`
since all the data it needs will be contained within there, or within the
`extraViewData` in that store.

On inspection, it looks like all building calls will put their data into the
same `extraViewData`. This may change since some buildings will require
stores for different things. e.g. Trade will require stores for the market
for supply chains etc. So this is currently in flux.

TODO it may be best to have separate stores for buildings, e.g. stores for
trade, stores for lists of ships etc.

Whatever the store, they will listen to actions caused by responses from the
API. e.g. `successRPCEssentiaVeinDrain` action can be captured by creating a
method `onSuccessRPCEssentiaVeinDrain` and taking the server response and
updating the store.

When the store is updated, trigger an `emit` to update the store and this
will result in all of the components listening to the store to be updated
and re-rendered (thus completing the React loop).

## Summary

The files which are required for a new building are as follows (using the
essentia-vein building as an example).

```
    js/components/window/essentiavein.jsx           - basic window
    js/components/window/essentiavein/drainTab.jsx  - one, or more, tabs
    js/actions/rpc/essentiaVein.jsx                 - API actions
    js/dao/essentiaVein.js                          - process API calls
```


