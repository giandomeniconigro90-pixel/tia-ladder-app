import { EXAMPLES } from './data/examples.js';
export function createSimulation(exIdx = 0) {
  return { exIdx, bits: { ...EXAMPLES[exIdx].initialBits }, timer: { et: 0, q: false, since: null } };
}
export function simulationReducer(state, action) {
  if (action.type === 'example') return createSimulation(action.index);
  const ex = EXAMPLES[state.exIdx];
  const bits = action.type === 'input' ? { ...state.bits, [action.bit]: !state.bits[action.bit] } : state.bits;
  if (!ex.timerBased) return action.type === 'input' ? { ...state, bits: ex.evaluate(bits, state.bits) } : state;
  const now = action.now;
  const input = bits['I0.0'];
  const wasInput = state.bits['I0.0'];
  let { since, q, et } = state.timer;
  if (ex.timerType === 'TOF') {
    if (input) { since = null; et = 0; q = true; }
    else if (wasInput) { since = now; et = 0; q = true; }
    else if (since !== null) { et = Math.min(ex.timerPT, Math.max(0, now - since)); q = et < ex.timerPT; }
  } else {
    if (!input) { since = null; et = 0; q = false; }
    else { if (since === null) since = now; et = Math.min(ex.timerPT, Math.max(0, now - since)); q = et >= ex.timerPT; }
  }
  return { ...state, bits: { ...bits, 'Q0.0': q }, timer: { since, et, q } };
}
