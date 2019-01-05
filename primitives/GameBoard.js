/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

// wanna be Enum in JS
const GameState = {
    WHITE_PLAYER_TURN: 0,
    BLACK_PLAYER_TURN: 1,
    WHITE_PLAYER_PICKED_PIECE: 2,
    BLACK_PLAYER_PICKED_PIECE: 3,
    SPOT_PICKED: 4
};

class GameBoard extends CGFobject {
    constructor(scene, initialSize) {
        super(scene);
        this.scene = scene;
        this.size = initialSize;

        this.whiteSpot = new CGFappearance(scene);
        this.whiteSpot.setDiffuse(1, 1, 1, 1);

        this.darkSpot = new CGFappearance(scene);
        this.darkSpot.setAmbient(0, 0, 0, 1);

        this.highlightSpotLight = new CGFappearance(scene);
        this.highlightSpotLight.setDiffuse(0.7, 0, 0, 1);

        this.highlightSpotDark = new CGFappearance(scene);
        this.highlightSpotDark.setDiffuse(0.2, 0, 0, 1);

        this.board = []; // matrix
        this.hasSizeChanged = true; // if true, build a new board, else use the current board

        this.state = GameState.WHITE_PLAYER_TURN;
        this.validMoves = []; /**> @type {Array<{{i: Number, j: Number}}>} Array of objects representing the valid moves for current turn */
        this.lastPickedPiece; /**> @type {MyPiece} @description Holds the last picked tile, if any */
    };

    fillBoard() {
        let edgeCoord = this.size / 2;
        for (let i = -edgeCoord; i < edgeCoord; i++) {
            let arr = [];
            for (let j = -edgeCoord; j < edgeCoord; j++) {
                arr[j] = new BoardSpot(this.scene);
            }
            this.board[i] = arr;
        }
    }

    display() {
        // update the spot matrix
        if (this.hasSizeChanged) {
            this.fillBoard();
            console.log(this._generatePrologBoard());
            this.hasSizeChanged = false;
        }

        // display spots and pieces
        let edgeCoord = this.size / 2;

        // Mais 0.5 porque queremos que o translate fique no centro da tile quadrada que vai ser renderizada
        this.scene.translate(-this.size / 2 + 0.5, -this.size / 2 + 0.5, 0);
        for (let i = -edgeCoord; i < edgeCoord; i++) {
            for (let j = -edgeCoord; j < edgeCoord; j++) {

                // check if this is a valid position
                let isValidPosition = false;
                for (let validPositions of this.validMoves) {
                    if (validPositions.i === i && validPositions.j === j) {
                        isValidPosition = true;
                        break;
                    }
                }

                if ((i + j) % 2) {
                    if (isValidPosition) this.highlightSpotDark.apply();
                    else this.darkSpot.apply();
                } else {
                    if (isValidPosition) this.highlightSpotLight.apply();
                    else this.whiteSpot.apply();
                }

                this.scene.registerSpotForPick(this.board[i][j]);
                this.board[i][j].display();
                this.scene.translate(1, 0, 0);
            }
            this.scene.translate(-this.size, 1, 0);
        }
        this.scene.clearPickRegistration();
    }

    incBoardSize() {
        this.size++;
        //this.hasSizeChanged = true;

        //please update mannually
    }

    setBoardSize(newSize) {
        this.size = newSize;
        this.hasSizeChanged = true;
    }

    async readyForFirstGame() {
        let promises = [];
        for (let i = 0; i < 20; i++)
            promises.push(new Promise((resolve) => {
                setTimeout(_ => {
                    this.board[0][0].pieces.push(new MyPiece(this.scene, 'white', 0, 0));
                    resolve();
                }, 50 * i);
            }));



        for (let i = 0; i < 20; i++)
            promises.push(new Promise((resolve) => {
                setTimeout(_ => {
                    this.board[0][1].pieces.push(new MyPiece(this.scene, 'black', 0, 1));
                    resolve();
                }, 50 * 10 + 50 * i);
            }));

        await Promise.all(promises);
    }

