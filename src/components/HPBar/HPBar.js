import "./hpBar.scss";

export default function HPBar({ hitCountRef }) {
	return (
		<div className="parent">
			<progress className="hp-bar" min={0} max={70} value={70 - hitCountRef.current}></progress>
		</div>
	);
}
