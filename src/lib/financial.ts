export function calculateMonthlyPayment(principal: number, annualRate: number, termMonths: number): number {
  if (principal <= 0 || annualRate < 0 || termMonths <= 0) {
    return 0;
  }
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termMonths;

  if (monthlyRate === 0) {
    return principal / numberOfPayments;
  }
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
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
        const inflatedCurrentMf = calculateFutureValue(currentMf, currentMfInflation, i);
        const inflatedNewMfWithOffset = calculateFutureValue(newMf, newMfInflation, i) - annualNewCostOffset;
        
        cumulativeCurrentMf += inflatedCurrentMf;
        cumulativeNewMf += Math.max(0, inflatedNewMfWithOffset); // Ensure cost doesn't go negative

        const totalCurrentLoanPaid = currentMonthlyLoanPayment * Math.min(i * 12, currentLoanTermRemainingMonths);
        const totalNewLoanPaid = newMonthlyLoanPayment * Math.min(i * 12, newLoanTermMonths);
        
        const totalCurrentCost = cumulativeCurrentMf + totalCurrentLoanPaid;
        const totalNewCost = cumulativeNewMf + totalNewLoanPaid;
        
        data.push({
            year: i,
            currentCost: totalCurrentCost,
            newCost: totalNewCost,
        });
    }

    return data;
}
