class Theory {
	constructor(theme) {
		$('.theory-topic-ct').empty();
		$('.theory-topic-ct').append(
				'<h3 class="topic-title">' + THEORY[theme].theme + '</h3>'
			);
		for (let i = 0; i < THEORY[theme].elements.length; i++) {
				if (THEORY[theme].elements[i].wrapper == 'ul') {
					var res = '<' + THEORY[theme].elements[i].wrapper +
						' class="' + THEORY[theme].elements[i].classes + '">';
					for (let j = 0; j < THEORY[theme].elements[i].content.length; j++){
						res += '<li class="topic-listitem">' + THEORY[theme].elements[i].content[j] + '</li>';
					}
					res += '</ul>';
					$('.theory-topic-ct').append(res);
				} else {
					$('.theory-topic-ct').append(
						'<' + THEORY[theme].elements[i].wrapper +
						' class="' + THEORY[theme].elements[i].classes + '">' +
						THEORY[theme].elements[i].content +
						'</' + THEORY[theme].elements[i].wrapper + '>' 
					);
				}
		}
	}
}