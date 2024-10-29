import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
	const FRAME_DIMENSIONS = {
		width: Math.floor(980 / 4),
		height: Math.floor(645 / 2) - 13,
	};
	const SCALE_LEVELS = [0.7, 0.4, 0.2];
	const SPEED_LEVELS = [2.5, 7, 10];
	const INTERVAL_TIMES = [1500, 1000, 500];
	const LERP_TIMES = [0.01, 0.03, 0.05];

	const [isCursorOver, setIsCursorOver] = useState(false);
	const [isClear, setIsClear] = useState(false);
	const [recalculation, setRecalculation] = useState(false);

	const level = useRef(0);
	const canvasRef = useRef(null);
	const circleRef = useRef(null);
	const doraemonImageRef = useRef(new Image());
	const bulletImageRef = useRef(new Image());
	const scaleWidth = useRef(FRAME_DIMENSIONS.width * SCALE_LEVELS[level.current]);
	const scaleHeight = useRef(FRAME_DIMENSIONS.height * SCALE_LEVELS[level.current]);
	const dirRef = useRef({ x: 0, y: 0 });
	const posRef = useRef({ x: 0, y: 0 });
	const targetDirRef = { x: 0, y: 0 };

	const isCursorOverTarget = (e) =>
		e.clientX >= posRef.current.x &&
		e.clientX <= posRef.current.x + scaleWidth.current &&
		e.clientY >= posRef.current.y &&
		e.clientY <= posRef.current.y + scaleHeight.current;

	const normalizeDir = () => {
		const length = Math.hypot(dirRef.current.x, dirRef.current.y);
		if (length > 0) {
			dirRef.current.x /= length;
			dirRef.current.y /= length;
		}
	};

	const updateDirection = (immediate = false) => {
		const lerpTime = immediate ? 1 : LERP_TIMES[level.current];

		dirRef.current.x += (targetDirRef.current.x - dirRef.current.x) * lerpTime;
		dirRef.current.y += (targetDirRef.current.y - dirRef.current.y) * lerpTime;
		normalizeDir();
	};

	const reverseDirection = (target) => {
		console.log(target);
		if (target === "x") {
			targetDirRef.current.x = -Math.abs(targetDirRef.current.x) * (posRef.current.x <= 0 ? -1 : 1);
		} else {
			targetDirRef.current.y = -Math.abs(targetDirRef.current.y) * (posRef.current.y <= 0 ? -1 : 1);
		}
	};

	useEffect(() => {
		scaleWidth.current = FRAME_DIMENSIONS.width * SCALE_LEVELS[level.current];
		scaleHeight.current = FRAME_DIMENSIONS.height * SCALE_LEVELS[level.current];
	}, [recalculation]);

	useEffect(() => {
		const resizeWindow = () => {
			if (canvasRef.current) {
				canvasRef.current.width = document.body.clientWidth;
				canvasRef.current.height = document.body.clientHeight;
			}
		};

		resizeWindow();
		window.addEventListener("resize", resizeWindow);
		return () => {
			window.removeEventListener("resize", resizeWindow);
		};
	}, []);

	useEffect(() => {
		const CYCLE_LOOP_X = [0, 1, 2, 3, 0, 1];
		const CYCLE_LOOP_Y = [0, 0, 0, 0, 1, 1];
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		let bulletMarks = [];
		let currLoopIdx = 0;
		let frameSpeed = 0;
		let animationFrameId;
		let intervalId;

		const loadImages = () => {
			let imagesLoaded = 0;
			const onImageLoad = () => {
				imagesLoaded++;
				if (imagesLoaded === 2) initAnimation();
			};

			doraemonImageRef.current.src = "/doraemon.png";
			bulletImageRef.current.src = "/bullet.png";
			doraemonImageRef.current.onload = onImageLoad;
			bulletImageRef.current.onload = onImageLoad;
		};

		const initAnimation = () => {
			posRef.current.x = Math.random() * (document.body.clientWidth - scaleWidth.current);
			posRef.current.y = Math.random() * (document.body.clientHeight - scaleHeight.current);
			console.log(posRef.current);

			const updateTargetDirection = () => {
				const angle = Math.random() * Math.PI * 2;
				targetDirRef.current = { x: Math.cos(angle), y: Math.sin(angle) };
			};

			const setDirectionInterval = () => {
				intervalId = setInterval(updateTargetDirection, INTERVAL_TIMES[level.current]);
			};

			const drawCanvas = () => {
				frameSpeed++;
				if (frameSpeed > 10) {
					currLoopIdx++;
					if (currLoopIdx >= CYCLE_LOOP_X.length) currLoopIdx = 0;
					frameSpeed = 0;
				}
				if (
					posRef.current.x <= 0 ||
					posRef.current.x + scaleWidth.current >= canvas.width ||
					posRef.current.y <= 0 ||
					posRef.current.y + scaleHeight.current >= canvas.height
				) {
					reverseDirection(
						posRef.current.x <= 0 || posRef.current.x + scaleWidth.current >= canvas.width
							? "x"
							: "y"
					);
					updateDirection(true);
				} else {
					updateDirection();
				}

				posRef.current.x += dirRef.current.x * SPEED_LEVELS[level.current];
				posRef.current.y += dirRef.current.y * SPEED_LEVELS[level.current];

				ctx.clearRect(0, 0, document.body.clientWidth, document.body.clientHeight);
				drawBulletMarks();
				drawFrame(posRef.current.x, posRef.current.y);

				animationFrameId = requestAnimationFrame(drawCanvas);
			};
			updateTargetDirection();
			setDirectionInterval();
			window.addEventListener("click", handleShoot);
			drawCanvas();
		};

		const drawFrame = (canvasX, canvasY) => {
			ctx.save();

			if (dirRef.current.x < 0) {
				ctx.scale(-1, 1);
				ctx.translate(-canvasX - scaleWidth.current, canvasY);
			} else ctx.translate(canvasX, canvasY);

			ctx.drawImage(
				doraemonImageRef.current,
				CYCLE_LOOP_X[currLoopIdx] * FRAME_DIMENSIONS.width,
				CYCLE_LOOP_Y[currLoopIdx] * FRAME_DIMENSIONS.height,
				FRAME_DIMENSIONS.width,
				FRAME_DIMENSIONS.height,
				0,
				0,
				scaleWidth.current,
				scaleHeight.current
			);
			ctx.restore();
		};

		const drawBulletMarks = () => {
			const now = new Date().getTime();

			bulletMarks = bulletMarks.filter((mark) => {
				const elapsed = now - mark.t;
				const totalLifespan = 4000;
				const visibleDuration = 2000;
				const fadeDuration = totalLifespan - visibleDuration;

				let alpha = 1;

				if (elapsed < totalLifespan) {
					if (elapsed > visibleDuration) {
						const fadeElapsed = elapsed - visibleDuration;
						alpha = 1 - fadeElapsed / fadeDuration;
					}
					ctx.save();
					ctx.globalAlpha = alpha;
					ctx.translate(mark.x, mark.y);
					ctx.rotate(mark.rotate);
					ctx.translate(-25, -25);
					ctx.drawImage(bulletImageRef.current, 0, 0, 50, 50);
					ctx.restore();
					return true;
				}
				return false;
			});
		};

		const handleShoot = (e) => {
			if (isCursorOverTarget(e)) {
				if (level.current <= 1) {
					level.current += 1;
					setRecalculation((prev) => !prev);
				} else {
				}
			} else
				bulletMarks.push({
					x: e.clientX,
					y: e.clientY,
					t: new Date().getTime(),
					alpha: 1,
					rotate: Math.random() * 2 * Math.PI,
				});
		};

		loadImages();

		return () => {
			window.removeEventListener("click", handleShoot);
			if (intervalId) clearTimeout(intervalId);
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	}, []);

	useEffect(() => {
		let offsetX = 0;
		let offsetY = 0;

		if (circleRef.current) {
			const rect = circleRef.current.getBoundingClientRect();
			offsetX = rect.width / 2;
			offsetY = rect.height / 2;
		}

		const followMouse = (e) => {
			setIsCursorOver(isCursorOverTarget(e));
			if (circleRef.current) {
				circleRef.current.style.transform = `translate(${e.x - offsetX}px, ${e.y - offsetY}px)`;
			}
		};

		window.addEventListener("mousemove", followMouse);
		return () => {
			window.removeEventListener("mousemove", followMouse);
		};
	}, [recalculation]);

	return (
		<>
			<div className="circle" ref={circleRef}>
				<div className="light" id="light"></div>
				<div className={`col ${isCursorOver ? "active" : ""}`}></div>
				<div className={`row ${isCursorOver ? "active" : ""}`}></div>
			</div>
			<canvas ref={canvasRef}></canvas>
		</>
	);
}

export default App;
