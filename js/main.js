document.addEventListener('DOMContentLoaded', function (arg){
	document.addEventListener('keydown', function (e){
		if(e.keyCode == 32 && gameRequestId == null){
			e.preventDefault();
			var game = new Game(
				document.getElementById('display'),
				document.getElementById('perfLog')
			);
		}
	});
});
