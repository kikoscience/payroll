import React from 'react';

const PrintablePayslip = ({ record, employeeName }) => {
  if (!record) return null;

  const isPayroll = record.batchType === 'Payroll';
  
  const hasValue = (val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num !== 0;
  };

  const format = (val) => (parseFloat(val) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

  const formatPeriod = (period) => {
    if (!period) return 'N/A';
    if (period.length === 20 && period.includes('-')) {
       const start = period.slice(0, 10);
       const end = period.slice(10);
       if (start === end) return start;
       return `${start} to ${end}`;
    }
    return period;
  };

  // 100% TRANSPARENT ACCOUNTING LIST
  const AccountingList = () => {
    const earnings = [
      { label: 'BASIC SALARY / STEP INCREMENT', val: record.salaries_si },
      { label: 'P.E.R.A.', val: record.pera },
      { label: 'HAZARD PAY', val: record.hazard_pay },
      { label: 'NIGHT SHIFT DIFFERENTIAL', val: record.night_shift_differential },
      { label: 'SUBSISTENCE ALLOWANCE', val: record.sa },
      { label: 'LAUNDRY ALLOWANCE', val: record.la },
      { label: 'OTHER EARNINGS / ADJUSTMENTS', val: record.due_to_others_earnings },
    ].filter(item => hasValue(item.val));

    const deductions = [
      { label: 'WITHHOLDING TAX (BIR)', val: record.tax },
      { label: 'GSIS PERSONAL SHARE', val: record.gsis_ps },
      { label: 'GSIS CONSO LOAN', val: record.gsis_conso_loan },
      { label: 'GSIS EML LOAN', val: record.gsis_eml },
      { label: 'GSIS POLICY LOAN', val: record.gsis_policy_loan },
      { label: 'GSIS GFAL', val: record.gfal },
      { label: 'GSIS MPL', val: record.gsis_mpl },
      { label: 'GSIS MPL LITE', val: record.gsis_mpl_lite },
      { label: 'GSIS CPL', val: record.gsis_cpl },
      { label: 'PAG-IBIG PERSONAL SHARE', val: record.pagibig_ps },
      { label: 'PAG-IBIG MP2', val: record.pagibig_mp2 },
      { label: 'PAG-IBIG MPL', val: record.pagibig_mpl },
      { label: 'PAG-IBIG CAL', val: record.pagibig_cal },
      { label: 'PHILHEALTH (PHIC)', val: record.phic_ps },
      { label: 'LBP LOAN', val: record.lbp },
      { label: 'OTHER DEDUCTIONS / DUE FROM OTHERS', val: record.due_from_others },
    ].filter(item => hasValue(item.val));

    if (!isPayroll && hasValue(record.voluntaryDeductions) && !deductions.find(d => d.label === 'VOLUNTARY DEDUCTION')) {
       deductions.push({ label: 'VOLUNTARY DEDUCTION', val: record.voluntaryDeductions });
    }

    const totalDeductions = isPayroll 
      ? (parseFloat(record.voluntaryDeductions) || 0)
      : (parseFloat(record.tax) || 0) + (parseFloat(record.voluntaryDeductions) || 0);

    return (
      <div className="grid grid-cols-2 gap-0 border-x border-black">
        {/* Earnings Column */}
        <div className="border-r border-black flex flex-col">
          <div className="bg-gray-100 border-b border-black py-1 px-4 text-[10px] font-black uppercase tracking-widest text-center">EARNINGS AND ALLOWANCES</div>
          <div className="flex-1 p-4 space-y-1">
             {earnings.map(e => (
               <div key={e.label} className="flex justify-between text-[11px] font-mono">
                 <span>{e.label}</span>
                 <span className="font-bold">{format(e.val)}</span>
               </div>
             ))}
          </div>
          <div className="border-t border-black p-4 bg-gray-50 flex justify-between text-xs font-black">
             <span>GROSS AMOUNT</span>
             <span className="border-b-2 border-black">₱ {format(record.amount)}</span>
          </div>
        </div>

        {/* Deductions Column */}
        <div className="flex flex-col">
          <div className="bg-gray-100 border-b border-black py-1 px-4 text-[10px] font-black uppercase tracking-widest text-center">DEDUCTIONS AND LOANS</div>
          <div className="flex-1 p-4 space-y-1">
             {deductions.map(d => (
               <div key={d.label} className="flex justify-between text-[11px] font-mono">
                 <span>{d.label}</span>
                 <span className="font-bold text-red-700">{format(d.val)}</span>
               </div>
             ))}
          </div>
          <div className="border-t border-black p-4 bg-gray-50 flex justify-between text-xs font-black">
             <span>TOTAL DEDUCTIONS</span>
             <span className="border-b-2 border-black">₱ {format(totalDeductions)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white text-black font-serif max-w-4xl mx-auto border-2 border-black print:m-0 print:border-black" id="printable-payslip">
      {/* Official Header */}
      <div className="p-8 border-b border-black text-center space-y-1">
         <p className="text-xs font-bold uppercase tracking-widest">Republic of the Philippines</p>
         <p className="text-xs font-bold uppercase tracking-widest">Department of Health</p>
         <p className="text-lg font-black uppercase tracking-tighter">Conner District Hospital</p>
         <p className="text-[10px] font-medium italic">Payroll & Disbursement System</p>
         <div className="pt-4 flex justify-between items-end border-t border-dotted border-gray-300 mt-4">
            <div className="text-left">
               <p className="text-[10px] font-black uppercase">Official Disbursement Record</p>
               <h2 className="text-xl font-black">{isPayroll ? 'PAYSLIP' : 'DISBURSEMENT ADVICE'}</h2>
            </div>
            <div className="text-right text-[10px] font-bold">
               <p>DATE: {new Date().toLocaleDateString('en-PH', { dateStyle: 'long' })}</p>
               <p>BATCH: {record.batchName}</p>
            </div>
         </div>
      </div>

      {/* Employee Info */}
      <div className="grid grid-cols-2 p-6 border-b border-black bg-gray-50/50">
         <div className="space-y-1">
            <p className="text-[10px] font-black text-gray-500 uppercase">Employee Name</p>
            <p className="text-lg font-black uppercase font-mono tracking-tight">{employeeName}</p>
         </div>
         <div className="text-right space-y-1">
            <div className="flex justify-end gap-8">
               <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase text-right">ID Number</p>
                  <p className="font-mono font-bold text-lg">{record.IdNumber}</p>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase text-right">Period</p>
                  <p className="font-mono font-bold text-lg">{formatPeriod(record.period)}</p>
               </div>
            </div>
         </div>
      </div>

      {!isPayroll && (
         <div className="px-8 py-4 border-b border-black bg-white italic text-xs">
            <span className="font-black uppercase not-italic mr-2">REMARKS:</span>
            {record.description || 'Verified ad-hoc disbursement for the current cycle.'}
         </div>
      )}

      {/* The Grid */}
      <AccountingList />

      {/* Net Amount - THE TOTAL */}
      <div className="p-8 border-t border-black bg-white flex justify-between items-center relative overflow-hidden">
         {/* Subtle Watermark */}
         <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none -rotate-12">
            <span className="text-8xl font-black uppercase italic">Official Copy</span>
         </div>

         <div className="z-10">
            <p className="text-xs font-black uppercase tracking-widest border-b border-black pb-1 mb-2">Net Amount Due</p>
            <p className="text-[10px] italic font-medium">Final total amount credited to employee's registered account.</p>
         </div>
         <div className="text-right z-10">
            <div className="border-4 border-black p-4 inline-block bg-white">
               <p className="text-4xl font-mono font-black tracking-tighter">₱ {format(record.netAmountDue)}</p>
            </div>
         </div>
      </div>

      {/* Footer / Certification */}
      <div className="p-6 border-t border-black bg-gray-100 flex justify-between items-start text-[9px] font-bold uppercase tracking-widest">
         <div className="space-y-1">
            <p>Certified Correct by: System Automated Auditor</p>
            <p>Verification Ref: {record.batchId}-{record.id}</p>
         </div>
         <div className="text-right">
            <p>This is a computer-generated document.</p>
            <p>No Signature Required for Internal Verification.</p>
         </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          #printable-payslip {
            border: 2px solid black !important;
            box-shadow: none !important;
            margin: 0 !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact;
          }
          .bg-gray-100 { background-color: #f3f4f6 !important; }
          .bg-gray-50 { background-color: #f9fafb !important; }
        }
      `}} />
    </div>
  );
};

export default PrintablePayslip;
