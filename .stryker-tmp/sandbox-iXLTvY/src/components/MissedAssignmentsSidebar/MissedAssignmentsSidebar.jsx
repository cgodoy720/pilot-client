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
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import './MissedAssignmentsSidebar.css';
const MissedAssignmentsSidebar = ({
  isOpen,
  onClose,
  onNavigateToDay
}) => {
  if (stryMutAct_9fa48("2012")) {
    {}
  } else {
    stryCov_9fa48("2012");
    const [missedAssignments, setMissedAssignments] = useState(stryMutAct_9fa48("2013") ? ["Stryker was here"] : (stryCov_9fa48("2013"), []));
    const [loading, setLoading] = useState(stryMutAct_9fa48("2014") ? true : (stryCov_9fa48("2014"), false));
    useEffect(() => {
      if (stryMutAct_9fa48("2015")) {
        {}
      } else {
        stryCov_9fa48("2015");
        if (stryMutAct_9fa48("2017") ? false : stryMutAct_9fa48("2016") ? true : (stryCov_9fa48("2016", "2017"), isOpen)) {
          if (stryMutAct_9fa48("2018")) {
            {}
          } else {
            stryCov_9fa48("2018");
            fetchMissedAssignments();
          }
        }
      }
    }, stryMutAct_9fa48("2019") ? [] : (stryCov_9fa48("2019"), [isOpen]));
    const fetchMissedAssignments = async () => {
      if (stryMutAct_9fa48("2020")) {
        {}
      } else {
        stryCov_9fa48("2020");
        setLoading(stryMutAct_9fa48("2021") ? false : (stryCov_9fa48("2021"), true));
        try {
          if (stryMutAct_9fa48("2022")) {
            {}
          } else {
            stryCov_9fa48("2022");
            const token = localStorage.getItem(stryMutAct_9fa48("2023") ? "" : (stryCov_9fa48("2023"), 'token'));
            const response = await fetch(stryMutAct_9fa48("2024") ? `` : (stryCov_9fa48("2024"), `${import.meta.env.VITE_API_URL}/api/progress/missed-assignments-list`), stryMutAct_9fa48("2025") ? {} : (stryCov_9fa48("2025"), {
              headers: stryMutAct_9fa48("2026") ? {} : (stryCov_9fa48("2026"), {
                'Authorization': stryMutAct_9fa48("2027") ? `` : (stryCov_9fa48("2027"), `Bearer ${token}`)
              })
            }));
            if (stryMutAct_9fa48("2029") ? false : stryMutAct_9fa48("2028") ? true : (stryCov_9fa48("2028", "2029"), response.ok)) {
              if (stryMutAct_9fa48("2030")) {
                {}
              } else {
                stryCov_9fa48("2030");
                const data = await response.json();
                setMissedAssignments(data);
              }
            } else {
              if (stryMutAct_9fa48("2031")) {
                {}
              } else {
                stryCov_9fa48("2031");
                console.error(stryMutAct_9fa48("2032") ? "" : (stryCov_9fa48("2032"), 'Failed to fetch missed assignments'));
              }
            }
          }
        } catch (error) {
          if (stryMutAct_9fa48("2033")) {
            {}
          } else {
            stryCov_9fa48("2033");
            console.error(stryMutAct_9fa48("2034") ? "" : (stryCov_9fa48("2034"), 'Error fetching missed assignments:'), error);
          }
        } finally {
          if (stryMutAct_9fa48("2035")) {
            {}
          } else {
            stryCov_9fa48("2035");
            setLoading(stryMutAct_9fa48("2036") ? true : (stryCov_9fa48("2036"), false));
          }
        }
      }
    };
    const formatDate = dateString => {
      if (stryMutAct_9fa48("2037")) {
        {}
      } else {
        stryCov_9fa48("2037");
        const date = new Date(dateString);
        const month = String(stryMutAct_9fa48("2038") ? date.getMonth() - 1 : (stryCov_9fa48("2038"), date.getMonth() + 1)).padStart(2, stryMutAct_9fa48("2039") ? "" : (stryCov_9fa48("2039"), '0'));
        const day = String(date.getDate()).padStart(2, stryMutAct_9fa48("2040") ? "" : (stryCov_9fa48("2040"), '0'));
        const year = stryMutAct_9fa48("2041") ? String(date.getFullYear()) : (stryCov_9fa48("2041"), String(date.getFullYear()).slice(stryMutAct_9fa48("2042") ? +2 : (stryCov_9fa48("2042"), -2)));
        return stryMutAct_9fa48("2043") ? `` : (stryCov_9fa48("2043"), `${month}.${day}.${year}`);
      }
    };
    const handleGoClick = assignment => {
      if (stryMutAct_9fa48("2044")) {
        {}
      } else {
        stryCov_9fa48("2044");
        onNavigateToDay(assignment.day_id, assignment.task_id);
        onClose();
      }
    };
    return <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="missed-assignments-sidebar">
        <div className="missed-assignments-sidebar__header">
          <div className="missed-assignments-sidebar__title-wrapper">
            <button onClick={onClose} className="missed-assignments-sidebar__close-btn">
              <X className="missed-assignments-sidebar__icon" />
            </button>
            <span className="missed-assignments-sidebar__title">
              ( {missedAssignments.length} ) missed assignments
            </span>
          </div>
        </div>

        <div className="missed-assignments-sidebar__content">
          <h2 className="missed-assignments-sidebar__subtitle">Let's keep going!</h2>

          {loading ? <div className="missed-assignments-sidebar__loading">Loading...</div> : (stryMutAct_9fa48("2047") ? missedAssignments.length !== 0 : stryMutAct_9fa48("2046") ? false : stryMutAct_9fa48("2045") ? true : (stryCov_9fa48("2045", "2046", "2047"), missedAssignments.length === 0)) ? <div className="missed-assignments-sidebar__empty">
              No missed assignments! Great work! 🎉
            </div> : <div className="missed-assignments-sidebar__list">
              {missedAssignments.map(stryMutAct_9fa48("2048") ? () => undefined : (stryCov_9fa48("2048"), (assignment, index) => <div key={stryMutAct_9fa48("2049") ? `` : (stryCov_9fa48("2049"), `${assignment.task_id}-${index}`)} className="missed-assignments-sidebar__item">
                  <div className="missed-assignments-sidebar__item-content">
                    <div className="missed-assignments-sidebar__date">
                      {formatDate(assignment.day_date)}
                    </div>
                    <div className="missed-assignments-sidebar__task-title">
                      {assignment.task_title}
                    </div>
                  </div>
                  <button className="missed-assignments-sidebar__go-btn" onClick={stryMutAct_9fa48("2050") ? () => undefined : (stryCov_9fa48("2050"), () => handleGoClick(assignment))}>
                    Go
                  </button>
                </div>))}
            </div>}
        </div>
      </SheetContent>
    </Sheet>;
  }
};
export default MissedAssignmentsSidebar;