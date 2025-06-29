export function calculateMonthlyPayment(principal: number, annualRate: number, termYears: number): number {
  if (principal <= 0 || annualRate < 0 || termYears <= 0) {
    return 0;
  }
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = termYears * 12;

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
    currentLoanTermRemaining: number,
    newMf: number,
    newMfInflation: number,
    newLoanAmount: number,
    newLoanRate: number,
    newLoanTerm: number
) {
    const data = [];
    let cumulativeCurrentMf = 0;
    let cumulativeNewMf = 0;
    
    const currentMonthlyLoanPayment = calculateMonthlyPayment(currentLoanBalance, currentLoanRate, currentLoanTermRemaining);
    const newMonthlyLoanPayment = calculateMonthlyPayment(newLoanAmount, newLoanRate, newLoanTerm);

    for (let i = 1; i <= years; i++) {
        const inflatedCurrentMf = calculateFutureValue(currentMf, currentMfInflation, i);
        const inflatedNewMf = calculateFutureValue(newMf, newMfInflation, i);
        
        cumulativeCurrentMf += inflatedCurrentMf;
        cumulativeNewMf += inflatedNewMf;

        const currentLoanPaymentsYear = i <= currentLoanTermRemaining ? currentMonthlyLoanPayment * 12 : 0;
        const newLoanPaymentsYear = i <= newLoanTerm ? newMonthlyLoanPayment * 12 : 0;
        
        const totalCurrentCost = cumulativeCurrentMf + (currentMonthlyLoanPayment * 12 * Math.min(i, currentLoanTermRemaining));
        const totalNewCost = cumulativeNewMf + (newMonthlyLoanPayment * 12 * Math.min(i, newLoanTerm));
        
        data.push({
            year: i,
            currentCost: totalCurrentCost,
            newCost: totalNewCost,
        });
    }

    return data;
}
