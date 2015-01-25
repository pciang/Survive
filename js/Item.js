var itemMaxLifetime = 10;

function Item(contain, game, x, y){
	this.game = game;
	this.player = game.player;
	this.display = game.display;
	this.center = this.display.createSVGPoint().matrixTransform(
			this.display.createSVGMatrix().translate(x, y)
		);
	this.shape = document.createElementNS(SVGNS, 'text');
	
	this.shape.textContent = '?';
	this.shape.setAttribute('x', x);
	this.shape.setAttribute('y', y);
	this.shape.setAttribute('fill', '#fff');
	this.shape.setAttribute('font-family', 'Condolas, Courier New, Courier');
	this.shape.setAttribute('font-size', '24px');
	this.display.appendChild(this.shape);
	
	this.radius = 20;
	this.contain = contain;
	
	this.lifetime = itemMaxLifetime;
	this.update = function (ms){
		var realDelta = Math.min(this.lifetime, ms);
		this.lifetime -= ms;
		
		var diff_x = this.player.center.x - this.center.x,
			diff_y = this.player.center.y - this.center.y,
			dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y);
		
		if(dist < this.radius){
			if(contain == Blade){
				spellNameHolder.textContent = 'Blade';
				spellNameHolder.style.color = '#ff0';
			} else if(contain == Blast){
				spellNameHolder.textContent = 'Blast';
				spellNameHolder.style.color = '#f00';
			} else if(contain == Frost){
				spellNameHolder.textContent = 'Frost';
				spellNameHolder.style.color = '#00f';
			}
			
			this.player.currentSpell = this.contain;
			this.lifetime = 0;
		}
		
		if(this.lifetime < eps){
			this.game.dump(this);
		}
	}
}