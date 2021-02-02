# Cookie Bot Frequently Asked Questions

## General Questions

### The bot is not doing anything - what is wrong?
When you start the bot on a new game of cookie clicker, it will wait for the true neverclick and the hardcore achievements and therefore not click or buy upgrades. Just be patient and wait.
You can see the status of the bot when hovering over the version information of the bot (bottom left of game screen).

### What is the bot aiming at right now?
You can see the current steps the bot is working on by hovering over the version information of the bot (bottom left of game screen). 
Please note that the bot has a main goal as displayed in the first line, and several sub-goals it is pursuing at any given time.

The main goal is basically the goal where as soon as it's achieved, assuming it's not waiting for something else (usually a plant to finish maturing so it can harvest it for its seed), it will ascend and begin a new cycle.

Subgoals are smaller ones, usually not related to a major achievement, which is stuff like trying to buy new upgrades/harvest plants/buy buildings/etc.

For example, my current major achievement is for 1 quindecillion cookies to be baked in one ascension. As soon as this is reached, unless the bot is waiting to harvest a plant, it will ascend. But it's ALSO saving 636.677 tredecillion cookies (for bank) at a minimum, waiting to buy Putri Salju (which it never will since I'll hit the major achievement first), trying to grow Golden Clovers and Chimerose on the farm (and if they appear before the major achievement is hit, it will let them grow, harvest them, then ascend), or failing all of those, will hard ascend in 34 days (but it will only take about another day at most to achieve it, really).

Lastly, if the achievement isn't exactly major enough (such as some of the earliest milestones), it will tend to just collect those on the way through to some larger achievement. Ascending, for example, is pointless without at least one prestige level, so it will never select some mundane achievement like "bake 1000 cookies" to ascend for.

Basically, after Hardcore and Neverclick are attained, the bot begins knocking out all the grandma-related achievements. The grandmapocalypse is, naturally, part of that. Once that's done, it will begin doing stuff like getting antimatter condensers, develop the dragon, and get the season switcher. From there, it begins completing all season achievements.

### The bot is stuck - what do I do?
First, you might want to create an issue about the problem, in particular if the bot has run itself into the problem.
If you have mixed up the bot strategy because you bought something which the bot would not have bought, you should ascend and let the bot run without interference.

