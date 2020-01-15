import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

function Square(props) {
    const bgColor = props.highlighted ? "yellow" : "white";
    console.log(props.highlighted)
    return (
        <button key={props.value} className="square" onClick={props.onClick} style={{ backgroundColor: bgColor }}>
            {props.value}
        </button>
    );
}

class Board extends React.Component {

    renderSquare(i) {
        const currentSquare = this.props.squares[i];
        let highlighted;

        console.log("winningline: " + this.props.winningLine + " current square index: " + i);
        if (this.props.winningLine) {
            highlighted = this.props.winningLine.includes(i);
        }

        return (
            <Square key={i}
                value={currentSquare}
                highlighted={highlighted}
                onClick={() => this.props.onClick(i)}
            />
        );
    }

    render() {
        let rows = [];
        let count = 0;
        for (let x = 0; x < 3; x++) {
            // new row
            let row = [];
            for (let y = 0; y < 3; y++) {
                // new square
                row.push(this.renderSquare(count));
                count++;
            }
            rows.push(row);
        }

        return [<div key="1" className="board-row">{rows[0]}</div>,
        <div key="2" className="board-row">{rows[1]}</div>,
        <div key="3" className="board-row">{rows[2]}</div>];
    }
}

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [7, 8, 9],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return {
                winningLine: lines[i],
                winnerToken: squares[a]
            };
        }
    }

    return null;
}

class Game extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            history: [{
                squares: Array(9).fill(null),
                coords: [null, null],
            }],
            stepNumber: 0,
            xIsNext: true,
            sortAscending: true,
            winnerInfo: null
        }
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();

        if (this.state.winnerInfo || squares[i]) {
            return;
        }

        squares[i] = this.state.xIsNext ? 'X' : 'O';
        const winnerInfo = calculateWinner(squares);

        this.setState({
            history: history.concat([{
                squares: squares,
                coords: [i % 3, Math.floor(i / 3)],
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
            winnerInfo: winnerInfo,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: (step % 2) === 0,
            winnerInfo: null,
        });
    }

    toggleMoveSorting() {
        this.setState({
            sortAscending: !this.state.sortAscending,
        })
    }

    render() {
        const history = this.state.history.slice();
        const current = history[this.state.stepNumber];

        if (!this.state.sortAscending) {
            history.reverse();
        }

        const moves = history.map((step, move) => {

            const desc = move ?
                "Go to move # " + move + ' (' + history[move].coords + ')' :
                "Go to game start";

            let fontWeight = (move === this.state.stepNumber) ? "bold" : "normal";

            return (
                <li key={move} style={{ fontWeight: fontWeight }}>
                    <button onClick={() => this.jumpTo(move)}>{desc}</button>
                </li>
            )
        });

        let status;
        let winningLine;
        if (this.state.winnerInfo) {
            status = 'Winner: ' + this.state.winnerInfo.winnerToken;
            winningLine = this.state.winnerInfo.winningLine;
        } else if (current.squares.filter(square => square === null ).length === 0 ) {
            status = 'Draw!'
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winningLine={winningLine}
                        onClick={(i) => this.handleClick(i)} />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <button onClick={() => this.toggleMoveSorting()}>Toggle history direction</button>
                    {this.state.sortAscending ? <ol>{moves}</ol> : <ol reversed>{moves}</ol>}
                </div>
            </div>
        );
    }
}

// ========================================

ReactDOM.render(
    <Game />,
    document.getElementById('root')
);
