import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { RefreshCw, Brain, BookOpen, Target, ClipboardCheck, MessageSquare, GitBranch, Users, Layers, HelpCircle, Mic, Network, Gauge, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import LoadingState from './shared/LoadingState';

const PHASE_ICONS = {
  learn: BookOpen,
  apply: Target,
  grade: ClipboardCheck,
  remediate: MessageSquare,
};

/**
 * Inline tooltip: HelpCircle icon that shows a tooltip on hover.
 */
const InfoTip = ({ text }) => (
  <span className="relative group inline-flex items-center">
    <HelpCircle className="h-4 w-4 text-[#999] cursor-help" />
    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg bg-[#1E1E1E] text-white text-xs font-proxima leading-relaxed px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 shadow-lg">
      {text}
      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1E1E1E]" />
    </span>
  </span>
);

const TemplateCard = ({ phase, template }) => {
  const Icon = PHASE_ICONS[phase] || BookOpen;

  return (
    <Card className="bg-white border-[#C8C8C8]">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-[#4242EA]" />
          <CardTitle className="font-proxima-bold text-[#1E1E1E]">
            {template.name}
          </CardTitle>
          {phase === 'grade' && (
            <Badge variant="outline" className="text-xs border-amber-400 text-amber-700 bg-amber-50">
              Internal Only
            </Badge>
          )}
        </div>
        <CardDescription className="font-proxima text-[#666]">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full rounded-lg">
          <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
            <pre className="font-mono text-sm text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
              {template.content}
            </pre>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const V2CoachEngineTab = ({ showNotification }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/prompts/v2-coach-engine`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setData(await response.json());
      } else {
        throw new Error('Failed to fetch v2 coach engine data');
      }
    } catch (error) {
      console.error('Error fetching v2 coach engine:', error);
      showNotification('Failed to load V2 Coach Engine data', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState count={3} />;
  if (!data) return null;

  const {
    templates,
    programContext,
    skillTaxonomy,
    graphConfig,
    profileFields,
    onboardingAgent,
    coachv2InlineNodes,
    evalRubric,
  } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <h2 className="font-proxima-bold text-2xl text-[#1E1E1E] mb-2">
            V2 Coach Engine
          </h2>
          <p className="font-proxima text-[#666]">
            The complete context that makes up the v2 coaching engine's "mind" — phase templates, program context, skill taxonomy, and orchestrator configuration.
          </p>
        </div>
        <Button
          onClick={fetchData}
          variant="outline"
          className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#E3E3E3]"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Read-only banner */}
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        <Lock className="h-5 w-5 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <p className="font-proxima-bold text-sm text-amber-900">Read-only</p>
          <p className="font-proxima text-sm text-amber-800">
            This tab shows every prompt, marker, and config the v2 coach engine actually uses in production — sourced from the deployed code at request time. Editing requires DB-backed prompts (planned).
          </p>
        </div>
      </div>

      {/* Graph Flow Overview */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-[#4242EA]" />
            <CardTitle className="font-proxima-bold text-[#1E1E1E]">
              {graphConfig.name}
            </CardTitle>
            <InfoTip text="This is the orchestrator that controls how the AI coach interacts with each builder. Each conversation follows this flow: the coach teaches, then gives a challenge, grades the response, and either completes the task or gives targeted feedback for a retry." />
          </div>
          <CardDescription className="font-proxima text-[#666]">
            {graphConfig.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Flow visualization */}
          <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
            <p className="font-mono text-sm text-[#1E1E1E] mb-3">{graphConfig.flow}</p>
            <div className="flex flex-wrap gap-2">
              {graphConfig.phases.map((phase) => (
                <Badge
                  key={phase}
                  className={`font-proxima text-xs ${
                    phase === 'complete'
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : phase === 'grade'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : phase === 'remediate'
                      ? 'bg-orange-100 text-orange-800 border-orange-300'
                      : 'bg-[#4242EA]/10 text-[#4242EA] border-[#4242EA]/30'
                  }`}
                  variant="outline"
                >
                  {phase}
                </Badge>
              ))}
            </div>
          </div>

          {/* Config details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#F5F5F5] rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <p className="font-proxima text-xs text-[#666]">Max Learn Turns</p>
                <InfoTip text="The maximum number of back-and-forth exchanges during the teaching phase before the coach moves the builder to the apply challenge, even if the readiness signal hasn't been detected." />
              </div>
              <p className="font-proxima-bold text-lg text-[#1E1E1E]">{graphConfig.maxLearnTurns}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <p className="font-proxima text-xs text-[#666]">Max Apply Attempts</p>
                <InfoTip text="How many times a builder can retry the apply challenge if they don't pass. After this many attempts, the task completes with partial credit." />
              </div>
              <p className="font-proxima-bold text-lg text-[#1E1E1E]">{graphConfig.maxApplyAttempts}</p>
            </div>
            <div className="bg-[#F5F5F5] rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <p className="font-proxima text-xs text-[#666]">Pass Threshold</p>
                <InfoTip text="The minimum overall score (out of 100) a builder needs on their apply challenge to pass. Below this, they get remediation and a retry (if attempts remain)." />
              </div>
              <p className="font-proxima-bold text-lg text-[#1E1E1E]">{graphConfig.passThreshold}/100</p>
            </div>
          </div>

          {/* Difficulty thresholds */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <p className="font-proxima text-sm text-[#666]">Difficulty Auto-Selection (from builder profile)</p>
              <InfoTip text="When a builder starts a task, the engine looks at their existing skill levels for the relevant domains and automatically picks the right difficulty. This determines how the coach teaches — simple analogies for beginners, edge cases for advanced." />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {Object.entries(graphConfig.difficultyThresholds).map(([level, desc]) => (
                <div key={level} className="bg-[#F5F5F5] rounded-lg p-2 flex items-center gap-2">
                  <Badge variant="outline" className="font-proxima text-xs capitalize">{level}</Badge>
                  <span className="font-mono text-xs text-[#666]">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* EMA config */}
          <div className="bg-[#F5F5F5] rounded-lg p-3">
            <div className="flex items-center gap-1 mb-1">
              <p className="font-proxima text-xs text-[#666]">Skill Level EMA Update</p>
              <InfoTip text="After each completed task, the builder's skill level for the relevant domains is updated using an Exponential Moving Average. This means recent performance has a 30% influence while historical performance retains 70% weight, so one bad day doesn't tank their level." />
            </div>
            <p className="font-mono text-sm text-[#1E1E1E]">
              new_level = (existing * {graphConfig.skillLevelEma.existingWeight}) + (apply_score * {graphConfig.skillLevelEma.newWeight})
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Phase Templates */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Brain className="h-5 w-5 text-[#4242EA]" />
          <h3 className="font-proxima-bold text-xl text-[#1E1E1E]">Phase Templates</h3>
          <InfoTip text="These are the system prompts sent to the AI for each phase of the conversation. They define how the coach behaves — what it says, what it hides, when it transitions. Variables in {curly_braces} are filled in at runtime with the builder's profile, task content, etc." />
        </div>

        <Tabs defaultValue="learn" className="w-full">
          <TabsList className="bg-white border border-[#C8C8C8] p-1">
            {Object.entries(templates).map(([key, template]) => (
              <TabsTrigger
                key={key}
                value={key}
                className="font-proxima data-[state=active]:bg-[#4242EA] data-[state=active]:text-white"
              >
                {template.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-4">
            {Object.entries(templates).map(([key, template]) => (
              <TabsContent key={key} value={key} className="m-0">
                <TemplateCard phase={key} template={template} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>

      {/* Program Context */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#4242EA]" />
            <CardTitle className="font-proxima-bold text-[#1E1E1E]">
              {programContext.name}
            </CardTitle>
            <InfoTip text="This is injected into the coach's system prompt during the Learn and Remediate phases so it understands what program the builder is in, the philosophy (AI-first), and the trajectory. Without this, the coach would give generic tutoring instead of program-relevant guidance." />
          </div>
          <CardDescription className="font-proxima text-[#666]">
            {programContext.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg p-4">
            <pre className="font-mono text-sm text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
              {programContext.content}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Builder Profile Fields */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-[#4242EA]" />
            <CardTitle className="font-proxima-bold text-[#1E1E1E]">
              {profileFields.name}
            </CardTitle>
            <InfoTip text="Each builder has a profile that the engine reads at the start of every task and writes to after completion. This is how the coach 'remembers' the builder across sessions — their skill levels, how they learn best, and where they've struggled." />
          </div>
          <CardDescription className="font-proxima text-[#666]">
            {profileFields.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(profileFields.fields).map(([field, description]) => (
              <div key={field} className="flex items-start gap-3 bg-[#F5F5F5] rounded-lg p-3">
                <code className="font-mono text-sm text-[#4242EA] bg-white px-2 py-0.5 rounded border border-[#E3E3E3] shrink-0">
                  {field}
                </code>
                <span className="font-proxima text-sm text-[#666]">{description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skill Taxonomy */}
      <Card className="bg-white border-[#C8C8C8]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="font-proxima-bold text-[#1E1E1E]">
              {skillTaxonomy.name}
            </CardTitle>
            <InfoTip text="This mapping connects the fine-grained skill domains used by tasks (like 'css' or 'react') to broader interview focus areas (like 'frontend'). The coach uses it to recommend mock interviews after strong apply performance, and the interview system will use it to calibrate questions based on coach data." />
          </div>
          <CardDescription className="font-proxima text-[#666]">
            {skillTaxonomy.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(skillTaxonomy.focusAreaToSkillDomains).map(([area, domains]) => (
              <div key={area} className="bg-[#F5F5F5] rounded-lg p-3">
                <p className="font-proxima-bold text-sm text-[#1E1E1E] mb-2 capitalize">
                  {area.replace(/_/g, ' ')}
                </p>
                <div className="flex flex-wrap gap-1">
                  {domains.map((domain) => (
                    <Badge
                      key={domain}
                      variant="outline"
                      className="font-mono text-xs bg-white"
                    >
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Onboarding Voice Agent */}
      {onboardingAgent && (
        <Card className="bg-white border-[#C8C8C8]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-[#4242EA]" />
              <CardTitle className="font-proxima-bold text-[#1E1E1E]">
                {onboardingAgent.name}
              </CardTitle>
              <InfoTip text="The Day-0 LiveKit voice agent that runs the 15-20 minute meet-and-greet before the v2 coach takes over. It seeds the builder's profile (background, goals, learning style) and is the same coach persona that will accompany them through the program." />
            </div>
            <CardDescription className="font-proxima text-[#666]">
              {onboardingAgent.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {onboardingAgent.sections.map((section) => (
                <div key={section.key} className="border border-[#E3E3E3] rounded-lg overflow-hidden">
                  <div className="flex items-center gap-2 bg-[#F5F5F5] border-b border-[#E3E3E3] px-3 py-2">
                    <p className="font-proxima-bold text-sm text-[#1E1E1E]">{section.label}</p>
                    {section.isTemplate && (
                      <Badge variant="outline" className="text-xs border-[#4242EA] text-[#4242EA] bg-white">
                        Template — runtime data injected
                      </Badge>
                    )}
                  </div>
                  {section.description && (
                    <p className="font-proxima text-xs text-[#666] px-3 pt-2">{section.description}</p>
                  )}
                  <div className="p-3">
                    <ScrollArea className="max-h-[260px] w-full">
                      <pre className="font-mono text-xs text-[#1E1E1E] whitespace-pre-wrap leading-relaxed bg-white">
                        {section.content || '(empty)'}
                      </pre>
                    </ScrollArea>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* CoachV2 inline node prompts */}
      {Array.isArray(coachv2InlineNodes) && coachv2InlineNodes.length > 0 && (
        <Card className="bg-white border-[#C8C8C8]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Network className="h-5 w-5 text-[#4242EA]" />
              <CardTitle className="font-proxima-bold text-[#1E1E1E]">
                CoachV2 Inline Node Prompts
              </CardTitle>
              <InfoTip text="The v2 coach LangGraph has 8 nodes. Four use the phase templates above (learn / apply / grade / remediate). The other four (init, generateApply, complete, reflect) carry inline system prompts in their .js files — those are surfaced verbatim here so the tab is the single source of truth." />
            </div>
            <CardDescription className="font-proxima text-[#666]">
              Every node the coachV2 LangGraph runs — system prompt source, in-band markers, and per-node caps.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {coachv2InlineNodes.map((node) => (
                <div key={node.node} className="border border-[#E3E3E3] rounded-lg overflow-hidden">
                  <div className="flex items-center flex-wrap gap-2 bg-[#F5F5F5] border-b border-[#E3E3E3] px-3 py-2">
                    <Badge variant="outline" className="font-mono text-xs bg-white">
                      {node.node}
                    </Badge>
                    <p className="font-proxima-bold text-sm text-[#1E1E1E]">{node.label}</p>
                    <code className="font-mono text-xs text-[#666] ml-auto">
                      {node.systemPromptSource}
                    </code>
                  </div>
                  <div className="px-3 py-3 space-y-3">
                    {node.description && (
                      <p className="font-proxima text-sm text-[#666]">{node.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {node.markers && node.markers.length > 0 && (
                        <div>
                          <p className="font-proxima text-xs text-[#666] mb-1">Markers</p>
                          <div className="flex flex-wrap gap-1">
                            {node.markers.map((m) => (
                              <Badge key={m} variant="outline" className="font-mono text-xs bg-amber-50 border-amber-300 text-amber-800">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {node.caps && Object.keys(node.caps).length > 0 && (
                        <div>
                          <p className="font-proxima text-xs text-[#666] mb-1">Caps / Config</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(node.caps).map(([k, v]) => (
                              <Badge key={k} variant="outline" className="font-mono text-xs bg-white">
                                {k}={Array.isArray(v) ? v.join('|') : String(v)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {node.content && (
                      <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg">
                        <ScrollArea className="max-h-[360px] w-full p-3">
                          <pre className="font-mono text-xs text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                            {node.content}
                          </pre>
                        </ScrollArea>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Eval Rubric */}
      {evalRubric && (
        <Card className="bg-white border-[#C8C8C8]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[#4242EA]" />
              <CardTitle className="font-proxima-bold text-[#1E1E1E]">
                {evalRubric.name}
              </CardTitle>
              <InfoTip text="The rubric the v2 coach eval harness uses to judge runs. Each dimension's criterion below is the rubric text fed to the LLM judge. The judge template and simulated-builder template are the full prompts used in services/coachEvalJudges.js + the simulated-builder driver." />
            </div>
            <CardDescription className="font-proxima text-[#666]">
              {evalRubric.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-proxima-bold text-sm text-[#1E1E1E] mb-2">Judge Dimensions</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(evalRubric.dimensions || []).map((d) => (
                  <div key={d.key} className="bg-[#F5F5F5] rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="font-mono text-xs bg-white">
                        {d.key}
                      </Badge>
                      <p className="font-proxima-bold text-sm text-[#1E1E1E]">{d.label}</p>
                    </div>
                    {d.description && (
                      <p className="font-proxima text-xs text-[#666] mb-2">{d.description}</p>
                    )}
                    <p className="font-proxima text-sm text-[#1E1E1E] leading-relaxed">
                      {d.criterion}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-proxima-bold text-sm text-[#1E1E1E] mb-2">Judge Template</p>
              <p className="font-proxima text-xs text-[#666] mb-2">prompts/eval/judge.md — the system prompt every dimension's LLM judge receives, with the per-dimension rubric substituted in.</p>
              <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg">
                <ScrollArea className="max-h-[360px] w-full p-3">
                  <pre className="font-mono text-xs text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                    {evalRubric.judgeTemplate || '(template missing)'}
                  </pre>
                </ScrollArea>
              </div>
            </div>

            <div>
              <p className="font-proxima-bold text-sm text-[#1E1E1E] mb-2">Simulated Builder Template</p>
              <p className="font-proxima text-xs text-[#666] mb-2">prompts/eval/simulated-builder.md — the persona-driven prompt the harness uses to drive each coach run headlessly.</p>
              <div className="bg-[#F5F5F5] border border-[#E3E3E3] rounded-lg">
                <ScrollArea className="max-h-[360px] w-full p-3">
                  <pre className="font-mono text-xs text-[#1E1E1E] whitespace-pre-wrap leading-relaxed">
                    {evalRubric.simulatedBuilderTemplate || '(template missing)'}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default V2CoachEngineTab;
