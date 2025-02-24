import React, { useEffect, useState } from 'react';

function App() {
  // status can be: 'idle', 'connecting', 'success', or 'fail'
  const [status, setStatus] = useState('idle');
  const [username, setUsername] = useState('');

  // On component mount, initialize Pi SDK (if available)
  useEffect(() => {
    if (window.Pi) {
      // Set sandbox: true for Testnet, false for Mainnet
      window.Pi.init({ version: '2.0', sandbox: true });
    }
  }, []);

  const loginWithPi = () => {
    // If Pi is not defined, we may not be in the Pi Browser
    if (!window.Pi) {
      alert('Pi SDK not found. Are you in the Pi Browser?');
      return;
    }

    setStatus('connecting');

    // Request the "username" scope from the Pi Network
    window.Pi.authenticate(['username'], (auth) => {
      if (!auth.user) {
        setStatus('fail');
        alert('Login failed: No user data returned.');
        return;
      }
      setStatus('success');
      setUsername(auth.user.username);
      alert(`Welcome, ${auth.user.username}`);
    }, (err) => {
      setStatus('fail');
      alert(`Login error: ${err}`);
    });
  };

  return (
    <div style={{ textAlign: 'center', margin: '2em' }}>
      <h1>AI4Pi React Login</h1>

      <button onClick={loginWithPi}>
        {status === 'connecting' ? 'Connecting...' : 'Login with Pi'}
      </button>

      <div style={{ marginTop: '1rem' }}>
        {status === 'success' && (
          <p style={{ color: 'green' }}>Logged in as {username}</p>
        )}
        {status === 'fail' && (
          <p style={{ color: 'red' }}>Login failed. Try again.</p>
        )}
      </div>
    </div>
  );
}

export default App;