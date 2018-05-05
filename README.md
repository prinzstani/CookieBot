# Cookie Bot
**Cookie Bot** is an add-on you can load  into Cookie Clicker, that will do an automatic playthrough for Cookie Clicker. It does not cheat (but see below) and it is not strictly speaking a third-party tool in the sense of cookie clicker, but it allows you to get all achievements needed for a complete playthrough.

The tool is designed to mimic a human player, and it avoids being super-human in terms of clicking speed and possible moves. This includes also not playing at night, i.e. from 23:00 until 07:00. For the night mode, if possible, the golden switch is used together with fitting spirits in order to maximize output.

Cookie Bot will start wherever you are in your game and continue to a complete playthrough.

## Current version

You can see the current version, and a full history of all versions and what they changed by consulting the [releases page](https://github.com/prinzstani/CookieBot/releases).

## What it does

Cookie Bot plays through the complete game of Cookie Clicker. This will take about two months, depending a lot on randomness in the game itself. The following steps are taken, and if you start somewhere in the middle, the procedure is adapted accordingly.

* Step 1: keep quiet until hardcore and neverclick, then buy everything until all grandma achievements are there: this takes about two days.
* Step 2: get 100 quintillion cookies, i.e. about 300 legacy, develop the dragon with kitten aura, get the first permanent slot with maximum cursors: this takes about one more day.
* Step 3: get 100 antimatter condensers, get the season switcher: this takes about 2-3 days
* Step 4: complete christmas, then easter and valentine, then halloween: about 2-3 days
* Step 5: with five permanent slots: get 1000 ascends; until then continue with step 6: about 2 days
* Step 6: get all "bake xx cookies" achievements & all building achievements: about one month
* Step 7: get all shadow achievements and all the remaining achievements: about one month
* Step 8: get all the level 10 buildings: about two years
* Step 9: get the golden sugar lump: about three more years

With the current design of the game, the first 7 steps take about two months. The last two steps take together five years on average, and two years minimum.
This is considered not good in terms of game dynamics, and therefore the playthrough will cheat sugar lumps in the end phase (i.e. when only sugar lump related achievements are missing). In particular, it will divide the ripening time for sugar lumps by 600. This way the ripening time is a few minutes instead of hours. With this cheat, the last two steps will take less than one month.

## Limitations

It is not claimed that Cookie Bot uses the best strategy possible. The idea is to use one strategy that works in all cases. That being said, please feel free to [suggest improvements](https://github.com/prinzstani/CookieBot).

Cookie Bot does not combine well with imports. If you want to run it on another game, first reload cookie clicker and get rid of the bot, then import, and finally reload the bot.

# Usage

## Bookmarklet

Copy this code and save it as a bookmark. Paste it in the URL section. To activate, click the bookmark when the Cookie Clicker game is open.

```javascript
javascript: (function () {
	Game.LoadMod('https://prinzstani.github.io/CookieBot/cookieAutoPlay.js');
}());
```

If (for some reason) the above doesn't work, try pasting everything after the <code>javascript:</code> bit into your browser's console.

## Beta Version

You can also try the beta version. No guarantees whatsoever. Copy this code and save it as a bookmark. Paste it in the URL section. To activate, click the bookmark when the Cookie Clicker game is open.

```javascript
javascript: (function () {
	Game.LoadMod('https://prinzstani.github.io/CookieBot/cookieAutoPlayBeta.js');
}());
```

# Bugs and suggestions

Any bug or suggestion should be **created as an issue** [in the repository](https://github.com/prinzstani/CookieBot) for easier tracking. This allows to follow the status of the issue.

All suggestions are welcome, even the smallest ones.

# Contributors

* **[Prinz Stani](https://github.com/prinzstani)**: Original author and current maintainer