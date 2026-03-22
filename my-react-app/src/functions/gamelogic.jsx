export const MOVES = ['rock', 'paper', 'scissors']

export function getRandomMove() {
  const randomIndex = Math.floor(Math.random() * MOVES.length)
  return MOVES[randomIndex]
}

export function getMoveImage(move) {
  const imageMap = {
    rock: new URL('../assets/rock.svg', import.meta.url).href,
    paper: new URL('../assets/paper.svg', import.meta.url).href,
    scissors: new URL('../assets/scissors.svg', import.meta.url).href,
  }
  return imageMap[move] || ''
}

export function determineWinner(userMove, computerMove) {
  if (userMove === computerMove) {
    return "It's a Draw"
  }

  if (
    (userMove === 'rock' && computerMove === 'scissors') ||
    (userMove === 'paper' && computerMove === 'rock') ||
    (userMove === 'scissors' && computerMove === 'paper')
  ) {
    return 'You Won'
  }

  return 'Computer Won'
}
