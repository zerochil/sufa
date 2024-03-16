const scrollBehavior = { behavior: 'smooth', };
const form = document.querySelector('._form');
let storedImages = [];

// Category
( () => {
	const selectors = document.querySelector('._selectors');
	const choices = selectors.nextElementSibling.children;
	const inputs = Array.from(selectors.querySelectorAll('input'));

	const checkedIndex = inputs.findIndex(input => input.checked);
	if ( checkedIndex !== -1 ) 
		toggleGroupClass(choices[checkedIndex], '_active');
	else {
		toggleGroupClass(choices[0], '_active');
		inputs[0].checked = true;
	}

	inputs.forEach( (element, index) => {
		element.addEventListener('click', () => toggleGroupClass(choices[index], '_active') )
	});
	
	Array.from

})();


// form Navigation
( () => {
	let fieldsets = form.querySelectorAll('fieldset');
	// fieldsets[0].remove();
	// fieldsets[1].remove();
	// fieldsets[2].remove();
	// fieldsets[3].remove();
	fieldsets = form.querySelectorAll('fieldset');
	let order = form.querySelector('.fieldset._selected') ?? 0;
	fieldsets[order].classList.add('slider_selected');

	const {container, next, submit, prev, indicator} = createElements(
	{
		element: 'div',
		class: 'nav_buttons',
		ref: 'container',
		children: [
			{
				element: 'button',
				attributes: {type: 'button', class: '_prev arrow_button arrow_left'},
				ref: 'prev',
				events: {click: () => handleClick(-1)},
				children: [
					{
						element: 'span',
						textContent: 'Prev',
					},
				]
			},
			{
				element: 'div',
				class: 'nav_indicator',
				children: Array.from(fieldsets).map( (_, index) =>
					({
						element: 'span',
						class: ( index === order ) ? '_selected' : ''
					})),
				ref: 'indicator',
			},
			{
				element: 'button',
				attributes: {type: 'button', class: '_next arrow_button'},
				ref: 'next',
				events: {click: () => handleClick(1)},
				children: [
					{
						element: 'span',
						textContent: 'Next',
					},
				]
			},
			{
				element: 'button',
				textContent: 'Submit',
				attributes: {type: 'button', class: '_submit'},
				// class: '_submit',
				events: {click: [() => handleClick(1), triggerSubmission]},
				ref: 'submit'
			},
		]
	});

	let disabledButtons = toggleButtons(order, null);
	form.append(container);


	function switchClass(e1, e2, className) {
		(Array.isArray(e1))
			? e1.forEach(e => e?.classList.remove(className))
			: e1?.classList.remove(className);
		(Array.isArray(e2))
			? e2.forEach(e => e?.classList.add(className)) 
			: e2?.classList.add(className);
	}

	function toggleButtons(index, disabledButtons) {
		const toDisable = [];
		if (index <= 0) toDisable.push(prev);
		if (index >= fieldsets.length-2) toDisable.push(next);
		if (index !== fieldsets.length-2) toDisable.push(submit);
		if (toDisable.length == 0) return disabledButtons;
		switchClass(disabledButtons, toDisable, '_disabled');
		return toDisable;
	}

	function handleClick(increment=1) {
		if (isNaN(increment)) return;
		const newOrder = order + increment;
		if (newOrder < 0 || newOrder >= fieldsets.length) return;

		disabledButtons = toggleButtons(newOrder,  disabledButtons);
		switchClass(indicator.children[order], indicator.children[newOrder], '_selected');
		switchClass(fieldsets[order], fieldsets[newOrder], 'slider_selected');
		// if (event.target == next) form.scrollIntoView(scrollBehavior);
		order = newOrder;
	}

	function triggerSubmission(){
		form.dispatchEvent(new Event('submit', { cancelable: true }));
		const fieldset = Array.from(fieldsets).slice(-1)[0];
		const submission = fieldset.querySelector('.submit_uploading')
		const success = fieldset.querySelector('.submit_success')

		toggleGroupClass(submission, '_active')
		setTimeout( // simulate fetch
			() => {
				toggleGroupClass(success, '_active')
			},
			5000
		)
	}
})();




