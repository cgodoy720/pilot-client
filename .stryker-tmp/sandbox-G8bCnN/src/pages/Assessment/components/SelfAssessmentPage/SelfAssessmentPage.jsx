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
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaCheck } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useAuth } from '../../../../context/AuthContext';
import './SelfAssessmentPage.css';

// Question data
const ASSESSMENT_QUESTIONS = stryMutAct_9fa48("14125") ? [] : (stryCov_9fa48("14125"), [// Section 1: Product & Business Thinking
stryMutAct_9fa48("14126") ? {} : (stryCov_9fa48("14126"), {
  id: 1,
  section: 1,
  type: stryMutAct_9fa48("14127") ? "" : (stryCov_9fa48("14127"), 'likert'),
  question: stryMutAct_9fa48("14128") ? "" : (stryCov_9fa48("14128"), 'I demonstrate the ability to identify core problems and clearly articulate their value propositions.'),
  options: stryMutAct_9fa48("14129") ? [] : (stryCov_9fa48("14129"), [stryMutAct_9fa48("14130") ? {} : (stryCov_9fa48("14130"), {
    value: 1,
    label: stryMutAct_9fa48("14131") ? "" : (stryCov_9fa48("14131"), '1 - Strongly Disagree')
  }), stryMutAct_9fa48("14132") ? {} : (stryCov_9fa48("14132"), {
    value: 2,
    label: stryMutAct_9fa48("14133") ? "" : (stryCov_9fa48("14133"), '2 - Disagree')
  }), stryMutAct_9fa48("14134") ? {} : (stryCov_9fa48("14134"), {
    value: 3,
    label: stryMutAct_9fa48("14135") ? "" : (stryCov_9fa48("14135"), '3 - Neutral')
  }), stryMutAct_9fa48("14136") ? {} : (stryCov_9fa48("14136"), {
    value: 4,
    label: stryMutAct_9fa48("14137") ? "" : (stryCov_9fa48("14137"), '4 - Agree')
  }), stryMutAct_9fa48("14138") ? {} : (stryCov_9fa48("14138"), {
    value: 5,
    label: stryMutAct_9fa48("14139") ? "" : (stryCov_9fa48("14139"), '5 - Strongly Agree')
  })])
}), stryMutAct_9fa48("14140") ? {} : (stryCov_9fa48("14140"), {
  id: 2,
  section: 1,
  type: stryMutAct_9fa48("14141") ? "" : (stryCov_9fa48("14141"), 'multiple-choice'),
  question: stryMutAct_9fa48("14142") ? "" : (stryCov_9fa48("14142"), 'What\'s the most effective first step when validating a product idea?'),
  options: stryMutAct_9fa48("14143") ? [] : (stryCov_9fa48("14143"), [stryMutAct_9fa48("14144") ? {} : (stryCov_9fa48("14144"), {
    value: stryMutAct_9fa48("14145") ? "" : (stryCov_9fa48("14145"), 'A'),
    label: stryMutAct_9fa48("14146") ? "" : (stryCov_9fa48("14146"), 'Build a prototype and test it directly with a small group of target users'),
    points: 4
  }), stryMutAct_9fa48("14147") ? {} : (stryCov_9fa48("14147"), {
    value: stryMutAct_9fa48("14148") ? "" : (stryCov_9fa48("14148"), 'B'),
    label: stryMutAct_9fa48("14149") ? "" : (stryCov_9fa48("14149"), 'Conduct interviews and research to understand user pain points before creating anything'),
    points: 5
  }), stryMutAct_9fa48("14150") ? {} : (stryCov_9fa48("14150"), {
    value: stryMutAct_9fa48("14151") ? "" : (stryCov_9fa48("14151"), 'C'),
    label: stryMutAct_9fa48("14152") ? "" : (stryCov_9fa48("14152"), 'Launch a limited version of the product to paying customers and learn from adoption'),
    points: 3
  }), stryMutAct_9fa48("14153") ? {} : (stryCov_9fa48("14153"), {
    value: stryMutAct_9fa48("14154") ? "" : (stryCov_9fa48("14154"), 'D'),
    label: stryMutAct_9fa48("14155") ? "" : (stryCov_9fa48("14155"), 'Review competitor offerings and identify gaps before deciding what to test'),
    points: 2
  })]),
  correctAnswer: stryMutAct_9fa48("14156") ? "" : (stryCov_9fa48("14156"), 'B')
}), // Section 2: Professional & Learning Skills
stryMutAct_9fa48("14157") ? {} : (stryCov_9fa48("14157"), {
  id: 3,
  section: 2,
  type: stryMutAct_9fa48("14158") ? "" : (stryCov_9fa48("14158"), 'likert'),
  question: stryMutAct_9fa48("14159") ? "" : (stryCov_9fa48("14159"), 'I demonstrate strong time management skills to consistently meet deadlines.'),
  options: stryMutAct_9fa48("14160") ? [] : (stryCov_9fa48("14160"), [stryMutAct_9fa48("14161") ? {} : (stryCov_9fa48("14161"), {
    value: 1,
    label: stryMutAct_9fa48("14162") ? "" : (stryCov_9fa48("14162"), '1 - Strongly Disagree')
  }), stryMutAct_9fa48("14163") ? {} : (stryCov_9fa48("14163"), {
    value: 2,
    label: stryMutAct_9fa48("14164") ? "" : (stryCov_9fa48("14164"), '2 - Disagree')
  }), stryMutAct_9fa48("14165") ? {} : (stryCov_9fa48("14165"), {
    value: 3,
    label: stryMutAct_9fa48("14166") ? "" : (stryCov_9fa48("14166"), '3 - Neutral')
  }), stryMutAct_9fa48("14167") ? {} : (stryCov_9fa48("14167"), {
    value: 4,
    label: stryMutAct_9fa48("14168") ? "" : (stryCov_9fa48("14168"), '4 - Agree')
  }), stryMutAct_9fa48("14169") ? {} : (stryCov_9fa48("14169"), {
    value: 5,
    label: stryMutAct_9fa48("14170") ? "" : (stryCov_9fa48("14170"), '5 - Strongly Agree')
  })])
}), stryMutAct_9fa48("14171") ? {} : (stryCov_9fa48("14171"), {
  id: 4,
  section: 2,
  type: stryMutAct_9fa48("14172") ? "" : (stryCov_9fa48("14172"), 'likert'),
  question: stryMutAct_9fa48("14173") ? "" : (stryCov_9fa48("14173"), 'I actively seek and incorporate feedback to improve the quality of my work.'),
  options: stryMutAct_9fa48("14174") ? [] : (stryCov_9fa48("14174"), [stryMutAct_9fa48("14175") ? {} : (stryCov_9fa48("14175"), {
    value: 1,
    label: stryMutAct_9fa48("14176") ? "" : (stryCov_9fa48("14176"), '1 - Strongly Disagree')
  }), stryMutAct_9fa48("14177") ? {} : (stryCov_9fa48("14177"), {
    value: 2,
    label: stryMutAct_9fa48("14178") ? "" : (stryCov_9fa48("14178"), '2 - Disagree')
  }), stryMutAct_9fa48("14179") ? {} : (stryCov_9fa48("14179"), {
    value: 3,
    label: stryMutAct_9fa48("14180") ? "" : (stryCov_9fa48("14180"), '3 - Neutral')
  }), stryMutAct_9fa48("14181") ? {} : (stryCov_9fa48("14181"), {
    value: 4,
    label: stryMutAct_9fa48("14182") ? "" : (stryCov_9fa48("14182"), '4 - Agree')
  }), stryMutAct_9fa48("14183") ? {} : (stryCov_9fa48("14183"), {
    value: 5,
    label: stryMutAct_9fa48("14184") ? "" : (stryCov_9fa48("14184"), '5 - Strongly Agree')
  })])
}), stryMutAct_9fa48("14185") ? {} : (stryCov_9fa48("14185"), {
  id: 5,
  section: 2,
  type: stryMutAct_9fa48("14186") ? "" : (stryCov_9fa48("14186"), 'multiple-choice'),
  question: stryMutAct_9fa48("14187") ? "" : (stryCov_9fa48("14187"), 'When you get stuck on a problem, which approach do you usually take?'),
  options: stryMutAct_9fa48("14188") ? [] : (stryCov_9fa48("14188"), [stryMutAct_9fa48("14189") ? {} : (stryCov_9fa48("14189"), {
    value: stryMutAct_9fa48("14190") ? "" : (stryCov_9fa48("14190"), 'A'),
    label: stryMutAct_9fa48("14191") ? "" : (stryCov_9fa48("14191"), 'Break the problem into smaller pieces, try different approaches, and research possible solutions'),
    points: 5
  }), stryMutAct_9fa48("14192") ? {} : (stryCov_9fa48("14192"), {
    value: stryMutAct_9fa48("14193") ? "" : (stryCov_9fa48("14193"), 'B'),
    label: stryMutAct_9fa48("14194") ? "" : (stryCov_9fa48("14194"), 'Look for existing examples or documentation before attempting solutions on your own'),
    points: 4
  }), stryMutAct_9fa48("14195") ? {} : (stryCov_9fa48("14195"), {
    value: stryMutAct_9fa48("14196") ? "" : (stryCov_9fa48("14196"), 'C'),
    label: stryMutAct_9fa48("14197") ? "" : (stryCov_9fa48("14197"), 'Ask for help after making some effort, but without over-investing time'),
    points: 3
  }), stryMutAct_9fa48("14198") ? {} : (stryCov_9fa48("14198"), {
    value: stryMutAct_9fa48("14199") ? "" : (stryCov_9fa48("14199"), 'D'),
    label: stryMutAct_9fa48("14200") ? "" : (stryCov_9fa48("14200"), 'Keep pushing with one approach until it works, even if it takes a long time'),
    points: 1
  })]),
  correctAnswer: stryMutAct_9fa48("14201") ? "" : (stryCov_9fa48("14201"), 'A')
}), // Section 3: AI Direction & Collaboration
stryMutAct_9fa48("14202") ? {} : (stryCov_9fa48("14202"), {
  id: 6,
  section: 3,
  type: stryMutAct_9fa48("14203") ? "" : (stryCov_9fa48("14203"), 'likert'),
  question: stryMutAct_9fa48("14204") ? "" : (stryCov_9fa48("14204"), 'I leverage AI tools to support decision-making and generate high-quality content.'),
  options: stryMutAct_9fa48("14205") ? [] : (stryCov_9fa48("14205"), [stryMutAct_9fa48("14206") ? {} : (stryCov_9fa48("14206"), {
    value: 1,
    label: stryMutAct_9fa48("14207") ? "" : (stryCov_9fa48("14207"), '1 - Strongly Disagree')
  }), stryMutAct_9fa48("14208") ? {} : (stryCov_9fa48("14208"), {
    value: 2,
    label: stryMutAct_9fa48("14209") ? "" : (stryCov_9fa48("14209"), '2 - Disagree')
  }), stryMutAct_9fa48("14210") ? {} : (stryCov_9fa48("14210"), {
    value: 3,
    label: stryMutAct_9fa48("14211") ? "" : (stryCov_9fa48("14211"), '3 - Neutral')
  }), stryMutAct_9fa48("14212") ? {} : (stryCov_9fa48("14212"), {
    value: 4,
    label: stryMutAct_9fa48("14213") ? "" : (stryCov_9fa48("14213"), '4 - Agree')
  }), stryMutAct_9fa48("14214") ? {} : (stryCov_9fa48("14214"), {
    value: 5,
    label: stryMutAct_9fa48("14215") ? "" : (stryCov_9fa48("14215"), '5 - Strongly Agree')
  })])
}), stryMutAct_9fa48("14216") ? {} : (stryCov_9fa48("14216"), {
  id: 7,
  section: 3,
  type: stryMutAct_9fa48("14217") ? "" : (stryCov_9fa48("14217"), 'multiple-choice'),
  question: stryMutAct_9fa48("14218") ? "" : (stryCov_9fa48("14218"), 'How do you judge whether to trust AI-generated recommendations?'),
  options: stryMutAct_9fa48("14219") ? [] : (stryCov_9fa48("14219"), [stryMutAct_9fa48("14220") ? {} : (stryCov_9fa48("14220"), {
    value: stryMutAct_9fa48("14221") ? "" : (stryCov_9fa48("14221"), 'A'),
    label: stryMutAct_9fa48("14222") ? "" : (stryCov_9fa48("14222"), 'Compare outputs against your own reasoning and domain knowledge before using them'),
    points: 4
  }), stryMutAct_9fa48("14223") ? {} : (stryCov_9fa48("14223"), {
    value: stryMutAct_9fa48("14224") ? "" : (stryCov_9fa48("14224"), 'B'),
    label: stryMutAct_9fa48("14225") ? "" : (stryCov_9fa48("14225"), 'Cross-check with external data or experts, especially when stakes are high'),
    points: 5
  }), stryMutAct_9fa48("14226") ? {} : (stryCov_9fa48("14226"), {
    value: stryMutAct_9fa48("14227") ? "" : (stryCov_9fa48("14227"), 'C'),
    label: stryMutAct_9fa48("14228") ? "" : (stryCov_9fa48("14228"), 'Use AI outputs mainly as a starting point or draft, not as final answers'),
    points: 3
  }), stryMutAct_9fa48("14229") ? {} : (stryCov_9fa48("14229"), {
    value: stryMutAct_9fa48("14230") ? "" : (stryCov_9fa48("14230"), 'D'),
    label: stryMutAct_9fa48("14231") ? "" : (stryCov_9fa48("14231"), 'Accept AI outputs directly to save time unless there\'s an obvious error'),
    points: 1
  })]),
  correctAnswer: stryMutAct_9fa48("14232") ? "" : (stryCov_9fa48("14232"), 'B')
}), // Section 4: Technical Concepts & Integration
stryMutAct_9fa48("14233") ? {} : (stryCov_9fa48("14233"), {
  id: 8,
  section: 4,
  type: stryMutAct_9fa48("14234") ? "" : (stryCov_9fa48("14234"), 'likert'),
  question: stryMutAct_9fa48("14235") ? "" : (stryCov_9fa48("14235"), 'I demonstrate the ability to estimate technical effort and plan projects with scalability in mind.'),
  options: stryMutAct_9fa48("14236") ? [] : (stryCov_9fa48("14236"), [stryMutAct_9fa48("14237") ? {} : (stryCov_9fa48("14237"), {
    value: 1,
    label: stryMutAct_9fa48("14238") ? "" : (stryCov_9fa48("14238"), '1 - Strongly Disagree')
  }), stryMutAct_9fa48("14239") ? {} : (stryCov_9fa48("14239"), {
    value: 2,
    label: stryMutAct_9fa48("14240") ? "" : (stryCov_9fa48("14240"), '2 - Disagree')
  }), stryMutAct_9fa48("14241") ? {} : (stryCov_9fa48("14241"), {
    value: 3,
    label: stryMutAct_9fa48("14242") ? "" : (stryCov_9fa48("14242"), '3 - Neutral')
  }), stryMutAct_9fa48("14243") ? {} : (stryCov_9fa48("14243"), {
    value: 4,
    label: stryMutAct_9fa48("14244") ? "" : (stryCov_9fa48("14244"), '4 - Agree')
  }), stryMutAct_9fa48("14245") ? {} : (stryCov_9fa48("14245"), {
    value: 5,
    label: stryMutAct_9fa48("14246") ? "" : (stryCov_9fa48("14246"), '5 - Strongly Agree')
  })])
}), stryMutAct_9fa48("14247") ? {} : (stryCov_9fa48("14247"), {
  id: 9,
  section: 4,
  type: stryMutAct_9fa48("14248") ? "" : (stryCov_9fa48("14248"), 'multiple-choice'),
  question: stryMutAct_9fa48("14249") ? "" : (stryCov_9fa48("14249"), 'When planning how to implement a new feature, what\'s your general process?'),
  options: stryMutAct_9fa48("14250") ? [] : (stryCov_9fa48("14250"), [stryMutAct_9fa48("14251") ? {} : (stryCov_9fa48("14251"), {
    value: stryMutAct_9fa48("14252") ? "" : (stryCov_9fa48("14252"), 'A'),
    label: stryMutAct_9fa48("14253") ? "" : (stryCov_9fa48("14253"), 'Clarify requirements, outline the architecture, break into tasks, then code and test iteratively'),
    points: 5
  }), stryMutAct_9fa48("14254") ? {} : (stryCov_9fa48("14254"), {
    value: stryMutAct_9fa48("14255") ? "" : (stryCov_9fa48("14255"), 'B'),
    label: stryMutAct_9fa48("14256") ? "" : (stryCov_9fa48("14256"), 'Sketch out a quick proof of concept first to see if it\'s technically feasible before committing'),
    points: 4
  }), stryMutAct_9fa48("14257") ? {} : (stryCov_9fa48("14257"), {
    value: stryMutAct_9fa48("14258") ? "" : (stryCov_9fa48("14258"), 'C'),
    label: stryMutAct_9fa48("14259") ? "" : (stryCov_9fa48("14259"), 'Research how similar problems are solved and adapt an existing pattern or library'),
    points: 3
  }), stryMutAct_9fa48("14260") ? {} : (stryCov_9fa48("14260"), {
    value: stryMutAct_9fa48("14261") ? "" : (stryCov_9fa48("14261"), 'D'),
    label: stryMutAct_9fa48("14262") ? "" : (stryCov_9fa48("14262"), 'Start with the simplest possible implementation and plan to improve later if it scales'),
    points: 2
  })]),
  correctAnswer: stryMutAct_9fa48("14263") ? "" : (stryCov_9fa48("14263"), 'A')
})]);

