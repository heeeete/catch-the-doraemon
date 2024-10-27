import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
	const canvasRef = useRef(null);
	const circleRef = useRef(null);
	const [isComeIn, setIsComeIn] = useState(false);
	const scale = [0.7, 0.4, 0.2];
	const [recalculation, setRecalculation] = useState(false);
	const width = ~~(980 / 4);
	const height = ~~(645 / 2) - 13;
	const level = useRef(0);
	const scaleWidth = useRef(width * scale[level.current]);
	const scaleHeight = useRef(height * scale[level.current]);
	const pos = useRef({ x: 0, y: 0 });
	const isCursorOverTarget = (e) =>
		e.clientX >= pos.current.x &&
		e.clientX <= pos.current.x + scaleWidth.current &&
		e.clientY >= pos.current.y &&
		e.clientY <= pos.current.y + scaleHeight.current;

	useEffect(() => {
		scaleWidth.current = width * scale[level.current];
		scaleHeight.current = height * scale[level.current];
	}, [recalculation]);

	useEffect(function initScreenSize() {
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

	useEffect(function drawCanvas() {
		const canvas = canvasRef.current;

		const doraemong = new Image();
		const bullet = new Image();
		let imagesLoaded = 0;
		const checkAllImagesLoaded = () => {
			imagesLoaded++;
			if (imagesLoaded === 2) {
				init();
			}
		};
		doraemong.src = "/doraemong.png";
		bullet.src = "/bullet.png";
		doraemong.onload = checkAllImagesLoaded;
		bullet.onload = checkAllImagesLoaded;

		const cycleLoopX = [0, 1, 2, 3, 0, 1];
		const cycleLoopY = [0, 0, 0, 0, 1, 1];
		const speed = [2.5, 7, 10];
		const intervalTime = [1500, 1000, 500];
		const lerpTime = [0.01, 0.03, 0.05];
		const ctx = canvas.getContext("2d");

		let bulletMarks = [];
		let dir = { x: 0, y: 0 };
		let targetDir = { x: 0, y: 0 };
		let currLoopIdx = 0;
		let frameSpeed = 0;
		let animationFrameId;
		let intervalId;

		const drawFrame = (frameX, frameY, canvasX, canvasY) => {
			ctx.save();

			if (dir.x < 0) {
				ctx.scale(-1, 1);
				ctx.translate(-canvasX - scaleWidth.current, canvasY);
			} else ctx.translate(canvasX, canvasY);

			ctx.drawImage(
				doraemong,
				frameX * width,
				frameY * height,
				width,
				height,
				0,
				0,
				scaleWidth.current,
				scaleHeight.current
			);
			ctx.restore();
		};

		/* 총알 그리기 */
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
					ctx.globalAlpha = alpha;
					ctx.drawImage(bullet, 0, 0, 50, 50, mark.x - 25, mark.y - 25, 50, 50);
					return true;
				}
				return false;
			});

			ctx.globalAlpha = 1;
		};

		const normalize = () => {
			const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
			if (length > 0) {
				dir.x = dir.x / length;
				dir.y = dir.y / length;
			}
		};

		const gradualUpdatePos = (flag) => {
			dir.x += (targetDir.x - dir.x) * (flag ? 1 : lerpTime[level.current]);
			dir.y += (targetDir.y - dir.y) * (flag ? 1 : lerpTime[level.current]);
			normalize();
		};

		const reverseTargetDir = (target) => {
			if (target === "x")
				targetDir.x = Math.abs(targetDir.x) * (pos.current.x <= 0 ? 1 : -1);
			else targetDir.y = Math.abs(targetDir.y) * (pos.current.y <= 0 ? 1 : -1);
			return 1;
		};

		const updatePos = () => {
			let flag = 0;
			if (
				pos.current.x <= 0 ||
				pos.current.x + scaleWidth.current >= canvas.width
			)
				flag = reverseTargetDir("x");
			if (
				pos.current.y <= 0 ||
				pos.current.y + scaleHeight.current >= canvas.height
			)
				flag = reverseTargetDir("y");

			gradualUpdatePos(flag);

			pos.current.x += dir.x * speed[level.current];
			pos.current.y += dir.y * speed[level.current];
		};

		const step = () => {
			frameSpeed++;
			if (frameSpeed > 10) {
				currLoopIdx++;
				if (currLoopIdx >= cycleLoopX.length) currLoopIdx = 0;
				frameSpeed = 0;
			}
			updatePos();
			ctx.clearRect(
				0,
				0,
				document.body.clientWidth,
				document.body.clientHeight
			);
			drawBulletMarks();
			drawFrame(
				cycleLoopX[currLoopIdx],
				cycleLoopY[currLoopIdx],
				pos.current.x,
				pos.current.y
			);
			animationFrameId = requestAnimationFrame(step);
		};

		const shoot = (e) => {
			if (isCursorOverTarget(e)) {
				if (level.current <= 1) {
					level.current += 1;
					setRecalculation((prev) => !prev);
				}
			} else
				bulletMarks.push({
					x: e.clientX,
					y: e.clientY,
					t: new Date().getTime(),
					alpha: 1,
				});
		};

		const init = () => {
			pos.current.x =
				Math.random() * (document.body.clientWidth - scaleWidth.current);
			pos.current.y =
				Math.random() * (document.body.clientHeight - scaleHeight.current);

			const makeSingleVector = () => {
				const angle = Math.random() * Math.PI * 2;
				targetDir = { x: Math.cos(angle), y: Math.sin(angle) };
			};

			const customInterval = () => {
				if (intervalId) clearTimeout(intervalId);

				intervalId = setTimeout(() => {
					makeSingleVector();
					customInterval();
				}, intervalTime[level.current]);
			};

			customInterval();
			makeSingleVector();
			window.addEventListener("click", shoot);
			step();
		};

		return () => {
			window.removeEventListener("click", shoot);
			if (intervalId) clearTimeout(intervalId);
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	}, []);

	useEffect(
		function initMouseEvent() {
			let offsetX = 0;
			let offsetY = 0;

			if (circleRef.current) {
				const rect = circleRef.current.getBoundingClientRect();
				offsetX = rect.width / 2;
				offsetY = rect.height / 2;
			}

			const followMouse = (e) => {
				if (isCursorOverTarget(e)) setIsComeIn(true);
				else setIsComeIn(false);

				if (circleRef.current) {
					circleRef.current.style.transform = `translate(${e.x - offsetX}px, ${
						e.y - offsetY
					}px)`;
				}
			};

			window.addEventListener("mousemove", followMouse);
			return () => {
				window.removeEventListener("mousemove", followMouse);
			};
		},
		[recalculation]
	);

	return (
		<>
			<div className="circle" ref={circleRef}>
				<div className="light" id="light"></div>
				<div className={`col ${isComeIn ? "active" : ""}`}></div>
				<div className={`row ${isComeIn ? "active" : ""}`}></div>
			</div>
			<canvas ref={canvasRef}></canvas>
		</>
	);
}

export default App;
