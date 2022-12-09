// cookie bot: auto-play-through cookie clicker
// see also https://github.com/prinzstani/CookieBot

var AutoPlay;
if (!AutoPlay) AutoPlay = {};
AutoPlay.version = "2.045";
AutoPlay.gameVersion = "2.048";

//align for new version of cookie clicker - try to collect automatically
AutoPlay.wantedAchievements = [82, 89, 108, // elder calm, 100 antimatter, halloween
    225, 227, 229, 279, 280, 372, 373, 374, 375, 390, 391, 429, 451, 452, 453, 470, 471, 472, // bake xx cookies
    534, 535, 536, 578, 579, 586, 587, // bake xx cookies
    585, 575, 397]; // max cps, max buildings, ascend right
AutoPlay.kittens = [31,32,54,108,187,320,321,322,425,442,462,494,613,766];
AutoPlay.cursors = [0,1,2,3,4,5,6,43,82,109,188,189,660,764];
AutoPlay.maxBuildings = [730,731,732,733,734,735,736,737,738,739,740,741,742,760];
AutoPlay.butterBiscuits = [334,335,336,337,400,477,478,479,497,659,699,767];
AutoPlay.expensive = [38,39,40,41,42,55,56,80,81,88,89,90,104,105,106,107,
  120,121,122,123,150,151,256,257,258,259,260,261,262,263,
  338,339,340,341,342,343,350,351,352,403,404,405,406,407,
  444,445,446,447,448,453,454,455,456,457,458,464,465,466,467,468,469,
  498,499,500,501,535,536,538,565,566,567,568,569,570,571,572,573,574,
  575,576,577,578,579,580,581,582,583,584,585,586,587,588,
  607,608,609,615,616,617,652,653,654,655,656,657,658,
  678,679,680,681,682,721,722,723,724,
  807,808,809,810,811,812,813,814,815,816]; // most expensive cookies

//might need to align if bigger changes in cookie clicker
AutoPlay.prioUpgrades = [363, 323, // legacy, dragon
  411, 412, 413, // lucky upgrades,
  264, 265, 266, 267, 268, 520, 181, // permanent slots, season switcher,
  282, 283, 284, 291, 393, 394]; // better golden cookies, kittens, synergies
AutoPlay.valentineUpgrades = range(169,174).concat([645]);
AutoPlay.christmasUpgrades = [168];  // just wait for dominion
AutoPlay.easterUpgrades = range(210,229);
AutoPlay.halloweenUpgrades = range(134,140);
AutoPlay.allSeasonUpgrades =
  AutoPlay.valentineUpgrades.concat(AutoPlay.christmasUpgrades).
  concat(AutoPlay.easterUpgrades).concat(AutoPlay.halloweenUpgrades);
AutoPlay.level1Order = [2,6,7,5]; // unlocking order for minigames: garden, pantheon, grimoire, stock market
AutoPlay.level10Order = [2,0]; // finishing order: garden, stock market
AutoPlay.lumpRelatedAchievements = range(307,320).concat([336,427,447,525,396,268,271]);
AutoPlay.lumpHarvestAchievements = range(266,272).concat([396]);
// 27k golden cookies, shiny wrinkler, one year legacy
AutoPlay.lateAchievements = [262,491,367].concat(AutoPlay.lumpRelatedAchievements);

// cookie bot starting here
AutoPlay.robotName = "Automated ";
AutoPlay.delay = 0;
AutoPlay.night = false;
AutoPlay.finished = false;
AutoPlay.deadline = 0;
AutoPlay.canUseLumps = false;
AutoPlay.savingsGoal = 0;
AutoPlay.savingsStart = Game.startDate;  // time since start of saving
AutoPlay.buy10 = false;
AutoPlay.hyperActive=false;

AutoPlay.run = function() {
  if (Game.AscendTimer>0 || Game.ReincarnateTimer>0) return;
  if (AutoPlay.delay>0) { AutoPlay.delay--; return; }
  AutoPlay.now=Date.now();
  if (AutoPlay.nextAchievement==397) { AutoPlay.runJustRight(); return; }
  AutoPlay.cpsMult = Game.cookiesPs/Game.unbuffedCps;
  if (AutoPlay.nightMode() && !Game.ascensionMode) {
    AutoPlay.cheatSugarLumps(AutoPlay.now-Game.lumpT);
    return;
  }
  AutoPlay.handleClicking();
  AutoPlay.handleGoldenCookies();
  if (AutoPlay.Config.CheatLumps==4) AutoPlay.handleSugarLumps(); // speed cheating
  
  if (AutoPlay.hyperActive || (AutoPlay.now>=AutoPlay.deadline)) { // high activity phase
    AutoPlay.hyperActive=false; // set to inactive, but can be overwritten
    AutoPlay.bestBuy(); // speed needed
    // if high cps then do not wait
    if (AutoPlay.cpsMult>100) AutoPlay.hyperActive=true; // full speed
    AutoPlay.handleSpeedMinigames();
  }
  
  // check ascend often in reborn and during ascend
  if (Game.ascensionMode==1 || AutoPlay.onAscend) AutoPlay.handleAscend();
  if (!Game.Upgrades["Lucky payout"].bought && Game.heavenlyChips>77777777) {
    AutoPlay.handleAscend(); // check ascend often for lucky payout
  }
  if (AutoPlay.now<AutoPlay.deadline) return;  // end of speed activity
  // run only once a minute from here
  if (Game.bakeryNameL.textContent.slice(0,AutoPlay.robotName.length)!=AutoPlay.robotName) {
    Game.bakeryNameL.textContent = AutoPlay.robotName+Game.bakeryNameL.textContent;
  } // write the robot name in front of the bakery name
  AutoPlay.activities = AutoPlay.mainActivity;
  AutoPlay.status(false);
  if (AutoPlay.plantPending)
    AutoPlay.addActivity("Make sure to harvest the new plant before ascend!");
  AutoPlay.deadline=AutoPlay.now+60000; // wait one minute before next step
  AutoPlay.setDeadline(AutoPlay.now+(AutoPlay.now-Game.startDate)/10); // quick start

  // run only once a minute
  if (AutoPlay.Config.CheatLumps!=4) AutoPlay.handleSugarLumps();
  AutoPlay.handleSavings();
  AutoPlay.handleSeasons();
  AutoPlay.handleDragon();
  AutoPlay.handleWrinklers();
  AutoPlay.handleAscend();
  AutoPlay.handleMinigames();
  AutoPlay.handleNotes();
  // add some more hints what the bot is doing
  if (!Game.HasAchiev('Elder')) AutoPlay.addActivity("Getting 7 grandma types");
  if (Game.HasAchiev('Elder') && Game.Upgrades['Bingo center/Research facility'].unlocked &&
      Game.ascensionMode!=1 && !Game.Upgrades['Bingo center/Research facility'].bought)
    AutoPlay.addActivity("Funding the grandma research facility");
}

AutoPlay.runRightCount=0;

AutoPlay.runJustRight = function() {
  AutoPlay.savingsGoal = 0;  // don't want to interfere
  AutoPlay.activities = "Running just right.";
  AutoPlay.handleAscend();
  if (Game.ObjectsById[Game.ObjectsById.length-1].amount)
    AutoPlay.doAscend("Starting to ascend just right properly.",0);
  const goal = 1000000000000;
  const notBuy = [0,1,2,3,4,5,6,129,324];
  if (Game.cookies<goal/10) { // buying buildings and upgrades
    for (var i = Game.ObjectsById.length-2; i >= 0; i--) {
      var me = Game.ObjectsById[i];
      if ((me.getPrice()<Game.cookies) &&
          (me.amount<10+Game.ObjectsById[i+1].amount)) { me.buy(1); return; }
    }
    for (var me in Game.UpgradesById) {
        var e = Game.UpgradesById[me];
        if (e.unlocked && !e.bought && e.canBuy() && e.pool != "toggle" &&
              notBuy.indexOf(e.id) < 0) { e.buy(true); }
      };
  } else {
    var cookieDiff = goal-Game.cookies;
    if (Game.BuildingsOwned==0) { // almost there
      if (cookieDiff<0) AutoPlay.runRightCount++;
      if (Math.round(Game.cookiesd)==goal)
        AutoPlay.doAscend("Fixed run just right.",1);
      else if ((cookieDiff < -goal) && (AutoPlay.now-Game.startDate>60000))
        AutoPlay.doAscend("ascend just right did not work, retry.",0);
      else if (cookieDiff < -2000000000) Game.ObjectsById[0].buy(130+AutoPlay.runRightCount);
      else if (cookieDiff < -6000000) Game.ObjectsById[0].buy(90+AutoPlay.runRightCount);
      else if (cookieDiff < -30000) Game.ObjectsById[0].buy(50+AutoPlay.runRightCount);
      else if (cookieDiff < 0) Game.ObjectsById[0].buy(22+AutoPlay.runRightCount);
      else if (cookieDiff > 10000000) Game.ObjectsById[5].buy(1);
      else if (cookieDiff > 500000) Game.ObjectsById[4].buy(1);
      else if (cookieDiff > 5000) Game.ObjectsById[2].buy(1);
      else if (cookieDiff > 50) Game.ObjectsById[0].buy(1);
      else Game.ClickCookie();
    } else { // now we are selling
      if (cookieDiff/Game.cookiesPs > 1000) Game.ObjectsById[5].buy(1);
      for (var i = Game.ObjectsById.length-2; i>=0; i--) {
        var me = Game.ObjectsById[i];
        if (me.amount>10+Game.ObjectsById[i+1].amount) {
          me.sell(me.amount-(10+Game.ObjectsById[i+1].amount));
          return;
        }
        if (me.amount>0 &&
            (4*me.getReverseSumPrice(me.amount)+Game.cookiesPs>cookieDiff)) {
          me.sell(100);
        }
      }
    }
  }
}

//===================== Night Mode ==========================
AutoPlay.preNightMode = function() {
  if(AutoPlay.Config.NightMode==0) return false;
  var h=(new Date).getHours();
  return (h>=22);
}

AutoPlay.nightMode = function() {
  if (Game.OnAscend) return false;
  if (AutoPlay.Config.NightMode==0) return false;
  if (AutoPlay.Config.NightMode==1 && AutoPlay.grinding()) {
    return false; //do not auto-sleep while grinding
  }
  var h = (new Date).getHours();
//  if (AutoPlay.preNightMode()) AutoPlay.setDeadline(0); // not needed
  if (h>=7 && h<23) { // be active
    if (AutoPlay.night) AutoPlay.useLump();
    AutoPlay.night = false;
    AutoPlay.nightAtPantheon(false);
    var gs = Game.Upgrades["Golden switch [on]"]; if(gs.unlocked) { gs.buy(); }
    AutoPlay.nightAtGarden(false);
    return false;
  }
  if (AutoPlay.night) { //really sleep now
    AutoPlay.activities = 'The bot is sleeping.';
    return true;
  }
  AutoPlay.addActivity('Preparing for the night.');
  AutoPlay.nightAtGarden(true);
  AutoPlay.nightAtStocks();
  var gs = Game.Upgrades["Golden switch [off]"];
  if (gs.unlocked) {
    AutoPlay.handleGoldenCookies();
    AutoPlay.addActivity('Waiting for good time to buy Golden switch.');
    if ((AutoPlay.cpsMult<0.8) || h<7) {
      var sv = Game.Upgrades["Shimmering veil [off]"];
      if (sv.unlocked && sv.canBuy() &&
        Game.Upgrades["Reinforced membrane"].bought) sv.buy();
      gs.buy();
    }
    if (!gs.bought) return true; // do not activate spirits before golden switch
  }
  AutoPlay.nightAtPantheon(true);
  AutoPlay.night = true;
  return true;
}

//===================== Handle Cookies and Golden Cookies =====================
AutoPlay.handleGoldenCookies = function() { // pop first golden cookie or reindeer
  if (AutoPlay.Config.GoldenClickMode==0) return;
  if (Game.TickerEffect) Game.tickerL.click(); // grab fortune cookie
  if (Game.shimmerTypes['golden'].n>=2) AutoPlay.hyperActive=true;
  if (Game.shimmerTypes['golden'].n>=4 &&
     !Game.Achievements['Four-leaf cookie'].won) return;
  for (var sx in Game.shimmers) {
    var s = Game.shimmers[sx];
    AutoPlay.hyperActive=true; // check whether full activity
    if (s.force == "cookie storm drop" && AutoPlay.Config.GoldenClickMode==2) s.pop();
    if (s.type!="golden" || s.life<Game.fps || !Game.Achievements["Early bird"].won) {
      s.pop();
      return;
    }
    if ((s.life/Game.fps)<(s.dur-2) && (Game.Achievements["Fading luck"].won)) {
      s.pop();
      return;
    }
  }
  AutoPlay.cheatGoldenCookies();
}