    async updateState() {
        if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
            for (let i = 0; i < this.scene.pickResults.length; i++) {
                let obj = this.scene.pickResults[i][0];
                if (obj) {
                    let customId = this.scene.pickResults[i][1];
                    //console.log("Picked object: " + obj + ", with pick id " + customId);
                    if (Math.trunc(customId / 1e3) == 2) {
                        // validate moves
                        if (this.state === GameState.WHITE_PLAYER_TURN || this.state === GameState.WHITE_PLAYER_PICKED_PIECE) {
                            if (obj.colour === 'black') {
                                this.state = GameState.WHITE_PLAYER_TURN;
                                this.scene.game.sgc_setMessage("Choose white pieces!");
                                continue;
                            }
                            this.state = GameState.WHITE_PLAYER_PICKED_PIECE;
                            this.scene.game.sgc_setMessage("[White] Choose the spot");
                        } else if (this.state === GameState.BLACK_PLAYER_TURN || this.state === GameState.BLACK_PLAYER_PICKED_PIECE) {
                            if (obj.colour === 'white') {
                                this.state = GameState.BLACK_PLAYER_TURN;
                                this.scene.game.sgc_setMessage("Choose black pieces!");
                                continue;
                            }
                            this.state = GameState.BLACK_PLAYER_PICKED_PIECE;
                            this.scene.game.sgc_setMessage("[Black] Choose the spot");
                        }

                        // save the picked piece
                        this.lastPickedPiece = obj;
                        await this._getParsedValidMoves().then(result => {
                            this.validMoves = result;
                        });

                    } else if (Math.trunc(customId / 1e3) == 1) {
                        if (this.state == GameState.WHITE_PLAYER_PICKED_PIECE) {
                            let spotCoords = this._pick_id_to_coords(customId);
                            if (this._move_pieces(spotCoords)) {
                                this.state = GameState.BLACK_PLAYER_TURN;
                                this.scene.game.sgc_setMessage("[Black] Your turn");
                            } else {
                                this.scene.game.sgc_setMessage("[White] Invalid move");
                            }
                        } else if (this.state == GameState.BLACK_PLAYER_PICKED_PIECE) {
                            let spotCoords = this._pick_id_to_coords(customId);
                            if (this._move_pieces(spotCoords)) {
                                this.state = GameState.WHITE_PLAYER_TURN;
                                this.scene.game.sgc_setMessage("[White] Your turn");
                            } else {
                                this.scene.game.sgc_setMessage("[Black] Invalid move");
                            }

                        }
                    }
                }
            }
        }
    }

    /**
     * Maps spot pick IDs to board coordinates
     * @param {*} pickId 
     * @return {{i: Number, j: Number}}
     */
    _pick_id_to_coords(pickId) {
        let id = pickId % 1e3; // remove prefix
        let i, j;
        /**
         * (i)
         * |
         * |
         * |       O
         * |
         * |______________ (j)
         */

        i = Math.trunc(id / this.size) - this.size / 2;
        j = id % this.size - this.size / 2;

        return {
            i: i,
            j: j
        };
    }

    /**
     * Moves all pieces above the last clicked piece to new position in the board
     * @param {*} spotCoords
     * @return Returns true if the move is valid, false otherwise 
     */
    _move_pieces(spotCoords) {
        // ensure it's a valid move
        let isValid = false;
        for (let position of this.validMoves) {
            if (position.i == spotCoords.i && position.j == spotCoords.j) {
                isValid = true;
                break;
            }
        }

        if (!isValid) return false;

        let prologBoardStr = this._generatePrologBoard();
        let that = this;

        // get the coordinates of the last picked piece
        let pieceCoords = that.lastPickedPiece.getPosition();
        // get the number of pieces to move
        let n = that._getNumberOfPieces(that.lastPickedPiece);
        // iterate over the stack where the piece belongs
        for (let i = 0; i < n; i++) {
            // the default duration for each piece transition
            let duration = 300;
            // get the top piece of the stack and move it to the new spot
            setTimeout(async function () {
                let top_piece = that.board[pieceCoords.i][pieceCoords.j].pieces.slice(-i - 1)[0]; // short way to get last member of array
                // remove it from stack
                await that._go_up(top_piece, duration);
                let aux = that.board[pieceCoords.i][pieceCoords.j].pieces.pop();
                // set its new position
                aux.setPosition(spotCoords.i, spotCoords.j);
                // add it to the new spot stack
                that.board[spotCoords.i][spotCoords.j].pieces.push(aux);
                await that._come_down(aux, duration);

            }, 0);
        }


        // clear the valid moves
        this.validMoves = [];
        return true;
    }

    /**
     * Requests to prolog the valid moves for current active player and game board and parses it
     */
    async _getParsedValidMoves() {
        let player;
        if (this.state === GameState.WHITE_PLAYER_TURN || this.state === GameState.WHITE_PLAYER_PICKED_PIECE)
            player = 'white';
        else if (this.state === GameState.BLACK_PLAYER_TURN || this.state === GameState.BLACK_PLAYER_PICKED_PIECE)
            player = 'black';

        let prologBoardStr = this._generatePrologBoard();
        let that = this;
        let p = new Promise(resolve => {
            this.scene.game.getValidMoves(player, prologBoardStr).then(function (response) {
                let parsedCoords = that._prolog_coords_to_board(response);
                let pickedPosition = that.lastPickedPiece.getPosition();
                for(let i = 0; i < parsedCoords.length; i++) {
                    let coords = parsedCoords[i];
                    let diff_i = Math.abs(coords.i - pickedPosition.i);
                    let diff_j = Math.abs(coords.j - pickedPosition.j); 
                    if(diff_i*diff_i + diff_j*diff_j !== 5) {
                        // not valid, remove it
                        let index = parsedCoords.indexOf(coords);
                        parsedCoords.splice(index, 1);
                        i--;
                    } 
                }
                resolve(parsedCoords);
            });
        });
        return p;
    }

    _getNumberOfPieces(piece) {
        let pieceCoords = piece.getPosition();
        let pieces = this.board[pieceCoords.i][pieceCoords.j].pieces;
        let top_piece = pieces.slice(-1)[0];
        let c = 0;
        while (top_piece.getId() != piece.getId()) {
            c++;
            top_piece = pieces.slice(-c)[0];
        }
        if (c == 0)
            return 1;
        return c;
    }

    /**
     * calculate incremented value 2
     * @param {float} ov olf value
     * @param {float} nv new value
     */
    civi(ov, nv, i, steps) {
        let res = ((nv - ov) / steps) * ((steps - i));
        return res;
    }

    /**
     * calculate incremented value
     * @param {float} ov olf value
     * @param {float} nv new value
     */
    civ(ov, nv, i, steps) {
        let res = ((nv - ov) / steps) * ((i));
        return res;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async _go_up(piece, duration) {
        let steps = 60;
        for (let i = 0; i < steps; i++) {
            piece.set_position_offset(0, this.civ(0, 20, i, steps), 0);
            await this.sleep(duration / steps);
        }
    }

    async _come_down(piece, duration) {
        let steps = 60;
        for (let i = 0; i < steps; i++) {
            piece.set_position_offset(0, this.civi(0, 20, i, steps), 0);
            await this.sleep(duration / steps);
        }
        piece.set_position_offset(0, 0, 0);
    }

    _generatePrologBoard() {
        let str = "";
        let edgeCoord = this.size / 2;
        for (let i = edgeCoord - 1; i >= -edgeCoord; i--) {
            let rowstr = "[";
            for (let j = -edgeCoord; j < edgeCoord; j++) {
                if (this.board[i][j].pieces.length === 0)
                    rowstr += 'e';
                else if (this.board[i][j].pieces[0].colour === 'white')
                    rowstr += `w-${this.board[i][j].pieces.length}`;
                else
                    rowstr += `b-${this.board[i][j].pieces.length}`;

                if (j !== (edgeCoord - 1)) rowstr += ',';
            }
            str += rowstr + "]";
            if (i !== -edgeCoord) str += ',';
        }

        return `[${str}]`;
    }

    /**
     * Maps prolog coords to game board coords
     * @param {String} coords String in format [x1-y1, x2-y2, ...] 
     */
    _prolog_coords_to_board(coords) {
        let result = [];
        // stip the brackets [ and ]
        coords = coords.substring(1, coords.length - 1);
        for (let pair of coords.split(',')) {
            // extract both coordinate values
            let dashCharIndex = pair.indexOf('-');
            let j = Number(pair.substring(0, dashCharIndex));
            let i = Number(pair.substring(dashCharIndex + 1));
            if (isNaN(i) || isNaN(j)) throw "Failed to parse coordinates: " + pair;

            // map them to game board coordinates
            let mapped_i = (this.size - 1) - i - this.size / 2;
            let mapped_j = j - this.size / 2;
            result.push({
                i: mapped_i,
                j: mapped_j
            });
        }

        return result;
    }
};