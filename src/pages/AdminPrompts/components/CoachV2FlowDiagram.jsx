import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import CoachV2NodeTooltip, { NODES } from './CoachV2NodeTooltip';

/**
 * CoachV2FlowDiagram — Mermaid-rendered SVG of the V2 coach LangGraph flow,
 * with hover-over robot-illustration tooltips for each node.
 *
 * Spec mirrors graphs/coachV2/controller.js + edges.js (test-pilot-server):
 *   init → learn → generateApply → apply → grade → complete → reflect
 *                                            └── fail ──→ remediate ──→ (back to generateApply)
 *
 * Lives next to the code so the diagram stays in sync.
 */

// Horizontal left-to-right flow. Linear happy path with one remediation
// loop arcing back from Remediate to Generate Apply. No decision diamonds —
// the routing logic lives in graphs/coachV2/edges.js; this is the bird's-eye
// process view, not a detailed state machine.
const FLOW_SPEC = `flowchart LR
  init["Init"]:::node --> learn["Learn"]:::node
  learn --> generateApply["Generate Apply"]:::node
  generateApply --> apply["Apply"]:::node
  apply --> grade["Grade"]:::node
  grade --> complete["Complete"]:::node
  complete --> reflect["Reflect"]:::node
  grade -.->|"fail"| remediate["Remediate"]:::branch
  remediate -.->|"retry"| generateApply

  classDef node fill:#4242EA,stroke:#3232BA,color:#ffffff,stroke-width:2px,rx:8,ry:8;
  classDef branch fill:#FB923C,stroke:#C2410C,color:#ffffff,stroke-width:2px,rx:8,ry:8;
`;

let mermaidInitialized = false;

export default function CoachV2FlowDiagram() {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  // hoveredNode: which NODES key the mouse is currently over (null = none)
  // tooltipPos: viewport coords where the tooltip should render (above the node)
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            fontFamily: '"Proxima Nova", "Helvetica Neue", Arial, sans-serif',
            securityLevel: 'strict',
            flowchart: {
              htmlLabels: true,
              curve: 'basis',
              nodeSpacing: 50,
              rankSpacing: 60,
              padding: 20,
            },
            themeVariables: {
              primaryColor: '#4242EA',
              primaryTextColor: '#ffffff',
              primaryBorderColor: '#3232BA',
              lineColor: '#1E1E1E',
              secondaryColor: '#F5F5F5',
              tertiaryColor: '#ffffff',
              background: '#ffffff',
              fontSize: '14px',
            },
          });
          mermaidInitialized = true;
        }

        // Unique id per render so re-mounts don't collide.
        const id = `coach-v2-flow-${Math.floor(performance.now())}`;
        const { svg } = await mermaid.render(id, FLOW_SPEC);
        if (cancelled) return;
        if (!containerRef.current) return;

        containerRef.current.innerHTML = svg;

        // Attach hover handlers to each node. We match by LABEL TEXT rather
        // than by the auto-generated id (which has varied across Mermaid
        // versions). Walk every `g.node` and look up its visible text in
        // labelToKey. Robust across minor Mermaid version bumps.
        const labelToKey = Object.entries(NODES).reduce((acc, [key, meta]) => {
          // Normalize the display label so matching survives whitespace +
          // case differences. NODES[key].name is the canonical UI label.
          acc[meta.name.toLowerCase().trim()] = key;
          return acc;
        }, {});
        const nodeEls = containerRef.current.querySelectorAll('g.node');
        nodeEls.forEach((el) => {
          const labelText = (el.textContent || '').toLowerCase().trim();
          const key = labelToKey[labelText];
          if (!key) return;
          el.style.cursor = 'pointer';
          const showTip = () => {
            const rect = el.getBoundingClientRect();
            setHoveredNode(key);
            setTooltipPos({
              x: rect.left + rect.width / 2,
              y: rect.top,
            });
          };
          const hideTip = () => setHoveredNode((cur) => (cur === key ? null : cur));
          el.addEventListener('mouseenter', showTip);
          el.addEventListener('mouseleave', hideTip);
        });
      } catch (err) {
        console.error('Mermaid render failed:', err);
        if (!cancelled) setError(err.message);
      }
    }

    render();
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm font-proxima text-amber-900">
        Diagram failed to render: {error}
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="w-full overflow-x-auto flex justify-center bg-white rounded-lg p-2"
        aria-label="V2 Coach LangGraph flow diagram"
      />
      {/* Tooltip overlay — fixed-position so it floats above the diagram and
          isn't clipped by the surrounding card's overflow. */}
      {hoveredNode && (
        <div
          className="fixed z-50 transition-opacity duration-100"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, calc(-100% - 10px))',
          }}
        >
          <CoachV2NodeTooltip nodeKey={hoveredNode} />
          {/* Down-pointing arrow */}
          <div className="flex justify-center">
            <div
              className="w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid #1E1E1E',
                marginTop: '-1px',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
