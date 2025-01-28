import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Path, Circle, Text, Triangle, Shadow } from "fabric";

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
  const currentRotation = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: 400,
      height: 400,
      selection: false,
    });

    // Create wheel segments
    const centerX = canvas.width! / 2;
    const centerY = canvas.height! / 2;
    const radius = 150;
    const anglePerSegment = (2 * Math.PI) / CATEGORIES.length;

    // Add outer circle for border
    const outerCircle = new Circle({
      left: centerX,
      top: centerY,
      radius: radius + 5,
      fill: 'transparent',
      stroke: '#2D3748',
      strokeWidth: 3,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });
    canvas.add(outerCircle);

    CATEGORIES.forEach((category, index) => {
      // Create segment with border
      const startAngle = index * anglePerSegment;
      const endAngle = (index + 1) * anglePerSegment;

      const path = new Path(createArcPath(centerX, centerY, radius, startAngle, endAngle), {
        fill: COLORS[index],
        stroke: '#2D3748',
        strokeWidth: 1,
        selectable: false,
        shadow: new Shadow({
          color: 'rgba(0,0,0,0.2)',
          blur: 4,
          offsetX: 2,
          offsetY: 2,
        }),
      });

      // Add text with better positioning and rotation
      const textAngle = startAngle + anglePerSegment / 2;
      const textRadius = radius * 0.65; // Position text closer to outer edge
      const text = new Text(category, {
        left: centerX + textRadius * Math.cos(textAngle),
        top: centerY + textRadius * Math.sin(textAngle),
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#2D3748',
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center',
        angle: (textAngle * 180) / Math.PI + 90,
        selectable: false,
      });

      canvas.add(path, text);
    });

    // Add center decoration
    const centerCircle = new Circle({
      left: centerX,
      top: centerY,
      radius: 20,
      fill: '#2D3748',
      stroke: '#1A202C',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      shadow: new Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 2,
        offsetY: 2,
      }),
    });

    const innerCircle = new Circle({
      left: centerX,
      top: centerY,
      radius: 10,
      fill: '#A0AEC0',
      originX: 'center',
      originY: 'center',
      selectable: false,
    });

    // Add pointer
    const pointer = new Triangle({
      left: centerX,
      top: 30,
      width: 20,
      height: 30,
      fill: '#E53E3E',
      angle: 180,
      originX: 'center',
      originY: 'center',
      selectable: false,
      shadow: new Shadow({
        color: 'rgba(0,0,0,0.2)',
        blur: 4,
        offsetX: 0,
        offsetY: 2,
      }),
    });

    canvas.add(centerCircle, innerCircle, pointer);
    wheelRef.current = canvas;

    return () => {
      canvas.dispose();
    };
  }, []);

  const createArcPath = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = {
      x: cx + r * Math.cos(startAngle),
      y: cy + r * Math.sin(startAngle),
    };
    const end = {
      x: cx + r * Math.cos(endAngle),
      y: cy + r * Math.sin(endAngle),
    };

    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";
    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", r, r, 0, largeArcFlag, 1, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const spinWheel = () => {
    if (!wheelRef.current || isSpinning) return;

    setIsSpinning(true);
    const canvas = wheelRef.current;
    const totalRotation = 3600 + Math.random() * 720; // More rotations for longer spin
    const duration = 8000; // 8 seconds for longer spin
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Enhanced easing function for more realistic deceleration
      const easeOut = (t: number) => {
        const t1 = t - 1;
        return t1 * t1 * t1 * t1 * t1 + 1;
      };
      
      const currentProgress = easeOut(progress);
      const rotation = currentProgress * totalRotation;
      
      canvas.getObjects().forEach(obj => {
        if (obj.type !== 'triangle') { // Don't rotate the pointer
          obj.rotate(rotation - currentRotation.current);
        }
      });
      canvas.renderAll();
      
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