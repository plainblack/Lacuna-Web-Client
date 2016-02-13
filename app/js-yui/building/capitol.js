YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.Capitol == "undefined" || !YAHOO.lacuna.buildings.Capitol) {
    
(function(){
    var Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Capitol = function(result){
        Capitol.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Buildings.Capitol;
    };
    
    YAHOO.lang.extend(Capitol, Lacuna.buildings.Building, {
        getChildTabs : function() {
            return [this._getRenameTab()];
        },
        _getRenameTab : function() {
            var div = document.createElement("div");
            Dom.addClass(div, 'capitolEmpireRenameTab');
            div.innerHTML = [
                '<p>',
                '    Current empire name: <span id="capitolCurrentEmpireName">', Game.EmpireData.name, '</span>',
                '</p>',
                '<fieldset style="text-align: center">',
                '    <legend>Change Empire Name</legend>',
                '    <div><label>Cost to change:<span class="smallImg"><img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" title="Essentia" /></span>',this.result.rename_empire_cost,'</label></div>',
                '    <div><label>New empire name: <input type="text" id="capitolNewEmpireName"></input></label></div>',
                '    <div><button id="capitolChangeEmpireName">Change Name</button></div>',
                '</fieldset>'
            ].join('');
            Event.on('capitolChangeEmpireName', "click", this.RenameEmpire, this, true);
            var tab = new YAHOO.widget.Tab({ label: "Rename Empire", contentEl: div});
            return tab;
        },
        RenameEmpire : function(e) {
            Event.stopEvent(e);
            var btn = Event.getTarget(e);
            var newName = Dom.get('capitolNewEmpireName').value;
            require('js/actions/menu/loader').show();
            btn.disabled = true;
            this.service.rename_empire({
                session_id:Game.GetSession(),
                building_id:this.building.id,
                name: newName
            }, {
                success : function(o){
                    YAHOO.log(o, "info", "Capitol.rename_empire.success");
                    btn.disabled = false;
                    Dom.get('capitolNewEmpireName').value = '';
                    Dom.get('capitolCurrentEmpireName').innerHTML = newName;
                    require('js/actions/menu/loader').hide();
                    this.rpcSuccess(o);
                    alert('Your empire name has been changed!');
                },
                failure : function(o){
                    btn.disabled = false;
                },
                scope:this
            });
        }
    });
    
    Lacuna.buildings.Capitol = Capitol;

})();
YAHOO.register("Capitol", YAHOO.lacuna.buildings.Capitol, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
