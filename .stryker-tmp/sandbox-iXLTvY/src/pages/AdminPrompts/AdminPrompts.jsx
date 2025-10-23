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
import { Box, Container, Typography, Paper, Tabs, Tab, Alert, Snackbar, CircularProgress } from '@mui/material';
import BasePromptsTab from './components/BasePromptsTab';
import PersonasTab from './components/PersonasTab';
import ProgramContextsTab from './components/ProgramContextsTab';
import ModesTab from './components/ModesTab';
import StatusTab from './components/StatusTab';
import './AdminPrompts.css';
const AdminPrompts = () => {
  if (stryMutAct_9fa48("4762")) {
    {}
  } else {
    stryCov_9fa48("4762");
    const [currentTab, setCurrentTab] = useState(0);
    const [loading, setLoading] = useState(stryMutAct_9fa48("4763") ? true : (stryCov_9fa48("4763"), false));
    const [notification, setNotification] = useState(stryMutAct_9fa48("4764") ? {} : (stryCov_9fa48("4764"), {
      open: stryMutAct_9fa48("4765") ? true : (stryCov_9fa48("4765"), false),
      message: stryMutAct_9fa48("4766") ? "Stryker was here!" : (stryCov_9fa48("4766"), ''),
      severity: stryMutAct_9fa48("4767") ? "" : (stryCov_9fa48("4767"), 'success')
    }));
    const showNotification = (message, severity = stryMutAct_9fa48("4768") ? "" : (stryCov_9fa48("4768"), 'success')) => {
      if (stryMutAct_9fa48("4769")) {
        {}
      } else {
        stryCov_9fa48("4769");
        setNotification(stryMutAct_9fa48("4770") ? {} : (stryCov_9fa48("4770"), {
          open: stryMutAct_9fa48("4771") ? false : (stryCov_9fa48("4771"), true),
          message,
          severity
        }));
      }
    };
    const closeNotification = () => {
      if (stryMutAct_9fa48("4772")) {
        {}
      } else {
        stryCov_9fa48("4772");
        setNotification(stryMutAct_9fa48("4773") ? () => undefined : (stryCov_9fa48("4773"), prev => stryMutAct_9fa48("4774") ? {} : (stryCov_9fa48("4774"), {
          ...prev,
          open: stryMutAct_9fa48("4775") ? true : (stryCov_9fa48("4775"), false)
        })));
      }
    };
    const handleTabChange = (event, newValue) => {
      if (stryMutAct_9fa48("4776")) {
        {}
      } else {
        stryCov_9fa48("4776");
        setCurrentTab(newValue);
      }
    };
    const reloadPrompts = async () => {
      if (stryMutAct_9fa48("4777")) {
        {}
      } else {
        stryCov_9fa48("4777");
        try {
          if (stryMutAct_9fa48("4778")) {
            {}
          } else {
            stryCov_9fa48("4778");
            setLoading(stryMutAct_9fa48("4779") ? false : (stryCov_9fa48("4779"), true));
            const token = localStorage.getItem(stryMutAct_9fa48("4780") ? "" : (stryCov_9fa48("4780"), 'token'));
            const response = await fetch(stryMutAct_9fa48("4781") ? `` : (stryCov_9fa48("4781"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/reload`), stryMutAct_9fa48("4782") ? {} : (stryCov_9fa48("4782"), {
              method: stryMutAct_9fa48("4783") ? "" : (stryCov_9fa48("4783"), 'POST'),
              headers: stryMutAct_9fa48("4784") ? {} : (stryCov_9fa48("4784"), {
                'Authorization': stryMutAct_9fa48("4785") ? `` : (stryCov_9fa48("4785"), `Bearer ${token}`),
                'Content-Type': stryMutAct_9fa48("4786") ? "" : (stryCov_9fa48("4786"), 'application/json')
              })
            }));
            if (stryMutAct_9fa48("4788") ? false : stryMutAct_9fa48("4787") ? true : (stryCov_9fa48("4787", "4788"), response.ok)) {
              if (stryMutAct_9fa48("4789")) {
                {}
              } else {
                stryCov_9fa48("4789");
                showNotification(stryMutAct_9fa48("4790") ? "" : (stryCov_9fa48("4790"), 'Prompts reloaded successfully'));
              }
            } else {
              if (stryMutAct_9fa48("4791")) {
                {}
              } else {
                stryCov_9fa48("4791");
                throw new Error(stryMutAct_9fa48("4792") ? "" : (stryCov_9fa48("4792"), 'Failed to reload prompts'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("4793")) {
            {}
          } else {
            stryCov_9fa48("4793");
            console.error(stryMutAct_9fa48("4794") ? "" : (stryCov_9fa48("4794"), 'Error reloading prompts:'), error);
            showNotification(stryMutAct_9fa48("4795") ? "" : (stryCov_9fa48("4795"), 'Failed to reload prompts'), stryMutAct_9fa48("4796") ? "" : (stryCov_9fa48("4796"), 'error'));
          }
        } finally {
          if (stryMutAct_9fa48("4797")) {
            {}
          } else {
            stryCov_9fa48("4797");
            setLoading(stryMutAct_9fa48("4798") ? true : (stryCov_9fa48("4798"), false));
          }
        }
      }
    };
    return <Container maxWidth="xl" className="admin-prompts">
      <Paper className="admin-prompts__content">
        <Tabs value={currentTab} onChange={handleTabChange} className="admin-prompts__tabs" variant="scrollable" scrollButtons="auto">
          <Tab label="Base Prompts" />
          <Tab label="Personas" />
          <Tab label="Program Contexts" />
          <Tab label="Modes" />
          <Tab label="Current AI Prompt" />
        </Tabs>

        <Box className="admin-prompts__tab-content">
          {stryMutAct_9fa48("4801") ? currentTab === 0 || <BasePromptsTab showNotification={showNotification} reloadPrompts={reloadPrompts} /> : stryMutAct_9fa48("4800") ? false : stryMutAct_9fa48("4799") ? true : (stryCov_9fa48("4799", "4800", "4801"), (stryMutAct_9fa48("4803") ? currentTab !== 0 : stryMutAct_9fa48("4802") ? true : (stryCov_9fa48("4802", "4803"), currentTab === 0)) && <BasePromptsTab showNotification={showNotification} reloadPrompts={reloadPrompts} />)}
          {stryMutAct_9fa48("4806") ? currentTab === 1 || <PersonasTab showNotification={showNotification} reloadPrompts={reloadPrompts} /> : stryMutAct_9fa48("4805") ? false : stryMutAct_9fa48("4804") ? true : (stryCov_9fa48("4804", "4805", "4806"), (stryMutAct_9fa48("4808") ? currentTab !== 1 : stryMutAct_9fa48("4807") ? true : (stryCov_9fa48("4807", "4808"), currentTab === 1)) && <PersonasTab showNotification={showNotification} reloadPrompts={reloadPrompts} />)}
          {stryMutAct_9fa48("4811") ? currentTab === 2 || <ProgramContextsTab showNotification={showNotification} reloadPrompts={reloadPrompts} /> : stryMutAct_9fa48("4810") ? false : stryMutAct_9fa48("4809") ? true : (stryCov_9fa48("4809", "4810", "4811"), (stryMutAct_9fa48("4813") ? currentTab !== 2 : stryMutAct_9fa48("4812") ? true : (stryCov_9fa48("4812", "4813"), currentTab === 2)) && <ProgramContextsTab showNotification={showNotification} reloadPrompts={reloadPrompts} />)}
          {stryMutAct_9fa48("4816") ? currentTab === 3 || <ModesTab showNotification={showNotification} reloadPrompts={reloadPrompts} /> : stryMutAct_9fa48("4815") ? false : stryMutAct_9fa48("4814") ? true : (stryCov_9fa48("4814", "4815", "4816"), (stryMutAct_9fa48("4818") ? currentTab !== 3 : stryMutAct_9fa48("4817") ? true : (stryCov_9fa48("4817", "4818"), currentTab === 3)) && <ModesTab showNotification={showNotification} reloadPrompts={reloadPrompts} />)}
          {stryMutAct_9fa48("4821") ? currentTab === 4 || <StatusTab showNotification={showNotification} reloadPrompts={reloadPrompts} /> : stryMutAct_9fa48("4820") ? false : stryMutAct_9fa48("4819") ? true : (stryCov_9fa48("4819", "4820", "4821"), (stryMutAct_9fa48("4823") ? currentTab !== 4 : stryMutAct_9fa48("4822") ? true : (stryCov_9fa48("4822", "4823"), currentTab === 4)) && <StatusTab showNotification={showNotification} reloadPrompts={reloadPrompts} />)}
        </Box>
      </Paper>

      {/* Global loading overlay */}
      {stryMutAct_9fa48("4826") ? loading || <Box className="admin-prompts__loading-overlay">
          <CircularProgress />
          <Typography variant="body2" sx={{
          mt: 2
        }}>
            Reloading prompts...
          </Typography>
        </Box> : stryMutAct_9fa48("4825") ? false : stryMutAct_9fa48("4824") ? true : (stryCov_9fa48("4824", "4825", "4826"), loading && <Box className="admin-prompts__loading-overlay">
          <CircularProgress />
          <Typography variant="body2" sx={stryMutAct_9fa48("4827") ? {} : (stryCov_9fa48("4827"), {
          mt: 2
        })}>
            Reloading prompts...
          </Typography>
        </Box>)}

      {/* Notification snackbar */}
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={closeNotification} anchorOrigin={stryMutAct_9fa48("4828") ? {} : (stryCov_9fa48("4828"), {
        vertical: stryMutAct_9fa48("4829") ? "" : (stryCov_9fa48("4829"), 'top'),
        horizontal: stryMutAct_9fa48("4830") ? "" : (stryCov_9fa48("4830"), 'right')
      })}>
        <Alert onClose={closeNotification} severity={notification.severity} sx={stryMutAct_9fa48("4831") ? {} : (stryCov_9fa48("4831"), {
          width: stryMutAct_9fa48("4832") ? "" : (stryCov_9fa48("4832"), '100%')
        })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>;
  }
};
export default AdminPrompts;