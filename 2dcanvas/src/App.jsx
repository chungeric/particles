import { useEffect, useRef, useState } from "react";
import { ParticleSystem } from "./particle-system";
import "./App.css";

function App() {
  const canvasRef = useRef(null);
  const particleSystem = useRef(new ParticleSystem());
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  useEffect(() => {
    let raf;
    const ps = particleSystem.current;
    if (canvasRef.current) {
      const drawLoop = () => {
        ps.draw();
        raf = requestAnimationFrame(drawLoop);
      };
      ps.init(canvasRef.current);
      raf = requestAnimationFrame(drawLoop);
      return () => {
        ps.reset()
        cancelAnimationFrame(raf);
      }
    }
  }, [windowWidth, windowHeight]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ps = particleSystem.current;
    const { mouse } = ps;
    const mouse_move_handler = (e) => {
      e.preventDefault();
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      mouse.x = e.offsetX || e.layerX;
      mouse.y = e.offsetY || e.layerY;
    };
    const touch_move_handler = (e) => {
      e.preventDefault();
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.touches[0].pageX - rect.left;
      mouse.y = e.touches[0].pageY - rect.top;
    };
    const mouse_down_handler = (e) => {
      e.preventDefault();
      mouse.down = true;
    };
    const mouse_up_handler = () => {
      mouse.down = false;
    };
    if (canvas) {
      window.addEventListener("mousedown", mouse_down_handler);
      // window.addEventListener("touchstart", touch_start_handler);
      window.addEventListener("mouseup", mouse_up_handler);
      // window.addEventListener("touchend", touch_end_handler);
      canvas.addEventListener("mousemove", mouse_move_handler);
      canvas.addEventListener("touchmove", touch_move_handler);
      return () => {
        window.removeEventListener("mousedown", mouse_down_handler);
        // window.removeEventListener("touchstart", touch_start_handler);
        window.removeEventListener("mouseup", mouse_up_handler);
        // window.removeEventListener("touchend", touch_end_handler);
        canvas.removeEventListener("mousemove", mouse_move_handler);
        canvas.removeEventListener("touchmove", touch_move_handler);
      }
    }
  }, []);
  return <canvas ref={canvasRef}></canvas>;
}

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });
  const handleSize = () => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };
  useEffect(() => {
    handleSize();
    window.addEventListener("resize", handleSize);
    return () => window.removeEventListener("resize", handleSize);
  }, []);
  return windowSize;
};

export default App;
