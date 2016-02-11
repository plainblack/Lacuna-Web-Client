YAHOO.namespace("lacuna");

//only load this once
if (typeof YAHOO.lacuna.TextboxList == "undefined" || !YAHOO.lacuna.TextboxList) {

// enclose everything in an anonymous function ...
(function () {
    // ... so that variables that you declare inside are local to the function and invisible outside
    var Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lang = YAHOO.lang,
        Lib = YAHOO.lacuna.Library,
        CSS_PREFIX = "TextboxList";
        
    var TBL = function(elInput, oDataSource, oConfigs) {
        if(!oConfigs){ oConfigs = {}; }
        oConfigs.useShadow = oConfigs.useShadow || false;
        oConfigs.useIFrame = oConfigs.useIFrame || true;
        oConfigs.animVert = oConfigs.animVert || false;
        oConfigs.minQueryLength = oConfigs.minQueryLength || 0; //if null set to zero so we can submit blank request for dropdown display. 
        oConfigs.resultTypeList = oConfigs.resultTypeList || false; //if false use object literal insted of array in formatResults first arg
        oConfigs.formatResultLabelKey = oConfigs.formatResultLabelKey || oDataSource.responseSchema.fields[0].key || oDataSource.responseSchema.fields[0];
        oConfigs.formatResultColumnKeys = oConfigs.formatResultColumnKeys || [(oDataSource.responseSchema.fields[0].key || oDataSource.responseSchema.fields[0])]; //used to show correct columns in drop down
        oConfigs._pageNum = 1; //private var to remember what page we're on to use the "Next" option
        
        // Validate input element and get idPrefix from it's id
        var idPrefix;
        if(Dom.inDocument(elInput)) {
            if(YAHOO.lang.isString(elInput)) {
                idPrefix = elInput;
                elInput = document.getElementById(elInput); //get dom object
            }
            else {
                idPrefix = elInput.id;
            }
        }
        else {
            return;
        }
        
        //setup dom structure
        //Dom.setStyle(elInput, "display", "none"); //hide starting input and use it for storage and form submits
        var tblInput = Dom.get(elInput), //document.createElement("input"), 
            tblContainer = document.createElement("div"),
            tblAC = document.createElement("div"),
            ddIcon, tblListContainer, tblList, tblListInputLine, tblIndicator;
        
        //set needed id's
        tblContainer.id = idPrefix + "Tbl"; //TextboxList
        //tblInput.id = idPrefix + "TblInput"; //TextboxListInput
        tblAC.id = idPrefix + "TblAutoComplete"; //TextboxListAutoComplete
        //append to dom and keep references
        tblContainer = Dom.insertAfter(tblContainer, tblInput); //insert our container after the input passed in
        Dom.addClass(tblContainer, CSS_PREFIX); //add the control class to the Container
        //remove elInput from dom so we can reinsert it in our structure
        tblInput = tblInput.parentNode.removeChild(tblInput);
        //check if we're single or multi select
        if(oConfigs.multiSelect) {
            tblListContainer = document.createElement("div");
            tblList = document.createElement("ul");
            tblListInputLine = document.createElement("li");
            
            //Dom.addClass(tblContainer, CSS_PREFIX + "Multi"); //add the control class to the Container
            tblListContainer = tblContainer.appendChild(tblListContainer); //append our list to our textbox container
            Dom.addClass(tblListContainer, CSS_PREFIX + "Container"); //add the class to the List Container
            tblList = tblListContainer.appendChild(tblList); //append our list to our container
            Dom.addClass(tblList, CSS_PREFIX + "Bits"); //add the control class to the List
            tblListInputLine = tblList.appendChild(tblListInputLine); //append the LI to the list
            Dom.addClass(tblListInputLine, CSS_PREFIX + "Bit");  //add the control class to the LI
            tblInput = tblListInputLine.appendChild(tblInput); //append our input to the LI
            Dom.addClass(tblInput, CSS_PREFIX + "Input"); //add the control class to the Input
        }
        else {
            tblInput = tblContainer.appendChild(tblInput); //append our input to the LI
            Dom.addClass(tblInput, CSS_PREFIX + "InputSingle"); //add the control class to the Input
        }
        if(!oConfigs.multiSelect && oConfigs.minQueryLength == 0){
            ddIcon = document.createElement("div");
            ddIcon = Dom.insertAfter(ddIcon, tblInput);
            Dom.addClass(ddIcon, CSS_PREFIX + "Icon");
        }
        if(oConfigs.useIndicator) {
            //create indicator span for image next to input control
            tblIndicator = document.createElement("span");
            tblIndicator.innerHTML = ['<img src="',Lib.AssetUrl,'ui/indicator.gif" alt="Loading..." />'].join('');
            Dom.setStyle(tblIndicator,"display","none");
            Dom.addClass(tblIndicator, CSS_PREFIX + "Indicator");
            if(oConfigs.multiSelect) {
                tblIndicator = Dom.insertAfter(tblIndicator, tblInput);
            }
            else {
                Dom.addClass(tblIndicator, CSS_PREFIX + "IndicatorSingle");
                tblIndicator = Dom.insertBefore(tblIndicator, tblInput);
            }
        }
        tblAC = tblContainer.appendChild(tblAC); //append our AutoComplete div to our container
        Dom.addClass(tblAC, CSS_PREFIX + "AutoComplete"); //add the control class to the AutoComplete
        
        //call AutoComplete's constructor
        TBL.superclass.constructor.call(this, tblInput, tblAC, oDataSource, oConfigs);
        //setup extra events
        this.dirtyEvent = new Util.CustomEvent("dirty", this);
        this.selectSingleEvent = new Util.CustomEvent("selectSingle", this);
        this.beforeDeleteEvent = new Util.CustomEvent("beforeDelete", this);

        //assign private vars
        this._elTblListContainer = tblListContainer;
        this._elTblContainer = tblContainer;
        this._elTblList = tblList;
        this._elTblIndicator = tblIndicator;
        this._elTblIcon = ddIcon;
        this._elTblListInputLine = (this.multiSelect ? tblListInputLine : undefined);
        this._oTblSelections = {}; //remember what our selections are
        this._oTblSingleSelection = null;
        this._sOrigSingleSelection = "";
        this._aOrigSelections = []; //remember what our original selections were for dirty check
        //setup click events if min query is 0
        var oSelf = this;
        if(this.minQueryLength == 0) {
            if(!this.multiSelect) {
                Event.addListener(ddIcon,"click",oSelf._onListTextboxClick,oSelf);
            }
            Event.addListener(tblInput,"click", oSelf._onListTextboxClick, oSelf);
        }
        //correctly hide the container when mousing out
        var mouseEnter = function(){
                Event.on(this._elContent, "mouseleave", mouseLeave, this, true);
            },
            mouseLeave = function() {
                Event.removeListener(this._elContent, "mouseleave", mouseLeave);
                this._toggleContainer(false);
            };
        Event.on(this._elContent,"mouseenter", mouseEnter, oSelf, true);
        //always add this listener
        Event.addListener(tblListContainer,"click",oSelf._onListContainerClick,oSelf);

        //if we're using indicator add events to hide and show it
        if(this.useIndicator) {
            this.dataRequestEvent.subscribe(function(oSelf, sQuery, oRequest) {
                this.showIndicator();
            });
            this.dataErrorEvent.subscribe(function(oSelf, sQuery) {
                this.hideIndicator();
            });
            this.dataReturnEvent.subscribe(function(oSelf, sQuery, oRequest) {
                this.hideIndicator();
            });
        }
    };
    
    // now we are actually doing the inheritance part.
    Lang.extend(TBL, YAHOO.widget.AutoComplete, {
        // the third argument to extend are extra prototypes for the new function
        formatResult : function(oResultData, sQuery, sResultMatch) {
            var sKey = sResultMatch, // the entire result key which is the "name" param in the result set
                sKeyQuery = sKey.substr(0, sQuery.length), // the query itself
                sKeyRemainder = sKey.substr(sQuery.length), // the rest of the result
                aMarkup = [],
                val, key, col = 1;
            for(var k = 0; k < this.formatResultColumnKeys.length; k++) {
                key = this.formatResultColumnKeys[k];
                aMarkup[aMarkup.length] = "<div class='";
                aMarkup[aMarkup.length] = CSS_PREFIX;
                aMarkup[aMarkup.length] = "Column ";
                aMarkup[aMarkup.length] = CSS_PREFIX;
                aMarkup[aMarkup.length] = "ColNum";
                aMarkup[aMarkup.length] = col;
                aMarkup[aMarkup.length] = "'>";
                if(oResultData[key]) {
                    val = oResultData[key];
                    aMarkup[aMarkup.length] = val;
                }
                aMarkup[aMarkup.length] = "</div>";
                col++;
            }
            return (aMarkup.join(""));
        },
        doBeforeExpandContainer : function(oTextbox, oContainer, sQuery, aResults) {
            var pos = Dom.getXY(oTextbox);
            pos[1] += Dom.get(oTextbox).offsetHeight + 2;
            Dom.setXY(oContainer,pos);
            return true;
        },
        /**
        * Overload destroy to get ride of our dirtyEvent
        */
        destroy : function() {
            // call the AutoComplete destroy
            TBL.superclass.destroy.call(this);
            this.dirtyEvent.unsubscribeAll();
            this.selectSingleEvent.unsubscribeAll();
        },
        /**
        * Return key/value pairs of selected items, if multi-selct.  "key" will be the selected item formatResultLabelKey.  value will be a "bit"
        * For single select will return single data item
        */
        Selections : function() {
            if(this.multiSelect) {
                var arr = [];
                for(var key in this._oTblSelections){
                    if(this._oTblSelections.hasOwnProperty(key)){
                        arr.push(this._oTblSelections[key]._value);
                    }
                }
                return arr;
            }
            else {
                return this._oTblSingleSelection.Value;
            }
        },
        /**
        * items should be an array of objects with the same schema as the datasource.  
        */
        SelectItems : function(items) {
            //clear prior selections
            this._sPastSelections = "";
            this.ResetSelections();
            this._dirty = null;
            //loop and add
            for(var i = 0; i < items.length; i++) {
                var oData = this._createDataObject(items[i]);
                if(oData.Value) {
                    var bit = this._createBit(oData);
                    if(bit) {
                        this._aOrigSelections.push(oData.Value);
                        this._sPastSelections = bit._value;
                        this._oTblSelections[bit._value] = bit;
                    }
                }
            }
            
        },
        /**
        * Reset selections
        */
        ResetSelections : function() {
            if(this.multiSelect){
                this._oTblSelections = {};
                this._aOrigSelections = [];
                var list = this._elTblList;
                //remove all children
                while (list.firstChild) {
                    //if it doesn't have the bitbox class it's the input field so break out of the while loop because we're done
                    if(!Dom.hasClass(list.firstChild, CSS_PREFIX + "BitBox")) {
                        break;
                    }
                    else {
                        list.removeChild(list.firstChild);
                    }
                }
            }
            else {
                this._oTblSingleSelection = null;
                this._sOrigSingleSelection = "";
                this._elTextbox.value = "";
            }
        },
        /**
        * _singleRequest getter
        */
        IsSingleRequest : function() {
            return this._singleRequest;
        },
        handleResponseSingle : function(sQuery, oResponse, oPayload) {
            if((this instanceof YAHOO.widget.AutoComplete) && this._sName) {
                //focus textbox
                this._focus();
                //container won't show since it's a single request 
                this._populateList(sQuery, oResponse, oPayload);

                //get all list items
                var elListItem, allListItemEls = this._elList.childNodes,
                    queue = (oPayload && oPayload.queue) ? oPayload.queue : null;
                if(queue) {
                    for(var i=0; i<allListItemEls.length; i++) {
                        elListItem = allListItemEls[i];
                        if(elListItem._oResultData && queue.indexOf(String(elListItem._oResultData.Id)) >= 0) {
                            this._selectItem(elListItem);
                        }
                    }
                }
                else {
                    //get first
                    elListItem = allListItemEls[0];
                    //select it
                    this._selectItem(elListItem);
                }
                
                //remove single response flag
                this._singleRequest = null;
                this.dataSource._singleRequest = null;
                
                //if indicator hide it
                if(this.useIndicator) {
                    this.hideIndicator();
                }
                //done with single select
                this.selectSingleEvent.fire();
            }
        },
        /**
        * Selects single value.  Must override generateRequest to properly handle key unless the key is the what is the normally queried text
        */
        Select : function(key) {
            if(key) {
                // Reset focus for a new interaction
                this._bFocused = null;
                //set single request flags
                this._singleRequest = true;
                this.dataSource._singleRequest = true;
                //get request
                var sRequest = this.generateRequest(key);
                //if indicator show it
                if(this.useIndicator) {
                    this.showIndicator();
                }
                //send
                this.dataSource.sendRequest(sRequest, {
                        success : this.handleResponseSingle,
                        failure : this.handleResponseSingle,
                        scope   : this,
                        argument: {
                            query: key
                        }
                });
            }
        },
        Queue : function(keys) {
            if(Lang.isArray(keys) && keys.length > 0) {
                // Reset focus for a new interaction
                this._bFocused = null;
                //set single request flags
                this._singleRequest = true;
                this.dataSource._singleRequest = true;
                //get request
                var sRequest = this.generateRequest("");
                //if indicator show it
                if(this.useIndicator) {
                    this.showIndicator();
                }
                //send
                this.dataSource.sendRequest(sRequest, {
                        success : this.handleResponseSingle,
                        failure : this.handleResponseSingle,
                        scope   : this,
                        argument: {
                            query: "",
                            queue: keys
                        }
                });
            }
        },
        /**
        * overload populateList to handle single Select and use formatResultLabelKey instead of the first schema field
        */
        _populateList : function(sQuery, oResponse, oPayload) {
            // Clear previous timeout
            if(this._nTypeAheadDelayID != -1) {
                clearTimeout(this._nTypeAheadDelayID);
            }
                
            sQuery = (oPayload && oPayload.query) ? oPayload.query : sQuery;
            
            // Pass data through abstract method for any transformations
            var ok = this.doBeforeLoadData(sQuery, oResponse, oPayload);

            // Data is ok
            if(ok && !oResponse.error) {
                this.dataReturnEvent.fire(this, sQuery, oResponse.results);
                
                // Continue only if instance is still focused (i.e., user hasn't already moved on)
                // Null indicates initialized state, which is ok too
                //if(this._bFocused || (this._bFocused === null)) {
                    
                //TODO: is this still necessary?
                /*var isOpera = (YAHOO.env.ua.opera);
                var contentStyle = this._elContent.style;
                contentStyle.width = (!isOpera) ? null : "";
                contentStyle.height = (!isOpera) ? null : "";*/
            
                // Store state for this interaction
                var sCurQuery = decodeURIComponent(sQuery);
                this._sCurQuery = sCurQuery;
                this._bItemSelected = false;
            
                var allResults = oResponse.results,
                    nItemsToShow = Math.min(allResults.length,this.maxResultsDisplayed),
                    sMatchKey = (this.dataSource.responseSchema.fields) ? 
                        this.formatResultLabelKey : 0;
                
                if(nItemsToShow > 0) {
                    // Make sure container and helpers are ready to go
                    if(!this._elList || (this._elList.childNodes.length < nItemsToShow)) {
                        this._initListEl();
                    }
                    this._initContainerHelperEls();
                    
                    var allListItemEls = this._elList.childNodes;
                    // Fill items with data from the bottom up
                    for(var i = nItemsToShow-1; i >= 0; i--) {
                        var elListItem = allListItemEls[i],
                        oResult = allResults[i];
                        
                        // Backward compatibility
                        if(this.resultTypeList) {
                            // Results need to be converted back to an array
                            var aResult = [];
                            // Match key is first
                            aResult[0] = (YAHOO.lang.isString(oResult)) ? oResult : oResult[sMatchKey] || oResult[this.key];
                            // Add additional data to the result array
                            var fields = this.dataSource.responseSchema.fields;
                            if(YAHOO.lang.isArray(fields) && (fields.length > 1)) {
                                for(var k=1, len=fields.length; k<len; k++) {
                                    aResult[aResult.length] = oResult[fields[k].key || fields[k]];
                                }
                            }
                            // No specific fields defined, so pass along entire data object
                            else {
                                // Already an array
                                if(YAHOO.lang.isArray(oResult)) {
                                    aResult = oResult;
                                }
                                // Simple string 
                                else if(YAHOO.lang.isString(oResult)) {
                                    aResult = [oResult];
                                }
                                // Object
                                else {
                                    aResult[1] = oResult;
                                }
                            }
                            oResult = aResult;
                        }

                        // The matching value, including backward compatibility for array format and safety net
                        elListItem._sResultMatch = (YAHOO.lang.isString(oResult)) ? oResult : (YAHOO.lang.isArray(oResult)) ? oResult[0] : (oResult[sMatchKey] || "");
                        elListItem._oResultData = oResult; // Additional data
                        elListItem.innerHTML = this.formatResult(oResult, sCurQuery, elListItem._sResultMatch);
                        elListItem.style.display = "";
                    }
            
                    // Clear out extraneous items
                    if(nItemsToShow < allListItemEls.length) {
                        var extraListItem;
                        for(var j = allListItemEls.length-1; j >= nItemsToShow; j--) {
                            extraListItem = allListItemEls[j];
                            extraListItem.style.display = "none";
                        }
                    }
                    
                    this._nDisplayedItems = nItemsToShow;
                    
                    this.containerPopulateEvent.fire(this, sQuery, allResults);
                    
                    // Highlight the first item
                    if(this.autoHighlight) {
                        var elFirstListItem = this._elList.firstChild;
                        this._toggleHighlight(elFirstListItem,"to");
                        this.itemArrowToEvent.fire(this, elFirstListItem);
                        this._typeAhead(elFirstListItem,sQuery);
                    }
                    // Unhighlight any previous time
                    else {
                        this._toggleHighlight(this._elCurListItem,"from");
                    }
            
                    // If not a single request toggle container
                    if(!this._singleRequest) {
                        // Expand the container
                        ok = this.doBeforeExpandContainer(this._elTextbox, this._elContainer, sQuery, allResults);
                        this._toggleContainer(ok);
                    }
                }
                else {
                    this._toggleContainer(false);
                }

                return;
            }
            // Error
            else {
                this.dataErrorEvent.fire(this, sQuery);
            }
        },
        /**
        * Enabled and disable the field
        */
        disable : function() {
            this.getInputEl().disabled = true;
            this.disabled = true;
            Dom.addClass(this.getInputEl(), CSS_PREFIX + "Disabled");
            Dom.addClass(this._elTblContainer, CSS_PREFIX + "Disabled");
            Dom.addClass(this._elTblListContainer, CSS_PREFIX + "Disabled");
            for(var bitKey in this._oTblSelections) {
                var bit = this._oTblSelections[bitKey];
                Dom.addClass(bit, CSS_PREFIX + "Disabled");
            }
            if(this._elTblIcon) {
                Dom.setStyle(this._elTblIcon, "display", "none");
            }
        },
        enable : function() {
            this.getInputEl().disabled = false;
            this.disabled = undefined;
            Dom.removeClass(this.getInputEl(), CSS_PREFIX + "Disabled");
            Dom.removeClass(this._elTblContainer, CSS_PREFIX + "Disabled");
            Dom.removeClass(this._elTblListContainer, CSS_PREFIX + "Disabled");
            for(var bitKey in this._oTblSelections) {
                var bit = this._oTblSelections[bitKey];
                Dom.removeClass(bit, CSS_PREFIX + "Disabled");
            }
            if(this._elTblIcon) {
                Dom.setStyle(this._elTblIcon, "display", "");
            }
        },
        /**
        * validity handlers
        **/
        setValid : function(isValid) {
            this._isValid = isValid;
            if (isValid) {
                Dom.removeClass(this._elTblContainer, CSS_PREFIX + "Error");
            } else {
                Dom.addClass(this._elTblContainer, CSS_PREFIX + "Error");
            }
        },
        isValid : function(){
            return this._isValid;
        },
        /**
        * show and hide animated indicator gif
        */
        showIndicator : function() {
            Dom.setStyle(this._elTblIndicator, "display", "");
        },
        hideIndicator : function() {
            Dom.setStyle(this._elTblIndicator, "display", "none");
        },
        /**
        * private functions to handle selection update and bit creation for multi select and pass through for single select
        */
        _createDataObject : function(data) {
            var oData = {};
            oData.Object = data; //store actual data structure for possible later use
            oData.Value = data ? data[this.formatResultLabelKey] : null;
            return oData;
        },
        _createBit : function(oData) {    
            var elTblListInputLine = this._elTblListInputLine,
                oSelf = this;
            var bit;
            //add bit if it doesn't exist already
            if(!this._oTblSelections[oData.Value]) {
                bit = document.createElement("li");
                bit.Object = oData.Object; //store actual data structure for possible later use
                bit._value = oData.Value;
                var bitText = document.createTextNode(bit._value);
                var bitDelete = document.createElement("a");
                bitDelete.href = "#";
                bit = Dom.insertBefore(bit, elTblListInputLine);
                Event.addListener(bit, "click", oSelf._onListRemoveBitClick, oSelf);
                Dom.addClass(bit, CSS_PREFIX + "Bit");
                Dom.addClass(bit, CSS_PREFIX + "BitBox");
                //add text
                bit.appendChild(bitText);
                //add delete
                bitDelete = bit.appendChild(bitDelete);    
                Dom.addClass(bitDelete, CSS_PREFIX + "BitBoxDelete");
            }
            return bit;
        },
        _updateValue : function(elListItem) {
            if(this.multiSelect){
                if(!this.suppressInputUpdate) {    
                    var elTextbox = this._elTextbox,
                        data = elListItem._oResultData;
                    // clear input field
                    elTextbox.value = "";
                    //create bit from data
                    var oData = this._createDataObject(data);
                    var bit = this._createBit(oData);
                    return bit;
                }
            }
            else {
                TBL.superclass._updateValue.call(this, elListItem);
            }
        },
        _selectItem : function(elListItem) {
            if(elListItem && elListItem !== null && elListItem._oResultData) {
                if(this.multiSelect){
                    this._bItemSelected = true;
                    var newBit = this._updateValue(elListItem);
                    this._clearInterval();
                    if(newBit){
                        var newVal = newBit._value;
                        this._sPastSelections = newVal;
                        this._oTblSelections[newVal] = newBit;
                        this._updateDirty();
                        this.itemSelectEvent.fire(this, elListItem, elListItem._oResultData);
                    }
                    this._toggleContainer(false);
                }
                else {
                    var oData = this._createDataObject(elListItem._oResultData);
                    this._oTblSingleSelection = oData;
                    TBL.superclass._selectItem.call(this, elListItem);
                    this._updateDirty();
                }
                //remove focus so enter key doesn't submit
                this._elTextbox.blur();
            }
        },
        //click event catch
        _onListTextboxClick : function(v, oSelf){
            if(!this.disabled) {
                Event.stopEvent(v); //stop event from bubbling to container
                oSelf._sendQuery(""); //must pass empty string as query
            }
        },
        _onListContainerClick : function(v, oSelf){
            if(!this.disabled) {
                if(oSelf.minQueryLength == 0) {
                    oSelf._elTextbox.focus();
                    oSelf._sendQuery("");
                }
                else {
                    oSelf._elTextbox.focus();
                }
            }
        },
        _onListRemoveBitClick : function(v, oSelf){
            if(oSelf._elTblList && !oSelf.disabled) {
                var eventTarget = Event.getTarget(v); //stop event from bubbling to container
                Event.stopEvent(v);
                //if this is a bit...
                if(Dom.hasClass(eventTarget, "TextboxListBitBoxDelete")) {
                    var target = eventTarget.parentNode; //get target should return the delete link so we want it's parent
                    if(target) {
                        //double check delete
                        if(oSelf.beforeDeleteEvent.fire(target)) {
                            delete oSelf._oTblSelections[target._value];
                            oSelf._elTblList.removeChild(target);
                            oSelf._updateDirty();
                        }
                    }
                }
            }
        },
        _updateDirty : function() {
            //only update dirty if it's not a select
            if(!this._singleRequest) {
                var isDirty;
                if(this.multiSelect){
                    var cur = this._oTblSelections,
                        orig = this._aOrigSelections;

                    for(var s = 0; s < orig.length; s++) {
                        if(!cur[orig[s]]) {
                            isDirty = true;
                            break;
                        }
                    }
                    //if we're not dirty yet loop current selection and count to see if we have more selected than original
                    if(!isDirty) {
                        var curNum = 0;
                        for(var key in cur) {
                            //if the key actually has a value count it
                            if(cur[key]) {
                                curNum++;
                            }
                        }
                        if(curNum != orig.length) {
                            isDirty = true;
                        }
                    }
                }
                else {
                    isDirty = this._sOrigSingleSelection != this._oTblSingleSelection.Value;
                }
                //if it changes reset validity
                if(isDirty) {
                    this.setValid(true);
                }
                this.dirtyEvent.fire(isDirty);
            }
        }
    });
    
    // Copy static members to class
    Lang.augmentObject(TBL, YAHOO.widget.AutoComplete);
    Lang.augmentObject(TBL, {
        dirtyEvent : null,
        selectSingleEvent : null,
        beforeDeleteEvent : null
    });
    //assign to global
    YAHOO.lacuna.TextboxList = TBL;

})();


// Important to register it
YAHOO.register("textboxList", YAHOO.lacuna.TextboxList, {version: "1.0.0", build: "1"});

}
// vim: noet:ts=4:sw=4
