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
import { Box, Typography, Button, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
const StatusTab = ({
  showNotification,
  reloadPrompts
}) => {
  if (stryMutAct_9fa48("5830")) {
    {}
  } else {
    stryCov_9fa48("5830");
    const [currentPrompt, setCurrentPrompt] = useState(null);
    const [loading, setLoading] = useState(stryMutAct_9fa48("5831") ? false : (stryCov_9fa48("5831"), true));
    useEffect(() => {
      if (stryMutAct_9fa48("5832")) {
        {}
      } else {
        stryCov_9fa48("5832");
        fetchCurrentPrompt();
      }
    }, stryMutAct_9fa48("5833") ? ["Stryker was here"] : (stryCov_9fa48("5833"), []));
    const fetchCurrentPrompt = async () => {
      if (stryMutAct_9fa48("5834")) {
        {}
      } else {
        stryCov_9fa48("5834");
        try {
          if (stryMutAct_9fa48("5835")) {
            {}
          } else {
            stryCov_9fa48("5835");
            setLoading(stryMutAct_9fa48("5836") ? false : (stryCov_9fa48("5836"), true));
            const token = localStorage.getItem(stryMutAct_9fa48("5837") ? "" : (stryCov_9fa48("5837"), 'token'));
            const response = await fetch(stryMutAct_9fa48("5838") ? `` : (stryCov_9fa48("5838"), `${import.meta.env.VITE_API_URL}/api/admin/prompts/current-system-prompt`), stryMutAct_9fa48("5839") ? {} : (stryCov_9fa48("5839"), {
              headers: stryMutAct_9fa48("5840") ? {} : (stryCov_9fa48("5840"), {
                'Authorization': stryMutAct_9fa48("5841") ? `` : (stryCov_9fa48("5841"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("5843") ? false : stryMutAct_9fa48("5842") ? true : (stryCov_9fa48("5842", "5843"), response.ok)) {
              if (stryMutAct_9fa48("5844")) {
                {}
              } else {
                stryCov_9fa48("5844");
                const data = await response.json();
                setCurrentPrompt(data);
              }
            } else {
              if (stryMutAct_9fa48("5845")) {
                {}
              } else {
                stryCov_9fa48("5845");
                throw new Error(stryMutAct_9fa48("5846") ? "" : (stryCov_9fa48("5846"), 'Failed to fetch current system prompt'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("5847")) {
            {}
          } else {
            stryCov_9fa48("5847");
            console.error(stryMutAct_9fa48("5848") ? "" : (stryCov_9fa48("5848"), 'Error fetching current prompt:'), error);
            showNotification(stryMutAct_9fa48("5849") ? "" : (stryCov_9fa48("5849"), 'Failed to load current system prompt'), stryMutAct_9fa48("5850") ? "" : (stryCov_9fa48("5850"), 'error'));
          }
        } finally {
          if (stryMutAct_9fa48("5851")) {
            {}
          } else {
            stryCov_9fa48("5851");
            setLoading(stryMutAct_9fa48("5852") ? true : (stryCov_9fa48("5852"), false));
          }
        }
      }
    };
    const handleReload = async () => {
      if (stryMutAct_9fa48("5853")) {
        {}
      } else {
        stryCov_9fa48("5853");
        await reloadPrompts();
        await fetchCurrentPrompt();
      }
    };
    if (stryMutAct_9fa48("5855") ? false : stryMutAct_9fa48("5854") ? true : (stryCov_9fa48("5854", "5855"), loading)) {
      if (stryMutAct_9fa48("5856")) {
        {}
      } else {
        stryCov_9fa48("5856");
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>;
      }
    }
    if (stryMutAct_9fa48("5859") ? false : stryMutAct_9fa48("5858") ? true : stryMutAct_9fa48("5857") ? currentPrompt : (stryCov_9fa48("5857", "5858", "5859"), !currentPrompt)) {
      if (stryMutAct_9fa48("5860")) {
        {}
      } else {
        stryCov_9fa48("5860");
        return <Alert severity="error">
        Failed to load current system prompt. Please try refreshing the page.
      </Alert>;
      }
    }
    return <div className="prompt-tab">
      <div className="prompt-tab__header">
        <div>
          <Typography variant="h5" gutterBottom sx={stryMutAct_9fa48("5861") ? {} : (stryCov_9fa48("5861"), {
            color: stryMutAct_9fa48("5862") ? "" : (stryCov_9fa48("5862"), 'var(--color-text-primary)')
          })}>
            Current AI System Prompt
          </Typography>
          <Typography variant="body2" sx={stryMutAct_9fa48("5863") ? {} : (stryCov_9fa48("5863"), {
            color: stryMutAct_9fa48("5864") ? "" : (stryCov_9fa48("5864"), 'var(--color-text-secondary)')
          })}>
            This is the complete assembled prompt that gets sent to the AI API for a sample task.
          </Typography>
        </div>
        <div className="prompt-tab__actions">
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReload}>
            Reload & Refresh
          </Button>
        </div>
      </div>

      <Card sx={stryMutAct_9fa48("5865") ? {} : (stryCov_9fa48("5865"), {
        mt: 2,
        backgroundColor: stryMutAct_9fa48("5866") ? "" : (stryCov_9fa48("5866"), 'var(--color-background-darker)')
      })}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={stryMutAct_9fa48("5867") ? {} : (stryCov_9fa48("5867"), {
            color: stryMutAct_9fa48("5868") ? "" : (stryCov_9fa48("5868"), 'var(--color-text-primary)')
          })}>
            Current Assembled System Prompt
          </Typography>
          <Typography variant="body2" sx={stryMutAct_9fa48("5869") ? {} : (stryCov_9fa48("5869"), {
            mb: 2,
            color: stryMutAct_9fa48("5870") ? "" : (stryCov_9fa48("5870"), 'var(--color-text-secondary)')
          })}>
            Generated: {new Date(currentPrompt.assembled_at).toLocaleString()}
          </Typography>
          
          <Box sx={stryMutAct_9fa48("5871") ? {} : (stryCov_9fa48("5871"), {
            backgroundColor: stryMutAct_9fa48("5872") ? "" : (stryCov_9fa48("5872"), '#1A1F2C'),
            color: stryMutAct_9fa48("5873") ? "" : (stryCov_9fa48("5873"), '#fff'),
            padding: 2,
            borderRadius: 1,
            maxHeight: stryMutAct_9fa48("5874") ? "" : (stryCov_9fa48("5874"), '60vh'),
            overflow: stryMutAct_9fa48("5875") ? "" : (stryCov_9fa48("5875"), 'auto'),
            fontFamily: stryMutAct_9fa48("5876") ? "" : (stryCov_9fa48("5876"), 'monospace'),
            fontSize: stryMutAct_9fa48("5877") ? "" : (stryCov_9fa48("5877"), '0.875rem'),
            lineHeight: 1.6,
            whiteSpace: stryMutAct_9fa48("5878") ? "" : (stryCov_9fa48("5878"), 'pre-wrap'),
            textAlign: stryMutAct_9fa48("5879") ? "" : (stryCov_9fa48("5879"), 'left')
          })}>
            {currentPrompt.complete_system_prompt}
          </Box>
        </CardContent>
      </Card>

      <Card sx={stryMutAct_9fa48("5880") ? {} : (stryCov_9fa48("5880"), {
        mt: 2,
        backgroundColor: stryMutAct_9fa48("5881") ? "" : (stryCov_9fa48("5881"), 'var(--color-background-darker)')
      })}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={stryMutAct_9fa48("5882") ? {} : (stryCov_9fa48("5882"), {
            color: stryMutAct_9fa48("5883") ? "" : (stryCov_9fa48("5883"), 'var(--color-text-primary)')
          })}>
            Sample Task Used for Demo
          </Typography>
          <Typography variant="body2" sx={stryMutAct_9fa48("5884") ? {} : (stryCov_9fa48("5884"), {
            mb: 2,
            color: stryMutAct_9fa48("5885") ? "" : (stryCov_9fa48("5885"), 'var(--color-text-secondary)')
          })}>
            This sample task shows how variables are replaced in the prompt.
          </Typography>
          
          <Box sx={stryMutAct_9fa48("5886") ? {} : (stryCov_9fa48("5886"), {
            backgroundColor: stryMutAct_9fa48("5887") ? "" : (stryCov_9fa48("5887"), '#1A1F2C'),
            padding: 2,
            borderRadius: 1,
            fontFamily: stryMutAct_9fa48("5888") ? "" : (stryCov_9fa48("5888"), 'monospace'),
            fontSize: stryMutAct_9fa48("5889") ? "" : (stryCov_9fa48("5889"), '0.875rem'),
            textAlign: stryMutAct_9fa48("5890") ? "" : (stryCov_9fa48("5890"), 'left')
          })}>
            <pre style={stryMutAct_9fa48("5891") ? {} : (stryCov_9fa48("5891"), {
              color: stryMutAct_9fa48("5892") ? "" : (stryCov_9fa48("5892"), '#fff'),
              margin: 0
            })}>{JSON.stringify(currentPrompt.components.sample_task, null, 2)}</pre>
          </Box>
        </CardContent>
      </Card>
    </div>;
  }
};
export default StatusTab;