AutoPlay.cheatGoldenCookies = function() {
  if (AutoPlay.Config.CheatGolden==0) return;
  if (!Game.Upgrades["Lucky payout"].bought && Game.heavenlyChips>77777777) return;
  var level = 10+30*(AutoPlay.Config.CheatGolden-1);
  if (AutoPlay.Config.CheatGolden==1) {
    if (AutoPlay.wantAscend) return; // already cheated enough
    if (!AutoPlay.grindingCheat())
      return; // only cheat in grinding
    var daysInRun = (AutoPlay.now-Game.startDate)/1000/60/60/24;
    if (daysInRun<20) return; // cheat only after 20 days
    level = ((3*daysInRun)<<0)-20;
  }
  if (level>100) level = 100;
  AutoPlay.addActivity('Cheating golden cookies at level ' + level + '.');
  var levelTime = Game.shimmerTypes.golden.maxTime*level/140;
  if (Game.shimmerTypes.golden.time<levelTime)
    Game.shimmerTypes.golden.time = levelTime;
/* golden cookie with building special:
  var newShimmer=new Game.shimmer("golden");
  newShimmer.force="building special";
*/
}

AutoPlay.handleClicking = function() {
  if (AutoPlay.Config.ClickMode==0) return;
  if (!Game.Achievements["Neverclick"].won && (Game.cookieClicks<=15) ) {
    return;
  }
  if (Game.ascensionMode==1 && AutoPlay.endPhase() &&
      !Game.Achievements["True Neverclick"].won && !Game.cookieClicks) {
    return;
  }
  if (!Game.Achievements["Uncanny clicker"].won)
    for (var i = 1; i<6; i++) setTimeout(Game.ClickCookie, 50*i);
  if (AutoPlay.Config.ClickMode>1)
    for (var i = 1; i<10; i++) setTimeout(AutoPlay.speedClicking, 30*i);
  else{  // ClickMode == 1
    Game.ClickCookie();
    if ('Click frenzy' in Game.buffs || 'Dragonflight' in Game.buffs 
	    || 'Cursed finger' in Game.buffs) {
      for (var i = 1; i<5; i++) setTimeout(Game.ClickCookie, 30*i);
    }
  }
}

AutoPlay.speedClicking = function() {
  Game.ClickCookie();
  var clickCount = 1<<(10*(AutoPlay.Config.ClickMode-2));
  Game.ClickCookie(0, clickCount*Game.computedMouseCps);
}
//
//======================== Handle Savings Calculation =========================
AutoPlay.handleSavings = function() {
  if (Game.ascensionMode==1) { // do not save in reborn mode
    AutoPlay.savingsGoal = 0;
    return;
  }
  if (AutoPlay.Config.SavingStrategy == 0) {  // None
    AutoPlay.savingsGoal = 0;
    return;
  }
  if (AutoPlay.Config.SavingStrategy == 2) {  // LUCKY
    AutoPlay.savingsGoal = Game.unbuffedCps * 60 * 100;
    AutoPlay.addActivity('Saving to lucky (' +
      Beautify(AutoPlay.savingsGoal) + ' cookies)');
    return;
  }
  if (AutoPlay.Config.SavingStrategy == 3) {  // LUCKY FRENZY
    AutoPlay.savingsGoal = Game.unbuffedCps * 60 * 100 * 7;
    AutoPlay.addActivity('Saving to lucky frenzy (' +
      Beautify(AutoPlay.savingsGoal) + ' cookies)');
    return;
  }
  // Auto: Save nothing for first 30 minutes, then linearly ramp up savings
  // to equal target.  Target is lucky until upgrade 'get lucky'
  // is bought, then it's lucky frenzy
  const startTime = 30 * 60 * 1000;  // wait before starting to save
  const delayTime = 5 * 60 * 1000;  // wait before starting to save
  const targetTime = 400 * 60 * 1000;  // after start, time to target amount
  let elapsedTime = AutoPlay.now-AutoPlay.savingsStart - startTime;
  let scaling = Math.min(elapsedTime / targetTime, 1);  //fraction of time to target
  if (elapsedTime < 0) {
    AutoPlay.savingsGoal = 0;
    AutoPlay.addActivity('Not saving for first ' + (startTime / 60 / 1000) +
          '+ minutes!');
    return;
  }
  if (Game.UpgradesById[52].bought && Game.UpgradesById[53].bought) {
    AutoPlay.savingsGoal = Game.unbuffedCps * 60 * 100;
  }
  else {
    AutoPlay.savingsGoal = 0;
    AutoPlay.addActivity('Not saving until golden cookie upgrades are purchased.');
    return;
  }
  if (Game.UpgradesById[86].bought)  // get lucky
    AutoPlay.savingsGoal *= 7;
  // scale goal between 0 and 1 based on elapsed time
  if (elapsedTime < targetTime) {
    AutoPlay.savingsGoal *= scaling;
    AutoPlay.addActivity('Saving to ' + Beautify(AutoPlay.savingsGoal) +
      ' cookies (' + (scaling * 100).toFixed(1) + '%)');
  }
  else {
    AutoPlay.addActivity('Saving to ' + Beautify(AutoPlay.savingsGoal) +
      ' cookies');
  }
  if (AutoPlay.savingsGoal > Game.Objects["Cursor"].getPrice()) { // saving is too expensive
    AutoPlay.savingsStart += delayTime; // delay saving
  }
  let fractionSaved = Game.cookies / AutoPlay.savingsGoal;
  // if fallen behind savings plan, reset to current fraction
  // this happens if you stop the bot for a while or buy something with
  // a big payback
  if (fractionSaved < 0.8) {
    AutoPlay.savingsStart = AutoPlay.now - startTime -
      targetTime * fractionSaved / scaling;  // fraction towards goal
  }
}

AutoPlay.buyBuilding = function(building, checkAmount=1, buyAmount=1) {
  if (building.getSumPrice(checkAmount) < Game.cookies - AutoPlay.savingsGoal) {
    building.buy(buyAmount);
    AutoPlay.hyperActive=true; // might buy more soon
    return true;
  }
  return false;
}

AutoPlay.buyUpgrade = function(upgrade, bypass=true) {
  if (upgrade.getPrice() < Game.cookies - AutoPlay.savingsGoal) {
    upgrade.buy(bypass);
    AutoPlay.hyperActive=true;  // might buy more soon
  }
}

//======================= CookieMonster Strategy ============================
AutoPlay.bestBuy = function() {
  // if cookie monster isn't installed
  if (typeof CookieMonsterData == 'undefined') {
    AutoPlay.handleBuildings();
    AutoPlay.handleUpgrades();
    return;
  }

  // this happens with cursed finger
  if (AutoPlay.cpsMult == 0)
    return;

  // initialize with cursor, when cps = 0 all pp = inf
  let best = Game.ObjectsById[0].name;
  let minpp = Infinity;
  let type = 'building';

  // these values are multiplied by game.cps below
  const overrides = {
    'Plastic mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Iron mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Titanium mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Adamantium mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Unobtainium mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Eludium mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Wishalloy mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Fantasteel mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Nevercrack mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Armythril mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Technobsidian mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Plasmarble mouse': CookieMonsterData.Cache.AverageClicks * 0.01,
    'Lucky day': 0.5,
    'Serendipity': 0.5,
    'Get lucky': 0.5,
    'A crumbly egg': 0.5,
    'A festive hat': 0.1,
    'Reindeer baking grounds': 0.1,
    'Weighted sleighs': 0.1,
    'Ho ho ho-flavored frosting': 0.1,
    'Season savings': 0.01,
    'Toy workshop': 0.05,
    'Santa\'s bottomless bag': 0.1,
    'Santa\'s helpers': CookieMonsterData.Cache.AverageClicks * 0.1,
    'Golden goose egg': 0.05,
    'Faberge egg': 0.01,
    'Wrinklerspawn': 0.05,
    'Cookie egg': CookieMonsterData.Cache.AverageClicks * 0.1,
    'Omelette': 0.1,
    'Elder Pledge': 0.1, // avoidbuy will catch this if have achievement
  }

  // change cookie monster values for some 'infinite' pp upgrades
  for (var u in CookieMonsterData.Upgrades) {
    if (u in overrides){
      CookieMonsterData.Upgrades[u].bonus = overrides[u]* Game.cookiesPs;
      CookieMonsterData.Upgrades[u].pp = (Math.max(Game.Upgrades[u].getPrice() - (Game.cookies + CookieMonsterData.Cache.WrinklersTotal), 0) / Game.cookiesPs) + (Game.Upgrades[u].getPrice() / CookieMonsterData.Upgrades[u].bonus);
    }
  }

  // buildings
  let check_obj = CookieMonsterData.Objects1;
  let buy_amt = 1;
  if ((Game.resets && Game.ascensionMode!=1 &&
       Game.isMinigameReady(Game.Objects["Temple"]) &&
       Game.Objects["Temple"].minigame.slot[0]==10 && // Rigidel is in slot 0
       Game.BuildingsOwned%10==0 && (AutoPlay.now-Game.startDate) > 2*60*1000)
      || AutoPlay.buy10){
    // if owned % 10 != 0, will just buy one
    buy_amt = 10;
    check_obj = CookieMonsterData.Objects10;
  }

  var haveBought=false;
  // for the following, pp < 1 indicates we can pay off the cost in less
  // than a second.  It's better to just buy it instead of checking it repeatedly
  // CheckDragon twice in case the pp < 1 case set us over the limit
  for (var b in check_obj){
    if (AutoPlay.checkDragon(b) && check_obj[b].pp < 1)
      if (AutoPlay.buyBuilding(Game.Objects[b], buy_amt, buy_amt)) haveBought=true;
    if (check_obj[b].pp < minpp && AutoPlay.checkDragon(b)) {
      minpp = check_obj[b].pp;
      best = b;
      type = 'building';
    }
  }

  // if payback period is very short, buy 10 buildings next time
  AutoPlay.buy10 = minpp < 1;

  // upgrades
  if (Game.Achievements["Hardcore"].won || Game.UpgradesOwned!=0) {
    for (var u of Game.UpgradesInStore) {
      if (!AutoPlay.avoidbuy(u) && !u.bought) {
        if (CookieMonsterData.Upgrades[u.name].pp < 1) {
          if (AutoPlay.buyUpgrade(u)) haveBought=true;
        } else if (CookieMonsterData.Upgrades[u.name].pp < minpp) {
          minpp = CookieMonsterData.Upgrades[u.name].pp;
          best = u.name;
          type = 'upgrade';
        }
      }
    }
  }

  if (type == 'building') {
    if (AutoPlay.buyBuilding(Game.Objects[best], buy_amt, buy_amt)) haveBought=true;
  } else if (type == 'upgrade')
    if (AutoPlay.buyUpgrade(Game.Upgrades[best], true)) haveBought=true;

  // sugar frenzy check
  if (AutoPlay.canUseLumps && Game.Upgrades["Sugar frenzy"].unlocked &&
        !Game.Upgrades["Sugar frenzy"].bought &&
      (AutoPlay.now-Game.startDate) > 3*24*60*60*1000)
      Game.Upgrades["Sugar frenzy"].buy();

  // nothing bought, within first 10 minutes, have neverclick
  if (!haveBought) {
    if ((AutoPlay.now-Game.startDate) < 10*60*1000 &&
        Game.Achievements['Neverclick'].won) {
      AutoPlay.setDeadline(AutoPlay.now+5000); // wait five seconds before next step
    }
    AutoPlay.addActivity('Waiting to buy ' + best);
  }
}

//===================== Handle Upgrades ==========================
AutoPlay.handleUpgrades = function() {
  if (!Game.Achievements["Hardcore"].won && Game.UpgradesOwned==0) return;
    for (var me in Game.UpgradesById) {
        var e = Game.UpgradesById[me];
        if (e.unlocked && !e.bought && !AutoPlay.avoidbuy(e))
            AutoPlay.buyUpgrade(e, true);  // checks price, bypass = true
    };
  if (AutoPlay.canUseLumps && Game.Upgrades["Sugar frenzy"].unlocked &&
      !Game.Upgrades["Sugar frenzy"].bought &&
      (AutoPlay.now-Game.startDate) > 3*24*60*60*1000)
    Game.Upgrades["Sugar frenzy"].buy();
}

AutoPlay.avoidbuy = function(up) { //normally we do not buy 227, 71, ...
  switch(up.id) {
    case 71: case 73: return Game.Achievements["Elder nap"].won &&
      Game.Achievements["Elder slumber"].won &&
      Game.Achievements["Elder calm"].won; // brainsweep
    case 74: return Game.Achievements["Elder nap"].won &&
      Game.Achievements["Elder slumber"].won &&
      Game.Upgrades["Elder Covenant"].unlocked; // elder pledge
    case 84: return Game.Upgrades["Elder Pledge"].bought ||
      Game.Achievements["Elder calm"].won; // elder covenant
    case 227: return true; // choco egg
    case 563: return AutoPlay.nextAchievement!=432 ||
      Game.Achievements["Thick-skinned"].won; //shimmering veil
    default: return up.pool=="toggle";
  }
}