### How do I ask a question about the bot?
First, you want to carefully check this FAQ and the [README](https://github.com/prinzstani/CookieBot/blob/master/README.md). If you request is related to a bug or suggestion, please [**create it as an issue**](https://github.com/prinzstani/CookieBot/issues) for easier tracking. This allows to follow the status of the issue. If none of this is applicable, send your question to theprinzstani@gmail.com.

### The bot does not support the current version of cookie clicker - what can I do?
Relax. The bot will still work, it only does not handle all of the new features. Make sure that there is [an issue](https://github.com/prinzstani/CookieBot/issues) about the new version. Enjoy the bot as usual.

### How can I contribute?
The bot needs regular maintenance, in particular when there is a new version of cookie clicker. If you are interested in contributing, please contact theprinzstani@gmail.com.

## Saving Strategy
The bot will maintain a bank of cookies to try and maximize profits from
Lucky golden cookies without delaying purchasing too much.  Within the options,
the strategy can be set to no savings, luck, or lucky-frenzy.  These manual
settings will just wait until the amount of cookies are saved before purchasing
buildings, upgrades, or plants.

### Auto
The automatic saving strategy dynamically adjusts the amount saved based on the
current bank and upgrades purchased.  No cookies will be saved for the first
30 minutes of any run.  Once lucky day and serendipity are purchase, the bot 
will start to save to the max for lucky cookies.  When get lucky is purchased,
it then starts to save to the max lucky during frenzy.

Any time the bank is less than 80% of the current target, the bot will rescale
the target.  This occurs if something is bought manually to decrease the bank
or if a large income multiplier is purchased.  After rescaling, the bot will
slowly increase the savings.  The current saving target and percentage towards
goal are displayed when hovering over the version in the lower left.

## Buying Algorithm

### Cookie Monster Integration
If the [Cookie Monster](https://github.com/Aktanusa/CookieMonster/)
plugin is active, the bot will use the payback
period calculated by CM to determine which item to purchase next, with a few
modifications:
- The estimated bonus for mouse upgrades are based on the current clicks per
second and CPS.
- The estimated bonus for golden cookie upgrades are estimated as 50% of the 
current CPS.
- Upgrades that affect costs of upgrades or other aspects of the game are
given reasonable estimates as bonuses (but mostly guesses).
Other upgrades (season switcher, etc) are handled separately from this
calculation.

If CM isn't running, the bot will fall back on the algorithm described below.

### What is the next building to be bought?
The next building is the cheapest building that gives at least 50% of the max possible gain in cpc per cookie invested.
Buildings that are 10 or less from the next interesting quantity (50, 100, 150, ...) are bought if possible.

### What is the next upgrade to be bought?
Upgrades are bought whenever possible. There is no saving strategy for the next upgrade implemented.
The chocolate egg is kept as long as possible. It will be bought right before the next ascension. Before that, all buildings are sold with maximum profit.
Moreover, the Grandmapocalypse is stopped before the Communal brainsweep (see below). This way, in normal play, the bot is missing four upgrades: Chocolate egg, Communal brainsweep, Elder Pact, and Sacrificial rolling pins.

### What is the next object to be bought?
The buying strategy is provided by the object selection algorithm, based on a simple cost-gain analysis. Then the bot waits until there are enough cookies to buy what is selected.

## Game Strategy

### What is the playthrough strategy?
The following steps are taken, and if you start somewhere in the middle, the procedure is adapted accordingly.
1. Keep quiet until hardcore and neverclick, then buy everything until all grandma achievements are there, maybe get the first permanent slot with maximum cursors: this takes about 6 days.
2. Get 100 antimatter condensers, develop the dragon with kitten aura, get the season switcher: this takes about 3 days
3. Complete christmas, easter, valentine, and halloween: about 2 days
4. With five permanent slots: get 1000 ascends; until then continue with step 5: about 2 days
5. Get all "bake xx cookies" achievements & all building achievements: about 5 months
6. Get all shadow achievements and all the remaining achievements: about one month
7. Get all the level 10 buildings: about six months
8. Get the golden sugar lump: more than three more years

With the current design of the game, step five takes at least five years (grinding) when each step is done without intermediate ascend. The last two steps together take five years on average, and two years minimum (sugar lumps). Of course, both can be done in parallel.
The grinding time is heavily reduced by switching off night mode and with intermediate ascends (see below). The golden sugar lumps cannot be quicker, and therefore the playthrough will cheat sugar lumps in the end phase (i.e. when only sugar lump related achievements are missing) as follows. 
The bot will divide the ripening time for sugar lumps by 625. This way the ripening time is a few minutes instead of hours. With this cheat, the last two steps will take less than one month.

### What is the ascend strategy?
Normally, the bot ascends when the next major goal is achieved. During grinding, it will ascend after 5-25 days, but latest after 40 days. This is done in order to increase the cps with heavenly cookies.

### What is the seasons strategy?
After seasons are enabled, the bot will go through each and complete them in the following order: Christmas, Easter, Valentine, Halloween. After Halloween, the bot will stay on Christmas in order to get reindeers.

### What is the wrinkler strategy?
Wrinklers are normally left alone unless we need them to get easter eggs or other drop. In the endphase, wrinklers are popped in order to get the shiny wrinkler. During grinding, one wrinkler is popped per two hours to get more cookies for buying objects.

### What is the strategy for lucky payout upgrade?
In order to exactly match the 777777 for the lucky payout, the bot only goes to half the distance. 
So if starting from 333333, it will only go to 555555 and then ascend. From 555555, it will ascend at 666666. 
This makes it uncritical to go too high, as there is typically plenty of space left. 
This approach ensures that the bot can get single prestige levels when it gets close to 777777.
However, when the prestige level is too high, the precision of prestige makes it impossible to achieve single steps.
In this case, the bot goes as close to 777777 as possible and the cheats the upgrade.

### What is the Grandmapocalypse strategy?
In the first ascension, the bot will complete the Grandmapocalypse in order to get all the related achievements.
After all the Grandmapocalypse achievements are in place, the bot will not buy Communal Brainsweep in subsequent runs.

## Minigame Strategy

### What is the strategy for the Garden?
At night, the garden is frozen.  During the day:
1. Enable the garden minigame.
2. Wait for MeddleWeed.
3. Get all the other plants by strategic planting.
4. Get all the garden cookies.
5. Sacrifice the garden for sugar lumps.
6. Go to Step 2.

Step 3 may result in an empty garden as there is not enough money for the plants. This gets better when the achievements take longer time to get (more than 5 days).

Currently, sugar lumps are the most precious resource, so the garden is used harvest more through sacrifices. Unfortunately, it is not possible to plant juicy queenbeets, which would solve the sugar lump problem. With frequent sacrifices, the garden produces around one extra sugar lump per day. This strategy halves the time for the level 10 achievements, but does not help for the golden sugar lump.

### What is the strategy for the Stock Market?
The bot is buying cheap and selling high. In this case, high means higher than the resting value of the stock, and low means 1/3 of the high.
In order to have more flexibility, the bot uses also three intermediate points equally distributed between low and high, thus having five points: low, l, m, h, high. 
The bot buys 100% below low, 80% below l, and 60% below m.
The bot sells 100% above high, and 70% above h.
For example, the bot will buy 100% CHC at 10, 80% at 15, and 60% at 20. The bot will sell 100% CHC at 30 and 70% at 25.
As another example, the bot will buy 100% CKI at 50, 80% at 75, and 60% at 100. The bot will sell 100% CHC at 150 and 70% at 125.

In addition, the bot follows the development and waits with buying (selling) as long as the price is dropping (rising).
The buying strategy is likely to be changed in future releases.
The bot does not use loans, but upgrades offices as much as possible and uses as many as possible brokers.

### What is the strategy for the Pantheon?
Typically, we use the gods of mother, decadence and labor at daytime.
At night, mother is replaced with asceticism. When the current sugar lump is almost ripe, the god of order is used in slot 1 to make it ripen sooner.

### What is the strategy for the Grimoires?
Grimoires will only cast "Hand of Fate" when there is already an active golden cookie. This is done in order to maybe get a sugar lump when the spell backfires. It also helps to maybe get the four-leaf cookie.
