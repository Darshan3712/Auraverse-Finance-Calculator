import { useState } from 'react';
import './index.css';

// Loans
import HomeLoan from './calculators/loans/HomeLoan';
import EducationLoan from './calculators/loans/EducationLoan';
import BusinessLoan from './calculators/loans/BusinessLoan';
import PersonalLoan from './calculators/loans/PersonalLoan';

// Investments
import SIP from './calculators/investments/SIP';
import MutualFunds from './calculators/investments/MutualFunds';
import FixedDeposit from './calculators/investments/FixedDeposit';
import PPF from './calculators/investments/PPF';
import RealEstate from './calculators/investments/RealEstate';

// Insurance
import LifeInsurance from './calculators/insurance/LifeInsurance';
import GeneralInsurance from './calculators/insurance/GeneralInsurance';

// Financial Planning
import ChildrenEducation from './calculators/planning/ChildrenEducation';
import WealthCreation from './calculators/planning/WealthCreation';
import RetirementPlanning from './calculators/planning/RetirementPlanning';

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
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    icon: '🔒',
    items: [
      { id: 'life-insurance', label: 'Life Insurance', icon: '❤️', component: <LifeInsurance /> },
      { id: 'general-insurance', label: 'General / Health', icon: '🏥', component: <GeneralInsurance /> },
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
    ],
  },
];

export default function App() {
  const [activeId, setActiveId] = useState('home-loan');
  const [openCategories, setOpenCategories] = useState({
    loans: true,
    investments: true,
    insurance: true,
    planning: true,
  });
  // Mobile sidebar state
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCategory = (id) => {
    setOpenCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleItemClick = (id) => {
    setActiveId(id);
    setMobileOpen(false); // close sidebar on mobile after selection
  };

  const allItems = CATEGORIES.flatMap(c => c.items);
  const activeItem = allItems.find(i => i.id === activeId);

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
        <div className="mobile-brand">AuraVerse FinServe</div>
      </div>

      {/* ── Overlay (mobile only) ── */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-text">AuraVerse FinServe</div>
          <div className="sidebar-brand-sub">All-in-One Financial Calculator</div>
        </div>

        <nav className="sidebar-nav">
          {CATEGORIES.map(cat => (
            <div className="sidebar-category" key={cat.id}>
              <div className="sidebar-category-header" onClick={() => toggleCategory(cat.id)}>
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
        {activeItem ? activeItem.component : <div>Select a calculator</div>}
      </main>
    </div>
  );
}