// Map 
loadScript(
	"https://unpkg.com/leaflet/dist/leaflet.js", 
	() => {
		const root = document.querySelector('.geo_location');
		const input = root.children[0];
		const citiesCoordinates = { casablanca: [33.5731, -7.5898], rabat: [34.0209, -6.8415], fes: [34.0181, -5.0078], marrakech: [31.6295, -7.9811], tangier: [35.7595, -5.8330], agadir: [30.4220, -9.5595], meknes: [33.8935, -5.5471], oujda: [34.6786, -1.9056], kenitra: [34.2610, -6.5802], tetouan: [35.5706, -5.3726], safi: [32.2998, -9.2372], mohammedia: [33.6991, -7.3898], el_jadida: [33.2530, -8.5061], beni_mellal: [32.3341, -6.3531], nador: [35.1740, -2.9287]};
		const initialCoordinates = (input.value.length > 0) ? input.value.split(',') : citiesCoordinates.casablanca;
		// const initialCoordinates = citiesCoordinates.casablanca;
		// console.log(initialCoordinates)

		const {map_container} = createElements([
			{
				element: 'button',
				attributes: {type: 'button'},
				events: {click: handleCurrentLocation},
				children: [
					{
						element: 'i',
						class: 'fa_geolocation'
					},
					{
						element: 'span',
					textContent: 'Use Current Location',
					}
				]
			},
			{
				element: 'label',
				children: [
					{
						element: 'i',
						class: 'fa_search'
					},
					{
						element: 'input',
						attributes: {class: "_location", type: "text", placeholder: "Enter the city or street name", form: 'ignore'}
					}
				]
			},
			{
				element: 'div',
				class: '_cities',
				children: Object.entries(citiesCoordinates).map( ([name, coordinates]) => { return {
					element: 'button',
					textContent: name,
					attributes: {type: 'button'},
					events: {click: () => updateMap(coordinates) },
				}} )
			},
			{
				element: 'div',
				class: 'listing_location',
				children: [
					{
						element: 'span',
						textContent: 'Listing current location:'
					},
					{
						element: input,
						attributes: {
							readonly: true,
							value: initialCoordinates.join(', '),
						}
					},
				]
			},
			{
				element: 'div',
				attributes: {id: '_map'},
				ref: 'map_container'
			}
		], root)

		const map = L.map('_map').setView(initialCoordinates, 12);
		const coordinatesInput = document.querySelector('._coordinates');
		const locationInput = document.querySelector('._location');
		const marker = L.marker(initialCoordinates, { draggable: true }).addTo(map); // set to casablanca


		function updateMap([lat, long]) {
			map.setView([lat, long], 12);
			marker.setLatLng([lat, long]);
			coordinatesInput.value = lat + ', ' + long;
		}

		function handleCurrentLocation() {
			if (! "geolocation" in navigator) return console.error('geolocation not supported');
			// TODO: communicate error to use
			navigator.geolocation.getCurrentPosition((position) => {
				let latitude = position.coords.latitude;
				let longitude = position.coords.longitude;
				updateMap([latitude, longitude]);
				// map_container.scrollIntoView(scrollBehavior);
			});
		}

		function handleFetchLocationCoordinates(event) {
			const location = event.target.value;
			fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + location)
				.then(response => response.json())
				.then(data => {
					if(data.length > 0){
						const lat = parseFloat(data[0].lat);
						const lon = parseFloat(data[0].lon);
						updateMap([lat, lon]);
					} else {
						// TODO: communicate error to use
						console.error('Location not found');
					}
				})
				.catch(error => console.error('Map fetch:', error));
		};
		const debounceHandleFetchLocationCoordinates = ( () => {
			let timeoutId;
			return (...args) => {
				clearTimeout(timeoutId);
				timeoutId = setTimeout( () => handleFetchLocationCoordinates(...args), 300);
			};
		})();
		locationInput.addEventListener('input', debounceHandleFetchLocationCoordinates);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

		map.on('click', function(event) {
			const clickedCoords = event.latlng;
			marker.setLatLng(clickedCoords);
			coordinatesInput.value = clickedCoords.lat + ', ' + clickedCoords.lng;
		});
		marker.on('dragend', function(event){
			const markerCoords = event.target.getLatLng();
			coordinatesInput.value = markerCoords.lat + ', ' + markerCoords.lng;
		});
	}
);




