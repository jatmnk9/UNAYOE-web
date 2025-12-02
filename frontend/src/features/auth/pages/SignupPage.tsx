import * as React from 'react';
import { SignupForm } from '../components/SignupForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../shared/components/ui/card';

export const SignupPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-white">UNAYOE</h1>
          <p className="text-lg text-white/90">Portal de Bienestar Estudiantil</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Completa el formulario para registrarte en el portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignupForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
