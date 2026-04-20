import { useEffect, useRef, useState, useCallback } from "react";
import "./App.scss";
import MiniMap from "./components/MiniMap/MiniMap";
import GameClear from "./components/GameClear/GameClear";
import HPBar from "./components/HPBar/HPBar";

// 커스텀 훅 임포트
import { useAudio } from "./hooks/useAudio";
import { useGameEffects } from "./hooks/useGameEffects";
import { useMouseFollow } from "./hooks/useMouseFollow";

function App() {
  const FRAME_DIMENSIONS = {
    width: Math.floor(980 / 4),
    height: Math.floor(645 / 2) - 13,
  };
  const SPEED_LEVELS = [5, 14];
  const INTERVAL_TIMES = [1500, 700, 300];
  const TURN_SPEED = [0.01, 0.05];

  // 메인 상태
  const [isStart, setIsStart] = useState(false);
  const [recalculation, setRecalculation] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [level, setLevelUp] = useState(0);
  const [intervalAnimation, setIntervalAnimation] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);

  // 레프 및 물리 엔진 데이터
  const levelRef = useRef(0);
  const scaleRef = useRef(1);
  const speedUpTextRef = useRef(null);
  const doraemonSizeInMiniMapRef = useRef(17);
  const isSuccessRef = useRef(false);
  const hitCountRef = useRef(0);
  const canvasRef = useRef(null);
  const circleRef = useRef(null);
  const doraemonImageRef = useRef(new Image());
  const bulletImageRef = useRef(new Image());
  const scaleWidth = useRef(FRAME_DIMENSIONS.width * scaleRef.current);
  const scaleHeight = useRef(FRAME_DIMENSIONS.height * scaleRef.current);
  const dirRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const targetDirRef = useRef({ x: 0, y: 0 });

  // 커스텀 훅 사용
  const { playSound } = useAudio();
  const { combo, isShaking, triggerShake, incrementCombo, resetCombo } =
    useGameEffects();

  const isCursorOverTarget = useCallback(
    (e) =>
      e.clientX >= posRef.current.x &&
      e.clientX <= posRef.current.x + scaleWidth.current &&
      e.clientY >= posRef.current.y &&
      e.clientY <= posRef.current.y + scaleHeight.current,
    [],
  );

  const { isCursorOver } = useMouseFollow(
    circleRef,
    isCursorOverTarget,
    recalculation,
  );

  /* 도라에몽 물리 및 방향 로직 */
  const normalizeDir = () => {
    const length = Math.hypot(dirRef.current.x, dirRef.current.y);
    if (length > 0) {
      dirRef.current.x /= length;
      dirRef.current.y /= length;
    }
  };

  const updateDirection = (immediate = false) => {
    const turnSpeed = immediate ? 1 : TURN_SPEED[levelRef.current];
    dirRef.current.x += (targetDirRef.current.x - dirRef.current.x) * turnSpeed;
    dirRef.current.y += (targetDirRef.current.y - dirRef.current.y) * turnSpeed;
    normalizeDir();
  };

  const reverseDirection = (target) => {
    if (target === "x") {
      targetDirRef.current.x =
        -Math.abs(targetDirRef.current.x) * (posRef.current.x <= 0 ? -1 : 1);
    } else {
      targetDirRef.current.y =
        -Math.abs(targetDirRef.current.y) * (posRef.current.y <= 0 ? -1 : 1);
    }
  };

  useEffect(() => {
    scaleWidth.current = FRAME_DIMENSIONS.width * scaleRef.current;
    scaleHeight.current = FRAME_DIMENSIONS.height * scaleRef.current;
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
    return () => window.removeEventListener("resize", resizeWindow);
  }, []);

  /* 게임 메인 루프 (캔버스 애니메이션) */
  useEffect(() => {
    const CYCLE_LOOP_X = [0, 1, 2, 3, 0, 1];
    const CYCLE_LOOP_Y = [0, 0, 0, 0, 1, 1];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let bulletMarks = [];
    let hitMarks = [];
    let currLoopIdx = 0;
    let frameSpeed = 0;
    let animationFrameId;
    let hitEffectFrameId;
    let timeoutId;
    let lastTime;

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
      posRef.current.x =
        Math.random() * (document.body.clientWidth - scaleWidth.current);
      posRef.current.y =
        Math.random() * (document.body.clientHeight - scaleHeight.current);

      const updateTargetDirection = () => {
        const angle = Math.random() * Math.PI * 2;
        targetDirRef.current = { x: Math.cos(angle), y: Math.sin(angle) };
      };

      const setDirectionInterval = () => {
        const customInterval = () => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            updateTargetDirection();
            if (!isSuccessRef.current) customInterval();
            else clearTimeout(timeoutId);
          }, INTERVAL_TIMES[levelRef.current]);
        };
        customInterval();
      };

      const drawCanvas = (timestamp) => {
        if (!isSuccessRef.current) {
          if (timestamp) {
            if (!lastTime) lastTime = timestamp;
            const diffTime = timestamp - lastTime;
            const speedFactor = diffTime / (1000 / 60);

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
                posRef.current.x <= 0 ||
                  posRef.current.x + scaleWidth.current >= canvas.width
                  ? "x"
                  : "y",
              );
              updateDirection(true);
            } else {
              updateDirection();
            }

            posRef.current.x +=
              dirRef.current.x * SPEED_LEVELS[levelRef.current] * speedFactor;
            posRef.current.y +=
              dirRef.current.y * SPEED_LEVELS[levelRef.current] * speedFactor;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBulletMarks();
            drawFrame(posRef.current.x, posRef.current.y);
            drawHitMark();
            lastTime = timestamp;
          }
          animationFrameId = requestAnimationFrame(drawCanvas);
        } else {
          gameClear(posRef.current.x, posRef.current.y);
        }
      };

      updateTargetDirection();
      setDirectionInterval();
      window.addEventListener("click", handleShootWrapper);
      drawCanvas();
    };

    const gameClear = (canvasX, canvasY) => {
      const characterReductionAnimation = () => {
        if (scaleRef.current > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawFrame(canvasX, canvasY);
          scaleRef.current -= 0.005;
          setRecalculation((prev) => !prev);
          animationFrameId = requestAnimationFrame(characterReductionAnimation);
        } else {
          setIsEnd(true);
          setIntervalAnimation(true);
          setInterval(() => setIntervalAnimation((prev) => !prev), 2000);
        }
      };
      characterReductionAnimation();
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
        scaleHeight.current,
      );
      ctx.restore();
    };

    const drawBulletMarks = () => {
      const now = Date.now();
      bulletMarks = bulletMarks.filter((mark) => {
        const elapsed = now - mark.t;
        const totalLifespan = 4000;
        const visibleDuration = 2000;
        if (elapsed < totalLifespan) {
          let alpha =
            elapsed > visibleDuration
              ? 1 -
                (elapsed - visibleDuration) / (totalLifespan - visibleDuration)
              : 1;
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

    const drawHitEffect = (time) => {
      const now = Date.now();
      const elapsed = now - time;
      const alphaTime = 1000;
      if (isSuccessRef.current) return;
      if (elapsed < alphaTime) {
        ctx.save();
        const alpha = 0.1 * (1 - elapsed / alphaTime);
        ctx.fillStyle = `rgba(255, 0, 0, ${alpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        hitEffectFrameId = requestAnimationFrame(() => drawHitEffect(time));
      }
    };

    const drawHitMark = () => {
      hitMarks = hitMarks.filter((mark) => {
        const elapsed = Date.now() - mark.t;
        if (elapsed < 1000) {
          ctx.save();
          ctx.font = "40px 'Sixtyfour Convergence', sans-serif";
          ctx.textAlign = "center";
          mark.y -= 1;
          ctx.fillText("Hit", mark.x, mark.y);
          ctx.restore();
          return true;
        }
        return false;
      });
    };

    const handleShoot = (e) => {
      if (!isStart) return;

      if (isCursorOverTarget(e)) {
        playSound("hit");
        triggerShake();
        incrementCombo();

        if (levelRef.current <= 2) {
          hitMarks.push({ x: e.clientX, y: e.clientY, t: Date.now() });
          hitCountRef.current++;
          levelRef.current = ~~(hitCountRef.current / 35);
          setLevelUp(~~(hitCountRef.current / 35));
          doraemonSizeInMiniMapRef.current -= 0.17;

          if (levelRef.current === 2) isSuccessRef.current = true;
          scaleRef.current -= 0.01;
          setRecalculation((prev) => !prev);
          drawHitEffect(Date.now());
        }
      } else {
        playSound("shot");
        resetCombo();
      }

      bulletMarks.push({
        x: e.clientX,
        y: e.clientY,
        t: Date.now(),
        rotate: Math.random() * 2 * Math.PI,
      });
    };

    // handleShoot를 최신 상태로 유지하기 위한 Ref
    const handleShootRef = { current: handleShoot };

    const handleShootWrapper = (e) => handleShootRef.current(e);

    loadImages();

    return () => {
      window.removeEventListener("click", handleShootWrapper);
      if (timeoutId) clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (hitEffectFrameId) cancelAnimationFrame(hitEffectFrameId);
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [isStart]); // 오직 게임 시작 시에만 실행되도록 설정

  // 레벨업 알림 효과
  useEffect(() => {
    const speedUpText = speedUpTextRef.current;
    if (!speedUpText) return;
    let count = 0;
    let id;
    if (level && level < SPEED_LEVELS.length)
      id = setInterval(() => {
        if (count === 20) {
          clearInterval(id);
          speedUpText.style.visibility = "hidden";
          return;
        }
        count++;
        speedUpText.style.visibility =
          speedUpText.style.visibility === "visible" ? "hidden" : "visible";
      }, 200);
    return () => id && clearInterval(id);
  }, [level]);

  return (
    <div className={isShaking ? "shake" : ""}>
      {isStart && <HPBar hitCountRef={hitCountRef} />}
      {combo > 1 && <div className="combo-text">{combo} COMBO!</div>}

      <div ref={speedUpTextRef} className="speed-up">
        <div className="text">SPEED UP!</div>
      </div>

      <div className="circle" ref={circleRef}>
        <div className={`light ${isLightOn ? "on" : ""}`} id="light"></div>
        <div className={`col ${isCursorOver ? "active" : ""}`}></div>
        <div className={`row ${isCursorOver ? "active" : ""}`}></div>
      </div>

      {!isEnd && <canvas ref={canvasRef}></canvas>}

      {isStart && !isEnd && (
        <MiniMap
          posRef={posRef.current}
          doraemonSizeInMiniMapRef={doraemonSizeInMiniMapRef}
        />
      )}

      {isEnd && <GameClear intervalAnimation={intervalAnimation} />}

      <div className="light-toggle" onClick={() => setIsLightOn(!isLightOn)}>
        {isLightOn ? "🌜" : "💡"}
      </div>

      {!isStart && (
        <div className="before-start">
          <span>🔎 Catch the doraemon 🔫</span>
          <span>
            The game is about shooting with the left mouse button to catch
            Doraemon
          </span>
          <span className="notice">* Mouse usage is recommended</span>
          <span className="notice">
            * Chrome and Firefox browsers are recommended
          </span>
          <button onClick={() => setIsStart(true)}>START</button>
        </div>
      )}
    </div>
  );
}

export default App;
