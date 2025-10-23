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
import './CohortAttendanceCard.css';
const CohortAttendanceCard = ({
  cohortName,
  cohortLevel,
  attendees = stryMutAct_9fa48("1120") ? ["Stryker was here"] : (stryCov_9fa48("1120"), []),
  className = stryMutAct_9fa48("1121") ? "Stryker was here!" : (stryCov_9fa48("1121"), '')
}) => {
  if (stryMutAct_9fa48("1122")) {
    {}
  } else {
    stryCov_9fa48("1122");
    // Get cohort display name
    const getCohortDisplayName = (level, name) => {
      if (stryMutAct_9fa48("1123")) {
        {}
      } else {
        stryCov_9fa48("1123");
        return stryMutAct_9fa48("1124") ? `` : (stryCov_9fa48("1124"), `${level} ${name} Cohort`);
      }
    };

    // Get placeholder photo for attendees without photos
    const getAttendeePhoto = attendee => {
      if (stryMutAct_9fa48("1125")) {
        {}
      } else {
        stryCov_9fa48("1125");
        if (stryMutAct_9fa48("1127") ? false : stryMutAct_9fa48("1126") ? true : (stryCov_9fa48("1126", "1127"), attendee.photoUrl)) {
          if (stryMutAct_9fa48("1128")) {
            {}
          } else {
            stryCov_9fa48("1128");
            // If it's already a full URL, use it as is
            if (stryMutAct_9fa48("1131") ? attendee.photoUrl.startsWith('http') && attendee.photoUrl.startsWith('data:') : stryMutAct_9fa48("1130") ? false : stryMutAct_9fa48("1129") ? true : (stryCov_9fa48("1129", "1130", "1131"), (stryMutAct_9fa48("1132") ? attendee.photoUrl.endsWith('http') : (stryCov_9fa48("1132"), attendee.photoUrl.startsWith(stryMutAct_9fa48("1133") ? "" : (stryCov_9fa48("1133"), 'http')))) || (stryMutAct_9fa48("1134") ? attendee.photoUrl.endsWith('data:') : (stryCov_9fa48("1134"), attendee.photoUrl.startsWith(stryMutAct_9fa48("1135") ? "" : (stryCov_9fa48("1135"), 'data:')))))) {
              if (stryMutAct_9fa48("1136")) {
                {}
              } else {
                stryCov_9fa48("1136");
                return attendee.photoUrl;
              }
            }
            // If it's a relative path, prefix with API URL
            return stryMutAct_9fa48("1137") ? `` : (stryCov_9fa48("1137"), `${import.meta.env.VITE_API_URL}${attendee.photoUrl}`);
          }
        }
        // Return a placeholder photo - you can replace this with an actual placeholder image
        return stryMutAct_9fa48("1138") ? `` : (stryCov_9fa48("1138"), `data:image/svg+xml;base64,${btoa(stryMutAct_9fa48("1139") ? `` : (stryCov_9fa48("1139"), `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" fill="#6366f1" opacity="0.1"/>
        <circle cx="50" cy="35" r="15" fill="#6366f1" opacity="0.3"/>
        <rect x="25" y="55" width="50" height="30" rx="15" fill="#6366f1" opacity="0.3"/>
        <text x="50" y="85" text-anchor="middle" font-family="Arial" font-size="12" fill="#6366f1">${(stryMutAct_9fa48("1142") ? attendee.firstName || attendee.firstName !== 'Unknown' : stryMutAct_9fa48("1141") ? false : stryMutAct_9fa48("1140") ? true : (stryCov_9fa48("1140", "1141", "1142"), attendee.firstName && (stryMutAct_9fa48("1144") ? attendee.firstName === 'Unknown' : stryMutAct_9fa48("1143") ? true : (stryCov_9fa48("1143", "1144"), attendee.firstName !== (stryMutAct_9fa48("1145") ? "" : (stryCov_9fa48("1145"), 'Unknown')))))) ? stryMutAct_9fa48("1146") ? attendee.firstName : (stryCov_9fa48("1146"), attendee.firstName.charAt(0)) : stryMutAct_9fa48("1147") ? "" : (stryCov_9fa48("1147"), '?')}</text>
      </svg>
    `))}`);
      }
    };
    if (stryMutAct_9fa48("1150") ? attendees.length !== 0 : stryMutAct_9fa48("1149") ? false : stryMutAct_9fa48("1148") ? true : (stryCov_9fa48("1148", "1149", "1150"), attendees.length === 0)) {
      if (stryMutAct_9fa48("1151")) {
        {}
      } else {
        stryCov_9fa48("1151");
        return <div className={stryMutAct_9fa48("1152") ? `` : (stryCov_9fa48("1152"), `cohort-attendance-card ${className}`)}>
        <div className="card-header">
          <div className="card-icon">👥</div>
          <h2>{getCohortDisplayName(cohortLevel, cohortName)} Present Today (0)</h2>
        </div>
        <div className="cohort-empty-state">
          <div className="empty-icon">📷</div>
          <p>No attendees yet today</p>
        </div>
      </div>;
      }
    }
    return <div className={stryMutAct_9fa48("1153") ? `` : (stryCov_9fa48("1153"), `cohort-attendance-card ${className}`)}>
      <div className="card-header">
        <div className="card-icon">👥</div>
        <h2>{getCohortDisplayName(cohortLevel, cohortName)} Present Today ({attendees.length})</h2>
      </div>
      
      <div className="cohort-photos-container">
        <div className="horizontal-thumbnails">
          {attendees.map(stryMutAct_9fa48("1154") ? () => undefined : (stryCov_9fa48("1154"), (attendee, index) => <div key={stryMutAct_9fa48("1157") ? attendee.attendanceId && index : stryMutAct_9fa48("1156") ? false : stryMutAct_9fa48("1155") ? true : (stryCov_9fa48("1155", "1156", "1157"), attendee.attendanceId || index)} className="attendee-thumbnail">
              <div className="thumbnail-photo">
                <img src={getAttendeePhoto(attendee)} alt={stryMutAct_9fa48("1158") ? `` : (stryCov_9fa48("1158"), `${attendee.firstName} ${attendee.lastName}`)} className="thumbnail-image" />
              </div>
              <div className="thumbnail-info">
                <p className="attendee-name">
                  {stryMutAct_9fa48("1161") ? attendee.firstName && 'Unknown' : stryMutAct_9fa48("1160") ? false : stryMutAct_9fa48("1159") ? true : (stryCov_9fa48("1159", "1160", "1161"), attendee.firstName || (stryMutAct_9fa48("1162") ? "" : (stryCov_9fa48("1162"), 'Unknown')))} {stryMutAct_9fa48("1165") ? attendee.lastName && 'Unknown' : stryMutAct_9fa48("1164") ? false : stryMutAct_9fa48("1163") ? true : (stryCov_9fa48("1163", "1164", "1165"), attendee.lastName || (stryMutAct_9fa48("1166") ? "" : (stryCov_9fa48("1166"), 'Unknown')))}
                </p>
                <p className="check-in-time">
                  {(() => {
                  if (stryMutAct_9fa48("1167")) {
                    {}
                  } else {
                    stryCov_9fa48("1167");
                    try {
                      if (stryMutAct_9fa48("1168")) {
                        {}
                      } else {
                        stryCov_9fa48("1168");
                        const checkInTime = attendee.checkInTime;
                        if (stryMutAct_9fa48("1171") ? false : stryMutAct_9fa48("1170") ? true : stryMutAct_9fa48("1169") ? checkInTime : (stryCov_9fa48("1169", "1170", "1171"), !checkInTime)) return stryMutAct_9fa48("1172") ? "" : (stryCov_9fa48("1172"), 'Unknown time');

                        // The timestamp is already in Eastern time, so we need to parse it as local time
                        // instead of treating it as UTC
                        const timeString = checkInTime.replace(stryMutAct_9fa48("1173") ? "" : (stryCov_9fa48("1173"), 'Z'), stryMutAct_9fa48("1174") ? "Stryker was here!" : (stryCov_9fa48("1174"), '')); // Remove the Z to treat as local time
                        const date = new Date(timeString);
                        if (stryMutAct_9fa48("1176") ? false : stryMutAct_9fa48("1175") ? true : (stryCov_9fa48("1175", "1176"), isNaN(date.getTime()))) return stryMutAct_9fa48("1177") ? "" : (stryCov_9fa48("1177"), 'Unknown time');
                        return date.toLocaleTimeString(stryMutAct_9fa48("1178") ? ["Stryker was here"] : (stryCov_9fa48("1178"), []), stryMutAct_9fa48("1179") ? {} : (stryCov_9fa48("1179"), {
                          hour: stryMutAct_9fa48("1180") ? "" : (stryCov_9fa48("1180"), '2-digit'),
                          minute: stryMutAct_9fa48("1181") ? "" : (stryCov_9fa48("1181"), '2-digit')
                        }));
                      }
                    } catch (error) {
                      if (stryMutAct_9fa48("1182")) {
                        {}
                      } else {
                        stryCov_9fa48("1182");
                        return stryMutAct_9fa48("1183") ? "" : (stryCov_9fa48("1183"), 'Unknown time');
                      }
                    }
                  }
                })()}
                </p>
              </div>
            </div>))}
        </div>
      </div>
    </div>;
  }
};
export default CohortAttendanceCard;