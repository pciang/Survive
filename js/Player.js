function Player(game, x, y){
	this.game = game;
	this.display = game.display;
	this.shape = document.createElementNS(SVGNS, 'polygon');
	this.display.appendChild(this.shape);
	
	// clockwise polygon
	addSVGPoint(this.display, this.shape, x, y - 10);
	addSVGPoint(this.display, this.shape, x + 5, y + 5);
	addSVGPoint(this.display, this.shape, x, y);
	addSVGPoint(this.display, this.shape, x - 5, y + 5);
	
	this.center = this.display.createSVGPoint();
	this.center.x = x; this.center.y = y;
	
	this.shape.setAttribute('fill', '#ccc');
	this.shape.setAttribute('stroke', '#ccc');
	this.shape.setAttribute('stroke-width', '1px');
	
	this.transform = function (T){
		for(var i = 0, size = this.shape.points.length; i < size; ++i){
			// point = point.matrixTransform(T) does not work in Firefox
			// this.shape.points[i] = this.shape.points[i].matrixTransform(T);
			this.shape.points.replaceItem(this.shape.points[i].matrixTransform(T), i);
		}
		this.center = this.center.matrixTransform(T);
	};
	
	this.rotationalSpeed = 270;
	this.rotation = 0;
	
	this.turn = function (ms, direction){
		var change = this.rotationalSpeed * direction * ms
			T = this.display.createSVGMatrix()
				.translate(this.center.x, this.center.y)
				.rotate(this.rotation)
				.rotate(change)
				.rotate(-this.rotation)
				.translate(-this.center.x, -this.center.y);
		
		this.rotation += change;
		if(this.rotation < -180){
			this.rotation += 360;
		}
		if(180 < this.rotation){
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
	
	this.v_angle = 0; // in degree
	this.velocity = 0;
	this.max_velocity = 250;
	this.acceleration = 600;
	this.deceleration = 350;
	
	this.decelerate = function (ms){
		this.velocity -= ms * this.deceleration;
		if(this.velocity < 0) this.velocity = 0;
	}
	
	this.accelerate = function (ms){
		var radian = this.rotation * toRadian,
			v_rad = this.v_angle * toRadian,
			v_x = this.velocity * fastSine(v_rad),
			v_y = this.velocity * -fastCosine(v_rad),
			accel_x = this.acceleration * fastSine(radian),
			accel_y = this.acceleration * -fastCosine(radian);
		v_x += accel_x * ms;
		v_y += accel_y * ms;
		
		this.velocity = Math.sqrt(v_x * v_x + v_y * v_y);
		if(Math.abs(v_x) < eps && Math.abs(v_y) < eps){
			this.v_angle = 0;
			this.velocity = 0;
		} else{
			this.v_angle = Math.atan2(v_x, -v_y) * toDegree;
		}
		
		if(this.velocity > this.max_velocity){
			this.velocity = this.max_velocity;
		}
	};
	
	this.updatePosition = function (ms){
		var radian = this.v_angle * toRadian,
			T = this.display.createSVGMatrix()
				.translate(ms * this.velocity * fastSine(radian),
					ms * this.velocity * -fastCosine(radian));
		
		this.transform(T);
	}
	
	this.currentSpell = null;
	this.update = function (ms){
		this.decelerate(ms);
		if(this.game.keys._38){
			this.accelerate(ms);
		}
		if(this.game.keys._37){
			this.turn(ms, -1);
		}
		if(this.game.keys._39){
			this.turn(ms, 1);
		}
		this.updatePosition(ms);
		this.reposition();
		
		if(this.game.keys._90 && this.currentSpell != null){
			spellNameHolder.textContent = '';
			this.game.castSpell(this.currentSpell, this.game);
			this.currentSpell = null;
		}
	};
}