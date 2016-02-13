YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.CreateEmpire == "undefined" || !YAHOO.lacuna.CreateEmpire) {
    
(function(){
    var Util = YAHOO.util,
        Cookie = Util.Cookie,
        Dom = Util.Dom,
        Event = Util.Event,
        Lacuna = YAHOO.lacuna,
        Game = Lacuna.Game,
        Lib = Lacuna.Library;

    var CreateEmpire = function(Login) {
        this.id = "createEmpire";
        this._login = Login;
        this.createEvent("onCreateSuccessful");
        
        var container = document.createElement("div");
        container.id = this.id;
        Dom.addClass(container, "hidden");
        container.innerHTML = [
        '    <div class="hd">Create Empire</div>',
        '    <div class="bd">',
        '        <form name="empireForm" autocomplete="no">',
        '            <div style="overflow: hidden">',
        '                <ul style="float:left">',
        '                    <li><label for="empireName" title="Empire name must be between 3 and 30 characters and cannot contain the characters @, &amp;, <, >, or ;"><span class="requiredField">* </span>Empire Name</label><input type="text" id="empireName" maxlength="30" /></li>',
        '                    <li class="empirePassword"><label for="empirePass" title="Password must be between 6 and 30 characters long."><span class="requiredField">* </span>Password</label><input type="password" id="empirePass" maxlength="30"/></li>',
        '                    <li class="empirePassword"><label for="empirePassConfirm" title="Must be the same as the password"><span class="requiredField">* </span>Password Confirm</label><input type="password" id="empirePassConfirm" /></li>',
        '                    <li class="empireEmail"><label for="empireEmail" title="Used for password recovery and otifications.">EMail</label><input type="text" id="empireEmail" /></li>',
        '                    <li class="empireDesc"><label for="empireDesc" title="Description of your empire to show to other players.">Description</label><textarea id="empireDesc"></textarea></li>',
        '                    <li class="empireFriendCode"><label for="empireFriendCode" title="If you don\'t have a friend invite code, this can be ignored.">Friend Invite Code</label><input type="text" id="empireFriendCode" /></li>',
        '                </ul>',
        '                <ul style="float:right">',
        '                    <li class="empireCaptcha"><span id="empireCaptchaBorder"><img alt="" width="300" height="80" src="" id="empireCaptchaImage" /></span><button id="empireRefreshCaptcha" type="button"><img alt="Refresh" src="'+Lib.AssetUrl+'ui/s/refresh.png" /></button></li>',
        '                    <li class="empireCaptcha"><span class="requiredField">* </span><label for="empireCaptcha">Answer: </label><input type="text" id="empireCaptcha" /></li>',
        '                    <li class="empireAgreeCheck"><span class="requiredField">* </span><input type="checkbox" id="empireAgreeTOS" /><label for="empireAgreeTOS">I agree to the <a href="http://www.lacunaexpanse.com/terms/" target="_blank">Terms of Service</a>.</label></li>',
        '                    <li class="empireAgreeCheck"><span class="requiredField">* </span><input type="checkbox" id="empireAgreeRules" /><label for="empireAgreeRules">I agree to abide by <a href="http://www.lacunaexpanse.com/rules/" target="_blank">the rules</a>.</label></li>',
        '                    <li class="requiredField">* Required field</li>',
        '                </ul>',
        '            </div>',
        '            <div id="empireMessage" class="hidden"></div>',
        '        </form>',
        '    </div>',
        '    <div class="ft"></div>'
        ].join('');
        document.body.insertBefore(container, document.body.firstChild);
        
        this.Dialog = new YAHOO.widget.Dialog(this.id, {
            constraintoviewport:true,
            fixedcenter:true,
            postmethod:"none",
            visible:false,
            buttons:[ { text:"Create", handler:{fn:this.handleCreate, scope:this}, isDefault:true },
                { text:"Cancel", handler:{fn:this.handleCancel, scope:this}}],
            draggable:false,
            effect:Game.GetContainerEffect(),
            modal:false,
            close:false,
            width:"750px",
            underlay:false,
            zIndex:9999
        });
        this.Dialog.renderEvent.subscribe(function(){
            //get el's after rendered
            this.elName = Dom.get("empireName");
            this.elDesc = Dom.get("empireDesc");
            this.elEmail = Dom.get("empireEmail");
            this.elFriendCode = Dom.get("empireFriendCode");
            this.elPass = Dom.get("empirePass");
            this.elPassConfirm = Dom.get("empirePassConfirm");
            this.elAgreeTOS = Dom.get("empireAgreeTOS");
            this.elAgreeRules = Dom.get("empireAgreeRules");
            this.elMessage = Dom.get("empireMessage");
            this.elCaptchaImage = Dom.get("empireCaptchaImage");
            this.elCaptcha = Dom.get("empireCaptcha");
            Event.on(this.elCaptchaImage, 'load', function(){Dom.setStyle(this, 'visibility', 'inherit');} );
            Event.on('empireRefreshCaptcha', 'click', function(e){Event.stopEvent(e);this.refreshCaptcha();}, this, true);
            
            Dom.removeClass(this.id, Lib.Styles.HIDDEN);
        }, this, true);
        this.Dialog.cfg.queueProperty("keylisteners", new YAHOO.util.KeyListener("empirePassConfirm", { keys:13 }, { fn:this.handleCreate, scope:this, correctScope:true } )); 
        this.Dialog.render();
        Game.OverlayManager.register(this.Dialog);
        
        this.initSpecies();
    };
    CreateEmpire.prototype = {
        refreshCaptcha : function() {
            Dom.setStyle(this.elCaptchaImage, 'visibility' , 'hidden');
            Game.Services.Empire.fetch_captcha({},{
                success : function(o){
                    YAHOO.log(o, "info", "RefreshCaptcha");
                    this.captchaGUID = o.result.guid;
                    this.elCaptchaImage.src = o.result.url;
                },
                failure : function(o){
                    this.setMessage(o.error.message);
                    return true;
                },
                scope:this
            });
        },
        
        handleCreate : function() {
            if (! this.elAgreeTOS.checked || ! this.elAgreeRules.checked) {
                this.setMessage("You must agree to the Terms of Service and the rules before registering.");
                return;
            }
            this.setMessage("");
            if(this.savedEmpire && this.savedEmpire.name == this.elName.value) {
                Game.SpeciesCreator.show(this.savedEmpire.id);
                this.hide(); //hide empire
            }
            else {
                require('js/actions/menu/loader').show();
                var EmpireServ = Game.Services.Empire,
                    data = {
                        name: this.elName.value,
                        description: this.elDesc.value,
                        email: this.elEmail.value
                    };
                if (this.facebook) {
                    data.facebook_uid = this.facebook.uid;
                    data.facebook_token = this.facebook.token;
                }
                else {
                    data.captcha_guid = this.captchaGUID;
                    data.captcha_solution = this.elCaptcha.value;
                }
                if (this.elPass.value.length > 0) {
                    data.password = this.elPass.value;
                    data.password1 = this.elPassConfirm.value;
                }
                if (this.elFriendCode.value.length > 0) {
                    data.invite_code = this.elFriendCode.value;
                }
                EmpireServ.create(data,{
                    success : function(o){
                        YAHOO.log(o, "info", "CreateEmpire");
                        this.savedEmpire = data;
                        this.savedEmpire.id = o.result;
                        Game.SpeciesCreator.show(o.result);
                        require('js/actions/menu/loader').hide();
                        this.hide(); //hide empire
                    },
                    failure : function(o){
                        this.setMessage(o.error.message);
                        if (o.error.code == 1014) {
                            this.captchaGUID = o.error.data.guid;
                            this.elCaptchaImage.src = o.error.data.url;
                            this.elCaptcha.value = '';
                            this.elCaptcha.focus();
                        }
                        else if (o.error.code == 1100) {
                            this.savedEmpire = data;
                            this.savedEmpire.id = o.error.data;
                            Game.SpeciesCreator.show(o.error.data.empire_id);
                            this.hide(); //hide empire
                        }
                        return true;
                    },
                    scope:this
                });
            }
        },
        handleCancel : function() {
            this.hide();
            this._login.show();
        },
        setMessage : function(str) {
            Dom.replaceClass(this.elMessage, Lib.Styles.HIDDEN, Lib.Styles.ALERT);
            this.elMessage.innerHTML = str;
        },
        facebookReturn : function(uid, token, name) {
            this.savedEmpire = undefined;
            this.elName.value = name + "'s Empire";
            this.elAgreeTOS.checked = false;
            this.elAgreeRules.checked = false;
            
            this.facebook = {
                uid: uid,
                token: token
            };
            
            Dom.addClass(this.id, 'facebookLogin');
            Game.OverlayManager.hideAll();
            this.Dialog.show();
        },
        show : function(doNotClear) {
            Game.OverlayManager.hideAll();
            Dom.removeClass(this.id, 'facebookLogin');
            delete this.facebook;
            if(!doNotClear) {
                this.savedEmpire = undefined;
                this.elName.value = "";
                this.elDesc.value = "";
                this.elEmail.value = "";
                this.elFriendCode.value = Cookie.get("lacunaReferral") || "";
                this.elPass.value = "";
                this.elPassConfirm.value = "";
                this.elAgreeTOS.checked = false;
                this.elAgreeRules.checked = false;
                this.elCaptcha.value = '';
            }
            this.refreshCaptcha();
            this.Dialog.show();
        },
        hide : function() {
            Dom.replaceClass(this.elMessage, Lib.Styles.ALERT, Lib.Styles.HIDDEN);
            this.Dialog.hide();
        },
        initSpecies : function() {
            if(!Game.SpeciesCreator) {
                Game.SpeciesCreator = new Lacuna.CreateSpecies(this);
                Game.SpeciesCreator.subscribe("onCreateSuccessful",function(oArgs) {
                    this.fireEvent("onCreateSuccessful",oArgs);
                }, this, true);
            }
        }
    };
    YAHOO.lang.augmentProto(CreateEmpire, Util.EventProvider);

    Lacuna.CreateEmpire = CreateEmpire;
})();
YAHOO.register("createEmpire", YAHOO.lacuna.CreateEmpire, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
