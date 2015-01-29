var birthAnimMaxDur = 1,
	proximity = 1,
	deathAnimMaxDur = 0.5,
	freezeMaxDur = 6;

function getShade(x, y, x0, y0, x1, y1){
	return (y1-y0)*x - (x1-x0)*y + x1*y0 - x0*y1;
}

/*
	Point in polygon algorithm
*/
function PointInPolygon(point, polygon){
	var windingNumber = 0;
	for(var i = 0, pList = polygon.points, size = pList.length;
		i < size; ++i){
		var p2 = pList[i],
			p1 = pList[i + 1 == size ? 0 : i + 1],
			test0 = getShade(0, 0, p1.x, p1.y, p2.x, p2.y),
			test1 = getShade(point.x, point.y, p1.x, p1.y, p2.x, p2.y);
		
		if((test0 < 0 && test1 >= 0)
			|| (test0 > 0 && test1 <= 0)){
			var shade2 = getShade(p2.x, p2.y, 0, 0, point.x, point.y),
				shade1 = getShade(p1.x, p1.y, 0, 0, point.x, point.y);
			if(shade2 <= 0 && shade1 > 0){
				windingNumber += 1;
			} else if(shade2 >= 0 && shade1 < 0){
				windingNumber -= 1;
			}
		}
	}
	
	return windingNumber;
}

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
				if(PointInPolygon(this.center, shape) > 0){
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