//===================== Handle Buildings ==========================
AutoPlay.handleBuildings = function() {
  var buyAmount = 100, checkAmount = 1;
  if (Game.buyMode==-1) Game.storeBulkButton(0);
  if ((AutoPlay.now-Game.startDate) > 10*60*1000) {
    buyAmount = 1; // buy single after 10 minutes
    var maxBuilding = Game.ObjectsById[Game.ObjectsById.length-1];
    if (maxBuilding.getSumPrice(100) < Game.cookies - AutoPlay.savingsGoal)
      buyAmount = 100;
    else if (maxBuilding.getSumPrice(10) < Game.cookies - AutoPlay.savingsGoal)
      buyAmount = 10;
  }
  if (Game.resets && Game.ascensionMode!=1 &&
      Game.isMinigameReady(Game.Objects["Temple"]) &&
      Game.Objects["Temple"].minigame.slot[0]==10 && // Rigidel is in slot 0
      Game.BuildingsOwned%10==0 && (AutoPlay.now-Game.startDate) > 2*60*1000)
    buyAmount = checkAmount = 10;
  var cpc = 0; // relative strength of cookie production
  for (var i = Game.ObjectsById.length-1; i>=0; i--) {
    var me = Game.ObjectsById[i];
    if (me.locked) continue;
    var mycpc = me.storedCps / me.price;
    if (mycpc>cpc) cpc = mycpc;
  }
  for (var i = Game.ObjectsById.length-1; i>=0; i--) {
    var me = Game.ObjectsById[i];
    if (me.locked) continue;
    if (me.storedCps/me.price > cpc/2 || me.amount % 50 >= 40) {
      //this checks price, sets deadline
      if (AutoPlay.buyBuilding(me, checkAmount, buyAmount)) return;
    }
  }
  if (Game.resets && Game.ascensionMode!=1 &&
      Game.isMinigameReady(Game.Objects["Temple"]) &&
      Game.Objects["Temple"].minigame.slot[0]==10 &&
      Game.BuildingsOwned%10!=0) { // Rigidel is in slot 0, buy the cheapest
    var minIdx=0, minPrice=Game.ObjectsById[minIdx].price;
    for (var i = Game.ObjectsById.length-1; i>=0; i--)
      if (Game.ObjectsById[i].price < minPrice) {
        minPrice = Game.ObjectsById[i].price;
        minIdx = i;
      }
    AutoPlay.buyBuilding(Game.ObjectsById[minIdx]);
  }
}

//===================== Handle Seasons ==========================
AutoPlay.handleSeasons = function() {
  if (Game.Upgrades["A festive hat"].bought &&
      !Game.Upgrades["Santa's dominion"].unlocked) { // develop santa
    Game.specialTab = "santa";
    Game.UpgradeSanta();
    Game.ToggleSpecialMenu(0);
  }
  if (Game.season == "christmas" && !Game.Achievements["Baby it\'s old outside"].won) {
    if (Game.onMenu) Game.ShowMenu('');
    Game.Objects['Grandma'].canvas.parentElement.scrollIntoView()
    elfGrandmas = Game.Objects["Grandma"].pics.filter(function(p) { return p.pic=="elfGrandma.png"; });
    if (elfGrandmas.length) {
      elfGranny = elfGrandmas[0];
      xPos = elfGranny.x+32;
      yPos = elfGranny.y+32;
      Game.Objects['Grandma'].mousePos=[xPos,yPos];
      Game.Objects['Grandma'].mouseOn=true;
      Game.mouseDown = 1;
      setTimeout(AutoPlay.unElf, 1000);
    }
  }
  if (!Game.Upgrades["Season switcher"].bought || Game.ascensionMode==1) return;
  if (AutoPlay.seasonFinished(Game.season)) {
    switch (Game.season) {
      case "christmas": Game.Upgrades["Lovesick biscuit"].buy(); break; // to valentine
      case "valentines": Game.Upgrades["Bunny biscuit"].buy(); break; // to easter
      case "easter": Game.Upgrades["Ghostly biscuit"].buy(); break; // to halloween
      default: Game.Upgrades["Festive biscuit"].buy(); break; // to christmas
    }
  } else if (!(AutoPlay.allUnlocked(AutoPlay.allSeasonUpgrades)))
    AutoPlay.addActivity('Waiting for all results in '+Game.season+'.');
}

AutoPlay.unElf = function() {
  Game.mouseDown = 0;
  Game.tickerL.scrollIntoView();
}

AutoPlay.allUnlocked = function(l) {
  return l.every(function (u) { return Game.UpgradesById[u].unlocked; });
}

AutoPlay.seasonFinished = function(s) {
  if (s=='') return true;
  switch (s) {
    case "valentines": return AutoPlay.allUnlocked(AutoPlay.valentineUpgrades);
    case "christmas":
      if (AutoPlay.allUnlocked(AutoPlay.allSeasonUpgrades)) return false;
      else return AutoPlay.allUnlocked(AutoPlay.christmasUpgrades);
    case "easter": return (Game.Achievements["Hide & seek champion"].won &&
                           AutoPlay.allUnlocked(AutoPlay.easterUpgrades));
    case "halloween": return AutoPlay.allUnlocked(AutoPlay.halloweenUpgrades);
    default: return true;
  }
}

//===================== Handle Sugarlumps ==========================
AutoPlay.minLumpsOK = false;
AutoPlay.cheatLumps = false;

AutoPlay.handleSugarLumps = function() {
  if (!Game.canLumps()) return; //do not work with sugar lumps before enabled
  if (Game.ascensionMode==1) return; //no sugar lumps in born again
  var age = AutoPlay.now-Game.lumpT;
  if (age>=Game.lumpMatureAge && Game.lumpCurrentType==0 &&
      AutoPlay.minLumpsOK && !Game.Achievements["Hand-picked"].won)
    AutoPlay.harvestLump();
//  if(Game.lumpCurrentType==0) AutoPlay.farmGoldenSugarLumps(age);
// not needed now, because we cheat sugar lumps
  if (age>=Game.lumpRipeAge)
    AutoPlay.harvestLump(); // normal harvesting, should check !masterCopy
  AutoPlay.cheatSugarLumps(age);
  AutoPlay.useLump();
}

AutoPlay.cheatSugarLumps = function(age) {
  AutoPlay.cheatLumps = false;
  if (AutoPlay.Config.CheatLumps==0) return;
  var cheatReduction = 25;
  if (AutoPlay.Config.CheatLumps==1) {
    if (AutoPlay.finished) return;
    if (!AutoPlay.endPhase()) return;
    if (AutoPlay.lumpRelatedAchievements.every(
        function(a) { return Game.AchievementsById[a].won; }))
      return;
    if (AutoPlay.lumpRelatedAchievements.includes(AutoPlay.nextAchievement))
      cheatReduction*=25;
  }
  AutoPlay.cheatLumps = true;
  AutoPlay.addActivity('Cheating sugar lumps.');
  // divide lump ripe time, making days into hours, minutes or seconds
  if (AutoPlay.Config.CheatLumps==2) cheatReduction = 25;
  if (AutoPlay.Config.CheatLumps==3) cheatReduction = 25*25;
  if (AutoPlay.Config.CheatLumps==4) {
    cheatReduction = 25*25*25;
  }
  var cheatDelay = Game.lumpRipeAge/cheatReduction;
  if (age<Game.lumpRipeAge-cheatDelay) Game.lumpT -= cheatDelay*(cheatReduction-1);
}

AutoPlay.harvestLump = function() {
  Game.clickLump();
  AutoPlay.useLump();
}

AutoPlay.useLump = function() { // recursive call to handle many sugar lumps
  AutoPlay.canUseLumps = false;
  if (!Game.lumps) return;
  for (var i in AutoPlay.level1Order) {
    var me = Game.ObjectsById[AutoPlay.level1Order[i]];
    if (!me.level && Game.lumps) { me.levelUp(); AutoPlay.useLump(); return; }
  }
  var me = Game.Objects["Farm"]; // bring Garden to level 9
  if (me.level<9) {
    if (me.level<Game.lumps) { me.levelUp(); AutoPlay.useLump(); }
    return;
  }
  AutoPlay.minLumpsOK = true;
  let lumpLimit = AutoPlay.endPhase()?0:100; // keep 100 lumps before the end game
  var me = Game.Objects["Cursor"]; // need 12 cursors for stock market
  if (me.level<12) {
    if (me.level+lumpLimit<Game.lumps) { me.levelUp(); AutoPlay.useLump(); }
    return;
  }
  for (var i = Game.ObjectsById.length-1; i>=0; i--) {
    var me = Game.ObjectsById[i];
    if (me.level<10) {
      if (me.level+lumpLimit<Game.lumps) {
        me.levelUp(); AutoPlay.useLump(); return;
      }
    }
  }
  AutoPlay.canUseLumps = true;
  var me = Game.Objects["Cursor"]; // 20 cursors for luminous gloves
  if (me.level<20) {
    if (me.level+100<Game.lumps) {
      me.levelUp(); AutoPlay.useLump(); return;
    } else {
      AutoPlay.canUseLumps = false;
    }
  }
}

/* farming golden sugar lumps - not needed now since we cheat sugar lumps
AutoPlay.copyWindows=[]; // need to init in the code some place
AutoPlay.masterSaveCopy=0;
AutoPlay.masterLoadCopy=0;
AutoPlay.copyCount=100;
// golden sugar lumps = 1 in 2000 (ordinary) -> about 5 years
// this is tested and it works (some kind of cheating) - do this only in endgame
AutoPlay.farmGoldenSugarLumps = function(age) {
  if (Game.Achievements["All-natural cane sugar"].won) return;
  if (AutoPlay.nextAchievement!=Game.Achievements["All-natural cane sugar"].id)
    return;
  if (AutoPlay.masterSaveCopy) {
    AutoPlay.info("back to save master");
    Game.LoadSave(AutoPlay.masterSaveCopy);
    AutoPlay.masterSaveCopy = 0;
    return;
  }
  if (age<Game.lumpRipeAge && age>=Game.lumpMatureAge) {
    if (AutoPlay.copyWindows.length>=AutoPlay.copyCount) { // check rather !masterCopy
      AutoPlay.info("creating master load copy");
      AutoPlay.masterLoadCopy = Game.WriteSave(1);
    }
    if (AutoPlay.copyWindows.length) {
      Game.LoadSave(AutoPlay.copyWindows.pop());
      if (Game.lumpCurrentType)
        AutoPlay.info("found lump with type " + Game.lumpCurrentType);
      if (Game.lumpCurrentType==2) {
        AutoPlay.info("YESS, golden lump");
        AutoPlay.masterLoadCopy = 0; AutoPlay.copyWindows=[];
      }
    } else if (AutoPlay.masterLoadCopy) {
      AutoPlay.info("going back to master copy");
      Game.LoadSave(AutoPlay.masterLoadCopy);
      AutoPlay.masterLoadCopy = 0; }
  }
  if (age>=Game.lumpRipeAge && AutoPlay.copyWindows.length<AutoPlay.copyCount) {
    if(!AutoPlay.copyWindows.length) AutoPlay.info("farming golden sugar lumps.");
    AutoPlay.masterSaveCopy = Game.WriteSave(1);
    Game.clickLump();
    AutoPlay.copyWindows.push(Game.WriteSave(1));
  }
}
*/

AutoPlay.handleMinigames = function() {
  if (Game.ascensionMode==1) return; //no mini games in born again
  AutoPlay.handlePantheon();
  AutoPlay.handleGarden();
  AutoPlay.handleStockMarket();
}

AutoPlay.handleSpeedMinigames = function() {
  AutoPlay.handleGrimoires();
}

// wizard towers: grimoires ===========================
AutoPlay.handleGrimoires = function() {
  if (Game.isMinigameReady(Game.Objects["Wizard tower"])) {
    var g = Game.Objects["Wizard tower"].minigame;
    var sp = g.spells["hand of fate"]; // try to get a sugar lump in backfiring
    if (Game.shimmerTypes['golden'].n && g.magic>=g.getSpellCost(sp) &&
        g.magic/g.magicM >= 0.95) {
      g.castSpell(sp);
    }
    if (Game.shimmerTypes['golden'].n >= 3 && g.magic > 30) {
      var t=Game.Objects["Wizard tower"];
      t.sell(t.amount-30);
      // need to wait a while for update of grimoire
    }
    if (AutoPlay.cpsMult>100) {
      sp = g.spells["hand of fate"]; // try to get another golden cookie
      if (g.magic>=g.getSpellCost(sp)) { g.castSpell(sp); return; }
      sp = g.spells["conjure baked goods"]; // normally not worth it
      if (g.magic>=g.getSpellCost(sp)) { g.castSpell(sp); return; }
      if (AutoPlay.canUseLumps && Game.lumps>100) { g.lumpRefill.click(); }
    }
  }
}

// temples: pantheon =============================
AutoPlay.handlePantheon = function() {
  if (Game.isMinigameReady(Game.Objects["Temple"])) {
    var age = AutoPlay.now-Game.lumpT;
    if (AutoPlay.poppingWrinklers)
        AutoPlay.assignSpirit(0,"scorn",0);
    else if (Game.lumpRipeAge-age < 61*60*1000 && !AutoPlay.cheatLumps)
      AutoPlay.assignSpirit(0,"order",0);
    else if (AutoPlay.preNightMode() && Game.lumpOverripeAge-age < 9*60*60000 &&
        (new Date).getMinutes()==59 && !AutoPlay.cheatLumps)
      AutoPlay.assignSpirit(0,"order",0);
    else AutoPlay.assignSpirit(0,"mother",0);
    AutoPlay.assignSpirit(1,"decadence",0);
    AutoPlay.assignSpirit(2,"labor",0);
  }
}

AutoPlay.nightAtPantheon = function(on) {
  if (!Game.isMinigameReady(Game.Objects["Temple"])) return;
  if (on) {
    AutoPlay.removeSpirit(1,"decadence");
    AutoPlay.removeSpirit(2,"labor");
    AutoPlay.assignSpirit(1,"asceticism",1);
    AutoPlay.assignSpirit(2,"industry",1);
  } else {
    AutoPlay.removeSpirit(1,"asceticism");
  }
}

