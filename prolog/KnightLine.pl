:-[utils].
:- use_module(library(lists)).
%%%%%%%% Pecas %%%%%%

tile(e).

tile(b-X):-
    X \= 0,
    integer(X).

tile(w-X):-
    X \= 0,
    integer(X).

player(b).

player(w).

%%% Boards %%%%%

initialBoard([
        [e,e,e,e],
        [e,b-20,w-20,e],
        [e,e,e,e]
    ]).


midBoard([
        [e,e,e,e,e,e],
        [e,e,e,b-9,w-15,e],
        [e,b-1,w-5,e,e,e],
        [e,e,b-10,e,e,e],
        [e,e,e,e,e,e]
    ]).


finalBoard([
    [e,e,e,b-4,e,e],
    [e,e,w-4,b-4,b-4,b-1],
    [e,e,b-3,w-3,w-3,e],
    [b-2,w-2,w-2,w-2,b-2,e],
    [e,e,w-2,w-2,e,e],
    [e,w-2,e,b-2,e,e]
    ]).


%% print board %%

test_insertBoard2:-
  midBoard(Board),
  display_withcoords(Board).

display_withcoords(Board):-
  insert_Coords(Board,X1),
  display_game(X1).

print_initial_board(Y):-
    initialBoard(X),
    insert_Coords(X,Z),
    display_game(Z).

print_final_board:-
    finalBoard(X),
    display_game(X).

print_mid_board:-
    midBoard(X),
    display_game(X).

display_game([]):-
    nl.


display_game([H|T]):-
    print_line(H),
    nl,
    display_game(T).


print_line([]).
print_line([H|T]):-
        print_cell(H),
        print_line(T).

% print cells where Y < 10 %
print_cell(X-Y):-
    Y < 10,
    translate(X,W),
    write(W),
    write(Y),
    write(' |').

% print cells where Y > 10 %
print_cell(X-Y):-
    Y >= 10,
    translate(X,W),
    write(W),
    write(Y),
    write('|').

print_cell(X):-
    X = e,
    translate(X,W),
    write(W),
    write('|').

print_cell(X):-
  write(X),
  write('  |').

translate(b,'B').
translate(w,'W').
translate(e,'   ').

/*
* This  Returns the value of the board accordingly
* to the position of the pieces of one player.
*Params
*@Board - We need to give the board.
*@Player - We need to give the player we want to check.
*@Value - The value is returned.
*Notes: This predicate is not well implemented
*/
value(Board,Player,Value):-
  findall(X,take_piece(X,Board,Player-_),Results),
  write(Results),
  check_all_pieces(Results,Board,Player,Value).

check_all_pieces([],Board,Value,Player).
check_all_pieces([H|T], Board,Value,Player):-
  check_down(H,Board,0,Player,NewValue1),
  write(NewValue1),
  nl,
  check_right(H,Board,0,Player,NewValue2),
  write(NewValue2),
  nl,
  check_rightdiagonal(H,Board,0,Player,NewValue3),
  write(NewValue3),
  nl,
  check_leftdiagonal(H,Board,0,Player,NewValue4),
  write(NewValue4),
  nl,
  write(Value),
  check_all_pieces(T,Board,Value,Player).

check_down(X-Y,Board,Value,Player,NewValue):-
  Y1 is Y+1,
  take_piece(X-Y1,Board,PieceColor-_),
  PieceColor = Player,
  Value1 is Value+1,
  check_down(X-Y1,Board,Value1,Player,NewValue),
  NewValue = Value1.

check_right(X-Y,Board,Value,Player,NewValue):-
  X1 is X+1,
  take_piece(X1-Y,Board,PieceColor-_),
  PieceColor = Player,
  Value1 is Value+1,
  check_right(X1-Y,Board,Value1,Player),
  NewValue = Value1.

check_rightdiagonal(X-Y,Board,Value,Player,NewValue):-
  X1 is X+1,
  Y1 is Y+1,
  take_piece(X1-Y1,Board,PieceColor-_),
  PieceColor = Player,
  Value1 is Value+1,
  check_ightdiagonal(X1-Y1,Board,Value1,Player),
  NewValue = Value1.

check_leftdiagonal(X-Y,Board,Value,Player,NewValue):-
  X1 is X-1,
  Y1 is Y+1,
  take_piece(X1-Y1,Board,PieceColor-_),
  PieceColor = Player,
  Value1 is Value+1,
  check_leftdiagonal(X1-Y1,Board,Value1,Player),
  NewValue = Value1.

  /*
  * This predicate Returns the player who won the game.
  *Params
  *@Board - We need to give the board.
  *@Winner - The winner is returned as 'b' or 'w'
  */

