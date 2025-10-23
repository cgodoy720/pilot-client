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
import { Box, Typography, CircularProgress } from '@mui/material';
import './AdminDashboard.css';
const AdminDashboard = () => {
  if (stryMutAct_9fa48("4754")) {
    {}
  } else {
    stryCov_9fa48("4754");
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("4755") ? false : (stryCov_9fa48("4755"), true));
    const partnerDashboardUrl = stryMutAct_9fa48("4756") ? "" : (stryCov_9fa48("4756"), 'https://ai-pilot-admin-dashboard-866060457933.us-central1.run.app/');
    const handleIframeLoad = () => {
      if (stryMutAct_9fa48("4757")) {
        {}
      } else {
        stryCov_9fa48("4757");
        setIsLoading(stryMutAct_9fa48("4758") ? true : (stryCov_9fa48("4758"), false));
      }
    };
    return <Box className="admin-dashboard">
      <Box className="admin-dashboard__iframe-container">
        {stryMutAct_9fa48("4761") ? isLoading || <Box className="admin-dashboard__loading">
            <CircularProgress />
            <Typography>Loading dashboard...</Typography>
          </Box> : stryMutAct_9fa48("4760") ? false : stryMutAct_9fa48("4759") ? true : (stryCov_9fa48("4759", "4760", "4761"), isLoading && <Box className="admin-dashboard__loading">
            <CircularProgress />
            <Typography>Loading dashboard...</Typography>
          </Box>)}
        <iframe src={partnerDashboardUrl} title="Admin Dashboard" className="admin-dashboard__iframe" onLoad={handleIframeLoad} allow="fullscreen" />
      </Box>
    </Box>;
  }
};
export default AdminDashboard;