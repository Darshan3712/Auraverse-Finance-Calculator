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

// ─── BONDS CALCULATOR ────────────────────────────────────────────────────────

/**
 * Bonds Yield and Returns Calculator
 * Solves for Yield to Maturity (YTM) exactly using Bisection numerical method.
 * Computes Current Yield, Total Payouts, and Returns.
 */
export function calculateBond(faceValue, purchasePrice, couponRate, years, frequency = 1) {
    const couponPayment = faceValue * (couponRate / 100);
    const totalPeriods = years * frequency;
    const periodCoupon = couponPayment / frequency;
    
    // Current Yield = (Annual Coupon / Purchase Price) * 100
    const currentYield = (couponPayment / purchasePrice) * 100;
    
    // Total Interest Paid
    const totalInterest = couponPayment * years;
    
    // Maturity Amount
    const maturityAmount = faceValue;
    
    // Total Returns / Gain
    const totalGain = faceValue + totalInterest - purchasePrice;
    
    // Yield to Maturity (YTM) calculation using Bisection Method
    let ytm = 0;
    let low = -0.99; // Yield cannot be less than -100%
    let high = 2.0;  // 200% limit
    
    for (let iter = 0; iter < 100; iter++) {
        const mid = (low + high) / 2;
        let pv = 0;
        
        // Present value of coupons
        for (let t = 1; t <= totalPeriods; t++) {
            pv += periodCoupon / Math.pow(1 + mid / frequency, t);
        }
        // Present value of principal
        pv += faceValue / Math.pow(1 + mid / frequency, totalPeriods);
        
        if (Math.abs(pv - purchasePrice) < 0.0001) {
            ytm = mid;
            break;
        }
        
        if (pv > purchasePrice) {
            low = mid;
        } else {
            high = mid;
        }
    }
    if (ytm === 0) {
        ytm = (low + high) / 2;
    }
    
    // Create cashflow schedule (yearly or periodic breakdown)
    const schedule = [];
    let cumulativeInterest = 0;
    for (let period = 1; period <= totalPeriods; period++) {
        cumulativeInterest += periodCoupon;
        schedule.push({
            period,
            year: (period / frequency).toFixed(1),
            payout: periodCoupon,
            cumulative: cumulativeInterest,
        });
    }

    return {
        currentYield: parseFloat(currentYield.toFixed(2)),
        ytm: parseFloat((ytm * 100).toFixed(2)),
        totalInterest: Math.round(totalInterest),
        maturityAmount: Math.round(maturityAmount),
        totalGain: Math.round(totalGain),
        schedule
    };
}

// ─── GOAL BASED SAVINGS PLANNING CALCULATOR ──────────────────────────────────

/**
 * Goal-Based Savings Planning Calculator
 * Computes inflation-adjusted future goal cost, expected growth of existing savings,
 * remaining gap to be accumulated, and the required monthly SIP contribution.
 */
