import React from 'react';

interface TestProps {
  message: string;
}

const TestTypeScript: React.FC<TestProps> = ({ message }) => {
  return (
    <div>
      <h1>TypeScript funciona!</h1>
      <p>{message}</p>
    </div>
  );
};

export default TestTypeScript;
