/**
 * Financial Calculations Utility
 * All formulas are based on standard financial mathematics used by banks and calculators like Groww, BankBazaar, etc.
 */

// ─── LOAN CALCULATORS ───────────────────────────────────────────────────────

/**
 * EMI Calculator (used for Home Loan, Personal Loan, Education Loan, Business Loan)
 * Formula: EMI = [P × r × (1+r)^n] / [(1+r)^n – 1]
 * P = Principal, r = Monthly Interest Rate, n = Tenure in months
 */
export function calculateEMI(principal, annualRate, tenureYears) {
    const r = annualRate / 12 / 100;
    const n = tenureYears * 12;
    if (r === 0) return { emi: principal / n, totalAmount: principal, totalInterest: 0 };
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - principal;
    return {
        emi: Math.round(emi),
        totalAmount: Math.round(totalAmount),
        totalInterest: Math.round(totalInterest),
    };
}

/**
 * Generates yearly amortization schedule
 */
export function generateAmortizationSchedule(principal, annualRate, tenureYears) {
    const r = annualRate / 12 / 100;
    const n = tenureYears * 12;
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    let balance = principal;
    const schedule = [];

    for (let year = 1; year <= tenureYears; year++) {
        let yearlyPrincipal = 0;
        let yearlyInterest = 0;
        for (let month = 1; month <= 12; month++) {
            if (balance <= 0) break;
            const interest = balance * r;
            const principalPaid = Math.min(emi - interest, balance);
            yearlyInterest += interest;
            yearlyPrincipal += principalPaid;
            balance -= principalPaid;
        }
        schedule.push({
            year,
            principal: Math.round(yearlyPrincipal),
            interest: Math.round(yearlyInterest),
            balance: Math.max(0, Math.round(balance)),
        });
    }
    return schedule;
}

// ─── INVESTMENT CALCULATORS ──────────────────────────────────────────────────

/**
 * SIP Calculator
 * Formula: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
 * P = Monthly investment, i = Monthly rate, n = Number of months
 */
export function calculateSIP(monthlyAmount, annualRate, years) {
    const i = annualRate / 12 / 100;
    const n = years * 12;
    const futureValue = monthlyAmount * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = monthlyAmount * n;
    const returns = futureValue - invested;
    return {
        futureValue: Math.round(futureValue),
        invested: Math.round(invested),
        returns: Math.round(returns),
    };
}

/**
 * Step-up SIP Calculator (also called Top-up SIP / Increasing SIP)
 *
 * Logic: The monthly investment increases by `stepUpRate`% every year.
 *   Year 1 monthly = P
 *   Year 2 monthly = P × (1 + g)
 *   Year y monthly = P × (1 + g)^(y-1)   where g = stepUpRate / 100
 *
 * For each year y, 12 monthly payments of P_y are made.
 * After completing year y there are (years - y) full years remaining.
 * The FV of one year's SIP block at end of that year = P_y × annualFVFactor
 * Then it grows for (years - y) more years: × (1+r)^((years-y)×12)
 *
 * annualFVFactor = ((1+r)^12 - 1) / r × (1+r)   [annuity-due for 12 months]
 *
 * Total invested = Σ P_y × 12 for y = 1..years
 */
export function calculateStepUpSIP(monthlyAmount, annualRate, years, stepUpRate) {
    const r = annualRate / 12 / 100;          // monthly rate
    const g = stepUpRate / 100;               // annual step-up rate

    // FV factor for 12 monthly payments at beginning of each month (annuity-due)
    const annualFVFactor = ((Math.pow(1 + r, 12) - 1) / r) * (1 + r);

    let futureValue = 0;
    let totalInvested = 0;

    for (let year = 1; year <= years; year++) {
        const P = monthlyAmount * Math.pow(1 + g, year - 1); // monthly SIP in this year
        const remainingYears = years - year;                 // years after this year ends
        // FV of this year's 12 SIPs, grown to end of full period
        futureValue += P * annualFVFactor * Math.pow(1 + r, remainingYears * 12);
        totalInvested += P * 12;
    }

    const returns = futureValue - totalInvested;

    // Year-by-year invested & value for the comparison table
    const yearlyBreakdown = [];
    let runningInvested = 0;
    let runningFV = 0;
    const annualFV1Yr = ((Math.pow(1 + r, 12) - 1) / r) * (1 + r);

    for (let year = 1; year <= years; year++) {
        const P = monthlyAmount * Math.pow(1 + g, year - 1);
        runningInvested += P * 12;
        // Recompute full FV up to this year (sum from year 1 to current year)
        let fv = 0;
        for (let y = 1; y <= year; y++) {
            const Py = monthlyAmount * Math.pow(1 + g, y - 1);
            const rem = year - y;
            fv += Py * annualFV1Yr * Math.pow(1 + r, rem * 12);
        }
        yearlyBreakdown.push({
            year,
            monthlyAmount: Math.round(P),
            invested: Math.round(runningInvested),
            value: Math.round(fv),
        });
    }

    return {
        futureValue: Math.round(futureValue),
        invested: Math.round(totalInvested),
        returns: Math.round(returns),
        yearlyBreakdown,
    };
}


