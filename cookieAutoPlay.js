//cookie bot: auto-play-through cookie clicker
var AutoPlay;

if(!AutoPlay) AutoPlay = {};
AutoPlay.version = "2.0"
AutoPlay.gameVersion = "2.0045";
AutoPlay.robotName="Automated ";
AutoPlay.delay=0;
AutoPlay.night=false;

AutoPlay.run = function () {
  if (Game.AscendTimer>0 || Game.ReincarnateTimer>0) return;
  if (AutoPlay.delay>0) { AutoPlay.delay--; return; }
  if (AutoPlay.nightMode()) { var age=Date.now()-Game.lumpT; AutoPlay.cheatSugarLumps(age); return; }
  AutoPlay.handleClicking();
  AutoPlay.handleGoldenCookies();
  AutoPlay.handleBuildings();
  AutoPlay.handleUpgrades();
  AutoPlay.handleSeasons();
  AutoPlay.handleSugarLumps();
  AutoPlay.handleDragon();
  AutoPlay.handleWrinklers();
  AutoPlay.handleAscend();
  AutoPlay.handleNotes();
}

//===================== Night Mode ==========================
AutoPlay.preNightMode = function() { var h=(new Date).getHours(); return(h>=22); }

AutoPlay.nightMode = function() { 
  var h=(new Date).getHours();
  if(h>=7 && h<23) { // be active
    if (AutoPlay.night) AutoPlay.useLump();
    AutoPlay.night=false;
    var gs=Game.Upgrades["Golden switch [on]"]; if(gs.unlocked) {
      if (Game.isMinigameReady(Game.Objects["Temple"])) {
        AutoPlay.removeSpirit(1,"asceticism");
//        AutoPlay.assignSpirit(1,"decadence",0);
//        AutoPlay.assignSpirit(2,"labor",0);
      } 
	  gs.buy();
	}
    return false;
  }
  if (AutoPlay.night) return true; //really sleep now
  var gs=Game.Upgrades["Golden switch [off]"]; if(gs.unlocked) {
    AutoPlay.handleGoldenCookies();
    var buffCount=0;
    for (var i in Game.buffs) { if(Game.buffs[i].time>=0) buffCount++; }
	if((buffCount==1 && Game.hasBuff("Clot")) || h<7) gs.buy();
	if(!gs.bought) return true; // do not activate spirits before golden switch
    if (Game.isMinigameReady(Game.Objects["Temple"])) {
//	  AutoPlay.assignSpirit(0,"mother",1); 
      AutoPlay.removeSpirit(1,"decadence");
      AutoPlay.removeSpirit(2,"labor");
      AutoPlay.assignSpirit(1,"asceticism",1);
      AutoPlay.assignSpirit(2,"industry",1);
    }
  }
  AutoPlay.night=true;
  return true;
}

//===================== Handle Cookies and Golden Cookies ==========================
AutoPlay.handleGoldenCookies = function() { // pop the first golden cookie or reindeer
  if(Game.shimmerTypes['golden'].n>=4 && !Game.Achievements['Four-leaf cookie'].won) return;
  for(sx in Game.shimmers) {
    var s=Game.shimmers[sx];
    if((s.type!="golden") || (s.life<Game.fps) || (!Game.Achievements["Early bird"].won)) { s.pop(); return; }
    if((s.life/Game.fps)<(s.dur-2) && (Game.Achievements["Fading luck"].won)) { s.pop(); return; }
} }

AutoPlay.handleClicking = function() {
  if (!Game.Achievements["Neverclick"].won && (Game.cookieClicks<=15) ) return;
  if (Game.ascensionMode==1 && AutoPlay.endPhase() && !Game.Achievements["True Neverclick"].won && (!Game.cookieClicks) ) return;
  if(!Game.Achievements["Uncanny clicker"].won) { for(i=1; i<6; i++) setTimeout(Game.ClickCookie, 50*i); }
  if (Game.ascensionMode==1 && Game.Achievements["Hardcore"].won) setTimeout(Game.ClickCookie, 150);
  Game.ClickCookie();
}

//===================== Handle Upgrades ==========================
AutoPlay.handleUpgrades = function() {
  if (!Game.Achievements["Hardcore"].won && Game.UpgradesOwned==0) return;
  Game.UpgradesById.forEach(function(e) { if (e.unlocked && !e.bought && e.canBuy() && !AutoPlay.avoidbuy(e)) { e.buy(true); } });
}

