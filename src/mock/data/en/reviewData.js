export const MOCK_REVIEW_TICKETS = [
  {
    id: 'REV-SPL-001',
    source: 'Split Household',
    categoryType: 'Single Person Household Split Manual Audit',
    appType: 'Ration Card Split (Single Person Path B)',
    cardNo: 'RC-10029381',
    applicantName: 'Omar Ahmed Hassan',
    targetMemberName: 'Omar Ahmed Hassan',
    province: 'Baghdad Province',
    center: 'Karkh 1st Food Supply Branch',
    reason: 'The proposed splitting applicant is a single individual and does not satisfy the automatic verification rule for married couples. Routed to branch staff for manual audit.',
    status: 'Pending Staff Review',
    submittedAt: '2026-10-10 10:15',
    staffOpinion: '',
    staffName: '',
    staffReviewedAt: '',
    managerDecision: 'Pending',
    managerNotes: '',
    attachments: [
      { name: 'Supreme_Judicial_Council_Civil_Marriage_Certificate_MC-2026-BAG-09921.pdf', type: 'required', verified: true },
      { name: 'Municipal_Planning_Commission_Residential_Property_Deed_ADD-2026-7810.pdf', type: 'optional', verified: true }
    ],
    payload: {
      splitMemberIds: ['M-003']
    }
  },
  {
    id: 'REV-UNF-002',
    source: 'Unfreeze Card',
    categoryType: 'Commercial Unfreeze Eligibility Verification',
    appType: 'Unfreeze Application (Commercial Grounds)',
    cardNo: 'RC-10029381',
    applicantName: 'Ahmed Hassan Saleh',
    targetMemberName: 'Zainab Ahmed Hassan',
    province: 'Baghdad Province',
    center: 'Rusafa 2nd Food Supply Branch',
    reason: 'Commercial quota deregistered. Applied for card unfreezing pursuant to Chamber of Commerce and Tax Bureau clearance deed COM-TAX-2026-9901.',
    status: 'Pending Staff Review',
    submittedAt: '2026-10-11 09:30',
    staffOpinion: '',
    staffName: '',
    staffReviewedAt: '',
    managerDecision: 'Pending',
    managerNotes: '',
    attachments: [
      { name: 'Chamber_of_Commerce_Tax_Clearance_Deed_COM-2026-0914.pdf', type: 'required', verified: true }
    ],
    payload: {
      unfreezeType: 'Commercial',
      targetMemberId: 'M-004',
      docName: 'Chamber_of_Commerce_Tax_Clearance_Deed_COM-2026-0914.pdf'
    }
  },
  {
    id: 'REV-DTH-003',
    source: 'Change Head',
    categoryType: 'Deceased Head Deregistration & Succession Appointment',
    appType: 'Change Head of Household (Forensic Medical Verification)',
    cardNo: 'RC-10029381',
    applicantName: 'Fatima Ali Mohammed',
    targetMemberName: 'Deceased Head -> Fatima Ali Mohammed',
    province: 'Basra Province',
    center: 'Basra Port Ration Support Station',
    reason: 'Applied to appoint spouse Fatima as legal replacement head pursuant to forensic medical death certificate DTH-BAG-2026-90182.',
    status: 'Pending Manager Review',
    submittedAt: '2026-10-09 16:40',
    staffOpinion: 'Forensic death certificate authenticated. Civil status deregistration verified. Recommended for approval.',
    staffName: 'Samira Qasim (Review Officer)',
    staffReviewedAt: '2026-10-10 11:30',
    managerDecision: 'Pending',
    managerNotes: '',
    attachments: [
      { name: 'Ministry_of_Health_Forensic_Death_Certificate_DTH-BAG-2026-90182.pdf', type: 'required', verified: true }
    ],
    payload: {
      newHeadId: 'M-002',
      newHeadName: 'Fatima Ali Mohammed'
    }
  },
  {
    id: 'REV-ENT-004',
    source: 'Member Entry',
    categoryType: 'Family ID Cross-Check & Re-verification',
    appType: 'Family Member Entry (Electronic Audit Flow)',
    cardNo: 'RC-10029381',
    applicantName: 'Ahmed Hassan Saleh',
    targetMemberName: 'Rashid Ahmed',
    province: 'Nineveh Province',
    center: 'Old Mosul Ration Management Center',
    reason: 'System cross-check detected historical cross-provincial record for this Family ID. Submitted for dual-operator manual audit.',
    status: 'Pending Staff Review',
    submittedAt: '2026-10-11 14:20',
    staffOpinion: '',
    staffName: '',
    staffReviewedAt: '',
    managerDecision: 'Pending',
    managerNotes: '',
    attachments: [
      { name: 'Ministry_of_Interior_Civil_Status_Approval_UPD-2026-6219.pdf', type: 'required', verified: true }
    ]
  },
  {
    id: 'REV-TRF-005',
    source: 'Transfer Member',
    categoryType: 'Marriage Relocation Cross-Card Move',
    appType: 'Member Transfer (Marriage Relocation)',
    cardNo: 'RC-10029381',
    applicantName: 'Haider Qasim Nasser',
    targetMemberName: 'Zainab Ahmed Hassan',
    province: 'Diyala Province',
    center: 'Khanaqin Forward Supply Warehouse Branch',
    reason: 'Relocating upon marriage to new card. Supreme Judicial Council civil registration verified. Routed to audit workbench.',
    status: 'Approved',
    submittedAt: '2026-10-08 09:10',
    staffOpinion: 'Civil marriage certificate authenticated. Agents for both cards agreed.',
    staffName: 'Samira Qasim (Review Officer)',
    staffReviewedAt: '2026-10-08 14:00',
    managerDecision: 'Approved',
    managerNotes: 'Approved for cross-card transfer with regional ration allocation adjusted.',
    managerDecidedAt: '2026-10-09 10:20',
    attachments: [
      { name: 'Supreme_Judicial_Council_Transfer_Deed_TRF-2026-1182.pdf', type: 'required', verified: true }
    ]
  },
  {
    id: 'REV-AGT-006',
    source: 'Split Household',
    categoryType: 'Direct Lineage Split & Multi-Card Establishment',
    appType: 'Independent Household for Married Descendant',
    cardNo: 'RC-10034820',
    applicantName: 'Ali Karim',
    targetMemberName: 'Khalid Ali Karim',
    province: 'Erbil Province',
    center: 'Erbil Central Grain Transfer Hub',
    reason: 'Eldest son married and acquired independent residential property. Applied for split into new digital ration card family.',
    status: 'Pending Manager Review',
    submittedAt: '2026-10-12 11:00',
    staffOpinion: 'Property ownership and marriage certificates confirmed. Recommended for final approval.',
    staffName: 'Rashid Nabil',
    staffReviewedAt: '2026-10-12 13:20',
    managerDecision: 'Pending',
    managerNotes: '',
    attachments: [
      { name: 'Erbil_Judicial_Dept_Property_Registration_Deed_EBL-2026-5510.pdf', type: 'required', verified: true }
    ]
  }
];
