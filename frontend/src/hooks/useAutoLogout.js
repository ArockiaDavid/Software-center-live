import { useState, useEffect, useCallback } from 'react';
import config from '../config';

const useAutoLogout = (onLogout) => {
  const [state, setState] = useState({
    showWarning: false,
    remainingTime: 0,
    timers: {
      warning: null,
      logout: null,
      countdown: null
    }
  });

  const WARNING_BEFORE_TIMEOUT = 120000; // 2 minutes in milliseconds
  const SESSION_TIMEOUT = config.sessionTimeout;
  const WARNING_TIME = SESSION_TIMEOUT - WARNING_BEFORE_TIMEOUT;

  const clearTimers = useCallback(() => {
    if (state.timers.warning) clearTimeout(state.timers.warning);
    if (state.timers.logout) clearTimeout(state.timers.logout);
    if (state.timers.countdown) clearInterval(state.timers.countdown);
  }, [state.timers]);

  const resetTimers = useCallback(() => {
    clearTimers();

    const warning = setTimeout(() => {
      setState(prev => ({
        ...prev,
        showWarning: true,
        remainingTime: WARNING_BEFORE_TIMEOUT
      }));

      const countdown = setInterval(() => {
        setState(prev => ({
          ...prev,
          remainingTime: Math.max(0, prev.remainingTime - 1000)
        }));
      }, 1000);

      const logout = setTimeout(() => {
        clearInterval(countdown);
        onLogout();
      }, WARNING_BEFORE_TIMEOUT);

      setState(prev => ({
        ...prev,
        timers: { warning: null, logout, countdown }
      }));
    }, WARNING_TIME);

    setState(prev => ({
      ...prev,
      timers: { ...prev.timers, warning }
    }));
  }, [clearTimers, onLogout]);

  const handleUserActivity = useCallback(() => {
    if (!state.showWarning) {
      resetTimers();
    }
  }, [state.showWarning, resetTimers]);

  const handleStayLoggedIn = useCallback(() => {
    setState(prev => ({ ...prev, showWarning: false }));
    clearTimers();
    resetTimers();
  }, [clearTimers, resetTimers]);

  useEffect(() => {
    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll'
    ];

    events.forEach(event => {
      window.addEventListener(event, handleUserActivity);
    });

    resetTimers();

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearTimers();
    };
  }, [handleUserActivity, resetTimers, clearTimers]);

  return {
    showWarning: state.showWarning,
    remainingTime: state.remainingTime,
    onStayLoggedIn: handleStayLoggedIn,
    onLogout
  };
};

export default useAutoLogout;