AutoPlay.assignSpirit = function(slot, god, force) {
  var g=Game.Objects["Temple"].minigame;
  if (g.swaps+force<3) return;
  if (g.slot[slot]==g.gods[god].id) return;
  g.slotHovered = slot; g.dragging = g.gods[god]; g.dropGod();
}

AutoPlay.removeSpirit = function(slot, god) {
  var g=Game.Objects["Temple"].minigame;
  if (g.slot[slot]!=g.gods[god].id) return;
  g.slotHovered = -1; g.dragging = g.gods[god]; g.dropGod();
}

// farms: garden ================================
AutoPlay.handleGarden = function() {
  if (Game.isMinigameReady(Game.Objects["Farm"])) {
    var g = Game.Objects["Farm"].minigame;
    AutoPlay.harvesting(g);
    AutoPlay.planting(g);
    if (AutoPlay.gardenSacrificeReady(g)) {
        // get "Seedless to nay" achievement to improve future plant/upgrade growth
        AutoPlay.plantCookies = false;
        g.askConvert(); Game.ConfirmPrompt();
        AutoPlay.plantList=[0,0,0,0];
        return;
    }
    if (!AutoPlay.canUseLumps && AutoPlay.gardenReady(g) && !AutoPlay.finished &&
        !AutoPlay.harvestPlant && !AutoPlay.lumpRelatedAchievements.every(
          function(a) { return Game.AchievementsById[a].won; })) {
      AutoPlay.plantCookies = false;
      //convert garden in order to get more sugar lumps
      g.askConvert(); Game.ConfirmPrompt();
      AutoPlay.plantList=[0,0,0,0];
    }
  }
}

AutoPlay.nightAtGarden = function(on) {
  if (!Game.isMinigameReady(Game.Objects["Farm"])) return;
  if (on!=Game.Objects["Farm"].minigame.freeze)
    FireEvent(l('gardenTool-2'),'click'); // (un)freeze garden
}

AutoPlay.gardenUpgrades = range(470,476);

AutoPlay.gardenSacrificeReady = function(g) {
  AutoPlay.wantGardenSacrifice = false;
  if (!Game.AchievementsById[382].won && g.plantsUnlockedN==g.plantsN) {
    // we'd like to get the achievement; check if we can
    if (!AutoPlay.harvestPlant) {
      return true;
    }
    AutoPlay.wantGardenSacrifice = true;
    AutoPlay.addActivity('Waiting for harvest before getting Seedless to Nay.');
  }
  return false;
}

AutoPlay.gardenReady = function(g) { // have all plants and all cookies
  return (Game.Objects["Farm"].level>8) &&
    (g.plantsUnlockedN==g.plantsN) &&
    AutoPlay.allUnlocked(AutoPlay.gardenUpgrades);
}

AutoPlay.plantDependencies = [
['dummy','dummy','dummy'], // just to fill index 0
['queenbeetLump','queenbeet','queenbeet'], // need to know its index
['everdaisy','elderwort','tidygrass'], // need to know its index
// queenbeet is most important
['bakeberry','bakerWheat','bakerWheat'], //level 1
['chocoroot','bakerWheat','brownMold'], //level 1
['queenbeet','chocoroot','bakeberry'], //level 2
// longest path
['thumbcorn','bakerWheat','bakerWheat'], //level 1
['cronerice','bakerWheat','thumbcorn'], //level 2
['gildmillet','thumbcorn','cronerice'], //level 3
['clover','bakerWheat','gildmillet'], //level 4
['shimmerlily','gildmillet','clover'], //level 5
['elderwort','cronerice','shimmerlily'], //level 6
//rest is given according to ripening times
['drowsyfern','chocoroot','keenmoss'], //level 7
['duketater','queenbeet','queenbeet'], //level 3
['tidygrass','bakerWheat','whiteChocoroot'], //level 3
['nursetulip','whiskerbloom','whiskerbloom'], //level 7
['doughshroom','crumbspore','crumbspore'], //level 1
['wrinklegill','crumbspore','brownMold'], //level 1
['shriekbulb','wrinklegill','elderwort'], //level 7
['ichorpuff','crumbspore','elderwort'], //level 7
['whiskerbloom','whiteChocoroot','shimmerlily'], //level 6
['chimerose','whiskerbloom','shimmerlily'], //level 7
['keenmoss','brownMold','greenRot'], //level 6
['wardlichen','cronerice','whiteMildew'], //level 3
['glovemorel','thumbcorn','crumbspore'], //level 2
['whiteChocoroot','chocoroot','whiteMildew'], //level 2
['whiteMildew','brownMold','brownMold'], //level 1
['goldenClover','bakerWheat','gildmillet'], //level 4
['greenRot','clover','whiteMildew'], //level 5
['cheapcap','crumbspore','shimmerlily'], //level 6
['foolBolete','greenRot','doughshroom'] //level 6
];

if (!AutoPlay.plantList) AutoPlay.plantList = [0,0,0,0];
AutoPlay.plantPending = false; // Plant we want that is not mature yet
AutoPlay.harvestPlant = false; // Plant that drops things when harvesting
AutoPlay.plantsMissing = true; // Still unlocked plants?

AutoPlay.sectorText = function(sector) {
  if (Game.Objects["Farm"].level>4)
    return (sector<2?'bottom':'top')+(sector%2?' left':' right');
  else if (Game.Objects["Farm"].level==4) return (sector%2?'left':'right');
  else return 'middle';
}

AutoPlay.havePlant = function(game,plant) {
  if (game.plants[plant].unlocked) return true;
  var plantID=game.plants[plant].id+1;
  for (var x = 0;x<6;x++) for (var y = 0;y<6;y++) {
    if ((game.getTile(x,y))[0]==plantID) return true;
  }
  return false;
}

AutoPlay.findPlants = function(game,idx) {
  if (AutoPlay.wantAscend) return false; // do not plant before ascend
  var couldPlant = 0;
  if (AutoPlay.plantList[idx]!=0) {// already used
    var oldPlant = AutoPlay.plantDependencies[AutoPlay.plantList[idx]][0];
    AutoPlay.addActivity("Trying to get plant " + game.plants[oldPlant].name +
      " on sector " + AutoPlay.sectorText(idx) + '.');
    AutoPlay.plantCookies = false;
    if (AutoPlay.havePlant(game,oldPlant)) AutoPlay.plantList[idx]=0;
    else return true;
  }
  // try to plant expensive plants first (if possible) as they take longest time.
  var chkx = (idx%2)?0:5; var chky = (idx>1)?0:5;
  if (game.isTileUnlocked(chkx,chky)) { // only plant if the spot is big enough
    if (!AutoPlay.havePlant(game,'everdaisy') &&
        game.plants['elderwort'].unlocked && game.plants['tidygrass'].unlocked) {
      if (AutoPlay.plantList.includes(2)) couldPlant = 2;
      else { AutoPlay.plantList[idx] = 2; return true; }
    }
    if (!AutoPlay.havePlant(game,'queenbeetLump') &&
        game.plants['queenbeet'].unlocked) {
      if (AutoPlay.plantList.includes(1)) couldPlant = 1;
      else { AutoPlay.plantList[idx] = 1; return true; }
    }
  }
  for (var i = 3; i<AutoPlay.plantDependencies.length; i++) { // plant normal plants
    var plant = AutoPlay.plantDependencies[i][0];
    if (!AutoPlay.havePlant(game,plant) &&
        game.plants[AutoPlay.plantDependencies[i][1]].unlocked &&
        game.plants[AutoPlay.plantDependencies[i][2]].unlocked) { // want it
      if (AutoPlay.plantList.includes(i)) {
        if (!couldPlant) couldPlant = i; // already planted - remember it
      } else { AutoPlay.plantList[idx] = i; return true; }
    }
  }
  if (!couldPlant) return false;
  AutoPlay.plantList[idx] = couldPlant;
  return true;
}

AutoPlay.planting = function(game) {
  if (!game.plants["meddleweed"].unlocked) {  // wait for meddleweed
    AutoPlay.plantList=[0,0,0,0];
    AutoPlay.addActivity("Waiting for meddleweed.");
    AutoPlay.switchSoil(game,0,'fertilizer');
    return;
  }
  if (!game.plants["crumbspore"].unlocked || !game.plants["brownMold"].unlocked) {
    AutoPlay.addActivity("Trying to get crumbspore and brown mold."); // use meddleweed
    for (var x = 0; x<6; x++) for (var y = 0; y<6; y++)
      if (game.isTileUnlocked(x,y)) AutoPlay.plantSeed(game,"meddleweed",x,y);
    return;
  }
  AutoPlay.plantsMissing = true;
  if (!AutoPlay.findPlants(game,0)) {
    AutoPlay.plantList=[0,0,0,0];
    for (var i = 0; i<4; i++) AutoPlay.plantSector(game,i,'','','dummy');
    return;
  }
  AutoPlay.switchSoil(game,0,AutoPlay.plantPending?'fertilizer':'woodchips'); // want mutations
  if (Game.Objects["Farm"].level<4) {
    var targets = [[AutoPlay.plantDependencies[AutoPlay.plantList[0]][1],3,2],
      [AutoPlay.plantDependencies[AutoPlay.plantList[0]][2],3,3]];
    if(game.isTileUnlocked(3,4))
      targets = targets.concat([[AutoPlay.plantDependencies[AutoPlay.plantList[0]][1],3,4]]);
    AutoPlay.plantSeeds(game, targets);
    return;
  }
  AutoPlay.findPlants(game,1);
  if (Game.Objects["Farm"].level==4) { // now we are at level 4
    if(AutoPlay.plantList[1]==0) { AutoPlay.info("ERROR 42?"); return; }
    AutoPlay.plantSeeds(game, [
      [AutoPlay.plantDependencies[AutoPlay.plantList[0]][1],4,2],
      [AutoPlay.plantDependencies[AutoPlay.plantList[0]][2],4,3],
      [AutoPlay.plantDependencies[AutoPlay.plantList[0]][1],4,4]
    ]);
    AutoPlay.plantSeeds(game, [
      [AutoPlay.plantDependencies[AutoPlay.plantList[1]][1],1,2],
      [AutoPlay.plantDependencies[AutoPlay.plantList[1]][2],1,3],
      [AutoPlay.plantDependencies[AutoPlay.plantList[1]][1],1,4]
    ]);
    return;
  }
  AutoPlay.findPlants(game,2); AutoPlay.findPlants(game,3); // plant on four areas
  for (var sector = 0; sector<4; sector++) {
    var dep=AutoPlay.plantDependencies[AutoPlay.plantList[sector]];
    AutoPlay.plantSector(game,sector, dep[1], dep[2], dep[0]);
  }
}

AutoPlay.plantSector = function(game,sector,plant1,plant2,plant0) {
  var X = (sector%2)?0:3, Y = (sector>1)?0:3;
  if (plant0=="dummy") {
    var thePlant=AutoPlay.seedCalendar(game,sector);
    for (var x = X; x<X+3; x++) for (var y = Y; y<Y+3; y++)
      AutoPlay.plantSeed(game,thePlant,x,y);
    return;
  }
  if (plant0=="queenbeetLump") {
    for (var y = Y; y<Y+3; y++) {
      AutoPlay.plantSeed(game,plant1,X,y);
      AutoPlay.plantSeed(game,plant2,X+2,y);
    }
    AutoPlay.plantSeed(game,plant1,X+1,Y);
    AutoPlay.plantSeed(game,plant2,X+1,Y+2);
    return;
  }
  if (plant0=="everdaisy") {
    for (var y = Y; y < Y+3; y++) {
      AutoPlay.plantSeed(game,plant1,X,y);
      AutoPlay.plantSeed(game,plant2,X+2,y);
    }
    return;
  }
  AutoPlay.plantSeeds(game,[
    [plant1,X+1,Y],
    [plant2,X+1,Y+1],
    [plant1,X+1,Y+2]
  ]);
}

AutoPlay.plantCookies = false;
AutoPlay.wantGardenSacrifice = false;

AutoPlay.plantSeed = function(game,seed,whereX,whereY) {
  if (AutoPlay.cpsMult > 1+10*(AutoPlay.grindingCheat()+(AutoPlay.Config.CheatGolden>1))) {
    AutoPlay.addActivity("Do not buy plants now - it is too expensive.");
    return; // do not plant when it is expensive
  }
  if (!game.isTileUnlocked(whereX,whereY)) return; // do not plant on locked tiles
  var oldPlant = (game.getTile(whereX,whereY))[0];
  if (oldPlant!=0) { // slot is already planted, try to get rid of it
    if (game.plantsById[oldPlant-1].key!=seed)
      AutoPlay.cleanSeed(game,whereX,whereY);
    return;
  }
  if (!game.canPlant(game.plants[seed])) return;
  if (game.plants[seed].cost * 60 * Game.cookiesPs > Game.cookies - AutoPlay.savingsGoal)
    return;
  game.useTool(game.plants[seed].id,whereX,whereY);
}

