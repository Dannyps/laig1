:-[utils].
:-['KnightLine'].

test_isRowEmpty_board([
		[e, e, e],
		[e, e, w-1],
		[b-5, e, e],
		[e, b-1, e]
	]).

test_isRowEmpty:-
	test_isRowEmpty_board(X),
	isRowEmpty(X, 0),
	write('Passed teste 1\n'),
	\+ isRowEmpty(X, 1),
	write('Passed teste 2\n'),
	\+ isRowEmpty(X, 2),
	write('Passed teste 3\n'),
	\+ isRowEmpty(X, 3),
	write('Passed teste 4\n'),
	\+ isRowEmpty(X, 50),
	write('Passed teste 5\n').

test_isColumnEmpty_board([
		[e, e, e, b-2],
		[e, e, w-1, e],
		[e, b-5, e, e]
	]).

test_isColumnEmpty:-
	test_isColumnEmpty_board(X),
	isColumnEmpty(X, 0),
	write('Passed teste 1\n'),
	\+ isColumnEmpty(X, 1),
	write('Passed teste 2\n'),
	\+ isColumnEmpty(X, 2),
	write('Passed teste 3\n'),
	\+ isColumnEmpty(X, 3),
	write('Passed teste 4\n').


% (not realistic for the game) %
test_stretchBoard_board1([[e, 1-b, e],[3-w, e, e],[e, e, 4-w],[e, 2-b, e]]).
% add only a top row %
test_stretchBoard_board2([[e,1-w,e], [e,e,e]]).
% add a top row and left col %
test_stretchBoard_board3([[1-w,e,e], [e,e,e]]).
% add a top row and right col %
test_stretchBoard_board4([[e,e,1-w], [e,e,e]]).
% add only a left col %
test_stretchBoard_board5([[e,e,e], [1-w,e,e], [e,e,e]]).

test_gameOver1([
	[e,e,w-1,e,b-3], % move one of this 3-b
	[e,b-1,e,b-1,b-1] % to the second empty
	]).

test_gameOver2([
	[e,e,w-5,e,b-3], % move one of this 3-b
	[e,b-1,e,b-1,b-1], % to the second empty
	[e,e,w-1,w-1,w-1]
	]).

test_gameOver3([
	[e,e,w-5,e,b-3], % move one of this 3-b
	[e,b-2,b-3,b-1,b-1], % to the second empty
	[e,e,w-1,w-1,w-1]
	]).

test_gamePlayerVPlayer(X):-
	\+ gamePlayerVPlayer(X) -> write(X).