var eKYCSmartSelfieSandbox = function eKYCSmartSelfieSandbox() {
	'use strict';

	var IDInfoForm = document.querySelector('form');
	var IDNumber = document.querySelector('#id_number');
	const { id_info } = JSON.parse(localStorage.getItem('SmileIdentityConfig'));

	const sandboxIDNumbers = {
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
	const sandboxPII = {
		first_name: 'Ciroma',
		last_name: 'Adekunle',
		day: '01',
		month: '10',
		year: '1960'
	}

	function setSandboxDetails() {
		IDNumber.setAttribute('readonly', true);
		IDNumber.setAttribute('value', sandboxIDNumbers[id_info.country][id_info.id_type]);

		if (id_info.country === 'NG' && id_info.id_type === 'DRIVERS_LICENSE') {
			['first_name', 'last_name', 'day', 'month', 'year'].forEach(field => {
				const element = document.querySelector(`#${field}`);

				element.setAttribute('readonly', true);
				element.setAttribute('value', sandboxPII[field]);
			});
		}
	}

	const button = document.createElement('button');
	button.type = 'button';
	button.setAttribute('data-type', 'tertiary');
	button.textContent = 'Click here to fill in Test Data';
	button.addEventListener('click', (e) => {
		setSandboxDetails();
	});

	IDInfoForm.prepend(button);
}();
