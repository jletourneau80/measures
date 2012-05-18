function() {
  var patient = this;
  var measure = patient.measures["1406"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start = effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(12, measurement_period_start);
  var earliest_encounter = patient.birthdate;
  var latest_encounter = earliest_encounter + (12 * year);
  var birthdate_proper = new Date(patient.birthdate*1000);
  var earliest_intervention = (birthdate_proper.setFullYear(birthdate_proper.getFullYear() + 11))/1000;
  var latest_intervention = (birthdate_proper.setFullYear(birthdate_proper.getFullYear() + 2))/1000;

  var population = function() {
    
    var age_filter = (patient.birthdate <= latest_birthdate);

    var encounters=normalize(measure.encounter_office_visit_encounter_performed,
                             measure.encounter_face_to_face_interaction_encounter_performed,
                             measure.encounter_outpatient_consulation_encounter_performed);

    return (age_filter) && inRange(encounters, earliest_encounter, latest_encounter);

  }

  var denominator = function() {
   
    return true;
  }

  var numerator = function() {
   var interventions = normalize(measure.intervention_counseling_for_sexual_activity_intervention_performed,
                                 measure.intervention_counseling_for_sexual_activity_intervention_ordered,
                                 measure.intervention_counseling_for_substance_abuse_intervention_performed,
                                 measure.intervention_counseling_for_substance_abuse_intervention_ordered,
                                 measure.intervention_counseling_for_alcohol_abuse_intervention_performed,
                                 measure.intervention_counseling_for_alcohol_abuse_intervention_ordered,
                                 measure.intervention_counseling_for_tobacco_abuse_intervention_performed,
                                 measure.intervention_counseling_for_tobacco_abuse_intervention_ordered);
   
   
   
   return inRange(interventions,earliest_intervention,latest_intervention);
   
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};