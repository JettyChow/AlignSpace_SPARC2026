'use client';

import { useNavigation } from '@/hooks/useNavigation';
import BudgetScreen from '@/screens/decide/BudgetScreen';

export default function BudgetPage() {
  const { go, back } = useNavigation();

  return (
    <BudgetScreen
      onBack={back}
      onContinue={() => go('/summary')}
      onMenu={() => go('/history')}
    />
  );
}
