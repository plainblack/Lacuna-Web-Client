YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Announce == "undefined" || !YAHOO.lacuna.Announce) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Announce = function() {};
    Announce.prototype = {
        build: function() {
            this.id = "Announce";

            var container = document.createElement("div");
            container.id = this.id;
            Dom.addClass(container, "nofooter");
            Dom.addClass(container, Lib.Styles.HIDDEN);
            container.innerHTML = this._getHtml();
            document.getElementById('oldYUIPanelContainer').appendChild(container);

            this.Panel = new YAHOO.widget.Panel(this.id, {
                constraintoviewport:true,
                fixedcenter:false,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                underlay:false,
                modal:false,
                close:true,
                width:"350px",
                zIndex:19999,
                context:["header","tr","br", ["beforeShow", "windowResize"], [0,20]]
            });
            this.Panel.renderEvent.subscribe(function(){
                this.iFrame = Dom.get("announceFrame");
                Dom.removeClass(this.id, Lib.Styles.HIDDEN);
            }, this, true);
            this.Panel.render();
        },
        _getHtml : function() {
            return [
            '    <div class="hd">Announcements</div>',
            '    <div class="bd">',
            '        <iframe id="announceFrame" style="width:100%;height:200px;background-color:white;border:0;"></iframe>',
            '    </div>'
            ].join('');
        },
        show : function() {
            this.build();

            this.iFrame.src = "/announcement?session_id=" + Game.GetSession();

            this.Panel.show();
        },
        hide : function() {
            this.Panel.hide();
        }
    };
    Lang.augmentProto(Announce, Util.EventProvider);

    Lacuna.Announce = new Announce();
})();
YAHOO.register("Announce", YAHOO.lacuna.Announce, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
