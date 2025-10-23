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
import React, { useState } from 'react';
import './BulkActionsModal.css';
const BulkActionsModal = ({
  selectedCount,
  onClose,
  onAction,
  isLoading
}) => {
  if (stryMutAct_9fa48("971")) {
    {}
  } else {
    stryCov_9fa48("971");
    const [selectedAction, setSelectedAction] = useState(stryMutAct_9fa48("972") ? "Stryker was here!" : (stryCov_9fa48("972"), ''));
    const [customSubject, setCustomSubject] = useState(stryMutAct_9fa48("973") ? "Stryker was here!" : (stryCov_9fa48("973"), ''));
    const [customBody, setCustomBody] = useState(stryMutAct_9fa48("974") ? "Stryker was here!" : (stryCov_9fa48("974"), ''));
    const [showConfirmation, setShowConfirmation] = useState(stryMutAct_9fa48("975") ? true : (stryCov_9fa48("975"), false));
    const actions = stryMutAct_9fa48("976") ? [] : (stryCov_9fa48("976"), [stryMutAct_9fa48("977") ? {} : (stryCov_9fa48("977"), {
      value: stryMutAct_9fa48("978") ? "" : (stryCov_9fa48("978"), 'invite_to_workshop'),
      label: stryMutAct_9fa48("979") ? "" : (stryCov_9fa48("979"), 'Invite to workshop')
    }), stryMutAct_9fa48("980") ? {} : (stryCov_9fa48("980"), {
      value: stryMutAct_9fa48("981") ? "" : (stryCov_9fa48("981"), 'remind_info_session'),
      label: stryMutAct_9fa48("982") ? "" : (stryCov_9fa48("982"), 'Remind to register for an info session')
    }), stryMutAct_9fa48("983") ? {} : (stryCov_9fa48("983"), {
      value: stryMutAct_9fa48("984") ? "" : (stryCov_9fa48("984"), 'remind_workshop'),
      label: stryMutAct_9fa48("985") ? "" : (stryCov_9fa48("985"), 'Remind to register for a workshop')
    }), stryMutAct_9fa48("986") ? {} : (stryCov_9fa48("986"), {
      value: stryMutAct_9fa48("987") ? "" : (stryCov_9fa48("987"), 'remind_application'),
      label: stryMutAct_9fa48("988") ? "" : (stryCov_9fa48("988"), 'Remind to submit application')
    }), stryMutAct_9fa48("989") ? {} : (stryCov_9fa48("989"), {
      value: stryMutAct_9fa48("990") ? "" : (stryCov_9fa48("990"), 'admit_to_program'),
      label: stryMutAct_9fa48("991") ? "" : (stryCov_9fa48("991"), 'Admit to program')
    }), stryMutAct_9fa48("992") ? {} : (stryCov_9fa48("992"), {
      value: stryMutAct_9fa48("993") ? "" : (stryCov_9fa48("993"), 'reject_from_program'),
      label: stryMutAct_9fa48("994") ? "" : (stryCov_9fa48("994"), 'Reject from program')
    }), stryMutAct_9fa48("995") ? {} : (stryCov_9fa48("995"), {
      value: stryMutAct_9fa48("996") ? "" : (stryCov_9fa48("996"), 'waitlist_applicant'),
      label: stryMutAct_9fa48("997") ? "" : (stryCov_9fa48("997"), 'Add to waitlist')
    }), stryMutAct_9fa48("998") ? {} : (stryCov_9fa48("998"), {
      value: stryMutAct_9fa48("999") ? "" : (stryCov_9fa48("999"), 'defer_applicant'),
      label: stryMutAct_9fa48("1000") ? "" : (stryCov_9fa48("1000"), 'Defer application')
    }), stryMutAct_9fa48("1001") ? {} : (stryCov_9fa48("1001"), {
      value: stryMutAct_9fa48("1002") ? "" : (stryCov_9fa48("1002"), 'send_custom_email'),
      label: stryMutAct_9fa48("1003") ? "" : (stryCov_9fa48("1003"), 'Send custom email')
    })]);
    const handleSubmit = () => {
      if (stryMutAct_9fa48("1004")) {
        {}
      } else {
        stryCov_9fa48("1004");
        if (stryMutAct_9fa48("1007") ? false : stryMutAct_9fa48("1006") ? true : stryMutAct_9fa48("1005") ? selectedAction : (stryCov_9fa48("1005", "1006", "1007"), !selectedAction)) return;
        if (stryMutAct_9fa48("1010") ? selectedAction === 'send_custom_email' || !customSubject.trim() || !customBody.trim() : stryMutAct_9fa48("1009") ? false : stryMutAct_9fa48("1008") ? true : (stryCov_9fa48("1008", "1009", "1010"), (stryMutAct_9fa48("1012") ? selectedAction !== 'send_custom_email' : stryMutAct_9fa48("1011") ? true : (stryCov_9fa48("1011", "1012"), selectedAction === (stryMutAct_9fa48("1013") ? "" : (stryCov_9fa48("1013"), 'send_custom_email')))) && (stryMutAct_9fa48("1015") ? !customSubject.trim() && !customBody.trim() : stryMutAct_9fa48("1014") ? true : (stryCov_9fa48("1014", "1015"), (stryMutAct_9fa48("1016") ? customSubject.trim() : (stryCov_9fa48("1016"), !(stryMutAct_9fa48("1017") ? customSubject : (stryCov_9fa48("1017"), customSubject.trim())))) || (stryMutAct_9fa48("1018") ? customBody.trim() : (stryCov_9fa48("1018"), !(stryMutAct_9fa48("1019") ? customBody : (stryCov_9fa48("1019"), customBody.trim())))))))) {
          if (stryMutAct_9fa48("1020")) {
            {}
          } else {
            stryCov_9fa48("1020");
            alert(stryMutAct_9fa48("1021") ? "" : (stryCov_9fa48("1021"), 'Please provide both subject and body for custom email'));
            return;
          }
        }
        setShowConfirmation(stryMutAct_9fa48("1022") ? false : (stryCov_9fa48("1022"), true));
      }
    };
    const handleConfirm = () => {
      if (stryMutAct_9fa48("1023")) {
        {}
      } else {
        stryCov_9fa48("1023");
        onAction(selectedAction, customSubject, customBody);
        // Keep confirmation state true so we show loading state
        // The parent component will close the modal when done
      }
    };
    const getActionDescription = action => {
      if (stryMutAct_9fa48("1024")) {
        {}
      } else {
        stryCov_9fa48("1024");
        switch (action) {
          case stryMutAct_9fa48("1026") ? "" : (stryCov_9fa48("1026"), 'invite_to_workshop'):
            if (stryMutAct_9fa48("1025")) {} else {
              stryCov_9fa48("1025");
              return stryMutAct_9fa48("1027") ? "" : (stryCov_9fa48("1027"), 'Update workshop status to "invited" and send workshop invitation email');
            }
          case stryMutAct_9fa48("1029") ? "" : (stryCov_9fa48("1029"), 'remind_info_session'):
            if (stryMutAct_9fa48("1028")) {} else {
              stryCov_9fa48("1028");
              return stryMutAct_9fa48("1030") ? "" : (stryCov_9fa48("1030"), 'Send reminder email about registering for info sessions');
            }
          case stryMutAct_9fa48("1032") ? "" : (stryCov_9fa48("1032"), 'remind_workshop'):
            if (stryMutAct_9fa48("1031")) {} else {
              stryCov_9fa48("1031");
              return stryMutAct_9fa48("1033") ? "" : (stryCov_9fa48("1033"), 'Send reminder email about registering for workshops');
            }
          case stryMutAct_9fa48("1035") ? "" : (stryCov_9fa48("1035"), 'remind_application'):
            if (stryMutAct_9fa48("1034")) {} else {
              stryCov_9fa48("1034");
              return stryMutAct_9fa48("1036") ? "" : (stryCov_9fa48("1036"), 'Send reminder email to complete application');
            }
          case stryMutAct_9fa48("1038") ? "" : (stryCov_9fa48("1038"), 'admit_to_program'):
            if (stryMutAct_9fa48("1037")) {} else {
              stryCov_9fa48("1037");
              return stryMutAct_9fa48("1039") ? "" : (stryCov_9fa48("1039"), 'Update admission status to "accepted" and send acceptance email');
            }
          case stryMutAct_9fa48("1041") ? "" : (stryCov_9fa48("1041"), 'reject_from_program'):
            if (stryMutAct_9fa48("1040")) {} else {
              stryCov_9fa48("1040");
              return stryMutAct_9fa48("1042") ? "" : (stryCov_9fa48("1042"), 'Update admission status to "rejected" and send rejection email');
            }
          case stryMutAct_9fa48("1044") ? "" : (stryCov_9fa48("1044"), 'waitlist_applicant'):
            if (stryMutAct_9fa48("1043")) {} else {
              stryCov_9fa48("1043");
              return stryMutAct_9fa48("1045") ? "" : (stryCov_9fa48("1045"), 'Update admission status to "waitlisted" and send waitlist notification');
            }
          case stryMutAct_9fa48("1047") ? "" : (stryCov_9fa48("1047"), 'defer_applicant'):
            if (stryMutAct_9fa48("1046")) {} else {
              stryCov_9fa48("1046");
              return stryMutAct_9fa48("1048") ? "" : (stryCov_9fa48("1048"), 'Update admission status to "deferred" for future consideration');
            }
          case stryMutAct_9fa48("1050") ? "" : (stryCov_9fa48("1050"), 'send_custom_email'):
            if (stryMutAct_9fa48("1049")) {} else {
              stryCov_9fa48("1049");
              return stryMutAct_9fa48("1051") ? "" : (stryCov_9fa48("1051"), 'Send custom email with your provided subject and body');
            }
          default:
            if (stryMutAct_9fa48("1052")) {} else {
              stryCov_9fa48("1052");
              return stryMutAct_9fa48("1053") ? "Stryker was here!" : (stryCov_9fa48("1053"), '');
            }
        }
      }
    };

    // Show loading state when processing
    if (stryMutAct_9fa48("1056") ? showConfirmation || isLoading : stryMutAct_9fa48("1055") ? false : stryMutAct_9fa48("1054") ? true : (stryCov_9fa48("1054", "1055", "1056"), showConfirmation && isLoading)) {
      if (stryMutAct_9fa48("1057")) {
        {}
      } else {
        stryCov_9fa48("1057");
        return <div className="bulk-actions-modal__overlay">
                <div className="bulk-actions-modal__container">
                    <div className="bulk-actions-modal__header">
                        <h2>Sending Emails</h2>
                    </div>
                    <div className="bulk-actions-modal__content">
                        <div className="bulk-actions-modal__loading">
                            <div className="bulk-actions-modal__spinner"></div>
                            <div className="bulk-actions-modal__loading-text">
                                <p>Sending emails to <strong>{selectedCount}</strong> applicant{(stryMutAct_9fa48("1060") ? selectedCount === 1 : stryMutAct_9fa48("1059") ? false : stryMutAct_9fa48("1058") ? true : (stryCov_9fa48("1058", "1059", "1060"), selectedCount !== 1)) ? stryMutAct_9fa48("1061") ? "" : (stryCov_9fa48("1061"), 's') : stryMutAct_9fa48("1062") ? "Stryker was here!" : (stryCov_9fa48("1062"), '')}...</p>
                                <p className="bulk-actions-modal__loading-subtext">
                                    Action: {stryMutAct_9fa48("1063") ? actions.find(a => a.value === selectedAction).label : (stryCov_9fa48("1063"), actions.find(stryMutAct_9fa48("1064") ? () => undefined : (stryCov_9fa48("1064"), a => stryMutAct_9fa48("1067") ? a.value !== selectedAction : stryMutAct_9fa48("1066") ? false : stryMutAct_9fa48("1065") ? true : (stryCov_9fa48("1065", "1066", "1067"), a.value === selectedAction)))?.label)}
                                </p>
                                <p className="bulk-actions-modal__loading-note">
                                    Please wait while we process your request. This may take a few moments.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>;
      }
    }

    // Show confirmation state
    if (stryMutAct_9fa48("1069") ? false : stryMutAct_9fa48("1068") ? true : (stryCov_9fa48("1068", "1069"), showConfirmation)) {
      if (stryMutAct_9fa48("1070")) {
        {}
      } else {
        stryCov_9fa48("1070");
        return <div className="bulk-actions-modal__overlay">
                <div className="bulk-actions-modal__container">
                    <div className="bulk-actions-modal__header">
                        <h2>Confirm Action</h2>
                    </div>
                    <div className="bulk-actions-modal__content">
                        <p>Are you sure you want to perform this action on <strong>{selectedCount}</strong> applicant{(stryMutAct_9fa48("1073") ? selectedCount === 1 : stryMutAct_9fa48("1072") ? false : stryMutAct_9fa48("1071") ? true : (stryCov_9fa48("1071", "1072", "1073"), selectedCount !== 1)) ? stryMutAct_9fa48("1074") ? "" : (stryCov_9fa48("1074"), 's') : stryMutAct_9fa48("1075") ? "Stryker was here!" : (stryCov_9fa48("1075"), '')}?</p>
                        <div className="bulk-actions-modal__action-summary">
                            <strong>Action:</strong> {stryMutAct_9fa48("1076") ? actions.find(a => a.value === selectedAction).label : (stryCov_9fa48("1076"), actions.find(stryMutAct_9fa48("1077") ? () => undefined : (stryCov_9fa48("1077"), a => stryMutAct_9fa48("1080") ? a.value !== selectedAction : stryMutAct_9fa48("1079") ? false : stryMutAct_9fa48("1078") ? true : (stryCov_9fa48("1078", "1079", "1080"), a.value === selectedAction)))?.label)}
                        </div>
                        <div className="bulk-actions-modal__action-description">
                            {getActionDescription(selectedAction)}
                        </div>
                        {stryMutAct_9fa48("1083") ? selectedAction === 'send_custom_email' || <div className="bulk-actions-modal__email-preview">
                                <div><strong>Subject:</strong> {customSubject}</div>
                                <div><strong>Body:</strong> {customBody.substring(0, 100)}{customBody.length > 100 ? '...' : ''}</div>
                            </div> : stryMutAct_9fa48("1082") ? false : stryMutAct_9fa48("1081") ? true : (stryCov_9fa48("1081", "1082", "1083"), (stryMutAct_9fa48("1085") ? selectedAction !== 'send_custom_email' : stryMutAct_9fa48("1084") ? true : (stryCov_9fa48("1084", "1085"), selectedAction === (stryMutAct_9fa48("1086") ? "" : (stryCov_9fa48("1086"), 'send_custom_email')))) && <div className="bulk-actions-modal__email-preview">
                                <div><strong>Subject:</strong> {customSubject}</div>
                                <div><strong>Body:</strong> {stryMutAct_9fa48("1087") ? customBody : (stryCov_9fa48("1087"), customBody.substring(0, 100))}{(stryMutAct_9fa48("1091") ? customBody.length <= 100 : stryMutAct_9fa48("1090") ? customBody.length >= 100 : stryMutAct_9fa48("1089") ? false : stryMutAct_9fa48("1088") ? true : (stryCov_9fa48("1088", "1089", "1090", "1091"), customBody.length > 100)) ? stryMutAct_9fa48("1092") ? "" : (stryCov_9fa48("1092"), '...') : stryMutAct_9fa48("1093") ? "Stryker was here!" : (stryCov_9fa48("1093"), '')}</div>
                            </div>)}
                    </div>
                    <div className="bulk-actions-modal__footer">
                        <button className="bulk-actions-modal__btn bulk-actions-modal__btn--secondary" onClick={stryMutAct_9fa48("1094") ? () => undefined : (stryCov_9fa48("1094"), () => setShowConfirmation(stryMutAct_9fa48("1095") ? true : (stryCov_9fa48("1095"), false)))} disabled={isLoading}>
                            Cancel
                        </button>
                        <button className="bulk-actions-modal__btn bulk-actions-modal__btn--primary" onClick={handleConfirm} disabled={isLoading}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>;
      }
    }
    return <div className="bulk-actions-modal__overlay">
            <div className="bulk-actions-modal__container">
                <div className="bulk-actions-modal__header">
                    <h2>Applicant(s) Selected</h2>
                    <button className="bulk-actions-modal__close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="bulk-actions-modal__content">
                    <p>{selectedCount} applicant{(stryMutAct_9fa48("1098") ? selectedCount === 1 : stryMutAct_9fa48("1097") ? false : stryMutAct_9fa48("1096") ? true : (stryCov_9fa48("1096", "1097", "1098"), selectedCount !== 1)) ? stryMutAct_9fa48("1099") ? "" : (stryCov_9fa48("1099"), 's') : stryMutAct_9fa48("1100") ? "Stryker was here!" : (stryCov_9fa48("1100"), '')} selected</p>
                    
                    <div className="bulk-actions-modal__field">
                        <label htmlFor="action-select">Select Action:</label>
                        <select id="action-select" className="bulk-actions-modal__select" value={selectedAction} onChange={stryMutAct_9fa48("1101") ? () => undefined : (stryCov_9fa48("1101"), e => setSelectedAction(e.target.value))}>
                            <option value="">Choose an action...</option>
                            {actions.map(stryMutAct_9fa48("1102") ? () => undefined : (stryCov_9fa48("1102"), action => <option key={action.value} value={action.value}>
                                    {action.label}
                                </option>))}
                        </select>
                    </div>

                    {stryMutAct_9fa48("1105") ? selectedAction === 'send_custom_email' || <>
                            <div className="bulk-actions-modal__field">
                                <label htmlFor="custom-subject">Email Subject:</label>
                                <input id="custom-subject" type="text" className="bulk-actions-modal__input" value={customSubject} onChange={e => setCustomSubject(e.target.value)} placeholder="Enter email subject..." />
                            </div>
                            <div className="bulk-actions-modal__field">
                                <label htmlFor="custom-body">Email Body:</label>
                                <textarea id="custom-body" className="bulk-actions-modal__textarea" value={customBody} onChange={e => setCustomBody(e.target.value)} placeholder="Enter email body..." rows={6} />
                            </div>
                        </> : stryMutAct_9fa48("1104") ? false : stryMutAct_9fa48("1103") ? true : (stryCov_9fa48("1103", "1104", "1105"), (stryMutAct_9fa48("1107") ? selectedAction !== 'send_custom_email' : stryMutAct_9fa48("1106") ? true : (stryCov_9fa48("1106", "1107"), selectedAction === (stryMutAct_9fa48("1108") ? "" : (stryCov_9fa48("1108"), 'send_custom_email')))) && <>
                            <div className="bulk-actions-modal__field">
                                <label htmlFor="custom-subject">Email Subject:</label>
                                <input id="custom-subject" type="text" className="bulk-actions-modal__input" value={customSubject} onChange={stryMutAct_9fa48("1109") ? () => undefined : (stryCov_9fa48("1109"), e => setCustomSubject(e.target.value))} placeholder="Enter email subject..." />
                            </div>
                            <div className="bulk-actions-modal__field">
                                <label htmlFor="custom-body">Email Body:</label>
                                <textarea id="custom-body" className="bulk-actions-modal__textarea" value={customBody} onChange={stryMutAct_9fa48("1110") ? () => undefined : (stryCov_9fa48("1110"), e => setCustomBody(e.target.value))} placeholder="Enter email body..." rows={6} />
                            </div>
                        </>)}

                    {stryMutAct_9fa48("1113") ? selectedAction && selectedAction !== 'send_custom_email' || <div className="bulk-actions-modal__action-description">
                            {getActionDescription(selectedAction)}
                        </div> : stryMutAct_9fa48("1112") ? false : stryMutAct_9fa48("1111") ? true : (stryCov_9fa48("1111", "1112", "1113"), (stryMutAct_9fa48("1115") ? selectedAction || selectedAction !== 'send_custom_email' : stryMutAct_9fa48("1114") ? true : (stryCov_9fa48("1114", "1115"), selectedAction && (stryMutAct_9fa48("1117") ? selectedAction === 'send_custom_email' : stryMutAct_9fa48("1116") ? true : (stryCov_9fa48("1116", "1117"), selectedAction !== (stryMutAct_9fa48("1118") ? "" : (stryCov_9fa48("1118"), 'send_custom_email')))))) && <div className="bulk-actions-modal__action-description">
                            {getActionDescription(selectedAction)}
                        </div>)}
                </div>
                <div className="bulk-actions-modal__footer">
                    <button className="bulk-actions-modal__btn bulk-actions-modal__btn--secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="bulk-actions-modal__btn bulk-actions-modal__btn--primary" onClick={handleSubmit} disabled={stryMutAct_9fa48("1119") ? selectedAction : (stryCov_9fa48("1119"), !selectedAction)}>
                        Continue
                    </button>
                </div>
            </div>
        </div>;
  }
};
export default BulkActionsModal;