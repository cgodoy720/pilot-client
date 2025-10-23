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
import React, { useEffect } from 'react';
import { FaExclamationTriangle, FaClock, FaSignInAlt } from 'react-icons/fa';
import './ExpiredTokenModal.css';
const ExpiredTokenModal = ({
  isOpen,
  type = stryMutAct_9fa48("1184") ? "" : (stryCov_9fa48("1184"), 'token_expired'),
  message,
  onRedirect
}) => {
  if (stryMutAct_9fa48("1185")) {
    {}
  } else {
    stryCov_9fa48("1185");
    // No countdown needed - global handler manages redirects

    if (stryMutAct_9fa48("1188") ? false : stryMutAct_9fa48("1187") ? true : stryMutAct_9fa48("1186") ? isOpen : (stryCov_9fa48("1186", "1187", "1188"), !isOpen)) return null;
    const getModalContent = () => {
      if (stryMutAct_9fa48("1189")) {
        {}
      } else {
        stryCov_9fa48("1189");
        switch (type) {
          case stryMutAct_9fa48("1191") ? "" : (stryCov_9fa48("1191"), 'token_expired'):
            if (stryMutAct_9fa48("1190")) {} else {
              stryCov_9fa48("1190");
              return stryMutAct_9fa48("1192") ? {} : (stryCov_9fa48("1192"), {
                icon: <FaClock className="modal-icon expired" />,
                title: stryMutAct_9fa48("1193") ? "" : (stryCov_9fa48("1193"), 'Session Expired'),
                message: stryMutAct_9fa48("1196") ? message && 'Your session has expired for security. Redirecting to login...' : stryMutAct_9fa48("1195") ? false : stryMutAct_9fa48("1194") ? true : (stryCov_9fa48("1194", "1195", "1196"), message || (stryMutAct_9fa48("1197") ? "" : (stryCov_9fa48("1197"), 'Your session has expired for security. Redirecting to login...'))),
                showRedirect: stryMutAct_9fa48("1198") ? false : (stryCov_9fa48("1198"), true),
                buttonText: stryMutAct_9fa48("1199") ? "" : (stryCov_9fa48("1199"), 'Login Now')
              });
            }
          case stryMutAct_9fa48("1201") ? "" : (stryCov_9fa48("1201"), 'user_inactive'):
            if (stryMutAct_9fa48("1200")) {} else {
              stryCov_9fa48("1200");
              return stryMutAct_9fa48("1202") ? {} : (stryCov_9fa48("1202"), {
                icon: <FaExclamationTriangle className="modal-icon warning" />,
                title: stryMutAct_9fa48("1203") ? "" : (stryCov_9fa48("1203"), 'Account Access Changed'),
                message: stryMutAct_9fa48("1206") ? message && 'Your account now has view-only access. You can browse historical content but cannot make new submissions.' : stryMutAct_9fa48("1205") ? false : stryMutAct_9fa48("1204") ? true : (stryCov_9fa48("1204", "1205", "1206"), message || (stryMutAct_9fa48("1207") ? "" : (stryCov_9fa48("1207"), 'Your account now has view-only access. You can browse historical content but cannot make new submissions.'))),
                showRedirect: stryMutAct_9fa48("1208") ? true : (stryCov_9fa48("1208"), false),
                buttonText: stryMutAct_9fa48("1209") ? "" : (stryCov_9fa48("1209"), 'Understood')
              });
            }
          default:
            if (stryMutAct_9fa48("1210")) {} else {
              stryCov_9fa48("1210");
              return stryMutAct_9fa48("1211") ? {} : (stryCov_9fa48("1211"), {
                icon: <FaExclamationTriangle className="modal-icon error" />,
                title: stryMutAct_9fa48("1212") ? "" : (stryCov_9fa48("1212"), 'Authentication Error'),
                message: stryMutAct_9fa48("1215") ? message && 'Authentication error. Redirecting to login...' : stryMutAct_9fa48("1214") ? false : stryMutAct_9fa48("1213") ? true : (stryCov_9fa48("1213", "1214", "1215"), message || (stryMutAct_9fa48("1216") ? "" : (stryCov_9fa48("1216"), 'Authentication error. Redirecting to login...'))),
                showRedirect: stryMutAct_9fa48("1217") ? false : (stryCov_9fa48("1217"), true),
                buttonText: stryMutAct_9fa48("1218") ? "" : (stryCov_9fa48("1218"), 'Login Now')
              });
            }
        }
      }
    };
    const {
      icon,
      title,
      message: displayMessage,
      showRedirect,
      buttonText
    } = getModalContent();
    const handleButtonClick = () => {
      if (stryMutAct_9fa48("1219")) {
        {}
      } else {
        stryCov_9fa48("1219");
        if (stryMutAct_9fa48("1221") ? false : stryMutAct_9fa48("1220") ? true : (stryCov_9fa48("1220", "1221"), onRedirect)) {
          if (stryMutAct_9fa48("1222")) {
            {}
          } else {
            stryCov_9fa48("1222");
            onRedirect();
          }
        }
      }
    };
    return <div className="expired-token-modal__overlay">
      <div className="expired-token-modal__container">
        <div className="expired-token-modal__content">
          <div className="expired-token-modal__header">
            {icon}
            <h2 className="expired-token-modal__title">{title}</h2>
          </div>
          
          <div className="expired-token-modal__body">
            <p className="expired-token-modal__message">
              {displayMessage}
            </p>
            
            {stryMutAct_9fa48("1225") ? showRedirect || <div className="expired-token-modal__redirect-info">
                <FaSignInAlt className="redirect-icon" />
                <span>Redirecting to login page...</span>
              </div> : stryMutAct_9fa48("1224") ? false : stryMutAct_9fa48("1223") ? true : (stryCov_9fa48("1223", "1224", "1225"), showRedirect && <div className="expired-token-modal__redirect-info">
                <FaSignInAlt className="redirect-icon" />
                <span>Redirecting to login page...</span>
              </div>)}
          </div>
          
          <div className="expired-token-modal__footer">
            <button className="expired-token-modal__button" onClick={handleButtonClick}>
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>;
  }
};
export default ExpiredTokenModal;