YAHOO.namespace("lacuna");

if (typeof YAHOO.lacuna.Messaging == "undefined" || !YAHOO.lacuna.Messaging) {
	
(function(){
	var Lang = YAHOO.lang,
		Util = YAHOO.util,
		Cookie = Util.Cookie,
		Dom = Util.Dom,
		Event = Util.Event,
		Sel = Util.Selector,
		Lacuna = YAHOO.lacuna,
		Game = Lacuna.Game;
		
	var Messaging = function() {
		this.createEvent("onRpc");
		this.createEvent("onRpcFailed");
		this._buildPanel();
	};
	Messaging.prototype = {
		_buildPanel : function() {
			var panelId = "messagingPanel";
			
			var panel = document.createElement("div");
			panel.id = panelId;
			panel.innerHTML = ['<div class="hd">Messaging</div>',
				'<div class="bd" style="overflow-y:scroll;">',
				'	<div id="messagingTabs"><ul class="clearafter">',
				'		<li id="messagingInbox">Inbox</li>',
				'		<li id="messagingSent">Sent</li>',
				'		<li id="messagingArchive">Archive</li>',
				'	</ul></div>',
				'	<div class="yui-gd">',
				'		<div class="yui-u first">',
				'			<ul id="messagingList"></ul>',
				'		</div>',
				'		<div class="yui-u">',
				'			<div id="messagingTimestamp"></div>',
				'			<div id="messagingFrom"></div>',
				'			<div id="messagingSubject"></div>',
				'			<div id="messagingDisplay"></div>',
				'		</div>',
				'	</div>',
				'</div>'].join('');
			document.body.insertBefore(panel, document.body.firstChild);
			
			this.messagingPanel = new YAHOO.widget.Panel(panelId, {
				constraintoviewport:true,
				visible:false,
				draggable:true,
				fixedcenter:true,
				close:true,
				width:"700px",
				height:"400px",
				zIndex:9999
			});
			
			this.messagingPanel.renderEvent.subscribe(function(){
				this.inbox = Dom.get("messagingInbox");
				this.sent = Dom.get("messagingSent");
				this.archive = Dom.get("messagingArchive");
				this.list = Dom.get("messagingList");
				this.timestamp = Dom.get("messagingTimestamp");
				this.from = Dom.get("messagingFrom");
				this.subject = Dom.get("messagingSubject");
				this.display = Dom.get("messagingDisplay");
			});
			
			this.messagingPanel.render();
		},
		
		loadMessages : function() {
			var InboxServ = Game.Services.Inbox,
				data = {
					session_id: Cookie.getSub("lacuna","session") || "",
					page_number: 1
				};
			InboxServ.view_inbox(data, {
				success : function(o){
					this.fireEvent("onRpc", o.result);
					this.processMessages(o.result);
				},
				failure : function(o){
					YAHOO.log(o, "error", "Messaging.loadMessages");
					this.fireEvent("onRpcFailed", o);
				},
				timeout:Game.Timeout,
				scope:this
			});
		},
		processMessages : function(results) {
			YAHOO.log(results, "info", "Messaging.processMessages");
			var list = this.messagingPanel.list,
				messages = results.messages,
				li = document.createElement("li");
			
			Event.purgeElement(list, true);
			list.innerHTML = "";
			
			for(var i=0; i<messages.length; i++) {
				var msg = messages[i],
					nLi = li.cloneNode(false),
					dt = new Date(msg.date);
				nLi.Message = msg;
				nLi.innerHTML = [
					'	<div style="padding-left:25px;">',
					'		<div class="clearafter">',
					'			<div class="messageDate">',Util.Date.format(dt, {format:"%m/%d/%Y %r"}, "en"),'</div>',
					'			<div class="messageFrom">',msg.from,'</div>',
					'		</div>',
					'		<div class="messageSubject">',msg.subject,'</div>',
					'		<div class="messageExcerpt">',msg.subject,'</div>',
					'	</div>',
					].join('');
				list.appendChild(nLi);
			}
		},
		
		isVisible : function() {
			return this.messagingPanel.cfg.getProperty("visible");
		},
		show : function() {
			this.messagingPanel.show();
			this.loadMessages();
		},
		hide : function() {
			this.messagingPanel.hide();
		}
	};
	Lang.augmentProto(Messaging, Util.EventProvider);
			
	Lacuna.Messaging = new Messaging();
})();
YAHOO.register("messaging", YAHOO.lacuna.Messaging, {version: "1", build: "0"}); 

}