AutoPlay.plantSeeds = function(game, targets) {
  // plant target locations.  Will only plant if can afford all targets.
  // targets is an array of arrays with seed, x, y positions
  if (AutoPlay.cpsMult > 1+10*(AutoPlay.grindingCheat()+(AutoPlay.Config.CheatGolden>1))) {
    AutoPlay.addActivity("Do not buy plants now - it is too expensive.");
    return; // do not plant when it is expensive
  }
  // calculate costs
  let cost = 0;
  let toPlant = []; // array of targets to plant
  // if something is in the way, reorder
  var keepSeed=0;
  for (var target of targets){
    var seed = target[0],
      whereX = target[1],
      whereY = target[2];
    if (keepSeed) {
      var swap=seed;
      seed=keepSeed;
      keepSeed=swap;
    }
    // check if valid position and can plant
    if (!game.isTileUnlocked(whereX, whereY)){
      continue;
    }
    if (!game.canPlant(game.plants[seed]))
      continue;
    // check if position is already occupied by target
	  // should be empty if canPlant is true
    var oldPlant = (game.getTile(whereX,whereY))[0];
    if (oldPlant!=0) { // slot is already planted
      // get rid of it if it isn't the target
      if (game.plantsById[oldPlant-1].key!=seed){
        AutoPlay.cleanSeed(game,whereX,whereY);
        keepSeed=seed;
        continue;  //jump over filled slot
      }
    } else { // here we know that nothing is in the spot
      cost += game.plants[seed].cost
      toPlant = toPlant.concat([[seed,whereX,whereY]])
    }
  }
  // cost is cost in minutes of current CPS
  cost *= 60 * Game.cookiesPs;
  if (cost > Game.cookies - AutoPlay.savingsGoal) {
    return;
  }
  for (var target of toPlant){
    var seed = target[0],
      whereX = target[1],
      whereY = target[2];
    game.useTool(game.plants[seed].id, whereX, whereY);
  }
}

AutoPlay.seedCalendar = function(game,sector) {
  if (AutoPlay.wantAscend || AutoPlay.wantGardenSacrifice) return 'bakerWheat'; // plant cheap before ascend
  if (sector==0) AutoPlay.plantsMissing = false;
  var doPrint =
    (sector==0) || (sector!=3 && Game.Objects["Farm"].level==sector+6);
  if (!Game.Upgrades["Ichor syrup"].unlocked &&
      game.plants["ichorpuff"].unlocked) {
    AutoPlay.switchSoil(game,sector,'fertilizer');
    if (doPrint) AutoPlay.addActivity("Trying to get Ichor syrup.");
    AutoPlay.plantCookies = true;
    return "ichorpuff";
  }
  if (!Game.Upgrades["Green yeast digestives"].unlocked &&
      game.plants["greenRot"].unlocked) {
    AutoPlay.switchSoil(game,sector,'fertilizer');
    if (doPrint) AutoPlay.addActivity("Trying to get Green yeast digestives.");
    AutoPlay.plantCookies = true;
    return "greenRot";
  }
  if (!Game.Upgrades["Duketater cookies"].unlocked &&
      game.plants["duketater"].unlocked) {
    AutoPlay.switchSoil(game,sector,'fertilizer');
    if (doPrint) AutoPlay.addActivity("Trying to get Duketater cookies.");
    AutoPlay.plantCookies = true;
    return "duketater";
  }
  if (!Game.Upgrades["Elderwort biscuits"].unlocked &&
      game.plants["elderwort"].unlocked) {
    AutoPlay.switchSoil(game,sector,'fertilizer');
    if (doPrint) AutoPlay.addActivity("Trying to get Elderwort cookies.");
    AutoPlay.plantCookies = true;
    return "elderwort";
  }
  if (!Game.Upgrades["Bakeberry cookies"].unlocked &&
      game.plants["bakeberry"].unlocked) {
    AutoPlay.switchSoil(game,sector,'fertilizer');
    if (doPrint) AutoPlay.addActivity("Trying to get Bakeberry cookies.");
    AutoPlay.plantCookies = true;
    return "bakeberry";
  }
  if (!Game.Upgrades["Wheat slims"].unlocked &&
      game.plants["bakerWheat"].unlocked) {
    AutoPlay.switchSoil(game,sector,'fertilizer');
    if (doPrint) AutoPlay.addActivity("Trying to get Wheat slims.");
    AutoPlay.plantCookies = true;
    return "bakerWheat";
  }
  if (!Game.Upgrades["Fern tea"].unlocked &&
      game.plants["drowsyfern"].unlocked) {
    AutoPlay.switchSoil(game,sector,'fertilizer');
    if (doPrint) AutoPlay.addActivity("Trying to get Fern tea.");
    AutoPlay.plantCookies = true;
    return "drowsyfern";
  }
  AutoPlay.plantCookies = false;
  AutoPlay.switchSoil(game,sector,(AutoPlay.plantPending)?'fertilizer':'clay');
  if (AutoPlay.poppingWrinklers && game.plants['wrinklegill'].unlocked) return 'wrinklegill'; // faster wrinklers
  //use garden to get cps and sugarlumps
  if (game.plants['bakeberry'].unlocked &&
      AutoPlay.lumpRelatedAchievements.every(function(a) {
        return Game.AchievementsById[a].won; }))
    return 'bakeberry'; // 1% cps add. + harvest 30 mins with high ratio
  if (game.plants['whiskerbloom'].unlocked) return 'whiskerbloom'; // ca. 1.5% cps
  return 'bakerWheat'; // nothing else works
}

AutoPlay.cleaningGarden = function(game) {
  if (Game.Objects["Farm"].level<4) {
    if (AutoPlay.plantList[0]==0) return;
    for (var y = 2; y<5; y++) {
      AutoPlay.cleanSeed(game,2,y);
      AutoPlay.cleanSeed(game,4,y);
    }
  } else if (Game.Objects["Farm"].level==4) {
    for (var y = 2; y<5; y++) {
      AutoPlay.cleanSeed(game,2,y);
      AutoPlay.cleanSeed(game,3,y);
    }
  } else {
    for (var sector = 0; sector<4; sector++)
      AutoPlay.cleanSector(game,sector,
          AutoPlay.plantDependencies[AutoPlay.plantList[sector]][0]);
  }
}

AutoPlay.cleanSector = function(game,sector,plant0) {
  if (plant0=="dummy") return; // do not clean when we are at work
  var X = (sector%2)?0:3, Y = (sector>1)?0:3;
  if (plant0=="queenbeetLump") { AutoPlay.cleanSeed(game,X+1,Y+1); return; }
  if (plant0=="everdaisy") {
    for (var y = Y; y<Y+3; y++) AutoPlay.cleanSeed(game,X+1,y);
    return;
  }
  if (plant0=="all") {
    for (var x = X; x<X+3; x++) for (var y = Y; y<Y+3; y++)
      if((x!=X+1)||(y!=Y+1)) { // we do not really need that if, do we?
        var tile=game.getTile(x,y);
        if ((tile[0]>=1) && game.plantsById[tile[0]-1].unlocked) game.harvest(x,y);
      }
    return;
  }
  for (var y = Y; y<Y+3; y++) {
    AutoPlay.cleanSeed(game,X,y);
    AutoPlay.cleanSeed(game,X+2,y);
  }
}

AutoPlay.harvestable=
  ['bakeberry','chocoroot','whiteChocoroot','queenbeet','queenbeetLump','duketater'];

AutoPlay.cleanSeed = function(game,x,y) {
  if (!game.isTileUnlocked(x,y)) return;
  var tile = game.getTile(x,y);
  if (tile[0]==0) return;
  var plant = game.plantsById[tile[0]-1];
  if (!plant.unlocked && tile[1]<=plant.mature) return;
  if (AutoPlay.harvestable.indexOf(plant.key)>=0 && tile[1] && tile[1]<=plant.mature)
    return; // do not clean harvestable plants
  game.harvest(x,y);
}

// could harvest cookie-giving plants while slot 0 produces plants
// this is difficult since harvesting is not related to sectors
AutoPlay.harvesting = function(game) {
  AutoPlay.cleaningGarden(game);
  AutoPlay.plantPending=false;
  AutoPlay.harvestPlant=false;
  for (var x = 0; x<6; x++) for (var y = 0; y<6; y++)
    if (game.isTileUnlocked(x,y)) {
      var tile = game.getTile(x,y);
      if (tile[0]) {
        var plant=game.plantsById[tile[0]-1];
        if (!plant.unlocked) {
          AutoPlay.plantPending=true;
          AutoPlay.addActivity(plant.name + " is still growing, do not disturb!");
          if (tile[1]>=game.plantsById[tile[0]-1].mature)
            game.harvest(x,y); // is mature
        } else if (AutoPlay.harvestable.indexOf(plant.key)>=0) {
          AutoPlay.harvestPlant = true;
          AutoPlay.addActivity("Waiting to harvest " + plant.name + ".");
          if (game.plantsUnlockedN==game.plantsN && tile[1]>=game.plantsById[tile[0]-1].mature) { // is mature
            if (AutoPlay.cpsMult>300) game.harvest(x,y); // harvest when it pays
          }
        }
        if (AutoPlay.plantCookies && tile[1]>=game.plantsById[tile[0]-1].mature)
          if (!AutoPlay.plantsMissing || !game.isTileUnlocked(x-x%3,y-y%3))
            game.harvest(x,y); // is mature and can give cookies
        if (plant.ageTick+plant.ageTickR+tile[1] >= 100)
          AutoPlay.harvest(game,x,y); // would die in next round
      }
    }
}

AutoPlay.harvest = function(game,x,y) {
  game.harvest(x,y);
  var sector = ((x<3)?1:0)+((y<3)?2:0);
  if (AutoPlay.plantList[sector] == 1) AutoPlay.cleanSector(game,sector,"all");
}

AutoPlay.switchSoil = function(game,sector,which) {
  if (sector) return;
  if (game.nextSoil>AutoPlay.now) return;
  var me=game.soils[which];
  if (game.soil==me.id || game.parent.bought<me.req) return;
  FireEvent(l('gardenSoil-'+Game.Objects["Farm"].minigame.soils[which].id),'click');
}

// banks: stock market =============================
AutoPlay.handleStockMarket = function() {
  if (Date.now() < AutoPlay.resetTime + 3600000) return;
  if (Game.isMinigameReady(Game.Objects["Bank"]) && !AutoPlay.wantAscend) {
    var market = Game.Objects["Bank"].minigame;
    if (market.brokers < market.getMaxBrokers()) { // buy brokers
      if (100*market.getBrokerPrice() < Game.cookies) {
        l("bankBrokersBuy").click();
    } }
    if (market.officeLevel < market.offices.length-1) { // upgrade offices
      var me=market.offices[market.officeLevel];
      if (me.cost && Game.Objects['Cursor'].amount>=me.cost[0] && Game.Objects['Cursor'].level>=me.cost[1]) {
        l("bankOfficeUpgrade").click();
      }
    }
    if (!Game.AchievementsById[459].won && market.getGoodMaxStock(market.goodsById[market.goodsById.length-1])>1000) { // 500 of each
      for (var g in market.goods) {
        let good = market.goods[g];
        market.buyGood(good.id, 500-good.stock);
      }
    }
    if (!AutoPlay.goodsList) { // need to init goodsList
      AutoPlay.goodsList=[];
      for (var g in market.goods) {
        let good = market.goods[g];
        let price = market.getGoodPrice(good);
        let highMark = market.getRestingVal(good.id)+1;
        let lowMark = market.getRestingVal(good.id) / 3; // could also use 2
        let distance = highMark - lowMark;
        AutoPlay.goodsList[good.id] = { min:price, max:price, delta:(good.id>3)?5:2,
          sellHigh:highMark, sellLow:(highMark-distance/4),
          buyHigh:(lowMark+distance/2), buyMedium:(lowMark+distance/4),
          buyLow:lowMark
        }
      }
    }
    for (var g in market.goods) {
      let good = market.goods[g];
      let price = market.getGoodPrice(good);
      var maxStock = market.getGoodMaxStock(good);
      let goodItem = AutoPlay.goodsList[good.id];
      if (goodItem.min > price) goodItem.min = price;
      if (goodItem.max < price) goodItem.max = price;
      if (good.stock < maxStock) { // can buy more
        if (price - goodItem.delta > goodItem.min && price < goodItem.buyHigh) { // price is rising: buy
          if (goodItem.min < goodItem.buyLow) { // it is very cheap
            market.buyGood(good.id,10000); // buy all
            goodItem.max = price;
          } else if (goodItem.min < goodItem.buyMedium) { // it is reasonable
            market.buyGood(good.id, (maxStock*0.8-good.stock)<<0); // buy 80%
            goodItem.max = price;
          } else if (goodItem.min < goodItem.buyHigh) { // it is affordable
            market.buyGood(good.id, (maxStock*0.6-good.stock)<<0); // buy 60%
            goodItem.max = price;
          }
        }
      }
      if (good.stock > 0) { // have something to sell
        if (price + goodItem.delta < goodItem.max && price > goodItem.sellLow) { // price is dropping: sell
          if (goodItem.max > goodItem.sellHigh) {
            market.sellGood(good.id,10000); // it is very expensive, sell all
            goodItem.min = price;
          } else if (goodItem.max > goodItem.sellLow) { // it is reasonable
            market.sellGood(good.id, (good.stock-maxStock*0.3)<<0); // sell 70%
            goodItem.min = price;
          }
        }
      }
    }
  }
}

