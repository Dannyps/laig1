/**
 * MyRectangle
 * @param gl {WebGLRenderingContext}
 * @constructor
 */
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
    };

    fillBoard() {
        let edgeCoord = this.size / 2;
        for (let i = -edgeCoord; i < edgeCoord; i++) {
            let arr = [];
            for (let j = -edgeCoord; j < edgeCoord; j++) {
                arr[j] = new BoardSpot(this.scene);
                console.log(arr[j]);
            }
            this.board[i] = arr;
        }
        console.log(this.board);
    }

    display() {
        // update the spot matrix
        if (this.hasSizeChanged) {
            this.fillBoard();
            this.hasSizeChanged = false;
        }
        let edgeCoord = this.size / 2;

        // Mais 0.5 porque queremos que o translate fique no centro da tile quadrada que vai ser renderizada
        this.scene.translate(-this.size / 2 + 0.5, -this.size / 2 + 0.5, 0);
        for (let i = -edgeCoord; i < edgeCoord; i++) {
            for (let j = -edgeCoord; j < edgeCoord; j++) {
                if ((i + j) % 2)
                    this.darkPlace.apply();
                else
                    this.whitePlace.apply();
                this.scene.myRegisterForPick(this.board[i][j], 1000);
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

    readyForFirstGame() {
        for (let i = 0; i < 20; i++)
            this.board[0][0].pieces.push(new MyPiece(this.scene, 'white'));

        for (let i = 0; i < 20; i++)
            this.board[0][1].pieces.push(new MyPiece(this.scene, 'black'));
    }
};