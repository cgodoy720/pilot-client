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
const ProgramAdmissionPipeline = ({
  programAdmissions = stryMutAct_9fa48("2523") ? ["Stryker was here"] : (stryCov_9fa48("2523"), [])
}) => {
  if (stryMutAct_9fa48("2524")) {
    {}
  } else {
    stryCov_9fa48("2524");
    // Calculate totals and percentages
    const totalApplicants = programAdmissions.reduce(stryMutAct_9fa48("2525") ? () => undefined : (stryCov_9fa48("2525"), (sum, item) => stryMutAct_9fa48("2526") ? sum - item.count : (stryCov_9fa48("2526"), sum + item.count)), 0);
    const getPercentage = count => {
      if (stryMutAct_9fa48("2527")) {
        {}
      } else {
        stryCov_9fa48("2527");
        return (stryMutAct_9fa48("2531") ? totalApplicants <= 0 : stryMutAct_9fa48("2530") ? totalApplicants >= 0 : stryMutAct_9fa48("2529") ? false : stryMutAct_9fa48("2528") ? true : (stryCov_9fa48("2528", "2529", "2530", "2531"), totalApplicants > 0)) ? Math.round(stryMutAct_9fa48("2532") ? count / totalApplicants / 100 : (stryCov_9fa48("2532"), (stryMutAct_9fa48("2533") ? count * totalApplicants : (stryCov_9fa48("2533"), count / totalApplicants)) * 100)) : 0;
      }
    };
    const getStatusColor = status => {
      if (stryMutAct_9fa48("2534")) {
        {}
      } else {
        stryCov_9fa48("2534");
        switch (status) {
          case stryMutAct_9fa48("2536") ? "" : (stryCov_9fa48("2536"), 'pending'):
            if (stryMutAct_9fa48("2535")) {} else {
              stryCov_9fa48("2535");
              return stryMutAct_9fa48("2537") ? "" : (stryCov_9fa48("2537"), '#9ca3af');
            }
          // Gray
          case stryMutAct_9fa48("2539") ? "" : (stryCov_9fa48("2539"), 'accepted'):
            if (stryMutAct_9fa48("2538")) {} else {
              stryCov_9fa48("2538");
              return stryMutAct_9fa48("2540") ? "" : (stryCov_9fa48("2540"), '#22c55e');
            }
          // Green
          case stryMutAct_9fa48("2542") ? "" : (stryCov_9fa48("2542"), 'rejected'):
            if (stryMutAct_9fa48("2541")) {} else {
              stryCov_9fa48("2541");
              return stryMutAct_9fa48("2543") ? "" : (stryCov_9fa48("2543"), '#ef4444');
            }
          // Red
          case stryMutAct_9fa48("2545") ? "" : (stryCov_9fa48("2545"), 'waitlisted'):
            if (stryMutAct_9fa48("2544")) {} else {
              stryCov_9fa48("2544");
              return stryMutAct_9fa48("2546") ? "" : (stryCov_9fa48("2546"), '#fbbf24');
            }
          // Yellow
          case stryMutAct_9fa48("2548") ? "" : (stryCov_9fa48("2548"), 'deferred'):
            if (stryMutAct_9fa48("2547")) {} else {
              stryCov_9fa48("2547");
              return stryMutAct_9fa48("2549") ? "" : (stryCov_9fa48("2549"), '#a855f7');
            }
          // Purple
          default:
            if (stryMutAct_9fa48("2550")) {} else {
              stryCov_9fa48("2550");
              return stryMutAct_9fa48("2551") ? "" : (stryCov_9fa48("2551"), '#9ca3af');
            }
        }
      }
    };
    const getStatusLabel = status => {
      if (stryMutAct_9fa48("2552")) {
        {}
      } else {
        stryCov_9fa48("2552");
        switch (status) {
          case stryMutAct_9fa48("2554") ? "" : (stryCov_9fa48("2554"), 'pending'):
            if (stryMutAct_9fa48("2553")) {} else {
              stryCov_9fa48("2553");
              return stryMutAct_9fa48("2555") ? "" : (stryCov_9fa48("2555"), 'Pending Review');
            }
          case stryMutAct_9fa48("2557") ? "" : (stryCov_9fa48("2557"), 'accepted'):
            if (stryMutAct_9fa48("2556")) {} else {
              stryCov_9fa48("2556");
              return stryMutAct_9fa48("2558") ? "" : (stryCov_9fa48("2558"), 'Accepted');
            }
          case stryMutAct_9fa48("2560") ? "" : (stryCov_9fa48("2560"), 'rejected'):
            if (stryMutAct_9fa48("2559")) {} else {
              stryCov_9fa48("2559");
              return stryMutAct_9fa48("2561") ? "" : (stryCov_9fa48("2561"), 'Rejected');
            }
          case stryMutAct_9fa48("2563") ? "" : (stryCov_9fa48("2563"), 'waitlisted'):
            if (stryMutAct_9fa48("2562")) {} else {
              stryCov_9fa48("2562");
              return stryMutAct_9fa48("2564") ? "" : (stryCov_9fa48("2564"), 'Waitlisted');
            }
          case stryMutAct_9fa48("2566") ? "" : (stryCov_9fa48("2566"), 'deferred'):
            if (stryMutAct_9fa48("2565")) {} else {
              stryCov_9fa48("2565");
              return stryMutAct_9fa48("2567") ? "" : (stryCov_9fa48("2567"), 'Deferred');
            }
          default:
            if (stryMutAct_9fa48("2568")) {} else {
              stryCov_9fa48("2568");
              return status;
            }
        }
      }
    };

    // Sort by status priority
    const sortedAdmissions = stryMutAct_9fa48("2569") ? [...programAdmissions] : (stryCov_9fa48("2569"), (stryMutAct_9fa48("2570") ? [] : (stryCov_9fa48("2570"), [...programAdmissions])).sort((a, b) => {
      if (stryMutAct_9fa48("2571")) {
        {}
      } else {
        stryCov_9fa48("2571");
        const order = stryMutAct_9fa48("2572") ? [] : (stryCov_9fa48("2572"), [stryMutAct_9fa48("2573") ? "" : (stryCov_9fa48("2573"), 'pending'), stryMutAct_9fa48("2574") ? "" : (stryCov_9fa48("2574"), 'accepted'), stryMutAct_9fa48("2575") ? "" : (stryCov_9fa48("2575"), 'waitlisted'), stryMutAct_9fa48("2576") ? "" : (stryCov_9fa48("2576"), 'deferred'), stryMutAct_9fa48("2577") ? "" : (stryCov_9fa48("2577"), 'rejected')]);
        return stryMutAct_9fa48("2578") ? order.indexOf(a.status) + order.indexOf(b.status) : (stryCov_9fa48("2578"), order.indexOf(a.status) - order.indexOf(b.status));
      }
    }));
    return <div className="program-admission-pipeline">
            <div className="program-admission-pipeline__header">
                <h4>Program Admission Pipeline</h4>
                <span className="program-admission-pipeline__total">
                    {totalApplicants} total applicants
                </span>
            </div>
            
            <div className="program-admission-pipeline__items">
                {sortedAdmissions.map(stryMutAct_9fa48("2579") ? () => undefined : (stryCov_9fa48("2579"), item => <div key={item.status} className="program-admission-pipeline__item">
                        <div className="program-admission-pipeline__indicator" style={stryMutAct_9fa48("2580") ? {} : (stryCov_9fa48("2580"), {
            backgroundColor: getStatusColor(item.status)
          })} />
                        <div className="program-admission-pipeline__label">
                            {getStatusLabel(item.status)}
                        </div>
                        <div className="program-admission-pipeline__count">
                            {item.count}
                        </div>
                        <div className="program-admission-pipeline__percentage">
                            ({getPercentage(item.count)}%)
                        </div>
                    </div>))}
            </div>

            {/* Acceptance Rate Summary */}
            {stryMutAct_9fa48("2583") ? totalApplicants > 0 || <div className="program-admission-pipeline__summary">
                    <div className="admission-rate">
                        <span className="admission-rate__label">Acceptance Rate:</span>
                        <span className="admission-rate__value">
                            {(() => {
              const accepted = programAdmissions.find(item => item.status === 'accepted')?.count || 0;
              const reviewed = totalApplicants - (programAdmissions.find(item => item.status === 'pending')?.count || 0);
              return reviewed > 0 ? Math.round(accepted / reviewed * 100) : 0;
            })()}%
                        </span>
                    </div>
                </div> : stryMutAct_9fa48("2582") ? false : stryMutAct_9fa48("2581") ? true : (stryCov_9fa48("2581", "2582", "2583"), (stryMutAct_9fa48("2586") ? totalApplicants <= 0 : stryMutAct_9fa48("2585") ? totalApplicants >= 0 : stryMutAct_9fa48("2584") ? true : (stryCov_9fa48("2584", "2585", "2586"), totalApplicants > 0)) && <div className="program-admission-pipeline__summary">
                    <div className="admission-rate">
                        <span className="admission-rate__label">Acceptance Rate:</span>
                        <span className="admission-rate__value">
                            {(() => {
              if (stryMutAct_9fa48("2587")) {
                {}
              } else {
                stryCov_9fa48("2587");
                const accepted = stryMutAct_9fa48("2590") ? programAdmissions.find(item => item.status === 'accepted')?.count && 0 : stryMutAct_9fa48("2589") ? false : stryMutAct_9fa48("2588") ? true : (stryCov_9fa48("2588", "2589", "2590"), (stryMutAct_9fa48("2591") ? programAdmissions.find(item => item.status === 'accepted').count : (stryCov_9fa48("2591"), programAdmissions.find(stryMutAct_9fa48("2592") ? () => undefined : (stryCov_9fa48("2592"), item => stryMutAct_9fa48("2595") ? item.status !== 'accepted' : stryMutAct_9fa48("2594") ? false : stryMutAct_9fa48("2593") ? true : (stryCov_9fa48("2593", "2594", "2595"), item.status === (stryMutAct_9fa48("2596") ? "" : (stryCov_9fa48("2596"), 'accepted')))))?.count)) || 0);
                const reviewed = stryMutAct_9fa48("2597") ? totalApplicants + (programAdmissions.find(item => item.status === 'pending')?.count || 0) : (stryCov_9fa48("2597"), totalApplicants - (stryMutAct_9fa48("2600") ? programAdmissions.find(item => item.status === 'pending')?.count && 0 : stryMutAct_9fa48("2599") ? false : stryMutAct_9fa48("2598") ? true : (stryCov_9fa48("2598", "2599", "2600"), (stryMutAct_9fa48("2601") ? programAdmissions.find(item => item.status === 'pending').count : (stryCov_9fa48("2601"), programAdmissions.find(stryMutAct_9fa48("2602") ? () => undefined : (stryCov_9fa48("2602"), item => stryMutAct_9fa48("2605") ? item.status !== 'pending' : stryMutAct_9fa48("2604") ? false : stryMutAct_9fa48("2603") ? true : (stryCov_9fa48("2603", "2604", "2605"), item.status === (stryMutAct_9fa48("2606") ? "" : (stryCov_9fa48("2606"), 'pending')))))?.count)) || 0)));
                return (stryMutAct_9fa48("2610") ? reviewed <= 0 : stryMutAct_9fa48("2609") ? reviewed >= 0 : stryMutAct_9fa48("2608") ? false : stryMutAct_9fa48("2607") ? true : (stryCov_9fa48("2607", "2608", "2609", "2610"), reviewed > 0)) ? Math.round(stryMutAct_9fa48("2611") ? accepted / reviewed / 100 : (stryCov_9fa48("2611"), (stryMutAct_9fa48("2612") ? accepted * reviewed : (stryCov_9fa48("2612"), accepted / reviewed)) * 100)) : 0;
              }
            })()}%
                        </span>
                    </div>
                </div>)}
        </div>;
  }
};
export default ProgramAdmissionPipeline;