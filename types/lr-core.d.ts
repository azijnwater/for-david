declare module "lr-core/line-rider-engine" {
  export type Vector = { x: number; y: number };
  export type LineData = {
    id: number;
    type: 0 | 1 | 2;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    flipped?: boolean;
    leftExtended?: boolean;
    rightExtended?: boolean;
  };
  export type Line = { id: number; toJSON(): LineData };
  export type Rider = {
    position: Vector;
    velocity: Vector;
    get(id: string): { pos: Vector; vel: Vector; framesSinceUnbind: number };
  };
  export default class LineRiderEngine {
    setStart(position?: Vector, velocity?: Vector): LineRiderEngine;
    addLine(line: Line | Line[]): LineRiderEngine;
    getRider(frame: number): Rider;
    toJSON(): {
      start: { position: Vector; velocity: Vector };
      lines: LineData[];
    };
  }
  export function createLineFromJson(line: LineData): Line;
  export const LineTypes: { SOLID: 0; ACC: 1; SCENERY: 2 };
}