/*
* This verifies one verifies if someone won in any horizontal Line
* This predicate uses the check_horizontal_win to see if after there
* is two pieces connected in a row. If there is the check_horizontal_win
* will see the rest of the row in order to found the ammount necessary
* of connected pieces for a win.
*/
game_over(Board,Winner):-
  take_piece(X-Y,Board,Color-_),
  X1 is X+1,
  take_piece(X1-Y,Board,ColorHorizontal-_),
  Color = ColorHorizontal,
  check_horizontal_win(X1-Y,Board,ColorHorizontal-_,Winner).

  /*
  * This verifies one verifies if someone won in any diagonal Line (y=-x)
  * This predicate uses the check_diagonal_win to see if after there
  * is two pieces connected in a row. If there is the check_diagonal_win
  * will see the rest of the row in order to found the ammount necessary
  * of connected pieces for a win.
  */
game_over(Board,Winner):-
  take_piece(X-Y,Board,Color-_),
  X1 is X+1,
  Y1 is Y+1,
  take_piece(X1-Y1,Board,ColorHorizontal-_),
  Color = ColorHorizontal,
  check_diagonal_win(X1-Y1,Board,ColorHorizontal-_,Winner).

  /*
  * This verifies one verifies if someone won in any diagonal Line(y=x)
  * This predicate uses the check_diagonal_win to see if after there
  * is two pieces connected in a row. If there is the check_diagonal_win
  * will see the rest of the row in order to found the ammount necessary
  * of connected pieces for a win.
  */
game_over(Board,Winner):-
  take_piece(X-Y,Board,Color-_),
  X1 is X-1,
  Y1 is Y+1,
  take_piece(X1-Y1,Board,ColorHorizontal-_),
  Color = ColorHorizontal,
  check_otherdiagonal_win(X1-Y1,Board,ColorHorizontal-_,Winner).


  /*
  * This verifies one verifies if someone won in any vertical
  * This predicate uses the check_vertical_win to see if after there
  * is two pieces connected in a row. If there is the check_vertical_win
  * will see the rest of the collumn in order to found the ammount necessary
  * of connected pieces for a win.
  */
game_over(Board,Winner):-
  take_piece(X-Y,Board,Color-_),
  Y1 is Y+1,
  take_piece(X-Y1,Board,ColorHorizontal-_),
  Color = ColorHorizontal,
  check_vertical_win(X-Y1,Board,ColorHorizontal-_,Winner).


/*
* The next 4 following preditaces are used to assist the game_over predicate
* to check if there is more two pieces adjacent in a row
*/
check_vertical_win(X-Y,Board,Color-_,ColorWon):-
  Y1 is Y+1,
  take_piece(X-Y1,Board,ColorCheck-_),
  Color = ColorCheck,
  Y2 is Y+1,
  take_piece(X-Y2,Board,ColorCheck2-_),
  Color = ColorCheck2,
  ColorWon is Color.

check_diagonal_win(X-Y,Board,Color-_,ColorWon):-
  X1 is X+1,
  Y1 is Y+1,
  take_piece(X1-Y1,Board,ColorCheck-_),
  Color = ColorCheck,
  X2 is X1+1,
  Y2 is Y1+1,
  take_piece(X2-Y2,Board,ColorCheck2-_),
  Color = ColorCheck2,
  ColorWon is Color.

check_otherdiagonal_win(X-Y,Board,Color-_,ColorWon):-
  X1 is X-1,
  Y1 is Y+1,
  take_piece(X1-Y1,Board,ColorCheck-_),
  Color = ColorCheck,
  X2 is X1-1,
  Y2 is Y1+1,
  take_piece(X2-Y2,Board,ColorCheck2-_),
  Color = ColorCheck2,
  ColorWon = Color.

check_horizontal_win(X-Y,Board,Color-_,ColorWon):-
  X1 is X+1,
  take_piece(X1-Y,Board,ColorCheck-_),
  Color = ColorCheck,
  X2 is X1+1,
  take_piece(X2-Y,Board,ColorCheck2-_),
  Color = ColorCheck2,
  ColorWon = Color.


% Trata de fazer o move de tiles de uma origem para um destino
% Trata também de assegurar que a jogada é valida
%
% @param Move - Uma lista do tipo [player, source col-row, destination col-row, number of tile]
% For example, [b, 1-1, 3-0, 10], moves 10 white tiles from row 1, col 1 to row 0 and col 3
% @param Board - O tabuleiro atual
% @param NewBoard - O tabuleiro resultante após a jogada
move(Move,Board,NewBoard):-
  nth0(0,Move,PlayerColor),
  valid_moves(Board,PlayerColor,List),
  nth0(2,Move,Destiny),
  member(Destiny,List),
  nth0(1,Move,Source),
  nth0(3,Move,Number),
  move_piece(Source,Destiny,Number,Board,NewBoard).

