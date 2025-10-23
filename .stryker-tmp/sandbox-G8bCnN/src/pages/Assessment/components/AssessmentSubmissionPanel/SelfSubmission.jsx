// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import './AssessmentSubmissionPanel.css';

// Question data
const ASSESSMENT_QUESTIONS = stryMutAct_9fa48("12799") ? [] : (stryCov_9fa48("12799"), [// Section 1: Product & Business Thinking
stryMutAct_9fa48("12800") ? {} : (stryCov_9fa48("12800"), {
  id: 1,
  section: 1,
  type: stryMutAct_9fa48("12801") ? "" : (stryCov_9fa48("12801"), 'likert'),
  question: stryMutAct_9fa48("12802") ? "" : (stryCov_9fa48("12802"), 'How confident are you in identifying real problems and articulating their value proposition to others?'),
  options: stryMutAct_9fa48("12803") ? [] : (stryCov_9fa48("12803"), [stryMutAct_9fa48("12804") ? {} : (stryCov_9fa48("12804"), {
    value: 1,
    label: stryMutAct_9fa48("12805") ? "" : (stryCov_9fa48("12805"), 'Not at all confident')
  }), stryMutAct_9fa48("12806") ? {} : (stryCov_9fa48("12806"), {
    value: 2,
    label: stryMutAct_9fa48("12807") ? "" : (stryCov_9fa48("12807"), 'Slightly confident')
  }), stryMutAct_9fa48("12808") ? {} : (stryCov_9fa48("12808"), {
    value: 3,
    label: stryMutAct_9fa48("12809") ? "" : (stryCov_9fa48("12809"), 'Moderately confident')
  }), stryMutAct_9fa48("12810") ? {} : (stryCov_9fa48("12810"), {
    value: 4,
    label: stryMutAct_9fa48("12811") ? "" : (stryCov_9fa48("12811"), 'Very confident')
  }), stryMutAct_9fa48("12812") ? {} : (stryCov_9fa48("12812"), {
    value: 5,
    label: stryMutAct_9fa48("12813") ? "" : (stryCov_9fa48("12813"), 'Extremely confident')
  })])
}), stryMutAct_9fa48("12814") ? {} : (stryCov_9fa48("12814"), {
  id: 2,
  section: 1,
  type: stryMutAct_9fa48("12815") ? "" : (stryCov_9fa48("12815"), 'likert'),
  question: stryMutAct_9fa48("12816") ? "" : (stryCov_9fa48("12816"), 'How effectively can you prioritize features and explain technical trade-offs to stakeholders?'),
  options: stryMutAct_9fa48("12817") ? [] : (stryCov_9fa48("12817"), [stryMutAct_9fa48("12818") ? {} : (stryCov_9fa48("12818"), {
    value: 1,
    label: stryMutAct_9fa48("12819") ? "" : (stryCov_9fa48("12819"), 'Not at all effectively')
  }), stryMutAct_9fa48("12820") ? {} : (stryCov_9fa48("12820"), {
    value: 2,
    label: stryMutAct_9fa48("12821") ? "" : (stryCov_9fa48("12821"), 'Slightly effectively')
  }), stryMutAct_9fa48("12822") ? {} : (stryCov_9fa48("12822"), {
    value: 3,
    label: stryMutAct_9fa48("12823") ? "" : (stryCov_9fa48("12823"), 'Moderately effectively')
  }), stryMutAct_9fa48("12824") ? {} : (stryCov_9fa48("12824"), {
    value: 4,
    label: stryMutAct_9fa48("12825") ? "" : (stryCov_9fa48("12825"), 'Very effectively')
  }), stryMutAct_9fa48("12826") ? {} : (stryCov_9fa48("12826"), {
    value: 5,
    label: stryMutAct_9fa48("12827") ? "" : (stryCov_9fa48("12827"), 'Extremely effectively')
  })])
}), stryMutAct_9fa48("12828") ? {} : (stryCov_9fa48("12828"), {
  id: 3,
  section: 1,
  type: stryMutAct_9fa48("12829") ? "" : (stryCov_9fa48("12829"), 'multiple-choice'),
  question: stryMutAct_9fa48("12830") ? "" : (stryCov_9fa48("12830"), 'What\'s the best way to validate a product idea before building it?'),
  options: stryMutAct_9fa48("12831") ? [] : (stryCov_9fa48("12831"), [stryMutAct_9fa48("12832") ? {} : (stryCov_9fa48("12832"), {
    value: stryMutAct_9fa48("12833") ? "" : (stryCov_9fa48("12833"), 'A'),
    label: stryMutAct_9fa48("12834") ? "" : (stryCov_9fa48("12834"), 'Build the full product first to see if people like it')
  }), stryMutAct_9fa48("12835") ? {} : (stryCov_9fa48("12835"), {
    value: stryMutAct_9fa48("12836") ? "" : (stryCov_9fa48("12836"), 'B'),
    label: stryMutAct_9fa48("12837") ? "" : (stryCov_9fa48("12837"), 'Talk to potential users, create prototypes, and test assumptions with minimal investment')
  }), stryMutAct_9fa48("12838") ? {} : (stryCov_9fa48("12838"), {
    value: stryMutAct_9fa48("12839") ? "" : (stryCov_9fa48("12839"), 'C'),
    label: stryMutAct_9fa48("12840") ? "" : (stryCov_9fa48("12840"), 'Rely on your own intuition about what users need')
  }), stryMutAct_9fa48("12841") ? {} : (stryCov_9fa48("12841"), {
    value: stryMutAct_9fa48("12842") ? "" : (stryCov_9fa48("12842"), 'D'),
    label: stryMutAct_9fa48("12843") ? "" : (stryCov_9fa48("12843"), 'Copy what successful competitors are doing')
  })]),
  correctAnswer: stryMutAct_9fa48("12844") ? "" : (stryCov_9fa48("12844"), 'B')
}), stryMutAct_9fa48("12845") ? {} : (stryCov_9fa48("12845"), {
  id: 4,
  section: 1,
  type: stryMutAct_9fa48("12846") ? "" : (stryCov_9fa48("12846"), 'short-text'),
  question: stryMutAct_9fa48("12847") ? "" : (stryCov_9fa48("12847"), 'Define "MVP" and explain how it relates to product-market fit.'),
  placeholder: stryMutAct_9fa48("12848") ? "" : (stryCov_9fa48("12848"), 'Write 2-4 sentences...'),
  criteria: stryMutAct_9fa48("12849") ? [] : (stryCov_9fa48("12849"), [stryMutAct_9fa48("12850") ? "" : (stryCov_9fa48("12850"), 'Mentions "Minimum Viable Product"'), stryMutAct_9fa48("12851") ? "" : (stryCov_9fa48("12851"), 'Explains concept of minimal features'), stryMutAct_9fa48("12852") ? "" : (stryCov_9fa48("12852"), 'Connects to testing/validation'), stryMutAct_9fa48("12853") ? "" : (stryCov_9fa48("12853"), 'References product-market fit relationship')])
}), stryMutAct_9fa48("12854") ? {} : (stryCov_9fa48("12854"), {
  id: 5,
  section: 1,
  type: stryMutAct_9fa48("12855") ? "" : (stryCov_9fa48("12855"), 'short-text'),
  question: stryMutAct_9fa48("12856") ? "" : (stryCov_9fa48("12856"), 'Describe a problem in your daily life that technology could solve and your approach to validating it.'),
  placeholder: stryMutAct_9fa48("12857") ? "" : (stryCov_9fa48("12857"), 'Write 3-5 sentences...'),
  criteria: stryMutAct_9fa48("12858") ? [] : (stryCov_9fa48("12858"), [stryMutAct_9fa48("12859") ? "" : (stryCov_9fa48("12859"), 'Identifies specific problem'), stryMutAct_9fa48("12860") ? "" : (stryCov_9fa48("12860"), 'Proposes technology solution'), stryMutAct_9fa48("12861") ? "" : (stryCov_9fa48("12861"), 'Includes validation method'), stryMutAct_9fa48("12862") ? "" : (stryCov_9fa48("12862"), 'Shows user-centered thinking')])
}), // Section 2: Professional & Learning Skills
stryMutAct_9fa48("12863") ? {} : (stryCov_9fa48("12863"), {
  id: 6,
  section: 2,
  type: stryMutAct_9fa48("12864") ? "" : (stryCov_9fa48("12864"), 'likert'),
  question: stryMutAct_9fa48("12865") ? "" : (stryCov_9fa48("12865"), 'How effectively can you document your work and communicate technical concepts to different audiences?'),
  options: stryMutAct_9fa48("12866") ? [] : (stryCov_9fa48("12866"), [stryMutAct_9fa48("12867") ? {} : (stryCov_9fa48("12867"), {
    value: 1,
    label: stryMutAct_9fa48("12868") ? "" : (stryCov_9fa48("12868"), 'Not at all effectively')
  }), stryMutAct_9fa48("12869") ? {} : (stryCov_9fa48("12869"), {
    value: 2,
    label: stryMutAct_9fa48("12870") ? "" : (stryCov_9fa48("12870"), 'Slightly effectively')
  }), stryMutAct_9fa48("12871") ? {} : (stryCov_9fa48("12871"), {
    value: 3,
    label: stryMutAct_9fa48("12872") ? "" : (stryCov_9fa48("12872"), 'Moderately effectively')
  }), stryMutAct_9fa48("12873") ? {} : (stryCov_9fa48("12873"), {
    value: 4,
    label: stryMutAct_9fa48("12874") ? "" : (stryCov_9fa48("12874"), 'Very effectively')
  }), stryMutAct_9fa48("12875") ? {} : (stryCov_9fa48("12875"), {
    value: 5,
    label: stryMutAct_9fa48("12876") ? "" : (stryCov_9fa48("12876"), 'Extremely effectively')
  })])
}), stryMutAct_9fa48("12877") ? {} : (stryCov_9fa48("12877"), {
  id: 7,
  section: 2,
  type: stryMutAct_9fa48("12878") ? "" : (stryCov_9fa48("12878"), 'likert'),
  question: stryMutAct_9fa48("12879") ? "" : (stryCov_9fa48("12879"), 'How well can you manage your time, receive feedback, and iterate on your work?'),
  options: stryMutAct_9fa48("12880") ? [] : (stryCov_9fa48("12880"), [stryMutAct_9fa48("12881") ? {} : (stryCov_9fa48("12881"), {
    value: 1,
    label: stryMutAct_9fa48("12882") ? "" : (stryCov_9fa48("12882"), 'Not well at all')
  }), stryMutAct_9fa48("12883") ? {} : (stryCov_9fa48("12883"), {
    value: 2,
    label: stryMutAct_9fa48("12884") ? "" : (stryCov_9fa48("12884"), 'Slightly well')
  }), stryMutAct_9fa48("12885") ? {} : (stryCov_9fa48("12885"), {
    value: 3,
    label: stryMutAct_9fa48("12886") ? "" : (stryCov_9fa48("12886"), 'Moderately well')
  }), stryMutAct_9fa48("12887") ? {} : (stryCov_9fa48("12887"), {
    value: 4,
    label: stryMutAct_9fa48("12888") ? "" : (stryCov_9fa48("12888"), 'Very well')
  }), stryMutAct_9fa48("12889") ? {} : (stryCov_9fa48("12889"), {
    value: 5,
    label: stryMutAct_9fa48("12890") ? "" : (stryCov_9fa48("12890"), 'Extremely well')
  })])
}), stryMutAct_9fa48("12891") ? {} : (stryCov_9fa48("12891"), {
  id: 8,
  section: 2,
  type: stryMutAct_9fa48("12892") ? "" : (stryCov_9fa48("12892"), 'multiple-choice'),
  question: stryMutAct_9fa48("12893") ? "" : (stryCov_9fa48("12893"), 'When you get stuck on a problem or need to learn something new, what\'s your approach?'),
  options: stryMutAct_9fa48("12894") ? [] : (stryCov_9fa48("12894"), [stryMutAct_9fa48("12895") ? {} : (stryCov_9fa48("12895"), {
    value: stryMutAct_9fa48("12896") ? "" : (stryCov_9fa48("12896"), 'A'),
    label: stryMutAct_9fa48("12897") ? "" : (stryCov_9fa48("12897"), 'Give up and move on to something else')
  }), stryMutAct_9fa48("12898") ? {} : (stryCov_9fa48("12898"), {
    value: stryMutAct_9fa48("12899") ? "" : (stryCov_9fa48("12899"), 'B'),
    label: stryMutAct_9fa48("12900") ? "" : (stryCov_9fa48("12900"), 'Immediately ask someone else to solve it for me')
  }), stryMutAct_9fa48("12901") ? {} : (stryCov_9fa48("12901"), {
    value: stryMutAct_9fa48("12902") ? "" : (stryCov_9fa48("12902"), 'C'),
    label: stryMutAct_9fa48("12903") ? "" : (stryCov_9fa48("12903"), 'Break down the problem, research solutions, experiment, and ask for help when needed')
  }), stryMutAct_9fa48("12904") ? {} : (stryCov_9fa48("12904"), {
    value: stryMutAct_9fa48("12905") ? "" : (stryCov_9fa48("12905"), 'D'),
    label: stryMutAct_9fa48("12906") ? "" : (stryCov_9fa48("12906"), 'Keep trying the same approach repeatedly')
  })]),
  correctAnswer: stryMutAct_9fa48("12907") ? "" : (stryCov_9fa48("12907"), 'C')
}), stryMutAct_9fa48("12908") ? {} : (stryCov_9fa48("12908"), {
  id: 9,
  section: 2,
  type: stryMutAct_9fa48("12909") ? "" : (stryCov_9fa48("12909"), 'short-text'),
  question: stryMutAct_9fa48("12910") ? "" : (stryCov_9fa48("12910"), 'Define "stakeholder communication" and its importance in business contexts.'),
  placeholder: stryMutAct_9fa48("12911") ? "" : (stryCov_9fa48("12911"), 'Write 2-4 sentences...'),
  criteria: stryMutAct_9fa48("12912") ? [] : (stryCov_9fa48("12912"), [stryMutAct_9fa48("12913") ? "" : (stryCov_9fa48("12913"), 'Defines stakeholder communication'), stryMutAct_9fa48("12914") ? "" : (stryCov_9fa48("12914"), 'Identifies key stakeholders'), stryMutAct_9fa48("12915") ? "" : (stryCov_9fa48("12915"), 'Explains business importance'), stryMutAct_9fa48("12916") ? "" : (stryCov_9fa48("12916"), 'Shows understanding of clarity/alignment')])
}), stryMutAct_9fa48("12917") ? {} : (stryCov_9fa48("12917"), {
  id: 10,
  section: 2,
  type: stryMutAct_9fa48("12918") ? "" : (stryCov_9fa48("12918"), 'short-text'),
  question: stryMutAct_9fa48("12919") ? "" : (stryCov_9fa48("12919"), 'How do you plan to continue growing your technical and business skills?'),
  placeholder: stryMutAct_9fa48("12920") ? "" : (stryCov_9fa48("12920"), 'Write 3-5 sentences...'),
  criteria: stryMutAct_9fa48("12921") ? [] : (stryCov_9fa48("12921"), [stryMutAct_9fa48("12922") ? "" : (stryCov_9fa48("12922"), 'Specific learning methods mentioned'), stryMutAct_9fa48("12923") ? "" : (stryCov_9fa48("12923"), 'Balance of technical and business skills'), stryMutAct_9fa48("12924") ? "" : (stryCov_9fa48("12924"), 'Shows commitment to continuous learning'), stryMutAct_9fa48("12925") ? "" : (stryCov_9fa48("12925"), 'Realistic and actionable plan')])
}), // Section 3: AI Direction & Collaboration
stryMutAct_9fa48("12926") ? {} : (stryCov_9fa48("12926"), {
  id: 11,
  section: 3,
  type: stryMutAct_9fa48("12927") ? "" : (stryCov_9fa48("12927"), 'likert'),
  question: stryMutAct_9fa48("12928") ? "" : (stryCov_9fa48("12928"), 'How confident are you in using AI for strategic planning, content creation, and decision-making?'),
  options: stryMutAct_9fa48("12929") ? [] : (stryCov_9fa48("12929"), [stryMutAct_9fa48("12930") ? {} : (stryCov_9fa48("12930"), {
    value: 1,
    label: stryMutAct_9fa48("12931") ? "" : (stryCov_9fa48("12931"), 'Not at all confident')
  }), stryMutAct_9fa48("12932") ? {} : (stryCov_9fa48("12932"), {
    value: 2,
    label: stryMutAct_9fa48("12933") ? "" : (stryCov_9fa48("12933"), 'Slightly confident')
  }), stryMutAct_9fa48("12934") ? {} : (stryCov_9fa48("12934"), {
    value: 3,
    label: stryMutAct_9fa48("12935") ? "" : (stryCov_9fa48("12935"), 'Moderately confident')
  }), stryMutAct_9fa48("12936") ? {} : (stryCov_9fa48("12936"), {
    value: 4,
    label: stryMutAct_9fa48("12937") ? "" : (stryCov_9fa48("12937"), 'Very confident')
  }), stryMutAct_9fa48("12938") ? {} : (stryCov_9fa48("12938"), {
    value: 5,
    label: stryMutAct_9fa48("12939") ? "" : (stryCov_9fa48("12939"), 'Extremely confident')
  })])
}), stryMutAct_9fa48("12940") ? {} : (stryCov_9fa48("12940"), {
  id: 12,
  section: 3,
  type: stryMutAct_9fa48("12941") ? "" : (stryCov_9fa48("12941"), 'likert'),
  question: stryMutAct_9fa48("12942") ? "" : (stryCov_9fa48("12942"), 'How effectively can you craft prompts and manage AI workflows across different business functions?'),
  options: stryMutAct_9fa48("12943") ? [] : (stryCov_9fa48("12943"), [stryMutAct_9fa48("12944") ? {} : (stryCov_9fa48("12944"), {
    value: 1,
    label: stryMutAct_9fa48("12945") ? "" : (stryCov_9fa48("12945"), 'Not at all effectively')
  }), stryMutAct_9fa48("12946") ? {} : (stryCov_9fa48("12946"), {
    value: 2,
    label: stryMutAct_9fa48("12947") ? "" : (stryCov_9fa48("12947"), 'Slightly effectively')
  }), stryMutAct_9fa48("12948") ? {} : (stryCov_9fa48("12948"), {
    value: 3,
    label: stryMutAct_9fa48("12949") ? "" : (stryCov_9fa48("12949"), 'Moderately effectively')
  }), stryMutAct_9fa48("12950") ? {} : (stryCov_9fa48("12950"), {
    value: 4,
    label: stryMutAct_9fa48("12951") ? "" : (stryCov_9fa48("12951"), 'Very effectively')
  }), stryMutAct_9fa48("12952") ? {} : (stryCov_9fa48("12952"), {
    value: 5,
    label: stryMutAct_9fa48("12953") ? "" : (stryCov_9fa48("12953"), 'Extremely effectively')
  })])
}), stryMutAct_9fa48("12954") ? {} : (stryCov_9fa48("12954"), {
  id: 13,
  section: 3,
  type: stryMutAct_9fa48("12955") ? "" : (stryCov_9fa48("12955"), 'multiple-choice'),
  question: stryMutAct_9fa48("12956") ? "" : (stryCov_9fa48("12956"), 'How do you evaluate the quality of AI-generated analysis or recommendations?'),
  options: stryMutAct_9fa48("12957") ? [] : (stryCov_9fa48("12957"), [stryMutAct_9fa48("12958") ? {} : (stryCov_9fa48("12958"), {
    value: stryMutAct_9fa48("12959") ? "" : (stryCov_9fa48("12959"), 'A'),
    label: stryMutAct_9fa48("12960") ? "" : (stryCov_9fa48("12960"), 'Accept all AI outputs without question')
  }), stryMutAct_9fa48("12961") ? {} : (stryCov_9fa48("12961"), {
    value: stryMutAct_9fa48("12962") ? "" : (stryCov_9fa48("12962"), 'B'),
    label: stryMutAct_9fa48("12963") ? "" : (stryCov_9fa48("12963"), 'Verify accuracy, check for biases, validate with additional sources, and apply critical thinking')
  }), stryMutAct_9fa48("12964") ? {} : (stryCov_9fa48("12964"), {
    value: stryMutAct_9fa48("12965") ? "" : (stryCov_9fa48("12965"), 'C'),
    label: stryMutAct_9fa48("12966") ? "" : (stryCov_9fa48("12966"), 'Reject all AI outputs as unreliable')
  }), stryMutAct_9fa48("12967") ? {} : (stryCov_9fa48("12967"), {
    value: stryMutAct_9fa48("12968") ? "" : (stryCov_9fa48("12968"), 'D'),
    label: stryMutAct_9fa48("12969") ? "" : (stryCov_9fa48("12969"), 'Only use AI for simple tasks that don\'t require evaluation')
  })]),
  correctAnswer: stryMutAct_9fa48("12970") ? "" : (stryCov_9fa48("12970"), 'B')
}), stryMutAct_9fa48("12971") ? {} : (stryCov_9fa48("12971"), {
  id: 14,
  section: 3,
  type: stryMutAct_9fa48("12972") ? "" : (stryCov_9fa48("12972"), 'short-text'),
  question: stryMutAct_9fa48("12973") ? "" : (stryCov_9fa48("12973"), 'Describe how you would use AI to analyze customer feedback and identify insights.'),
  placeholder: stryMutAct_9fa48("12974") ? "" : (stryCov_9fa48("12974"), 'Write 3-5 sentences...'),
  criteria: stryMutAct_9fa48("12975") ? [] : (stryCov_9fa48("12975"), [stryMutAct_9fa48("12976") ? "" : (stryCov_9fa48("12976"), 'Mentions specific AI capabilities (sentiment analysis, pattern recognition, etc.)'), stryMutAct_9fa48("12977") ? "" : (stryCov_9fa48("12977"), 'Shows understanding of data processing'), stryMutAct_9fa48("12978") ? "" : (stryCov_9fa48("12978"), 'Includes actionable insights extraction'), stryMutAct_9fa48("12979") ? "" : (stryCov_9fa48("12979"), 'Demonstrates practical application')])
}), stryMutAct_9fa48("12980") ? {} : (stryCov_9fa48("12980"), {
  id: 15,
  section: 3,
  type: stryMutAct_9fa48("12981") ? "" : (stryCov_9fa48("12981"), 'short-text'),
  question: stryMutAct_9fa48("12982") ? "" : (stryCov_9fa48("12982"), 'How would you use AI to identify process improvements and automation opportunities?'),
  placeholder: stryMutAct_9fa48("12983") ? "" : (stryCov_9fa48("12983"), 'Write 3-5 sentences...'),
  criteria: stryMutAct_9fa48("12984") ? [] : (stryCov_9fa48("12984"), [stryMutAct_9fa48("12985") ? "" : (stryCov_9fa48("12985"), 'Identifies specific processes to analyze'), stryMutAct_9fa48("12986") ? "" : (stryCov_9fa48("12986"), 'Shows understanding of AI\'s analytical capabilities'), stryMutAct_9fa48("12987") ? "" : (stryCov_9fa48("12987"), 'Mentions efficiency/automation potential'), stryMutAct_9fa48("12988") ? "" : (stryCov_9fa48("12988"), 'Includes implementation approach')])
}), // Section 4: Technical Concepts & Integration
stryMutAct_9fa48("12989") ? {} : (stryCov_9fa48("12989"), {
  id: 16,
  section: 4,
  type: stryMutAct_9fa48("12990") ? "" : (stryCov_9fa48("12990"), 'likert'),
  question: stryMutAct_9fa48("12991") ? "" : (stryCov_9fa48("12991"), 'How well can you estimate technical effort and plan for scalability in business features?'),
  options: stryMutAct_9fa48("12992") ? [] : (stryCov_9fa48("12992"), [stryMutAct_9fa48("12993") ? {} : (stryCov_9fa48("12993"), {
    value: 1,
    label: stryMutAct_9fa48("12994") ? "" : (stryCov_9fa48("12994"), 'Not well at all')
  }), stryMutAct_9fa48("12995") ? {} : (stryCov_9fa48("12995"), {
    value: 2,
    label: stryMutAct_9fa48("12996") ? "" : (stryCov_9fa48("12996"), 'Slightly well')
  }), stryMutAct_9fa48("12997") ? {} : (stryCov_9fa48("12997"), {
    value: 3,
    label: stryMutAct_9fa48("12998") ? "" : (stryCov_9fa48("12998"), 'Moderately well')
  }), stryMutAct_9fa48("12999") ? {} : (stryCov_9fa48("12999"), {
    value: 4,
    label: stryMutAct_9fa48("13000") ? "" : (stryCov_9fa48("13000"), 'Very well')
  }), stryMutAct_9fa48("13001") ? {} : (stryCov_9fa48("13001"), {
    value: 5,
    label: stryMutAct_9fa48("13002") ? "" : (stryCov_9fa48("13002"), 'Extremely well')
  })])
}), stryMutAct_9fa48("13003") ? {} : (stryCov_9fa48("13003"), {
  id: 17,
  section: 4,
  type: stryMutAct_9fa48("13004") ? "" : (stryCov_9fa48("13004"), 'multiple-choice'),
  question: stryMutAct_9fa48("13005") ? "" : (stryCov_9fa48("13005"), 'When planning product features or fixing bugs, what\'s your systematic approach?'),
  options: stryMutAct_9fa48("13006") ? [] : (stryCov_9fa48("13006"), [stryMutAct_9fa48("13007") ? {} : (stryCov_9fa48("13007"), {
    value: stryMutAct_9fa48("13008") ? "" : (stryCov_9fa48("13008"), 'A'),
    label: stryMutAct_9fa48("13009") ? "" : (stryCov_9fa48("13009"), 'Start coding immediately without planning')
  }), stryMutAct_9fa48("13010") ? {} : (stryCov_9fa48("13010"), {
    value: stryMutAct_9fa48("13011") ? "" : (stryCov_9fa48("13011"), 'B'),
    label: stryMutAct_9fa48("13012") ? "" : (stryCov_9fa48("13012"), 'Understand requirements, break down the problem, plan approach, implement, test, and iterate')
  }), stryMutAct_9fa48("13013") ? {} : (stryCov_9fa48("13013"), {
    value: stryMutAct_9fa48("13014") ? "" : (stryCov_9fa48("13014"), 'C'),
    label: stryMutAct_9fa48("13015") ? "" : (stryCov_9fa48("13015"), 'Wait for someone to tell me exactly what to do')
  }), stryMutAct_9fa48("13016") ? {} : (stryCov_9fa48("13016"), {
    value: stryMutAct_9fa48("13017") ? "" : (stryCov_9fa48("13017"), 'D'),
    label: stryMutAct_9fa48("13018") ? "" : (stryCov_9fa48("13018"), 'Focus only on the quickest solution without considering long-term impact')
  })]),
  correctAnswer: stryMutAct_9fa48("13019") ? "" : (stryCov_9fa48("13019"), 'B')
}), stryMutAct_9fa48("13020") ? {} : (stryCov_9fa48("13020"), {
  id: 18,
  section: 4,
  type: stryMutAct_9fa48("13021") ? "" : (stryCov_9fa48("13021"), 'short-text'),
  question: stryMutAct_9fa48("13022") ? "" : (stryCov_9fa48("13022"), 'Explain what databases and APIs are and why they\'re critical for business operations.'),
  placeholder: stryMutAct_9fa48("13023") ? "" : (stryCov_9fa48("13023"), 'Write 3-5 sentences...'),
  criteria: stryMutAct_9fa48("13024") ? [] : (stryCov_9fa48("13024"), [stryMutAct_9fa48("13025") ? "" : (stryCov_9fa48("13025"), 'Defines both databases and APIs clearly'), stryMutAct_9fa48("13026") ? "" : (stryCov_9fa48("13026"), 'Explains business relevance'), stryMutAct_9fa48("13027") ? "" : (stryCov_9fa48("13027"), 'Shows understanding of data storage and connectivity'), stryMutAct_9fa48("13028") ? "" : (stryCov_9fa48("13028"), 'Mentions practical applications')])
}), stryMutAct_9fa48("13029") ? {} : (stryCov_9fa48("13029"), {
  id: 19,
  section: 4,
  type: stryMutAct_9fa48("13030") ? "" : (stryCov_9fa48("13030"), 'long-text'),
  question: stryMutAct_9fa48("13031") ? "" : (stryCov_9fa48("13031"), 'Describe a product you could build with your current skills, including problem, users, and validation approach.'),
  placeholder: stryMutAct_9fa48("13032") ? "" : (stryCov_9fa48("13032"), 'Write 5-8 sentences...'),
  criteria: stryMutAct_9fa48("13033") ? [] : (stryCov_9fa48("13033"), [stryMutAct_9fa48("13034") ? "" : (stryCov_9fa48("13034"), 'Clear problem identification'), stryMutAct_9fa48("13035") ? "" : (stryCov_9fa48("13035"), 'Defined target users'), stryMutAct_9fa48("13036") ? "" : (stryCov_9fa48("13036"), 'Realistic scope for current skills'), stryMutAct_9fa48("13037") ? "" : (stryCov_9fa48("13037"), 'Specific validation methodology'), stryMutAct_9fa48("13038") ? "" : (stryCov_9fa48("13038"), 'Shows product thinking')])
}), stryMutAct_9fa48("13039") ? {} : (stryCov_9fa48("13039"), {
  id: 20,
  section: 4,
  type: stryMutAct_9fa48("13040") ? "" : (stryCov_9fa48("13040"), 'long-text'),
  question: stryMutAct_9fa48("13041") ? "" : (stryCov_9fa48("13041"), 'Describe your relationship with AI tools and one product/business goal for the next 6 months.'),
  placeholder: stryMutAct_9fa48("13042") ? "" : (stryCov_9fa48("13042"), 'Write 5-8 sentences...'),
  criteria: stryMutAct_9fa48("13043") ? [] : (stryCov_9fa48("13043"), [stryMutAct_9fa48("13044") ? "" : (stryCov_9fa48("13044"), 'Honest assessment of AI usage'), stryMutAct_9fa48("13045") ? "" : (stryCov_9fa48("13045"), 'Specific goal identified'), stryMutAct_9fa48("13046") ? "" : (stryCov_9fa48("13046"), 'Clear timeline/milestones'), stryMutAct_9fa48("13047") ? "" : (stryCov_9fa48("13047"), 'Connection between AI use and goal achievement'), stryMutAct_9fa48("13048") ? "" : (stryCov_9fa48("13048"), 'Shows growth mindset')])
})]);