/**
 * Fixed Deposit Calculator
 * Quarterly compounding: A = P × (1 + r/4)^(4t)
 */
export function calculateFD(principal, annualRate, years, compoundingFrequency = 4) {
    const r = annualRate / 100;
    const maturity = principal * Math.pow(1 + r / compoundingFrequency, compoundingFrequency * years);
    const interest = maturity - principal;
    return {
        maturity: Math.round(maturity),
        interest: Math.round(interest),
        principal,
    };
}

/**
 * PPF Calculator
 * PPF uses annual compounding: A = P × [(1+r)^n - 1] × (1+r) / r
 * But PPF allows yearly deposits, so we sum each year's compounding
 */
export function calculatePPF(yearlyDeposit, years, rate = 7.1) {
    const r = rate / 100;
    let total = 0;
    for (let y = 1; y <= years; y++) {
        total += yearlyDeposit * Math.pow(1 + r, years - y + 1);
    }
    const totalDeposited = yearlyDeposit * years;
    const totalInterest = total - totalDeposited;
    return {
        maturity: Math.round(total),
        totalDeposited: Math.round(totalDeposited),
        totalInterest: Math.round(totalInterest),
    };
}

/**
 * Mutual Fund Lump Sum Calculator (similar to FD but with market-linked returns)
 * A = P × (1 + r)^n
 */
export function calculateMutualFund(principal, annualReturn, years) {
    const r = annualReturn / 100;
    const maturity = principal * Math.pow(1 + r, years);
    const gains = maturity - principal;
    return {
        maturity: Math.round(maturity),
        gains: Math.round(gains),
        principal,
    };
}

/**
 * Real Estate Calculator
 * Appreciation: Value = Cost × (1 + rate)^years
 * Rental Yield: Annual income / Current value × 100
 */
export function calculateRealEstate(purchasePrice, appreciationRate, years, monthlyRent = 0) {
    const futureValue = purchasePrice * Math.pow(1 + appreciationRate / 100, years);
    const totalRentalIncome = monthlyRent * 12 * years;
    const capitalGain = futureValue - purchasePrice;
    const totalReturn = capitalGain + totalRentalIncome;
    const annualizedReturn = (Math.pow(futureValue / purchasePrice, 1 / years) - 1) * 100;
    return {
        futureValue: Math.round(futureValue),
        capitalGain: Math.round(capitalGain),
        totalRentalIncome: Math.round(totalRentalIncome),
        totalReturn: Math.round(totalReturn),
        annualizedReturn: annualizedReturn.toFixed(2),
    };
}

// ─── INSURANCE CALCULATORS ───────────────────────────────────────────────────

/**
 * Life Insurance Cover Calculator
 * Human Life Value (HLV) Method: Cover = Annual Income × Years to Retirement × Multiplier
 * Also uses DIME method: Debt + Income × Years + Mortgage + Education
 */
export function calculateLifeInsurance(age, annualIncome, retirementAge, existingDebts, annualExpenses) {
    const yearsToRetirement = retirementAge - age;
    // HLV Method
    const hlvCover = annualIncome * yearsToRetirement;
    // Income Replacement Method (10x income is industry thumb rule)
    const incomeReplacementCover = annualIncome * 10;
    // Needs-Based Method
    const needsBasedCover = existingDebts + (annualExpenses * yearsToRetirement);
    const recommendedCover = Math.max(hlvCover, incomeReplacementCover, needsBasedCover);
    // Rough premium estimate: ~0.3–0.5% of sum assured for term plan at young age
    const premiumRate = age < 35 ? 0.003 : age < 45 ? 0.005 : 0.008;
    const annualPremium = recommendedCover * premiumRate;

    return {
        hlvCover: Math.round(hlvCover),
        incomeReplacementCover: Math.round(incomeReplacementCover),
        needsBasedCover: Math.round(needsBasedCover),
        recommendedCover: Math.round(recommendedCover),
        estimatedPremium: Math.round(annualPremium),
    };
}

/**
 * General Insurance Premium Estimator (Health Insurance focus)
 * Based on factors like age, members, pre-existing conditions
 */
export function calculateHealthInsurance(age, members, coverAmount, hasPreExisting) {
    // Base premium rates per lakh of cover (approximate industry rates)
    let baseRatePerLakh;
    if (age < 30) baseRatePerLakh = 400;
    else if (age < 40) baseRatePerLakh = 600;
    else if (age < 50) baseRatePerLakh = 900;
    else if (age < 60) baseRatePerLakh = 1400;
    else baseRatePerLakh = 2200;

    const coverInLakhs = coverAmount / 100000;
    let premium = baseRatePerLakh * coverInLakhs;

    // Family floater loading
    if (members === 2) premium *= 1.5;
    else if (members === 3) premium *= 1.8;
    else if (members >= 4) premium *= 2.1;

    // Pre-existing condition loading
    if (hasPreExisting) premium *= 1.3;

    const gst = premium * 0.18;
    const totalPremium = premium + gst;

    return {
        basePremium: Math.round(premium),
        gst: Math.round(gst),
        totalPremium: Math.round(totalPremium),
        monthlyPremium: Math.round(totalPremium / 12),
    };
}

