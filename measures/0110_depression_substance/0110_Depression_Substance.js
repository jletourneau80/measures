function () {
    var patient = this;
    var measure = patient.measures["0110"];
    if (measure == null) {
        measure = {};
    } <%= init_js_frameworks %>

    var day = 24 * 60 * 60;
    var year = 365 * day;
    var effective_date = <%= effective_date %> ;

    var measurement_period_start = effective_date - (1 * year);
    var latest_birthdate = latestBirthdayForThisAge(18, measurement_period_start);
    var earliest_encounter = measurement_period_start - (1 * year);
    var latest_encounter = effective_date - 42 * day;
    var index_encounter = null;
    var index_earliest_treatment = null;

    var population = function () {
            return (patient.birthdate <= latest_birthdate);
        }

    var denominator = function () {
            var encounters = allSomethingsInRange(measure.encounter_bh_outpatient_encounter_encounter_performed, earliest_encounter, effective_date);
            var encounters_during_measurement_period = allSomethingsInRange(measure.encounter_bh_outpatient_encounter_encounter_performed, measurement_period_start, effective_date);
            var diagnoses = normalize(measure.condition_bh_conditions_involving_bipolar_disorder_diagnosis_active, measure.condition_bh_conditions_involving_unipolar_depression_diagnosis_active);
            var diagnoses_during_encounter = allDiagnosesDuringEncounter(diagnoses, encounters, earliest_encounter, effective_date);
            var diagnoses_during_encounter_during_measurement_period = sortedSomethingsInRange(diagnoses_during_encounter, measurement_period_start, latest_encounter);
            var treatments = normalize(
            measure.procedure_bh_psychotherapy_procedure_performed, measure.procedure_bh_psychotherapy_procedure_ordered, measure.procedure_bh_counseling_for_depression_procedure_performed, measure.procedure_bh_counseling_for_depression_procedure_ordered, measure.procedure_bh_electroconvulsive_therapy_procedure_performed, measure.procedure_bh_electroconvulsive_therapy_procedure_ordered, measure.medication_bh_anti_depressant_medication_medication_ordered, measure.medication_bh_mood_stabilizer_agent_medication_ordered);
            var treatments_during_measurement_period = allSomethingsInRange(treatments, measurement_period_start, effective_date);
            var meds_active = normalize(measure.anti_depressant_medication_medication_active, measure.mood_stabilizer_agent_medication_active);
            var meds_active_during_encounter = allSomethingsDuringEncounter(meds_active, encounters, earliest_encounter, effective_date);

            // If there are no diagnoses during encounter during the measurement period...we are done
            if (diagnoses_during_encounter_during_measurement_period.length == 0 || treatments_during_measurement_period.length == 0) {
                return (false);
            }
            // None of the qualifying diagnoses satisfied the blackout period or treatment followup requirements.
            var qualifying_encounters = null;
            var first_treatments_after_qualifying_encounters = null;
            for (var i = 0; i < diagnoses_during_encounter_during_measurement_period.length; i++) {
                // for each encounter date
                // These are sorted, so if we find one, we are done.
                var encounter_date = diagnoses_during_encounter_during_measurement_period[i];
                var blackout_start = encounter_date - 180 * day;
                var followup_end = encounter_date + 42 * day;
                // Note that the 'encounter_date-1' is to make the blackout period exclusive of the encounter time itself.
                var diagnoses_during_blackout_period = allSomethingsInRange(diagnoses_during_encounter, blackout_start, encounter_date - 1);
                var meds_active_during_encounters_during_blackout_period = allSomethingsInRange(meds_active_during_encounter, blackout_start, encounter_date - 1);
                var treatments_during_blackout_period = allSomethingsInRange(treatments, blackout_start, encounter_date - 1);
                var treatments_during_followup_period = sortedSomethingsInRange(treatments, encounter_date, followup_end);
                if (diagnoses_during_blackout_period.length == 0 && meds_active_during_encounters_during_blackout_period.length == 0 && treatments_during_blackout_period.length == 0 && treatments_during_followup_period.length > 0) {
                    index_encounter = encounter_date;
                    index_earliest_treatment = treatments_during_followup_period[0];
                    return (true);
                }
            }
            return false
        }

    var numerator = function () {
            var day_of_diagnosis = date_to_ndays(index_encounter);
            var day_of_first_treatment = date_to_ndays(index_earliest_treatment);
            var assessment_after_diagnosis_before_treatment = sortedSomethingsInRange(measure.procedure_bh_assessment_for_alcohol_or_other_substance_use_procedure_performed, index_encounter, index_earliest_treatment + 1 * day);
            if (assessment_after_diagnosis_before_treatment.length == 0) {
                return (0);
            }
            var day_of_assessment = date_to_ndays(assessment_after_diagnosis_before_treatment[0]);
            return (day_of_assessment >= day_of_diagnosis && day_of_assessment <= day_of_first_treatment);
        }

    var exclusion = function () {
            return false;
        }
        // This function takes a Ruby Date (seconds since the epoch), and creates a JS date object.
        // The output is roughly the number of days since the epoch.   The purpose is to distinguish events that occurred on the same date from those that occurred on different dates.
        // This really should be in misc_utils
    var date_to_ndays = function (date) {
            var jdate = new Date(date * 1000);
            return (jdate.getUTCFullYear() * 365 + jdate.getUTCMonth() * 31 + jdate.getUTCDate());
        };


    map(patient, population, denominator, numerator, exclusion);
};