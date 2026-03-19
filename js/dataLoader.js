window.abe = window.abe || {}

abe.loadData = async () => {
	const apiUrl = 'data/30m/2025-01-01.json'
	const controller = new AbortController()
	const timeoutId = setTimeout(() => controller.abort(), 20000)
	
	try {
		const response = await fetch(apiUrl, {
			method: 'GET',
			signal: controller.signal
		});

		if (!response.ok) throw new Error(`HTTP ${response.status}`);
		return await response.json();
		//return await response.text();
	} catch (error) {
		//console.error('Fetch error:', error.message);
		return `{ error: ${error.message} }`;
	} finally {
		clearTimeout(timeoutId);
	}
}