export function calculateGoalPlanning(presentCost, inflationRate, years, expectedReturn, existingSavings) {
    // 1. Future cost of the goal adjusted for inflation
    const futureCost = presentCost * Math.pow(1 + inflationRate / 100, years);
    
    // 2. Future value of existing savings
    const r = expectedReturn / 100;
    const fvSavings = existingSavings * Math.pow(1 + r, years);
    
    // 3. Gap amount to be funded
    const gap = Math.max(0, futureCost - fvSavings);
    
    // 4. Monthly SIP required to cover the gap
    let monthlySIP = 0;
    const monthlyRate = expectedReturn / 12 / 100;
    const months = years * 12;
    
    if (gap > 0) {
        if (monthlyRate > 0) {
            monthlySIP = gap * monthlyRate / ((Math.pow(1 + monthlyRate, months) - 1) * (1 + monthlyRate));
        } else {
            monthlySIP = gap / months;
        }
    }
    
    // 5. Total Invested by the user (existing savings + new SIP payments)
    const totalSIPInvested = monthlySIP * months;
    const totalInvested = existingSavings + totalSIPInvested;
    
    // 6. Returns earned
    const returnsEarned = futureCost - totalInvested;
    
    // Year-by-year breakdown
    const yearlyBreakdown = [];
    let runningSavings = existingSavings;
    let runningSIPInvested = 0;
    
    for (let y = 1; y <= years; y++) {
        // Grow savings for 1 year
        runningSavings = runningSavings * (1 + r);
        
        // SIP contribution for this year
        const sipContributedThisYear = monthlySIP * 12;
        runningSIPInvested += sipContributedThisYear;
        
        // Value of SIP at end of year
        const annualFVFactor = monthlyRate > 0 ? ((Math.pow(1 + monthlyRate, 12) - 1) / monthlyRate) * (1 + monthlyRate) : 12;
        
        let sipFV = 0;
        for (let yearIdx = 1; yearIdx <= y; yearIdx++) {
            const remainingY = y - yearIdx;
            sipFV += monthlySIP * annualFVFactor * Math.pow(1 + monthlyRate, remainingY * 12);
        }
        
        const totalAccumulated = runningSavings + sipFV;
        const inflationAdjustedCost = presentCost * Math.pow(1 + inflationRate / 100, y);
        
        yearlyBreakdown.push({
            year: y,
            targetCost: Math.round(inflationAdjustedCost),
            accumulated: Math.round(totalAccumulated),
            invested: Math.round(existingSavings + runningSIPInvested),
        });
    }

    return {
        futureCost: Math.round(futureCost),
        fvSavings: Math.round(fvSavings),
        gap: Math.round(gap),
        monthlySIP: Math.round(monthlySIP),
        totalInvested: Math.round(totalInvested),
        totalSIPInvested: Math.round(totalSIPInvested),
        returnsEarned: Math.round(returnsEarned),
        yearlyBreakdown
    };
}



// ─── TERM INSURANCE CALCULATOR ───────────────────────────────────────────────

/**
 * Term Insurance Premium Calculator
 * Computes premiums based on Age, Gender, Smoking, Sum Assured, Policy Term,
 * Payment Term, Payout Frequency, and optional riders including Global Travel Cover.
 */
export function calculateTermInsurance(age, gender, smoking, sumAssured, policyTerm, paymentTerm, frequency, riders = {}) {
    // Base rate per 1 Lakh of sum assured
    let baseRate = 8; // base rate per 1 Lakh
    
    // Age loading
    if (age < 25) baseRate = 8;
    else if (age < 30) baseRate = 10;
    else if (age < 35) baseRate = 13;
    else if (age < 40) baseRate = 18;
    else if (age < 45) baseRate = 25;
    else if (age < 50) baseRate = 38;
    else if (age < 55) baseRate = 58;
    else baseRate = 90;
    
    // Smoking loading
    if (smoking === 'tobacco') {
        baseRate *= 1.5;
    }
    
    // Gender discount for females
    if (gender === 'female') {
        baseRate *= 0.9;
    }
    
    // Policy term loading
    const termLoading = 1 + (policyTerm - 10) * 0.01;
    baseRate *= termLoading;
    
    // Calculate raw annual base premium
    let annualBasePremium = (baseRate * (sumAssured / 100000)) * 1000;
    
    // Limited pay factor: if paymentTerm < policyTerm, premiums are compressed
    if (paymentTerm < policyTerm) {
        const compressRatio = policyTerm / paymentTerm;
        annualBasePremium = annualBasePremium * compressRatio * 0.85; 
    }
    
    // Optional Riders
    let accidentalDeathPremium = 0;
    let criticalIllnessPremium = 0;
    let waiverOfPremiumCost = 0;
    let globalTravelPremium = 0;
    
    if (riders.accidentalDeath) {
        accidentalDeathPremium = sumAssured * 0.0004; // 0.04% of sum assured
    }
    if (riders.criticalIllness) {
        let ciRate = age < 30 ? 1.5 : age < 40 ? 3.0 : 6.0;
        if (smoking === 'tobacco') ciRate *= 1.4;
        criticalIllnessPremium = (sumAssured * (ciRate / 100000)) * 1000 * 0.15; // CI covers smaller fraction
    }
    if (riders.waiverOfPremium) {
        waiverOfPremiumCost = annualBasePremium * 0.05;
    }
    if (riders.globalTravel) {
        // Global travel rider: adds flat 10% premium loading for worldwide coverage
        globalTravelPremium = annualBasePremium * 0.10;
    }
    
    const totalAnnualPremium = annualBasePremium + accidentalDeathPremium + criticalIllnessPremium + waiverOfPremiumCost + globalTravelPremium;
    
    // Payout installment frequencies
    let freqFactor = 1.0;
    let periods = 1;
    if (frequency === 'monthly') {
        freqFactor = 0.088;
        periods = 12;
    } else if (frequency === 'half-yearly') {
        freqFactor = 0.51;
        periods = 2;
    }
    
    const installmentPremium = totalAnnualPremium * freqFactor;
    const gst = installmentPremium * 0.18; // 18% GST
    const totalInstallmentWithGst = installmentPremium + gst;
    
    // Section 80C Tax savings (30% tax slab assumption)
    const taxSaving = Math.min(totalAnnualPremium, 150000) * 0.30;

    return {
        basePremium: Math.round(annualBasePremium),
        accidentalDeathPremium: Math.round(accidentalDeathPremium),
        criticalIllnessPremium: Math.round(criticalIllnessPremium),
        waiverOfPremiumCost: Math.round(waiverOfPremiumCost),
        globalTravelPremium: Math.round(globalTravelPremium),
        gst: Math.round(gst * periods),
        totalAnnualPremium: Math.round(totalAnnualPremium),
        installmentPremium: Math.round(installmentPremium),
        installmentGst: Math.round(gst),
        totalInstallmentWithGst: Math.round(totalInstallmentWithGst),
        totalWithGstYearly: Math.round(totalAnnualPremium * 1.18),
        taxSaving: Math.round(taxSaving)
    };
}

