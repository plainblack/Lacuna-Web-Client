'use strict';

var BodyRPCStore = require('js/stores/rpc/body');

if (typeof YAHOO.lacuna.Notify == "undefined" || !YAHOO.lacuna.Notify) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Notify = function() {};
    Notify.prototype = {
        build : function() {
            if (!this.Display) {
                var container = document.createElement("div");
                container.id = "notify";
                Dom.addClass(container, Lib.Styles.HIDDEN);
                Dom.addClass(container, "nofooter");
                container.innerHTML = this._getHtml();
                document.getElementById('oldYUIPanelContainer').appendChild(container);

                this.Display = new YAHOO.widget.Panel("notify", {
                    constraintoviewport:true,
                    visible:false,
                    draggable:false,
                    effect:Game.GetContainerEffect(),
                    close:false,
                    underlay:false,
                    modal:false,
                    width:"180px",
                    zIndex: 20000
                });
                var self = this; // Please, no... :'(
                this.Display.renderEvent.subscribe(function(){
                    this.notifyList = Dom.get('notifyList');
                    this.notify = Dom.get("notify");

                    // Listen for new data.
                    BodyRPCStore.listen(self.update, self);

                    Dom.removeClass(this.notify, Lib.Styles.HIDDEN);
                });
                this.Display.showEvent.subscribe(function(){
                    Dom.setStyle(this.notifyList.parentNode, "max-height", (Game.GetSize().h - 125) + "px");
                });

                this.Display.render();
            }
        },
        _getHtml : function() {
            return [
            '    <div class="hd" style="background:transparent;">Incoming Ships</div>',
            '    <div class="bd" style="background: url(',Lib.AssetUrl,'ui/transparent_black.png) repeat scroll 0pt 0pt transparent;">',
            '        <div style="overflow:auto;">',
            '            <ul id="notifyList"></ul>',
            '        </div>',
            '    </div>'
            ].join('');
        },
        update : function(body) {

            if (!this.Display) {
                return; // Make sure we don't try to update something that isn't there.
            }

            var list = this.Display.notifyList;
            var incoming_own = body.incoming_own_ships || [],
                incoming_ally = body.incoming_ally_ships || [],
                incoming_enemy = body.incoming_enemy_ships || [],
                num_incoming_own = body.num_incoming_own || 0,
                num_incoming_ally = body.num_incoming_ally || 0,
                num_incoming_enemy = body.num_incoming_enemy || 0;
            var arr = [];

            if(num_incoming_enemy > 0) {
                arr = arr.concat(['<li><span style="color:#fff">',num_incoming_enemy,' foreign</span></li>']);
                var len = incoming_enemy.length;
                for (var s=0; s<len; s++) {
                    var ship = incoming_enemy[s],
                    ms = ship.arrival_ms,
                    arrTime;
                    if(ms > 0) {
                        arrTime = Lib.formatMillisecondTime(ms);
                    }
                    else {
                        arrTime = 'Overdue ' + Lib.formatMillisecondTime(-ms);
                    }
                    arr = arr.concat(['<li><span style="color:#fff;">',arrTime,'</span></li>']);
                }
            }
            if(num_incoming_ally > 0) {
                arr = arr.concat(['<li><span style="color:#b0b">',num_incoming_ally,' allied</span></li>']);
                var len = incoming_ally.length;
                for (var s=0; s<len; s++) {
                    var ship = incoming_ally[s],
                    ms = ship.arrival_ms,
                    arrTime;
                    if(ms > 0) {
                        arrTime = Lib.formatMillisecondTime(ms);
                    }
                    else {
                        arrTime = 'Overdue ' + Lib.formatMillisecondTime(-ms);
                    }
                    arr = arr.concat(['<li><span style="color:#b0b;">',arrTime,'</span></li>']);
                }
            }
            if(num_incoming_own > 0) {
                arr = arr.concat(['<li><span style="color:#0f0">',num_incoming_own,' own</span></li>']);
                var len = incoming_own.length;
                for(var s=0; s<len; s++) {
                    var ship = incoming_own[s],
                    ms = ship.arrival_ms,
                    arrTime;
                    if(ms > 0) {
                        arrTime = Lib.formatMillisecondTime(ms);
                    }
                    else {
                        arrTime = 'Overdue ' + Lib.formatMillisecondTime(-ms);
                    }
                    arr = arr.concat(['<li><span style="color:#0f0;">',arrTime,'</span></li>']);
                }
            }

            list.innerHTML = arr.join('');

            if(num_incoming_own + num_incoming_ally + num_incoming_enemy === 0) {
                this.Display.hide();
            } else {
                this.Display.show();
            }
        },

        Show : function() {
            this.build();
            this.Display.show();
            this.Display.bringToTop();
        },
        Hide : function() {
            if (this.Display) {
                this.Display.hide();
            }
        },
        Destroy: function() {
            this.Display.destroy();
            delete this.Display;
        }
    };

    Lacuna.Notify = new Notify();

})();
YAHOO.register("notify", YAHOO.lacuna.Notify, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
