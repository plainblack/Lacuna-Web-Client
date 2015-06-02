YAHOO.namespace("lacuna.buildings");

if (typeof YAHOO.lacuna.buildings.BlackHoleGenerator == "undefined" ||
           !YAHOO.lacuna.buildings.BlackHoleGenerator) {
  
(function(){
  var Lang = YAHOO.lang,
    Util = YAHOO.util,
    Dom = Util.Dom,
    Event = Util.Event,
    Sel = Util.Selector,
    Pager = YAHOO.widget.Paginator,
    Lacuna = YAHOO.lacuna,
    Game = Lacuna.Game,
    Lib = Lacuna.Library;

  var BlackHoleGenerator = function(result){
    BlackHoleGenerator.superclass.constructor.call(this, result);
    
    this.service = Game.Services.Buildings.BlackHoleGenerator;
  };
  
  Lang.extend(BlackHoleGenerator, Lacuna.buildings.Building, {
    getChildTabs : function() {
      return [this._getBHGTab()];
    },
    _getBHGTab : function() {
      var zoneOptions = "";
      var zones = this.result.task_options.zones;
      for (var i=0; i<zones.length; i++) {
        zoneOptions += '<option value="' + zones[i] + '">' + zones[i] + '</option>';
      }
      
      this.tab = new YAHOO.widget.Tab({ label: "Singularity", content: [
        '<div id="bhgContainer">',
        '  Target <select id="bhgTargetType">',
        '    <option value="body_name">Body Name</option>',
        '    <option value="body_id">Body Id</option>',
        '    <option value="star_name">Star Name</option>',
        '    <option value="star_id">Star Id</option>',
        '    <option value="xy">X,Y</option>',
        '    <option value="zone">Zone (X|Y)</option>',
        '  </select>',
        '  <span id="bhgTargetSelectText"><input type="text" id="bhgTargetText" /></span>',
        '  <span id="bhgTargetSelectXY" style="display:none;">',
        '    X:<input size="5" type="text" id="bhgTargetX" />',
        '    Y:<input size="5" type="text" id="bhgTargetY" />',
        '  </span>',
        '  <span id="bhgTargetSelectZone" style="display:none;">',
        '    <select id="bhgTargetZone"><option value="">Select Zone</option>',
               zoneOptions,
        '    </select>',
        '  </span>',
        '  <button type="button" id="bhgGetActions">Get Actions</button>',
        '  <div id="bhgTaskInfo"></div>',
        '  <div id="bhgActions" style="display:none;border-top:1px solid #52ACFF;margin-top:5px;padding-top:5px">',
        '    Singularity Target: <span id="bhgTargetNote"></span>',
        '    <div style="border-top:1px solid #52ACFF;margin-top:5px;">',
        '      <ul id="bhgActionsAvail"></ul>',
        '    </div>',
        '    <div style="border-top:1px solid #52ACFF;margin-top:5px;">',
        '      <ul id="bhgResult"></ul>',
		'    </div>',
		'  </div>',
        '</div>',
		'<div id="bhgWorkingContainer">',
        '  <ul>',
        '    <li>Cool-down time remaining: <span id="bhgCooldownTime"></span></li>',
        '    <li>You may subsidize the cool-down for 2 <img src="',Lib.AssetUrl,'ui/s/essentia.png" class="smallEssentia" />.</li>',
        '    <li><button type="button" id="bhgCooldownSubsidize">Subsidize</button></li>',
        '  </ul>',
        '</div>'
      ].join('')});
	  
	  this.tab.subscribe("activeChange", function(e) {
        if(e.newValue) {
          this.checkIfWorking();
        }
      }, this, true);

      Event.on("bhgTargetType", "change", function(){
        if(Lib.getSelectedOptionValue(this) == "xy") {
          Dom.setStyle("bhgTargetSelectText", "display", "none");
          Dom.setStyle("bhgTargetSelectXY", "display", "");
          Dom.setStyle("bhgTargetSelectZone", "display", "none");
        }
        else if(Lib.getSelectedOptionValue(this) == "zone") {
          Dom.setStyle("bhgTargetSelectText", "display", "none");
          Dom.setStyle("bhgTargetSelectXY", "display", "none");
          Dom.setStyle("bhgTargetSelectZone", "display", "");
        }
        else {
          Dom.setStyle("bhgTargetSelectText", "display", "");
          Dom.setStyle("bhgTargetSelectXY", "display", "none");
          Dom.setStyle("bhgTargetSelectZone", "display", "none");
        }
      });
      Event.on("bhgGetActions", "click", this.bhgGetActions, this, true);
	  Event.on("bhgCooldownSubsidize", "click", this.cooldownSubsidize, this, true);
	  
      return this.tab;
    },
    bhgGetActions : function() {
      require('js/actions/menu/loader').show();
      
      Dom.setStyle("bhgActions", "display", "none");
      
      var type = Lib.getSelectedOptionValue("bhgTargetType"),
          target = {};
      
      if(type == "xy") {
        target.x = Dom.get("bhgTargetX").value;
        target.y = Dom.get("bhgTargetY").value;
        Dom.get("bhgTargetNote").innerHTML = ['X: ', target.x, ', Y: ', target.y].join('');
      }
      else if (type == "zone") {
        target.zone = Dom.get("bhgTargetZone").value;
        Dom.get("bhgTargetNote").innerHTML = ['Zone: ', target.zone].join('');
      }
      else {
        target[type] = Dom.get("bhgTargetText").value;
        Dom.get("bhgTargetNote").innerHTML = target[type];
      }
      
      this.service.get_actions_for({
        session_id: Game.GetSession(),
        building_id: this.building.id,
        target: target
      }, {
        success : function(o){
          require('js/actions/menu/loader').hide();
          this.rpcSuccess(o);
          this.PopulateBHGTab(target, o.result.tasks);
        },
        scope:this
      });
    },
    PopulateBHGTab : function(target, actions) {
      var details = Dom.get("bhgActionsAvail"),
          detailsParent = details.parentNode,
          li = document.createElement("li");

        
      Event.purgeElement(details, true); //clear any events before we remove
      details = detailsParent.removeChild(details); //remove from DOM to make this faster
      details.innerHTML = "";
      
      Dom.setStyle("bhgActions", "display", "");
      Dom.setStyle(detailsParent, "display", "");
      Dom.setStyle( Dom.get("bhgResult").parentNode, "display", "none");
      
      if(actions.length === 0) {
        details.innerHTML = "No available actions for singularity.";
      }
      else {        
        for(var i=0; i<actions.length; i++) {
          var task = actions[i],
              nLi = li.cloneNode(false);
          var waste_out;
          if (task.waste_cost < 1000000000) {
            waste_out = [ Lib.formatNumber(task.waste_cost/1000000), 'M' ].join('');
          }
          else {
            waste_out = [ Lib.formatNumber(task.waste_cost/1000000000), 'B' ].join('');
          }
          
          var canGenerate = 1;
          if ( task.success === 0 ) {
            canGenerate = 0;
          }
          
          var typeSelector = "";
          if ( task.name === "Change Type" ) {
            var label = task.body_type == 'asteroid' ? 'Asteroid'
                      :                                'Planet';
            
            typeSelector = '<select id="bhgChangeTypeSelect"><option value="">New '+label+' Type</option>';
            
            var options = task.body_type == 'asteroid' ? this.result.task_options.asteroid_types
                        :                                this.result.task_options.planet_types;
            
            for (var j=0; j<options.length; j++) {
              typeSelector = typeSelector + [
                '<option value="', options[j], '">', options[j], '</option>'
              ].join('');
            }
            
            typeSelector = typeSelector + '</select>';
          }
          
          nLi.Task = task;
          nLi.innerHTML = [
            '<div class="yui-gd" style="margin-bottom:2px; border: 1px white solid; padding: 2px">',
            '  <div class="yui-u first" style="width:70%">',
            '    <label style="font-weight:bold;">',task.name,'</label>',
            '    <div>',
            '      Distance: ',task.dist,', ',
            '      Range: ',task.range,
            '    </div>',
            '    <div>',
            '      Base Chance: ',100-task.base_fail,'%,',
            '      Success Chance: ',task.success,'%,',
			'      Cost to subsidize: ',task.essentia_cost,'<br/>',
            '      Waste Needed: ',waste_out,
            '      Recovery Time: ',Lib.formatTime(task.recovery),
            '    </div>',
            '  </div>',
            '  <div class="yui-u" style="width:25%; text-align:right;">',
                 canGenerate === 1
                   ? typeSelector + '<button type="button" name="generate">Generate</button><button type="button" name="subsidize">Subsidize</button>'
                   : '<b>',task.reason,'</b>',
            '  </div>',
            '</div>'].join('');
          
          details.appendChild(nLi);
          
          if ( task.success > 0 ) {
            Event.on(Sel.query("button[name=generate]", nLi, true),
                     "click",
                     this.bhgGenerate,
                     {Self:this, Target:target, Task:task, building_id: this.building_id},
                     true);
			
			Event.on(Sel.query("button[name=subsidize]", nLi, true),
                     "click",
                     this.bhgGenerate,
                     {Self:this, Target:target, Task:task, building_id: this.building_id, subsidize: true},
                     true);
          }
        }
      }
      detailsParent.appendChild(details); //add back as child

      //wait for tab to display first
      setTimeout(function() {
        var Ht = Game.GetSize().h - 250;
        if(Ht > 250) { Ht = 250; }
        Dom.setStyle(detailsParent,"height",Ht + "px");
        Dom.setStyle(detailsParent,"overflow-y","auto");
      },10);
      return this.tab;
    },
    bhgGenerate   : function(e) {
      var oSelf = this.Self,
        target = this.Target,
        task = this.Task;
	  
      if (target) {
        var rpcParams = {
          session_id:Game.GetSession(),
          building_id:oSelf.building.id,
          target:target,
          task_name:task.name
        };
		
		if (this.subsidize) {
			rpcParams.subsidize = 1;
		}
        
        if (task.name === "Change Type") {
          var selectValue = Lib.getSelectedOptionValue("bhgChangeTypeSelect");
          
          if ( selectValue == "" ) {
            alert("Please select Type");
            return;
          }
          
          rpcParams.params = {
            newtype: selectValue
          };
        }
        
        this.Self.service.generate_singularity(
          {params : rpcParams },
          {success : function(o){
            require('js/actions/menu/loader').hide();
            this.Self.rpcSuccess(o);
            this.Self.PopulateBHGResult(target, o.result.effect);
          },
          scope:this
          });
      }
    },
    PopulateBHGResult : function(target, effect) {
      var details = Dom.get("bhgResult"),
        detailsParent = details.parentNode,
        li = document.createElement("li");
        
      Event.purgeElement(details, true); //clear any events before we remove
      details = detailsParent.removeChild(details); //remove from DOM to make this faster
      details.innerHTML = "";
      
      Dom.setStyle( Dom.get("bhgActionsAvail").parentNode, "display", "none");
      
      Dom.setStyle(detailsParent, "display", "");
      detailsParent.appendChild(details); //add back as child
      
      if (effect.fail) {
        var nLi = li.cloneNode(false);
        nLi.innerHTML = [ '<div class="yui-gd" style="margin-bottom:2px;">',
          '  <div style="border:1px white solid;" class="yui-u" style="width:100%">',
          '    <label style="font-weight:bold;">Failure</label>',
          '    <div>',effect.fail.message,' at ',effect.fail.name,'</div>',
          '  </div></div>',
        ].join('');
        details.appendChild(nLi);
      }
      else {
        // success
        if (effect.target) {
          var nLi = li.cloneNode(false);
          nLi.innerHTML = this.bhgParseResult(effect.target, 'Success');
          details.appendChild(nLi);
        }
        if (effect.side) {
          var nLi = li.cloneNode(false);
          nLi.innerHTML = this.bhgParseResult(effect.side, 'Side-Effect');
          details.appendChild(nLi);
        }
      }
              
      //wait for tab to display first
      setTimeout(function() {
        var Ht = Game.GetSize().h - 250;
        if(Ht > 250) { Ht = 250; }
        Dom.setStyle(detailsParent,"height",Ht + "px");
        Dom.setStyle(detailsParent,"overflow-y","auto");
      },10);
    },
    bhgParseResult : function(result, type) {
        var out = [ '<div class="yui-gd" style="margin-bottom:2px;">',
          '  <div style="border:1px white solid;" class="yui-u" style="width:100%">',
          '    <label style="font-weight:bold;">',type,'</label>',
          '    <div>'
        ].join('');
        
        if ( result.message === "Swapped Places" ) {
            out = out + [
                result.message, ' with ', result.swapname,
                ' at orbit ', result.orbit
            ].join('');
        }
        else if ( result.message === "Changed Size" ) {
            out = out + [
                result.name, ' changed size from ', result.old_size, ' to ', result.size
            ].join('');
        }
        else if ( result.message === "Changed Type" ) {
            var newtype = result['class'].replace( new RegExp(".*::", "g"), "" );
            out = out + [
                result.name, ' changed to type ', newtype, ' planet'
            ].join('');
        }
        else if ( result.message === "Made Asteroid" ) {
            var newtype = result['class'].replace( new RegExp(".*::", "g"), "" );
            out = out + [
                result.name, ' is now a type ', newtype, ' asteroid of size ',
                result.size
            ].join('');
        }
        else if ( result.message === "Made Planet" ) {
            var newtype = result['class'].replace( new RegExp(".*::", "g"), "" );
            out = out + [
                result.name, ' is now a type ', newtype, ' planet of size ',
                result.size
            ].join('');
        }
        else {
            out = out + [
                result.message, ' at ', result.name
            ].join('');
        }
        
        out = out + '  </div></div></div>';
        
        return out;
    },
	checkIfWorking : function() {
      if(this.work && this.work.seconds_remaining) {
        Dom.setStyle("bhgContainer", "display", "none");
        Dom.setStyle("bhgWorkingContainer", "display", "");
        this.populateCooldownTimer(this.work.seconds_remaining);
      }
      else {
        Dom.setStyle("bhgContainer", "display", "");
        Dom.setStyle("bhgWorkingContainer", "display", "none");
      }
    },
	populateCooldownTimer : function(seconds_remaining) {
      this.addQueue(seconds_remaining, this.cooldownQueue, "bhgCooldownTime");
    },
	cooldownQueue : function(remaining, el){
      if(remaining <= 0) {
        var span = Dom.get(el),
          p = span.parentNode;
        p.removeChild(span);
        p.innerHTML = "Cool-down Complete";
      }
      else {
        Dom.get(el).innerHTML = Lib.formatTime(Math.round(remaining));
      }
    },
	cooldownSubsidize : function() {
      require('js/actions/menu/loader').show();
      
      this.service.subsidize_cooldown({
        session_id:Game.GetSession(),
        building_id:this.building.id
      }, {
        success : function(o){
          require('js/actions/menu/loader').hide();
          this.rpcSuccess(o);

          delete this.work;
          this.updateBuildingTile(o.result.building);
          this.resetQueue();
          Dom.get("bhgCooldownTime").innerHTML = "";
          this.checkIfWorking();
        },
        scope:this
      });
    }
  });
  
  YAHOO.lacuna.buildings.BlackHoleGenerator = BlackHoleGenerator;

})();
YAHOO.register("blackholegenerator", YAHOO.lacuna.buildings.BlackHoleGenerator, {version: "1", build: "0"}); 

}

// vim: noet:ts=4:sw=4
