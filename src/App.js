import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
	const canvasRef = useRef(null);
	const circleRef = useRef(null);
	const intervalId = useRef(null);
	const [scale, setScale] = useState(0.7);
	const width = ~~(980 / 4);
	const height = ~~(645 / 2) - 13;
	const scaleWidth = useRef(width * scale);
	const scaleHeight = useRef(height * scale);
	const pos = useRef({ x: 0, y: 0 });

	useEffect(() => {
		scaleWidth.current = width * scale;
		scaleHeight.current = height * scale;
	}, [scale]);

	const isCursorOverTarget = (e) =>
		e.x >= pos.current.x &&
		e.x <= pos.current.x + scaleWidth.current &&
		e.y >= pos.current.y &&
		e.y <= pos.current.y + scaleHeight.current;

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

	useEffect(
		function drawCanvas() {
			const cycleLoopX = [0, 1, 2, 3, 0, 1];
			const cycleLoopY = [0, 0, 0, 0, 1, 1];
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			const img = new Image();

			let speed = 2.5;
			let dir = { x: 0, y: 0 };
			let targetDir = { x: 0, y: 0 };
			let currLoopIdx = 0;
			let frameSpeed = 0;
			let animationFrameId;
			img.src = "/doraemong.png";
			img.onload = function () {
				init();
			};

			const drawFrame = (frameX, frameY, canvasX, canvasY) => {
				ctx.save();

				if (dir.x < 0) {
					ctx.scale(-1, 1);
					ctx.translate(-canvasX - scaleWidth.current, canvasY);
				} else ctx.translate(canvasX, canvasY);

				ctx.drawImage(
					img,
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

			const normalize = () => {
				const length = Math.sqrt(dir.x * dir.x + dir.y * dir.y);
				if (length > 0) {
					dir.x = (dir.x / length) * speed;
					dir.y = (dir.y / length) * speed;
				}
			};

			const gradualUpdatePos = (flag) => {
				if (
					Math.abs(dir.x - targetDir.x) < 0.01 &&
					Math.abs(dir.y - targetDir.y) < 0.01
				) {
					dir.x = targetDir.x;
					dir.y = targetDir.y;
					return;
				}

				dir.x += (targetDir.x - dir.x) * (flag ? 1 : 0.1);
				dir.y += (targetDir.y - dir.y) * (flag ? 1 : 0.1);
				normalize();
			};

			const reverseTargetDir = (target) => {
				if (target === "x")
					targetDir.x = Math.abs(targetDir.x) * (pos.current.x <= 0 ? 1 : -1);
				else
					targetDir.y = Math.abs(targetDir.y) * (pos.current.y <= 0 ? 1 : -1);
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

				pos.current.x += dir.x * speed;
				pos.current.y += dir.y * speed;
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
					setScale((prev) => prev - 0.1);
				}
			};

			const init = () => {
				intervalId.current = setInterval(() => {
					const angle = Math.random() * Math.PI * 2; // 랜덤한 각도
					targetDir = { x: Math.cos(angle), y: Math.sin(angle) }; // 새로운 방향 설정
				}, 500);

				window.addEventListener("click", shoot);
				step();
			};

			return () => {
				cancelAnimationFrame(animationFrameId);
				window.removeEventListener("click", shoot);
				if (intervalId.current) clearInterval(intervalId.current);
			};
		},
		[canvasRef]
	);

	// useEffect(
	// 	function initMouseEvent() {
	// 		let offsetX = 0;
	// 		let offsetY = 0;
	// 		const $col = document.querySelector(".col");
	// 		const $row = document.querySelector(".row");

	// 		if (circleRef.current) {
	// 			const rect = circleRef.current.getBoundingClientRect();
	// 			offsetX = rect.width / 2;
	// 			offsetY = rect.height / 2;
	// 		}

	// 		const followMouse = (e) => {
	// 			if (isCursorOverTarget(e)) {
	// 				$col.classList.add("active");
	// 				$row.classList.add("active");
	// 			} else {
	// 				$col.classList.remove("active");
	// 				$row.classList.remove("active");
	// 			}

	// 			if (circleRef.current) {
	// 				circleRef.current.style.transform = `translate(${e.x - offsetX}px, ${
	// 					e.y - offsetY
	// 				}px)`;
	// 			}
	// 		};

	// 		window.addEventListener("mousemove", followMouse);
	// 		return () => {
	// 			window.removeEventListener("mousemove", followMouse);
	// 		};
	// 	},
	// 	[scale]
	// );

	return (
		<>
			{/* <div className="circle" ref={circleRef}>
				<div className="light" id="light"></div>
				<div className="col"></div>
				<div className="row"></div>
			</div> */}
			<canvas ref={canvasRef}></canvas>
		</>
	);
}

export default App;
