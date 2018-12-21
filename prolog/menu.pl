%%%%imports
:-['KnightLine'].
:-['utils'].
:-['server'].
:- use_module(library(lists)).
:- use_module(library(random)).

%% code

main_menu:-
  print_MainMenu,
  getChar(Input),
  (
  Input = '1' -> select_mode,main_menu;
  Input = '2';
  nl,
  write('Please choose a valid option.'), nl,
  enter_toContinue, nl,
  main_menu
  ).


print_MainMenu:-
  clear_console,
  write('---------------------------------------'),nl,
  write('---------------------------------------'),nl,
  write('-          KnightLine Line            -'),nl,
  write('-        Option 1: Play Game          -'),nl,
  write('-        Option 2: Exit Game          -'),nl,
  write('---------------------------------------'),nl,
  write('---------------------------------------'),nl.



select_mode:-
  printGameMenu,
  getChar(Input),
  (
  Input = '1' -> startPlayerVPlayer;
  Input = '2' -> startPlayerVComputer;
  Input = '3';
  nl,
  write('Please choose a valid option.'), nl,
  enter_toContinue, nl,
  select_mode
  ).



printGameMenu:-
  clear_console,
  write('---------------------------------------'),nl,
  write('---------------------------------------'),nl,
  write('-          Select Mode                -'),nl,
  write('-      Option 1: Player Vs Player     -'),nl,
  write('-      Option 2: Player Vs Computer   -'),nl,
  write('-      Option 3: Go Back to Menu      -'),nl,
  write('---------------------------------------'),nl,
  write('---------------------------------------'),nl.