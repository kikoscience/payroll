import React from 'react';

const PrintablePayslip = ({ record, employeeName }) => {
  if (!record) return null;

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-8 bg-white text-slate-900 font-sans max-w-4xl mx-auto border shadow-sm print:shadow-none print:border-none print:m-0" id="printable-payslip">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Official Payslip</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{record.batchName}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black">{employeeName}</p>
          <p className="text-sm font-bold text-slate-400">ID: {record.IdNumber}</p>
          <p className="text-sm font-bold text-slate-400">Period: {record.period}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12">
        {/* Earnings Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest bg-slate-100 p-2 text-slate-600">Earnings & Allowances</h2>
          <div className="space-y-2 text-sm font-medium">
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>Basic Salary / SI</span>
              <span className="font-bold">₱{(parseFloat(record.salaries_si) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>PERA</span>
              <span className="font-bold">₱{(parseFloat(record.pera) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>Hazard Pay</span>
              <span className="font-bold">₱{(parseFloat(record.hazard_pay) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>Night Shift Diff.</span>
              <span className="font-bold">₱{(parseFloat(record.night_shift_differential) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>Subsistence/Laundry (SA/LA)</span>
              <span className="font-bold">₱{( (parseFloat(record.sa) || 0) + (parseFloat(record.la) || 0) ).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>Other Earnings</span>
              <span className="font-bold">₱{(parseFloat(record.due_to_others_earnings) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-4 text-slate-900 border-t-2 border-slate-100">
              <span className="font-black uppercase text-xs">Gross Amount</span>
              <span className="font-black text-lg">₱{(parseFloat(record.amount) || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest bg-red-50 p-2 text-red-600">Deductions & Loans</h2>
          <div className="space-y-2 text-sm font-medium">
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>Withholding Tax</span>
              <span className="font-bold text-red-600">₱{(parseFloat(record.tax) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>GSIS (PS/Conso/Loan)</span>
              <span className="font-bold text-red-600">₱{( (parseFloat(record.gsis_ps) || 0) + (parseFloat(record.gsis_conso_loan) || 0) + (parseFloat(record.gsis_eml) || 0) + (parseFloat(record.gsis_policy_loan) || 0) ).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>Pag-Ibig (PS/MPL/CAL)</span>
              <span className="font-bold text-red-600">₱{( (parseFloat(record.pagibig_ps) || 0) + (parseFloat(record.pagibig_mpl) || 0) + (parseFloat(record.pagibig_cal) || 0) ).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>PhilHealth (PHIC)</span>
              <span className="font-bold text-red-600">₱{(parseFloat(record.phic_ps) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>LBP Loan</span>
              <span className="font-bold text-red-600">₱{(parseFloat(record.lbp) || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-1">
              <span>Other Deductions</span>
              <span className="font-bold text-red-600">₱{( (parseFloat(record.voluntaryDeductions) || 0) - ( (parseFloat(record.tax) || 0) + (parseFloat(record.gsis_ps) || 0) + (parseFloat(record.pagibig_ps) || 0) ) ).toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-4 text-slate-900 border-t-2 border-slate-100">
              <span className="font-black uppercase text-xs">Total Deductions</span>
              <span className="font-black text-lg">₱{(parseFloat(record.voluntaryDeductions) || 0).toLocaleString()}</span>
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
          <p className="text-4xl font-black tracking-tighter">₱{(parseFloat(record.netAmountDue) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      <div className="mt-12 pt-12 border-t border-slate-100 flex justify-between items-end text-[10px] font-bold text-slate-400 uppercase tracking-widest">
         <div>
            <p>Generated via Antigravity Payroll System</p>
            <p>Timestamp: {new Date().toLocaleString()}</p>
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
