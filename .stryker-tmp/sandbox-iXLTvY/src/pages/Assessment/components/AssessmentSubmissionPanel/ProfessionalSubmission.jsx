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
import { FaVideo, FaExternalLinkAlt } from 'react-icons/fa';
function ProfessionalSubmission({
  submissionData,
  isDraft,
  isLoading,
  onUpdate,
  onSubmit
}) {
  if (stryMutAct_9fa48("12684")) {
    {}
  } else {
    stryCov_9fa48("12684");
    const [formData, setFormData] = useState(stryMutAct_9fa48("12685") ? {} : (stryCov_9fa48("12685"), {
      loomUrl: stryMutAct_9fa48("12686") ? "Stryker was here!" : (stryCov_9fa48("12686"), '')
    }));

    // Initialize form data
    useEffect(() => {
      if (stryMutAct_9fa48("12687")) {
        {}
      } else {
        stryCov_9fa48("12687");
        if (stryMutAct_9fa48("12689") ? false : stryMutAct_9fa48("12688") ? true : (stryCov_9fa48("12688", "12689"), submissionData)) {
          if (stryMutAct_9fa48("12690")) {
            {}
          } else {
            stryCov_9fa48("12690");
            setFormData(stryMutAct_9fa48("12691") ? {} : (stryCov_9fa48("12691"), {
              loomUrl: stryMutAct_9fa48("12694") ? submissionData.loomUrl && '' : stryMutAct_9fa48("12693") ? false : stryMutAct_9fa48("12692") ? true : (stryCov_9fa48("12692", "12693", "12694"), submissionData.loomUrl || (stryMutAct_9fa48("12695") ? "Stryker was here!" : (stryCov_9fa48("12695"), '')))
            }));
          }
        }
      }
    }, stryMutAct_9fa48("12696") ? [] : (stryCov_9fa48("12696"), [submissionData]));
    const handleChange = (field, value) => {
      if (stryMutAct_9fa48("12697")) {
        {}
      } else {
        stryCov_9fa48("12697");
        const newFormData = stryMutAct_9fa48("12698") ? {} : (stryCov_9fa48("12698"), {
          ...formData,
          [field]: value
        });
        setFormData(newFormData);

        // Update parent state immediately (no auto-save)
        onUpdate(newFormData);
      }
    };
    const isValidLoomUrl = url => {
      if (stryMutAct_9fa48("12699")) {
        {}
      } else {
        stryCov_9fa48("12699");
        const loomPatterns = stryMutAct_9fa48("12700") ? [] : (stryCov_9fa48("12700"), [stryMutAct_9fa48("12706") ? /^https:\/\/www\.loom\.com\/share\/[a-zA-Z0-9]+(\?.)?$/ : stryMutAct_9fa48("12705") ? /^https:\/\/www\.loom\.com\/share\/[a-zA-Z0-9]+(\?.*)$/ : stryMutAct_9fa48("12704") ? /^https:\/\/www\.loom\.com\/share\/[^a-zA-Z0-9]+(\?.*)?$/ : stryMutAct_9fa48("12703") ? /^https:\/\/www\.loom\.com\/share\/[a-zA-Z0-9](\?.*)?$/ : stryMutAct_9fa48("12702") ? /^https:\/\/www\.loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?/ : stryMutAct_9fa48("12701") ? /https:\/\/www\.loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?$/ : (stryCov_9fa48("12701", "12702", "12703", "12704", "12705", "12706"), /^https:\/\/www\.loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?$/), stryMutAct_9fa48("12712") ? /^https:\/\/loom\.com\/share\/[a-zA-Z0-9]+(\?.)?$/ : stryMutAct_9fa48("12711") ? /^https:\/\/loom\.com\/share\/[a-zA-Z0-9]+(\?.*)$/ : stryMutAct_9fa48("12710") ? /^https:\/\/loom\.com\/share\/[^a-zA-Z0-9]+(\?.*)?$/ : stryMutAct_9fa48("12709") ? /^https:\/\/loom\.com\/share\/[a-zA-Z0-9](\?.*)?$/ : stryMutAct_9fa48("12708") ? /^https:\/\/loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?/ : stryMutAct_9fa48("12707") ? /https:\/\/loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?$/ : (stryCov_9fa48("12707", "12708", "12709", "12710", "12711", "12712"), /^https:\/\/loom\.com\/share\/[a-zA-Z0-9]+(\?.*)?$/), stryMutAct_9fa48("12718") ? /^https:\/\/www\.loom\.com\/embed\/[a-zA-Z0-9]+(\?.)?$/ : stryMutAct_9fa48("12717") ? /^https:\/\/www\.loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)$/ : stryMutAct_9fa48("12716") ? /^https:\/\/www\.loom\.com\/embed\/[^a-zA-Z0-9]+(\?.*)?$/ : stryMutAct_9fa48("12715") ? /^https:\/\/www\.loom\.com\/embed\/[a-zA-Z0-9](\?.*)?$/ : stryMutAct_9fa48("12714") ? /^https:\/\/www\.loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?/ : stryMutAct_9fa48("12713") ? /https:\/\/www\.loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?$/ : (stryCov_9fa48("12713", "12714", "12715", "12716", "12717", "12718"), /^https:\/\/www\.loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?$/), stryMutAct_9fa48("12724") ? /^https:\/\/loom\.com\/embed\/[a-zA-Z0-9]+(\?.)?$/ : stryMutAct_9fa48("12723") ? /^https:\/\/loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)$/ : stryMutAct_9fa48("12722") ? /^https:\/\/loom\.com\/embed\/[^a-zA-Z0-9]+(\?.*)?$/ : stryMutAct_9fa48("12721") ? /^https:\/\/loom\.com\/embed\/[a-zA-Z0-9](\?.*)?$/ : stryMutAct_9fa48("12720") ? /^https:\/\/loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?/ : stryMutAct_9fa48("12719") ? /https:\/\/loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?$/ : (stryCov_9fa48("12719", "12720", "12721", "12722", "12723", "12724"), /^https:\/\/loom\.com\/embed\/[a-zA-Z0-9]+(\?.*)?$/)]);
        return stryMutAct_9fa48("12725") ? loomPatterns.every(pattern => pattern.test(url)) : (stryCov_9fa48("12725"), loomPatterns.some(stryMutAct_9fa48("12726") ? () => undefined : (stryCov_9fa48("12726"), pattern => pattern.test(url))));
      }
    };
    const getLoomEmbedUrl = url => {
      if (stryMutAct_9fa48("12727")) {
        {}
      } else {
        stryCov_9fa48("12727");
        if (stryMutAct_9fa48("12730") ? false : stryMutAct_9fa48("12729") ? true : stryMutAct_9fa48("12728") ? isValidLoomUrl(url) : (stryCov_9fa48("12728", "12729", "12730"), !isValidLoomUrl(url))) return null;

        // Extract video ID from various Loom URL formats
        const shareMatch = url.match(stryMutAct_9fa48("12732") ? /loom\.com\/share\/([^a-zA-Z0-9]+)/ : stryMutAct_9fa48("12731") ? /loom\.com\/share\/([a-zA-Z0-9])/ : (stryCov_9fa48("12731", "12732"), /loom\.com\/share\/([a-zA-Z0-9]+)/));
        const embedMatch = url.match(stryMutAct_9fa48("12734") ? /loom\.com\/embed\/([^a-zA-Z0-9]+)/ : stryMutAct_9fa48("12733") ? /loom\.com\/embed\/([a-zA-Z0-9])/ : (stryCov_9fa48("12733", "12734"), /loom\.com\/embed\/([a-zA-Z0-9]+)/));
        const videoId = stryMutAct_9fa48("12737") ? shareMatch?.[1] && embedMatch?.[1] : stryMutAct_9fa48("12736") ? false : stryMutAct_9fa48("12735") ? true : (stryCov_9fa48("12735", "12736", "12737"), (stryMutAct_9fa48("12738") ? shareMatch[1] : (stryCov_9fa48("12738"), shareMatch?.[1])) || (stryMutAct_9fa48("12739") ? embedMatch[1] : (stryCov_9fa48("12739"), embedMatch?.[1])));
        if (stryMutAct_9fa48("12741") ? false : stryMutAct_9fa48("12740") ? true : (stryCov_9fa48("12740", "12741"), videoId)) {
          if (stryMutAct_9fa48("12742")) {
            {}
          } else {
            stryCov_9fa48("12742");
            return stryMutAct_9fa48("12743") ? `` : (stryCov_9fa48("12743"), `https://www.loom.com/embed/${videoId}`);
          }
        }
        return null;
      }
    };
    const handleSubmit = () => {
      if (stryMutAct_9fa48("12744")) {
        {}
      } else {
        stryCov_9fa48("12744");
        if (stryMutAct_9fa48("12747") ? false : stryMutAct_9fa48("12746") ? true : stryMutAct_9fa48("12745") ? formData.loomUrl.trim() : (stryCov_9fa48("12745", "12746", "12747"), !(stryMutAct_9fa48("12748") ? formData.loomUrl : (stryCov_9fa48("12748"), formData.loomUrl.trim())))) {
          if (stryMutAct_9fa48("12749")) {
            {}
          } else {
            stryCov_9fa48("12749");
            alert(stryMutAct_9fa48("12750") ? "" : (stryCov_9fa48("12750"), 'Please provide a Loom video URL.'));
            return;
          }
        }
        if (stryMutAct_9fa48("12753") ? false : stryMutAct_9fa48("12752") ? true : stryMutAct_9fa48("12751") ? isValidLoomUrl(formData.loomUrl) : (stryCov_9fa48("12751", "12752", "12753"), !isValidLoomUrl(formData.loomUrl))) {
          if (stryMutAct_9fa48("12754")) {
            {}
          } else {
            stryCov_9fa48("12754");
            alert(stryMutAct_9fa48("12755") ? "" : (stryCov_9fa48("12755"), 'Please provide a valid Loom video URL (e.g., https://www.loom.com/share/...)'));
            return;
          }
        }

        // Submit with current form data
        onSubmit(formData);
      }
    };
    const isComplete = stryMutAct_9fa48("12758") ? formData.loomUrl.trim() || isValidLoomUrl(formData.loomUrl) : stryMutAct_9fa48("12757") ? false : stryMutAct_9fa48("12756") ? true : (stryCov_9fa48("12756", "12757", "12758"), (stryMutAct_9fa48("12759") ? formData.loomUrl : (stryCov_9fa48("12759"), formData.loomUrl.trim())) && isValidLoomUrl(formData.loomUrl));
    const embedUrl = getLoomEmbedUrl(formData.loomUrl);
    return <div className="submission-form">
      {/* Instructions */}
      <div className="submission-form__instructions">
        <div className="submission-form__instructions-header">
          <FaVideo className="submission-form__instructions-icon" />
          <h3>Record Your Pitch</h3>
        </div>
        <p>
          Record a pitch describing your coffee shop AI solution to showcase your thinking 
          and communication skills. No slides or preparation needed - just speak naturally 
          about your solution.
        </p>
        <div className="submission-form__loom-link">
          <a href="https://www.loom.com" target="_blank" rel="noopener noreferrer" className="submission-form__external-link">
            <FaExternalLinkAlt />
            Need to record? Visit Loom.com
          </a>
        </div>
      </div>

      {/* Loom URL Input */}
      <div className="submission-form__field">
        <label className="submission-form__label">
          Loom Video URL *
        </label>
        <input type="url" className="submission-form__input" value={formData.loomUrl} onChange={stryMutAct_9fa48("12760") ? () => undefined : (stryCov_9fa48("12760"), e => handleChange(stryMutAct_9fa48("12761") ? "" : (stryCov_9fa48("12761"), 'loomUrl'), e.target.value))} placeholder="https://www.loom.com/share/..." disabled={stryMutAct_9fa48("12764") ? !isDraft && isLoading : stryMutAct_9fa48("12763") ? false : stryMutAct_9fa48("12762") ? true : (stryCov_9fa48("12762", "12763", "12764"), (stryMutAct_9fa48("12765") ? isDraft : (stryCov_9fa48("12765"), !isDraft)) || isLoading)} />
        <div className="submission-form__help">
          Paste the share link from your Loom video. Make sure your video is publicly accessible.
        </div>
        {stryMutAct_9fa48("12768") ? formData.loomUrl && !isValidLoomUrl(formData.loomUrl) || <div className="submission-form__error">
            Please enter a valid Loom video URL (e.g., https://www.loom.com/share/...)
          </div> : stryMutAct_9fa48("12767") ? false : stryMutAct_9fa48("12766") ? true : (stryCov_9fa48("12766", "12767", "12768"), (stryMutAct_9fa48("12770") ? formData.loomUrl || !isValidLoomUrl(formData.loomUrl) : stryMutAct_9fa48("12769") ? true : (stryCov_9fa48("12769", "12770"), formData.loomUrl && (stryMutAct_9fa48("12771") ? isValidLoomUrl(formData.loomUrl) : (stryCov_9fa48("12771"), !isValidLoomUrl(formData.loomUrl))))) && <div className="submission-form__error">
            Please enter a valid Loom video URL (e.g., https://www.loom.com/share/...)
          </div>)}
      </div>

      {/* Video Preview */}
      {stryMutAct_9fa48("12774") ? embedUrl && isDraft || <div className="submission-form__field">
          <label className="submission-form__label">
            Video Preview
          </label>
          <div className="submission-form__video-preview">
            <iframe src={embedUrl} frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }} />
          </div>
          <div className="submission-form__help">
            Preview of your Loom video. Make sure it plays correctly before submitting.
          </div>
        </div> : stryMutAct_9fa48("12773") ? false : stryMutAct_9fa48("12772") ? true : (stryCov_9fa48("12772", "12773", "12774"), (stryMutAct_9fa48("12776") ? embedUrl || isDraft : stryMutAct_9fa48("12775") ? true : (stryCov_9fa48("12775", "12776"), embedUrl && isDraft)) && <div className="submission-form__field">
          <label className="submission-form__label">
            Video Preview
          </label>
          <div className="submission-form__video-preview">
            <iframe src={embedUrl} frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen style={stryMutAct_9fa48("12777") ? {} : (stryCov_9fa48("12777"), {
            position: stryMutAct_9fa48("12778") ? "" : (stryCov_9fa48("12778"), 'absolute'),
            top: 0,
            left: 0,
            width: stryMutAct_9fa48("12779") ? "" : (stryCov_9fa48("12779"), '100%'),
            height: stryMutAct_9fa48("12780") ? "" : (stryCov_9fa48("12780"), '100%')
          })} />
          </div>
          <div className="submission-form__help">
            Preview of your Loom video. Make sure it plays correctly before submitting.
          </div>
        </div>)}



      <div className="submission-form__actions">
        {isDraft ? <button onClick={handleSubmit} disabled={stryMutAct_9fa48("12783") ? !isComplete && isLoading : stryMutAct_9fa48("12782") ? false : stryMutAct_9fa48("12781") ? true : (stryCov_9fa48("12781", "12782", "12783"), (stryMutAct_9fa48("12784") ? isComplete : (stryCov_9fa48("12784"), !isComplete)) || isLoading)} className="submission-form__btn submission-form__btn--primary">
            {isLoading ? <>
                <div className="submission-form__spinner" />
                Submitting...
              </> : stryMutAct_9fa48("12785") ? "" : (stryCov_9fa48("12785"), 'Submit Final Assessment')}
          </button> : <div className="submission-form__submitted">
            <div className="submission-form__field">
              <label className="submission-form__label">Submitted Video</label>
              <div className="submission-form__readonly">
                <a href={formData.loomUrl} target="_blank" rel="noopener noreferrer">
                  {formData.loomUrl}
                </a>
              </div>
            </div>
            
            {stryMutAct_9fa48("12788") ? embedUrl || <div className="submission-form__field">
                <label className="submission-form__label">Video</label>
                <div className="submission-form__video-preview">
                  <iframe src={embedUrl} frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }} />
                </div>
              </div> : stryMutAct_9fa48("12787") ? false : stryMutAct_9fa48("12786") ? true : (stryCov_9fa48("12786", "12787", "12788"), embedUrl && <div className="submission-form__field">
                <label className="submission-form__label">Video</label>
                <div className="submission-form__video-preview">
                  <iframe src={embedUrl} frameBorder="0" webkitallowfullscreen mozallowfullscreen allowFullScreen style={stryMutAct_9fa48("12789") ? {} : (stryCov_9fa48("12789"), {
                position: stryMutAct_9fa48("12790") ? "" : (stryCov_9fa48("12790"), 'absolute'),
                top: 0,
                left: 0,
                width: stryMutAct_9fa48("12791") ? "" : (stryCov_9fa48("12791"), '100%'),
                height: stryMutAct_9fa48("12792") ? "" : (stryCov_9fa48("12792"), '100%')
              })} />
                </div>
              </div>)}
          </div>}
        
        {stryMutAct_9fa48("12795") ? !isComplete && isDraft || <div className="submission-form__help">
            Please provide a valid Loom video URL before submitting your assessment.
          </div> : stryMutAct_9fa48("12794") ? false : stryMutAct_9fa48("12793") ? true : (stryCov_9fa48("12793", "12794", "12795"), (stryMutAct_9fa48("12797") ? !isComplete || isDraft : stryMutAct_9fa48("12796") ? true : (stryCov_9fa48("12796", "12797"), (stryMutAct_9fa48("12798") ? isComplete : (stryCov_9fa48("12798"), !isComplete)) && isDraft)) && <div className="submission-form__help">
            Please provide a valid Loom video URL before submitting your assessment.
          </div>)}
      </div>
    </div>;
  }
}
export default ProfessionalSubmission;