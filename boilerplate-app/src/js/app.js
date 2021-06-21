(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var pt = smart.patient.read();
        var user = smart.user.read();
        var documents = smart.patient.api.fetchAll({
                    type: 'DocumentReference'
                  });

        $.when(pt, documents).fail(onError);

        $.when(pt, documents).done(function(patient, documents) {
          activeProvider = defaultProvider();
          var gender = patient.gender;

          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var activePatient = defaultPatient();
          activePatient.birthdate = patient.birthDate;
          activePatient.gender = gender;
          activePatient.fname = fname;
          activePatient.lname = lname;

          ret.resolve(activePatient, activeProvider);
        });
      } else {
        onError();
      }
    }

    FHIR.oauth2.ready(onReady, onError);
    return ret.promise();

  };

  function defaultProvider() {
    return {
      fname: {value: ''},
      lname: {value: ''}
    };
  }

  function defaultPatient(){
    return {
      fname: {value: ''},
      lname: {value: ''},
      gender: {value: ''},
      birthdate: {value: ''},
      height: {value: ''},
    };
  }

  function getQuantityValueAndUnit(ob) {
    if (typeof ob != 'undefined' &&
        typeof ob.valueQuantity != 'undefined' &&
        typeof ob.valueQuantity.value != 'undefined' &&
        typeof ob.valueQuantity.unit != 'undefined') {
      return ob.valueQuantity.value + ' ' + ob.valueQuantity.unit;
    } else {
      return undefined;
    }
  }
  window.drawVisualization = function(patient, provider) {
    $('#holder').show();
    $('#loading').hide();
    $('#provider-fname').html(provider.fname);
    $('#provider-lname').html(provider.lname);

    $('#patient-fname').html(patient.fname);
    $('#patient-lname').html(patient.lname);
    $('#patient-gender').html(patient.gender);
    $('#patient-birthdate').html(patient.birthdate);
    $('#patient-height').html(patient.height);
  };

})(window);
