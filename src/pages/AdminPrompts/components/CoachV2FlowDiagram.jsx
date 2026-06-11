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
//
// SECURITY: FLOW_SPEC MUST remain a static, hardcoded template literal — NEVER
// interpolate user input, props, server-supplied content, or runtime data
// into it. Mermaid is initialized with securityLevel:'strict' below AND the
// SVG is injected via dangerouslySetInnerHTML, but those mitigations only
// cover what Mermaid catches. If user-controlled text ever flows into this
// constant, it becomes a direct XSS vector at the SVG-injection point.
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
  // svgMarkup: the rendered Mermaid SVG string. Stored in state so React
  // owns its insertion via dangerouslySetInnerHTML — that's a flagged audit
  // surface a code scanner will see, vs. a plain ref.innerHTML write which
  // is invisible to most static analyzers. FLOW_SPEC is a hardcoded constant
  // (no user-controlled input) and mermaid is configured with
  // securityLevel:'strict', so the actual XSS risk is nil today; this is
  // about making the injection point auditable for future code.
  const [svgMarkup, setSvgMarkup] = useState('');
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
        setSvgMarkup(svg);
      } catch (err) {
        console.error('Mermaid render failed:', err);
        if (!cancelled) setError(err.message);
      }
    }

    render();
    return () => { cancelled = true; };
  }, []);

  // After React commits the svg into the container, attach hover handlers
  // to each <g.node>. We match by LABEL TEXT rather than the auto-generated
  // id (which varies across Mermaid versions). Re-runs whenever the svg
  // changes (e.g., on remount or hot-reload).
  useEffect(() => {
    if (!svgMarkup || !containerRef.current) return;
    const labelToKey = Object.entries(NODES).reduce((acc, [key, meta]) => {
      acc[meta.name.toLowerCase().trim()] = key;
      return acc;
    }, {});
    const nodeEls = containerRef.current.querySelectorAll('g.node');
    const cleanups = [];
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
      cleanups.push(() => {
        el.removeEventListener('mouseenter', showTip);
        el.removeEventListener('mouseleave', hideTip);
      });
    });
    return () => cleanups.forEach((fn) => fn());
  }, [svgMarkup]);

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
        dangerouslySetInnerHTML={{ __html: svgMarkup }}
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
