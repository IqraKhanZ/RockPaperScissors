import { useEffect, useRef, useState } from 'react'
import { startWebcamCapture } from '../functions/handgesture'
import { getRandomMove, getMoveImage, determineWinner } from '../functions/gamelogic'

function formatMove(move) {
	if (!move) return '-'
	return move.charAt(0).toUpperCase() + move.slice(1)
}

function Home({ currentUser }) {
	const webcamContainerRef = useRef(null)
	const webcamStopRef = useRef(null)
	const latestDetectedMoveRef = useRef(null)
	const countdownIntervalRef = useRef(null)
	const countdownStartDelayRef = useRef(null)
	const [countdown, setCountdown] = useState(null)
	const [topStatus, setTopStatus] = useState('')
	const [computerMove, setComputerMove] = useState(null)
	const [userMove, setUserMove] = useState(null)
	const [result, setResult] = useState(null)
	const [isCameraOpen, setIsCameraOpen] = useState(false)

	useEffect(() => {
		return () => {
			if (countdownIntervalRef.current) {
				clearInterval(countdownIntervalRef.current)
			}

			if (countdownStartDelayRef.current) {
				clearTimeout(countdownStartDelayRef.current)
			}

			if (webcamStopRef.current) {
				webcamStopRef.current()
			}
		}
	}, [])

	const handleStart = async () => {
		try {
			if (webcamStopRef.current) {
				webcamStopRef.current()
			}

			const { stop } = await startWebcamCapture({
				container: webcamContainerRef.current,
				width: 280,
				height: 180,
				onMoveDetected: (move) => {
					latestDetectedMoveRef.current = move
				},
			})

			webcamStopRef.current = stop
			setIsCameraOpen(true)
			setTopStatus('Camera Opened')
			setTimeout(() => {
				setTopStatus('')
			}, 900)
		} catch (error) {
			setIsCameraOpen(false)
			const message = String(error?.message || '')
			if (message.toLowerCase().includes('permission')) {
				setTopStatus('Camera permission denied')
			} else if (message.toLowerCase().includes('mediapipe')) {
				setTopStatus('MediaPipe failed to load')
			} else {
				setTopStatus('Unable to start camera')
			}
			console.error('Camera initialization failed:', error)
		}
	}

	const handlePlay = () => {
		if (!isCameraOpen) {
			setTopStatus('Please open camera first')
			setTimeout(() => {
				setTopStatus('')
			}, 1200)
			return
		}

		if (countdownIntervalRef.current) {
			clearInterval(countdownIntervalRef.current)
		}

		if (countdownStartDelayRef.current) {
			clearTimeout(countdownStartDelayRef.current)
		}

		if (!latestDetectedMoveRef.current) {
			setTopStatus('No hand detected')
			setTimeout(() => {
				setTopStatus('')
			}, 1200)
			return
		}

		const computerSelectedMove = getRandomMove()
		setComputerMove(null)
		setUserMove(null)
		setResult(null)
		setCountdown(null)
		setTopStatus('Ready to Play')

		countdownStartDelayRef.current = setTimeout(() => {
			setTopStatus('')
			setCountdown(3)

			let current = 3
			countdownIntervalRef.current = setInterval(() => {
				if (!latestDetectedMoveRef.current) {
					clearInterval(countdownIntervalRef.current)
					countdownIntervalRef.current = null
					setCountdown(null)
					setComputerMove(null)
					setUserMove(null)
					setResult(null)
					setTopStatus('No hand detected')
					setTimeout(() => {
						setTopStatus('')
					}, 1200)
					return
				}

				current -= 1

				if (current > 0) {
					setCountdown(current)
					return
				}

				clearInterval(countdownIntervalRef.current)
				countdownIntervalRef.current = null
				setCountdown(null)

				const detectedUserMove = latestDetectedMoveRef.current

				if (!detectedUserMove) {
					setComputerMove(null)
					setUserMove(null)
					setResult(null)
					setTopStatus('No hand detected')
					setTimeout(() => {
						setTopStatus('')
					}, 1200)
					return
				}

				setComputerMove(computerSelectedMove)
				setUserMove(detectedUserMove)

				const finalResult = determineWinner(detectedUserMove, computerSelectedMove)
				setResult(finalResult)
			}, 1000)
		}, 700)
	}

	const computerMoveImage = computerMove ? getMoveImage(computerMove) : null

	const isDraw = result === "It's a Draw"
	const computerResultLabel = result === 'Computer Won' ? 'Won' : result === 'You Won' ? 'Lost' : ''
	const userResultLabel = result === 'You Won' ? 'Won' : result === 'Computer Won' ? 'Lost' : ''

	return (
		<main className="home-page">
			<div className="disclaimer-ticker" role="note" aria-live="polite">
				<p className="disclaimer-track">
					⚠️ Disclaimer: Please keep your hand clearly visible within the camera frame 🤚 and maintain a proper distance so your entire hand fits on the screen. This helps ensure your gesture is captured accurately 🎯.
				</p>
			</div>

			<div className="boxes-wrap">
				{(topStatus || countdown !== null) && (
					<div className={`countdown-pill ${countdown !== null ? 'countdown-number' : topStatus === 'Camera Opened' ? 'camera-status' : topStatus === 'No hand detected' ? 'no-hand-status' : 'ready-status'}`}>
						{countdown !== null ? countdown : topStatus}
					</div>
				)}

				{isDraw && <div className="draw-overlay">🛑 Draw</div>}

				<div className="box-group">
					<div className="move-box computer-box">
						<h2>Computer</h2>
						<p className="box-move-text">Move: {formatMove(computerMove)}</p>
						<div className="computer-visual">
							{computerResultLabel && (
								<p className={`box-result ${computerResultLabel === 'Won' ? 'won' : 'lost'}`}>
									{computerResultLabel}
								</p>
							)}
							{computerMoveImage && (
								<img
									src={computerMoveImage}
									alt={computerMove}
									className="move-image"
								/>
							)}
						</div>
					</div>
				</div>

				<div className="box-group">
					<div className="move-box user-box">
						<h2>{currentUser?.username || 'User'}</h2>
						<p className="box-move-text">Move: {formatMove(userMove)}</p>
						<div className="webcam-slot">
							<div className="webcam-media" ref={webcamContainerRef} />
							{userResultLabel && (
								<p className={`box-result ${userResultLabel === 'Won' ? 'won' : 'lost'}`}>
									{userResultLabel}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className="controls">
				<button className="action-btn" onClick={handleStart}>
					Open Camera
				</button>
				<button className="action-btn" onClick={handlePlay} disabled={!isCameraOpen}>
					Play
				</button>
			</div>
		</main>
	)
}

export default Home

