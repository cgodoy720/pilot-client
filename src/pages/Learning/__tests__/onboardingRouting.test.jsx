import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

/**
 * Contract-level routing test for the onboarding task type.
 *
 * Learning.jsx (~1850 lines) drives its interface selection through a fixed
 * if/else-if chain over the current task:
 *
 *   isCurrentTaskSurvey()      → <SurveyInterface>      (by feedback_slot)
 *   isCurrentTaskAssessment()  → <AssessmentInterface>  (task_type === 'assessment')
 *   isCurrentTaskBreak()       → <BreakInterface>       (task_type === 'break')
 *   isCurrentTaskOnboarding()  → <OnboardingInterface>  (task_type === 'onboarding')
 *   else                       → Chat Interface + DeliverablePanel
 *
 * The DeliverablePanel (deliverable / peer-feedback surface) is guarded by
 *   task && !isCurrentTaskSurvey() && !isCurrentTaskAssessment()
 *        && !isCurrentTaskBreak() && !isCurrentTaskOnboarding()
 *
 * Rendering the full Learning page is impractical in a unit test — it pulls in
 * React Query, the router, auth/nav stores, SSE streaming, and a dozen child
 * surfaces. So this test pins the *predicate + dispatch contract* directly:
 * the predicate functions are copied verbatim from Learning.jsx and exercised
 * against representative tasks, and a tiny renderer that mirrors Learning.jsx's
 * exact branch order asserts which interface mounts (and that the deliverable
 * guard excludes onboarding). If Learning.jsx's branch order or predicates
 * change, update this mirror to match.
 */

// --- Stand-in interfaces (the real ones are heavy; identity is all we assert).
const SurveyInterface = () => <div data-testid="survey-interface" />;
const AssessmentInterface = () => <div data-testid="assessment-interface" />;
const BreakInterface = () => <div data-testid="break-interface" />;
const OnboardingInterface = () => <div data-testid="onboarding-interface" />;
const ChatInterface = () => <div data-testid="chat-interface" />;
const DeliverablePanel = () => <div data-testid="deliverable-panel" />;

// --- Predicates copied verbatim from Learning.jsx (kept in sync intentionally).
const isCurrentTaskSurvey = (task) => {
  if (!task) return false;
  return (
    task?.feedback_slot &&
    typeof task.feedback_slot === 'string' &&
    task.feedback_slot !== 'none'
  );
};
const isCurrentTaskAssessment = (task) => {
  if (!task) return false;
  return task?.task_type === 'assessment';
};
const isCurrentTaskBreak = (task) => {
  if (!task) return false;
  return task?.task_type === 'break';
};
const isCurrentTaskOnboarding = (task) => task?.task_type === 'onboarding';

// --- Mirror of Learning.jsx's interface-selection chain + deliverable guard.
function LearningInterfaceRouter({ task }) {
  const showDeliverablePanel =
    !!task &&
    !isCurrentTaskSurvey(task) &&
    !isCurrentTaskAssessment(task) &&
    !isCurrentTaskBreak(task) &&
    !isCurrentTaskOnboarding(task);

  let body;
  if (isCurrentTaskSurvey(task)) {
    body = <SurveyInterface />;
  } else if (isCurrentTaskAssessment(task)) {
    body = <AssessmentInterface />;
  } else if (isCurrentTaskBreak(task)) {
    body = <BreakInterface />;
  } else if (isCurrentTaskOnboarding(task)) {
    body = <OnboardingInterface />;
  } else {
    body = <ChatInterface />;
  }

  return (
    <>
      {body}
      {showDeliverablePanel && <DeliverablePanel />}
    </>
  );
}

describe('Learning interface routing — onboarding contract', () => {
  it('maps task_type "onboarding" to OnboardingInterface and excludes other interfaces', () => {
    render(<LearningInterfaceRouter task={{ id: 't1', task_type: 'onboarding' }} />);

    expect(screen.getByTestId('onboarding-interface')).toBeInTheDocument();
    expect(screen.queryByTestId('survey-interface')).not.toBeInTheDocument();
    expect(screen.queryByTestId('assessment-interface')).not.toBeInTheDocument();
    expect(screen.queryByTestId('break-interface')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-interface')).not.toBeInTheDocument();
  });

  it('excludes the onboarding task from the deliverable / peer-feedback guard', () => {
    render(<LearningInterfaceRouter task={{ id: 't1', task_type: 'onboarding' }} />);

    // Onboarding is voice-first — no DeliverablePanel.
    expect(screen.queryByTestId('deliverable-panel')).not.toBeInTheDocument();
  });

  it('does not route non-onboarding task types to OnboardingInterface', () => {
    const cases = [
      { task: { id: 'a', task_type: 'assessment' }, testId: 'assessment-interface' },
      { task: { id: 'b', task_type: 'break' }, testId: 'break-interface' },
      { task: { id: 's', feedback_slot: 'eod' }, testId: 'survey-interface' },
      { task: { id: 'c', task_type: 'lesson' }, testId: 'chat-interface' },
    ];

    for (const { task, testId } of cases) {
      const { unmount } = render(<LearningInterfaceRouter task={task} />);
      expect(screen.getByTestId(testId)).toBeInTheDocument();
      expect(screen.queryByTestId('onboarding-interface')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('renders the deliverable panel for a regular (chat) task but not for survey/assessment/break/onboarding', () => {
    // Regular chat task → deliverable panel present.
    const { unmount } = render(
      <LearningInterfaceRouter task={{ id: 'c', task_type: 'lesson' }} />
    );
    expect(screen.getByTestId('deliverable-panel')).toBeInTheDocument();
    unmount();

    // The four special interfaces all suppress the deliverable panel.
    const guarded = [
      { id: 's', feedback_slot: 'eod' },
      { id: 'a', task_type: 'assessment' },
      { id: 'b', task_type: 'break' },
      { id: 'o', task_type: 'onboarding' },
    ];
    for (const task of guarded) {
      const r = render(<LearningInterfaceRouter task={task} />);
      expect(screen.queryByTestId('deliverable-panel')).not.toBeInTheDocument();
      r.unmount();
    }
  });

  it('predicate isCurrentTaskOnboarding is true only for task_type "onboarding"', () => {
    expect(isCurrentTaskOnboarding({ task_type: 'onboarding' })).toBe(true);
    expect(isCurrentTaskOnboarding({ task_type: 'assessment' })).toBe(false);
    expect(isCurrentTaskOnboarding({ task_type: 'break' })).toBe(false);
    expect(isCurrentTaskOnboarding({ feedback_slot: 'eod' })).toBeFalsy();
    expect(isCurrentTaskOnboarding(undefined)).toBeFalsy();
  });
});
