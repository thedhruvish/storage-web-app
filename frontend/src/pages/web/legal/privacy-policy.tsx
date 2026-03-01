import React from "react";
import LegalLayout from "./legal-layout";

const PrivacyPolicy: React.FC = () => {
  return (
    <LegalLayout title='Privacy Policy'>
      <p className='mb-4 text-sm opacity-70'>
        Last updated: {new Date().toDateString()}
      </p>

      <p className='mb-4'>
        storeone.cloud provides digital media storage services through its
        website and Progressive Web App (PWA). This Privacy Policy explains how
        we collect, use, store, and protect your information when you use our
        services.
      </p>

      <h2 className='text-xl font-medium mt-8 mb-3'>
        1. Information We Collect
      </h2>
      <ul className='list-disc pl-6 space-y-2'>
        <li>Name and email address used during registration</li>
        <li>Account and subscription details</li>
        <li>Uploaded or imported media metadata</li>
        <li>IP address, browser type, device data, and user-agent</li>
        <li>Usage logs, timestamps, and activity records</li>
      </ul>

      <h2 className='text-xl font-medium mt-8 mb-3'>2. Cookies & Tracking</h2>
      <p className='mb-4'>
        We use cookies and similar technologies to maintain sessions, improve
        performance, prevent abuse, and understand usage behavior. Disabling
        cookies may affect certain features.
      </p>

      <h2 className='text-xl font-medium mt-8 mb-3'>3. Analytics</h2>
      <p className='mb-4'>
        We use analytics tools to monitor performance and improve usability.
        These tools may collect anonymized usage data such as page views,
        interaction patterns, and device information.
      </p>

      <h2 className='text-xl font-medium mt-8 mb-3'>4. Media Storage</h2>
      <p className='mb-4'>
        All uploaded and imported media is stored on secure cloud
        infrastructure. Media may be accessed, reviewed, managed, or deleted by
        the site owner for maintenance, compliance, or policy enforcement
        purposes.
      </p>

      <h2 className='text-xl font-medium mt-8 mb-3'>5. Google Drive Import</h2>
      <p className='mb-4'>
        When you choose to import media from Google Drive, access is granted
        only during the import process and only with your permission. Imported
        files are permanently copied to our servers.
      </p>

      <h2 className='text-xl font-medium mt-8 mb-3'>6. Data Security</h2>
      <p className='mb-4'>
        We apply reasonable technical and organizational measures to protect
        your data. However, no system is completely secure, and we cannot
        guarantee absolute protection.
      </p>

      <h2 className='text-xl font-medium mt-8 mb-3'>7. Data Sharing</h2>
      <p className='mb-4'>
        We do not sell user data. Information is shared only with essential
        third-party services required to operate the platform.
      </p>

      <h2 className='text-xl font-medium mt-8 mb-3'>8. Account Deletion</h2>
      <p className='mb-4'>
        To permanently delete your account and all associated data, email
        <strong> support@storeone.cloud </strong>
        from your registered email address with the subject:
      </p>
      <p className='italic mb-4'>storeone cloud - delete my account</p>
      <p className='mb-4'>
        Deletion is permanent, non-recoverable, and may take 1–2 months.
        Additional verification may be required.
      </p>

      <h2 className='text-xl font-medium mt-8 mb-3'>9. Governing Law</h2>
      <p>This policy is governed by the laws of India.</p>
    </LegalLayout>
  );
};

export default PrivacyPolicy;
