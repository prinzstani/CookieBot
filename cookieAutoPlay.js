// auto-play cookie clicker
//TODO: figure out which Gods to use
//TODO: check that all achievements individually can be dropped and will be retaken (only for test)
//TODO: have easy loading of autoplay, maybe together with the game itself
//TODO: buy with 1 each if not rigidel-phase (1 hour before ripening), else buy 10 if already total ==0 %10
//TODO: for faktor 10: check if it is needed all the time or just when growing over the edge (ripening etc.) - then just buy the 9 cheapest buildings once a day - activate rigidel only when we want to harvest one hour earlier
//TODO: build a night mode version, where at night nothing happens
//TODO: reload if golden lump and below 6 harvested
//TODO: check finalization: with and without all prestige upgrades
//TODO: beautify code
//TODO: cannot create dunking window, only directly after loading the autoplay code.
//TODO: move logging etc into doAscend function
//TODO: copy text from cookiemonster to cookiebot
//TODO: create description of cookiebot in cookieclicker wiki

var AutoPlay;

if(!AutoPlay) AutoPlay = {};
AutoPlay.version = "1.5"
AutoPlay.gameVersion = "2.0042";
AutoPlay.robotName="Automated Stani";
AutoPlay.delay=0;

AutoPlay.run = function () {
  if (Game.AscendTimer>0 || Game.ReincarnateTimer>0) return;
  if (AutoPlay.delay>0) { AutoPlay.delay--; return; }
  AutoPlay.handleClicking();
  AutoPlay.handleGoldenCookies();
  AutoPlay.handleBuildings();
  AutoPlay.handleUpgrades();
  AutoPlay.handleSeasons();
  AutoPlay.handleSugarLumps();
  AutoPlay.handleDragon();
  AutoPlay.handleWrinklers();
  AutoPlay.handleDunking();
  AutoPlay.handleAscend();
  AutoPlay.handleNotes();
}

//===================== Handle Cookies and Golden Cookies ==========================
// - Arcane aura (dragon): 10% more golden cookies
// - business day: 5% more golden cookies, together with the god selebrak
AutoPlay.handleGoldenCookies = function() { // pop the first golden cookie
  for(sx in Game.shimmers) {
    var s=Game.shimmers[sx];
    if((s.type!="golden") || (s.life<Game.fps) || (!Game.Achievements["Early bird"].won)) { s.pop(); return; }
    if((s.life/Game.fps)<(s.dur-2) && (Game.Achievements["Fading luck"].won)) { s.pop(); return; }
} }

AutoPlay.handleClicking = function() {
  if (!Game.Achievements["Neverclick"].won && (Game.cookieClicks<=15) ) return;
  if (Game.AchievementsById[AutoPlay.wantedAchievements[AutoPlay.wantedAchievements.length-1]].won && !Game.Achievements["True Neverclick"].won && (!Game.cookieClicks) ) return;
  if(!Game.Achievements["Uncanny clicker"].won) { for(i=0; i<10; i++) setTimeout(Game.ClickCookie, 50*i); }
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
	  (!Game.Achievements["Endless cycle"].won || Game.Upgrades["Arcane sugar"].bought); // brainsweep
	case 73: return Game.Achievements["Elder nap"].won && Game.Achievements["Elder slumber"].won && Game.Achievements["Elder calm"].won; // elder pact
	case 74: return Game.Achievements["Elder nap"].won && Game.Achievements["Elder slumber"].won && Game.Upgrades["Elder Covenant"].unlocked; // elder pledge
	case 84: return Game.Upgrades["Elder Pledge"].bought; // elder covenant
//	case 85: return Game.Upgrades["Elder Covenant"].bought; // revoke elder covenant 
    case 227: return true; // choco egg
	default: return up.pool=="toggle";
} }

//===================== Handle Buildings ==========================
AutoPlay.handleBuildings = function() {
  var cpc=0; // relative strength of cookie production
  for(var i = Game.ObjectsById.length-1; i >= 0; i--){ var me = Game.ObjectsById[i]; var mycpc = me.storedCps / me.price; if (mycpc > cpc) { cpc = mycpc; } }; 
  if (!Game.ascensionMode && Game.isMinigameReady(Game.Objects["Temple"]) && (Date.now()-Game.startDate) > 2*60*1000) { // use factor 10 unless in the first 2 minutes after descend
    for(i = Game.ObjectsById.length-1; i >= 0; i--) { 
	  var me = Game.ObjectsById[i]; 
	  if (me.amount % 10 != 0 || me.amount<50) me.buy();
	  if (me.amount % 50 == 40 && (me.getSumPrice(10)<Game.cookies)) me.buy(10);
	  if ((me.storedCps/me.price > cpc/2) && (me.getSumPrice(10)<Game.cookies)) { me.buy(10); return; }
  } } else for(i = Game.ObjectsById.length-1; i >= 0; i--){ var me = Game.ObjectsById[i]; if ((me.storedCps/me.price > cpc*0.9) || (me.amount<5)) { me.buy(100); } }; 
}

