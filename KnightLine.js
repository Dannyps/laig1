class KnightLine {

	constructor(gameBoard) {
		this.gameBoard = gameBoard;
		this.boardSize = 10;
	}

	dummy_handshake() {
		let request = new XMLHttpRequest();
		request.open('GET', 'http://localhost:8081/initPlayerVsPlayer');
		let that = this; // javascript is love
		request.onload = function (ev) {
			console.log(request.responseText);
			that.parsePrologBoard(request.responseText);
		}
		request.send();
	}

	parsePrologBoard(boardStr) {
		// remove the first and last bracket
		boardStr = boardStr.substring(1, boardStr.length - 1);

		//
		let reg = /(?:\[|\],|\])/; // meh, not that clean..
		let rows = (boardStr.split(reg)).filter(e => e!=='');
		let row_number = 0, collumn_number = 0;
		rows.forEach(row => {
			let tiles = row.split(',');
			for(let tile of tiles) {
				// Empty tile, nothing to see here
				if(tile == "e") {
					tile++;
					continue;
				}

				let tile_type;
				if(tile.charAt(0) == 'b') {
					tile_type = "BLACK";
				} else if (tile.charAt(0) == 'w') {
					tile_type = "WHITE";
				} else throw "Unknown tile";
				
				// parse number of tiles
				let numberTiles = parseInt(tile.substring(2));
				console.log(`Found ${numberTiles} ${tile_type} tiles`);
				collumn_number++;
			}
		});
	}

}