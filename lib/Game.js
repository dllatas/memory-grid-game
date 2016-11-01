import Row from "./Row";
import Cell from "./Cell";
import Footer from "./Footer";
import _ from "lodash";

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.matrix = [];
        for (let r=0; r<this.props.rows; r++) {
            let row = [];
            for (let c=0; c<this.props.columns; c++) {
                row.push(`${r}${c}`);
            }
            this.matrix.push(row);
        }
        let flatMatrix = _.flatten(this.matrix);
        this.activeCells = _.sampleSize(flatMatrix, this.props.activeCellsCount);
        this.state = {
            gameState: "ready",
            wrongGuesses: [],
            correctGuesses: [],
            secondsRemaining: this.props.timeoutSeconds
        };
    }

    startRecallMode() {
        this.setState({ gameState: 'recall' }, () => {
            this.secondsRemaining = this.props.timeoutSeconds;
            this.secondsRemainingTimerId = setInterval(() => {
                if (--this.secondsRemaining === 0) {
                    this.setState({ gameState: this.finishGame('lost') });
                }
                this.setState({ secondsRemaining: this.secondsRemaining });
            }, 1000);
        });
    }

    finishGame(gameState) {
        clearInterval(this.secondsRemainingTimerId);
        return gameState;
    }

    componentDidMount() {
        this.memorizeTimerId = setTimeout(() => {
            this.setState( { gameState: 'memorize' }, () => {
                this.recallTimerId = setTimeout(
                    this.startRecallMode.bind(this),
                    500
                );
            });
        }, 2000);
    }

    componentWillUnmount() {
        clearTimeout(this.memorizeTimerId);
        clearTimeout(this.recallTimerId);
        this.finishGame();
    }

    recordGuess({ cellId, userGuessIsCorrect }) {
        let { wrongGuesses, correctGuesses, gameState } = this.state;
        if (userGuessIsCorrect) {
            correctGuesses.push(cellId);
            if (correctGuesses.length === this.props.activeCellsCount) {
                gameState = this.finishGame("won");
            }
        } else {
            wrongGuesses.push(cellId);
            if (wrongGuesses.length > this.props.allowedWrongAttempts) {
                gameState = this.finishGame("lost");
            }
        }
        this.setState({ correctGuesses, wrongGuesses, gameState});
    }

    cellActive(cell) {
        return this.activeCells.indexOf(cell) >= 0;
    }



    render() {
        let showActiveCells = ["memorize", "lost"].indexOf(this.state.gameState) >= 0;
        return (
            <div className="grid">
                {this.matrix.map((row, ri) => (
                    <Row key={ri}>
                        {
                            row.map(cellId => <Cell key={cellId} id={cellId} showActiveCells={showActiveCells}
                                isActive={this.cellActive(cellId)} recordGuess={this.recordGuess.bind(this)}
                                {...this.state}/>)
                        }
                    </Row>
                ))}
                <Footer activeCellsCount={this.props.activeCellsCount}
                        playAgain={this.props.createNewGame}
                        {...this.state} secondsRemaining={this.secondsRemaining} />
            </div>
        );
    }
}

Game.defaultProps = {
    allowedWrongAttempts: 2,
    timeoutSeconds: 10
};

export default Game;