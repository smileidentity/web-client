var eKYCSmartSelfieDemo = function eKYCSmartSelfieDemo() {
	'use strict';

	var IDNumber = document.querySelector('#id_number');
	const { id_info } = JSON.parse(localStorage.getItem('SmileIdentityConfig'));

	const demoIDNumbers = {
		GH: {
			DRIVERS_LICENSE: 'B0000000',
			PASSPORT: 'G0000000',
			SSNIT: 'C000000000000',
			VOTER_ID: '0000000000',
			NEW_VOTER_ID: '0000000000'
		},
		KE: {
			ALIEN_CARD: '000000',
			PASSPORT: '00000000',
			NATIONAL_ID: 'A00000000'
		},
		NG: {
			BVN: '00000000000',
			DRIVERS_LICENSE: 'ABC000000000',
			NIN: '00000000000',
			NIN_SLIP: '00000000000',
			TIN: '00000000-0000',
			VOTER_ID: '0000000000000000000'
		},
		ZA: {
			NATIONAL_ID: '0000000000000'
		},
	}

	function setDemoIDNumber() {
		IDNumber.setAttribute('value', demoIDNumbers[id_info.country][id_info.id_type]);
		IDNumber.readonly = true;
	}

	setDemoIDNumber();
}();
