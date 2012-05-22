function() {
  var patient = this;
  var measure = patient.measures["1661"];
  if (measure == null)
    measure={};

  <%= init_js_frameworks %>

  var day = 24 * 60 * 60;
  var year = 365 * day;
  var effective_date = <%= effective_date %>;

  var measurement_period_start = effective_date - (1 * year);
  var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);
  var earliest_encounter = patient.birthdate;
  var latest_encounter = earliest_encounter + (17 * year);
  var birthdate_proper = new Date(patient.birthdate*1000);
  var earliest_encounter = patient.birthdate;
  var latest_encounter = (birthdate_proper.setFullYear(birthdate_proper.getFullYear() + 18))/1000;

  var population = function() {
    
    var discharged_during_measurement_period = selectWithinRange(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed, "value","discharge datetime"),measurement_period_start,effective_date);


    var discharged_before_120_days=actionFollowingSomething(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed, "value","admission datetime"),
                                                            discharged_during_measurement_period, 120*day);

    return (discharged_during_measurement_period) && discharged_before_120_days;

  }

  var denominator = function() {
   
    
    var discharged_during_measurement_period = selectWithinRange(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed, "value","discharge datetime"));


    var discharged_before_2_days=actionFollowingSomething(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed, "value","admission datetime"),
                                                            discharged_during_measurement_period, 2*day);

    var cognitive_impairment_diagnosis = actionFollowingSomething(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed), measure.condition_cognitive_impairment_diagnosis_diagnosis_active , day); 

    var inpatient_encounter_before_18 = inRange(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed,"value","admission datetime"), earliest_encounter, latest_encounter)
  

    var inpatient_1_hour_after_emergency = actionFollowingSomething(filterForSomething(measure.encounter_emergency_department_visit_encounter_performed, "value","discharge datetime"), filterForSomething(measure.encounter_inpatient_encounter_encounter_performed, "value","admission datetime") , 60 * 60); 

    return !(discharged_before_2_days || cognitive_impairment_diagnosis || inpatient_encounter_before_18 || inpatient_1_hour_after_emergency)
  }

  var numerator = function() {
   var patient_refused_screening = actionFollowingSomething(measure.communication_patient_refusal_of_brief_alcohol_use_intervention_communication_from_patient_to_provider,filterForSomething(measure.encounter_inpatient_encounter_encounter_performed) , day) || 
                                 actionFollowingSomething(filterForSomething(measure.procedure_assessment_for_alcohol_use_procedure_performed, "value","Patient Refusal for Brief Alcohol Use Intervention"),filterForSomething(measure.encounter_inpatient_encounter_encounter_performed) , day);
   
   var assessment_for_alchohol = actionFollowingSomething(filterForSomething(measure.procedure_assessment_for_alcohol_use_procedure_performed),filterForSomething(measure.encounter_inpatient_encounter_encounter_performed) , day);
   var risk_category_assessment_for_alchohol_after_assessment = actionFollowingSomething(filterForSomething(measure.risk_category_screening_tool_for_alcohol_use_validated_result_risk_category_assessment),filterForSomething(measure.procedure_assessment_for_alcohol_use_procedure_performed) , day);
   var risk_category_assessment_for_alchohol_during_inpatient = actionFollowingSomething(filterForSomething(measure.risk_category_screening_tool_for_alcohol_use_validated_result_risk_category_assessment),filterForSomething(measure.encounter_inpatient_encounter_encounter_performed) , day);
   
   var assessment = (assessment_for_alchohol && risk_category_assessment_for_alchohol_after_assessment && risk_category_assessment_for_alchohol_during_inpatient);

   
   var blood_alcohol_test = actionFollowingSomething(filterForSomething(measure.lab_test_blood_alcohol_test_laboratory_test_performed),filterForSomething(measure.encounter_inpatient_encounter_encounter_performed) , day);
   var acute_intoxication = actionFollowingSomething(measure.condition_acute_intoxication_diagnosis_active,filterForSomething(measure.lab_test_blood_alcohol_test_laboratory_test_performed) , day);

   var blood_alchol_test_and_derived_acute_intoxication = blood_alcohol_test && acute_intoxication;


   var inpatient_1_hour_after_emergency = actionFollowingSomething(filterForSomething(measure.encounter_emergency_department_visit_encounter_performed, "value","discharge datetime"), filterForSomething(measure.encounter_inpatient_encounter_encounter_performed, "value","admission datetime") , 60 * 60); 
   var emergency_refused_screening_after_admission_comm = actionFollowingSomething(measure.communication_patient_refusal_of_brief_alcohol_use_intervention_communication_from_patient_to_provider,filterForSomething(measure.encounter_emergency_department_visit_encounter_performed,"value","admission datetime") , day);
   var emergency_refused_screening_before_discharge_comm = actionFollowingSomething(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed,"value","discharge datetime"),measure.communication_patient_refusal_of_brief_alcohol_use_intervention_communication_from_patient_to_provider , day);
   var emergency_refused_screening_comm = emergency_refused_screening_after_admission_comm && emergency_refused_screening_before_discharge_comm;
   

   var emergency_refused_screening_after_admission = actionFollowingSomething(filterForSomething(measure.procedure_assessment_for_alcohol_use_procedure_performed, "value","Patient Refusal for Brief Alcohol Use Intervention"),filterForSomething(measure.encounter_emergency_department_visit_encounter_performed,"value","admission datetime") , day);
   var emergency_refused_screening_before_discharge = actionFollowingSomething(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed,"value","discharge datetime"),filterForSomething(measure.procedure_assessment_for_alcohol_use_procedure_performed, "value","Patient Refusal for Brief Alcohol Use Intervention") , day);
   var emergency_refused_screening = emergency_refused_screening_after_admission && emergency_refused_screening_before_discharge;
   
   var emergency_assessment_after_admission = actionFollowingSomething(filterForSomething(measure.procedure_assessment_for_alcohol_use_procedure_performed),filterForSomething(measure.encounter_emergency_department_visit_encounter_performed,"value","admission datetime") , day);
   var emergency_assessment_before_discharge = actionFollowingSomething(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed,"value","discharge datetime"),filterForSomething(measure.procedure_assessment_for_alcohol_use_procedure_performed) , day);
   var emergency_risk_category_assessment_after_admission = actionFollowingSomething(filterForSomething(measure.risk_category_screening_tool_for_alcohol_use_validated_result_risk_category_assessment),filterForSomething(measure.encounter_emergency_department_visit_encounter_performed,"value","admission datetime") , day);
   var emergency_risk_category_assessment_before_discharge = actionFollowingSomething(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed,"value","discharge datetime"),filterForSomething(measure.risk_category_screening_tool_for_alcohol_use_validated_result_risk_category_assessment) , day);
   var emergency_assessment = emergency_assessment_after_admission && emergency_assessment_before_discharge && emergency_risk_category_assessment_after_admission && emergency_risk_category_assessment_before_discharge;

  var emergency_lab_test_after_admission = actionFollowingSomething(filterForSomething(measure.lab_test_blood_alcohol_test_laboratory_test_performed),filterForSomething(measure.encounter_emergency_department_visit_encounter_performed,"value","admission datetime") , day);
   var emergency_lab_test_before_discharge = actionFollowingSomething(filterForSomething(measure.encounter_inpatient_encounter_encounter_performed,"value","discharge datetime"),filterForSomething(measure.lab_test_blood_alcohol_test_laboratory_test_performed) , day);
  
   var emergency_lab_test = acute_intoxication && emergency_lab_test_after_admission && emergency_lab_test_before_discharge;

   var emergency_screening = inpatient_1_hour_after_emergency && (emergency_refused_screening_comm || emergency_refused_screening || emergency_assessment || emergency_lab_test);



   return patient_refused_screening || assessment || blood_alchol_test_and_derived_acute_intoxication || emergency_screening;
   
  }

  var exclusion = function() {
    return false;
  }

  map(patient, population, denominator, numerator, exclusion);
};