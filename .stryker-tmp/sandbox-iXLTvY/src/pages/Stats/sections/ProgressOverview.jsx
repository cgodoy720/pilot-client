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
import React from 'react';
import { Grid, Card, CardContent, Typography, Box, LinearProgress } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SendIcon from '@mui/icons-material/Send';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
const ProgressOverview = ({
  stats
}) => {
  if (stryMutAct_9fa48("26864")) {
    {}
  } else {
    stryCov_9fa48("26864");
    const {
      tasks,
      submissions,
      feedback,
      promptCount,
      deliverables
    } = stats;

    // Calculate completion percentages
    const deliverableCompletionPercentage = (stryMutAct_9fa48("26867") ? deliverables || deliverables.total > 0 : stryMutAct_9fa48("26866") ? false : stryMutAct_9fa48("26865") ? true : (stryCov_9fa48("26865", "26866", "26867"), deliverables && (stryMutAct_9fa48("26870") ? deliverables.total <= 0 : stryMutAct_9fa48("26869") ? deliverables.total >= 0 : stryMutAct_9fa48("26868") ? true : (stryCov_9fa48("26868", "26869", "26870"), deliverables.total > 0)))) ? stryMutAct_9fa48("26871") ? deliverables.submitted / deliverables.total / 100 : (stryCov_9fa48("26871"), (stryMutAct_9fa48("26872") ? deliverables.submitted * deliverables.total : (stryCov_9fa48("26872"), deliverables.submitted / deliverables.total)) * 100) : 0;
    return <Grid container spacing={2}>
      {/* Prompts Sent Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card className="progress-card" sx={stryMutAct_9fa48("26873") ? {} : (stryCov_9fa48("26873"), {
          backgroundColor: stryMutAct_9fa48("26874") ? "" : (stryCov_9fa48("26874"), '#171c28'),
          borderRadius: 2
        })}>
          <CardContent>
            {/* Title with icon on left */}
            <Box display="flex" alignItems="center" mb={1}>
              <SendIcon fontSize="small" sx={stryMutAct_9fa48("26875") ? {} : (stryCov_9fa48("26875"), {
                color: stryMutAct_9fa48("26876") ? "" : (stryCov_9fa48("26876"), 'var(--color-primary)'),
                mr: 1,
                opacity: 0.8
              })} />
              <Typography className="progress-card__title" variant="subtitle2" sx={stryMutAct_9fa48("26877") ? {} : (stryCov_9fa48("26877"), {
                color: stryMutAct_9fa48("26878") ? "" : (stryCov_9fa48("26878"), 'var(--color-text-secondary)')
              })}>
                Prompts Sent
              </Typography>
            </Box>
            
            {/* Value aligned left */}
            <Typography className="progress-card__value" variant="h4" sx={stryMutAct_9fa48("26879") ? {} : (stryCov_9fa48("26879"), {
              textAlign: stryMutAct_9fa48("26880") ? "" : (stryCov_9fa48("26880"), 'left'),
              fontFamily: stryMutAct_9fa48("26881") ? "" : (stryCov_9fa48("26881"), 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'),
              fontWeight: 600,
              mb: 1
            })}>
              {stryMutAct_9fa48("26884") ? promptCount && 0 : stryMutAct_9fa48("26883") ? false : stryMutAct_9fa48("26882") ? true : (stryCov_9fa48("26882", "26883", "26884"), promptCount || 0)}
            </Typography>
            
            <Box mt={1}>
              <Typography variant="caption" className="progress-card__subtitle" sx={stryMutAct_9fa48("26885") ? {} : (stryCov_9fa48("26885"), {
                display: stryMutAct_9fa48("26886") ? "" : (stryCov_9fa48("26886"), 'block'),
                color: stryMutAct_9fa48("26887") ? "" : (stryCov_9fa48("26887"), 'var(--color-text-secondary)'),
                textAlign: stryMutAct_9fa48("26888") ? "" : (stryCov_9fa48("26888"), 'left')
              })}>
                User messages sent
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Feedback Received Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card className="progress-card" sx={stryMutAct_9fa48("26889") ? {} : (stryCov_9fa48("26889"), {
          backgroundColor: stryMutAct_9fa48("26890") ? "" : (stryCov_9fa48("26890"), '#171c28'),
          borderRadius: 2
        })}>
          <CardContent>
            {/* Title with icon on left */}
            <Box display="flex" alignItems="center" mb={1}>
              <RateReviewIcon fontSize="small" sx={stryMutAct_9fa48("26891") ? {} : (stryCov_9fa48("26891"), {
                color: stryMutAct_9fa48("26892") ? "" : (stryCov_9fa48("26892"), 'var(--color-primary)'),
                mr: 1,
                opacity: 0.8
              })} />
              <Typography className="progress-card__title" variant="subtitle2" sx={stryMutAct_9fa48("26893") ? {} : (stryCov_9fa48("26893"), {
                color: stryMutAct_9fa48("26894") ? "" : (stryCov_9fa48("26894"), 'var(--color-text-secondary)')
              })}>
                Feedback Received
              </Typography>
            </Box>
            
            {/* Value aligned left */}
            <Typography className="progress-card__value" variant="h4" sx={stryMutAct_9fa48("26895") ? {} : (stryCov_9fa48("26895"), {
              textAlign: stryMutAct_9fa48("26896") ? "" : (stryCov_9fa48("26896"), 'left'),
              fontFamily: stryMutAct_9fa48("26897") ? "" : (stryCov_9fa48("26897"), 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'),
              fontWeight: 600,
              mb: 1
            })}>
              {stryMutAct_9fa48("26900") ? feedback?.peerFeedback?.length && 0 : stryMutAct_9fa48("26899") ? false : stryMutAct_9fa48("26898") ? true : (stryCov_9fa48("26898", "26899", "26900"), (stryMutAct_9fa48("26902") ? feedback.peerFeedback?.length : stryMutAct_9fa48("26901") ? feedback?.peerFeedback.length : (stryCov_9fa48("26901", "26902"), feedback?.peerFeedback?.length)) || 0)}
            </Typography>
            
            <Box mt={1}>
              <Typography variant="caption" className="progress-card__subtitle" sx={stryMutAct_9fa48("26903") ? {} : (stryCov_9fa48("26903"), {
                display: stryMutAct_9fa48("26904") ? "" : (stryCov_9fa48("26904"), 'block'),
                color: stryMutAct_9fa48("26905") ? "" : (stryCov_9fa48("26905"), 'var(--color-text-secondary)'),
                textAlign: stryMutAct_9fa48("26906") ? "" : (stryCov_9fa48("26906"), 'left')
              })}>
                Peer feedback entries
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Deliverables Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card className="progress-card" sx={stryMutAct_9fa48("26907") ? {} : (stryCov_9fa48("26907"), {
          backgroundColor: stryMutAct_9fa48("26908") ? "" : (stryCov_9fa48("26908"), '#171c28'),
          borderRadius: 2
        })}>
          <CardContent>
            {/* Title with icon on left */}
            <Box display="flex" alignItems="center" mb={1}>
              <AssignmentTurnedInIcon fontSize="small" sx={stryMutAct_9fa48("26909") ? {} : (stryCov_9fa48("26909"), {
                color: stryMutAct_9fa48("26910") ? "" : (stryCov_9fa48("26910"), 'var(--color-primary)'),
                mr: 1,
                opacity: 0.8
              })} />
              <Typography className="progress-card__title" variant="subtitle2" sx={stryMutAct_9fa48("26911") ? {} : (stryCov_9fa48("26911"), {
                color: stryMutAct_9fa48("26912") ? "" : (stryCov_9fa48("26912"), 'var(--color-text-secondary)')
              })}>
                Deliverables Submitted
              </Typography>
            </Box>
            
            {/* Value aligned left */}
            <Typography className="progress-card__value" variant="h4" sx={stryMutAct_9fa48("26913") ? {} : (stryCov_9fa48("26913"), {
              textAlign: stryMutAct_9fa48("26914") ? "" : (stryCov_9fa48("26914"), 'left'),
              fontFamily: stryMutAct_9fa48("26915") ? "" : (stryCov_9fa48("26915"), 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'),
              fontWeight: 600,
              mb: 1
            })}>
              {deliverables ? stryMutAct_9fa48("26916") ? `` : (stryCov_9fa48("26916"), `${deliverables.submitted}/${deliverables.total}`) : stryMutAct_9fa48("26917") ? "" : (stryCov_9fa48("26917"), '0/0')}
            </Typography>
            
            <Box mt={1}>
              <LinearProgress variant="determinate" value={deliverableCompletionPercentage} sx={stryMutAct_9fa48("26918") ? {} : (stryCov_9fa48("26918"), {
                height: 6,
                borderRadius: 3,
                backgroundColor: stryMutAct_9fa48("26919") ? "" : (stryCov_9fa48("26919"), 'rgba(255, 255, 255, 0.1)')
              })} />
              <Typography variant="caption" className="progress-card__subtitle" align="right" sx={stryMutAct_9fa48("26920") ? {} : (stryCov_9fa48("26920"), {
                display: stryMutAct_9fa48("26921") ? "" : (stryCov_9fa48("26921"), 'block'),
                mt: 0.5
              })}>
                {deliverableCompletionPercentage.toFixed(0)}% Submitted
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>;
  }
};
export default ProgressOverview;