/*
* Checks all the valid moves in a board for the given player.
*/
valid_moves(Board,Player,ListOfMoves):-
  findall(X,(take_piece(X,Board,Player-Y), Y>1),Results),
  check_forall(Results,Board,NewMoves,[]),
  remove_results(Board,NewMoves,NewMoves,ListOfMoves).

/*
*Remove the positions in the board already occupied by another piece.
*/
remove_results(Board,[],List,List).
remove_results(Board,[H|T],ResultList,List):-
  take_piece(H,Board,Piece),
  Piece \= e ->
  delete(ResultList,H,NewList),
  remove_results(Board,T,NewList,List),
  List = Newlist;
  remove_results(Board,T,ResultList,List).

/*
* This predicate is used get all the possible moves for
* the position of every piece.
*/
check_forall([], _, Acc, Acc).
check_forall([H|T], Board, ListOfMoves, Acc):-
    	findall(X,(moves(H,X,Board), X \=e), Results),
    	append(Results, Acc, Acc1),
    	check_forall(T, Board, ListOfMoves, Acc1).


/*
* The moves predicate is used to get all the possible moves for one position,
* each predicate also checks if the move is legal by checking if there is an
* adjacent piece in the destiny position of the board.
*/
moves(X1-Y1,X2-Y2,Board):-
    X2 is X1+2,
    Y2 is Y1-1,
    findall(X,(check_adjacent_coords(Board,X2-Y2,X), X \=e), Results),
    Results \= [].

moves(X1-Y1,X2-Y2,Board):-
    X2 is X1+2,
    Y2 is Y1+1,
    findall(X,(check_adjacent_coords(Board,X2-Y2,X), X \=e), Results),
    Results \= [].

moves(X1-Y1,X2-Y2,Board):-
    X2 is X1-1,
    Y2 is Y1-2,
    findall(X,(check_adjacent_coords(Board,X2-Y2,X), X \=e), Results),
    Results \= [].

moves(X1-Y1,X2-Y2,Board):-
    X2 is X1-2,
    Y2 is Y1-1,
    findall(X,(check_adjacent_coords(Board,X2-Y2,X), X \=e), Results),
    Results \= [].

moves(X1-Y1,X2-Y2,Board):-
    X2 is X1-2,
    Y2 is Y1+1,
    findall(X,(check_adjacent_coords(Board,X2-Y2,X), X \=e), Results),
    Results \= [].

moves(X1-Y1,X2-Y2,Board):-
    X2 is X1-1,
    Y2 is Y1+2,
    findall(X,(check_adjacent_coords(Board,X2-Y2,X), X \=e), Results),
    Results \= [].

moves(X1-Y1,X2-Y2,Board):-
    X2 is X1+1,
    Y2 is Y1+2,
    findall(X,(check_adjacent_coords(Board,X2-Y2,X), X \=e), Results),
    Results \= [].

moves(X1-Y1,X2-Y2,Board):-
    X2 is X1+1,
    Y2 is Y1-2,
    findall(X,(check_adjacent_coords(Board,X2-Y2,X), X \=e), Results),
    Results \= [].

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%% PLAYER INPUT %%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Handles the first interaction with the white tiles player
% Because the source tile location is known and the player can only move a single tile, the predicate only asks for the destination
% @param RowDst-ColDst RowDst is the destination row, starting in 0, and ColDst the destination column, starting in 0
askWhitePlayerFirstInput(RowDst-ColDst):-
	write('======= White Player =======\n'),
	% ask the destination coordinates %
	write('[To] Row ? '), getNumber(RowDst),
	write('[To] Column ? '), getNumber(ColDst).

% Handles user input for each game round. For the first round there are more specific predicates because it is a particular round
% @see askWhitePlayerFirstInput
% @see askBlackPlayerFirstInput
% 
% @param Player The player, either 'b'(lack) or 'w'(hite)
% @param RowSrc-ColSrc is the source row, starting in 0, and ColDColSrc the source column, starting in 0
% @param Num The number of tiles to be moved
% @param RowDst-ColDst RowDst is the destination row, starting in 0, and ColDst the destination column, starting in 0
askPlayerInput(Player, RowSrc-ColSrc, Num, RowDst-ColDst):-
	% Output the current player %
	write('======= '),
	( (Player = b, write('Black')) ; (Player = w, write('White')) ),
	write(' Player ======='), nl,
	% ask the source tile stack coordinates % 
	write('[From] Row ? '), getNumber(RowSrc),
	write('[From] Column ? '), getNumber(ColSrc),
	% ask how many tiles to be moved %
	write('How many tiles to be moved ? '), getNumber(Num),
	% ask the destination coordinates %
	write('[To] Row ? '), getNumber(RowDst),
	write('[To] Column ? '), getNumber(ColDst).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%% GAME ROUNDS %%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Handles the first white player round, which is a special case
