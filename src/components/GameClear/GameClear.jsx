import React from "react";
import "./gameClear.scss";

const GameClear = ({ intervalAnimation }) => {
	return (
		<div className={`game-clear`}>
			{["G", "A", "M", "E", "", "C", "L", "E", "A", "R"].map((letter, index) => (
				<div key={"letter" + index} className={`text ${intervalAnimation ? "start" : ""}`}>
					{letter === "" ? "\u00A0" : letter}
				</div>
			))}
		</div>
	);
};

export default GameClear;
