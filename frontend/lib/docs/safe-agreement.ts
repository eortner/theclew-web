export const safeAgreement = {
  title: 'Simple Agreement for Future Equity',
  subtitle: 'Post-Money SAFE — Emoclew Platform',
  version: '1.0-beta',
  lastUpdated: 'April 2026',
  notice: 'This is a prototype legal document for review purposes only. It has not been reviewed by legal counsel. Before any financial transaction occurs, this agreement must be reviewed and approved by a US securities attorney. No financial obligations are created during the Emoclew beta period.',
  sections: [
    {
      title: 'Parties',
      content: `This Simple Agreement for Future Equity (this "Safe") is entered into on [DATE] by and between:

**Company:** [COMPANY NAME], a [STATE] [ENTITY TYPE] ("Company"), with its principal place of business at [ADDRESS].

**Investor:** [INVESTOR FULL NAME] ("Investor"), with an address at [INVESTOR ADDRESS].

This Safe is one of a series of Safes issued by the Company. The Company may issue additional Safes with the same or different terms.`
    },
    {
      title: 'Definitions',
      content: `"**Valuation Cap**" means $[VALUATION CAP AMOUNT].

"**Discount Rate**" means [DISCOUNT RATE]% (i.e., the Investor will receive a [DISCOUNT RATE]% discount to the price per share paid by investors in the Equity Financing).

"**Equity Financing**" means a bona fide transaction or series of transactions with the principal purpose of raising capital, pursuant to which the Company issues and sells preferred stock at a fixed pre-money valuation.

"**Liquidity Event**" means a Change of Control or an Initial Public Offering.

"**Change of Control**" means (i) a transaction or series of related transactions in which any person becomes the beneficial owner of more than 50% of the outstanding voting securities of the Company; (ii) a reorganisation, merger, consolidation or sale of all or substantially all of the assets of the Company.

"**Emoclew Platform Equity**" means the equity stake retained by Emoclew as described in the Platform Agreement, currently set at [PLATFORM EQUITY PERCENT]% as determined by the Company's level at the time of this Safe.

"**Company Capitalization**" means the number of shares of capital stock of the Company outstanding on a fully-diluted basis, calculated as of immediately prior to the Equity Financing.

"**Safe Price**" means the price per share equal to the Post-Money Valuation Cap divided by the Company Capitalization.`
    },
    {
      title: 'Investment Amount',
      content: `The Investor agrees to invest $[INVESTMENT AMOUNT] (the "Purchase Amount") in the Company in exchange for the rights described in this Safe.

The maximum total investment the Company may accept under any Safes at Level 1 is $10,000 combined across all investors. This limit may increase as the Company advances levels on the Emoclew platform.

Maximum equity per individual investor: 3% per deal.
Maximum revenue share to all investors combined: 5% of monthly revenue.
Repayment multiple: 1.5× before monthly payments cease; equity stake remains after full repayment.`
    },
    {
      title: 'Equity Vesting Schedule',
      content: `Equity under this Safe vests proportionally through completed monthly payments — it is not transferred in full at the time of commitment.

**Vesting Calculation:**
- Investor commits [EQUITY PERCENT]% equity over [TERM MONTHS] monthly payments
- Each completed payment vests: ([EQUITY PERCENT] ÷ [TERM MONTHS])% of equity
- Equity earned to date = (Payments Completed ÷ Total Payments) × Total Committed Equity

**Abandonment Mechanism:**
If the Investor fails to make 3 consecutive monthly payments after Emoclew's automated warning process is exhausted:
- Final equity = Earned Equity × (1 - Abandonment Penalty)
- Abandonment penalty: [ABANDONMENT PENALTY PERCENT]% (to be finalised)
- Remaining unvested equity returns automatically to the founder pool`
    },
    {
      title: 'Conversion Rights',
      content: `**Equity Financing.** Upon an Equity Financing, the Purchase Amount will automatically convert into the number of shares of Standard Preferred Stock equal to the Purchase Amount divided by the Safe Price.

**Liquidity Event.** Upon a Liquidity Event prior to the termination of this Safe, the Investor will receive the greater of:
(i) the Purchase Amount; or
(ii) the amount payable on the number of shares of Common Stock equal to the Purchase Amount divided by the Liquidity Price.

**Dissolution Event.** In the event of a Dissolution Event prior to the termination of this Safe, the Investor will be entitled to receive out of the assets of the Company legally available for distribution to its stockholders, prior to and in preference to any payment to holders of outstanding Common Stock, an amount equal to the Purchase Amount.`
    },
    {
      title: 'Platform Equity',
      content: `The Company acknowledges that Emoclew retains [PLATFORM EQUITY PERCENT]% equity in the Company as part of the Platform Agreement executed at registration. This Platform Equity is senior to investor equity acquired through this Safe.

The Platform Equity percentage is determined by the Company's level at the time of initial registration and reduces permanently as the Company advances levels, with a guaranteed floor of 7%.

This Safe is subordinate to the Platform Agreement and does not affect or reduce Emoclew's equity position.`
    },
    {
      title: 'Company Representations',
      content: `The Company represents and warrants to the Investor as of the date of this Safe:

(a) The Company is duly organised, validly existing and in good standing under the laws of its state of incorporation.

(b) The execution, delivery and performance of this Safe are within the Company's powers and have been duly authorised.

(c) No consent or approval of, or filing with, any governmental authority or other person is required for the execution and performance of this Safe.

(d) The Company has not, and will not, during the term of this Safe, issue any securities that would be senior to this Safe except as required by the Platform Agreement with Emoclew.`
    },
    {
      title: 'Investor Representations',
      content: `The Investor represents and warrants to the Company as of the date of this Safe:

(a) The Investor has full legal capacity, power and authority to execute and deliver this Safe and to perform its obligations hereunder.

(b) The Investor is an accredited investor as defined in Rule 501 of Regulation D under the Securities Act of 1933, as amended, or has declared their investor status as required by the Emoclew platform at profile creation.

(c) The Investor is acquiring this Safe for its own account, not as a nominee or agent, and not with a view to, or for resale in connection with, any distribution thereof.

(d) The Investor acknowledges that this Safe and the securities issuable hereunder have not been registered under the Securities Act and may not be transferred except in compliance with all applicable laws.`
    },
    {
      title: 'Miscellaneous',
      content: `**Governing Law.** This Safe shall be governed by the laws of the State of Delaware, without regard to its conflict of laws provisions.

**Entire Agreement.** This Safe constitutes the full and entire understanding and agreement between the parties with regard to the subjects hereof.

**Amendments.** Any provision of this Safe may be amended or waived only with the written consent of the Company and the Investor.

**Portability.** This Safe is designed to be portable to AngelList, Carta, or independent legal counsel. The Company may register this Safe with a licensed intermediary at its discretion.

**No Broker-Dealer Activity.** Emoclew does not act as a broker-dealer, funding portal, or financial intermediary. All capital transactions occur outside the Emoclew platform. Emoclew is the orchestration layer only.

**Severability.** If any provision of this Safe is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that this Safe will otherwise remain in full force and effect.`
    },
    {
      title: 'Signatures',
      content: `**COMPANY**

Signature: _______________________________
Name: [AUTHORISED SIGNATORY NAME]
Title: [TITLE]
Date: [DATE]

TOTP Verification Record: [PLATFORM VERIFICATION ID]
Verification Timestamp: [TIMESTAMP]

---

**INVESTOR**

Signature: _______________________________
Name: [INVESTOR FULL NAME]
Date: [DATE]

TOTP Verification Record: [PLATFORM VERIFICATION ID]
Verification Timestamp: [TIMESTAMP]

---

*This document was generated by the Emoclew platform and digitally signed by both parties using TOTP verification. A PDF copy with embedded signature metadata is available for download and portability to AngelList, Carta, or legal counsel.*`
    },
  ]
};
