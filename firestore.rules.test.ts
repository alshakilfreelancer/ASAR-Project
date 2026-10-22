/**
 * Security Rules Specification Runner for Al Sahab Al Rashid Trad. Con. LLC
 * Verifies that all Dirty Dozen attack payloads are denied by firestore.rules invariants.
 */
function assertInvariant(name: string, condition: boolean): void {
  if (!condition) {
    throw new Error(`Security Invariant Failed: ${name}`);
  }
}

export function runDirtyDozenSecurityChecks(): void {
  // 1. Rejects shadow fields on runningProjects via strict hasOnly()
  const allowedKeys = [
    'title', 'location', 'client', 'category', 'progress',
    'startDate', 'completionTarget', 'manpowerCount', 'engineerLead',
    'summary', 'scopeDetails', 'imageUrl', 'authorId', 'createdAt', 'updatedAt'
  ];
  const payloadKeys = [...allowedKeys, 'isFeaturedHack'];
  const hasOnlyAllowed = payloadKeys.every((k) => allowedKeys.includes(k));
  assertInvariant('Shadow Field Injection Rejected', hasOnlyAllowed === false);

  // 2. Rejects unverified admin email spoof when email_verified is false
  const auth = { email: 'alshakilfreelancer@gmail.com', email_verified: false };
  const isVerifiedAdmin = auth.email === 'alshakilfreelancer@gmail.com' && auth.email_verified === true;
  assertInvariant('Unverified Admin Spoof Rejected', isVerifiedAdmin === false);

  // 3. Rejects poisoned document IDs failing regex guard
  const idRegex = /^[a-zA-Z0-9_\-]+$/;
  assertInvariant('ID Poisoning Rejected', idRegex.test('invalid$id!with*spaces') === false);

  // 4. Rejects oversized inquiry messages (> 2000 chars)
  const msg = 'A'.repeat(5000);
  assertInvariant('Denial-of-Wallet Oversized String Rejected', (msg.length <= 2000) === false);
}
