import { useRef, useEffect } from "react";
import "./miniMap.css";

export default function MiniMap({ posRef, miniMapCharSizeRef }) {
	const canvasRef = useRef(null);
	const img = useRef(new Image());

	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		img.current.src = "/smallDo.png";
		img.current.onload = () => {
			requestAnimationFrame(init);
		};

		const drawCanvas = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const PosX = posRef.x / 7;
			const PosY = posRef.y / 7;
			const size = miniMapCharSizeRef.current;

			// 얼굴
			ctx.beginPath();
			ctx.ellipse(size + PosX, size + PosY, size, size * 0.93, 0, 0, Math.PI * 2);
			ctx.fillStyle = "#60BBD5";
			ctx.fill();

			// 흰색 수염
			ctx.beginPath();
			ctx.ellipse(size + PosX, size + size * 0.3 + PosY, size * 0.8, size * 0.6, 0, 0, Math.PI * 2);
			ctx.fillStyle = "white";
			ctx.fill();

			/*
			~ 1 가운데 수염
			~ 3 윗 수염
			~ 아랫 수염
			*/
			ctx.lineWidth = 0.2;
			const beards = [
				[size * 0.9 + PosX, size * 1.3 + PosY, size + PosX - size, size * 1.3 + PosY],
				[size * 1.2 + PosX, size * 1.3 + PosY, size + PosX + size, size * 1.3 + PosY],
				[size * 0.9 + PosX, size * 1.2 + PosY, size + PosX - size, size + PosY],
				[size * 1.2 + PosX, size * 1.2 + PosY, size + PosX + size, size + PosY],
				[size * 0.9 + PosX, size * 1.4 + PosY, size + PosX - size, size * 1.6 + PosY],
				[size * 1.2 + PosX, size * 1.4 + PosY, size + PosX + size, size * 1.6 + PosY],
			];

			for (const beard of beards) {
				ctx.beginPath();
				ctx.moveTo(beard[0], beard[1]);
				ctx.lineTo(beard[2], beard[3]);
				ctx.stroke();
			}

			// 왼쪽 눈 -> 눈동자 -> 반사광 -> 오른쪽 ... 순
			const eyes = [
				[size * 0.8 + PosX, size * 0.8 + PosY, size / 4, size / 3],
				[size * 0.8 + size / 8 + PosX, size * 0.8 + PosY, size / 10, size / 8],
				[size * 0.8 + size / 8 + PosX, size * 0.8 + PosY, size / 20, size / 18, 0, 0, Math.PI * 2],
				[size * 0.8 + size / 2 + PosX, size * 0.8 + PosY, size / 4, size / 3],
				[size * 0.8 + size / 2.5 + PosX, size * 0.8 + PosY, size / 10, size / 8, 0, 0, Math.PI * 2],
				[size * 0.8 + size / 2.5 + PosX, size * 0.8 + PosY, size / 20, size / 18],
			];

			eyes.forEach((eye, idx) => {
				ctx.beginPath();
				ctx.ellipse(eye[0], eye[1], eye[2], eye[3], 0, 0, Math.PI * 2);
				ctx.stroke();
				ctx.fillStyle = idx === 1 || idx === 4 ? "black" : "white";
				ctx.fill();
			});

			// 코
			ctx.beginPath();
			ctx.arc(size + PosX, size * 1.3 + PosY, size * 0.2, 0, Math.PI * 2);
			ctx.fillStyle = "red";
			ctx.fill();

			// 코 (반사광)
			ctx.beginPath();
			ctx.arc(size * 1.1 + PosX, size * 1.28 + PosY, size * 0.07, 0, Math.PI * 2);
			ctx.fillStyle = "white";
			ctx.fill();
		};

		const init = () => {
			drawCanvas();
			requestAnimationFrame(init);
		};
	}, []);

	useEffect(() => {
		const resizeWindow = () => {
			if (canvasRef.current) {
				canvasRef.current.width = document.body.clientWidth / 7;
				canvasRef.current.height = document.body.clientHeight / 7;
			}
		};

		resizeWindow();
		window.addEventListener("resize", resizeWindow);
		return () => {
			window.removeEventListener("resize", resizeWindow);
		};
	}, []);
	return <canvas ref={canvasRef} className="mini-map"></canvas>;
}