AutoPlay.avoidbuy = function(up) { //normally we do not buy 227, 71, 73, rolling pins
  switch(up.id) {
    case 71: return Game.Achievements["Elder nap"].won && Game.Achievements["Elder slumber"].won && Game.Achievements["Elder calm"].won && 
	  (!Game.Achievements["Reincarnation"].won || Game.Upgrades["Arcane sugar"].bought); // brainsweep
	case 73: return Game.Achievements["Elder nap"].won && Game.Achievements["Elder slumber"].won && Game.Achievements["Elder calm"].won; // elder pact
	case 74: return Game.Achievements["Elder nap"].won && Game.Achievements["Elder slumber"].won && Game.Upgrades["Elder Covenant"].unlocked; // elder pledge
	case 84: return Game.Upgrades["Elder Pledge"].bought; // elder covenant
//	case 85: return Game.Upgrades["Elder Covenant"].bought; // revoke elder covenant 
    case 227: return true; // choco egg
	default: return up.pool=="toggle";
} }

//===================== Handle Buildings ==========================
AutoPlay.handleBuildings = function() {
  var buyAmount=100, checkAmount=1;
  if ((Date.now()-Game.startDate) > 10*60*1000) buyAmount=1; // buy single after 10 minutes
  if (Game.resets && Game.ascensionMode!=1 && Game.isMinigameReady(Game.Objects["Temple"]) && Game.Objects["Temple"].minigame.slot[0]==10 // Rigidel is in slot 0
      && Game.BuildingsOwned%10==0 && (Date.now()-Game.startDate) > 2*60*1000) // do not use factor 10 in the first 2 minutes after descend
    buyAmount=checkAmount=10;
  var cpc=0; // relative strength of cookie production
  for(var i = Game.ObjectsById.length-1; i >= 0; i--){ var me = Game.ObjectsById[i]; var mycpc = me.storedCps / me.price; if (mycpc > cpc) { cpc = mycpc; } }; 
  for(i = Game.ObjectsById.length-1; i >= 0; i--) { 
    var me = Game.ObjectsById[i]; 
    if ((me.storedCps/me.price > cpc/2 || me.amount % 50 >= 40) && (me.getSumPrice(checkAmount)<Game.cookies)) { me.buy(buyAmount); return; }
  }
  if(Game.resets && Game.ascensionMode!=1 && Game.isMinigameReady(Game.Objects["Temple"]) && Game.Objects["Temple"].minigame.slot[0]==10 && Game.BuildingsOwned%10!=0) { // Rigidel is in slot 0, buy the cheapest
	var minIdx=0, minPrice=Game.ObjectsById[minIdx].price;
    for(var i = Game.ObjectsById.length-1; i >= 0; i--){ if (Game.ObjectsById[i].price < minPrice) { minPrice=Game.ObjectsById[i].price; minIdx=i; } }; 
	Game.ObjectsById[minIdx].buy();
} }

//===================== Handle Seasons ==========================
AutoPlay.handleSeasons = function() {
  if (!Game.Upgrades["Season switcher"].bought || Game.ascensionMode==1) return;
  if (AutoPlay.seasonFinished(Game.season)) {
    switch (Game.season) {
	  case "christmas": Game.Upgrades["Bunny biscuit"].buy(); break; // go to easter
	  case "easter": Game.Upgrades["Lovesick biscuit"].buy(); break; // go to valentine
	  case "valentines": Game.Upgrades["Ghostly biscuit"].buy(); break; // go to halloween
	  default: Game.Upgrades["Festive biscuit"].buy(); break; // go to christmas
  } }
  if (Game.Upgrades["A festive hat"].bought && ! Game.Upgrades["Santa's dominion"].unlocked) { // develop santa
    Game.specialTab="santa"; Game.UpgradeSanta(); Game.ToggleSpecialMenu(0);
} }

AutoPlay.valentineUpgrades = range(169,174);
AutoPlay.christmasUpgrades = [168].concat(range(152,166)).concat(range(143,149));
AutoPlay.easterUpgrades = range(210,229);
AutoPlay.halloweenUpgrades = range(134,140);
AutoPlay.allSeasonUpgrades = AutoPlay.valentineUpgrades.concat(AutoPlay.christmasUpgrades).concat(AutoPlay.easterUpgrades).concat(AutoPlay.halloweenUpgrades);

