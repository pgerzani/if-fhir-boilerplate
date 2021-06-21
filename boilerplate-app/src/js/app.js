(function(window){
  window.extractData = function() {
    var ret = $.Deferred();

    function onError() {
      console.log('Loading error', arguments);
      ret.reject();
    }

    function onReady(smart)  {
      if (smart.hasOwnProperty('patient')) {
        var user = smart.user.read();
        $.when(user, obv).fail(onError);
        $.when(user, obv).done(function(provider, obv) {
          retProvider = defaultProvider();
          retProvider.fname = provider.fname;
          retProvider.lname = provider.lname;
          ret.resolve(retProvider);
        });
        var patient = smart.patient;
        var pt = patient.read();
        var documents = smart.patient.api.fetchAll({
                    type: 'DocumentReference'
                  });

        $.when(pt, obv).fail(onError);

        $.when(pt, obv).done(function(patient, obv) {
          var byCodes = smart.byCodes(obv, 'code');
          var gender = patient.gender;

          var fname = '';
          var lname = '';

          if (typeof patient.name[0] !== 'undefined') {
            fname = patient.name[0].given.join(' ');
            lname = patient.name[0].family.join(' ');
          }

          var height = byCodes('8302-2');

          var p = defaultPatient();
          p.birthdate = patient.birthDate;
          p.gender = gender;
          p.fname = fname;
          p.lname = lname;
          p.height = getQuantityValueAndUnit(height[0]);

          ret.resolve(p);
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
  window.drawVisualization = function(patient) {
    $('#holder').show();
    $('#loading').hide();
    $('#patient-fname').html(patient.fname);
    $('#patient-lname').html(patient.lname);
    $('#patient-gender').html(patient.gender);
    $('#patient-birthdate').html(patient.birthdate);
    $('#patient-height').html(patient.height);
  };

})(window);
