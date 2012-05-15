var encounters = inRange(measure.encounter_outpatient_encounter, earliest_encounter, effective_date);
  var encounters_during_measurement_period = inRange(measure.encounter_outpatient_encounter, measurement_period_start, effective_date);
  var diagnoses = normalize(measure.bipolar_diagnosis_active, measure.unipolar_diagnosis_active);
  var diagnoses_during_encounter = allDiagnosesDuringEncounter(diagnoses, encounters, earliest_encounter, effective_date);
  var diagnoses_during_encounter_during_measurement_period = _sortBy(inRange(diagnoses_during_encounter, measurement_period_start, latest_encounter),
  function(num) {
      return num;
  });

  var treatments = normalize(
  measure.psychotherapy_procedure_performed, measure.psychotherapy_procedure_ordered,
  measure.counseling_for_depression_procedure_performed, measure.counseling_for_depression_procedure_ordered,
  measure.electroconvulsive_therapy_procedure_performed, measure.electroconvulsive_therapy_procedure_ordered,
  measure.antidepressants_medication_ordered,
  measure.moodstabilizers_medication_ordered);
  var treatments_during_measurement_period = inRange(treatments, measurement_period_start, effective_date);
  var meds_active = normalize(measure.antidepressants_medication_active, measure.moodstabilizers_medication_active);
  var meds_active_during_encounter = allSomethingsDuringEncounter(meds_active, encounters, earliest_encounter, effective_date);

  // If there are no diagnoses during encounter during the measurement period...we are done
  if (diagnoses_during_encounter_during_measurement_period.length == 0 ||
  treatments_during_measurement_period.length == 0) {
      return (0);
  }

  var qualifying_encounters = nil;
  var first_treatments_after_qualifying_encounters = nil;
  for (var i = 0; i < diagnoses_during_encounter_during_measurement_period.length; i++) {
      // for each encounter date
      // These are sorted, so if we find one, we are done.
      var encounter_date = encounters[i];
      var blackout_start = encounter_date - 180 * day;
      var followup_end = encounter_date + 42 * day;
      var diagnoses_during_blackout_period = inRange(diagnoses_during_encounter, blackout_start, encounter_date);
      var meds_active_during_encounters_during_blackout_period = inRange(meds_active_during_encounter, blackout_start, encounter_date);
      var treatments_during_blackout_period = inRange(treatments, blackout_start, encounter_date);
      var treatments_during_followup_period = _sortBy(inRange(treatments, encounter_date, followup_end),
      function(num) {
          return num;
      });
      if (diagnoses_during_blackout_period.length == 0 && meds_active_during_encounters_during_blackout_period.length == 0 && treatments_during_blackout_period.length == 0 && treatments_during_followup_period.length > 0) {
          index_encounter = encounter[i];
          index_earliest_treatment = treatments_during_followup_period[0];
          return (1);
      }
  }




numerator:
var dates_of_assessments = unique_dates(measure.assessment_for_suicidality_procedure_performed);
var day_of_diagnosis = date_to_day(index_diagnosis); 
var day_of_first_treatment = date_to_day(index_earliest_treatment);
var assessment_after_diagnosis_before_treatment = inRange(measure.assessment_for_suicidality_procedure_performed, index_diagnosis, index_earliest_treatment + 1*day);
if(assessment_after_diagnosis_before_treatment.length == 0){
	return(0);
}
var day_of_assessment = date_to_day(assessment_after_diagnosis_before_treatment);
return(day_of_assessment >= day_of_diagnosis && day_of_assessment <= day_of_first_treatment);
