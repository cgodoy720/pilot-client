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
import { FaUpload, FaVideo, FaExclamationTriangle, FaCheck } from 'react-icons/fa';
import './ResubmissionPanel.css';
function ResubmissionPanel({
  assessmentType,
  resubmissionType,
  existingSubmission,
  onSubmit,
  onCancel,
  isLoading
}) {
  if (stryMutAct_9fa48("13939")) {
    {}
  } else {
    stryCov_9fa48("13939");
    const [resubmissionData, setResubmissionData] = useState({});
    const [isComplete, setIsComplete] = useState(stryMutAct_9fa48("13940") ? true : (stryCov_9fa48("13940"), false));
    useEffect(() => {
      if (stryMutAct_9fa48("13941")) {
        {}
      } else {
        stryCov_9fa48("13941");
        // Initialize with existing data
        if (stryMutAct_9fa48("13943") ? false : stryMutAct_9fa48("13942") ? true : (stryCov_9fa48("13942", "13943"), existingSubmission)) {
          if (stryMutAct_9fa48("13944")) {
            {}
          } else {
            stryCov_9fa48("13944");
            setResubmissionData(stryMutAct_9fa48("13947") ? existingSubmission.submission_data && {} : stryMutAct_9fa48("13946") ? false : stryMutAct_9fa48("13945") ? true : (stryCov_9fa48("13945", "13946", "13947"), existingSubmission.submission_data || {}));
          }
        }
      }
    }, stryMutAct_9fa48("13948") ? [] : (stryCov_9fa48("13948"), [existingSubmission]));
    useEffect(() => {
      if (stryMutAct_9fa48("13949")) {
        {}
      } else {
        stryCov_9fa48("13949");
        // Check if resubmission is complete based on type
        let complete = stryMutAct_9fa48("13950") ? true : (stryCov_9fa48("13950"), false);
        if (stryMutAct_9fa48("13953") ? resubmissionType === 'files_only' && resubmissionData.files || resubmissionData.files.length > 0 : stryMutAct_9fa48("13952") ? false : stryMutAct_9fa48("13951") ? true : (stryCov_9fa48("13951", "13952", "13953"), (stryMutAct_9fa48("13955") ? resubmissionType === 'files_only' || resubmissionData.files : stryMutAct_9fa48("13954") ? true : (stryCov_9fa48("13954", "13955"), (stryMutAct_9fa48("13957") ? resubmissionType !== 'files_only' : stryMutAct_9fa48("13956") ? true : (stryCov_9fa48("13956", "13957"), resubmissionType === (stryMutAct_9fa48("13958") ? "" : (stryCov_9fa48("13958"), 'files_only')))) && resubmissionData.files)) && (stryMutAct_9fa48("13961") ? resubmissionData.files.length <= 0 : stryMutAct_9fa48("13960") ? resubmissionData.files.length >= 0 : stryMutAct_9fa48("13959") ? true : (stryCov_9fa48("13959", "13960", "13961"), resubmissionData.files.length > 0)))) {
          if (stryMutAct_9fa48("13962")) {
            {}
          } else {
            stryCov_9fa48("13962");
            complete = stryMutAct_9fa48("13963") ? false : (stryCov_9fa48("13963"), true);
          }
        } else if (stryMutAct_9fa48("13966") ? resubmissionType === 'video_only' || resubmissionData.loomUrl : stryMutAct_9fa48("13965") ? false : stryMutAct_9fa48("13964") ? true : (stryCov_9fa48("13964", "13965", "13966"), (stryMutAct_9fa48("13968") ? resubmissionType !== 'video_only' : stryMutAct_9fa48("13967") ? true : (stryCov_9fa48("13967", "13968"), resubmissionType === (stryMutAct_9fa48("13969") ? "" : (stryCov_9fa48("13969"), 'video_only')))) && resubmissionData.loomUrl)) {
          if (stryMutAct_9fa48("13970")) {
            {}
          } else {
            stryCov_9fa48("13970");
            complete = stryMutAct_9fa48("13971") ? false : (stryCov_9fa48("13971"), true);
          }
        } else if (stryMutAct_9fa48("13974") ? resubmissionType === 'files_and_video' && resubmissionData.files && resubmissionData.files.length > 0 || resubmissionData.loomUrl : stryMutAct_9fa48("13973") ? false : stryMutAct_9fa48("13972") ? true : (stryCov_9fa48("13972", "13973", "13974"), (stryMutAct_9fa48("13976") ? resubmissionType === 'files_and_video' && resubmissionData.files || resubmissionData.files.length > 0 : stryMutAct_9fa48("13975") ? true : (stryCov_9fa48("13975", "13976"), (stryMutAct_9fa48("13978") ? resubmissionType === 'files_and_video' || resubmissionData.files : stryMutAct_9fa48("13977") ? true : (stryCov_9fa48("13977", "13978"), (stryMutAct_9fa48("13980") ? resubmissionType !== 'files_and_video' : stryMutAct_9fa48("13979") ? true : (stryCov_9fa48("13979", "13980"), resubmissionType === (stryMutAct_9fa48("13981") ? "" : (stryCov_9fa48("13981"), 'files_and_video')))) && resubmissionData.files)) && (stryMutAct_9fa48("13984") ? resubmissionData.files.length <= 0 : stryMutAct_9fa48("13983") ? resubmissionData.files.length >= 0 : stryMutAct_9fa48("13982") ? true : (stryCov_9fa48("13982", "13983", "13984"), resubmissionData.files.length > 0)))) && resubmissionData.loomUrl)) {
          if (stryMutAct_9fa48("13985")) {
            {}
          } else {
            stryCov_9fa48("13985");
            complete = stryMutAct_9fa48("13986") ? false : (stryCov_9fa48("13986"), true);
          }
        }
        setIsComplete(complete);
      }
    }, stryMutAct_9fa48("13987") ? [] : (stryCov_9fa48("13987"), [resubmissionData, resubmissionType]));
    const handleFileUpload = async files => {
      if (stryMutAct_9fa48("13988")) {
        {}
      } else {
        stryCov_9fa48("13988");
        // Reuse the file upload logic from TechnicalSubmission
        const allowedTypes = stryMutAct_9fa48("13989") ? [] : (stryCov_9fa48("13989"), [stryMutAct_9fa48("13990") ? "" : (stryCov_9fa48("13990"), 'text/html'), stryMutAct_9fa48("13991") ? "" : (stryCov_9fa48("13991"), 'text/css'), stryMutAct_9fa48("13992") ? "" : (stryCov_9fa48("13992"), 'text/javascript'), stryMutAct_9fa48("13993") ? "" : (stryCov_9fa48("13993"), 'application/javascript'), stryMutAct_9fa48("13994") ? "" : (stryCov_9fa48("13994"), 'text/x-python-script'), stryMutAct_9fa48("13995") ? "" : (stryCov_9fa48("13995"), 'text/x-python'), stryMutAct_9fa48("13996") ? "" : (stryCov_9fa48("13996"), 'application/x-python-code'), stryMutAct_9fa48("13997") ? "" : (stryCov_9fa48("13997"), 'text/plain'), stryMutAct_9fa48("13998") ? "" : (stryCov_9fa48("13998"), '.py'), stryMutAct_9fa48("13999") ? "" : (stryCov_9fa48("13999"), '.js'), stryMutAct_9fa48("14000") ? "" : (stryCov_9fa48("14000"), '.html'), stryMutAct_9fa48("14001") ? "" : (stryCov_9fa48("14001"), '.css'), stryMutAct_9fa48("14002") ? "" : (stryCov_9fa48("14002"), '.txt'), stryMutAct_9fa48("14003") ? "" : (stryCov_9fa48("14003"), '.md')]);
        const validFiles = stryMutAct_9fa48("14004") ? Array.from(files) : (stryCov_9fa48("14004"), Array.from(files).filter(file => {
          if (stryMutAct_9fa48("14005")) {
            {}
          } else {
            stryCov_9fa48("14005");
            const isValidType = stryMutAct_9fa48("14006") ? allowedTypes.every(type => file.type === type || file.name.toLowerCase().endsWith(type.replace('text/', '.').replace('application/', '.'))) : (stryCov_9fa48("14006"), allowedTypes.some(stryMutAct_9fa48("14007") ? () => undefined : (stryCov_9fa48("14007"), type => stryMutAct_9fa48("14010") ? file.type === type && file.name.toLowerCase().endsWith(type.replace('text/', '.').replace('application/', '.')) : stryMutAct_9fa48("14009") ? false : stryMutAct_9fa48("14008") ? true : (stryCov_9fa48("14008", "14009", "14010"), (stryMutAct_9fa48("14012") ? file.type !== type : stryMutAct_9fa48("14011") ? false : (stryCov_9fa48("14011", "14012"), file.type === type)) || (stryMutAct_9fa48("14014") ? file.name.toUpperCase().endsWith(type.replace('text/', '.').replace('application/', '.')) : stryMutAct_9fa48("14013") ? file.name.toLowerCase().startsWith(type.replace('text/', '.').replace('application/', '.')) : (stryCov_9fa48("14013", "14014"), file.name.toLowerCase().endsWith(type.replace(stryMutAct_9fa48("14015") ? "" : (stryCov_9fa48("14015"), 'text/'), stryMutAct_9fa48("14016") ? "" : (stryCov_9fa48("14016"), '.')).replace(stryMutAct_9fa48("14017") ? "" : (stryCov_9fa48("14017"), 'application/'), stryMutAct_9fa48("14018") ? "" : (stryCov_9fa48("14018"), '.')))))))));
            const isValidSize = stryMutAct_9fa48("14022") ? file.size > 10 * 1024 * 1024 : stryMutAct_9fa48("14021") ? file.size < 10 * 1024 * 1024 : stryMutAct_9fa48("14020") ? false : stryMutAct_9fa48("14019") ? true : (stryCov_9fa48("14019", "14020", "14021", "14022"), file.size <= (stryMutAct_9fa48("14023") ? 10 * 1024 / 1024 : (stryCov_9fa48("14023"), (stryMutAct_9fa48("14024") ? 10 / 1024 : (stryCov_9fa48("14024"), 10 * 1024)) * 1024))); // 10MB limit
            return stryMutAct_9fa48("14027") ? isValidType || isValidSize : stryMutAct_9fa48("14026") ? false : stryMutAct_9fa48("14025") ? true : (stryCov_9fa48("14025", "14026", "14027"), isValidType && isValidSize);
          }
        }));
        if (stryMutAct_9fa48("14030") ? validFiles.length === files.length : stryMutAct_9fa48("14029") ? false : stryMutAct_9fa48("14028") ? true : (stryCov_9fa48("14028", "14029", "14030"), validFiles.length !== files.length)) {
          if (stryMutAct_9fa48("14031")) {
            {}
          } else {
            stryCov_9fa48("14031");
            alert(stryMutAct_9fa48("14032") ? "" : (stryCov_9fa48("14032"), 'Some files were not uploaded. Please only upload HTML, CSS, JS, Python, or text files under 10MB.'));
          }
        }

        // Read file contents
        const filesWithContent = await Promise.all(validFiles.map(stryMutAct_9fa48("14033") ? () => undefined : (stryCov_9fa48("14033"), file => readFileContent(file))));
        setResubmissionData(stryMutAct_9fa48("14034") ? () => undefined : (stryCov_9fa48("14034"), prev => stryMutAct_9fa48("14035") ? {} : (stryCov_9fa48("14035"), {
          ...prev,
          files: filesWithContent
        })));
      }
    };
    const readFileContent = file => {
      if (stryMutAct_9fa48("14036")) {
        {}
      } else {
        stryCov_9fa48("14036");
        return new Promise((resolve, reject) => {
          if (stryMutAct_9fa48("14037")) {
            {}
          } else {
            stryCov_9fa48("14037");
            const reader = new FileReader();
            reader.onload = e => {
              if (stryMutAct_9fa48("14038")) {
                {}
              } else {
                stryCov_9fa48("14038");
                resolve(stryMutAct_9fa48("14039") ? {} : (stryCov_9fa48("14039"), {
                  name: file.name,
                  size: file.size,
                  type: file.type,
                  lastModified: file.lastModified,
                  content: e.target.result,
                  encoding: stryMutAct_9fa48("14040") ? "" : (stryCov_9fa48("14040"), 'text'),
                  uploadedAt: new Date().toISOString()
                }));
              }
            };
            reader.onerror = () => {
              if (stryMutAct_9fa48("14041")) {
                {}
              } else {
                stryCov_9fa48("14041");
                reject(new Error(stryMutAct_9fa48("14042") ? `` : (stryCov_9fa48("14042"), `Failed to read file: ${file.name}`)));
              }
            };
            reader.readAsText(file);
          }
        });
      }
    };
    const handleVideoUrlChange = url => {
      if (stryMutAct_9fa48("14043")) {
        {}
      } else {
        stryCov_9fa48("14043");
        setResubmissionData(stryMutAct_9fa48("14044") ? () => undefined : (stryCov_9fa48("14044"), prev => stryMutAct_9fa48("14045") ? {} : (stryCov_9fa48("14045"), {
          ...prev,
          loomUrl: url
        })));
      }
    };
    const handleSubmit = () => {
      if (stryMutAct_9fa48("14046")) {
        {}
      } else {
        stryCov_9fa48("14046");
        if (stryMutAct_9fa48("14048") ? false : stryMutAct_9fa48("14047") ? true : (stryCov_9fa48("14047", "14048"), isComplete)) {
          if (stryMutAct_9fa48("14049")) {
            {}
          } else {
            stryCov_9fa48("14049");
            onSubmit(resubmissionData);
          }
        }
      }
    };
    const getResubmissionMessage = () => {
      if (stryMutAct_9fa48("14050")) {
        {}
      } else {
        stryCov_9fa48("14050");
        switch (resubmissionType) {
          case stryMutAct_9fa48("14052") ? "" : (stryCov_9fa48("14052"), 'files_only'):
            if (stryMutAct_9fa48("14051")) {} else {
              stryCov_9fa48("14051");
              return stryMutAct_9fa48("14053") ? "" : (stryCov_9fa48("14053"), 'We need you to resubmit your project files. Your conversation and other data will be preserved.');
            }
          case stryMutAct_9fa48("14055") ? "" : (stryCov_9fa48("14055"), 'video_only'):
            if (stryMutAct_9fa48("14054")) {} else {
              stryCov_9fa48("14054");
              return stryMutAct_9fa48("14056") ? "" : (stryCov_9fa48("14056"), 'We need you to resubmit your video presentation. Your other submission data will be preserved.');
            }
          case stryMutAct_9fa48("14058") ? "" : (stryCov_9fa48("14058"), 'files_and_video'):
            if (stryMutAct_9fa48("14057")) {} else {
              stryCov_9fa48("14057");
              return stryMutAct_9fa48("14059") ? "" : (stryCov_9fa48("14059"), 'We need you to resubmit both your project files and video presentation.');
            }
          default:
            if (stryMutAct_9fa48("14060")) {} else {
              stryCov_9fa48("14060");
              return stryMutAct_9fa48("14061") ? "" : (stryCov_9fa48("14061"), 'Please resubmit the required items for this assessment.');
            }
        }
      }
    };
    const formatFileSize = bytes => {
      if (stryMutAct_9fa48("14062")) {
        {}
      } else {
        stryCov_9fa48("14062");
        if (stryMutAct_9fa48("14065") ? bytes !== 0 : stryMutAct_9fa48("14064") ? false : stryMutAct_9fa48("14063") ? true : (stryCov_9fa48("14063", "14064", "14065"), bytes === 0)) return stryMutAct_9fa48("14066") ? "" : (stryCov_9fa48("14066"), '0 Bytes');
        const k = 1024;
        const sizes = stryMutAct_9fa48("14067") ? [] : (stryCov_9fa48("14067"), [stryMutAct_9fa48("14068") ? "" : (stryCov_9fa48("14068"), 'Bytes'), stryMutAct_9fa48("14069") ? "" : (stryCov_9fa48("14069"), 'KB'), stryMutAct_9fa48("14070") ? "" : (stryCov_9fa48("14070"), 'MB'), stryMutAct_9fa48("14071") ? "" : (stryCov_9fa48("14071"), 'GB')]);
        const i = Math.floor(stryMutAct_9fa48("14072") ? Math.log(bytes) * Math.log(k) : (stryCov_9fa48("14072"), Math.log(bytes) / Math.log(k)));
        return parseFloat((stryMutAct_9fa48("14073") ? bytes * Math.pow(k, i) : (stryCov_9fa48("14073"), bytes / Math.pow(k, i))).toFixed(2)) + (stryMutAct_9fa48("14074") ? "" : (stryCov_9fa48("14074"), ' ')) + sizes[i];
      }
    };
    return <div className="resubmission-panel">
      <div className="resubmission-panel__header">
        <div className="resubmission-panel__icon">
          <FaExclamationTriangle />
        </div>
        <div className="resubmission-panel__title">
          <h2>Resubmission Required</h2>
          <p className="resubmission-panel__subtitle">
            {stryMutAct_9fa48("14075") ? assessmentType.charAt(0).toUpperCase() - assessmentType.slice(1) : (stryCov_9fa48("14075"), (stryMutAct_9fa48("14077") ? assessmentType.toUpperCase() : stryMutAct_9fa48("14076") ? assessmentType.charAt(0).toLowerCase() : (stryCov_9fa48("14076", "14077"), assessmentType.charAt(0).toUpperCase())) + (stryMutAct_9fa48("14078") ? assessmentType : (stryCov_9fa48("14078"), assessmentType.slice(1))))} Assessment - Week 2
          </p>
        </div>
      </div>

      <div className="resubmission-panel__content">
        <div className="resubmission-panel__message">
          <p>{getResubmissionMessage()}</p>
          <p className="resubmission-panel__deadline">
            <strong>Deadline:</strong> September 21, 2025 at 11:59 PM
          </p>
        </div>

        {/* File Upload Section */}
        {stryMutAct_9fa48("14081") ? resubmissionType === 'files_only' || resubmissionType === 'files_and_video' || <div className="resubmission-panel__section">
            <h3>
              <FaUpload className="section-icon" />
              Upload Your Project Files
            </h3>
            
            <div className="file-upload-area">
              <input type="file" multiple accept=".html,.css,.js,.py,.txt,.md" onChange={e => handleFileUpload(e.target.files)} className="file-input" disabled={isLoading} />
              <div className="file-upload-text">
                <p>Select your HTML, CSS, JS, and Python files</p>
                <p className="file-upload-help">Max 10MB per file</p>
              </div>
            </div>

            {resubmissionData.files && resubmissionData.files.length > 0 && <div className="uploaded-files">
                <h4>Uploaded Files ({resubmissionData.files.length})</h4>
                {resubmissionData.files.map((file, index) => <div key={index} className="uploaded-file">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <FaCheck className="file-check" />
                  </div>)}
              </div>}
          </div> : stryMutAct_9fa48("14080") ? false : stryMutAct_9fa48("14079") ? true : (stryCov_9fa48("14079", "14080", "14081"), (stryMutAct_9fa48("14083") ? resubmissionType === 'files_only' && resubmissionType === 'files_and_video' : stryMutAct_9fa48("14082") ? true : (stryCov_9fa48("14082", "14083"), (stryMutAct_9fa48("14085") ? resubmissionType !== 'files_only' : stryMutAct_9fa48("14084") ? false : (stryCov_9fa48("14084", "14085"), resubmissionType === (stryMutAct_9fa48("14086") ? "" : (stryCov_9fa48("14086"), 'files_only')))) || (stryMutAct_9fa48("14088") ? resubmissionType !== 'files_and_video' : stryMutAct_9fa48("14087") ? false : (stryCov_9fa48("14087", "14088"), resubmissionType === (stryMutAct_9fa48("14089") ? "" : (stryCov_9fa48("14089"), 'files_and_video')))))) && <div className="resubmission-panel__section">
            <h3>
              <FaUpload className="section-icon" />
              Upload Your Project Files
            </h3>
            
            <div className="file-upload-area">
              <input type="file" multiple accept=".html,.css,.js,.py,.txt,.md" onChange={stryMutAct_9fa48("14090") ? () => undefined : (stryCov_9fa48("14090"), e => handleFileUpload(e.target.files))} className="file-input" disabled={isLoading} />
              <div className="file-upload-text">
                <p>Select your HTML, CSS, JS, and Python files</p>
                <p className="file-upload-help">Max 10MB per file</p>
              </div>
            </div>

            {stryMutAct_9fa48("14093") ? resubmissionData.files && resubmissionData.files.length > 0 || <div className="uploaded-files">
                <h4>Uploaded Files ({resubmissionData.files.length})</h4>
                {resubmissionData.files.map((file, index) => <div key={index} className="uploaded-file">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <FaCheck className="file-check" />
                  </div>)}
              </div> : stryMutAct_9fa48("14092") ? false : stryMutAct_9fa48("14091") ? true : (stryCov_9fa48("14091", "14092", "14093"), (stryMutAct_9fa48("14095") ? resubmissionData.files || resubmissionData.files.length > 0 : stryMutAct_9fa48("14094") ? true : (stryCov_9fa48("14094", "14095"), resubmissionData.files && (stryMutAct_9fa48("14098") ? resubmissionData.files.length <= 0 : stryMutAct_9fa48("14097") ? resubmissionData.files.length >= 0 : stryMutAct_9fa48("14096") ? true : (stryCov_9fa48("14096", "14097", "14098"), resubmissionData.files.length > 0)))) && <div className="uploaded-files">
                <h4>Uploaded Files ({resubmissionData.files.length})</h4>
                {resubmissionData.files.map(stryMutAct_9fa48("14099") ? () => undefined : (stryCov_9fa48("14099"), (file, index) => <div key={index} className="uploaded-file">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                    <FaCheck className="file-check" />
                  </div>))}
              </div>)}
          </div>)}

        {/* Video URL Section */}
        {stryMutAct_9fa48("14102") ? resubmissionType === 'video_only' || resubmissionType === 'files_and_video' || <div className="resubmission-panel__section">
            <h3>
              <FaVideo className="section-icon" />
              Update Your Video Presentation
            </h3>
            
            <div className="video-input-area">
              <label htmlFor="loomUrl">Loom Video URL</label>
              <input id="loomUrl" type="url" value={resubmissionData.loomUrl || ''} onChange={e => handleVideoUrlChange(e.target.value)} placeholder="https://www.loom.com/share/..." className="video-url-input" disabled={isLoading} />
              <p className="video-input-help">
                Please ensure your video has clear audio and covers the full presentation.
              </p>
            </div>
          </div> : stryMutAct_9fa48("14101") ? false : stryMutAct_9fa48("14100") ? true : (stryCov_9fa48("14100", "14101", "14102"), (stryMutAct_9fa48("14104") ? resubmissionType === 'video_only' && resubmissionType === 'files_and_video' : stryMutAct_9fa48("14103") ? true : (stryCov_9fa48("14103", "14104"), (stryMutAct_9fa48("14106") ? resubmissionType !== 'video_only' : stryMutAct_9fa48("14105") ? false : (stryCov_9fa48("14105", "14106"), resubmissionType === (stryMutAct_9fa48("14107") ? "" : (stryCov_9fa48("14107"), 'video_only')))) || (stryMutAct_9fa48("14109") ? resubmissionType !== 'files_and_video' : stryMutAct_9fa48("14108") ? false : (stryCov_9fa48("14108", "14109"), resubmissionType === (stryMutAct_9fa48("14110") ? "" : (stryCov_9fa48("14110"), 'files_and_video')))))) && <div className="resubmission-panel__section">
            <h3>
              <FaVideo className="section-icon" />
              Update Your Video Presentation
            </h3>
            
            <div className="video-input-area">
              <label htmlFor="loomUrl">Loom Video URL</label>
              <input id="loomUrl" type="url" value={stryMutAct_9fa48("14113") ? resubmissionData.loomUrl && '' : stryMutAct_9fa48("14112") ? false : stryMutAct_9fa48("14111") ? true : (stryCov_9fa48("14111", "14112", "14113"), resubmissionData.loomUrl || (stryMutAct_9fa48("14114") ? "Stryker was here!" : (stryCov_9fa48("14114"), '')))} onChange={stryMutAct_9fa48("14115") ? () => undefined : (stryCov_9fa48("14115"), e => handleVideoUrlChange(e.target.value))} placeholder="https://www.loom.com/share/..." className="video-url-input" disabled={isLoading} />
              <p className="video-input-help">
                Please ensure your video has clear audio and covers the full presentation.
              </p>
            </div>
          </div>)}

        <div className="resubmission-panel__actions">
          <button onClick={onCancel} className="resubmission-panel__btn resubmission-panel__btn--cancel" disabled={isLoading}>
            Cancel
          </button>
          <button onClick={handleSubmit} className={stryMutAct_9fa48("14116") ? `` : (stryCov_9fa48("14116"), `resubmission-panel__btn resubmission-panel__btn--submit ${isComplete ? stryMutAct_9fa48("14117") ? "" : (stryCov_9fa48("14117"), 'ready') : stryMutAct_9fa48("14118") ? "" : (stryCov_9fa48("14118"), 'disabled')}`)} disabled={stryMutAct_9fa48("14121") ? !isComplete && isLoading : stryMutAct_9fa48("14120") ? false : stryMutAct_9fa48("14119") ? true : (stryCov_9fa48("14119", "14120", "14121"), (stryMutAct_9fa48("14122") ? isComplete : (stryCov_9fa48("14122"), !isComplete)) || isLoading)}>
            {isLoading ? stryMutAct_9fa48("14123") ? "" : (stryCov_9fa48("14123"), 'Submitting...') : stryMutAct_9fa48("14124") ? "" : (stryCov_9fa48("14124"), 'Submit Resubmission')}
          </button>
        </div>
      </div>
    </div>;
  }
}
export default ResubmissionPanel;