AutoPlay.allUnlocked = function(l) { return l.every(function (u) { return Game.UpgradesById[u].unlocked; }); }

AutoPlay.seasonFinished = function(s) {
  if (s == '') return true;
  switch (s) {
    case "valentines": return AutoPlay.allUnlocked(AutoPlay.valentineUpgrades);
	case "christmas": if (AutoPlay.allUnlocked(AutoPlay.allSeasonUpgrades)) return false; else return AutoPlay.allUnlocked(AutoPlay.christmasUpgrades);
	case "easter": return (Game.Achievements["Hide & seek champion"].won && (AutoPlay.allUnlocked(AutoPlay.easterUpgrades)));
	case "halloween": return AutoPlay.allUnlocked(AutoPlay.halloweenUpgrades);
	default: return true;
} }

//===================== Handle Sugarlumps ==========================
AutoPlay.level1Order=[6,7]; // unlocking in this order for the minigames
AutoPlay.level10Order=[7,14,13,12,11]; // finishing in this order
AutoPlay.levelAchievements=range(307,320).concat([336]);
AutoPlay.lumpRelatedAchievements=range(266,272).concat(AutoPlay.levelAchievements);

AutoPlay.handleSugarLumps = function() {
  if (Game.resets==0 || Game.ascensionMode==1) return; //do not work with sugar lumps when born again
  var age=Date.now()-Game.lumpT;
  if (age>=Game.lumpMatureAge && Game.lumpCurrentType==0 && !Game.Achievements["Hand-picked"].won) AutoPlay.harvestLump();
//  if(Game.lumpCurrentType==0) AutoPlay.farmGoldenSugarLumps(age); // not needed now, because we cheat sugar lumps
  if (age>=Game.lumpRipeAge) AutoPlay.harvestLump(); // normal harvesting, should check !masterCopy
  AutoPlay.cheatSugarLumps(age);
  AutoPlay.handleMinigames();
}

AutoPlay.cheatLumps=false;
AutoPlay.cheatSugarLumps = function(age) { // divide lump ripe time by 600, making hours into few minutes
  for(a in Game.AchievementsById) { var me=Game.AchievementsById[a]; if (!(me.won || me.pool=="dungeon" || AutoPlay.lumpRelatedAchievements.indexOf(me.id)>=0)) return; }
  AutoPlay.cheatLumps=true; // after checking that only lump related achievements are missing
  var cheatReduction=60*10;
  var cheatDelay=Game.lumpRipeAge/cheatReduction;
  if(age<Game.lumpRipeAge-cheatDelay) Game.lumpT-=cheatDelay*(cheatReduction-1);
  if (AutoPlay.nightMode() && age>Game.lumpRipeAge) { Game.lumpT-=60*60*1000; }
}

AutoPlay.harvestLump = function() { 
  Game.clickLump(); //could reload if golden lump and below 6 harvested (much work, little payback)
  AutoPlay.useLump();
}

AutoPlay.useLump = function() { // recursive call just needed if we have many sugar lumps
  for(i in AutoPlay.level1Order) { var me = Game.ObjectsById[AutoPlay.level1Order[i]]; if(!me.level && Game.lumps) { me.levelUp(); AutoPlay.useLump(); return; } };
  for(i in AutoPlay.level10Order) { var me = Game.ObjectsById[AutoPlay.level10Order[i]]; if(me.level<10) { if(me.level<Game.lumps) { me.levelUp(); AutoPlay.useLump(); } return; } };
  for(i = Game.ObjectsById.length-1; i >= 0; i--) { var me = Game.ObjectsById[i]; if(me.level<10 && me.level<Game.lumps) { me.levelUp(); AutoPlay.useLump(); return; } }; 
  for(i = Game.ObjectsById.length-1; i >= 0; i--) Game.ObjectsById[i].levelUp(); 
}

AutoPlay.copyWindows=[]; // need to init in the code some place
AutoPlay.masterSaveCopy=0;
AutoPlay.masterLoadCopy=0;
AutoPlay.copyCount=100;