AutoPlay.nightAtStocks = function() {
  if (!Game.isMinigameReady(Game.Objects["Bank"])) return;
  AutoPlay.handleStockMarket();
  var market = Game.Objects["Bank"].minigame;
  for (var g in market.goods) {
    let good = market.goods[g];
    let price = market.getGoodPrice(good);
    let goodItem = AutoPlay.goodsList[good.id];
    if (price < goodItem.buyHigh) { // it is affordable
          market.buyGood(good.id,10000); // buy all
    }
    if (price > goodItem.sellLow) { // it is reasonable
      market.sellGood(good.id,10000); // sell all
    }
  }
}

//===================== Handle Wrinklers ==========================
AutoPlay.nextWrinkler = -1;
AutoPlay.poppingWrinklers = false;
AutoPlay.wrinklerTime = Date.now();

AutoPlay.handleWrinklers = function() {
  AutoPlay.poppingWrinklers = false;
  if (!Game.Upgrades["One mind"].bought) return;
  var doPop = (Game.season=="easter" || Game.season=="halloween");
  doPop = doPop && !AutoPlay.seasonFinished(Game.season);
  doPop = doPop ||
    (Game.Upgrades["Unholy bait"].bought && !Game.Achievements["Moistburster"].won);
  doPop = doPop ||
    (AutoPlay.endPhase() && !Game.Achievements["Last Chance to See"].won);
  if (doPop) {
    AutoPlay.poppingWrinklers = true;
    AutoPlay.wrinklerTime = AutoPlay.now;
    AutoPlay.addActivity("Popping wrinklers for droppings and/or achievements.");
    Game.wrinklers.forEach(function(w) { if (w.close==1) w.hp = 0; } );
  } else {
    AutoPlay.findNextWrinkler();
    AutoPlay.addActivity("Popping one wrinkler per two hours, last " +
      (((AutoPlay.now-AutoPlay.wrinklerTime)/1000/60)>>0) + " minutes ago.");
    if (AutoPlay.nextWrinkler != -1) {
      if (AutoPlay.now-AutoPlay.wrinklerTime >= 2*60*60*1000) {
        Game.wrinklers[AutoPlay.nextWrinkler].hp = 0;  // pop
        AutoPlay.wrinklerTime = AutoPlay.now;
      }
    }
  }
}

AutoPlay.findNextWrinkler = function() {
  let next = -1;
  let maxSucked = 0;
  for (var w of Game.wrinklers){
    if (w.close == 0 && w.id < Game.getWrinklersMax()) { // empty spot
      AutoPlay.nextWrinkler = -1;
      return;
    }
    else if (w.sucked > maxSucked){
      maxSucked = w.sucked;
      next = w.id;
    }
  }
  AutoPlay.nextWrinkler = next;
}

//===================== Handle Small Achievements ==========================
AutoPlay.backupHeight = 0;
if (Game.bakeryName.slice(0,AutoPlay.robotName.length)==AutoPlay.robotName) {
  Game.bakeryName = Game.bakeryName.slice(AutoPlay.robotName.length,Game.bakeryName.length);
  Game.bakeryNamePrompt(); Game.ConfirmPrompt();
}
AutoPlay.handleSmallAchievements = function() {
  if (!Game.Achievements["Tabloid addiction"].won)
    for (var i = 0; i < 50; i++) Game.tickerL.click();
  if (!Game.Achievements["Here you go"].won)
    Game.Achievements["Here you go"].click();
  if (!Game.Achievements["Tiny cookie"].won) Game.ClickTinyCookie();
  var bakeryName = Game.bakeryName;
  if (!Game.Achievements["God complex"].won) {
    Game.bakeryName = "Orteil"; Game.bakeryNamePrompt(); Game.ConfirmPrompt();
    Game.bakeryName = bakeryName; Game.bakeryNamePrompt(); Game.ConfirmPrompt();
  }
  if (!Game.Achievements["What's in a name"].won) {
    Game.bakeryName = AutoPlay.robotName+bakeryName;
    Game.bakeryNamePrompt(); Game.ConfirmPrompt();
  }
  if (Game.bakeryName.slice(0,AutoPlay.robotName.length)==AutoPlay.robotName) {
    Game.bakeryName = Game.bakeryName.slice(AutoPlay.robotName.length,Game.bakeryName.length);
    Game.bakeryNamePrompt(); Game.ConfirmPrompt();
  }
  if (AutoPlay.endPhase() && !Game.Achievements["Cheated cookies taste awful"].won)
    Game.Win("Cheated cookies taste awful"); // take this after all is done
  if (!Game.Achievements["Third-party"].won)
    Game.Win("Third-party"); // cookie bot is a third party itself
  if (!Game.Achievements["Olden days"].won) {
    what=Game.onMenu;
    Game.ShowMenu('log');
    menuDivs = l('menu').getElementsByTagName('div');
    madeleine = menuDivs[menuDivs.length-1];
    madeleine.scrollIntoView();
    madeleine.click();
    Game.tickerL.scrollIntoView();
    Game.ShowMenu(what);
    AutoPlay.info("found the forgotten madeleine at the very bottom of the \"Info\" menu");
  }
  if (!Game.Achievements["Cookie-dunker"].won && Game.milkProgress>1 && Game.milkHd>0.34) {
    if (AutoPlay.backupHeight) {
      Game.LeftBackground.canvas.height = AutoPlay.backupHeight;
      AutoPlay.backupHeight = 0;
    } else {
      AutoPlay.backupHeight = Game.LeftBackground.canvas.height;
      Game.LeftBackground.canvas.height = 400;
      setTimeout(AutoPlay.unDunk, 20*1000);
    }
  }
  if (!Game.Achievements["Stifling the press"].won) {
    savedNarrowSize = Game.tickerTooNarrow;
    Game.tickerTooNarrow = Game.windowW+10;
    Game.tickerL.click();
    Game.tickerTooNarrow = savedNarrowSize;
  }
}

AutoPlay.unDunk = function() {
  if (!Game.Achievements["Cookie-dunker"].won) {
    setTimeout(AutoPlay.unDunk, 20*1000);
    return;
  }
  Game.LeftBackground.canvas.height = AutoPlay.backupHeight;
  AutoPlay.backupHeight = 0;
}

//===================== Handle Ascend ==========================
AutoPlay.ascendLimit = 0.9*Math.floor(2*(1-Game.ascendMeterPercent));
AutoPlay.wantAscend = false;
AutoPlay.onAscend = false;

AutoPlay.lastPrestige=0;
AutoPlay.handleAscend = function() {
  if (Game.OnAscend) {
    AutoPlay.doReincarnate();
    AutoPlay.findNextAchievement();
    AutoPlay.setDeadline(0); // reactivate all activities
    AutoPlay.savingsStart = AutoPlay.now;
    AutoPlay.onAscend=false;
    return;
  }
  if (Game.ascensionMode == 0 && Game.prestige == 0)
    AutoPlay.canContinue();  // update achievement goals
  if (Game.AchievementsById[AutoPlay.nextAchievement].won) {
    var date = new Date();
    date.setTime(AutoPlay.now-Game.startDate);
    var legacyTime = Game.sayTime(date.getTime()/1000*Game.fps,-1);
    date.setTime(AutoPlay.now-Game.fullDate);
    var fullTime=Game.sayTime(date.getTime()/1000*Game.fps,-1);
    AutoPlay.doAscend("have achievement: " +
      Game.AchievementsById[AutoPlay.nextAchievement].ddesc.replace(/<q>.*?<\/q>/ig, '') +
      " after " + legacyTime + "(total: " + fullTime + ")",1);
    return;
  }
  if (Game.ascensionMode==1 && !AutoPlay.canContinue() && !Game.AchievementsById[AutoPlay.nextAchievement].won) {
    AutoPlay.doAscend("reborn mode did not work, retry.",0);
    return;
  }
  if (AutoPlay.preNightMode() && AutoPlay.Config.NightMode>0)
    return; //do not ascend right before the night
  if (AutoPlay.endPhase() && !Game.Achievements["Endless cycle"].won &&
      !Game.ascensionMode && Game.Upgrades["Sucralosia Inutilis"].bought) {
    // this costs approx. 1 minute per ascend
    AutoPlay.activities = "Going for 1000 ascends.";
    AutoPlay.hyperActive=true; // full activity
    AutoPlay.wantAscend = true; //avoid buying plants
    if ((Game.ascendMeterLevel>0) /*&&
         (AutoPlay.ascendLimit<Game.ascendMeterLevel*Game.ascendMeterPercent ||
            (Game.prestige+Game.ascendMeterLevel)%1000==777)*/) {
      AutoPlay.doAscend("go for 1000 ascends",0);
      return;
    }
  }
  if (Game.Upgrades["Permanent upgrade slot V"].bought &&
      !Game.Achievements["Reincarnation"].won && !Game.ascensionMode) {
    // this costs 3+2 minute per 2 ascend
    AutoPlay.activities = "Going for 100 ascends.";
    AutoPlay.hyperActive=true; // full activity
    AutoPlay.wantAscend = true; //avoid buying plants
    if (Game.ascendMeterLevel>0 &&
        AutoPlay.ascendLimit<Game.ascendMeterLevel*Game.ascendMeterPercent) {
      AutoPlay.doAscend("go for 100 ascends",0);
      return;
    }
  }
  var daysInRun = (AutoPlay.now-Game.startDate)/1000/60/60/24;
  if (AutoPlay.nextAchievement==463 && daysInRun > 10 && Game.Objects["Bank"].minigame.profit > daysInRun*300000) {
    AutoPlay.addActivity("Making money in stock market for achievements.");
  } else {
    var maxDaysInRun =
          40*(Game.prestige+1000000000)/(Game.prestige+Game.ascendMeterLevel+1);
    if (!AutoPlay.wantAscend && daysInRun>20 && maxDaysInRun<36)
      AutoPlay.addActivity("Still " + ((maxDaysInRun-daysInRun)<<0) +
          " days until next hard ascend.");
    if (daysInRun>maxDaysInRun && daysInRun>20 && maxDaysInRun<36) {
      for (var x = Game.cookiesEarned; x>10; x/=10);
      // do not ascend if the first digit of the total cookies is a 9
      if (x<9) {
        AutoPlay.doAscend("ascend after " + (daysInRun<<0) +
            " days just while waiting for next achievement.",1);
        return;
      }
    }
  }
  if (!Game.Upgrades["Lucky digit"].bought && Game.heavenlyChips>777 &&
      Game.ascendMeterLevel>0 && Game.ascendMeterLevel<20 && ((Game.prestige+Game.ascendMeterLevel)%10 == 7)) {
    AutoPlay.doAscend("ascend for heavenly upgrade lucky digit.",0);
    return;
  }
  if (!Game.Upgrades["Lucky number"].bought && Game.heavenlyChips>77777 &&
      Game.ascendMeterLevel>0 && Game.ascendMeterLevel<200 && ((Game.prestige+Game.ascendMeterLevel)%1000 == 777)) {
    AutoPlay.doAscend("ascend for heavenly upgrade lucky number.",0);
    return;
  }
  if (!Game.Upgrades["Lucky payout"].bought && Game.heavenlyChips>77777777) {
    var newPrestige = (Game.prestige+Game.ascendMeterLevel)%1000000;
    if (Game.prestige == Game.prestige+1) {
    // cannot get just one heavenly chip
      if (!AutoPlay.lastPrestige) AutoPlay.info("Impossible to get lucky payout - cheating it");
      AutoPlay.lastPrestige=Game.prestige%1000000;
    }
    AutoPlay.wantAscend = true; //avoid buying plants
    AutoPlay.hyperActive=true; //full activity
    AutoPlay.addActivity("Trying to get heavenly upgrade Lucky Payout.");
    if (Game.ascendMeterLevel>0 && Game.prestige%1000000 < 777777 &&
        (newPrestige+Game.ascendMeterLevel >= 777777)) {
      AutoPlay.doAscend("ascend for heavenly upgrade lucky payout.",0);
      return;
    }
    if (Game.prestige%1000000 >= 777777 && Game.ascendMeterLevel>500000) {
      AutoPlay.doAscend("ascend for heavenly upgrade lucky payout.",0);
      return;
    }
  }
  if (!Game.Upgrades["Season switcher"].bought &&
      AutoPlay.nextAchievement==108 && Game.ascendMeterLevel>1111) {
    AutoPlay.doAscend("getting season switcher.",1);
    return;
  }
}

AutoPlay.neverclickWarn=true;

