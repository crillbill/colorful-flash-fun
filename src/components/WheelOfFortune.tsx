import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Circle, Group } from "fabric";
import { createWheelSegment } from "./wheel/WheelSegment";
import { createWheelCenter } from "./wheel/WheelCenter";
import { createWheelPointer } from "./wheel/WheelPointer";

interface WheelProps {
  onSpinEnd: (category: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const CATEGORIES = ["Phrases", "Words", "Letters", "Verbs", "All"];
const COLORS = ["#4299E1", "#E53E3E", "#48BB78", "#ECC94B", "#9F7AEA"];

export const WheelOfFortune = ({ onSpinEnd, isSpinning, setIsSpinning }: WheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wheelRef = useRef<FabricCanvas | null>(null);
  const wheelGroupRef = useRef<Group | null>(null);
  const currentRotation = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 400,
      selection: false,
    });

    const centerX = canvas.width! / 2;
    const centerY = canvas.height! / 2;
    const radius = 150;
    const anglePerSegment = (2 * Math.PI) / CATEGORIES.length;

    const wheelGroup = new Group([], {
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });

    const outerCircle = new Circle({
      left: 0,
      top: 0,
      radius: radius + 5,
      fill: 'transparent',
      stroke: '#2D3748',
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    wheelGroup.add(outerCircle);

    CATEGORIES.forEach((category, index) => {
      const { path, text } = createWheelSegment(
        category,
        index,
        anglePerSegment,
        radius,
        COLORS[index]
      );
      wheelGroup.add(path);
      wheelGroup.add(text);
    });

    const { centerCircle, innerCircle } = createWheelCenter();
    wheelGroup.add(centerCircle);
    wheelGroup.add(innerCircle);

    const pointer = createWheelPointer(centerX);

    canvas.add(wheelGroup);
    canvas.add(pointer);
    
    wheelRef.current = canvas;
    wheelGroupRef.current = wheelGroup;

    return () => {
      canvas.dispose();
    };
  }, []);

  const spinWheel = () => {
    if (!wheelRef.current || !wheelGroupRef.current || isSpinning) return;

    setIsSpinning(true);
    const totalRotation = 3600 + Math.random() * 720;
    const duration = 8000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOut = (t: number) => {
        const t1 = t - 1;
        return t1 * t1 * t1 * t1 * t1 + 1;
      };
      
      const currentProgress = easeOut(progress);
      const rotation = currentProgress * totalRotation;
      
      wheelGroupRef.current?.rotate(rotation - currentRotation.current);
      wheelRef.current?.renderAll();
      
      currentRotation.current = rotation;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const finalAngle = (totalRotation % 360) * (Math.PI / 180);
        const segmentAngle = (2 * Math.PI) / CATEGORIES.length;
        const categoryIndex = Math.floor(((2 * Math.PI - (finalAngle % (2 * Math.PI))) / segmentAngle) % CATEGORIES.length);
        
        setIsSpinning(false);
        onSpinEnd(CATEGORIES[categoryIndex].toLowerCase());
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <canvas ref={canvasRef} className="max-w-full" />
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="px-6 py-3 bg-vividPurple text-white rounded-full font-semibold hover:bg-vividPurple/90 disabled:opacity-50 transition-colors"
      >
        {isSpinning ? "Spinning..." : "Spin the Wheel!"}
      </button>
    </div>
  );
};