% @param Board - The inital game board
% @param NewBoard - The resultant board
gameWhitePlayerFirstRound(Board, NewBoard):-
	% display current game state %
	display_withcoords(Board),
	% ask the input for white tiles player %
	askWhitePlayerFirstInput(RowDst_White-ColDst_White),
	move([w, 2-1, ColDst_White-RowDst_White, 1], Board, Board1) -> (
		stretchBoard(Board1, NewBoard)
	) ;  (
		clear_console,
		write('Error: Invalid move! Try again white player\n'),
		gameWhitePlayerFirstRound(Board, NewBoard)
	).

% Handles the white player moves. 
% It displays the current game board, asks the required input, attemps to move the tiles.
% If the input is invalid it asks again. 
% If not it also stretches the game board
% @param Board - The current game board
% @param NewBoard - The resultant board after the move
gameWhitePlayer(Board, NewBoard):-
	% display current game state %
	display_withcoords(Board),
	% ask the input for white tiles player %
	askPlayerInput(w, RowSrc_White-ColSrc_White, NumWhite, RowDst_White-ColDst_White),
	move([w, ColSrc_White-RowSrc_White, ColDst_White-RowDst_White, NumWhite], Board, Board1) -> (
		stretchBoard(Board1, NewBoard)
	) ;  (
		clear_console,
		write('Error: Invalid move! Try again white player\n'),
		gameWhitePlayer(Board, NewBoard)
	).

% Handles the black player moves. 
% It displays the current game board, asks the required input, attemps to move the tiles.
% If the input is invalid it asks again. 
% If not it also stretches the game board
% @param Board - The current game board
% @param NewBoard - The resultant board after the move
gameBlackPlayer(Board, NewBoard):-
	% display current game state %
	display_withcoords(Board),
	% ask the input for white tiles player %
	askPlayerInput(b, RowSrc_Black-ColSrc_Black, NumBlack, RowDst_Black-ColDst_Black),
	move([b, ColSrc_Black-RowSrc_Black, ColDst_Black-RowDst_Black, NumBlack], Board, Board1) -> (
		stretchBoard(Board1, NewBoard)
	) ; (
		clear_console,
		write('Error: Invalid move! Try again black player\n'),
		gameBlackPlayer(Board, NewBoard)
	).


choose_move(Board,Level,Move):-
	Level = 1,
	create_randomMove(Board,NewMove,b),
	nth0(0,NewNewMove,b,NewMove),
	random_pieceNumber(Board,NewNewMove,Number),
	nth0(3,Move,Number,NewNewMove).

gameBlackComputerEasy(Board,NewBoard):-
  	choose_move(Board,1,Move),
  	move(Move,Board,NewBoard).
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%% GAMES MODE %%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Handles the game rounds... 
% TODO still doesn't check if some player won
% gamePlayerVPlayer(Board):-
% 	gameBlackPlayer(Board, NewBoard), clear_console,
% 	gameWhitePlayer(NewBoard, NewNewBoard), clear_console,
% 	gamePlayerVPlayer(NewNewBoard).

gamePlayerVPlayer(Board):-
	gameBlackPlayer(Board, NewBoard), clear_console,
	\+ game_over(NewBoard, _),
	gameWhitePlayer(NewBoard, NewNewBoard), clear_console,
	\+ game_over(NewNewBoard, _),
	gamePlayerVPlayer(NewNewBoard).

gamePlayerVComputer(Board):-
  	gameBlackComputerEasy(Board,NewBoard),
  	gameWhitePlayer(NewBoard,NewNewBoard),
  	gamePlayerVComputer(NewNewBoard).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%% INITIALIZE GAMES %%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Initializes a Player VS Player game
startPlayerVPlayer:-
	% initialize the board %
	initialBoard(Board),
	gameWhitePlayerFirstRound(Board, NewBoard), clear_console,
	\+ gamePlayerVPlayer(NewBoard) -> write(NewBoard).

startPlayerVComputer:-
    clear_console,
    initialBoard(Board),
	gameWhitePlayerFirstRound(Board, NewBoard), clear_console,
    gamePlayerVComputer(NewBoard).