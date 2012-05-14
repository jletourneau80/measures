function() {
  var patient = this;
  var measure = patient.measures["1401"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start = effective_date - (1 * year);
  var earliest_birthdate =       earliestBirthdayForThisAge(1, measurement_period_start);
  var latest_birthdate = latestBirthdayForThisAge(1, measurement_period_start);
  var earliest_encounter = patient.birthdate - (1 * year);

  var population = function() {
    var encounters=normalize(measure.encounter_office_visit_encounter_performed,
                             measure.encounter_face_to_face_interaction_encounter_performed,
                             measure.encounter_outpatient_consulatation_encounter_performed);

    return(((patient.birthdate <= latest_birthdate) && (patient.birthdate >= earliest_birthdate)) &&
             inRange(encounters, earliest_encounter, effective_date));
  }

  var denominator = function() {
    return true;
  }

  var numerator = function() {
    var pp_depression_screen = inRange(measure.encounter_pp_depression_screening_risk_category_assessment,patient.birthdate, patient.birthdate + (1 * year));
    var pp_depression_treatment = inRange(measure.encounter_depression_treatment_intervention_performed,patient.birthdate, patient.birthdate + (1 * year));
    
    return pp_depression_screen || pp_depression_treatment;
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};