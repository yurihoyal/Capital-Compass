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
    let cumulativeMf = 0;
    let cumulativeLoanPaid = 0;

    for (let i = 1; i <= years; i++) {
        const inflatedMfForYear = mf * Math.pow(1 + mfInflation / 100, i - 1);
        const paymentsInYear = Math.min(i * 12, loanTermRemainingMonths) - Math.min((i - 1) * 12, loanTermRemainingMonths);
        const loanPaidForYear = monthlyLoanPayment * paymentsInYear;
        
        cumulativeMf += inflatedMfForYear;
        cumulativeLoanPaid += loanPaidForYear;

        const cumulativeCost = cumulativeMf + cumulativeLoanPaid + specialAssessment - (annualOffset * i);

        projection.push({
            year: i,
            maintenanceFees: Math.round(inflatedMfForYear),
            loanPayments: Math.round(loanPaidForYear),
            monthlyMf: inflatedMfForYear / 12,
            monthlyLoan: paymentsInYear > 0 ? monthlyLoanPayment : 0,
            cumulativeCost: Math.round(Math.max(0, cumulativeCost))
        });
    }

    const summary = {
        totalCost: projection.length > 0 ? projection[projection.length - 1].cumulativeCost : specialAssessment,
        totalMf: cumulativeMf,
        totalLoanPaid: cumulativeLoanPaid,
    };

    return { projection, summary };
}
