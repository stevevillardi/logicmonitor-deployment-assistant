'use client'

import { usePathname } from 'next/navigation';
import RAGChat from './AIChat';

export default function RAGChatWrapper() {
  const pathname = usePathname();
  const isPOVPath = pathname?.includes('/active-pov/') || pathname?.includes('/pov/');

  if (isPOVPath) return null;
  return <RAGChat />;
} 