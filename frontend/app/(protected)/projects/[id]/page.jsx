'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useAppStore } from '@/store/useAppStore';
import { useNavigation } from '@/hooks/useNavigation';
import MaterialsScreen from '@/screens/designer/MaterialsScreen';
import { getDesignerProject } from '@/services/project.service';
import { ApiError } from '@/services/apiClient';
import { DEMO_PROJECT_ID, buildDemoDesignerProject, buildDemoDesignerMaterials } from '@/data/demoDesignerProject';

const TONES = ['linen', 'oak', 'charcoal', 'travertine', 'sand', 'stone', 'warmwhite', 'clay'];

function prettyCategory(category) {
  const label = String(category || 'other').replace(/_/g, ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Map the backend's pipeline-shaped materials ({material_id, name, category,
// price: subtotal, quantity, status, ...} — see _materials_for_backend) onto
// the DBML-shaped fields MaterialsScreen renders.
function toScreenMaterials(materials) {
  return (materials || []).map((m, i) => {
    const quantity = m.quantity || 1;
    return {
      item_id: m.material_id ?? i + 1,
      item_name: m.name,
      item_category: prettyCategory(m.category),
      projItem_quantity: quantity,
      projItem_unitCost: Math.round(((m.price ?? 0) / quantity) * 100) / 100,
      projItem_status: ['approved', 'confirmed'].includes(m.status) ? 'approved' : 'pending',
      tone: TONES[i % TONES.length],
    };
  });
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { go, back } = useNavigation();
  const { getToken } = useAuth();
  const storeProject = useAppStore((s) => s.project);

  // DEMO MODE: /projects/demo-kitchen is a fixed, non-numeric id that never
  // corresponds to a real backend record — bypass getDesignerProject()
  // entirely and load the shared kitchen demo dataset instead. This check
  // must run before the numeric-id validation below, since "demo-kitchen"
  // is intentionally non-numeric. See data/demoDesignerProject.js.
  const isDemo = id === DEMO_PROJECT_ID;

  const [packet, setPacket] = useState(null);
  const [loading, setLoading] = useState(!isDemo);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDemo) return;

    if (!Number.isFinite(Number(id))) {
      setLoading(false);
      setError('This project only exists locally — no backend record to load.');
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getDesignerProject(id, getToken)
      .then((data) => {
        if (!cancelled) setPacket(data?.project || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof ApiError
            ? 'Could not load this project right now.'
            : 'The projects backend is not reachable yet.'
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, getToken, isDemo]);

  if (isDemo) {
    return (
      <MaterialsScreen
        project={buildDemoDesignerProject()}
        materials={buildDemoDesignerMaterials()}
        loading={false}
        error={null}
        onBack={back}
        onProfile={() => go('/profile')}
        onTab={() => {}}
      />
    );
  }

  return (
    <MaterialsScreen
      project={packet || storeProject}
      materials={toScreenMaterials(packet?.materials)}
      loading={loading}
      error={error}
      onBack={back}
      onProfile={() => go('/profile')}
      onTab={() => {}}
    />
  );
}
