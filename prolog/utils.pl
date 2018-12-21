:- use_module(library(lists)).


%%%%% matrix utilities


createEmptyRow(BoardWith,Row):-
	createEmptyRow(BoardWith, [], Row).
createEmptyRow(0,Row,Row).
createEmptyRow(BoardWidth,Row,NewRow):-
	BoardWidth \= 0,
	NewBoardWidth is BoardWidth - 1,
	append(Row,[e],Aux),
	createEmptyRow(NewBoardWidth,Aux,NewRow).

appendEmptyRowTop(Board, NewBoard):-
	\+ isRowEmpty(Board,0) -> (
		get_width(Board,HorizontalLength),
		createEmptyRow(HorizontalLength, EmptyRow),
		append([EmptyRow], Board, NewBoard)
	) ; Board = NewBoard.

appendEmptyRowBottom(Board, NewBoard):-
	get_height(Board, Height), IndexLastRow is Height - 1,
	\+ isRowEmpty(Board, IndexLastRow) -> (
		get_width(Board,HorizontalLength),
		createEmptyRow(HorizontalLength, EmptyRow),
		append(Board, [EmptyRow], NewBoard)
	) ; Board = NewBoard.

appendEmptyColumnLeft_([], []).
appendEmptyColumnLeft_([H|T], [Hnew|Tnew]):-
	append([e], H, Hnew),
	appendEmptyColumnLeft_(T, Tnew).
appendEmptyColumnLeft(Board, NewBoard):-
	\+ isColumnEmpty(Board, 0) -> (
		appendEmptyColumnLeft_(Board,NewBoard)
	) ; Board = NewBoard.

appendEmptyColumnRight_([], []).
appendEmptyColumnRight_([H|T], [Hnew|Tnew]):-
	append(H, [e], Hnew),
	appendEmptyColumnRight_(T, Tnew).

appendEmptyColumnRight(Board,NewBoard):-
	get_width(Board, Width), IndexLastCol is Width - 1,
	\+ isColumnEmpty(Board, IndexLastCol) -> (
		appendEmptyColumnRight_(Board,NewBoard)
	) ; Board = NewBoard.

isRowEmpty([H|T], N):-
	% find the row in the matrix %
	nth0(N, [H|T], Row),
	% check if all vals are 'e' %
	isRowEmpty(Row).

isRowEmpty([]).

isRowEmpty([H|T]):-
	H = e,
	isRowEmpty(T).

isColumnEmpty([], _).
isColumnEmpty([H|T], N):-
	% H is a list, the first matrix row %
	nth0(N, H, Tile),
	Tile = e,
	isColumnEmpty(T, N).

stretchBoard(Board, NewBoard):-
	appendEmptyRowTop(Board, Board1),
	appendEmptyRowBottom(Board1, Board2),
	appendEmptyColumnLeft(Board2, Board3),
	appendEmptyColumnRight(Board3, NewBoard).

%%%%%%%%%%% until here

%%% insert coords

insert_Coords(Board,NewBoard):-
    proper_length(Board,VerticalLength),
    insert_vertical(Board,VerticalLength,0,FinalBoard),
    last(FinalBoard,List),
    proper_length(List,HorizontalLength),
    create_hindex_list([],HorizontalLength,0,FinalList),
    nth0(0,NewBoard,FinalList,FinalBoard).



insert_vertical(FinalBoard,Size,Size,FinalBoard).
insert_vertical(Board,Size,Index,FinalBoard):-
  Index < Size,
  nth0(Index,Board,Elem),
  nth0(0,NewElem,Index,Elem),
  replace_item(Board,Index,NewElem,NewBoard),
  Index1 is Index+1,
  insert_vertical(NewBoard,Size,Index1,FinalBoard).




create_hindex_list(FinalList,Size,Size,FinalList).
create_hindex_list(List,Size,Index,FinalList):-
    Index < Size,
    Index = 0 ->
    nth0(Index,Newlist,e,List),
    Index1 is Index+1,
    create_hindex_list(Newlist,Size,Index1,FinalList);
    Index2 is Index-1,
    nth0(Index,Newlist,Index2,List),
    Index1 is Index+1,
    create_hindex_list(Newlist,Size,Index1,FinalList),
    FinalList = NewList.


%%% para ter um elemento de uma certa posição numa list
get_elem(Board,Index,Elem):-
  nth0(Index,Board,Elem).
%%% n esta a ser usada atm, semelhante à anterior
cicle_throw_pos([H|T],Number,CurrentEl):-
    Number \= 0 ->
    Number1 is Number - 1,
    cicle_throw_pos(T,Number1,CurrentEl);
    CurrentEl = H.