// ─── MOTOR INSURANCE CALCULATOR ──────────────────────────────────────────────

/**
 * Motor Insurance Premium Calculator
 * Evaluates vehicle depreciation, IDV, Own Damage base premium,
 * No Claim Bonus (NCB) discount, Third Party pricing based on CC, and add-on costs.
 */
export function calculateMotorInsurance(vehicleType, exShowroom, ageYears, cc, ncbPercent, policyType, addOns = {}) {
    // 1. Calculate Insured Declared Value (IDV) via depreciation
    let depPercent = 5;
    if (ageYears <= 0.5) depPercent = 5;
    else if (ageYears <= 1) depPercent = 15;
    else if (ageYears <= 2) depPercent = 20;
    else if (ageYears <= 3) depPercent = 30;
    else if (ageYears <= 4) depPercent = 40;
    else if (ageYears <= 5) depPercent = 50;
    else depPercent = 60; // Older vehicle
    
    const idv = exShowroom * (1 - depPercent / 100);
    
    // 2. Own Damage (OD) Base Premium (2.5% for cars, 1.8% for two-wheelers)
    let odRate = vehicleType === 'car' ? 0.025 : 0.018;
    let odBase = idv * odRate;
    
    // Apply NCB discount on OD premium
    const ncbDiscount = odBase * (ncbPercent / 100);
    let netODPremium = Math.max(0, odBase - ncbDiscount);
    
    // 3. Third Party (TP) Premium (IRDAI standards based on engine CC)
    let tpPremium = 0;
    if (vehicleType === 'car') {
        if (cc < 1000) tpPremium = 2094;
        else if (cc <= 1500) tpPremium = 3416;
        else tpPremium = 7897;
    } else {
        // Two-wheeler
        if (cc < 75) tpPremium = 538;
        else if (cc <= 150) tpPremium = 714;
        else if (cc <= 350) tpPremium = 1366;
        else tpPremium = 2804;
    }
    
    // 4. Add-on covers
    let zeroDepCost = 0;
    let engineProtectCost = 0;
    let rsaCost = 0;
    
    if (addOns.zeroDep) {
        zeroDepCost = idv * (vehicleType === 'car' ? 0.006 : 0.004);
    }
    if (addOns.engineProtect) {
        engineProtectCost = idv * 0.0015;
    }
    if (addOns.rsa) {
        rsaCost = vehicleType === 'car' ? 350 : 150;
    }
    
    const totalAddons = zeroDepCost + engineProtectCost + rsaCost;
    
    // 5. Net premium calculation based on selected policy type
    let netPremium = 0;
    if (policyType === 'comprehensive') {
        netPremium = netODPremium + tpPremium + totalAddons;
    } else if (policyType === 'od_only') {
        netPremium = netODPremium + totalAddons;
    } else if (policyType === 'tp_only') {
        netPremium = tpPremium; // No add-ons allowed under pure TP policy
    }
    
    // 6. GST (18%)
    const gst = netPremium * 0.18;
    const finalPremium = netPremium + gst;
    
    return {
        idv: Math.round(idv),
        depPercent,
        odBase: Math.round(odBase),
        ncbDiscount: Math.round(ncbDiscount),
        netODPremium: Math.round(netODPremium),
        tpPremium: Math.round(tpPremium),
        addonsCost: Math.round(totalAddons),
        zeroDepCost: Math.round(zeroDepCost),
        engineProtectCost: Math.round(engineProtectCost),
        rsaCost: Math.round(rsaCost),
        netPremium: Math.round(netPremium),
        gst: Math.round(gst),
        finalPremium: Math.round(finalPremium)
    };
}