// Section titles
const SECTION_TITLES = stryMutAct_9fa48("13049") ? {} : (stryCov_9fa48("13049"), {
  1: stryMutAct_9fa48("13050") ? "" : (stryCov_9fa48("13050"), 'Product & Business Thinking'),
  2: stryMutAct_9fa48("13051") ? "" : (stryCov_9fa48("13051"), 'Professional & Learning Skills'),
  3: stryMutAct_9fa48("13052") ? "" : (stryCov_9fa48("13052"), 'AI Direction & Collaboration'),
  4: stryMutAct_9fa48("13053") ? "" : (stryCov_9fa48("13053"), 'Technical Concepts & Integration')
});
function SelfSubmission({
  submissionData = {},
  isDraft = stryMutAct_9fa48("13054") ? false : (stryCov_9fa48("13054"), true),
  isLoading = stryMutAct_9fa48("13055") ? true : (stryCov_9fa48("13055"), false),
  onUpdate,
  onSubmit
}) {
  if (stryMutAct_9fa48("13056")) {
    {}
  } else {
    stryCov_9fa48("13056");
    // Initialize form data from submission data or empty defaults
    const [formData, setFormData] = useState(stryMutAct_9fa48("13057") ? {} : (stryCov_9fa48("13057"), {
      responses: stryMutAct_9fa48("13060") ? submissionData.responses && {} : stryMutAct_9fa48("13059") ? false : stryMutAct_9fa48("13058") ? true : (stryCov_9fa48("13058", "13059", "13060"), submissionData.responses || {}),
      currentSection: 1,
      startTime: stryMutAct_9fa48("13063") ? submissionData.startTime && new Date().toISOString() : stryMutAct_9fa48("13062") ? false : stryMutAct_9fa48("13061") ? true : (stryCov_9fa48("13061", "13062", "13063"), submissionData.startTime || new Date().toISOString()),
      sectionTimes: stryMutAct_9fa48("13066") ? submissionData.sectionTimes && {} : stryMutAct_9fa48("13065") ? false : stryMutAct_9fa48("13064") ? true : (stryCov_9fa48("13064", "13065", "13066"), submissionData.sectionTimes || {})
    }));

    // Track section completion time
    const [sectionStartTime, setSectionStartTime] = useState(new Date());

    // Auto-save as draft when form data changes
    useEffect(() => {
      if (stryMutAct_9fa48("13067")) {
        {}
      } else {
        stryCov_9fa48("13067");
        if (stryMutAct_9fa48("13070") ? isDraft || Object.keys(formData.responses).length > 0 : stryMutAct_9fa48("13069") ? false : stryMutAct_9fa48("13068") ? true : (stryCov_9fa48("13068", "13069", "13070"), isDraft && (stryMutAct_9fa48("13073") ? Object.keys(formData.responses).length <= 0 : stryMutAct_9fa48("13072") ? Object.keys(formData.responses).length >= 0 : stryMutAct_9fa48("13071") ? true : (stryCov_9fa48("13071", "13072", "13073"), Object.keys(formData.responses).length > 0)))) {
          if (stryMutAct_9fa48("13074")) {
            {}
          } else {
            stryCov_9fa48("13074");
            const timeoutId = setTimeout(() => {
              if (stryMutAct_9fa48("13075")) {
                {}
              } else {
                stryCov_9fa48("13075");
                onUpdate(formData);
              }
            }, 1000); // Debounce for 1 second

            return stryMutAct_9fa48("13076") ? () => undefined : (stryCov_9fa48("13076"), () => clearTimeout(timeoutId));
          }
        }
      }
    }, stryMutAct_9fa48("13077") ? [] : (stryCov_9fa48("13077"), [formData, isDraft, onUpdate]));

    // Get questions for current section
    const currentSectionQuestions = stryMutAct_9fa48("13078") ? ASSESSMENT_QUESTIONS : (stryCov_9fa48("13078"), ASSESSMENT_QUESTIONS.filter(stryMutAct_9fa48("13079") ? () => undefined : (stryCov_9fa48("13079"), q => stryMutAct_9fa48("13082") ? q.section !== formData.currentSection : stryMutAct_9fa48("13081") ? false : stryMutAct_9fa48("13080") ? true : (stryCov_9fa48("13080", "13081", "13082"), q.section === formData.currentSection))));

    // Check if current section is complete
    const isSectionComplete = () => {
      if (stryMutAct_9fa48("13083")) {
        {}
      } else {
        stryCov_9fa48("13083");
        return stryMutAct_9fa48("13084") ? currentSectionQuestions.some(question => {
          return formData.responses[question.id] !== undefined && formData.responses[question.id] !== '';
        }) : (stryCov_9fa48("13084"), currentSectionQuestions.every(question => {
          if (stryMutAct_9fa48("13085")) {
            {}
          } else {
            stryCov_9fa48("13085");
            return stryMutAct_9fa48("13088") ? formData.responses[question.id] !== undefined || formData.responses[question.id] !== '' : stryMutAct_9fa48("13087") ? false : stryMutAct_9fa48("13086") ? true : (stryCov_9fa48("13086", "13087", "13088"), (stryMutAct_9fa48("13090") ? formData.responses[question.id] === undefined : stryMutAct_9fa48("13089") ? true : (stryCov_9fa48("13089", "13090"), formData.responses[question.id] !== undefined)) && (stryMutAct_9fa48("13092") ? formData.responses[question.id] === '' : stryMutAct_9fa48("13091") ? true : (stryCov_9fa48("13091", "13092"), formData.responses[question.id] !== (stryMutAct_9fa48("13093") ? "Stryker was here!" : (stryCov_9fa48("13093"), '')))));
          }
        }));
      }
    };

    // Check if entire assessment is complete
    const isAssessmentComplete = () => {
      if (stryMutAct_9fa48("13094")) {
        {}
      } else {
        stryCov_9fa48("13094");
        return stryMutAct_9fa48("13095") ? ASSESSMENT_QUESTIONS.some(question => {
          return formData.responses[question.id] !== undefined && formData.responses[question.id] !== '';
        }) : (stryCov_9fa48("13095"), ASSESSMENT_QUESTIONS.every(question => {
          if (stryMutAct_9fa48("13096")) {
            {}
          } else {
            stryCov_9fa48("13096");
            return stryMutAct_9fa48("13099") ? formData.responses[question.id] !== undefined || formData.responses[question.id] !== '' : stryMutAct_9fa48("13098") ? false : stryMutAct_9fa48("13097") ? true : (stryCov_9fa48("13097", "13098", "13099"), (stryMutAct_9fa48("13101") ? formData.responses[question.id] === undefined : stryMutAct_9fa48("13100") ? true : (stryCov_9fa48("13100", "13101"), formData.responses[question.id] !== undefined)) && (stryMutAct_9fa48("13103") ? formData.responses[question.id] === '' : stryMutAct_9fa48("13102") ? true : (stryCov_9fa48("13102", "13103"), formData.responses[question.id] !== (stryMutAct_9fa48("13104") ? "Stryker was here!" : (stryCov_9fa48("13104"), '')))));
          }
        }));
      }
    };

    // Handle response changes
    const handleResponseChange = (questionId, value) => {
      if (stryMutAct_9fa48("13105")) {
        {}
      } else {
        stryCov_9fa48("13105");
        setFormData(stryMutAct_9fa48("13106") ? () => undefined : (stryCov_9fa48("13106"), prev => stryMutAct_9fa48("13107") ? {} : (stryCov_9fa48("13107"), {
          ...prev,
          responses: stryMutAct_9fa48("13108") ? {} : (stryCov_9fa48("13108"), {
            ...prev.responses,
            [questionId]: value
          })
        })));
      }
    };

    // Handle section navigation
    const handleSectionChange = direction => {
      if (stryMutAct_9fa48("13109")) {
        {}
      } else {
        stryCov_9fa48("13109");
        // Save section completion time
        const sectionEndTime = new Date();
        const sectionDuration = stryMutAct_9fa48("13110") ? (sectionEndTime - sectionStartTime) * 1000 : (stryCov_9fa48("13110"), (stryMutAct_9fa48("13111") ? sectionEndTime + sectionStartTime : (stryCov_9fa48("13111"), sectionEndTime - sectionStartTime)) / 1000); // in seconds

        setFormData(stryMutAct_9fa48("13112") ? () => undefined : (stryCov_9fa48("13112"), prev => stryMutAct_9fa48("13113") ? {} : (stryCov_9fa48("13113"), {
          ...prev,
          sectionTimes: stryMutAct_9fa48("13114") ? {} : (stryCov_9fa48("13114"), {
            ...prev.sectionTimes,
            [prev.currentSection]: stryMutAct_9fa48("13115") ? (prev.sectionTimes[prev.currentSection] || 0) - sectionDuration : (stryCov_9fa48("13115"), (stryMutAct_9fa48("13118") ? prev.sectionTimes[prev.currentSection] && 0 : stryMutAct_9fa48("13117") ? false : stryMutAct_9fa48("13116") ? true : (stryCov_9fa48("13116", "13117", "13118"), prev.sectionTimes[prev.currentSection] || 0)) + sectionDuration)
          }),
          currentSection: (stryMutAct_9fa48("13121") ? direction !== 'next' : stryMutAct_9fa48("13120") ? false : stryMutAct_9fa48("13119") ? true : (stryCov_9fa48("13119", "13120", "13121"), direction === (stryMutAct_9fa48("13122") ? "" : (stryCov_9fa48("13122"), 'next')))) ? stryMutAct_9fa48("13123") ? prev.currentSection - 1 : (stryCov_9fa48("13123"), prev.currentSection + 1) : stryMutAct_9fa48("13124") ? prev.currentSection + 1 : (stryCov_9fa48("13124"), prev.currentSection - 1)
        })));

        // Reset section timer
        setSectionStartTime(new Date());
      }
    };

    // Handle final submission
    const handleSubmit = () => {
      if (stryMutAct_9fa48("13125")) {
        {}
      } else {
        stryCov_9fa48("13125");
        // Save final section time
        const sectionEndTime = new Date();
        const sectionDuration = stryMutAct_9fa48("13126") ? (sectionEndTime - sectionStartTime) * 1000 : (stryCov_9fa48("13126"), (stryMutAct_9fa48("13127") ? sectionEndTime + sectionStartTime : (stryCov_9fa48("13127"), sectionEndTime - sectionStartTime)) / 1000); // in seconds

        const finalFormData = stryMutAct_9fa48("13128") ? {} : (stryCov_9fa48("13128"), {
          ...formData,
          sectionTimes: stryMutAct_9fa48("13129") ? {} : (stryCov_9fa48("13129"), {
            ...formData.sectionTimes,
            [formData.currentSection]: stryMutAct_9fa48("13130") ? (formData.sectionTimes[formData.currentSection] || 0) - sectionDuration : (stryCov_9fa48("13130"), (stryMutAct_9fa48("13133") ? formData.sectionTimes[formData.currentSection] && 0 : stryMutAct_9fa48("13132") ? false : stryMutAct_9fa48("13131") ? true : (stryCov_9fa48("13131", "13132", "13133"), formData.sectionTimes[formData.currentSection] || 0)) + sectionDuration)
          }),
          completionTime: new Date().toISOString()
        });
        onSubmit(finalFormData);
      }
    };

    // Render question based on type
    const renderQuestion = question => {
      if (stryMutAct_9fa48("13134")) {
        {}
      } else {
        stryCov_9fa48("13134");
        const response = stryMutAct_9fa48("13137") ? formData.responses[question.id] && '' : stryMutAct_9fa48("13136") ? false : stryMutAct_9fa48("13135") ? true : (stryCov_9fa48("13135", "13136", "13137"), formData.responses[question.id] || (stryMutAct_9fa48("13138") ? "Stryker was here!" : (stryCov_9fa48("13138"), '')));
        switch (question.type) {
          case stryMutAct_9fa48("13140") ? "" : (stryCov_9fa48("13140"), 'likert'):
            if (stryMutAct_9fa48("13139")) {} else {
              stryCov_9fa48("13139");
              return <div className="self-assessment__likert">
            <div className="self-assessment__likert-options">
              {question.options.map(stryMutAct_9fa48("13141") ? () => undefined : (stryCov_9fa48("13141"), option => <div key={option.value} className={stryMutAct_9fa48("13142") ? `` : (stryCov_9fa48("13142"), `self-assessment__likert-option ${(stryMutAct_9fa48("13145") ? response !== option.value : stryMutAct_9fa48("13144") ? false : stryMutAct_9fa48("13143") ? true : (stryCov_9fa48("13143", "13144", "13145"), response === option.value)) ? stryMutAct_9fa48("13146") ? "" : (stryCov_9fa48("13146"), 'self-assessment__likert-option--selected') : stryMutAct_9fa48("13147") ? "Stryker was here!" : (stryCov_9fa48("13147"), '')}`)} onClick={stryMutAct_9fa48("13148") ? () => undefined : (stryCov_9fa48("13148"), () => (stryMutAct_9fa48("13149") ? isDraft : (stryCov_9fa48("13149"), !isDraft)) ? null : handleResponseChange(question.id, option.value))}>
                  <div className="self-assessment__likert-value">{option.value}</div>
                  <div className="self-assessment__likert-label">{option.label}</div>
                </div>))}
            </div>
          </div>;
            }
          case stryMutAct_9fa48("13151") ? "" : (stryCov_9fa48("13151"), 'multiple-choice'):
            if (stryMutAct_9fa48("13150")) {} else {
              stryCov_9fa48("13150");
              return <div className="self-assessment__multiple-choice">
            {question.options.map(stryMutAct_9fa48("13152") ? () => undefined : (stryCov_9fa48("13152"), option => <div key={option.value} className={stryMutAct_9fa48("13153") ? `` : (stryCov_9fa48("13153"), `self-assessment__mc-option ${(stryMutAct_9fa48("13156") ? response !== option.value : stryMutAct_9fa48("13155") ? false : stryMutAct_9fa48("13154") ? true : (stryCov_9fa48("13154", "13155", "13156"), response === option.value)) ? stryMutAct_9fa48("13157") ? "" : (stryCov_9fa48("13157"), 'self-assessment__mc-option--selected') : stryMutAct_9fa48("13158") ? "Stryker was here!" : (stryCov_9fa48("13158"), '')}`)} onClick={stryMutAct_9fa48("13159") ? () => undefined : (stryCov_9fa48("13159"), () => (stryMutAct_9fa48("13160") ? isDraft : (stryCov_9fa48("13160"), !isDraft)) ? null : handleResponseChange(question.id, option.value))}>
                <div className="self-assessment__mc-indicator">
                  {stryMutAct_9fa48("13163") ? response === option.value || <FaCheck /> : stryMutAct_9fa48("13162") ? false : stryMutAct_9fa48("13161") ? true : (stryCov_9fa48("13161", "13162", "13163"), (stryMutAct_9fa48("13165") ? response !== option.value : stryMutAct_9fa48("13164") ? true : (stryCov_9fa48("13164", "13165"), response === option.value)) && <FaCheck />)}
                </div>
                <div className="self-assessment__mc-label">
                  <strong>{option.value}.</strong> {option.label}
                </div>
              </div>))}
          </div>;
            }
          case stryMutAct_9fa48("13167") ? "" : (stryCov_9fa48("13167"), 'short-text'):
            if (stryMutAct_9fa48("13166")) {} else {
              stryCov_9fa48("13166");
              return <div className="self-assessment__text-response">
            <textarea className="self-assessment__text-input self-assessment__text-input--short" value={response} onChange={stryMutAct_9fa48("13168") ? () => undefined : (stryCov_9fa48("13168"), e => (stryMutAct_9fa48("13169") ? isDraft : (stryCov_9fa48("13169"), !isDraft)) ? null : handleResponseChange(question.id, e.target.value))} placeholder={question.placeholder} disabled={stryMutAct_9fa48("13170") ? isDraft : (stryCov_9fa48("13170"), !isDraft)} rows={3} />
            {stryMutAct_9fa48("13173") ? question.criteria || <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map((criterion, index) => <li key={index} className="self-assessment__criteria-item">{criterion}</li>)}
                </ul>
              </div> : stryMutAct_9fa48("13172") ? false : stryMutAct_9fa48("13171") ? true : (stryCov_9fa48("13171", "13172", "13173"), question.criteria && <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map(stryMutAct_9fa48("13174") ? () => undefined : (stryCov_9fa48("13174"), (criterion, index) => <li key={index} className="self-assessment__criteria-item">{criterion}</li>))}
                </ul>
              </div>)}
          </div>;
            }
          case stryMutAct_9fa48("13176") ? "" : (stryCov_9fa48("13176"), 'long-text'):
            if (stryMutAct_9fa48("13175")) {} else {
              stryCov_9fa48("13175");
              return <div className="self-assessment__text-response">
            <textarea className="self-assessment__text-input self-assessment__text-input--long" value={response} onChange={stryMutAct_9fa48("13177") ? () => undefined : (stryCov_9fa48("13177"), e => (stryMutAct_9fa48("13178") ? isDraft : (stryCov_9fa48("13178"), !isDraft)) ? null : handleResponseChange(question.id, e.target.value))} placeholder={question.placeholder} disabled={stryMutAct_9fa48("13179") ? isDraft : (stryCov_9fa48("13179"), !isDraft)} rows={6} />
            {stryMutAct_9fa48("13182") ? question.criteria || <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map((criterion, index) => <li key={index} className="self-assessment__criteria-item">{criterion}</li>)}
                </ul>
              </div> : stryMutAct_9fa48("13181") ? false : stryMutAct_9fa48("13180") ? true : (stryCov_9fa48("13180", "13181", "13182"), question.criteria && <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map(stryMutAct_9fa48("13183") ? () => undefined : (stryCov_9fa48("13183"), (criterion, index) => <li key={index} className="self-assessment__criteria-item">{criterion}</li>))}
                </ul>
              </div>)}
          </div>;
            }
          default:
            if (stryMutAct_9fa48("13184")) {} else {
              stryCov_9fa48("13184");
              return null;
            }
        }
      }
    };
    return <div className="submission-form self-assessment">
      {/* Progress indicator */}
      <div className="self-assessment__progress">
        {(stryMutAct_9fa48("13185") ? [] : (stryCov_9fa48("13185"), [1, 2, 3, 4])).map(stryMutAct_9fa48("13186") ? () => undefined : (stryCov_9fa48("13186"), section => <div key={section} className={stryMutAct_9fa48("13187") ? `` : (stryCov_9fa48("13187"), `self-assessment__progress-step ${(stryMutAct_9fa48("13190") ? formData.currentSection !== section : stryMutAct_9fa48("13189") ? false : stryMutAct_9fa48("13188") ? true : (stryCov_9fa48("13188", "13189", "13190"), formData.currentSection === section)) ? stryMutAct_9fa48("13191") ? "" : (stryCov_9fa48("13191"), 'self-assessment__progress-step--active') : stryMutAct_9fa48("13192") ? "Stryker was here!" : (stryCov_9fa48("13192"), '')} ${(stryMutAct_9fa48("13196") ? formData.currentSection <= section : stryMutAct_9fa48("13195") ? formData.currentSection >= section : stryMutAct_9fa48("13194") ? false : stryMutAct_9fa48("13193") ? true : (stryCov_9fa48("13193", "13194", "13195", "13196"), formData.currentSection > section)) ? stryMutAct_9fa48("13197") ? "" : (stryCov_9fa48("13197"), 'self-assessment__progress-step--completed') : stryMutAct_9fa48("13198") ? "Stryker was here!" : (stryCov_9fa48("13198"), '')}`)}>
            <div className="self-assessment__progress-number">{section}</div>
            <div className="self-assessment__progress-label">{SECTION_TITLES[section]}</div>
          </div>))}
      </div>
      
      {/* Section title */}
      <h2 className="self-assessment__section-title">
        Section {formData.currentSection}: {SECTION_TITLES[formData.currentSection]}
      </h2>
      
      {/* Questions */}
      <div className="self-assessment__questions">
        {currentSectionQuestions.map(stryMutAct_9fa48("13199") ? () => undefined : (stryCov_9fa48("13199"), question => <div key={question.id} className="self-assessment__question">
            <div className="self-assessment__question-number">Question {question.id}</div>
            <div className="self-assessment__question-text">{question.question}</div>
            {renderQuestion(question)}
          </div>))}
      </div>
      
      {/* Navigation */}
      <div className="self-assessment__navigation">
        {stryMutAct_9fa48("13202") ? formData.currentSection > 1 || <button className="self-assessment__nav-btn self-assessment__nav-btn--prev" onClick={() => handleSectionChange('prev')}>
            <FaArrowLeft /> Previous Section
          </button> : stryMutAct_9fa48("13201") ? false : stryMutAct_9fa48("13200") ? true : (stryCov_9fa48("13200", "13201", "13202"), (stryMutAct_9fa48("13205") ? formData.currentSection <= 1 : stryMutAct_9fa48("13204") ? formData.currentSection >= 1 : stryMutAct_9fa48("13203") ? true : (stryCov_9fa48("13203", "13204", "13205"), formData.currentSection > 1)) && <button className="self-assessment__nav-btn self-assessment__nav-btn--prev" onClick={stryMutAct_9fa48("13206") ? () => undefined : (stryCov_9fa48("13206"), () => handleSectionChange(stryMutAct_9fa48("13207") ? "" : (stryCov_9fa48("13207"), 'prev')))}>
            <FaArrowLeft /> Previous Section
          </button>)}
        
        {(stryMutAct_9fa48("13211") ? formData.currentSection >= 4 : stryMutAct_9fa48("13210") ? formData.currentSection <= 4 : stryMutAct_9fa48("13209") ? false : stryMutAct_9fa48("13208") ? true : (stryCov_9fa48("13208", "13209", "13210", "13211"), formData.currentSection < 4)) ? <button className="self-assessment__nav-btn self-assessment__nav-btn--next" onClick={stryMutAct_9fa48("13212") ? () => undefined : (stryCov_9fa48("13212"), () => handleSectionChange(stryMutAct_9fa48("13213") ? "" : (stryCov_9fa48("13213"), 'next')))} disabled={stryMutAct_9fa48("13214") ? isSectionComplete() : (stryCov_9fa48("13214"), !isSectionComplete())}>
            Next Section <FaArrowRight />
          </button> : <div className="submission-form__actions">
            {isDraft ? <button onClick={handleSubmit} disabled={stryMutAct_9fa48("13217") ? !isAssessmentComplete() && isLoading : stryMutAct_9fa48("13216") ? false : stryMutAct_9fa48("13215") ? true : (stryCov_9fa48("13215", "13216", "13217"), (stryMutAct_9fa48("13218") ? isAssessmentComplete() : (stryCov_9fa48("13218"), !isAssessmentComplete())) || isLoading)} className="submission-form__submit-btn">
                {isLoading ? stryMutAct_9fa48("13219") ? "" : (stryCov_9fa48("13219"), 'Submitting...') : stryMutAct_9fa48("13220") ? "" : (stryCov_9fa48("13220"), 'Submit Final Assessment')}
              </button> : <div className="submission-form__submitted-message">
                <FaCheck className="submission-form__check-icon" />
                Assessment Submitted
              </div>}
          </div>}
      </div>
    </div>;
  }
}
export default SelfSubmission;