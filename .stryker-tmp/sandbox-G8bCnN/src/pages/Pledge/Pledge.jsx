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
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pursuitLogoFull from '../../assets/logo-full.png';
import Swal from 'sweetalert2';
import 'animate.css';
import './Pledge.css';
function Pledge() {
  if (stryMutAct_9fa48("25154")) {
    {}
  } else {
    stryCov_9fa48("25154");
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [user, setUser] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(stryMutAct_9fa48("25155") ? true : (stryCov_9fa48("25155"), false));
    const [showProgramDetails, setShowProgramDetails] = useState(stryMutAct_9fa48("25156") ? true : (stryCov_9fa48("25156"), false));
    const [showCodeOfConduct, setShowCodeOfConduct] = useState(stryMutAct_9fa48("25157") ? true : (stryCov_9fa48("25157"), false));
    const [isDrawing, setIsDrawing] = useState(stryMutAct_9fa48("25158") ? true : (stryCov_9fa48("25158"), false));
    const [hasSignature, setHasSignature] = useState(stryMutAct_9fa48("25159") ? true : (stryCov_9fa48("25159"), false));

    // Multi-step form state
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 6;

    // Form data
    const [formData, setFormData] = useState(stryMutAct_9fa48("25160") ? {} : (stryCov_9fa48("25160"), {
      fullName: stryMutAct_9fa48("25161") ? "Stryker was here!" : (stryCov_9fa48("25161"), ''),
      email: stryMutAct_9fa48("25162") ? "Stryker was here!" : (stryCov_9fa48("25162"), ''),
      phoneNumber: stryMutAct_9fa48("25163") ? "Stryker was here!" : (stryCov_9fa48("25163"), ''),
      dateOfBirth: stryMutAct_9fa48("25164") ? "Stryker was here!" : (stryCov_9fa48("25164"), ''),
      printedName: stryMutAct_9fa48("25165") ? "Stryker was here!" : (stryCov_9fa48("25165"), ''),
      date: stryMutAct_9fa48("25166") ? "Stryker was here!" : (stryCov_9fa48("25166"), '')
    }));

    // Code of conduct checkbox state
    const [codeOfConductAgreed, setCodeOfConductAgreed] = useState(stryMutAct_9fa48("25167") ? true : (stryCov_9fa48("25167"), false));

    // Load user data from localStorage on mount
    useEffect(() => {
      if (stryMutAct_9fa48("25168")) {
        {}
      } else {
        stryCov_9fa48("25168");
        const savedUser = localStorage.getItem(stryMutAct_9fa48("25169") ? "" : (stryCov_9fa48("25169"), 'user'));
        if (stryMutAct_9fa48("25171") ? false : stryMutAct_9fa48("25170") ? true : (stryCov_9fa48("25170", "25171"), savedUser)) {
          if (stryMutAct_9fa48("25172")) {
            {}
          } else {
            stryCov_9fa48("25172");
            const userData = JSON.parse(savedUser);
            setUser(userData);

            // Pre-fill form with user data
            setFormData(stryMutAct_9fa48("25173") ? () => undefined : (stryCov_9fa48("25173"), prev => stryMutAct_9fa48("25174") ? {} : (stryCov_9fa48("25174"), {
              ...prev,
              fullName: stryMutAct_9fa48("25175") ? `${userData.firstName || userData.first_name || ''} ${userData.lastName || userData.last_name || ''}` : (stryCov_9fa48("25175"), (stryMutAct_9fa48("25176") ? `` : (stryCov_9fa48("25176"), `${stryMutAct_9fa48("25179") ? (userData.firstName || userData.first_name) && '' : stryMutAct_9fa48("25178") ? false : stryMutAct_9fa48("25177") ? true : (stryCov_9fa48("25177", "25178", "25179"), (stryMutAct_9fa48("25181") ? userData.firstName && userData.first_name : stryMutAct_9fa48("25180") ? false : (stryCov_9fa48("25180", "25181"), userData.firstName || userData.first_name)) || (stryMutAct_9fa48("25182") ? "Stryker was here!" : (stryCov_9fa48("25182"), '')))} ${stryMutAct_9fa48("25185") ? (userData.lastName || userData.last_name) && '' : stryMutAct_9fa48("25184") ? false : stryMutAct_9fa48("25183") ? true : (stryCov_9fa48("25183", "25184", "25185"), (stryMutAct_9fa48("25187") ? userData.lastName && userData.last_name : stryMutAct_9fa48("25186") ? false : (stryCov_9fa48("25186", "25187"), userData.lastName || userData.last_name)) || (stryMutAct_9fa48("25188") ? "Stryker was here!" : (stryCov_9fa48("25188"), '')))}`)).trim()),
              email: stryMutAct_9fa48("25191") ? userData.email && '' : stryMutAct_9fa48("25190") ? false : stryMutAct_9fa48("25189") ? true : (stryCov_9fa48("25189", "25190", "25191"), userData.email || (stryMutAct_9fa48("25192") ? "Stryker was here!" : (stryCov_9fa48("25192"), ''))),
              printedName: stryMutAct_9fa48("25193") ? `${userData.firstName || userData.first_name || ''} ${userData.lastName || userData.last_name || ''}` : (stryCov_9fa48("25193"), (stryMutAct_9fa48("25194") ? `` : (stryCov_9fa48("25194"), `${stryMutAct_9fa48("25197") ? (userData.firstName || userData.first_name) && '' : stryMutAct_9fa48("25196") ? false : stryMutAct_9fa48("25195") ? true : (stryCov_9fa48("25195", "25196", "25197"), (stryMutAct_9fa48("25199") ? userData.firstName && userData.first_name : stryMutAct_9fa48("25198") ? false : (stryCov_9fa48("25198", "25199"), userData.firstName || userData.first_name)) || (stryMutAct_9fa48("25200") ? "Stryker was here!" : (stryCov_9fa48("25200"), '')))} ${stryMutAct_9fa48("25203") ? (userData.lastName || userData.last_name) && '' : stryMutAct_9fa48("25202") ? false : stryMutAct_9fa48("25201") ? true : (stryCov_9fa48("25201", "25202", "25203"), (stryMutAct_9fa48("25205") ? userData.lastName && userData.last_name : stryMutAct_9fa48("25204") ? false : (stryCov_9fa48("25204", "25205"), userData.lastName || userData.last_name)) || (stryMutAct_9fa48("25206") ? "Stryker was here!" : (stryCov_9fa48("25206"), '')))}`)).trim()),
              date: new Date().toLocaleDateString()
            })));
          }
        } else {
          if (stryMutAct_9fa48("25207")) {
            {}
          } else {
            stryCov_9fa48("25207");
            // Redirect to login if no user data
            navigate(stryMutAct_9fa48("25208") ? "" : (stryCov_9fa48("25208"), '/login'));
          }
        }
      }
    }, stryMutAct_9fa48("25209") ? [] : (stryCov_9fa48("25209"), [navigate]));

    // Navigation functions
    const nextStep = () => {
      if (stryMutAct_9fa48("25210")) {
        {}
      } else {
        stryCov_9fa48("25210");
        if (stryMutAct_9fa48("25214") ? currentStep >= totalSteps : stryMutAct_9fa48("25213") ? currentStep <= totalSteps : stryMutAct_9fa48("25212") ? false : stryMutAct_9fa48("25211") ? true : (stryCov_9fa48("25211", "25212", "25213", "25214"), currentStep < totalSteps)) {
          if (stryMutAct_9fa48("25215")) {
            {}
          } else {
            stryCov_9fa48("25215");
            setCurrentStep(stryMutAct_9fa48("25216") ? currentStep - 1 : (stryCov_9fa48("25216"), currentStep + 1));
          }
        }
      }
    };
    const prevStep = () => {
      if (stryMutAct_9fa48("25217")) {
        {}
      } else {
        stryCov_9fa48("25217");
        if (stryMutAct_9fa48("25221") ? currentStep <= 1 : stryMutAct_9fa48("25220") ? currentStep >= 1 : stryMutAct_9fa48("25219") ? false : stryMutAct_9fa48("25218") ? true : (stryCov_9fa48("25218", "25219", "25220", "25221"), currentStep > 1)) {
          if (stryMutAct_9fa48("25222")) {
            {}
          } else {
            stryCov_9fa48("25222");
            setCurrentStep(stryMutAct_9fa48("25223") ? currentStep + 1 : (stryCov_9fa48("25223"), currentStep - 1));
          }
        }
      }
    };
    const goToStep = step => {
      if (stryMutAct_9fa48("25224")) {
        {}
      } else {
        stryCov_9fa48("25224");
        if (stryMutAct_9fa48("25227") ? step >= 1 || step <= totalSteps : stryMutAct_9fa48("25226") ? false : stryMutAct_9fa48("25225") ? true : (stryCov_9fa48("25225", "25226", "25227"), (stryMutAct_9fa48("25230") ? step < 1 : stryMutAct_9fa48("25229") ? step > 1 : stryMutAct_9fa48("25228") ? true : (stryCov_9fa48("25228", "25229", "25230"), step >= 1)) && (stryMutAct_9fa48("25233") ? step > totalSteps : stryMutAct_9fa48("25232") ? step < totalSteps : stryMutAct_9fa48("25231") ? true : (stryCov_9fa48("25231", "25232", "25233"), step <= totalSteps)))) {
          if (stryMutAct_9fa48("25234")) {
            {}
          } else {
            stryCov_9fa48("25234");
            setCurrentStep(step);
          }
        }
      }
    };

    // Helper function to validate phone number (10 digits)
    const isValidPhoneNumber = phone => {
      if (stryMutAct_9fa48("25235")) {
        {}
      } else {
        stryCov_9fa48("25235");
        const digitsOnly = phone.replace(stryMutAct_9fa48("25236") ? /\d/g : (stryCov_9fa48("25236"), /\D/g), stryMutAct_9fa48("25237") ? "Stryker was here!" : (stryCov_9fa48("25237"), '')); // Remove all non-digit characters
        return stryMutAct_9fa48("25240") ? digitsOnly.length !== 10 : stryMutAct_9fa48("25239") ? false : stryMutAct_9fa48("25238") ? true : (stryCov_9fa48("25238", "25239", "25240"), digitsOnly.length === 10);
      }
    };

    // Validation for each step
    const isStepValid = step => {
      if (stryMutAct_9fa48("25241")) {
        {}
      } else {
        stryCov_9fa48("25241");
        switch (step) {
          case 1:
            if (stryMutAct_9fa48("25242")) {} else {
              stryCov_9fa48("25242");
              return stryMutAct_9fa48("25243") ? false : (stryCov_9fa48("25243"), true);
            }
          // Introduction - no validation needed
          case 2:
            if (stryMutAct_9fa48("25244")) {} else {
              stryCov_9fa48("25244");
              return stryMutAct_9fa48("25245") ? false : (stryCov_9fa48("25245"), true);
            }
          // Learning commitments - no validation needed
          case 3:
            if (stryMutAct_9fa48("25246")) {} else {
              stryCov_9fa48("25246");
              return codeOfConductAgreed;
            }
          // Community commitments - requires code of conduct agreement
          case 4:
            if (stryMutAct_9fa48("25247")) {} else {
              stryCov_9fa48("25247");
              return stryMutAct_9fa48("25248") ? false : (stryCov_9fa48("25248"), true);
            }
          // Adapting & Building commitments - no validation needed
          case 5:
            if (stryMutAct_9fa48("25249")) {} else {
              stryCov_9fa48("25249");
              return stryMutAct_9fa48("25252") ? formData.fullName && formData.email && formData.phoneNumber && isValidPhoneNumber(formData.phoneNumber) || formData.dateOfBirth : stryMutAct_9fa48("25251") ? false : stryMutAct_9fa48("25250") ? true : (stryCov_9fa48("25250", "25251", "25252"), (stryMutAct_9fa48("25254") ? formData.fullName && formData.email && formData.phoneNumber || isValidPhoneNumber(formData.phoneNumber) : stryMutAct_9fa48("25253") ? true : (stryCov_9fa48("25253", "25254"), (stryMutAct_9fa48("25256") ? formData.fullName && formData.email || formData.phoneNumber : stryMutAct_9fa48("25255") ? true : (stryCov_9fa48("25255", "25256"), (stryMutAct_9fa48("25258") ? formData.fullName || formData.email : stryMutAct_9fa48("25257") ? true : (stryCov_9fa48("25257", "25258"), formData.fullName && formData.email)) && formData.phoneNumber)) && isValidPhoneNumber(formData.phoneNumber))) && formData.dateOfBirth);
            }
          case 6:
            if (stryMutAct_9fa48("25259")) {} else {
              stryCov_9fa48("25259");
              return stryMutAct_9fa48("25262") ? hasSignature && formData.printedName || formData.date : stryMutAct_9fa48("25261") ? false : stryMutAct_9fa48("25260") ? true : (stryCov_9fa48("25260", "25261", "25262"), (stryMutAct_9fa48("25264") ? hasSignature || formData.printedName : stryMutAct_9fa48("25263") ? true : (stryCov_9fa48("25263", "25264"), hasSignature && formData.printedName)) && formData.date);
            }
          default:
            if (stryMutAct_9fa48("25265")) {} else {
              stryCov_9fa48("25265");
              return stryMutAct_9fa48("25266") ? true : (stryCov_9fa48("25266"), false);
            }
        }
      }
    };

    // Signature canvas setup
    useEffect(() => {
      if (stryMutAct_9fa48("25267")) {
        {}
      } else {
        stryCov_9fa48("25267");
        const canvas = canvasRef.current;
        if (stryMutAct_9fa48("25269") ? false : stryMutAct_9fa48("25268") ? true : (stryCov_9fa48("25268", "25269"), canvas)) {
          if (stryMutAct_9fa48("25270")) {
            {}
          } else {
            stryCov_9fa48("25270");
            const ctx = canvas.getContext(stryMutAct_9fa48("25271") ? "" : (stryCov_9fa48("25271"), '2d'));
            ctx.strokeStyle = stryMutAct_9fa48("25272") ? "" : (stryCov_9fa48("25272"), '#FFFFFF'); // Changed to white for better visibility
            ctx.lineWidth = 2;
            ctx.lineCap = stryMutAct_9fa48("25273") ? "" : (stryCov_9fa48("25273"), 'round');
          }
        }
      }
    }, stryMutAct_9fa48("25274") ? ["Stryker was here"] : (stryCov_9fa48("25274"), []));
    const handleFormChange = e => {
      if (stryMutAct_9fa48("25275")) {
        {}
      } else {
        stryCov_9fa48("25275");
        const {
          name,
          value
        } = e.target;
        setFormData(stryMutAct_9fa48("25276") ? () => undefined : (stryCov_9fa48("25276"), prev => stryMutAct_9fa48("25277") ? {} : (stryCov_9fa48("25277"), {
          ...prev,
          [name]: value
        })));
      }
    };

    // Phone number formatting function
    const formatPhoneNumber = value => {
      if (stryMutAct_9fa48("25278")) {
        {}
      } else {
        stryCov_9fa48("25278");
        // Remove all non-digit characters
        const digitsOnly = value.replace(stryMutAct_9fa48("25279") ? /\d/g : (stryCov_9fa48("25279"), /\D/g), stryMutAct_9fa48("25280") ? "Stryker was here!" : (stryCov_9fa48("25280"), ''));

        // Limit to 10 digits
        const limitedDigits = stryMutAct_9fa48("25281") ? digitsOnly : (stryCov_9fa48("25281"), digitsOnly.substring(0, 10));

        // Apply formatting based on length
        if (stryMutAct_9fa48("25285") ? limitedDigits.length > 3 : stryMutAct_9fa48("25284") ? limitedDigits.length < 3 : stryMutAct_9fa48("25283") ? false : stryMutAct_9fa48("25282") ? true : (stryCov_9fa48("25282", "25283", "25284", "25285"), limitedDigits.length <= 3)) {
          if (stryMutAct_9fa48("25286")) {
            {}
          } else {
            stryCov_9fa48("25286");
            return limitedDigits;
          }
        } else if (stryMutAct_9fa48("25290") ? limitedDigits.length > 6 : stryMutAct_9fa48("25289") ? limitedDigits.length < 6 : stryMutAct_9fa48("25288") ? false : stryMutAct_9fa48("25287") ? true : (stryCov_9fa48("25287", "25288", "25289", "25290"), limitedDigits.length <= 6)) {
          if (stryMutAct_9fa48("25291")) {
            {}
          } else {
            stryCov_9fa48("25291");
            return stryMutAct_9fa48("25292") ? `` : (stryCov_9fa48("25292"), `(${stryMutAct_9fa48("25293") ? limitedDigits : (stryCov_9fa48("25293"), limitedDigits.substring(0, 3))}) ${stryMutAct_9fa48("25294") ? limitedDigits : (stryCov_9fa48("25294"), limitedDigits.substring(3))}`);
          }
        } else {
          if (stryMutAct_9fa48("25295")) {
            {}
          } else {
            stryCov_9fa48("25295");
            return stryMutAct_9fa48("25296") ? `` : (stryCov_9fa48("25296"), `(${stryMutAct_9fa48("25297") ? limitedDigits : (stryCov_9fa48("25297"), limitedDigits.substring(0, 3))}) ${stryMutAct_9fa48("25298") ? limitedDigits : (stryCov_9fa48("25298"), limitedDigits.substring(3, 6))}-${stryMutAct_9fa48("25299") ? limitedDigits : (stryCov_9fa48("25299"), limitedDigits.substring(6))}`);
          }
        }
      }
    };
    const handlePhoneNumberChange = e => {
      if (stryMutAct_9fa48("25300")) {
        {}
      } else {
        stryCov_9fa48("25300");
        const formattedValue = formatPhoneNumber(e.target.value);
        setFormData(stryMutAct_9fa48("25301") ? () => undefined : (stryCov_9fa48("25301"), prev => stryMutAct_9fa48("25302") ? {} : (stryCov_9fa48("25302"), {
          ...prev,
          phoneNumber: formattedValue
        })));
      }
    };

    // Signature canvas functions
    const startDrawing = e => {
      if (stryMutAct_9fa48("25303")) {
        {}
      } else {
        stryCov_9fa48("25303");
        setIsDrawing(stryMutAct_9fa48("25304") ? false : (stryCov_9fa48("25304"), true));
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext(stryMutAct_9fa48("25305") ? "" : (stryCov_9fa48("25305"), '2d'));

        // Ensure white stroke color for visibility
        ctx.strokeStyle = stryMutAct_9fa48("25306") ? "" : (stryCov_9fa48("25306"), '#FFFFFF');
        ctx.lineWidth = 2;
        ctx.lineCap = stryMutAct_9fa48("25307") ? "" : (stryCov_9fa48("25307"), 'round');
        const x = stryMutAct_9fa48("25308") ? e.clientX + rect.left : (stryCov_9fa48("25308"), e.clientX - rect.left);
        const y = stryMutAct_9fa48("25309") ? e.clientY + rect.top : (stryCov_9fa48("25309"), e.clientY - rect.top);
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    };
    const draw = e => {
      if (stryMutAct_9fa48("25310")) {
        {}
      } else {
        stryCov_9fa48("25310");
        if (stryMutAct_9fa48("25313") ? false : stryMutAct_9fa48("25312") ? true : stryMutAct_9fa48("25311") ? isDrawing : (stryCov_9fa48("25311", "25312", "25313"), !isDrawing)) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const ctx = canvas.getContext(stryMutAct_9fa48("25314") ? "" : (stryCov_9fa48("25314"), '2d'));

        // Ensure white stroke color is maintained
        ctx.strokeStyle = stryMutAct_9fa48("25315") ? "" : (stryCov_9fa48("25315"), '#FFFFFF');
        ctx.lineWidth = 2;
        ctx.lineCap = stryMutAct_9fa48("25316") ? "" : (stryCov_9fa48("25316"), 'round');
        const x = stryMutAct_9fa48("25317") ? e.clientX + rect.left : (stryCov_9fa48("25317"), e.clientX - rect.left);
        const y = stryMutAct_9fa48("25318") ? e.clientY + rect.top : (stryCov_9fa48("25318"), e.clientY - rect.top);
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(stryMutAct_9fa48("25319") ? false : (stryCov_9fa48("25319"), true));
      }
    };
    const stopDrawing = () => {
      if (stryMutAct_9fa48("25320")) {
        {}
      } else {
        stryCov_9fa48("25320");
        setIsDrawing(stryMutAct_9fa48("25321") ? true : (stryCov_9fa48("25321"), false));
      }
    };

    // Touch event handlers for mobile devices
    const handleTouchStart = e => {
      if (stryMutAct_9fa48("25322")) {
        {}
      } else {
        stryCov_9fa48("25322");
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(stryMutAct_9fa48("25323") ? "" : (stryCov_9fa48("25323"), 'mousedown'), stryMutAct_9fa48("25324") ? {} : (stryCov_9fa48("25324"), {
          clientX: touch.clientX,
          clientY: touch.clientY
        }));
        startDrawing(mouseEvent);
      }
    };
    const handleTouchMove = e => {
      if (stryMutAct_9fa48("25325")) {
        {}
      } else {
        stryCov_9fa48("25325");
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(stryMutAct_9fa48("25326") ? "" : (stryCov_9fa48("25326"), 'mousemove'), stryMutAct_9fa48("25327") ? {} : (stryCov_9fa48("25327"), {
          clientX: touch.clientX,
          clientY: touch.clientY
        }));
        draw(mouseEvent);
      }
    };
    const handleTouchEnd = e => {
      if (stryMutAct_9fa48("25328")) {
        {}
      } else {
        stryCov_9fa48("25328");
        e.preventDefault();
        stopDrawing();
      }
    };
    const clearSignature = () => {
      if (stryMutAct_9fa48("25329")) {
        {}
      } else {
        stryCov_9fa48("25329");
        const canvas = canvasRef.current;
        const ctx = canvas.getContext(stryMutAct_9fa48("25330") ? "" : (stryCov_9fa48("25330"), '2d'));
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSignature(stryMutAct_9fa48("25331") ? true : (stryCov_9fa48("25331"), false));
      }
    };
    const downloadProgramDetails = () => {
      if (stryMutAct_9fa48("25332")) {
        {}
      } else {
        stryCov_9fa48("25332");
        const element = document.createElement(stryMutAct_9fa48("25333") ? "" : (stryCov_9fa48("25333"), 'a'));
        const file = new Blob(stryMutAct_9fa48("25334") ? [] : (stryCov_9fa48("25334"), [getProgramDetailsText()]), stryMutAct_9fa48("25335") ? {} : (stryCov_9fa48("25335"), {
          type: stryMutAct_9fa48("25336") ? "" : (stryCov_9fa48("25336"), 'text/plain')
        }));
        element.href = URL.createObjectURL(file);
        element.download = stryMutAct_9fa48("25337") ? "" : (stryCov_9fa48("25337"), 'AI-Native_Program_Details.txt');
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    };
    const downloadCodeOfConduct = () => {
      if (stryMutAct_9fa48("25338")) {
        {}
      } else {
        stryCov_9fa48("25338");
        const codeOfConductText = stryMutAct_9fa48("25339") ? `` : (stryCov_9fa48("25339"), `Pursuit AI Native Program — Code of Conduct

The Pursuit AI Native Program is a professional learning environment. All participants are expected to uphold the highest standards of conduct at all times, in the classroom, on the premises (including the lobby and roof), and at any Pursuit-related event or gathering, whether in person or virtual.

We expect you to conduct yourself professionally, which includes:
• Cleaning up after yourself
• Taking care of shared spaces, materials, and equipment
• Maintaining focus during sessions and minimizing disruptions
• Respecting the space, staff, volunteers, and your peers

What We Mean by "Showing Respect"
Respect is a core expectation of this program. In this context, it means:
• Listening actively when others are speaking, not interrupting or talking over them
• Using appropriate and professional language and tone, both in person and online
• Being punctual and prepared for all sessions and activities
• Following shared space norms, like cleaning up and not distracting others
• Engaging with others with kindness and professionalism, especially during feedback or collaboration
• Respecting personal boundaries, including physical space, identity, and personal information

Zero-Tolerance Policy
To maintain a safe and professional environment, Pursuit enforces a zero-tolerance policy for the following behaviors, regardless of your age or legal status:
• Use, possession, or influence of drugs or alcohol in any program space
• Violence or threats of any kind, including physical intimidation
• Inappropriate, offensive, or discriminatory language
• Sexual or romantic advances toward any participant, staff member, or volunteer

Consequences for Violations
Violations of this Code of Conduct will be taken seriously. Consequences may include:
• Immediate suspension from the program, at the discretion of Pursuit staff
• Termination of participation in the program without re-entry
• Removal from program spaces and events, both in-person and online

By participating in the Pursuit AI Native Program, you agree to abide by these expectations and contribute to a safe, respectful, and professional learning community.`);
        const element = document.createElement(stryMutAct_9fa48("25340") ? "" : (stryCov_9fa48("25340"), 'a'));
        const file = new Blob(stryMutAct_9fa48("25341") ? [] : (stryCov_9fa48("25341"), [codeOfConductText]), stryMutAct_9fa48("25342") ? {} : (stryCov_9fa48("25342"), {
          type: stryMutAct_9fa48("25343") ? "" : (stryCov_9fa48("25343"), 'text/plain')
        }));
        element.href = URL.createObjectURL(file);
        element.download = stryMutAct_9fa48("25344") ? "" : (stryCov_9fa48("25344"), 'AI-Native_Code_of_Conduct.txt');
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    };
    const getProgramDetailsText = () => {
      if (stryMutAct_9fa48("25345")) {
        {}
      } else {
        stryCov_9fa48("25345");
        return stryMutAct_9fa48("25346") ? `` : (stryCov_9fa48("25346"), `AI-Native Program Details

I. Program Overview
The Pursuit AI-Native Program is an intensive program designed to empower individuals to become AI-natives, capable of securing good jobs and leading in the AI-driven future. This program is built on a model centered around the following pillars:
• AI-Powered Individual Learning: Utilizing AI tools for personalized learning pathways and skill development.
• Self-Driven, Active Learning Through Building: Focusing on practical application and project-based learning.
• Many-to-Many Learning and Teaching: Fostering a collaborative environment where Builders learn from and teach each other.
• Industry Network-Integrated: Connecting Builders with industry professionals, mentors, and potential employers.
• Adaptive Approach to Learning: Continuously adjusting the curriculum and approach based on real-time feedback and the evolving AI landscape.

II. Program Schedule & Calendar
Program Start Date: Saturday, September 6, 2025
Program Duration: 2 months in AI Literacy, with the opportunity to continue for up to 7 months in AI Build and AI Showcase if selected. Please note that there may be breaks between program phases.

Weekly Schedule:
• Monday – Wednesday: 6:30 PM – 10:00 PM (In-Person, Long Island City)
• Saturday – Sunday: 10:00 AM – 4:00 PM (In-Person, Long Island City)
• Plus, dedicated time for self-directed learning and project development.

Program Breakdown:
Months 1-2: AI Literacy:
• Focus: Understanding the AI ecosystem, using tools to learn, and beginning to build.
• Activities: Foundational skills development, AI tool exploration, initial project concepts.

Months 3-4: AI Build:
• Focus: Building real-world AI applications while deepening technical understanding.
• Activities: Project development, mentorship, networking.

Months 5-7: AI Showcase:
• Focus: Showcasing your skills, building your network, and securing employment opportunities.
• Activities: Portfolio development, building in public, job searching, and interview preparation.

Key Dates:
• Commitment Ceremony & Launch Event: September 6, 2025
• Good Job Agreement Start: If you proceed to the second stage of the program (L2), you will be subject to the payment obligations of the Good Job Agreement.

III. Laptops & Space
Builders are expected to bring their laptops if they have one. Those who need to borrow a laptop from Pursuit must sign a separate agreement on Launch Day. Borrowed laptops must remain at Pursuit's HQ and cannot be taken off-site.
Builders will have 24/7 access to Pursuit's HQ and WIFI to build and learn outside of program hours.

IV. Attendance
Consistent attendance is crucial for your success and the success of your cohort. The Pursuit AI Native Program will have weekly schedules and will be provided with the most recent calendars. It's important to be present and accountable so that we hold one another as the cohort to the best abilities that we all hold.
In-person participation is a required part of this program, and attendance will be closely tracked.
Absences must be communicated in advance to Pursuit whenever possible.

V. Advancement
During month 2, Pursuit staff members will review each Builder's progress and engagement to determine if continuing beyond month 2 is a good fit. This will be a holistic review based on factors including attendance, work product quality, key concept comprehension, peer, volunteer, and staff feedback, contribution to the community, and demonstrated ability to learn and build with AI.

VI. Good Job Agreement Commitment
If you proceed to the second stage of the program (L2), you will be subject to the payment obligations of the Good Job Agreement. The details of the Good Job Agreement, which were also shared at the Recruitment Workshop you attended, are as follows:
• Start the program with no upfront costs, pay only when you succeed, and get a job with an annual salary of over $85,000.
• If you don't get a job or make below the salary threshold, you pay nothing
• If you lose your job, your payments pause until your next job
• Rate: 15% of gross annual income when you get a job with a salary of at least $85,000
• You pay monthly payments of 15% of gross annual income until one of the following occurs:
  - You've made 36 monthly payments,
  - 5 years have passed since you started the program
  - You've paid $55,000 (which means your salary was ~$122K for three years)

To be clear, signing this pledge does NOT mean you are entering into the Good Job Agreement now. Your Good Job Agreement will go into effect if you proceed to the second stage of the program (L2) on Day 1 of L2.`);
      }
    };
    const handleSubmit = async () => {
      if (stryMutAct_9fa48("25347")) {
        {}
      } else {
        stryCov_9fa48("25347");
        // Validate form
        if (stryMutAct_9fa48("25350") ? (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.dateOfBirth || !formData.printedName) && !hasSignature : stryMutAct_9fa48("25349") ? false : stryMutAct_9fa48("25348") ? true : (stryCov_9fa48("25348", "25349", "25350"), (stryMutAct_9fa48("25352") ? (!formData.fullName || !formData.email || !formData.phoneNumber || !formData.dateOfBirth) && !formData.printedName : stryMutAct_9fa48("25351") ? false : (stryCov_9fa48("25351", "25352"), (stryMutAct_9fa48("25354") ? (!formData.fullName || !formData.email || !formData.phoneNumber) && !formData.dateOfBirth : stryMutAct_9fa48("25353") ? false : (stryCov_9fa48("25353", "25354"), (stryMutAct_9fa48("25356") ? (!formData.fullName || !formData.email) && !formData.phoneNumber : stryMutAct_9fa48("25355") ? false : (stryCov_9fa48("25355", "25356"), (stryMutAct_9fa48("25358") ? !formData.fullName && !formData.email : stryMutAct_9fa48("25357") ? false : (stryCov_9fa48("25357", "25358"), (stryMutAct_9fa48("25359") ? formData.fullName : (stryCov_9fa48("25359"), !formData.fullName)) || (stryMutAct_9fa48("25360") ? formData.email : (stryCov_9fa48("25360"), !formData.email)))) || (stryMutAct_9fa48("25361") ? formData.phoneNumber : (stryCov_9fa48("25361"), !formData.phoneNumber)))) || (stryMutAct_9fa48("25362") ? formData.dateOfBirth : (stryCov_9fa48("25362"), !formData.dateOfBirth)))) || (stryMutAct_9fa48("25363") ? formData.printedName : (stryCov_9fa48("25363"), !formData.printedName)))) || (stryMutAct_9fa48("25364") ? hasSignature : (stryCov_9fa48("25364"), !hasSignature)))) {
          if (stryMutAct_9fa48("25365")) {
            {}
          } else {
            stryCov_9fa48("25365");
            await Swal.fire(stryMutAct_9fa48("25366") ? {} : (stryCov_9fa48("25366"), {
              icon: stryMutAct_9fa48("25367") ? "" : (stryCov_9fa48("25367"), 'warning'),
              title: stryMutAct_9fa48("25368") ? "" : (stryCov_9fa48("25368"), 'Incomplete Form'),
              text: stryMutAct_9fa48("25369") ? "" : (stryCov_9fa48("25369"), 'Please fill out all fields and provide your signature.'),
              confirmButtonColor: stryMutAct_9fa48("25370") ? "" : (stryCov_9fa48("25370"), '#4242ea'),
              background: stryMutAct_9fa48("25371") ? "" : (stryCov_9fa48("25371"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("25372") ? "" : (stryCov_9fa48("25372"), 'var(--color-text-primary)'),
              confirmButtonText: stryMutAct_9fa48("25373") ? "" : (stryCov_9fa48("25373"), 'OK, I\'ll complete it')
            }));
            return;
          }
        }

        // Validate phone number
        if (stryMutAct_9fa48("25376") ? false : stryMutAct_9fa48("25375") ? true : stryMutAct_9fa48("25374") ? isValidPhoneNumber(formData.phoneNumber) : (stryCov_9fa48("25374", "25375", "25376"), !isValidPhoneNumber(formData.phoneNumber))) {
          if (stryMutAct_9fa48("25377")) {
            {}
          } else {
            stryCov_9fa48("25377");
            await Swal.fire(stryMutAct_9fa48("25378") ? {} : (stryCov_9fa48("25378"), {
              icon: stryMutAct_9fa48("25379") ? "" : (stryCov_9fa48("25379"), 'warning'),
              title: stryMutAct_9fa48("25380") ? "" : (stryCov_9fa48("25380"), 'Invalid Phone Number'),
              text: stryMutAct_9fa48("25381") ? "" : (stryCov_9fa48("25381"), 'Please enter a valid 10-digit phone number.'),
              confirmButtonColor: stryMutAct_9fa48("25382") ? "" : (stryCov_9fa48("25382"), '#4242ea'),
              background: stryMutAct_9fa48("25383") ? "" : (stryCov_9fa48("25383"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("25384") ? "" : (stryCov_9fa48("25384"), 'var(--color-text-primary)'),
              confirmButtonText: stryMutAct_9fa48("25385") ? "" : (stryCov_9fa48("25385"), 'OK, I\'ll fix it')
            }));
            return;
          }
        }
        setIsSubmitting(stryMutAct_9fa48("25386") ? false : (stryCov_9fa48("25386"), true));
        try {
          if (stryMutAct_9fa48("25387")) {
            {}
          } else {
            stryCov_9fa48("25387");
            // Get current applicant ID from user context or localStorage
            let applicantId = null;
            if (stryMutAct_9fa48("25389") ? false : stryMutAct_9fa48("25388") ? true : (stryCov_9fa48("25388", "25389"), user.applicantId)) {
              if (stryMutAct_9fa48("25390")) {
                {}
              } else {
                stryCov_9fa48("25390");
                applicantId = user.applicantId;
              }
            } else {
              if (stryMutAct_9fa48("25391")) {
                {}
              } else {
                stryCov_9fa48("25391");
                // Create or get applicant to get the ID
                const response = await fetch(stryMutAct_9fa48("25392") ? `` : (stryCov_9fa48("25392"), `${import.meta.env.VITE_API_URL}/api/applications/applicant/by-email/${user.email}`));
                if (stryMutAct_9fa48("25394") ? false : stryMutAct_9fa48("25393") ? true : (stryCov_9fa48("25393", "25394"), response.ok)) {
                  if (stryMutAct_9fa48("25395")) {
                    {}
                  } else {
                    stryCov_9fa48("25395");
                    const applicant = await response.json();
                    applicantId = applicant.applicant_id;
                  }
                }
              }
            }
            if (stryMutAct_9fa48("25398") ? false : stryMutAct_9fa48("25397") ? true : stryMutAct_9fa48("25396") ? applicantId : (stryCov_9fa48("25396", "25397", "25398"), !applicantId)) {
              if (stryMutAct_9fa48("25399")) {
                {}
              } else {
                stryCov_9fa48("25399");
                throw new Error(stryMutAct_9fa48("25400") ? "" : (stryCov_9fa48("25400"), 'Unable to find your applicant ID'));
              }
            }

            // Get signature data from canvas
            const canvas = canvasRef.current;
            const signatureData = canvas.toDataURL(stryMutAct_9fa48("25401") ? "" : (stryCov_9fa48("25401"), 'image/png'));

            // Submit pledge to backend
            const submitResponse = await fetch(stryMutAct_9fa48("25402") ? `` : (stryCov_9fa48("25402"), `${import.meta.env.VITE_API_URL}/api/admissions/pledge/complete`), stryMutAct_9fa48("25403") ? {} : (stryCov_9fa48("25403"), {
              method: stryMutAct_9fa48("25404") ? "" : (stryCov_9fa48("25404"), 'POST'),
              headers: stryMutAct_9fa48("25405") ? {} : (stryCov_9fa48("25405"), {
                'Content-Type': stryMutAct_9fa48("25406") ? "" : (stryCov_9fa48("25406"), 'application/json')
              }),
              body: JSON.stringify(stryMutAct_9fa48("25407") ? {} : (stryCov_9fa48("25407"), {
                applicantId: applicantId,
                signatureData: signatureData,
                formData: formData
              }))
            }));
            if (stryMutAct_9fa48("25410") ? false : stryMutAct_9fa48("25409") ? true : stryMutAct_9fa48("25408") ? submitResponse.ok : (stryCov_9fa48("25408", "25409", "25410"), !submitResponse.ok)) {
              if (stryMutAct_9fa48("25411")) {
                {}
              } else {
                stryCov_9fa48("25411");
                const errorData = await submitResponse.json();
                throw new Error(stryMutAct_9fa48("25414") ? errorData.error && 'Failed to submit pledge' : stryMutAct_9fa48("25413") ? false : stryMutAct_9fa48("25412") ? true : (stryCov_9fa48("25412", "25413", "25414"), errorData.error || (stryMutAct_9fa48("25415") ? "" : (stryCov_9fa48("25415"), 'Failed to submit pledge'))));
              }
            }
            const result = await submitResponse.json();

            // Show celebratory success notification
            await Swal.fire(stryMutAct_9fa48("25416") ? {} : (stryCov_9fa48("25416"), {
              icon: stryMutAct_9fa48("25417") ? "" : (stryCov_9fa48("25417"), 'success'),
              title: stryMutAct_9fa48("25418") ? "" : (stryCov_9fa48("25418"), '🎉 Congratulations! 🎉'),
              html: stryMutAct_9fa48("25419") ? `` : (stryCov_9fa48("25419"), `
          <div style="text-align: center;">
            <h3 style="color: #4242ea; margin: 20px 0;">Welcome to the AI-Native Program!</h3>
            <p style="font-size: 18px; margin: 15px 0; color: var(--color-text-primary);">🚀 Your journey as a Builder starts now! 🚀</p>
            <p style="font-size: 16px; margin: 10px 0; color: var(--color-text-secondary);">Thank you for making this commitment to transform yourself and shape the future with AI.</p>
            <p style="font-size: 14px; color: var(--color-text-muted); margin-top: 20px;">Get ready to build, learn, and innovate like never before!</p>
          </div>
        `),
              confirmButtonText: stryMutAct_9fa48("25420") ? "" : (stryCov_9fa48("25420"), '🎯 Let\'s Build the Future!'),
              confirmButtonColor: stryMutAct_9fa48("25421") ? "" : (stryCov_9fa48("25421"), '#4242ea'),
              background: stryMutAct_9fa48("25422") ? "" : (stryCov_9fa48("25422"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("25423") ? "" : (stryCov_9fa48("25423"), 'var(--color-text-primary)'),
              timer: 6000,
              timerProgressBar: stryMutAct_9fa48("25424") ? false : (stryCov_9fa48("25424"), true),
              showClass: stryMutAct_9fa48("25425") ? {} : (stryCov_9fa48("25425"), {
                popup: stryMutAct_9fa48("25426") ? "" : (stryCov_9fa48("25426"), 'animate__animated animate__bounceIn')
              }),
              hideClass: stryMutAct_9fa48("25427") ? {} : (stryCov_9fa48("25427"), {
                popup: stryMutAct_9fa48("25428") ? "" : (stryCov_9fa48("25428"), 'animate__animated animate__fadeOut')
              })
            }));

            // Navigate back to applicant dashboard
            navigate(stryMutAct_9fa48("25429") ? "" : (stryCov_9fa48("25429"), '/apply'));
          }
        } catch (error) {
          if (stryMutAct_9fa48("25430")) {
            {}
          } else {
            stryCov_9fa48("25430");
            console.error(stryMutAct_9fa48("25431") ? "" : (stryCov_9fa48("25431"), 'Error submitting pledge:'), error);
            await Swal.fire(stryMutAct_9fa48("25432") ? {} : (stryCov_9fa48("25432"), {
              icon: stryMutAct_9fa48("25433") ? "" : (stryCov_9fa48("25433"), 'error'),
              title: stryMutAct_9fa48("25434") ? "" : (stryCov_9fa48("25434"), 'Submission Failed'),
              text: stryMutAct_9fa48("25437") ? error.message && 'There was an error submitting your pledge. Please try again.' : stryMutAct_9fa48("25436") ? false : stryMutAct_9fa48("25435") ? true : (stryCov_9fa48("25435", "25436", "25437"), error.message || (stryMutAct_9fa48("25438") ? "" : (stryCov_9fa48("25438"), 'There was an error submitting your pledge. Please try again.'))),
              confirmButtonColor: stryMutAct_9fa48("25439") ? "" : (stryCov_9fa48("25439"), '#4242ea'),
              background: stryMutAct_9fa48("25440") ? "" : (stryCov_9fa48("25440"), 'var(--color-background-dark)'),
              color: stryMutAct_9fa48("25441") ? "" : (stryCov_9fa48("25441"), 'var(--color-text-primary)'),
              confirmButtonText: stryMutAct_9fa48("25442") ? "" : (stryCov_9fa48("25442"), 'Try Again')
            }));
          }
        } finally {
          if (stryMutAct_9fa48("25443")) {
            {}
          } else {
            stryCov_9fa48("25443");
            setIsSubmitting(stryMutAct_9fa48("25444") ? true : (stryCov_9fa48("25444"), false));
          }
        }
      }
    };
    const handleLogout = () => {
      if (stryMutAct_9fa48("25445")) {
        {}
      } else {
        stryCov_9fa48("25445");
        localStorage.removeItem(stryMutAct_9fa48("25446") ? "" : (stryCov_9fa48("25446"), 'user'));
        localStorage.removeItem(stryMutAct_9fa48("25447") ? "" : (stryCov_9fa48("25447"), 'token'));
        localStorage.removeItem(stryMutAct_9fa48("25448") ? "" : (stryCov_9fa48("25448"), 'applicantToken'));
        setUser(null);
        navigate(stryMutAct_9fa48("25449") ? "" : (stryCov_9fa48("25449"), '/login'));
      }
    };

    // Step rendering functions
    const renderStep1 = stryMutAct_9fa48("25450") ? () => undefined : (stryCov_9fa48("25450"), (() => {
      const renderStep1 = () => <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Welcome to the AI-Native Program</h2>
        <div className="pledge__intro-text">
          <p>Everyone in the AI-Native Program is a Builder.</p>
          <p>The world is evolving at an unprecedented pace, driven by technology and innovation. By taking this pledge, you're committing not just to learn, but to drive your own transformation. You'll gain the skills to build powerful apps, harness the potential of AI, and position yourself as a leader in this rapidly changing digital age.</p>
          <p>This is your opportunity to become not just a consumer of technology, but a creator—an AI-native who shapes the future. Let's embark on this journey together.</p>
        </div>
      </div>
    </div>;
      return renderStep1;
    })());
    const renderStep2 = stryMutAct_9fa48("25451") ? () => undefined : (stryCov_9fa48("25451"), (() => {
      const renderStep2 = () => <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Learning Commitment</h2>
        <p>As a Builder in the Pursuit AI-native Program, I commit to embracing learning with passion, curiosity, and determination.</p>
        <div className="pledge__commitments">
          <br />
          <h3>Learning</h3>
          <ul>
            <li>Cultivate a growth mindset, and engage deeply with every aspect of the program, such as workshops, projects, and community events.</li>
            <li>Drive my own learning through consistent practice and research.</li>
            <li>Share my learning openly and teach others.</li>
          </ul>
        </div>
      </div>
    </div>;
      return renderStep2;
    })());
    const renderStep3 = stryMutAct_9fa48("25452") ? () => undefined : (stryCov_9fa48("25452"), (() => {
      const renderStep3 = () => <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Community Commitment</h2>
        <div className="pledge__commitments">
          <ul>
            <li>Foster a positive, inclusive, supportive community environment.</li>
            <li>Uphold Pursuit's <button type="button" className="code-of-conduct-link" onClick={stryMutAct_9fa48("25453") ? () => undefined : (stryCov_9fa48("25453"), () => setShowCodeOfConduct(stryMutAct_9fa48("25454") ? false : (stryCov_9fa48("25454"), true)))}>
                code of conduct
              </button></li>
          </ul>
        </div>
        
        <div className="pledge__agreement-section">
          <label className="pledge__checkbox-label">
            <input type="checkbox" checked={codeOfConductAgreed} onChange={stryMutAct_9fa48("25455") ? () => undefined : (stryCov_9fa48("25455"), e => setCodeOfConductAgreed(e.target.checked))} className="pledge__checkbox" />
            <span className="pledge__checkbox-text">
              I have read and agree to uphold Pursuit's Code of Conduct
            </span>
          </label>
        </div>
      </div>
    </div>;
      return renderStep3;
    })());
    const renderStep4 = stryMutAct_9fa48("25456") ? () => undefined : (stryCov_9fa48("25456"), (() => {
      const renderStep4 = () => <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Adapting & Building Commitment</h2>
        <div className="pledge__commitments">
          <h3>Adapting</h3>
          <ul>
            <li>Embrace the uncertainty and fluidity of this ever-evolving program and the AI field itself.</li>
            <li>Remain resilient in the face of challenges, demonstrating initiative to solve problems.</li>
          </ul>
          <br />
          <h3>Building</h3>
          <ul>
            <li>Consistently work on projects and apply my learning to real-world scenarios.</li>
            <li>Be proactive in seeking opportunities to build and create.</li>
            <li>Embrace a "building in public" approach to share my journey and contribute to the AI community.</li>
          </ul>
        </div>
      </div>
    </div>;
      return renderStep4;
    })());
    const renderStep5 = stryMutAct_9fa48("25457") ? () => undefined : (stryCov_9fa48("25457"), (() => {
      const renderStep5 = () => <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Builder Information</h2>
        <div className="pledge__form-grid">
          <div className="pledge__form-field">
            <label>Full Name *</label>
            <input type="text" value={formData.fullName} onChange={stryMutAct_9fa48("25458") ? () => undefined : (stryCov_9fa48("25458"), e => setFormData(stryMutAct_9fa48("25459") ? () => undefined : (stryCov_9fa48("25459"), prev => stryMutAct_9fa48("25460") ? {} : (stryCov_9fa48("25460"), {
                ...prev,
                fullName: e.target.value
              }))))} required />
          </div>
          <div className="pledge__form-field">
            <label>Email Address *</label>
            <input type="email" value={formData.email} onChange={stryMutAct_9fa48("25461") ? () => undefined : (stryCov_9fa48("25461"), e => setFormData(stryMutAct_9fa48("25462") ? () => undefined : (stryCov_9fa48("25462"), prev => stryMutAct_9fa48("25463") ? {} : (stryCov_9fa48("25463"), {
                ...prev,
                email: e.target.value
              }))))} required />
          </div>
          <div className="pledge__form-field">
            <label>Phone Number * (10 digits)</label>
            <input type="tel" value={formData.phoneNumber} onChange={handlePhoneNumberChange} className={(stryMutAct_9fa48("25466") ? formData.phoneNumber || !isValidPhoneNumber(formData.phoneNumber) : stryMutAct_9fa48("25465") ? false : stryMutAct_9fa48("25464") ? true : (stryCov_9fa48("25464", "25465", "25466"), formData.phoneNumber && (stryMutAct_9fa48("25467") ? isValidPhoneNumber(formData.phoneNumber) : (stryCov_9fa48("25467"), !isValidPhoneNumber(formData.phoneNumber))))) ? stryMutAct_9fa48("25468") ? "" : (stryCov_9fa48("25468"), 'invalid') : stryMutAct_9fa48("25469") ? "Stryker was here!" : (stryCov_9fa48("25469"), '')} placeholder="(555) 123-4567" required />
          </div>
          <div className="pledge__form-field">
            <label>Date of Birth *</label>
            <input type="date" value={formData.dateOfBirth} onChange={stryMutAct_9fa48("25470") ? () => undefined : (stryCov_9fa48("25470"), e => setFormData(stryMutAct_9fa48("25471") ? () => undefined : (stryCov_9fa48("25471"), prev => stryMutAct_9fa48("25472") ? {} : (stryCov_9fa48("25472"), {
                ...prev,
                dateOfBirth: e.target.value
              }))))} required />
          </div>
        </div>
      </div>
    </div>;
      return renderStep5;
    })());
    const renderStep6 = stryMutAct_9fa48("25473") ? () => undefined : (stryCov_9fa48("25473"), (() => {
      const renderStep6 = () => <div className="pledge__step">
      <div className="pledge__step-content">
        <h2>Signature & Agreement</h2>
        <div className="pledge__acknowledgment">
          <p>By signing below, I acknowledge that I understand the <button type="button" className="program-details-link" onClick={stryMutAct_9fa48("25474") ? () => undefined : (stryCov_9fa48("25474"), () => setShowProgramDetails(stryMutAct_9fa48("25475") ? false : (stryCov_9fa48("25475"), true)))}>
              program details
            </button> and pledge the above to become AI-native, including upholding Pursuit's Code of Conduct.</p>
        </div>
        
        <div className="pledge__signature-section">
          <div className="pledge__signature-field">
            <label>Signature of Builder *</label>
            <div className="pledge__signature-container">
              <canvas ref={canvasRef} className="pledge__signature-canvas" width="400" height="200" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} />
              {stryMutAct_9fa48("25478") ? hasSignature || <button type="button" className="pledge__clear-signature" onClick={clearSignature}>
                  Clear
                </button> : stryMutAct_9fa48("25477") ? false : stryMutAct_9fa48("25476") ? true : (stryCov_9fa48("25476", "25477", "25478"), hasSignature && <button type="button" className="pledge__clear-signature" onClick={clearSignature}>
                  Clear
                </button>)}
            </div>
          </div>
          
          <div className="pledge__form-grid">
            <div className="pledge__form-field">
              <label>Printed Name *</label>
              <input type="text" value={formData.printedName} onChange={stryMutAct_9fa48("25479") ? () => undefined : (stryCov_9fa48("25479"), e => setFormData(stryMutAct_9fa48("25480") ? () => undefined : (stryCov_9fa48("25480"), prev => stryMutAct_9fa48("25481") ? {} : (stryCov_9fa48("25481"), {
                  ...prev,
                  printedName: e.target.value
                }))))} required />
            </div>
            <div className="pledge__form-field">
              <label>Date *</label>
              <input type="text" value={formData.date} onChange={stryMutAct_9fa48("25482") ? () => undefined : (stryCov_9fa48("25482"), e => setFormData(stryMutAct_9fa48("25483") ? () => undefined : (stryCov_9fa48("25483"), prev => stryMutAct_9fa48("25484") ? {} : (stryCov_9fa48("25484"), {
                  ...prev,
                  date: e.target.value
                }))))} required />
            </div>
          </div>
        </div>
      </div>
    </div>;
      return renderStep6;
    })());
    if (stryMutAct_9fa48("25487") ? false : stryMutAct_9fa48("25486") ? true : stryMutAct_9fa48("25485") ? user : (stryCov_9fa48("25485", "25486", "25487"), !user)) {
      if (stryMutAct_9fa48("25488")) {
        {}
      } else {
        stryCov_9fa48("25488");
        return <div className="pledge__loading">Loading...</div>;
      }
    }
    return <div className="admissions-dashboard pledge-page">
      {/* Top Bar */}
      <div className="admissions-dashboard__topbar">
        <div className="admissions-dashboard__topbar-left">
          <div className="admissions-dashboard__logo-section">
            <Link to="/apply">
              <img src={pursuitLogoFull} alt="Pursuit Logo" className="admissions-dashboard__logo-full" />
            </Link>
          </div>
          <div className="admissions-dashboard__welcome-text">
            Welcome, {stryMutAct_9fa48("25491") ? user.firstName && user.first_name : stryMutAct_9fa48("25490") ? false : stryMutAct_9fa48("25489") ? true : (stryCov_9fa48("25489", "25490", "25491"), user.firstName || user.first_name)}!
          </div>
        </div>
        <div className="admissions-dashboard__topbar-right">
          <Link to="/apply" className="nav-link nav-link--active">Apply</Link>
          <Link to="/program-details" className="nav-link">Details</Link>
          <button onClick={handleLogout} className="admissions-dashboard__button--primary">
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="pledge__content">
        <div className="pledge__content-inner">
          {/* Progress Bar */}
          <div className="pledge__progress">
            <div className="pledge__progress-bar">
              {Array.from(stryMutAct_9fa48("25492") ? {} : (stryCov_9fa48("25492"), {
                length: totalSteps
              }), stryMutAct_9fa48("25493") ? () => undefined : (stryCov_9fa48("25493"), (_, index) => <div key={stryMutAct_9fa48("25494") ? index - 1 : (stryCov_9fa48("25494"), index + 1)} className={stryMutAct_9fa48("25495") ? `` : (stryCov_9fa48("25495"), `pledge__progress-step ${(stryMutAct_9fa48("25498") ? index + 1 !== currentStep : stryMutAct_9fa48("25497") ? false : stryMutAct_9fa48("25496") ? true : (stryCov_9fa48("25496", "25497", "25498"), (stryMutAct_9fa48("25499") ? index - 1 : (stryCov_9fa48("25499"), index + 1)) === currentStep)) ? stryMutAct_9fa48("25500") ? "" : (stryCov_9fa48("25500"), 'active') : stryMutAct_9fa48("25501") ? "Stryker was here!" : (stryCov_9fa48("25501"), '')} ${(stryMutAct_9fa48("25505") ? index + 1 >= currentStep : stryMutAct_9fa48("25504") ? index + 1 <= currentStep : stryMutAct_9fa48("25503") ? false : stryMutAct_9fa48("25502") ? true : (stryCov_9fa48("25502", "25503", "25504", "25505"), (stryMutAct_9fa48("25506") ? index - 1 : (stryCov_9fa48("25506"), index + 1)) < currentStep)) ? stryMutAct_9fa48("25507") ? "" : (stryCov_9fa48("25507"), 'completed') : stryMutAct_9fa48("25508") ? "Stryker was here!" : (stryCov_9fa48("25508"), '')}`)} onClick={stryMutAct_9fa48("25509") ? () => undefined : (stryCov_9fa48("25509"), () => goToStep(stryMutAct_9fa48("25510") ? index - 1 : (stryCov_9fa48("25510"), index + 1)))}>
                  <div className="pledge__progress-number">{stryMutAct_9fa48("25511") ? index - 1 : (stryCov_9fa48("25511"), index + 1)}</div>
                  <div className="pledge__progress-label">
                    {stryMutAct_9fa48("25514") ? index === 0 || 'Introduction' : stryMutAct_9fa48("25513") ? false : stryMutAct_9fa48("25512") ? true : (stryCov_9fa48("25512", "25513", "25514"), (stryMutAct_9fa48("25516") ? index !== 0 : stryMutAct_9fa48("25515") ? true : (stryCov_9fa48("25515", "25516"), index === 0)) && (stryMutAct_9fa48("25517") ? "" : (stryCov_9fa48("25517"), 'Introduction')))}
                    {stryMutAct_9fa48("25520") ? index === 1 || 'Learning' : stryMutAct_9fa48("25519") ? false : stryMutAct_9fa48("25518") ? true : (stryCov_9fa48("25518", "25519", "25520"), (stryMutAct_9fa48("25522") ? index !== 1 : stryMutAct_9fa48("25521") ? true : (stryCov_9fa48("25521", "25522"), index === 1)) && (stryMutAct_9fa48("25523") ? "" : (stryCov_9fa48("25523"), 'Learning')))}
                    {stryMutAct_9fa48("25526") ? index === 2 || 'Community' : stryMutAct_9fa48("25525") ? false : stryMutAct_9fa48("25524") ? true : (stryCov_9fa48("25524", "25525", "25526"), (stryMutAct_9fa48("25528") ? index !== 2 : stryMutAct_9fa48("25527") ? true : (stryCov_9fa48("25527", "25528"), index === 2)) && (stryMutAct_9fa48("25529") ? "" : (stryCov_9fa48("25529"), 'Community')))}
                    {stryMutAct_9fa48("25532") ? index === 3 || 'Building' : stryMutAct_9fa48("25531") ? false : stryMutAct_9fa48("25530") ? true : (stryCov_9fa48("25530", "25531", "25532"), (stryMutAct_9fa48("25534") ? index !== 3 : stryMutAct_9fa48("25533") ? true : (stryCov_9fa48("25533", "25534"), index === 3)) && (stryMutAct_9fa48("25535") ? "" : (stryCov_9fa48("25535"), 'Building')))}
                    {stryMutAct_9fa48("25538") ? index === 4 || 'Information' : stryMutAct_9fa48("25537") ? false : stryMutAct_9fa48("25536") ? true : (stryCov_9fa48("25536", "25537", "25538"), (stryMutAct_9fa48("25540") ? index !== 4 : stryMutAct_9fa48("25539") ? true : (stryCov_9fa48("25539", "25540"), index === 4)) && (stryMutAct_9fa48("25541") ? "" : (stryCov_9fa48("25541"), 'Information')))}
                    {stryMutAct_9fa48("25544") ? index === 5 || 'Signature' : stryMutAct_9fa48("25543") ? false : stryMutAct_9fa48("25542") ? true : (stryCov_9fa48("25542", "25543", "25544"), (stryMutAct_9fa48("25546") ? index !== 5 : stryMutAct_9fa48("25545") ? true : (stryCov_9fa48("25545", "25546"), index === 5)) && (stryMutAct_9fa48("25547") ? "" : (stryCov_9fa48("25547"), 'Signature')))}
                  </div>
                </div>))}
            </div>
          </div>

          <div className="pledge__main">
            {/* Render current step */}
            {stryMutAct_9fa48("25550") ? currentStep === 1 || renderStep1() : stryMutAct_9fa48("25549") ? false : stryMutAct_9fa48("25548") ? true : (stryCov_9fa48("25548", "25549", "25550"), (stryMutAct_9fa48("25552") ? currentStep !== 1 : stryMutAct_9fa48("25551") ? true : (stryCov_9fa48("25551", "25552"), currentStep === 1)) && renderStep1())}
            {stryMutAct_9fa48("25555") ? currentStep === 2 || renderStep2() : stryMutAct_9fa48("25554") ? false : stryMutAct_9fa48("25553") ? true : (stryCov_9fa48("25553", "25554", "25555"), (stryMutAct_9fa48("25557") ? currentStep !== 2 : stryMutAct_9fa48("25556") ? true : (stryCov_9fa48("25556", "25557"), currentStep === 2)) && renderStep2())}
            {stryMutAct_9fa48("25560") ? currentStep === 3 || renderStep3() : stryMutAct_9fa48("25559") ? false : stryMutAct_9fa48("25558") ? true : (stryCov_9fa48("25558", "25559", "25560"), (stryMutAct_9fa48("25562") ? currentStep !== 3 : stryMutAct_9fa48("25561") ? true : (stryCov_9fa48("25561", "25562"), currentStep === 3)) && renderStep3())}
            {stryMutAct_9fa48("25565") ? currentStep === 4 || renderStep4() : stryMutAct_9fa48("25564") ? false : stryMutAct_9fa48("25563") ? true : (stryCov_9fa48("25563", "25564", "25565"), (stryMutAct_9fa48("25567") ? currentStep !== 4 : stryMutAct_9fa48("25566") ? true : (stryCov_9fa48("25566", "25567"), currentStep === 4)) && renderStep4())}
            {stryMutAct_9fa48("25570") ? currentStep === 5 || renderStep5() : stryMutAct_9fa48("25569") ? false : stryMutAct_9fa48("25568") ? true : (stryCov_9fa48("25568", "25569", "25570"), (stryMutAct_9fa48("25572") ? currentStep !== 5 : stryMutAct_9fa48("25571") ? true : (stryCov_9fa48("25571", "25572"), currentStep === 5)) && renderStep5())}
            {stryMutAct_9fa48("25575") ? currentStep === 6 || renderStep6() : stryMutAct_9fa48("25574") ? false : stryMutAct_9fa48("25573") ? true : (stryCov_9fa48("25573", "25574", "25575"), (stryMutAct_9fa48("25577") ? currentStep !== 6 : stryMutAct_9fa48("25576") ? true : (stryCov_9fa48("25576", "25577"), currentStep === 6)) && renderStep6())}

            {/* Navigation Buttons */}
            <div className="pledge__navigation">
              {stryMutAct_9fa48("25580") ? currentStep > 1 || <button type="button" className="pledge__button--secondary" onClick={prevStep}>
                  Previous
                </button> : stryMutAct_9fa48("25579") ? false : stryMutAct_9fa48("25578") ? true : (stryCov_9fa48("25578", "25579", "25580"), (stryMutAct_9fa48("25583") ? currentStep <= 1 : stryMutAct_9fa48("25582") ? currentStep >= 1 : stryMutAct_9fa48("25581") ? true : (stryCov_9fa48("25581", "25582", "25583"), currentStep > 1)) && <button type="button" className="pledge__button--secondary" onClick={prevStep}>
                  Previous
                </button>)}
              
              {stryMutAct_9fa48("25586") ? currentStep < totalSteps || <button type="button" className="pledge__button--primary" onClick={nextStep} disabled={!isStepValid(currentStep)}>
                  Next
                </button> : stryMutAct_9fa48("25585") ? false : stryMutAct_9fa48("25584") ? true : (stryCov_9fa48("25584", "25585", "25586"), (stryMutAct_9fa48("25589") ? currentStep >= totalSteps : stryMutAct_9fa48("25588") ? currentStep <= totalSteps : stryMutAct_9fa48("25587") ? true : (stryCov_9fa48("25587", "25588", "25589"), currentStep < totalSteps)) && <button type="button" className="pledge__button--primary" onClick={nextStep} disabled={stryMutAct_9fa48("25590") ? isStepValid(currentStep) : (stryCov_9fa48("25590"), !isStepValid(currentStep))}>
                  Next
                </button>)}
              
              {stryMutAct_9fa48("25593") ? currentStep === totalSteps || <button type="button" className="pledge__button--primary" onClick={handleSubmit} disabled={isSubmitting || !isStepValid(currentStep)}>
                  {isSubmitting ? 'Submitting...' : 'Submit Pledge'}
                </button> : stryMutAct_9fa48("25592") ? false : stryMutAct_9fa48("25591") ? true : (stryCov_9fa48("25591", "25592", "25593"), (stryMutAct_9fa48("25595") ? currentStep !== totalSteps : stryMutAct_9fa48("25594") ? true : (stryCov_9fa48("25594", "25595"), currentStep === totalSteps)) && <button type="button" className="pledge__button--primary" onClick={handleSubmit} disabled={stryMutAct_9fa48("25598") ? isSubmitting && !isStepValid(currentStep) : stryMutAct_9fa48("25597") ? false : stryMutAct_9fa48("25596") ? true : (stryCov_9fa48("25596", "25597", "25598"), isSubmitting || (stryMutAct_9fa48("25599") ? isStepValid(currentStep) : (stryCov_9fa48("25599"), !isStepValid(currentStep))))}>
                  {isSubmitting ? stryMutAct_9fa48("25600") ? "" : (stryCov_9fa48("25600"), 'Submitting...') : stryMutAct_9fa48("25601") ? "" : (stryCov_9fa48("25601"), 'Submit Pledge')}
                </button>)}
            </div>
          </div>
        </div>
      </div>

      {/* Program Details Modal */}
      {stryMutAct_9fa48("25604") ? showProgramDetails || <div className="modal-overlay" onClick={() => setShowProgramDetails(false)}>
          <div className="modal program-details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>AI-Native Program Details</h2>
              <button className="close-btn" onClick={() => setShowProgramDetails(false)}>×</button>
            </div>
            <div className="pledge-modal-content">
              <div className="program-details-content">
                <div className="program-details-text">
                  {getProgramDetailsText().split('\n').map((line, index) => <p key={index}>{line}</p>)}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="pledge__button--secondary" onClick={downloadProgramDetails}>
                Download Details
              </button>
              <button className="pledge__button--primary" onClick={() => setShowProgramDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div> : stryMutAct_9fa48("25603") ? false : stryMutAct_9fa48("25602") ? true : (stryCov_9fa48("25602", "25603", "25604"), showProgramDetails && <div className="modal-overlay" onClick={stryMutAct_9fa48("25605") ? () => undefined : (stryCov_9fa48("25605"), () => setShowProgramDetails(stryMutAct_9fa48("25606") ? true : (stryCov_9fa48("25606"), false)))}>
          <div className="modal program-details-modal" onClick={stryMutAct_9fa48("25607") ? () => undefined : (stryCov_9fa48("25607"), e => e.stopPropagation())}>
            <div className="modal-header">
              <h2>AI-Native Program Details</h2>
              <button className="close-btn" onClick={stryMutAct_9fa48("25608") ? () => undefined : (stryCov_9fa48("25608"), () => setShowProgramDetails(stryMutAct_9fa48("25609") ? true : (stryCov_9fa48("25609"), false)))}>×</button>
            </div>
            <div className="pledge-modal-content">
              <div className="program-details-content">
                <div className="program-details-text">
                  {getProgramDetailsText().split(stryMutAct_9fa48("25610") ? "" : (stryCov_9fa48("25610"), '\n')).map(stryMutAct_9fa48("25611") ? () => undefined : (stryCov_9fa48("25611"), (line, index) => <p key={index}>{line}</p>))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="pledge__button--secondary" onClick={downloadProgramDetails}>
                Download Details
              </button>
              <button className="pledge__button--primary" onClick={stryMutAct_9fa48("25612") ? () => undefined : (stryCov_9fa48("25612"), () => setShowProgramDetails(stryMutAct_9fa48("25613") ? true : (stryCov_9fa48("25613"), false)))}>
                Close
              </button>
            </div>
          </div>
        </div>)}

      {/* Code of Conduct Modal */}
      {stryMutAct_9fa48("25616") ? showCodeOfConduct || <div className="modal-overlay" onClick={() => setShowCodeOfConduct(false)}>
          <div className="modal code-of-conduct-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pursuit AI Native Program — Code of Conduct</h2>
              <button className="close-btn" onClick={() => setShowCodeOfConduct(false)}>×</button>
            </div>
            <div className="pledge-modal-content">
              <div className="code-of-conduct-content">
                <p>The Pursuit AI Native Program is a professional learning environment. All participants are expected to uphold the highest standards of conduct at all times, in the classroom, on the premises (including the lobby and roof), and at any Pursuit-related event or gathering, whether in person or virtual.</p>
                
                <p><strong>We expect you to conduct yourself professionally, which includes:</strong></p>
                <ul>
                  <li>Cleaning up after yourself</li>
                  <li>Taking care of shared spaces, materials, and equipment</li>
                  <li>Maintaining focus during sessions and minimizing disruptions</li>
                  <li>Respecting the space, staff, volunteers, and your peers</li>
                </ul>

                <h3>What We Mean by "Showing Respect"</h3>
                <p>Respect is a core expectation of this program. In this context, it means:</p>
                <ul>
                  <li>Listening actively when others are speaking, not interrupting or talking over them</li>
                  <li>Using appropriate and professional language and tone, both in person and online</li>
                  <li>Being punctual and prepared for all sessions and activities</li>
                  <li>Following shared space norms, like cleaning up and not distracting others</li>
                  <li>Engaging with others with kindness and professionalism, especially during feedback or collaboration</li>
                  <li>Respecting personal boundaries, including physical space, identity, and personal information</li>
                </ul>

                <h3>Zero-Tolerance Policy</h3>
                <p>To maintain a safe and professional environment, Pursuit enforces a zero-tolerance policy for the following behaviors, regardless of your age or legal status:</p>
                <ul>
                  <li>Use, possession, or influence of drugs or alcohol in any program space</li>
                  <li>Violence or threats of any kind, including physical intimidation</li>
                  <li>Inappropriate, offensive, or discriminatory language</li>
                  <li>Sexual or romantic advances toward any participant, staff member, or volunteer</li>
                </ul>

                <h3>Consequences for Violations</h3>
                <p>Violations of this Code of Conduct will be taken seriously. Consequences may include:</p>
                <ul>
                  <li>Immediate suspension from the program, at the discretion of Pursuit staff</li>
                  <li>Termination of participation in the program without re-entry</li>
                  <li>Removal from program spaces and events, both in-person and online</li>
                </ul>

                <p><strong>By participating in the Pursuit AI Native Program, you agree to abide by these expectations and contribute to a safe, respectful, and professional learning community.</strong></p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="pledge__button--secondary" onClick={downloadCodeOfConduct}>
                Download Code of Conduct
              </button>
              <button className="pledge__button--primary" onClick={() => setShowCodeOfConduct(false)}>
                Close
              </button>
            </div>
          </div>
        </div> : stryMutAct_9fa48("25615") ? false : stryMutAct_9fa48("25614") ? true : (stryCov_9fa48("25614", "25615", "25616"), showCodeOfConduct && <div className="modal-overlay" onClick={stryMutAct_9fa48("25617") ? () => undefined : (stryCov_9fa48("25617"), () => setShowCodeOfConduct(stryMutAct_9fa48("25618") ? true : (stryCov_9fa48("25618"), false)))}>
          <div className="modal code-of-conduct-modal" onClick={stryMutAct_9fa48("25619") ? () => undefined : (stryCov_9fa48("25619"), e => e.stopPropagation())}>
            <div className="modal-header">
              <h2>Pursuit AI Native Program — Code of Conduct</h2>
              <button className="close-btn" onClick={stryMutAct_9fa48("25620") ? () => undefined : (stryCov_9fa48("25620"), () => setShowCodeOfConduct(stryMutAct_9fa48("25621") ? true : (stryCov_9fa48("25621"), false)))}>×</button>
            </div>
            <div className="pledge-modal-content">
              <div className="code-of-conduct-content">
                <p>The Pursuit AI Native Program is a professional learning environment. All participants are expected to uphold the highest standards of conduct at all times, in the classroom, on the premises (including the lobby and roof), and at any Pursuit-related event or gathering, whether in person or virtual.</p>
                
                <p><strong>We expect you to conduct yourself professionally, which includes:</strong></p>
                <ul>
                  <li>Cleaning up after yourself</li>
                  <li>Taking care of shared spaces, materials, and equipment</li>
                  <li>Maintaining focus during sessions and minimizing disruptions</li>
                  <li>Respecting the space, staff, volunteers, and your peers</li>
                </ul>

                <h3>What We Mean by "Showing Respect"</h3>
                <p>Respect is a core expectation of this program. In this context, it means:</p>
                <ul>
                  <li>Listening actively when others are speaking, not interrupting or talking over them</li>
                  <li>Using appropriate and professional language and tone, both in person and online</li>
                  <li>Being punctual and prepared for all sessions and activities</li>
                  <li>Following shared space norms, like cleaning up and not distracting others</li>
                  <li>Engaging with others with kindness and professionalism, especially during feedback or collaboration</li>
                  <li>Respecting personal boundaries, including physical space, identity, and personal information</li>
                </ul>

                <h3>Zero-Tolerance Policy</h3>
                <p>To maintain a safe and professional environment, Pursuit enforces a zero-tolerance policy for the following behaviors, regardless of your age or legal status:</p>
                <ul>
                  <li>Use, possession, or influence of drugs or alcohol in any program space</li>
                  <li>Violence or threats of any kind, including physical intimidation</li>
                  <li>Inappropriate, offensive, or discriminatory language</li>
                  <li>Sexual or romantic advances toward any participant, staff member, or volunteer</li>
                </ul>

                <h3>Consequences for Violations</h3>
                <p>Violations of this Code of Conduct will be taken seriously. Consequences may include:</p>
                <ul>
                  <li>Immediate suspension from the program, at the discretion of Pursuit staff</li>
                  <li>Termination of participation in the program without re-entry</li>
                  <li>Removal from program spaces and events, both in-person and online</li>
                </ul>

                <p><strong>By participating in the Pursuit AI Native Program, you agree to abide by these expectations and contribute to a safe, respectful, and professional learning community.</strong></p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="pledge__button--secondary" onClick={downloadCodeOfConduct}>
                Download Code of Conduct
              </button>
              <button className="pledge__button--primary" onClick={stryMutAct_9fa48("25622") ? () => undefined : (stryCov_9fa48("25622"), () => setShowCodeOfConduct(stryMutAct_9fa48("25623") ? true : (stryCov_9fa48("25623"), false)))}>
                Close
              </button>
            </div>
          </div>
        </div>)}
    </div>;
  }
}
export default Pledge;