// ─── TAX PLANNING CALCULATOR ─────────────────────────────────────────────────

function computeNewRegimeTax(income) {
    if (income <= 700000) return 0; // Section 87A rebate makes tax zero for taxable income <= 7L
    
    let tax = 0;
    // Slabs for New Tax Regime (FY 2025-26 / 2026-27):
    // Up to 3,00,000: Nil
    // 3,00,001 to 7,00,000: 5% (Max 20,000)
    // 7,00,001 to 10,00,000: 10% (Max 30,000)
    // 10,00,001 to 12,00,000: 15% (Max 30,000)
    // 12,00,001 to 15,00,000: 20% (Max 60,000)
    // Above 15,00,000: 30%
    if (income > 1500000) {
        tax += (income - 1500000) * 0.30 + 60000 + 30000 + 30000 + 20000;
    } else if (income > 1200000) {
        tax += (income - 1200000) * 0.20 + 30000 + 30000 + 20000;
    } else if (income > 1000000) {
        tax += (income - 1000000) * 0.15 + 30000 + 20000;
    } else if (income > 700000) {
        tax += (income - 700000) * 0.10 + 20000;
    } else if (income > 300000) {
        tax += (income - 300000) * 0.05;
    }
    return tax;
}

function computeOldRegimeTax(income) {
    if (income <= 500000) return 0; // Section 87A rebate makes tax zero for taxable income <= 5L
    
    let tax = 0;
    // Slabs for Old Tax Regime:
    // Up to 2,50,000: Nil
    // 2,50,001 to 5,00,000: 5% (Max 12,500)
    // 5,00,001 to 10,00,000: 20% (Max 1,00,000)
    // Above 10,00,000: 30%
    if (income > 1000000) {
        tax += (income - 1000000) * 0.30 + 100000 + 12500;
    } else if (income > 500000) {
        tax += (income - 500000) * 0.20 + 12500;
    } else if (income > 250000) {
        tax += (income - 250000) * 0.05;
    }
    return tax;
}

/**
 * Income Tax Planner (Old vs New Regime)
 */