// golden sugar lumps = 1 in 2000 (ordinary) -> about 5 years
AutoPlay.farmGoldenSugarLumps = function(age) { // //this is tested and it works (some kind of cheating) - do this only in endgame
  if(Game.Achievements["All-natural cane sugar"].won) return;
  if(AutoPlay.nextAchievement!=Game.Achievements["All-natural cane sugar"].id) return;
  if (AutoPlay.masterSaveCopy) { AutoPlay.debugInfo("back to save master"); Game.LoadSave(AutoPlay.masterSaveCopy); AutoPlay.masterSaveCopy=0; return; }
  if (age<Game.lumpRipeAge && age>=Game.lumpMatureAge) {
    if (AutoPlay.copyWindows.length>=AutoPlay.copyCount) { AutoPlay.debugInfo("creating master load copy"); AutoPlay.masterLoadCopy=Game.WriteSave(1); } // check rather !masterCopy
    if (AutoPlay.copyWindows.length) {
	  Game.LoadSave(AutoPlay.copyWindows.pop());
	  if (Game.lumpCurrentType) AutoPlay.debugInfo("found lump with type " + Game.lumpCurrentType);
	  if (Game.lumpCurrentType==2) {
	    AutoPlay.info("YESS, golden lump");
		AutoPlay.masterLoadCopy=0; AutoPlay.copyWindows=[];
	} } else if (AutoPlay.masterLoadCopy) { AutoPlay.debugInfo("going back to master copy"); Game.LoadSave(AutoPlay.masterLoadCopy); AutoPlay.masterLoadCopy=0; }
  }
  if (age>=Game.lumpRipeAge && AutoPlay.copyWindows.length<AutoPlay.copyCount) {
    if(!AutoPlay.copyWindows.length) AutoPlay.info("farming golden sugar lumps.");
    AutoPlay.masterSaveCopy=Game.WriteSave(1);
    Game.clickLump();
    AutoPlay.copyWindows.push(Game.WriteSave(1));
  }
}

AutoPlay.handleMinigames = function() {
  // wizard towers: grimoires
  if (Game.isMinigameReady(Game.Objects["Wizard tower"])) {
    var me=Game.Objects["Wizard tower"];
    var g=me.minigame;
    var sp=g.spells["hand of fate"]; // try to get a sugar lump in backfiring
	if(Game.shimmerTypes['golden'].n && g.magic>=g.getSpellCost(sp) && (g.magic/g.magicM >= 0.95)) { g.castSpell(sp); }
    if (Game.shimmerTypes['golden'].n == 2 && !Game.Achievements["Four-leaf cookie"].won && Game.lumps>0 && g.magic>=g.getSpellCost(sp)) { g.castSpell(sp); }
    if (Game.shimmerTypes['golden'].n == 3 && !Game.Achievements["Four-leaf cookie"].won) { g.lumpRefill.click(); g.castSpell(sp); } 
  }
  // temples: pantheon
  if (Game.isMinigameReady(Game.Objects["Temple"])) {
	var age=Date.now()-Game.lumpT;
    if(Game.lumpRipeAge-age < 61*60*1000 && !AutoPlay.cheatLumps) AutoPlay.assignSpirit(0,"order",0); 
	else if (AutoPlay.preNightMode() && Game.lumpOverripeAge-age < 9*60*60*1000 && (new Date).getMinutes()==59 && !AutoPlay.cheatLumps) AutoPlay.assignSpirit(0,"order",0);
	else AutoPlay.assignSpirit(0,"mother",0); 
    AutoPlay.assignSpirit(1,"decadence",0);
    AutoPlay.assignSpirit(2,"labor",0);
  }
}

AutoPlay.assignSpirit = function(slot, god, force) {
  var g=Game.Objects["Temple"].minigame;
  if(g.swaps+force<3) return;
  if(g.slot[slot]==g.gods[god].id) return;
  g.slotHovered=slot; g.dragging=g.gods[god]; g.dropGod();
}  

AutoPlay.removeSpirit = function(slot, god) {
  var g=Game.Objects["Temple"].minigame;
  if(g.slot[slot]!=g.gods[god].id) return;
  g.slotHovered=-1; g.dragging=g.gods[god]; g.dropGod();
}  

