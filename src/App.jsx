import { useState, useEffect } from 'react';
import './index.css';

// Loans
import HomeLoan from './calculators/loans/HomeLoan';
import EducationLoan from './calculators/loans/EducationLoan';
import BusinessLoan from './calculators/loans/BusinessLoan';
import PersonalLoan from './calculators/loans/PersonalLoan';
import LoanAgainstProperty from './calculators/loans/LoanAgainstProperty';
import VehicleLoan from './calculators/loans/VehicleLoan';

// Investments
import SIP from './calculators/investments/SIP';
import MutualFunds from './calculators/investments/MutualFunds';
import FixedDeposit from './calculators/investments/FixedDeposit';
import PPF from './calculators/investments/PPF';
import RealEstate from './calculators/investments/RealEstate';
import Bonds from './calculators/investments/Bonds';

// Insurance
import LifeInsurance from './calculators/insurance/LifeInsurance';
import GeneralInsurance from './calculators/insurance/GeneralInsurance';
import TermInsurance from './calculators/insurance/TermInsurance';
import MotorInsurance from './calculators/insurance/MotorInsurance';

// Financial Planning
import ChildrenEducation from './calculators/planning/ChildrenEducation';
import WealthCreation from './calculators/planning/WealthCreation';
import RetirementPlanning from './calculators/planning/RetirementPlanning';
import GoalPlanning from './calculators/planning/GoalPlanning';
import TaxPlanning from './calculators/planning/TaxPlanning';
import RiskManagement from './calculators/planning/RiskManagement';

