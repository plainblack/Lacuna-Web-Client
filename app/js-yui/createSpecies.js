YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.CreateSpecies == "undefined" || !YAHOO.lacuna.CreateSpecies) {
    
(function(){
    var Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var CreateSpecies = function(Empire) {
        this.id = "createSpecies";
        this._empire = Empire;
        this.createEvent("onCreateSuccessful");
        
        var container = document.createElement("div");
        container.id = this.id;
        Dom.addClass(container, Lib.Styles.HIDDEN);
        container.innerHTML = this._getHtml();
        document.body.insertBefore(container, document.body.firstChild);
        
        this.Dialog = new YAHOO.widget.Dialog(this.id, {
            constraintoviewport:false,
            //fixedcenter:true,
            postmethod:"none",
            visible:false,
            buttons:[ { text:"Found Empire", handler:{fn:this.handleCreate, scope:this}, isDefault:true },
                { text:"Cancel", handler:{fn:this.handleCancel, scope:this} } ],
            draggable:true,
            effect:Game.GetContainerEffect(),
            modal:false,
            close:false,
            width:"735px",
            underlay:false,
            zIndex:9999
        });
        this.Dialog.renderEvent.subscribe(function(){
            this.elMessage = Dom.get('speciesMessage');
            this.designer = new Lacuna.SpeciesDesigner();
            this.designer.render("speciesCreateDesign");
            Dom.removeClass(this.id, Lib.Styles.HIDDEN);
        }, this, true);
        this.Dialog.render();
        Game.OverlayManager.register(this.Dialog);
    };
    CreateSpecies.prototype = {
        handleCreate : function() {
            this.setMessage("");
            var EmpireServ = Game.Services.Empire,
                data = this.designer.getSpeciesData();
            try {
                if ( ! this.designer.validateSpecies(data) ) {
                    return;
                }
            }
            catch (e) {
                this.setMessage(e);
                return;
            }
            delete data.affinity_total;
            EmpireServ.update_species({empire_id: this.empireId, params: data}, {
                success : function(o) {
                    YAHOO.log(o, "info", "CreateSpecies");
                    this._found();
                },
                failure : function(o){
                    this.setMessage(o.error.message);
                    return true;
                },
                scope:this
            });
        },
        handleCancel : function() {
            this.hide();
            this._empire.handleCancel();
        },

        _found : function() {
            require('js/actions/menu/loader').show();
            var EmpireServ = Game.Services.Empire;
            EmpireServ.found({empire_id: this.empireId, api_key:Lib.ApiKey}, {
                success : function(o) {
                    YAHOO.log(o, "info", "CreateSpecies._found.success");
                    require('js/actions/menu/loader').hide();
                    this.hide(); //hide species
                    this.fireEvent("onCreateSuccessful", o);
                },
                failure : function(o) {
                    this.setMessage(o.error.message);
                    return true;
                },
                scope:this
            });
        },
        _getHtml : function() {
            return [
                '    <div class="hd">Create Species</div>',
                '    <div class="bd">',
                '        <form name="speciesForm">',
                '            <div id="speciesCreateDesign"></div>',
                '            <div id="speciesMessage" class="hidden"></div>',
                '        </form>',
                '    </div>',
                '    <div class="ft"></div>'
            ].join('');
        },
        setMessage : function(str) {
            Dom.replaceClass(this.elMessage, Lib.Styles.HIDDEN, Lib.Styles.ALERT);
            this.elMessage.innerHTML = str;
        },
        show : function(empire) {
            this.empireId = empire;
            Game.OverlayManager.hideAll();
            this.Dialog.show();
            this.Dialog.center();
        },
        hide : function() {
            Dom.replaceClass(this.elMessage, Lib.Styles.ALERT, Lib.Styles.HIDDEN);
            this.Dialog.hide();
        }
    };
    YAHOO.lang.augmentProto(CreateSpecies, Util.EventProvider);

    Lacuna.CreateSpecies = CreateSpecies;
})();
YAHOO.register("createSpecies", YAHOO.lacuna.CreateSpecies, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
