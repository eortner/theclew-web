export const mergeAgreement = {
  title: 'Merger Agreement',
  subtitle: 'Platform Merger — Emoclew',
  version: '1.0-beta',
  lastUpdated: 'April 2026',
  notice: 'This is a prototype legal document for review purposes only. It has not been reviewed by legal counsel. Before any merger with real legal or financial consequence occurs, this agreement must be reviewed and approved by a qualified attorney. No legal obligations are created during the Emoclew beta period.',
  sections: [
    {
      title: 'Parties',
      content: `This Merger Agreement (the "Agreement") is entered into on [DATE] by and between:

**Initiating Company:** [INITIATING COMPANY NAME], a [STATE] [ENTITY TYPE] ("Initiating Company"), represented by [FOUNDER NAME] ("Initiating Founder").

**Recipient Company:** [RECIPIENT COMPANY NAME], a [STATE] [ENTITY TYPE] ("Recipient Company"), represented by [FOUNDER NAME] ("Recipient Founder").

Both parties are registered on the Emoclew platform and have completed the mandatory two-factor authentication signing process described herein.`
    },
    {
      title: 'Merger Structure',
      content: `**Surviving Entity:** The Recipient Company shall be the surviving entity following the merger. The Initiating Company shall be archived with status MERGED on the Emoclew platform.

**Inherited Level:** The merged entity shall inherit the higher of the two companies' levels at the time of merger finalisation. Current levels at signing: Initiating Company Level [X], Recipient Company Level [Y]. Surviving entity level: [HIGHER LEVEL].

**Effective Date:** This merger becomes effective upon:
(i) Both founding parties completing digital signature via TOTP verification;
(ii) Community ratification vote passing (or automatic ratification where quorum is not met);
(iii) Platform recording the FINALISED status on the merge thread.`
    },
    {
      title: 'Equity Structure',
      content: `The equity of the merged entity shall be distributed as follows:

**Emoclew Platform Equity:** [PLATFORM EQUITY PERCENT]% — determined by the level of the higher-level project at the time of merger, per the Platform Agreement. This percentage is permanent and protected by the anti-dilution mechanism.

**Initiating Founder:** [INITIATING FOUNDER EQUITY PERCENT]%
**Recipient Founder:** [RECIPIENT FOUNDER EQUITY PERCENT]%

Total founder equity: [TOTAL FOUNDER EQUITY]% (must equal 100% minus Platform Equity)

The equity split was freely negotiated between both parties through the Emoclew platform thread system. No co-founder receives less than 5% unless explicitly joining as advisor-only.

**Equity Vesting:** A fresh vesting period begins at the merger effective date. Prior work may be recognised through up to 6 months of negotiated vesting credit, as agreed between the parties.`
    },
    {
      title: 'Community Ratification',
      content: `This merger is subject to community ratification as follows:

**Eligible Voters:** Any Emoclew platform member holding ≥2% equity in either merging company, excluding the two merging parties themselves.

**Pass Condition:** Simple majority of eligible voters within a 72-hour window from the time both parties complete their digital signatures.

**Automatic Ratification:** If fewer than 3 eligible voters exist across both companies, ratification is automatic and no community vote is required.

**Silence Rule:** If eligible voters exist but none vote within 72 hours, ratification passes automatically. Silence equals no objection.

**Failed Vote:** If the community vote fails, a 14-day cooling period begins before the same two companies may attempt to merge again.

**Vote Record:** [VOTE RECORD — APPROVE COUNT / REJECT COUNT / TOTAL ELIGIBLE]`
    },
    {
      title: 'Representations and Warranties',
      content: `Each party represents and warrants to the other as of the date of this Agreement:

(a) They have full legal capacity and authority to enter into this Agreement.

(b) They are the duly authorised representative of their respective company with power to bind the company to this Agreement.

(c) The equity percentages agreed herein do not conflict with any prior agreements, investor commitments, or third-party rights.

(d) All material information about their company shared through the Emoclew platform during the merger negotiation was accurate to the best of their knowledge.

(e) They have completed TOTP re-verification on the Emoclew platform immediately prior to signing, confirming their identity as the authorised signatory.

(f) They understand that this merger is irreversible once finalised on the platform.`
    },
    {
      title: 'Post-Merger Obligations',
      content: `Following the effective date of this merger:

(a) The Initiating Founder joins the surviving entity as a MERGED_FOUNDER with the equity percentage agreed herein.

(b) Both founders agree to honour the contribution scorecard principles — level difference, prior traction, capital invested, IP and code contributed, ongoing commitment, and skill complementarity — in determining operational roles within the merged entity.

(c) Both parties agree to update any external registrations, bank accounts, or legal documents to reflect the merger at the earliest practical opportunity.

(d) Existing investor obligations of either company transfer to the surviving entity, subject to investor notification.

(e) The Emoclew platform will automatically update ownership records, project status, and equity ledger upon finalisation.`
    },
    {
      title: 'Miscellaneous',
      content: `**Governing Law.** This Agreement shall be governed by the laws of the State of Delaware, without regard to its conflict of laws provisions.

**Entire Agreement.** This Agreement, together with the Platform Agreement with Emoclew, constitutes the full understanding between the parties regarding this merger.

**Portability.** This Agreement is designed to be portable to legal counsel, AngelList, Carta, or any relevant regulatory body. A PDF with embedded signature metadata is available for download from the Emoclew platform.

**No Legal Entity Representation.** During the beta period, Emoclew is not an incorporated legal entity. This Agreement reflects the intended final form of the merger agreement and carries no legal weight until Emoclew is incorporated and this document has been reviewed by qualified legal counsel.`
    },
    {
      title: 'Signatures',
      content: `**INITIATING FOUNDER**

Signature: _______________________________
Name: [INITIATING FOUNDER NAME]
Company: [INITIATING COMPANY NAME]
Date: [DATE]

TOTP Verification Record: [PLATFORM VERIFICATION ID]
Verification Timestamp: [TIMESTAMP]

---

**RECIPIENT FOUNDER**

Signature: _______________________________
Name: [RECIPIENT FOUNDER NAME]
Company: [RECIPIENT COMPANY NAME]
Date: [DATE]

TOTP Verification Record: [PLATFORM VERIFICATION ID]
Verification Timestamp: [TIMESTAMP]

---

**COMMUNITY RATIFICATION**

Ratification Method: [COMMUNITY VOTE / AUTOMATIC — QUORUM NOT MET]
Vote Result: [APPROVE COUNT] approve / [REJECT COUNT] reject
Ratification Timestamp: [TIMESTAMP]

---

*This document was generated by the Emoclew platform. Both parties signed digitally using TOTP verification. A PDF copy with embedded signature metadata is available for download.*`
    }
  ]
};