const CATEGORIES = [
  {
    id: 'loans',
    label: 'Loans',
    icon: '🏦',
    items: [
      { id: 'home-loan', label: 'Home Loan', icon: '🏡', component: <HomeLoan /> },
      { id: 'education-loan', label: 'Education Loan', icon: '🎓', component: <EducationLoan /> },
      { id: 'business-loan', label: 'Business Loan', icon: '🏢', component: <BusinessLoan /> },
      { id: 'personal-loan', label: 'Personal Loan', icon: '💳', component: <PersonalLoan /> },
      { id: 'loan-against-property', label: 'Loan Against Property', icon: '🏢', component: <LoanAgainstProperty /> },
      { id: 'vehicle-loan', label: 'Vehicle Loan', icon: '🚗', component: <VehicleLoan /> },
    ],
  },
  {
    id: 'investments',
    label: 'Investments',
    icon: '📈',
    items: [
      { id: 'real-estate', label: 'Real Estate', icon: '🏘️', component: <RealEstate /> },
      { id: 'sip', label: 'SIP', icon: '📊', component: <SIP /> },
      { id: 'mutual-funds', label: 'Mutual Funds', icon: '💰', component: <MutualFunds /> },
      { id: 'fixed-deposit', label: 'Fixed Deposits', icon: '🏦', component: <FixedDeposit /> },
      { id: 'ppf', label: 'PPF', icon: '🛡️', component: <PPF /> },
      { id: 'bonds', label: 'Bonds Calculator', icon: '📜', component: <Bonds /> },
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: '🔒',
    items: [
      { id: 'life-insurance', label: 'Life Insurance', icon: '❤️', component: <LifeInsurance /> },
      { id: 'general-insurance', label: 'General / Health', icon: '🏥', component: <GeneralInsurance /> },
      { id: 'term-insurance', label: 'Term Insurance', icon: '🛡️', component: <TermInsurance /> },
      { id: 'motor-insurance', label: 'Motor Insurance', icon: '🚗', component: <MotorInsurance /> },
    ],
  },
  {
    id: 'planning',
    label: 'Financial Planning',
    icon: '🎯',
    items: [
      { id: 'children-education', label: "Children's Education", icon: '👶', component: <ChildrenEducation /> },
      { id: 'wealth-creation', label: 'Wealth Creation', icon: '💎', component: <WealthCreation /> },
      { id: 'retirement', label: 'Retirement Planning', icon: '👴', component: <RetirementPlanning /> },
      { id: 'goal-planning', label: 'Goal Based Planner', icon: '🎯', component: <GoalPlanning /> },
      { id: 'tax-planning', label: 'Tax Planner', icon: '📝', component: <TaxPlanning /> },
      { id: 'risk-management', label: 'Risk Management', icon: '🛡️', component: <RiskManagement /> },
    ],
  },
];

// Helper for card descriptions on the dashboard
const getCardDescription = (id) => {
  switch (id) {
    case 'home-loan':
      return 'Plan your housing finance with detailed EMI breakdown, interest payable, and amortization schedule.';
    case 'education-loan':
      return 'Calculate payments for study periods, moratoriums, and flexible repayment options for higher studies.';
    case 'business-loan':
      return 'Scale your business. Compute monthly payments, interest rates, and loan tenure for growth.';
    case 'personal-loan':
      return 'Estimate quick personal loans for weddings, travel, medical needs, or any personal expenses.';
    case 'loan-against-property':
      return 'Secure a mortgage loan using residential or commercial real estate assets as collateral for lower interest rates.';
    case 'vehicle-loan':
      return 'Calculate monthly EMIs and interest payable for your new or pre-owned car/two-wheeler loan purchase.';
    case 'real-estate':
      return 'Evaluate property investments, calculating purchase costs, rental yields, appreciation, and ROI.';
    case 'sip':
      return 'Estimate growth of systematic monthly mutual fund investments compounding over long durations.';
    case 'mutual-funds':
      return 'Calculate potential returns for lump-sum mutual fund investments with compounding rates.';
    case 'fixed-deposit':
      return 'Calculate interest earned and maturity amounts for secure fixed term bank deposits.';
    case 'ppf':
      return 'Determine long-term returns and tax benefits of Public Provident Fund investments.';
    case 'bonds':
      return 'Calculate Yield to Maturity (YTM), current yield, interest income, and cashflow payouts for bond investments.';
    case 'life-insurance':
      return 'Determine your human life value and target insurance coverage needed for family safety.';
    case 'general-insurance':
      return 'Estimate general and medical policy coverage costs to match health protection needs.';
    case 'term-insurance':
      return 'Calculate custom term premiums with smoker, gender, limited pay parameters and global travel cover.';
    case 'motor-insurance':
      return 'Evaluate IDV via vehicle age depreciation, NCB discounts, and standard TP rates for cars and bikes.';
    case 'children-education':
      return 'Plan the funding required for your kids future higher education goals, considering inflation.';
    case 'wealth-creation':
      return 'Design customized wealth goals and calculate systemic savings required to reach them.';
    case 'retirement':
      return 'Calculate retirement corpus targets and savings needed for a peaceful post-work life.';
    case 'goal-planning':
      return 'Map future savings requirements for milestones like buying a home, car, or funding higher education with inflation indexing.';
    case 'tax-planning':
      return 'Compare Old vs New Tax Regimes, compute rebates under Section 87A, and optimize tax-saving investments.';
    case 'risk-management':
      return 'Audit portfolio asset allocation weights, assess emergency cash reserves, and review term and health insurance sufficiency.';
    default:
      return 'Calculate your financial details easily.';
  }
};

const parseUrl = () => {
  const hash = window.location.hash;
  const search = window.location.search;
  const path = window.location.pathname.toLowerCase();

  // Check for category dashboard/overview pages
  if (
    hash === '#/loans' || hash === '#/loan' ||
    search.includes('page=loans') || search.includes('page=loan') ||
    path.endsWith('/loans') || path.endsWith('/loans/') ||
    path.endsWith('/loan') || path.endsWith('/loan/')
  ) {
    return 'loans-dashboard';
  }

  if (
    hash === '#/investments' || hash === '#/investment' ||
    search.includes('page=investments') || search.includes('page=investment') ||
    path.endsWith('/investments') || path.endsWith('/investments/') ||
    path.endsWith('/investment') || path.endsWith('/investment/')
  ) {
    return 'investments-dashboard';
  }

  if (
    hash === '#/insurance' ||
    search.includes('page=insurance') ||
    path.endsWith('/insurance') || path.endsWith('/insurance/')
  ) {
    return 'insurance-dashboard';
  }

  if (
    hash === '#/planning' || hash === '#/financial-planning' ||
    search.includes('page=planning') || search.includes('page=financial-planning') ||
    path.endsWith('/planning') || path.endsWith('/planning/') ||
    path.endsWith('/financial-planning') || path.endsWith('/financial-planning/')
  ) {
    return 'planning-dashboard';
  }

  // Check for individual calculators by hash or query parameters
  const hashId = hash.replace(/^#\/?/, '');
  const searchParams = new URLSearchParams(search);
  const queryId = searchParams.get('calc') || searchParams.get('page');

  // Collect all calculator IDs
  const allIds = CATEGORIES.flatMap(c => c.items).map(item => item.id);

  if (allIds.includes(hashId)) {
    return hashId;
  }
  if (allIds.includes(queryId)) {
    return queryId;
  }

  // Check if pathname ends with any calculator ID
  for (const id of allIds) {
    if (path.endsWith(`/${id}`) || path.endsWith(`/${id}/`)) {
      return id;
    }
  }

  // Default calculator (Home Loan)
  return 'home-loan';
};

export default function App() {
  const [activeId, setActiveId] = useState(() => parseUrl());
  const [openCategories, setOpenCategories] = useState({
    loans: true,
    investments: true,
    insurance: true,
    planning: true,
  });
  // Mobile sidebar state
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleUrlChange = () => {
      const newId = parseUrl();
      setActiveId(newId);

      // Auto-expand the corresponding category in the sidebar
      if (newId.endsWith('-dashboard')) {
        const catId = newId.replace('-dashboard', '');
        setOpenCategories(prev => ({ ...prev, [catId]: true }));
      } else {
        const matchedCat = CATEGORIES.find(c => c.items.some(i => i.id === newId));
        if (matchedCat) {
          setOpenCategories(prev => ({ ...prev, [matchedCat.id]: true }));
        }
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    // Sync initial load if a clean path/search parameter was used to update the hash
    const initialId = parseUrl();
    if (initialId && !initialId.endsWith('-dashboard') && !window.location.hash) {
      window.location.hash = `#/${initialId}`;
    } else if (initialId === 'loans-dashboard' && !window.location.hash) {
      window.location.hash = '#/loans';
    } else if (initialId === 'investments-dashboard' && !window.location.hash) {
      window.location.hash = '#/investments';
    } else if (initialId === 'insurance-dashboard' && !window.location.hash) {
      window.location.hash = '#/insurance';
    } else if (initialId === 'planning-dashboard' && !window.location.hash) {
      window.location.hash = '#/planning';
    }

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const toggleCategory = (id) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
    window.location.hash = `#/${id}`;
  };

  const handleItemClick = (id) => {
    window.location.hash = `#/${id}`;
    setMobileOpen(false); // close sidebar on mobile after selection
  };

  const allItems = CATEGORIES.flatMap(c => c.items);
  const activeItem = allItems.find(i => i.id === activeId);

  const renderDashboard = (catId) => {
    const category = CATEGORIES.find(c => c.id === catId);
    if (!category) return null;

    let title = '';

    if (catId === 'loans') {
      title = 'Loan Calculator Details';
    } else if (catId === 'investments') {
      title = 'Investment Calculator Details';
    } else if (catId === 'insurance') {
      title = 'Insurance Calculator Details';
    } else if (catId === 'planning') {
      title = 'Financial Planning Details';
    }

    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">{title}</h1>
        </div>
        <div className="dashboard-grid">
          {category.items.map(item => (
            <div
              key={item.id}
              className="dashboard-card"
              onClick={() => handleItemClick(item.id)}
            >
              <div className="dashboard-card-icon">{item.icon}</div>
              <h2 className="dashboard-card-title">{item.label}</h2>
              <p className="dashboard-card-description">
                {getCardDescription(item.id)}
              </p>
              <button className="dashboard-card-button">
                Use Calculator
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">

      {/* ── Mobile top bar (hamburger) ── */}
      <div className="mobile-topbar">
        <button
          className="hamburger-btn"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
        >
          <span className={`hb-line${mobileOpen ? ' open' : ''}`} />
          <span className={`hb-line${mobileOpen ? ' open' : ''}`} />
          <span className={`hb-line${mobileOpen ? ' open' : ''}`} />
        </button>
        <img src="/Auraverse-Finance-Calculator/logo.png" alt="AuraVerse" className="mobile-logo" />
      </div>

      {/* ── Overlay (mobile only) ── */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <img src="/Auraverse-Finance-Calculator/logo.png" alt="AuraVerse Financial Solutions" className="sidebar-logo" />
        </div>

        <nav className="sidebar-nav">
          {CATEGORIES.map(cat => (
            <div className="sidebar-category" key={cat.id}>
              <div
                className={`sidebar-category-header${activeId === `${cat.id}-dashboard` ? ' active-dashboard' : ''}`}
                onClick={() => toggleCategory(cat.id)}
              >
                <span className="cat-icon">{cat.icon}</span>
                {cat.label}
                <span className={`cat-arrow${openCategories[cat.id] ? ' open' : ''}`}>▶</span>
              </div>

              {openCategories[cat.id] && (
                <div className="sidebar-items">
                  {cat.items.map(item => (
                    <div
                      key={item.id}
                      className={`sidebar-item${activeId === item.id ? ' active' : ''}`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <span className="sidebar-item-icon">{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* ── Main Content ── */}
      <main className="main-content">
        {activeId.endsWith('-dashboard') ? (
          renderDashboard(activeId.replace('-dashboard', ''))
        ) : activeItem ? (
          activeItem.component
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Select a calculator
          </div>
        )}
      </main>
    </div>
  );
}


