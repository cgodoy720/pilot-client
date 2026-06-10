/**
 * CoachV2NodeTooltip — hover-over robot illustration for each LangGraph node.
 *
 * One base robot character (friendly, consistent) shown across all 8 phases.
 * What varies per phase: body color + one accessory icon (book/pencil/etc) +
 * caption text. Keeps the character identity stable while telegraphing the
 * current job. SVG is inline so it ships zero extra bytes beyond what's
 * already in the JS bundle.
 */

const NODES = {
  init: {
    color: '#4242EA',
    name: 'Init',
    caption: '"Hi! I set you up."',
    detail: 'Loads the builder profile, picks the right difficulty, and writes the opening greeting.',
    accessory: 'sparkles',
  },
  learn: {
    color: '#4242EA',
    name: 'Learn',
    caption: '"Let\'s talk it through."',
    detail: 'Teaches the concept Socratic-style. Adapts to the builder\'s responses. Emits [READY_FOR_APPLY] when they get it.',
    accessory: 'book',
  },
  generateApply: {
    color: '#4242EA',
    name: 'Generate Apply',
    caption: '"Designing your challenge."',
    detail: 'Crafts a fresh application challenge tied to the competency criteria.',
    accessory: 'scroll',
  },
  apply: {
    color: '#4242EA',
    name: 'Apply',
    caption: '"Show me what you got."',
    detail: 'Watches the builder attempt the challenge. Guides without giving the answer. Detects [APPLY_SUBMITTED].',
    accessory: 'pencil',
  },
  grade: {
    color: '#F59E0B',
    name: 'Grade',
    caption: '"Reviewing your work…"',
    detail: 'Scores the response against competency criteria. Returns JSON; never shown to the builder.',
    accessory: 'magnifier',
  },
  remediate: {
    color: '#FB923C',
    name: 'Remediate',
    caption: '"Let\'s patch this."',
    detail: 'Targeted feedback on what was missed before another apply attempt.',
    accessory: 'bandaid',
  },
  complete: {
    color: '#10B981',
    name: 'Complete',
    caption: '"Nice work!"',
    detail: 'Warm closing message + writes the apply outcome. Score ≥ 80 triggers an interview nudge.',
    accessory: 'trophy',
  },
  reflect: {
    color: '#9CA3AF',
    name: 'Reflect',
    caption: '"Saving notes for next time."',
    detail: 'Hidden background pass that updates the builder\'s learning profile after the task ends.',
    accessory: 'disk',
  },
};

// Each accessory is a tiny SVG that sits in the robot's "hand" (bottom-right
// of the body). 16x16 viewBox, designed to read at small sizes.
const ACCESSORIES = {
  sparkles: (
    <g fill="#FBBF24">
      <path d="M8 1 L9 6 L14 7 L9 8 L8 13 L7 8 L2 7 L7 6 Z" />
      <circle cx="13" cy="3" r="1" />
      <circle cx="3" cy="13" r="1" />
    </g>
  ),
  book: (
    <g>
      <rect x="2" y="3" width="12" height="10" rx="1" fill="#F59E0B" stroke="#92400E" strokeWidth="0.5" />
      <line x1="8" y1="3" x2="8" y2="13" stroke="#92400E" strokeWidth="0.5" />
      <line x1="4" y1="6" x2="6.5" y2="6" stroke="#FEF3C7" strokeWidth="0.5" />
      <line x1="4" y1="8" x2="6.5" y2="8" stroke="#FEF3C7" strokeWidth="0.5" />
      <line x1="9.5" y1="6" x2="12" y2="6" stroke="#FEF3C7" strokeWidth="0.5" />
      <line x1="9.5" y1="8" x2="12" y2="8" stroke="#FEF3C7" strokeWidth="0.5" />
    </g>
  ),
  scroll: (
    <g>
      <rect x="3" y="4" width="10" height="8" rx="0.5" fill="#FEF3C7" stroke="#92400E" strokeWidth="0.5" />
      <circle cx="3" cy="4" r="1" fill="#92400E" />
      <circle cx="3" cy="12" r="1" fill="#92400E" />
      <line x1="5" y1="6" x2="11" y2="6" stroke="#92400E" strokeWidth="0.5" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="#92400E" strokeWidth="0.5" />
      <line x1="5" y1="10" x2="9" y2="10" stroke="#92400E" strokeWidth="0.5" />
    </g>
  ),
  pencil: (
    <g>
      <polygon points="3,13 4,10 12,2 14,4 6,12" fill="#FBBF24" stroke="#92400E" strokeWidth="0.5" />
      <polygon points="3,13 4,11 5,12" fill="#1E1E1E" />
      <line x1="11" y1="3" x2="13" y2="5" stroke="#92400E" strokeWidth="0.5" />
    </g>
  ),
  magnifier: (
    <g>
      <circle cx="6.5" cy="6.5" r="4" fill="#FEF3C7" stroke="#92400E" strokeWidth="1.2" />
      <line x1="9.5" y1="9.5" x2="13" y2="13" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
    </g>
  ),
  bandaid: (
    <g>
      <rect x="2" y="6" width="12" height="4" rx="2" fill="#FED7AA" stroke="#9A3412" strokeWidth="0.5" transform="rotate(-20 8 8)" />
      <circle cx="5.5" cy="8.8" r="0.4" fill="#9A3412" />
      <circle cx="7" cy="8.2" r="0.4" fill="#9A3412" />
      <circle cx="8.5" cy="7.5" r="0.4" fill="#9A3412" />
      <circle cx="10" cy="6.8" r="0.4" fill="#9A3412" />
      <rect x="6.5" y="7" width="2" height="2" fill="#FFF" transform="rotate(-20 7.5 8)" />
    </g>
  ),
  trophy: (
    <g>
      <path d="M5 2 L11 2 L11 6 C11 8 10 9 8 9 C6 9 5 8 5 6 Z" fill="#FBBF24" stroke="#92400E" strokeWidth="0.5" />
      <path d="M5 3 L3 3 L3 5 C3 6 4 6.5 5 6.5" fill="none" stroke="#92400E" strokeWidth="0.5" />
      <path d="M11 3 L13 3 L13 5 C13 6 12 6.5 11 6.5" fill="none" stroke="#92400E" strokeWidth="0.5" />
      <rect x="7" y="9" width="2" height="2" fill="#FBBF24" />
      <rect x="5" y="11" width="6" height="2" rx="0.5" fill="#92400E" />
    </g>
  ),
  disk: (
    <g>
      <rect x="2" y="2" width="12" height="12" rx="1" fill="#6B7280" stroke="#374151" strokeWidth="0.5" />
      <rect x="4" y="2" width="8" height="5" fill="#374151" />
      <rect x="9" y="3" width="2" height="3" fill="#9CA3AF" />
      <rect x="4" y="9" width="8" height="5" fill="#9CA3AF" />
      <line x1="5" y1="11" x2="11" y2="11" stroke="#374151" strokeWidth="0.5" />
      <line x1="5" y1="12.5" x2="11" y2="12.5" stroke="#374151" strokeWidth="0.5" />
    </g>
  ),
};

