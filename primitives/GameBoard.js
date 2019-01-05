/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */

// wanna be Enum in JS
const GameState = {
    WHITE_PLAYER_TURN:0,
    BLACK_PLAYER_TURN:1,
    WHITE_PLAYER_PICKED_PIECE:2,
    BLACK_PLAYER_PICKED_PIECE:3,
    SPOT_PICKED: 4
};

class GameBoard extends CGFobject {
    constructor(scene, initialSize) {
        super(scene);
        this.scene = scene;
        this.size = initialSize;

        this.whitePlace = new CGFappearance(scene);
        this.whitePlace.setAmbient(1, 1, 1, 1);

        this.darkPlace = new CGFappearance(scene);
        this.darkPlace.setAmbient(0, 0, 0, 1);

        this.board = []; // matrix
        this.hasSizeChanged = true; // if true, build a new board, else use the current board

        this.state = GameState.WHITE_PLAYER_TURN;
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
                if ((i + j) % 2)
                    this.darkPlace.apply();
                else
                    this.whitePlace.apply();
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

    updateState() {
        if (this.scene.pickResults != null && this.scene.pickResults.length > 0) {
            for (let i = 0; i < this.scene.pickResults.length; i++) {
                let obj = this.scene.pickResults[i][0];
                if (obj) {
                    let customId = this.scene.pickResults[i][1];
                    //console.log("Picked object: " + obj + ", with pick id " + customId);
                    if (Math.trunc(customId / 1e3) == 2) {
                        console.log("Picked tile");
                        if(this.state === GameState.WHITE_PLAYER_TURN)
                            this.state = GameState.WHITE_PLAYER_PICKED_PIECE;
                        else
                            this.state = GameState.BLACK_PLAYER_PICKED_PIECE;

                        this.lastPickedPiece = obj;
                    } else if (Math.trunc(customId / 1e3) == 1) {
                        if(this.state == GameState.WHITE_PLAYER_PICKED_PIECE) {
                            let spotCoords = this._pick_id_to_coords(customId);
                            this._move_pieces(spotCoords);
                            this.state = GameState.BLACK_PLAYER_TURN;
                        } else if (this.state == GameState.BLACK_PLAYER_PICKED_PIECE) {
                            let spotCoords = this._pick_id_to_coords(customId);
                            this._move_pieces(spotCoords);
                            this.state = GameState.WHITE_PLAYER_TURN;
                        }

                        console.log("Picked board spot");
                        console.log(this._generatePrologBoard());
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
     */
    _move_pieces(spotCoords) {
        //this.scene.game.getValidMoves('white').then(function(response) {});
        // get the coordinates of the last picked piece
        let pieceCoords = this.lastPickedPiece.getPosition();
        // iterate over the stack where the piece belongs
        while (1) {
            // get the top piece of the stack and move it to the new spot
            let top_piece = this.board[pieceCoords.i][pieceCoords.j].pieces.slice(-1)[0]; // short way to get last member of array
            // remove it from stack
            let aux = this.board[pieceCoords.i][pieceCoords.j].pieces.pop();
            // set its new position
            aux.setPosition(spotCoords.i, spotCoords.j);
            // add it to the new spot stack
            this.board[spotCoords.i][spotCoords.j].pieces.push(aux);
            // if the moved piece is the clicked piece, stop
            if (top_piece.getId() == this.lastPickedPiece.getId())
                break;
        }
    }

    _generatePrologBoard() {
        let str = "";
        let edgeCoord = this.size / 2;
        for (let i = edgeCoord-1; i >= -edgeCoord; i--) {
            let rowstr = "[";
            for (let j = -edgeCoord; j < edgeCoord; j++) {
                if(this.board[i][j].pieces.length === 0)
                    rowstr += 'e';
                else if (this.board[i][j].pieces[0].colour === 'white')
                    rowstr += `w-${this.board[i][j].pieces.length}`;
                else
                    rowstr += `b-${this.board[i][j].pieces.length}`;

                if(j !== (edgeCoord-1)) rowstr += ',';
            }
            str += rowstr + "]";
            if(i !== -edgeCoord) str += ',';
        }

        return `[${str}]`;
    }
};