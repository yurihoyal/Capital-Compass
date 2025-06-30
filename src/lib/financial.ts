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
    currentLoanBalance: number,
    currentLoanRate: number,
    currentLoanTermRemainingMonths: number,
    newMf: number,
    newMfInflation: number,
    newLoanAmount: number,
    newLoanRate: number,
    newLoanTermMonths: number,
    annualNewCostOffset: number = 0
) {
    const data = [];
    let cumulativeCurrentMf = 0;
    let cumulativeNewMf = 0;
    
    const currentMonthlyLoanPayment = calculateMonthlyPayment(currentLoanBalance, currentLoanRate, currentLoanTermRemainingMonths);
    const newMonthlyLoanPayment = calculateMonthlyPayment(newLoanAmount, newLoanRate, newLoanTermMonths);

    for (let i = 1; i <= years; i++) {
        const inflatedCurrentMf = currentMf * Math.pow(1 + currentMfInflation / 100, i - 1);
        const inflatedNewMf = newMf * Math.pow(1 + newMfInflation / 100, i - 1);
        
        cumulativeCurrentMf += inflatedCurrentMf;
        cumulativeNewMf += Math.max(0, inflatedNewMf - annualNewCostOffset); 

        const totalCurrentLoanPaid = currentMonthlyLoanPayment * Math.min(i * 12, currentLoanTermRemainingMonths);
        const totalNewLoanPaid = newMonthlyLoanPayment * Math.min(i * 12, newLoanTermMonths);
        
        const totalCurrentCost = cumulativeCurrentMf + totalCurrentLoanPaid + currentSpecialAssessment;
        const totalNewCost = cumulativeNewMf + totalNewLoanPaid;
        
        data.push({
            year: i,
            currentCost: Math.round(totalCurrentCost),
            newCost: Math.round(totalNewCost),
        });
    }

    return data;
}

export function generateCurrentPathProjection(
    years: number,
    mf: number,
    mfInflation: number,
    specialAssessment: number,
    loanBalance: number,
    loanRate: number,
    loanTermRemainingMonths: number
) {
    const projection = [];
    let cumulativeMf = 0;
    
    const monthlyLoanPayment = calculateMonthlyPayment(loanBalance, loanRate, loanTermRemainingMonths);
    
    for (let i = 1; i <= years; i++) {
        const inflatedMfForYear = mf * Math.pow(1 + mfInflation / 100, i - 1);
        cumulativeMf += inflatedMfForYear;
        
        const totalLoanPaid = monthlyLoanPayment * Math.min(i * 12, loanTermRemainingMonths);
        
        projection.push({
            year: i,
            cumulativeCost: Math.round(cumulativeMf + totalLoanPaid + specialAssessment),
        });
    }

    const totalLoanPaid = monthlyLoanPayment * loanTermRemainingMonths;
    const totalInterest = Math.max(0, totalLoanPaid - loanBalance);

    const summary = {
        totalCost: (projection.find(p => p.year === years)?.cumulativeCost || 0),
        totalInterest: totalInterest,
        totalMf: cumulativeMf
    }

    return { projection, summary };
}