/**
 * RobotFace — the consistent character. 80×80 svg.
 * Body color comes from the node's phase color so the robot "wears" the
 * phase, but the personality (eye shape, smile, antenna) stays identical.
 */
function RobotFace({ color, accessory }) {
  return (
    <svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
      {/* Antenna */}
      <line x1="40" y1="12" x2="40" y2="6" stroke="#1E1E1E" strokeWidth="2" strokeLinecap="round" />
      <circle cx="40" cy="5" r="3" fill={color} stroke="#1E1E1E" strokeWidth="1.5" />
      {/* Head */}
      <rect x="14" y="14" width="52" height="44" rx="10" fill={color} stroke="#1E1E1E" strokeWidth="2" />
      {/* Eye visor */}
      <rect x="20" y="22" width="40" height="16" rx="3" fill="#1E1E1E" />
      {/* Eyes — friendly white circles with a small highlight */}
      <circle cx="30" cy="30" r="4" fill="#FFFFFF" />
      <circle cx="50" cy="30" r="4" fill="#FFFFFF" />
      <circle cx="31.5" cy="28.5" r="1.2" fill={color} />
      <circle cx="51.5" cy="28.5" r="1.2" fill={color} />
      {/* Smile — small upturned curve */}
      <path d="M30 46 Q40 52 50 46" stroke="#1E1E1E" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Body shoulders peek */}
      <rect x="22" y="58" width="36" height="10" rx="3" fill={color} stroke="#1E1E1E" strokeWidth="2" />
      {/* Accessory tile — bottom-right "what they're holding" */}
      <g transform="translate(54, 50)">
        <rect x="-2" y="-2" width="20" height="20" rx="3" fill="#FFFFFF" stroke="#1E1E1E" strokeWidth="1.5" />
        <g transform="translate(0, 0)">
          {ACCESSORIES[accessory]}
        </g>
      </g>
    </svg>
  );
}

/**
 * The full tooltip — robot face + name pill + caption + detail line.
 * Positioned absolutely by the parent (CoachV2FlowDiagram) so this component
 * just renders content.
 */
export default function CoachV2NodeTooltip({ nodeKey }) {
  const node = NODES[nodeKey];
  if (!node) return null;
  return (
    <div className="bg-white border border-[#1E1E1E] rounded-lg shadow-lg p-3 w-64 pointer-events-none">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <RobotFace color={node.color} accessory={node.accessory} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-proxima-bold text-sm text-[#1E1E1E]" style={{ color: node.color }}>
            {node.name}
          </p>
          <p className="font-proxima text-sm text-[#1E1E1E] italic mt-0.5">
            {node.caption}
          </p>
          <p className="font-proxima text-xs text-[#666] mt-2 leading-snug">
            {node.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

// Re-export the node map so the diagram can iterate keys when attaching
// hover handlers.
export { NODES };
