import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
    return (
        <button
            className="square"
            onClick={props.onClick}
            style={{backgroundColor: props.isWinner ?'#d1e1ff' : ''}}>
            {props.value}
        </button>
    )
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square
                value={this.props.squares[i]}
                isWinner={this.props.winners.includes(i)}
                onClick={() => this.props.onClick(i)}
                key={i.toString()}
            />
        );
    }

    render() {
        const rows = [];
        for (let i = 0; i < 3; i++) {
            const squares = [];
            for (let j = 0; j < 3; j++) {
                squares.push(this.renderSquare((i * 3) + j));
            }
            rows.push(<div key={i.toString()} className="board-row">{squares}</div>)
        }

        return (
            <div>{rows}</div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                row: null,
                col: null,
                player: null,
            }],
            stepNumber: 0,
            xIsNext: true,
            historyReversed: false,
        }

        this.handleHistoryInput = this.handleHistoryInput.bind(this);
    }

    handleClick(i) {
        const history = this.state.history.slice(0, this.state.stepNumber + 1);
        const current = history[history.length - 1];
        const squares = current.squares.slice();
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            history: history.concat([{
                squares: squares,
                row: Math.floor(i / 3) + 1,
                col: this.getCol(i),
                player: squares[i],
            }]),
            stepNumber: history.length,
            xIsNext: !this.state.xIsNext,
        });
    }

    getCol(i) {
        if (i === 0 || i === 3 || i === 6) {
            return 1;
        }
        if (i === 1 || i === 4 || i === 7) {
            return 2;
        }
        return 3;
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step,
            xIsNext: this.xNext(step),
        });
    }

    xNext(step) {
        return (step % 2) === 0;
    }

    handleHistoryInput(_) {
        this.setState({
            historyReversed: !this.state.historyReversed,
        });
    }

    render() {
        let history = this.state.history;
        let rev = this.state.historyReversed;
        if (rev) {
            history = history.slice().reverse()
        }
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);
        const moves = history.map((step, move) => {
            let desc;
            if ((rev && move === history.length - 1) || (!rev && move === 0)) {
                desc = 'Go to game start';
            } else {
                desc = 'Go to move #' + move + ' (' + step.player + ' at Row: ' + step.row + ', Col: ' + step.col + ')'
            }
            return (
                <li key={desc}>
                    <button
                        style={{fontWeight: (this.state.stepNumber === move) ? 'bold' : 'normal'}}
                        onClick={() => this.jumpTo(move)}>
                        {desc}
                    </button>
                </li>
            );
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner.player;
        } else {
            status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
        }

        return (
            <div className="game">
                <div className="game-board">
                    <Board
                        squares={current.squares}
                        winners={winner ? winner.line : [] }
                        onClick={(i) => this.handleClick(i)}
                    />
                </div>
                <div className="game-info">
                    <div>{status}</div>
                    <div>
                        <input
                            name="historyDirection"
                            type="checkbox"
                            checked={this.state.historyReversed}
                            onChange={this.handleHistoryInput}/>
                        <label>Reverse History Order</label>
                    </div>
                    <ol reversed={this.state.historyReversed}>{moves}</ol>
                </div>
            </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
            return { player: squares[a], line: [a,b,c] };
        }
    }
    return null;
}