%%%% primeiro arg coordenadas segundo board e terceiro peça, com as coord obtemos peça e com a peça obtemos as coordenadas
take_piece(X1-Y1,Board,Piece):-
  get_elem(Board,Y1,Element),
  get_elem(Element,X1,Piece).

%% devolve uma peça dando outra
createPiece(X-Y,NewPiece):-
    NewPiece = X-Y.

/*
* Replaces an element in the a certain position of list
*/
replace_item([_|T],0,Element,[Element|T]).
replace_item([H|T],Index,Element,[H|R]):-
  Index > -1,
  NewIndex is Index-1,
  replace_item(T,NewIndex,Element,R).

/*
* Replaces an element in the a certain position of the board
*/
replace_in_matrix(X1-Y1,Board,Element,NewBoard):-
  get_elem(Board,Y1,ElemList),
  replace_item(ElemList,X1,Element,NewList),
  replace_item(Board,Y1,NewList,NewBoard).


  /*
  * Moves a piece to an empty cell in the board,
  * and returns the result of it as another board.
  */
move_piece(X1-Y1,X2-Y2,Number,Board,FinalBoard):-
	take_piece(X1-Y1,Board,PiecePlayer-PieceNumber),
	Number < PieceNumber,
	NewPieceNumber is PieceNumber-Number,
	replace_in_matrix(X1-Y1,Board,PiecePlayer-NewPieceNumber,NewBoard),
	take_piece(X2-Y2,Board,Piece),
	Piece = e,
	replace_in_matrix(X2-Y2,NewBoard,PiecePlayer-Number,FinalBoard).

/*
* Returns the Width or/and the Height of a matrix
*/
get_list_size(List,Width,Height):-
  proper_length(List,Height),
  last(List,Last),
  proper_length(Last,Width).

/*
* Returns the Width of a matrix
*/
get_width(List,Width):-
  get_list_size(List,Width,_).

/*
* Returns the Height of a matrix
*/
get_height(List,Height):-
  get_list_size(List,_,Height).


/*
*verifies which piece is in adjacent positions to the coordinates given
*/
verify_left(X-Y,Board,Piece):-
  X1 is X-1,
  take_piece(X1-Y,Board,Piece).

verify_right(X-Y,Board,Piece):-
  X1 is X+1,
  take_piece(X1-Y,Board,Piece).

verify_up(X-Y,Board,Piece):-
  Y1 is Y-1,
  take_piece(X-Y1,Board,Piece).

verify_down(X-Y,Board,Piece):-
  Y1 is Y+1,
  take_piece(X-Y1,Board,Piece).

verify_downright(X-Y,Board,Piece):-
  Y1 is Y+1,
  X1 is X+1,
  take_piece(X1-Y1,Board,Piece).

verify_downleft(X-Y,Board,Piece):-
  Y1 is Y+1,
  X1 is X-1,
  take_piece(X1-Y1,Board,Piece).

verify_topleft(X-Y,Board,Piece):-
  Y1 is Y-1,
  X1 is X-1,
  take_piece(X1-Y1,Board,Piece).

verify_topright(X-Y,Board,Piece):-
  Y1 is Y-1,
  X1 is X+1,
  take_piece(X1-Y1,Board,Piece).

/*
* Checks if there is an adjacent piece to the PieceOne on the left.
*/
check_adjacent(Board,PieceOne,PieceTwo):-
  take_piece(X-Y,Board,PieceOne),
  verify_left(X-Y,Board,Piece),
  Piece = PieceTwo.


/*
* Checks if there is an adjacent piece to the PieceOne on the right.
*/
check_adjacent(Board,PieceOne,PieceTwo):-
  take_piece(X-Y,Board,PieceOne),
  verify_right(X-Y,Board,Piece),
  Piece = PieceTwo.

/*
* Checks if there is an adjacent piece to the PieceOne above it.
*/
check_adjacent(Board,PieceOne,PieceTwo):-
  take_piece(X-Y,Board,PieceOne),
  verify_up(X-Y,Board,Piece),
  Piece = PieceTwo.

/*
* Checks if there is an adjacent piece to the PieceOne below it.
*/
check_adjacent(Board,PieceOne,PieceTwo):-
  take_piece(X-Y,Board,PieceOne),
  verify_down(X-Y,Board,Piece),
  Piece = PieceTwo.

/*
* Checks if there is an adjacent piece to the PieceOne on the right down corner.
*/
check_adjacent(Board,PieceOne,PieceTwo):-
  take_piece(X-Y,Board,PieceOne),
  verify_downright(X-Y,Board,Piece),
  Piece = PieceTwo.