//===================== Handle Wrinklers ==========================
AutoPlay.handleWrinklers = function() {
  var doPop = (((Game.season == "easter") || (Game.season == "halloween")) && !AutoPlay.seasonFinished(Game.season));
  doPop = doPop || (Game.Upgrades["Unholy bait"].bought && !Game.Achievements["Moistburster"].won);
  doPop = doPop || (AutoPlay.endPhase() && !Game.Achievements["Last Chance to See"].won);
  if (doPop) Game.wrinklers.forEach(function(w) { if (w.close==1) w.hp = 0; } );
}

//===================== Handle Small Achievements ==========================
AutoPlay.backupHeight=0;
AutoPlay.handleSmallAchievements = function() {
  if(!Game.Achievements["Tabloid addiction"].won) { for (i = 0; i < 50; i++) { Game.tickerL.click(); } }
  if(!Game.Achievements["Here you go"].won) Game.Achievements["Here you go"].click();
  if(!Game.Achievements["Tiny cookie"].won) Game.ClickTinyCookie();
  if(!Game.Achievements["God complex"].won) { Game.bakeryName = "Orteil"; Game.bakeryNamePrompt(); Game.ConfirmPrompt(); }
  if(!Game.Achievements["What's in a name"].won || Game.bakeryName.slice(0,AutoPlay.robotName.length)!=AutoPlay.robotName) { 
    Game.bakeryName = AutoPlay.robotName+Game.bakeryName; Game.bakeryNamePrompt(); Game.ConfirmPrompt(); 
  }
  if(AutoPlay.endPhase() && !Game.Achievements["Cheated cookies taste awful"].won) Game.Win("Cheated cookies taste awful"); // only take this at the end, after all is done
  if(!Game.Achievements["Third-party"].won) Game.Win("Third-party"); // cookie bot is a third party itself
  if(!Game.Achievements["Cookie-dunker"].won && Game.milkProgress > 1 && Game.milkHd>0.34) {
	if(AutoPlay.backupHeight) { Game.LeftBackground.canvas.height=AutoPlay.backupHeight; AutoPlay.backupHeight=0; }
    else { AutoPlay.backupHeight=Game.LeftBackground.canvas.height; Game.LeftBackground.canvas.height=400; setTimeout(AutoPlay.unDunk, 20*1000); }
  }
}

AutoPlay.unDunk = function() {
  if(!Game.Achievements["Cookie-dunker"].won) { setTimeout(AutoPlay.unDunk, 20*1000); return; }
  Game.LeftBackground.canvas.height=AutoPlay.backupHeight; AutoPlay.backupHeight=0;
}

//===================== Handle Ascend ==========================
AutoPlay.ascendLimit = 0.9*Math.floor(2*(1-Game.ascendMeterPercent));

AutoPlay.handleAscend = function() {
  if (Game.OnAscend) { AutoPlay.doReincarnate(); AutoPlay.findNextAchievement(); return; }
  if (Game.ascensionMode==1 && !AutoPlay.canContinue()) AutoPlay.doAscend("reborn mode did not work, retry.",0);
  if (AutoPlay.preNightMode()) return; //do not ascend right before the night
  var ascendDays=10;
  if (AutoPlay.endPhase() && !Game.Achievements["Endless cycle"].won && Game.Upgrades["Sucralosia Inutilis"].bought) { // this costs 2 minutes per 2 ascend
    if ((Game.ascendMeterLevel > 0) && ((AutoPlay.ascendLimit < Game.ascendMeterLevel*Game.ascendMeterPercent) || ((Game.prestige+Game.ascendMeterLevel)%1000==777))) 
	{ AutoPlay.doAscend("go for 1000 ascends",0); }
  }
  if (Game.Upgrades["Permanent upgrade slot V"].bought && !Game.Achievements["Reincarnation"].won) { // this costs 3+2 minute per 2 ascend
    if ((Game.ascendMeterLevel > 0) && ((AutoPlay.ascendLimit < Game.ascendMeterLevel*Game.ascendMeterPercent) )) 
	{ AutoPlay.doAscend("go for 100 ascends",0); }
  }
  if (AutoPlay.endPhase() && (Date.now()-Game.startDate) > ascendDays*24*60*60*1000) {
    AutoPlay.doAscend("ascend after " + ascendDays + " days just while waiting for next achievement.",1);
  }
  var newPrestige=(Game.prestige+Game.ascendMeterLevel)%1000000;
  if (AutoPlay.endPhase() && !Game.Upgrades["Lucky digit"].bought && Game.ascendMeterLevel>0 && ((Game.prestige+Game.ascendMeterLevel)%10 == 7)) { AutoPlay.doAscend("ascend for lucky digit.",0); }
  if (AutoPlay.endPhase() && !Game.Upgrades["Lucky number"].bought && Game.ascendMeterLevel>0 && ((Game.prestige+Game.ascendMeterLevel)%1000 == 777)) { AutoPlay.doAscend("ascend for lucky number.",0); }
  if (!Game.Upgrades["Lucky payout"].bought && Game.ascendMeterLevel>0 && AutoPlay.endPhase() && (Game.heavenlyChips > 77777777) && (newPrestige <= 777777) && (newPrestige >= 777777-Game.ascendMeterLevel)) {
    AutoPlay.doAscend("ascend for lucky payout.",0);
  }
  if (Game.AchievementsById[AutoPlay.nextAchievement].won) {
	var date=new Date();
	date.setTime(Date.now()-Game.startDate);
	var legacyTime=Game.sayTime(date.getTime()/1000*Game.fps,-1);
	date.setTime(Date.now()-Game.fullDate);
	var fullTime=Game.sayTime(date.getTime()/1000*Game.fps,-1);
    AutoPlay.doAscend("have achievement: " + Game.AchievementsById[AutoPlay.nextAchievement].desc + " after " + legacyTime + "(total: " + fullTime + ")",1);
} }

