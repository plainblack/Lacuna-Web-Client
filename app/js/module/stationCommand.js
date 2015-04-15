YAHOO.namespace("lacuna.modules");

if (typeof YAHOO.lacuna.modules.StationCommand == "undefined" || !YAHOO.lacuna.modules.StationCommand) {
    
(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Sel = Util.Selector,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var StationCommand = function(result){
        StationCommand.superclass.constructor.call(this, result);
        
        this.service = Game.Services.Modules.StationCommand;
    };
    
    Lang.extend(StationCommand, Lacuna.buildings.PlanetaryCommand);

    Lacuna.modules.StationCommand = StationCommand;

})();
YAHOO.register("StationCommand", YAHOO.lacuna.modules.StationCommand, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
