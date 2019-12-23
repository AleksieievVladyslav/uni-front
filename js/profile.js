class Profile {

	constructor(input) {
		this.name = input.name;
		this.stars = input.stars;
		this.questions = input.questions;
		this.tests = input.tests;
		this.averages = input.averages;
		this.passedTopics = input.passedTopics;

		this.InitFields();
		this.SetProgressTopics();
	}

	SetProgressTopics() {
		let i;
		for (i = 0; i < this.passedTopics; i++) {
			$('.topic:eq(' + i + ') .topic-wrapper').removeClass('closed-topic').removeClass('opened-topic').addClass('passed-topic');
		}
		for (let j = this.passedTopics; j < THEORY.length; j++) {
			$('.topic:eq(' + j + ') .topic-wrapper').removeClass('opened-topic').removeClass('passed-topic').addClass('closed-topic');
		}
		$('.topic:eq(' + i + ') .topic-wrapper').removeClass('closed-topic').removeClass('passed-topic').addClass('opened-topic');

		for(let j = 0; j < this.stars.length; j++) {
			let star = $('.topic:eq(' + j + ') .topic-wrapper').children('.topic-star');

			switch(this.stars[j]) {
				case 0:
					star.empty().append('<i class="far fa-star">');
					break;
				case 1:
					star.empty().append('<i class="fas fa-star-half-alt">');
					break;
				case 2:
					star.empty().append('<i class="fas fa-star">');
					break;
			}
		}
	}
	InitFields() {
		this.InitStars();
		this.InitTextFields();
	}
	InitTextFields() {
		$('.profile-header').html(this.name);
		$('#correctanswers').html(this.questions.correct);
		$('#totalanswers').html(this.questions.total);
		$('#passedtests').html(this.tests.passed);
		$('#totaltests').html(this.tests.total);
		$('#averageanswers').html(this.averages.correctAnswers.toFixed(2));
		$('#averagetime').html(this.averages.time.toFixed(2));
	}
	InitStars() {
		let stars = [];
		let res = 0;
		for (let i = 0; i < this.stars.length; i++) {
			res += this.stars[i];
		}
		while (res > 1) {
			res -= 2;
			stars.push(2);
		}
		stars.push(res);

		let starsContainer = $('.profile .stars');
		starsContainer.empty();
		for (let j = 0; j < 5; j++) {
			switch (stars[j]) {
				case 0:
					starsContainer.append('<i class="far fa-star">');
					break;
				case 1:
					starsContainer.append('<i class="fas fa-star-half-alt">');
					break;
				case 2:
					starsContainer.append('<i class="fas fa-star">');
					break;
				default:
					starsContainer.append('<i class="far fa-star">');
					break;
			}
		} 
	}
}