'use client';

import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export default function AntiAdblock() {
  const [adblockDetected, setAdblockDetected] = useState(false);

  useEffect(() => {
    const checkAdblock = async () => {
      let isBlocked = false;

      // Method 1: Check if known ad networks are blocked at the network level
      try {
        await fetch('https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-store'
        });
      } catch (e) {
        // If fetch throws an error, the request was blocked by an extension
        isBlocked = true;
      }

      // Method 2: DOM element check (Fallback)
      if (!isBlocked) {
        const ad = document.createElement('div');
        ad.innerHTML = '&nbsp;';
        ad.className = 'adsbox ad-placement doubleclick ad-placeholder ad-badge';
        ad.style.position = 'absolute';
        ad.style.top = '-999px';
        ad.style.left = '-999px';
        document.body.appendChild(ad);

        // Allow a small delay for extensions to parse the DOM
        await new Promise(resolve => setTimeout(resolve, 100));

        if (ad.offsetHeight === 0 || window.getComputedStyle(ad).display === 'none') {
          isBlocked = true;
        }
        document.body.removeChild(ad);
      }

      if (isBlocked) {
        setAdblockDetected(true);
      }
    };

    // Run the check after a slight delay
    const timer = setTimeout(checkAdblock, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!adblockDetected) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-background-secondary border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-danger/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow-red">
          <ShieldAlert className="w-10 h-10 text-danger" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Adblocker Detected</h2>
        <p className="text-muted mb-8 leading-relaxed">
          It looks like you're using an Adblocker. We rely on ads to keep AHHHMETV running and completely free for everyone. 
          <br/><br/>
          Please <strong>disable your adblocker</strong> for this site to continue chatting and meeting new friends!
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary w-full py-4 text-lg"
        >
          I have disabled my Adblocker
        </button>
      </div>
    </div>
  );
}
