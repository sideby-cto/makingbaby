
import { useEffect, useState } from 'react';
import LoginForm from './LoginForm';

export default function App() {
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetch('/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Error fetching message'));
  }, []);

  return (
    <>
      <h1>{message}</h1>
      <LoginForm />
    </>

  );
}