export function calculateTaxPlanning(grossSalary, otherIncome, deduction80C, deduction80D, homeLoanInterest, otherDeductions) {
    // 1. Calculate taxable income under New Regime
    // Only standard deduction of ₹75,000 is allowed. No other Chapter VI-A deductions are allowed.
    const newRegimeStdDeduction = 75000;
    const grossIncome = grossSalary + otherIncome;
    const newTaxableIncome = Math.max(0, grossIncome - newRegimeStdDeduction);
    const rawNewTax = computeNewRegimeTax(newTaxableIncome);
    const newCess = rawNewTax * 0.04;
    const finalNewTax = rawNewTax + newCess;

    // 2. Calculate taxable income under Old Regime
    // Standard deduction of ₹50,000 + 80C (max 1.5L) + 80D (max 25k) + Home loan interest (max 2L) + Other Deductions
    const oldRegimeStdDeduction = 50000;
    const capped80C = Math.min(150000, deduction80C);
    const capped80D = Math.min(25000, deduction80D);
    const cappedHomeLoan = Math.min(200000, homeLoanInterest);
    
    const totalOldDeductions = oldRegimeStdDeduction + capped80C + capped80D + cappedHomeLoan + otherDeductions;
    const oldTaxableIncome = Math.max(0, grossIncome - totalOldDeductions);
    const rawOldTax = computeOldRegimeTax(oldTaxableIncome);
    const oldCess = rawOldTax * 0.04;
    const finalOldTax = rawOldTax + oldCess;

    // 3. Recommendation
    const taxSaved = Math.abs(finalOldTax - finalNewTax);
    const recommendedRegime = finalNewTax < finalOldTax ? 'New Tax Regime' : 'Old Tax Regime';
    
    return {
        grossIncome,
        newTaxableIncome: Math.round(newTaxableIncome),
        oldTaxableIncome: Math.round(oldTaxableIncome),
        newRegimeDeductions: newRegimeStdDeduction,
        oldRegimeDeductions: totalOldDeductions,
        newTax: Math.round(finalNewTax),
        oldTax: Math.round(finalOldTax),
        newRegimeCess: Math.round(newCess),
        oldRegimeCess: Math.round(oldCess),
        taxSaved: Math.round(taxSaved),
        recommendedRegime
    };
}

// ─── RISK MANAGEMENT & ASSET ALLOCATION CALCULATOR ────────────────────────────

/**
 * Risk Assessment, Asset Allocation, and Protection Sufficiency Calculator
 */
export function calculateRiskManagement(age, monthlyExpenses, currentSavings, riskLevel, annualIncome, currentTermCover, currentHealthCover, outstandingDebts) {
    // 1. Asset Allocation suggestions based on "100 - age" rule & Risk Profile
    const baseEquity = Math.max(10, Math.min(90, 100 - age));
    let equity = 50;
    let debt = 30;
    let gold = 10;
    let cash = 10;

    if (riskLevel === 'conservative') {
        equity = Math.round(baseEquity * 0.6);
        debt = Math.round((100 - equity) * 0.70);
        gold = Math.round((100 - equity) * 0.20);
        cash = 100 - equity - debt - gold;
    } else if (riskLevel === 'moderate') {
        equity = baseEquity;
        debt = Math.round((100 - equity) * 0.65);
        gold = Math.round((100 - equity) * 0.20);
        cash = 100 - equity - debt - gold;
    } else {
        // aggressive
        equity = Math.min(85, Math.round(baseEquity * 1.3));
        debt = Math.round((100 - equity) * 0.50);
        gold = Math.round((100 - equity) * 0.35);
        cash = 100 - equity - debt - gold;
    }

    // 2. Emergency Fund Check (6 months of monthly expenses, 9 months for conservative)
    const multiplier = riskLevel === 'conservative' ? 9 : 6;
    const recommendedEmergency = monthlyExpenses * multiplier;
    const emergencyFundStatus = currentSavings >= recommendedEmergency ? 'Adequate' : 'Underfunded';
    const emergencyGap = Math.max(0, recommendedEmergency - currentSavings);

    // 3. Term Insurance Coverage Adequacy (10x annual income + outstanding debts)
    const recommendedTerm = (10 * annualIncome) + outstandingDebts;
    const termAdequacy = currentTermCover >= recommendedTerm ? 'Adequate' : 'Underfunded';
    const termGap = Math.max(0, recommendedTerm - currentTermCover);

    // 4. Health Insurance Coverage Adequacy (Higher of 5 Lakhs or 50% of annual income)
    const recommendedHealth = Math.max(500000, annualIncome * 0.5);
    const healthAdequacy = currentHealthCover >= recommendedHealth ? 'Adequate' : 'Underfunded';
    const healthGap = Math.max(0, recommendedHealth - currentHealthCover);

    return {
        allocation: { equity, debt, gold, cash },
        recommendedEmergency: Math.round(recommendedEmergency),
        emergencyFundStatus,
        emergencyGap: Math.round(emergencyGap),
        recommendedTerm: Math.round(recommendedTerm),
        termAdequacy,
        termGap: Math.round(termGap),
        recommendedHealth: Math.round(recommendedHealth),
        healthAdequacy,
        healthGap: Math.round(healthGap)
    };
}


