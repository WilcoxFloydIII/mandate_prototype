import { ReportsView } from '../../components/shared/ReportsView';
import { departments, institution } from '../../data/mockData';

export function ReportsPanel() {
  return (
    <ReportsView
      eyebrow={institution.name}
      scopeDescription="Institution-wide attendance reports — every filter available."
      departmentOptions={departments.map((d) => ({ id: d.id, name: d.name }))}
      filenamePrefix={institution.shortName.toLowerCase()}
    />
  );
}
