var bladeMaxDur = 3,
	blastMaxDur = 2,
	frostMaxDur = 0.7;

function Spell(){
}

function Blade(game){
	this.game = game;
	this.display = game.display;
	this.player = game.player;
	this.center = this.display.createSVGPoint().matrixTransform(
			this.display.createSVGMatrix()
				.translate(this.player.center.x, this.player.center.y)
		);
	this.shape = document.createElementNS(SVGNS, 'polygon');
	
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x - 10, this.center.y - 10)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x, this.center.y - 50)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x + 10, this.center.y - 10)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x + 50, this.center.y)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x + 10, this.center.y + 10)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x, this.center.y + 50)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x - 10, this.center.y + 10)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x - 50, this.center.y)
	));
	this.shape.setAttribute('stroke', '#fff');
	this.shape.setAttribute('fill', 'none');
	
	this.display.appendChild(this.shape);
	
	this.transform = function (T){
		for(var i = 0, size = this.shape.points.length; i < size; ++i){
			// this.shape.points[i] = this.shape.points[i].matrixTransform(T);
			this.shape.points.replaceItem(this.shape.points[i].matrixTransform(T), i);
		}
		this.center = this.center.matrixTransform(T);
	};
	
	this.rotationalSpeed = 540;
	this.bladeDur = bladeMaxDur;
	this.update = function (ms){
		var realDelta = Math.min(ms, this.bladeDur);
		this.bladeDur -= realDelta;
		
		var T = this.display.createSVGMatrix()
			.translate(this.player.center.x - this.center.x, this.player.center.y - this.center.y)
			.translate(this.center.x, this.center.y)
			.rotate(realDelta * this.rotationalSpeed)
			.translate(-this.center.x, -this.center.y);
		this.transform(T);
		
		if(this.bladeDur < eps){
			this.game.dump(this);
		}
	};
}

function Blast(game){
	this.game = game;
	this.display = game.display;
	this.player = game.player;
	this.center = this.display.createSVGPoint().matrixTransform(
			this.display.createSVGMatrix().translate(
				this.player.center.x, this.player.center.y
			)
		);
	this.shape = document.createElementNS(SVGNS, 'polygon');
	
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x, this.center.y - 20)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x + 75, this.center.y + 10)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x, this.center.y)
	));
	this.shape.points.appendItem(this.display.createSVGPoint().matrixTransform(
		this.display.createSVGMatrix().translate(this.center.x - 75, this.center.y + 10)
	));
	
	(function (){
		var T = this.display.createSVGMatrix()
			.translate(this.center.x, this.center.y)
			.rotate(this.player.rotation)
			.translate(-this.center.x, -this.center.y);
		
		for(var i = 0; i < this.shape.points.length; ++i){
			// this.shape.points[i] = this.shape.points[i].matrixTransform(T);
			this.shape.points.replaceItem(this.shape.points[i].matrixTransform(T), i);
		}
		this.center = this.center.matrixTransform(T);
	}).bind(this)();
	
	this.shape.setAttribute('stroke', 'none');
	this.shape.setAttribute('fill', '#fff');
	this.shape.setAttribute('fill-opacity', '0.875');
	
	this.display.appendChild(this.shape);
	
	this.dir_x = fastSine(this.player.rotation * toRadian);
	this.dir_y = -fastCosine(this.player.rotation * toRadian);
	this.speed = 400;
	this.blastDur = blastMaxDur;
	
	this.transform = function (T){
		for(var i = 0, size = this.shape.points.length; i < size; ++i){
			// this.shape.points[i] = this.shape.points[i].matrixTransform(T);
			this.shape.points.replaceItem(this.shape.points[i].matrixTransform(T), i);
		}
		this.center = this.center.matrixTransform(T);
	};
	
	this.update = function (ms){
		var realDelta = Math.min(ms, this.blastDur);
		this.blastDur -= realDelta;
		
		var T = this.display.createSVGMatrix()
			.translate(realDelta * this.dir_x * this.speed, realDelta * this.dir_y * this.speed);
		this.transform(T);
		
		if(this.blastDur < eps){
			this.game.dump(this);
		}
	};
}

function Frost(game){
	this.game = game;
	this.display = game.display;
	this.player = game.player;
	this.center = this.display.createSVGPoint().matrixTransform(
			this.display.createSVGMatrix().translate(
				this.player.center.x, this.player.center.y
			)
		);
	this.shape = document.createElementNS(SVGNS, 'circle');
	this.shape.setAttribute('cx', this.center.x);
	this.shape.setAttribute('cy', this.center.y);
	this.shape.setAttribute('fill', '#0cf');
	this.shape.setAttribute('fill-opacity', 0.5);
	this.shape.setAttribute('stroke', 'none');
	this.display.appendChild(this.shape);
	
	this.r = 0;
	this.shape.setAttribute('r', this.r);
	
	this.frostDur = frostMaxDur;
	this.frostExpansion = 200;
	this.update = function (ms){
		var realDelta = Math.min(ms, this.frostDur);
		this.frostDur -= realDelta;
		
		var dec = this.frostDur / frostMaxDur,
			inc = 1 - dec;
		this.shape.setAttribute('r', this.r = inc * this.frostExpansion);
		
		if(this.frostDur < eps){
			this.game.dump(this);
		}
	};
}

Blade.prototype = new Spell();
Blast.prototype = new Spell();
Frost.prototype = new Spell();