// input number
( () => {
	form.querySelectorAll('input[type="number"]').forEach( input => {
		const label = input.closest('label');
		const initialValue = (input.min) ? input.min : (input.max && input.max < 1) ? input.max :1;
		const symboleLength = (input.dataset.symbol ? input.dataset.symbol.length : 0) || 0;
		if (input.value === '' && isFinite(initialValue)) input.value = initialValue;
		const data_disable = (input.value == input.min) ? 'minimum' : (input.value == input.max) ? 'maximum' : '';

		const {} = createElements({
			element: label,
			class: 'input_number_label',
			textContent: (label.textContent) ? `${label.textContent}:` : '',
			children: [
				{
					element: 'span',
					attributes: {'data-disable':data_disable, class: 'input_number'},
					events: {click: handleClick},
					children: [
						{
							element: 'span',
							textContent: '-'
						},
						{
							element: 'span',
							children: [
								{
									element: input,
									attributes: {pattern:"[0-9]*", inputmode:"numeric"},
									style: { 'width': `${calculateWidth(input)}ch` },
									events: {input: update}
								},
								{
									element: 'span',
									textContent: input.dataset.symbol ?? '',
									style: { 'margin-left': `-${symboleLength}ch` },
								}
							]
						},
						{
							element: 'span',
							textContent: '+'
						},
					]
				},
			]
		})
	})

	function calculateWidth(input) {
		const symboleLength = (input.dataset.symbol !== undefined) ? input.dataset.symbol.length : 0;
		let digits = Math.floor(Math.log10(Math.abs(input.value))) + 1;
		if (!isFinite(digits)) digits = 1;
		return digits + symboleLength + 0.5; // .5 for spacing
	}

	function handleClick(event) {
		if (event.target.tagName == 'LABEL') return;
		event.preventDefault();
		if (event.target.innerHTML == '-') update(event, -1 );
		if (event.target.innerHTML == '+') update(event, 1 );
	}

	function update (event, value=0) {
		value = parseInt(value);
		const input = event.target.parentNode.querySelector('input');
		const max = (input.max !== undefined) ? parseInt(input.max) : Infinity;
		const min = (input.min !== undefined) ? parseInt(input.min) : -Infinity;
		const step = parseInt(input.step) || 1;
		const newVal = (step) ? parseInt(input.value) + step*value : parseInt(input.value) + value;
		if ( !isNaN(newVal) ) {
			if ( newVal < min ) input.value = min;
			else if ( newVal > max ) input.value = max;
			else input.value = newVal;
		}

		event.target.closest('.input_number').dataset.disable =
			(input.value > min && input.value < max)
				?  ''
				: (input.value <= min)
					?  'minimum'
					: (input.value >= max)
						? 'maximum'
						: '' ;

		input.style.width = `${calculateWidth(input)}ch`;
	}
})();



// Upload Images
// TODO: highlight dropzoe on drophover or just hover??
( () => {
	// TODO: detect duplicates files
	let imageUploadFieldset = document.querySelector('.image_upload');
	let input = imageUploadFieldset.querySelector('input');

	const {gallery, dropzone} = createElements([
		{
			element: 'div',
			class: '_dropzone',
			events: {dragover: toggleDropzone, drop: handleNewImages},
			ref: 'dropzone',
			children: [
				{
					element: input,
					attributes: {id: 'image_input'},
					events: {change: handleNewImages}
				},
				{
					element: 'i',
					class: "fa_image_upload",
				},
				{
					element: 'strong',
					textContent: "Glissez une image ici",
				},
				{
					element: 'span',
					textContent: "ou cliquez sur le bouton"
				},
				{
					element: 'label',
					textContent: "Sélectionnez un fichier",
					attributes: {for: 'image_input'}
				}
			],
		},
		{
			element: 'div',
			class: 'upload_gallery',
			ref: 'gallery'
		}
	], imageUploadFieldset)


	function handleNewImages(event) {
		event.preventDefault();

		// const files = (event.type) 
		const files = (event.type == 'change' )
			? event.target.files
			: (event.type == 'drop')
				? event.dataTransfer.files
				: [];

		Array.from(files).forEach( file => {
			if (!file.type.match('image.*')) return;
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = addImage.bind(file);

			storedImages.push(file);
		})
	}

	function addImage(event) {
		createElements({
			element: 'div',
			children: [
				{
					element: 'img',
					attributes: {src: event.target.result},
				},
				{
					element: 'i',
					events: {click: removeImage.bind(this.file)},
				}
			]
		}, gallery)
	}

	function removeImage(event) {
		storedImages = storedImages.filter( e => e.name !== this.file);
		event.target.parentNode.remove();
	}

	function toggleDropzone(event){
		event.preventDefault();
		if (event.type === 'dragover') {
			dropzone.classList.add('drop-zoon--over');
		} else if (event.type === 'dragleave') {
			dropzone.classList.remove('drop-zoon--over');
		}
	}
})();



// Submit form
form.addEventListener( 'submit', (event) => {
	event.preventDefault();

	const data = new FormData(event.target);
	storedImages.forEach( (image,index) => data.append(`image_${index}`, image));

	console.log(data)

	// fetch(this.action, {
	// 	method: 'POST',
	// 	body: data
	// })

})
