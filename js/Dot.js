var birthAnimMaxDur = 1,
	proximity = 1,
	deathAnimMaxDur = 0.5,
	freezeMaxDur = 6;

function Dot(game, x, y){
	this.game = game;
	this.display = game.display;
	this.center = this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(x, y)
	);
	this.shape = document.createElementNS(SVGNS, 'circle');
	this.shape.setAttribute('fill', '#f00');
	this.shape.setAttribute('stroke', '#fff');
	this.shape.setAttribute('cx', x);
	this.shape.setAttribute('cy', y);
	
	this.display.appendChild(this.shape);
	
	this.radius = 10;
	
	this.freezeSpell = null;
	this.checkSpells = function (ms){
		for(var i = 0, size = this.game.spells.length; i < size; ++i){
			var totRad = 0,
				spell = this.game.spells[i],
				shape = spell.shape;
			
			if(spell instanceof Blast || spell instanceof Blade){
				var pList = shape.points,
					len = pList.length,
					wn = 0;
				
				// VECTOR CROSS PRODUCT
				for(var j = 0;	j < len; ++j){
					var v1 = diff(pList[j], this.center),
						v2 = diff(pList[j == len - 1 ? 0 : j + 1], this.center),
						d1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y),
						d2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y),
						crossProduct = cross(v1, v2),
						dotProduct = dot(v1, v2),
						asin = fastAsin(crossProduct / (d1 * d2)),
						acos = fastAcos(dotProduct / (d1 * d2));
					
					if(acos < rightAngle){
						totRad += asin;
					} else if(asin < 0){
						totRad += Math.PI + asin;
					} else{
						totRad += Math.PI - asin;
					}
				}
				
				for(; totRad > Math.PI; totRad -= fullRotation, ++wn);
				if(wn & 1){
					this.isAlive = false;
					break;
				}
			} else if(spell instanceof Frost && this.freezeSpell != spell){				
				var diff_x = spell.center.x - this.center.x,
					diff_y = spell.center.y - this.center.y,
					distance = Math.sqrt(diff_x * diff_x + diff_y * diff_y);
				
				if(distance < spell.r){
					this.freezeSpell = spell;
					this.freezeDur = freezeMaxDur;
					return {
							nextAction: this.freeze,
							realDelta : ms
						};
				}
			}
		}
		return null;
	};
	
	this.freezeDur = 0;
	this.freeze = function (ms){
		var realDelta = Math.min(ms, this.freezeDur);
		
		var res = this.checkSpells(realDelta);
		if(res != null
			&& res.nextAction
			&& res.realDelta){
			return res;
		}
		
		this.freezeDur -= realDelta;
		var dec = this.freezeDur / freezeMaxDur,
			inc = 1 - dec,
			r = Math.max(255 * (2 * dec) | 0, 0),
			g = Math.min(255 * (2 * inc) | 0, 255),
			b = Math.min(255 * (2 * inc) | 0, 255);
		
		this.shape.setAttribute('fill', 'rgb(' + r + ', ' + g + ', ' + b + ')');
		this.shape.setAttribute('stroke', 'rgb(' + r + ', 255,' + b + ')');
		this.shape.setAttribute('fill-opacity', 0.75 + 0.25 * dec);
		
		if(this.freezeDur < eps){
			this.shape.setAttribute('fill', '#f00');
			this.shape.setAttribute('stroke', '#fff');
			this.shape.setAttribute('fill-opacity', 1);
			this.freezeSpell = null;
			
			return {
					nextAction: this.chase,
					realDelta: realDelta
				}
		}
		
		return this.isAlive ? null : {
				nextAction: this.death,
				realDelta : ms
			};
	};
	
	this.deathAnimDur = deathAnimMaxDur;
	this.death = function (ms){
		var realDelta = Math.min(ms, this.deathAnimDur);
		
		this.deathAnimDur -= realDelta;
		var	dec = this.deathAnimDur / deathAnimMaxDur,
			inc = 1 - dec;
		
		this.shape.setAttribute('fill', 'none');
		this.shape.setAttribute('stroke-opacity', dec);
		this.shape.setAttribute('r', 5 + 10 * inc);
		
		this.deathAnimDur -= ms;
		if(this.deathAnimDur < eps){
			killCountDisplay.textContent = ++this.game.playerKillCount;
			this.game.dump(this);
		}
		return null;
	};
	
	this.isAlive = true;
	this.speed = 125;
	this.chase = function (ms){
		var dis_x = this.game.player.center.x - this.center.x,
			dis_y = this.game.player.center.y - this.center.y,
			distance = Math.sqrt(dis_x * dis_x + dis_y * dis_y);
		
		if(distance > proximity){
			var dx = dis_x > 0 ? Math.min(ms * this.speed * dis_x / distance, dis_x)
					: Math.max(ms * this.speed * dis_x / distance, dis_x),
				dy = dis_y > 0 ? Math.min(ms * this.speed * dis_y / distance, dis_y)
					: Math.max(ms * this.speed * dis_y / distance, dis_y),
				T = this.display.createSVGMatrix()
					.translate(dx, dy);
			
			this.center = this.center.matrixTransform(T);
			this.shape.setAttribute('cx', this.center.x);
			this.shape.setAttribute('cy', this.center.y);
		}
		
		var result = this.checkSpells(ms);
		if(result != null
			&& result.nextAction
			&& result.realDelta){
			return result;
		}
		
		if(distance < this.radius){
			this.game.stop('Player dies!');
		}
		
		return this.isAlive ? null : {
				nextAction: this.death,
				realDelta : ms
			};
	};
	
	this.birthAnimDur = birthAnimMaxDur;
	this.birth = function (ms){
		var realDelta = Math.min(ms, this.birthAnimDur);
		
		this.birthAnimDur -= realDelta;
		var	dec = this.birthAnimDur / birthAnimMaxDur,
			inc = 1 - dec;
		
		this.shape.setAttribute('fill-opacity', inc);
		this.shape.setAttribute('r', 5 * inc);
		this.shape.setAttribute('stroke-width', 2 * inc);
		
		if(this.birthAnimDur < eps){
			return {
				nextAction: this.chase,
				realDelta : realDelta
			};
		} else{
			return null;
		}
	};
	
	this.action = this.birth;
	this.update = function (ms){
		for(var result = this.action(ms); result; result = this.action(ms)){
			this.action = result.nextAction;
			ms -= result.realDelta;
		}
	};
}