/*
* Checks if there is an adjacent piece to the PieceOne on the left down corner.
*/
check_adjacent(Board,PieceOne,PieceTwo):-
  take_piece(X-Y,Board,PieceOne),
  verify_downleft(X-Y,Board,Piece),
  Piece = PieceTwo.

/*
* Checks if there is an adjacent piece to the PieceOne on the left top corner.
*/
check_adjacent(Board,PieceOne,PieceTwo):-
  take_piece(X-Y,Board,PieceOne),
  verify_topleft(X-Y,Board,Piece),
  Piece = PieceTwo.

/*
* Checks if there is an adjacent piece to the PieceOne on the right top corner.
*/
check_adjacent(Board,PieceOne,PieceTwo):-
  take_piece(X-Y,Board,PieceOne),
  verify_topright(X-Y,Board,Piece),
  Piece = PieceTwo.

/*
* The next 6 predicates do the same as the the 6 before this ones but
* they check if there is an adjacent piece to the coordinates given.
*/

check_adjacent_coords(Board,X-Y,Piece):-
  verify_right(X-Y,Board,Piece).

check_adjacent_coords(Board,X-Y,Piece):-
  verify_up(X-Y,Board,Piece).

check_adjacent_coords(Board,X-Y,Piece):-
  verify_down(X-Y,Board,Piece).

check_adjacent_coords(Board,X-Y,Piece):-
  verify_downright(X-Y,Board,Piece).

check_adjacent_coords(Board,X-Y,Piece):-
  verify_downleft(X-Y,Board,Piece).

check_adjacent_coords(Board,X-Y,Piece):-
  verify_topleft(X-Y,Board,Piece).

check_adjacent_coords(Board,X-Y,Piece):-
  verify_topright(X-Y,Board,Piece).

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%% BOT UTILITIES  %%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
random_pieceNumber(Board,Move,Number):-
	nth0(1,Move,Elem),
	take_piece(Elem,Board,_-PieceNumber),
	random(1,PieceNumber,Number).


create_randomMove(Board,Move,Player):-
    findall(X,take_piece(X,Board,Player-_),Results),
    proper_length(Results,Length),
    random(0,Length,RandomStart),
    nth0(RandomStart,Results,Elem),
    findall(X,(moves(Elem,X,Board), X \=e), NewResults),
    proper_length(NewResults,NewLength),
    random(0,Length,RandomEnd),
    nth0(RandomEnd,NewResults,NewElem),
    nth0(0,InitialMove,Elem,[]),
    nth0(1,Move,NewElem,InitialMove).

create_move(Player,InitialCoords,FinalCoords,Number,Move):-
  	Move = [Player,InitialCoords,FinalCoords,Number].

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%% CONSOLE  %%%%%%%%%%%%%%%%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

% Clears the console
clear_console:-
	clear_console(30),!.

clear_console(0).
clear_console(X):-
	nl,
	X1 is X-1,
	clear_console(X1).

% Waits for the user to hit 'Enter'
enter_toContinue:-
	write('Press Enter.'),nl,
	continue,!.

continue:-
	get_char(_).

% Gets a single character from stream
getChar(Input):-
  get_char(Input),
	get_char(_).

% Gets a single digit from stream. This predicate ensures the input is a digit between 0 and 9
getInt(Input):-
	get_code(TempInput),
	% compute the decimal digit by subtracting 48, the ASCII code for number 0 %
	Input is TempInput - 48,
	% check the range. If Input isn't in [0,9], than the input was any other char %
	Input >= 0, Input =< 9.

% Gets numbers from the user. It reads numbers until a non-digit character is found
% Thus, if the input users types 123abc, it parses 123, reads 'a' which is invalid, but 'bc' remains in the buffer
getNumber(Number):-
	getInt(Input) -> (
		getNumber(RemainderNumber) -> (
			getNumberLen(RemainderNumber, L),
			Aux = integer(Input*exp(10,L)),
			Number is Aux + RemainderNumber
		) ; (
			Number = Input	
		)
	).

/* Computes how many digits a number has */
getNumberLen(Number, Size):-
	getNumberLen_(Number, 0, Size).
getNumberLen_(Number, CurrentSize, Size):-
	Number < 10, Number >= 0,
	Size is CurrentSize + 1.
getNumberLen_(Number, CurrentSize, Size):-
	Number > 9,
	Aux is Number / 10,
	NewSize is CurrentSize + 1,
	getNumberLen_(Aux, NewSize, Size).
