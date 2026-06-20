/**
 * Run: npx tsx src/scenes/water/compute/shallowWaterCPU.selfcheck.ts
 */
import { ShallowWaterState, createShallowWaterParams } from "./shallowWaterCPU";

const state = new ShallowWaterState(createShallowWaterParams(32, 32));
state.applyImpulse(16, 16, 1);
for (let i = 0; i < 4; i++) state.substep();
const peak = state.maxAbsH();
if (!(peak > 0)) throw new Error(`expected peak > 0, got ${peak}`);
console.log("shallowWaterCPU.selfcheck ok", { peak });
