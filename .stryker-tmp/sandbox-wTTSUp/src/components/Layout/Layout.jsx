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
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Settings, Award, Users, Bug, Brain, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';
const Layout = ({
  children
}) => {
  if (stryMutAct_9fa48("0")) {
    {}
  } else {
    stryCov_9fa48("0");
    const [isNavbarHovered, setIsNavbarHovered] = useState(stryMutAct_9fa48("1") ? true : (stryCov_9fa48("1"), false));
    const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(stryMutAct_9fa48("2") ? true : (stryCov_9fa48("2"), false));
    const [isMobile, setIsMobile] = useState(stryMutAct_9fa48("3") ? true : (stryCov_9fa48("3"), false));
    const {
      logout,
      user
    } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Detect mobile vs desktop
    useEffect(() => {
      if (stryMutAct_9fa48("4")) {
        {}
      } else {
        stryCov_9fa48("4");
        const checkMobile = () => {
          if (stryMutAct_9fa48("5")) {
            {}
          } else {
            stryCov_9fa48("5");
            setIsMobile(stryMutAct_9fa48("9") ? window.innerWidth >= 768 : stryMutAct_9fa48("8") ? window.innerWidth <= 768 : stryMutAct_9fa48("7") ? false : stryMutAct_9fa48("6") ? true : (stryCov_9fa48("6", "7", "8", "9"), window.innerWidth < 768)); // Mobile breakpoint
          }
        };
        checkMobile();
        window.addEventListener(stryMutAct_9fa48("10") ? "" : (stryCov_9fa48("10"), 'resize'), checkMobile);
        return stryMutAct_9fa48("11") ? () => undefined : (stryCov_9fa48("11"), () => window.removeEventListener(stryMutAct_9fa48("12") ? "" : (stryCov_9fa48("12"), 'resize'), checkMobile));
      }
    }, stryMutAct_9fa48("13") ? ["Stryker was here"] : (stryCov_9fa48("13"), []));
    const handleLogout = () => {
      if (stryMutAct_9fa48("14")) {
        {}
      } else {
        stryCov_9fa48("14");
        logout();
        navigate(stryMutAct_9fa48("15") ? "" : (stryCov_9fa48("15"), '/login'));
      }
    };
    const toggleMobileNavbar = () => {
      if (stryMutAct_9fa48("16")) {
        {}
      } else {
        stryCov_9fa48("16");
        setIsMobileNavbarOpen(stryMutAct_9fa48("17") ? isMobileNavbarOpen : (stryCov_9fa48("17"), !isMobileNavbarOpen));
      }
    };
    const closeMobileNavbar = () => {
      if (stryMutAct_9fa48("18")) {
        {}
      } else {
        stryCov_9fa48("18");
        setIsMobileNavbarOpen(stryMutAct_9fa48("19") ? true : (stryCov_9fa48("19"), false));
      }
    };

    // Get the current page icon for mobile menu button
    const getCurrentPageIcon = () => {
      if (stryMutAct_9fa48("20")) {
        {}
      } else {
        stryCov_9fa48("20");
        const iconMap = stryMutAct_9fa48("21") ? {} : (stryCov_9fa48("21"), {
          '/dashboard': logo,
          '/learning': <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
          '/gpt': <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
          '/calendar': <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
          '/stats': <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
          '/assessment': <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
          '/account': <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
          <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        });

        // Check for admin routes
        if (stryMutAct_9fa48("24") ? location.pathname === '/admin-dashboard' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("23") ? false : stryMutAct_9fa48("22") ? true : (stryCov_9fa48("22", "23", "24"), (stryMutAct_9fa48("26") ? location.pathname !== '/admin-dashboard' : stryMutAct_9fa48("25") ? true : (stryCov_9fa48("25", "26"), location.pathname === (stryMutAct_9fa48("27") ? "" : (stryCov_9fa48("27"), '/admin-dashboard')))) && (stryMutAct_9fa48("29") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("28") ? true : (stryCov_9fa48("28", "29"), (stryMutAct_9fa48("31") ? user?.role !== 'admin' : stryMutAct_9fa48("30") ? false : (stryCov_9fa48("30", "31"), (stryMutAct_9fa48("32") ? user.role : (stryCov_9fa48("32"), user?.role)) === (stryMutAct_9fa48("33") ? "" : (stryCov_9fa48("33"), 'admin')))) || (stryMutAct_9fa48("35") ? user?.role !== 'staff' : stryMutAct_9fa48("34") ? false : (stryCov_9fa48("34", "35"), (stryMutAct_9fa48("36") ? user.role : (stryCov_9fa48("36"), user?.role)) === (stryMutAct_9fa48("37") ? "" : (stryCov_9fa48("37"), 'staff')))))))) {
          if (stryMutAct_9fa48("38")) {
            {}
          } else {
            stryCov_9fa48("38");
            return <Settings className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("41") ? location.pathname === '/admin/assessment-grades' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("40") ? false : stryMutAct_9fa48("39") ? true : (stryCov_9fa48("39", "40", "41"), (stryMutAct_9fa48("43") ? location.pathname !== '/admin/assessment-grades' : stryMutAct_9fa48("42") ? true : (stryCov_9fa48("42", "43"), location.pathname === (stryMutAct_9fa48("44") ? "" : (stryCov_9fa48("44"), '/admin/assessment-grades')))) && (stryMutAct_9fa48("46") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("45") ? true : (stryCov_9fa48("45", "46"), (stryMutAct_9fa48("48") ? user?.role !== 'admin' : stryMutAct_9fa48("47") ? false : (stryCov_9fa48("47", "48"), (stryMutAct_9fa48("49") ? user.role : (stryCov_9fa48("49"), user?.role)) === (stryMutAct_9fa48("50") ? "" : (stryCov_9fa48("50"), 'admin')))) || (stryMutAct_9fa48("52") ? user?.role !== 'staff' : stryMutAct_9fa48("51") ? false : (stryCov_9fa48("51", "52"), (stryMutAct_9fa48("53") ? user.role : (stryCov_9fa48("53"), user?.role)) === (stryMutAct_9fa48("54") ? "" : (stryCov_9fa48("54"), 'staff')))))))) {
          if (stryMutAct_9fa48("55")) {
            {}
          } else {
            stryCov_9fa48("55");
            return <Award className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("58") ? location.pathname === '/admissions-dashboard' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("57") ? false : stryMutAct_9fa48("56") ? true : (stryCov_9fa48("56", "57", "58"), (stryMutAct_9fa48("60") ? location.pathname !== '/admissions-dashboard' : stryMutAct_9fa48("59") ? true : (stryCov_9fa48("59", "60"), location.pathname === (stryMutAct_9fa48("61") ? "" : (stryCov_9fa48("61"), '/admissions-dashboard')))) && (stryMutAct_9fa48("63") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("62") ? true : (stryCov_9fa48("62", "63"), (stryMutAct_9fa48("65") ? user?.role !== 'admin' : stryMutAct_9fa48("64") ? false : (stryCov_9fa48("64", "65"), (stryMutAct_9fa48("66") ? user.role : (stryCov_9fa48("66"), user?.role)) === (stryMutAct_9fa48("67") ? "" : (stryCov_9fa48("67"), 'admin')))) || (stryMutAct_9fa48("69") ? user?.role !== 'staff' : stryMutAct_9fa48("68") ? false : (stryCov_9fa48("68", "69"), (stryMutAct_9fa48("70") ? user.role : (stryCov_9fa48("70"), user?.role)) === (stryMutAct_9fa48("71") ? "" : (stryCov_9fa48("71"), 'staff')))))))) {
          if (stryMutAct_9fa48("72")) {
            {}
          } else {
            stryCov_9fa48("72");
            return <Users className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("75") ? location.pathname === '/content' || location.pathname.startsWith('/content') || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("74") ? false : stryMutAct_9fa48("73") ? true : (stryCov_9fa48("73", "74", "75"), (stryMutAct_9fa48("77") ? location.pathname === '/content' && location.pathname.startsWith('/content') : stryMutAct_9fa48("76") ? true : (stryCov_9fa48("76", "77"), (stryMutAct_9fa48("79") ? location.pathname !== '/content' : stryMutAct_9fa48("78") ? false : (stryCov_9fa48("78", "79"), location.pathname === (stryMutAct_9fa48("80") ? "" : (stryCov_9fa48("80"), '/content')))) || (stryMutAct_9fa48("81") ? location.pathname.endsWith('/content') : (stryCov_9fa48("81"), location.pathname.startsWith(stryMutAct_9fa48("82") ? "" : (stryCov_9fa48("82"), '/content')))))) && (stryMutAct_9fa48("84") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("83") ? true : (stryCov_9fa48("83", "84"), (stryMutAct_9fa48("86") ? user?.role !== 'admin' : stryMutAct_9fa48("85") ? false : (stryCov_9fa48("85", "86"), (stryMutAct_9fa48("87") ? user.role : (stryCov_9fa48("87"), user?.role)) === (stryMutAct_9fa48("88") ? "" : (stryCov_9fa48("88"), 'admin')))) || (stryMutAct_9fa48("90") ? user?.role !== 'staff' : stryMutAct_9fa48("89") ? false : (stryCov_9fa48("89", "90"), (stryMutAct_9fa48("91") ? user.role : (stryCov_9fa48("91"), user?.role)) === (stryMutAct_9fa48("92") ? "" : (stryCov_9fa48("92"), 'staff')))))))) {
          if (stryMutAct_9fa48("93")) {
            {}
          } else {
            stryCov_9fa48("93");
            return <Bug className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("96") ? location.pathname === '/admin-prompts' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("95") ? false : stryMutAct_9fa48("94") ? true : (stryCov_9fa48("94", "95", "96"), (stryMutAct_9fa48("98") ? location.pathname !== '/admin-prompts' : stryMutAct_9fa48("97") ? true : (stryCov_9fa48("97", "98"), location.pathname === (stryMutAct_9fa48("99") ? "" : (stryCov_9fa48("99"), '/admin-prompts')))) && (stryMutAct_9fa48("101") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("100") ? true : (stryCov_9fa48("100", "101"), (stryMutAct_9fa48("103") ? user?.role !== 'admin' : stryMutAct_9fa48("102") ? false : (stryCov_9fa48("102", "103"), (stryMutAct_9fa48("104") ? user.role : (stryCov_9fa48("104"), user?.role)) === (stryMutAct_9fa48("105") ? "" : (stryCov_9fa48("105"), 'admin')))) || (stryMutAct_9fa48("107") ? user?.role !== 'staff' : stryMutAct_9fa48("106") ? false : (stryCov_9fa48("106", "107"), (stryMutAct_9fa48("108") ? user.role : (stryCov_9fa48("108"), user?.role)) === (stryMutAct_9fa48("109") ? "" : (stryCov_9fa48("109"), 'staff')))))))) {
          if (stryMutAct_9fa48("110")) {
            {}
          } else {
            stryCov_9fa48("110");
            return <Brain className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("113") ? location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' || user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("112") ? false : stryMutAct_9fa48("111") ? true : (stryCov_9fa48("111", "112", "113"), (stryMutAct_9fa48("115") ? location.pathname === '/volunteer-feedback' && location.pathname === '/admin-volunteer-feedback' : stryMutAct_9fa48("114") ? true : (stryCov_9fa48("114", "115"), (stryMutAct_9fa48("117") ? location.pathname !== '/volunteer-feedback' : stryMutAct_9fa48("116") ? false : (stryCov_9fa48("116", "117"), location.pathname === (stryMutAct_9fa48("118") ? "" : (stryCov_9fa48("118"), '/volunteer-feedback')))) || (stryMutAct_9fa48("120") ? location.pathname !== '/admin-volunteer-feedback' : stryMutAct_9fa48("119") ? false : (stryCov_9fa48("119", "120"), location.pathname === (stryMutAct_9fa48("121") ? "" : (stryCov_9fa48("121"), '/admin-volunteer-feedback')))))) && (stryMutAct_9fa48("123") ? (user?.role === 'volunteer' || user?.role === 'admin') && user?.role === 'staff' : stryMutAct_9fa48("122") ? true : (stryCov_9fa48("122", "123"), (stryMutAct_9fa48("125") ? user?.role === 'volunteer' && user?.role === 'admin' : stryMutAct_9fa48("124") ? false : (stryCov_9fa48("124", "125"), (stryMutAct_9fa48("127") ? user?.role !== 'volunteer' : stryMutAct_9fa48("126") ? false : (stryCov_9fa48("126", "127"), (stryMutAct_9fa48("128") ? user.role : (stryCov_9fa48("128"), user?.role)) === (stryMutAct_9fa48("129") ? "" : (stryCov_9fa48("129"), 'volunteer')))) || (stryMutAct_9fa48("131") ? user?.role !== 'admin' : stryMutAct_9fa48("130") ? false : (stryCov_9fa48("130", "131"), (stryMutAct_9fa48("132") ? user.role : (stryCov_9fa48("132"), user?.role)) === (stryMutAct_9fa48("133") ? "" : (stryCov_9fa48("133"), 'admin')))))) || (stryMutAct_9fa48("135") ? user?.role !== 'staff' : stryMutAct_9fa48("134") ? false : (stryCov_9fa48("134", "135"), (stryMutAct_9fa48("136") ? user.role : (stryCov_9fa48("136"), user?.role)) === (stryMutAct_9fa48("137") ? "" : (stryCov_9fa48("137"), 'staff')))))))) {
          if (stryMutAct_9fa48("138")) {
            {}
          } else {
            stryCov_9fa48("138");
            return <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        return stryMutAct_9fa48("141") ? iconMap[location.pathname] && logo : stryMutAct_9fa48("140") ? false : stryMutAct_9fa48("139") ? true : (stryCov_9fa48("139", "140", "141"), iconMap[location.pathname] || logo);
      }
    };
    return <div className="flex h-screen w-full bg-background">
      {/* Sidebar - Responsive behavior */}
      <nav className={cn(stryMutAct_9fa48("142") ? "" : (stryCov_9fa48("142"), "bg-[#1E1E1E] flex flex-col fixed left-0 top-0 h-full transition-all duration-300 z-[60]"), isMobile ? isMobileNavbarOpen ? stryMutAct_9fa48("143") ? "" : (stryCov_9fa48("143"), "w-[386px]") // Mobile expanded width (overlay)
      : stryMutAct_9fa48("144") ? "" : (stryCov_9fa48("144"), "w-0") // Mobile collapsed: completely hidden
      : isNavbarHovered ? stryMutAct_9fa48("145") ? "" : (stryCov_9fa48("145"), "w-[200px]") // Desktop expanded width
      : stryMutAct_9fa48("146") ? "" : (stryCov_9fa48("146"), "w-[50px]") // Desktop collapsed width
      )} onMouseEnter={stryMutAct_9fa48("147") ? () => undefined : (stryCov_9fa48("147"), () => stryMutAct_9fa48("150") ? !isMobile || setIsNavbarHovered(true) : stryMutAct_9fa48("149") ? false : stryMutAct_9fa48("148") ? true : (stryCov_9fa48("148", "149", "150"), (stryMutAct_9fa48("151") ? isMobile : (stryCov_9fa48("151"), !isMobile)) && setIsNavbarHovered(stryMutAct_9fa48("152") ? false : (stryCov_9fa48("152"), true))))} onMouseLeave={stryMutAct_9fa48("153") ? () => undefined : (stryCov_9fa48("153"), () => stryMutAct_9fa48("156") ? !isMobile || setIsNavbarHovered(false) : stryMutAct_9fa48("155") ? false : stryMutAct_9fa48("154") ? true : (stryCov_9fa48("154", "155", "156"), (stryMutAct_9fa48("157") ? isMobile : (stryCov_9fa48("157"), !isMobile)) && setIsNavbarHovered(stryMutAct_9fa48("158") ? true : (stryCov_9fa48("158"), false))))}>
        {/* Mobile Menu Button / Current Page Indicator */}
        {isMobile ?
        // Mobile: Show current page icon as menu button
        <div className="relative">
            <button onClick={toggleMobileNavbar} className={cn(stryMutAct_9fa48("159") ? "" : (stryCov_9fa48("159"), "w-[60px] h-[53px] flex items-center justify-center"), isMobileNavbarOpen ? stryMutAct_9fa48("160") ? "" : (stryCov_9fa48("160"), "bg-[#4242EA]") : stryMutAct_9fa48("161") ? "" : (stryCov_9fa48("161"), "bg-[#4242EA] hover:bg-blue-600"))}>
              {(stryMutAct_9fa48("164") ? location.pathname !== '/dashboard' : stryMutAct_9fa48("163") ? false : stryMutAct_9fa48("162") ? true : (stryCov_9fa48("162", "163", "164"), location.pathname === (stryMutAct_9fa48("165") ? "" : (stryCov_9fa48("165"), '/dashboard')))) ? <img src={logo} alt="Logo" className="h-5 w-5 object-contain" /> : getCurrentPageIcon()}
            </button>

            {/* Mobile Navbar Overlay - Only show when expanded */}
            {stryMutAct_9fa48("168") ? isMobileNavbarOpen || <>
                {/* Mobile Navbar Content */}
                <div className="absolute top-[53px] left-0 w-[386px] h-[calc(100vh-53px)] bg-[#1E1E1E] z-[70]">
                  {/* Dashboard */}
                  <Link to="/dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Dashboard</span>
                    </div>
                  </Link>

                  {/* Learning */}
                  <Link to="/learning" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/learning' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Learning</span>
                    </div>
                  </Link>

                  {/* AI Chat */}
                  <Link to="/gpt" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/gpt' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">AI Chat</span>
                    </div>
                  </Link>

                  {/* Calendar */}
                  <Link to="/calendar" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/calendar' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Calendar</span>
                    </div>
                  </Link>

                  {/* Progress */}
                  <Link to="/stats" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/stats' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Progress</span>
                    </div>
                  </Link>

                  {/* Assessment */}
                  <Link to="/assessment" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/assessment' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Assessment</span>
                    </div>
                  </Link>

                  {/* Admin Items */}
                  {(user?.role === 'admin' || user?.role === 'staff') && <>
                      {/* Admin Dashboard */}
                      <Link to="/admin-dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Settings className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admin Dashboard</span>
                        </div>
                      </Link>

                      {/* Assessment Grades */}
                      <Link to="/admin/assessment-grades" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Award className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Assessment Grades</span>
                        </div>
                      </Link>

                      {/* Admissions */}
                      <Link to="/admissions-dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Users className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admissions</span>
                        </div>
                      </Link>

                      {/* Content Generation */}
                      <Link to="/content" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/content' || location.pathname.startsWith('/content') ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Bug className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Content Generation</span>
                        </div>
                      </Link>

                      {/* AI Prompts */}
                      <Link to="/admin-prompts" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Brain className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">AI Prompts</span>
                        </div>
                      </Link>
                    </>}

                  {/* Volunteer Feedback */}
                  {(user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff') && <Link to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'} onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                      <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
                      </div>
                      <div className="flex items-center ml-[60px]">
                        <span className="text-white text-sm font-medium">Volunteer Feedback</span>
                      </div>
                    </Link>}

                  {/* Account */}
                  <Link to="/account" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/account' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                        <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Account</span>
                    </div>
                  </Link>

                  {/* Logout */}
                  <button onClick={() => {
                handleLogout();
                closeMobileNavbar();
              }} className="relative h-[53px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full text-left">
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                        <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Logout</span>
                    </div>
                  </button>
                </div>

                {/* Mobile Close Button */}
                <button onClick={closeMobileNavbar} className="absolute right-3 top-3 text-white hover:text-gray-300 z-[80]">
                  <X className="h-6 w-6" />
                </button>
              </> : stryMutAct_9fa48("167") ? false : stryMutAct_9fa48("166") ? true : (stryCov_9fa48("166", "167", "168"), isMobileNavbarOpen && <>
                {/* Mobile Navbar Content */}
                <div className="absolute top-[53px] left-0 w-[386px] h-[calc(100vh-53px)] bg-[#1E1E1E] z-[70]">
                  {/* Dashboard */}
                  <Link to="/dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("169") ? "" : (stryCov_9fa48("169"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("172") ? location.pathname !== '/dashboard' : stryMutAct_9fa48("171") ? false : stryMutAct_9fa48("170") ? true : (stryCov_9fa48("170", "171", "172"), location.pathname === (stryMutAct_9fa48("173") ? "" : (stryCov_9fa48("173"), '/dashboard')))) ? stryMutAct_9fa48("174") ? "" : (stryCov_9fa48("174"), "bg-[#4242EA]") : stryMutAct_9fa48("175") ? "" : (stryCov_9fa48("175"), "hover:bg-gray-800"))}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Dashboard</span>
                    </div>
                  </Link>

                  {/* Learning */}
                  <Link to="/learning" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("176") ? "" : (stryCov_9fa48("176"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("179") ? location.pathname !== '/learning' : stryMutAct_9fa48("178") ? false : stryMutAct_9fa48("177") ? true : (stryCov_9fa48("177", "178", "179"), location.pathname === (stryMutAct_9fa48("180") ? "" : (stryCov_9fa48("180"), '/learning')))) ? stryMutAct_9fa48("181") ? "" : (stryCov_9fa48("181"), "bg-[#4242EA]") : stryMutAct_9fa48("182") ? "" : (stryCov_9fa48("182"), "hover:bg-gray-800"))}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Learning</span>
                    </div>
                  </Link>

                  {/* AI Chat */}
                  <Link to="/gpt" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("183") ? "" : (stryCov_9fa48("183"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("186") ? location.pathname !== '/gpt' : stryMutAct_9fa48("185") ? false : stryMutAct_9fa48("184") ? true : (stryCov_9fa48("184", "185", "186"), location.pathname === (stryMutAct_9fa48("187") ? "" : (stryCov_9fa48("187"), '/gpt')))) ? stryMutAct_9fa48("188") ? "" : (stryCov_9fa48("188"), "bg-[#4242EA]") : stryMutAct_9fa48("189") ? "" : (stryCov_9fa48("189"), "hover:bg-gray-800"))}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">AI Chat</span>
                    </div>
                  </Link>

                  {/* Calendar */}
                  <Link to="/calendar" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("190") ? "" : (stryCov_9fa48("190"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("193") ? location.pathname !== '/calendar' : stryMutAct_9fa48("192") ? false : stryMutAct_9fa48("191") ? true : (stryCov_9fa48("191", "192", "193"), location.pathname === (stryMutAct_9fa48("194") ? "" : (stryCov_9fa48("194"), '/calendar')))) ? stryMutAct_9fa48("195") ? "" : (stryCov_9fa48("195"), "bg-[#4242EA]") : stryMutAct_9fa48("196") ? "" : (stryCov_9fa48("196"), "hover:bg-gray-800"))}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Calendar</span>
                    </div>
                  </Link>

                  {/* Progress */}
                  <Link to="/stats" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("197") ? "" : (stryCov_9fa48("197"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("200") ? location.pathname !== '/stats' : stryMutAct_9fa48("199") ? false : stryMutAct_9fa48("198") ? true : (stryCov_9fa48("198", "199", "200"), location.pathname === (stryMutAct_9fa48("201") ? "" : (stryCov_9fa48("201"), '/stats')))) ? stryMutAct_9fa48("202") ? "" : (stryCov_9fa48("202"), "bg-[#4242EA]") : stryMutAct_9fa48("203") ? "" : (stryCov_9fa48("203"), "hover:bg-gray-800"))}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Progress</span>
                    </div>
                  </Link>

                  {/* Assessment */}
                  <Link to="/assessment" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("204") ? "" : (stryCov_9fa48("204"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("207") ? location.pathname !== '/assessment' : stryMutAct_9fa48("206") ? false : stryMutAct_9fa48("205") ? true : (stryCov_9fa48("205", "206", "207"), location.pathname === (stryMutAct_9fa48("208") ? "" : (stryCov_9fa48("208"), '/assessment')))) ? stryMutAct_9fa48("209") ? "" : (stryCov_9fa48("209"), "bg-[#4242EA]") : stryMutAct_9fa48("210") ? "" : (stryCov_9fa48("210"), "hover:bg-gray-800"))}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Assessment</span>
                    </div>
                  </Link>

                  {/* Admin Items */}
                  {stryMutAct_9fa48("213") ? user?.role === 'admin' || user?.role === 'staff' || <>
                      {/* Admin Dashboard */}
                      <Link to="/admin-dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Settings className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admin Dashboard</span>
                        </div>
                      </Link>

                      {/* Assessment Grades */}
                      <Link to="/admin/assessment-grades" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Award className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Assessment Grades</span>
                        </div>
                      </Link>

                      {/* Admissions */}
                      <Link to="/admissions-dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Users className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admissions</span>
                        </div>
                      </Link>

                      {/* Content Generation */}
                      <Link to="/content" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/content' || location.pathname.startsWith('/content') ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Bug className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Content Generation</span>
                        </div>
                      </Link>

                      {/* AI Prompts */}
                      <Link to="/admin-prompts" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Brain className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">AI Prompts</span>
                        </div>
                      </Link>
                    </> : stryMutAct_9fa48("212") ? false : stryMutAct_9fa48("211") ? true : (stryCov_9fa48("211", "212", "213"), (stryMutAct_9fa48("215") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("214") ? true : (stryCov_9fa48("214", "215"), (stryMutAct_9fa48("217") ? user?.role !== 'admin' : stryMutAct_9fa48("216") ? false : (stryCov_9fa48("216", "217"), (stryMutAct_9fa48("218") ? user.role : (stryCov_9fa48("218"), user?.role)) === (stryMutAct_9fa48("219") ? "" : (stryCov_9fa48("219"), 'admin')))) || (stryMutAct_9fa48("221") ? user?.role !== 'staff' : stryMutAct_9fa48("220") ? false : (stryCov_9fa48("220", "221"), (stryMutAct_9fa48("222") ? user.role : (stryCov_9fa48("222"), user?.role)) === (stryMutAct_9fa48("223") ? "" : (stryCov_9fa48("223"), 'staff')))))) && <>
                      {/* Admin Dashboard */}
                      <Link to="/admin-dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("224") ? "" : (stryCov_9fa48("224"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("227") ? location.pathname !== '/admin-dashboard' : stryMutAct_9fa48("226") ? false : stryMutAct_9fa48("225") ? true : (stryCov_9fa48("225", "226", "227"), location.pathname === (stryMutAct_9fa48("228") ? "" : (stryCov_9fa48("228"), '/admin-dashboard')))) ? stryMutAct_9fa48("229") ? "" : (stryCov_9fa48("229"), "bg-[#4242EA]") : stryMutAct_9fa48("230") ? "" : (stryCov_9fa48("230"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Settings className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admin Dashboard</span>
                        </div>
                      </Link>

                      {/* Assessment Grades */}
                      <Link to="/admin/assessment-grades" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("231") ? "" : (stryCov_9fa48("231"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("234") ? location.pathname !== '/admin/assessment-grades' : stryMutAct_9fa48("233") ? false : stryMutAct_9fa48("232") ? true : (stryCov_9fa48("232", "233", "234"), location.pathname === (stryMutAct_9fa48("235") ? "" : (stryCov_9fa48("235"), '/admin/assessment-grades')))) ? stryMutAct_9fa48("236") ? "" : (stryCov_9fa48("236"), "bg-[#4242EA]") : stryMutAct_9fa48("237") ? "" : (stryCov_9fa48("237"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Award className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Assessment Grades</span>
                        </div>
                      </Link>

                      {/* Admissions */}
                      <Link to="/admissions-dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("238") ? "" : (stryCov_9fa48("238"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("241") ? location.pathname !== '/admissions-dashboard' : stryMutAct_9fa48("240") ? false : stryMutAct_9fa48("239") ? true : (stryCov_9fa48("239", "240", "241"), location.pathname === (stryMutAct_9fa48("242") ? "" : (stryCov_9fa48("242"), '/admissions-dashboard')))) ? stryMutAct_9fa48("243") ? "" : (stryCov_9fa48("243"), "bg-[#4242EA]") : stryMutAct_9fa48("244") ? "" : (stryCov_9fa48("244"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Users className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admissions</span>
                        </div>
                      </Link>

                      {/* Content Generation */}
                      <Link to="/content" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("245") ? "" : (stryCov_9fa48("245"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("248") ? location.pathname === '/content' && location.pathname.startsWith('/content') : stryMutAct_9fa48("247") ? false : stryMutAct_9fa48("246") ? true : (stryCov_9fa48("246", "247", "248"), (stryMutAct_9fa48("250") ? location.pathname !== '/content' : stryMutAct_9fa48("249") ? false : (stryCov_9fa48("249", "250"), location.pathname === (stryMutAct_9fa48("251") ? "" : (stryCov_9fa48("251"), '/content')))) || (stryMutAct_9fa48("252") ? location.pathname.endsWith('/content') : (stryCov_9fa48("252"), location.pathname.startsWith(stryMutAct_9fa48("253") ? "" : (stryCov_9fa48("253"), '/content')))))) ? stryMutAct_9fa48("254") ? "" : (stryCov_9fa48("254"), "bg-[#4242EA]") : stryMutAct_9fa48("255") ? "" : (stryCov_9fa48("255"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Bug className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Content Generation</span>
                        </div>
                      </Link>

                      {/* AI Prompts */}
                      <Link to="/admin-prompts" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("256") ? "" : (stryCov_9fa48("256"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("259") ? location.pathname !== '/admin-prompts' : stryMutAct_9fa48("258") ? false : stryMutAct_9fa48("257") ? true : (stryCov_9fa48("257", "258", "259"), location.pathname === (stryMutAct_9fa48("260") ? "" : (stryCov_9fa48("260"), '/admin-prompts')))) ? stryMutAct_9fa48("261") ? "" : (stryCov_9fa48("261"), "bg-[#4242EA]") : stryMutAct_9fa48("262") ? "" : (stryCov_9fa48("262"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Brain className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">AI Prompts</span>
                        </div>
                      </Link>
                    </>)}

                  {/* Volunteer Feedback */}
                  {stryMutAct_9fa48("265") ? user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff' || <Link to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'} onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                      <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
                      </div>
                      <div className="flex items-center ml-[60px]">
                        <span className="text-white text-sm font-medium">Volunteer Feedback</span>
                      </div>
                    </Link> : stryMutAct_9fa48("264") ? false : stryMutAct_9fa48("263") ? true : (stryCov_9fa48("263", "264", "265"), (stryMutAct_9fa48("267") ? (user?.role === 'volunteer' || user?.role === 'admin') && user?.role === 'staff' : stryMutAct_9fa48("266") ? true : (stryCov_9fa48("266", "267"), (stryMutAct_9fa48("269") ? user?.role === 'volunteer' && user?.role === 'admin' : stryMutAct_9fa48("268") ? false : (stryCov_9fa48("268", "269"), (stryMutAct_9fa48("271") ? user?.role !== 'volunteer' : stryMutAct_9fa48("270") ? false : (stryCov_9fa48("270", "271"), (stryMutAct_9fa48("272") ? user.role : (stryCov_9fa48("272"), user?.role)) === (stryMutAct_9fa48("273") ? "" : (stryCov_9fa48("273"), 'volunteer')))) || (stryMutAct_9fa48("275") ? user?.role !== 'admin' : stryMutAct_9fa48("274") ? false : (stryCov_9fa48("274", "275"), (stryMutAct_9fa48("276") ? user.role : (stryCov_9fa48("276"), user?.role)) === (stryMutAct_9fa48("277") ? "" : (stryCov_9fa48("277"), 'admin')))))) || (stryMutAct_9fa48("279") ? user?.role !== 'staff' : stryMutAct_9fa48("278") ? false : (stryCov_9fa48("278", "279"), (stryMutAct_9fa48("280") ? user.role : (stryCov_9fa48("280"), user?.role)) === (stryMutAct_9fa48("281") ? "" : (stryCov_9fa48("281"), 'staff')))))) && <Link to={(stryMutAct_9fa48("284") ? user?.role !== 'volunteer' : stryMutAct_9fa48("283") ? false : stryMutAct_9fa48("282") ? true : (stryCov_9fa48("282", "283", "284"), (stryMutAct_9fa48("285") ? user.role : (stryCov_9fa48("285"), user?.role)) === (stryMutAct_9fa48("286") ? "" : (stryCov_9fa48("286"), 'volunteer')))) ? stryMutAct_9fa48("287") ? "" : (stryCov_9fa48("287"), '/volunteer-feedback') : stryMutAct_9fa48("288") ? "" : (stryCov_9fa48("288"), '/admin-volunteer-feedback')} onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("289") ? "" : (stryCov_9fa48("289"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("292") ? location.pathname === '/volunteer-feedback' && location.pathname === '/admin-volunteer-feedback' : stryMutAct_9fa48("291") ? false : stryMutAct_9fa48("290") ? true : (stryCov_9fa48("290", "291", "292"), (stryMutAct_9fa48("294") ? location.pathname !== '/volunteer-feedback' : stryMutAct_9fa48("293") ? false : (stryCov_9fa48("293", "294"), location.pathname === (stryMutAct_9fa48("295") ? "" : (stryCov_9fa48("295"), '/volunteer-feedback')))) || (stryMutAct_9fa48("297") ? location.pathname !== '/admin-volunteer-feedback' : stryMutAct_9fa48("296") ? false : (stryCov_9fa48("296", "297"), location.pathname === (stryMutAct_9fa48("298") ? "" : (stryCov_9fa48("298"), '/admin-volunteer-feedback')))))) ? stryMutAct_9fa48("299") ? "" : (stryCov_9fa48("299"), "bg-[#4242EA]") : stryMutAct_9fa48("300") ? "" : (stryCov_9fa48("300"), "hover:bg-gray-800"))}>
                      <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
                      </div>
                      <div className="flex items-center ml-[60px]">
                        <span className="text-white text-sm font-medium">Volunteer Feedback</span>
                      </div>
                    </Link>)}

                  {/* Account */}
                  <Link to="/account" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("301") ? "" : (stryCov_9fa48("301"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("304") ? location.pathname !== '/account' : stryMutAct_9fa48("303") ? false : stryMutAct_9fa48("302") ? true : (stryCov_9fa48("302", "303", "304"), location.pathname === (stryMutAct_9fa48("305") ? "" : (stryCov_9fa48("305"), '/account')))) ? stryMutAct_9fa48("306") ? "" : (stryCov_9fa48("306"), "bg-[#4242EA]") : stryMutAct_9fa48("307") ? "" : (stryCov_9fa48("307"), "hover:bg-gray-800"))}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                        <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Account</span>
                    </div>
                  </Link>

                  {/* Logout */}
                  <button onClick={() => {
                if (stryMutAct_9fa48("308")) {
                  {}
                } else {
                  stryCov_9fa48("308");
                  handleLogout();
                  closeMobileNavbar();
                }
              }} className="relative h-[53px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full text-left">
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                        <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Logout</span>
                    </div>
                  </button>
                </div>

                {/* Mobile Close Button */}
                <button onClick={closeMobileNavbar} className="absolute right-3 top-3 text-white hover:text-gray-300 z-[80]">
                  <X className="h-6 w-6" />
                </button>
              </>)}
          </div> :
        // Desktop: Normal navbar behavior
        <Link to="/dashboard" className={cn(stryMutAct_9fa48("309") ? "" : (stryCov_9fa48("309"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("312") ? location.pathname !== '/dashboard' : stryMutAct_9fa48("311") ? false : stryMutAct_9fa48("310") ? true : (stryCov_9fa48("310", "311", "312"), location.pathname === (stryMutAct_9fa48("313") ? "" : (stryCov_9fa48("313"), '/dashboard')))) ? stryMutAct_9fa48("314") ? "" : (stryCov_9fa48("314"), "bg-[#4242EA]") : stryMutAct_9fa48("315") ? "" : (stryCov_9fa48("315"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
            </div>
            <div className={cn(stryMutAct_9fa48("316") ? "" : (stryCov_9fa48("316"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("317") ? "" : (stryCov_9fa48("317"), "ml-[50px] opacity-100") : stryMutAct_9fa48("318") ? "" : (stryCov_9fa48("318"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Dashboard</span>
        </div>
          </Link>}

        {/* Learning - Open book icon - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("321") ? isMobileNavbarOpen || <Link to="/learning" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/learning' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Learning</span>
              </div>
            </Link> : stryMutAct_9fa48("320") ? false : stryMutAct_9fa48("319") ? true : (stryCov_9fa48("319", "320", "321"), isMobileNavbarOpen && <Link to="/learning" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("322") ? "" : (stryCov_9fa48("322"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("325") ? location.pathname !== '/learning' : stryMutAct_9fa48("324") ? false : stryMutAct_9fa48("323") ? true : (stryCov_9fa48("323", "324", "325"), location.pathname === (stryMutAct_9fa48("326") ? "" : (stryCov_9fa48("326"), '/learning')))) ? stryMutAct_9fa48("327") ? "" : (stryCov_9fa48("327"), "bg-[#4242EA]") : stryMutAct_9fa48("328") ? "" : (stryCov_9fa48("328"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Learning</span>
              </div>
            </Link>) : <Link to="/learning" className={cn(stryMutAct_9fa48("329") ? "" : (stryCov_9fa48("329"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("332") ? location.pathname !== '/learning' : stryMutAct_9fa48("331") ? false : stryMutAct_9fa48("330") ? true : (stryCov_9fa48("330", "331", "332"), location.pathname === (stryMutAct_9fa48("333") ? "" : (stryCov_9fa48("333"), '/learning')))) ? stryMutAct_9fa48("334") ? "" : (stryCov_9fa48("334"), "bg-[#4242EA]") : stryMutAct_9fa48("335") ? "" : (stryCov_9fa48("335"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("336") ? "" : (stryCov_9fa48("336"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("337") ? "" : (stryCov_9fa48("337"), "ml-[50px] opacity-100") : stryMutAct_9fa48("338") ? "" : (stryCov_9fa48("338"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Learning</span>
            </div>
          </Link>}

        {/* AI Chat - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("341") ? isMobileNavbarOpen || <Link to="/gpt" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/gpt' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Chat</span>
              </div>
            </Link> : stryMutAct_9fa48("340") ? false : stryMutAct_9fa48("339") ? true : (stryCov_9fa48("339", "340", "341"), isMobileNavbarOpen && <Link to="/gpt" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("342") ? "" : (stryCov_9fa48("342"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("345") ? location.pathname !== '/gpt' : stryMutAct_9fa48("344") ? false : stryMutAct_9fa48("343") ? true : (stryCov_9fa48("343", "344", "345"), location.pathname === (stryMutAct_9fa48("346") ? "" : (stryCov_9fa48("346"), '/gpt')))) ? stryMutAct_9fa48("347") ? "" : (stryCov_9fa48("347"), "bg-[#4242EA]") : stryMutAct_9fa48("348") ? "" : (stryCov_9fa48("348"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Chat</span>
              </div>
            </Link>) : <Link to="/gpt" className={cn(stryMutAct_9fa48("349") ? "" : (stryCov_9fa48("349"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("352") ? location.pathname !== '/gpt' : stryMutAct_9fa48("351") ? false : stryMutAct_9fa48("350") ? true : (stryCov_9fa48("350", "351", "352"), location.pathname === (stryMutAct_9fa48("353") ? "" : (stryCov_9fa48("353"), '/gpt')))) ? stryMutAct_9fa48("354") ? "" : (stryCov_9fa48("354"), "bg-[#4242EA]") : stryMutAct_9fa48("355") ? "" : (stryCov_9fa48("355"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("356") ? "" : (stryCov_9fa48("356"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("357") ? "" : (stryCov_9fa48("357"), "ml-[50px] opacity-100") : stryMutAct_9fa48("358") ? "" : (stryCov_9fa48("358"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">AI Chat</span>
            </div>
          </Link>}

        {/* Calendar - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("361") ? isMobileNavbarOpen || <Link to="/calendar" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/calendar' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Calendar</span>
              </div>
            </Link> : stryMutAct_9fa48("360") ? false : stryMutAct_9fa48("359") ? true : (stryCov_9fa48("359", "360", "361"), isMobileNavbarOpen && <Link to="/calendar" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("362") ? "" : (stryCov_9fa48("362"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("365") ? location.pathname !== '/calendar' : stryMutAct_9fa48("364") ? false : stryMutAct_9fa48("363") ? true : (stryCov_9fa48("363", "364", "365"), location.pathname === (stryMutAct_9fa48("366") ? "" : (stryCov_9fa48("366"), '/calendar')))) ? stryMutAct_9fa48("367") ? "" : (stryCov_9fa48("367"), "bg-[#4242EA]") : stryMutAct_9fa48("368") ? "" : (stryCov_9fa48("368"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Calendar</span>
              </div>
            </Link>) : <Link to="/calendar" className={cn(stryMutAct_9fa48("369") ? "" : (stryCov_9fa48("369"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("372") ? location.pathname !== '/calendar' : stryMutAct_9fa48("371") ? false : stryMutAct_9fa48("370") ? true : (stryCov_9fa48("370", "371", "372"), location.pathname === (stryMutAct_9fa48("373") ? "" : (stryCov_9fa48("373"), '/calendar')))) ? stryMutAct_9fa48("374") ? "" : (stryCov_9fa48("374"), "bg-[#4242EA]") : stryMutAct_9fa48("375") ? "" : (stryCov_9fa48("375"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("376") ? "" : (stryCov_9fa48("376"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("377") ? "" : (stryCov_9fa48("377"), "ml-[50px] opacity-100") : stryMutAct_9fa48("378") ? "" : (stryCov_9fa48("378"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Calendar</span>
            </div>
          </Link>}

        {/* Progress - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("381") ? isMobileNavbarOpen || <Link to="/stats" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/stats' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Progress</span>
              </div>
            </Link> : stryMutAct_9fa48("380") ? false : stryMutAct_9fa48("379") ? true : (stryCov_9fa48("379", "380", "381"), isMobileNavbarOpen && <Link to="/stats" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("382") ? "" : (stryCov_9fa48("382"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("385") ? location.pathname !== '/stats' : stryMutAct_9fa48("384") ? false : stryMutAct_9fa48("383") ? true : (stryCov_9fa48("383", "384", "385"), location.pathname === (stryMutAct_9fa48("386") ? "" : (stryCov_9fa48("386"), '/stats')))) ? stryMutAct_9fa48("387") ? "" : (stryCov_9fa48("387"), "bg-[#4242EA]") : stryMutAct_9fa48("388") ? "" : (stryCov_9fa48("388"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Progress</span>
              </div>
            </Link>) : <Link to="/stats" className={cn(stryMutAct_9fa48("389") ? "" : (stryCov_9fa48("389"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("392") ? location.pathname !== '/stats' : stryMutAct_9fa48("391") ? false : stryMutAct_9fa48("390") ? true : (stryCov_9fa48("390", "391", "392"), location.pathname === (stryMutAct_9fa48("393") ? "" : (stryCov_9fa48("393"), '/stats')))) ? stryMutAct_9fa48("394") ? "" : (stryCov_9fa48("394"), "bg-[#4242EA]") : stryMutAct_9fa48("395") ? "" : (stryCov_9fa48("395"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("396") ? "" : (stryCov_9fa48("396"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("397") ? "" : (stryCov_9fa48("397"), "ml-[50px] opacity-100") : stryMutAct_9fa48("398") ? "" : (stryCov_9fa48("398"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Progress</span>
            </div>
          </Link>}

        {/* Assessment - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("401") ? isMobileNavbarOpen || <Link to="/assessment" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/assessment' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment</span>
              </div>
            </Link> : stryMutAct_9fa48("400") ? false : stryMutAct_9fa48("399") ? true : (stryCov_9fa48("399", "400", "401"), isMobileNavbarOpen && <Link to="/assessment" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("402") ? "" : (stryCov_9fa48("402"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("405") ? location.pathname !== '/assessment' : stryMutAct_9fa48("404") ? false : stryMutAct_9fa48("403") ? true : (stryCov_9fa48("403", "404", "405"), location.pathname === (stryMutAct_9fa48("406") ? "" : (stryCov_9fa48("406"), '/assessment')))) ? stryMutAct_9fa48("407") ? "" : (stryCov_9fa48("407"), "bg-[#4242EA]") : stryMutAct_9fa48("408") ? "" : (stryCov_9fa48("408"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment</span>
              </div>
            </Link>) : <Link to="/assessment" className={cn(stryMutAct_9fa48("409") ? "" : (stryCov_9fa48("409"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("412") ? location.pathname !== '/assessment' : stryMutAct_9fa48("411") ? false : stryMutAct_9fa48("410") ? true : (stryCov_9fa48("410", "411", "412"), location.pathname === (stryMutAct_9fa48("413") ? "" : (stryCov_9fa48("413"), '/assessment')))) ? stryMutAct_9fa48("414") ? "" : (stryCov_9fa48("414"), "bg-[#4242EA]") : stryMutAct_9fa48("415") ? "" : (stryCov_9fa48("415"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("416") ? "" : (stryCov_9fa48("416"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("417") ? "" : (stryCov_9fa48("417"), "ml-[50px] opacity-100") : stryMutAct_9fa48("418") ? "" : (stryCov_9fa48("418"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Assessment</span>
            </div>
          </Link>}

        {/* Admin Dashboard - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("421") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/admin-dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link> : stryMutAct_9fa48("420") ? false : stryMutAct_9fa48("419") ? true : (stryCov_9fa48("419", "420", "421"), (stryMutAct_9fa48("423") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("422") ? true : (stryCov_9fa48("422", "423"), (stryMutAct_9fa48("425") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("424") ? true : (stryCov_9fa48("424", "425"), (stryMutAct_9fa48("427") ? user?.role !== 'admin' : stryMutAct_9fa48("426") ? false : (stryCov_9fa48("426", "427"), (stryMutAct_9fa48("428") ? user.role : (stryCov_9fa48("428"), user?.role)) === (stryMutAct_9fa48("429") ? "" : (stryCov_9fa48("429"), 'admin')))) || (stryMutAct_9fa48("431") ? user?.role !== 'staff' : stryMutAct_9fa48("430") ? false : (stryCov_9fa48("430", "431"), (stryMutAct_9fa48("432") ? user.role : (stryCov_9fa48("432"), user?.role)) === (stryMutAct_9fa48("433") ? "" : (stryCov_9fa48("433"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/admin-dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("434") ? "" : (stryCov_9fa48("434"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("437") ? location.pathname !== '/admin-dashboard' : stryMutAct_9fa48("436") ? false : stryMutAct_9fa48("435") ? true : (stryCov_9fa48("435", "436", "437"), location.pathname === (stryMutAct_9fa48("438") ? "" : (stryCov_9fa48("438"), '/admin-dashboard')))) ? stryMutAct_9fa48("439") ? "" : (stryCov_9fa48("439"), "bg-[#4242EA]") : stryMutAct_9fa48("440") ? "" : (stryCov_9fa48("440"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link>) : stryMutAct_9fa48("443") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/admin-dashboard" className={cn("relative h-[44px] flex items-center", location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link> : stryMutAct_9fa48("442") ? false : stryMutAct_9fa48("441") ? true : (stryCov_9fa48("441", "442", "443"), (stryMutAct_9fa48("445") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("444") ? true : (stryCov_9fa48("444", "445"), (stryMutAct_9fa48("447") ? user?.role !== 'admin' : stryMutAct_9fa48("446") ? false : (stryCov_9fa48("446", "447"), (stryMutAct_9fa48("448") ? user.role : (stryCov_9fa48("448"), user?.role)) === (stryMutAct_9fa48("449") ? "" : (stryCov_9fa48("449"), 'admin')))) || (stryMutAct_9fa48("451") ? user?.role !== 'staff' : stryMutAct_9fa48("450") ? false : (stryCov_9fa48("450", "451"), (stryMutAct_9fa48("452") ? user.role : (stryCov_9fa48("452"), user?.role)) === (stryMutAct_9fa48("453") ? "" : (stryCov_9fa48("453"), 'staff')))))) && <Link to="/admin-dashboard" className={cn(stryMutAct_9fa48("454") ? "" : (stryCov_9fa48("454"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("457") ? location.pathname !== '/admin-dashboard' : stryMutAct_9fa48("456") ? false : stryMutAct_9fa48("455") ? true : (stryCov_9fa48("455", "456", "457"), location.pathname === (stryMutAct_9fa48("458") ? "" : (stryCov_9fa48("458"), '/admin-dashboard')))) ? stryMutAct_9fa48("459") ? "" : (stryCov_9fa48("459"), "bg-[#4242EA]") : stryMutAct_9fa48("460") ? "" : (stryCov_9fa48("460"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("461") ? "" : (stryCov_9fa48("461"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("462") ? "" : (stryCov_9fa48("462"), "ml-[50px] opacity-100") : stryMutAct_9fa48("463") ? "" : (stryCov_9fa48("463"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link>)}

        {/* Assessment Grades - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("466") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/admin/assessment-grades" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link> : stryMutAct_9fa48("465") ? false : stryMutAct_9fa48("464") ? true : (stryCov_9fa48("464", "465", "466"), (stryMutAct_9fa48("468") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("467") ? true : (stryCov_9fa48("467", "468"), (stryMutAct_9fa48("470") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("469") ? true : (stryCov_9fa48("469", "470"), (stryMutAct_9fa48("472") ? user?.role !== 'admin' : stryMutAct_9fa48("471") ? false : (stryCov_9fa48("471", "472"), (stryMutAct_9fa48("473") ? user.role : (stryCov_9fa48("473"), user?.role)) === (stryMutAct_9fa48("474") ? "" : (stryCov_9fa48("474"), 'admin')))) || (stryMutAct_9fa48("476") ? user?.role !== 'staff' : stryMutAct_9fa48("475") ? false : (stryCov_9fa48("475", "476"), (stryMutAct_9fa48("477") ? user.role : (stryCov_9fa48("477"), user?.role)) === (stryMutAct_9fa48("478") ? "" : (stryCov_9fa48("478"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/admin/assessment-grades" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("479") ? "" : (stryCov_9fa48("479"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("482") ? location.pathname !== '/admin/assessment-grades' : stryMutAct_9fa48("481") ? false : stryMutAct_9fa48("480") ? true : (stryCov_9fa48("480", "481", "482"), location.pathname === (stryMutAct_9fa48("483") ? "" : (stryCov_9fa48("483"), '/admin/assessment-grades')))) ? stryMutAct_9fa48("484") ? "" : (stryCov_9fa48("484"), "bg-[#4242EA]") : stryMutAct_9fa48("485") ? "" : (stryCov_9fa48("485"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link>) : stryMutAct_9fa48("488") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/admin/assessment-grades" className={cn("relative h-[44px] flex items-center", location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link> : stryMutAct_9fa48("487") ? false : stryMutAct_9fa48("486") ? true : (stryCov_9fa48("486", "487", "488"), (stryMutAct_9fa48("490") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("489") ? true : (stryCov_9fa48("489", "490"), (stryMutAct_9fa48("492") ? user?.role !== 'admin' : stryMutAct_9fa48("491") ? false : (stryCov_9fa48("491", "492"), (stryMutAct_9fa48("493") ? user.role : (stryCov_9fa48("493"), user?.role)) === (stryMutAct_9fa48("494") ? "" : (stryCov_9fa48("494"), 'admin')))) || (stryMutAct_9fa48("496") ? user?.role !== 'staff' : stryMutAct_9fa48("495") ? false : (stryCov_9fa48("495", "496"), (stryMutAct_9fa48("497") ? user.role : (stryCov_9fa48("497"), user?.role)) === (stryMutAct_9fa48("498") ? "" : (stryCov_9fa48("498"), 'staff')))))) && <Link to="/admin/assessment-grades" className={cn(stryMutAct_9fa48("499") ? "" : (stryCov_9fa48("499"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("502") ? location.pathname !== '/admin/assessment-grades' : stryMutAct_9fa48("501") ? false : stryMutAct_9fa48("500") ? true : (stryCov_9fa48("500", "501", "502"), location.pathname === (stryMutAct_9fa48("503") ? "" : (stryCov_9fa48("503"), '/admin/assessment-grades')))) ? stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), "bg-[#4242EA]") : stryMutAct_9fa48("505") ? "" : (stryCov_9fa48("505"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("506") ? "" : (stryCov_9fa48("506"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("507") ? "" : (stryCov_9fa48("507"), "ml-[50px] opacity-100") : stryMutAct_9fa48("508") ? "" : (stryCov_9fa48("508"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link>)}

        {/* Admissions - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("511") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/admissions-dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link> : stryMutAct_9fa48("510") ? false : stryMutAct_9fa48("509") ? true : (stryCov_9fa48("509", "510", "511"), (stryMutAct_9fa48("513") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("512") ? true : (stryCov_9fa48("512", "513"), (stryMutAct_9fa48("515") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("514") ? true : (stryCov_9fa48("514", "515"), (stryMutAct_9fa48("517") ? user?.role !== 'admin' : stryMutAct_9fa48("516") ? false : (stryCov_9fa48("516", "517"), (stryMutAct_9fa48("518") ? user.role : (stryCov_9fa48("518"), user?.role)) === (stryMutAct_9fa48("519") ? "" : (stryCov_9fa48("519"), 'admin')))) || (stryMutAct_9fa48("521") ? user?.role !== 'staff' : stryMutAct_9fa48("520") ? false : (stryCov_9fa48("520", "521"), (stryMutAct_9fa48("522") ? user.role : (stryCov_9fa48("522"), user?.role)) === (stryMutAct_9fa48("523") ? "" : (stryCov_9fa48("523"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/admissions-dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("524") ? "" : (stryCov_9fa48("524"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("527") ? location.pathname !== '/admissions-dashboard' : stryMutAct_9fa48("526") ? false : stryMutAct_9fa48("525") ? true : (stryCov_9fa48("525", "526", "527"), location.pathname === (stryMutAct_9fa48("528") ? "" : (stryCov_9fa48("528"), '/admissions-dashboard')))) ? stryMutAct_9fa48("529") ? "" : (stryCov_9fa48("529"), "bg-[#4242EA]") : stryMutAct_9fa48("530") ? "" : (stryCov_9fa48("530"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link>) : stryMutAct_9fa48("533") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/admissions-dashboard" className={cn("relative h-[44px] flex items-center", location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link> : stryMutAct_9fa48("532") ? false : stryMutAct_9fa48("531") ? true : (stryCov_9fa48("531", "532", "533"), (stryMutAct_9fa48("535") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("534") ? true : (stryCov_9fa48("534", "535"), (stryMutAct_9fa48("537") ? user?.role !== 'admin' : stryMutAct_9fa48("536") ? false : (stryCov_9fa48("536", "537"), (stryMutAct_9fa48("538") ? user.role : (stryCov_9fa48("538"), user?.role)) === (stryMutAct_9fa48("539") ? "" : (stryCov_9fa48("539"), 'admin')))) || (stryMutAct_9fa48("541") ? user?.role !== 'staff' : stryMutAct_9fa48("540") ? false : (stryCov_9fa48("540", "541"), (stryMutAct_9fa48("542") ? user.role : (stryCov_9fa48("542"), user?.role)) === (stryMutAct_9fa48("543") ? "" : (stryCov_9fa48("543"), 'staff')))))) && <Link to="/admissions-dashboard" className={cn(stryMutAct_9fa48("544") ? "" : (stryCov_9fa48("544"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("547") ? location.pathname !== '/admissions-dashboard' : stryMutAct_9fa48("546") ? false : stryMutAct_9fa48("545") ? true : (stryCov_9fa48("545", "546", "547"), location.pathname === (stryMutAct_9fa48("548") ? "" : (stryCov_9fa48("548"), '/admissions-dashboard')))) ? stryMutAct_9fa48("549") ? "" : (stryCov_9fa48("549"), "bg-[#4242EA]") : stryMutAct_9fa48("550") ? "" : (stryCov_9fa48("550"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("551") ? "" : (stryCov_9fa48("551"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("552") ? "" : (stryCov_9fa48("552"), "ml-[50px] opacity-100") : stryMutAct_9fa48("553") ? "" : (stryCov_9fa48("553"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link>)}

        {/* Content Generation - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("556") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/content" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/content' || location.pathname.startsWith('/content') ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
            </Link> : stryMutAct_9fa48("555") ? false : stryMutAct_9fa48("554") ? true : (stryCov_9fa48("554", "555", "556"), (stryMutAct_9fa48("558") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("557") ? true : (stryCov_9fa48("557", "558"), (stryMutAct_9fa48("560") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("559") ? true : (stryCov_9fa48("559", "560"), (stryMutAct_9fa48("562") ? user?.role !== 'admin' : stryMutAct_9fa48("561") ? false : (stryCov_9fa48("561", "562"), (stryMutAct_9fa48("563") ? user.role : (stryCov_9fa48("563"), user?.role)) === (stryMutAct_9fa48("564") ? "" : (stryCov_9fa48("564"), 'admin')))) || (stryMutAct_9fa48("566") ? user?.role !== 'staff' : stryMutAct_9fa48("565") ? false : (stryCov_9fa48("565", "566"), (stryMutAct_9fa48("567") ? user.role : (stryCov_9fa48("567"), user?.role)) === (stryMutAct_9fa48("568") ? "" : (stryCov_9fa48("568"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/content" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("569") ? "" : (stryCov_9fa48("569"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("572") ? location.pathname === '/content' && location.pathname.startsWith('/content') : stryMutAct_9fa48("571") ? false : stryMutAct_9fa48("570") ? true : (stryCov_9fa48("570", "571", "572"), (stryMutAct_9fa48("574") ? location.pathname !== '/content' : stryMutAct_9fa48("573") ? false : (stryCov_9fa48("573", "574"), location.pathname === (stryMutAct_9fa48("575") ? "" : (stryCov_9fa48("575"), '/content')))) || (stryMutAct_9fa48("576") ? location.pathname.endsWith('/content') : (stryCov_9fa48("576"), location.pathname.startsWith(stryMutAct_9fa48("577") ? "" : (stryCov_9fa48("577"), '/content')))))) ? stryMutAct_9fa48("578") ? "" : (stryCov_9fa48("578"), "bg-[#4242EA]") : stryMutAct_9fa48("579") ? "" : (stryCov_9fa48("579"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
            </Link>) : stryMutAct_9fa48("582") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/content" className={cn("relative h-[44px] flex items-center", location.pathname === '/content' || location.pathname.startsWith('/content') ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
              </Link> : stryMutAct_9fa48("581") ? false : stryMutAct_9fa48("580") ? true : (stryCov_9fa48("580", "581", "582"), (stryMutAct_9fa48("584") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("583") ? true : (stryCov_9fa48("583", "584"), (stryMutAct_9fa48("586") ? user?.role !== 'admin' : stryMutAct_9fa48("585") ? false : (stryCov_9fa48("585", "586"), (stryMutAct_9fa48("587") ? user.role : (stryCov_9fa48("587"), user?.role)) === (stryMutAct_9fa48("588") ? "" : (stryCov_9fa48("588"), 'admin')))) || (stryMutAct_9fa48("590") ? user?.role !== 'staff' : stryMutAct_9fa48("589") ? false : (stryCov_9fa48("589", "590"), (stryMutAct_9fa48("591") ? user.role : (stryCov_9fa48("591"), user?.role)) === (stryMutAct_9fa48("592") ? "" : (stryCov_9fa48("592"), 'staff')))))) && <Link to="/content" className={cn(stryMutAct_9fa48("593") ? "" : (stryCov_9fa48("593"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("596") ? location.pathname === '/content' && location.pathname.startsWith('/content') : stryMutAct_9fa48("595") ? false : stryMutAct_9fa48("594") ? true : (stryCov_9fa48("594", "595", "596"), (stryMutAct_9fa48("598") ? location.pathname !== '/content' : stryMutAct_9fa48("597") ? false : (stryCov_9fa48("597", "598"), location.pathname === (stryMutAct_9fa48("599") ? "" : (stryCov_9fa48("599"), '/content')))) || (stryMutAct_9fa48("600") ? location.pathname.endsWith('/content') : (stryCov_9fa48("600"), location.pathname.startsWith(stryMutAct_9fa48("601") ? "" : (stryCov_9fa48("601"), '/content')))))) ? stryMutAct_9fa48("602") ? "" : (stryCov_9fa48("602"), "bg-[#4242EA]") : stryMutAct_9fa48("603") ? "" : (stryCov_9fa48("603"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("604") ? "" : (stryCov_9fa48("604"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("605") ? "" : (stryCov_9fa48("605"), "ml-[50px] opacity-100") : stryMutAct_9fa48("606") ? "" : (stryCov_9fa48("606"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
              </Link>)}

        {/* AI Prompts - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("609") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/admin-prompts" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
              </Link> : stryMutAct_9fa48("608") ? false : stryMutAct_9fa48("607") ? true : (stryCov_9fa48("607", "608", "609"), (stryMutAct_9fa48("611") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("610") ? true : (stryCov_9fa48("610", "611"), (stryMutAct_9fa48("613") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("612") ? true : (stryCov_9fa48("612", "613"), (stryMutAct_9fa48("615") ? user?.role !== 'admin' : stryMutAct_9fa48("614") ? false : (stryCov_9fa48("614", "615"), (stryMutAct_9fa48("616") ? user.role : (stryCov_9fa48("616"), user?.role)) === (stryMutAct_9fa48("617") ? "" : (stryCov_9fa48("617"), 'admin')))) || (stryMutAct_9fa48("619") ? user?.role !== 'staff' : stryMutAct_9fa48("618") ? false : (stryCov_9fa48("618", "619"), (stryMutAct_9fa48("620") ? user.role : (stryCov_9fa48("620"), user?.role)) === (stryMutAct_9fa48("621") ? "" : (stryCov_9fa48("621"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/admin-prompts" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("622") ? "" : (stryCov_9fa48("622"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("625") ? location.pathname !== '/admin-prompts' : stryMutAct_9fa48("624") ? false : stryMutAct_9fa48("623") ? true : (stryCov_9fa48("623", "624", "625"), location.pathname === (stryMutAct_9fa48("626") ? "" : (stryCov_9fa48("626"), '/admin-prompts')))) ? stryMutAct_9fa48("627") ? "" : (stryCov_9fa48("627"), "bg-[#4242EA]") : stryMutAct_9fa48("628") ? "" : (stryCov_9fa48("628"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
              </Link>) : stryMutAct_9fa48("631") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/admin-prompts" className={cn("relative h-[44px] flex items-center", location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
              </Link> : stryMutAct_9fa48("630") ? false : stryMutAct_9fa48("629") ? true : (stryCov_9fa48("629", "630", "631"), (stryMutAct_9fa48("633") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("632") ? true : (stryCov_9fa48("632", "633"), (stryMutAct_9fa48("635") ? user?.role !== 'admin' : stryMutAct_9fa48("634") ? false : (stryCov_9fa48("634", "635"), (stryMutAct_9fa48("636") ? user.role : (stryCov_9fa48("636"), user?.role)) === (stryMutAct_9fa48("637") ? "" : (stryCov_9fa48("637"), 'admin')))) || (stryMutAct_9fa48("639") ? user?.role !== 'staff' : stryMutAct_9fa48("638") ? false : (stryCov_9fa48("638", "639"), (stryMutAct_9fa48("640") ? user.role : (stryCov_9fa48("640"), user?.role)) === (stryMutAct_9fa48("641") ? "" : (stryCov_9fa48("641"), 'staff')))))) && <Link to="/admin-prompts" className={cn(stryMutAct_9fa48("642") ? "" : (stryCov_9fa48("642"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("645") ? location.pathname !== '/admin-prompts' : stryMutAct_9fa48("644") ? false : stryMutAct_9fa48("643") ? true : (stryCov_9fa48("643", "644", "645"), location.pathname === (stryMutAct_9fa48("646") ? "" : (stryCov_9fa48("646"), '/admin-prompts')))) ? stryMutAct_9fa48("647") ? "" : (stryCov_9fa48("647"), "bg-[#4242EA]") : stryMutAct_9fa48("648") ? "" : (stryCov_9fa48("648"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("649") ? "" : (stryCov_9fa48("649"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("650") ? "" : (stryCov_9fa48("650"), "ml-[50px] opacity-100") : stryMutAct_9fa48("651") ? "" : (stryCov_9fa48("651"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
              </Link>)}

        {/* Volunteer Feedback - Show for volunteers and admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("654") ? (user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'} onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
              </Link> : stryMutAct_9fa48("653") ? false : stryMutAct_9fa48("652") ? true : (stryCov_9fa48("652", "653", "654"), (stryMutAct_9fa48("656") ? user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("655") ? true : (stryCov_9fa48("655", "656"), (stryMutAct_9fa48("658") ? (user?.role === 'volunteer' || user?.role === 'admin') && user?.role === 'staff' : stryMutAct_9fa48("657") ? true : (stryCov_9fa48("657", "658"), (stryMutAct_9fa48("660") ? user?.role === 'volunteer' && user?.role === 'admin' : stryMutAct_9fa48("659") ? false : (stryCov_9fa48("659", "660"), (stryMutAct_9fa48("662") ? user?.role !== 'volunteer' : stryMutAct_9fa48("661") ? false : (stryCov_9fa48("661", "662"), (stryMutAct_9fa48("663") ? user.role : (stryCov_9fa48("663"), user?.role)) === (stryMutAct_9fa48("664") ? "" : (stryCov_9fa48("664"), 'volunteer')))) || (stryMutAct_9fa48("666") ? user?.role !== 'admin' : stryMutAct_9fa48("665") ? false : (stryCov_9fa48("665", "666"), (stryMutAct_9fa48("667") ? user.role : (stryCov_9fa48("667"), user?.role)) === (stryMutAct_9fa48("668") ? "" : (stryCov_9fa48("668"), 'admin')))))) || (stryMutAct_9fa48("670") ? user?.role !== 'staff' : stryMutAct_9fa48("669") ? false : (stryCov_9fa48("669", "670"), (stryMutAct_9fa48("671") ? user.role : (stryCov_9fa48("671"), user?.role)) === (stryMutAct_9fa48("672") ? "" : (stryCov_9fa48("672"), 'staff')))))) && isMobileNavbarOpen)) && <Link to={(stryMutAct_9fa48("675") ? user?.role !== 'volunteer' : stryMutAct_9fa48("674") ? false : stryMutAct_9fa48("673") ? true : (stryCov_9fa48("673", "674", "675"), (stryMutAct_9fa48("676") ? user.role : (stryCov_9fa48("676"), user?.role)) === (stryMutAct_9fa48("677") ? "" : (stryCov_9fa48("677"), 'volunteer')))) ? stryMutAct_9fa48("678") ? "" : (stryCov_9fa48("678"), '/volunteer-feedback') : stryMutAct_9fa48("679") ? "" : (stryCov_9fa48("679"), '/admin-volunteer-feedback')} onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("680") ? "" : (stryCov_9fa48("680"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("683") ? location.pathname === '/volunteer-feedback' && location.pathname === '/admin-volunteer-feedback' : stryMutAct_9fa48("682") ? false : stryMutAct_9fa48("681") ? true : (stryCov_9fa48("681", "682", "683"), (stryMutAct_9fa48("685") ? location.pathname !== '/volunteer-feedback' : stryMutAct_9fa48("684") ? false : (stryCov_9fa48("684", "685"), location.pathname === (stryMutAct_9fa48("686") ? "" : (stryCov_9fa48("686"), '/volunteer-feedback')))) || (stryMutAct_9fa48("688") ? location.pathname !== '/admin-volunteer-feedback' : stryMutAct_9fa48("687") ? false : (stryCov_9fa48("687", "688"), location.pathname === (stryMutAct_9fa48("689") ? "" : (stryCov_9fa48("689"), '/admin-volunteer-feedback')))))) ? stryMutAct_9fa48("690") ? "" : (stryCov_9fa48("690"), "bg-[#4242EA]") : stryMutAct_9fa48("691") ? "" : (stryCov_9fa48("691"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
              </Link>) : stryMutAct_9fa48("694") ? user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff' || <Link to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'} className={cn("relative h-[44px] flex items-center", location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
              </Link> : stryMutAct_9fa48("693") ? false : stryMutAct_9fa48("692") ? true : (stryCov_9fa48("692", "693", "694"), (stryMutAct_9fa48("696") ? (user?.role === 'volunteer' || user?.role === 'admin') && user?.role === 'staff' : stryMutAct_9fa48("695") ? true : (stryCov_9fa48("695", "696"), (stryMutAct_9fa48("698") ? user?.role === 'volunteer' && user?.role === 'admin' : stryMutAct_9fa48("697") ? false : (stryCov_9fa48("697", "698"), (stryMutAct_9fa48("700") ? user?.role !== 'volunteer' : stryMutAct_9fa48("699") ? false : (stryCov_9fa48("699", "700"), (stryMutAct_9fa48("701") ? user.role : (stryCov_9fa48("701"), user?.role)) === (stryMutAct_9fa48("702") ? "" : (stryCov_9fa48("702"), 'volunteer')))) || (stryMutAct_9fa48("704") ? user?.role !== 'admin' : stryMutAct_9fa48("703") ? false : (stryCov_9fa48("703", "704"), (stryMutAct_9fa48("705") ? user.role : (stryCov_9fa48("705"), user?.role)) === (stryMutAct_9fa48("706") ? "" : (stryCov_9fa48("706"), 'admin')))))) || (stryMutAct_9fa48("708") ? user?.role !== 'staff' : stryMutAct_9fa48("707") ? false : (stryCov_9fa48("707", "708"), (stryMutAct_9fa48("709") ? user.role : (stryCov_9fa48("709"), user?.role)) === (stryMutAct_9fa48("710") ? "" : (stryCov_9fa48("710"), 'staff')))))) && <Link to={(stryMutAct_9fa48("713") ? user?.role !== 'volunteer' : stryMutAct_9fa48("712") ? false : stryMutAct_9fa48("711") ? true : (stryCov_9fa48("711", "712", "713"), (stryMutAct_9fa48("714") ? user.role : (stryCov_9fa48("714"), user?.role)) === (stryMutAct_9fa48("715") ? "" : (stryCov_9fa48("715"), 'volunteer')))) ? stryMutAct_9fa48("716") ? "" : (stryCov_9fa48("716"), '/volunteer-feedback') : stryMutAct_9fa48("717") ? "" : (stryCov_9fa48("717"), '/admin-volunteer-feedback')} className={cn(stryMutAct_9fa48("718") ? "" : (stryCov_9fa48("718"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("721") ? location.pathname === '/volunteer-feedback' && location.pathname === '/admin-volunteer-feedback' : stryMutAct_9fa48("720") ? false : stryMutAct_9fa48("719") ? true : (stryCov_9fa48("719", "720", "721"), (stryMutAct_9fa48("723") ? location.pathname !== '/volunteer-feedback' : stryMutAct_9fa48("722") ? false : (stryCov_9fa48("722", "723"), location.pathname === (stryMutAct_9fa48("724") ? "" : (stryCov_9fa48("724"), '/volunteer-feedback')))) || (stryMutAct_9fa48("726") ? location.pathname !== '/admin-volunteer-feedback' : stryMutAct_9fa48("725") ? false : (stryCov_9fa48("725", "726"), location.pathname === (stryMutAct_9fa48("727") ? "" : (stryCov_9fa48("727"), '/admin-volunteer-feedback')))))) ? stryMutAct_9fa48("728") ? "" : (stryCov_9fa48("728"), "bg-[#4242EA]") : stryMutAct_9fa48("729") ? "" : (stryCov_9fa48("729"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("730") ? "" : (stryCov_9fa48("730"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("731") ? "" : (stryCov_9fa48("731"), "ml-[50px] opacity-100") : stryMutAct_9fa48("732") ? "" : (stryCov_9fa48("732"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
              </Link>)}

        {/* Spacer to push profile and logout to bottom */}
        <div className="flex-1"></div>

        {/* Profile - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("735") ? isMobileNavbarOpen || <Link to="/account" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/account' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                  <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Account</span>
              </div>
              </Link> : stryMutAct_9fa48("734") ? false : stryMutAct_9fa48("733") ? true : (stryCov_9fa48("733", "734", "735"), isMobileNavbarOpen && <Link to="/account" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("736") ? "" : (stryCov_9fa48("736"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("739") ? location.pathname !== '/account' : stryMutAct_9fa48("738") ? false : stryMutAct_9fa48("737") ? true : (stryCov_9fa48("737", "738", "739"), location.pathname === (stryMutAct_9fa48("740") ? "" : (stryCov_9fa48("740"), '/account')))) ? stryMutAct_9fa48("741") ? "" : (stryCov_9fa48("741"), "bg-[#4242EA]") : stryMutAct_9fa48("742") ? "" : (stryCov_9fa48("742"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                  <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Account</span>
              </div>
              </Link>) : <Link to="/account" className={cn(stryMutAct_9fa48("743") ? "" : (stryCov_9fa48("743"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("746") ? location.pathname !== '/account' : stryMutAct_9fa48("745") ? false : stryMutAct_9fa48("744") ? true : (stryCov_9fa48("744", "745", "746"), location.pathname === (stryMutAct_9fa48("747") ? "" : (stryCov_9fa48("747"), '/account')))) ? stryMutAct_9fa48("748") ? "" : (stryCov_9fa48("748"), "bg-[#4242EA]") : stryMutAct_9fa48("749") ? "" : (stryCov_9fa48("749"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("750") ? "" : (stryCov_9fa48("750"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("751") ? "" : (stryCov_9fa48("751"), "ml-[50px] opacity-100") : stryMutAct_9fa48("752") ? "" : (stryCov_9fa48("752"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Account</span>
        </div>
          </Link>}

        {/* Logout - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("755") ? isMobileNavbarOpen || <button onClick={handleLogout} className="relative h-[53px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full">
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                  <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Logout</span>
              </div>
            </button> : stryMutAct_9fa48("754") ? false : stryMutAct_9fa48("753") ? true : (stryCov_9fa48("753", "754", "755"), isMobileNavbarOpen && <button onClick={handleLogout} className="relative h-[53px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full">
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                  <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Logout</span>
              </div>
            </button>) : <button onClick={handleLogout} className="relative h-[44px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full">
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 18" fill="none" transform="rotate(90)">
                <path d="M6 17L2 13L6 9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 7V5C10 3.93913 9.57857 2.92172 8.82843 2.17157C8.07828 1.42143 7.06087 1 6 1H4" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("756") ? "" : (stryCov_9fa48("756"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("757") ? "" : (stryCov_9fa48("757"), "ml-[50px] opacity-100") : stryMutAct_9fa48("758") ? "" : (stryCov_9fa48("758"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Logout</span>
            </div>
          </button>}
      </nav>
      
      {/* Main Content - Desktop: 50px left margin for collapsed navbar, Mobile: no margin */}
      <main className={cn(stryMutAct_9fa48("759") ? "" : (stryCov_9fa48("759"), "flex-1 overflow-auto bg-[#EFEFEF]"), isMobile ? stryMutAct_9fa48("760") ? "" : (stryCov_9fa48("760"), "ml-0") : stryMutAct_9fa48("761") ? "" : (stryCov_9fa48("761"), "ml-[50px]"))}>
        {/* Mobile Header Bar - Only show on mobile */}
        {stryMutAct_9fa48("764") ? isMobile || <div className="sticky top-0 z-50 bg-[#E751E7] h-[53px] flex items-center justify-end px-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 15C8 15 9.5 13 12 13C14.5 13 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="9" cy="9" r="1" fill="currentColor" />
                  <circle cx="15" cy="9" r="1" fill="currentColor" />
                </svg>
                <span className="text-white font-medium">( 3 ) missed assignments</span>
              </div>
            </div>
          </div> : stryMutAct_9fa48("763") ? false : stryMutAct_9fa48("762") ? true : (stryCov_9fa48("762", "763", "764"), isMobile && <div className="sticky top-0 z-50 bg-[#E751E7] h-[53px] flex items-center justify-end px-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M8 15C8 15 9.5 13 12 13C14.5 13 16 15 16 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="9" cy="9" r="1" fill="currentColor" />
                  <circle cx="15" cy="9" r="1" fill="currentColor" />
                </svg>
                <span className="text-white font-medium">( 3 ) missed assignments</span>
              </div>
            </div>
          </div>)}
        
        {/* Page Content */}
        {children}
      </main>
    </div>;
  }
};
export default Layout;