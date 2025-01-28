import { Path, Text, Shadow } from "fabric";

export const createWheelSegment = (
  category: string,
  index: number,
  anglePerSegment: number,
  radius: number,
  color: string
) => {
  const startAngle = index * anglePerSegment;
  const endAngle = (index + 1) * anglePerSegment;

  const path = new Path(createArcPath(0, 0, radius, startAngle, endAngle), {
    fill: color,
    stroke: '#2D3748',
    strokeWidth: 1,
    selectable: false,
    shadow: new Shadow({
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

  return { path, text };
};

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