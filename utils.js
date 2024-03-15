function createElements(data, root) {
	const references = {}

	function createElement(jsonData) {
		const elementNode = (jsonData.element instanceof HTMLElement) ? jsonData.element : document.createElement(jsonData.element);

		if (jsonData.ref) references[jsonData.ref] = elementNode;

		if (jsonData.attributes)
			for (const [key, value] of Object.entries(jsonData.attributes)) {
				elementNode.setAttribute(key, value);
			}

		if (jsonData.style)
			for (const [key, value] of Object.entries(jsonData.style)) {
				elementNode.style[key] = value;
			}

		if (jsonData.class) jsonData.class.split(' ').forEach(e => elementNode.classList.add(e));

		if (jsonData.textContent) elementNode.textContent = jsonData.textContent;

		if (jsonData.children && jsonData.children.length > 0)
			jsonData.children.forEach(childData => {
				const childElement = createElement(childData);
				elementNode.appendChild(childElement);
			});


		if (jsonData.events)
			for (const [eventName, eventHandler] of Object.entries(jsonData.events)) {
				if ( Array.isArray(eventHandler) ) {
					eventHandler.forEach( e => elementNode.addEventListener(eventName, e) )
				} else {
					elementNode.addEventListener(eventName, eventHandler);
				}
			}

		return elementNode;
	}

	function createAndAppend(data) {
		const node = createElement(data)
		if (root) root.append(node);
	}

	if (Array.isArray(data)) data.forEach( createAndAppend )
	else if (typeof data === 'object' ) createAndAppend(data)
	else return null;

	return references;
}


function loadScript (url, callback) {
	const script = document.createElement("script");
	script.type = "text/javascript";
	script.src = url;
	if (callback) script.onload = callback;
	document.head.appendChild(script);
}
