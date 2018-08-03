# Cookie Bot Frequently Asked Questions
##General Questions
### What is the bot aiming at right now?
You can see the current steps the bot is working on by hovering over the version information of the bot (bottom left of game screen). 
Please note that bot has a main goal as displayed in the first line, and several activities it is pursuing just now.

## Buying Algorithm
### What is the next building to be bought?
The next building is the cheapest building that gives at least 50% of the max possible gain in cpc per cookie invested.
Buildings that are 10 or less from the next interesting limit (50, 100, 150, ...) are bought if possible.

### What is the next upgrade to be bought?
Upgrades are bought whenever possible. There is no saving strategy for the next upgrade implemented.

### What is the next object to be bought?
The buying strategy is provided by the object selection algorithm, based on a simple cost-gain analysis. It is assumed that there are enough cookies to buy what is wanted.

## Game Strategy
### What is the playthrough strategy?
The following steps are taken, and if you start somewhere in the middle, the procedure is adapted accordingly.
* Step 1: keep quiet until hardcore and neverclick, then buy everything until all grandma achievements are there, maybe get the first permanent slot with maximum cursors: this takes about 6 days.
* Step 2: get 100 antimatter condensers, develop the dragon with kitten aura, get the season switcher: this takes about 3 days
* Step 3: complete christmas, easter, valentine, and halloween: about 2 days
* Step 4: with five permanent slots: get 1000 ascends; until then continue with step 5: about 2 days
* Step 5: get all "bake xx cookies" achievements & all building achievements: see below
    - Step 5a: get all "bake xx cookies" achievements until 1 tredecillion: about 6 weeks
    - Step 5b: get "bake 100 tredecillion cookies" achievement: about one month (???)
    - Step 5c: get "bake 1 quattuordecillion cookies" achievement: about half a year
    - Step 5d: get "bake 100 quattuordecillion cookies" achievement: about one month (???)
    - Step 5e: get "bake 1 quindecillion cookies" achievement: about one month (???)
* Step 6: get all shadow achievements and all the remaining achievements: about one month (???)
* Step 7: get all the level 10 buildings: about one year
* Step 8: get the golden sugar lump: more than three more years

With the current design of the game, the step five takes at least five years (grinding). The last two steps (sugar lumps) do also take together five years on average, and two years minimum. Of course, both can be done in parallel.
This long time is considered not good in terms of game dynamics, and therefore the playthrough will cheat golden cookies in the grinding phase and sugar lumps in the end phase (i.e. when only sugar lump related achievements are missing) as follows. 
After ten days of run, the bot will gradually increase the chance of getting golden cookies until golden cookies are coming all the time.
In addition, night mode is switched off in the grinding phase. This way, each sub-step of step 5 takes around one month.
For the sugar lumps, the bot will divide the ripening time for sugar lumps by 625. This way the ripening time is a few minutes instead of hours. With this cheat, the last two steps will take less than one month.

### What is the seasons strategy?
After seasons are enabled, the bot will go through each of them and complete them. It always follows the order Christmas, Easter, Valentine, Halloween. After Halloween, the bot will stay at Christmas in order to get reindeers.

### What is the wrinkler strategy?
Wrinklers are normally left alone unless we need them to get easter eggs or other droppings. In the endphase, wrinklers are dropped in order to get the shiny wrinkler. During grinding, oned wrinkler is popped per two hours to get more cookies for buying objects.

### What is the chocolate egg handling?
The chocolate egg is kept as long as possible. It will be bought right before the next ascension. Before that, all buildings are sold with maximum profit.

### What is the Grandmapocalypse strategy?
In the first possible round, the bot will complete the Grandmapocalypse in order to get all the achievements.
After all the Grandmapocalypse achievements are in place, the bot will not buy the Communal brainsweep.

In order to maximize cps, the bot will save the Arcane sugar (which is after the Communal brainsweep) into the fifth permanent slot.

## Minigame Strategy
### What is the strategy for the garden?
Overall: at night, the garden is frozen.
* Step 1: Enable the garden minigame.
* Step 2: Wait for MeddleWeed.
* Step 3: Get all the other plants by strategic planting.
* Step 4: Get all the garden cookies.
* Step 5: Sacrifice the garden for sugar lumps.
* Step 6: Continue with Step 2.

Step 3 may result in an empty garden as there is not enough money for the plants. This gets better when the achievements take longer time to get (more than 5 days).

Currently, still sugar lumps are the most precious resource, so the garden is used to get more of them. Unfortunately, it is not possible to plant juicy queenbeets, which would solve the sugar lump problem pretty much. With frequent sacrifices, the garden produces around one extra sugar lump per day. This reduces (halves) the time for the level 10 achievements, but does not help for the golden sugar lump.

### What is the strategy for the Grimoires?
Grimoires will only cast "Hand of Fate" when there is already an active golden cookie. This is done in order to maybe get a sugar lump when the spell backfires. It also helps to maybe get the four-leaf cookie.

### What is the strategy for the Pantheon?
Typically, we use the gods of mother, decadence and labor at daytime.
At night, mother is replaced with asceticism. When the current sugar lump is almost ripe, the god of order is used in slot 1 in order to make the ripening faster.
