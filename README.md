## Survive

A simple game created with HTML5 SVG and JavaScript. Read some tips before playing the game :)

Click <a href="https://rawgit.com/pciang/Survive/master/index.html" target="_blank">here</a> to play now!

### Control
* Press up, left, and right arrow to move around.
* Press 'Z' key to use spell
* Press spacebar button to start a new game or restart a game

### Changelog (3rd Feb 2015): <sup>(New!)</sup>
* Dot now requires 2s to take full form (player may pass through safely)
* Dot collision radius reduced from 10px to 8px
* Fixed strange item collision size
  * Item collision size is reduced from 20px to 16px
  * Item icon is enlarged from 24px to 36px
  * Item collision circle is approximately in the middle of the '?'
* The player now has its physics
  * Player's acceleration is 600px per sec^2
  * Player's deceleration is 350px per sec^2
  * Player's maxed velocity is reduced from 300px/s to 250px/s
  * Player's rotational speed is increased from 180deg/s to 270deg/s
* Inverse trigonometric functions such as asin and acos are precomputed beforehand

### Tips
* Dot requires 2s to take form (player may pass through safely)
* Frozen dot does not move for 6s (does not kill player too)
* Dot travels at 125px per second
* Item ('?') spawns every 5s, and lasts for only 10s
* Blade radius is 50px, it spins 540 degree per second
* Blade rotation is independent of player
* Frost affects 300px radius around casting point

### Changelog (1st Feb 2015):
* Maximum number of dots increased from 200 to 400
* Dot always spawn at random location every 0.75s
* Blast travel 700px over 1s (before: 800px over 2s)
* Blast width increased from 150px to 160px
* Frost AOE increased from 200 to 300
* Frost travel 300px over 0.3s