AutoPlay.canContinue = function() {
  if (!Game.Achievements["Neverclick"].won && Game.cookieClicks<=15) return true;
  if (!Game.Achievements["True Neverclick"].won && Game.cookieClicks==0) return true;
  if (!Game.Achievements["Hardcore"].won && Game.UpgradesOwned==0) return true;
  if (!Game.Achievements["Speed baking I"].won && (Date.now()-Game.startDate <= 1000*60*35)) return true;
  if (!Game.Achievements["Speed baking II"].won && (Date.now()-Game.startDate <= 1000*60*25)) return true;
  if (!Game.Achievements["Speed baking III"].won && (Date.now()-Game.startDate <= 1000*60*15)) return true;
  return false;
}

AutoPlay.doReincarnate = function() {
  AutoPlay.delay=10; AutoPlay.buyHeavenlyUpgrades(); 
  if(!Game.Achievements["Neverclick"].won || !Game.Achievements["Hardcore"].won) { Game.PickAscensionMode(); Game.nextAscensionMode=1; Game.ConfirmPrompt(); }
  if(AutoPlay.endPhase() && AutoPlay.mustRebornAscend()) { Game.PickAscensionMode(); Game.nextAscensionMode=1; Game.ConfirmPrompt(); }
  Game.Reincarnate(true); 
  if (AutoPlay.loggingInfo) setTimeout(AutoPlay.logging, 20*1000);
  AutoPlay.ascendLimit = 0.9*Math.floor(2*(1-Game.ascendMeterPercent));
}

AutoPlay.mustRebornAscend = function() { return !([78,93,94,95].every(function(a) { return Game.AchievementsById[a].won; })); }

AutoPlay.doAscend = function(str,log) {
  AutoPlay.debugInfo(str);
  AutoPlay.loggingInfo=log?str:0; 
  if(AutoPlay.checkAllAchievementsOK(false)) { AutoPlay.logging(); return; } // do not ascend when we are finished
  if(Game.wrinklers.some(function(w) { return w.close; } )) AutoPlay.assignSpirit(0,"scorn",1);
  Game.wrinklers.forEach(function(w) { if (w.close==1) w.hp=0; } ); // pop all wrinklers
  if (Game.Upgrades["Chocolate egg"].unlocked && !Game.Upgrades["Chocolate egg"].bought) {
    if (Game.dragonLevel>=9) { // setting first aura to earth shatterer
      Game.specialTab="dragon"; Game.SetDragonAura(5,0); 
      Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0); 
	}
	Game.ObjectsById.forEach(function(e) { e.sell(e.amount); } );
    Game.Upgrades["Chocolate egg"].buy();
  } else { AutoPlay.delay=10; Game.Ascend(true); }
}

//===================== Handle Achievements ==========================
AutoPlay.wantedAchievements = [82, 12, 89, 130, 108, 223, 224, 225, 226, 227, 228, 229, 230, 279, 280, 332];
AutoPlay.nextAchievement=AutoPlay.wantedAchievements[0];

