'use client'

import { Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Unauthorized from '../components/Shared/Unauthorized';

export default function UnauthorizedPage() {
  return (
    <Unauthorized />
  );
}