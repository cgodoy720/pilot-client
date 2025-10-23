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
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
const MonthFilter = ({
  selectedMonth,
  onMonthChange,
  cohortMonth
}) => {
  if (stryMutAct_9fa48("2051")) {
    {}
  } else {
    stryCov_9fa48("2051");
    // Generate months from cohort month to current month
    const getMonthOptions = () => {
      if (stryMutAct_9fa48("2052")) {
        {}
      } else {
        stryCov_9fa48("2052");
        const options = stryMutAct_9fa48("2053") ? ["Stryker was here"] : (stryCov_9fa48("2053"), []);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        // Parse cohort month (e.g., "March 2025" -> year: 2025, month: 2)
        let cohortYear = currentYear;
        let cohortMonthIndex = 0; // January default

        if (stryMutAct_9fa48("2055") ? false : stryMutAct_9fa48("2054") ? true : (stryCov_9fa48("2054", "2055"), cohortMonth)) {
          if (stryMutAct_9fa48("2056")) {
            {}
          } else {
            stryCov_9fa48("2056");
            const parts = cohortMonth.split(stryMutAct_9fa48("2057") ? "" : (stryCov_9fa48("2057"), ' '));
            if (stryMutAct_9fa48("2060") ? parts.length !== 2 : stryMutAct_9fa48("2059") ? false : stryMutAct_9fa48("2058") ? true : (stryCov_9fa48("2058", "2059", "2060"), parts.length === 2)) {
              if (stryMutAct_9fa48("2061")) {
                {}
              } else {
                stryCov_9fa48("2061");
                const monthName = parts[0];
                cohortYear = parseInt(parts[1]);
                const monthNames = stryMutAct_9fa48("2062") ? [] : (stryCov_9fa48("2062"), [stryMutAct_9fa48("2063") ? "" : (stryCov_9fa48("2063"), 'January'), stryMutAct_9fa48("2064") ? "" : (stryCov_9fa48("2064"), 'February'), stryMutAct_9fa48("2065") ? "" : (stryCov_9fa48("2065"), 'March'), stryMutAct_9fa48("2066") ? "" : (stryCov_9fa48("2066"), 'April'), stryMutAct_9fa48("2067") ? "" : (stryCov_9fa48("2067"), 'May'), stryMutAct_9fa48("2068") ? "" : (stryCov_9fa48("2068"), 'June'), stryMutAct_9fa48("2069") ? "" : (stryCov_9fa48("2069"), 'July'), stryMutAct_9fa48("2070") ? "" : (stryCov_9fa48("2070"), 'August'), stryMutAct_9fa48("2071") ? "" : (stryCov_9fa48("2071"), 'September'), stryMutAct_9fa48("2072") ? "" : (stryCov_9fa48("2072"), 'October'), stryMutAct_9fa48("2073") ? "" : (stryCov_9fa48("2073"), 'November'), stryMutAct_9fa48("2074") ? "" : (stryCov_9fa48("2074"), 'December')]);
                cohortMonthIndex = monthNames.findIndex(stryMutAct_9fa48("2075") ? () => undefined : (stryCov_9fa48("2075"), m => stryMutAct_9fa48("2078") ? m !== monthName : stryMutAct_9fa48("2077") ? false : stryMutAct_9fa48("2076") ? true : (stryCov_9fa48("2076", "2077", "2078"), m === monthName)));
                if (stryMutAct_9fa48("2081") ? cohortMonthIndex !== -1 : stryMutAct_9fa48("2080") ? false : stryMutAct_9fa48("2079") ? true : (stryCov_9fa48("2079", "2080", "2081"), cohortMonthIndex === (stryMutAct_9fa48("2082") ? +1 : (stryCov_9fa48("2082"), -1)))) cohortMonthIndex = 0; // Fallback to January
              }
            }
          }
        }

        // Add "All Time" option
        options.push(stryMutAct_9fa48("2083") ? {} : (stryCov_9fa48("2083"), {
          value: stryMutAct_9fa48("2084") ? "" : (stryCov_9fa48("2084"), 'all'),
          label: stryMutAct_9fa48("2085") ? "" : (stryCov_9fa48("2085"), 'All Time')
        }));

        // Calculate the number of months between cohort month and current month
        const monthDiff = stryMutAct_9fa48("2086") ? (currentYear - cohortYear) * 12 + (currentMonth - cohortMonthIndex) - 1 : (stryCov_9fa48("2086"), (stryMutAct_9fa48("2087") ? (currentYear - cohortYear) * 12 - (currentMonth - cohortMonthIndex) : (stryCov_9fa48("2087"), (stryMutAct_9fa48("2088") ? (currentYear - cohortYear) / 12 : (stryCov_9fa48("2088"), (stryMutAct_9fa48("2089") ? currentYear + cohortYear : (stryCov_9fa48("2089"), currentYear - cohortYear)) * 12)) + (stryMutAct_9fa48("2090") ? currentMonth + cohortMonthIndex : (stryCov_9fa48("2090"), currentMonth - cohortMonthIndex)))) + 1);

        // Generate month options from cohort month to current month
        for (let i = 0; stryMutAct_9fa48("2093") ? i >= monthDiff : stryMutAct_9fa48("2092") ? i <= monthDiff : stryMutAct_9fa48("2091") ? false : (stryCov_9fa48("2091", "2092", "2093"), i < monthDiff); stryMutAct_9fa48("2094") ? i-- : (stryCov_9fa48("2094"), i++)) {
          if (stryMutAct_9fa48("2095")) {
            {}
          } else {
            stryCov_9fa48("2095");
            let monthIndex = stryMutAct_9fa48("2096") ? currentMonth + i : (stryCov_9fa48("2096"), currentMonth - i);
            let year = currentYear;
            while (stryMutAct_9fa48("2099") ? monthIndex >= 0 : stryMutAct_9fa48("2098") ? monthIndex <= 0 : stryMutAct_9fa48("2097") ? false : (stryCov_9fa48("2097", "2098", "2099"), monthIndex < 0)) {
              if (stryMutAct_9fa48("2100")) {
                {}
              } else {
                stryCov_9fa48("2100");
                stryMutAct_9fa48("2101") ? monthIndex -= 12 : (stryCov_9fa48("2101"), monthIndex += 12);
                stryMutAct_9fa48("2102") ? year += 1 : (stryCov_9fa48("2102"), year -= 1);
              }
            }
            const monthNames = stryMutAct_9fa48("2103") ? [] : (stryCov_9fa48("2103"), [stryMutAct_9fa48("2104") ? "" : (stryCov_9fa48("2104"), 'January'), stryMutAct_9fa48("2105") ? "" : (stryCov_9fa48("2105"), 'February'), stryMutAct_9fa48("2106") ? "" : (stryCov_9fa48("2106"), 'March'), stryMutAct_9fa48("2107") ? "" : (stryCov_9fa48("2107"), 'April'), stryMutAct_9fa48("2108") ? "" : (stryCov_9fa48("2108"), 'May'), stryMutAct_9fa48("2109") ? "" : (stryCov_9fa48("2109"), 'June'), stryMutAct_9fa48("2110") ? "" : (stryCov_9fa48("2110"), 'July'), stryMutAct_9fa48("2111") ? "" : (stryCov_9fa48("2111"), 'August'), stryMutAct_9fa48("2112") ? "" : (stryCov_9fa48("2112"), 'September'), stryMutAct_9fa48("2113") ? "" : (stryCov_9fa48("2113"), 'October'), stryMutAct_9fa48("2114") ? "" : (stryCov_9fa48("2114"), 'November'), stryMutAct_9fa48("2115") ? "" : (stryCov_9fa48("2115"), 'December')]);
            const monthName = monthNames[monthIndex];
            const value = stryMutAct_9fa48("2116") ? `` : (stryCov_9fa48("2116"), `${year}-${(stryMutAct_9fa48("2117") ? monthIndex - 1 : (stryCov_9fa48("2117"), monthIndex + 1)).toString().padStart(2, stryMutAct_9fa48("2118") ? "" : (stryCov_9fa48("2118"), '0'))}`);
            options.push(stryMutAct_9fa48("2119") ? {} : (stryCov_9fa48("2119"), {
              value,
              label: stryMutAct_9fa48("2120") ? `` : (stryCov_9fa48("2120"), `${monthName} ${year}`)
            }));
          }
        }
        return options;
      }
    };
    const monthOptions = getMonthOptions();
    return <FormControl size="small" sx={stryMutAct_9fa48("2121") ? {} : (stryCov_9fa48("2121"), {
      minWidth: stryMutAct_9fa48("2122") ? "" : (stryCov_9fa48("2122"), '160px'),
      '& .MuiInputBase-root': stryMutAct_9fa48("2123") ? {} : (stryCov_9fa48("2123"), {
        height: stryMutAct_9fa48("2124") ? "" : (stryCov_9fa48("2124"), '36px')
      }),
      '& .MuiOutlinedInput-root': stryMutAct_9fa48("2125") ? {} : (stryCov_9fa48("2125"), {
        backgroundColor: stryMutAct_9fa48("2126") ? "" : (stryCov_9fa48("2126"), 'var(--color-background-darker)')
      }),
      '& .MuiSelect-icon': stryMutAct_9fa48("2127") ? {} : (stryCov_9fa48("2127"), {
        color: stryMutAct_9fa48("2128") ? "" : (stryCov_9fa48("2128"), 'var(--color-text-secondary)')
      })
    })}>
      <InputLabel id="month-filter-label" sx={stryMutAct_9fa48("2129") ? {} : (stryCov_9fa48("2129"), {
        fontSize: stryMutAct_9fa48("2130") ? "" : (stryCov_9fa48("2130"), '0.85rem')
      })}>Filter by Month</InputLabel>
      <Select labelId="month-filter-label" id="month-filter" value={selectedMonth} label="Filter by Month" onChange={stryMutAct_9fa48("2131") ? () => undefined : (stryCov_9fa48("2131"), e => onMonthChange(e.target.value))} sx={stryMutAct_9fa48("2132") ? {} : (stryCov_9fa48("2132"), {
        fontSize: stryMutAct_9fa48("2133") ? "" : (stryCov_9fa48("2133"), '0.85rem')
      })}>
        {monthOptions.map(stryMutAct_9fa48("2134") ? () => undefined : (stryCov_9fa48("2134"), option => <MenuItem key={option.value} value={option.value} sx={stryMutAct_9fa48("2135") ? {} : (stryCov_9fa48("2135"), {
          fontSize: stryMutAct_9fa48("2136") ? "" : (stryCov_9fa48("2136"), '0.85rem')
        })}>
            {option.label}
          </MenuItem>))}
      </Select>
    </FormControl>;
  }
};
export default MonthFilter;