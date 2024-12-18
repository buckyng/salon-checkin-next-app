import { db } from '@shared/services/firebase';
import { EndOfDayReport } from '@shared/types/report';
import { collection, doc, setDoc } from 'firebase/firestore';

export const saveEndOfDayReport = async (
  reportData: EndOfDayReport
): Promise<void> => {
  try {
    const { organizationId, date } = reportData;

    // Construct document ID as `organizationId_date` for unique daily reports
    const reportId = `${organizationId}_${date}`;

    // Reference to the Firestore collection
    const reportsCollection = collection(db, 'endOfDayReports');
    const reportDoc = doc(reportsCollection, reportId);

    // Save the report to Firestore
    await setDoc(reportDoc, reportData);

    console.log('End-of-Day Report saved successfully:', reportData);
  } catch (error) {
    console.error('Error saving end-of-day report:', error);
    throw new Error('Failed to save the end-of-day report.');
  }
};
