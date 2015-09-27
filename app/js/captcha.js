var _ = require('lodash');

YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Captcha == "undefined" || !YAHOO.lacuna.Captcha) {

(function(){
    var Lang = YAHOO.lang,
        Util = YAHOO.util,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var Captcha = function() {};
    Captcha.prototype = {
        build: _.once(function() {
            this.id = "captcha";

            var container = document.createElement("div");
            container.id = this.id;
            Dom.addClass(container, Lib.Styles.HIDDEN);
            container.innerHTML = this._getHtml();
            document.getElementById('oldYUIPanelContainer').appendChild(container);

            this.Dialog = new YAHOO.widget.Dialog(this.id, {
                constraintoviewport:true,
                postmethod:"none",
                hideaftersubmit:false,
                buttons:[
                    { text:"Solve", handler:{fn:function(){ this.submit(); } }, isDefault:true },
                    { text:"Cancel", handler:{fn:function(){ this.hide(); } } }
                ],
                fixedcenter:true,
                visible:false,
                draggable:true,
                effect:Game.GetContainerEffect(),
                underlay:false,
                close:true,
                width:"390px",
                zIndex:9999
            });
            this.Dialog.renderEvent.subscribe(function(){
                this.captchaImage = Dom.get("captchaImage");
                this.captchaSolution = Dom.get("captchaSolution");
                this.captchaMessage = Dom.get("captchaMessage");
                Event.on('captchaRefresh', 'click', this.refreshCaptcha, this, true);
                Dom.removeClass(this.id, Lib.Styles.HIDDEN);
                this.bringToTop();
            }, this, true);
            this.Dialog.hideEvent.subscribe(function(){
                this._fail();
            }, this, true);
            this.Dialog.submitEvent.subscribe(function(){
                this.solveCaptcha();
            }, this, true);
            this.Dialog.render();
            Game.OverlayManager.register(this.Dialog);
        }),
        _getHtml : function() {
            return [
                '<div class="hd">Verify Your Humanity</div>',
                '<div class="bd">',
                '    <form>',
                '        <ul id="captchaList">',
                '            <li>Solve this problem to continue:</li>',
                '            <li>',
                '                <img width="300" height="80" id="captchaImage" />',
                '                <button id="captchaRefresh" type="button"><img alt="Refresh" src="'+Lib.AssetUrl+'ui/s/refresh.png" width="20" height="22" /></button>',
                '            </li>',
                '            <li><label for="captchaSolution">Answer:</label><input type="text" id="captchaSolution" /></li>',
                '        </ul>',
                '        <div id="captchaMessage" class="alert">&nbsp;</div>',
                '    </form>',
                '</div>'
            ].join('');
        },
        show : function(retry, fail) {
            this.build();
            this._retry = retry;
            this._fail = fail;
            this.refreshCaptcha();
            this.Dialog.bringToTop();
        },
        solveCaptcha : function() {
            require('js/actions/menu/loader').show();
            Game.Services.Captcha.solve({
                session_id : Game.GetSession(),
                captcha_guid : this._captcha_guid,
                captcha_solution : this.captchaSolution.value
            },{
                success : function(o) {
                    require('js/actions/menu/loader').hide();
                    this.Dialog.hide();
                    this._retry();
                },
                failure : function(o) {
                    this.refreshCaptcha();
                    this.setError(o.error.message);
                    return true;
                },
                scope : this
            });
        },
        refreshCaptcha: function() {
            require('js/actions/menu/loader').show();
            Game.Services.Captcha.fetch({session_id:Game.GetSession()},{
                success : function(o) {
                    var t = this;
                    var image = new Image();
                    image.onload = function() {
                        t._captcha_guid = o.result.guid;
                        t.captchaImage.src = o.result.url;
                        t.captchaSolution.value = '';
                        require('js/actions/menu/loader').hide();
                        t.Dialog.show();
                    };
                    image.src = o.result.url;
                },
                scope : this
            });
        },
        cancel : function() {
            this.Dialog.hide();
        },
        setError : function(msg) {
            this.captchaSolution.value = "";
            this.captchaSolution.focus();
            this.captchaMessage.innerHTML = msg;
            var a = new Util.Anim(this.captchaMessage, {opacity:{from:1,to:0}}, 4);
            a.onComplete.subscribe(function(){
                this.captchaMessage.innerHTML = "&nbsp;";
            }, this, true);
            a.animate();
        }
    };

    Lacuna.Captcha = new Captcha();
})();
YAHOO.register("captcha", YAHOO.lacuna.Captcha, {version: "1", build: "0"});

}
// vim: noet:ts=4:sw=4