AutoPlay.endPhase = function() { return AutoPlay.wantedAchievements.indexOf(AutoPlay.nextAchievement)<0; }

AutoPlay.findNextAchievement = function() {
  AutoPlay.handleSmallAchievements();
  for(i = 0; i < AutoPlay.wantedAchievements.length; i++) {
    if (!(Game.AchievementsById[AutoPlay.wantedAchievements[i]].won)) 
	{ AutoPlay.nextAchievement = AutoPlay.wantedAchievements[i]; AutoPlay.debugInfo("trying to get achievement: " + Game.AchievementsById[AutoPlay.nextAchievement].desc); return; }
  }
  AutoPlay.checkAllAchievementsOK(true);
}

AutoPlay.checkAllAchievementsOK = function(log) {
  for (var i in Game.Achievements) {
    var me=Game.Achievements[i];
    if (!me.won && me.pool!="dungeon") { // missing achievement
      if(log) AutoPlay.info("Missing achievement #" + me.id + ": " + me.desc + ", try to get it now."); 
	  if(log) AutoPlay.nextAchievement=me.id; 
	  return false;
  } }
  for (var i in Game.Upgrades) {
    var me=Game.Upgrades[i];
    if (me.pool=='prestige' && !me.bought) { // we have not all prestige upgrades yet
      AutoPlay.nextAchievement=AutoPlay.wantedAchievements[AutoPlay.wantedAchievements.length-1];
      if(log) AutoPlay.info("Prestige upgrade " + me.name + " is missing, waiting to buy it.");
	  if(log) Game.RemoveAchiev(Game.AchievementsById[AutoPlay.nextAchievement].name); 
	  return false;
  } }
  clearInterval(AutoPlay.autoPlayer); //stop autoplay: 
  AutoPlay.info("My job is done here, have a nice day.");
  if(Game.bakeryName.slice(0,AutoPlay.robotName.length)==AutoPlay.robotName) { 
    Game.bakeryName = Game.bakeryName.slice(AutoPlay.robotName.length); Game.bakeryNamePrompt(); Game.ConfirmPrompt(); 
  }
  return true;
}

AutoPlay.findMissingAchievements = function() { // just for testing purposes
  for (var i in Game.Achievements) {
    var me=Game.Achievements[i];
    if (!me.won && me.pool!="dungeon") { // missing achievement
      AutoPlay.debugInfo("missing achievement #" + me.id + ": " + me.desc);
  } }
  for (var i in Game.Upgrades) {
    var me=Game.Upgrades[i];
    if (me.pool=='prestige' && !me.bought) { // we have not all prestige upgrades yet
      AutoPlay.debugInfo("prestige upgrade " + me.name + " is missing.");
} } }

//===================== Handle Heavenly Upgrades ==========================
AutoPlay.prioUpgrades = [363,323,411,412,413,264,265,266,267,268,181,282,283,284,291,393,394]; // legacy, dragon, lucky upgrades, permanent slots, season switcher, better golden cookies, kittens, synergies, 
AutoPlay.kittens = [31,32,54,108,187,320,321,322,425,442];
AutoPlay.cursors = [0,1,2,3,4,5,6,43,82,109,188,189];
AutoPlay.chancemakers = [416,417,418,419,420,421,422,423,441];
AutoPlay.butterBiscuits = [334,335,336,337,400];

AutoPlay.buyHeavenlyUpgrades = function() {
  AutoPlay.prioUpgrades.forEach(function(id) { var e=Game.UpgradesById[id]; if (e.canBePurchased && !e.bought && e.buy(true)) { AutoPlay.info("buying "+e.name); } });
  Game.UpgradesById.forEach(function(e) { if (e.canBePurchased && !e.bought && e.buy(true)) { AutoPlay.info("buying "+e.name); } });
  AutoPlay.assignPermanentSlot(1,AutoPlay.kittens);
  AutoPlay.assignPermanentSlot(2,AutoPlay.chancemakers);
  if(!Game.Achievements["Reincarnation"].won) { // for many ascends
    AutoPlay.assignPermanentSlot(0,AutoPlay.cursors);
    AutoPlay.assignPermanentSlot(3,[52]); // lucky day
    AutoPlay.assignPermanentSlot(4,[53]); // serendipity
  } else { //collect rare things
    AutoPlay.assignPermanentSlot(0,AutoPlay.butterBiscuits);
    AutoPlay.assignPermanentSlot(3,[226]); // omelette
	if(Game.Achievements["Elder nap"].won && Game.Achievements["Elder slumber"].won && Game.Achievements["Elder calm"].won)
      AutoPlay.assignPermanentSlot(4,[72]); // arcane sugar
	else AutoPlay.assignPermanentSlot(4,[53]); // serendipity
  }
}

