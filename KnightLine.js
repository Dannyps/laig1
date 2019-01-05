class KnightLine {

	constructor(scene) {
		this.gameBoard = scene.graph.parsedComponents.get('gameBoard').CGFprimitives.get('board');
		window.board = this.gameBoard; // TODOP remove this
		this.gameControl = scene.gc;
		this.boardSize = 10;
	}

	sgc_waiting() {
		this.gameControl.status = 1;
	}

	sgc_running() {
		this.gameControl.status = 2;
	}

	sgc_end() {
		this.gameControl.status = 3;
	}

	sgc_setMessage(str){
		this.gameControl.statusStr = str;
	}

	dummy_handshake() {
		let request = new XMLHttpRequest();
		request.open('GET', 'http://localhost:8081/initPlayerVsPlayer');
		this.sgc_waiting();
		let that = this; // javascript is love
		request.onload = function (ev) {
			that.sgc_running();
			console.log(request.responseText);
			that.parsePrologBoard(request.responseText);
		}
		request.send();
	}

	async parsePrologBoard(boardStr) {
		// remove the first and last bracket
		boardStr = boardStr.substring(1, boardStr.length - 1);

		//
		let reg = /(?:\[|\],|\])/; // meh, not that clean..
		let rows = (boardStr.split(reg)).filter(e => e !== '');
		
		let numberOfRows = rows.length;
		let numberOfCols;
		rows.forEach(row => {
			let tiles = row.split(',');
			numberOfCols = tiles.length;
			for (let tile of tiles) {
				// Empty tile, nothing to see here
				if (tile == "e") {
					tile++;
					continue;
				}

				let tile_type;
				if (tile.charAt(0) == 'b') {
					tile_type = "BLACK";
				} else if (tile.charAt(0) == 'w') {
					tile_type = "WHITE";
				} else throw "Unknown tile";

				// parse number of tiles
				let numberTiles = parseInt(tile.substring(2));
				console.log(`Found ${numberTiles} ${tile_type} tiles`);
			}
			//this.gameBoard.setBoardSize(this.max(numberOfRows, numberOfCols));
		});

		await this.gameBoard.readyForFirstGame();
		this.sgc_setMessage("Ready");
	}

	max(a, b) {
		if (a > b)
			return a;
		return b;
	}

	getValidMoves(player, boardStr) {
		if (player != 'white' && player != 'black') throw "Unexpected player. Use 'white' or 'black'";
		let baseUrl = `http://localhost:8081/get_valid_moves_${player}(${boardStr})`;
		let request = new XMLHttpRequest();
		request.open('GET', baseUrl);
		this.sgc_waiting();
		let that = this; // javascript is love
		let p = new Promise(resolve => {
			request.onload = function (ev) {
				that.sgc_running();
				resolve(request.responseText);
			}
		})
		request.send();
		return p;
	}

}