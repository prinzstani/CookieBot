# Cookie Bot
**Cookie Bot** is an add-on you can load  into Cookie Clicker, that will do an automatic playthrough for Cookie Clicker. It does not cheat (but see below) and it is not strictly speaking a third-party tool in the sense of cookie clicker, but it allows you to get all achievements needed for a complete playthrough.

The tool is designed to mimic a human player, and it avoids being super-human in terms of clicking speed and possible moves. This includes also not playing at night, i.e. from 23:00 until 07:00. For the night mode, if possible, the golden switch is used together with fitting spirits in order to maximize output.

In most cases, the bot uses the same interface as a human player. Some achievements take very long time or are even impossible with the regular game interface. In these cases, the bot accesses the internal game parameters and cheats the game. Cheats are activities that are not possible from the user interface.

Cookie Bot will start wherever you are in your game and continue to a complete playthrough.

## Current version

You can see the current version, and a full history of all versions and what they changed by consulting the [releases page](https://github.com/prinzstani/CookieBot/releases).

## What it does

Cookie Bot plays through the complete game of Cookie Clicker. This will take about two months, depending a lot on randomness in the game itself. See also the [FAQ](https://github.com/prinzstani/CookieBot/blob/master/FAQ.md) for more details. It indicates its current steps when you hover over the version text of it (bottom left of screen).

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

You can also try the beta version with the following code (No guarantees whatsoever).

```javascript
javascript: (function () {
	Game.LoadMod('https://prinzstani.github.io/CookieBot/cookieAutoPlayBeta.js');
}());
```

## Userscript

Cookie Bot can also be activated via script in *Tampermonkey* (or *Greasemonkey*). This script will automatically load *Cookie Monster* every time the original game loads. Check your browsers/plugin's documentation for how to add a userscript. This script is courtesy of **[SearchAndDestroy](https://github.com/SearchAndDestroy)**.

```javascript
// ==UserScript==
// @name        Cookie Bot
// @namespace   https://github.com/prinzstani/CookieBot
// @include     http://orteil.dashnet.org/cookieclicker/
// @version     2.01
// @author      prinzstani
// @grant       none
// ==/UserScript==
    
var code = "(" + (function() {
    var checkReady = setInterval(function() {
        if (typeof Game.ready !== 'undefined' && Game.ready) {
            Game.LoadMod('https://prinzstani.github.io/CookieBot/cookieAutoPlay.js');
            clearInterval(checkReady);
        }
    }, 1000);
}).toString() + ")()";

window.eval(code);
```

If you are using the beta, use this instead:

```javascript
// ==UserScript==
// @name        Cookie Bot Beta
// @namespace   https://github.com/prinzstani/CookieBot
// @include     http://orteil.dashnet.org/cookieclicker/
// @version     2.01
// @author      prinzstani
// @grant       none
// ==/UserScript==
    
var code = "(" + (function() {
    var checkReady = setInterval(function() {
        if (typeof Game.ready !== 'undefined' && Game.ready) {
            Game.LoadMod('https://prinzstani.github.io/CookieBot/cookieAutoPlayBeta.js');
            clearInterval(checkReady);
        }
    }, 1000);
}).toString() + ")()";

window.eval(code);
```

## Steam
Cookie Bot can be used in the *Steam* version by creating a new folder and 2 files within it. These scripts are courtesy of **[thelmexx](https://github.com/thelmexx)**.
Create a folder in the `{Install Folder}\resources\app\mods\local` folder named `CookieBot` and add these 2 files within it.

###### *info.txt*:
```json
{
	"Name": "CookieBot",
	"ID": "cookie bot",
	"Author": "prinzstani",
	"Description": "Cookie Bot is an add-on you can load into Cookie Clicker, that will do an automatic playthrough for Cookie Clicker.",
	"ModVersion": 2.030,
	"GameVersion": 2.042,
	"Date": "13/09/2021",
	"Dependencies": [],
	"Disabled": 1
}
```

###### *main.js*:
`Game.LoadMod('https://prinzstani.github.io/CookieBot/cookieAutoPlay.js');`

Or for the beta:
`Game.LoadMod('https://prinzstani.github.io/CookieBot/cookieAutoPlayBeta.js');`

# Bugs and suggestions

Any bug or suggestion should be **created as an issue** [in the repository](https://github.com/prinzstani/CookieBot) for easier tracking. This allows to follow the status of the issue.

All suggestions are welcome, even the smallest ones.

Before submitting a bug report, please reload the bot, as it is continuously improved. Maybe the bug is already fixed. When you do report a bug, please make sure to include the following information.
* Version number of Cookie Clicker and of Cookie Bot, also indicating whether you use the beta or not.
* Description of the Problem
* Export save of the status when the problem arises.

# Contributors
* **[Prinz Stani](https://github.com/prinzstani)**: Original author and current maintainer
* **[SearchAndDestroy](https://github.com/SearchAndDestroy)**: Tampermonkey script
* **[AlexFolland](https://github.com/AlexFolland)**: Options and small fixes
* **[corvidian](https://github.com/corvidian)**: Elder handling and optimization
* **[troycomi](https://github.com/troycomi)**: Savings, cookie monster integration
* See also the [list of commit contributors](https://github.com/prinzstani/CookieBot/graphs/contributors)

We need more contributors. Please contact theprinzstani@gmail.com if you are interested.
