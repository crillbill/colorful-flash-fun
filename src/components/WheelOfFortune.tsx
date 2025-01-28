import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Path, Circle, Text } from "fabric";

interface WheelProps {
  onSpinEnd: (category: string) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

const CATEGORIES = ["Phrases", "Words", "Letters", "Verbs", "All"];
const COLORS = ["#F4F1FF", "#E8F4FF", "#FFF1F8", "#F2FCE2", "#FEF7CD"];

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

    CATEGORIES.forEach((category, index) => {
      // Create segment
      const startAngle = index * anglePerSegment;
      const endAngle = (index + 1) * anglePerSegment;

      const path = new Path(createArcPath(centerX, centerY, radius, startAngle, endAngle), {
        fill: COLORS[index],
        selectable: false,
      });

      // Add text
      const textAngle = startAngle + anglePerSegment / 2;
      const text = new Text(category, {
        left: centerX + (radius * 0.7) * Math.cos(textAngle),
        top: centerY + (radius * 0.7) * Math.sin(textAngle),
        fontSize: 16,
        fontFamily: "Arial",
        originX: "center",
        originY: "center",
        angle: (textAngle * 180) / Math.PI + 90,
        selectable: false,
      });

      canvas.add(path, text);
    });

    // Add center circle
    const centerCircle = new Circle({
      left: centerX,
      top: centerY,
      radius: 10,
      fill: "#6B46C1",
      originX: "center",
      originY: "center",
      selectable: false,
    });
    canvas.add(centerCircle);

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
    const totalRotation = 3600 + Math.random() * 360; // Spin multiple times + random
    const duration = 5000;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentProgress = easeOut(progress);
      
      const rotation = currentProgress * totalRotation;
      canvas.getObjects().forEach(obj => {
        obj.rotate(rotation - currentRotation.current);
      });
      canvas.renderAll();
      
      currentRotation.current = rotation;

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Calculate final category
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