AutoPlay.canContinue = function() {
  var needAchievement = false;
  if (!Game.Achievements["True Neverclick"].won && Game.cookieClicks==0) {
    AutoPlay.addActivity("Trying to get achievement: True Neverclick.");
    if (AutoPlay.neverclickWarn)
	  Game.Prompt('<h3>Attention</h3><div class="block">'+
      '<p>Cookie Bot is trying to get the true neverclick achievement.</p>'+
      '<p>Please do not click cookies now.</p>'+
      '</div>',['OK']);
    AutoPlay.neverclickWarn=false;
    needAchievement = true;
  }
  if (!Game.Achievements["Neverclick"].won && Game.cookieClicks<=15) {
    AutoPlay.addActivity("Trying to get achievement: Neverclick.");
    needAchievement = true;
  }
  if (!Game.Achievements["Hardcore"].won && Game.UpgradesOwned==0) {
    AutoPlay.addActivity("Trying to get achievement: Hardcore.");
    needAchievement = true;
  }
  if (needAchievement) return true;

  if (!Game.Achievements["Speed baking I"].won &&
            (AutoPlay.now-Game.startDate <= 1000*60*35)) {
    AutoPlay.addActivity("Trying to get achievement: Speed baking I.");
    AutoPlay.addActivity("Trying to get achievement: Speed baking II.");
    AutoPlay.addActivity("Trying to get achievement: Speed baking III.");
  } else if (!Game.Achievements["Speed baking II"].won &&
            (AutoPlay.now-Game.startDate <= 1000*60*25)) {
    AutoPlay.addActivity("Trying to get achievement: Speed baking II.");
    AutoPlay.addActivity("Trying to get achievement: Speed baking III.");
    for (var i = 1; i<3; i++) // threefold clicking speed
      setTimeout(function(){Game.ClickCookie(0, Game.computedMouseCps);}, 60*i);
  } else if (!Game.Achievements["Speed baking III"].won &&
            (AutoPlay.now-Game.startDate <= 1000*60*15)) {
    AutoPlay.addActivity("Trying to get achievement: Speed baking III.");
    for (var i = 1; i<5; i++) // fivefold clicking speed
      setTimeout(function(){Game.ClickCookie(0, Game.computedMouseCps);}, 30*i);
  } else return false;

  AutoPlay.hyperActive=true; // full activity for speed baking
  return true;
}

AutoPlay.doReincarnate = function() {
  AutoPlay.delay = 10;
  AutoPlay.buyHeavenlyUpgrades();
  if (!Game.Achievements["Neverclick"].won || !Game.Achievements["Hardcore"].won) {
    Game.PickAscensionMode(); Game.nextAscensionMode = 1; Game.ConfirmPrompt();
  }
  if (AutoPlay.endPhase() && AutoPlay.mustRebornAscend()) {
    Game.PickAscensionMode(); Game.nextAscensionMode=1; Game.ConfirmPrompt();
  }
  Game.Reincarnate(true);
  AutoPlay.resetTime=Date.now(); // save the current date for things that need to be delayed after reincarnating
  AutoPlay.neverclickWarn=true;
  AutoPlay.ascendLimit = 0.9*Math.floor(2*(1-Game.ascendMeterPercent));
}

AutoPlay.mustRebornAscend = function() {
  return !([78,93,94,95].every(function(a) { return Game.AchievementsById[a].won; }));
}

AutoPlay.doAscend = function(str,log) {
  if (Game.AscendTimer>0 || Game.ReincarnateTimer>0 || Game.OnAscend) return;
  if (AutoPlay.onAscend || Game.OnAscend) return;
  AutoPlay.wantAscend = AutoPlay.plantPending /*|| AutoPlay.harvestPlant*/;
  AutoPlay.addActivity("Preparing to ascend.");
  if (AutoPlay.wantAscend) return; // do not ascend when we wait for a plant
  if (Game.hasBuff("Sugar frenzy")) return; // do not ascend during sugar frenzy
  if (Game.hasBuff("Sugar blessing")) return; // do not ascend during sugar blessing
  AutoPlay.setDeadline(0); // full activity to monitor ascension
  if (Game.wrinklers.some(function(w) { return w.close; } )) {
    AutoPlay.assignSpirit(0,"scorn",1);
    AutoPlay.delay = 10;
  }
  Game.wrinklers.forEach(function(w) { if (w.close==1) w.hp=0; } ); // pop wrinklers
  if (Game.isMinigameReady(Game.Objects["Farm"]))
    Game.Objects["Farm"].minigame.harvestAll(); // harvest garden
  if (Game.isMinigameReady(Game.Objects["Bank"])) { // sell all goods
    var market = Game.Objects["Bank"].minigame;
    for (var g in market.goods) {
      market.sellGood(market.goods[g].id,10000);
    }
  }
  if (Game.Upgrades["Chocolate egg"].unlocked &&
      !Game.Upgrades["Chocolate egg"].bought) {
    if (Game.dragonLevel>=9) { // setting first aura to earth shatterer
      Game.specialTab="dragon"; Game.SetDragonAura(5,0);
      Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0);
    }
    Game.ObjectsById.forEach(function(e) { e.sell(e.amount); } );
    Game.Upgrades["Chocolate egg"].buy();
    AutoPlay.delay = 10;
  } else {
    AutoPlay.info(str); AutoPlay.loggingInfo=log?str:0;
    AutoPlay.logging(); AutoPlay.delay=15; Game.Ascend(true);
    AutoPlay.onAscend=true;
  }
}

//===================== Handle Achievements ==========================
AutoPlay.nextAchievement=AutoPlay.wantedAchievements[0];

AutoPlay.endPhase = function() {
  return AutoPlay.wantedAchievements.indexOf(AutoPlay.nextAchievement)<0;
}

AutoPlay.grinding = function() {
  let grindingStart=AutoPlay.wantedAchievements[AutoPlay.wantedAchievements.length-10];
  if (Game.AchievementsById[grindingStart].won) { // grind for the last 7 big achievements
    if (!AutoPlay.endPhase()) {
      AutoPlay.addActivity('Grinding cookies - do not sleep at night.');
      return true;
    }
  }
  return false;
}

AutoPlay.grindingCheat = function() {
  if (!AutoPlay.grinding()) return false;
  let cheatingStart=AutoPlay.wantedAchievements[AutoPlay.wantedAchievements.length-8];
  if (Game.AchievementsById[cheatingStart].won) { // cheat for the last 5 big achievements
    return true;
  }
  return false;
}

AutoPlay.mainActivity = "Doing nothing in particular.";
AutoPlay.activities = AutoPlay.mainActivity;

AutoPlay.setMainActivity = function(str) {
  AutoPlay.mainActivity = str;
  AutoPlay.info(str);
}

AutoPlay.findNextAchievement = function() {
  AutoPlay.wantAscend = false;
  AutoPlay.handleSmallAchievements();
  for (var i = 0; i<AutoPlay.wantedAchievements.length; i++) {
    if (!(Game.AchievementsById[AutoPlay.wantedAchievements[i]].won)) {
      AutoPlay.nextAchievement = AutoPlay.wantedAchievements[i];
      AutoPlay.setMainActivity("Trying to get achievement: " +
        Game.AchievementsById[AutoPlay.nextAchievement].ddesc.replace(/<q>.*?<\/q>/ig, ''));
      return;
    }
  }
  AutoPlay.checkAllAchievementsOK();
}

AutoPlay.checkAllAchievementsOK = function() { //We do not stop for one-year legacy
  for (var i in Game.Achievements) {
    var me = Game.Achievements[i];
    if (!me.won && me.pool!="dungeon" && me.id!=367 && !AutoPlay.lateAchievements.includes(me.id)) { // missing achievement
      AutoPlay.setMainActivity("Missing achievement #" + me.id +
        ": " + me.ddesc.replace(/<q>.*?<\/q>/ig, '') + ", try to get it now.");
      AutoPlay.nextAchievement = me.id;
      return false;
    }
  }
  for (var i of AutoPlay.lateAchievements) {
    var me = Game.AchievementsById[i];
    if (!me.won && me.pool!="dungeon" && me.id!=367) { // missing achievement
      AutoPlay.setMainActivity("Missing achievement #" + me.id +
        ": " + me.ddesc.replace(/<q>.*?<\/q>/ig, '') + ", try to get it now.");
      AutoPlay.nextAchievement = me.id;
      return false;
    }
  }
  for (var i in Game.Upgrades) {
    var me = Game.Upgrades[i];
    if (me.pool=='prestige' && !me.bought) { // we have not all prestige upgrades yet
      AutoPlay.nextAchievement = 99; // follow the white rabbit (from dungeons)
      AutoPlay.setMainActivity("Prestige upgrade " + me.name +
        " is missing, waiting to buy it.");
//      Game.RemoveAchiev(Game.AchievementsById[AutoPlay.nextAchievement].name);
      return false;
    }
  }
  if (!Game.Achievements["So much to do so much to see"].won) { //wait until one-year legacy (367)
    var me = Game.Achievements["So much to do so much to see"];
    AutoPlay.setMainActivity("Missing achievement #" + me.id +
      ": " + me.ddesc.replace(/<q>.*?<\/q>/ig, '') + ", try to get it now.");
    AutoPlay.nextAchievement = me.id;
    return false;
  }
  // finished with playing: idle further
  AutoPlay.finished = true;
  AutoPlay.setMainActivity("My job is done here, have a nice day. I am still idling along.");
  AutoPlay.nextAchievement = 99; // follow the white rabbit (from dungeons)
  return false;
}

AutoPlay.leaveGame = function() {
  clearInterval(AutoPlay.autoPlayer); //stop autoplay:
  AutoPlay.info("My job is done here, have a nice day.");
  if(Game.bakeryName.slice(0,AutoPlay.robotName.length)==AutoPlay.robotName) {
    Game.bakeryName = Game.bakeryName.slice(AutoPlay.robotName.length);
    Game.bakeryNamePrompt(); Game.ConfirmPrompt();
  }
  return true;
}

//===================== Handle Heavenly Upgrades ==========================
AutoPlay.buyHeavenlyUpgrades = function() {
  AutoPlay.prioUpgrades.forEach(function(id) {
    var e = Game.UpgradesById[id];
    if (e.canBePurchased && !e.bought && e.buy(true)) {
      AutoPlay.info("buying "+e.name);
    }
  });
  if (AutoPlay.lastPrestige!=0 && !Game.Upgrades["Lucky payout"].bought) {
    AutoPlay.info("Partly cheating lucky payout - cannot be bought regularly");
    if (AutoPlay.lastPrestige<777777 && Game.prestige%1000000 > 777777) {
      Game.Upgrades["Lucky digit"].unlocked=1;
      Game.Upgrades["Lucky number"].unlocked=1;
      Game.Upgrades["Lucky payout"].unlocked=1;
	  AutoPlay.lastPrestige=0;
    }
  }
    for (var me in Game.UpgradesById) {
        var e = Game.UpgradesById[me];
        if (e.canBePurchased && !e.bought && e.buy(true)) {
            AutoPlay.info("buying " + e.name);
        }
    };
  AutoPlay.assignPermanentSlot(1,AutoPlay.kittens);
  AutoPlay.assignPermanentSlot(2,AutoPlay.maxBuildings);
  if (!Game.Achievements["Reincarnation"].won) { // for many ascends
    AutoPlay.assignPermanentSlot(0,AutoPlay.cursors);
    AutoPlay.assignPermanentSlot(3,[52]); // lucky day
    AutoPlay.assignPermanentSlot(4,[53]); // serendipity
  } else { //collect rare things
    AutoPlay.assignPermanentSlot(0,AutoPlay.butterBiscuits);
    AutoPlay.assignPermanentSlot(3,[226]); // omelette
    AutoPlay.assignPermanentSlot(4,AutoPlay.expensive);
  }
}

AutoPlay.assignPermanentSlot = function(slot,options) {
  if (!Game.UpgradesById[264+slot].bought) return;
  Game.AssignPermanentSlot(slot);
  for (var i = options.length-1; i>=0; i--) {
    if (Game.UpgradesById[options[i]].bought) {
      Game.PutUpgradeInPermanentSlot(options[i],slot); break;
    }
  }
  Game.ConfirmPrompt();
}

//===================== Handle Dragon ==========================
AutoPlay.handleDragon = function() {
  var wantedAura=0;
  if (Game.Upgrades["A crumbly egg"].unlocked) {
    if (Game.dragonLevel<Game.dragonLevels.length-1 &&
        Game.dragonLevels[Game.dragonLevel].cost()) {
      let obj = null;
      if (Game.dragonLevel >=5 && Game.dragonLevel < Game.dragonLevels.length-3)
        obj = Game.ObjectsById[Game.dragonLevel - 5];
      else if (Game.dragonLevel >= Game.dragonLevels.length-3)
        obj = 'buy150';
      Game.specialTab = "dragon";
      Game.UpgradeDragon();
      Game.ToggleSpecialMenu(0);
      if (obj == null)
        return;
      if (obj == 'buy150') {  // after sacrificing 50 or 200 of all
        // handle garden before buying (low cps)
        if (Game.Objects['Farm'].amount == 0)
          Game.Objects['Farm'].buy(1);
        AutoPlay.handleMinigames()
        for (var o of Game.ObjectsById)
          o.buy(150 - o.amount);
      }
      else  // after sacrificing 100, get 50 back immediately
        obj.buy(50 - obj.amount);
    }
    AutoPlay.petDragon();
  }
  if (Game.dragonLevel>=5) wantedAura=1; // kitten (breath of milk)
  if (Game.dragonLevel>=19) wantedAura=15; // radiant appetite
  if (Game.dragonLevel>=21) wantedAura=17; // fractal (dragons curve)
  if ((Game.dragonLevel>=21) && (Game.lumps > 99) &&
      !AutoPlay.lumpHarvestAchievements.includes(AutoPlay.nextAchievement)) // keep dragons curve for lump harvest achievements
    wantedAura=15; // radiant appetite
  if (Game.dragonAura!=wantedAura) {
    Game.specialTab = "dragon"; Game.SetDragonAura(wantedAura,0);
    Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0);
  }
  if ((Game.dragonAura2!=1) &&
      (Game.dragonLevel>=Game.dragonLevels.length-1)) {
  // set second aura to kitten (breath of milk)
    Game.specialTab = "dragon"; Game.SetDragonAura(1,1);
    Game.ConfirmPrompt(); Game.ToggleSpecialMenu(0);
} }

