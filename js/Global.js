var eps = 1e-4,
	looseEps = 1e-2,
	SVGNS = 'http://www.w3.org/2000/svg',
	fastAsinTable = [],
	fastAcosTable = [],
	rightAngle = Math.PI / 2,
	fullRotation = 2 * Math.PI,
	toRadian = Math.PI / 180,
	toAngle = 180 / Math.PI,
	spellNameHolder = document.getElementById('spell_name_holder'),
	killCountDisplay = document.getElementById('kill_count_display');

for(var i = -10000; i <= 10000; ++i){
	// FAST ASIN PRECOMPUTE
	fastAsinTable.push(Math.asin(i / 10000));
	
	// FAST ACOS PRECOMPUTE
	fastAcosTable.push(Math.acos(i / 10000));
}

function fastAsin(x){
	return fastAsinTable[(x * 10000 | 0) + 10000];
}

function fastAcos(x){
	return fastAcosTable[(x * 10000 | 0) + 10000];
}

function fastSine(rad){
	var y = 1.2732395447351627 * rad - 0.4052847345693511 * rad * Math.abs(rad);
	
	return .775 * y + .225 * y * Math.abs(y);
}

function fastCosine(rad){
	rad += rightAngle;
	
	if(rad > Math.PI){
		rad -= fullRotation;
	}
	
	return fastSine(rad);
}

function cross(v1, v2){
	return v1.x * v2.y - v2.x * v1.y;
}

function diff(p1, p2){
	return {
		x: p1.x - p2.x,
		y: p1.y - p2.y
	};
}

function dot(v1, v2){
	return v1.x * v2.x + v1.y * v2.y;
}