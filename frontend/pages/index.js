import { useState, useEffect } from 'react';
import Script from 'next/script'
import { Spin } from 'antd';

export default function Home() {
  const [loading, setLoading] = useState(true);

  const onTelegramAuth = (user) => {
    console.log(user);
  };

  useEffect(() => {
    if (loading && !window.onTelegramAuth) {
      window.onTelegramAuth = onTelegramAuth;
      setLoading(false);
    }
  }, [loading, setLoading, onTelegramAuth]);

  if (loading) return <Spin />;

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-widget.js?15"
        // Replace it with your bot name
        data-telegram-login="NotiShirtBot"
        data-size="large"
        data-onauth="onTelegramAuth(user)"
        data-request-access="write"
      />
    </>
  )
}
