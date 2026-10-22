# Security Specification — Al Sahab Al Rashid Trad. Con. LLC

## 1. Data Invariants

1. **Default-Deny Catch-All**: All paths not explicitly matched are unconditionally denied (`allow read, write: if false;`).
2. **Verified Admin Governance**: Only verified administrators (`isAdmin()`, where email is verified `alshakilfreelancer@gmail.com` or UID exists in `/admins/{uid}`) can create, update, or delete public corporate CMS collections (`siteConfig`, `coreServices`, `runningProjects`, `galleryPhotos`, `completedProjects`).
3. **Path Variable Hardening (`isValidId`)**: All single-document operations (`get`, `create`, `update`, `delete`) validate document IDs against `^[a-zA-Z0-9_\-]+$` with length `<= 128`.
4. **Anti-Update-Gap & Strict Keys**: Every `create` and `update` invokes `isValid[Entity](incoming())` enforcing `hasAll` and `hasOnly` keys, exact types, string `.size()` boundaries, and `request.time` temporal integrity.
5. **PII Isolation on Client Inquiries (`/inquiries/{inquiryId}`)**: Because inquiries contain `email` and `phone` (PII), public or blanket `read` / `list` is strictly forbidden. Only `isAdmin()` or the authenticated submitter (`resource.data.authorId == request.auth.uid`) may read or list their own inquiries.
6. **Immutable Ownership & Creation Timestamps**: `authorId` and `createdAt` cannot be mutated during any `update` operation.
7. **Terminal State Locking on Inquiries**: Once an inquiry reaches `status == 'archived'`, non-admin updates are locked (`existing().status != 'archived' || isAdmin()`).

## 2. The "Dirty Dozen" Payloads

1. **Shadow Field Injection on `runningProjects`**:
   `{ ...validRunningProject, "isFeaturedHack": true }` -> Rejected by `data.keys().hasOnly(...)`.
2. **Unverified Admin Email Spoof**:
   Auth token with `email: "alshakilfreelancer@gmail.com"` and `email_verified: false` attempting `create` on `/runningProjects/proj-1` -> Rejected by `request.auth.token.email_verified == true`.
3. **ID Poisoning Attack**:
   `create` on `/runningProjects/invalid$id!with*spaces` -> Rejected by `isValidId(projectId)`.
4. **Denial-of-Wallet Oversized String**:
   `create` on `/inquiries/inq-1` with a 50,000-character `message` -> Rejected by `data.message.size() <= 2000`.
5. **Client Timestamp Forgery**:
   `create` on `/galleryPhotos/photo-1` with `createdAt: Timestamp.fromMillis(1600000000000)` != `request.time` -> Rejected by `incoming().createdAt == request.time`.
6. **Author UID Spoofing**:
   Authenticated user `uid_A` submits `/inquiries/inq-1` with `authorId: "uid_B"` -> Rejected by `incoming().authorId == request.auth.uid`.
7. **Unauthorized PII Scraping (`list` on `/inquiries`)**:
   Non-admin user `uid_attacker` executes unconstrained `getDocs(collection(db, 'inquiries'))` -> Rejected because `allow list` requires `isAdmin() || (isSignedIn() && resource.data.authorId == request.auth.uid)`.
8. **Immutable `createdAt` Mutation on `runningProjects`**:
   Admin updates `/runningProjects/proj-1` changing `createdAt` -> Rejected by `incoming().createdAt == existing().createdAt`.
9. **Immutable `authorId` Mutation on `completedProjects`**:
   Admin updates `/completedProjects/comp-1` changing `authorId` -> Rejected by `incoming().authorId == existing().authorId`.
10. **Value Poisoning on Update (`progress` out of range)**:
    Update `/runningProjects/proj-1` setting `progress: 999` -> Rejected by `isValidRunningProject(incoming())` which enforces `data.progress >= 0 && data.progress <= 100`.
11. **Invalid Hex Color Pattern in `siteConfig`**:
    Update `/siteConfig/main` setting `primaryNavy: "javascript:alert(1)"` -> Rejected by `data.primaryNavy.matches('^#[0-9a-fA-F]{6}$')`.
12. **Self-Privilege Escalation on `/admins/{uid}`**:
    Regular user attempts `setDoc(doc(db, 'admins', uid), ...)` -> Rejected because `/admins/{adminUid}` write is strictly `if false` from client SDKs.
