import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

const bannerStyles = {
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    backgroundColor: '#252525ff', // gray-800
    color: 'white',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1000,
};

const buttonStyles = {
    backgroundColor: '#000000ff', // gray-600
    color: 'white',
    fontWeight: 'bold',
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    cursor: 'pointer',
};

function CookieConsentBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consentCookie = Cookies.get('cookie_consent');
        if (!consentCookie) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        // Set the consent cookie
        Cookies.set('cookie_consent', 'true', { expires: 365 });

        // Now that we have consent, set the tracking cookie
        const trackingCookie = Cookies.get('user_tracking_id');
        if (!trackingCookie) {
            const newTrackingId = crypto.randomUUID();
            Cookies.set('user_tracking_id', newTrackingId, { expires: 365 });
        }

        setShowBanner(false);
    };

    if (!showBanner) {
        return null;
    }

    return (
        <div style={bannerStyles}>
            <p>We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.</p>
            <button style={buttonStyles} onClick={handleAccept}>
                Accept
            </button>
        </div>
    );
}

export default CookieConsentBanner;

export const setCookie = (name, value, options) => Cookies.set(name, value, options);
export const getCookie = (name) => Cookies.get(name);
export const delCookie = (name) => Cookies.remove(name);