// ─── INFLATION RATE CALCULATOR ───────────────────────────────────────────────

/**
 * Inflation Rate Calculator
 * Computes future cost of today's goods/services considering compound inflation.
 * Also shows purchasing power erosion, year-wise breakdown, and the Rule of 72 doubling time.
 *
 * @param {number} currentCost - Today's cost/value of the item (₹)
 * @param {number} inflationRate - Expected annual inflation rate (%)
 * @param {number} years - Time period in years
 * @returns {object} futureCost, inflationCost, purchasingPower, doublingTime, yearlyBreakdown
 */
export function calculateInflation(currentCost, inflationRate, years) {
    const r = inflationRate / 100;

    // Future cost using compound inflation: FC = P × (1 + r)^n
    const futureCost = Math.round(currentCost * Math.pow(1 + r, years));
    const inflationCost = futureCost - currentCost;

    // Purchasing power: how many rupees of today's value remain in ₹100 after n years
    // PP = (1 / (1 + r)^n) × 100
    const purchasingPower = (1 / Math.pow(1 + r, years)) * 100;

    // Rule of 72: years to double prices
    const doublingTime = 72 / inflationRate;

    // Year-by-year breakdown
    const yearlyBreakdown = [];
    for (let y = 1; y <= years; y++) {
        const fc = Math.round(currentCost * Math.pow(1 + r, y));
        const erosion = fc - currentCost;
        const pp = (1 / Math.pow(1 + r, y)) * 100;
        yearlyBreakdown.push({
            year: y,
            futureCost: fc,
            erosion,
            purchasingPower: parseFloat(pp.toFixed(2)),
        });
    }

    return {
        futureCost,
        inflationCost,
        purchasingPower: parseFloat(purchasingPower.toFixed(2)),
        doublingTime,
        yearlyBreakdown,
    };
}



// ─── PENSION CALCULATOR ───────────────────────────────────────────────────────

/**
 * SECTION 1: How much to invest to get a target monthly pension?
 *
 * Steps:
 * 1. Inflate the desired monthly pension to its real future value at retirement
 *    (since ₹X today won't have same value after `accumulationYears`)
 * 2. Compute the corpus needed at retirement via PV of an annuity (drawdown phase)
 * 3. Reverse-compute the required periodic investment during accumulation phase
 *
 * @param {number} desiredMonthlyPension - Monthly pension desired at retirement (today's ₹)
 * @param {number} accumulationYears     - Years of investment / accumulation phase
 * @param {number} drawdownYears         - Years pension will be drawn after retirement
 * @param {number} annualReturnRate      - Expected annual return during accumulation (%)
 * @param {number} drawdownReturnRate    - Expected annual return during drawdown (%)
 * @param {number} inflationRate         - Annual inflation rate (%)
 * @param {'monthly'|'half-yearly'|'yearly'|'lumpsum'} frequency - Contribution frequency
 */
