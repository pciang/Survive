var eps = 1e-6,
	looseEps = 1e-3,
	SVGNS = 'http://www.w3.org/2000/svg',
	rightAngle = Math.PI / 2,
	fullRotation = 2 * Math.PI,
	toRadian = Math.PI / 180,
	toDegree = 180 / Math.PI,
	spellNameHolder = document.getElementById('spell_name_holder'),
	killCountDisplay = document.getElementById('kill_count_display'),
	secPerUpdate = 1 / 120, // run updates every 1/120 s
	msPerUpdate = 1000 / 120,
	date = new Date(),
	gameRequestId = null,
	fastAsinTable = [],
	fastAcosTable = [];

fastAsinTable[20000] = fastAcosTable[20000] = null;

// asin acos precompute
for(var i = -10000; i <= 10000; ++i){
	fastAsinTable[i + 10000] = Math.asin(i / 10000);
	fastAcosTable[i + 10000] = Math.acos(i / 10000);
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

function addSVGPoint(svg, shape, x, y){
	shape.points.appendItem(svg.createSVGPoint().matrixTransform(
		svg.createSVGMatrix().translate(x, y)
	));
}

alert('Press up, left, and right button to move.\nPress \'Z\' button to use spell!\nPress spacebar button to start a new game or restart a game!\n\nFinally, play this game in full-screen mode (press F11).');