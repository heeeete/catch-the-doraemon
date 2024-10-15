import { useEffect, useRef } from "react";
import "./App.css";

function App() {
	const canvasRef = useRef(null);

	useEffect(function canvasInit() {
		if (canvasRef) {
			canvasRef.current.width = document.body.clientWidth;
			canvasRef.current.height = document.body.clientHeight;
		}
	}, []);

	useEffect(
		function loadImage() {
			const cycleLoop = [0, 1, 0, 2];
			let currLoopIdx = 0;
			let frameCount = 0;
			const canvas = canvasRef.current;
			const ctx = canvas.getContext("2d");
			const scale = 2;
			const width = 16;
			const height = 18;
			const scaleWidth = width * scale;
			const scaleHeight = height * scale;
			const img = new Image();
			img.src =
				"https://opengameart.org/sites/default/files/Green-Cap-Character-16x18.png";
			img.onload = function () {
				init();
			};

			const drawFrame = (frameX, frameY, canvasX, canvasY) => {
				ctx.drawImage(
					img,
					frameX * width,
					frameY * height,
					width,
					height,
					canvasX,
					canvasY,
					scaleWidth,
					scaleHeight
				);
			};

			const step = () => {
				frameCount++;
				if (frameCount < 15) return requestAnimationFrame(step);

				ctx.clearRect(
					0,
					0,
					document.body.clientWidth,
					document.body.clientHeight
				);
				frameCount = 0;
				drawFrame(cycleLoop[currLoopIdx++], 0, 0, 0);
				if (currLoopIdx >= cycleLoop.length) currLoopIdx = 0;
				requestAnimationFrame(step);
			};

			const init = () => {
				step();
			};
		},
		[canvasRef]
	);

	return (
		<div>
			<canvas ref={canvasRef}></canvas>
		</div>
	);
}

export default App;