export function calculatePensionToTarget(
    desiredMonthlyPension,
    accumulationYears,
    drawdownYears,
    annualReturnRate,
    drawdownReturnRate,
    inflationRate,
    frequency
) {
    const inf = inflationRate / 100;

    // 1. Future value of the desired monthly pension (inflation-adjusted at retirement)
    const futureMonthlPension = desiredMonthlyPension * Math.pow(1 + inf, accumulationYears);
    const futureAnnualPension  = futureMonthlPension * 12;

    // 2. Corpus needed at retirement (PV of inflation-adjusted annuity during drawdown)
    const postR   = drawdownReturnRate / 100;
    const realRate = (1 + postR) / (1 + inf) - 1;
    let corpusNeeded;
    if (Math.abs(realRate) < 0.0001) {
        corpusNeeded = futureAnnualPension * drawdownYears;
    } else {
        corpusNeeded = futureAnnualPension * ((1 - Math.pow(1 + realRate, -drawdownYears)) / realRate);
    }

    // 3. Required periodic investment during accumulation
    const r = annualReturnRate / 100;
    const rm = r / 12; // monthly rate
    const n  = accumulationYears;

    let requiredInvestment = 0;
    let totalInvested = 0;
    let periodsLabel = '';

    if (frequency === 'lumpsum') {
        // PV of lump-sum: Invest = corpusNeeded / (1 + r)^n
        requiredInvestment = corpusNeeded / Math.pow(1 + r, n);
        totalInvested = requiredInvestment;
        periodsLabel  = 'One-Time';
    } else if (frequency === 'monthly') {
        // Monthly SIP reverse formula
        const nm = n * 12;
        requiredInvestment = corpusNeeded * rm / ((Math.pow(1 + rm, nm) - 1) * (1 + rm));
        totalInvested = requiredInvestment * nm;
        periodsLabel  = '/month';
    } else if (frequency === 'half-yearly') {
        const r6 = Math.pow(1 + r, 0.5) - 1; // effective 6-month rate
        const n6 = n * 2;
        requiredInvestment = corpusNeeded * r6 / ((Math.pow(1 + r6, n6) - 1) * (1 + r6));
        totalInvested = requiredInvestment * n6;
        periodsLabel  = '/half-year';
    } else {
        // Yearly
        const n1 = n;
        requiredInvestment = corpusNeeded * r / ((Math.pow(1 + r, n1) - 1) * (1 + r));
        totalInvested = requiredInvestment * n1;
        periodsLabel  = '/year';
    }

    const wealthGained = corpusNeeded - totalInvested;

    // Year-wise corpus growth breakdown
    const yearlyBreakdown = [];
    let accum = frequency === 'lumpsum' ? requiredInvestment : 0;
    for (let y = 1; y <= accumulationYears; y++) {
        if (frequency === 'lumpsum') {
            accum = requiredInvestment * Math.pow(1 + r, y);
        } else if (frequency === 'monthly') {
            const months = y * 12;
            accum = requiredInvestment * ((Math.pow(1 + rm, months) - 1) / rm) * (1 + rm);
        } else if (frequency === 'half-yearly') {
            const r6 = Math.pow(1 + r, 0.5) - 1;
            const periods = y * 2;
            accum = requiredInvestment * ((Math.pow(1 + r6, periods) - 1) / r6) * (1 + r6);
        } else {
            // yearly
            accum = requiredInvestment * ((Math.pow(1 + r, y) - 1) / r) * (1 + r);
        }

        const invested = frequency === 'lumpsum' ? requiredInvestment
            : frequency === 'monthly' ? requiredInvestment * y * 12
            : frequency === 'half-yearly' ? requiredInvestment * y * 2
            : requiredInvestment * y;

        yearlyBreakdown.push({
            year: y,
            invested: Math.round(invested),
            corpusValue: Math.round(accum),
        });
    }

    return {
        requiredInvestment: Math.round(requiredInvestment),
        corpusNeeded: Math.round(corpusNeeded),
        futureMonthlPension: Math.round(futureMonthlPension),
        totalInvested: Math.round(totalInvested),
        wealthGained: Math.round(wealthGained),
        periodsLabel,
        yearlyBreakdown,
    };
}

/**
 * SECTION 2: If I invest ₹X periodically, how much monthly pension will I get?
 *
 * Steps:
 * 1. Compute the corpus at retirement from the periodic investment
 * 2. Calculate the sustainable monthly pension from that corpus during drawdown,
 *    accounting for inflation so real purchasing power is maintained.
 *
 * @param {number} investmentAmount      - Amount invested per period (₹)
 * @param {number} accumulationYears     - Years of investment / accumulation
 * @param {number} drawdownYears         - Years pension will be drawn
 * @param {number} annualReturnRate      - Expected annual return during accumulation (%)
 * @param {number} drawdownReturnRate    - Expected return during drawdown (%)
 * @param {number} inflationRate         - Annual inflation rate (%)
 * @param {'monthly'|'half-yearly'|'yearly'|'lumpsum'} frequency - Contribution frequency
 */
