const HAND_CONNECTIONS = [
	[0, 1], [1, 2], [2, 3], [3, 4],
	[0, 5], [5, 6], [6, 7], [7, 8],
	[5, 9], [9, 10], [10, 11], [11, 12],
	[9, 13], [13, 14], [14, 15], [15, 16],
	[13, 17], [17, 18], [18, 19], [19, 20],
	[0, 17],
]

const FINGER_COLORS = {
	thumb: '#60a5fa',
	index: '#34d399',
	middle: '#fbbf24',
	ring: '#f472b6',
	pinky: '#a78bfa',
	palm: '#22d3ee',
}

let mediaPipeLoadPromise = null

function loadScript(src) {
	return new Promise((resolve, reject) => {
		const existing = document.querySelector(`script[data-mediapipe-src="${src}"]`)
		if (existing) {
			if (existing.dataset.loaded === 'true') {
				resolve()
				return
			}

			existing.addEventListener('load', () => resolve(), { once: true })
			existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true })
			return
		}

		const script = document.createElement('script')
		script.src = src
		script.async = true
		script.crossOrigin = 'anonymous'
		script.dataset.mediapipeSrc = src
		script.onload = () => {
			script.dataset.loaded = 'true'
			resolve()
		}
		script.onerror = () => reject(new Error(`Failed to load ${src}`))
		document.head.appendChild(script)
	})
}

async function loadWithFallback(primaryUrl, fallbackUrl) {
	try {
		await loadScript(primaryUrl)
	} catch (_primaryError) {
		await loadScript(fallbackUrl)
	}
}

async function ensureMediaPipeLoaded() {
	if (globalThis.Hands && globalThis.Camera) {
		return
	}

	if (!mediaPipeLoadPromise) {
		mediaPipeLoadPromise = (async () => {
			await loadWithFallback(
				'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
				'https://unpkg.com/@mediapipe/camera_utils/camera_utils.js',
			)

			await loadWithFallback(
				'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js',
				'https://unpkg.com/@mediapipe/hands/hands.js',
			)
		})().catch((error) => {
			mediaPipeLoadPromise = null
			throw error
		})
	}

	await mediaPipeLoadPromise

	if (!globalThis.Hands || !globalThis.Camera) {
		throw new Error('MediaPipe libraries failed to load')
	}
}

function getConnectionColor(fromIndex, toIndex) {
	const pair = [fromIndex, toIndex]

	if (pair.every((id) => [1, 2, 3, 4].includes(id))) return FINGER_COLORS.thumb
	if (pair.every((id) => [5, 6, 7, 8].includes(id))) return FINGER_COLORS.index
	if (pair.every((id) => [9, 10, 11, 12].includes(id))) return FINGER_COLORS.middle
	if (pair.every((id) => [13, 14, 15, 16].includes(id))) return FINGER_COLORS.ring
	if (pair.every((id) => [17, 18, 19, 20].includes(id))) return FINGER_COLORS.pinky

	return FINGER_COLORS.palm
}

function mapNormalizedPointToCover(
	normalizedX,
	normalizedY,
	sourceWidth,
	sourceHeight,
	targetWidth,
	targetHeight,
) {
	const scale = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight)
	const renderedWidth = sourceWidth * scale
	const renderedHeight = sourceHeight * scale
	const offsetX = (targetWidth - renderedWidth) / 2
	const offsetY = (targetHeight - renderedHeight) / 2

	return {
		x: offsetX + normalizedX * sourceWidth * scale,
		y: offsetY + normalizedY * sourceHeight * scale,
	}
}

function drawHandOverlay(
	context,
	sourceWidth,
	sourceHeight,
	targetWidth,
	targetHeight,
	allHands = [],
) {
	context.clearRect(0, 0, targetWidth, targetHeight)

	if (!allHands.length) {
		return
	}

	for (const landmarks of allHands) {
		context.lineCap = 'round'
		context.lineJoin = 'round'

		for (const [fromIndex, toIndex] of HAND_CONNECTIONS) {
			const from = landmarks[fromIndex]
			const to = landmarks[toIndex]
			if (!from || !to) continue

			const mappedFrom = mapNormalizedPointToCover(
				from.x,
				from.y,
				sourceWidth,
				sourceHeight,
				targetWidth,
				targetHeight,
			)
			const mappedTo = mapNormalizedPointToCover(
				to.x,
				to.y,
				sourceWidth,
				sourceHeight,
				targetWidth,
				targetHeight,
			)

			const connectionColor = getConnectionColor(fromIndex, toIndex)
			context.lineWidth = 4
			context.strokeStyle = 'rgba(5, 15, 35, 0.55)'
			context.beginPath()
			context.moveTo(mappedFrom.x, mappedFrom.y)
			context.lineTo(mappedTo.x, mappedTo.y)
			context.stroke()

			context.lineWidth = 2.4
			context.strokeStyle = connectionColor
			context.beginPath()
			context.moveTo(mappedFrom.x, mappedFrom.y)
			context.lineTo(mappedTo.x, mappedTo.y)
			context.stroke()
		}

		for (const point of landmarks) {
			const { x: px, y: py } = mapNormalizedPointToCover(
				point.x,
				point.y,
				sourceWidth,
				sourceHeight,
				targetWidth,
				targetHeight,
			)

			context.beginPath()
			context.arc(px, py, 4.8, 0, Math.PI * 2)
			context.fillStyle = 'rgba(7, 16, 36, 0.72)'
			context.fill()

			context.beginPath()
			context.arc(px, py, 3.2, 0, Math.PI * 2)
			context.fillStyle = '#fde68a'
			context.fill()

			context.beginPath()
			context.arc(px, py, 3.2, 0, Math.PI * 2)
			context.strokeStyle = 'rgba(255, 255, 255, 0.75)'
			context.lineWidth = 0.9
			context.stroke()
		}
	}
}

