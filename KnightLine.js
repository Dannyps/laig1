class KnightLine {

	constructor(scene) {
		this.baseURL = 'http://localhost:8081';
		this.gameBoard = scene.graph.parsedComponents.get('gameBoard').CGFprimitives.get('board');
		this.gameControl = scene.gc;
		this.boardSize = 10;
		this.scene = scene;
		this.defaultAccentLightName = "ls1"
	}

	/**
	 *If a light with the id @var defaultAccentLightName exists, it shall be used to give visual feedback to the player(s).
	 *
	 * @param {*} r
	 * @param {*} g
	 * @param {*} b
	 * @memberof KnightLine
	 */
	accentLightControl(r, g, b) {
		let lights = this.scene.graph.parsedLights;
		var iterator = lights.keys();
		for (let i = 0; i < lights.size; i++) {
			if (iterator.next().value == this.defaultAccentLightName) {
				this.scene.lights[i].setDiffuse(r, g, b, 1);
			}
		}
	}

	sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

	getCurrentAccentLight() {
		let lights = this.scene.graph.parsedLights;
		var iterator = lights.keys();
		for (let i = 0; i < lights.size; i++) {
			if (iterator.next().value == this.defaultAccentLightName) {
				let l = this.scene.lights[i];
				let res = [];
				res.push(l.diffuse[0])
				res.push(l.diffuse[1])
				res.push(l.diffuse[2])
				return res;
			}
		}
		return false;
	}

	async blinkAccentLight(r, g, b, times, onDur = 100, offDur = 50) {
		// originalColour
		let oc = this.getCurrentAccentLight();
		for (let i = 0; i < times; i++) {
			this.accentLightControl(r, g, b);
			await this.sleep(onDur);
			this.accentLightControl(oc[0], oc[1], oc[2]);
			await this.sleep(offDur);
		}
	}


	sgc_waiting() {
		this.gameControl.status = 1;
		this.accentLightControl(0.5, 0.5, 0.05);
	}

	sgc_running() {
		this.gameControl.status = 2;
		this.accentLightControl(0.2, 1, 0.30);
	}

	sgc_end() {
		this.gameControl.status = 3;
	}

	sgc_setMessage(str) {
		this.gameControl.statusStr = str;
	}

	dummy_handshake() {
		let request = new XMLHttpRequest();
		request.open('GET', this.baseURL + '/initPlayerVsPlayer');
		this.sgc_waiting();
		let that = this; // javascript is love
		request.onload = function (ev) {
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
		this.sgc_running();
		this.sgc_setMessage("Ready");
	}

	max(a, b) {
		if (a > b)
			return a;
		return b;
	}

	getValidMoves(player, boardStr) {
		if (player != 'white' && player != 'black') throw "Unexpected player. Use 'white' or 'black'";
		let baseUrl = this.baseURL + `/get_valid_moves_${player}(${boardStr})`;
		let request = new XMLHttpRequest();
		request.open('GET', baseUrl);
		this.sgc_waiting();
		let that = this; // javascript is love
		let p = new Promise(resolve => {
			request.onload = function (ev) {
				that.sgc_running();
				resolve(request.responseText);
			}
		});
		request.send();
		return p;
	}

	requestGetWinner(boardStr) {
		let baseUrl = this.baseURL+`/is_game_over(${boardStr})`;
		let request = new XMLHttpRequest();
		request.open('GET', baseUrl);
		this.sgc_waiting();
		let that = this; // javascript is love
		let p = new Promise(resolve => {
			request.onload = function (ev) {
				that.sgc_running();
				resolve(request.responseText);
			}
		});
		request.send();
		return p;
	}

}