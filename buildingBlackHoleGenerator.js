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
      this.tab = new YAHOO.widget.Tab({ label: "Singularity", content: [
        '<div id="bhg">',
        '  Target <select id="bhgTargetType">',
        '    <option value="body_name">Body Name</option>',
        '    <option value="body_id">Body Id</option>',
        '    <option value="xy">X,Y</option>',
        '  </select>',
        '  <span id="bhgTargetSelectText"><input type="text" id="bhgTargetText" /></span>',
        '  <span id="bhgTargetSelectXY" style="display:none;">',
        '    X:<input size="5" type="text" id="bhgTargetX" />',
        '    Y:<input size="5" type="text" id="bhgTargetY" />',
        '  </span>',
        '  <button type="button" id="bhgGetActions">Get Actions</button>',
        '  <div id="bhgTaskInfo"></div>',
        '  <div id="bhgActions" style="display:none;border-top:1px solid #52ACFF;margin-top:5px;padding-top:5px">',
        '  Singularity Target: <span id="bhgTargetNote"></span><span id="bhgTargetDist"></span>',
        '  <div style="border-top:1px solid #52ACFF;margin-top:5px;">',
        '    <ul id="bhgActionsAvail"></ul>',
        '  </div>',
        '  <div id="bhgResult"></div>',
        '</div>'
      ].join('')});

      Event.on("bhgTargetType", "change", function(){
        if(Lib.getSelectedOptionValue(this) == "xy") {
          Dom.setStyle("bhgTargetSelectText", "display", "none");
          Dom.setStyle("bhgTargetSelectXY", "display", "");
        }
        else {
          Dom.setStyle("bhgTargetSelectText", "display", "");
          Dom.setStyle("bhgTargetSelectXY", "display", "none");
        }
      });
      Event.on("bhgGetActions", "click", this.bhgGetActions, this, true);
      return this.tab;
    },
    bhgGetActions : function() {
      Lacuna.Pulser.Show();
      
      Dom.setStyle("bhgActions", "display", "none");
      
      var type = Lib.getSelectedOptionValue("bhgTargetType"),
          target = {};
      
      if(type == "xy") {
        target.x = Dom.get("bhgTargetX").value;
        target.y = Dom.get("bhgTargetY").value;
        Dom.get("bhgTargetNote").innerHTML = ['X: ', target.x, ', Y: ', target.y].join('');
        target.method = "xy";
      }
      else {
        target[type] = Dom.get("bhgTargetText").value;
        Dom.get("bhgTargetNote").innerHTML = target[type];
        target.method = type;
      }
      
      this.service.get_actions_for({
        session_id:Game.GetSession(),
        building_id:this.building.id,
        target:target
      }, {
        success : function(o){
          Lacuna.Pulser.Hide();
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
      
      if(actions.length === 0) {
        details.innerHTML = "No available actions for singularity.";
      }
      else {        
        Dom.get("bhgTargetDist").innerHTML = [
          ' ; Dist: ', actions[0].dist, ' Range: ', actions[0].range, ' <b>Note: The Generate Buttons do not work</b>'].join('');
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
            
          nLi.Task = task;
          nLi.innerHTML = [
            '<div class="yui-gd" style="margin-bottom:2px;">',
            '  <div style="border:2px gold solid;" class="yui-u" style="width:80%">',
                 task.success > 0 ?
            '    <button type="button" id="bhgGenerateButton">Generate</button>' : '',
            '    <label style="font-weight:bold;"><span id="bhgTaskName">',task.name,'</span></label>',
                 task.name === "Change Type" ? 
            '    <span id="bhgChangeTypeSelectText"><b>:</b><input type="number" id="bhgChangeTypeText" /></span>' : '',
            '    <div>',
            '      Base Chance: ',100-task.base_fail,'%,',
            '      Success Chance: ',task.success,'%,<br>',
            '      Waste Needed: ',waste_out,
            '      Recovery Time: ',Lib.formatTime(task.recovery),
            '    </div>',
            '  <div>',
            '</div>'].join('');
          
          details.appendChild(nLi);
        }
      }
      detailsParent.appendChild(details); //add back as child
//      Event.on("bhgGenerateButton",
//               "click",
//               this.bhgGenerate(target), true);

      //wait for tab to display first
      setTimeout(function() {
        var Ht = Game.GetSize().h - 250;
        if(Ht > 250) { Ht = 250; }
        Dom.setStyle(detailsParent,"height",Ht + "px");
        Dom.setStyle(detailsParent,"overflow-y","auto");
      },10);
      return this.tab;
    },
    bhgGenerate   : function(target) {
       var params = {};

      
      params.newtype = 11;
      var mytask = Lib.getSelectedOptionValue("bhgTaskName");
      if (mytask === "Change Type") {
        params.newtype = Lib.getSelectedOptionValue("bhgChangeTypeText");
      }
      else {
        params.newtype = 9;
      }
      alert('task: ' + mytask + '\n' +
            'target: ' + target.method + '\n' +
            'params: ' + params.newtype);
      if (target) {
        this.service.generate_singularity({
          session_id:Game.GetSession(),
          building_id:this.building.id,
          target:target,
          task:mytask,
          params:params,
        }, {
        success : function(o){
          Lacuna.Pulser.Hide();
          this.rpcSuccess(o);
          this.PopulateBHGResult(target, o.result.effect);
        },
          scope:this
        });
      }
      else {
        btn.disabled = false;
      }
    },
    PopulateBHGResult : function(target, effect) {
      var details = Dom.get("bhgResult"),
        detailsParent = details.parentNode,
        li = document.createElement("li");
        
      Event.purgeElement(details, true); //clear any events before we remove
      details = detailsParent.removeChild(details); //remove from DOM to make this faster
      details.innerHTML = "";
      
      Dom.setStyle("bhgResult", "display", "");
      detailsParent.appendChild(details); //add back as child
      
      if (effect.target) {
        var details = effect.target;
        nLi.innerHTML = [ '<div class="yui-gd" style="margin-bottom:2px;">',
          '  <div style="border:2px gold solid;" class="yui-u" style="width:67%">',
          '    <div><label style="font-weight:bold;">',details.message,'</label></div>',
        ].join('');
      }
      if (effect.side) {
        var details = effect.target;
        nLi.innerHTML = [ '<div class="yui-gd" style="margin-bottom:2px;">',
          '  <div style="border:2px gold solid;" class="yui-u" style="width:67%">',
          '    <div><label style="font-weight:bold;">',details.message,'</label></div>',
        ].join('');
      }
      if (effect.fail) {
        var details = effect.target;
        nLi.innerHTML = [ '<div class="yui-gd" style="margin-bottom:2px;">',
          '  <div style="border:2px gold solid;" class="yui-u" style="width:67%">',
          '    <div><label style="font-weight:bold;">',details.message,'</label></div>',
        ].join('');
      }
              
      //wait for tab to display first
      setTimeout(function() {
        var Ht = Game.GetSize().h - 250;
        if(Ht > 250) { Ht = 250; }
        Dom.setStyle(detailsParent,"height",Ht + "px");
        Dom.setStyle(detailsParent,"overflow-y","auto");
      },10);
    }
  });
  
  YAHOO.lacuna.buildings.BlackHoleGenerator = BlackHoleGenerator;

})();
YAHOO.register("blackholegenerator", YAHOO.lacuna.buildings.BlackHoleGenerator, {version: "1", build: "0"}); 

}
// vim: noet:ts=4:sw=4
