import { useRef } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null);
  return (
    <canvas ref={canvasRef}></canvas>
  )
}

export default App
