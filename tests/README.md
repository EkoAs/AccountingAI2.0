# Bug Condition Exploration Tests

## Overview

This directory contains property-based tests for the modal-done-button-fix bugfix spec.

## Test: Done Button Modal Issues

**File:** `bug-condition-done-button.test.js`

**Purpose:** Validates that the Done button bug exists in the unfixed code.

**Requirements Tested:** 1.1, 1.2, 1.3, 1.4

### Bug Condition

When the Done button is clicked with AI classification displayed:
- Reasoning is NOT displayed in the UI
- Modal content is NOT cleared
- Transaction is NOT saved to the report table
- No transaction-specific success feedback is shown

### Expected Test Outcome

**IMPORTANT:** This test is EXPECTED TO FAIL on unfixed code. The failure confirms the bug exists.

### Running the Test

```bash
node tests/bug-condition-done-button.test.js
```

### Test Results

The test runs 10 property-based test cases with different transaction inputs:
- Various descriptions (modal, gaji, sewa, perlengkapan, etc.)
- Different amounts (1,000 to 5,000,000 IDR)
- Various quantities (1 to 100 units)

All test cases consistently fail with the same pattern, confirming the bug condition.

### Counterexamples Found

All 10 test cases failed with these consistent violations:

1. **Requirement 2.2**: Classification display not cleared after Done
2. **Requirement 2.3**: Transaction not added to app.transactions
3. **Requirement 2.4**: Success message not transaction-specific

### Root Cause

The `handleDone()` function in `js/main.js` (lines 235-254) does NOT handle the case when classification is displayed. It needs to:

1. Check if `window.currentTransaction` exists
2. Check if classification is displayed
3. Display reasoning in `#classificationReasoning`
4. Call `confirmTransaction()` to save the transaction
5. Clear the modal
6. Show transaction-specific success feedback

### After Fix

Once the bug is fixed, this same test should PASS, confirming the expected behavior is satisfied.