export function calculatePensionFromInvestment(
    investmentAmount,
    accumulationYears,
    drawdownYears,
    annualReturnRate,
    drawdownReturnRate,
    inflationRate,
    frequency
) {
    const r  = annualReturnRate / 100;
    const rm = r / 12;
    const n  = accumulationYears;

    // 1. Corpus at retirement
    let corpus = 0;
    let totalInvested = 0;
    let periodsLabel = '';

    if (frequency === 'lumpsum') {
        corpus = investmentAmount * Math.pow(1 + r, n);
        totalInvested = investmentAmount;
        periodsLabel  = 'One-Time';
    } else if (frequency === 'monthly') {
        const nm = n * 12;
        corpus = investmentAmount * ((Math.pow(1 + rm, nm) - 1) / rm) * (1 + rm);
        totalInvested = investmentAmount * nm;
        periodsLabel  = '/month';
    } else if (frequency === 'half-yearly') {
        const r6 = Math.pow(1 + r, 0.5) - 1;
        const n6 = n * 2;
        corpus = investmentAmount * ((Math.pow(1 + r6, n6) - 1) / r6) * (1 + r6);
        totalInvested = investmentAmount * n6;
        periodsLabel  = '/half-year';
    } else {
        // yearly
        corpus = investmentAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
        totalInvested = investmentAmount * n;
        periodsLabel  = '/year';
    }

    // 2. Monthly pension from corpus (real-rate annuity to maintain purchasing power)
    const inf      = inflationRate / 100;
    const postR    = drawdownReturnRate / 100;
    const realRate = (1 + postR) / (1 + inf) - 1;

    let monthlyPension = 0;
    if (Math.abs(realRate) < 0.0001) {
        monthlyPension = (corpus / drawdownYears) / 12;
    } else {
        const annualPension = corpus * realRate / (1 - Math.pow(1 + realRate, -drawdownYears));
        monthlyPension = annualPension / 12;
    }

    // Inflation-eroded monthly pension (today's purchasing power equivalent)
    const todayEquivalentPension = monthlyPension / Math.pow(1 + inf, accumulationYears);

    const returnsEarned = corpus - totalInvested;

    // Year-wise corpus growth breakdown
    const yearlyBreakdown = [];
    for (let y = 1; y <= accumulationYears; y++) {
        let accum = 0;
        if (frequency === 'lumpsum') {
            accum = investmentAmount * Math.pow(1 + r, y);
        } else if (frequency === 'monthly') {
            const months = y * 12;
            accum = investmentAmount * ((Math.pow(1 + rm, months) - 1) / rm) * (1 + rm);
        } else if (frequency === 'half-yearly') {
            const r6 = Math.pow(1 + r, 0.5) - 1;
            const periods = y * 2;
            accum = investmentAmount * ((Math.pow(1 + r6, periods) - 1) / r6) * (1 + r6);
        } else {
            accum = investmentAmount * ((Math.pow(1 + r, y) - 1) / r) * (1 + r);
        }
        const invested = frequency === 'lumpsum' ? investmentAmount
            : frequency === 'monthly' ? investmentAmount * y * 12
            : frequency === 'half-yearly' ? investmentAmount * y * 2
            : investmentAmount * y;

        yearlyBreakdown.push({
            year: y,
            invested: Math.round(invested),
            corpusValue: Math.round(accum),
        });
    }

    return {
        corpus: Math.round(corpus),
        totalInvested: Math.round(totalInvested),
        returnsEarned: Math.round(returnsEarned),
        monthlyPension: Math.round(monthlyPension),
        todayEquivalentPension: Math.round(todayEquivalentPension),
        periodsLabel,
        yearlyBreakdown,
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