AutoPlay.checkDragon = function(building) {
  // determine if buying the building is efficient based on sacrifices to krumblor
  if(!Game.Achievements['Here be dragon'].won)
    return true;  // don't limit when first fully training

  building = Game.Objects[building]

  // haven't sacrificed first 100, buy no more than 100
  if(Game.dragonLevel - 5 <= building.id)
    return building.amount < 100;

  // waiting to sacrifice 50 of all
  if(Game.dragonLevel < Game.dragonLevels.length-2)
    return building.amount < 50;

  // waiting to sacrifice 200 of all
  if(Game.dragonLevel < Game.dragonLevels.length-1)
    return building.amount < 200;

  return true;
}

AutoPlay.petDragon = function() {
  if (Game.dragonLevel>=8) { // can pet the dragon
    var drops=['Dragon scale','Dragon claw','Dragon fang','Dragon teddy bear'];
    for (var drop of drops) {
      if (!Game.Has(drop) && !Game.HasUnlocked(drop)) { // still something we can get
        AutoPlay.addActivity("Petting the dragon.");
        Game.specialTab = "dragon";
        Game.ToggleSpecialMenu(1);
        Game.ClickSpecialPic();
        Game.ToggleSpecialMenu(0);
        return;
      }
    }
  }
}

//===================== Menu ==========================
if(!AutoPlay.Backup) AutoPlay.Backup = {};
AutoPlay.Config = {};
AutoPlay.ConfigData = {};
AutoPlay.Disp = {};

AutoPlay.ConfigPrefix = 'autoplayConfig';

AutoPlay.SaveConfig = function(config) {
  try {
    window.localStorage.setItem(AutoPlay.ConfigPrefix, JSON.stringify(config));
  } catch (e) {}
}

AutoPlay.LoadConfig = function() {
  try {
    if (window.localStorage.getItem(AutoPlay.ConfigPrefix) != null) {
      AutoPlay.Config = JSON.parse(window.localStorage.getItem(AutoPlay.ConfigPrefix));
     // Check values
      var mod = false;
      for (var i in AutoPlay.ConfigDefault) {
        if (typeof AutoPlay.Config[i]==='undefined' || AutoPlay.Config[i]<0 ||
            AutoPlay.Config[i]>=AutoPlay.ConfigData[i].label.length) {
          mod = true;
          AutoPlay.Config[i] = AutoPlay.ConfigDefault[i];
        }
      }
      if (mod) AutoPlay.SaveConfig(AutoPlay.Config);
    } else { // Default values
      AutoPlay.RestoreDefault();
    }
  } catch (e) {}
}

AutoPlay.RestoreDefault = function() {
  AutoPlay.Config = {};
  AutoPlay.SaveConfig(AutoPlay.ConfigDefault);
  AutoPlay.LoadConfig();
  Game.UpdateMenu();
}

AutoPlay.ToggleConfig = function(config) {
  AutoPlay.ToggleConfigUp(config);
  l(AutoPlay.ConfigPrefix + config).className =
    AutoPlay.Config[config]?'option':'option off';
}

AutoPlay.ToggleConfigUp = function(config) {
  AutoPlay.Config[config]++;
  if (AutoPlay.Config[config]==AutoPlay.ConfigData[config].label.length)
    AutoPlay.Config[config] = 0;
  l(AutoPlay.ConfigPrefix + config).innerHTML = AutoPlay.Disp.GetConfigDisplay(config);
  AutoPlay.SaveConfig(AutoPlay.Config);
}

AutoPlay.ConfigData.BotMode =
  {label: ['IDLE', 'AUTO', 'MANUAL'], desc: 'Cookiebot global mode (work in progress)'};
AutoPlay.ConfigData.NightMode =
  {label: ['OFF', 'AUTO', 'ON'], desc: 'Handling of night mode'};
AutoPlay.ConfigData.ClickMode =
  {label: ['OFF', 'AUTO', 'LIGHT SPEED', 'RIDICULOUS SPEED', 'LUDICROUS SPEED'],
   desc: 'Clicking speed'};
AutoPlay.ConfigData.GoldenClickMode =
  {label: ['OFF', 'AUTO', 'ALL'], desc: 'Golden Cookie clicking mode'};
AutoPlay.ConfigData.SavingStrategy =
  {label: ['NONE', 'AUTO', 'LUCKY', 'LUCKY FRENZY'],
   desc: 'Saving strategy'};
AutoPlay.ConfigData.CheatLumps =
  {label: ['OFF', 'AUTO', 'LITTLE', 'MEDIUM', 'MUCH'], desc: 'Cheating of sugar lumps'};
AutoPlay.ConfigData.CheatGolden =
  {label: ['OFF', 'AUTO', 'LITTLE', 'MEDIUM', 'MUCH'], desc: 'Cheating of golden cookies'};
AutoPlay.ConfigData.CleanLog = {label: ['Clean Log'], desc: 'Cleaning the log'};
AutoPlay.ConfigData.ShowLog = {label: ['Show Log'], desc: 'Showing the log'};

AutoPlay.ConfigDefault = {BotMode: 1, NightMode: 1, ClickMode: 1, GoldenClickMode: 1,
                          SavingStrategy: 1, CheatLumps: 1, CheatGolden: 1,
                          CleanLog: 0, ShowLog: 0};

AutoPlay.LoadConfig();

AutoPlay.Disp.GetConfigDisplay = function(config) {
  return AutoPlay.ConfigData[config].label[AutoPlay.Config[config]];
}

AutoPlay.Disp.AddMenuPref = function() {
  var header = function(text) {
    var div = document.createElement('div');
    div.className = 'listing';
    div.style.padding = '5px 16px';
    div.style.opacity = '0.7';
    div.style.fontSize = '17px';
    div.style.fontFamily = '\"Kavoon\", Georgia, serif';
    div.textContent = text;
    return div;
  }
  var frag = document.createDocumentFragment();
  var div = document.createElement('div');
  div.className = 'title ' + AutoPlay.Disp.colorTextPre + AutoPlay.Disp.colorBlue;
  div.textContent = 'Cookiebot Options';
  frag.appendChild(div);
  var listing = function(config,clickFunc) {
    var div = document.createElement('div');
    div.className = 'listing';
    var a = document.createElement('a');
    a.className = 'option';
    if (AutoPlay.Config[config] == 0) a.className = 'option off';
    a.id = AutoPlay.ConfigPrefix + config;
    a.onclick = function() { AutoPlay.ToggleConfig(config); };
    if (clickFunc) a.onclick = clickFunc;
    a.textContent = AutoPlay.Disp.GetConfigDisplay(config);
    div.appendChild(a);
    var label = document.createElement('label');
    label.textContent = AutoPlay.ConfigData[config].desc;
    div.appendChild(label);
    return div;
  }
  frag.appendChild(listing('BotMode',AutoPlay.setBotMode));
  frag.appendChild(listing('NightMode',null));
  frag.appendChild(listing('ClickMode',null));
  frag.appendChild(listing('GoldenClickMode',null));
  frag.appendChild(listing('SavingStrategy',null));
  frag.appendChild(header('Cheating'));
  frag.appendChild(listing('CheatLumps',null));
  frag.appendChild(listing('CheatGolden',null));
  frag.appendChild(header('Logging'));
  frag.appendChild(listing('CleanLog',AutoPlay.cleanLog));
  frag.appendChild(listing('ShowLog',AutoPlay.showLog));
  l('menu').childNodes[2].insertBefore(frag, l('menu').childNodes[2].
      childNodes[l('menu').childNodes[2].childNodes.length - 1]);
}

if (!AutoPlay.Backup.UpdateMenu) AutoPlay.Backup.UpdateMenu = Game.UpdateMenu;

AutoPlay.setBotMode = function() {
  AutoPlay.ToggleConfig('BotMode');
  AutoPlay.info("The bot has changed mode to "+AutoPlay.ConfigData.BotMode.label[AutoPlay.Config.BotMode]);
//  AutoPlay.info("The bot has changed mode to "+AutoPlay.ConfigData.BotMode[]);
}

Game.UpdateMenu = function() {
  AutoPlay.Backup.UpdateMenu();
  if (Game.onMenu == 'prefs') AutoPlay.Disp.AddMenuPref();
}

//===================== Auxiliary ==========================

AutoPlay.info = function(s) {
  console.log("### "+s);
  Game.Notify("CookieBot",s,1,100);
}

AutoPlay.status = function(print=true) { // just for testing purposes
  var ach=0;
  var sach=0;
  var up=0;
  var lum=0;
  let nonUp=[71,72,73,87,227];
  for (var a in Game.Achievements) {
    var me = Game.Achievements[a];
    if (!me.won && me.pool!="dungeon") { // missing achievement
      if (print) AutoPlay.info("Missing achievement #" + me.id +
        ": " + me.ddesc.replace(/<q>.*?<\/q>/ig, ''));
      if (me.pool=="shadow") sach++;
      ach++;
    }
  }
  for (var i in Game.Upgrades) {
    var me = Game.Upgrades[i];
    if (!me.bought && me.pool!="debug" && me.pool!="toggle") {
      if (Game.resets && nonUp.includes(me.id)) continue;
      if (print) AutoPlay.info("Upgrade " + me.name + " is missing.");
      up++;
    }
  }
  for (var o in Game.Objects) {
    var me = Game.Objects[o];
    var maxl = 10;
    var myl = 0;
    if (me.id==0) maxl=12; // cursors need level 12
    for (var l=me.level+1; l<=maxl; l++) myl+=l;
    if (print && myl) AutoPlay.info(""+myl+" sugar lumps missing for " + me.name + ".");
	lum+=myl;
  }
  lum-=Game.lumps;
  if (lum<0) lum=0;
  AutoPlay.addActivity("Missing "+(ach)+" achievements ("+sach+" shadow), "+up+" upgrades, and "+lum+" sugar lumps.");
}

AutoPlay.setDeadline = function(d) {
  if (AutoPlay.deadline>d) AutoPlay.deadline=d;
}

AutoPlay.logging = function() {
  if(!AutoPlay.loggingInfo) return;
  try {
    var before = window.localStorage.getItem("autoplayLog");
    var toAdd = "#logging autoplay V" + AutoPlay.version + " with " +
                AutoPlay.loggingInfo + "\n" + Game.WriteSave(1) + "\n";
    AutoPlay.loggingInfo = 0;
    window.localStorage.setItem("autoplayLog",before+toAdd);
  } catch (e) {}
}

AutoPlay.cleanLog = function() {
  try {
    window.localStorage.setItem("autoplayLog","");
  } catch (e) {}
}

AutoPlay.showLog = function() {
  var theLog="";
  try {
    theLog=window.localStorage.getItem("autoplayLog");
  } catch (e) { theLog=""; }
  var str=
    Game.Prompt('<h3>Cookie Bot Log</h3><div class="block">'+
      'This is the log of the bot with saves at important stages.<br>'+
      'Copy it and use it as you like.</div>'+
      '<div class="block"><textarea id="textareaPrompt" '+
      'style="width:100%;height:128px;" readonly>'+
      theLog+'</textarea></div>',
      ['All done!']);
}

AutoPlay.handleNotes = function() {
  for (var i in Game.Notes)
    if (Game.Notes[i].quick==0) {
      Game.Notes[i].life=2000*Game.fps;
      Game.Notes[i].quick=1;
    }
}

function range(start, end) {
  var foo = [];
  for (var i = start; i<=end; i++) { foo.push(i); }
  return foo;
}

AutoPlay.whatTheBotIsDoing = function() {
  return '<div style="padding:8px;width:400px;font-size:11px;text-align:center;">'+
    '<span style="color:#6f6;font-size:18px"> What is the bot doing?</span>'+
    '<div class="line"></div>'+
    AutoPlay.activities+
    '</div>';
}

AutoPlay.addActivity = function(str) {
  if (!AutoPlay.activities.includes(str)) {
    AutoPlay.activities+= '<div class="line"></div>'+str;
    return true;
  } else return false;
}

//===================== Init & Start ==========================

AutoPlay.launch = function() {
  if (!Game.ready) {
    setTimeout(AutoPlay.launch, 1000);
	return;
  }
  if (AutoPlay.autoPlayer) {
    AutoPlay.info("replacing old version of autoplay");
    clearInterval(AutoPlay.autoPlayer);
  }
  AutoPlay.autoPlayer = setInterval(AutoPlay.run, 300); // 100 is too quick
  AutoPlay.findNextAchievement();
  l('versionNumber').innerHTML=
    'v. '+Game.version+" (with autoplay v."+AutoPlay.version+")";
  l('versionNumber').innerHTML='v. '+Game.version+' <span '+
    Game.getDynamicTooltip('AutoPlay.whatTheBotIsDoing','this')+
    ">(with autoplay v."+AutoPlay.version+")"+'</span>';
  if (Game.version!=AutoPlay.gameVersion)
    AutoPlay.info("Warning: cookieBot is last tested with "+
      "cookie clicker version " + AutoPlay.gameVersion);
}

AutoPlay.launch();
