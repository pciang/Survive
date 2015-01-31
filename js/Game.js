var maxNDots = 400,
	dotSpawnPeriod = 0.75,
	itemSpawnPeriod = 5,
	bladeSpawnChance = 0.45,
	blastSpawnChance = bladeSpawnChance + 0.35,
	frostSpawnChance = blastSpawnChance + 0.20;

function Game(display, perfLog){
	
	// anonymous function to clear all shapes in svg
	(function (){
		var child;
		while(child = display.firstChild){
			display.removeChild(child);
		}
	})();
	
	this.startTime = (new Date()).getTime() - 1;
	this.last   = this.startTime;
	this.frames = 1;
	this.perfLog = perfLog;
	this.display = display;
	// this.display = document.createElementNS(SVGNS, 'svg');
	this.display_w = 1024;
	this.display_h = 720;
	// this.display.setAttribute('width', this.display_w);
	// this.display.setAttribute('height', this.display_h);
	// this.display.style.backgroundColor = '#000';
	
	// container.appendChild(this.display);
	
	this.playerKillCount         = 0;
	killCountDisplay.textContent = 0;
	spellNameHolder.textContent  = 0;
	
	this.keys = {
		_37: false, _38: false, _39: false, _40: false, _32: false
	};
	
	document.addEventListener('keydown', function (e){
		switch(e.keyCode){
			case 37:
				e.preventDefault();
				this.keys._37 = true;
				break;
			case 38:
				e.preventDefault();
				this.keys._38 = true;
				break;
			case 39:
				e.preventDefault();
				this.keys._39 = true;
				break;
			case 40:
				e.preventDefault();
				this.keys._40 = true;
				break;
			case 32:
				e.preventDefault();
				this.keys._32 = true;
				break;
			case 90:
				e.preventDefault();
				this.keys._90 = true;
				break;
		}
	}.bind(this));
	
	document.addEventListener('keyup', function (e){
		switch(e.keyCode){
			case 37:
				e.preventDefault();
				this.keys._37 = false;
				break;
			case 38:
				e.preventDefault();
				this.keys._38 = false;
				break;
			case 39:
				e.preventDefault();
				this.keys._39 = false;
				break;
			case 40:
				e.preventDefault();
				this.keys._40 = false;
				break;
			case 32:
				e.preventDefault();
				this.keys._32 = false;
				break;
			case 90:
				e.preventDefault();
				this.keys._90 = false;
				break;
		}
	}.bind(this));
	
	this.player = new Player(this, 512, 360);
	
	this.objects = [this.player];
	this.spells = [];
	this.dumpster = [];
	
	this.castSpell = function (s, game){
		var spell = new s(game);
		this.objects.push(spell);
		this.spells.push(spell);
		return spell;
	}
	
	this.spawnDot = function (x, y){
		return this.objects[this.objects.push(new Dot(this, x, y)) - 1];
	};
	
	this.spawnItem = function (spell, x, y){
		return this.objects[this.objects.push(new Item(spell, this, x, y)) - 1];
	};
	
	this.dump = function (obj){
		return this.dumpster[this.dumpster.push(obj) - 1];
	}
	
	// this.spawnDot(512, 323.0854187011719);
	// this.spawnDot(512, 50);
	// this.spawnDot(50, 360);
	// this.spawnDot(974, 360);
	// this.spawnDot(512, 670);
	
	// this.castSpell(Frost, this);
	// this.castSpell(Blade, this);
	// this.castSpell(Blast, this);
	// this.spawnItem(Frost, 100, 100);
	
	this.NDots = 0;
	this.dotSpawnChance = 1;
	this.dotSpawnPeriod = dotSpawnPeriod;
	
	this.itemSpawnPeriod = itemSpawnPeriod;
	this.randomSpawn = function (ms){
		// Random spawn dot
		(function (ms){
			var realDelta = Math.min(this.dotSpawnPeriod, ms);
			this.dotSpawnPeriod -= ms;
			
			if(this.dotSpawnPeriod < eps
				&& this.NDots < maxNDots
				&& Math.random() < this.dotSpawnChance){
				var x = Math.random() * this.display_w | 0,
					y = Math.random() * this.display_h | 0;
				this.spawnDot(x, y);
				
				this.dotSpawnPeriod = dotSpawnPeriod;
				++this.NDots;
			}
		}).bind(this)(ms);
		
		// Random spawn item
		(function (ms){
			var realDelta = Math.min(this.itemSpawnPeriod, ms);
			this.itemSpawnPeriod -= ms;
			
			if(this.itemSpawnPeriod < eps){
				var x = Math.random() * this.display_w | 0,
					y = Math.random() * this.display_h | 0,
					rand = Math.random(),
					spell = rand < bladeSpawnChance ? Blade :
							rand < blastSpawnChance ? Blast : Frost;
				this.spawnItem(spell, x, y);
				
				this.itemSpawnPeriod = itemSpawnPeriod;
			}
		}).bind(this)(ms);
	};
	
	// MAIN UPDATE
	this.mainUpdate = function (ms){
		this.randomSpawn(ms);
		
		for(var i = 0, size = this.objects.length; i < size; ++i){
			this.objects[i].update(ms);
		}
		for(var i = 0, size = this.dumpster.length; i < size; ++i){
			var obj = this.dumpster[i];
			
			this.objects.splice(this.objects.indexOf(obj), 1);
			if(obj instanceof Spell){
				this.spells.splice(this.spells.indexOf(obj), 1);
			}
			if(typeof obj.shape != 'undefined'){
				this.display.removeChild(obj.shape);
			}
			
			if(obj instanceof Dot){
				--this.NDots;
			}
		}
		this.dumpster = [];
	};
	
	this.secLeft = 0;
	this.update = function (t){
		var now = (new Date()).getTime(),
			delta = now - this.last,
			ms = delta / 1000;
		if(this.perfLog){
			var fps = 1000 / ((now - this.startTime) / this.frames++);
			this.perfLog.textContent = 'fps: ' + fps;
		}
		// console.log(now, delta, this.last, 'milliseconds: ', ms);
		this.last = now;
		
		
		if(this.secLeft > 0){
			if(this.secLeft < this.ms){
				this.mainUpdate(this.secLeft);
				
				ms -= this.secLeft;
				this.secLeft = 0;
			} else{
				this.mainUpdate(ms);
				this.secLeft -= ms;
				
				
				if(gameRequestId != null){
					gameRequestId = window.requestAnimationFrame(this.update.bind(this));
				}
				return;
			}
		}
		
		var realMs = 0;
		for(; ms > 0; ms -= realMs){
			realMs = Math.min(ms, secPerUpdate);
			this.mainUpdate(realMs);
		}
		this.secLeft = secPerUpdate - realMs;
		
		if(gameRequestId != null){
			gameRequestId = window.requestAnimationFrame(this.update.bind(this));
		}
	};
	
	this.stop = function (s){
		if(gameRequestId != null){
			window.cancelAnimationFrame(gameRequestId);
			gameRequestId = null;
			alert('Final kill count: ' + this.playerKillCount);
		}
	};
	
	gameRequestId = window.requestAnimationFrame(this.update.bind(this));
}