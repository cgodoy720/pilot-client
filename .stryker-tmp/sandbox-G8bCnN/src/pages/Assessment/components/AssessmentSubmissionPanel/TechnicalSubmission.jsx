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
import React, { useState, useEffect, useRef } from 'react';
import { FaUpload, FaGithub, FaFile, FaTimes } from 'react-icons/fa';
function TechnicalSubmission({
  submissionData,
  isDraft,
  isLoading,
  onUpdate,
  onSubmit
}) {
  if (stryMutAct_9fa48("13221")) {
    {}
  } else {
    stryCov_9fa48("13221");
    const [formData, setFormData] = useState(stryMutAct_9fa48("13222") ? {} : (stryCov_9fa48("13222"), {
      submissionType: stryMutAct_9fa48("13223") ? "" : (stryCov_9fa48("13223"), 'files'),
      // 'files', 'github', 'both'
      files: stryMutAct_9fa48("13224") ? ["Stryker was here"] : (stryCov_9fa48("13224"), []),
      githubUrl: stryMutAct_9fa48("13225") ? "Stryker was here!" : (stryCov_9fa48("13225"), ''),
      conversationText: stryMutAct_9fa48("13226") ? "Stryker was here!" : (stryCov_9fa48("13226"), '')
    }));
    const [dragActive, setDragActive] = useState(stryMutAct_9fa48("13227") ? true : (stryCov_9fa48("13227"), false));
    const fileInputRef = useRef(null);

    // Initialize form data
    useEffect(() => {
      if (stryMutAct_9fa48("13228")) {
        {}
      } else {
        stryCov_9fa48("13228");
        if (stryMutAct_9fa48("13230") ? false : stryMutAct_9fa48("13229") ? true : (stryCov_9fa48("13229", "13230"), submissionData)) {
          if (stryMutAct_9fa48("13231")) {
            {}
          } else {
            stryCov_9fa48("13231");
            setFormData(stryMutAct_9fa48("13232") ? {} : (stryCov_9fa48("13232"), {
              submissionType: stryMutAct_9fa48("13235") ? submissionData.submissionType && 'files' : stryMutAct_9fa48("13234") ? false : stryMutAct_9fa48("13233") ? true : (stryCov_9fa48("13233", "13234", "13235"), submissionData.submissionType || (stryMutAct_9fa48("13236") ? "" : (stryCov_9fa48("13236"), 'files'))),
              files: stryMutAct_9fa48("13239") ? submissionData.files && [] : stryMutAct_9fa48("13238") ? false : stryMutAct_9fa48("13237") ? true : (stryCov_9fa48("13237", "13238", "13239"), submissionData.files || (stryMutAct_9fa48("13240") ? ["Stryker was here"] : (stryCov_9fa48("13240"), []))),
              githubUrl: stryMutAct_9fa48("13243") ? submissionData.githubUrl && '' : stryMutAct_9fa48("13242") ? false : stryMutAct_9fa48("13241") ? true : (stryCov_9fa48("13241", "13242", "13243"), submissionData.githubUrl || (stryMutAct_9fa48("13244") ? "Stryker was here!" : (stryCov_9fa48("13244"), ''))),
              conversationText: stryMutAct_9fa48("13247") ? submissionData.conversationText && '' : stryMutAct_9fa48("13246") ? false : stryMutAct_9fa48("13245") ? true : (stryCov_9fa48("13245", "13246", "13247"), submissionData.conversationText || (stryMutAct_9fa48("13248") ? "Stryker was here!" : (stryCov_9fa48("13248"), '')))
            }));
          }
        }
      }
    }, stryMutAct_9fa48("13249") ? [] : (stryCov_9fa48("13249"), [submissionData]));
    const handleChange = (field, value) => {
      if (stryMutAct_9fa48("13250")) {
        {}
      } else {
        stryCov_9fa48("13250");
        const newFormData = stryMutAct_9fa48("13251") ? {} : (stryCov_9fa48("13251"), {
          ...formData,
          [field]: value
        });
        setFormData(newFormData);

        // Update parent state immediately (no auto-save)
        console.log(stryMutAct_9fa48("13252") ? "" : (stryCov_9fa48("13252"), '📤 Updating form data:'), stryMutAct_9fa48("13253") ? {} : (stryCov_9fa48("13253"), {
          submissionType: newFormData.submissionType,
          filesCount: newFormData.files.length,
          fileSizes: newFormData.files.map(stryMutAct_9fa48("13254") ? () => undefined : (stryCov_9fa48("13254"), f => stryMutAct_9fa48("13255") ? {} : (stryCov_9fa48("13255"), {
            name: f.name,
            contentLength: stryMutAct_9fa48("13256") ? f.content.length : (stryCov_9fa48("13256"), f.content?.length)
          }))),
          githubUrl: (stryMutAct_9fa48("13258") ? newFormData.githubUrl.substring(0, 50) : stryMutAct_9fa48("13257") ? newFormData.githubUrl : (stryCov_9fa48("13257", "13258"), newFormData.githubUrl?.substring(0, 50))) + (stryMutAct_9fa48("13259") ? "" : (stryCov_9fa48("13259"), '...')),
          conversationTextLength: stryMutAct_9fa48("13260") ? newFormData.conversationText.length : (stryCov_9fa48("13260"), newFormData.conversationText?.length)
        }));
        onUpdate(newFormData);
      }
    };
    const handleFileUpload = async files => {
      if (stryMutAct_9fa48("13261")) {
        {}
      } else {
        stryCov_9fa48("13261");
        const allowedTypes = stryMutAct_9fa48("13262") ? [] : (stryCov_9fa48("13262"), [stryMutAct_9fa48("13263") ? "" : (stryCov_9fa48("13263"), 'text/html'), stryMutAct_9fa48("13264") ? "" : (stryCov_9fa48("13264"), 'text/css'), stryMutAct_9fa48("13265") ? "" : (stryCov_9fa48("13265"), 'text/javascript'), stryMutAct_9fa48("13266") ? "" : (stryCov_9fa48("13266"), 'application/javascript'), stryMutAct_9fa48("13267") ? "" : (stryCov_9fa48("13267"), 'text/x-python-script'), stryMutAct_9fa48("13268") ? "" : (stryCov_9fa48("13268"), 'text/x-python'), stryMutAct_9fa48("13269") ? "" : (stryCov_9fa48("13269"), 'application/x-python-code'), stryMutAct_9fa48("13270") ? "" : (stryCov_9fa48("13270"), 'text/plain'), stryMutAct_9fa48("13271") ? "" : (stryCov_9fa48("13271"), '.py'), stryMutAct_9fa48("13272") ? "" : (stryCov_9fa48("13272"), '.js'), stryMutAct_9fa48("13273") ? "" : (stryCov_9fa48("13273"), '.html'), stryMutAct_9fa48("13274") ? "" : (stryCov_9fa48("13274"), '.css'), stryMutAct_9fa48("13275") ? "" : (stryCov_9fa48("13275"), '.txt'), stryMutAct_9fa48("13276") ? "" : (stryCov_9fa48("13276"), '.md')]);
        const validFiles = stryMutAct_9fa48("13277") ? Array.from(files) : (stryCov_9fa48("13277"), Array.from(files).filter(file => {
          if (stryMutAct_9fa48("13278")) {
            {}
          } else {
            stryCov_9fa48("13278");
            const isValidType = stryMutAct_9fa48("13279") ? allowedTypes.every(type => file.type === type || file.name.toLowerCase().endsWith(type.replace('text/', '.').replace('application/', '.'))) : (stryCov_9fa48("13279"), allowedTypes.some(stryMutAct_9fa48("13280") ? () => undefined : (stryCov_9fa48("13280"), type => stryMutAct_9fa48("13283") ? file.type === type && file.name.toLowerCase().endsWith(type.replace('text/', '.').replace('application/', '.')) : stryMutAct_9fa48("13282") ? false : stryMutAct_9fa48("13281") ? true : (stryCov_9fa48("13281", "13282", "13283"), (stryMutAct_9fa48("13285") ? file.type !== type : stryMutAct_9fa48("13284") ? false : (stryCov_9fa48("13284", "13285"), file.type === type)) || (stryMutAct_9fa48("13287") ? file.name.toUpperCase().endsWith(type.replace('text/', '.').replace('application/', '.')) : stryMutAct_9fa48("13286") ? file.name.toLowerCase().startsWith(type.replace('text/', '.').replace('application/', '.')) : (stryCov_9fa48("13286", "13287"), file.name.toLowerCase().endsWith(type.replace(stryMutAct_9fa48("13288") ? "" : (stryCov_9fa48("13288"), 'text/'), stryMutAct_9fa48("13289") ? "" : (stryCov_9fa48("13289"), '.')).replace(stryMutAct_9fa48("13290") ? "" : (stryCov_9fa48("13290"), 'application/'), stryMutAct_9fa48("13291") ? "" : (stryCov_9fa48("13291"), '.')))))))));
            const isValidSize = stryMutAct_9fa48("13295") ? file.size > 10 * 1024 * 1024 : stryMutAct_9fa48("13294") ? file.size < 10 * 1024 * 1024 : stryMutAct_9fa48("13293") ? false : stryMutAct_9fa48("13292") ? true : (stryCov_9fa48("13292", "13293", "13294", "13295"), file.size <= (stryMutAct_9fa48("13296") ? 10 * 1024 / 1024 : (stryCov_9fa48("13296"), (stryMutAct_9fa48("13297") ? 10 / 1024 : (stryCov_9fa48("13297"), 10 * 1024)) * 1024))); // 10MB limit
            return stryMutAct_9fa48("13300") ? isValidType || isValidSize : stryMutAct_9fa48("13299") ? false : stryMutAct_9fa48("13298") ? true : (stryCov_9fa48("13298", "13299", "13300"), isValidType && isValidSize);
          }
        }));
        if (stryMutAct_9fa48("13303") ? validFiles.length === files.length : stryMutAct_9fa48("13302") ? false : stryMutAct_9fa48("13301") ? true : (stryCov_9fa48("13301", "13302", "13303"), validFiles.length !== files.length)) {
          if (stryMutAct_9fa48("13304")) {
            {}
          } else {
            stryCov_9fa48("13304");
            alert(stryMutAct_9fa48("13305") ? "" : (stryCov_9fa48("13305"), 'Some files were not uploaded. Please only upload HTML, CSS, JS, Python, or text files under 10MB.'));
          }
        }

        // Read file contents for all valid files
        const filesWithContent = await Promise.all(validFiles.map(stryMutAct_9fa48("13306") ? () => undefined : (stryCov_9fa48("13306"), file => readFileContent(file))));
        console.log(stryMutAct_9fa48("13307") ? "" : (stryCov_9fa48("13307"), '📁 Files with content:'), filesWithContent.map(stryMutAct_9fa48("13308") ? () => undefined : (stryCov_9fa48("13308"), f => stryMutAct_9fa48("13309") ? {} : (stryCov_9fa48("13309"), {
          name: f.name,
          size: f.size,
          contentLength: stryMutAct_9fa48("13310") ? f.content.length : (stryCov_9fa48("13310"), f.content?.length),
          contentPreview: (stryMutAct_9fa48("13312") ? f.content.substring(0, 100) : stryMutAct_9fa48("13311") ? f.content : (stryCov_9fa48("13311", "13312"), f.content?.substring(0, 100))) + (stryMutAct_9fa48("13313") ? "" : (stryCov_9fa48("13313"), '...'))
        }))));
        const newFormData = stryMutAct_9fa48("13314") ? {} : (stryCov_9fa48("13314"), {
          ...formData,
          files: stryMutAct_9fa48("13315") ? [] : (stryCov_9fa48("13315"), [...formData.files, ...filesWithContent])
        });
        setFormData(newFormData);

        // Update parent immediately
        onUpdate(newFormData);
      }
    };

    // Helper function to read file content
    const readFileContent = file => {
      if (stryMutAct_9fa48("13316")) {
        {}
      } else {
        stryCov_9fa48("13316");
        return new Promise((resolve, reject) => {
          if (stryMutAct_9fa48("13317")) {
            {}
          } else {
            stryCov_9fa48("13317");
            const reader = new FileReader();
            reader.onload = e => {
              if (stryMutAct_9fa48("13318")) {
                {}
              } else {
                stryCov_9fa48("13318");
                const content = e.target.result;
                console.log(stryMutAct_9fa48("13319") ? `` : (stryCov_9fa48("13319"), `✅ File read successfully: ${file.name} (${content.length} chars)`));
                console.log(stryMutAct_9fa48("13320") ? `` : (stryCov_9fa48("13320"), `First 100 chars: ${stryMutAct_9fa48("13321") ? content : (stryCov_9fa48("13321"), content.substring(0, 100))}`));
                console.log(stryMutAct_9fa48("13322") ? `` : (stryCov_9fa48("13322"), `Last 100 chars: ${stryMutAct_9fa48("13323") ? content : (stryCov_9fa48("13323"), content.substring(stryMutAct_9fa48("13324") ? content.length + 100 : (stryCov_9fa48("13324"), content.length - 100)))}`));
                resolve(stryMutAct_9fa48("13325") ? {} : (stryCov_9fa48("13325"), {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified,
                  content: content,
                  // ✅ Store actual file content
                  encoding: stryMutAct_9fa48("13326") ? "" : (stryCov_9fa48("13326"), 'text'),
                  // All our supported files are text-based
                  uploadedAt: new Date().toISOString()
                }));
              }
            };
            reader.onerror = () => {
              if (stryMutAct_9fa48("13327")) {
                {}
              } else {
                stryCov_9fa48("13327");
                console.error(stryMutAct_9fa48("13328") ? "" : (stryCov_9fa48("13328"), 'Error reading file:'), file.name);
                reject(new Error(stryMutAct_9fa48("13329") ? `` : (stryCov_9fa48("13329"), `Failed to read file: ${file.name}`)));
              }
            };

            // Read as text since all our supported file types are text-based
            reader.readAsText(file);
          }
        });
      }
    };
    const handleDrag = e => {
      if (stryMutAct_9fa48("13330")) {
        {}
      } else {
        stryCov_9fa48("13330");
        e.preventDefault();
        e.stopPropagation();
        if (stryMutAct_9fa48("13333") ? e.type === 'dragenter' && e.type === 'dragover' : stryMutAct_9fa48("13332") ? false : stryMutAct_9fa48("13331") ? true : (stryCov_9fa48("13331", "13332", "13333"), (stryMutAct_9fa48("13335") ? e.type !== 'dragenter' : stryMutAct_9fa48("13334") ? false : (stryCov_9fa48("13334", "13335"), e.type === (stryMutAct_9fa48("13336") ? "" : (stryCov_9fa48("13336"), 'dragenter')))) || (stryMutAct_9fa48("13338") ? e.type !== 'dragover' : stryMutAct_9fa48("13337") ? false : (stryCov_9fa48("13337", "13338"), e.type === (stryMutAct_9fa48("13339") ? "" : (stryCov_9fa48("13339"), 'dragover')))))) {
          if (stryMutAct_9fa48("13340")) {
            {}
          } else {
            stryCov_9fa48("13340");
            setDragActive(stryMutAct_9fa48("13341") ? false : (stryCov_9fa48("13341"), true));
          }
        } else if (stryMutAct_9fa48("13344") ? e.type !== 'dragleave' : stryMutAct_9fa48("13343") ? false : stryMutAct_9fa48("13342") ? true : (stryCov_9fa48("13342", "13343", "13344"), e.type === (stryMutAct_9fa48("13345") ? "" : (stryCov_9fa48("13345"), 'dragleave')))) {
          if (stryMutAct_9fa48("13346")) {
            {}
          } else {
            stryCov_9fa48("13346");
            setDragActive(stryMutAct_9fa48("13347") ? true : (stryCov_9fa48("13347"), false));
          }
        }
      }
    };
    const handleDrop = async e => {
      if (stryMutAct_9fa48("13348")) {
        {}
      } else {
        stryCov_9fa48("13348");
        e.preventDefault();
        e.stopPropagation();
        setDragActive(stryMutAct_9fa48("13349") ? true : (stryCov_9fa48("13349"), false));
        if (stryMutAct_9fa48("13352") ? e.dataTransfer.files || e.dataTransfer.files[0] : stryMutAct_9fa48("13351") ? false : stryMutAct_9fa48("13350") ? true : (stryCov_9fa48("13350", "13351", "13352"), e.dataTransfer.files && e.dataTransfer.files[0])) {
          if (stryMutAct_9fa48("13353")) {
            {}
          } else {
            stryCov_9fa48("13353");
            await handleFileUpload(e.dataTransfer.files);
          }
        }
      }
    };
    const removeFile = index => {
      if (stryMutAct_9fa48("13354")) {
        {}
      } else {
        stryCov_9fa48("13354");
        setFormData(stryMutAct_9fa48("13355") ? () => undefined : (stryCov_9fa48("13355"), prev => stryMutAct_9fa48("13356") ? {} : (stryCov_9fa48("13356"), {
          ...prev,
          files: stryMutAct_9fa48("13357") ? prev.files : (stryCov_9fa48("13357"), prev.files.filter(stryMutAct_9fa48("13358") ? () => undefined : (stryCov_9fa48("13358"), (_, i) => stryMutAct_9fa48("13361") ? i === index : stryMutAct_9fa48("13360") ? false : stryMutAct_9fa48("13359") ? true : (stryCov_9fa48("13359", "13360", "13361"), i !== index))))
        })));
      }
    };
    const formatFileSize = bytes => {
      if (stryMutAct_9fa48("13362")) {
        {}
      } else {
        stryCov_9fa48("13362");
        if (stryMutAct_9fa48("13365") ? bytes !== 0 : stryMutAct_9fa48("13364") ? false : stryMutAct_9fa48("13363") ? true : (stryCov_9fa48("13363", "13364", "13365"), bytes === 0)) return stryMutAct_9fa48("13366") ? "" : (stryCov_9fa48("13366"), '0 Bytes');
        const k = 1024;
        const sizes = stryMutAct_9fa48("13367") ? [] : (stryCov_9fa48("13367"), [stryMutAct_9fa48("13368") ? "" : (stryCov_9fa48("13368"), 'Bytes'), stryMutAct_9fa48("13369") ? "" : (stryCov_9fa48("13369"), 'KB'), stryMutAct_9fa48("13370") ? "" : (stryCov_9fa48("13370"), 'MB'), stryMutAct_9fa48("13371") ? "" : (stryCov_9fa48("13371"), 'GB')]);
        const i = Math.floor(stryMutAct_9fa48("13372") ? Math.log(bytes) * Math.log(k) : (stryCov_9fa48("13372"), Math.log(bytes) / Math.log(k)));
        return parseFloat((stryMutAct_9fa48("13373") ? bytes * Math.pow(k, i) : (stryCov_9fa48("13373"), bytes / Math.pow(k, i))).toFixed(2)) + (stryMutAct_9fa48("13374") ? "" : (stryCov_9fa48("13374"), ' ')) + sizes[i];
      }
    };
    const isValidGithubUrl = url => {
      if (stryMutAct_9fa48("13375")) {
        {}
      } else {
        stryCov_9fa48("13375");
        const githubPattern = stryMutAct_9fa48("13384") ? /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/$/ : stryMutAct_9fa48("13383") ? /^https:\/\/github\.com\/[\w\-\.]+\/[\W\-\.]+\/?$/ : stryMutAct_9fa48("13382") ? /^https:\/\/github\.com\/[\w\-\.]+\/[^\w\-\.]+\/?$/ : stryMutAct_9fa48("13381") ? /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]\/?$/ : stryMutAct_9fa48("13380") ? /^https:\/\/github\.com\/[\W\-\.]+\/[\w\-\.]+\/?$/ : stryMutAct_9fa48("13379") ? /^https:\/\/github\.com\/[^\w\-\.]+\/[\w\-\.]+\/?$/ : stryMutAct_9fa48("13378") ? /^https:\/\/github\.com\/[\w\-\.]\/[\w\-\.]+\/?$/ : stryMutAct_9fa48("13377") ? /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?/ : stryMutAct_9fa48("13376") ? /https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/ : (stryCov_9fa48("13376", "13377", "13378", "13379", "13380", "13381", "13382", "13383", "13384"), /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/);
        return githubPattern.test(url);
      }
    };
    const handleSubmit = () => {
      if (stryMutAct_9fa48("13385")) {
        {}
      } else {
        stryCov_9fa48("13385");
        // Validate based on submission type
        if (stryMutAct_9fa48("13388") ? formData.submissionType === 'files' || formData.files.length === 0 : stryMutAct_9fa48("13387") ? false : stryMutAct_9fa48("13386") ? true : (stryCov_9fa48("13386", "13387", "13388"), (stryMutAct_9fa48("13390") ? formData.submissionType !== 'files' : stryMutAct_9fa48("13389") ? true : (stryCov_9fa48("13389", "13390"), formData.submissionType === (stryMutAct_9fa48("13391") ? "" : (stryCov_9fa48("13391"), 'files')))) && (stryMutAct_9fa48("13393") ? formData.files.length !== 0 : stryMutAct_9fa48("13392") ? true : (stryCov_9fa48("13392", "13393"), formData.files.length === 0)))) {
          if (stryMutAct_9fa48("13394")) {
            {}
          } else {
            stryCov_9fa48("13394");
            alert(stryMutAct_9fa48("13395") ? "" : (stryCov_9fa48("13395"), 'Please upload at least one file.'));
            return;
          }
        }
        if (stryMutAct_9fa48("13398") ? formData.submissionType === 'github' || !isValidGithubUrl(formData.githubUrl) : stryMutAct_9fa48("13397") ? false : stryMutAct_9fa48("13396") ? true : (stryCov_9fa48("13396", "13397", "13398"), (stryMutAct_9fa48("13400") ? formData.submissionType !== 'github' : stryMutAct_9fa48("13399") ? true : (stryCov_9fa48("13399", "13400"), formData.submissionType === (stryMutAct_9fa48("13401") ? "" : (stryCov_9fa48("13401"), 'github')))) && (stryMutAct_9fa48("13402") ? isValidGithubUrl(formData.githubUrl) : (stryCov_9fa48("13402"), !isValidGithubUrl(formData.githubUrl))))) {
          if (stryMutAct_9fa48("13403")) {
            {}
          } else {
            stryCov_9fa48("13403");
            alert(stryMutAct_9fa48("13404") ? "" : (stryCov_9fa48("13404"), 'Please provide a valid GitHub repository URL.'));
            return;
          }
        }
        if (stryMutAct_9fa48("13407") ? formData.submissionType === 'both' || formData.files.length === 0 || !isValidGithubUrl(formData.githubUrl) : stryMutAct_9fa48("13406") ? false : stryMutAct_9fa48("13405") ? true : (stryCov_9fa48("13405", "13406", "13407"), (stryMutAct_9fa48("13409") ? formData.submissionType !== 'both' : stryMutAct_9fa48("13408") ? true : (stryCov_9fa48("13408", "13409"), formData.submissionType === (stryMutAct_9fa48("13410") ? "" : (stryCov_9fa48("13410"), 'both')))) && (stryMutAct_9fa48("13412") ? formData.files.length === 0 && !isValidGithubUrl(formData.githubUrl) : stryMutAct_9fa48("13411") ? true : (stryCov_9fa48("13411", "13412"), (stryMutAct_9fa48("13414") ? formData.files.length !== 0 : stryMutAct_9fa48("13413") ? false : (stryCov_9fa48("13413", "13414"), formData.files.length === 0)) || (stryMutAct_9fa48("13415") ? isValidGithubUrl(formData.githubUrl) : (stryCov_9fa48("13415"), !isValidGithubUrl(formData.githubUrl))))))) {
          if (stryMutAct_9fa48("13416")) {
            {}
          } else {
            stryCov_9fa48("13416");
            alert(stryMutAct_9fa48("13417") ? "" : (stryCov_9fa48("13417"), 'Please provide both files and a valid GitHub repository URL.'));
            return;
          }
        }
        if (stryMutAct_9fa48("13420") ? false : stryMutAct_9fa48("13419") ? true : stryMutAct_9fa48("13418") ? formData.conversationText.trim() : (stryCov_9fa48("13418", "13419", "13420"), !(stryMutAct_9fa48("13421") ? formData.conversationText : (stryCov_9fa48("13421"), formData.conversationText.trim())))) {
          if (stryMutAct_9fa48("13422")) {
            {}
          } else {
            stryCov_9fa48("13422");
            alert(stryMutAct_9fa48("13423") ? "" : (stryCov_9fa48("13423"), 'Please paste your full conversation with the AI tool.'));
            return;
          }
        }

        // Submit with current form data
        onSubmit(formData);
      }
    };
    const isComplete = () => {
      if (stryMutAct_9fa48("13424")) {
        {}
      } else {
        stryCov_9fa48("13424");
        const hasConversation = stryMutAct_9fa48("13425") ? formData.conversationText : (stryCov_9fa48("13425"), formData.conversationText.trim());
        if (stryMutAct_9fa48("13428") ? formData.submissionType !== 'files' : stryMutAct_9fa48("13427") ? false : stryMutAct_9fa48("13426") ? true : (stryCov_9fa48("13426", "13427", "13428"), formData.submissionType === (stryMutAct_9fa48("13429") ? "" : (stryCov_9fa48("13429"), 'files')))) {
          if (stryMutAct_9fa48("13430")) {
            {}
          } else {
            stryCov_9fa48("13430");
            return stryMutAct_9fa48("13433") ? hasConversation || formData.files.length > 0 : stryMutAct_9fa48("13432") ? false : stryMutAct_9fa48("13431") ? true : (stryCov_9fa48("13431", "13432", "13433"), hasConversation && (stryMutAct_9fa48("13436") ? formData.files.length <= 0 : stryMutAct_9fa48("13435") ? formData.files.length >= 0 : stryMutAct_9fa48("13434") ? true : (stryCov_9fa48("13434", "13435", "13436"), formData.files.length > 0)));
          }
        } else if (stryMutAct_9fa48("13439") ? formData.submissionType !== 'github' : stryMutAct_9fa48("13438") ? false : stryMutAct_9fa48("13437") ? true : (stryCov_9fa48("13437", "13438", "13439"), formData.submissionType === (stryMutAct_9fa48("13440") ? "" : (stryCov_9fa48("13440"), 'github')))) {
          if (stryMutAct_9fa48("13441")) {
            {}
          } else {
            stryCov_9fa48("13441");
            return stryMutAct_9fa48("13444") ? hasConversation || isValidGithubUrl(formData.githubUrl) : stryMutAct_9fa48("13443") ? false : stryMutAct_9fa48("13442") ? true : (stryCov_9fa48("13442", "13443", "13444"), hasConversation && isValidGithubUrl(formData.githubUrl));
          }
        } else if (stryMutAct_9fa48("13447") ? formData.submissionType !== 'both' : stryMutAct_9fa48("13446") ? false : stryMutAct_9fa48("13445") ? true : (stryCov_9fa48("13445", "13446", "13447"), formData.submissionType === (stryMutAct_9fa48("13448") ? "" : (stryCov_9fa48("13448"), 'both')))) {
          if (stryMutAct_9fa48("13449")) {
            {}
          } else {
            stryCov_9fa48("13449");
            return stryMutAct_9fa48("13452") ? hasConversation && formData.files.length > 0 || isValidGithubUrl(formData.githubUrl) : stryMutAct_9fa48("13451") ? false : stryMutAct_9fa48("13450") ? true : (stryCov_9fa48("13450", "13451", "13452"), (stryMutAct_9fa48("13454") ? hasConversation || formData.files.length > 0 : stryMutAct_9fa48("13453") ? true : (stryCov_9fa48("13453", "13454"), hasConversation && (stryMutAct_9fa48("13457") ? formData.files.length <= 0 : stryMutAct_9fa48("13456") ? formData.files.length >= 0 : stryMutAct_9fa48("13455") ? true : (stryCov_9fa48("13455", "13456", "13457"), formData.files.length > 0)))) && isValidGithubUrl(formData.githubUrl));
          }
        }
        return stryMutAct_9fa48("13458") ? true : (stryCov_9fa48("13458"), false);
      }
    };
    return <div className="submission-form">
      {/* Submission Type Selection */}
      <div className="submission-form__field">
        <label className="submission-form__label">
          How would you like to submit your work? *
        </label>
        <div className="submission-form__radio-group">
          <label className="submission-form__radio">
            <input type="radio" name="submissionType" value="files" checked={stryMutAct_9fa48("13461") ? formData.submissionType !== 'files' : stryMutAct_9fa48("13460") ? false : stryMutAct_9fa48("13459") ? true : (stryCov_9fa48("13459", "13460", "13461"), formData.submissionType === (stryMutAct_9fa48("13462") ? "" : (stryCov_9fa48("13462"), 'files')))} onChange={stryMutAct_9fa48("13463") ? () => undefined : (stryCov_9fa48("13463"), e => handleChange(stryMutAct_9fa48("13464") ? "" : (stryCov_9fa48("13464"), 'submissionType'), e.target.value))} disabled={stryMutAct_9fa48("13467") ? !isDraft && isLoading : stryMutAct_9fa48("13466") ? false : stryMutAct_9fa48("13465") ? true : (stryCov_9fa48("13465", "13466", "13467"), (stryMutAct_9fa48("13468") ? isDraft : (stryCov_9fa48("13468"), !isDraft)) || isLoading)} />
            <FaFile /> File Upload Only
          </label>
          <label className="submission-form__radio">
            <input type="radio" name="submissionType" value="github" checked={stryMutAct_9fa48("13471") ? formData.submissionType !== 'github' : stryMutAct_9fa48("13470") ? false : stryMutAct_9fa48("13469") ? true : (stryCov_9fa48("13469", "13470", "13471"), formData.submissionType === (stryMutAct_9fa48("13472") ? "" : (stryCov_9fa48("13472"), 'github')))} onChange={stryMutAct_9fa48("13473") ? () => undefined : (stryCov_9fa48("13473"), e => handleChange(stryMutAct_9fa48("13474") ? "" : (stryCov_9fa48("13474"), 'submissionType'), e.target.value))} disabled={stryMutAct_9fa48("13477") ? !isDraft && isLoading : stryMutAct_9fa48("13476") ? false : stryMutAct_9fa48("13475") ? true : (stryCov_9fa48("13475", "13476", "13477"), (stryMutAct_9fa48("13478") ? isDraft : (stryCov_9fa48("13478"), !isDraft)) || isLoading)} />
            <FaGithub /> GitHub Repository Only
          </label>
          <label className="submission-form__radio">
            <input type="radio" name="submissionType" value="both" checked={stryMutAct_9fa48("13481") ? formData.submissionType !== 'both' : stryMutAct_9fa48("13480") ? false : stryMutAct_9fa48("13479") ? true : (stryCov_9fa48("13479", "13480", "13481"), formData.submissionType === (stryMutAct_9fa48("13482") ? "" : (stryCov_9fa48("13482"), 'both')))} onChange={stryMutAct_9fa48("13483") ? () => undefined : (stryCov_9fa48("13483"), e => handleChange(stryMutAct_9fa48("13484") ? "" : (stryCov_9fa48("13484"), 'submissionType'), e.target.value))} disabled={stryMutAct_9fa48("13487") ? !isDraft && isLoading : stryMutAct_9fa48("13486") ? false : stryMutAct_9fa48("13485") ? true : (stryCov_9fa48("13485", "13486", "13487"), (stryMutAct_9fa48("13488") ? isDraft : (stryCov_9fa48("13488"), !isDraft)) || isLoading)} />
            <FaUpload /> Both Files and GitHub
          </label>
        </div>
      </div>

      {/* File Upload Section */}
      {stryMutAct_9fa48("13491") ? formData.submissionType === 'files' || formData.submissionType === 'both' || <div className="submission-form__field">
          <label className="submission-form__label">
            Upload Your Files *
          </label>
          
          <div className={`submission-form__dropzone ${dragActive ? 'submission-form__dropzone--active' : ''}`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
            <FaUpload className="submission-form__dropzone-icon" />
            <p>Drag & drop files here or click to browse</p>
            <p className="submission-form__dropzone-help">
              Supported: HTML, CSS, JS, Python files (max 10MB each)
            </p>
          </div>

          <input ref={fileInputRef} type="file" multiple accept=".html,.css,.js,.py,.txt,.md" onChange={async e => await handleFileUpload(e.target.files)} style={{
          display: 'none'
        }} disabled={!isDraft || isLoading} />

          {formData.files.length > 0 && <div className="submission-form__file-list">
              {formData.files.map((file, index) => <div key={index} className="submission-form__file-item">
                  <div className="submission-form__file-info">
                    <FaFile className="submission-form__file-icon" />
                    <div>
                      <div className="submission-form__file-name">{file.name}</div>
                      <div className="submission-form__file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  {isDraft && <button onClick={() => removeFile(index)} className="submission-form__file-remove" disabled={isLoading}>
                      <FaTimes />
                    </button>}
                </div>)}
            </div>}
        </div> : stryMutAct_9fa48("13490") ? false : stryMutAct_9fa48("13489") ? true : (stryCov_9fa48("13489", "13490", "13491"), (stryMutAct_9fa48("13493") ? formData.submissionType === 'files' && formData.submissionType === 'both' : stryMutAct_9fa48("13492") ? true : (stryCov_9fa48("13492", "13493"), (stryMutAct_9fa48("13495") ? formData.submissionType !== 'files' : stryMutAct_9fa48("13494") ? false : (stryCov_9fa48("13494", "13495"), formData.submissionType === (stryMutAct_9fa48("13496") ? "" : (stryCov_9fa48("13496"), 'files')))) || (stryMutAct_9fa48("13498") ? formData.submissionType !== 'both' : stryMutAct_9fa48("13497") ? false : (stryCov_9fa48("13497", "13498"), formData.submissionType === (stryMutAct_9fa48("13499") ? "" : (stryCov_9fa48("13499"), 'both')))))) && <div className="submission-form__field">
          <label className="submission-form__label">
            Upload Your Files *
          </label>
          
          <div className={stryMutAct_9fa48("13500") ? `` : (stryCov_9fa48("13500"), `submission-form__dropzone ${dragActive ? stryMutAct_9fa48("13501") ? "" : (stryCov_9fa48("13501"), 'submission-form__dropzone--active') : stryMutAct_9fa48("13502") ? "Stryker was here!" : (stryCov_9fa48("13502"), '')}`)} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={stryMutAct_9fa48("13503") ? () => undefined : (stryCov_9fa48("13503"), () => stryMutAct_9fa48("13504") ? fileInputRef.current.click() : (stryCov_9fa48("13504"), fileInputRef.current?.click()))}>
            <FaUpload className="submission-form__dropzone-icon" />
            <p>Drag & drop files here or click to browse</p>
            <p className="submission-form__dropzone-help">
              Supported: HTML, CSS, JS, Python files (max 10MB each)
            </p>
          </div>

          <input ref={fileInputRef} type="file" multiple accept=".html,.css,.js,.py,.txt,.md" onChange={stryMutAct_9fa48("13505") ? () => undefined : (stryCov_9fa48("13505"), async e => await handleFileUpload(e.target.files))} style={stryMutAct_9fa48("13506") ? {} : (stryCov_9fa48("13506"), {
          display: stryMutAct_9fa48("13507") ? "" : (stryCov_9fa48("13507"), 'none')
        })} disabled={stryMutAct_9fa48("13510") ? !isDraft && isLoading : stryMutAct_9fa48("13509") ? false : stryMutAct_9fa48("13508") ? true : (stryCov_9fa48("13508", "13509", "13510"), (stryMutAct_9fa48("13511") ? isDraft : (stryCov_9fa48("13511"), !isDraft)) || isLoading)} />

          {stryMutAct_9fa48("13514") ? formData.files.length > 0 || <div className="submission-form__file-list">
              {formData.files.map((file, index) => <div key={index} className="submission-form__file-item">
                  <div className="submission-form__file-info">
                    <FaFile className="submission-form__file-icon" />
                    <div>
                      <div className="submission-form__file-name">{file.name}</div>
                      <div className="submission-form__file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  {isDraft && <button onClick={() => removeFile(index)} className="submission-form__file-remove" disabled={isLoading}>
                      <FaTimes />
                    </button>}
                </div>)}
            </div> : stryMutAct_9fa48("13513") ? false : stryMutAct_9fa48("13512") ? true : (stryCov_9fa48("13512", "13513", "13514"), (stryMutAct_9fa48("13517") ? formData.files.length <= 0 : stryMutAct_9fa48("13516") ? formData.files.length >= 0 : stryMutAct_9fa48("13515") ? true : (stryCov_9fa48("13515", "13516", "13517"), formData.files.length > 0)) && <div className="submission-form__file-list">
              {formData.files.map(stryMutAct_9fa48("13518") ? () => undefined : (stryCov_9fa48("13518"), (file, index) => <div key={index} className="submission-form__file-item">
                  <div className="submission-form__file-info">
                    <FaFile className="submission-form__file-icon" />
                    <div>
                      <div className="submission-form__file-name">{file.name}</div>
                      <div className="submission-form__file-size">{formatFileSize(file.size)}</div>
                    </div>
                  </div>
                  {stryMutAct_9fa48("13521") ? isDraft || <button onClick={() => removeFile(index)} className="submission-form__file-remove" disabled={isLoading}>
                      <FaTimes />
                    </button> : stryMutAct_9fa48("13520") ? false : stryMutAct_9fa48("13519") ? true : (stryCov_9fa48("13519", "13520", "13521"), isDraft && <button onClick={stryMutAct_9fa48("13522") ? () => undefined : (stryCov_9fa48("13522"), () => removeFile(index))} className="submission-form__file-remove" disabled={isLoading}>
                      <FaTimes />
                    </button>)}
                </div>))}
            </div>)}
        </div>)}

      {/* GitHub URL Section */}
      {stryMutAct_9fa48("13525") ? formData.submissionType === 'github' || formData.submissionType === 'both' || <div className="submission-form__field">
          <label className="submission-form__label">
            GitHub Repository URL *
          </label>
          <input type="url" className="submission-form__input" value={formData.githubUrl} onChange={e => handleChange('githubUrl', e.target.value)} placeholder="https://github.com/username/repository" disabled={!isDraft || isLoading} />
          <div className="submission-form__help">
            Provide a link to your public GitHub repository containing your project.
          </div>
          {formData.githubUrl && !isValidGithubUrl(formData.githubUrl) && <div className="submission-form__error">
              Please enter a valid GitHub repository URL.
            </div>}
        </div> : stryMutAct_9fa48("13524") ? false : stryMutAct_9fa48("13523") ? true : (stryCov_9fa48("13523", "13524", "13525"), (stryMutAct_9fa48("13527") ? formData.submissionType === 'github' && formData.submissionType === 'both' : stryMutAct_9fa48("13526") ? true : (stryCov_9fa48("13526", "13527"), (stryMutAct_9fa48("13529") ? formData.submissionType !== 'github' : stryMutAct_9fa48("13528") ? false : (stryCov_9fa48("13528", "13529"), formData.submissionType === (stryMutAct_9fa48("13530") ? "" : (stryCov_9fa48("13530"), 'github')))) || (stryMutAct_9fa48("13532") ? formData.submissionType !== 'both' : stryMutAct_9fa48("13531") ? false : (stryCov_9fa48("13531", "13532"), formData.submissionType === (stryMutAct_9fa48("13533") ? "" : (stryCov_9fa48("13533"), 'both')))))) && <div className="submission-form__field">
          <label className="submission-form__label">
            GitHub Repository URL *
          </label>
          <input type="url" className="submission-form__input" value={formData.githubUrl} onChange={stryMutAct_9fa48("13534") ? () => undefined : (stryCov_9fa48("13534"), e => handleChange(stryMutAct_9fa48("13535") ? "" : (stryCov_9fa48("13535"), 'githubUrl'), e.target.value))} placeholder="https://github.com/username/repository" disabled={stryMutAct_9fa48("13538") ? !isDraft && isLoading : stryMutAct_9fa48("13537") ? false : stryMutAct_9fa48("13536") ? true : (stryCov_9fa48("13536", "13537", "13538"), (stryMutAct_9fa48("13539") ? isDraft : (stryCov_9fa48("13539"), !isDraft)) || isLoading)} />
          <div className="submission-form__help">
            Provide a link to your public GitHub repository containing your project.
          </div>
          {stryMutAct_9fa48("13542") ? formData.githubUrl && !isValidGithubUrl(formData.githubUrl) || <div className="submission-form__error">
              Please enter a valid GitHub repository URL.
            </div> : stryMutAct_9fa48("13541") ? false : stryMutAct_9fa48("13540") ? true : (stryCov_9fa48("13540", "13541", "13542"), (stryMutAct_9fa48("13544") ? formData.githubUrl || !isValidGithubUrl(formData.githubUrl) : stryMutAct_9fa48("13543") ? true : (stryCov_9fa48("13543", "13544"), formData.githubUrl && (stryMutAct_9fa48("13545") ? isValidGithubUrl(formData.githubUrl) : (stryCov_9fa48("13545"), !isValidGithubUrl(formData.githubUrl))))) && <div className="submission-form__error">
              Please enter a valid GitHub repository URL.
            </div>)}
        </div>)}

      {/* AI Conversation Section */}
      <div className="submission-form__field">
        <label className="submission-form__label">
          Full AI Conversation *
        </label>
        <textarea className="submission-form__textarea submission-form__textarea--large" value={formData.conversationText} onChange={stryMutAct_9fa48("13546") ? () => undefined : (stryCov_9fa48("13546"), e => handleChange(stryMutAct_9fa48("13547") ? "" : (stryCov_9fa48("13547"), 'conversationText'), e.target.value))} placeholder="Copy and paste your full conversation with whichever AI tool you used for this project..." disabled={stryMutAct_9fa48("13550") ? !isDraft && isLoading : stryMutAct_9fa48("13549") ? false : stryMutAct_9fa48("13548") ? true : (stryCov_9fa48("13548", "13549", "13550"), (stryMutAct_9fa48("13551") ? isDraft : (stryCov_9fa48("13551"), !isDraft)) || isLoading)} rows={8} />
        <div className="submission-form__char-counter">
          {formData.conversationText.length} characters
        </div>
        <div className="submission-form__help">
          Include your complete conversation history with ChatGPT, Claude, or any other AI tool you used.
        </div>
      </div>


      <div className="submission-form__actions">
        {isDraft ? <button onClick={handleSubmit} disabled={stryMutAct_9fa48("13554") ? !isComplete() && isLoading : stryMutAct_9fa48("13553") ? false : stryMutAct_9fa48("13552") ? true : (stryCov_9fa48("13552", "13553", "13554"), (stryMutAct_9fa48("13555") ? isComplete() : (stryCov_9fa48("13555"), !isComplete())) || isLoading)} className="submission-form__btn submission-form__btn--primary">
            {isLoading ? <>
                <div className="submission-form__spinner" />
                Submitting...
              </> : stryMutAct_9fa48("13556") ? "" : (stryCov_9fa48("13556"), 'Submit Final Assessment')}
          </button> : <div className="submission-form__submitted">
            <div className="submission-form__field">
              <label className="submission-form__label">Submission Type</label>
              <div className="submission-form__readonly">
                {stryMutAct_9fa48("13559") ? formData.submissionType === 'files' || 'File Upload' : stryMutAct_9fa48("13558") ? false : stryMutAct_9fa48("13557") ? true : (stryCov_9fa48("13557", "13558", "13559"), (stryMutAct_9fa48("13561") ? formData.submissionType !== 'files' : stryMutAct_9fa48("13560") ? true : (stryCov_9fa48("13560", "13561"), formData.submissionType === (stryMutAct_9fa48("13562") ? "" : (stryCov_9fa48("13562"), 'files')))) && (stryMutAct_9fa48("13563") ? "" : (stryCov_9fa48("13563"), 'File Upload')))}
                {stryMutAct_9fa48("13566") ? formData.submissionType === 'github' || 'GitHub Repository' : stryMutAct_9fa48("13565") ? false : stryMutAct_9fa48("13564") ? true : (stryCov_9fa48("13564", "13565", "13566"), (stryMutAct_9fa48("13568") ? formData.submissionType !== 'github' : stryMutAct_9fa48("13567") ? true : (stryCov_9fa48("13567", "13568"), formData.submissionType === (stryMutAct_9fa48("13569") ? "" : (stryCov_9fa48("13569"), 'github')))) && (stryMutAct_9fa48("13570") ? "" : (stryCov_9fa48("13570"), 'GitHub Repository')))}
                {stryMutAct_9fa48("13573") ? formData.submissionType === 'both' || 'Files and GitHub Repository' : stryMutAct_9fa48("13572") ? false : stryMutAct_9fa48("13571") ? true : (stryCov_9fa48("13571", "13572", "13573"), (stryMutAct_9fa48("13575") ? formData.submissionType !== 'both' : stryMutAct_9fa48("13574") ? true : (stryCov_9fa48("13574", "13575"), formData.submissionType === (stryMutAct_9fa48("13576") ? "" : (stryCov_9fa48("13576"), 'both')))) && (stryMutAct_9fa48("13577") ? "" : (stryCov_9fa48("13577"), 'Files and GitHub Repository')))}
              </div>
            </div>
            
            {stryMutAct_9fa48("13580") ? formData.submissionType === 'files' || formData.submissionType === 'both' || <div className="submission-form__field">
                <label className="submission-form__label">Uploaded Files</label>
                <div className="submission-form__readonly">
                  {formData.files.map(file => file.name).join(', ')}
                </div>
              </div> : stryMutAct_9fa48("13579") ? false : stryMutAct_9fa48("13578") ? true : (stryCov_9fa48("13578", "13579", "13580"), (stryMutAct_9fa48("13582") ? formData.submissionType === 'files' && formData.submissionType === 'both' : stryMutAct_9fa48("13581") ? true : (stryCov_9fa48("13581", "13582"), (stryMutAct_9fa48("13584") ? formData.submissionType !== 'files' : stryMutAct_9fa48("13583") ? false : (stryCov_9fa48("13583", "13584"), formData.submissionType === (stryMutAct_9fa48("13585") ? "" : (stryCov_9fa48("13585"), 'files')))) || (stryMutAct_9fa48("13587") ? formData.submissionType !== 'both' : stryMutAct_9fa48("13586") ? false : (stryCov_9fa48("13586", "13587"), formData.submissionType === (stryMutAct_9fa48("13588") ? "" : (stryCov_9fa48("13588"), 'both')))))) && <div className="submission-form__field">
                <label className="submission-form__label">Uploaded Files</label>
                <div className="submission-form__readonly">
                  {formData.files.map(stryMutAct_9fa48("13589") ? () => undefined : (stryCov_9fa48("13589"), file => file.name)).join(stryMutAct_9fa48("13590") ? "" : (stryCov_9fa48("13590"), ', '))}
                </div>
              </div>)}
            
            {stryMutAct_9fa48("13593") ? formData.submissionType === 'github' || formData.submissionType === 'both' || <div className="submission-form__field">
                <label className="submission-form__label">GitHub Repository</label>
                <div className="submission-form__readonly">
                  <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer">
                    {formData.githubUrl}
                  </a>
                </div>
              </div> : stryMutAct_9fa48("13592") ? false : stryMutAct_9fa48("13591") ? true : (stryCov_9fa48("13591", "13592", "13593"), (stryMutAct_9fa48("13595") ? formData.submissionType === 'github' && formData.submissionType === 'both' : stryMutAct_9fa48("13594") ? true : (stryCov_9fa48("13594", "13595"), (stryMutAct_9fa48("13597") ? formData.submissionType !== 'github' : stryMutAct_9fa48("13596") ? false : (stryCov_9fa48("13596", "13597"), formData.submissionType === (stryMutAct_9fa48("13598") ? "" : (stryCov_9fa48("13598"), 'github')))) || (stryMutAct_9fa48("13600") ? formData.submissionType !== 'both' : stryMutAct_9fa48("13599") ? false : (stryCov_9fa48("13599", "13600"), formData.submissionType === (stryMutAct_9fa48("13601") ? "" : (stryCov_9fa48("13601"), 'both')))))) && <div className="submission-form__field">
                <label className="submission-form__label">GitHub Repository</label>
                <div className="submission-form__readonly">
                  <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer">
                    {formData.githubUrl}
                  </a>
                </div>
              </div>)}
          </div>}
        
        {stryMutAct_9fa48("13604") ? !isComplete() && isDraft || <div className="submission-form__help">
            Please complete all required fields before submitting your assessment.
          </div> : stryMutAct_9fa48("13603") ? false : stryMutAct_9fa48("13602") ? true : (stryCov_9fa48("13602", "13603", "13604"), (stryMutAct_9fa48("13606") ? !isComplete() || isDraft : stryMutAct_9fa48("13605") ? true : (stryCov_9fa48("13605", "13606"), (stryMutAct_9fa48("13607") ? isComplete() : (stryCov_9fa48("13607"), !isComplete())) && isDraft)) && <div className="submission-form__help">
            Please complete all required fields before submitting your assessment.
          </div>)}
      </div>
    </div>;
  }
}
export default TechnicalSubmission;