// ─── FINANCIAL PLANNING CALCULATORS ─────────────────────────────────────────

/**
 * Children Education Planning
 * Calculates how much to save monthly to fund child's education
 * Future Cost = Current Cost × (1 + inflation)^years
 * Monthly savings needed via SIP
 */
export function calculateEducationPlanning(currentCost, inflationRate, yearsToNeed, expectedReturn) {
    const futureCost = currentCost * Math.pow(1 + inflationRate / 100, yearsToNeed);
    // Reverse SIP: How much to invest monthly to get target amount?
    const r = expectedReturn / 12 / 100;
    const n = yearsToNeed * 12;
    const monthlySIP = futureCost * r / ((Math.pow(1 + r, n) - 1) * (1 + r));
    const totalInvested = monthlySIP * n;
    const returnsEarned = futureCost - totalInvested;

    return {
        futureCost: Math.round(futureCost),
        monthlySIP: Math.round(monthlySIP),
        totalInvested: Math.round(totalInvested),
        returnsEarned: Math.round(returnsEarned),
    };
}

/**
 * Retirement Planning Calculator
 * Step 1: Calculate inflation-adjusted monthly expense at retirement
 * Step 2: Calculate corpus needed (assuming 25x annual expenses = 4% withdrawal rate)
 * Step 3: Calculate monthly SIP to build corpus
 */
export function calculateRetirementPlanning(currentAge, retirementAge, currentExpenses, inflationRate, expectedReturn, postRetirementReturn) {
    const yearsToRetirement = retirementAge - currentAge;
    const lifeExpectancy = 85;
    const yearsInRetirement = lifeExpectancy - retirementAge;

    // Inflation-adjusted monthly expenses at retirement
    const futureMonthlyExpense = currentExpenses * Math.pow(1 + inflationRate / 100, yearsToRetirement);
    const futureAnnualExpense = futureMonthlyExpense * 12;

    // Corpus needed using Present Value of Annuity formula
    const postR = postRetirementReturn / 100;
    const inflR = inflationRate / 100;
    const realRate = (1 + postR) / (1 + inflR) - 1;
    const corpusNeeded = futureAnnualExpense * ((1 - Math.pow(1 + realRate, -yearsInRetirement)) / realRate);

    // Monthly SIP to accumulate corpus
    const r = expectedReturn / 12 / 100;
    const n = yearsToRetirement * 12;
    const monthlySIP = corpusNeeded * r / ((Math.pow(1 + r, n) - 1) * (1 + r));

    return {
        futureMonthlyExpense: Math.round(futureMonthlyExpense),
        corpusNeeded: Math.round(corpusNeeded),
        monthlySIP: Math.round(monthlySIP),
        yearsToRetirement,
        yearsInRetirement,
    };
}

/**
 * Wealth Creation Calculator
 * Shows the power of compounding across different scenarios
 * Multiple asset classes: Equity (12%), Debt (7%), Gold (8%), Real Estate (10%)
 */
export function calculateWealthCreation(monthlyInvestment, years, strategy) {
    const strategies = {
        conservative: { equity: 20, debt: 70, gold: 10, expectedReturn: 8 },
        moderate: { equity: 50, debt: 35, gold: 15, expectedReturn: 10.5 },
        aggressive: { equity: 75, debt: 15, gold: 10, expectedReturn: 13 },
    };

    const selected = strategies[strategy] || strategies.moderate;
    const r = selected.expectedReturn / 12 / 100;
    const n = years * 12;
    const futureValue = monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
    const totalInvested = monthlyInvestment * n;
    const wealthGained = futureValue - totalInvested;

    // Milestone values (5yr, 10yr, etc.)
    const milestones = [5, 10, 15, 20, 25, 30].filter(y => y <= years).map(y => {
        const mn = y * 12;
        const mv = monthlyInvestment * ((Math.pow(1 + r, mn) - 1) / r) * (1 + r);
        return { year: y, value: Math.round(mv) };
    });

    return {
        futureValue: Math.round(futureValue),
        totalInvested: Math.round(totalInvested),
        wealthGained: Math.round(wealthGained),
        expectedReturn: selected.expectedReturn,
        allocation: { equity: selected.equity, debt: selected.debt, gold: selected.gold },
        milestones,
    };
}

// ─── FORMATTING UTILITIES ─────────────────────────────────────────────────────

/**
 * Format number as Indian currency (₹ with lakhs/crores)
 */
export function formatINR(amount) {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Format number with Indian comma system
 */
export function formatNumber(amount) {
    return amount.toLocaleString('en-IN');
}
