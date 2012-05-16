function() {
  var patient = this;
  var measure = patient.measures["0580"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start = effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(17, measurement_period_start);
  var earliest_encounter = measurement_period_start - (1 * year);
  var exclusion_encounter = earliest_encounter - (1 * year);

  var population = function() {
    

    return(patient.birthdate <= latest_birthdate);
  }

  var denominator = function() {

    var inpatient_encounters_inrange = selectWithinRange(measure.encounter_bh_inpatient_encounter_encounter_performed, earliest_encounter,measurement_period_start);
    var emergency_encounters_inrange = selectWithinRange(measure.encounter_bh_emergency_department_visit_encounter_performed, earliest_encounter,measurement_period_start);
    var outpatient_encounters_inrange = selectWithinRange(measure.encounter_bh_outpatient_encounter_encounter_performed, earliest_encounter,measurement_period_start);

    var bipolar_disorder_inrange = actionFollowingSomething(outpatient_encounters_inrange, measure.condition_bh_bipolar_disorder_diagnosis_active , day);
    var principal_bipolar_inrange = actionFollowingSomething(inpatient_encounters_inrange,measure.condition_bh_bipolar_disorder_diagnosis_active_principal_, day);
    var principal_bipolar_emergency_inrange = actionFollowingSomething(emergency_encounters_inrange, measure.condition_bh_bipolar_disorder_diagnosis_active_principal_,day);
    
    var denominator = ((bipolar_disorder_inrange>=3) || (principal_bipolar_inrange>=1) || (principal_bipolar_emergency_inrange>=1));

    var inpatient_encounters_outrange = selectWithinRange(measure.encounter_bh_inpatient_encounter_encounter_performed,exclusion_encounter, earliest_encounter);
    var emergency_encounters_outrange = selectWithinRange(measure.encounter_bh_emergency_department_visit_encounter_performed, exclusion_encounter, earliest_encounter);
    var outpatient_encounters_outrange = selectWithinRange(measure.encounter_bh_outpatient_encounter_encounter_performed, exclusion_encounter, earliest_encounter);

    var bipolar_disorder_outrange = actionFollowingSomething(outpatient_encounters_outrange, measure.condition_bh_bipolar_disorder_diagnosis_active , day);
    var principal_bipolar_outrange = actionFollowingSomething(inpatient_encounters_outrange,measure.condition_bh_bipolar_disorder_diagnosis_active_principal_, day);
    var principal_bipolar_emergency_outrange = actionFollowingSomething(emergency_encounters_outrange, measure.condition_bh_bipolar_disorder_diagnosis_active_principal_,day);
    
    var exclusion = ((principal_bipolar_outrange>=1) || (bipolar_disorder_outrange>=1) || (principal_bipolar_emergency_outrange>=1));

   
    return  denominator && !exclusion;
  }

  var numerator = function() {
   var stabilizer = inRange(measure.medication_bh_mood_stabilizer_agent_medication_ordered,measurement_period_start,effective_date);
    var outpatient_encounters_inrange = selectWithinRange(measure.encounter_bh_outpatient_encounter_encounter_performed, measurement_period_start,effective_date);
    var stabilizer_active = actionFollowingSomething(outpatient_encounters_inrange, measure.medication_bh_mood_stabilizer_agent_medication_active , day); 
    return stabilizer_ordered>=1 || stabilizer_active>=1;
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};