function isFingerUp(landmarks, tipId) {
	const fingerTipY = landmarks[tipId].y
	const fingerMcpY = landmarks[tipId - 2].y
	return fingerTipY < fingerMcpY
}

function isThumbOpen(landmarks) {
	const thumbTipX = landmarks[4].x
	const thumbIpX = landmarks[3].x
	const thumbMcpX = landmarks[2].x
	return thumbTipX > thumbIpX && thumbIpX > thumbMcpX
}

function detectMoveFromLandmarks(landmarks) {
	const thumbStatus = isThumbOpen(landmarks) ? '1' : '0'
	const indexStatus = isFingerUp(landmarks, 8) ? '1' : '0'
	const middleStatus = isFingerUp(landmarks, 12) ? '1' : '0'
	const ringStatus = isFingerUp(landmarks, 16) ? '1' : '0'
	const pinkyStatus = isFingerUp(landmarks, 20) ? '1' : '0'

	const currentState =
		thumbStatus + indexStatus + middleStatus + ringStatus + pinkyStatus

	if (currentState === '00000') return 'rock'
	if (currentState === '11111') return 'paper'
	if (currentState === '01100') return 'scissors'

	return null
}

export async function startWebcamCapture(options = {}) {
	const {
		container = document.body,
		width = 640,
		height = 480,
		muted = true,
		autoplay = true,
		playsInline = true,
		onMoveDetected,
	} = options

	const video = document.createElement('video')
	video.width = width
	video.height = height
	video.autoplay = autoplay
	video.muted = muted
	video.playsInline = playsInline

	const overlayCanvas = document.createElement('canvas')
	const pixelRatio = window.devicePixelRatio || 1
	overlayCanvas.width = Math.floor(width * pixelRatio)
	overlayCanvas.height = Math.floor(height * pixelRatio)
	overlayCanvas.className = 'webcam-overlay-canvas'

	const overlayContext = overlayCanvas.getContext('2d')
	overlayContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

	const stream = await navigator.mediaDevices.getUserMedia({
		video: true,
		audio: false,
	})

	video.srcObject = stream
	container.appendChild(video)
	container.appendChild(overlayCanvas)

	let hands = null
	let camera = null
	let latestMove = null
	let detectionRunning = false

	const startDetection = async () => {
		if (detectionRunning) {
			return
		}

		await ensureMediaPipeLoaded()

		const HandsConstructor = globalThis.Hands
		const CameraConstructor = globalThis.Camera

		if (!HandsConstructor || !CameraConstructor) {
			throw new Error('MediaPipe libraries failed to load')
		}

		hands = new HandsConstructor({
			locateFile: (file) =>
				`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
		})

		hands.setOptions({
			maxNumHands: 1,
			modelComplexity: 1,
			minDetectionConfidence: 0.7,
			minTrackingConfidence: 0.4,
		})

		hands.onResults((results) => {
			const allHands = results.multiHandLandmarks || []
			const displayWidth = overlayCanvas.clientWidth || width
			const displayHeight = overlayCanvas.clientHeight || height
			const scaledWidth = Math.floor(displayWidth * pixelRatio)
			const scaledHeight = Math.floor(displayHeight * pixelRatio)

			if (
				overlayCanvas.width !== scaledWidth ||
				overlayCanvas.height !== scaledHeight
			) {
				overlayCanvas.width = scaledWidth
				overlayCanvas.height = scaledHeight
				overlayContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
			}

			drawHandOverlay(
				overlayContext,
				width,
				height,
				displayWidth,
				displayHeight,
				allHands,
			)

			const landmarks = allHands[0]

			if (!landmarks) {
				return
			}

			const detectedMove = detectMoveFromLandmarks(landmarks)
			if (!detectedMove) {
				return
			}

			latestMove = detectedMove
			if (onMoveDetected) {
				onMoveDetected(detectedMove)
			}
		})

		camera = new CameraConstructor(video, {
			onFrame: async () => {
				if (hands) {
					await hands.send({ image: video })
				}
			},
			width,
			height,
		})

		await camera.start()
		detectionRunning = true
	}

	const stopDetection = async () => {
		detectionRunning = false

		if (camera) {
			camera.stop()
			camera = null
		}

		if (hands) {
			await hands.close()
			hands = null
		}
	}

	await startDetection()

	const stop = async () => {
		await stopDetection()

		const currentStream = video.srcObject

		if (currentStream) {
			currentStream.getTracks().forEach((track) => track.stop())
		}

		window.removeEventListener('keydown', onKeyDown)

		if (video.parentNode) {
			video.parentNode.removeChild(video)
		}

		if (overlayCanvas.parentNode) {
			overlayCanvas.parentNode.removeChild(overlayCanvas)
		}
	}

	const onKeyDown = (event) => {
		if (event.key === 'Escape') {
			stop()
		}
	}

	window.addEventListener('keydown', onKeyDown)

	return {
		video,
		overlayCanvas,
		stream,
		stop,
		startDetection,
		stopDetection,
		getLatestMove: () => latestMove,
	}
}
