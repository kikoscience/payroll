import React from 'react';

const PrintablePayslip = ({ record, employeeName }) => {
  if (!record) return null;

  const isPayroll = record.batchType === 'Payroll';
  
  const hasValue = (val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num !== 0;
  };

  const format = (val) => `₱${(parseFloat(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  const formatPeriod = (period) => {
    if (!period) return 'N/A';
    
    // Check for squashed date range: 2026-05-082026-05-08
    if (period.length === 20 && period.includes('-')) {
       const start = period.slice(0, 10);
       const end = period.slice(10);
       
       // If start and end are identical, only show one to avoid "2026-05-08 - 2026-05-08"
       if (start === end) return start;
       return `${start} — ${end}`;
    }
    return period;
  };

  // FULLY TRANSPARENT INDIVIDUAL BREAKDOWN
  const DetailedBreakdown = () => {
    const earnings = [
      { label: 'Basic Salary / SI', val: record.salaries_si },
      { label: 'PERA', val: record.pera },
      { label: 'Hazard Pay', val: record.hazard_pay },
      { label: 'Night Shift Diff.', val: record.night_shift_differential },
      { label: 'Subsistence Allowance', val: record.sa },
      { label: 'Laundry Allowance', val: record.la },
      { label: 'Due to Others (Earnings)', val: record.due_to_others_earnings },
    ].filter(item => hasValue(item.val));

    const deductionsList = [
      { label: 'Withholding Tax', val: record.tax },
      { label: 'GSIS PS', val: record.gsis_ps },
      { label: 'GSIS Conso Loan', val: record.gsis_conso_loan },
      { label: 'GSIS EML', val: record.gsis_eml },
      { label: 'GSIS Policy Loan', val: record.gsis_policy_loan },
      { label: 'GSIS GFAL', val: record.gfal },
      { label: 'GSIS MPL', val: record.gsis_mpl },
      { label: 'GSIS MPL Lite', val: record.gsis_mpl_lite },
      { label: 'GSIS CPL', val: record.gsis_cpl },
      { label: 'Pag-Ibig PS', val: record.pagibig_ps },
      { label: 'Pag-Ibig MP2', val: record.pagibig_mp2 },
      { label: 'Pag-Ibig MPL', val: record.pagibig_mpl },
      { label: 'Pag-Ibig CAL', val: record.pagibig_cal },
      { label: 'PhilHealth PS', val: record.phic_ps },
      { label: 'LBP Loan', val: record.lbp },
      { label: 'Other Deductions', val: record.due_from_others },
    ].filter(item => hasValue(item.val));

    if (!isPayroll && hasValue(record.voluntaryDeductions) && !deductionsList.find(d => d.label === 'Voluntary Deduction')) {
       deductionsList.push({ label: 'Voluntary Deduction', val: record.voluntaryDeductions });
    }

    const totalDeductions = isPayroll 
      ? (parseFloat(record.voluntaryDeductions) || 0)
      : (parseFloat(record.tax) || 0) + (parseFloat(record.voluntaryDeductions) || 0);

    if (earnings.length === 0 && deductionsList.length === 0) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-8 border-y border-slate-100 py-8">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Itemized Earnings</p>
          {earnings.map(e => (
            <div key={e.label} className="flex justify-between text-sm">
              <span className="text-slate-600 font-bold">{e.label}</span>
              <span className="font-black text-slate-900">{format(e.val)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 border-t-2 border-slate-100 mt-4">
             <span className="text-xs font-black uppercase text-slate-900">Gross Amount</span>
             <span className="font-black text-lg text-slate-900">{format(record.amount)}</span>
          </div>
        </div>
        <div className="space-y-4 border-l border-slate-100 pl-12">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-50 pb-2">Itemized Deductions</p>
          {deductionsList.map(d => (
            <div key={d.label} className="flex justify-between text-sm">
              <span className="text-slate-600 font-bold">{d.label}</span>
              <span className="font-black text-red-600">{format(d.val)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-4 border-t-2 border-slate-100 mt-4">
             <span className="text-xs font-black uppercase text-slate-900">Total Deductions</span>
             <span className="font-black text-lg text-red-600">{format(totalDeductions)}</span>
          </div>
        </div>
      </div>
    );
  };

  // LAYOUT
  return (
    <div className="p-12 bg-white text-slate-900 font-sans max-w-5xl mx-auto border shadow-sm print:shadow-none print:border-none print:m-0" id="printable-payslip">
      {/* Header */}
      <div className={`flex justify-between items-start border-b-4 ${isPayroll ? 'border-slate-900' : 'border-indigo-600'} pb-8 mb-10`}>
        <div>
          <h1 className={`text-3xl font-black uppercase tracking-tight ${!isPayroll && 'text-indigo-600'}`}>
            {isPayroll ? 'Official Payslip' : 'Disbursement Advice'}
          </h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
            {isPayroll ? `Monthly Salary • ${formatPeriod(record.period)}` : `Other Receivable • ${record.subType || 'Verified'}`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black">{employeeName}</p>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Employee ID: {record.IdNumber}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Batch: {record.batchName}</p>
        </div>
      </div>

      {!isPayroll && (
        <div className="bg-slate-50 p-8 rounded-3xl mb-8 space-y-6">
           <div className="grid grid-cols-3 gap-8">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cycle Period</p>
                 <p className="text-lg font-black text-slate-900">{formatPeriod(record.period)}</p>
              </div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credited At</p>
                 <p className="text-lg font-black text-slate-900">{new Date(record.postedDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reference ID</p>
                 <p className="text-lg font-black text-slate-400">REC-{record.id}</p>
              </div>
           </div>
           <div className="pt-6 border-t border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Remarks / Deduction Breakdown</p>
              <p className="text-slate-700 font-bold italic">"{record.description || 'No additional audit remarks for this disbursement.'}"</p>
           </div>
        </div>
      )}

      <DetailedBreakdown />

      <div className={`mt-12 ${isPayroll ? 'bg-slate-900' : 'bg-indigo-600'} p-10 rounded-[40px] text-white flex justify-between items-center shadow-2xl ${!isPayroll && 'shadow-indigo-200'}`}>
        <div>
          <p className={`text-xs font-black uppercase tracking-[0.2em] ${isPayroll ? 'text-slate-400' : 'text-indigo-200'} mb-1`}>Take Home Pay</p>
          <p className={`text-sm font-medium ${isPayroll ? 'text-slate-300' : 'text-indigo-100'}`}>Final Net Amount Disbursed</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black tracking-tighter">{format(record.netAmountDue)}</p>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-end text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         <div>
            <p>Antigravity Payroll System Audit Trail</p>
            <p>ID: {record.IdNumber} | Ref: {record.id}</p>
         </div>
         <div className="text-right italic">
            <p>This is a computer-generated document.</p>
         </div>
      </div>
    </div>
  );
};

export default PrintablePayslip;
