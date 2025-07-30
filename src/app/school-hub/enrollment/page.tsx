'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnrollmentWizard, EnrollmentFormData } from '@/components/school-hub/enrollment';
import { useToast } from '@/hooks/useToast';

const EnrollmentPage: React.FC = () => {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEnrollmentComplete = async (data: EnrollmentFormData) => {
    setIsSubmitting(true);
    
    try {
      // Here you would typically send the data to your API
      console.log('Enrollment data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addToast({
        type: 'success',
        title: 'Enrollment Submitted',
        description: 'Your enrollment application has been submitted successfully. You will receive a confirmation email shortly.'
      });
      
      // Redirect to success page or dashboard
      router.push('/school-hub?enrollment=success');
      
    } catch (error) {
      console.error('Enrollment submission error:', error);
      addToast({
        type: 'error',
        title: 'Enrollment Failed',
        description: 'There was an error submitting your enrollment. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/school-hub');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <EnrollmentWizard
        onComplete={handleEnrollmentComplete}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default EnrollmentPage;