import React, { useState, useEffect } from 'react';
import { signInWithPhoneNumber, PhoneAuthProvider, signInWithCredential, RecaptchaVerifier } from 'firebase/auth';
import { auth } from '../../lib/firebase';

const PhoneAuth = () => {
  const [phone, setPhone] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.recaptchaVerifier && document.getElementById('recaptcha-container')) {
      window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {}, auth);
    }
  }, []);

  const handleSendCode = async () => {
    setMessage('');
    setLoading(true);
    const auth = getAuth();
    try {
      const confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);
      setVerificationId(confirmationResult.verificationId);
      setMessage('Code sent! Check your SMS.');
    } catch (error) {
      setMessage('Error sending code: ' + error.message);
    }
    setLoading(false);
  };

  const handleVerifyCode = async () => {
    setMessage('');
    setLoading(true);
    const auth = getAuth();
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);
      setMessage('Phone number verified and signed in!');
    } catch (error) {
      setMessage('Error verifying code: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-900 rounded shadow max-w-md mx-auto">
      <h2 className="font-bold mb-2">Phone Authentication</h2>
      <div className="flex flex-col gap-2">
        <input
          type="tel"
          placeholder="+1234567890"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="border p-2 rounded"
          disabled={!!verificationId || loading}
        />
        <button
          onClick={handleSendCode}
          disabled={!phone || !!verificationId || loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded dark:bg-indigo-800"
        >
          {loading && !verificationId ? 'Sending...' : 'Send Code'}
        </button>
        {verificationId && (
          <>
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="border p-2 rounded"
              disabled={loading}
            />
            <button
              onClick={handleVerifyCode}
              disabled={!code || loading}
              className="bg-green-600 text-white px-4 py-2 rounded dark:bg-green-800"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </>
        )}
        <div id="recaptcha-container" className="mt-2"></div>
        {message && <div className="text-sm mt-2">{message}</div>}
      </div>
    </div>
  );
};

export default PhoneAuth; 