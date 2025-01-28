import { Circle, Shadow } from "fabric";

export const createWheelCenter = () => {
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
    shadow: new Shadow({
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

  return { centerCircle, innerCircle };
};