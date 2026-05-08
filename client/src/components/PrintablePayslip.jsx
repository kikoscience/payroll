import React from 'react';

const PrintablePayslip = ({ record, employeeName }) => {
  if (!record) return null;

  const isPayroll = record.batchType === 'Payroll';
  
  // Helper to check if a value exists and is not zero
  const hasValue = (val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num !== 0;
  };

  const format = (val) => `₱${(parseFloat(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  // SIMPLE LAYOUT FOR OTHER RECEIVABLES
  if (!isPayroll) {
    return (
      <div className="p-12 bg-white text-slate-900 font-sans max-w-4xl mx-auto border shadow-sm print:shadow-none print:border-none print:m-0" id="printable-payslip">
        <div className="flex justify-between items-start border-b-4 border-indigo-600 pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-indigo-600">Disbursement Advice</h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{record.subType || 'Other Receivable'}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-black">{employeeName}</p>
            <p className="text-sm font-bold text-slate-400 tracking-widest">ID: {record.IdNumber}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-[32px] p-10 mb-10 border border-slate-100">
           <div className="grid grid-cols-2 gap-8">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description / Purpose</p>
                 <p className="text-xl font-bold text-slate-800">{record.batchName || record.description}</p>
                 {record.description && <p className="text-sm text-slate-500 mt-2">{record.description}</p>}
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Release Date</p>
                 <p className="text-xl font-bold text-slate-800">{new Date(record.postedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
           </div>
        </div>

        <div className="bg-indigo-600 rounded-[40px] p-10 text-white flex justify-between items-center shadow-2xl shadow-indigo-200">
           <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-200 mb-1">Total Amount Received</p>
              <p className="text-sm font-medium text-indigo-100">Net Disbursement</p>
           </div>
           <div className="text-right">
              <p className="text-5xl font-black tracking-tighter">{format(record.netAmountDue)}</p>
           </div>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-100 flex justify-between items-end text-[10px] font-bold text-slate-400 uppercase tracking-widest">
           <div>
              <p>Generated via Antigravity Payroll System</p>
              <p>Ref: REC-{record.id}-{record.batchId}</p>
           </div>
           <div className="text-right italic">
              <p>This is a computer-generated disbursement advice.</p>
           </div>
        </div>
      </div>
    );
  }

  // DETAILED LAYOUT FOR MONTHLY SALARY (WITH ZERO-HIDING)
  return (
    <div className="p-8 bg-white text-slate-900 font-sans max-w-4xl mx-auto border shadow-sm print:shadow-none print:border-none print:m-0" id="printable-payslip">
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Official Payslip</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Monthly Salary • {record.period}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black">{employeeName}</p>
          <p className="text-sm font-bold text-slate-400">ID: {record.IdNumber}</p>
          <p className="text-sm font-bold text-slate-400">Batch: {record.batchName}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        {/* Earnings Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest bg-slate-100 p-2 text-slate-600">Earnings & Allowances</h2>
          <div className="space-y-2 text-sm font-medium">
            {hasValue(record.salaries_si) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Basic Salary / SI</span>
                <span className="font-bold">{format(record.salaries_si)}</span>
              </div>
            )}
            {hasValue(record.pera) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>PERA</span>
                <span className="font-bold">{format(record.pera)}</span>
              </div>
            )}
            {hasValue(record.hazard_pay) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Hazard Pay</span>
                <span className="font-bold">{format(record.hazard_pay)}</span>
              </div>
            )}
            {hasValue(record.night_shift_differential) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Night Shift Diff.</span>
                <span className="font-bold">{format(record.night_shift_differential)}</span>
              </div>
            )}
            {(hasValue(record.sa) || hasValue(record.la)) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Subsistence / Laundry</span>
                <span className="font-bold">{format(parseFloat(record.sa || 0) + parseFloat(record.la || 0))}</span>
              </div>
            )}
            {hasValue(record.due_to_others_earnings) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Other Earnings</span>
                <span className="font-bold">{format(record.due_to_others_earnings)}</span>
              </div>
            )}
            
            <div className="flex justify-between pt-4 text-slate-900 border-t-2 border-slate-100">
              <span className="font-black uppercase text-xs">Gross Amount</span>
              <span className="font-black text-lg">{format(record.amount)}</span>
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest bg-red-50 p-2 text-red-600">Deductions & Loans</h2>
          <div className="space-y-2 text-sm font-medium">
            {hasValue(record.tax) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Withholding Tax</span>
                <span className="font-bold text-red-600">{format(record.tax)}</span>
              </div>
            )}
            {(hasValue(record.gsis_ps) || hasValue(record.gsis_conso_loan) || hasValue(record.gsis_eml) || hasValue(record.gsis_policy_loan) || hasValue(record.gfal) || hasValue(record.gsis_mpl) || hasValue(record.gsis_mpl_lite) || hasValue(record.gsis_cpl)) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>GSIS (Total Combined)</span>
                <span className="font-bold text-red-600">{format(
                  (parseFloat(record.gsis_ps) || 0) + 
                  (parseFloat(record.gsis_conso_loan) || 0) + 
                  (parseFloat(record.gsis_eml) || 0) + 
                  (parseFloat(record.gsis_policy_loan) || 0) +
                  (parseFloat(record.gfal) || 0) +
                  (parseFloat(record.gsis_mpl) || 0) +
                  (parseFloat(record.gsis_mpl_lite) || 0) +
                  (parseFloat(record.gsis_cpl) || 0)
                )}</span>
              </div>
            )}
            {(hasValue(record.pagibig_ps) || hasValue(record.pagibig_mp2) || hasValue(record.pagibig_mpl) || hasValue(record.pagibig_cal)) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Pag-Ibig (Total Combined)</span>
                <span className="font-bold text-red-600">{format(
                  (parseFloat(record.pagibig_ps) || 0) + 
                  (parseFloat(record.pagibig_mp2) || 0) + 
                  (parseFloat(record.pagibig_mpl) || 0) + 
                  (parseFloat(record.pagibig_cal) || 0)
                )}</span>
              </div>
            )}
            {hasValue(record.phic_ps) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>PhilHealth (PHIC)</span>
                <span className="font-bold text-red-600">{format(record.phic_ps)}</span>
              </div>
            )}
            {hasValue(record.lbp) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>LBP Loan</span>
                <span className="font-bold text-red-600">{format(record.lbp)}</span>
              </div>
            )}
            {hasValue(record.due_from_others) && (
              <div className="flex justify-between border-b border-slate-50 pb-1">
                <span>Other Deductions</span>
                <span className="font-bold text-red-600">{format(record.due_from_others)}</span>
              </div>
            )}
            
            <div className="flex justify-between pt-4 text-slate-900 border-t-2 border-slate-100">
              <span className="font-black uppercase text-xs">Total Deductions</span>
              <span className="font-black text-lg">{format(record.voluntaryDeductions)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Net Amount */}
      <div className="mt-12 bg-slate-900 p-8 rounded-3xl text-white flex justify-between items-center">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Take Home Pay</p>
          <p className="text-sm font-medium text-slate-300">Net Amount Disbursed</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-black tracking-tighter">{format(record.netAmountDue)}</p>
        </div>
      </div>

      <div className="mt-12 pt-12 border-t border-slate-100 flex justify-between items-end text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         <div>
            <p>Generated via Antigravity Payroll System</p>
            <p>Date: {new Date().toLocaleDateString()}</p>
         </div>
         <div className="text-right italic">
            <p>This is a computer-generated document.</p>
            <p>No signature required.</p>
         </div>
      </div>
    </div>
  );
};

export default PrintablePayslip;
