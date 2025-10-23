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
  if (stryMutAct_9fa48("1247")) {
    {}
  } else {
    stryCov_9fa48("1247");
    const [isNavbarHovered, setIsNavbarHovered] = useState(stryMutAct_9fa48("1248") ? true : (stryCov_9fa48("1248"), false));
    const [isMobileNavbarOpen, setIsMobileNavbarOpen] = useState(stryMutAct_9fa48("1249") ? true : (stryCov_9fa48("1249"), false));
    const [isMobile, setIsMobile] = useState(stryMutAct_9fa48("1250") ? true : (stryCov_9fa48("1250"), false));
    const {
      logout,
      user
    } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Detect mobile vs desktop
    useEffect(() => {
      if (stryMutAct_9fa48("1251")) {
        {}
      } else {
        stryCov_9fa48("1251");
        const checkMobile = () => {
          if (stryMutAct_9fa48("1252")) {
            {}
          } else {
            stryCov_9fa48("1252");
            setIsMobile(stryMutAct_9fa48("1256") ? window.innerWidth >= 768 : stryMutAct_9fa48("1255") ? window.innerWidth <= 768 : stryMutAct_9fa48("1254") ? false : stryMutAct_9fa48("1253") ? true : (stryCov_9fa48("1253", "1254", "1255", "1256"), window.innerWidth < 768)); // Mobile breakpoint
          }
        };
        checkMobile();
        window.addEventListener(stryMutAct_9fa48("1257") ? "" : (stryCov_9fa48("1257"), 'resize'), checkMobile);
        return stryMutAct_9fa48("1258") ? () => undefined : (stryCov_9fa48("1258"), () => window.removeEventListener(stryMutAct_9fa48("1259") ? "" : (stryCov_9fa48("1259"), 'resize'), checkMobile));
      }
    }, stryMutAct_9fa48("1260") ? ["Stryker was here"] : (stryCov_9fa48("1260"), []));
    const handleLogout = () => {
      if (stryMutAct_9fa48("1261")) {
        {}
      } else {
        stryCov_9fa48("1261");
        logout();
        navigate(stryMutAct_9fa48("1262") ? "" : (stryCov_9fa48("1262"), '/login'));
      }
    };
    const toggleMobileNavbar = () => {
      if (stryMutAct_9fa48("1263")) {
        {}
      } else {
        stryCov_9fa48("1263");
        setIsMobileNavbarOpen(stryMutAct_9fa48("1264") ? isMobileNavbarOpen : (stryCov_9fa48("1264"), !isMobileNavbarOpen));
      }
    };
    const closeMobileNavbar = () => {
      if (stryMutAct_9fa48("1265")) {
        {}
      } else {
        stryCov_9fa48("1265");
        setIsMobileNavbarOpen(stryMutAct_9fa48("1266") ? true : (stryCov_9fa48("1266"), false));
      }
    };

    // Get the current page icon for mobile menu button
    const getCurrentPageIcon = () => {
      if (stryMutAct_9fa48("1267")) {
        {}
      } else {
        stryCov_9fa48("1267");
        const iconMap = stryMutAct_9fa48("1268") ? {} : (stryCov_9fa48("1268"), {
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
        if (stryMutAct_9fa48("1271") ? location.pathname === '/admin-dashboard' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("1270") ? false : stryMutAct_9fa48("1269") ? true : (stryCov_9fa48("1269", "1270", "1271"), (stryMutAct_9fa48("1273") ? location.pathname !== '/admin-dashboard' : stryMutAct_9fa48("1272") ? true : (stryCov_9fa48("1272", "1273"), location.pathname === (stryMutAct_9fa48("1274") ? "" : (stryCov_9fa48("1274"), '/admin-dashboard')))) && (stryMutAct_9fa48("1276") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1275") ? true : (stryCov_9fa48("1275", "1276"), (stryMutAct_9fa48("1278") ? user?.role !== 'admin' : stryMutAct_9fa48("1277") ? false : (stryCov_9fa48("1277", "1278"), (stryMutAct_9fa48("1279") ? user.role : (stryCov_9fa48("1279"), user?.role)) === (stryMutAct_9fa48("1280") ? "" : (stryCov_9fa48("1280"), 'admin')))) || (stryMutAct_9fa48("1282") ? user?.role !== 'staff' : stryMutAct_9fa48("1281") ? false : (stryCov_9fa48("1281", "1282"), (stryMutAct_9fa48("1283") ? user.role : (stryCov_9fa48("1283"), user?.role)) === (stryMutAct_9fa48("1284") ? "" : (stryCov_9fa48("1284"), 'staff')))))))) {
          if (stryMutAct_9fa48("1285")) {
            {}
          } else {
            stryCov_9fa48("1285");
            return <Settings className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("1288") ? location.pathname === '/admin/assessment-grades' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("1287") ? false : stryMutAct_9fa48("1286") ? true : (stryCov_9fa48("1286", "1287", "1288"), (stryMutAct_9fa48("1290") ? location.pathname !== '/admin/assessment-grades' : stryMutAct_9fa48("1289") ? true : (stryCov_9fa48("1289", "1290"), location.pathname === (stryMutAct_9fa48("1291") ? "" : (stryCov_9fa48("1291"), '/admin/assessment-grades')))) && (stryMutAct_9fa48("1293") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1292") ? true : (stryCov_9fa48("1292", "1293"), (stryMutAct_9fa48("1295") ? user?.role !== 'admin' : stryMutAct_9fa48("1294") ? false : (stryCov_9fa48("1294", "1295"), (stryMutAct_9fa48("1296") ? user.role : (stryCov_9fa48("1296"), user?.role)) === (stryMutAct_9fa48("1297") ? "" : (stryCov_9fa48("1297"), 'admin')))) || (stryMutAct_9fa48("1299") ? user?.role !== 'staff' : stryMutAct_9fa48("1298") ? false : (stryCov_9fa48("1298", "1299"), (stryMutAct_9fa48("1300") ? user.role : (stryCov_9fa48("1300"), user?.role)) === (stryMutAct_9fa48("1301") ? "" : (stryCov_9fa48("1301"), 'staff')))))))) {
          if (stryMutAct_9fa48("1302")) {
            {}
          } else {
            stryCov_9fa48("1302");
            return <Award className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("1305") ? location.pathname === '/admissions-dashboard' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("1304") ? false : stryMutAct_9fa48("1303") ? true : (stryCov_9fa48("1303", "1304", "1305"), (stryMutAct_9fa48("1307") ? location.pathname !== '/admissions-dashboard' : stryMutAct_9fa48("1306") ? true : (stryCov_9fa48("1306", "1307"), location.pathname === (stryMutAct_9fa48("1308") ? "" : (stryCov_9fa48("1308"), '/admissions-dashboard')))) && (stryMutAct_9fa48("1310") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1309") ? true : (stryCov_9fa48("1309", "1310"), (stryMutAct_9fa48("1312") ? user?.role !== 'admin' : stryMutAct_9fa48("1311") ? false : (stryCov_9fa48("1311", "1312"), (stryMutAct_9fa48("1313") ? user.role : (stryCov_9fa48("1313"), user?.role)) === (stryMutAct_9fa48("1314") ? "" : (stryCov_9fa48("1314"), 'admin')))) || (stryMutAct_9fa48("1316") ? user?.role !== 'staff' : stryMutAct_9fa48("1315") ? false : (stryCov_9fa48("1315", "1316"), (stryMutAct_9fa48("1317") ? user.role : (stryCov_9fa48("1317"), user?.role)) === (stryMutAct_9fa48("1318") ? "" : (stryCov_9fa48("1318"), 'staff')))))))) {
          if (stryMutAct_9fa48("1319")) {
            {}
          } else {
            stryCov_9fa48("1319");
            return <Users className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("1322") ? location.pathname === '/content' || location.pathname.startsWith('/content') || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("1321") ? false : stryMutAct_9fa48("1320") ? true : (stryCov_9fa48("1320", "1321", "1322"), (stryMutAct_9fa48("1324") ? location.pathname === '/content' && location.pathname.startsWith('/content') : stryMutAct_9fa48("1323") ? true : (stryCov_9fa48("1323", "1324"), (stryMutAct_9fa48("1326") ? location.pathname !== '/content' : stryMutAct_9fa48("1325") ? false : (stryCov_9fa48("1325", "1326"), location.pathname === (stryMutAct_9fa48("1327") ? "" : (stryCov_9fa48("1327"), '/content')))) || (stryMutAct_9fa48("1328") ? location.pathname.endsWith('/content') : (stryCov_9fa48("1328"), location.pathname.startsWith(stryMutAct_9fa48("1329") ? "" : (stryCov_9fa48("1329"), '/content')))))) && (stryMutAct_9fa48("1331") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1330") ? true : (stryCov_9fa48("1330", "1331"), (stryMutAct_9fa48("1333") ? user?.role !== 'admin' : stryMutAct_9fa48("1332") ? false : (stryCov_9fa48("1332", "1333"), (stryMutAct_9fa48("1334") ? user.role : (stryCov_9fa48("1334"), user?.role)) === (stryMutAct_9fa48("1335") ? "" : (stryCov_9fa48("1335"), 'admin')))) || (stryMutAct_9fa48("1337") ? user?.role !== 'staff' : stryMutAct_9fa48("1336") ? false : (stryCov_9fa48("1336", "1337"), (stryMutAct_9fa48("1338") ? user.role : (stryCov_9fa48("1338"), user?.role)) === (stryMutAct_9fa48("1339") ? "" : (stryCov_9fa48("1339"), 'staff')))))))) {
          if (stryMutAct_9fa48("1340")) {
            {}
          } else {
            stryCov_9fa48("1340");
            return <Bug className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("1343") ? location.pathname === '/admin-prompts' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("1342") ? false : stryMutAct_9fa48("1341") ? true : (stryCov_9fa48("1341", "1342", "1343"), (stryMutAct_9fa48("1345") ? location.pathname !== '/admin-prompts' : stryMutAct_9fa48("1344") ? true : (stryCov_9fa48("1344", "1345"), location.pathname === (stryMutAct_9fa48("1346") ? "" : (stryCov_9fa48("1346"), '/admin-prompts')))) && (stryMutAct_9fa48("1348") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1347") ? true : (stryCov_9fa48("1347", "1348"), (stryMutAct_9fa48("1350") ? user?.role !== 'admin' : stryMutAct_9fa48("1349") ? false : (stryCov_9fa48("1349", "1350"), (stryMutAct_9fa48("1351") ? user.role : (stryCov_9fa48("1351"), user?.role)) === (stryMutAct_9fa48("1352") ? "" : (stryCov_9fa48("1352"), 'admin')))) || (stryMutAct_9fa48("1354") ? user?.role !== 'staff' : stryMutAct_9fa48("1353") ? false : (stryCov_9fa48("1353", "1354"), (stryMutAct_9fa48("1355") ? user.role : (stryCov_9fa48("1355"), user?.role)) === (stryMutAct_9fa48("1356") ? "" : (stryCov_9fa48("1356"), 'staff')))))))) {
          if (stryMutAct_9fa48("1357")) {
            {}
          } else {
            stryCov_9fa48("1357");
            return <Brain className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        if (stryMutAct_9fa48("1360") ? location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' || user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff' : stryMutAct_9fa48("1359") ? false : stryMutAct_9fa48("1358") ? true : (stryCov_9fa48("1358", "1359", "1360"), (stryMutAct_9fa48("1362") ? location.pathname === '/volunteer-feedback' && location.pathname === '/admin-volunteer-feedback' : stryMutAct_9fa48("1361") ? true : (stryCov_9fa48("1361", "1362"), (stryMutAct_9fa48("1364") ? location.pathname !== '/volunteer-feedback' : stryMutAct_9fa48("1363") ? false : (stryCov_9fa48("1363", "1364"), location.pathname === (stryMutAct_9fa48("1365") ? "" : (stryCov_9fa48("1365"), '/volunteer-feedback')))) || (stryMutAct_9fa48("1367") ? location.pathname !== '/admin-volunteer-feedback' : stryMutAct_9fa48("1366") ? false : (stryCov_9fa48("1366", "1367"), location.pathname === (stryMutAct_9fa48("1368") ? "" : (stryCov_9fa48("1368"), '/admin-volunteer-feedback')))))) && (stryMutAct_9fa48("1370") ? (user?.role === 'volunteer' || user?.role === 'admin') && user?.role === 'staff' : stryMutAct_9fa48("1369") ? true : (stryCov_9fa48("1369", "1370"), (stryMutAct_9fa48("1372") ? user?.role === 'volunteer' && user?.role === 'admin' : stryMutAct_9fa48("1371") ? false : (stryCov_9fa48("1371", "1372"), (stryMutAct_9fa48("1374") ? user?.role !== 'volunteer' : stryMutAct_9fa48("1373") ? false : (stryCov_9fa48("1373", "1374"), (stryMutAct_9fa48("1375") ? user.role : (stryCov_9fa48("1375"), user?.role)) === (stryMutAct_9fa48("1376") ? "" : (stryCov_9fa48("1376"), 'volunteer')))) || (stryMutAct_9fa48("1378") ? user?.role !== 'admin' : stryMutAct_9fa48("1377") ? false : (stryCov_9fa48("1377", "1378"), (stryMutAct_9fa48("1379") ? user.role : (stryCov_9fa48("1379"), user?.role)) === (stryMutAct_9fa48("1380") ? "" : (stryCov_9fa48("1380"), 'admin')))))) || (stryMutAct_9fa48("1382") ? user?.role !== 'staff' : stryMutAct_9fa48("1381") ? false : (stryCov_9fa48("1381", "1382"), (stryMutAct_9fa48("1383") ? user.role : (stryCov_9fa48("1383"), user?.role)) === (stryMutAct_9fa48("1384") ? "" : (stryCov_9fa48("1384"), 'staff')))))))) {
          if (stryMutAct_9fa48("1385")) {
            {}
          } else {
            stryCov_9fa48("1385");
            return <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />;
          }
        }
        return stryMutAct_9fa48("1388") ? iconMap[location.pathname] && logo : stryMutAct_9fa48("1387") ? false : stryMutAct_9fa48("1386") ? true : (stryCov_9fa48("1386", "1387", "1388"), iconMap[location.pathname] || logo);
      }
    };
    return <div className="flex h-screen w-full bg-background">
      {/* Sidebar - Responsive behavior */}
      <nav className={cn(stryMutAct_9fa48("1389") ? "" : (stryCov_9fa48("1389"), "bg-[#1E1E1E] flex flex-col fixed left-0 top-0 h-full transition-all duration-300 z-[60]"), isMobile ? isMobileNavbarOpen ? stryMutAct_9fa48("1390") ? "" : (stryCov_9fa48("1390"), "w-[386px]") // Mobile expanded width (overlay)
      : stryMutAct_9fa48("1391") ? "" : (stryCov_9fa48("1391"), "w-0") // Mobile collapsed: completely hidden
      : isNavbarHovered ? stryMutAct_9fa48("1392") ? "" : (stryCov_9fa48("1392"), "w-[200px]") // Desktop expanded width
      : stryMutAct_9fa48("1393") ? "" : (stryCov_9fa48("1393"), "w-[50px]") // Desktop collapsed width
      )} onMouseEnter={stryMutAct_9fa48("1394") ? () => undefined : (stryCov_9fa48("1394"), () => stryMutAct_9fa48("1397") ? !isMobile || setIsNavbarHovered(true) : stryMutAct_9fa48("1396") ? false : stryMutAct_9fa48("1395") ? true : (stryCov_9fa48("1395", "1396", "1397"), (stryMutAct_9fa48("1398") ? isMobile : (stryCov_9fa48("1398"), !isMobile)) && setIsNavbarHovered(stryMutAct_9fa48("1399") ? false : (stryCov_9fa48("1399"), true))))} onMouseLeave={stryMutAct_9fa48("1400") ? () => undefined : (stryCov_9fa48("1400"), () => stryMutAct_9fa48("1403") ? !isMobile || setIsNavbarHovered(false) : stryMutAct_9fa48("1402") ? false : stryMutAct_9fa48("1401") ? true : (stryCov_9fa48("1401", "1402", "1403"), (stryMutAct_9fa48("1404") ? isMobile : (stryCov_9fa48("1404"), !isMobile)) && setIsNavbarHovered(stryMutAct_9fa48("1405") ? true : (stryCov_9fa48("1405"), false))))}>
        {/* Mobile Menu Button / Current Page Indicator */}
        {isMobile ?
        // Mobile: Show current page icon as menu button
        <div className="relative">
            <button onClick={toggleMobileNavbar} className={cn(stryMutAct_9fa48("1406") ? "" : (stryCov_9fa48("1406"), "w-[60px] h-[53px] flex items-center justify-center"), isMobileNavbarOpen ? stryMutAct_9fa48("1407") ? "" : (stryCov_9fa48("1407"), "bg-[#4242EA]") : stryMutAct_9fa48("1408") ? "" : (stryCov_9fa48("1408"), "bg-[#4242EA] hover:bg-blue-600"))}>
              {(stryMutAct_9fa48("1411") ? location.pathname !== '/dashboard' : stryMutAct_9fa48("1410") ? false : stryMutAct_9fa48("1409") ? true : (stryCov_9fa48("1409", "1410", "1411"), location.pathname === (stryMutAct_9fa48("1412") ? "" : (stryCov_9fa48("1412"), '/dashboard')))) ? <img src={logo} alt="Logo" className="h-5 w-5 object-contain" /> : getCurrentPageIcon()}
            </button>

            {/* Mobile Navbar Overlay - Only show when expanded */}
            {stryMutAct_9fa48("1415") ? isMobileNavbarOpen || <>
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
              </> : stryMutAct_9fa48("1414") ? false : stryMutAct_9fa48("1413") ? true : (stryCov_9fa48("1413", "1414", "1415"), isMobileNavbarOpen && <>
                {/* Mobile Navbar Content */}
                <div className="absolute top-[53px] left-0 w-[386px] h-[calc(100vh-53px)] bg-[#1E1E1E] z-[70]">
                  {/* Dashboard */}
                  <Link to="/dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1416") ? "" : (stryCov_9fa48("1416"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1419") ? location.pathname !== '/dashboard' : stryMutAct_9fa48("1418") ? false : stryMutAct_9fa48("1417") ? true : (stryCov_9fa48("1417", "1418", "1419"), location.pathname === (stryMutAct_9fa48("1420") ? "" : (stryCov_9fa48("1420"), '/dashboard')))) ? stryMutAct_9fa48("1421") ? "" : (stryCov_9fa48("1421"), "bg-[#4242EA]") : stryMutAct_9fa48("1422") ? "" : (stryCov_9fa48("1422"), "hover:bg-gray-800"))}>
                    <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                      <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
                    </div>
                    <div className="flex items-center ml-[60px]">
                      <span className="text-white text-sm font-medium">Dashboard</span>
                    </div>
                  </Link>

                  {/* Learning */}
                  <Link to="/learning" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1423") ? "" : (stryCov_9fa48("1423"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1426") ? location.pathname !== '/learning' : stryMutAct_9fa48("1425") ? false : stryMutAct_9fa48("1424") ? true : (stryCov_9fa48("1424", "1425", "1426"), location.pathname === (stryMutAct_9fa48("1427") ? "" : (stryCov_9fa48("1427"), '/learning')))) ? stryMutAct_9fa48("1428") ? "" : (stryCov_9fa48("1428"), "bg-[#4242EA]") : stryMutAct_9fa48("1429") ? "" : (stryCov_9fa48("1429"), "hover:bg-gray-800"))}>
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
                  <Link to="/gpt" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1430") ? "" : (stryCov_9fa48("1430"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1433") ? location.pathname !== '/gpt' : stryMutAct_9fa48("1432") ? false : stryMutAct_9fa48("1431") ? true : (stryCov_9fa48("1431", "1432", "1433"), location.pathname === (stryMutAct_9fa48("1434") ? "" : (stryCov_9fa48("1434"), '/gpt')))) ? stryMutAct_9fa48("1435") ? "" : (stryCov_9fa48("1435"), "bg-[#4242EA]") : stryMutAct_9fa48("1436") ? "" : (stryCov_9fa48("1436"), "hover:bg-gray-800"))}>
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
                  <Link to="/calendar" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1437") ? "" : (stryCov_9fa48("1437"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1440") ? location.pathname !== '/calendar' : stryMutAct_9fa48("1439") ? false : stryMutAct_9fa48("1438") ? true : (stryCov_9fa48("1438", "1439", "1440"), location.pathname === (stryMutAct_9fa48("1441") ? "" : (stryCov_9fa48("1441"), '/calendar')))) ? stryMutAct_9fa48("1442") ? "" : (stryCov_9fa48("1442"), "bg-[#4242EA]") : stryMutAct_9fa48("1443") ? "" : (stryCov_9fa48("1443"), "hover:bg-gray-800"))}>
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
                  <Link to="/stats" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1444") ? "" : (stryCov_9fa48("1444"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1447") ? location.pathname !== '/stats' : stryMutAct_9fa48("1446") ? false : stryMutAct_9fa48("1445") ? true : (stryCov_9fa48("1445", "1446", "1447"), location.pathname === (stryMutAct_9fa48("1448") ? "" : (stryCov_9fa48("1448"), '/stats')))) ? stryMutAct_9fa48("1449") ? "" : (stryCov_9fa48("1449"), "bg-[#4242EA]") : stryMutAct_9fa48("1450") ? "" : (stryCov_9fa48("1450"), "hover:bg-gray-800"))}>
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
                  <Link to="/assessment" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1451") ? "" : (stryCov_9fa48("1451"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1454") ? location.pathname !== '/assessment' : stryMutAct_9fa48("1453") ? false : stryMutAct_9fa48("1452") ? true : (stryCov_9fa48("1452", "1453", "1454"), location.pathname === (stryMutAct_9fa48("1455") ? "" : (stryCov_9fa48("1455"), '/assessment')))) ? stryMutAct_9fa48("1456") ? "" : (stryCov_9fa48("1456"), "bg-[#4242EA]") : stryMutAct_9fa48("1457") ? "" : (stryCov_9fa48("1457"), "hover:bg-gray-800"))}>
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
                  {stryMutAct_9fa48("1460") ? user?.role === 'admin' || user?.role === 'staff' || <>
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
                    </> : stryMutAct_9fa48("1459") ? false : stryMutAct_9fa48("1458") ? true : (stryCov_9fa48("1458", "1459", "1460"), (stryMutAct_9fa48("1462") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1461") ? true : (stryCov_9fa48("1461", "1462"), (stryMutAct_9fa48("1464") ? user?.role !== 'admin' : stryMutAct_9fa48("1463") ? false : (stryCov_9fa48("1463", "1464"), (stryMutAct_9fa48("1465") ? user.role : (stryCov_9fa48("1465"), user?.role)) === (stryMutAct_9fa48("1466") ? "" : (stryCov_9fa48("1466"), 'admin')))) || (stryMutAct_9fa48("1468") ? user?.role !== 'staff' : stryMutAct_9fa48("1467") ? false : (stryCov_9fa48("1467", "1468"), (stryMutAct_9fa48("1469") ? user.role : (stryCov_9fa48("1469"), user?.role)) === (stryMutAct_9fa48("1470") ? "" : (stryCov_9fa48("1470"), 'staff')))))) && <>
                      {/* Admin Dashboard */}
                      <Link to="/admin-dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1471") ? "" : (stryCov_9fa48("1471"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1474") ? location.pathname !== '/admin-dashboard' : stryMutAct_9fa48("1473") ? false : stryMutAct_9fa48("1472") ? true : (stryCov_9fa48("1472", "1473", "1474"), location.pathname === (stryMutAct_9fa48("1475") ? "" : (stryCov_9fa48("1475"), '/admin-dashboard')))) ? stryMutAct_9fa48("1476") ? "" : (stryCov_9fa48("1476"), "bg-[#4242EA]") : stryMutAct_9fa48("1477") ? "" : (stryCov_9fa48("1477"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Settings className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admin Dashboard</span>
                        </div>
                      </Link>

                      {/* Assessment Grades */}
                      <Link to="/admin/assessment-grades" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1478") ? "" : (stryCov_9fa48("1478"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1481") ? location.pathname !== '/admin/assessment-grades' : stryMutAct_9fa48("1480") ? false : stryMutAct_9fa48("1479") ? true : (stryCov_9fa48("1479", "1480", "1481"), location.pathname === (stryMutAct_9fa48("1482") ? "" : (stryCov_9fa48("1482"), '/admin/assessment-grades')))) ? stryMutAct_9fa48("1483") ? "" : (stryCov_9fa48("1483"), "bg-[#4242EA]") : stryMutAct_9fa48("1484") ? "" : (stryCov_9fa48("1484"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Award className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Assessment Grades</span>
                        </div>
                      </Link>

                      {/* Admissions */}
                      <Link to="/admissions-dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1485") ? "" : (stryCov_9fa48("1485"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1488") ? location.pathname !== '/admissions-dashboard' : stryMutAct_9fa48("1487") ? false : stryMutAct_9fa48("1486") ? true : (stryCov_9fa48("1486", "1487", "1488"), location.pathname === (stryMutAct_9fa48("1489") ? "" : (stryCov_9fa48("1489"), '/admissions-dashboard')))) ? stryMutAct_9fa48("1490") ? "" : (stryCov_9fa48("1490"), "bg-[#4242EA]") : stryMutAct_9fa48("1491") ? "" : (stryCov_9fa48("1491"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Users className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Admissions</span>
                        </div>
                      </Link>

                      {/* Content Generation */}
                      <Link to="/content" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1492") ? "" : (stryCov_9fa48("1492"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1495") ? location.pathname === '/content' && location.pathname.startsWith('/content') : stryMutAct_9fa48("1494") ? false : stryMutAct_9fa48("1493") ? true : (stryCov_9fa48("1493", "1494", "1495"), (stryMutAct_9fa48("1497") ? location.pathname !== '/content' : stryMutAct_9fa48("1496") ? false : (stryCov_9fa48("1496", "1497"), location.pathname === (stryMutAct_9fa48("1498") ? "" : (stryCov_9fa48("1498"), '/content')))) || (stryMutAct_9fa48("1499") ? location.pathname.endsWith('/content') : (stryCov_9fa48("1499"), location.pathname.startsWith(stryMutAct_9fa48("1500") ? "" : (stryCov_9fa48("1500"), '/content')))))) ? stryMutAct_9fa48("1501") ? "" : (stryCov_9fa48("1501"), "bg-[#4242EA]") : stryMutAct_9fa48("1502") ? "" : (stryCov_9fa48("1502"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Bug className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">Content Generation</span>
                        </div>
                      </Link>

                      {/* AI Prompts */}
                      <Link to="/admin-prompts" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1503") ? "" : (stryCov_9fa48("1503"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1506") ? location.pathname !== '/admin-prompts' : stryMutAct_9fa48("1505") ? false : stryMutAct_9fa48("1504") ? true : (stryCov_9fa48("1504", "1505", "1506"), location.pathname === (stryMutAct_9fa48("1507") ? "" : (stryCov_9fa48("1507"), '/admin-prompts')))) ? stryMutAct_9fa48("1508") ? "" : (stryCov_9fa48("1508"), "bg-[#4242EA]") : stryMutAct_9fa48("1509") ? "" : (stryCov_9fa48("1509"), "hover:bg-gray-800"))}>
                        <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                          <Brain className="h-4 w-4 text-[#E3E3E3]" />
                        </div>
                        <div className="flex items-center ml-[60px]">
                          <span className="text-white text-sm font-medium">AI Prompts</span>
                        </div>
                      </Link>
                    </>)}

                  {/* Volunteer Feedback */}
                  {stryMutAct_9fa48("1512") ? user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff' || <Link to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'} onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center border-b border-gray-700", location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
                      <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
                      </div>
                      <div className="flex items-center ml-[60px]">
                        <span className="text-white text-sm font-medium">Volunteer Feedback</span>
                      </div>
                    </Link> : stryMutAct_9fa48("1511") ? false : stryMutAct_9fa48("1510") ? true : (stryCov_9fa48("1510", "1511", "1512"), (stryMutAct_9fa48("1514") ? (user?.role === 'volunteer' || user?.role === 'admin') && user?.role === 'staff' : stryMutAct_9fa48("1513") ? true : (stryCov_9fa48("1513", "1514"), (stryMutAct_9fa48("1516") ? user?.role === 'volunteer' && user?.role === 'admin' : stryMutAct_9fa48("1515") ? false : (stryCov_9fa48("1515", "1516"), (stryMutAct_9fa48("1518") ? user?.role !== 'volunteer' : stryMutAct_9fa48("1517") ? false : (stryCov_9fa48("1517", "1518"), (stryMutAct_9fa48("1519") ? user.role : (stryCov_9fa48("1519"), user?.role)) === (stryMutAct_9fa48("1520") ? "" : (stryCov_9fa48("1520"), 'volunteer')))) || (stryMutAct_9fa48("1522") ? user?.role !== 'admin' : stryMutAct_9fa48("1521") ? false : (stryCov_9fa48("1521", "1522"), (stryMutAct_9fa48("1523") ? user.role : (stryCov_9fa48("1523"), user?.role)) === (stryMutAct_9fa48("1524") ? "" : (stryCov_9fa48("1524"), 'admin')))))) || (stryMutAct_9fa48("1526") ? user?.role !== 'staff' : stryMutAct_9fa48("1525") ? false : (stryCov_9fa48("1525", "1526"), (stryMutAct_9fa48("1527") ? user.role : (stryCov_9fa48("1527"), user?.role)) === (stryMutAct_9fa48("1528") ? "" : (stryCov_9fa48("1528"), 'staff')))))) && <Link to={(stryMutAct_9fa48("1531") ? user?.role !== 'volunteer' : stryMutAct_9fa48("1530") ? false : stryMutAct_9fa48("1529") ? true : (stryCov_9fa48("1529", "1530", "1531"), (stryMutAct_9fa48("1532") ? user.role : (stryCov_9fa48("1532"), user?.role)) === (stryMutAct_9fa48("1533") ? "" : (stryCov_9fa48("1533"), 'volunteer')))) ? stryMutAct_9fa48("1534") ? "" : (stryCov_9fa48("1534"), '/volunteer-feedback') : stryMutAct_9fa48("1535") ? "" : (stryCov_9fa48("1535"), '/admin-volunteer-feedback')} onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1536") ? "" : (stryCov_9fa48("1536"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1539") ? location.pathname === '/volunteer-feedback' && location.pathname === '/admin-volunteer-feedback' : stryMutAct_9fa48("1538") ? false : stryMutAct_9fa48("1537") ? true : (stryCov_9fa48("1537", "1538", "1539"), (stryMutAct_9fa48("1541") ? location.pathname !== '/volunteer-feedback' : stryMutAct_9fa48("1540") ? false : (stryCov_9fa48("1540", "1541"), location.pathname === (stryMutAct_9fa48("1542") ? "" : (stryCov_9fa48("1542"), '/volunteer-feedback')))) || (stryMutAct_9fa48("1544") ? location.pathname !== '/admin-volunteer-feedback' : stryMutAct_9fa48("1543") ? false : (stryCov_9fa48("1543", "1544"), location.pathname === (stryMutAct_9fa48("1545") ? "" : (stryCov_9fa48("1545"), '/admin-volunteer-feedback')))))) ? stryMutAct_9fa48("1546") ? "" : (stryCov_9fa48("1546"), "bg-[#4242EA]") : stryMutAct_9fa48("1547") ? "" : (stryCov_9fa48("1547"), "hover:bg-gray-800"))}>
                      <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
                      </div>
                      <div className="flex items-center ml-[60px]">
                        <span className="text-white text-sm font-medium">Volunteer Feedback</span>
                      </div>
                    </Link>)}

                  {/* Account */}
                  <Link to="/account" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1548") ? "" : (stryCov_9fa48("1548"), "relative h-[53px] flex items-center border-b border-gray-700"), (stryMutAct_9fa48("1551") ? location.pathname !== '/account' : stryMutAct_9fa48("1550") ? false : stryMutAct_9fa48("1549") ? true : (stryCov_9fa48("1549", "1550", "1551"), location.pathname === (stryMutAct_9fa48("1552") ? "" : (stryCov_9fa48("1552"), '/account')))) ? stryMutAct_9fa48("1553") ? "" : (stryCov_9fa48("1553"), "bg-[#4242EA]") : stryMutAct_9fa48("1554") ? "" : (stryCov_9fa48("1554"), "hover:bg-gray-800"))}>
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
                if (stryMutAct_9fa48("1555")) {
                  {}
                } else {
                  stryCov_9fa48("1555");
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
        <Link to="/dashboard" className={cn(stryMutAct_9fa48("1556") ? "" : (stryCov_9fa48("1556"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1559") ? location.pathname !== '/dashboard' : stryMutAct_9fa48("1558") ? false : stryMutAct_9fa48("1557") ? true : (stryCov_9fa48("1557", "1558", "1559"), location.pathname === (stryMutAct_9fa48("1560") ? "" : (stryCov_9fa48("1560"), '/dashboard')))) ? stryMutAct_9fa48("1561") ? "" : (stryCov_9fa48("1561"), "bg-[#4242EA]") : stryMutAct_9fa48("1562") ? "" : (stryCov_9fa48("1562"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <img src={logo} alt="Logo" className="h-5 w-5 object-contain" />
            </div>
            <div className={cn(stryMutAct_9fa48("1563") ? "" : (stryCov_9fa48("1563"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1564") ? "" : (stryCov_9fa48("1564"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1565") ? "" : (stryCov_9fa48("1565"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Dashboard</span>
        </div>
          </Link>}

        {/* Learning - Open book icon - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1568") ? isMobileNavbarOpen || <Link to="/learning" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/learning' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
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
            </Link> : stryMutAct_9fa48("1567") ? false : stryMutAct_9fa48("1566") ? true : (stryCov_9fa48("1566", "1567", "1568"), isMobileNavbarOpen && <Link to="/learning" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1569") ? "" : (stryCov_9fa48("1569"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1572") ? location.pathname !== '/learning' : stryMutAct_9fa48("1571") ? false : stryMutAct_9fa48("1570") ? true : (stryCov_9fa48("1570", "1571", "1572"), location.pathname === (stryMutAct_9fa48("1573") ? "" : (stryCov_9fa48("1573"), '/learning')))) ? stryMutAct_9fa48("1574") ? "" : (stryCov_9fa48("1574"), "bg-[#4242EA]") : stryMutAct_9fa48("1575") ? "" : (stryCov_9fa48("1575"), "hover:bg-gray-800"))}>
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
            </Link>) : <Link to="/learning" className={cn(stryMutAct_9fa48("1576") ? "" : (stryCov_9fa48("1576"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1579") ? location.pathname !== '/learning' : stryMutAct_9fa48("1578") ? false : stryMutAct_9fa48("1577") ? true : (stryCov_9fa48("1577", "1578", "1579"), location.pathname === (stryMutAct_9fa48("1580") ? "" : (stryCov_9fa48("1580"), '/learning')))) ? stryMutAct_9fa48("1581") ? "" : (stryCov_9fa48("1581"), "bg-[#4242EA]") : stryMutAct_9fa48("1582") ? "" : (stryCov_9fa48("1582"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M2 3H8C9.1 3 10 3.9 10 5V19C10 20.1 9.1 21 8 21H2C1.45 21 1 20.55 1 20V4C1 3.45 1.45 3 2 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 3H16C14.9 3 14 3.9 14 5V19C14 20.1 14.9 21 16 21H22C22.55 21 23 20.55 23 20V4C23 3.45 22.55 3 22 3Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 7H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 11H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M10 15H14" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("1583") ? "" : (stryCov_9fa48("1583"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1584") ? "" : (stryCov_9fa48("1584"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1585") ? "" : (stryCov_9fa48("1585"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Learning</span>
            </div>
          </Link>}

        {/* AI Chat - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1588") ? isMobileNavbarOpen || <Link to="/gpt" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/gpt' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Chat</span>
              </div>
            </Link> : stryMutAct_9fa48("1587") ? false : stryMutAct_9fa48("1586") ? true : (stryCov_9fa48("1586", "1587", "1588"), isMobileNavbarOpen && <Link to="/gpt" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1589") ? "" : (stryCov_9fa48("1589"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1592") ? location.pathname !== '/gpt' : stryMutAct_9fa48("1591") ? false : stryMutAct_9fa48("1590") ? true : (stryCov_9fa48("1590", "1591", "1592"), location.pathname === (stryMutAct_9fa48("1593") ? "" : (stryCov_9fa48("1593"), '/gpt')))) ? stryMutAct_9fa48("1594") ? "" : (stryCov_9fa48("1594"), "bg-[#4242EA]") : stryMutAct_9fa48("1595") ? "" : (stryCov_9fa48("1595"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Chat</span>
              </div>
            </Link>) : <Link to="/gpt" className={cn(stryMutAct_9fa48("1596") ? "" : (stryCov_9fa48("1596"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1599") ? location.pathname !== '/gpt' : stryMutAct_9fa48("1598") ? false : stryMutAct_9fa48("1597") ? true : (stryCov_9fa48("1597", "1598", "1599"), location.pathname === (stryMutAct_9fa48("1600") ? "" : (stryCov_9fa48("1600"), '/gpt')))) ? stryMutAct_9fa48("1601") ? "" : (stryCov_9fa48("1601"), "bg-[#4242EA]") : stryMutAct_9fa48("1602") ? "" : (stryCov_9fa48("1602"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("1603") ? "" : (stryCov_9fa48("1603"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1604") ? "" : (stryCov_9fa48("1604"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1605") ? "" : (stryCov_9fa48("1605"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">AI Chat</span>
            </div>
          </Link>}

        {/* Calendar - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1608") ? isMobileNavbarOpen || <Link to="/calendar" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/calendar' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
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
            </Link> : stryMutAct_9fa48("1607") ? false : stryMutAct_9fa48("1606") ? true : (stryCov_9fa48("1606", "1607", "1608"), isMobileNavbarOpen && <Link to="/calendar" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1609") ? "" : (stryCov_9fa48("1609"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1612") ? location.pathname !== '/calendar' : stryMutAct_9fa48("1611") ? false : stryMutAct_9fa48("1610") ? true : (stryCov_9fa48("1610", "1611", "1612"), location.pathname === (stryMutAct_9fa48("1613") ? "" : (stryCov_9fa48("1613"), '/calendar')))) ? stryMutAct_9fa48("1614") ? "" : (stryCov_9fa48("1614"), "bg-[#4242EA]") : stryMutAct_9fa48("1615") ? "" : (stryCov_9fa48("1615"), "hover:bg-gray-800"))}>
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
            </Link>) : <Link to="/calendar" className={cn(stryMutAct_9fa48("1616") ? "" : (stryCov_9fa48("1616"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1619") ? location.pathname !== '/calendar' : stryMutAct_9fa48("1618") ? false : stryMutAct_9fa48("1617") ? true : (stryCov_9fa48("1617", "1618", "1619"), location.pathname === (stryMutAct_9fa48("1620") ? "" : (stryCov_9fa48("1620"), '/calendar')))) ? stryMutAct_9fa48("1621") ? "" : (stryCov_9fa48("1621"), "bg-[#4242EA]") : stryMutAct_9fa48("1622") ? "" : (stryCov_9fa48("1622"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="2" x2="16" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="8" y1="2" x2="8" y2="6" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="3" y1="10" x2="21" y2="10" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("1623") ? "" : (stryCov_9fa48("1623"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1624") ? "" : (stryCov_9fa48("1624"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1625") ? "" : (stryCov_9fa48("1625"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Calendar</span>
            </div>
          </Link>}

        {/* Progress - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1628") ? isMobileNavbarOpen || <Link to="/stats" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/stats' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Progress</span>
              </div>
            </Link> : stryMutAct_9fa48("1627") ? false : stryMutAct_9fa48("1626") ? true : (stryCov_9fa48("1626", "1627", "1628"), isMobileNavbarOpen && <Link to="/stats" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1629") ? "" : (stryCov_9fa48("1629"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1632") ? location.pathname !== '/stats' : stryMutAct_9fa48("1631") ? false : stryMutAct_9fa48("1630") ? true : (stryCov_9fa48("1630", "1631", "1632"), location.pathname === (stryMutAct_9fa48("1633") ? "" : (stryCov_9fa48("1633"), '/stats')))) ? stryMutAct_9fa48("1634") ? "" : (stryCov_9fa48("1634"), "bg-[#4242EA]") : stryMutAct_9fa48("1635") ? "" : (stryCov_9fa48("1635"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Progress</span>
              </div>
            </Link>) : <Link to="/stats" className={cn(stryMutAct_9fa48("1636") ? "" : (stryCov_9fa48("1636"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1639") ? location.pathname !== '/stats' : stryMutAct_9fa48("1638") ? false : stryMutAct_9fa48("1637") ? true : (stryCov_9fa48("1637", "1638", "1639"), location.pathname === (stryMutAct_9fa48("1640") ? "" : (stryCov_9fa48("1640"), '/stats')))) ? stryMutAct_9fa48("1641") ? "" : (stryCov_9fa48("1641"), "bg-[#4242EA]") : stryMutAct_9fa48("1642") ? "" : (stryCov_9fa48("1642"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("1643") ? "" : (stryCov_9fa48("1643"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1644") ? "" : (stryCov_9fa48("1644"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1645") ? "" : (stryCov_9fa48("1645"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Progress</span>
            </div>
          </Link>}

        {/* Assessment - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1648") ? isMobileNavbarOpen || <Link to="/assessment" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/assessment' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
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
            </Link> : stryMutAct_9fa48("1647") ? false : stryMutAct_9fa48("1646") ? true : (stryCov_9fa48("1646", "1647", "1648"), isMobileNavbarOpen && <Link to="/assessment" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1649") ? "" : (stryCov_9fa48("1649"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1652") ? location.pathname !== '/assessment' : stryMutAct_9fa48("1651") ? false : stryMutAct_9fa48("1650") ? true : (stryCov_9fa48("1650", "1651", "1652"), location.pathname === (stryMutAct_9fa48("1653") ? "" : (stryCov_9fa48("1653"), '/assessment')))) ? stryMutAct_9fa48("1654") ? "" : (stryCov_9fa48("1654"), "bg-[#4242EA]") : stryMutAct_9fa48("1655") ? "" : (stryCov_9fa48("1655"), "hover:bg-gray-800"))}>
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
            </Link>) : <Link to="/assessment" className={cn(stryMutAct_9fa48("1656") ? "" : (stryCov_9fa48("1656"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1659") ? location.pathname !== '/assessment' : stryMutAct_9fa48("1658") ? false : stryMutAct_9fa48("1657") ? true : (stryCov_9fa48("1657", "1658", "1659"), location.pathname === (stryMutAct_9fa48("1660") ? "" : (stryCov_9fa48("1660"), '/assessment')))) ? stryMutAct_9fa48("1661") ? "" : (stryCov_9fa48("1661"), "bg-[#4242EA]") : stryMutAct_9fa48("1662") ? "" : (stryCov_9fa48("1662"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14,2 14,8 20,8" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="10,9 9,9 8,9" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("1663") ? "" : (stryCov_9fa48("1663"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1664") ? "" : (stryCov_9fa48("1664"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1665") ? "" : (stryCov_9fa48("1665"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Assessment</span>
            </div>
          </Link>}

        {/* Admin Dashboard - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1668") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/admin-dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link> : stryMutAct_9fa48("1667") ? false : stryMutAct_9fa48("1666") ? true : (stryCov_9fa48("1666", "1667", "1668"), (stryMutAct_9fa48("1670") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("1669") ? true : (stryCov_9fa48("1669", "1670"), (stryMutAct_9fa48("1672") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1671") ? true : (stryCov_9fa48("1671", "1672"), (stryMutAct_9fa48("1674") ? user?.role !== 'admin' : stryMutAct_9fa48("1673") ? false : (stryCov_9fa48("1673", "1674"), (stryMutAct_9fa48("1675") ? user.role : (stryCov_9fa48("1675"), user?.role)) === (stryMutAct_9fa48("1676") ? "" : (stryCov_9fa48("1676"), 'admin')))) || (stryMutAct_9fa48("1678") ? user?.role !== 'staff' : stryMutAct_9fa48("1677") ? false : (stryCov_9fa48("1677", "1678"), (stryMutAct_9fa48("1679") ? user.role : (stryCov_9fa48("1679"), user?.role)) === (stryMutAct_9fa48("1680") ? "" : (stryCov_9fa48("1680"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/admin-dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1681") ? "" : (stryCov_9fa48("1681"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1684") ? location.pathname !== '/admin-dashboard' : stryMutAct_9fa48("1683") ? false : stryMutAct_9fa48("1682") ? true : (stryCov_9fa48("1682", "1683", "1684"), location.pathname === (stryMutAct_9fa48("1685") ? "" : (stryCov_9fa48("1685"), '/admin-dashboard')))) ? stryMutAct_9fa48("1686") ? "" : (stryCov_9fa48("1686"), "bg-[#4242EA]") : stryMutAct_9fa48("1687") ? "" : (stryCov_9fa48("1687"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link>) : stryMutAct_9fa48("1690") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/admin-dashboard" className={cn("relative h-[44px] flex items-center", location.pathname === '/admin-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link> : stryMutAct_9fa48("1689") ? false : stryMutAct_9fa48("1688") ? true : (stryCov_9fa48("1688", "1689", "1690"), (stryMutAct_9fa48("1692") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1691") ? true : (stryCov_9fa48("1691", "1692"), (stryMutAct_9fa48("1694") ? user?.role !== 'admin' : stryMutAct_9fa48("1693") ? false : (stryCov_9fa48("1693", "1694"), (stryMutAct_9fa48("1695") ? user.role : (stryCov_9fa48("1695"), user?.role)) === (stryMutAct_9fa48("1696") ? "" : (stryCov_9fa48("1696"), 'admin')))) || (stryMutAct_9fa48("1698") ? user?.role !== 'staff' : stryMutAct_9fa48("1697") ? false : (stryCov_9fa48("1697", "1698"), (stryMutAct_9fa48("1699") ? user.role : (stryCov_9fa48("1699"), user?.role)) === (stryMutAct_9fa48("1700") ? "" : (stryCov_9fa48("1700"), 'staff')))))) && <Link to="/admin-dashboard" className={cn(stryMutAct_9fa48("1701") ? "" : (stryCov_9fa48("1701"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1704") ? location.pathname !== '/admin-dashboard' : stryMutAct_9fa48("1703") ? false : stryMutAct_9fa48("1702") ? true : (stryCov_9fa48("1702", "1703", "1704"), location.pathname === (stryMutAct_9fa48("1705") ? "" : (stryCov_9fa48("1705"), '/admin-dashboard')))) ? stryMutAct_9fa48("1706") ? "" : (stryCov_9fa48("1706"), "bg-[#4242EA]") : stryMutAct_9fa48("1707") ? "" : (stryCov_9fa48("1707"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Settings className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("1708") ? "" : (stryCov_9fa48("1708"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1709") ? "" : (stryCov_9fa48("1709"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1710") ? "" : (stryCov_9fa48("1710"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Admin Dashboard</span>
              </div>
            </Link>)}

        {/* Assessment Grades - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1713") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/admin/assessment-grades" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link> : stryMutAct_9fa48("1712") ? false : stryMutAct_9fa48("1711") ? true : (stryCov_9fa48("1711", "1712", "1713"), (stryMutAct_9fa48("1715") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("1714") ? true : (stryCov_9fa48("1714", "1715"), (stryMutAct_9fa48("1717") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1716") ? true : (stryCov_9fa48("1716", "1717"), (stryMutAct_9fa48("1719") ? user?.role !== 'admin' : stryMutAct_9fa48("1718") ? false : (stryCov_9fa48("1718", "1719"), (stryMutAct_9fa48("1720") ? user.role : (stryCov_9fa48("1720"), user?.role)) === (stryMutAct_9fa48("1721") ? "" : (stryCov_9fa48("1721"), 'admin')))) || (stryMutAct_9fa48("1723") ? user?.role !== 'staff' : stryMutAct_9fa48("1722") ? false : (stryCov_9fa48("1722", "1723"), (stryMutAct_9fa48("1724") ? user.role : (stryCov_9fa48("1724"), user?.role)) === (stryMutAct_9fa48("1725") ? "" : (stryCov_9fa48("1725"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/admin/assessment-grades" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1726") ? "" : (stryCov_9fa48("1726"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1729") ? location.pathname !== '/admin/assessment-grades' : stryMutAct_9fa48("1728") ? false : stryMutAct_9fa48("1727") ? true : (stryCov_9fa48("1727", "1728", "1729"), location.pathname === (stryMutAct_9fa48("1730") ? "" : (stryCov_9fa48("1730"), '/admin/assessment-grades')))) ? stryMutAct_9fa48("1731") ? "" : (stryCov_9fa48("1731"), "bg-[#4242EA]") : stryMutAct_9fa48("1732") ? "" : (stryCov_9fa48("1732"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link>) : stryMutAct_9fa48("1735") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/admin/assessment-grades" className={cn("relative h-[44px] flex items-center", location.pathname === '/admin/assessment-grades' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link> : stryMutAct_9fa48("1734") ? false : stryMutAct_9fa48("1733") ? true : (stryCov_9fa48("1733", "1734", "1735"), (stryMutAct_9fa48("1737") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1736") ? true : (stryCov_9fa48("1736", "1737"), (stryMutAct_9fa48("1739") ? user?.role !== 'admin' : stryMutAct_9fa48("1738") ? false : (stryCov_9fa48("1738", "1739"), (stryMutAct_9fa48("1740") ? user.role : (stryCov_9fa48("1740"), user?.role)) === (stryMutAct_9fa48("1741") ? "" : (stryCov_9fa48("1741"), 'admin')))) || (stryMutAct_9fa48("1743") ? user?.role !== 'staff' : stryMutAct_9fa48("1742") ? false : (stryCov_9fa48("1742", "1743"), (stryMutAct_9fa48("1744") ? user.role : (stryCov_9fa48("1744"), user?.role)) === (stryMutAct_9fa48("1745") ? "" : (stryCov_9fa48("1745"), 'staff')))))) && <Link to="/admin/assessment-grades" className={cn(stryMutAct_9fa48("1746") ? "" : (stryCov_9fa48("1746"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1749") ? location.pathname !== '/admin/assessment-grades' : stryMutAct_9fa48("1748") ? false : stryMutAct_9fa48("1747") ? true : (stryCov_9fa48("1747", "1748", "1749"), location.pathname === (stryMutAct_9fa48("1750") ? "" : (stryCov_9fa48("1750"), '/admin/assessment-grades')))) ? stryMutAct_9fa48("1751") ? "" : (stryCov_9fa48("1751"), "bg-[#4242EA]") : stryMutAct_9fa48("1752") ? "" : (stryCov_9fa48("1752"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Award className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("1753") ? "" : (stryCov_9fa48("1753"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1754") ? "" : (stryCov_9fa48("1754"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1755") ? "" : (stryCov_9fa48("1755"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Assessment Grades</span>
              </div>
            </Link>)}

        {/* Admissions - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1758") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/admissions-dashboard" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link> : stryMutAct_9fa48("1757") ? false : stryMutAct_9fa48("1756") ? true : (stryCov_9fa48("1756", "1757", "1758"), (stryMutAct_9fa48("1760") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("1759") ? true : (stryCov_9fa48("1759", "1760"), (stryMutAct_9fa48("1762") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1761") ? true : (stryCov_9fa48("1761", "1762"), (stryMutAct_9fa48("1764") ? user?.role !== 'admin' : stryMutAct_9fa48("1763") ? false : (stryCov_9fa48("1763", "1764"), (stryMutAct_9fa48("1765") ? user.role : (stryCov_9fa48("1765"), user?.role)) === (stryMutAct_9fa48("1766") ? "" : (stryCov_9fa48("1766"), 'admin')))) || (stryMutAct_9fa48("1768") ? user?.role !== 'staff' : stryMutAct_9fa48("1767") ? false : (stryCov_9fa48("1767", "1768"), (stryMutAct_9fa48("1769") ? user.role : (stryCov_9fa48("1769"), user?.role)) === (stryMutAct_9fa48("1770") ? "" : (stryCov_9fa48("1770"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/admissions-dashboard" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1771") ? "" : (stryCov_9fa48("1771"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1774") ? location.pathname !== '/admissions-dashboard' : stryMutAct_9fa48("1773") ? false : stryMutAct_9fa48("1772") ? true : (stryCov_9fa48("1772", "1773", "1774"), location.pathname === (stryMutAct_9fa48("1775") ? "" : (stryCov_9fa48("1775"), '/admissions-dashboard')))) ? stryMutAct_9fa48("1776") ? "" : (stryCov_9fa48("1776"), "bg-[#4242EA]") : stryMutAct_9fa48("1777") ? "" : (stryCov_9fa48("1777"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link>) : stryMutAct_9fa48("1780") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/admissions-dashboard" className={cn("relative h-[44px] flex items-center", location.pathname === '/admissions-dashboard' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link> : stryMutAct_9fa48("1779") ? false : stryMutAct_9fa48("1778") ? true : (stryCov_9fa48("1778", "1779", "1780"), (stryMutAct_9fa48("1782") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1781") ? true : (stryCov_9fa48("1781", "1782"), (stryMutAct_9fa48("1784") ? user?.role !== 'admin' : stryMutAct_9fa48("1783") ? false : (stryCov_9fa48("1783", "1784"), (stryMutAct_9fa48("1785") ? user.role : (stryCov_9fa48("1785"), user?.role)) === (stryMutAct_9fa48("1786") ? "" : (stryCov_9fa48("1786"), 'admin')))) || (stryMutAct_9fa48("1788") ? user?.role !== 'staff' : stryMutAct_9fa48("1787") ? false : (stryCov_9fa48("1787", "1788"), (stryMutAct_9fa48("1789") ? user.role : (stryCov_9fa48("1789"), user?.role)) === (stryMutAct_9fa48("1790") ? "" : (stryCov_9fa48("1790"), 'staff')))))) && <Link to="/admissions-dashboard" className={cn(stryMutAct_9fa48("1791") ? "" : (stryCov_9fa48("1791"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1794") ? location.pathname !== '/admissions-dashboard' : stryMutAct_9fa48("1793") ? false : stryMutAct_9fa48("1792") ? true : (stryCov_9fa48("1792", "1793", "1794"), location.pathname === (stryMutAct_9fa48("1795") ? "" : (stryCov_9fa48("1795"), '/admissions-dashboard')))) ? stryMutAct_9fa48("1796") ? "" : (stryCov_9fa48("1796"), "bg-[#4242EA]") : stryMutAct_9fa48("1797") ? "" : (stryCov_9fa48("1797"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Users className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("1798") ? "" : (stryCov_9fa48("1798"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1799") ? "" : (stryCov_9fa48("1799"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1800") ? "" : (stryCov_9fa48("1800"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Admissions</span>
              </div>
            </Link>)}

        {/* Content Generation - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1803") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/content" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/content' || location.pathname.startsWith('/content') ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
            </Link> : stryMutAct_9fa48("1802") ? false : stryMutAct_9fa48("1801") ? true : (stryCov_9fa48("1801", "1802", "1803"), (stryMutAct_9fa48("1805") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("1804") ? true : (stryCov_9fa48("1804", "1805"), (stryMutAct_9fa48("1807") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1806") ? true : (stryCov_9fa48("1806", "1807"), (stryMutAct_9fa48("1809") ? user?.role !== 'admin' : stryMutAct_9fa48("1808") ? false : (stryCov_9fa48("1808", "1809"), (stryMutAct_9fa48("1810") ? user.role : (stryCov_9fa48("1810"), user?.role)) === (stryMutAct_9fa48("1811") ? "" : (stryCov_9fa48("1811"), 'admin')))) || (stryMutAct_9fa48("1813") ? user?.role !== 'staff' : stryMutAct_9fa48("1812") ? false : (stryCov_9fa48("1812", "1813"), (stryMutAct_9fa48("1814") ? user.role : (stryCov_9fa48("1814"), user?.role)) === (stryMutAct_9fa48("1815") ? "" : (stryCov_9fa48("1815"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/content" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1816") ? "" : (stryCov_9fa48("1816"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1819") ? location.pathname === '/content' && location.pathname.startsWith('/content') : stryMutAct_9fa48("1818") ? false : stryMutAct_9fa48("1817") ? true : (stryCov_9fa48("1817", "1818", "1819"), (stryMutAct_9fa48("1821") ? location.pathname !== '/content' : stryMutAct_9fa48("1820") ? false : (stryCov_9fa48("1820", "1821"), location.pathname === (stryMutAct_9fa48("1822") ? "" : (stryCov_9fa48("1822"), '/content')))) || (stryMutAct_9fa48("1823") ? location.pathname.endsWith('/content') : (stryCov_9fa48("1823"), location.pathname.startsWith(stryMutAct_9fa48("1824") ? "" : (stryCov_9fa48("1824"), '/content')))))) ? stryMutAct_9fa48("1825") ? "" : (stryCov_9fa48("1825"), "bg-[#4242EA]") : stryMutAct_9fa48("1826") ? "" : (stryCov_9fa48("1826"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
            </Link>) : stryMutAct_9fa48("1829") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/content" className={cn("relative h-[44px] flex items-center", location.pathname === '/content' || location.pathname.startsWith('/content') ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
              </Link> : stryMutAct_9fa48("1828") ? false : stryMutAct_9fa48("1827") ? true : (stryCov_9fa48("1827", "1828", "1829"), (stryMutAct_9fa48("1831") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1830") ? true : (stryCov_9fa48("1830", "1831"), (stryMutAct_9fa48("1833") ? user?.role !== 'admin' : stryMutAct_9fa48("1832") ? false : (stryCov_9fa48("1832", "1833"), (stryMutAct_9fa48("1834") ? user.role : (stryCov_9fa48("1834"), user?.role)) === (stryMutAct_9fa48("1835") ? "" : (stryCov_9fa48("1835"), 'admin')))) || (stryMutAct_9fa48("1837") ? user?.role !== 'staff' : stryMutAct_9fa48("1836") ? false : (stryCov_9fa48("1836", "1837"), (stryMutAct_9fa48("1838") ? user.role : (stryCov_9fa48("1838"), user?.role)) === (stryMutAct_9fa48("1839") ? "" : (stryCov_9fa48("1839"), 'staff')))))) && <Link to="/content" className={cn(stryMutAct_9fa48("1840") ? "" : (stryCov_9fa48("1840"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1843") ? location.pathname === '/content' && location.pathname.startsWith('/content') : stryMutAct_9fa48("1842") ? false : stryMutAct_9fa48("1841") ? true : (stryCov_9fa48("1841", "1842", "1843"), (stryMutAct_9fa48("1845") ? location.pathname !== '/content' : stryMutAct_9fa48("1844") ? false : (stryCov_9fa48("1844", "1845"), location.pathname === (stryMutAct_9fa48("1846") ? "" : (stryCov_9fa48("1846"), '/content')))) || (stryMutAct_9fa48("1847") ? location.pathname.endsWith('/content') : (stryCov_9fa48("1847"), location.pathname.startsWith(stryMutAct_9fa48("1848") ? "" : (stryCov_9fa48("1848"), '/content')))))) ? stryMutAct_9fa48("1849") ? "" : (stryCov_9fa48("1849"), "bg-[#4242EA]") : stryMutAct_9fa48("1850") ? "" : (stryCov_9fa48("1850"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Bug className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("1851") ? "" : (stryCov_9fa48("1851"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1852") ? "" : (stryCov_9fa48("1852"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1853") ? "" : (stryCov_9fa48("1853"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Content Generation</span>
              </div>
              </Link>)}

        {/* AI Prompts - Only show for admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1856") ? (user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to="/admin-prompts" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
              </Link> : stryMutAct_9fa48("1855") ? false : stryMutAct_9fa48("1854") ? true : (stryCov_9fa48("1854", "1855", "1856"), (stryMutAct_9fa48("1858") ? user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("1857") ? true : (stryCov_9fa48("1857", "1858"), (stryMutAct_9fa48("1860") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1859") ? true : (stryCov_9fa48("1859", "1860"), (stryMutAct_9fa48("1862") ? user?.role !== 'admin' : stryMutAct_9fa48("1861") ? false : (stryCov_9fa48("1861", "1862"), (stryMutAct_9fa48("1863") ? user.role : (stryCov_9fa48("1863"), user?.role)) === (stryMutAct_9fa48("1864") ? "" : (stryCov_9fa48("1864"), 'admin')))) || (stryMutAct_9fa48("1866") ? user?.role !== 'staff' : stryMutAct_9fa48("1865") ? false : (stryCov_9fa48("1865", "1866"), (stryMutAct_9fa48("1867") ? user.role : (stryCov_9fa48("1867"), user?.role)) === (stryMutAct_9fa48("1868") ? "" : (stryCov_9fa48("1868"), 'staff')))))) && isMobileNavbarOpen)) && <Link to="/admin-prompts" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1869") ? "" : (stryCov_9fa48("1869"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1872") ? location.pathname !== '/admin-prompts' : stryMutAct_9fa48("1871") ? false : stryMutAct_9fa48("1870") ? true : (stryCov_9fa48("1870", "1871", "1872"), location.pathname === (stryMutAct_9fa48("1873") ? "" : (stryCov_9fa48("1873"), '/admin-prompts')))) ? stryMutAct_9fa48("1874") ? "" : (stryCov_9fa48("1874"), "bg-[#4242EA]") : stryMutAct_9fa48("1875") ? "" : (stryCov_9fa48("1875"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
              </Link>) : stryMutAct_9fa48("1878") ? user?.role === 'admin' || user?.role === 'staff' || <Link to="/admin-prompts" className={cn("relative h-[44px] flex items-center", location.pathname === '/admin-prompts' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
              </Link> : stryMutAct_9fa48("1877") ? false : stryMutAct_9fa48("1876") ? true : (stryCov_9fa48("1876", "1877", "1878"), (stryMutAct_9fa48("1880") ? user?.role === 'admin' && user?.role === 'staff' : stryMutAct_9fa48("1879") ? true : (stryCov_9fa48("1879", "1880"), (stryMutAct_9fa48("1882") ? user?.role !== 'admin' : stryMutAct_9fa48("1881") ? false : (stryCov_9fa48("1881", "1882"), (stryMutAct_9fa48("1883") ? user.role : (stryCov_9fa48("1883"), user?.role)) === (stryMutAct_9fa48("1884") ? "" : (stryCov_9fa48("1884"), 'admin')))) || (stryMutAct_9fa48("1886") ? user?.role !== 'staff' : stryMutAct_9fa48("1885") ? false : (stryCov_9fa48("1885", "1886"), (stryMutAct_9fa48("1887") ? user.role : (stryCov_9fa48("1887"), user?.role)) === (stryMutAct_9fa48("1888") ? "" : (stryCov_9fa48("1888"), 'staff')))))) && <Link to="/admin-prompts" className={cn(stryMutAct_9fa48("1889") ? "" : (stryCov_9fa48("1889"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1892") ? location.pathname !== '/admin-prompts' : stryMutAct_9fa48("1891") ? false : stryMutAct_9fa48("1890") ? true : (stryCov_9fa48("1890", "1891", "1892"), location.pathname === (stryMutAct_9fa48("1893") ? "" : (stryCov_9fa48("1893"), '/admin-prompts')))) ? stryMutAct_9fa48("1894") ? "" : (stryCov_9fa48("1894"), "bg-[#4242EA]") : stryMutAct_9fa48("1895") ? "" : (stryCov_9fa48("1895"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <Brain className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("1896") ? "" : (stryCov_9fa48("1896"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1897") ? "" : (stryCov_9fa48("1897"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1898") ? "" : (stryCov_9fa48("1898"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">AI Prompts</span>
              </div>
              </Link>)}

        {/* Volunteer Feedback - Show for volunteers and admins and only in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1901") ? (user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff') && isMobileNavbarOpen || <Link to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'} onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
              </Link> : stryMutAct_9fa48("1900") ? false : stryMutAct_9fa48("1899") ? true : (stryCov_9fa48("1899", "1900", "1901"), (stryMutAct_9fa48("1903") ? user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff' || isMobileNavbarOpen : stryMutAct_9fa48("1902") ? true : (stryCov_9fa48("1902", "1903"), (stryMutAct_9fa48("1905") ? (user?.role === 'volunteer' || user?.role === 'admin') && user?.role === 'staff' : stryMutAct_9fa48("1904") ? true : (stryCov_9fa48("1904", "1905"), (stryMutAct_9fa48("1907") ? user?.role === 'volunteer' && user?.role === 'admin' : stryMutAct_9fa48("1906") ? false : (stryCov_9fa48("1906", "1907"), (stryMutAct_9fa48("1909") ? user?.role !== 'volunteer' : stryMutAct_9fa48("1908") ? false : (stryCov_9fa48("1908", "1909"), (stryMutAct_9fa48("1910") ? user.role : (stryCov_9fa48("1910"), user?.role)) === (stryMutAct_9fa48("1911") ? "" : (stryCov_9fa48("1911"), 'volunteer')))) || (stryMutAct_9fa48("1913") ? user?.role !== 'admin' : stryMutAct_9fa48("1912") ? false : (stryCov_9fa48("1912", "1913"), (stryMutAct_9fa48("1914") ? user.role : (stryCov_9fa48("1914"), user?.role)) === (stryMutAct_9fa48("1915") ? "" : (stryCov_9fa48("1915"), 'admin')))))) || (stryMutAct_9fa48("1917") ? user?.role !== 'staff' : stryMutAct_9fa48("1916") ? false : (stryCov_9fa48("1916", "1917"), (stryMutAct_9fa48("1918") ? user.role : (stryCov_9fa48("1918"), user?.role)) === (stryMutAct_9fa48("1919") ? "" : (stryCov_9fa48("1919"), 'staff')))))) && isMobileNavbarOpen)) && <Link to={(stryMutAct_9fa48("1922") ? user?.role !== 'volunteer' : stryMutAct_9fa48("1921") ? false : stryMutAct_9fa48("1920") ? true : (stryCov_9fa48("1920", "1921", "1922"), (stryMutAct_9fa48("1923") ? user.role : (stryCov_9fa48("1923"), user?.role)) === (stryMutAct_9fa48("1924") ? "" : (stryCov_9fa48("1924"), 'volunteer')))) ? stryMutAct_9fa48("1925") ? "" : (stryCov_9fa48("1925"), '/volunteer-feedback') : stryMutAct_9fa48("1926") ? "" : (stryCov_9fa48("1926"), '/admin-volunteer-feedback')} onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1927") ? "" : (stryCov_9fa48("1927"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1930") ? location.pathname === '/volunteer-feedback' && location.pathname === '/admin-volunteer-feedback' : stryMutAct_9fa48("1929") ? false : stryMutAct_9fa48("1928") ? true : (stryCov_9fa48("1928", "1929", "1930"), (stryMutAct_9fa48("1932") ? location.pathname !== '/volunteer-feedback' : stryMutAct_9fa48("1931") ? false : (stryCov_9fa48("1931", "1932"), location.pathname === (stryMutAct_9fa48("1933") ? "" : (stryCov_9fa48("1933"), '/volunteer-feedback')))) || (stryMutAct_9fa48("1935") ? location.pathname !== '/admin-volunteer-feedback' : stryMutAct_9fa48("1934") ? false : (stryCov_9fa48("1934", "1935"), location.pathname === (stryMutAct_9fa48("1936") ? "" : (stryCov_9fa48("1936"), '/admin-volunteer-feedback')))))) ? stryMutAct_9fa48("1937") ? "" : (stryCov_9fa48("1937"), "bg-[#4242EA]") : stryMutAct_9fa48("1938") ? "" : (stryCov_9fa48("1938"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
              </Link>) : stryMutAct_9fa48("1941") ? user?.role === 'volunteer' || user?.role === 'admin' || user?.role === 'staff' || <Link to={user?.role === 'volunteer' ? '/volunteer-feedback' : '/admin-volunteer-feedback'} className={cn("relative h-[44px] flex items-center", location.pathname === '/volunteer-feedback' || location.pathname === '/admin-volunteer-feedback' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn("flex items-center transition-all duration-300 ease-in-out", isNavbarHovered ? "ml-[50px] opacity-100" : "ml-[50px] opacity-0 w-0 overflow-hidden")}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
              </Link> : stryMutAct_9fa48("1940") ? false : stryMutAct_9fa48("1939") ? true : (stryCov_9fa48("1939", "1940", "1941"), (stryMutAct_9fa48("1943") ? (user?.role === 'volunteer' || user?.role === 'admin') && user?.role === 'staff' : stryMutAct_9fa48("1942") ? true : (stryCov_9fa48("1942", "1943"), (stryMutAct_9fa48("1945") ? user?.role === 'volunteer' && user?.role === 'admin' : stryMutAct_9fa48("1944") ? false : (stryCov_9fa48("1944", "1945"), (stryMutAct_9fa48("1947") ? user?.role !== 'volunteer' : stryMutAct_9fa48("1946") ? false : (stryCov_9fa48("1946", "1947"), (stryMutAct_9fa48("1948") ? user.role : (stryCov_9fa48("1948"), user?.role)) === (stryMutAct_9fa48("1949") ? "" : (stryCov_9fa48("1949"), 'volunteer')))) || (stryMutAct_9fa48("1951") ? user?.role !== 'admin' : stryMutAct_9fa48("1950") ? false : (stryCov_9fa48("1950", "1951"), (stryMutAct_9fa48("1952") ? user.role : (stryCov_9fa48("1952"), user?.role)) === (stryMutAct_9fa48("1953") ? "" : (stryCov_9fa48("1953"), 'admin')))))) || (stryMutAct_9fa48("1955") ? user?.role !== 'staff' : stryMutAct_9fa48("1954") ? false : (stryCov_9fa48("1954", "1955"), (stryMutAct_9fa48("1956") ? user.role : (stryCov_9fa48("1956"), user?.role)) === (stryMutAct_9fa48("1957") ? "" : (stryCov_9fa48("1957"), 'staff')))))) && <Link to={(stryMutAct_9fa48("1960") ? user?.role !== 'volunteer' : stryMutAct_9fa48("1959") ? false : stryMutAct_9fa48("1958") ? true : (stryCov_9fa48("1958", "1959", "1960"), (stryMutAct_9fa48("1961") ? user.role : (stryCov_9fa48("1961"), user?.role)) === (stryMutAct_9fa48("1962") ? "" : (stryCov_9fa48("1962"), 'volunteer')))) ? stryMutAct_9fa48("1963") ? "" : (stryCov_9fa48("1963"), '/volunteer-feedback') : stryMutAct_9fa48("1964") ? "" : (stryCov_9fa48("1964"), '/admin-volunteer-feedback')} className={cn(stryMutAct_9fa48("1965") ? "" : (stryCov_9fa48("1965"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1968") ? location.pathname === '/volunteer-feedback' && location.pathname === '/admin-volunteer-feedback' : stryMutAct_9fa48("1967") ? false : stryMutAct_9fa48("1966") ? true : (stryCov_9fa48("1966", "1967", "1968"), (stryMutAct_9fa48("1970") ? location.pathname !== '/volunteer-feedback' : stryMutAct_9fa48("1969") ? false : (stryCov_9fa48("1969", "1970"), location.pathname === (stryMutAct_9fa48("1971") ? "" : (stryCov_9fa48("1971"), '/volunteer-feedback')))) || (stryMutAct_9fa48("1973") ? location.pathname !== '/admin-volunteer-feedback' : stryMutAct_9fa48("1972") ? false : (stryCov_9fa48("1972", "1973"), location.pathname === (stryMutAct_9fa48("1974") ? "" : (stryCov_9fa48("1974"), '/admin-volunteer-feedback')))))) ? stryMutAct_9fa48("1975") ? "" : (stryCov_9fa48("1975"), "bg-[#4242EA]") : stryMutAct_9fa48("1976") ? "" : (stryCov_9fa48("1976"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-[#E3E3E3]" />
              </div>
              <div className={cn(stryMutAct_9fa48("1977") ? "" : (stryCov_9fa48("1977"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1978") ? "" : (stryCov_9fa48("1978"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1979") ? "" : (stryCov_9fa48("1979"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
                <span className="text-white text-sm font-medium whitespace-nowrap">Volunteer Feedback</span>
              </div>
              </Link>)}

        {/* Spacer to push profile and logout to bottom */}
        <div className="flex-1"></div>

        {/* Profile - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("1982") ? isMobileNavbarOpen || <Link to="/account" onClick={closeMobileNavbar} className={cn("relative h-[53px] flex items-center", location.pathname === '/account' ? "bg-[#4242EA]" : "hover:bg-gray-800")}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                  <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Account</span>
              </div>
              </Link> : stryMutAct_9fa48("1981") ? false : stryMutAct_9fa48("1980") ? true : (stryCov_9fa48("1980", "1981", "1982"), isMobileNavbarOpen && <Link to="/account" onClick={closeMobileNavbar} className={cn(stryMutAct_9fa48("1983") ? "" : (stryCov_9fa48("1983"), "relative h-[53px] flex items-center"), (stryMutAct_9fa48("1986") ? location.pathname !== '/account' : stryMutAct_9fa48("1985") ? false : stryMutAct_9fa48("1984") ? true : (stryCov_9fa48("1984", "1985", "1986"), location.pathname === (stryMutAct_9fa48("1987") ? "" : (stryCov_9fa48("1987"), '/account')))) ? stryMutAct_9fa48("1988") ? "" : (stryCov_9fa48("1988"), "bg-[#4242EA]") : stryMutAct_9fa48("1989") ? "" : (stryCov_9fa48("1989"), "hover:bg-gray-800"))}>
              <div className="absolute left-0 top-0 w-[60px] h-[53px] flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                  <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex items-center ml-[60px]">
                <span className="text-white text-sm font-medium whitespace-nowrap">Account</span>
              </div>
              </Link>) : <Link to="/account" className={cn(stryMutAct_9fa48("1990") ? "" : (stryCov_9fa48("1990"), "relative h-[44px] flex items-center"), (stryMutAct_9fa48("1993") ? location.pathname !== '/account' : stryMutAct_9fa48("1992") ? false : stryMutAct_9fa48("1991") ? true : (stryCov_9fa48("1991", "1992", "1993"), location.pathname === (stryMutAct_9fa48("1994") ? "" : (stryCov_9fa48("1994"), '/account')))) ? stryMutAct_9fa48("1995") ? "" : (stryCov_9fa48("1995"), "bg-[#4242EA]") : stryMutAct_9fa48("1996") ? "" : (stryCov_9fa48("1996"), "hover:bg-gray-800"))}>
            <div className="absolute left-0 top-0 w-[50px] h-[44px] flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 14 18" fill="none">
                <path d="M7 9C9.20914 9 11 7.20914 11 5C11 2.79086 9.20914 1 7 1C4.79086 1 3 2.79086 3 5C3 7.20914 4.79086 9 7 9Z" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H9C10.0609 11 11.0783 11.4214 11.8284 12.1716C12.5786 12.9217 13 13.9391 13 15V17" stroke="#E3E3E3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className={cn(stryMutAct_9fa48("1997") ? "" : (stryCov_9fa48("1997"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("1998") ? "" : (stryCov_9fa48("1998"), "ml-[50px] opacity-100") : stryMutAct_9fa48("1999") ? "" : (stryCov_9fa48("1999"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Account</span>
        </div>
          </Link>}

        {/* Logout - Only show in expanded mobile navbar */}
        {isMobile ? stryMutAct_9fa48("2002") ? isMobileNavbarOpen || <button onClick={handleLogout} className="relative h-[53px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full">
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
            </button> : stryMutAct_9fa48("2001") ? false : stryMutAct_9fa48("2000") ? true : (stryCov_9fa48("2000", "2001", "2002"), isMobileNavbarOpen && <button onClick={handleLogout} className="relative h-[53px] flex items-center hover:bg-gray-800 text-[#E3E3E3] w-full">
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
            <div className={cn(stryMutAct_9fa48("2003") ? "" : (stryCov_9fa48("2003"), "flex items-center transition-all duration-300 ease-in-out"), isNavbarHovered ? stryMutAct_9fa48("2004") ? "" : (stryCov_9fa48("2004"), "ml-[50px] opacity-100") : stryMutAct_9fa48("2005") ? "" : (stryCov_9fa48("2005"), "ml-[50px] opacity-0 w-0 overflow-hidden"))}>
              <span className="text-white text-sm font-medium whitespace-nowrap">Logout</span>
            </div>
          </button>}
      </nav>
      
      {/* Main Content - Desktop: 50px left margin for collapsed navbar, Mobile: no margin */}
      <main className={cn(stryMutAct_9fa48("2006") ? "" : (stryCov_9fa48("2006"), "flex-1 overflow-auto bg-[#EFEFEF]"), isMobile ? stryMutAct_9fa48("2007") ? "" : (stryCov_9fa48("2007"), "ml-0") : stryMutAct_9fa48("2008") ? "" : (stryCov_9fa48("2008"), "ml-[50px]"))}>
        {/* Mobile Header Bar - Only show on mobile */}
        {stryMutAct_9fa48("2011") ? isMobile || <div className="sticky top-0 z-50 bg-[#E751E7] h-[53px] flex items-center justify-end px-4">
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
          </div> : stryMutAct_9fa48("2010") ? false : stryMutAct_9fa48("2009") ? true : (stryCov_9fa48("2009", "2010", "2011"), isMobile && <div className="sticky top-0 z-50 bg-[#E751E7] h-[53px] flex items-center justify-end px-4">
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