//===================== Handle Seasons ==========================
AutoPlay.handleSeasons = function() {
  if (!Game.Upgrades["Season switcher"].bought || Game.ascensionMode) return;
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
// golden sugar lumps = 1 in 2000 (ordinary) -> about 5 years
// free sugar lump: 1 in 2000 golden cookies
//hand of fate; free sugar lump 1 in 1000, if fail then 1 in 300
//type of new lump is deterministic (random) on the time of the previous lump, i.e. cannot be changed by reload!
AutoPlay.level1Order=[6,7]; // unlocking in this order
AutoPlay.level10Order=[7,14,13,12,11]; // finishing in this order
AutoPlay.levelAchievements=range(307,320).concat([336]);
AutoPlay.lumpRelatedAchievements=range(266,272).concat(AutoPlay.levelAchievements);

AutoPlay.handleSugarLumps = function() {
  if (Game.ascensionMode) return;
  var age=Date.now()-Game.lumpT;
  if (age>=Game.lumpMatureAge && Game.lumpCurrentType==0 && !Game.Achievements["Hand-picked"].won) AutoPlay.harvestLump();
  if(Game.lumpCurrentType==0) AutoPlay.farmGoldenSugarLumps(age); // really needed?
  if (age>=Game.lumpRipeAge) AutoPlay.harvestLump(); // normal harvesting, should check !masterCopy
  AutoPlay.cheatSugarLumps(age);
  AutoPlay.handleMinigames();
}

AutoPlay.lumpCheatDelay=20*60*1000; // 20 minutes

AutoPlay.cheatSugarLumps = function(age) { // set Game.lumpT back such that sugar lumps ripe every hour, not every day
  for(a in Game.AchievementsById) { var me=Game.AchievementsById[a]; if (!(me.won || me.pool=="dungeon" || AutoPlay.lumpRelatedAchievements.indexOf(me.id)>=0)) return; }
    if(age<Game.lumpRipeAge-AutoPlay.lumpCheatDelay) Game.lumpT=Date.now()-Game.lumpRipeAge+AutoPlay.lumpCheatDelay;
}

AutoPlay.harvestLump = function() {
  Game.clickLump();
  for(i in AutoPlay.level1Order) { var me = Game.ObjectsById[AutoPlay.level1Order[i]]; if(!me.level) { me.levelUp(); AutoPlay.harvestLump(); return; } };
  for(i in AutoPlay.level10Order) { var me = Game.ObjectsById[AutoPlay.level10Order[i]]; if(me.level<10) { if(me.level<Game.lumps) { me.levelUp(); AutoPlay.harvestLump(); } return; } };
  for(i = Game.ObjectsById.length-1; i >= 0; i--) { var me = Game.ObjectsById[i]; if(me.level<10 && me.level<Game.lumps) { me.levelUp(); AutoPlay.harvestLump(); return; } }; 
  for(i = Game.ObjectsById.length-1; i >= 0; i--) Game.ObjectsById[i].levelUp(); 
}

AutoPlay.copyWindows=[]; // need to init in the code some place
AutoPlay.masterSaveCopy=0;
AutoPlay.masterLoadCopy=0;
AutoPlay.copyCount=100;

//this is tested and it works - it is some kind of cheating
AutoPlay.farmGoldenSugarLumps = function(age) { // put this inline - do this only in endgame
  if(Game.Achievements["All-natural cane sugar"].won) return;
  if(AutoPlay.nextAchievement!=Game.Achievements["All-natural cane sugar"].id) return;
  if (AutoPlay.masterSaveCopy) { AutoPlay.info("back to save master"); Game.LoadSave(AutoPlay.masterSaveCopy); AutoPlay.masterSaveCopy=0; return; }
  if (age<Game.lumpRipeAge && age>=Game.lumpMatureAge) {
    if (AutoPlay.copyWindows.length>=AutoPlay.copyCount) { AutoPlay.info("##### creating master load copy"); AutoPlay.masterLoadCopy=Game.WriteSave(1); } // check rather !masterCopy
    if (AutoPlay.copyWindows.length) {
	  Game.LoadSave(AutoPlay.copyWindows.pop());
	  if (Game.lumpCurrentType) AutoPlay.info("## found lump with type " + Game.lumpCurrentType);
	  if (Game.lumpCurrentType==2) {
	    AutoPlay.info("YESS, golden lump");
		AutoPlay.masterLoadCopy=0; AutoPlay.copyWindows=[];
	} } else if (AutoPlay.masterLoadCopy) { AutoPlay.info("##### going back to master copy"); Game.LoadSave(AutoPlay.masterLoadCopy); AutoPlay.masterLoadCopy=0; }
  }
  if (age>=Game.lumpRipeAge && AutoPlay.copyWindows.length<AutoPlay.copyCount) {
    if(!AutoPlay.copyWindows.length) AutoPlay.info("farming golden sugar lumps.");
    AutoPlay.masterSaveCopy=Game.WriteSave(1);
    Game.clickLump();
    AutoPlay.copyWindows.push(Game.WriteSave(1));
  }
}

AutoPlay.checkWindow=null;

function checkCopies() {
  if(!AutoPlay.copyWindows.length) return;
  // need to do this in own window and not open a new one.
  if(AutoPlay.checkWindow == null) { AutoPlay.checkWindow = window.open(window.location.href, "", "width=400,height=400"); return; }
  if (!AutoPlay.checkWindow.Game) return;
  AutoPlay.checkWindow.Game.LoadSave(AutoPlay.copyWindows.pop());
  AutoPlay.info("found sugar lump of type " + AutoPlay.checkWindow.Game.lumpCurrentType);
  AutoPlay.checkWindow.close(); AutoPlay.checkWindow=null;
}

var savedMagic=0;
var countTrials;
var oldLumps;

AutoPlay.handleMinigames = function() {
  // wizard towers: grimoires
  if (Game.isMinigameReady(Game.Objects["Wizard tower"])) {
    var me=Game.Objects["Wizard tower"];
    var g=me.minigame;
    var sp=g.spells["hand of fate"]; // try to get a sugar lump in backfiring - could do this often with save (about 10 per try)
//TODO: spells outcome is dependent on the total number of spells cast, i.e. it will be the same after reload anyhow
// experiment - der macht hier immer frenzy?! & golden cookie ist immer an derselben Stelle! (immer noch dasselbe Problem!)
/*
	if (savedMagic && !Game.shimmerTypes['golden'].n) { 
	  if(g.magic > g.getSpellCost(sp)) { g.castSpell(sp); countTrials++; if(countTrials%10==0) { AutoPlay.debugInfo("have tried " + countTrials + " cast golden cookies."); } }
	  else if(oldLumps == Game.lumpsTotal) { Game.LoadSave(savedMagic); } //or unsave ...
//	  else if(oldLumps == Game.lumpsTotal) { Game.LoadSave(savedMagic); g.castSpell(sp); } //or unsave ...
	  else savedMagic=0; 
	}
	if(!savedMagic && (g.magic > g.getSpellCost(sp))) {
	  savedMagic = Game.WriteSave(1); 
	  oldLumps = Game.lumpsTotal;
	  g.castSpell(sp); countTrials=0;
	}
*/
// end experiment 
/*
	if(Game.shimmerTypes['golden'].n && !savedMagic && (g.magic > g.getSpellCost(sp))) {
	  if(g.magic!=g.magicM) { savedMagic = Game.WriteSave(1); oldLumps = Game.lumpsTotal; }
	  g.castSpell(sp);
	}
	if (savedMagic && !Game.shimmerTypes['golden'].n) { if (oldLumps == Game.lumpsTotal) { Game.LoadSave(savedMagic); } savedMagic=0; }
*/
	if(Game.shimmerTypes['golden'].n && (g.magic/g.getSpellCost(sp) >= 0.95)) { g.castSpell(sp); }
//	if(Game.shimmerTypes['golden'].n && (g.magic > g.getSpellCost(sp))) { g.castSpell(sp); }
//    if (Game.shimmerTypes['golden'].n && (g.magicM-g.magic < 1)) { me.switchMinigame(true); g.castSpell(sp); me.switchMinigame(false); }
//    var sp=g.spells["conjure baked goods"]
//    if (g.magic == g.magicM) { me.switchMinigame(true); g.castSpell(sp); me.switchMinigame(false); }
    if (Game.shimmerTypes['golden'].n == 3 && !Game.Achievements["Four-leaf cookie"].won) {
	  me.switchMinigame(true); g.lumpRefill.click(); g.castSpell(sp); me.switchMinigame(false);
  } }
  // temples: pantheon
  if (Game.isMinigameReady(Game.Objects["Temple"])) {
    AutoPlay.assignGod(0,"order");
    AutoPlay.assignGod(1,"decadence"); // ???
    AutoPlay.assignGod(2,"labor"); // ???
	// use Godzamok? & sell buildings & buy after that (limit to 100)?
  }
}

/*
var t0 = performance.now();
var ss = Game.WriteSave(1);
var t1 = performance.now();
Game.LoadSave(ss);
var t2 = performance.now();
console.log("Call to save took " + (t1 - t0) + " milliseconds.")
console.log("Call to load took " + (t2 - t1) + " milliseconds.")
*/

AutoPlay.assignGod = function(slot, god) {
  var me=Game.Objects["Temple"];
  var g=me.minigame;
  if(g.swaps<3) return;
  if(g.slot[slot]==g.gods[god].id) return;
  me.switchMinigame(true);
  g.slotHovered=slot; g.dragging=g.gods[god]; g.dropGod();
  me.switchMinigame(false);
}  

//===================== Handle Wrinklers ==========================
//var currentWrinkler;
//var wrinklerDelay;

AutoPlay.handleWrinklers = function() {
  if (((Game.season == "easter") || (Game.season == "halloween")) && !AutoPlay.seasonFinished(Game.season)) 
    Game.wrinklers.forEach(function(w) { if (w.close==1) w.hp = 0; } );
  if (Game.Upgrades["Unholy bait"].bought && !Game.Achievements["Moistburster"].won) 
    Game.wrinklers.forEach(function(w) { if (w.close==1) w.hp = 0; } );
  if (AutoPlay.endPhase() && !Game.Achievements["Last Chance to See"].won) 
    Game.wrinklers.forEach(function(w) { if (w.close==1) w.hp = 0; } );
  if (Game.Upgrades["Unholy bait"].bought) { // pop one wrinkler
    if (AutoPlay.wrinklerDelay>0) AutoPlay.wrinklerDelay--;
    else { 
	  if (AutoPlay.currentWrinkler==undefined) AutoPlay.currentWrinkler=0;
      var w=Game.wrinklers[AutoPlay.currentWrinkler];
      if (w.close==1) { w.hp = 0; }
      AutoPlay.currentWrinkler= (AutoPlay.currentWrinkler+1)%Game.getWrinklersMax();
	  AutoPlay.wrinklerDelay=60*60*10; //one hour
} } }

//===================== Handle Small Achievements ==========================
AutoPlay.handleSmallAchievements = function() {
  if(!Game.Achievements["Tabloid addiction"].won) { for (i = 0; i < 50; i++) { Game.tickerL.click(); } }
  if(!Game.Achievements["Here you go"].won) Game.Achievements["Here you go"].click();
  if(!Game.Achievements["Tiny cookie"].won) Game.ClickTinyCookie();
  if(!Game.Achievements["God complex"].won) { Game.bakeryName = "Orteil"; Game.bakeryNamePrompt(); Game.ConfirmPrompt(); }
  if(!Game.Achievements["What's in a name"].won || Game.bakeryName!=AutoPlay.robotName) { Game.bakeryName = AutoPlay.robotName; Game.bakeryNamePrompt(); Game.ConfirmPrompt(); }
  if(Game.Achievements["Set for life"].won && !Game.Achievements["Cheated cookies taste awful"].won) Game.Win("Cheated cookies taste awful"); // only take this at the end, after all is done
}

AutoPlay.dunkWindow=null;
AutoPlay.handleDunking = function() { // get achievement cookie dunker and third party
  if(Game.Achievements["Cookie-dunker"].won && Game.Achievements["Third-party"].won) return;
  if(Game.milkProgress <= 1) return;
  if(!AutoPlay.dunkWindow) { 
    Game.WriteSave(); AutoPlay.dunkWindow = window.open(window.location.href, "", "width=400,height=400");
    if(!AutoPlay.dunkWindow) {
      AutoPlay.info("cannot create dunking window - have to cheat cookie dunker and third party achievements.");
	  Game.Achievements["Cookie-dunker"].won=1; Game.Achievements["Third-party"].won=1; return;
  } }
  if(!AutoPlay.dunkWindow.Game) return;
  if(!AutoPlay.dunkWindow.Game.Achievements) return;
  if(!AutoPlay.dunkWindow.Game.Achievements["Cookie-dunker"].won) return;
  if(!AutoPlay.dunkWindow.Game.LoadMod) return;
  if(!AutoPlay.dunkWindow.CM) { AutoPlay.dunkWindow.Game.LoadMod('http://aktanusa.github.io/CookieMonster/CookieMonster.js'); return; }
  if(!AutoPlay.dunkWindow.Game.Achievements["Third-party"].won) return;
  AutoPlay.info("Achieved cookie dunking and third party.");
  Game.LoadSave(AutoPlay.dunkWindow.Game.WriteSave(1));
  AutoPlay.dunkWindow.close(); AutoPlay.dunkWindow=0;
}

//===================== Handle Ascend ==========================
AutoPlay.ascendLimit = 0.9*Math.floor(2*(1-Game.ascendMeterPercent));

AutoPlay.endPhase = function() { return AutoPlay.wantedAchievements.indexOf(AutoPlay.nextAchievement)<0; }

AutoPlay.handleAscend = function() {
  var ascendDays=10;
  if (Game.Upgrades["Permanent upgrade slot V"].bought && !Game.Achievements["Endless cycle"].won) { // this costs 3+2 minute per 2 ascend
    if ((!Game.OnAscend) && (Game.ascendMeterLevel > 0) && ((AutoPlay.ascendLimit < Game.ascendMeterLevel*Game.ascendMeterPercent) || ((Game.prestige+Game.ascendMeterLevel)%1000==777))) 
	{ AutoPlay.debugInfo("##### go for many ascends"); AutoPlay.doAscend(); }
  }
  if (Game.ascensionMode && !AutoPlay.canContinue()) AutoPlay.doAscend();
  if (Game.OnAscend) { AutoPlay.doReincarnate(); AutoPlay.findNextAchievement(); }
  if (AutoPlay.endPhase() && (Date.now()-Game.startDate) > ascendDays*24*60*60*1000) {
    AutoPlay.debugInfo("############# ascend after " + ascendDays + " days just while waiting for next achievement.");
    AutoPlay.loggingInfo="############# ascend after " + ascendDays + " days just while waiting for next achievement.";
    AutoPlay.doAscend();
  }
  var newPrestige=(Game.prestige+Game.ascendMeterLevel)%1000000;
  if (AutoPlay.endPhase() && !Game.Upgrades["Lucky digit"].bought && Game.ascendMeterLevel>0 && ((Game.prestige+Game.ascendMeterLevel)%10 == 7)) { AutoPlay.doAscend(); }
  if (AutoPlay.endPhase() && !Game.Upgrades["Lucky number"].bought && Game.ascendMeterLevel>0 && ((Game.prestige+Game.ascendMeterLevel)%1000 == 777)) { AutoPlay.doAscend(); }
  if (!Game.Upgrades["Lucky payout"].bought && Game.ascendMeterLevel>0 && AutoPlay.endPhase() && (Game.heavenlyChips > 77777777) && (newPrestige <= 777777) && (newPrestige >= 777777-Game.ascendMeterLevel)) {
    AutoPlay.debugInfo("############# ascend for lucky heavenly upgrades.");
    AutoPlay.loggingInfo="############# ascend for lucky heavenly upgrades.";
	checkAchievement=AutoPlay.nextAchievement;
	Game.AchievementsById[AutoPlay.nextAchievement].won=1;
    AutoPlay.doAscend();
  }
  if (Game.AchievementsById[AutoPlay.nextAchievement].won) {
    AutoPlay.debugInfo("############# achievement OK, do ascend.");
	var date=new Date();
	date.setTime(Date.now()-Game.startDate);
	var legacyTime=Game.sayTime(date.getTime()/1000*Game.fps,-1);
	date.setTime(Date.now()-Game.fullDate);
	var fullTime=Game.sayTime(date.getTime()/1000*Game.fps,-1);
	AutoPlay.loggingInfo="have achievement: " + Game.AchievementsById[AutoPlay.nextAchievement].desc + " after " + legacyTime + "(total: " + fullTime + ")";
    if (!Game.OnAscend) { AutoPlay.doAscend(); }
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
  setTimeout(AutoPlay.logging, 20*1000);
  AutoPlay.debugInfo("logging in 20 seconds");
  AutoPlay.ascendLimit = 0.9*Math.floor(2*(1-Game.ascendMeterPercent));
}

AutoPlay.mustRebornAscend = function() { return !([78,93,94,95].every(function(a) { return Game.AchievementsById[a].won; })); }

AutoPlay.doAscend = function() {
  Game.wrinklers.forEach(function(w) { if (w.close==1) w.hp=0; } ); // pop wrinklers
  if (Game.Upgrades["Chocolate egg"].unlocked && !Game.Upgrades["Chocolate egg"].bought) {
    if (Game.dragonLevel>=9) {
      AutoPlay.debugInfo("setting first aura to earth shatterer.");
      Game.specialTab="dragon"; Game.SetDragonAura(5,0); 
      Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0); 
	}
	Game.ObjectsById.forEach(function(e) { e.sell(e.amount); } );
    Game.Upgrades["Chocolate egg"].buy();
  } else { AutoPlay.delay=10; Game.Ascend(true); }
}

//===================== Handle Achievements ==========================
AutoPlay.nextAchievement=0;
AutoPlay.wantedAchievements = [82, 12, 89, 111, 130, 108, 223, 224, 225, 226, 227, 228, 229, 230, 279, 280, 332];
//round 1: keep quiet until hardcore and neverclick, then buy everything until all grandmas are there (82=Elder calm: use covenant) ca. 31h
//round 2: get 100 quintillion (12), i.e. about 300 legacy, develop dragon (kitten), get first permanent slot (cursors), ca. 24h
//round 3: get 100 antimatter condensers (89), get season switcher, ca. 50h
//round 4: get all christmas (111), then all valentine including easter (130+169), then all halloween (108)
//round 5: with five permanent slots: get enough ascends; until then continue with round 6
//round 6: get the "bake xx cookies" achievements & all building achievements
//round 7: get shadow achievements & all the remaining achievements
//round 8: get all the level 10 buildings

AutoPlay.findNextAchievement = function() {
  AutoPlay.handleSmallAchievements();
  for(i = 0; i < AutoPlay.wantedAchievements.length; i++) {
    if (!(Game.AchievementsById[AutoPlay.wantedAchievements[i]].won)) 
	{ AutoPlay.nextAchievement = AutoPlay.wantedAchievements[i]; AutoPlay.debugInfo("trying to get achievement: " + Game.AchievementsById[AutoPlay.nextAchievement].desc); return; }
  }
  AutoPlay.info("##################### no new achievements needed, final check ...");
  AutoPlay.checkAllAchievementsOK();
}

AutoPlay.checkAchievement=262; // could use AutoPlay.nextAchievement instead

AutoPlay.checkAllAchievementsOK = function() {
  if (AutoPlay.checkAchievement < Game.AchievementsById.length) {
    if(Game.AchievementsById[AutoPlay.checkAchievement].pool=="dungeon") { AutoPlay.checkAchievement++; AutoPlay.checkAllAchievementsOK(); return; }
    if(!Game.AchievementsById[AutoPlay.checkAchievement].won) {
      AutoPlay.info("################ have not yet achieved: " + Game.AchievementsById[AutoPlay.checkAchievement].desc + ", try to do it now");
      AutoPlay.nextAchievement=AutoPlay.checkAchievement;
      AutoPlay.checkAchievement++;
    } else {
      AutoPlay.nextAchievement=AutoPlay.checkAchievement;
	  Game.AchievementsById[AutoPlay.nextAchievement].won=0;
      AutoPlay.info("############# testing to get achievement (again): " + Game.AchievementsById[AutoPlay.nextAchievement].desc);
      AutoPlay.checkAchievement++;
	}
  } else {
	for (var i in Game.Upgrades) {
	  var me=Game.Upgrades[i];
	  if (me.pool=='prestige' && !me.bought) { // we have not all prestige upgrades yet
        AutoPlay.info("############### prestige upgrade " + me.name + " is missing - wait for it.");
        AutoPlay.nextAchievement=AutoPlay.wantedAchievements[AutoPlay.wantedAchievements.length-1];
	    Game.AchievementsById[AutoPlay.nextAchievement].won=0;
		return;
	} }
    clearInterval(AutoPlay.autoPlayer); //stop autoplay: 
    AutoPlay.info("############# My job is done here, have a nice day.");
} }

findMissingAchievements = function() {
  for (var i in Game.Achievements) {
    var me=Game.Achievements[i];
    if (!me.won && me.pool!="dungeon") { // missing achievement
      AutoPlay.info("############### missing achievement #" + me.id + ": " + me.desc);
  } }
  for (var i in Game.Upgrades) {
    var me=Game.Upgrades[i];
    if (me.pool=='prestige' && !me.bought) { // we have not all prestige upgrades yet
      AutoPlay.info("############### prestige upgrade " + me.name + " is missing.");
} } }

function jumpOverTestAchievement() {
  AutoPlay.info("############# jumping over test achievement: " + Game.AchievementsById[AutoPlay.nextAchievement].desc);
  if(!Game.AchievementsById[AutoPlay.checkAchievement].won) AutoPlay.checkAchievement++;
  AutoPlay.checkAllAchievementsOK();
}

//===================== Handle Heavenly Upgrades ==========================
AutoPlay.prioUpgrades = [363,323,411,412,413,264,265,266,267,268,181,282,283,284,291,393,394]; // legacy, dragon, lucky upgrades, permanent slots, season switcher, better golden cookies, kittens, synergies, 
AutoPlay.kittens = [31,32,54,108,187,320,321,322,425,442];
AutoPlay.cursors = [0,1,2,3,4,5,6,43,82,109,188,189];
AutoPlay.chancemakers = [416,417,418,419,420,421,422,423,441];
AutoPlay.butterBiscuits = [334,335,336,337,400];

AutoPlay.buyHeavenlyUpgrades = function() {
  AutoPlay.prioUpgrades.forEach(function(id) { var e=Game.UpgradesById[id]; if (e.canBePurchased && !e.bought && e.buy(true)) { info("buying "+e.name); } });
  Game.UpgradesById.forEach(function(e) { if (e.canBePurchased && !e.bought && e.buy(true)) { info("buying "+e.name); } });
  AutoPlay.assignPermanentSlot(1,AutoPlay.kittens);
  AutoPlay.assignPermanentSlot(2,AutoPlay.chancemakers); // have farms here for speed baking? - maybe not needed
  if(!Game.Achievements["Endless cycle"].won) { // for many ascends
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
    AutoPlay.info("setting first aura to breath of milk.");
    Game.specialTab="dragon"; Game.SetDragonAura(1,0); 
    Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0); 
  }
  if ((Game.dragonAura==1) && (Game.dragonLevel>=19)) { // set first aura to prism (radiant appetite)
    AutoPlay.info("setting first aura to radiant appetite.");
    Game.specialTab="dragon"; Game.SetDragonAura(15,0); 
    Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0); 
  }
  if ((Game.dragonAura2==0) && (Game.dragonLevel>=Game.dragonLevels.length-1)) { // set second aura to kitten (breath of milk)
    AutoPlay.info("setting second aura to breath of milk.");
    Game.specialTab="dragon"; Game.SetDragonAura(1,1); 
    Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0); 
} }

//===================== Auxiliary ==========================

AutoPlay.info = function(s) { console.log(s); Game.Notify("Automatic Playthrough",s,1,100); }
AutoPlay.debugInfo = function(s) { console.log(s); Game.Notify("Automatic Playthrough",s,1,20); }

AutoPlay.logging = function() { // put this inline
  AutoPlay.debugInfo("autoplay logging started");
  var before=window.localStorage.getItem("autoplayLog");
  var toAdd="#logging autoplay V" + AutoPlay.version + " with " + AutoPlay.loggingInfo + "\n" + Game.WriteSave(1) + "\n";
  AutoPlay.loggingInfo="";
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

if (AutoPlay.autoPlayer) { AutoPlay.debugInfo("replacing old version of autoplay"); clearInterval(AutoPlay.autoPlayer); }
else AutoPlay.debugInfo("found no old version of autoplay"); 
if (Game.version == AutoPlay.gameVersion) {
  AutoPlay.autoPlayer = setInterval(AutoPlay.run, 300); // was 100 before, but that is really quick
  AutoPlay.findNextAchievement();
 } else info("autoPlay works only with version " + gameVersion);
l('versionNumber').innerHTML='v. '+Game.version+" (with autoplay v."+AutoPlay.version+")";