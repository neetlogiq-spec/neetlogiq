import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const GoogleSignIn = ({ className = "", text = "signin_with", size = "large", width = 280 }) => {
  const { handleGoogleSuccess, GOOGLE_CLIENT_ID } = useAuth();
  const googleButtonRef = useRef(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSuccess,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleButtonRef.current) {
          window.google.accounts.id.renderButton(googleButtonRef.current, {
            theme: 'outline',
            size: size,
            text: text,
            shape: 'rectangular',
            logo_alignment: 'left',
            width: width,
          });
        }
      }
    };

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [GOOGLE_CLIENT_ID, handleGoogleSuccess, text, size, width]);

  return (
    <motion.div
      className={`${className} google-signin-container`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div ref={googleButtonRef} className="google-button-wrapper"></div>
    </motion.div>
  );
};

export default GoogleSignIn;