AutoPlay.assignPermanentSlot = function(slot,options) {
  if (!Game.UpgradesById[264+slot].bought) return;
  Game.AssignPermanentSlot(slot); 
  for (var i=options.length-1; i>=0; i--) { if(Game.UpgradesById[options[i]].bought) { Game.PutUpgradeInPermanentSlot(options[i],slot); break; } }
  Game.ConfirmPrompt();
}

//===================== Handle Dragon ==========================
AutoPlay.handleDragon = function() {
  if (Game.Upgrades["A crumbly egg"].unlocked) {
    if (Game.dragonLevel<Game.dragonLevels.length-1 && Game.dragonLevels[Game.dragonLevel].cost()) {
      Game.specialTab="dragon"; Game.UpgradeDragon(); Game.ToggleSpecialMenu(0);
  } }
  if ((Game.dragonAura==0) && (Game.dragonLevel>=5)) { // set first aura to kitten (breath of milk)
    Game.specialTab="dragon"; Game.SetDragonAura(1,0); 
    Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0); 
  }
  if ((Game.dragonAura==1) && (Game.dragonLevel>=19)) { // set first aura to prism (radiant appetite)
    Game.specialTab="dragon"; Game.SetDragonAura(15,0); 
    Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0); 
  }
  if ((Game.dragonAura2==0) && (Game.dragonLevel>=Game.dragonLevels.length-1)) { // set second aura to kitten (breath of milk)
    Game.specialTab="dragon"; Game.SetDragonAura(1,1); 
    Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0); 
} }

//===================== Auxiliary ==========================

AutoPlay.info = function(s) { console.log("### "+s); Game.Notify("Automatic Playthrough",s,1,100); }
AutoPlay.debugInfo = function(s) { console.log("======> "+s); Game.Notify("Debugging CookieBot",s,1,20); }

AutoPlay.logging = function() {
  var before=window.localStorage.getItem("autoplayLog");
  var toAdd="#logging autoplay V" + AutoPlay.version + " with " + AutoPlay.loggingInfo + "\n" + Game.WriteSave(1) + "\n";
  AutoPlay.loggingInfo=0;
  window.localStorage.setItem("autoplayLog",before+toAdd);
}

AutoPlay.saveLog = function() { // for testing and getting the log out
  var text=window.localStorage.getItem("autoplayLog");
  var blob=new Blob([text],{type:'text/plain;charset=utf-8'});
  saveAs(blob,'autoPlaySave.txt');
}

AutoPlay.handleNotes = function() {
  for (var i in Game.Notes) {
    if (Game.Notes[i].quick==0) { Game.Notes[i].life=2000*Game.fps; Game.Notes[i].quick=1; }
} }

function range(start, end) {
  var foo = [];
  for (var i = start; i <= end; i++) { foo.push(i); }
  return foo;
}

//===================== Cheats for Testing ==========================
//create golden cookie: Game.shimmerTypes.golden.time = Game.shimmerTypes.golden.maxTime; or new Game.shimmer("golden")
//golden cookie with building special: var newShimmer=new Game.shimmer("golden");newShimmer.force="building special";

//===================== Init & Start ==========================

if (AutoPlay.autoPlayer) { AutoPlay.info("replacing old version of autoplay"); clearInterval(AutoPlay.autoPlayer); }
AutoPlay.autoPlayer = setInterval(AutoPlay.run, 300); // was 100 before, but that is too quick
AutoPlay.findNextAchievement();
l('versionNumber').innerHTML='v. '+Game.version+" (with autoplay v."+AutoPlay.version+")";
if (Game.version != AutoPlay.gameVersion) AutoPlay.info("Warning: cookieBot is last tested with cookie clicker version " + AutoPlay.gameVersion);
