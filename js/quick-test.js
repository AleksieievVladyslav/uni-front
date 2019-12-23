class Quick {
	Close(type) {
		if (this.testTimer) {
			clearTimeout(this.testTimer); 
		}
		if (!this.isSaved) {
			this.Save();
		}
		if (type === true) {
			// remove answers buttons
			$('.q-a').off().removeClass('active').removeClass('passed');

			// stop the clock
			if (this.quickClock) {
				this.quickClock.Stop();
				$('.clock').empty();
			}
		}
		
		$('.q-next span').off();
		$('.progress').show();
		$('.q-result').hide();
		$('.q-content').show();
		$('.q-progress-bar').css({'width' : '0%'});
		$('.quick').removeClass('active');
		$('.main-menu').addClass('active');
		$('main').removeClass('ingame');
	}
	GetStar() {
		if (this.score == this.qList.length) return 2;
		if (this.score >= this.qList.length / 2) return 1;
		return 0;
	}
	PrintStar() {
		if (this.score == this.qList.length) $('.q-american-result').append('<div><i class="fas fa-star"></i></div>');
		else if (this.score >= this.qList.length / 2) $('.q-american-result').append('<div><i class="fas fa-star-half-alt"></i></div>');
		else $('.q-american-result').append('<div><i class="far fa-star"></i></div>');
	}
	GetAmericanResult() {
		if (this.score == 20) return 'A+';
		else if (this.score >= 18) return 'A';
		else if (this.score >= 16) return 'B';
		else if (this.score >= 14) return 'C';
		else if (this.score >= 12) return 'D';
		else if (this.score >= 9) return 'E';
		else if (this.score >= 6) return 'F';
		else return 'F-';
 	}
 	PrintAmereican() {
 		$('.q-american-result').append(
 			'<div class="circle big">\
				<div class="circle small">\
					<div class="stars">\
						<span class="strips"></span>\
						<span class="strips"></span>\
						<span class="strips"></span>\
						<span class="strips"></span>\
						<span class="strips"></span>\
						<span class="st"><i class="fas fa-star"></i><i class="fas fa-star"></i></span>\
						<span class="st"><i class="fas fa-star"></i><i class="fas fa-star"></i></span>\
						<span class="st"><i class="fas fa-star"></i><i class="fas fa-star"></i></span>\
					</div>\
					<span>' + this.GetAmericanResult() + '</span>\
				</div>\
 			</div>');
 	}
	End() {
		if (!this.isSaved) {
			this.isSaved = true;
			this.Save();
		}
		// remove answers buttons
		$('.q-a').off().removeClass('active').removeClass('passed');

		// stop the clock
		if (this.testTimer) {
			clearTimeout(this.testTimer); 
		}
		if (this.quickClock) {
			this.quickClock.Stop();
			$('.clock').empty();
		}

		// reset Display
		$('#q-title').html('Результат');
		$('.progress').hide();
		$('#q-formulation').html('');
		$('.q-progress-bar').css({'width' : '100%'});
		$('.q-prev').hide();
		$('.q-content').hide();

		// show Result
		$('.q-result').show();
		$('.q-american-result').empty();
		$('#q-state-value-all').html(this.qList.length);
		if (this.type) {
			$('.q-state > .row:nth-child(2n)').hide();
			this.PrintStar();
		} else {
 			this.PrintAmereican();
			$('.q-state > .row:nth-child(2n)').show();
			if (this.quickClock) {
				$('#q-state-value-time-minutes').html(this.quickClock.GetM(true));
				$('#q-state-value-time-seconds').html(this.quickClock.GetS(true));
			}
		}
		$('#q-state-value-result').html(this.score);

		// set Exit Button
		$('.q-next span').off().html('Выйти в меню<i class="fas fa-long-arrow-alt-right"></i>')
			.click(() => {this.Close(false)});
	}
	PrevQ() {
		this.currentQ--;
		this.__initQ();
	}
	NextQ() {
		this.currentQ++;
		this.__initQ();
	}
	Check(answer) {
		if (this.qList[this.currentQ].isPassed === true) {
			return;
		}
 		this.qList[this.currentQ].isPassed = true;
		let gif = this.qList[this.currentQ].answers[answer].gif;
		$('#img > img').attr({src : gif});
		this.qList[this.currentQ].resultGif = gif;
		if (this.qList[this.currentQ].answers[answer].isCorrect) this.score++;
		$('.q-a').addClass('passed');
	}
	Save() {
		if (USER) {
			if (this.type) {
				userStatistic.questions.total += this.qList.length;
				userStatistic.questions.correct += this.score;
				userStatistic.stars[this.theme] = this.GetStar();
				if (this.GetStar() >= 1) userStatistic.passedTopics += 1;
			} else {
				userStatistic.questions.total += 20;
				userStatistic.questions.correct += this.score;
				userStatistic.tests.total += 1;
				if (this.score >= 18) userStatistic.tests.passed += 1;
				userStatistic.averages.correctAnswers = (userStatistic.averages.correctAnswers * (userStatistic.tests.total - 1) + this.score) / userStatistic.tests.total;
				userStatistic.averages.time = (userStatistic.averages.time * (userStatistic.tests.total - 1) + this.quickClock.GetM(true) * 60 + this.quickClock.GetS(true)) / userStatistic.tests.total;
			}
			new Profile(userStatistic);
			_setUserStat(firebase.auth().currentUser.uid, userStatistic);
		}
	}
	GenerateQList() {
		this.qList = [];
		let res = [];
		for (let i = 0; i < 20; i++) {
			let j = Math.floor(Math.random() * QUESTIONS.length);
			if (res.indexOf(j) == -1) {
				res.push(j);
				this.qList.push(new Question(QUESTIONS[j]));
			} else {
				while (res.indexOf(j) != -1) {
					j++;
					if (j == QUESTIONS.length) j = 0;
				}
				res.push(j);
				this.qList.push(new Question(QUESTIONS[j]));
			}
		}
	}
	GenerateQListTheme(theme) {
		this.qList = [];
		for (let i = 0; i < QUESTIONS.length; i++) {
			if (QUESTIONS[i].themeId == theme)
				this.qList.push(new Question(QUESTIONS[i]));
		}
	}
	__initQ() {
		let question = this.qList[this.currentQ];

		// init Display
		if (this.qList[this.currentQ].isPassed) {
			$('#img > img').attr({src : question.resultGif});
		} else {
			$('#img > img').attr({src : question.initGif});
		}
		$('#progress').show().html(this.currentQ + 1);
		$('#q-title').html(question.theme);
		$('#q-formulation').html(question.title);
		$('.q-progress-bar').css({'width' : this.currentQ / this.qList.length * 100 + '%'});

		// init "prev" button
		if (this.currentQ == 0) {
			$('.q-prev span').off()
				.html('<i class="fas fa-long-arrow-alt-left"></i>Выйти в меню')
				.click(() => {this.Close(true)});
		} else {
			$('.q-prev span').off()
				.html('<i class="fas fa-long-arrow-alt-left"></i>Предыдущий вопрос')
				.click(() => {this.PrevQ()});
		}

		// init "next" button
		if (this.currentQ == this.qList.length - 1) {
			$('.q-next span').off()
				.html('Закончить тест<i class="fas fa-long-arrow-alt-right"></i>')
				.click(() => {this.End()});
		} else {
			$('.q-next span').off()
				.html('Следующий вопрос<i class="fas fa-long-arrow-alt-right"></i>')
				.click(() => {this.NextQ()});
		}

		// init answers buttons
		$('.q-a').removeClass('active');
		for (let i = 0; i < question.answers.length; i++) {
			$('#answer-' + i).off().addClass('active').removeClass('passed')
				.html(question.answers[i].text)
				.click(() => {
					this.Check(i);
				});
			if (this.qList[this.currentQ].isPassed) {
				$('#answer-' + i).addClass('passed');
			}
		}
	}
	constructor(type, theme) {
		$('main').addClass('ingame');
		if (type === true) {
			this.type = true;
			this.currentQ = 0;
			this.score = 0;
			this.theme = theme;
			this.GenerateQListTheme(theme);
			$('.q-prev').show();
			this.__initQ();
			$('#quick-all').html(this.qList.length);
			return;
		}
		this.quickClock = new Clock('.clock');
		this.testTimer = setTimeout(() => {
			this.End();
		}, 20 * 60 * 1000 + 1000);
		this.GenerateQList();
		this.currentQ = 0;
		this.score = 0;
		$('#quick-all').html(this.qList.length);
		$('.q-prev').show();
		this.__initQ();
	}
}