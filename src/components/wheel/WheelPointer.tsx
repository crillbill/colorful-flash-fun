import { Triangle, Shadow } from "fabric";

export const createWheelPointer = (centerX: number) => {
  return new Triangle({
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
      affectStroke: false,
      includeDefaultValues: true,
      nonScaling: false
    })
  });
};