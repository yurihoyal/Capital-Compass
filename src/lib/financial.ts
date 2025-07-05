export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
    return 0;
  }
  const monthlyRate = annualRate / 100 / 12;
  
  if (monthlyRate === 0) {
    return principal / termMonths;
  }
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  return payment;
}

export function calculateFutureValue(presentValue: number, annualRate: number, years: number): number {
    if (presentValue <= 0 || annualRate < 0 || years <= 0) {
        return presentValue;
    }
    return presentValue * Math.pow(1 + annualRate / 100, years);
}

export function generateCostProjection(
    years: number,
    currentMf: number,
    currentMfInflation: number,
    currentSpecialAssessment: number,
    currentMonthlyLoanPayment: number,
    currentLoanTermRemainingMonths: number,
    newMf: number,
    newMfInflation: number,
    newMonthlyLoanPayment: number,
    newLoanTermMonths: number,
    annualNewCostOffset: number = 0
) {
    const data = [];
    let cumulativeCurrentMf = 0;
    let cumulativeNewMf = 0;

    for (let i = 1; i <= years; i++) {
        const inflatedCurrentMf = currentMf * Math.pow(1 + currentMfInflation / 100, i - 1);
        const inflatedNewMf = newMf * Math.pow(1 + newMfInflation / 100, i - 1);
        
        cumulativeCurrentMf += inflatedCurrentMf;
        cumulativeNewMf += inflatedNewMf;

        const totalCurrentLoanPaid = currentMonthlyLoanPayment * Math.min(i * 12, currentLoanTermRemainingMonths);
        const totalNewLoanPaid = newMonthlyLoanPayment * Math.min(i * 12, newLoanTermMonths);
        
        const totalCurrentCost = cumulativeCurrentMf + totalCurrentLoanPaid + currentSpecialAssessment;
        const totalNewCost = (cumulativeNewMf + totalNewLoanPaid) - (annualNewCostOffset * i);
        
        data.push({
            year: i,
            currentCost: Math.round(totalCurrentCost),
            newCost: Math.round(Math.max(0, totalNewCost)),
        });
    }

    return data;
}

export function generateCurrentPathProjection(
    years: number,
    mf: number,
    mfInflation: number,
    specialAssessment: number,
    monthlyLoanPayment: number,
    loanTermRemainingMonths: number,
    annualOffset: number = 0
) {
    const projection = [];
    let cumulativeLoanPaid = 0;
    let cumulativeCostWithOffset = 0; // Start at 0, assessment will be added in year 1

    for (let i = 1; i <= years; i++) {
        let inflatedMfForYear = mf * Math.pow(1 + mfInflation / 100, i - 1);
        
        // Add special assessment to the first year's maintenance fees
        if (i === 1) {
            inflatedMfForYear += specialAssessment;
        }

        const paymentsInYear = Math.min(i * 12, loanTermRemainingMonths) - Math.min((i - 1) * 12, loanTermRemainingMonths);
        const loanPaidForYear = monthlyLoanPayment * paymentsInYear;
        
        const netMaintenanceFeesForYear = Math.max(0, inflatedMfForYear - annualOffset);
        
        cumulativeLoanPaid += loanPaidForYear;
        cumulativeCostWithOffset += netMaintenanceFeesForYear + loanPaidForYear;

        projection.push({
            year: i,
            maintenanceFees: Math.round(netMaintenanceFeesForYear),
            loanPayments: Math.round(loanPaidForYear),
            monthlyMf: netMaintenanceFeesForYear / 12,
            monthlyLoan: paymentsInYear > 0 ? monthlyLoanPayment : 0,
            cumulativeCost: Math.round(Math.max(0, cumulativeCostWithOffset))
        });
    }

    const totalNetMf = projection.reduce((sum, p) => sum + p.maintenanceFees, 0);

    const summary = {
        totalCost: projection.length > 0 ? projection[projection.length - 1].cumulativeCost : specialAssessment,
        totalMf: totalNetMf,
        totalLoanPaid: cumulativeLoanPaid,
    };

    return { projection, summary };
}