// Section titles
const SECTION_TITLES = stryMutAct_9fa48("14264") ? {} : (stryCov_9fa48("14264"), {
  1: stryMutAct_9fa48("14265") ? "" : (stryCov_9fa48("14265"), 'Product & Business Thinking'),
  2: stryMutAct_9fa48("14266") ? "" : (stryCov_9fa48("14266"), 'Professional & Learning Skills'),
  3: stryMutAct_9fa48("14267") ? "" : (stryCov_9fa48("14267"), 'AI Direction & Collaboration'),
  4: stryMutAct_9fa48("14268") ? "" : (stryCov_9fa48("14268"), 'Technical Concepts & Integration')
});
function SelfAssessmentPage() {
  if (stryMutAct_9fa48("14269")) {
    {}
  } else {
    stryCov_9fa48("14269");
    const {
      assessmentId
    } = useParams();
    const navigate = useNavigate();
    const {
      token
    } = useAuth();

    // Assessment data
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(stryMutAct_9fa48("14270") ? false : (stryCov_9fa48("14270"), true));
    const [error, setError] = useState(stryMutAct_9fa48("14271") ? "Stryker was here!" : (stryCov_9fa48("14271"), ''));
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("14272") ? true : (stryCov_9fa48("14272"), false));
    const [isReadOnly, setIsReadOnly] = useState(stryMutAct_9fa48("14273") ? true : (stryCov_9fa48("14273"), false));
    const [hasShownInstructions, setHasShownInstructions] = useState(stryMutAct_9fa48("14274") ? true : (stryCov_9fa48("14274"), false));

    // Form state
    const [formData, setFormData] = useState(stryMutAct_9fa48("14275") ? {} : (stryCov_9fa48("14275"), {
      responses: {},
      currentSection: 1,
      currentQuestion: 1,
      startTime: new Date().toISOString(),
      sectionTimes: {},
      questionTimes: {}
    }));

    // Track section and question completion time
    const [sectionStartTime, setSectionStartTime] = useState(new Date());
    const [questionStartTime, setQuestionStartTime] = useState(new Date());

    // Fetch assessment data
    useEffect(() => {
      if (stryMutAct_9fa48("14276")) {
        {}
      } else {
        stryCov_9fa48("14276");
        fetchAssessment();
      }
    }, stryMutAct_9fa48("14277") ? [] : (stryCov_9fa48("14277"), [assessmentId]));

    // Show instructions on first load
    useEffect(() => {
      if (stryMutAct_9fa48("14278")) {
        {}
      } else {
        stryCov_9fa48("14278");
        if (stryMutAct_9fa48("14281") ? assessment && !isReadOnly || !hasShownInstructions : stryMutAct_9fa48("14280") ? false : stryMutAct_9fa48("14279") ? true : (stryCov_9fa48("14279", "14280", "14281"), (stryMutAct_9fa48("14283") ? assessment || !isReadOnly : stryMutAct_9fa48("14282") ? true : (stryCov_9fa48("14282", "14283"), assessment && (stryMutAct_9fa48("14284") ? isReadOnly : (stryCov_9fa48("14284"), !isReadOnly)))) && (stryMutAct_9fa48("14285") ? hasShownInstructions : (stryCov_9fa48("14285"), !hasShownInstructions)))) {
          if (stryMutAct_9fa48("14286")) {
            {}
          } else {
            stryCov_9fa48("14286");
            showInstructions();
            setHasShownInstructions(stryMutAct_9fa48("14287") ? false : (stryCov_9fa48("14287"), true));
          }
        }
      }
    }, stryMutAct_9fa48("14288") ? [] : (stryCov_9fa48("14288"), [assessment, isReadOnly, hasShownInstructions]));
    const fetchAssessment = async () => {
      if (stryMutAct_9fa48("14289")) {
        {}
      } else {
        stryCov_9fa48("14289");
        try {
          if (stryMutAct_9fa48("14290")) {
            {}
          } else {
            stryCov_9fa48("14290");
            setLoading(stryMutAct_9fa48("14291") ? false : (stryCov_9fa48("14291"), true));

            // Check if we're in read-only mode
            const isReadOnlyMode = window.location.pathname.includes(stryMutAct_9fa48("14292") ? "" : (stryCov_9fa48("14292"), '/readonly'));
            setIsReadOnly(isReadOnlyMode);

            // Determine endpoint based on mode
            const endpoint = isReadOnlyMode ? stryMutAct_9fa48("14293") ? `` : (stryCov_9fa48("14293"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/readonly`) : stryMutAct_9fa48("14294") ? `` : (stryCov_9fa48("14294"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}`);
            const response = await fetch(endpoint, stryMutAct_9fa48("14295") ? {} : (stryCov_9fa48("14295"), {
              headers: stryMutAct_9fa48("14296") ? {} : (stryCov_9fa48("14296"), {
                'Authorization': stryMutAct_9fa48("14297") ? `` : (stryCov_9fa48("14297"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("14298") ? "" : (stryCov_9fa48("14298"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("14300") ? false : stryMutAct_9fa48("14299") ? true : (stryCov_9fa48("14299", "14300"), response.ok)) {
              if (stryMutAct_9fa48("14301")) {
                {}
              } else {
                stryCov_9fa48("14301");
                const data = await response.json();
                setAssessment(data.assessment);

                // Load existing submission if exists
                if (stryMutAct_9fa48("14303") ? false : stryMutAct_9fa48("14302") ? true : (stryCov_9fa48("14302", "14303"), data.submission)) {
                  if (stryMutAct_9fa48("14304")) {
                    {}
                  } else {
                    stryCov_9fa48("14304");
                    const submissionData = stryMutAct_9fa48("14307") ? data.submission.submission_data && {} : stryMutAct_9fa48("14306") ? false : stryMutAct_9fa48("14305") ? true : (stryCov_9fa48("14305", "14306", "14307"), data.submission.submission_data || {});
                    setFormData(stryMutAct_9fa48("14308") ? () => undefined : (stryCov_9fa48("14308"), prev => stryMutAct_9fa48("14309") ? {} : (stryCov_9fa48("14309"), {
                      ...prev,
                      responses: stryMutAct_9fa48("14312") ? submissionData.responses && {} : stryMutAct_9fa48("14311") ? false : stryMutAct_9fa48("14310") ? true : (stryCov_9fa48("14310", "14311", "14312"), submissionData.responses || {}),
                      startTime: stryMutAct_9fa48("14315") ? submissionData.startTime && prev.startTime : stryMutAct_9fa48("14314") ? false : stryMutAct_9fa48("14313") ? true : (stryCov_9fa48("14313", "14314", "14315"), submissionData.startTime || prev.startTime),
                      sectionTimes: stryMutAct_9fa48("14318") ? submissionData.sectionTimes && {} : stryMutAct_9fa48("14317") ? false : stryMutAct_9fa48("14316") ? true : (stryCov_9fa48("14316", "14317", "14318"), submissionData.sectionTimes || {}),
                      questionTimes: stryMutAct_9fa48("14321") ? submissionData.questionTimes && {} : stryMutAct_9fa48("14320") ? false : stryMutAct_9fa48("14319") ? true : (stryCov_9fa48("14319", "14320", "14321"), submissionData.questionTimes || {}),
                      completionTime: submissionData.completionTime,
                      // If submitted or read-only, set to first section and question for review
                      currentSection: (stryMutAct_9fa48("14324") ? data.submission.status === 'submitted' && isReadOnlyMode : stryMutAct_9fa48("14323") ? false : stryMutAct_9fa48("14322") ? true : (stryCov_9fa48("14322", "14323", "14324"), (stryMutAct_9fa48("14326") ? data.submission.status !== 'submitted' : stryMutAct_9fa48("14325") ? false : (stryCov_9fa48("14325", "14326"), data.submission.status === (stryMutAct_9fa48("14327") ? "" : (stryCov_9fa48("14327"), 'submitted')))) || isReadOnlyMode)) ? 1 : prev.currentSection,
                      currentQuestion: (stryMutAct_9fa48("14330") ? data.submission.status === 'submitted' && isReadOnlyMode : stryMutAct_9fa48("14329") ? false : stryMutAct_9fa48("14328") ? true : (stryCov_9fa48("14328", "14329", "14330"), (stryMutAct_9fa48("14332") ? data.submission.status !== 'submitted' : stryMutAct_9fa48("14331") ? false : (stryCov_9fa48("14331", "14332"), data.submission.status === (stryMutAct_9fa48("14333") ? "" : (stryCov_9fa48("14333"), 'submitted')))) || isReadOnlyMode)) ? 1 : prev.currentQuestion
                    })));
                  }
                }
              }
            } else {
              if (stryMutAct_9fa48("14334")) {
                {}
              } else {
                stryCov_9fa48("14334");
                const errorData = await response.json();
                setError(stryMutAct_9fa48("14337") ? errorData.error && 'Failed to load assessment' : stryMutAct_9fa48("14336") ? false : stryMutAct_9fa48("14335") ? true : (stryCov_9fa48("14335", "14336", "14337"), errorData.error || (stryMutAct_9fa48("14338") ? "" : (stryCov_9fa48("14338"), 'Failed to load assessment'))));
              }
            }
          }
        } catch (err) {
          if (stryMutAct_9fa48("14339")) {
            {}
          } else {
            stryCov_9fa48("14339");
            console.error(stryMutAct_9fa48("14340") ? "" : (stryCov_9fa48("14340"), 'Error fetching assessment:'), err);
            setError(stryMutAct_9fa48("14341") ? "" : (stryCov_9fa48("14341"), 'Unable to load assessment. Please try again later.'));
          }
        } finally {
          if (stryMutAct_9fa48("14342")) {
            {}
          } else {
            stryCov_9fa48("14342");
            setLoading(stryMutAct_9fa48("14343") ? true : (stryCov_9fa48("14343"), false));
          }
        }
      }
    };
    const showInstructions = () => {
      if (stryMutAct_9fa48("14344")) {
        {}
      } else {
        stryCov_9fa48("14344");
        Swal.fire(stryMutAct_9fa48("14345") ? {} : (stryCov_9fa48("14345"), {
          title: stryMutAct_9fa48("14346") ? "" : (stryCov_9fa48("14346"), 'Self Assessment'),
          html: stryMutAct_9fa48("14347") ? `` : (stryCov_9fa48("14347"), `
        <div class="self-assessment-instructions">
          <p>This 9-question assessment helps us understand your current confidence and skills across four key areas:</p>
          <ol>
            <li>Product & Business Thinking</li>
            <li>Professional & Learning Skills</li>
            <li>AI Direction & Collaboration</li>
            <li>Technical Concepts & Integration</li>
          </ol>
          <p>Your honest responses will help us provide better support throughout the program.</p>
          <p>The assessment should take about 10-15 minutes to complete.</p>
        </div>
      `),
          showCancelButton: stryMutAct_9fa48("14348") ? true : (stryCov_9fa48("14348"), false),
          confirmButtonText: stryMutAct_9fa48("14349") ? "" : (stryCov_9fa48("14349"), 'Got it, let\'s start!'),
          confirmButtonColor: stryMutAct_9fa48("14350") ? "" : (stryCov_9fa48("14350"), '#4242ea'),
          width: stryMutAct_9fa48("14351") ? "" : (stryCov_9fa48("14351"), '600px'),
          background: stryMutAct_9fa48("14352") ? "" : (stryCov_9fa48("14352"), '#1A1F2C'),
          color: stryMutAct_9fa48("14353") ? "" : (stryCov_9fa48("14353"), 'var(--color-text-primary)'),
          customClass: stryMutAct_9fa48("14354") ? {} : (stryCov_9fa48("14354"), {
            popup: stryMutAct_9fa48("14355") ? "" : (stryCov_9fa48("14355"), 'swal2-popup-dark'),
            title: stryMutAct_9fa48("14356") ? "" : (stryCov_9fa48("14356"), 'swal2-title-custom'),
            htmlContainer: stryMutAct_9fa48("14357") ? "" : (stryCov_9fa48("14357"), 'swal2-html-custom'),
            confirmButton: stryMutAct_9fa48("14358") ? "" : (stryCov_9fa48("14358"), 'swal2-confirm-custom'),
            actions: stryMutAct_9fa48("14359") ? "" : (stryCov_9fa48("14359"), 'swal2-actions-custom')
          })
        }));
      }
    };

    // Get questions for current section
    const currentSectionQuestions = stryMutAct_9fa48("14360") ? ASSESSMENT_QUESTIONS : (stryCov_9fa48("14360"), ASSESSMENT_QUESTIONS.filter(stryMutAct_9fa48("14361") ? () => undefined : (stryCov_9fa48("14361"), q => stryMutAct_9fa48("14364") ? q.section !== formData.currentSection : stryMutAct_9fa48("14363") ? false : stryMutAct_9fa48("14362") ? true : (stryCov_9fa48("14362", "14363", "14364"), q.section === formData.currentSection))));

    // Get current question
    const currentQuestion = stryMutAct_9fa48("14367") ? currentSectionQuestions.find(q => q.id === formData.currentQuestion) && currentSectionQuestions[0] : stryMutAct_9fa48("14366") ? false : stryMutAct_9fa48("14365") ? true : (stryCov_9fa48("14365", "14366", "14367"), currentSectionQuestions.find(stryMutAct_9fa48("14368") ? () => undefined : (stryCov_9fa48("14368"), q => stryMutAct_9fa48("14371") ? q.id !== formData.currentQuestion : stryMutAct_9fa48("14370") ? false : stryMutAct_9fa48("14369") ? true : (stryCov_9fa48("14369", "14370", "14371"), q.id === formData.currentQuestion))) || currentSectionQuestions[0]);

    // Check if current section is complete
    const isSectionComplete = (sectionNum = formData.currentSection) => {
      if (stryMutAct_9fa48("14372")) {
        {}
      } else {
        stryCov_9fa48("14372");
        const sectionQuestions = stryMutAct_9fa48("14373") ? ASSESSMENT_QUESTIONS : (stryCov_9fa48("14373"), ASSESSMENT_QUESTIONS.filter(stryMutAct_9fa48("14374") ? () => undefined : (stryCov_9fa48("14374"), q => stryMutAct_9fa48("14377") ? q.section !== sectionNum : stryMutAct_9fa48("14376") ? false : stryMutAct_9fa48("14375") ? true : (stryCov_9fa48("14375", "14376", "14377"), q.section === sectionNum))));
        return stryMutAct_9fa48("14378") ? sectionQuestions.some(question => {
          return formData.responses[question.id] !== undefined && formData.responses[question.id] !== '';
        }) : (stryCov_9fa48("14378"), sectionQuestions.every(question => {
          if (stryMutAct_9fa48("14379")) {
            {}
          } else {
            stryCov_9fa48("14379");
            return stryMutAct_9fa48("14382") ? formData.responses[question.id] !== undefined || formData.responses[question.id] !== '' : stryMutAct_9fa48("14381") ? false : stryMutAct_9fa48("14380") ? true : (stryCov_9fa48("14380", "14381", "14382"), (stryMutAct_9fa48("14384") ? formData.responses[question.id] === undefined : stryMutAct_9fa48("14383") ? true : (stryCov_9fa48("14383", "14384"), formData.responses[question.id] !== undefined)) && (stryMutAct_9fa48("14386") ? formData.responses[question.id] === '' : stryMutAct_9fa48("14385") ? true : (stryCov_9fa48("14385", "14386"), formData.responses[question.id] !== (stryMutAct_9fa48("14387") ? "Stryker was here!" : (stryCov_9fa48("14387"), '')))));
          }
        }));
      }
    };

    // Get section completion percentage
    const getSectionCompletionPercentage = sectionNum => {
      if (stryMutAct_9fa48("14388")) {
        {}
      } else {
        stryCov_9fa48("14388");
        const sectionQuestions = stryMutAct_9fa48("14389") ? ASSESSMENT_QUESTIONS : (stryCov_9fa48("14389"), ASSESSMENT_QUESTIONS.filter(stryMutAct_9fa48("14390") ? () => undefined : (stryCov_9fa48("14390"), q => stryMutAct_9fa48("14393") ? q.section !== sectionNum : stryMutAct_9fa48("14392") ? false : stryMutAct_9fa48("14391") ? true : (stryCov_9fa48("14391", "14392", "14393"), q.section === sectionNum))));
        const answeredQuestions = stryMutAct_9fa48("14394") ? sectionQuestions : (stryCov_9fa48("14394"), sectionQuestions.filter(stryMutAct_9fa48("14395") ? () => undefined : (stryCov_9fa48("14395"), question => stryMutAct_9fa48("14398") ? formData.responses[question.id] !== undefined || formData.responses[question.id] !== '' : stryMutAct_9fa48("14397") ? false : stryMutAct_9fa48("14396") ? true : (stryCov_9fa48("14396", "14397", "14398"), (stryMutAct_9fa48("14400") ? formData.responses[question.id] === undefined : stryMutAct_9fa48("14399") ? true : (stryCov_9fa48("14399", "14400"), formData.responses[question.id] !== undefined)) && (stryMutAct_9fa48("14402") ? formData.responses[question.id] === '' : stryMutAct_9fa48("14401") ? true : (stryCov_9fa48("14401", "14402"), formData.responses[question.id] !== (stryMutAct_9fa48("14403") ? "Stryker was here!" : (stryCov_9fa48("14403"), ''))))))));
        return Math.round(stryMutAct_9fa48("14404") ? answeredQuestions.length / sectionQuestions.length / 100 : (stryCov_9fa48("14404"), (stryMutAct_9fa48("14405") ? answeredQuestions.length * sectionQuestions.length : (stryCov_9fa48("14405"), answeredQuestions.length / sectionQuestions.length)) * 100));
      }
    };

    // Check if entire assessment is complete
    const isAssessmentComplete = () => {
      if (stryMutAct_9fa48("14406")) {
        {}
      } else {
        stryCov_9fa48("14406");
        return stryMutAct_9fa48("14407") ? ASSESSMENT_QUESTIONS.some(question => {
          return formData.responses[question.id] !== undefined && formData.responses[question.id] !== '';
        }) : (stryCov_9fa48("14407"), ASSESSMENT_QUESTIONS.every(question => {
          if (stryMutAct_9fa48("14408")) {
            {}
          } else {
            stryCov_9fa48("14408");
            return stryMutAct_9fa48("14411") ? formData.responses[question.id] !== undefined || formData.responses[question.id] !== '' : stryMutAct_9fa48("14410") ? false : stryMutAct_9fa48("14409") ? true : (stryCov_9fa48("14409", "14410", "14411"), (stryMutAct_9fa48("14413") ? formData.responses[question.id] === undefined : stryMutAct_9fa48("14412") ? true : (stryCov_9fa48("14412", "14413"), formData.responses[question.id] !== undefined)) && (stryMutAct_9fa48("14415") ? formData.responses[question.id] === '' : stryMutAct_9fa48("14414") ? true : (stryCov_9fa48("14414", "14415"), formData.responses[question.id] !== (stryMutAct_9fa48("14416") ? "Stryker was here!" : (stryCov_9fa48("14416"), '')))));
          }
        }));
      }
    };

    // Handle response changes
    const handleResponseChange = (questionId, value) => {
      if (stryMutAct_9fa48("14417")) {
        {}
      } else {
        stryCov_9fa48("14417");
        if (stryMutAct_9fa48("14419") ? false : stryMutAct_9fa48("14418") ? true : (stryCov_9fa48("14418", "14419"), isReadOnly)) return;
        setFormData(stryMutAct_9fa48("14420") ? () => undefined : (stryCov_9fa48("14420"), prev => stryMutAct_9fa48("14421") ? {} : (stryCov_9fa48("14421"), {
          ...prev,
          responses: stryMutAct_9fa48("14422") ? {} : (stryCov_9fa48("14422"), {
            ...prev.responses,
            [questionId]: value
          })
        })));
      }
    };

    // Handle question navigation
    const handleQuestionChange = direction => {
      if (stryMutAct_9fa48("14423")) {
        {}
      } else {
        stryCov_9fa48("14423");
        if (stryMutAct_9fa48("14425") ? false : stryMutAct_9fa48("14424") ? true : (stryCov_9fa48("14424", "14425"), isReadOnly)) {
          if (stryMutAct_9fa48("14426")) {
            {}
          } else {
            stryCov_9fa48("14426");
            // In read-only mode, just change question without tracking time
            const nextQuestionIndex = stryMutAct_9fa48("14427") ? currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) - (direction === 'next' ? 1 : -1) : (stryCov_9fa48("14427"), currentSectionQuestions.findIndex(stryMutAct_9fa48("14428") ? () => undefined : (stryCov_9fa48("14428"), q => stryMutAct_9fa48("14431") ? q.id !== formData.currentQuestion : stryMutAct_9fa48("14430") ? false : stryMutAct_9fa48("14429") ? true : (stryCov_9fa48("14429", "14430", "14431"), q.id === formData.currentQuestion))) + ((stryMutAct_9fa48("14434") ? direction !== 'next' : stryMutAct_9fa48("14433") ? false : stryMutAct_9fa48("14432") ? true : (stryCov_9fa48("14432", "14433", "14434"), direction === (stryMutAct_9fa48("14435") ? "" : (stryCov_9fa48("14435"), 'next')))) ? 1 : stryMutAct_9fa48("14436") ? +1 : (stryCov_9fa48("14436"), -1)));

            // If moving past the last question in a section
            if (stryMutAct_9fa48("14440") ? nextQuestionIndex < currentSectionQuestions.length : stryMutAct_9fa48("14439") ? nextQuestionIndex > currentSectionQuestions.length : stryMutAct_9fa48("14438") ? false : stryMutAct_9fa48("14437") ? true : (stryCov_9fa48("14437", "14438", "14439", "14440"), nextQuestionIndex >= currentSectionQuestions.length)) {
              if (stryMutAct_9fa48("14441")) {
                {}
              } else {
                stryCov_9fa48("14441");
                if (stryMutAct_9fa48("14445") ? formData.currentSection >= 4 : stryMutAct_9fa48("14444") ? formData.currentSection <= 4 : stryMutAct_9fa48("14443") ? false : stryMutAct_9fa48("14442") ? true : (stryCov_9fa48("14442", "14443", "14444", "14445"), formData.currentSection < 4)) {
                  if (stryMutAct_9fa48("14446")) {
                    {}
                  } else {
                    stryCov_9fa48("14446");
                    // Move to next section, first question
                    setFormData(stryMutAct_9fa48("14447") ? () => undefined : (stryCov_9fa48("14447"), prev => stryMutAct_9fa48("14448") ? {} : (stryCov_9fa48("14448"), {
                      ...prev,
                      currentSection: stryMutAct_9fa48("14449") ? prev.currentSection - 1 : (stryCov_9fa48("14449"), prev.currentSection + 1),
                      currentQuestion: stryMutAct_9fa48("14452") ? ASSESSMENT_QUESTIONS.find(q => q.section === prev.currentSection + 1)?.id && 1 : stryMutAct_9fa48("14451") ? false : stryMutAct_9fa48("14450") ? true : (stryCov_9fa48("14450", "14451", "14452"), (stryMutAct_9fa48("14453") ? ASSESSMENT_QUESTIONS.find(q => q.section === prev.currentSection + 1).id : (stryCov_9fa48("14453"), ASSESSMENT_QUESTIONS.find(stryMutAct_9fa48("14454") ? () => undefined : (stryCov_9fa48("14454"), q => stryMutAct_9fa48("14457") ? q.section !== prev.currentSection + 1 : stryMutAct_9fa48("14456") ? false : stryMutAct_9fa48("14455") ? true : (stryCov_9fa48("14455", "14456", "14457"), q.section === (stryMutAct_9fa48("14458") ? prev.currentSection - 1 : (stryCov_9fa48("14458"), prev.currentSection + 1)))))?.id)) || 1)
                    })));
                  }
                }
                return;
              }
            }

            // If moving before the first question in a section
            if (stryMutAct_9fa48("14462") ? nextQuestionIndex >= 0 : stryMutAct_9fa48("14461") ? nextQuestionIndex <= 0 : stryMutAct_9fa48("14460") ? false : stryMutAct_9fa48("14459") ? true : (stryCov_9fa48("14459", "14460", "14461", "14462"), nextQuestionIndex < 0)) {
              if (stryMutAct_9fa48("14463")) {
                {}
              } else {
                stryCov_9fa48("14463");
                if (stryMutAct_9fa48("14467") ? formData.currentSection <= 1 : stryMutAct_9fa48("14466") ? formData.currentSection >= 1 : stryMutAct_9fa48("14465") ? false : stryMutAct_9fa48("14464") ? true : (stryCov_9fa48("14464", "14465", "14466", "14467"), formData.currentSection > 1)) {
                  if (stryMutAct_9fa48("14468")) {
                    {}
                  } else {
                    stryCov_9fa48("14468");
                    // Move to previous section, last question
                    const prevSectionQuestions = stryMutAct_9fa48("14469") ? ASSESSMENT_QUESTIONS : (stryCov_9fa48("14469"), ASSESSMENT_QUESTIONS.filter(stryMutAct_9fa48("14470") ? () => undefined : (stryCov_9fa48("14470"), q => stryMutAct_9fa48("14473") ? q.section !== formData.currentSection - 1 : stryMutAct_9fa48("14472") ? false : stryMutAct_9fa48("14471") ? true : (stryCov_9fa48("14471", "14472", "14473"), q.section === (stryMutAct_9fa48("14474") ? formData.currentSection + 1 : (stryCov_9fa48("14474"), formData.currentSection - 1))))));
                    setFormData(stryMutAct_9fa48("14475") ? () => undefined : (stryCov_9fa48("14475"), prev => stryMutAct_9fa48("14476") ? {} : (stryCov_9fa48("14476"), {
                      ...prev,
                      currentSection: stryMutAct_9fa48("14477") ? prev.currentSection + 1 : (stryCov_9fa48("14477"), prev.currentSection - 1),
                      currentQuestion: stryMutAct_9fa48("14480") ? prevSectionQuestions[prevSectionQuestions.length - 1]?.id && 1 : stryMutAct_9fa48("14479") ? false : stryMutAct_9fa48("14478") ? true : (stryCov_9fa48("14478", "14479", "14480"), (stryMutAct_9fa48("14481") ? prevSectionQuestions[prevSectionQuestions.length - 1].id : (stryCov_9fa48("14481"), prevSectionQuestions[stryMutAct_9fa48("14482") ? prevSectionQuestions.length + 1 : (stryCov_9fa48("14482"), prevSectionQuestions.length - 1)]?.id)) || 1)
                    })));
                  }
                }
                return;
              }
            }

            // Regular question navigation within section
            setFormData(stryMutAct_9fa48("14483") ? () => undefined : (stryCov_9fa48("14483"), prev => stryMutAct_9fa48("14484") ? {} : (stryCov_9fa48("14484"), {
              ...prev,
              currentQuestion: stryMutAct_9fa48("14487") ? currentSectionQuestions[nextQuestionIndex]?.id && prev.currentQuestion : stryMutAct_9fa48("14486") ? false : stryMutAct_9fa48("14485") ? true : (stryCov_9fa48("14485", "14486", "14487"), (stryMutAct_9fa48("14488") ? currentSectionQuestions[nextQuestionIndex].id : (stryCov_9fa48("14488"), currentSectionQuestions[nextQuestionIndex]?.id)) || prev.currentQuestion)
            })));
            return;
          }
        }

        // Save question completion time
        const questionEndTime = new Date();
        const questionDuration = stryMutAct_9fa48("14489") ? (questionEndTime - questionStartTime) * 1000 : (stryCov_9fa48("14489"), (stryMutAct_9fa48("14490") ? questionEndTime + questionStartTime : (stryCov_9fa48("14490"), questionEndTime - questionStartTime)) / 1000); // in seconds

        const nextQuestionIndex = stryMutAct_9fa48("14491") ? currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) - (direction === 'next' ? 1 : -1) : (stryCov_9fa48("14491"), currentSectionQuestions.findIndex(stryMutAct_9fa48("14492") ? () => undefined : (stryCov_9fa48("14492"), q => stryMutAct_9fa48("14495") ? q.id !== formData.currentQuestion : stryMutAct_9fa48("14494") ? false : stryMutAct_9fa48("14493") ? true : (stryCov_9fa48("14493", "14494", "14495"), q.id === formData.currentQuestion))) + ((stryMutAct_9fa48("14498") ? direction !== 'next' : stryMutAct_9fa48("14497") ? false : stryMutAct_9fa48("14496") ? true : (stryCov_9fa48("14496", "14497", "14498"), direction === (stryMutAct_9fa48("14499") ? "" : (stryCov_9fa48("14499"), 'next')))) ? 1 : stryMutAct_9fa48("14500") ? +1 : (stryCov_9fa48("14500"), -1)));

        // If moving past the last question in a section
        if (stryMutAct_9fa48("14504") ? nextQuestionIndex < currentSectionQuestions.length : stryMutAct_9fa48("14503") ? nextQuestionIndex > currentSectionQuestions.length : stryMutAct_9fa48("14502") ? false : stryMutAct_9fa48("14501") ? true : (stryCov_9fa48("14501", "14502", "14503", "14504"), nextQuestionIndex >= currentSectionQuestions.length)) {
          if (stryMutAct_9fa48("14505")) {
            {}
          } else {
            stryCov_9fa48("14505");
            if (stryMutAct_9fa48("14509") ? formData.currentSection >= 4 : stryMutAct_9fa48("14508") ? formData.currentSection <= 4 : stryMutAct_9fa48("14507") ? false : stryMutAct_9fa48("14506") ? true : (stryCov_9fa48("14506", "14507", "14508", "14509"), formData.currentSection < 4)) {
              if (stryMutAct_9fa48("14510")) {
                {}
              } else {
                stryCov_9fa48("14510");
                // Save section completion time
                const sectionEndTime = new Date();
                const sectionDuration = stryMutAct_9fa48("14511") ? (sectionEndTime - sectionStartTime) * 1000 : (stryCov_9fa48("14511"), (stryMutAct_9fa48("14512") ? sectionEndTime + sectionStartTime : (stryCov_9fa48("14512"), sectionEndTime - sectionStartTime)) / 1000); // in seconds

                // Move to next section, first question
                setFormData(stryMutAct_9fa48("14513") ? () => undefined : (stryCov_9fa48("14513"), prev => stryMutAct_9fa48("14514") ? {} : (stryCov_9fa48("14514"), {
                  ...prev,
                  questionTimes: stryMutAct_9fa48("14515") ? {} : (stryCov_9fa48("14515"), {
                    ...prev.questionTimes,
                    [prev.currentQuestion]: stryMutAct_9fa48("14516") ? (prev.questionTimes[prev.currentQuestion] || 0) - questionDuration : (stryCov_9fa48("14516"), (stryMutAct_9fa48("14519") ? prev.questionTimes[prev.currentQuestion] && 0 : stryMutAct_9fa48("14518") ? false : stryMutAct_9fa48("14517") ? true : (stryCov_9fa48("14517", "14518", "14519"), prev.questionTimes[prev.currentQuestion] || 0)) + questionDuration)
                  }),
                  sectionTimes: stryMutAct_9fa48("14520") ? {} : (stryCov_9fa48("14520"), {
                    ...prev.sectionTimes,
                    [prev.currentSection]: stryMutAct_9fa48("14521") ? (prev.sectionTimes[prev.currentSection] || 0) - sectionDuration : (stryCov_9fa48("14521"), (stryMutAct_9fa48("14524") ? prev.sectionTimes[prev.currentSection] && 0 : stryMutAct_9fa48("14523") ? false : stryMutAct_9fa48("14522") ? true : (stryCov_9fa48("14522", "14523", "14524"), prev.sectionTimes[prev.currentSection] || 0)) + sectionDuration)
                  }),
                  currentSection: stryMutAct_9fa48("14525") ? prev.currentSection - 1 : (stryCov_9fa48("14525"), prev.currentSection + 1),
                  currentQuestion: stryMutAct_9fa48("14528") ? ASSESSMENT_QUESTIONS.find(q => q.section === prev.currentSection + 1)?.id && 1 : stryMutAct_9fa48("14527") ? false : stryMutAct_9fa48("14526") ? true : (stryCov_9fa48("14526", "14527", "14528"), (stryMutAct_9fa48("14529") ? ASSESSMENT_QUESTIONS.find(q => q.section === prev.currentSection + 1).id : (stryCov_9fa48("14529"), ASSESSMENT_QUESTIONS.find(stryMutAct_9fa48("14530") ? () => undefined : (stryCov_9fa48("14530"), q => stryMutAct_9fa48("14533") ? q.section !== prev.currentSection + 1 : stryMutAct_9fa48("14532") ? false : stryMutAct_9fa48("14531") ? true : (stryCov_9fa48("14531", "14532", "14533"), q.section === (stryMutAct_9fa48("14534") ? prev.currentSection - 1 : (stryCov_9fa48("14534"), prev.currentSection + 1)))))?.id)) || 1)
                })));

                // Reset timers
                setSectionStartTime(new Date());
                setQuestionStartTime(new Date());

                // Save progress
                saveAssessmentData(stryMutAct_9fa48("14535") ? "" : (stryCov_9fa48("14535"), 'draft'));
                return;
              }
            }
          }
        }

        // If moving before the first question in a section
        if (stryMutAct_9fa48("14539") ? nextQuestionIndex >= 0 : stryMutAct_9fa48("14538") ? nextQuestionIndex <= 0 : stryMutAct_9fa48("14537") ? false : stryMutAct_9fa48("14536") ? true : (stryCov_9fa48("14536", "14537", "14538", "14539"), nextQuestionIndex < 0)) {
          if (stryMutAct_9fa48("14540")) {
            {}
          } else {
            stryCov_9fa48("14540");
            if (stryMutAct_9fa48("14544") ? formData.currentSection <= 1 : stryMutAct_9fa48("14543") ? formData.currentSection >= 1 : stryMutAct_9fa48("14542") ? false : stryMutAct_9fa48("14541") ? true : (stryCov_9fa48("14541", "14542", "14543", "14544"), formData.currentSection > 1)) {
              if (stryMutAct_9fa48("14545")) {
                {}
              } else {
                stryCov_9fa48("14545");
                // Save section completion time
                const sectionEndTime = new Date();
                const sectionDuration = stryMutAct_9fa48("14546") ? (sectionEndTime - sectionStartTime) * 1000 : (stryCov_9fa48("14546"), (stryMutAct_9fa48("14547") ? sectionEndTime + sectionStartTime : (stryCov_9fa48("14547"), sectionEndTime - sectionStartTime)) / 1000); // in seconds

                // Move to previous section, last question
                const prevSectionQuestions = stryMutAct_9fa48("14548") ? ASSESSMENT_QUESTIONS : (stryCov_9fa48("14548"), ASSESSMENT_QUESTIONS.filter(stryMutAct_9fa48("14549") ? () => undefined : (stryCov_9fa48("14549"), q => stryMutAct_9fa48("14552") ? q.section !== formData.currentSection - 1 : stryMutAct_9fa48("14551") ? false : stryMutAct_9fa48("14550") ? true : (stryCov_9fa48("14550", "14551", "14552"), q.section === (stryMutAct_9fa48("14553") ? formData.currentSection + 1 : (stryCov_9fa48("14553"), formData.currentSection - 1))))));
                setFormData(stryMutAct_9fa48("14554") ? () => undefined : (stryCov_9fa48("14554"), prev => stryMutAct_9fa48("14555") ? {} : (stryCov_9fa48("14555"), {
                  ...prev,
                  questionTimes: stryMutAct_9fa48("14556") ? {} : (stryCov_9fa48("14556"), {
                    ...prev.questionTimes,
                    [prev.currentQuestion]: stryMutAct_9fa48("14557") ? (prev.questionTimes[prev.currentQuestion] || 0) - questionDuration : (stryCov_9fa48("14557"), (stryMutAct_9fa48("14560") ? prev.questionTimes[prev.currentQuestion] && 0 : stryMutAct_9fa48("14559") ? false : stryMutAct_9fa48("14558") ? true : (stryCov_9fa48("14558", "14559", "14560"), prev.questionTimes[prev.currentQuestion] || 0)) + questionDuration)
                  }),
                  sectionTimes: stryMutAct_9fa48("14561") ? {} : (stryCov_9fa48("14561"), {
                    ...prev.sectionTimes,
                    [prev.currentSection]: stryMutAct_9fa48("14562") ? (prev.sectionTimes[prev.currentSection] || 0) - sectionDuration : (stryCov_9fa48("14562"), (stryMutAct_9fa48("14565") ? prev.sectionTimes[prev.currentSection] && 0 : stryMutAct_9fa48("14564") ? false : stryMutAct_9fa48("14563") ? true : (stryCov_9fa48("14563", "14564", "14565"), prev.sectionTimes[prev.currentSection] || 0)) + sectionDuration)
                  }),
                  currentSection: stryMutAct_9fa48("14566") ? prev.currentSection + 1 : (stryCov_9fa48("14566"), prev.currentSection - 1),
                  currentQuestion: stryMutAct_9fa48("14569") ? prevSectionQuestions[prevSectionQuestions.length - 1]?.id && 1 : stryMutAct_9fa48("14568") ? false : stryMutAct_9fa48("14567") ? true : (stryCov_9fa48("14567", "14568", "14569"), (stryMutAct_9fa48("14570") ? prevSectionQuestions[prevSectionQuestions.length - 1].id : (stryCov_9fa48("14570"), prevSectionQuestions[stryMutAct_9fa48("14571") ? prevSectionQuestions.length + 1 : (stryCov_9fa48("14571"), prevSectionQuestions.length - 1)]?.id)) || 1)
                })));

                // Reset timers
                setSectionStartTime(new Date());
                setQuestionStartTime(new Date());

                // Save progress
                saveAssessmentData(stryMutAct_9fa48("14572") ? "" : (stryCov_9fa48("14572"), 'draft'));
                return;
              }
            }
          }
        }

        // Regular question navigation within section
        setFormData(stryMutAct_9fa48("14573") ? () => undefined : (stryCov_9fa48("14573"), prev => stryMutAct_9fa48("14574") ? {} : (stryCov_9fa48("14574"), {
          ...prev,
          questionTimes: stryMutAct_9fa48("14575") ? {} : (stryCov_9fa48("14575"), {
            ...prev.questionTimes,
            [prev.currentQuestion]: stryMutAct_9fa48("14576") ? (prev.questionTimes[prev.currentQuestion] || 0) - questionDuration : (stryCov_9fa48("14576"), (stryMutAct_9fa48("14579") ? prev.questionTimes[prev.currentQuestion] && 0 : stryMutAct_9fa48("14578") ? false : stryMutAct_9fa48("14577") ? true : (stryCov_9fa48("14577", "14578", "14579"), prev.questionTimes[prev.currentQuestion] || 0)) + questionDuration)
          }),
          currentQuestion: stryMutAct_9fa48("14582") ? currentSectionQuestions[nextQuestionIndex]?.id && prev.currentQuestion : stryMutAct_9fa48("14581") ? false : stryMutAct_9fa48("14580") ? true : (stryCov_9fa48("14580", "14581", "14582"), (stryMutAct_9fa48("14583") ? currentSectionQuestions[nextQuestionIndex].id : (stryCov_9fa48("14583"), currentSectionQuestions[nextQuestionIndex]?.id)) || prev.currentQuestion)
        })));

        // Reset question timer
        setQuestionStartTime(new Date());

        // Save progress
        saveAssessmentData(stryMutAct_9fa48("14584") ? "" : (stryCov_9fa48("14584"), 'draft'));
      }
    };

    // Handle direct section change (from progress bar)
    const handleSectionChange = sectionNumber => {
      if (stryMutAct_9fa48("14585")) {
        {}
      } else {
        stryCov_9fa48("14585");
        if (stryMutAct_9fa48("14588") ? false : stryMutAct_9fa48("14587") ? true : stryMutAct_9fa48("14586") ? isReadOnly : (stryCov_9fa48("14586", "14587", "14588"), !isReadOnly)) return; // Only allow in read-only mode

        setFormData(stryMutAct_9fa48("14589") ? () => undefined : (stryCov_9fa48("14589"), prev => stryMutAct_9fa48("14590") ? {} : (stryCov_9fa48("14590"), {
          ...prev,
          currentSection: sectionNumber,
          currentQuestion: stryMutAct_9fa48("14593") ? ASSESSMENT_QUESTIONS.find(q => q.section === sectionNumber)?.id && 1 : stryMutAct_9fa48("14592") ? false : stryMutAct_9fa48("14591") ? true : (stryCov_9fa48("14591", "14592", "14593"), (stryMutAct_9fa48("14594") ? ASSESSMENT_QUESTIONS.find(q => q.section === sectionNumber).id : (stryCov_9fa48("14594"), ASSESSMENT_QUESTIONS.find(stryMutAct_9fa48("14595") ? () => undefined : (stryCov_9fa48("14595"), q => stryMutAct_9fa48("14598") ? q.section !== sectionNumber : stryMutAct_9fa48("14597") ? false : stryMutAct_9fa48("14596") ? true : (stryCov_9fa48("14596", "14597", "14598"), q.section === sectionNumber)))?.id)) || 1)
        })));
      }
    };

    // Save assessment data
    const saveAssessmentData = async status => {
      if (stryMutAct_9fa48("14599")) {
        {}
      } else {
        stryCov_9fa48("14599");
        try {
          if (stryMutAct_9fa48("14600")) {
            {}
          } else {
            stryCov_9fa48("14600");
            // For final submission, add completion time
            let finalFormData = formData;
            if (stryMutAct_9fa48("14603") ? status !== 'submitted' : stryMutAct_9fa48("14602") ? false : stryMutAct_9fa48("14601") ? true : (stryCov_9fa48("14601", "14602", "14603"), status === (stryMutAct_9fa48("14604") ? "" : (stryCov_9fa48("14604"), 'submitted')))) {
              if (stryMutAct_9fa48("14605")) {
                {}
              } else {
                stryCov_9fa48("14605");
                // Save final question and section time
                const questionEndTime = new Date();
                const questionDuration = stryMutAct_9fa48("14606") ? (questionEndTime - questionStartTime) * 1000 : (stryCov_9fa48("14606"), (stryMutAct_9fa48("14607") ? questionEndTime + questionStartTime : (stryCov_9fa48("14607"), questionEndTime - questionStartTime)) / 1000); // in seconds

                const sectionEndTime = new Date();
                const sectionDuration = stryMutAct_9fa48("14608") ? (sectionEndTime - sectionStartTime) * 1000 : (stryCov_9fa48("14608"), (stryMutAct_9fa48("14609") ? sectionEndTime + sectionStartTime : (stryCov_9fa48("14609"), sectionEndTime - sectionStartTime)) / 1000); // in seconds

                finalFormData = stryMutAct_9fa48("14610") ? {} : (stryCov_9fa48("14610"), {
                  ...formData,
                  questionTimes: stryMutAct_9fa48("14611") ? {} : (stryCov_9fa48("14611"), {
                    ...formData.questionTimes,
                    [formData.currentQuestion]: stryMutAct_9fa48("14612") ? (formData.questionTimes[formData.currentQuestion] || 0) - questionDuration : (stryCov_9fa48("14612"), (stryMutAct_9fa48("14615") ? formData.questionTimes[formData.currentQuestion] && 0 : stryMutAct_9fa48("14614") ? false : stryMutAct_9fa48("14613") ? true : (stryCov_9fa48("14613", "14614", "14615"), formData.questionTimes[formData.currentQuestion] || 0)) + questionDuration)
                  }),
                  sectionTimes: stryMutAct_9fa48("14616") ? {} : (stryCov_9fa48("14616"), {
                    ...formData.sectionTimes,
                    [formData.currentSection]: stryMutAct_9fa48("14617") ? (formData.sectionTimes[formData.currentSection] || 0) - sectionDuration : (stryCov_9fa48("14617"), (stryMutAct_9fa48("14620") ? formData.sectionTimes[formData.currentSection] && 0 : stryMutAct_9fa48("14619") ? false : stryMutAct_9fa48("14618") ? true : (stryCov_9fa48("14618", "14619", "14620"), formData.sectionTimes[formData.currentSection] || 0)) + sectionDuration)
                  }),
                  completionTime: new Date().toISOString()
                });
              }
            }
            const response = await fetch(stryMutAct_9fa48("14621") ? `` : (stryCov_9fa48("14621"), `${import.meta.env.VITE_API_URL}/api/assessments/${assessmentId}/submissions`), stryMutAct_9fa48("14622") ? {} : (stryCov_9fa48("14622"), {
              method: stryMutAct_9fa48("14623") ? "" : (stryCov_9fa48("14623"), 'POST'),
              headers: stryMutAct_9fa48("14624") ? {} : (stryCov_9fa48("14624"), {
                'Authorization': stryMutAct_9fa48("14625") ? `` : (stryCov_9fa48("14625"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("14626") ? "" : (stryCov_9fa48("14626"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("14627") ? {} : (stryCov_9fa48("14627"), {
                submission_data: finalFormData,
                status: status
              }))
            }));
            if (stryMutAct_9fa48("14629") ? false : stryMutAct_9fa48("14628") ? true : (stryCov_9fa48("14628", "14629"), response.ok)) {
              if (stryMutAct_9fa48("14630")) {
                {}
              } else {
                stryCov_9fa48("14630");
                if (stryMutAct_9fa48("14633") ? status !== 'submitted' : stryMutAct_9fa48("14632") ? false : stryMutAct_9fa48("14631") ? true : (stryCov_9fa48("14631", "14632", "14633"), status === (stryMutAct_9fa48("14634") ? "" : (stryCov_9fa48("14634"), 'submitted')))) {
                  if (stryMutAct_9fa48("14635")) {
                    {}
                  } else {
                    stryCov_9fa48("14635");
                    // Show success message
                    Swal.fire(stryMutAct_9fa48("14636") ? {} : (stryCov_9fa48("14636"), {
                      title: stryMutAct_9fa48("14637") ? "" : (stryCov_9fa48("14637"), 'Assessment Submitted!'),
                      text: stryMutAct_9fa48("14638") ? "" : (stryCov_9fa48("14638"), 'Your self-assessment has been successfully submitted. Thank you!'),
                      icon: stryMutAct_9fa48("14639") ? "" : (stryCov_9fa48("14639"), 'success'),
                      showCancelButton: stryMutAct_9fa48("14640") ? true : (stryCov_9fa48("14640"), false),
                      confirmButtonText: stryMutAct_9fa48("14641") ? "" : (stryCov_9fa48("14641"), 'Back to Assessments'),
                      confirmButtonColor: stryMutAct_9fa48("14642") ? "" : (stryCov_9fa48("14642"), '#28a745'),
                      background: stryMutAct_9fa48("14643") ? "" : (stryCov_9fa48("14643"), '#1A1F2C'),
                      color: stryMutAct_9fa48("14644") ? "" : (stryCov_9fa48("14644"), 'var(--color-text-primary)'),
                      customClass: stryMutAct_9fa48("14645") ? {} : (stryCov_9fa48("14645"), {
                        popup: stryMutAct_9fa48("14646") ? "" : (stryCov_9fa48("14646"), 'swal2-popup-dark'),
                        confirmButton: stryMutAct_9fa48("14647") ? "" : (stryCov_9fa48("14647"), 'swal2-confirm-custom')
                      })
                    })).then(() => {
                      if (stryMutAct_9fa48("14648")) {
                        {}
                      } else {
                        stryCov_9fa48("14648");
                        navigate(stryMutAct_9fa48("14649") ? "" : (stryCov_9fa48("14649"), '/assessment'));
                      }
                    });
                  }
                }
                return stryMutAct_9fa48("14650") ? false : (stryCov_9fa48("14650"), true);
              }
            } else {
              if (stryMutAct_9fa48("14651")) {
                {}
              } else {
                stryCov_9fa48("14651");
                console.error(stryMutAct_9fa48("14652") ? "" : (stryCov_9fa48("14652"), 'Failed to save assessment data:'), response.status);
                if (stryMutAct_9fa48("14655") ? status !== 'submitted' : stryMutAct_9fa48("14654") ? false : stryMutAct_9fa48("14653") ? true : (stryCov_9fa48("14653", "14654", "14655"), status === (stryMutAct_9fa48("14656") ? "" : (stryCov_9fa48("14656"), 'submitted')))) {
                  if (stryMutAct_9fa48("14657")) {
                    {}
                  } else {
                    stryCov_9fa48("14657");
                    Swal.fire(stryMutAct_9fa48("14658") ? {} : (stryCov_9fa48("14658"), {
                      title: stryMutAct_9fa48("14659") ? "" : (stryCov_9fa48("14659"), 'Submission Failed'),
                      text: stryMutAct_9fa48("14660") ? "" : (stryCov_9fa48("14660"), 'There was an error submitting your assessment. Please try again.'),
                      icon: stryMutAct_9fa48("14661") ? "" : (stryCov_9fa48("14661"), 'error'),
                      confirmButtonColor: stryMutAct_9fa48("14662") ? "" : (stryCov_9fa48("14662"), '#dc3545'),
                      background: stryMutAct_9fa48("14663") ? "" : (stryCov_9fa48("14663"), '#1A1F2C'),
                      color: stryMutAct_9fa48("14664") ? "" : (stryCov_9fa48("14664"), 'var(--color-text-primary)')
                    }));
                  }
                }
                return stryMutAct_9fa48("14665") ? true : (stryCov_9fa48("14665"), false);
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("14666")) {
            {}
          } else {
            stryCov_9fa48("14666");
            console.error(stryMutAct_9fa48("14667") ? "" : (stryCov_9fa48("14667"), 'Error saving assessment data:'), error);
            if (stryMutAct_9fa48("14670") ? status !== 'submitted' : stryMutAct_9fa48("14669") ? false : stryMutAct_9fa48("14668") ? true : (stryCov_9fa48("14668", "14669", "14670"), status === (stryMutAct_9fa48("14671") ? "" : (stryCov_9fa48("14671"), 'submitted')))) {
              if (stryMutAct_9fa48("14672")) {
                {}
              } else {
                stryCov_9fa48("14672");
                Swal.fire(stryMutAct_9fa48("14673") ? {} : (stryCov_9fa48("14673"), {
                  title: stryMutAct_9fa48("14674") ? "" : (stryCov_9fa48("14674"), 'Submission Failed'),
                  text: stryMutAct_9fa48("14675") ? "" : (stryCov_9fa48("14675"), 'There was an error submitting your assessment. Please try again.'),
                  icon: stryMutAct_9fa48("14676") ? "" : (stryCov_9fa48("14676"), 'error'),
                  confirmButtonColor: stryMutAct_9fa48("14677") ? "" : (stryCov_9fa48("14677"), '#dc3545'),
                  background: stryMutAct_9fa48("14678") ? "" : (stryCov_9fa48("14678"), '#1A1F2C'),
                  color: stryMutAct_9fa48("14679") ? "" : (stryCov_9fa48("14679"), 'var(--color-text-primary)')
                }));
              }
            }
            return stryMutAct_9fa48("14680") ? true : (stryCov_9fa48("14680"), false);
          }
        }
      }
    };

    // Handle final submission
    const handleSubmit = async () => {
      if (stryMutAct_9fa48("14681")) {
        {}
      } else {
        stryCov_9fa48("14681");
        if (stryMutAct_9fa48("14684") ? false : stryMutAct_9fa48("14683") ? true : stryMutAct_9fa48("14682") ? isAssessmentComplete() : (stryCov_9fa48("14682", "14683", "14684"), !isAssessmentComplete())) {
          if (stryMutAct_9fa48("14685")) {
            {}
          } else {
            stryCov_9fa48("14685");
            Swal.fire(stryMutAct_9fa48("14686") ? {} : (stryCov_9fa48("14686"), {
              title: stryMutAct_9fa48("14687") ? "" : (stryCov_9fa48("14687"), 'Incomplete Assessment'),
              text: stryMutAct_9fa48("14688") ? "" : (stryCov_9fa48("14688"), 'Please complete all questions before submitting.'),
              icon: stryMutAct_9fa48("14689") ? "" : (stryCov_9fa48("14689"), 'warning'),
              confirmButtonColor: stryMutAct_9fa48("14690") ? "" : (stryCov_9fa48("14690"), '#f0ad4e'),
              background: stryMutAct_9fa48("14691") ? "" : (stryCov_9fa48("14691"), '#1A1F2C'),
              color: stryMutAct_9fa48("14692") ? "" : (stryCov_9fa48("14692"), 'var(--color-text-primary)')
            }));
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("14693") ? false : (stryCov_9fa48("14693"), true));
        const success = await saveAssessmentData(stryMutAct_9fa48("14694") ? "" : (stryCov_9fa48("14694"), 'submitted'));
        if (stryMutAct_9fa48("14697") ? false : stryMutAct_9fa48("14696") ? true : stryMutAct_9fa48("14695") ? success : (stryCov_9fa48("14695", "14696", "14697"), !success)) {
          if (stryMutAct_9fa48("14698")) {
            {}
          } else {
            stryCov_9fa48("14698");
            setIsSubmitting(stryMutAct_9fa48("14699") ? true : (stryCov_9fa48("14699"), false));
          }
        }
      }
    };

    // Render question based on type
    const renderQuestion = question => {
      if (stryMutAct_9fa48("14700")) {
        {}
      } else {
        stryCov_9fa48("14700");
        const response = stryMutAct_9fa48("14703") ? formData.responses[question.id] && '' : stryMutAct_9fa48("14702") ? false : stryMutAct_9fa48("14701") ? true : (stryCov_9fa48("14701", "14702", "14703"), formData.responses[question.id] || (stryMutAct_9fa48("14704") ? "Stryker was here!" : (stryCov_9fa48("14704"), '')));
        switch (question.type) {
          case stryMutAct_9fa48("14706") ? "" : (stryCov_9fa48("14706"), 'likert'):
            if (stryMutAct_9fa48("14705")) {} else {
              stryCov_9fa48("14705");
              return <div className="self-assessment__likert">
            <div className="self-assessment__likert-options">
              {question.options.map(stryMutAct_9fa48("14707") ? () => undefined : (stryCov_9fa48("14707"), option => <div key={option.value} className={stryMutAct_9fa48("14708") ? `` : (stryCov_9fa48("14708"), `self-assessment__likert-option ${(stryMutAct_9fa48("14711") ? response !== option.value : stryMutAct_9fa48("14710") ? false : stryMutAct_9fa48("14709") ? true : (stryCov_9fa48("14709", "14710", "14711"), response === option.value)) ? stryMutAct_9fa48("14712") ? "" : (stryCov_9fa48("14712"), 'self-assessment__likert-option--selected') : stryMutAct_9fa48("14713") ? "Stryker was here!" : (stryCov_9fa48("14713"), '')}`)} onClick={stryMutAct_9fa48("14714") ? () => undefined : (stryCov_9fa48("14714"), () => handleResponseChange(question.id, option.value))}>
                  <div className="self-assessment__likert-value">{option.value}</div>
                  <div className="self-assessment__likert-label">{option.label}</div>
                </div>))}
            </div>
          </div>;
            }
          case stryMutAct_9fa48("14716") ? "" : (stryCov_9fa48("14716"), 'multiple-choice'):
            if (stryMutAct_9fa48("14715")) {} else {
              stryCov_9fa48("14715");
              return <div className="self-assessment__multiple-choice">
            {question.options.map(stryMutAct_9fa48("14717") ? () => undefined : (stryCov_9fa48("14717"), option => <div key={option.value} className={stryMutAct_9fa48("14718") ? `` : (stryCov_9fa48("14718"), `self-assessment__mc-option ${(stryMutAct_9fa48("14721") ? response !== option.value : stryMutAct_9fa48("14720") ? false : stryMutAct_9fa48("14719") ? true : (stryCov_9fa48("14719", "14720", "14721"), response === option.value)) ? stryMutAct_9fa48("14722") ? "" : (stryCov_9fa48("14722"), 'self-assessment__mc-option--selected') : stryMutAct_9fa48("14723") ? "Stryker was here!" : (stryCov_9fa48("14723"), '')}`)} onClick={stryMutAct_9fa48("14724") ? () => undefined : (stryCov_9fa48("14724"), () => handleResponseChange(question.id, option.value))}>
                <div className="self-assessment__mc-indicator">
                  {stryMutAct_9fa48("14727") ? response === option.value || <FaCheck /> : stryMutAct_9fa48("14726") ? false : stryMutAct_9fa48("14725") ? true : (stryCov_9fa48("14725", "14726", "14727"), (stryMutAct_9fa48("14729") ? response !== option.value : stryMutAct_9fa48("14728") ? true : (stryCov_9fa48("14728", "14729"), response === option.value)) && <FaCheck />)}
                </div>
                <div className="self-assessment__mc-label">
                  <strong>{option.value}.</strong> {option.label}
                </div>
              </div>))}
          </div>;
            }
          case stryMutAct_9fa48("14731") ? "" : (stryCov_9fa48("14731"), 'short-text'):
            if (stryMutAct_9fa48("14730")) {} else {
              stryCov_9fa48("14730");
              return <div className="self-assessment__text-response">
            <textarea className="self-assessment__text-input self-assessment__text-input--short" value={response} onChange={stryMutAct_9fa48("14732") ? () => undefined : (stryCov_9fa48("14732"), e => handleResponseChange(question.id, e.target.value))} placeholder={question.placeholder} disabled={isReadOnly} rows={3} />
            {stryMutAct_9fa48("14735") ? question.criteria || <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map((criterion, index) => <li key={index} className="self-assessment__criteria-item">{criterion}</li>)}
                </ul>
              </div> : stryMutAct_9fa48("14734") ? false : stryMutAct_9fa48("14733") ? true : (stryCov_9fa48("14733", "14734", "14735"), question.criteria && <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map(stryMutAct_9fa48("14736") ? () => undefined : (stryCov_9fa48("14736"), (criterion, index) => <li key={index} className="self-assessment__criteria-item">{criterion}</li>))}
                </ul>
              </div>)}
          </div>;
            }
          case stryMutAct_9fa48("14738") ? "" : (stryCov_9fa48("14738"), 'long-text'):
            if (stryMutAct_9fa48("14737")) {} else {
              stryCov_9fa48("14737");
              return <div className="self-assessment__text-response">
            <textarea className="self-assessment__text-input self-assessment__text-input--long" value={response} onChange={stryMutAct_9fa48("14739") ? () => undefined : (stryCov_9fa48("14739"), e => handleResponseChange(question.id, e.target.value))} placeholder={question.placeholder} disabled={isReadOnly} rows={6} />
            {stryMutAct_9fa48("14742") ? question.criteria || <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map((criterion, index) => <li key={index} className="self-assessment__criteria-item">{criterion}</li>)}
                </ul>
              </div> : stryMutAct_9fa48("14741") ? false : stryMutAct_9fa48("14740") ? true : (stryCov_9fa48("14740", "14741", "14742"), question.criteria && <div className="self-assessment__criteria">
                <div className="self-assessment__criteria-title">Evaluation Criteria:</div>
                <ul className="self-assessment__criteria-list">
                  {question.criteria.map(stryMutAct_9fa48("14743") ? () => undefined : (stryCov_9fa48("14743"), (criterion, index) => <li key={index} className="self-assessment__criteria-item">{criterion}</li>))}
                </ul>
              </div>)}
          </div>;
            }
          default:
            if (stryMutAct_9fa48("14744")) {} else {
              stryCov_9fa48("14744");
              return null;
            }
        }
      }
    };
    if (stryMutAct_9fa48("14746") ? false : stryMutAct_9fa48("14745") ? true : (stryCov_9fa48("14745", "14746"), loading)) {
      if (stryMutAct_9fa48("14747")) {
        {}
      } else {
        stryCov_9fa48("14747");
        return <div className="self-assessment-page">
        <div className="self-assessment-page__loading">
          <div className="self-assessment-page__loading-spinner"></div>
          <p>Loading assessment...</p>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("14749") ? false : stryMutAct_9fa48("14748") ? true : (stryCov_9fa48("14748", "14749"), error)) {
      if (stryMutAct_9fa48("14750")) {
        {}
      } else {
        stryCov_9fa48("14750");
        return <div className="self-assessment-page">
        <div className="self-assessment-page__error">
          <h2>Error Loading Assessment</h2>
          <p>{error}</p>
          <button onClick={stryMutAct_9fa48("14751") ? () => undefined : (stryCov_9fa48("14751"), () => navigate(stryMutAct_9fa48("14752") ? "" : (stryCov_9fa48("14752"), '/assessment')))} className="self-assessment-page__back-btn">
            Back to Assessments
          </button>
        </div>
      </div>;
      }
    }
    return <div className="self-assessment-page">
      {/* Header */}
      <div className="self-assessment-page__header">
        <div className="self-assessment-page__header-spacer"></div>
        
        <div className="self-assessment-page__header-buttons">
          {stryMutAct_9fa48("14755") ? !isReadOnly || <button onClick={showInstructions} className="self-assessment-page__info-btn">
              View Instructions
            </button> : stryMutAct_9fa48("14754") ? false : stryMutAct_9fa48("14753") ? true : (stryCov_9fa48("14753", "14754", "14755"), (stryMutAct_9fa48("14756") ? isReadOnly : (stryCov_9fa48("14756"), !isReadOnly)) && <button onClick={showInstructions} className="self-assessment-page__info-btn">
              View Instructions
            </button>)}
          
          <button onClick={stryMutAct_9fa48("14757") ? () => undefined : (stryCov_9fa48("14757"), () => navigate(stryMutAct_9fa48("14758") ? "" : (stryCov_9fa48("14758"), '/assessment')))} className="self-assessment-page__back-btn">
            <FaArrowLeft /> Back to Assessments
          </button>
          
          {stryMutAct_9fa48("14761") ? isReadOnly || <span className="self-assessment-page__readonly-badge">Read Only</span> : stryMutAct_9fa48("14760") ? false : stryMutAct_9fa48("14759") ? true : (stryCov_9fa48("14759", "14760", "14761"), isReadOnly && <span className="self-assessment-page__readonly-badge">Read Only</span>)}
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="self-assessment__progress">
        {(stryMutAct_9fa48("14762") ? [] : (stryCov_9fa48("14762"), [1, 2, 3, 4])).map(stryMutAct_9fa48("14763") ? () => undefined : (stryCov_9fa48("14763"), section => <div key={section} className={stryMutAct_9fa48("14764") ? `` : (stryCov_9fa48("14764"), `self-assessment__progress-step ${(stryMutAct_9fa48("14767") ? formData.currentSection !== section : stryMutAct_9fa48("14766") ? false : stryMutAct_9fa48("14765") ? true : (stryCov_9fa48("14765", "14766", "14767"), formData.currentSection === section)) ? stryMutAct_9fa48("14768") ? "" : (stryCov_9fa48("14768"), 'self-assessment__progress-step--active') : stryMutAct_9fa48("14769") ? "Stryker was here!" : (stryCov_9fa48("14769"), '')} ${isSectionComplete(section) ? stryMutAct_9fa48("14770") ? "" : (stryCov_9fa48("14770"), 'self-assessment__progress-step--completed') : stryMutAct_9fa48("14771") ? "Stryker was here!" : (stryCov_9fa48("14771"), '')}`)} onClick={stryMutAct_9fa48("14772") ? () => undefined : (stryCov_9fa48("14772"), () => stryMutAct_9fa48("14775") ? isReadOnly || handleSectionChange(section) : stryMutAct_9fa48("14774") ? false : stryMutAct_9fa48("14773") ? true : (stryCov_9fa48("14773", "14774", "14775"), isReadOnly && handleSectionChange(section)))}>
            <div className="self-assessment__progress-number">
              {isSectionComplete(section) ? <FaCheck className="self-assessment__progress-check" /> : stryMutAct_9fa48("14776") ? `` : (stryCov_9fa48("14776"), `${getSectionCompletionPercentage(section)}%`)}
            </div>
            <div className="self-assessment__progress-label">{SECTION_TITLES[section]}</div>
            <div className="self-assessment__progress-bar" style={stryMutAct_9fa48("14777") ? {} : (stryCov_9fa48("14777"), {
            width: stryMutAct_9fa48("14778") ? `` : (stryCov_9fa48("14778"), `${getSectionCompletionPercentage(section)}%`)
          })}></div>
          </div>))}
      </div>
      
      {/* Main content */}
      <div className="self-assessment-page__content">
        {/* Section title */}
        {/* <h2 className="self-assessment__section-title">
          Section {formData.currentSection}: {SECTION_TITLES[formData.currentSection]}
         </h2> */}
        
        {/* Question progress indicator */}
        <div className="self-assessment__question-progress">
          {currentSectionQuestions.map(stryMutAct_9fa48("14779") ? () => undefined : (stryCov_9fa48("14779"), (question, index) => <div key={question.id} className={stryMutAct_9fa48("14780") ? `` : (stryCov_9fa48("14780"), `self-assessment__question-bubble ${(stryMutAct_9fa48("14783") ? question.id !== formData.currentQuestion : stryMutAct_9fa48("14782") ? false : stryMutAct_9fa48("14781") ? true : (stryCov_9fa48("14781", "14782", "14783"), question.id === formData.currentQuestion)) ? stryMutAct_9fa48("14784") ? "" : (stryCov_9fa48("14784"), 'self-assessment__question-bubble--active') : stryMutAct_9fa48("14785") ? "Stryker was here!" : (stryCov_9fa48("14785"), '')} ${formData.responses[question.id] ? stryMutAct_9fa48("14786") ? "" : (stryCov_9fa48("14786"), 'self-assessment__question-bubble--answered') : stryMutAct_9fa48("14787") ? "Stryker was here!" : (stryCov_9fa48("14787"), '')}`)} onClick={stryMutAct_9fa48("14788") ? () => undefined : (stryCov_9fa48("14788"), () => stryMutAct_9fa48("14791") ? isReadOnly || setFormData(prev => ({
            ...prev,
            currentQuestion: question.id
          })) : stryMutAct_9fa48("14790") ? false : stryMutAct_9fa48("14789") ? true : (stryCov_9fa48("14789", "14790", "14791"), isReadOnly && setFormData(stryMutAct_9fa48("14792") ? () => undefined : (stryCov_9fa48("14792"), prev => stryMutAct_9fa48("14793") ? {} : (stryCov_9fa48("14793"), {
            ...prev,
            currentQuestion: question.id
          })))))} title={stryMutAct_9fa48("14794") ? `` : (stryCov_9fa48("14794"), `Question ${stryMutAct_9fa48("14795") ? index - 1 : (stryCov_9fa48("14795"), index + 1)}`)}>
              {stryMutAct_9fa48("14796") ? index - 1 : (stryCov_9fa48("14796"), index + 1)}
            </div>))}
        </div>
        
        {/* Current Question */}
        <div className="self-assessment__questions">
          <div className="self-assessment__question">
            <div className="self-assessment__question-number">
              Question {stryMutAct_9fa48("14797") ? currentSectionQuestions.findIndex(q => q.id === currentQuestion.id) - 1 : (stryCov_9fa48("14797"), currentSectionQuestions.findIndex(stryMutAct_9fa48("14798") ? () => undefined : (stryCov_9fa48("14798"), q => stryMutAct_9fa48("14801") ? q.id !== currentQuestion.id : stryMutAct_9fa48("14800") ? false : stryMutAct_9fa48("14799") ? true : (stryCov_9fa48("14799", "14800", "14801"), q.id === currentQuestion.id))) + 1)} of {currentSectionQuestions.length}
            </div>
            <div className="self-assessment__question-text">{currentQuestion.question}</div>
            {renderQuestion(currentQuestion)}
          </div>
        </div>
        
        {/* Navigation */}
        <div className="self-assessment__navigation">
          {/* Previous button - show if not first question in first section */}
          {stryMutAct_9fa48("14804") ? formData.currentSection > 1 || currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) > 0 || <button className="self-assessment__nav-btn self-assessment__nav-btn--prev" onClick={() => handleQuestionChange('prev')}>
              <FaArrowLeft /> Previous
            </button> : stryMutAct_9fa48("14803") ? false : stryMutAct_9fa48("14802") ? true : (stryCov_9fa48("14802", "14803", "14804"), (stryMutAct_9fa48("14806") ? formData.currentSection > 1 && currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) > 0 : stryMutAct_9fa48("14805") ? true : (stryCov_9fa48("14805", "14806"), (stryMutAct_9fa48("14809") ? formData.currentSection <= 1 : stryMutAct_9fa48("14808") ? formData.currentSection >= 1 : stryMutAct_9fa48("14807") ? false : (stryCov_9fa48("14807", "14808", "14809"), formData.currentSection > 1)) || (stryMutAct_9fa48("14812") ? currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) <= 0 : stryMutAct_9fa48("14811") ? currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) >= 0 : stryMutAct_9fa48("14810") ? false : (stryCov_9fa48("14810", "14811", "14812"), currentSectionQuestions.findIndex(stryMutAct_9fa48("14813") ? () => undefined : (stryCov_9fa48("14813"), q => stryMutAct_9fa48("14816") ? q.id !== formData.currentQuestion : stryMutAct_9fa48("14815") ? false : stryMutAct_9fa48("14814") ? true : (stryCov_9fa48("14814", "14815", "14816"), q.id === formData.currentQuestion))) > 0)))) && <button className="self-assessment__nav-btn self-assessment__nav-btn--prev" onClick={stryMutAct_9fa48("14817") ? () => undefined : (stryCov_9fa48("14817"), () => handleQuestionChange(stryMutAct_9fa48("14818") ? "" : (stryCov_9fa48("14818"), 'prev')))}>
              <FaArrowLeft /> Previous
            </button>)}
          
          {/* Next/Submit button */}
          {(stryMutAct_9fa48("14821") ? formData.currentSection < 4 && currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) < currentSectionQuestions.length - 1 : stryMutAct_9fa48("14820") ? false : stryMutAct_9fa48("14819") ? true : (stryCov_9fa48("14819", "14820", "14821"), (stryMutAct_9fa48("14824") ? formData.currentSection >= 4 : stryMutAct_9fa48("14823") ? formData.currentSection <= 4 : stryMutAct_9fa48("14822") ? false : (stryCov_9fa48("14822", "14823", "14824"), formData.currentSection < 4)) || (stryMutAct_9fa48("14827") ? currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) >= currentSectionQuestions.length - 1 : stryMutAct_9fa48("14826") ? currentSectionQuestions.findIndex(q => q.id === formData.currentQuestion) <= currentSectionQuestions.length - 1 : stryMutAct_9fa48("14825") ? false : (stryCov_9fa48("14825", "14826", "14827"), currentSectionQuestions.findIndex(stryMutAct_9fa48("14828") ? () => undefined : (stryCov_9fa48("14828"), q => stryMutAct_9fa48("14831") ? q.id !== formData.currentQuestion : stryMutAct_9fa48("14830") ? false : stryMutAct_9fa48("14829") ? true : (stryCov_9fa48("14829", "14830", "14831"), q.id === formData.currentQuestion))) < (stryMutAct_9fa48("14832") ? currentSectionQuestions.length + 1 : (stryCov_9fa48("14832"), currentSectionQuestions.length - 1)))))) ? <button className="self-assessment__nav-btn self-assessment__nav-btn--next" onClick={stryMutAct_9fa48("14833") ? () => undefined : (stryCov_9fa48("14833"), () => handleQuestionChange(stryMutAct_9fa48("14834") ? "" : (stryCov_9fa48("14834"), 'next')))} disabled={stryMutAct_9fa48("14837") ? !isReadOnly || !formData.responses[currentQuestion.id] : stryMutAct_9fa48("14836") ? false : stryMutAct_9fa48("14835") ? true : (stryCov_9fa48("14835", "14836", "14837"), (stryMutAct_9fa48("14838") ? isReadOnly : (stryCov_9fa48("14838"), !isReadOnly)) && (stryMutAct_9fa48("14839") ? formData.responses[currentQuestion.id] : (stryCov_9fa48("14839"), !formData.responses[currentQuestion.id])))}>
              Next <FaArrowRight />
            </button> : stryMutAct_9fa48("14842") ? !isReadOnly || <button className="self-assessment__submit-btn" onClick={handleSubmit} disabled={!isAssessmentComplete() || isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
              </button> : stryMutAct_9fa48("14841") ? false : stryMutAct_9fa48("14840") ? true : (stryCov_9fa48("14840", "14841", "14842"), (stryMutAct_9fa48("14843") ? isReadOnly : (stryCov_9fa48("14843"), !isReadOnly)) && <button className="self-assessment__submit-btn" onClick={handleSubmit} disabled={stryMutAct_9fa48("14846") ? !isAssessmentComplete() && isSubmitting : stryMutAct_9fa48("14845") ? false : stryMutAct_9fa48("14844") ? true : (stryCov_9fa48("14844", "14845", "14846"), (stryMutAct_9fa48("14847") ? isAssessmentComplete() : (stryCov_9fa48("14847"), !isAssessmentComplete())) || isSubmitting)}>
                {isSubmitting ? stryMutAct_9fa48("14848") ? "" : (stryCov_9fa48("14848"), 'Submitting...') : stryMutAct_9fa48("14849") ? "" : (stryCov_9fa48("14849"), 'Submit Assessment')}
              </button>)}
        </div>
      </div>
    </div>;
  }
}
export default SelfAssessmentPage;