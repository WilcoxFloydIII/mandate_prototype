import { ReportsView } from '../../components/shared/ReportsView';
import { institution } from '../../data/mockData';

export function ReportsPanel() {
  return (
    <ReportsView
      eyebrow={institution.name}
      scopeDescription="Read-only, institution-wide. Export the top-line compliance story."
      minimal
      filenamePrefix={`${institution.shortName.toLowerCase()}-institution`}
    />
  );
}
