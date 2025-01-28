import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Path, Circle, Text, Triangle, Group } from "fabric";

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

    // Create a group for the wheel elements
    const wheelGroup = new Group([], {
      left: centerX,
      top: centerY,
      originX: 'center',
      originY: 'center',
      selectable: false,
    });

    // Add outer circle for border
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
      const startAngle = index * anglePerSegment;
      const endAngle = (index + 1) * anglePerSegment;

      const path = new Path(createArcPath(0, 0, radius, startAngle, endAngle), {
        fill: COLORS[index],
        stroke: '#2D3748',
        strokeWidth: 1,
        selectable: false,
        shadow: new fabric.Shadow({
          color: 'rgba(0,0,0,0.2)',
          blur: 4,
          offsetX: 2,
          offsetY: 2,
          affectStroke: false,
          includeDefaultValues: true,
          nonScaling: false
        })
      });

      const textAngle = startAngle + anglePerSegment / 2;
      const textRadius = radius * 0.65;
      const text = new Text(category, {
        left: textRadius * Math.cos(textAngle),
        top: textRadius * Math.sin(textAngle),
        fontSize: 18,
        fontWeight: 'bold',
        fill: '#2D3748',
        fontFamily: 'Arial',
        originX: 'center',
        originY: 'center',
        angle: (textAngle * 180) / Math.PI + 90,
        selectable: false,
      });

      wheelGroup.add(path);
      wheelGroup.add(text);
    });

    // Add center decoration
    const centerCircle = new Circle({
      left: 0,
      top: 0,
      radius: 20,
      fill: '#2D3748',
      stroke: '#1A202C',
      strokeWidth: 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 2,
        offsetY: 2,
        affectStroke: false,
        includeDefaultValues: true,
        nonScaling: false
      })
    });

    const innerCircle = new Circle({
      left: 0,
      top: 0,
      radius: 10,
      fill: '#A0AEC0',
      originX: 'center',
      originY: 'center',
      selectable: false,
    });

    wheelGroup.add(centerCircle);
    wheelGroup.add(innerCircle);

    // Add pointer (outside the wheel group since it shouldn't rotate)
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
      shadow: new fabric.Shadow({
        color: 'rgba(0,0,0,0.2)',
        blur: 4,
        offsetX: 0,
        offsetY: 2,
        affectStroke: false,
        includeDefaultValues: true,
        nonScaling: false
      })
    });

    canvas.add(wheelGroup);
    canvas.add(pointer);
    
    wheelRef.current = canvas;
    wheelGroupRef.current = wheelGroup;

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