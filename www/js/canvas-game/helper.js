define(function(require) {

	function getDefault(defaultValue, value) {
		
		if(typeof value === 'undefined')
			return defaultValue;
		return value;

	}

	function getDefaults(defaultValues, values) {

		for(var i in defaultValues) {
			values[i] = getDefault(defaultValues[i], values[i]);
		}
		return values;

	}

	return {
		getDefault: getDefault,
		getDefaults: getDefaults
	}
  
});