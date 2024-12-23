'use client';

import React, { useState } from 'react';
import NewClientForm from './NewClientForm';
import WelcomeBack from './WelcomeBack';
import {
  queryClientByPhone,
  saveClient,
  saveCheckIn,
} from '@shared/services/checkInService';
import { useOrganization } from '@/app/hooks/useOrganization';
import { Client } from '@shared/types/client';
import { Card } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import OrganizationLogo from '@shared/components/ui/OrganizationLogo';

const CheckInPage = () => {
  const { organizationId, organizationName, organizationLogoUrl } =
    useOrganization();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [client, setClient] = useState<Client | null>(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  const resetForm = () => {
    setPhoneNumber('');
    setClient(null);
    setStep(1);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber || !organizationId) return;

    try {
      const foundClient: Client | null = await queryClientByPhone(
        organizationId,
        phoneNumber
      );
      setClient(foundClient || null);
      setStep(2);
    } catch (error) {
      console.error('Error querying client:', error);
    }
  };

  const handleClientSave = async (clientData: Client) => {
    try {
      if (!organizationId) {
        throw new Error('Missing organizationId');
      }
      // Save new client and handle check-in
      const clientId = await saveClient({
        organizationId,
        clientData: clientData,
      });
      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleCheckInExistingClient = async (updatedClient: Client) => {
    try {
      if (!organizationId || !client) {
        throw new Error('Missing organizationId or client');
      }
      // Save or update client and handle check-in
      const clientId = await saveClient({
        organizationId,
        clientId: client.id,
        clientData: updatedClient,
      });
      await handleCheckIn(clientId);
    } catch (error) {
      console.error('Error during check-in:', error);
    }
  };

  const handleCheckIn = async (clientId?: string) => {
    const finalClientId = clientId || client?.id;

    if (!finalClientId || !organizationId || !clientId) {
      console.error('Missing clientId or organizationId.');
      return;
    }

    try {
      await saveCheckIn({
        organizationId,
        clientId: clientId,
      });
      setMessage('Check-in successful! Redirecting...');
      const timeoutId = setTimeout(() => {
        setMessage(null);
        resetForm();
      }, 3000);
      return () => clearTimeout(timeoutId); // Cleanup timeout
    } catch (error) {
      console.error('Error during check-in:', error);
    }
  };

  return (
    <div className="container px-4 mx-auto mt-10 sm:px-6 lg:px-8">
      {message ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-500">{message}</h1>
        </div>
      ) : (
        <div>
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center h-16">
              <OrganizationLogo
                logoSrc={organizationLogoUrl}
                altText={`${organizationName} Logo`}
              />
            </div>
            <h1 className="mt-4 text-3xl font-bold text-center">
              Welcome to {organizationName}
            </h1>
            <p className="mt-2 text-center text-gray-500">
              Please check in by entering your phone number below.
            </p>
          </div>

          <div className="max-w-md mx-auto mt-8">
            {step === 1 && (
              <Card className="p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-semibold">
                  Enter Phone Number
                </h2>
                <Input
                  type="tel"
                  placeholder="Phone Number"
                  className="w-full"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Button onClick={handlePhoneSubmit} className="w-full mt-4">
                  Check In
                </Button>
              </Card>
            )}

            {step === 2 && client && (
              <WelcomeBack
                client={client}
                onUpdate={handleCheckInExistingClient}
              />
            )}

            {step === 2 && !client && (
              <NewClientForm
                phoneNumber={phoneNumber}
                onSave={handleClientSave}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInPage;
