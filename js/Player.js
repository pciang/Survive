function Player(game, x, y){
	this.game = game;
	this.display = game.display;
	this.shape = document.createElementNS(SVGNS, 'polygon');
	this.display.appendChild(this.shape);
	
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(x, y - 10)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(x + 5, y + 5)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(x, y)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(x - 5, y + 5)
	));
	
	this.center = this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(x, y)
	);
	this.shape.setAttribute('fill', 'none');
	this.shape.setAttribute('stroke', '#09f');
	this.shape.setAttribute('stroke-width', '1px');
	
	this.transform = function (T){
		for(var i = 0, size = this.shape.points.length; i < size; ++i){
			this.shape.points[i] = this.shape.points[i].matrixTransform(T);
		}
		this.center = this.center.matrixTransform(T);
	};
	
	this.speed = 300;
	this.rotationalSpeed = 180;
	this.rotation = 0;
	this.forward = function (ms){
		var radian = this.rotation * toRadian,
			dir_x = fastSine(radian),
			dir_y = -fastCosine(radian),
			T = this.display.createSVGMatrix()
				.translate(dir_x * ms * this.speed, dir_y * ms * this.speed);
		this.transform(T);
	};
	
	this.turn = function (ms, direction){
		var change = this.rotationalSpeed * direction * ms
			T = this.display.createSVGMatrix()
				.translate(this.center.x, this.center.y)
				.rotate(this.rotation)
				.rotate(change)
				.rotate(-this.rotation)
				.translate(-this.center.x, -this.center.y);
		
		this.rotation += change;
		while(this.rotation < -180){
			this.rotation += 360;
		}
		while(180 < this.rotation){
			this.rotation -= 360;
		}
		
		this.transform(T);
	}
	
	this.reposition = function (){
		var x = Math.max(Math.max(Math.min(this.center.x, this.game.display_w), Math.min(0, this.center.x)), 0),
			y = Math.max(Math.max(Math.min(this.center.y, this.game.display_h), Math.min(0, this.center.y)), 0),
			dx = x - this.center.x,
			dy = y - this.center.y;
		
		if(Math.abs(dx) < eps && Math.abs(dy) < eps){
			return;
		}
		
		var T = this.display.createSVGMatrix()
			.translate(dx, dy);
		this.transform(T);
	};
	
	this.currentSpell = null;
	this.update = function (ms){
		if(this.game.keys._38){
			this.forward(ms);
		}
		if(this.game.keys._37){
			this.turn(ms, -1);
		}
		if(this.game.keys._39){
			this.turn(ms, 1);
		}
		this.reposition();
		
		if(this.game.keys._90 && this.currentSpell != null){
			spellNameHolder.textContent = '';
			this.game.castSpell(this.currentSpell, this.game);
			this.currentSpell = null;
		}
	};
}