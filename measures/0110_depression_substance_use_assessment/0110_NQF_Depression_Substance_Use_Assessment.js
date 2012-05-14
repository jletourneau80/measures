function() {
    var patient = this;
    var measure = patient.measures["0110"];
    if (measure == null) {
        measure = {};
    }
    < %=init_js_frameworks % >

    var day = 24 * 60 * 60;
    var year = 365 * day;
    var effective_date = <%=effective_date % >;

    var measurement_period_start = effective_date - (1 * year);
    var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);
    var earliest_encounter = effective_date - (1 * year);
    var latest_encounter = effective_date - 42 * day;
    var index_encounter = nil;
    var index_earliest_treatment = nil;

    var population = function() {
        return (patient.birthdate <= latest_birthdate);
    }

    var denominator = function() {
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
            var treatments_during_followup_period = _.sort(inRange(treatments, encounter_date, followup_end));
            if (diagnoses_during_blackout_period.length == 0 && meds_active_during_encounters_during_blackout_period.length == 0 && treatments_during_blackout_period.length == 0 && treatments_during_followup_period.length > 0) {
                index_encounter = encounter[i];
                index_earliest_treatment = treatments_during_followup_period[0];
                return (1);
            }
        }
        return (0);
        // None of the qualifying diagnoses satisfied the blackout period or treatment followup requirements.
    }

    var numerator = function() {
        var assessment_after_diagnosis_before_treatment = inRange(measure.assessment_for_suicidality_procedure_performed, index_diagnosis, index_earliest_treatment);
        return assessment_after_diagnosis_before_treatment.length > 0;
    }

    var exclusion = function() {
        return false;
    }

    map(patient, population, denominator, numerator, exclusion);
};