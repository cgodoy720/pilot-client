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
import React, { useState, useRef, useEffect } from 'react';
import { FaUpload, FaFileAlt, FaLink, FaPlay, FaDownload, FaCopy, FaCheck, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import './JSONGenerator.css';
const JSONGenerator = ({
  sharedData,
  updateSharedData
}) => {
  if (stryMutAct_9fa48("18173")) {
    {}
  } else {
    stryCov_9fa48("18173");
    const {
      token
    } = useAuth();
    const [inputMethod, setInputMethod] = useState(stryMutAct_9fa48("18176") ? sharedData?.inputMethod && 'text' : stryMutAct_9fa48("18175") ? false : stryMutAct_9fa48("18174") ? true : (stryCov_9fa48("18174", "18175", "18176"), (stryMutAct_9fa48("18177") ? sharedData.inputMethod : (stryCov_9fa48("18177"), sharedData?.inputMethod)) || (stryMutAct_9fa48("18178") ? "" : (stryCov_9fa48("18178"), 'text'))));
    const [textInput, setTextInput] = useState(stryMutAct_9fa48("18181") ? sharedData?.textInput && '' : stryMutAct_9fa48("18180") ? false : stryMutAct_9fa48("18179") ? true : (stryCov_9fa48("18179", "18180", "18181"), (stryMutAct_9fa48("18182") ? sharedData.textInput : (stryCov_9fa48("18182"), sharedData?.textInput)) || (stryMutAct_9fa48("18183") ? "Stryker was here!" : (stryCov_9fa48("18183"), ''))));
    const [urlInput, setUrlInput] = useState(stryMutAct_9fa48("18186") ? sharedData?.urlInput && '' : stryMutAct_9fa48("18185") ? false : stryMutAct_9fa48("18184") ? true : (stryCov_9fa48("18184", "18185", "18186"), (stryMutAct_9fa48("18187") ? sharedData.urlInput : (stryCov_9fa48("18187"), sharedData?.urlInput)) || (stryMutAct_9fa48("18188") ? "Stryker was here!" : (stryCov_9fa48("18188"), ''))));
    const [fileInput, setFileInput] = useState(stryMutAct_9fa48("18191") ? sharedData?.fileInput && null : stryMutAct_9fa48("18190") ? false : stryMutAct_9fa48("18189") ? true : (stryCov_9fa48("18189", "18190", "18191"), (stryMutAct_9fa48("18192") ? sharedData.fileInput : (stryCov_9fa48("18192"), sharedData?.fileInput)) || null));
    const [generatedJSON, setGeneratedJSON] = useState(stryMutAct_9fa48("18195") ? sharedData?.generatedJSON && '' : stryMutAct_9fa48("18194") ? false : stryMutAct_9fa48("18193") ? true : (stryCov_9fa48("18193", "18194", "18195"), (stryMutAct_9fa48("18196") ? sharedData.generatedJSON : (stryCov_9fa48("18196"), sharedData?.generatedJSON)) || (stryMutAct_9fa48("18197") ? "Stryker was here!" : (stryCov_9fa48("18197"), ''))));
    const [isGenerating, setIsGenerating] = useState(stryMutAct_9fa48("18198") ? true : (stryCov_9fa48("18198"), false));

    // Sync local state with shared state when shared data changes
    useEffect(() => {
      if (stryMutAct_9fa48("18199")) {
        {}
      } else {
        stryCov_9fa48("18199");
        if (stryMutAct_9fa48("18201") ? false : stryMutAct_9fa48("18200") ? true : (stryCov_9fa48("18200", "18201"), sharedData)) {
          if (stryMutAct_9fa48("18202")) {
            {}
          } else {
            stryCov_9fa48("18202");
            setInputMethod(stryMutAct_9fa48("18205") ? sharedData.inputMethod && 'text' : stryMutAct_9fa48("18204") ? false : stryMutAct_9fa48("18203") ? true : (stryCov_9fa48("18203", "18204", "18205"), sharedData.inputMethod || (stryMutAct_9fa48("18206") ? "" : (stryCov_9fa48("18206"), 'text'))));
            setTextInput(stryMutAct_9fa48("18209") ? sharedData.textInput && '' : stryMutAct_9fa48("18208") ? false : stryMutAct_9fa48("18207") ? true : (stryCov_9fa48("18207", "18208", "18209"), sharedData.textInput || (stryMutAct_9fa48("18210") ? "Stryker was here!" : (stryCov_9fa48("18210"), ''))));
            setUrlInput(stryMutAct_9fa48("18213") ? sharedData.urlInput && '' : stryMutAct_9fa48("18212") ? false : stryMutAct_9fa48("18211") ? true : (stryCov_9fa48("18211", "18212", "18213"), sharedData.urlInput || (stryMutAct_9fa48("18214") ? "Stryker was here!" : (stryCov_9fa48("18214"), ''))));
            setFileInput(stryMutAct_9fa48("18217") ? sharedData.fileInput && null : stryMutAct_9fa48("18216") ? false : stryMutAct_9fa48("18215") ? true : (stryCov_9fa48("18215", "18216", "18217"), sharedData.fileInput || null));
            setGeneratedJSON(stryMutAct_9fa48("18220") ? sharedData.generatedJSON && '' : stryMutAct_9fa48("18219") ? false : stryMutAct_9fa48("18218") ? true : (stryCov_9fa48("18218", "18219", "18220"), sharedData.generatedJSON || (stryMutAct_9fa48("18221") ? "Stryker was here!" : (stryCov_9fa48("18221"), ''))));
          }
        }
      }
    }, stryMutAct_9fa48("18222") ? [] : (stryCov_9fa48("18222"), [sharedData]));
    const [error, setError] = useState(stryMutAct_9fa48("18223") ? "Stryker was here!" : (stryCov_9fa48("18223"), ''));
    const [copied, setCopied] = useState(stryMutAct_9fa48("18224") ? true : (stryCov_9fa48("18224"), false));
    const fileInputRef = useRef(null);

    // Sample session data template (same as SessionDataTester)
    const sampleSessionData = stryMutAct_9fa48("18225") ? {} : (stryCov_9fa48("18225"), {
      "date": stryMutAct_9fa48("18226") ? "" : (stryCov_9fa48("18226"), "2025-01-XX"),
      "day_type": stryMutAct_9fa48("18227") ? "" : (stryCov_9fa48("18227"), "Weekday"),
      "cohort": stryMutAct_9fa48("18228") ? "" : (stryCov_9fa48("18228"), "January 2025"),
      "daily_goal": stryMutAct_9fa48("18229") ? "" : (stryCov_9fa48("18229"), "Generated from content input"),
      "day_number": 1,
      "learning_objectives": stryMutAct_9fa48("18230") ? [] : (stryCov_9fa48("18230"), [stryMutAct_9fa48("18231") ? "" : (stryCov_9fa48("18231"), "Learning objective 1"), stryMutAct_9fa48("18232") ? "" : (stryCov_9fa48("18232"), "Learning objective 2"), stryMutAct_9fa48("18233") ? "" : (stryCov_9fa48("18233"), "Learning objective 3")]),
      "time_blocks": stryMutAct_9fa48("18234") ? [] : (stryCov_9fa48("18234"), [stryMutAct_9fa48("18235") ? {} : (stryCov_9fa48("18235"), {
        "category": stryMutAct_9fa48("18236") ? "" : (stryCov_9fa48("18236"), "Learning"),
        "start_time": stryMutAct_9fa48("18237") ? "" : (stryCov_9fa48("18237"), "18:45"),
        "end_time": stryMutAct_9fa48("18238") ? "" : (stryCov_9fa48("18238"), "19:45"),
        "learning_type": stryMutAct_9fa48("18239") ? "Stryker was here!" : (stryCov_9fa48("18239"), ""),
        "task": stryMutAct_9fa48("18240") ? {} : (stryCov_9fa48("18240"), {
          "title": stryMutAct_9fa48("18241") ? "" : (stryCov_9fa48("18241"), "Generated Task Title"),
          "type": stryMutAct_9fa48("18242") ? "" : (stryCov_9fa48("18242"), "individual"),
          "description": stryMutAct_9fa48("18243") ? "" : (stryCov_9fa48("18243"), "Task Description"),
          "intro": stryMutAct_9fa48("18244") ? "" : (stryCov_9fa48("18244"), "Task introduction and context..."),
          "questions": stryMutAct_9fa48("18245") ? [] : (stryCov_9fa48("18245"), [stryMutAct_9fa48("18246") ? "" : (stryCov_9fa48("18246"), "Generated question 1?"), stryMutAct_9fa48("18247") ? "" : (stryCov_9fa48("18247"), "Generated question 2?"), stryMutAct_9fa48("18248") ? "" : (stryCov_9fa48("18248"), "Generated question 3?")]),
          "linked_resources": stryMutAct_9fa48("18249") ? [] : (stryCov_9fa48("18249"), [stryMutAct_9fa48("18250") ? {} : (stryCov_9fa48("18250"), {
            "title": stryMutAct_9fa48("18251") ? "" : (stryCov_9fa48("18251"), "Resource Title"),
            "type": stryMutAct_9fa48("18252") ? "" : (stryCov_9fa48("18252"), "article"),
            "url": stryMutAct_9fa48("18253") ? "" : (stryCov_9fa48("18253"), "https://example.com"),
            "description": stryMutAct_9fa48("18254") ? "" : (stryCov_9fa48("18254"), "Resource description")
          })]),
          "conclusion": stryMutAct_9fa48("18255") ? "" : (stryCov_9fa48("18255"), "Task conclusion and next steps...")
        })
      })])
    });
    const handleFileUpload = event => {
      if (stryMutAct_9fa48("18256")) {
        {}
      } else {
        stryCov_9fa48("18256");
        const file = event.target.files[0];
        if (stryMutAct_9fa48("18258") ? false : stryMutAct_9fa48("18257") ? true : (stryCov_9fa48("18257", "18258"), file)) {
          if (stryMutAct_9fa48("18259")) {
            {}
          } else {
            stryCov_9fa48("18259");
            setFileInput(file);
            setError(stryMutAct_9fa48("18260") ? "Stryker was here!" : (stryCov_9fa48("18260"), ''));

            // Read file content
            const reader = new FileReader();
            reader.onload = e => {
              if (stryMutAct_9fa48("18261")) {
                {}
              } else {
                stryCov_9fa48("18261");
                const content = e.target.result;
                setTextInput(content); // Store content in textInput for processing

                // Update shared data
                stryMutAct_9fa48("18262") ? updateSharedData({
                  fileInput: file,
                  textInput: content
                }) : (stryCov_9fa48("18262"), updateSharedData?.(stryMutAct_9fa48("18263") ? {} : (stryCov_9fa48("18263"), {
                  fileInput: file,
                  textInput: content
                })));
              }
            };
            reader.readAsText(file);
          }
        }
      }
    };
    const handleGenerate = async () => {
      if (stryMutAct_9fa48("18264")) {
        {}
      } else {
        stryCov_9fa48("18264");
        setIsGenerating(stryMutAct_9fa48("18265") ? false : (stryCov_9fa48("18265"), true));
        setError(stryMutAct_9fa48("18266") ? "Stryker was here!" : (stryCov_9fa48("18266"), ''));
        try {
          if (stryMutAct_9fa48("18267")) {
            {}
          } else {
            stryCov_9fa48("18267");
            let content = stryMutAct_9fa48("18268") ? "Stryker was here!" : (stryCov_9fa48("18268"), '');

            // Get content based on input method
            switch (inputMethod) {
              case stryMutAct_9fa48("18270") ? "" : (stryCov_9fa48("18270"), 'text'):
                if (stryMutAct_9fa48("18269")) {} else {
                  stryCov_9fa48("18269");
                  content = stryMutAct_9fa48("18271") ? textInput : (stryCov_9fa48("18271"), textInput.trim());
                  break;
                }
              case stryMutAct_9fa48("18273") ? "" : (stryCov_9fa48("18273"), 'url'):
                if (stryMutAct_9fa48("18272")) {} else {
                  stryCov_9fa48("18272");
                  // For now, we'll simulate URL processing
                  // In a real implementation, this would call a backend service
                  if (stryMutAct_9fa48("18276") ? false : stryMutAct_9fa48("18275") ? true : stryMutAct_9fa48("18274") ? urlInput.trim() : (stryCov_9fa48("18274", "18275", "18276"), !(stryMutAct_9fa48("18277") ? urlInput : (stryCov_9fa48("18277"), urlInput.trim())))) {
                    if (stryMutAct_9fa48("18278")) {
                      {}
                    } else {
                      stryCov_9fa48("18278");
                      throw new Error(stryMutAct_9fa48("18279") ? "" : (stryCov_9fa48("18279"), 'Please enter a URL'));
                    }
                  }
                  content = await fetchContentFromUrl(urlInput);
                  break;
                }
              case stryMutAct_9fa48("18281") ? "" : (stryCov_9fa48("18281"), 'file'):
                if (stryMutAct_9fa48("18280")) {} else {
                  stryCov_9fa48("18280");
                  if (stryMutAct_9fa48("18284") ? false : stryMutAct_9fa48("18283") ? true : stryMutAct_9fa48("18282") ? fileInput : (stryCov_9fa48("18282", "18283", "18284"), !fileInput)) {
                    if (stryMutAct_9fa48("18285")) {
                      {}
                    } else {
                      stryCov_9fa48("18285");
                      throw new Error(stryMutAct_9fa48("18286") ? "" : (stryCov_9fa48("18286"), 'Please select a file'));
                    }
                  }
                  content = textInput; // File content is already loaded in textInput
                  break;
                }
              default:
                if (stryMutAct_9fa48("18287")) {} else {
                  stryCov_9fa48("18287");
                  throw new Error(stryMutAct_9fa48("18288") ? "" : (stryCov_9fa48("18288"), 'Invalid input method'));
                }
            }
            if (stryMutAct_9fa48("18291") ? false : stryMutAct_9fa48("18290") ? true : stryMutAct_9fa48("18289") ? content : (stryCov_9fa48("18289", "18290", "18291"), !content)) {
              if (stryMutAct_9fa48("18292")) {
                {}
              } else {
                stryCov_9fa48("18292");
                throw new Error(stryMutAct_9fa48("18293") ? "" : (stryCov_9fa48("18293"), 'No content provided for generation'));
              }
            }

            // Store original content for Phase 3 (Facilitator Notes)
            sessionStorage.setItem(stryMutAct_9fa48("18294") ? "" : (stryCov_9fa48("18294"), 'originalContent'), content);

            // For now, generate a sample JSON structure
            // This will be replaced with actual AI processing later
            const generatedData = await generateJSONFromContent(content);
            const jsonString = JSON.stringify(generatedData, null, 2);
            setGeneratedJSON(jsonString);

            // Update shared data
            stryMutAct_9fa48("18295") ? updateSharedData({
              originalContent: content,
              generatedJSON: jsonString
            }) : (stryCov_9fa48("18295"), updateSharedData?.(stryMutAct_9fa48("18296") ? {} : (stryCov_9fa48("18296"), {
              originalContent: content,
              generatedJSON: jsonString
            })));
          }
        } catch (err) {
          if (stryMutAct_9fa48("18297")) {
            {}
          } else {
            stryCov_9fa48("18297");
            setError(err.message);
          }
        } finally {
          if (stryMutAct_9fa48("18298")) {
            {}
          } else {
            stryCov_9fa48("18298");
            setIsGenerating(stryMutAct_9fa48("18299") ? true : (stryCov_9fa48("18299"), false));
          }
        }
      }
    };
    const fetchContentFromUrl = async url => {
      if (stryMutAct_9fa48("18300")) {
        {}
      } else {
        stryCov_9fa48("18300");
        // This now calls the backend service which handles Google Docs and other URLs
        try {
          if (stryMutAct_9fa48("18301")) {
            {}
          } else {
            stryCov_9fa48("18301");
            const response = await fetch(stryMutAct_9fa48("18302") ? `` : (stryCov_9fa48("18302"), `${import.meta.env.VITE_API_URL}/api/content/generate-json`), stryMutAct_9fa48("18303") ? {} : (stryCov_9fa48("18303"), {
              method: stryMutAct_9fa48("18304") ? "" : (stryCov_9fa48("18304"), 'POST'),
              headers: stryMutAct_9fa48("18305") ? {} : (stryCov_9fa48("18305"), {
                'Content-Type': stryMutAct_9fa48("18306") ? "" : (stryCov_9fa48("18306"), 'application/json'),
                'Authorization': stryMutAct_9fa48("18307") ? `` : (stryCov_9fa48("18307"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("18308") ? {} : (stryCov_9fa48("18308"), {
                contentType: stryMutAct_9fa48("18309") ? "" : (stryCov_9fa48("18309"), 'url'),
                url: url,
                cohort: stryMutAct_9fa48("18310") ? "" : (stryCov_9fa48("18310"), 'Generated Cohort'),
                weekNumber: 1,
                dayNumber: 1,
                date: new Date().toISOString().split(stryMutAct_9fa48("18311") ? "" : (stryCov_9fa48("18311"), 'T'))[0]
              }))
            }));
            if (stryMutAct_9fa48("18314") ? false : stryMutAct_9fa48("18313") ? true : stryMutAct_9fa48("18312") ? response.ok : (stryCov_9fa48("18312", "18313", "18314"), !response.ok)) {
              if (stryMutAct_9fa48("18315")) {
                {}
              } else {
                stryCov_9fa48("18315");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("18318") ? errorData.error && 'Failed to fetch content from URL' : stryMutAct_9fa48("18317") ? false : stryMutAct_9fa48("18316") ? true : (stryCov_9fa48("18316", "18317", "18318"), errorData.error || (stryMutAct_9fa48("18319") ? "" : (stryCov_9fa48("18319"), 'Failed to fetch content from URL'))));
              }
            }
            const result = await response.json();
            return result.generatedContent;
          }
        } catch (error) {
          if (stryMutAct_9fa48("18320")) {
            {}
          } else {
            stryCov_9fa48("18320");
            console.error(stryMutAct_9fa48("18321") ? "" : (stryCov_9fa48("18321"), 'Error fetching content from URL:'), error);
            throw error;
          }
        }
      }
    };
    const generateJSONFromContent = async content => {
      if (stryMutAct_9fa48("18322")) {
        {}
      } else {
        stryCov_9fa48("18322");
        try {
          if (stryMutAct_9fa48("18323")) {
            {}
          } else {
            stryCov_9fa48("18323");
            const response = await fetch(stryMutAct_9fa48("18324") ? `` : (stryCov_9fa48("18324"), `${import.meta.env.VITE_API_URL}/api/content/generate-json`), stryMutAct_9fa48("18325") ? {} : (stryCov_9fa48("18325"), {
              method: stryMutAct_9fa48("18326") ? "" : (stryCov_9fa48("18326"), 'POST'),
              headers: stryMutAct_9fa48("18327") ? {} : (stryCov_9fa48("18327"), {
                'Content-Type': stryMutAct_9fa48("18328") ? "" : (stryCov_9fa48("18328"), 'application/json'),
                'Authorization': stryMutAct_9fa48("18329") ? `` : (stryCov_9fa48("18329"), `Bearer ${token}`)
              }),
              body: JSON.stringify(stryMutAct_9fa48("18330") ? {} : (stryCov_9fa48("18330"), {
                contentType: (stryMutAct_9fa48("18333") ? inputMethod !== 'file' : stryMutAct_9fa48("18332") ? false : stryMutAct_9fa48("18331") ? true : (stryCov_9fa48("18331", "18332", "18333"), inputMethod === (stryMutAct_9fa48("18334") ? "" : (stryCov_9fa48("18334"), 'file')))) ? stryMutAct_9fa48("18335") ? "" : (stryCov_9fa48("18335"), 'file') : stryMutAct_9fa48("18336") ? "" : (stryCov_9fa48("18336"), 'text'),
                content: content,
                cohort: stryMutAct_9fa48("18337") ? "" : (stryCov_9fa48("18337"), 'Generated Cohort'),
                weekNumber: 1,
                dayNumber: 1,
                date: new Date().toISOString().split(stryMutAct_9fa48("18338") ? "" : (stryCov_9fa48("18338"), 'T'))[0]
              }))
            }));
            if (stryMutAct_9fa48("18341") ? false : stryMutAct_9fa48("18340") ? true : stryMutAct_9fa48("18339") ? response.ok : (stryCov_9fa48("18339", "18340", "18341"), !response.ok)) {
              if (stryMutAct_9fa48("18342")) {
                {}
              } else {
                stryCov_9fa48("18342");
                const errorData = await response.json();
                throw new Error(stryMutAct_9fa48("18345") ? errorData.error && 'Failed to generate JSON from content' : stryMutAct_9fa48("18344") ? false : stryMutAct_9fa48("18343") ? true : (stryCov_9fa48("18343", "18344", "18345"), errorData.error || (stryMutAct_9fa48("18346") ? "" : (stryCov_9fa48("18346"), 'Failed to generate JSON from content'))));
              }
            }
            const result = await response.json();
            return result.generatedContent;
          }
        } catch (error) {
          if (stryMutAct_9fa48("18347")) {
            {}
          } else {
            stryCov_9fa48("18347");
            console.error(stryMutAct_9fa48("18348") ? "" : (stryCov_9fa48("18348"), 'Error generating JSON from content:'), error);
            throw error;
          }
        }
      }
    };
    const handleCopyJSON = () => {
      if (stryMutAct_9fa48("18349")) {
        {}
      } else {
        stryCov_9fa48("18349");
        navigator.clipboard.writeText(generatedJSON);
        setCopied(stryMutAct_9fa48("18350") ? false : (stryCov_9fa48("18350"), true));
        setTimeout(stryMutAct_9fa48("18351") ? () => undefined : (stryCov_9fa48("18351"), () => setCopied(stryMutAct_9fa48("18352") ? true : (stryCov_9fa48("18352"), false))), 2000);
      }
    };
    const handleDownloadJSON = () => {
      if (stryMutAct_9fa48("18353")) {
        {}
      } else {
        stryCov_9fa48("18353");
        const blob = new Blob(stryMutAct_9fa48("18354") ? [] : (stryCov_9fa48("18354"), [generatedJSON]), stryMutAct_9fa48("18355") ? {} : (stryCov_9fa48("18355"), {
          type: stryMutAct_9fa48("18356") ? "" : (stryCov_9fa48("18356"), 'application/json')
        }));
        const url = URL.createObjectURL(blob);
        const a = document.createElement(stryMutAct_9fa48("18357") ? "" : (stryCov_9fa48("18357"), 'a'));
        a.href = url;
        a.download = stryMutAct_9fa48("18358") ? "" : (stryCov_9fa48("18358"), 'session-data.json');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    };
    const handleUseInTester = () => {
      if (stryMutAct_9fa48("18359")) {
        {}
      } else {
        stryCov_9fa48("18359");
        try {
          if (stryMutAct_9fa48("18360")) {
            {}
          } else {
            stryCov_9fa48("18360");
            const parsedData = JSON.parse(generatedJSON);
            if (stryMutAct_9fa48("18362") ? false : stryMutAct_9fa48("18361") ? true : (stryCov_9fa48("18361", "18362"), Array.isArray(parsedData))) {
              if (stryMutAct_9fa48("18363")) {
                {}
              } else {
                stryCov_9fa48("18363");
                // Multi-day data - send the entire array
                sessionStorage.setItem(stryMutAct_9fa48("18364") ? "" : (stryCov_9fa48("18364"), 'generatedSessionData'), generatedJSON);

                // Show user what's being tested
                alert(stryMutAct_9fa48("18365") ? `` : (stryCov_9fa48("18365"), `Multi-day content detected! Testing all ${parsedData.length} days.\n\nYou can navigate between days in the Session Tester.`));
                window.dispatchEvent(new CustomEvent(stryMutAct_9fa48("18366") ? "" : (stryCov_9fa48("18366"), 'switchToSessionTester'), stryMutAct_9fa48("18367") ? {} : (stryCov_9fa48("18367"), {
                  detail: stryMutAct_9fa48("18368") ? {} : (stryCov_9fa48("18368"), {
                    generatedJSON
                  })
                })));
              }
            } else {
              if (stryMutAct_9fa48("18369")) {
                {}
              } else {
                stryCov_9fa48("18369");
                // Single-day data
                sessionStorage.setItem(stryMutAct_9fa48("18370") ? "" : (stryCov_9fa48("18370"), 'generatedSessionData'), generatedJSON);
                window.dispatchEvent(new CustomEvent(stryMutAct_9fa48("18371") ? "" : (stryCov_9fa48("18371"), 'switchToSessionTester'), stryMutAct_9fa48("18372") ? {} : (stryCov_9fa48("18372"), {
                  detail: stryMutAct_9fa48("18373") ? {} : (stryCov_9fa48("18373"), {
                    generatedJSON
                  })
                })));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("18374")) {
            {}
          } else {
            stryCov_9fa48("18374");
            alert(stryMutAct_9fa48("18375") ? "" : (stryCov_9fa48("18375"), 'Error parsing generated JSON. Please check the output format.'));
          }
        }
      }
    };
    return <div className="json-generator">
      <div className="json-generator__content">
        <div className="json-generator__input-section">
          <div className="json-generator__header">
            <h2>Content Input</h2>
            <p>Provide your curriculum content through one of the methods below</p>
          </div>

          {/* Input Method Selector */}
          <div className="json-generator__method-selector">
            <button className={stryMutAct_9fa48("18376") ? `` : (stryCov_9fa48("18376"), `json-generator__method-btn ${(stryMutAct_9fa48("18379") ? inputMethod !== 'text' : stryMutAct_9fa48("18378") ? false : stryMutAct_9fa48("18377") ? true : (stryCov_9fa48("18377", "18378", "18379"), inputMethod === (stryMutAct_9fa48("18380") ? "" : (stryCov_9fa48("18380"), 'text')))) ? stryMutAct_9fa48("18381") ? "" : (stryCov_9fa48("18381"), 'active') : stryMutAct_9fa48("18382") ? "Stryker was here!" : (stryCov_9fa48("18382"), '')}`)} onClick={stryMutAct_9fa48("18383") ? () => undefined : (stryCov_9fa48("18383"), () => setInputMethod(stryMutAct_9fa48("18384") ? "" : (stryCov_9fa48("18384"), 'text')))}>
              <FaFileAlt />
              Text Input
            </button>
            <button className={stryMutAct_9fa48("18385") ? `` : (stryCov_9fa48("18385"), `json-generator__method-btn ${(stryMutAct_9fa48("18388") ? inputMethod !== 'url' : stryMutAct_9fa48("18387") ? false : stryMutAct_9fa48("18386") ? true : (stryCov_9fa48("18386", "18387", "18388"), inputMethod === (stryMutAct_9fa48("18389") ? "" : (stryCov_9fa48("18389"), 'url')))) ? stryMutAct_9fa48("18390") ? "" : (stryCov_9fa48("18390"), 'active') : stryMutAct_9fa48("18391") ? "Stryker was here!" : (stryCov_9fa48("18391"), '')}`)} onClick={stryMutAct_9fa48("18392") ? () => undefined : (stryCov_9fa48("18392"), () => setInputMethod(stryMutAct_9fa48("18393") ? "" : (stryCov_9fa48("18393"), 'url')))}>
              <FaLink />
              Google Doc URL
            </button>
            <button className={stryMutAct_9fa48("18394") ? `` : (stryCov_9fa48("18394"), `json-generator__method-btn ${(stryMutAct_9fa48("18397") ? inputMethod !== 'file' : stryMutAct_9fa48("18396") ? false : stryMutAct_9fa48("18395") ? true : (stryCov_9fa48("18395", "18396", "18397"), inputMethod === (stryMutAct_9fa48("18398") ? "" : (stryCov_9fa48("18398"), 'file')))) ? stryMutAct_9fa48("18399") ? "" : (stryCov_9fa48("18399"), 'active') : stryMutAct_9fa48("18400") ? "Stryker was here!" : (stryCov_9fa48("18400"), '')}`)} onClick={stryMutAct_9fa48("18401") ? () => undefined : (stryCov_9fa48("18401"), () => setInputMethod(stryMutAct_9fa48("18402") ? "" : (stryCov_9fa48("18402"), 'file')))}>
              <FaUpload />
              File Upload
            </button>
          </div>

          {/* Input Forms */}
          <div className="json-generator__input-form">
            {stryMutAct_9fa48("18405") ? inputMethod === 'text' || <div className="json-generator__text-input">
                <label htmlFor="textContent">
                  Paste your curriculum content here:
                </label>
                <textarea id="textContent" value={textInput} onChange={e => {
                setTextInput(e.target.value);
                updateSharedData?.({
                  textInput: e.target.value
                });
              }} placeholder="Enter your curriculum content, learning objectives, activities, etc..." rows={12} />
              </div> : stryMutAct_9fa48("18404") ? false : stryMutAct_9fa48("18403") ? true : (stryCov_9fa48("18403", "18404", "18405"), (stryMutAct_9fa48("18407") ? inputMethod !== 'text' : stryMutAct_9fa48("18406") ? true : (stryCov_9fa48("18406", "18407"), inputMethod === (stryMutAct_9fa48("18408") ? "" : (stryCov_9fa48("18408"), 'text')))) && <div className="json-generator__text-input">
                <label htmlFor="textContent">
                  Paste your curriculum content here:
                </label>
                <textarea id="textContent" value={textInput} onChange={e => {
                if (stryMutAct_9fa48("18409")) {
                  {}
                } else {
                  stryCov_9fa48("18409");
                  setTextInput(e.target.value);
                  stryMutAct_9fa48("18410") ? updateSharedData({
                    textInput: e.target.value
                  }) : (stryCov_9fa48("18410"), updateSharedData?.(stryMutAct_9fa48("18411") ? {} : (stryCov_9fa48("18411"), {
                    textInput: e.target.value
                  })));
                }
              }} placeholder="Enter your curriculum content, learning objectives, activities, etc..." rows={12} />
              </div>)}

            {stryMutAct_9fa48("18414") ? inputMethod === 'url' || <div className="json-generator__url-input">
                <label htmlFor="urlContent">
                  Google Doc URL (make sure it's publicly accessible):
                </label>
                <input id="urlContent" type="url" value={urlInput} onChange={e => {
                setUrlInput(e.target.value);
                updateSharedData?.({
                  urlInput: e.target.value
                });
              }} placeholder="https://docs.google.com/document/d/..." />
                <p className="json-generator__url-help">
                  Tip: Make sure your Google Doc is shared with "Anyone with the link can view"
                </p>
              </div> : stryMutAct_9fa48("18413") ? false : stryMutAct_9fa48("18412") ? true : (stryCov_9fa48("18412", "18413", "18414"), (stryMutAct_9fa48("18416") ? inputMethod !== 'url' : stryMutAct_9fa48("18415") ? true : (stryCov_9fa48("18415", "18416"), inputMethod === (stryMutAct_9fa48("18417") ? "" : (stryCov_9fa48("18417"), 'url')))) && <div className="json-generator__url-input">
                <label htmlFor="urlContent">
                  Google Doc URL (make sure it's publicly accessible):
                </label>
                <input id="urlContent" type="url" value={urlInput} onChange={e => {
                if (stryMutAct_9fa48("18418")) {
                  {}
                } else {
                  stryCov_9fa48("18418");
                  setUrlInput(e.target.value);
                  stryMutAct_9fa48("18419") ? updateSharedData({
                    urlInput: e.target.value
                  }) : (stryCov_9fa48("18419"), updateSharedData?.(stryMutAct_9fa48("18420") ? {} : (stryCov_9fa48("18420"), {
                    urlInput: e.target.value
                  })));
                }
              }} placeholder="https://docs.google.com/document/d/..." />
                <p className="json-generator__url-help">
                  Tip: Make sure your Google Doc is shared with "Anyone with the link can view"
                </p>
              </div>)}

            {stryMutAct_9fa48("18423") ? inputMethod === 'file' || <div className="json-generator__file-input">
                <label>Upload a content file (.txt, .md, .docx):</label>
                <div className="json-generator__file-upload">
                  <input ref={fileInputRef} type="file" accept=".txt,.md,.docx" onChange={handleFileUpload} style={{
                  display: 'none'
                }} />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="json-generator__file-btn">
                    <FaUpload />
                    {fileInput ? fileInput.name : 'Choose File'}
                  </button>
                </div>
              </div> : stryMutAct_9fa48("18422") ? false : stryMutAct_9fa48("18421") ? true : (stryCov_9fa48("18421", "18422", "18423"), (stryMutAct_9fa48("18425") ? inputMethod !== 'file' : stryMutAct_9fa48("18424") ? true : (stryCov_9fa48("18424", "18425"), inputMethod === (stryMutAct_9fa48("18426") ? "" : (stryCov_9fa48("18426"), 'file')))) && <div className="json-generator__file-input">
                <label>Upload a content file (.txt, .md, .docx):</label>
                <div className="json-generator__file-upload">
                  <input ref={fileInputRef} type="file" accept=".txt,.md,.docx" onChange={handleFileUpload} style={stryMutAct_9fa48("18427") ? {} : (stryCov_9fa48("18427"), {
                  display: stryMutAct_9fa48("18428") ? "" : (stryCov_9fa48("18428"), 'none')
                })} />
                  <button type="button" onClick={stryMutAct_9fa48("18429") ? () => undefined : (stryCov_9fa48("18429"), () => stryMutAct_9fa48("18430") ? fileInputRef.current.click() : (stryCov_9fa48("18430"), fileInputRef.current?.click()))} className="json-generator__file-btn">
                    <FaUpload />
                    {fileInput ? fileInput.name : stryMutAct_9fa48("18431") ? "" : (stryCov_9fa48("18431"), 'Choose File')}
                  </button>
                </div>
              </div>)}
          </div>

          {/* Generate Button */}
          <div className="json-generator__actions">
            <button onClick={handleGenerate} disabled={isGenerating} className="json-generator__generate-btn">
              {isGenerating ? <>
                  <FaSpinner className="spinning" />
                  Generating...
                </> : <>
                  <FaPlay />
                  Generate JSON
                </>}
            </button>
            
            <button onClick={async () => {
              if (stryMutAct_9fa48("18432")) {
                {}
              } else {
                stryCov_9fa48("18432");
                try {
                  if (stryMutAct_9fa48("18433")) {
                    {}
                  } else {
                    stryCov_9fa48("18433");
                    const response = await fetch(stryMutAct_9fa48("18434") ? `` : (stryCov_9fa48("18434"), `${import.meta.env.VITE_API_URL}/api/content/health`), stryMutAct_9fa48("18435") ? {} : (stryCov_9fa48("18435"), {
                      headers: stryMutAct_9fa48("18436") ? {} : (stryCov_9fa48("18436"), {
                        'Authorization': stryMutAct_9fa48("18437") ? `` : (stryCov_9fa48("18437"), `Bearer ${token}`)
                      })
                    }));
                    const result = await response.json();
                    alert(stryMutAct_9fa48("18438") ? `` : (stryCov_9fa48("18438"), `Service Status: ${result.status}\nGuidelines Loaded: ${result.guidelinesLoaded}\nOpenAI Configured: ${result.openaiConfigured}`));
                  }
                } catch (err) {
                  if (stryMutAct_9fa48("18439")) {
                    {}
                  } else {
                    stryCov_9fa48("18439");
                    alert(stryMutAct_9fa48("18440") ? `` : (stryCov_9fa48("18440"), `Health Check Failed: ${err.message}`));
                  }
                }
              }
            }} className="json-generator__generate-btn" style={stryMutAct_9fa48("18441") ? {} : (stryCov_9fa48("18441"), {
              marginLeft: stryMutAct_9fa48("18442") ? "" : (stryCov_9fa48("18442"), '10px'),
              background: stryMutAct_9fa48("18443") ? "" : (stryCov_9fa48("18443"), '#28a745')
            })}>
              Test Service
            </button>
          </div>

          {/* Error Display */}
          {stryMutAct_9fa48("18446") ? error || <div className="json-generator__error">
              {error}
            </div> : stryMutAct_9fa48("18445") ? false : stryMutAct_9fa48("18444") ? true : (stryCov_9fa48("18444", "18445", "18446"), error && <div className="json-generator__error">
              {error}
            </div>)}
        </div>

        <div className="json-generator__output-section">
          <div className="json-generator__header">
            <h2>Generated Session Data</h2>
            <p>JSON structure ready for testing</p>
          </div>

          {stryMutAct_9fa48("18449") ? generatedJSON || <div className="json-generator__output">
              <div className="json-generator__output-info">
                {(() => {
                try {
                  const parsedData = JSON.parse(generatedJSON);
                  if (Array.isArray(parsedData)) {
                    return <div className="json-generator__multi-day-info">
                          <div className="json-generator__multi-day-notice">
                            <strong>Multi-Day Content Generated:</strong> {parsedData.length} days of curriculum
                          </div>
                          <div className="json-generator__individual-days">
                            <p>Copy individual days:</p>
                            <div className="json-generator__day-buttons">
                              {parsedData.map((day, index) => <button key={index} onClick={() => {
                            const dayJSON = JSON.stringify(day, null, 2);
                            navigator.clipboard.writeText(dayJSON);
                            alert(`Day ${day.day_number || index + 1} JSON copied to clipboard!`);
                          }} className="json-generator__day-copy-btn" title={`Copy Day ${day.day_number || index + 1}: ${day.daily_goal || 'Untitled'}`}>
                                  Day {day.day_number || index + 1}
                                </button>)}
                            </div>
                          </div>
                        </div>;
                  } else {
                    return <div className="json-generator__single-day-notice">
                          <strong>Single Day Content Generated</strong>
                        </div>;
                  }
                } catch {
                  return null;
                }
              })()}
              </div>
              
              <div className="json-generator__output-actions">
                <button onClick={handleCopyJSON} className="json-generator__action-btn">
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleDownloadJSON} className="json-generator__action-btn">
                  <FaDownload />
                  Download
                </button>

                <button onClick={handleUseInTester} className="json-generator__action-btn json-generator__action-btn--primary">
                  <FaPlay />
                  Test in Session Tester
                </button>
              </div>
              
              <pre className="json-generator__json-display">
                <code>{generatedJSON}</code>
              </pre>
            </div> : stryMutAct_9fa48("18448") ? false : stryMutAct_9fa48("18447") ? true : (stryCov_9fa48("18447", "18448", "18449"), generatedJSON && <div className="json-generator__output">
              <div className="json-generator__output-info">
                {(() => {
                if (stryMutAct_9fa48("18450")) {
                  {}
                } else {
                  stryCov_9fa48("18450");
                  try {
                    if (stryMutAct_9fa48("18451")) {
                      {}
                    } else {
                      stryCov_9fa48("18451");
                      const parsedData = JSON.parse(generatedJSON);
                      if (stryMutAct_9fa48("18453") ? false : stryMutAct_9fa48("18452") ? true : (stryCov_9fa48("18452", "18453"), Array.isArray(parsedData))) {
                        if (stryMutAct_9fa48("18454")) {
                          {}
                        } else {
                          stryCov_9fa48("18454");
                          return <div className="json-generator__multi-day-info">
                          <div className="json-generator__multi-day-notice">
                            <strong>Multi-Day Content Generated:</strong> {parsedData.length} days of curriculum
                          </div>
                          <div className="json-generator__individual-days">
                            <p>Copy individual days:</p>
                            <div className="json-generator__day-buttons">
                              {parsedData.map(stryMutAct_9fa48("18455") ? () => undefined : (stryCov_9fa48("18455"), (day, index) => <button key={index} onClick={() => {
                                  if (stryMutAct_9fa48("18456")) {
                                    {}
                                  } else {
                                    stryCov_9fa48("18456");
                                    const dayJSON = JSON.stringify(day, null, 2);
                                    navigator.clipboard.writeText(dayJSON);
                                    alert(stryMutAct_9fa48("18457") ? `` : (stryCov_9fa48("18457"), `Day ${stryMutAct_9fa48("18460") ? day.day_number && index + 1 : stryMutAct_9fa48("18459") ? false : stryMutAct_9fa48("18458") ? true : (stryCov_9fa48("18458", "18459", "18460"), day.day_number || (stryMutAct_9fa48("18461") ? index - 1 : (stryCov_9fa48("18461"), index + 1)))} JSON copied to clipboard!`));
                                  }
                                }} className="json-generator__day-copy-btn" title={stryMutAct_9fa48("18462") ? `` : (stryCov_9fa48("18462"), `Copy Day ${stryMutAct_9fa48("18465") ? day.day_number && index + 1 : stryMutAct_9fa48("18464") ? false : stryMutAct_9fa48("18463") ? true : (stryCov_9fa48("18463", "18464", "18465"), day.day_number || (stryMutAct_9fa48("18466") ? index - 1 : (stryCov_9fa48("18466"), index + 1)))}: ${stryMutAct_9fa48("18469") ? day.daily_goal && 'Untitled' : stryMutAct_9fa48("18468") ? false : stryMutAct_9fa48("18467") ? true : (stryCov_9fa48("18467", "18468", "18469"), day.daily_goal || (stryMutAct_9fa48("18470") ? "" : (stryCov_9fa48("18470"), 'Untitled')))}`)}>
                                  Day {stryMutAct_9fa48("18473") ? day.day_number && index + 1 : stryMutAct_9fa48("18472") ? false : stryMutAct_9fa48("18471") ? true : (stryCov_9fa48("18471", "18472", "18473"), day.day_number || (stryMutAct_9fa48("18474") ? index - 1 : (stryCov_9fa48("18474"), index + 1)))}
                                </button>))}
                            </div>
                          </div>
                        </div>;
                        }
                      } else {
                        if (stryMutAct_9fa48("18475")) {
                          {}
                        } else {
                          stryCov_9fa48("18475");
                          return <div className="json-generator__single-day-notice">
                          <strong>Single Day Content Generated</strong>
                        </div>;
                        }
                      }
                    }
                  } catch {
                    if (stryMutAct_9fa48("18476")) {
                      {}
                    } else {
                      stryCov_9fa48("18476");
                      return null;
                    }
                  }
                }
              })()}
              </div>
              
              <div className="json-generator__output-actions">
                <button onClick={handleCopyJSON} className="json-generator__action-btn">
                  {copied ? <FaCheck /> : <FaCopy />}
                  {copied ? stryMutAct_9fa48("18477") ? "" : (stryCov_9fa48("18477"), 'Copied!') : stryMutAct_9fa48("18478") ? "" : (stryCov_9fa48("18478"), 'Copy')}
                </button>
                <button onClick={handleDownloadJSON} className="json-generator__action-btn">
                  <FaDownload />
                  Download
                </button>

                <button onClick={handleUseInTester} className="json-generator__action-btn json-generator__action-btn--primary">
                  <FaPlay />
                  Test in Session Tester
                </button>
              </div>
              
              <pre className="json-generator__json-display">
                <code>{generatedJSON}</code>
              </pre>
            </div>)}

          {stryMutAct_9fa48("18481") ? !generatedJSON && !isGenerating || <div className="json-generator__empty-state">
              <FaFileAlt size={48} />
              <p>Your generated JSON will appear here</p>
              <p className="json-generator__empty-help">
                Enter content above and click "Generate JSON" to get started
              </p>
            </div> : stryMutAct_9fa48("18480") ? false : stryMutAct_9fa48("18479") ? true : (stryCov_9fa48("18479", "18480", "18481"), (stryMutAct_9fa48("18483") ? !generatedJSON || !isGenerating : stryMutAct_9fa48("18482") ? true : (stryCov_9fa48("18482", "18483"), (stryMutAct_9fa48("18484") ? generatedJSON : (stryCov_9fa48("18484"), !generatedJSON)) && (stryMutAct_9fa48("18485") ? isGenerating : (stryCov_9fa48("18485"), !isGenerating)))) && <div className="json-generator__empty-state">
              <FaFileAlt size={48} />
              <p>Your generated JSON will appear here</p>
              <p className="json-generator__empty-help">
                Enter content above and click "Generate JSON" to get started
              </p>
            </div>)}
        </div>
      </div>
    </div>;
  }
};
export default JSONGenerator;