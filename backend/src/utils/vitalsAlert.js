
/**
 * @param {Object} vitals
 * @returns {string[]} 
 */
const checkVitalsAlerts = (vitals) => {
  const alerts = [];

  if (vitals.bloodPressure?.systolic && vitals.bloodPressure?.diastolic) {
    const { systolic, diastolic } = vitals.bloodPressure;
    if (systolic >= 140 || diastolic >= 90) alerts.push('high_bp');
    if (systolic < 90 || diastolic < 60) alerts.push('low_bp');
  }


  if (vitals.hemoglobin !== undefined) {
    if (vitals.hemoglobin < 11) alerts.push('anemia_risk');
  }

  if (vitals.bloodSugar?.value !== undefined) {
    const sugar = vitals.bloodSugar.value;
    const type = vitals.bloodSugar.type;
    if (type === 'fasting' && sugar > 126) alerts.push('high_sugar');
    if (type === 'post_meal' && sugar > 200) alerts.push('high_sugar');
    if (type === 'random' && sugar > 200) alerts.push('high_sugar');
    if (sugar < 70) alerts.push('low_sugar');
  }

  if (vitals.temperature !== undefined) {
    if (vitals.temperature >= 38.0) alerts.push('fever');
  }

  if (vitals.oxygenSaturation !== undefined) {
    if (vitals.oxygenSaturation < 94) alerts.push('low_oxygen');
  }

  return alerts;
};

/**
 * @param {string[]} alerts
 * @returns {'routine' | 'priority' | 'urgent'}
 */
const alertsToUrgency = (alerts) => {
  const urgentAlerts = ['high_bp', 'low_oxygen', 'low_sugar'];
  const priorityAlerts = ['anemia_risk', 'high_sugar', 'fever'];

  if (alerts.some((a) => urgentAlerts.includes(a))) return 'urgent';
  if (alerts.some((a) => priorityAlerts.includes(a))) return 'priority';
  return 'routine';
};

module.exports = { checkVitalsAlerts, alertsToUrgency };