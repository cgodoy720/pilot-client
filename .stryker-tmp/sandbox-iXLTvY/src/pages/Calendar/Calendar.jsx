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
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import './Calendar.css';
import { useAuth } from '../../context/AuthContext';
function Calendar() {
  if (stryMutAct_9fa48("17357")) {
    {}
  } else {
    stryCov_9fa48("17357");
    const [events, setEvents] = useState(stryMutAct_9fa48("17358") ? ["Stryker was here"] : (stryCov_9fa48("17358"), []));
    const [isLoading, setIsLoading] = useState(stryMutAct_9fa48("17359") ? false : (stryCov_9fa48("17359"), true));
    const [error, setError] = useState(null);
    const {
      token,
      user
    } = useAuth();
    const navigate = useNavigate();
    const [cohortFilter, setCohortFilter] = useState(null);
    useEffect(() => {
      if (stryMutAct_9fa48("17360")) {
        {}
      } else {
        stryCov_9fa48("17360");
        const fetchCurriculumDays = async () => {
          if (stryMutAct_9fa48("17361")) {
            {}
          } else {
            stryCov_9fa48("17361");
            try {
              if (stryMutAct_9fa48("17362")) {
                {}
              } else {
                stryCov_9fa48("17362");
                setIsLoading(stryMutAct_9fa48("17363") ? false : (stryCov_9fa48("17363"), true));
                setError(null);
                let url = stryMutAct_9fa48("17364") ? `` : (stryCov_9fa48("17364"), `${import.meta.env.VITE_API_URL}/api/curriculum/days`);
                if (stryMutAct_9fa48("17367") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("17366") ? false : stryMutAct_9fa48("17365") ? true : (stryCov_9fa48("17365", "17366", "17367"), (stryMutAct_9fa48("17369") ? user.role !== 'staff' : stryMutAct_9fa48("17368") ? false : (stryCov_9fa48("17368", "17369"), user.role === (stryMutAct_9fa48("17370") ? "" : (stryCov_9fa48("17370"), 'staff')))) || (stryMutAct_9fa48("17372") ? user.role !== 'admin' : stryMutAct_9fa48("17371") ? false : (stryCov_9fa48("17371", "17372"), user.role === (stryMutAct_9fa48("17373") ? "" : (stryCov_9fa48("17373"), 'admin')))))) {
                  if (stryMutAct_9fa48("17374")) {
                    {}
                  } else {
                    stryCov_9fa48("17374");
                    if (stryMutAct_9fa48("17376") ? false : stryMutAct_9fa48("17375") ? true : (stryCov_9fa48("17375", "17376"), cohortFilter)) {
                      if (stryMutAct_9fa48("17377")) {
                        {}
                      } else {
                        stryCov_9fa48("17377");
                        url += stryMutAct_9fa48("17378") ? `` : (stryCov_9fa48("17378"), `?cohort=${cohortFilter}`);
                      }
                    }
                  }
                }
                const response = await fetch(url, stryMutAct_9fa48("17379") ? {} : (stryCov_9fa48("17379"), {
                  headers: stryMutAct_9fa48("17380") ? {} : (stryCov_9fa48("17380"), {
                    'Authorization': stryMutAct_9fa48("17381") ? `` : (stryCov_9fa48("17381"), `Bearer ${token}`)
                  })
                }));
                if (stryMutAct_9fa48("17384") ? false : stryMutAct_9fa48("17383") ? true : stryMutAct_9fa48("17382") ? response.ok : (stryCov_9fa48("17382", "17383", "17384"), !response.ok)) {
                  if (stryMutAct_9fa48("17385")) {
                    {}
                  } else {
                    stryCov_9fa48("17385");
                    throw new Error(stryMutAct_9fa48("17386") ? "" : (stryCov_9fa48("17386"), 'Failed to fetch curriculum days'));
                  }
                }
                const data = await response.json();

                // Convert curriculum days to FullCalendar events
                const calendarEvents = data.map(day => {
                  if (stryMutAct_9fa48("17387")) {
                    {}
                  } else {
                    stryCov_9fa48("17387");
                    console.log(stryMutAct_9fa48("17388") ? "" : (stryCov_9fa48("17388"), 'Day data from API:'), day); // Log the individual day data

                    // Create a date string without time portion to avoid timezone issues
                    // This ensures the date is displayed exactly as stored in the database
                    const dayDate = day.day_date.split(stryMutAct_9fa48("17389") ? "" : (stryCov_9fa48("17389"), 'T'))[0]; // Extract just the YYYY-MM-DD part

                    return stryMutAct_9fa48("17390") ? {} : (stryCov_9fa48("17390"), {
                      id: day.id,
                      // Use id which matches the database column name
                      title: stryMutAct_9fa48("17391") ? `` : (stryCov_9fa48("17391"), `Day ${day.day_number}: ${day.daily_goal}`),
                      date: dayDate,
                      // Use just the date portion without time
                      allDay: stryMutAct_9fa48("17392") ? false : (stryCov_9fa48("17392"), true),
                      extendedProps: stryMutAct_9fa48("17393") ? {} : (stryCov_9fa48("17393"), {
                        dayNumber: day.day_number,
                        dayType: day.day_type,
                        resource: day // Store the full day object
                      })
                    });
                  }
                });
                console.log(stryMutAct_9fa48("17394") ? "" : (stryCov_9fa48("17394"), 'Calendar events data:'), calendarEvents);
                setEvents(calendarEvents);
              }
            } catch (error) {
              if (stryMutAct_9fa48("17395")) {
                {}
              } else {
                stryCov_9fa48("17395");
                console.error(stryMutAct_9fa48("17396") ? "" : (stryCov_9fa48("17396"), 'Error fetching curriculum days:'), error);
                setError(stryMutAct_9fa48("17397") ? "" : (stryCov_9fa48("17397"), 'Failed to load curriculum days. Please try again later.'));
              }
            } finally {
              if (stryMutAct_9fa48("17398")) {
                {}
              } else {
                stryCov_9fa48("17398");
                setIsLoading(stryMutAct_9fa48("17399") ? true : (stryCov_9fa48("17399"), false));
              }
            }
          }
        };
        fetchCurriculumDays();
      }
    }, stryMutAct_9fa48("17400") ? [] : (stryCov_9fa48("17400"), [token, cohortFilter]));
    const handleEventClick = clickInfo => {
      if (stryMutAct_9fa48("17401")) {
        {}
      } else {
        stryCov_9fa48("17401");
        console.log(stryMutAct_9fa48("17402") ? "" : (stryCov_9fa48("17402"), 'Event clicked:'), clickInfo.event);
        console.log(stryMutAct_9fa48("17403") ? "" : (stryCov_9fa48("17403"), 'Event ID:'), clickInfo.event.id);
        console.log(stryMutAct_9fa48("17404") ? "" : (stryCov_9fa48("17404"), 'Event extendedProps:'), clickInfo.event.extendedProps);
        const dayNumber = clickInfo.event.extendedProps.dayNumber;

        // Fix: Create date strings using local timezone instead of UTC
        const today = new Date();
        // Format using YYYY-MM-DD with local timezone
        const todayString = today.getFullYear() + (stryMutAct_9fa48("17405") ? "" : (stryCov_9fa48("17405"), '-')) + String(stryMutAct_9fa48("17406") ? today.getMonth() - 1 : (stryCov_9fa48("17406"), today.getMonth() + 1)).padStart(2, stryMutAct_9fa48("17407") ? "" : (stryCov_9fa48("17407"), '0')) + (stryMutAct_9fa48("17408") ? "" : (stryCov_9fa48("17408"), '-')) + String(today.getDate()).padStart(2, stryMutAct_9fa48("17409") ? "" : (stryCov_9fa48("17409"), '0'));
        const clickedDateString = clickInfo.event.startStr; // Already in YYYY-MM-DD format

        console.log(stryMutAct_9fa48("17410") ? "" : (stryCov_9fa48("17410"), 'Today (local):'), todayString, stryMutAct_9fa48("17411") ? "" : (stryCov_9fa48("17411"), 'Clicked:'), clickedDateString);

        // For staff/admin users, pass the selected cohort
        let url;
        if (stryMutAct_9fa48("17414") ? clickedDateString !== todayString : stryMutAct_9fa48("17413") ? false : stryMutAct_9fa48("17412") ? true : (stryCov_9fa48("17412", "17413", "17414"), clickedDateString === todayString)) {
          if (stryMutAct_9fa48("17415")) {
            {}
          } else {
            stryCov_9fa48("17415");
            // Today - navigate to Learning page
            url = stryMutAct_9fa48("17416") ? `` : (stryCov_9fa48("17416"), `/learning?dayNumber=${dayNumber}`);
          }
        } else {
          if (stryMutAct_9fa48("17417")) {
            {}
          } else {
            stryCov_9fa48("17417");
            // Past or future day - navigate to PastSession page
            url = stryMutAct_9fa48("17418") ? `` : (stryCov_9fa48("17418"), `/past-session?dayNumber=${dayNumber}`);
          }
        }

        // If staff/admin user has selected a cohort, add it to the URL
        if (stryMutAct_9fa48("17421") ? cohortFilter || user.role === 'staff' || user.role === 'admin' : stryMutAct_9fa48("17420") ? false : stryMutAct_9fa48("17419") ? true : (stryCov_9fa48("17419", "17420", "17421"), cohortFilter && (stryMutAct_9fa48("17423") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("17422") ? true : (stryCov_9fa48("17422", "17423"), (stryMutAct_9fa48("17425") ? user.role !== 'staff' : stryMutAct_9fa48("17424") ? false : (stryCov_9fa48("17424", "17425"), user.role === (stryMutAct_9fa48("17426") ? "" : (stryCov_9fa48("17426"), 'staff')))) || (stryMutAct_9fa48("17428") ? user.role !== 'admin' : stryMutAct_9fa48("17427") ? false : (stryCov_9fa48("17427", "17428"), user.role === (stryMutAct_9fa48("17429") ? "" : (stryCov_9fa48("17429"), 'admin')))))))) {
          if (stryMutAct_9fa48("17430")) {
            {}
          } else {
            stryCov_9fa48("17430");
            url += stryMutAct_9fa48("17431") ? `` : (stryCov_9fa48("17431"), `&cohort=${encodeURIComponent(cohortFilter)}`);
          }
        }
        console.log(stryMutAct_9fa48("17432") ? "" : (stryCov_9fa48("17432"), 'Navigating to URL:'), url);
        navigate(url);
      }
    };
    if (stryMutAct_9fa48("17434") ? false : stryMutAct_9fa48("17433") ? true : (stryCov_9fa48("17433", "17434"), isLoading)) {
      if (stryMutAct_9fa48("17435")) {
        {}
      } else {
        stryCov_9fa48("17435");
        return <div className="calendar">
        <div className="calendar__content">
          <div className="loading-message">Loading calendar data...</div>
        </div>
      </div>;
      }
    }
    if (stryMutAct_9fa48("17437") ? false : stryMutAct_9fa48("17436") ? true : (stryCov_9fa48("17436", "17437"), error)) {
      if (stryMutAct_9fa48("17438")) {
        {}
      } else {
        stryCov_9fa48("17438");
        return <div className="calendar">
        <div className="calendar__content">
          <div className="error-message">{error}</div>
        </div>
      </div>;
      }
    }
    return <div className="calendar">
      <div className="calendar__content">
        <div className="calendar-container">
          <div className="calendar-view">
            <div className="calendar__toolbar">
              <FullCalendar plugins={stryMutAct_9fa48("17439") ? [] : (stryCov_9fa48("17439"), [dayGridPlugin])} initialView="dayGridMonth" headerToolbar={stryMutAct_9fa48("17440") ? {} : (stryCov_9fa48("17440"), {
                left: stryMutAct_9fa48("17441") ? "" : (stryCov_9fa48("17441"), 'prev,next today'),
                center: stryMutAct_9fa48("17442") ? "" : (stryCov_9fa48("17442"), 'title'),
                right: stryMutAct_9fa48("17443") ? "Stryker was here!" : (stryCov_9fa48("17443"), '')
              })} events={events} eventClick={handleEventClick} eventDidMount={info => {
                if (stryMutAct_9fa48("17444")) {
                  {}
                } else {
                  stryCov_9fa48("17444");
                  // Add tooltip
                  info.el.title = stryMutAct_9fa48("17445") ? `` : (stryCov_9fa48("17445"), `${info.event.title}\nClick to view tasks`);
                }
              }} height="calc(100vh - 120px)" />
              
              {/* Render cohort selector in the toolbar space for staff/admin */}
              {stryMutAct_9fa48("17448") ? user.role === 'staff' || user.role === 'admin' || <div className="calendar__cohort-filter">
                  <label>Cohort:</label>
                  <select value={cohortFilter || ''} onChange={e => setCohortFilter(e.target.value || null)}>
                    <option value="">My Cohort</option>
                    <option value="March 2025">March 2025</option>
                    <option value="June 2025">June 2025</option>
                    <option value="September 2025">September 2025</option>
                    {/* Add more cohorts as needed */}
                  </select>
                </div> : stryMutAct_9fa48("17447") ? false : stryMutAct_9fa48("17446") ? true : (stryCov_9fa48("17446", "17447", "17448"), (stryMutAct_9fa48("17450") ? user.role === 'staff' && user.role === 'admin' : stryMutAct_9fa48("17449") ? true : (stryCov_9fa48("17449", "17450"), (stryMutAct_9fa48("17452") ? user.role !== 'staff' : stryMutAct_9fa48("17451") ? false : (stryCov_9fa48("17451", "17452"), user.role === (stryMutAct_9fa48("17453") ? "" : (stryCov_9fa48("17453"), 'staff')))) || (stryMutAct_9fa48("17455") ? user.role !== 'admin' : stryMutAct_9fa48("17454") ? false : (stryCov_9fa48("17454", "17455"), user.role === (stryMutAct_9fa48("17456") ? "" : (stryCov_9fa48("17456"), 'admin')))))) && <div className="calendar__cohort-filter">
                  <label>Cohort:</label>
                  <select value={stryMutAct_9fa48("17459") ? cohortFilter && '' : stryMutAct_9fa48("17458") ? false : stryMutAct_9fa48("17457") ? true : (stryCov_9fa48("17457", "17458", "17459"), cohortFilter || (stryMutAct_9fa48("17460") ? "Stryker was here!" : (stryCov_9fa48("17460"), '')))} onChange={stryMutAct_9fa48("17461") ? () => undefined : (stryCov_9fa48("17461"), e => setCohortFilter(stryMutAct_9fa48("17464") ? e.target.value && null : stryMutAct_9fa48("17463") ? false : stryMutAct_9fa48("17462") ? true : (stryCov_9fa48("17462", "17463", "17464"), e.target.value || null)))}>
                    <option value="">My Cohort</option>
                    <option value="March 2025">March 2025</option>
                    <option value="June 2025">June 2025</option>
                    <option value="September 2025">September 2025</option>
                    {/* Add more cohorts as needed */}
                  </select>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}
export default Calendar;